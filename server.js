// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http'); // ✅ TRÈ ENPÒTAN pou Socket.io mache
const { Server } = require('socket.io');


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');

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







// server.js (Vèsyon final: CHAT PUBLIK entak; CHAT PRIVE - nouvo blòk separe)

// ---------------------------
// ⚡ HTTP + SOCKET.IO SERVER
const server = http.createServer(app);  // ✅ Renome httpServer an server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ---------------------------
// 🧩 MONGODB + MODEL MESAJ (ak tcheke koneksyon)
// ---------------------------
if (mongoose.connection.readyState === 0) {
  // Si pa gen koneksyon aktif, konekte
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('✅ MongoDB konekte avèk siksè!'))
    .catch((err) => console.error('❌ Erè MongoDB:', err.message));
} else {
  console.log('✅ MongoDB deja konekte');
}

// Definisyon schema pou mesaj piblik yo
const messageSchema = new mongoose.Schema({
  from: String,          // userId itilizatè
  to: String,            // 'public' pou chat piblik
  message: String,       // kontni mesaj la
  date: { type: Date, default: Date.now }, // dat otomatik
});

// Modèl Message pou MongoDB
const Message = mongoose.model('Message', messageSchema);

// ---------------------------
// 👥 MEMWA ITILIZATÈ AK BROADCAST
// ---------------------------

// ✅ 1. Kreye memwa pou itilizatè yo
const onlineUsers = new Map();

// ✅ 2. Fonksyon pou voye lis tout itilizatè yo bay tout moun (pou ti panel a dwat la)
function broadcastOnline() {
  const users = [];
  for (const [userId, record] of onlineUsers.entries()) {
    users.push({
      userId,                  // ID inik itilizatè a (enpòtan pou chat prive)
      display: record.user,    // non itilizatè a pou montre nan panel la
      connected: record.sockets.size > 0 // si itilizatè a konekte
    });
  }

  // Emit event ke client-side la ap koute
  io.emit('online-users', users);
}
	



// ---------------------------

