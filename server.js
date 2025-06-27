// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const socketio = require('socket.io');
const path = require('path');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const Message = require('./models/Message');

// Konekte ak MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB konekte avèk siksè"))
  .catch(err => console.error("❌ Erè koneksyon MongoDB:", err));

// Kreye app Express ak server HTTP
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Konfigirasyon sesyon
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'backup-fobas-sekre',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 jou
});

app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Sove itilizatè konekte yo
const onlineUsers = {};

// Login route (si ou vle enskri otomatik si pa egziste)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  let user = await User.findOne({ username });
  if (!user) {
    const hash = await bcrypt.hash(password, 10);
    user = await User.create({ username, password: hash });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (valid) {
    req.session.username = username;
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

// API pou verifye koneksyon
app.get('/', (req, res) => {
  res.send("✅ Sèvè a ap mache kòrèkteman sou Render!");
});

// API pou chaje mesaj pou yon itilizatè
app.get('/messages/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const messages = await Message.find({
      $or: [{ from: userId }, { to: userId }]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Erè pandan chajman mesaj yo.' });
  }
});

// Socket.IO koneksyon
io.on('connection', socket => {
  const session = socket.request.session;
  const username = session?.username || 'anonim';

  onlineUsers[username] = socket.id;
  io.emit('users', Object.keys(onlineUsers));

  socket.on('private message', async ({ to, message }) => {
    await Message.create({ from: username, to, message });

    if (onlineUsers[to]) {
      io.to(onlineUsers[to]).emit('private message', { from: username, message });
    }
  });

  socket.on('disconnect', () => {
    delete onlineUsers[username];
    io.emit('users', Object.keys(onlineUsers));
    console.log(`🔴 ${username} dekonekte`);
  });
});

// Lanse server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Sèvè a ap koute sou http://localhost:${PORT}`);
});
