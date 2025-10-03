// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

/**
 * HELPERS
 */

// Normalize school key (accept many casings)
function normalizeSchoolKey(key) {
  if (!key) return null;
  const k = String(key).trim().toUpperCase();
  // accept short keys like 'fobas' or full 'FOBAS'
  return k;
}

// Build mappings from env variables present
function buildEnvMappings() {
  // Known school IDs we expect (you can add more here if you add ENVs)
  const schools = ['FOBAS', 'LUMIERE', 'CEFOTECH'];

  const mapping = {
    schools: {},
    classes: {},    // mapping[school] = { classKey: envValue, ... }
    subjects: {}    // mapping[school] = { subjKey: envValue, ... }
  };

  // Legacy single-school variable (kept for backwards compatibility)
  if (process.env.SCHOOL_PASSWORD) {
    mapping.legacySchoolPassword = process.env.SCHOOL_PASSWORD;
  }

  schools.forEach(s => {
    const sid = s.toUpperCase();
    const schoolEnvName = `SCHOOL_${sid}`;
    if (process.env[schoolEnvName]) {
      mapping.schools[sid] = process.env[schoolEnvName];
    } else {
      // leave absent if not defined
    }

    // classes for each school: CLASS_<SCHOOL>_7EM etc
    mapping.classes[sid] = {};
    ['7em','8em','9em','NS1','NS2','NS3','NS4'].forEach(cls => {
      // env name: CLASS_<SCHOOL>_7EM  (uppercase)
      const envName = `CLASS_${sid}_${String(cls).toUpperCase()}`;
      if (process.env[envName]) mapping.classes[sid][cls] = process.env[envName];
    });

    // subjects for each school: SUBJECT_<SCHOOL>_MATH etc
    mapping.subjects[sid] = {};
    const subjKeys = {
      math: 'MATH',
      informatique: 'INFO',
      creole: 'CREOLE',
      francais: 'FR',
      anglais: 'EN',
      espagnol: 'ES',
      sciences: 'SC',
      histoire: 'HIS',
      geographie: 'GEO',
      philosophie: 'PHILO'
    };
    Object.entries(subjKeys).forEach(([key, suffix]) => {
      const envName = `SUBJECT_${sid}_${suffix}`;
      if (process.env[envName]) mapping.subjects[sid][key] = process.env[envName];
    });
  });

  return mapping;
}

const ENV_MAP = buildEnvMappings();

/**
 * Utility: find which school corresponds to a given password (search schools)
 * Returns { schoolKey } or null
 */
function findSchoolByPassword(pw) {
  if (!pw) return null;
  const pass = String(pw);
  // First check explicit school envs
  for (const [schoolKey, val] of Object.entries(ENV_MAP.schools)) {
    if (val && val === pass) return { school: schoolKey };
  }
  // Fallback: legacy single-school password
  if (ENV_MAP.legacySchoolPassword && ENV_MAP.legacySchoolPassword === pass) {
    // If legacy present, try to identify which school should be assumed.
    // Prefer FOBAS if present; else pick the first defined school.
    const prefer = ['FOBAS','LUMIERE','CEFOTECH'];
    for (const p of prefer) {
      if (ENV_MAP.schools[p]) return { school: p };
    }
    // otherwise return generic
    return { school: 'FOBAS' };
  }
  return null;
}

/**
 * Utility: find class+school by a given class password
 * Returns { school, class } or null
 */
function findClassByPassword(pw) {
  if (!pw) return null;
  const pass = String(pw);
  for (const schoolKey of Object.keys(ENV_MAP.classes)) {
    const classes = ENV_MAP.classes[schoolKey] || {};
    for (const clsKey of Object.keys(classes)) {
      if (classes[clsKey] && classes[clsKey] === pass) {
        return { school: schoolKey, class: clsKey };
      }
    }
  }
  return null;
}

/**
 * Utility: find subject+school by subject password
 * Returns { school, subject } or null
 */