// ⚡ SOCKET.IO – CHAT PIBLIK
// ---------------------------
io.on('connection', async (socket) => {
  console.log('🟢 Nouvo itilizatè konekte:', socket.id);

  // ---------------------------
  // Helper: normalize raw user string to stable userId + display name
  // ---------------------------
  function normalizeUser(raw) {
    const clean = (raw || '').toString().trim();
    if (!clean) {
      return { userId: `user-${socket.id}`, display: `Anonyme-${socket.id.slice(0,6)}` };
    }
    const userId = clean.toLowerCase();
    return { userId, display: clean };
  }

 // ---------------------------
// ✅ Fonksyon pou voye lis itilizatè sou entènèt bay tout clients
// ---------------------------
function broadcastOnline() {
  const users = [];
  for (const [userId, record] of onlineUsers.entries()) {
    users.push({
      userId,
      display: record.user,
      connected: record.sockets.size > 0
    });
  }
  io.emit('online-users', users); // nouvo panel ap koute sa
}

// ---------------------------
// ✅ Enskri / mete ajou itilizatè
// ---------------------------
function registerUser(rawUser) {
  try {
    const { userId, display } = normalizeUser(rawUser);

    // Si socket deja gen menm userId, pa fè anyen men mete ajou display si chanje
    if (socket.data.userId && socket.data.userId === userId) {
      const existing = onlineUsers.get(userId);
      if (existing) existing.user = display;
      broadcastOnline();
      return;
    }

    // Retire socket nan prev record si li egziste
    const prevId = socket.data.userId;
    if (prevId && prevId !== userId) {
      const prevRecord = onlineUsers.get(prevId);
      if (prevRecord) {
        prevRecord.sockets.delete(socket.id);
        if (prevRecord.sockets.size === 0) {
          onlineUsers.delete(prevId);
          io.emit('userDisconnected', { userId: prevId, display: prevRecord.user });
        }
      }
    }

    // Jwenn oswa kreye record pou userId
    let record = onlineUsers.get(userId);
    if (!record) {
      record = { user: display, sockets: new Set() };
      onlineUsers.set(userId, record);
    } else {
      record.user = display;
    }

    // Ajoute socket la
    record.sockets.add(socket.id);
    socket.data.userId = userId;

    // Join personal room (si ou vle chat prive)
    socket.join(`user-${userId}`);

    // Emèt done koneksyon itilizatè
    io.emit('userConnected', { userId, display });

    // Mete ajou panel itilizatè a
    broadcastOnline();

    console.log(`🔵 Registered socket ${socket.id} as userId=${userId} (display=${display})`);
  } catch (err) {
    console.error('registerUser err:', err);
  }
}

  // ---------------------------
  // Si front-end pase user nan handshake, enskri li imedyatman
  // ---------------------------
  try {
    const handshakeUser =
      socket.handshake?.query?.user ||
      socket.handshake?.auth?.user ||
      socket.handshake?.query?.userId ||
      socket.handshake?.auth?.userId;
    if (handshakeUser) registerUser(handshakeUser);
  } catch (e) {}

  // ---------------------------
  // ✅ Chaje mesaj piblik jodi a (async nan top-level callback)
  // ---------------------------
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaysMessages = await Message.find({
      to: 'public',
      date: { $gte: todayStart, $lt: todayEnd }
    })
      .sort({ date: 1 })
      .lean();

    const formatted = todaysMessages.map(msg => ({
      user: (msg.from || 'Anonyme').toString().trim(),
      message: msg.message || '',
      date: msg.date ? new Date(msg.date) : new Date(),
    }));

    socket.emit('loadMessages', formatted);
  } catch (err) {
    console.error('❌ Erè pandan chajman mesaj piblik jodi a:', err?.message);
  }

  // ---------------------------
  // ✅ Resevwa non itilizatè / chatMessage
  // ---------------------------
  socket.on('setUser', (payload) => {
    try {
      let value = null;
      if (typeof payload === 'string') value = payload;
      else if (payload && typeof payload === 'object')
        value = payload.userId || payload.user || null;

      if (!value) {
        const { userId } = normalizeUser(null);
        registerUser(userId);
        return;
      }

      registerUser(value);
    } catch (err) {
      console.error('setUser handler err:', err);
    }
  });

  socket.on('chatMessage', async (data) => {
    try {
      if (!socket.data.userId) {
        const possible = data && typeof data === 'object' ? (data.user || data.userId || null) : null;
        if (possible) registerUser(possible);
        else registerUser(null);
      }

      const userFrom = socket.data.userId || `user-${socket.id}`;
      const message = data?.message ? String(data.message).trim() : '';
      if (!message) return;

      const newMsg = new Message({ from: userFrom, to: 'public', message });
      await newMsg.save();

      io.emit('chatMessage', {
        user: newMsg.from,
        message: newMsg.message,
        date: newMsg.date,
      });

      broadcastOnline();
    } catch (err) {
      console.error('❌ Erè pandan anrejistreman mesaj piblik:', err?.message);
    }
  });

  socket.on('requestUserList', () => {
    try { broadcastOnline(); } catch (e) {}
  });

  socket.on('disconnect', () => {
    try {
      const userId = socket.data.userId;
      if (!userId) return;

      const record = onlineUsers.get(userId);
      if (!record) return;

      record.sockets.delete(socket.id);
      if (record.sockets.size === 0) {
        onlineUsers.delete(userId);
        io.emit('userDisconnected', { userId, display: record.user });
      }

      broadcastOnline();
      console.log('🔴 Itilizatè dekonekte:', userId);
    } catch (err) {
      console.error('disconnect err:', err);
    }
  });
  
	
	
	
	
	
	
	
	// ---------------------------
// ===  CHAT PRIVE - KOMPLET KONPATIB  ===
// ---------------------------

// Helper deterministic room name
function getPrivateRoom(a, b) {
  const A = String(a), B = String(b);
  return A < B ? `room-${A}-${B}` : `room-${B}-${A}`;
}

// --- Events prive deja egziste (pa modifye) ---
socket.on('request_private_chat', async ({ targetUser }) => {
  try {
    const me = socket.data.userId;
    if (!me) return socket.emit('error_private', { message: 'Unauthorized (no userId)' });
    if (!targetUser) return socket.emit('error_private', { message: 'Missing targetUser' });

    const room = getPrivateRoom(me, targetUser);
    socket.join(room);

    const messages = await Message.find({
      $or: [
        { from: me, to: targetUser },
        { from: targetUser, to: me }
      ]
    }).sort({ date: 1 }).lean();

    socket.emit('private_history', { conversationId: null, room, messages });
    io.to(`user-${targetUser}`).emit('private_chat_invite', { from: me, room });
  } catch (err) {
    console.error('request_private_chat err', err);
    socket.emit('error_private', { message: 'Server error (request_private_chat)' });
  }
});

socket.on('join_private_room', ({ room }) => {
  try {
    if (!room) return;
    socket.join(room);
    socket.emit('joined_private_room', { room });
  } catch (err) { console.error('join_private_room err', err); }
});

socket.on('private_message', async (payload) => { /* ...retabli menm jan ou te genyen... */ });

socket.on('loadPrivateMessages', async ({ user1, user2, from, to }) => {
  try {
    const A = user1 || from;
    const B = user2 || to;
    if (!A || !B) return socket.emit('loadPrivateMessages', []);
    const messages = await Message.find({
      $or: [
        { from: A, to: B },
        { from: B, to: A }
      ]
    }).sort({ date: 1 }).lean();
    socket.emit('loadPrivateMessages', messages);
  } catch (err) {
    console.error('loadPrivateMessages err', err);
    socket.emit('loadPrivateMessages', []);
  }
});

socket.on('mark_conversation_read', async ({ conversationId, otherUser }) => {
  try {
    const me = socket.data.userId;
    if (!me) return;
    if (otherUser) io.to(`user-${otherUser}`).emit('conversation_read', { by: me });
    socket.emit('mark_conversation_read_ok', { conversationId });
  } catch (err) { console.error('mark_conversation_read err', err); }
});

socket.on('message_seen', async ({ messageId }) => {
  try {
    if (!messageId) return;
    const msg = await Message.findById(messageId);
    if (!msg) return;
    const room = getPrivateRoom(msg.from, msg.to);
    io.to(room).emit('message_seen', { messageId, by: socket.data.userId });
  } catch (err) { console.error('message_seen err', err); }
});

socket.on('typing', ({ room, isTyping }) => {
  try {
    if (!room) return;
    socket.to(room).emit('typing', { from: socket.data.userId, isTyping: !!isTyping });
  } catch (err) { console.error('typing err', err); }
});

socket.on('requestUserList', () => { broadcastOnline(); });

// --- Nouvo features ---
socket.on('private_message_with_features', async (payload) => {
  try {
    const me = socket.data.userId;
    if(!me) return socket.emit('error_private',{message:'Unauthorized'});
    const to = payload.to;
    if(!to) return socket.emit('error_private',{message:'Missing recipient'});

    const text = payload.text || '';
    const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];
    const voice = payload.voice || null;
    const call = payload.call || null;

    const newMsg = new Message({
      from: me,
      to,
      message: text || (attachments[0]?.filename || ''),
      attachments,
      voice,
      date: new Date()
    });
    await newMsg.save();

    const room = payload.room || getPrivateRoom(me, to);
    const msgForEmit = {
      _id: newMsg._id,
      from: newMsg.from,
      to: newMsg.to,
      text: newMsg.message,
      attachments: newMsg.attachments,
      voice: newMsg.voice,
      createdAt: newMsg.date
    };

    io.to(room).emit('receive_private_message', msgForEmit);
    io.to(`user-${to}`).emit('private_message_notification',{
      from: me,
      room,
      messageId: newMsg._id,
      textPreview: newMsg.message.length>100 ? newMsg.message.slice(0,100)+'...' : newMsg.message
    });

    if(call && call.type && call.action){
      io.to(`user-${to}`).emit('private_call_signal',{from:me, call});
    }

    socket.emit('private_message_sent', msgForEmit);

  } catch(err){
    console.error('private_message_with_features err', err);
    socket.emit('error_private',{message:'Server error (private_message_with_features)'});
  }
});

