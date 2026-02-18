// ============================
// Environment Variables
// ============================
require('dotenv').config(); // ✅ Kenbe sa nan tèt

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const axios = require('axios');
const bcryptjs = require('bcryptjs');
const connectMongo = require('connect-mongo');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const ffmpeg = require('fluent-ffmpeg');
const { parse } = require('json2csv');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const multer = require('multer');
const nodemailer = require('nodemailer');
const Pusher = require('pusher');
const sharp = require('sharp');
const fs = require('fs'); // <-- AJOUTE LIG SA A LA OUVÈTI BLOK LA



// ----------------------- MODELS -----------------------
const VipSession = require('./models/VipSession.js');   // CommonJS
const User = require('./models/User.js');               // CommonJSP



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






// ----------------------- ROUTES MERCHANT -----------------------
// Mete sa apre tout middleware tankou express.json() 
// epi anvan app.listen pou li ka koute requests
const merchantRoutes = require('./merchant/merchant.routes');
app.use('/merchant', merchantRoutes);




// ----------------------- ROUTE TRANSFERT WALLET ➜ MERCHANT -----------------------
const walletToMerchantRoutes = require("./routes/walletToMerchant");
app.use('/wallet', walletToMerchantRoutes);   // <-- sa pèmèt POST /wallet/transfer-to-merchant









// =======================================
// VERIFY AGENT AUTORISÉ VIA walletbalances
// =======================================
app.post("/api/verify-agent", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.json({ success: false, message: "Email manquant" });

    const agent = await db.collection("walletbalances").findOne({ email: email.toLowerCase() });

    if (!agent) return res.json({ success: false, message: "Agent non autorisé" });

    return res.json({
      success: true,
      agentName: agent.nom || agent.email,
      walletAccountType: agent.walletAccountType // ajoute tit itilizatè a
    });

  } catch (err) {
    console.error("VERIFY AGENT ERROR:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
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










































// --- SOCKET.IO Handlers ---
io.on("connection", (socket) => {
  console.log("🟢 Nouvo itilizatè konekte:", socket.id);

  socket.on('ask', async ({ question, lang } = {}) => {
    try {
      const doc = await findAnswerInDB(question || '', lang);

      if (doc) {
        socket.emit('answer', { 
          answer: doc.answer, 
          lang: doc.lang || lang || 'ht'
        });
      } else {
        const DEFAULT_ANSWERS = {
          ht: "M pa jwenn repons sa nan memwa mwen. Eske ou vle m anrejistre kesyon sa pou pwochen fwa?",
          fr: "Je n’ai pas trouvé cette réponse dans ma mémoire. Voulez-vous que je sauvegarde cette question pour la prochaine fois ?",
          en: "I couldn’t find this answer in my memory. Would you like me to save this question for next time?",
          es: "No encontré esta respuesta en mi memoria. ¿Quieres que guarde esta pregunta para la próxima vez?"
        };

        const chosenLang = (lang && ['ht','fr','en','es'].includes(lang)) ? lang : 'ht';

        console.debug('[MemeQA] emitting fallback answer, lang=', chosenLang);
        socket.emit('answer', {
          answer: DEFAULT_ANSWERS[chosenLang],
          lang: chosenLang
        });
      }
    } catch (err) {
      console.error('❌ Erè pandan ask handler:', err);
      socket.emit('answer', { answer: "Erè sèvè. Eseye ankò.", lang: lang || 'ht' });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 socket disconnected:', socket.id, reason);
  });
});


// --- HTTP Endpoints ---
app.get('/api/memeqas', async (req, res) => {
  try {
    const q = {};
    if (req.query.lang) q.lang = req.query.lang;

    const list = await MemeQA.find(q)
      .sort({ createdAt: -1 })
      .limit(5000);

    res.json(list);
  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  }
});

app.post('/api/memeqa', async (req, res) => {
  try {
    const payload = req.body;
    if(!payload || !payload.question || !payload.answer) {
      return res.status(400).json({ error:'question & answer required' });
    }

    const doc = await MemeQA.create(payload);
    io.emit('memeqa-update', { action:'create', doc });

    res.json({ ok:true, doc });

  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  }
});

app.delete('/api/memeqa/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await MemeQA.findByIdAndDelete(id);

    io.emit('memeqa-update', { action:'delete', id });

    res.json({ ok:true, doc });
  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  }
});

app.post('/ask', async (req, res) => {
  try {
    const { question, lang } = req.body || {};
    const doc = await findAnswerInDB(question || '', lang);

    if (doc) {
      return res.json({ 
        answer: doc.answer, 
        lang: doc.lang || lang || 'ht' 
      });
    }

    return res.json({ 
      answer: "M pa jwenn repons sa nan memwa mwen. Eske ou vle m anrejistre kesyon sa pou pwochen fwa?", 
      lang: lang || 'ht' 
    });

  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  }
});


// --- MongoDB Change Stream ---
mongoose.connection.once('open', () => {
  try {
    const changeStream = MemeQA.watch();

    changeStream.on('change', (change) => {
      io.emit('memeqa-update', { change });
    });

    changeStream.on('error', (err) => {
      console.warn('changeStream error:', err && err.message);
    });

  } catch(err) {
    console.warn('Change stream not available (replica set required).', err && err.message);
  }
});



























// ----------------------- WALLET FOBAS SCHEMA -----------------------
const walletUserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  balance: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  whatsapp: { type: String },
  recoveryEmail: { type: String },
  sponsorName: { type: String },
  sponsorEmail: { type: String },
  accountType: { type: String, required: true },
  hasDepositedBefore: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: "pending" },

  // 🔐 CHAN TRACE / AUDIT / RISK (ACTIVE DEFAULTS)
  lastAction: { type: String, default: "CREATION" },       // default premye aksyon
  lastActionAt: { type: Date, default: Date.now },          // aktive depi premye kreasyon
  lastActionBy: { type: String, default: "SYSTEM" },        // SYSTEM kòm default
  adminIp: { type: String, default: "0.0.0.0" },            // default trace IP

  createdBy: { type: String, enum: ["Self",  "Agent Terrain", "Agent Autorise", "Utilisateur", "FONDATEUR FOBAS"], default: "self" },
  registrationChannel: { type: String, enum: ["app", "Utilisateur", "Agent Terrain", "Agent Autorise", "FONDATEUR FOBAS"], default: "app" },
  geoZone: { type: String, default: "undefined" },          // default aktif pou trace zòn
  deviceId: { type: String, default: "unknown" },           // default aktif
  createdFromDevice: { type: String, default: "unknown" },  // default aktif
  ipAddress: { type: String, default: "0.0.0.0" },          // default trace IP

  kycLevel: { type: Number, default: 0 },                   // nivo KYC debaz
  riskScore: { type: Number, default: 0 },                  // debaz riskScore
  riskFlags: { type: [String], default: [] },               // lis alert risk

  auditVersion: { type: Number, default: 1 }                // vèsyon audit
}, { timestamps: true });

