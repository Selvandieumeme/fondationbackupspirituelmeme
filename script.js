// =======================
// ✅ script.js FINAL AK SIPÒ CHAT PRIVE (ADAPTE AK NOUVO PANEL)
// =======================

// 1️⃣ — Rekipere id itilizatè a (swa soti nan socketUser oswa prompt)
let user = window.socketUser || prompt("Antre non w:") || 'Anonyme';

// 2️⃣ — Koneksyon ak Socket.io pou chat piblik
const socket = io('https://fondationbackupspirituel.com');
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

  // 🔹 REFRESH ONLINE USERS chak fwa yo voye mesaj
  socket.emit('requestUserList');

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

// 9️⃣ — ✅ FONKSYON AJISTE: Afiche lis itilizatè ak userId ak display kòrèk
function renderUsers(arr) {
  if (!Array.isArray(arr)) return;
  userList.innerHTML = '';

  arr.forEach(u => {
    const li = document.createElement('li');

    // 🔹 Mete userId ak display nan dataset
    li.dataset.userId = u.userId || u.display || u;  
    li.dataset.display = u.display || u.userId || u;  

    // 🔹 Dot online/offline
    const dot = document.createElement('span');
    dot.classList.add('status-dot', u.status === 'online' ? 'online' : 'offline');
    li.appendChild(dot);

    // 🔹 Affiche display name
    li.appendChild(document.createTextNode(u.display || u.userId || u));

    // 🔹 Lanse chat prive lè yo klike sou yon non
    li.addEventListener('click', () => {
      if ((u.userId || u.display) === user) return;
      const privateUrl = `Chatprive.html?from=${encodeURIComponent(user)}&to=${encodeURIComponent(u.userId || u.display)}`;
      window.location.href = privateUrl;
    });

    userList.appendChild(li);
  });

  // 🔹 Scroll bar si plis pase 5 itilizatè
  userList.style.overflowY = arr.length > 5 ? 'auto' : 'hidden';
}

// 10️⃣ — ONLINE USERS EVENTS
socket.on('online-users', renderUsers);
socket.on('userConnected', (u) => {
  console.log('🟢 Itilizatè konekte:', u.display || u.userId || u);
  socket.emit('requestUserList');
});
socket.on('userDisconnected', (u) => {
  console.log('🔴 Itilizatè dekonekte:', u.display || u.userId || u);
  socket.emit('requestUserList');
});