socket.on('mark_message_seen', async ({ messageId }) => {
  try{
    if(!messageId) return;
    const msg = await Message.findById(messageId);
    if(!msg) return;
    const room = getPrivateRoom(msg.from,msg.to);
    io.to(room).emit('message_seen',{messageId, by: socket.data.userId});
  } catch(err){ console.error('mark_message_seen err', err); }
});

socket.on('block_user', ({ targetUser }) => {
  const me = socket.data.userId;
  if(!me || !targetUser) return;
  io.to(`user-${me}`).emit('user_blocked',{blockedUser: targetUser});
  io.to(`user-${targetUser}`).emit('blocked_by',{by: me});
});

// --- Disconnect handling pou chat prive + onlineUsers ---
socket.on('disconnect', () => {
  const userId = socket.data.userId;
  if(!userId) return;

  const record = onlineUsers.get(userId);
  if(!record) return;

  record.sockets.delete(socket.id);
  if(record.sockets.size===0) io.emit('userDisconnected', record.name);

  broadcastOnline();
  console.log('🔴 Itilizatè dekonekte:', userId);
});

}); // end io.on('connection')

// ---------------------------
// 🗂️ CHAT PAGE
// ---------------------------
app.get('/Chat-Spirituel.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Chat-Spirituel.html'));
});

