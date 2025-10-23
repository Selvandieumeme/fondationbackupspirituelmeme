// =======================
// ✅ script.js FINAL SAN REDIREKSYON — CHAT PRIVE SOU MENM PAJ
// =======================

// 1️⃣ — Rekipere non itilizatè a depi nan localStorage
let user = localStorage.getItem('user');

// 2️⃣ — Konekte ak Socket.io
const socket = io('https://examen-backend-ihlx.onrender.com');
window.socket = socket; // Pou Chatprive.js kapab itilize li

// 3️⃣ — Lè paj la chaje
window.addEventListener('load', () => {
  if (!user) {
    document.getElementById('loginOverlay').style.display = 'flex';
  } else {
    document.getElementById('loginOverlay').style.display = 'none';
    if (socket && socket.connected) {
      socket.emit('setUser', user);
    } else {
      socket.on('connect', () => socket.emit('setUser', user));
    }
  }
});

// 4️⃣ — Eleman HTML prensipal yo
const sendBtn = document.getElementById('send');
const msgInput = document.getElementById('msg');
const messages = document.getElementById('messages');
const userList = document.getElementById('userList');

// ✅ Ajoute referans pou chat prive si li egziste nan HTML
const privateBox = document.getElementById('privateChat'); // <div id="privateChat" style="display:none;">
const privateMessages = document.getElementById('privateMessages');
const privateInput = document.getElementById('privateMsg');
const privateSendBtn = document.getElementById('sendPrivate');

// 5️⃣ — Fonksyon pou ajoute mesaj piblik
function addMessage(data, isMe = false) {
  if (!data || !data.message) return;
  const li = document.createElement('li');
  const msgUser = data.user || 'Anonyme';
  const message = data.message || '';
  const time = new Date(data.date || Date.now()).toLocaleTimeString();
  li.textContent = `${msgUser} [${time}]: ${message}`;
  if (isMe) li.classList.add('me');
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}

// ✅ ✅ ✅ NOUVO — Fonksyon pou ouvri chat prive sou menm paj la
function openPrivateChat(targetUser) {
  if (!targetUser || targetUser === user) return;
  console.log('🔐 Ou ouvri chat prive ak:', targetUser);

  // ✅ Kache chat piblik la
  document.getElementById('publicChat').style.display = 'none';

  // ✅ Montre div chat prive a
  privateBox.style.display = 'block';

  // ✅ Mete tit chat prive a
  document.getElementById('privateChatTitle').textContent =
    `Chat Prive ak ${targetUser}`;

  // ✅ Di Chatprive.js ki moun n ap pale avè l
  if (window.openPrivateSession) {
    window.openPrivateSession(user, targetUser);
  }
}

// 6️⃣ — Afiche lis itilizatè yo
function renderUsers(arr) {
  if (!Array.isArray(arr)) return;
  userList.innerHTML = '';

  arr.forEach(u => {
    const li = document.createElement('li');
    const userId = u.user || u; // 🔹 Ranplase name/username ak user
    li.textContent = userId;

    // ✅ Ajoute klik pou ouvri chat prive
    li.addEventListener('click', () => {
      openPrivateChat(userId);
    });

    userList.appendChild(li);
  });
}

// 7️⃣ — Voye mesaj Piblik
function sendMessage() {
  const message = msgInput.value.trim();
  if (!message) return;

  if (socket && socket.connected) {
    socket.emit('setUser', user);
  }

  const data = { user, message, date: new Date() };
  socket.emit('chatMessage', data);
  addMessage(data, true);
  msgInput.value = '';
}

sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// 8️⃣ — Resevwa mesaj Piblik
socket.on('chatMessage', (data) => {
  if (data.user === user) return;
  addMessage(data);
});

// 9️⃣ — Chaje ansyen mesaj Piblik
socket.on('loadMessages', (messagesArray) => {
  if (!Array.isArray(messagesArray)) return;
  messagesArray.forEach(msg => {
    addMessage(msg, msg.user === user);
  });
});

// 🔟 — Resevwa lis itilizatè online
socket.on('online-users', (arr) => {
  renderUsers(arr);
});

socket.on('userConnected', (userId) => {
  console.log('🟢 Itilizatè konekte:', userId);
});

socket.on('userDisconnected', (userId) => {
  console.log('🔴 Itilizatè dekonekte:', userId);
});
