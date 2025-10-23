// =======================
// ✅ script.js FINAL AK SIPÒ CHAT PRIVE (KORIJÉ SAN KRAZE ANYEN)
// =======================

// 1️⃣ — Rekipere non itilizatè a (swa soti nan socketUser oswa prompt)
let user = window.socketUser || prompt("Antre non w:") || 'Anonyme';

// 2️⃣ — Koneksyon ak Socket.io pou chat piblik
const socket = io('https://examen-backend-ihlx.onrender.com');
window.socket = socket; // pou chat prive kapab itilize li

// 3️⃣ — Lè paj la chaje, voye id itilizatè a nan backend la
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
  const time = new Date(data.date || Date.now()).toLocaleTimeString();
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
    addMessage(msg, msg.user === user);
  });
});

// 9️⃣ — ✅ FONKSYON KORIJÉ: Afiche lis itilizatè san `undefined`
function renderUsers(arr) {
  if (!Array.isArray(arr)) return;
  userList.innerHTML = '';

  arr.forEach(u => {
    const li = document.createElement('li');
    const targetUser = u; // 🔹 paske backend ou voye userId sèlman
    li.textContent = targetUser;

    // ✅ Ouvri chat prive lè yo klike sou non
    li.addEventListener('click', () => {
      if (targetUser === user) return;
      window.location.href = `Chatprive.html?from=${encodeURIComponent(user)}&to=${encodeURIComponent(targetUser)}`;
    });

    userList.appendChild(li);
  });
}

socket.on('online-users', renderUsers);
socket.on('userConnected', (u) => console.log('🟢 Itilizatè konekte:', u));
socket.on('userDisconnected', (u) => console.log('🔴 Itilizatè dekonekte:', u));
