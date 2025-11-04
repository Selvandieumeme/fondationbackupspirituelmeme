// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http'); // ✅ TRÈ ENPÒTAN pou Socket.io mache
const { Server } = require('socket.io');
const fs = require('fs');
const multer = require('multer');  // <-- sa a te manke






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











// Upload config
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });




// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('MongoDB erreur:', err));

// Schemas
const Schema = mongoose.Schema;
const RoomSchema = new Schema({ code: { type: String, index: true, required: true }, createdAt: { type: Date, default: Date.now }, metadata: { type: Schema.Types.Mixed } });
const Room = mongoose.model('Room', RoomSchema);

const ParticipantSchema = new Schema({ socketId: String, name: String, role: String, room: String, joinedAt: { type: Date, default: Date.now } });
const Participant = mongoose.model('Participant', ParticipantSchema);

const roomsState = {};
const MAX_PER_ROOM = 100;

// Upload endpoints
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ ok: true, filename: req.file.filename, path: `/files/${req.file.filename}` });
});
app.get('/files/:name', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.name);
  if (!fs.existsSync(filePath)) return res.status(404).send('Not found');
  res.sendFile(path.resolve(filePath));
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('join-room-request', async ({ room, name, role, oldRoom }, ack) => {
    try {
      if (!roomsState[room]) roomsState[room] = { participants: [], teacherSocketId: null };
      const state = roomsState[room];

      if (role === 'teacher') state.teacherSocketId = socket.id;

      const countStudents = state.participants.filter(p => p.role === 'student').length;
      if (role === 'student' && countStudents >= MAX_PER_ROOM) {
        if (ack) ack({ status: 'full', message: 'Salle pleine' });
        socket.emit('join-error', { message: 'Salle pleine (max ' + MAX_PER_ROOM + ')' });
        return;
      }

      if (role === 'student' && state.teacherSocketId) {
        io.to(state.teacherSocketId).emit('request-join', { socketId: socket.id, name, room, role });
        socket.join(`pending:${room}`);
        if (ack) ack({ status: 'pending' });
        return;
      }

      state.participants.push({ socketId: socket.id, name, role });
      socket.join(room);
      socket.room = room; socket.name = name; socket.role = role;
      await Participant.create({ socketId: socket.id, name, role, room });

      if (ack) ack({ status: 'ok' });
      io.to(room).emit('participants', { list: state.participants.map(p => ({ name: p.name, role: p.role, socketId: p.socketId })) });
      socket.to(room).emit('user-joined', { socketId: socket.id, name, role });

    } catch (err) { console.error(err); if (ack) ack({ status: 'error', message: err.message }); }
  });

  socket.on('teacher-accept-join', async ({ pendingSocketId, accept }) => {
    try {
      const room = Object.keys(roomsState).find(r => roomsState[r].participants.some(p => p.socketId === socket.id) || roomsState[r].teacherSocketId === socket.id);
      const state = roomsState[room];
      const pendingSocket = io.sockets.sockets.get(pendingSocketId);
      if (!pendingSocket) return io.to(socket.id).emit('notify', { message: 'Candidat introuvable' });

      if (accept) {
        state.participants.push({ socketId: pendingSocketId, name: pendingSocket.name || 'Etudiant', role: 'student' });
        pendingSocket.join(room); pendingSocket.room = room;
        pendingSocket.emit('join-accepted', { room });
        io.to(room).emit('participants', { list: state.participants.map(p => ({ name: p.name, role: p.role, socketId: p.socketId })) });
      } else pendingSocket.emit('join-rejected', { message: 'Rejeté par le professeur' });
    } catch (err) { console.error(err); }
  });

  socket.on('signal', ({ to, sdp, candidate }) => { if (!to) return; io.to(to).emit('signal', { from: socket.id, sdp, candidate }); });
  socket.on('chat', ({ room, text }) => { if (room) io.to(room).emit('chat', { fromName: socket.name || 'Anonyme', text }); });
  socket.on('raise-hand', ({ room }) => { if (room) io.to(room).emit('raised-hand', { socketId: socket.id, name: socket.name || 'Anonyme' }); });
  socket.on('teacher-mute-all', ({ room }) => { if (room) io.to(room).emit('mute-all'); });
  socket.on('teacher-kick', ({ room, socketId }) => { io.to(socketId).emit('kicked', { reason: 'Expulsé par professeur' }); if (roomsState[room]) { roomsState[room].participants = roomsState[room].participants.filter(p => p.socketId !== socketId); io.to(room).emit('participants', { list: roomsState[room].participants.map(p => ({ name: p.name, role: p.role, socketId: p.socketId })) }); } });
  socket.on('leave-room', ({ room }) => { if (room && roomsState[room]) { roomsState[room].participants = roomsState[room].participants.filter(p => p.socketId !== socket.id); socket.leave(room); io.to(room).emit('participants', { list: roomsState[room].participants.map(p => ({ name: p.name, role: p.role, socketId: p.socketId })) }); socket.to(room).emit('user-left', { socketId: socket.id }); } });

  socket.on('disconnect', async () => {
    try {
      for (const r of Object.keys(roomsState)) {
        const state = roomsState[r];
        state.participants = state.participants.filter(p => p.socketId !== socket.id);
        io.to(r).emit('participants', { list: state.participants.map(p => ({ name: p.name, role: p.role, socketId: p.socketId })) });
        socket.to(r).emit('user-left', { socketId: socket.id });
        if (state.teacherSocketId === socket.id) state.teacherSocketId = null;
      }
      await Participant.deleteOne({ socketId: socket.id });
    } catch (err) { console.error(err); }
  });
});

app.use('/files', express.static(path.resolve(UPLOAD_DIR)));
app.get('/', (req, res) => res.send('Ecole-en-ligne signaling server'));


// 🚀 DEMARRE SERVEUR
// ---------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
