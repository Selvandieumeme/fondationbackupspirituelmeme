// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const app = express();

app.use(cors()); 
app.use(express.json());

/**
 * 🔑 1) Route pou verifye lekòl la
 * Modpas pou lekòl la ap soti nan ENV: SCHOOL_PASSWORD
 */
app.post('/api/verify-school', (req, res) => {
  const { password } = req.body;
  const SCHOOL_PASSWORD = process.env.SCHOOL_PASSWORD;

  if (!SCHOOL_PASSWORD) {
    return res.status(500).json({ error: 'Server misconfigured: SCHOOL_PASSWORD missing' });
  }

  if (password === SCHOOL_PASSWORD) {
    return res.json({ success: true, level: "school", message: 'Lekòl FOBAS ouvè' });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid school password' });
  }
});

/**
 * 🔑 2) Route pou verifye klas yo
 * Chak klas gen pwòp modpas (Fobas1Haiti ... Fobas7Haiti)
 */
app.post('/api/verify-class', (req, res) => {
  const { password } = req.body;

  // Lis modpas yo soti nan ENV
  const classPasswords = {
    "7em": process.env.CLASS_7EM,
    "8em": process.env.CLASS_8EM,
    "9em": process.env.CLASS_9EM,
    "NS1": process.env.CLASS_NS1,
    "NS2": process.env.CLASS_NS2,
    "NS3": process.env.CLASS_NS3,
    "NS4": process.env.CLASS_NS4,
  };

  // Tcheke si modpas antre a egziste nan lis
  const validClass = Object.keys(classPasswords).find(
    cls => password === classPasswords[cls]
  );

  if (validClass) {
    return res.json({ success: true, level: "class", class: validClass, message: `Klas ${validClass} ouvè` });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid class password' });
  }
});

/**
 * 🔑 3) Route pou verifye matyè yo
 * Chak matyè gen pwòp modpas ("Fobasmath", "Fobasinformatique", ...)
 */
app.post('/api/verify-subject', (req, res) => {
  const { password } = req.body;

  const subjects = {
    "math": process.env.SUBJECT_MATH,
    "informatique": process.env.SUBJECT_INFORMATIQUE,
    "creole": process.env.SUBJECT_CREOLE,
    "francais": process.env.SUBJECT_FRANCAIS,
    "anglais": process.env.SUBJECT_ANGLAIS,
    "espagnol": process.env.SUBJECT_ESPAGNOL,
    "sciences": process.env.SUBJECT_SCIENCES,
    "histoire": process.env.SUBJECT_HISTOIRE,
    "geographie": process.env.SUBJECT_GEOGRAPHIE,
    "philosophie": process.env.SUBJECT_PHILOSOPHIE,
  };

  const validSubject = Object.keys(subjects).find(
    subj => password === subjects[subj]
  );

  if (validSubject) {
    return res.json({ success: true, level: "subject", subject: validSubject, message: `Egzamen ${validSubject} ouvè` });
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
