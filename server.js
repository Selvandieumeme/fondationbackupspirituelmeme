// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http'); // ✅ TRÈ ENPÒTAN pou Socket.io mache
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

/**
 * ---------- MONGODB CONNECTION ----------
 */
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI manke nan anviwònman!');
  process.exit(1);
}

// ✅ nouvo fason konekte san opsyon demode
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB konekte avèk siksè!'))
  .catch(err => {
    console.error('❌ Erè koneksyon MongoDB:', err.message);
  });

/**
 * ---------- MONGODB SCHEMAS ----------
 */

// ✅ Schema pou elèv yo
const eleveSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true },
  numero_dossier: { type: String, required: true },
  promotion: { type: String, required: true },
  notes: { type: String, default: '' }, // ✅ remak/nòt
  classe: { type: String, required: true },
});

const Eleve = mongoose.model('Eleve', eleveSchema, 'eleves'); // koleksyon: "eleves"

/**
 * ---------- ROUTES ELEVE ----------
 */

// 📌 Ajoute yon elèv
app.post('/api/eleves', async (req, res) => {
  try {
    const { nom, prenom, email, numero_dossier, promotion, notes, classe } = req.body;

    // ✅ Verifye tout chan obligatwa yo
    if (!nom || !prenom || !email || !numero_dossier || !promotion || !classe) {
      return res.status(400).json({
        success: false,
        message: 'Tout chan obligatwa yo dwe ranpli (nom, prenom, email, numero_dossier, promotion, classe)'
      });
    }

    // ✅ Kreye nouvo elèv ak tout chan
    const eleve = new Eleve({
      nom,
      prenom,
      email,
      numero_dossier,
      promotion,
      notes: notes || '', // ajoute nòt / remak si genyen
      classe
    });

    await eleve.save();
    res.json({ success: true, message: '✅ Elèv anrejistre avèk siksè', eleve });
  } catch (err) {
    console.error('❌ Erè lè w ap sove elèv:', err.message);
    res.status(500).json({ success: false, message: 'Erè sèvè lè w ap sove elèv' });
  }
});

// 📌 Lis tout elèv — ✅ KOUNYA LI FONKSYONE AK FILTRAJ PA KLAS
app.get('/api/eleves', async (req, res) => {
  try {
    const { classe } = req.query;

    // Si gen klas nan query, filtre sèlman elèv sa yo
    const query = classe ? { classe } : {};

    const list = await Eleve.find(query).sort({ date_inscription: -1 });
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    console.error('❌ Erè lè w ap chaje elèv:', err.message);
    res.status(500).json({ success: false, message: 'Erè sèvè lè w ap chaje elèv' });
  }
});

/**
 * ---------- HELPERS ORIJINAL + ROUTES EXISTANTS ----------
 * (Tout lòt pati nan server.js rete entak)
 */

function normalizeSchoolKey(key) {
  if (!key) return null;
  const k = String(key).trim().toUpperCase();
  return k;
}

function buildEnvMappings() {
  const schools = ['FOBAS', 'LUMIERE', 'CEFOTECH'];
  const mapping = { schools: {}, classes: {}, subjects: {} };

  if (process.env.SCHOOL_PASSWORD) mapping.legacySchoolPassword = process.env.SCHOOL_PASSWORD;

  schools.forEach(s => {
    const sid = s.toUpperCase();
    const schoolEnvName = `SCHOOL_${sid}`;
    if (process.env[schoolEnvName]) mapping.schools[sid] = process.env[schoolEnvName];

    mapping.classes[sid] = {};
    ['7em','8em','9em','NS1','NS2','NS3','NS4'].forEach(cls => {
      const envName = `CLASS_${sid}_${String(cls).toUpperCase()}`;
      if (process.env[envName]) mapping.classes[sid][cls] = process.env[envName];
    });

    mapping.subjects[sid] = {};
    const subjKeys = {
      math:'MATH', informatique:'INFO', creole:'CREOLE',
      francais:'FR', anglais:'EN', espagnol:'ES',
      sciences:'SC', histoire:'HIS', geographie:'GEO', philosophie:'PHILO'
    };
    Object.entries(subjKeys).forEach(([key,suffix]) => {
      const envName = `SUBJECT_${sid}_${suffix}`;
      if (process.env[envName]) mapping.subjects[sid][key] = process.env[envName];
    });
  });

  return mapping;
}

const ENV_MAP = buildEnvMappings();

function findSchoolByPassword(pw) {
  if (!pw) return null;
  const pass = String(pw);
  for (const [schoolKey, val] of Object.entries(ENV_MAP.schools)) {
    if (val && val === pass) return { school: schoolKey };
  }
  if (ENV_MAP.legacySchoolPassword && ENV_MAP.legacySchoolPassword === pass) {
    const prefer = ['FOBAS','LUMIERE','CEFOTECH'];
    for (const p of prefer) if (ENV_MAP.schools[p]) return { school: p };
    return { school: 'FOBAS' };
  }
  return null;
}

