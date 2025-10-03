// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const app = express();

app.use(cors()); 
app.use(express.json());

/**
 * 🔑 1) Verifye lekòl
 */
app.post('/api/verify-school', (req, res) => {
  const { school, password } = req.body;

  const schoolPasswords = {
    "FOBAS": process.env.SCHOOL_FOBAS,
    "LUMIERE": process.env.SCHOOL_LUMIERE,
    "CEFOTECH": process.env.SCHOOL_CEFOTECH,
  };

  if (!school || !schoolPasswords[school]) {
    return res.status(400).json({ error: 'Lekòl pa rekonèt' });
  }

  if (password === schoolPasswords[school]) {
    return res.json({ success: true, level: "school", school, message: `Lekòl ${school} ouvè` });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid school password' });
  }
});

/**
 * 🔑 2) Verifye klas yo pou chak lekòl
 */
app.post('/api/verify-class', (req, res) => {
  const { school, password } = req.body;

  const classPasswords = {
    "FOBAS": {
      "7em": process.env.CLASS_FOBAS_7EM,
      "8em": process.env.CLASS_FOBAS_8EM,
      "9em": process.env.CLASS_FOBAS_9EM,
      "NS1": process.env.CLASS_FOBAS_NS1,
      "NS2": process.env.CLASS_FOBAS_NS2,
      "NS3": process.env.CLASS_FOBAS_NS3,
      "NS4": process.env.CLASS_FOBAS_NS4,
    },
    "LUMIERE": {
      "7em": process.env.CLASS_LUMIERE_7EM,
      "8em": process.env.CLASS_LUMIERE_8EM,
      "9em": process.env.CLASS_LUMIERE_9EM,
      "NS1": process.env.CLASS_LUMIERE_NS1,
      "NS2": process.env.CLASS_LUMIERE_NS2,
      "NS3": process.env.CLASS_LUMIERE_NS3,
      "NS4": process.env.CLASS_LUMIERE_NS4,
    },
    "CEFOTECH": {
      "7em": process.env.CLASS_CEFOTECH_7EM,
      "8em": process.env.CLASS_CEFOTECH_8EM,
      "9em": process.env.CLASS_CEFOTECH_9EM,
      "NS1": process.env.CLASS_CEFOTECH_NS1,
      "NS2": process.env.CLASS_CEFOTECH_NS2,
      "NS3": process.env.CLASS_CEFOTECH_NS3,
      "NS4": process.env.CLASS_CEFOTECH_NS4,
    },
  };

  if (!school || !classPasswords[school]) {
    return res.status(400).json({ error: 'Lekòl pa rekonèt pou klas' });
  }

  const validClass = Object.keys(classPasswords[school]).find(
    cls => password === classPasswords[school][cls]
  );

  if (validClass) {
    return res.json({ success: true, level: "class", school, class: validClass, message: `Klas ${validClass} ouvè nan ${school}` });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid class password' });
  }
});

/**
 * 🔑 3) Verifye matyè pou chak lekòl
 */
app.post('/api/verify-subject', (req, res) => {
  const { school, password } = req.body;

  const subjects = {
    "FOBAS": {
      "math": process.env.SUBJECT_FOBAS_MATH,
      "informatique": process.env.SUBJECT_FOBAS_INFO,
      "creole": process.env.SUBJECT_FOBAS_CREOLE,
      "francais": process.env.SUBJECT_FOBAS_FR,
      "anglais": process.env.SUBJECT_FOBAS_EN,
      "espagnol": process.env.SUBJECT_FOBAS_ES,
      "sciences": process.env.SUBJECT_FOBAS_SC,
      "histoire": process.env.SUBJECT_FOBAS_HIS,
      "geographie": process.env.SUBJECT_FOBAS_GEO,
      "philosophie": process.env.SUBJECT_FOBAS_PHILO,
    },
    "LUMIERE": {
      "math": process.env.SUBJECT_LUMIERE_MATH,
      "informatique": process.env.SUBJECT_LUMIERE_INFO,
      "creole": process.env.SUBJECT_LUMIERE_CREOLE,
      "francais": process.env.SUBJECT_LUMIERE_FR,
      "anglais": process.env.SUBJECT_LUMIERE_EN,
      "espagnol": process.env.SUBJECT_LUMIERE_ES,
      "sciences": process.env.SUBJECT_LUMIERE_SC,
      "histoire": process.env.SUBJECT_LUMIERE_HIS,
      "geographie": process.env.SUBJECT_LUMIERE_GEO,
      "philosophie": process.env.SUBJECT_LUMIERE_PHILO,
    },
    "CEFOTECH": {
      "math": process.env.SUBJECT_CEFOTECH_MATH,
      "informatique": process.env.SUBJECT_CEFOTECH_INFO,
      "creole": process.env.SUBJECT_CEFOTECH_CREOLE,
      "francais": process.env.SUBJECT_CEFOTECH_FR,
      "anglais": process.env.SUBJECT_CEFOTECH_EN,
      "espagnol": process.env.SUBJECT_CEFOTECH_ES,
      "sciences": process.env.SUBJECT_CEFOTECH_SC,
      "histoire": process.env.SUBJECT_CEFOTECH_HIS,
      "geographie": process.env.SUBJECT_CEFOTECH_GEO,
      "philosophie": process.env.SUBJECT_CEFOTECH_PHILO,
    },
  };

  if (!school || !subjects[school]) {
    return res.status(400).json({ error: 'Lekòl pa rekonèt pou matyè' });
  }

  const validSubject = Object.keys(subjects[school]).find(
    subj => password === subjects[school][subj]
  );

  if (validSubject) {
    return res.json({ success: true, level: "subject", school, subject: validSubject, message: `Egzamen ${validSubject} ouvè nan ${school}` });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid subject password' });
  }
});

// Route tès
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