// 🔥 Koreksyon pou fè l konpatib ak koleksyon reyèl MongoDB ou
const WalletUser = mongoose.models.WalletUser || mongoose.model(
  "WalletUser",      // Non model nan JS
  walletUserSchema,  // Schema
  "walletusers"      // Non collection reyèl nan MongoDB
);


// ----------------------- SCHEMAS BALANCE WALLET -----------------------
const walletBalanceSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  fullName: String,
  walletAccountType: { type: String, default: "Utilisateur" },
  accountStatus: { type: String, default: "ACTIF" },
  balance: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  balanceFrozen: { type: Boolean, default: false },
  bonusBlocked: { type: Boolean, default: false },
  lastAction: String,

  // ===============================
// 🔐 TRACE & SÉCURITÉ / NOUVO CHAMPS - ACTIVE DEFAULTS
// ===============================
createdBy: {
  type: String,
  enum: ["Self",  "Agent Terrain", "Agent Autorise", "Utilisateur", "FONDATEUR FOBAS"],
  default: "Self"
},
agentId: {
  type: mongoose.Schema.Types.ObjectId,
  default: null
},
registrationChannel: {
  type: String,
  enum: ["app", "Utilisateur", "Agent Terrain", "Agent Autorise", "FONDATEUR FOBAS"],
  default: "app"
},
geoZone: {
  type: String,
  default: "undefined"          // ACTIVE default pou trace
},
kycLevel: {
  type: Number,
  default: 0
},
deviceId: {
  type: String,
  default: "unknown"            // ACTIVE default pou device trace
},
createdFromDevice: {
  type: String,
  default: "unknown"            // ACTIVE default
},
ipAddress: {
  type: String,
  default: "0.0.0.0"            // ACTIVE default IP
},
riskScore: {
  type: Number,
  default: 0
},
riskFlags: {
  type: [String],
  default: []
},
lastActionAt: { type: Date, default: Date.now },   // ACTIVE depi premye kreasyon
lastActionBy: { type: String, default: "SYSTEM" }, // ACTIVE default
adminIp: { type: String, default: "0.0.0.0" },     // ACTIVE default
auditVersion: { type: Number, default: 1 }

}, { timestamps: true });





// ----------------------- SCHEMAS TRANSACTIONS -----------------------
const transactionSchema = new mongoose.Schema({
  email: String,
  fullName: String,
  type: String, // deposit, withdraw, transfer, bonus
  amount: Number,
  fee: { type: Number, default: 0 },
  note: String, // ✅ ADMIN NOTE (SAFE)
  method: String,
  whatsapp: String,
  country: String,
  receiverEmail: String,
  status: { type: String, default: 'PENDING' }
}, { timestamps: true });

const WalletBalance = mongoose.model('walletbalances', walletBalanceSchema);
const Transaction = mongoose.model('transactions', transactionSchema);








// ==================== MONGOOSE SCHEMA TRANSFERT SAFE ====================
// ⚠️ Schema pou bouton "Transferer" - VALIDATION TIP DONE OFISYÈL
// ⚠️ Pa manyen okenn route oswa dashboard ki egziste deja
// ============================================================================

const transfertSchema = new mongoose.Schema({
  agentNom: { type: String, required: true },
  agentEmail: { type: String, required: true },

  expediteurNom: { type: String, default: "" },
  expediteurDocumentType: { type: String, default: "" },
  expediteurDocumentNumero: { type: String, default: "" },
  expediteurPays: { type: String, default: "" },
  expediteurVille: { type: String, default: "" },
  expediteurAdresse: { type: String, default: "" },
  expediteurTelephone: { type: String, default: "" },

  beneficiaireNom: { type: String, default: "" },
  beneficiairePays: { type: String, default: "" },
  beneficiaireVille: { type: String, default: "" },
  beneficiaireAdresse: { type: String, default: "" },
  beneficiaireTelephone: { type: String, default: "" },

  montant: { type: Number, required: true, min: 0 },
  devise: { type: String, default: "" },
  codeUnique: { type: String, required: true, unique: true },
  statut: { type: String, default: "PENDING" },

  dateCreation: { type: Date, default: Date.now },
  dateExpiration: { type: Date, required: true },

  source: { type: String, default: "TRANSFERER" },
  createdAt: { type: Date, default: Date.now }
});

// ⚠️ Model refere koleksyon deja egziste
const Transfert = mongoose.model("Transfert", transfertSchema, "transferts");