// Serve Chatprive.html (so you can inject from query param in dev; production should render CURRENT_USER)
app.get('/Chatprive.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Chatprive.html'));
});









// ---------- PREMIUM / PAYMENTS SYSTEM (Nouvo konpatib premium.js + premium.html) ----------

// ───────────────────────────────────────────
// ⚙️ 1. Basic Setup
// ───────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // kote premium.html + premium.js + css ye

// ───────────────────────────────────────────
// ⚙️ 2. MongoDB Connection
// ───────────────────────────────────────────
if (!process.env.MONGO_URI) {
  console.error("❌ ERÈ: Pa jwenn 'MONGO_URI' nan anviwònman (.env / Render Config Vars)");
  process.exit(1); // Sispann server la pou evite li mache san baz done
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB konekte avèk siksè ✅"))
  .catch(err => {
    console.error("❌ ERÈ koneksyon MongoDB:", err);
    process.exit(1);
  });

// ───────────────────────────────────────────
// 📦 3. MongoDB Schema
// ───────────────────────────────────────────
const premiumSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  emailRecovery: String,
  phone: String,
  password: String,
  method: String,
  amount: Number,
  txnId: String,
  screenshotPath: String,
  status: { type: String, default: "pending" }, // pending / approved / rejected
  createdAt: { type: Date, default: Date.now }
});

const Premium = mongoose.model("Premium", premiumSchema);

// ───────────────────────────────────────────
// 📁 4. Upload Screenshot Configuration (multer)
// ───────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + crypto.randomBytes(4).toString("hex");
    cb(null, unique + "-" + file.originalname);
  }
});

const upload = multer({ storage });
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // pou ka wè foto yo si bezwen

// ───────────────────────────────────────────
// 📧 5. Email Notification (Nodemailer Setup)
// ───────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "votreemail@gmail.com",        // 👉 mete email admin
    pass: "votre_motdepasse_application" // 👉 pa mete modpas nòmal (se app password)
  }
});

// ───────────────────────────────────────────
// 📌 6. API – Créer Demande Premium
// ───────────────────────────────────────────
app.post("/api/premium/create", upload.single("screenshot"), async (req, res) => {
  try {
    const { fullname, email, emailRecovery, phone, password, method, amount, txnId } = req.body;

    if (!fullname || !email || !phone || !method || !amount) {
      return res.status(400).json({ error: "Tanpri ranpli tout chan obligatwa yo." });
    }

    const newPremium = new Premium({
      fullname,
      email,
      emailRecovery,
      phone,
      password,
      method,
      amount,
      txnId: txnId || null,
      screenshotPath: req.file ? req.file.filename : null
    });

    await newPremium.save();


	  // ✅ Email admin (koreksyon pou sekirite)  
transporter.sendMail({
  from: `"FOBAS Premium" <${process.env.MAIL_FROM}>`,  // ✅ soti nan .env
  to: process.env.ADMIN_EMAIL,                        // ✅ admin resevwa notif pa .env
  subject: `Nouvo demann Premium: ${fullname}`,
  text: `
Nou gen yon nouvo demann Premium:

👤 Non: ${fullname}
📧 Email: ${email}
📱 Téléphone: ${phone}
💰 Metòd peman: ${method}
💵 Montant: ${amount}
🆔 ID Tranzaksyon: ${txnId || "Pa antre"}
📎 Screenshot: ${newPremium.screenshotPath || "N/A"}

Status: pending
  `
});

return res.json({ id: newPremium._id, status: "pending" });

// ───────────────────────────────────────────
// ✅ 7. API – Admin apwouve fichye Premium
// ───────────────────────────────────────────
app.post("/api/premium/approve", async (req, res) => {
  const { id } = req.body;
  const user = await Premium.findByIdAndUpdate(id, { status: "approved" }, { new: true });
  if (!user) return res.status(404).json({ error: "Demann pa jwenn." });
  res.json({ success: true, status: user.status });
});

// ❌ Rejete
app.post("/api/premium/reject", async (req, res) => {
  const { id } = req.body;
  const user = await Premium.findByIdAndUpdate(id, { status: "rejected" }, { new: true });
  if (!user) return res.status(404).json({ error: "Demann pa jwenn." });
  res.json({ success: true, status: user.status });
});

// 📊 Verify status
app.get("/api/premium/status/:id", async (req, res) => {
  const user = await Premium.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "ID pa jwenn." });
  res.json({ status: user.status });
});













// server.js - Express + Socket.IO + Mongoose (serve files from repo root)
// NOTE: Put your sensitive vars on Render .env (DATABASE_URL, JWT_SECRET, TURN creds).

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.json());
// Serve static files from repo root so HTML/CSS/JS are accessible at root
app.use(express.static(__dirname));

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
app.post('/upload', upload.single('file'), async (req, res) => {
  console.log('Received upload:', req.file && req.file.originalname);
  res.json({ ok: true, name: req.file ? req.file.originalname : null });
});

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set. Connect to MongoDB via Render environment variables.');
}
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/fo_bas', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(()=>console.log('mongo ok')).catch(err=>console.warn('mongo err', err));