function findClassByPassword(pw) {
  if (!pw) return null;
  const pass = String(pw);
  for (const schoolKey of Object.keys(ENV_MAP.classes)) {
    const classes = ENV_MAP.classes[schoolKey] || {};
    for (const clsKey of Object.keys(classes)) {
      if (classes[clsKey] && classes[clsKey] === pass)
        return { school: schoolKey, class: clsKey };
    }
  }
  return null;
}

function findSubjectByPassword(pw) {
  if (!pw) return null;
  const pass = String(pw);
  for (const schoolKey of Object.keys(ENV_MAP.subjects)) {
    const subs = ENV_MAP.subjects[schoolKey] || {};
    for (const sKey of Object.keys(subs)) {
      if (subs[sKey] && subs[sKey] === pass)
        return { school: schoolKey, subject: sKey };
    }
  }
  return null;
}

/**
 * ---------- ROUTES ORIJINAL YO ----------
 */
app.post('/api/verify-school', (req, res) => {
  const { school, password } = req.body;
  if (!password || typeof password !== 'string')
    return res.status(400).json({ success:false, message:'Missing password' });

  if (school) {
    const sk = normalizeSchoolKey(school);
    if (!ENV_MAP.schools[sk])
      return res.status(400).json({ success:false, message:'Lekòl pa rekonèt' });
    if (ENV_MAP.schools[sk] === password)
      return res.json({ success:true, level:'school', school: sk, message:`Lekòl ${sk} ouvè` });
    return res.status(401).json({ success:false, message:'Invalid school password' });
  } else {
    const found = findSchoolByPassword(password);
    if (found && found.school)
      return res.json({ success:true, level:'school', school: found.school, message:`Lekòl ${found.school} ouvè` });
    return res.status(401).json({ success:false, message:'Invalid school password' });
  }
});

app.post('/api/verify-class', (req, res) => {
  const { school, password } = req.body;
  if (!password || typeof password !== 'string')
    return res.status(400).json({ success:false, message:'Missing password' });

  if (school) {
    const sk = normalizeSchoolKey(school);
    const classesFor = ENV_MAP.classes[sk];
    if (!classesFor)
      return res.status(400).json({ success:false, message:'Lekòl pa rekonèt pou klas' });
    const validClass = Object.keys(classesFor).find(k => classesFor[k] === password);
    if (validClass)
      return res.json({ success:true, level:'class', school: sk, class: validClass, message:`Klas ${validClass} ouvè nan ${sk}` });
    return res.status(401).json({ success:false, message:'Invalid class password' });
  } else {
    const found = findClassByPassword(password);
    if (found)
      return res.json({ success:true, level:'class', school: found.school, class: found.class, message:`Klas ${found.class} ouvè nan ${found.school}` });
    return res.status(401).json({ success:false, message:'Invalid class password' });
  }
});

app.post('/api/verify-subject', (req, res) => {
  const { school, password } = req.body;
  if (!password || typeof password !== 'string')
    return res.status(400).json({ success:false, message:'Missing password' });

  if (school) {
    const sk = normalizeSchoolKey(school);
    const subsFor = ENV_MAP.subjects[sk];
    if (!subsFor)
      return res.status(400).json({ success:false, message:'Lekòl pa rekonèt pou matyè' });
    const validSubject = Object.keys(subsFor).find(k => subsFor[k] === password);
    if (validSubject)
      return res.json({ success:true, level:'subject', school: sk, subject: validSubject, message:`Egzamen ${validSubject} ouvè nan ${sk}` });
    return res.status(401).json({ success:false, message:'Invalid subject password' });
  } else {
    const found = findSubjectByPassword(password);
    if (found)
      return res.json({ success:true, level:'subject', school: found.school, subject: found.subject, message:`Egzamen ${found.subject} ouvè nan ${found.school}` });
    return res.status(401).json({ success:false, message:'Invalid subject password' });
  }
});

// ping
app.get('/ping', (req, res) => res.send('pong'));







// ---------------------------
// 💬 SOCKET.IO CHAT — VÈSYON FINAL AK LISTE ITILIZATÈ AKTIF
// ---------------------------

// ---------------------------
// 📦 Mongoose Schema
// ---------------------------
// Mesaj piblik ak prive
const messageSchema = new mongoose.Schema({
  from: { type: String, required: true },    // Itilizatè ki voye mesaj la
  to: { type: String, required: true },      // Itilizatè k ap resevwa mesaj la ('public' pou piblik)
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// ---------------------------
// ⚙️ Socket.IO Server
// ---------------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['*', 'https://www.fondationbackupspirituel.com'],
    methods: ['GET', 'POST']
  }
});

