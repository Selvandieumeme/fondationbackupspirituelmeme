// =======================
// ✅ script.js FINAL AK SIPÒ CHAT PRIVE
// =======================

// 1️⃣ — Rekipere non itilizatè a depi nan socket (pa gen localStorage)
let user = window.socketUser || prompt("Antre non w:") || 'Anonyme';

// 2️⃣ — Koneksyon ak Socket.io pou chat piblik
const socket = io('https://examen-backend-ihlx.onrender.com');
window.socket = socket; // fè koneksyon an disponib pou chat prive

// 3️⃣ — Lè paj la chaje
window.addEventListener('load', () => {
  if (socket && socket.connected) {
    socket.emit('setUser', user);
  } else {
    socket.on('connect', () => socket.emit('setUser', user));
  }
});

// 4️⃣ — Eleman HTML prensipal chat piblik
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

// 6️⃣ — Voye mesaj piblik
function sendMessage() {
  const message = msgInput.value.trim();
  if (!message) return;

  const data = { user, message, date: new Date() };
  socket.emit('chatMessage', data);
  addMessage(data, true);
  msgInput.value = '';
}
sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

// 7️⃣ — Resevwa mesaj piblik
socket.on('chatMessage', (data) => {
  if (data.user === user) return;
  addMessage(data);
});

// 8️⃣ — Chaje ansyen mesaj piblik
socket.on('loadMessages', (messagesArray) => {
  if (!Array.isArray(messagesArray)) return;
  messagesArray.forEach(msg => {
    const isMe = msg.user === user;
    addMessage(msg, isMe);
  });
});

// 9️⃣ — 📡 Resevwa lis itilizatè online
function renderUsers(arr) {
  if (!Array.isArray(arr)) return;
  userList.innerHTML = '';
  arr.forEach(u => {
    const li = document.createElement('li');
    li.textContent = u.name || u.user || u;
    // ✅ Ouvri chat prive lè itilizatè klike sou li
    li.addEventListener('click', () => {
      // Ouvri chat prive nan Chatprive.html
      const currentUser = user;
      const targetUser = u.name || u.user || u;
      if (targetUser === currentUser) return;
      window.location.href = `Chatprive.html?from=${encodeURIComponent(currentUser)}&to=${encodeURIComponent(targetUser)}`;
    });
    userList.appendChild(li);
  });
}

socket.on('online-users', (arr) => { renderUsers(arr); });
socket.on('userConnected', (user) => { console.log('🟢 Itilizatè konekte:', user); });
socket.on('userDisconnected', (user) => { console.log('🔴 Itilizatè dekonekte:', user); });