function findSubjectByPassword(pw) {
  if (!pw) return null;
  const pass = String(pw);
  for (const schoolKey of Object.keys(ENV_MAP.subjects)) {
    const subs = ENV_MAP.subjects[schoolKey] || {};
    for (const sKey of Object.keys(subs)) {
      if (subs[sKey] && subs[sKey] === pass) {
        return { school: schoolKey, subject: sKey };
      }
    }
  }
  return null;
}

/**
 * ---------- ROUTES ----------
 */

/**
 * Verify school.
 * Accepts JSON: { school?: 'FOBAS'|'LUMIERE'|'CEFOTECH', password: '...' }
 * If school omitted, attempts to match password to any SCHOOL_* or legacy SCHOOL_PASSWORD
 */
app.post('/api/verify-school', (req, res) => {
  const { school, password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success:false, message: 'Missing password' });
  }

  if (school) {
    const sk = normalizeSchoolKey(school);
    if (!ENV_MAP.schools[sk]) {
      return res.status(400).json({ success:false, message: 'Lekòl pa rekonèt' });
    }
    if (ENV_MAP.schools[sk] === password) {
      return res.json({ success:true, level:'school', school: sk, message: `Lekòl ${sk} ouvè` });
    } else {
      return res.status(401).json({ success:false, message: 'Invalid school password' });
    }
  } else {
    // try to find which school this password belongs to
    const found = findSchoolByPassword(password);
    if (found && found.school) {
      return res.json({ success:true, level:'school', school: found.school, message: `Lekòl ${found.school} ouvè` });
    } else {
      return res.status(401).json({ success:false, message: 'Invalid school password' });
    }
  }
});

/**
 * Verify class.
 * Accepts JSON: { school?: 'FOBAS'|'LUMIERE'|'CEFOTECH', password: '...' }
 * If school present, validates against that school's class envs.
 * If not present, will search across all schools and return which school+class matched.
 */
app.post('/api/verify-class', (req, res) => {
  const { school, password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success:false, message: 'Missing password' });
  }

  if (school) {
    const sk = normalizeSchoolKey(school);
    const classesFor = ENV_MAP.classes[sk];
    if (!classesFor) return res.status(400).json({ success:false, message: 'Lekòl pa rekonèt pou klas' });
    // find class key whose env value equals password
    const validClass = Object.keys(classesFor).find(k => classesFor[k] === password);
    if (validClass) {
      return res.json({ success:true, level:'class', school: sk, class: validClass, message: `Klas ${validClass} ouvè nan ${sk}` });
    } else {
      return res.status(401).json({ success:false, message: 'Invalid class password' });
    }
  } else {
    const found = findClassByPassword(password);
    if (found) {
      return res.json({ success:true, level:'class', school: found.school, class: found.class, message: `Klas ${found.class} ouvè nan ${found.school}` });
    } else {
      return res.status(401).json({ success:false, message: 'Invalid class password' });
    }
  }
});

/**
 * Verify subject.
 * Accepts JSON: { school?: 'FOBAS'|'LUMIERE'|'CEFOTECH', password: '...' }
 */
app.post('/api/verify-subject', (req, res) => {
  const { school, password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success:false, message: 'Missing password' });
  }

  if (school) {
    const sk = normalizeSchoolKey(school);
    const subsFor = ENV_MAP.subjects[sk];
    if (!subsFor) return res.status(400).json({ success:false, message: 'Lekòl pa rekonèt pou matyè' });
    const validSubject = Object.keys(subsFor).find(k => subsFor[k] === password);
    if (validSubject) {
      return res.json({ success:true, level:'subject', school: sk, subject: validSubject, message: `Egzamen ${validSubject} ouvè nan ${sk}` });
    } else {
      return res.status(401).json({ success:false, message: 'Invalid subject password' });
    }
  } else {
    const found = findSubjectByPassword(password);
    if (found) {
      return res.json({ success:true, level:'subject', school: found.school, subject: found.subject, message: `Egzamen ${found.subject} ouvè nan ${found.school}` });
    } else {
      return res.status(401).json({ success:false, message: 'Invalid subject password' });
    }
  }
});

// ping
app.get('/ping', (req, res) => res.send('pong'));

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