// ---------------------------
// 🧩 GESTION UTILISATÈ AKTIF
// ---------------------------
const onlineUsers = new Map();

function broadcastOnline() {
  const arr = [];
  for (const [id, info] of onlineUsers.entries()) {
    arr.push({
      id,
      name: info.name,
      connected: info.sockets.size > 0
    });
  }
  io.emit('online-users', arr);
}

// ---------------------------
// ⚡ SOCKET.IO CONNECTION
// ---------------------------
io.on('connection', async (socket) => {
  console.log('🟢 Nouvo itilizatè konekte:', socket.id);

  // ---------------------------
  // ✅ Chaje 100 dènye mesaj piblik yo
  // ---------------------------
  try {
    const anciensMessages = await Message.find({ to: 'public' }).sort({ date: 1 }).limit(100).lean();
    const formattedMessages = anciensMessages.map(msg => ({
      user: msg.from?.trim() || 'Anonyme',
      message: msg.message || '',
      date: msg.date ? new Date(msg.date) : new Date()
    }));
    socket.emit('loadMessages', formattedMessages);
  } catch (err) {
    console.error('❌ Erè pandan chajman mesaj piblik:', err.message);
  }

  // ---------------------------
  // ✅ Resevwa non itilizatè a
  // ---------------------------
  socket.on('setUser', (username) => {
    const cleanName = username?.trim() || 'Anonyme';
    const userId = cleanName.toLowerCase();

    let record = onlineUsers.get(userId);
    if (!record) {
      record = { name: cleanName, sockets: new Set() };
      onlineUsers.set(userId, record);
    }

    record.name = cleanName;
    record.sockets.add(socket.id);
    socket.data.userId = userId;

    io.emit('userConnected', cleanName);
    broadcastOnline();
  });

  // ---------------------------
  // ✅ Resevwa mesaj piblik
  // ---------------------------
  socket.on('chatMessage', async (data) => {
    try {
      const user = data.user?.trim() || 'Anonyme';
      const message = data.message?.trim();
      if (!message) return;

      const newMsg = new Message({ from: user, to: 'public', message });
      await newMsg.save();

      const formatted = {
        user: newMsg.from,
        message: newMsg.message,
        date: newMsg.date
      };

      io.emit('chatMessage', formatted);
    } catch (err) {
      console.error('❌ Erè pandan anrejistreman mesaj piblik:', err.message);
    }
  });

  // ---------------------------
  // ✅ Chat Prive
  // ---------------------------
  socket.on('privateMessage', async ({ from, to, message }) => {
    if (!from || !to || !message) return;

    const targetId = to.toLowerCase();
    const senderId = from.toLowerCase();

    const targetUser = onlineUsers.get(targetId);
    const senderUser = onlineUsers.get(senderId);

    // Sove mesaj nan MongoDB
    try {
      const newMsg = new Message({ from, to, message });
      await newMsg.save();
    } catch (err) {
      console.error('❌ Erè pandan sove mesaj prive:', err.message);
    }

    // Voye bay moun k ap resevwa a
    if (targetUser) {
      targetUser.sockets.forEach(socketId => {
        io.to(socketId).emit('privateMessage', { from, to, message, date: new Date() });
      });
    }

    // Voye bay moun ki voye a
    if (senderUser) {
      senderUser.sockets.forEach(socketId => {
        io.to(socketId).emit('privateMessage', { from, to, message, date: new Date() });
      });
    }
  });

  // ---------------------------
  // ✅ Chaje tout mesaj prive ant 2 itilizatè
  // ---------------------------
  socket.on('loadPrivateMessages', async ({ from, to }) => {
    try {
      const messages = await Message.find({
        $or: [
          { from, to },
          { from: to, to: from }
        ]
      }).sort({ date: 1 }).lean();
      socket.emit('loadPrivateMessages', messages);
    } catch (err) {
      console.error('❌ Erè pandan chajman mesaj prive:', err.message);
    }
  });

  // ---------------------------
  // ✅ Moun mande lis itilizatè
  // ---------------------------
  socket.on('requestUserList', () => {
    broadcastOnline();
  });

  // ---------------------------
  // ✅ Lè yon itilizatè dekonekte
  // ---------------------------
  socket.on('disconnect', () => {
    const userId = socket.data.userId;
    if (!userId) return;

    const record = onlineUsers.get(userId);
    if (!record) return;

    record.sockets.delete(socket.id);

    if (record.sockets.size === 0) {
      io.emit('userDisconnected', record.name);
    }

    broadcastOnline();
    console.log('🔴 Itilizatè dekonekte:', userId);
  });
});


// ---------------------------
// 🗂️ CHAT PAGE
// ---------------------------
app.get('/Chat-Spirituel.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Chat-Spirituel.html'));
});

// ---------------------------
// 🚀 DEMARRE SERVEUR
// ---------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
