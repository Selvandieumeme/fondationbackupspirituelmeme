// =======================
// ✅ script.js FINAL AK SIPÒ CHAT PRIVE (san localStorage)
// =======================

// 1️⃣ — Pa itilize localStorage; nou pran non itilizatè a depi <input id="user">
const userInputEl = document.getElementById('user');

// 2️⃣ — Konekte ak Socket.io (reutilize socket global si li deja te kreye)
const socket = window.__fbsp_shared_socket || io('https://examen-backend-ihlx.onrender.com');
window.__fbsp_shared_socket = socket; // fè koneksyon an disponib pou lòt script/oswa Chatprive.html

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
  // sou "enter" nan input non an
  userInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const name = getCurrentUser();
      if (name) socket.emit('setUser', name);
    }
  });
  // sou "blur" (lè li soti nan input la)
  userInputEl.addEventListener('blur', () => {
    const name = getCurrentUser();
    if (name) socket.emit('setUser', name);
  });
}

// 6️⃣ — Eleman prensipal chat piblik (pa chanje fonksyonalite yo)
const sendBtn = document.getElementById('send');
const msgInput = document.getElementById('msg');
const messages = document.getElementById('messages');
const userList = document.getElementById('userList'); // lis itilizatè online yo

// 7️⃣ — Fonksyon pou ajoute mesaj nan chat piblik (pa chanje)
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
  const name = getCurrentUser();
  if (!name) return 'Anonyme';
  socket.emit('setUser', name);
  return name;
}

// 9️⃣ — Voye mesaj piblik (menm jan ak orijinal)
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
msgInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// 🔟 — Resevwa mesaj piblik (pa chanje)
socket.on('chatMessage', (data) => {
  const current = getCurrentUser();
  if (data.user === current) return;
  addMessage(data);
});

// 1️⃣1️⃣ — Chaje ansyen mesaj (pa chanje)
socket.on('loadMessages', (messagesArray) => {
  if (!Array.isArray(messagesArray)) return;
  const current = getCurrentUser();
  messagesArray.forEach(msg => {
    const isMe = msg.user === current;
    addMessage(msg, isMe);
  });
});

// 1️⃣2️⃣ — RENDER LIS ITILIZATÈ ONLINE (sipoze server voye {id, name, connected})
function renderUsers(arr) {
  if (!Array.isArray(arr) || !userList) return;
  userList.innerHTML = '';

  arr.forEach(u => {
    const li = document.createElement('li');

    // dot status (si w vle kenbe li)
    const dot = document.createElement('span');
    dot.className = 'status-dot ' + (u.connected ? 'online' : 'offline');
    li.appendChild(dot);

    // text
    const name = u.name || u;
    const text = document.createTextNode(' ' + name);
    li.appendChild(text);

    // mete dataset pou fasil rekapte non
    li.dataset.user = name;

    // fè li klike-able pou chat prive
    li.addEventListener('click', () => {
      const target = li.dataset.user;
      const current = getCurrentUser();
      if (!target || target === current) return;
      openPrivateChat(target);
    });

    userList.appendChild(li);
  });
}

// 1️⃣3️⃣ — Fonksyon pou ouvri chat prive (redirije sou Chatprive.html ak 'from' & 'to')
//    Remake: nou itilize URL absoli pou evite 404 ki ka soti ak diferans case/chemen
function openPrivateChat(targetUser) {
  const currentUser = getCurrentUser();
  if (!targetUser || !currentUser || targetUser === currentUser) return;
  // Asire server konnen non sa a
  socket.emit('setUser', currentUser);

  const privateUrl = `https://fondationbackupspirituel.com/Chatprive.html?from=${encodeURIComponent(currentUser)}&to=${encodeURIComponent(targetUser)}`;
  window.location.href = privateUrl;
}

// 1️⃣4️⃣ — Evènman ki resevwa lis itilizatè yo
socket.on('online-users', (arr) => {
  // Server a ka voye swa yon array senp oswa obj {id,name,connected}
  // Normalize: si se array string, map li nan fòm { name: string }
  const normalized = Array.isArray(arr) ? arr.map(item => {
    if (typeof item === 'string') return { name: item, connected: true };
    if (item && typeof item === 'object') {
      // si server voye { id, name, connected } oswa { user, connected }
      return { name: item.name || item.user || item.id || 'Anonyme', connected: !!item.connected };
    }
    return { name: String(item), connected: true };
  }) : [];
  renderUsers(normalized);
});

// 1️⃣5️⃣ — Evènman koneksyon / dekonèksyon (tou senp log)
socket.on('userConnected', (name) => {
  console.log('🟢 Itilizatè konekte:', name);
});
socket.on('userDisconnected', (name) => {
  console.log('🔴 Itilizatè dekonekte:', name);
});

// 1️⃣6️⃣ — Lè socket konekte, mande lis itilizatè yo (asire UI ajou)
socket.on('connect', () => {
  const current = getCurrentUser();
  if (current && current !== 'Anonyme') socket.emit('setUser', current);
  socket.emit('requestUserList');
});
