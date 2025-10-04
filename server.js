// server.js (REPLACE your current file with this)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

/**
 * Build env maps dynamically:
 * - schools: { KEY -> value } where KEY is suffix (FOBAS, LUMIERE, ...)
 * - classes: { KEY -> { classKey: value, ... } }
 * - subjects: { KEY -> { subjKey: value, ... } }
 */
function buildEnvMaps() {
  const schools = {};
  const classes = {};
  const subjects = {};

  // collect SCHOOL_* (except exact 'SCHOOL_PASSWORD' which is legacy)
  Object.keys(process.env).forEach(k => {
    if (!k.startsWith('SCHOOL_')) return;
    if (k === 'SCHOOL_PASSWORD') return; // legacy handled separately
    const suffix = k.slice('SCHOOL_'.length).toUpperCase(); // e.g. FOBAS
    if (!suffix) return;
    schools[suffix] = process.env[k];
    classes[suffix] = {};
    subjects[suffix] = {};
  });

  // collect CLASS_<SCHOOL>_<...>
  Object.keys(process.env).forEach(k => {
    if (!k.startsWith('CLASS_')) return;
    const rest = k.slice('CLASS_'.length); // e.g. FOBAS_7EM
    const parts = rest.split('_');
    if (parts.length < 2) return;
    const schoolKey = parts[0].toUpperCase();
    const classKey = parts.slice(1).join('_').toLowerCase(); // keep '7em', 'ns1' etc
    if (!classes[schoolKey]) classes[schoolKey] = {};
    classes[schoolKey][classKey] = process.env[k];
  });

  // collect SUBJECT_<SCHOOL>_<...>
  Object.keys(process.env).forEach(k => {
    if (!k.startsWith('SUBJECT_')) return;
    const rest = k.slice('SUBJECT_'.length); // e.g. FOBAS_MATH or LUMIERE_INFO
    const parts = rest.split('_');
    if (parts.length < 2) return;
    const schoolKey = parts[0].toUpperCase();
    const subjKey = parts.slice(1).join('_').toLowerCase(); // e.g. math, info, fr
    if (!subjects[schoolKey]) subjects[schoolKey] = {};
    subjects[schoolKey][subjKey] = process.env[k];
  });

  return {
    schools,
    classes,
    subjects,
    legacySchoolPassword: process.env.SCHOOL_PASSWORD || null
  };
}

const ENV_MAP = buildEnvMaps();

/**
 * helpers
 */
function normalizeSchoolKey(s) {
  if (!s) return null;
  return String(s).trim().toUpperCase();
}

function findSchoolByPassword(password) {
  if (!password) return null;
  const pw = String(password);
  // exact match against SCHOOL_<KEY> values
  for (const [schoolKey, val] of Object.entries(ENV_MAP.schools)) {
    if (val && val === pw) return { school: schoolKey };
  }
  // legacy check: if SCHOOL_PASSWORD present, try to map it to a known school value
  if (ENV_MAP.legacySchoolPassword && ENV_MAP.legacySchoolPassword === pw) {
    // if SCHOOL_FOBAS exists, prefer that; otherwise take the first defined school
    if (ENV_MAP.schools.FOBAS) return { school: 'FOBAS' };
    const first = Object.keys(ENV_MAP.schools)[0];
    if (first) return { school: first };
    // fallback generic
    return { school: 'FOBAS' };
  }
  return null;
}

function findClassByPassword(password) {
  if (!password) return null;
  const pw = String(password);
  for (const schoolKey of Object.keys(ENV_MAP.classes)) {
    const clsMap = ENV_MAP.classes[schoolKey] || {};
    for (const [clsKey, val] of Object.entries(clsMap)) {
      if (val && val === pw) return { school: schoolKey, class: clsKey };
    }
  }
  return null;
}

function findSubjectByPassword(password) {
  if (!password) return null;
  const pw = String(password);
  for (const schoolKey of Object.keys(ENV_MAP.subjects)) {
    const subMap = ENV_MAP.subjects[schoolKey] || {};
    for (const [subKey, val] of Object.entries(subMap)) {
      if (val && val === pw) return { school: schoolKey, subject: subKey };
    }
  }
  return null;
}

/**
 * ROUTES
 */

// Verify school
app.post('/api/verify-school', (req, res) => {
  const { school, password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success:false, message:'Missing password' });
  }

  if (school) {
    const sk = normalizeSchoolKey(school);
    const envVal = ENV_MAP.schools[sk];
    if (!envVal) return res.status(400).json({ success:false, message:'Lekòl pa rekonèt' });
    if (envVal === password) return res.json({ success:true, level:'school', school: sk, message:`Lekòl ${sk} ouvè` });
    // also accept legacy SCHOOL_PASSWORD mapping to this school if it equals
    if (ENV_MAP.legacySchoolPassword && ENV_MAP.legacySchoolPassword === password && ENV_MAP.schools[sk]) {
      return res.json({ success:true, level:'school', school: sk, message:`Lekòl ${sk} ouvè (legacy)` });
    }
    return res.status(401).json({ success:false, message:'Invalid school password' });
  } else {
    const found = findSchoolByPassword(password);
    if (found) return res.json({ success:true, level:'school', school: found.school, message:`Lekòl ${found.school} ouvè` });
    return res.status(401).json({ success:false, message:'Invalid school password' });
  }
});

// Verify class
app.post('/api/verify-class', (req, res) => {
  const { school, password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success:false, message:'Missing password' });
  }

  if (school) {
    const sk = normalizeSchoolKey(school);
    const classesFor = ENV_MAP.classes[sk];
    if (!classesFor) return res.status(400).json({ success:false, message:'Lekòl pa rekonèt pou klas' });
    const valid = Object.keys(classesFor).find(k => classesFor[k] === password);
    if (valid) return res.json({ success:true, level:'class', school: sk, class: valid, message:`Klas ${valid} ouvè nan ${sk}` });
    // try legacy SCHOOL_PASSWORD -> maybe teacher used school pw for class (unlikely) but we won't accept it
    return res.status(401).json({ success:false, message:'Invalid class password' });
  } else {
    const found = findClassByPassword(password);
    if (found) return res.json({ success:true, level:'class', school: found.school, class: found.class, message:`Klas ${found.class} ouvè nan ${found.school}` });
    return res.status(401).json({ success:false, message:'Invalid class password' });
  }
});

// Verify subject
app.post('/api/verify-subject', (req, res) => {
  const { school, password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success:false, message:'Missing password' });
  }

  if (school) {
    const sk = normalizeSchoolKey(school);
    const subsFor = ENV_MAP.subjects[sk];
    if (!subsFor) return res.status(400).json({ success:false, message:'Lekòl pa rekonèt pou matyè' });
    const valid = Object.keys(subsFor).find(k => subsFor[k] === password);
    if (valid) return res.json({ success:true, level:'subject', school: sk, subject: valid, message:`Egzamen ${valid} ouvè nan ${sk}` });
    return res.status(401).json({ success:false, message:'Invalid subject password' });
  } else {
    const found = findSubjectByPassword(password);
    if (found) return res.json({ success:true, level:'subject', school: found.school, subject: found.subject, message:`Egzamen ${found.subject} ouvè nan ${found.school}` });
    return res.status(401).json({ success:false, message:'Invalid subject password' });
  }
});

// health
app.get('/ping', (req, res) => res.send('pong'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
