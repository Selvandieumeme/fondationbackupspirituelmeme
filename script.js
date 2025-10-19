// =======================
// ✅ script.js FINAL AK SIPÒ CHAT PRIVE
// =======================

// 1️⃣ — Rekipere non itilizatè a depi nan localStorage
let user = localStorage.getItem('user');

// 2️⃣ — Konekte ak Socket.io
const socket = io('https://examen-backend-ihlx.onrender.com');
window.socket = socket; // 🔹 fè koneksyon an disponib pou chatprive.js

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
const userList = document.getElementById('userList'); // lis itilizatè online yo

// 5️⃣ — Fonksyon pou ajoute mesaj nan chat piblik
function addMessage(data, isMe = false) {
  if (!data || !data.message) return;
  const li = document.createElement('li');
  const msgUser = data.user || 'Anonyme';
  const message = data.message || '';
  const dateObj = new Date(data.date || Date.now());
  const time = dateObj.toLocaleTimeString();
  li.textContent = `${msgUser} [${time}]: ${message}`;
  if (isMe) li.classList.add('me');
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}

// ✅ ✅ ✅ NOUVO — Fonksyon pou ouvri chat prive
function openPrivateChat(targetUser) {
  if (!targetUser || targetUser === user) return;
  console.log('🔐 Ou vle pale an prive ak:', targetUser);

  // Sa ka swa:
  // → Lanse yon nouvo fenèt chat prive
  // → Oswa montre yon div chat prive deja kache
  // → Oswa redireksyone sou chatprive.html
  window.location.href = `chatprive.html?user=${user}&to=${targetUser}`;
}

// 6️⃣ — Fonksyon pou afiche itilizatè yo nan ti kadran
function renderUsers(arr) {
  if (!Array.isArray(arr)) return;
  userList.innerHTML = '';

  arr.forEach(u => {
    const li = document.createElement('li');
    li.textContent = u.name || u;

    // ✅ Ajoute click event pou chat prive
    li.addEventListener('click', () => {
      openPrivateChat(u.name || u);
    });

    userList.appendChild(li);
  });
}

// 7️⃣ — Voye mesaj piblik
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

// 8️⃣ — Resevwa mesaj piblik
socket.on('chatMessage', (data) => {
  if (data.user === user) return;
  addMessage(data);
});

// 9️⃣ — Chaje ansyen mesaj
socket.on('loadMessages', (messagesArray) => {
  if (!Array.isArray(messagesArray)) return;
  messagesArray.forEach(msg => {
    const isMe = msg.user === user;
    addMessage(msg, isMe);
  });
});

// 🔟 — 📡 Resevwa lis itilizatè online
socket.on('online-users', (arr) => {
  renderUsers(arr);
});

socket.on('userConnected', (username) => {
  console.log('🟢 Itilizatè konekte:', username);
});

socket.on('userDisconnected', (username) => {
  console.log('🔴 Itilizatè dekonekte:', username);
});