// ==================== ROUTE SAFE TRANSFERER ====================
app.post("/api/transferts", async (req, res) => {
  try {
    const data = req.body;
    const montant = Number(data.montant);

    // ===== Validation minimòm =====
    if (!data || !data.agentEmail || !montant || montant <= 0) {
      return res.status(400).json({ success: false, message: "Données invalides" });
    }

    // ===== Dates =====
    const dateCreation = new Date();
    const dateExpiration = new Date();
    dateExpiration.setDate(dateExpiration.getDate() + 21);

    // ===== Kreye dokiman transfè avèk pi gwo prudence =====
    const transfertDoc = new Transfert({
      agentNom: data.agentNom || "",
      agentEmail: data.agentEmail || "",

      expediteurNom: data.expediteur?.nom || "",
      expediteurDocumentType: data.expediteur?.documentType || "",
      expediteurDocumentNumero: data.expediteur?.document || "",
      expediteurPays: data.expediteur?.pays || "",
      expediteurVille: data.expediteur?.ville || "",
      expediteurAdresse: data.expediteur?.adresse || "",
      expediteurTelephone: data.expediteur?.whatsapp || "",

      beneficiaireNom: data.beneficiaire?.nom || "",
      beneficiairePays: data.beneficiaire?.pays || "",
      beneficiaireVille: data.beneficiaire?.ville || "",
      beneficiaireAdresse: data.beneficiaire?.adresse || "",
      beneficiaireTelephone: data.beneficiaire?.whatsapp || "",

      montant,
      devise: data.devise || "",
      codeUnique: data.codeUnique || "",
      statut: "PENDING",
      dateCreation,
      dateExpiration,
      source: "TRANSFERER",
      createdAt: dateCreation
    });

    // ===== Retry loop pou codeUnique si gen duplicate key =====
    let saved = false;
    let attempts = 0;
    const crypto = require("crypto");

    while (!saved && attempts < 3) {
      try {
        await transfertDoc.save();
        saved = true;
      } catch (err) {
        if (err.code === 11000 && err.keyPattern?.codeUnique) {
          // Regenerer codeUnique sou server
          transfertDoc.codeUnique =
            "FOBAS-" + crypto.randomBytes(6).toString("hex").toUpperCase();
          attempts++;
        } else {
          throw err;
        }
      }
    }

    if (!saved) {
      return res.status(500).json({
        success: false,
        message: "Impossible de générer un code unique pour le transfert"
      });
    }

    // ===== Repons siksè =====
    return res.status(200).json({
      success: true,
      message: "Transfert créé avec succès",
      codeUnique: transfertDoc.codeUnique
    });

  } catch (err) {
    console.error("TRANSFER SAFE ERROR:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

























// =======================
// 🔎 VERIFIER IDENTITÉ WALLET (EMAIL EXACT)
// =======================
app.post("/api/wallet/verify-identity", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email manquant"
      });
    }

    const user = await WalletUser.findOne({
      email: email
    }).select("fullName email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Aucun compte FOBAS ne correspond à cet email"
      });
    }

    return res.json({
      success: true,
      fullName: user.fullName
    });

  } catch (err) {
    console.error("VERIFY IDENTITY ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});













// ----------------------- SOCKET -----------------------
io.on('connection', socket => {
  console.log('🔌 Socket connecté');
});

const notifyUpdate = () => io.emit('wallet-update');





// =======================
// ⏱️ AUTO TRANSFERT BONUS → BALANCE (AGENT AUTORISÉ)
// =======================

const BONUS_FLUSH_INTERVAL = 10 * 60 * 1000; // 10 minutes

setInterval(async () => {
  try {
    // Chèche tout Agents Autorisés ki gen bonus > 0
    const agents = await WalletBalance.find({
      walletAccountType: "Agent Autorise",
      bonus: { $gt: 0 },
      balanceFrozen: false // sekirite
    });

    if (agents.length === 0) return;

    for (const agent of agents) {
      const bonusAmount = agent.bonus;

      // 💰 Ajoute bonus nan balance
      agent.balance += bonusAmount;

      // ♻️ Reset bonus
      agent.bonus = 0;

      await agent.save();
    }

    // 🔔 Notify admin dashboard an tan réel
    notifyUpdate();

    console.log(`✅ AUTO BONUS FLUSH: ${agents.length} agent(s) mis à jour`);

  } catch (err) {
    console.error("❌ ERREUR AUTO BONUS FLUSH:", err);
  }
}, BONUS_FLUSH_INTERVAL);





// =======================
// ⏱️ AUTO TRANSFERT BONUS → BALANCE (UTILISATEURS ≥ 2500)
// =======================

const USER_BONUS_FLUSH_INTERVAL = 60 * 1000; // 1 minute pou test, apre retounen 1h si ou vle

setInterval(async () => {
  try {
    // Chèche tout Utilisateurs ki gen bonus ≥ 2500
    const users = await WalletBalance.find({
      walletAccountType: "Utilisateur",
      bonus: { $gte: 2500 },
      balanceFrozen: false // sekirite
    });

    if (users.length === 0) return;

    for (const user of users) {
      const bonusAmount = user.bonus;

      // 💰 Ajoute bonus nan balance
      user.balance += bonusAmount;

      // ♻️ Reset bonus
      user.bonus = 0;


      await user.save();
    }

    // 🔔 Notify admin dashboard an tan réel
    notifyUpdate();

    console.log(`✅ AUTO BONUS USER FLUSH: ${users.length} utilisateur(s) mis à jour`);

  } catch (err) {
    console.error("❌ ERREUR AUTO BONUS USER FLUSH:", err);
  }
}, USER_BONUS_FLUSH_INTERVAL);





// ======================= USER DASHBOARD =======================

// 📥 Charger dashboard utilisateur
app.get('/api/wallet/dashboard', async (req, res) => {
  try {
    const email = req.headers['x-user-email'] || req.body.email;
    if (!email) return res.status(400).json({ message: 'Email manquant' });

    let wallet = await WalletBalance.findOne({ email });
    if (!wallet) {
      wallet = await WalletBalance.create({
        email,
        fullName: email
      });
    }

    const tx = await Transaction.find({ email }).sort({ createdAt: -1 });
    res.json({ wallet, tx });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur dashboard' });
  }
});

// 📥 Dépôt
app.post('/api/wallet/deposit', async (req, res) => {
  try {
    const email = req.headers['x-user-email'] || req.body.email;
    const { amount, method, whatsapp, country } = req.body;

    if (!email || !amount)
      return res.status(400).json({ message: 'Données manquantes' });

    await Transaction.create({
      email,
      type: 'deposit',
      amount,
      method,
      whatsapp,
      country,
      status: 'PENDING',
	  createdAt: new Date()
    });

    notifyUpdate();
    res.json({ message: 'Dépôt envoyé (PENDING)' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur dépôt' });
  }
});


// 📤 Retrait (5%)
app.post('/api/wallet/withdraw', async (req, res) => {
  try {
    const email = req.headers['x-user-email'] || req.body.email;
    const { amount, method, whatsapp, country } = req.body;

    const fee = amount * 0.05;

    await Transaction.create({
      email,
      type: 'withdraw',
      amount,
      fee,
      method,
      whatsapp,
      country,
      status: 'PENDING',
	  createdAt: new Date()
    });

    notifyUpdate();
    res.json({ message: 'Retrait envoyé (PENDING)' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur retrait' });
  }
});









// 🔄 Transfert instantané (CORRIGÉ SANS REFACTOR)
app.post('/api/wallet/transfer', async (req, res) => {
  try {
    const senderEmail = req.headers['x-user-email'] || req.body.senderEmail;
    const { receiverEmail, amount } = req.body;

    if (senderEmail === receiverEmail) {
      return res.status(400).json({ message: "Transfert vers soi-même interdit" });
    }

    const senderUser = await WalletUser.findOne({ email: senderEmail });
    const receiverUser = await WalletUser.findOne({ email: receiverEmail });


    // ✅ CE QUE TU DEMANDES (SANS REFACTOR)
    const geoZone = req.headers["x-geo-zone"] || "unknown";
    const senderKycLevel = senderUser?.kycLevel || 0;
    const receiverKycLevel = receiverUser?.kycLevel || 0;


	  
    if (!receiverUser) {
      return res.status(404).json({ message: "Destinataire introuvable" });
    }

    const sender = await WalletBalance.findOne({ email: senderEmail });
    let receiver = await WalletBalance.findOne({ email: receiverEmail });


// 🔒 BLOKAJ CREDIT SI RECEIVER FREEZE
if (receiver && receiver.balanceFrozen === true) {
  return res.status(403).json({
    message: "⛔ Compte destinataire gelé. Aucun crédit autorisé."
  });
}

// 🔒 BLOKAJ BONUS AGENT
if (
  receiver &&
  receiver.walletAccountType === "Agent Autorise" &&
  receiver.bonusBlocked === true
) {
  return res.status(403).json({
    message: "⛔ Bonus agent bloqué."
  });
}
	  
	const admin = await WalletBalance.findOne({ email: "memeselvandieu@fobas.com" }); // wallet admin
	  
    if (!sender || sender.balance < amount) {
      return res.status(400).json({ message: "Solde insuffisant" });
    }

    if (!receiver) {
      receiver = await WalletBalance.create({
        email: receiverEmail,
        balance: 0,
        bonus: 0
      });
    }

    // 🔒 Bloque Agent → Agent
    if(sender.walletAccountType === "Agent Autorise" && receiver.walletAccountType === "Agent Autorise"){
      return res.status(403).json({ message: "Agent Autorise pa ka voye lajan bay lòt agent." });
    }




// 🔒 ALERT STRIK SI MONTAN AN PA KONVNI
const MIN_TRANSFER = 20;      // Pi piti montan ki akseptab (ou ka modifye)
const MAX_TRANSFER = 75000;  // Pi gwo montan ki akseptab

if(amount < MIN_TRANSFER || amount > MAX_TRANSFER) {
  // Freeze kont moun k ap voye a
  sender.balanceFrozen = true;
  await sender.save();



// ⏳ AUTO UNFREEZE APRÈ 5 MINUTES (UTILISATEUR)
setTimeout(async () => {
  try {
    const refreshedSender = await WalletBalance.findOne({ email: senderEmail });

    if (refreshedSender && refreshedSender.balanceFrozen === true) {
      refreshedSender.balanceFrozen = false;
      refreshedSender.lastAction = "AUTO_UNFREEZE_AFTER_LIMIT";
      await refreshedSender.save();

      notifyUpdate();
      console.log(`🔓 AUTO UNFREEZE effectué pour ${senderEmail}`);
    }
  } catch (err) {
    console.error("❌ ERREUR AUTO UNFREEZE:", err);
  }
}, 5 * 60 * 1000); // 5 minutes




  // Kreye alèt nan tranzaksyon pou admin dashboard
  await Transaction.create({
  // =========================
  // CHAMPS EXISTANTS (PA TOUCHE)
  // =========================
  email: senderEmail,
  type: 'transfer',
  amount,
  receiverEmail,
  status: 'PENDING',
  note: 'SECURITY ALERT - Montant limite dépassé',
  createdAt: new Date(),

  // =========================
  // 🔐 CHAMPS AUDIT / TRACE (ACTIVE DEFAULTS)
  // =========================
  alertBy: 'SYSTEM',                     // deja la, ok
  alertAt: new Date(),                   // deja la, ok

  // Evite null → active monitoring
  geoZone: geoZone || 'undefined',

  // ➕ NOUVO TRACE SAFE (san kraze anyen)
  ipAddress: req.ip || '0.0.0.0',         // trace IP itilizatè
  deviceId: req.headers['user-agent'] || 'unknown', // trace device
  riskScore: 1,                           // alèt = risk minimal
  riskFlags: ['LIMIT_EXCEEDED'],          // tag risk klè
  auditVersion: 1                         // version audit
});

  // Notifye dashboard admin imedyatman
  notifyUpdate();

  // Reponn itilizatè a
  return res.status(403).json({
    message: "⛔ Montant invalide. Compte gelé et alert admin envoyé."
  });
}








	  
// ===================================================
// 💸 FRAIS RETRAIT UTILISATEUR (1%)
// ===================================================
let fee = 0;

// 🔹 Bloque frais pou transfert internal Representant → Agent
const isInternalRepToAgent =
  sender.walletAccountType === "Representant FOBAS" &&
  receiver.walletAccountType === "Agent Autorise";

// 🔹 Bloque frais pou transfert Partenaire Officiel FOBAS → Agent
const isOfficialPartnerToAgent =
  sender.walletAccountType === "Partenaire Officiel FOBAS" &&
  receiver.walletAccountType === "Agent Autorise";

// ---------------------------------------------------
// 1️⃣ Frais normal (Client → Agent Autorise)
// ---------------------------------------------------
if (receiver.walletAccountType === "Agent Autorise" && !isInternalRepToAgent && !isOfficialPartnerToAgent) {
  fee = amount * 0.01;

  if (sender.balance < amount + fee) {
    return res.status(400).json({
      message: "Solde insuffisant pour couvrir le montant + frais"
    });
  }

  sender.balance -= fee;
}

// ===================================================
// 💸 MOUVEMENT FINANCIER PRINCIPAL
// ===================================================
sender.balance -= amount;
receiver.balance += amount;

// ===================================================
// ✅ DISTRIBUTION KOMISYON (Client → Agent)
// ===================================================
if (
  receiver.walletAccountType === "Agent Autorise" &&
  !isInternalRepToAgent &&
  !isOfficialPartnerToAgent
) {
  const commission = amount * 0.01;         // 1% total
  const agentShare = amount * 0.006;        // 0.60%
  const platformShare = amount * 0.004;     // 0.40%

  receiver.bonus += agentShare;
  if (admin) admin.balance += platformShare;
}

// 🔹 SAVE FINAL (toujou san touche existing code)
await sender.save();
await receiver.save();
if (admin) await admin.save();

// ===================================================
// 🎁 BONUS SPÉCIAL DEPOT REPRESENTANT → AGENT (SAFE FINAL)
// 👉 Bonus 2,500 Gdes
// 👉 Auto-crédit vers balance après 10 minutes
// ===================================================
try {
  if (isInternalRepToAgent && Number(amount) === 50000) {
    const BONUS_AMOUNT = 2500;
    const BONUS_DELAY_MS = 10 * 60 * 1000; // 10 minutes

    // ➕ Ajoute bonus imedyat pou trace, men li rete nan bonus
    receiver.bonus = (receiver.bonus || 0) + BONUS_AMOUNT;
    receiver.lastAction = "BONUS_PENDING_REPRESENTANT_50K";
    receiver.lastActionAt = new Date();
    receiver.lastActionBy = "SYSTEM";
    receiver.riskScore = receiver.riskScore || 0;
    receiver.auditVersion = receiver.auditVersion || 1;

    await receiver.save();

    // 🧾 TRACE obligatwa nan transactions
    await Transaction.create({
      email: receiver.email,
      type: "bonus",
      amount: BONUS_AMOUNT,
      senderEmail: sender.email,
      receiverEmail: receiver.email,
      status: "PENDING",
      note: "Bonus 2,500 Gdes - crédit différé 10 min (Representant FOBAS)",
      createdAt: new Date(),

      createdBy: "SYSTEM",
      bonusType: "REPRESENTANT_AGENT_DEPOSIT_DELAYED",
      relatedAmount: amount,

      geoZone: geoZone || "undefined",
      ipAddress: req.ip || "0.0.0.0",
      deviceId: req.headers["user-agent"] || "unknown",

      riskScore: 0,
      riskFlags: [],
      auditVersion: 1
    });

    // ⏳ AUTO-CRÉDIT BONUS → BALANCE APRÈ 10 MINUTES
    setTimeout(async () => {
      try {
        const agentWallet = await WalletBalance.findOne({ email: receiver.email });

        if (
          agentWallet &&
          agentWallet.bonus >= BONUS_AMOUNT &&
          agentWallet.accountStatus === "ACTIF" &&
          agentWallet.balanceFrozen !== true
        ) {
          agentWallet.bonus -= BONUS_AMOUNT;
          agentWallet.balance += BONUS_AMOUNT;

          agentWallet.lastAction = "BONUS_CONVERTED_TO_BALANCE";
          agentWallet.lastActionAt = new Date();
          agentWallet.lastActionBy = "SYSTEM";

          await agentWallet.save();

          await Transaction.create({
            email: agentWallet.email,
            type: "bonus_conversion",
            amount: BONUS_AMOUNT,
            status: "ACTIVE",
            note: "Conversion automatique bonus → balance après 10 min",
            createdAt: new Date(),

            createdBy: "SYSTEM",
            relatedBonusType: "REPRESENTANT_AGENT_DEPOSIT_DELAYED",

            geoZone: geoZone || "undefined",
            ipAddress: "0.0.0.0",
            deviceId: "SYSTEM",

            riskScore: 0,
            riskFlags: [],
            auditVersion: 1
          });

          notifyUpdate();
          console.log(`✅ BONUS 2,500 converti en balance pour ${agentWallet.email}`);
        }
      } catch (autoBonusErr) {
        console.error("❌ ERREUR AUTO-CONVERSION BONUS:", autoBonusErr);
      }
    }, BONUS_DELAY_MS);
  }
} catch (bonusErr) {
  console.error("❌ ERREUR BONUS AGENT:", bonusErr);
}

// ===================================================
// 🔹 TRANSFERT SPECIAUX PARTENAIRE OFFICIEL → AGENT
// ===================================================
try {
  if (isOfficialPartnerToAgent) {
    console.log(
      `🔒 Transfert Partenaire Officiel FOBAS → Agent: pas de frais, pas de bonus, pas de commission`
    );

    // 🔹 Save san okenn frais/bonus/commission
    await sender.save();
    await receiver.save();

    // 🔹 TRACE UNIQUE (sender = propriétaire de la transaction)
    await Transaction.create({
      email: sender.email,              // ✅ TRES IMPORTANT
      type: "transfer",
      amount: amount,

      senderEmail: sender.email,
      receiverEmail: receiver.email,

      status: "ACTIVE",
      note: "Transfert Partenaire Officiel FOBAS → Agent Autorise (sans frais/bonus/commission)",
      createdAt: new Date(),

      createdBy: "SYSTEM",
      geoZone: geoZone || "undefined",
      ipAddress: req.ip || "0.0.0.0",
      deviceId: req.headers["user-agent"] || "unknown",

      riskScore: 0,
      riskFlags: [],
      auditVersion: 1
    });

    // 🔔 Déclenche tous les listeners existants (WhatsApp, socket, dashboard)
    notifyUpdate();

    return res.json({
      message: "Transfert effectué pour Partenaire Officiel FOBAS sans frais/bonus."
    });
  }
} catch (partnerErr) {
  console.error("❌ ERREUR TRANSFERT PARTENAIRE OFFICIEL:", partnerErr);
}




	  




	  



// 🧾 FRAIS – traçabilité utilisateur (SANS impact financier)
await Transaction.create({
  // =========================
  // CHAMPS EXISTANTS (PA TOUCHE)
  // =========================
  email: senderEmail,
  type: "fees",
  amount: amount * 0.01,
  relatedTransfer: amount,
  status: "ACTIVE",
  note: "Frais transfert 1%",
  createdAt: new Date(),

  // =========================
  // 🔐 TRACE / AUDIT / ADMIN (ACTIVE DEFAULTS)
  // =========================
  createdBy: "SYSTEM",                    // frais généré automatiquement
  feeType: "TRANSFER_FEE",                // typage clair pour audit
  feeRate: 0.01,                          // taux exact (preuve comptable)

  // --- Trace utilisateur ---
  ipAddress: req.ip || "0.0.0.0",
  deviceId: req.headers["user-agent"] || "unknown",
  geoZone: geoZone || "undefined",

  // --- Risk & conformité ---
  riskScore: 0,                           // frais normal = pas de risque
  riskFlags: [],                          // aucun flag par défaut
  kycSnapshot: senderKycLevel || 0,       // état KYC au moment exact

  // --- Audit & historique ---
  lastAction: "FEE_APPLIED",
  lastActionAt: new Date(),
  lastActionBy: "SYSTEM",
  auditVersion: 1
});



	  
    // 🧾 Historique sender ak komisyon
  await Transaction.create({
  // =========================
  // CHAMPS EXISTANTS (PA TOUCHE)
  // =========================
  email: senderEmail,
  type: "transfer",
  amount,
  senderEmail,
  receiverEmail,
  senderName: senderUser?.fullName || senderEmail,
  receiverName: receiverUser?.fullName || receiverEmail,
  status: "ACTIVE",
  agentBonus: 0.006 * amount,
  platformBonus: 0.004 * amount,
  createdAt: new Date(),

  // =========================
  // 🔐 TRACE / AUDIT / ADMIN (ACTIVE DEFAULTS)
  // =========================
  createdBy: "SYSTEM",                    // transaction générée automatiquement
  geoZone: geoZone || "undefined",        // trace zone
  deviceId: req.headers["user-agent"] || "unknown", // device trace
  ipAddress: req.ip || "0.0.0.0",         // IP trace
  kycLevel: senderKycLevel || 0,          // KYC snapshot
  riskScore: 0,                            // default = pas de risque
  riskFlags: [],                           // aucun flag par défaut
  lastAction: "TRANSFER_SENT",             // trace action sender
  lastActionAt: new Date(),                // horodatage
  lastActionBy: "SYSTEM",                  // SYSTEM par défaut
  auditVersion: 1                          // version audit initiale
});
	  
	    
	
// 🧾 Historique receiver ak komisyon
await Transaction.create({
  // =========================
  // CHAMPS EXISTANTS (PA TOUCHE)
  // =========================
  email: receiverEmail,
  type: "transfer",
  amount,
  senderEmail,
  receiverEmail,
  senderName: senderUser?.fullName || senderEmail,
  receiverName: receiverUser?.fullName || receiverEmail,
  status: "ACTIVE",
  agentBonus: 0.006 * amount,
  platformBonus: 0.004 * amount,
  createdAt: new Date(),

  // =========================
  // 🔐 TRACE / AUDIT / ADMIN (ACTIVE DEFAULTS)
  // =========================
  createdBy: "SYSTEM",                     // transaction générée automatiquement
  geoZone: geoZone || "undefined",         // trace zone
  deviceId: req.headers["user-agent"] || "unknown", // device trace
  ipAddress: req.ip || "0.0.0.0",          // IP trace
  kycLevel: receiverKycLevel || 0,         // KYC snapshot
  riskScore: 0,                             // default = pas de risque
  riskFlags: [],                            // aucun flag par défaut
  lastAction: "TRANSFER_RECEIVED",          // trace action receiver
  lastActionAt: new Date(),                 // horodatage
  lastActionBy: "SYSTEM",                   // SYSTEM par défaut
  auditVersion: 1                           // version audit initiale
});
    notifyUpdate();
    res.json({ message: "Transfert réussi" });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur transfert" });
  }
});













// 🎁 Bonus (pending)
app.post('/api/wallet/bonus', async (req, res) => {
  try {
    const email = req.headers['x-user-email'] || req.body.email;
    const { amount } = req.body;

    await Transaction.create({
      email,
      type: 'bonus',
      amount,
      status: 'PENDING',
	  createdAt: new Date()
    });

    notifyUpdate();
    res.json({ message: 'Bonus envoyé (PENDING)' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur bonus' });
  }
});





















/// ================================
// 🔐 CHANGER MOT DE PASSE UTILISATEUR
// ================================
app.post("/api/wallet/change-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    const user = await WalletUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const isMatch = await bcryptjs.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Ancien mot de passe incorrect" });
    }

    const salt = await bcryptjs.genSalt(12);
    user.passwordHash = await bcryptjs.hash(newPassword, salt);
    await user.save();

    return res.json({
      success: true,
      message: "Mot de passe changé avec succès ✅"
    });

  } catch (err) {
    console.error("WALLET CHANGE PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});


















  



































app.post("/api/admin/unlock", (req, res) => {
  console.log("ADMIN PASSWORD REÇU :", req.body.password);

  if (req.body.password == process.env.ADMIN_PASSWORD) {
    return res.json({ ok: true });
  }

  return res.json({ ok: false });
});

// ======================= ADMIN PANEL =======================

// 📋 Voir transactions pending
app.get('/api/admin/transactions', async (req, res) => {
  const tx = await Transaction.find({ status: 'PENDING' }).sort({ createdAt: -1 });
  res.json(tx);
});

// ✅ Valider transaction
app.post('/api/admin/validate', async (req, res) => {
  try {
    const { transactionId } = req.body;
    const tx = await Transaction.findById(transactionId);
    if (!tx) return res.status(404).json({ message: 'Transaction introuvable' });

    const wallet = await WalletBalance.findOne({ email: tx.email });
    if (!wallet) return res.status(404).json({ message: 'Wallet introuvable' });




	// 🔒 BLOKAJ FREEZE BALANCE
if (wallet.balanceFrozen === true && tx.type === 'deposit') {
  return res.status(403).json({
    message: "⛔ Balance gelée. Dépôt interdit."
  });
}

if (wallet.bonusBlocked === true && tx.type === 'bonus') {
  return res.status(403).json({
    message: "⛔ Bonus bloqué."
  });
}


	  

    if (tx.type === 'deposit') wallet.balance += tx.amount;
    if (tx.type === 'withdraw') wallet.balance -= (tx.amount + tx.fee);
    if (tx.type === 'bonus') wallet.bonus += tx.amount;

	  if (tx.type === 'transfer') {
  const sender = await WalletBalance.findOne({ email: tx.email });
  const receiver = await WalletBalance.findOne({ email: tx.receiverEmail });

  if (!sender || !receiver) {
    return res.status(404).json({ message: "Wallet introuvable" });
  }

  if (sender.balanceFrozen === true) {
    return res.status(403).json({ message: "Compte expéditeur toujours gelé" });
  }

  // Calcul frais 1% total
  const fraisTotal = tx.amount * 0.01;
  const agentShare = tx.amount * 0.006;
  const platformShare = tx.amount * 0.004;

  if (sender.balance < tx.amount + fraisTotal) {
    return res.status(400).json({ message: "Solde insuffisant pour valider le transfert avec frais" });
  }

  // 💸 Retire total sou sender
  sender.balance -= (tx.amount + fraisTotal);

  // Ajoute montan sou receiver
  receiver.balance += tx.amount;

  // ✅ Distribisyon komisyon si receiver se Agent
  if (receiver.walletAccountType === "Agent Autorise") {
    receiver.bonus += agentShare;

    const adminWallet = await WalletBalance.findOne({ email: "memeselvandieu@fobas.com" });
    if (adminWallet) {
      adminWallet.balance += platformShare;
      await adminWallet.save();
    }
  }

  await sender.save();
  await receiver.save();
}






	  
    tx.status = 'ACTIVE';
    await wallet.save();
    await tx.save();

    notifyUpdate();
    res.json({ message: 'Transaction validée' });
  } catch (e) {
    res.status(500).json({ message: 'Erreur validation' });
  }
});






// ===================== SURVEILLANCE AGENT - WALLET FOBAS =====================

// 🔎 Récupérer agents autorisés impliqués dans des transferts
app.get("/api/admin/surveillance-agents", async (req, res) => {
  try {
    // 1. Trouver tous les emails impliqués dans des transferts
    const transfers = await Transaction.find({
      type: "transfer",
      status: "ACTIVE"
    }).select("email receiverEmail");

    const emails = new Set();

    transfers.forEach(tx => {
      if (tx.email) emails.add(tx.email);
      if (tx.receiverEmail) emails.add(tx.receiverEmail);
    });

    // 2. Charger uniquement les Agents Autorisés concernés
   const agents = await WalletBalance.find({
  email: { $in: Array.from(emails) },
  walletAccountType: {
    $in: [
      "Agent Autorise",
      "Representant FOBAS",
      "Partenaire Officiel FOBAS",
	  "Utilisateur",
	  "Agent Terrain"
    ]
  }
})
.select(`
  email
  fullName
  walletAccountType
  balance
  bonus
  accountStatus
  balanceFrozen
  bonusBlocked
  lastAction
  createdBy
  registrationChannel
  geoZone
  riskScore
  riskFlags
  lastActionAt
  lastActionBy
  adminIp
  deviceId
  createdFromDevice
  kycLevel
  auditVersion
  updatedAt
`)
.sort({ updatedAt: -1 })
.lean(); // lean() pou optimize read-only si ou pa modifye agent yo dirèkteman


// ➕ AJOUT SAFE — label rôle pour surveillance admin (LECTURE SEULEMENT)
agents.forEach(agent => {
  agent.roleLabel = agent.walletAccountType; // 🟢 PURE INFO ADMIN
});
	  
	  
// ➕ Pou chak agent, nou asire chan default pa null (active monitoring)
agents.forEach(agent => {
  agent.lastActionAt = agent.lastActionAt || new Date();
  agent.lastActionBy = agent.lastActionBy || "SYSTEM";
  agent.adminIp = agent.adminIp || "0.0.0.0";
  agent.deviceId = agent.deviceId || "unknown";
  agent.createdFromDevice = agent.createdFromDevice || "unknown";
  agent.kycLevel = agent.kycLevel || 0;
  agent.auditVersion = agent.auditVersion || 1;
  agent.riskScore = agent.riskScore || 0;
  agent.riskFlags = agent.riskFlags || [];
});

    res.json(agents);
  } catch (err) {
    console.error("❌ Surveillance agents error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ----------------------- ACTION ADMIN SUR AGENT -----------------------
app.post("/api/admin/agent-action", async (req, res) => {
  try {
    const { email, action } = req.body; // ⬅️ OBLIGATWA

	if (!action) {
  return res.status(400).json({ message: "Action manquante" });
}
	  

    const agent = await WalletBalance.findOne({
      email,
      walletAccountType: {
        $in: [
          "Agent Autorise",
          "Representant FOBAS",
          "Partenaire Officiel FOBAS",
		  "Utilisateur",
	      "Agent Terrain"
        ]
      }
    });

    if (!agent) {
      return res.status(404).json({ message: "Agent introuvable" });
    }




	  
// ===================================================
// 🔐 CONTROLE ROLE SENSIBLE (SAFE – AJOUT SEULEMENT)
// ===================================================
if (
  ["Representant FOBAS", "Partenaire Officiel FOBAS"].includes(agent.walletAccountType)
) {
  const forbiddenActions = [
    "BLOCK_BONUS",
    "UNBLOCK_BONUS"
  ];

  if (forbiddenActions.includes(action)) {
    return res.status(403).json({
      message: "Action non autorisée pour ce type de compte"
    });
  }
}




	  

    // ========================
    // ✅ SWITCH EXISTANT (NE RIEN TOUCHER)
    // ========================
    switch (action) {
      case "BLOCK_ACCOUNT":
        agent.accountStatus = "BLOQUE";
        break;
      case "UNBLOCK_ACCOUNT":
        agent.accountStatus = "ACTIF";
        break;
      case "FREEZE_BALANCE":
        agent.balanceFrozen = true;
        break;
      case "UNFREEZE_BALANCE":
        agent.balanceFrozen = false;
        break;
      case "BLOCK_BONUS":
        agent.bonusBlocked = true;
        break;
      case "UNBLOCK_BONUS":
        agent.bonusBlocked = false;
        break;
      default:
        return res.status(400).json({ message: "Action invalide" });
    }

    // ========================
    // ➕ AJOUT CHAMPS AUDIT / SURVEILLANCE (SAFE)
    // ========================
    agent.lastAction = action;                   // deja la, pa touche
agent.lastActionAt = new Date();             // nouvo, horodatage
agent.lastActionBy = "ADMIN";                // nouvo, admin qui a fait action
agent.adminIp = req.ip || "0.0.0.0";        // nouvo, IP admin

// ➕ Asire tout chan trace / audit / risk default pa null (ACTIVE)
agent.deviceId = agent.deviceId || "unknown";
agent.createdFromDevice = agent.createdFromDevice || "unknown";
agent.geoZone = agent.geoZone || "undefined";
agent.kycLevel = agent.kycLevel || 0;
agent.riskScore = agent.riskScore || 0;
agent.riskFlags = agent.riskFlags || [];
agent.auditVersion = agent.auditVersion || 1;
agent.createdBy = agent.createdBy || "ADMIN";
agent.registrationChannel = agent.registrationChannel || "app";

    await agent.save();

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Agent action error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});







// =======================
// 🔐 ADMIN CREDIT WALLET (SAFE)
// =======================
app.post("/api/admin/wallet-credit", async (req, res) => {
  try {
    const { email, amount, target } = req.body; 
    // target = "balance" | "bonus"

    if (!email || !amount || amount <= 0) {
      return res.status(400).json({ message: "Paramètres invalides" });
    }

    const wallet = await WalletBalance.findOne({ email });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet introuvable" });
    }

    // 🔒 Sécurité minimale
    if (wallet.accountStatus !== "ACTIF") {
      return res.status(403).json({ message: "Compte non actif" });
    }

    // =======================
    // ➕ CREDIT ADMIN
    // =======================
    if (target === "bonus") {
      wallet.bonus += Number(amount);
    } else {
      wallet.balance += Number(amount);
    }

    // =======================
    // 🔐 AUDIT
    // =======================
    wallet.lastAction = "ADMIN_CREDIT";
    wallet.lastActionAt = new Date();
    wallet.lastActionBy = "ADMIN";
    wallet.adminIp = req.ip || "0.0.0.0";
    wallet.auditVersion = wallet.auditVersion || 1;

    await wallet.save();

    // =======================
    // 🧾 TRACE TRANSACTION
    // =======================
    await Transaction.create({
      email: wallet.email,
      type: "admin_credit",
      amount: Number(amount),
      status: "ACTIVE",
      note: `Crédit admin vers ${target}`,
      createdAt: new Date(),

      createdBy: "ADMIN",
      target,
      geoZone: wallet.geoZone || "undefined",
      ipAddress: req.ip || "0.0.0.0",
      deviceId: req.headers["user-agent"] || "ADMIN_PANEL",

      riskScore: 0,
      riskFlags: [],
      auditVersion: 1
    });

    notifyUpdate(); // 🔔 temps réel + WhatsApp admin

    res.json({
      success: true,
      newBalance: wallet.balance,
      newBonus: wallet.bonus
    });
  } catch (err) {
    console.error("❌ ADMIN CREDIT ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});








// =======================
// 🔐 ADMIN RETRAIT WALLET
// =======================
app.post("/api/admin/wallet-withdraw", async (req, res) => {
  try {
    const { email, amount, target } = req.body;

    if (!email || !amount || amount <= 0) {
      return res.status(400).json({ message: "Paramètres invalides" });
    }

    const wallet = await WalletBalance.findOne({ email });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet introuvable" });
    }

    if (wallet.accountStatus !== "ACTIF") {
      return res.status(403).json({ message: "Compte non actif" });
    }

    // 🔒 Vérification fonds
    if (target === "bonus") {
      if (wallet.bonus < amount) {
        return res.status(400).json({ message: "Bonus insuffisant" });
      }
      wallet.bonus -= amount;
    } else {
      if (wallet.balance < amount) {
        return res.status(400).json({ message: "Balance insuffisante" });
      }
      wallet.balance -= amount;
    }

    // 🔐 AUDIT
    wallet.lastAction = "ADMIN_RETRAIT";
    wallet.lastActionAt = new Date();
    wallet.lastActionBy = "ADMIN";
    wallet.adminIp = req.ip || "0.0.0.0";

    await wallet.save();

    // 🧾 TRACE TRANSACTION
    await Transaction.create({
      email: wallet.email,
      type: "admin_withdraw",
      amount: Number(amount),
      status: "ACTIVE",
      note: `Retrait admin depuis ${target}`,
      createdAt: new Date(),
      createdBy: "ADMIN",
      target,
      ipAddress: req.ip || "0.0.0.0",
      auditVersion: 1
    });

    notifyUpdate(); // 🔔 temps réel

    res.json({ message: "Retrait effectué avec succès" });

  } catch (err) {
    console.error("❌ ADMIN RETRAIT ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});





// =======================
// 📝 ADMIN NOTE UTILISATEUR (SAFE)
// =======================
app.post("/api/admin/note", async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !message || message.trim().length < 2) {
      return res.status(400).json({ message: "Message invalide" });
    }

    const wallet = await WalletBalance.findOne({ email });
    if (!wallet) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // 🧾 TRACE SOUS FORME DE TRANSACTION
    await Transaction.create({
      email,
      type: "admin_note",
      amount: 0,
      status: "ACTIVE",
      note: message,
      createdAt: new Date(),

      createdBy: "ADMIN",
      adminIp: req.ip || "0.0.0.0",

      riskScore: 0,
      riskFlags: [],
      auditVersion: 1
    });

    notifyUpdate(); // 🔔 temps réel

    res.json({ success: true, message: "Note envoyée avec succès" });

  } catch (err) {
    console.error("❌ ADMIN NOTE ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});





















// ----------------------- ROUTE API POU ENREGISTRE -----------------------
app.post("/api/wallet/create", async (req, res) => {
  try {
    const {
      walletFullName,
      walletEmail,
      walletRecoveryEmail,
      walletWhatsApp,
      walletBirthDate,
      walletBirthPlace,
      walletPassword,
      walletSponsorName,
      walletSponsorEmail,
      walletAccountType 
    } = req.body;

    if (!walletFullName || !walletEmail || !walletPassword) {
      return res.status(400).json({ success: false, message: "Tout chan obligatwa." });
    }

    // 🔐 BLOKAJ EMAIL DOUBLON (AJOUT SANS MODIFICATION)
    const emailExist = await WalletUser.findOne({
      email: walletEmail.toLowerCase()
    });

    if (emailExist) {
      return res.status(409).json({
        success: false,
        message: "⛔ Email sa deja anrejistre sou FOBAS."
      });
    }

    // --- Hash password ---
    const bcrypt = require("bcryptjs");
    const passwordHash = await bcrypt.hash(walletPassword, 12);

    // --- Kapt IP moun nan (trust proxy si dèyè proxy) ---
    let userIp = req.ip || req.headers['x-forwarded-for'] || "0.0.0.0";
    if (Array.isArray(userIp)) userIp = userIp[0];
    
    // --- Kreye agentId otomatik pou Agent Autorise sèlman ---
    let agentId = null;
    if (walletAccountType === "Agent Autorise") {
      agentId = "AGT-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    }

    // --- Kreye nouvo itilizatè ---
    const newWalletUser = new WalletUser({
      fullName: walletFullName,
      email: walletEmail,
      recoveryEmail: walletRecoveryEmail,
      whatsapp: walletWhatsApp,
      birthDate: walletBirthDate,
      birthPlace: walletBirthPlace,
      passwordHash,
      sponsorName: walletSponsorName ? walletSponsorName.trim().toLowerCase() : null,
      sponsorEmail: walletSponsorEmail ? walletSponsorEmail.trim().toLowerCase() : null,
      accountType: walletAccountType,
      status: "active",
      balance: 0.00,
      bonus: 0.00,
      hasDepositedBefore: false,
      agentId: agentId,           // ✅ Ajoute agentId otomatik
      ipAddress: userIp,          // ✅ Capture IP vrè moun nan
      createdAt: new Date()
    });

    await newWalletUser.save(); // <-- Sa a ap kreye dokiman nan MongoDB

    // --- Prepare lyen WhatsApp pou admin (one-click send) ---
    const adminNumber = "+50946057952";
    const waMessage = `🟢 Nouvo Demande Compte WALLET FOBAS\n\n👤 Non: ${walletFullName}\n📧 Email: ${walletEmail}\n📱 Tel: ${walletWhatsApp}\n🌍 Email sekou: ${walletRecoveryEmail}\n🏙️ Lye Nésans: ${walletBirthPlace}\n📅 Dat Nésans: ${walletBirthDate}\n🧑‍🤝‍🧑 Parrain: ${walletSponsorName || 'Pa gen'}\n💳 Agent ID: ${agentId || 'Pa aplikab'}\n🌐 IP: ${userIp}`;

    const waLink = `https://wa.me/${adminNumber.replace(/\+/g,'')}?text=${encodeURIComponent(waMessage)}`;

    // --- Retounen repons ak lyen WhatsApp ---
    return res.json({
      success: true,
      message: "Demande FOBAS anrejistre avèk siksè!",
      whatsappLink: waLink
    });

  } catch (err) {
    console.error("Erreur API:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});
























// ----------------------- ROUTE API POU LOGIN -----------------------
app.post("/api/wallet/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Tout chan obligatwa."
      });
    }

    const user = await WalletUser.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Itilizate pa egziste."
      });
    }

    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Mot de pase pa kòrèk."
      });
    }

    // Retounen enfòmasyon itilizate + token (si w itilize JWT)
    return res.json({
      success: true,
      message: "Connexion reyalize avèk siksè!",
      data: {
        fullName: user.fullName,
        email: user.email,
        status: user.status,
        solde: user.solde || 0,
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    console.error("Erreur login:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});






// 🚀 DEMARRE SERVEUR
// ---------------------------
const PORT = process.env.PORT || 4000;
server.listen(PORT, ()=> console.log(`🚀 Server running on port ${PORT}`));
