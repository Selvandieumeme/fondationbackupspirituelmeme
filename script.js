// =======================
// ✅ script.js FINAL AK SIPÒ CHAT PRIVE (san localStorage)
// =======================

// 1️⃣ — Pa itilize localStorage; nou pran non itilizatè a depi <input id="user">
const userInputEl = document.getElementById('user');

// 2️⃣ — Konekte ak Socket.io (reutilize socket global si li deja te kreye)
const socket = window.__fbsp_shared_socket || io('https://examen-backend-ihlx.onrender.com');
window.__fbsp_shared_socket = socket;

// 3️⃣ — Fonksyon pou jwenn non aktyèl itilizatè (san default persistan)
function getCurrentUser() {
  return (userInputEl?.value || '').trim() || 'Anonyme';
}

// 4️⃣ — Si gen valè deja nan #user lè paj la chaje, mete li sou server
window.addEventListener('load', () => {
  const current = getCurrentUser();
  if (current && current !== 'Anonyme') {
    if (socket && socket.connected) {
      socket.emit('setUser', current);
    } else {
      socket.on('connect', () => socket.emit('setUser', current));
    }
  }
});

// 5️⃣ — Si itilizatè modifye input non li, mete sa sou server (imedyatman)
if (userInputEl) {
  userInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const user = getCurrentUser();
      if (user) socket.emit('setUser', user);
    }
  });
  userInputEl.addEventListener('blur', () => {
    const user = getCurrentUser();
    if (user) socket.emit('setUser', user);
  });
}

// 6️⃣ — Eleman prensipal chat piblik
const sendBtn = document.getElementById('send');
const msgInput = document.getElementById('msg');
const messages = document.getElementById('messages');
const userList = document.getElementById('userList');

// 7️⃣ — Fonksyon pou ajoute mesaj nan chat piblik
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

// 8️⃣ — Fonksyon pou enregistre itilizatè anvan voye mesaj piblik
function registerUserIfNeeded() {
  const user = getCurrentUser();
  if (!user) return 'Anonyme';
  socket.emit('setUser', user);
  return user;
}

// 9️⃣ — Voye mesaj piblik
function sendMessage() {
  const currentUser = registerUserIfNeeded();
  const message = msgInput.value.trim();
  if (!message) return;

  const data = { user: currentUser, message, date: new Date() };
  socket.emit('chatMessage', data);
  addMessage(data, true);
  msgInput.value = '';
}

sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

// 🔟 — Resevwa mesaj piblik
socket.on('chatMessage', (data) => {
  const current = getCurrentUser();
  if (data.user === current) return;
  addMessage(data);
});

// 1️⃣1️⃣ — Chaje ansyen mesaj
socket.on('loadMessages', (messagesArray) => {
  if (!Array.isArray(messagesArray)) return;
  const current = getCurrentUser();
  messagesArray.forEach(msg => {
    const isMe = msg.user === current;
    addMessage(msg, isMe);
  });
});

// 1️⃣2️⃣ — RENDER LIS ITILIZATÈ ONLINE (tout 'name' -> 'user')
function renderUsers(arr) {
  if (!Array.isArray(arr) || !userList) return;
  userList.innerHTML = '';

  arr.forEach(u => {
    const li = document.createElement('li');

    const dot = document.createElement('span');
    dot.className = 'status-dot ' + (u.connected ? 'online' : 'offline');
    li.appendChild(dot);

    const user = u.user || u;
    const text = document.createTextNode(' ' + user);
    li.appendChild(text);

    li.dataset.user = user;

    li.addEventListener('click', () => {
      const target = li.dataset.user;
      const current = getCurrentUser();
      if (!target || target === current) return;
      openPrivateChat(target);
    });

    userList.appendChild(li);
  });
}

// 1️⃣3️⃣ — Fonksyon pou ouvri chat prive
function openPrivateChat(targetUser) {
  const currentUser = getCurrentUser();
  if (!targetUser || !currentUser || targetUser === currentUser) return;
  socket.emit('setUser', currentUser);

  const privateUrl = `https://fondationbackupspirituel.com/Chatprive.html?from=${encodeURIComponent(currentUser)}&to=${encodeURIComponent(targetUser)}`;
  window.location.href = privateUrl;
}

// 1️⃣4️⃣ — Evènman ki resevwa lis itilizatè yo
socket.on('online-users', (arr) => {
  const normalized = Array.isArray(arr) ? arr.map(item => {
    if (typeof item === 'string') return { user: item, connected: true };
    if (item && typeof item === 'object') {
      return { user: item.user || item.id || 'Anonyme', connected: !!item.connected };
    }
    return { user: String(item), connected: true };
  }) : [];
  renderUsers(normalized);
});

// 1️⃣5️⃣ — Evènman koneksyon / dekonèksyon (tou senp log)
socket.on('userConnected', (user) => { console.log('🟢 Itilizatè konekte:', user); });
socket.on('userDisconnected', (user) => { console.log('🔴 Itilizatè dekonekte:', user); });

// 1️⃣6️⃣ — Lè socket konekte, mande lis itilizatè yo
socket.on('connect', () => {
  const current = getCurrentUser();
  if (current && current !== 'Anonyme') socket.emit('setUser', current);
  socket.emit('requestUserList');
});