const ClassroomSchema = new mongoose.Schema({
  code: { type: String, index: true },
  title: String,
  teacherId: String,
  students: [{ socketId: String, name: String, joinedAt: Date }],
  createdAt: Date
});
const Classroom = mongoose.model('Classroom', ClassroomSchema);

io.on('connection', socket => {
  console.log('conn', socket.id);

  socket.on('join-room', async ({ room, role, name }) => {
    socket.join(room);
    let cls = await Classroom.findOneAndUpdate(
      { code: room },
      { $setOnInsert: { code: room, createdAt: new Date() }, $set: { title: room } },
      { upsert: true, new: true }
    );
    if (role === 'teacher') {
      cls.teacherId = socket.id;
      await cls.save();
      io.to(socket.id).emit('joined-as-teacher', { room });
    }
    console.log(`${name || 'user'} joined room ${room} as ${role}`);
  });

  socket.on('join-request', async ({ room, name, role }) => {
    const cls = await Classroom.findOne({ code: room });
    if (!cls || !cls.teacherId) {
      socket.emit('join-response', { accepted: false, reason: 'No teacher online' });
      return;
    }
    io.to(cls.teacherId).emit('join-request', { studentId: socket.id, studentName: name });
  });

  socket.on('join-response', async ({ room, studentId, accepted }) => {
    io.to(studentId).emit('join-response', { accepted });
    if (accepted) {
      await Classroom.findOneAndUpdate({ code: room }, {
        $push: { students: { socketId: studentId, name: 'student', joinedAt: new Date() } }
      });
      io.to(room).emit('participant-joined', { id: studentId, name: 'student', role: 'student' });
    }
  });

  socket.on('joined', ({ room, name, role }) => {
    // notify room and share participants list to newcomer
    const clients = Array.from(io.sockets.adapter.rooms.get(room) || []);
    // send participants list to this socket (so newcomer can initiate offers to others)
    socket.emit('participants', { ids: clients });
    io.to(room).emit('participant-joined', { id: socket.id, name, role });
  });

  // signaling relay: offer / answer / ice
  socket.on('webrtc-offer', ({ to, description })=>{
    if(!to) return;
    io.to(to).emit('webrtc-offer', { from: socket.id, description });
  });
  socket.on('webrtc-answer', ({ to, description })=>{
    if(!to) return;
    io.to(to).emit('webrtc-answer', { from: socket.id, description });
  });
  socket.on('ice-candidate', ({ to, candidate })=>{
    if(!to) return;
    io.to(to).emit('ice-candidate', { from: socket.id, candidate });
  });

  socket.on('chat-message', ({ room, text, fromName }) => {
    const payload = { from: socket.id, fromName: fromName || socket.id, text, at: new Date() };
    io.to(room).emit('chat-message', payload);
  });

  socket.on('teacher-mute-all', ({ room }) => {
    io.to(room).emit('teacher-mute-all');
  });

  socket.on('block-student', ({ room, studentId }) => {
    io.to(studentId).emit('blocked', { reason: 'Blocked by teacher' });
    io.sockets.sockets.get(studentId)?.disconnect(true);
  });

  socket.on('start-screen-share', ({ room }) => {
    io.to(room).emit('screen-share-started', { by: socket.id });
  });

  socket.on('make-presenter', ({ room, by })=>{
    io.to(room).emit('presenter-made',{ by });
  });

  socket.on('end-class', ({ room }) => {
    io.to(room).emit('class-ended');
  });

  socket.on('disconnect', async () => {
    console.log('disc', socket.id);
    await Classroom.updateMany({}, { $pull: { students: { socketId: socket.id } } });
    // Optionally inform rooms that participant left
    socket.rooms.forEach(r => {
      io.to(r).emit('participant-left', { id: socket.id });
    });
  });
});


// 🚀 DEMARRE SERVEUR
// ---------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
