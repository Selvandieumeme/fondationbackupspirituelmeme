// =======================
// ✅ script.js FINAL KOREKTE — Vèsyon ak setUser sèlman
// =======================

// 1️⃣ — Rekipere non itilizatè a depi nan localStorage
let user = localStorage.getItem('user');

// 2️⃣ — Konekte ak Socket.io
const socket = io('https://examen-backend-ihlx.onrender.com');
window.socket = socket; // 🔹 fè koneksyon an disponib pou lòt script (tankou onlineUsersPanel.js)

// 3️⃣ — Lè paj la chaje
window.addEventListener('load', () => {
  if (!user) {
    document.getElementById('loginOverlay').style.display = 'flex';
  } else {
    document.getElementById('loginOverlay').style.display = 'none';

    // ✅ Voye non itilizatè a bay server avèk "setUser"
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
const userList = document.getElementById('userList'); // ti kadran itilizatè yo

// 5️⃣ — Fonkksyon pou ajoute mesaj
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

// 6️⃣ — Fonkksyon pou mete lis itilizatè yo (ti kadran)
function renderUsers(arr) {
  if (!Array.isArray(arr)) return;
  userList.innerHTML = ''; // vide avan
  arr.forEach(u => {
    const li = document.createElement('li');
    li.textContent = u;
    userList.appendChild(li);
  });
}

// 7️⃣ — Voye mesaj
function sendMessage() {
  const message = msgInput.value.trim();
  if (!message) return;

  // ✅ Asire itilizatè a byen idantifye sou server anvan li voye mesaj
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

// 8️⃣ — Resevwa nouvo mesaj
socket.on('chatMessage', (data) => {
  if (data.user === user && new Date(data.date).getTime() === new Date().getTime()) {
    return;
  }
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

// 🔟 — 📡 Evènman pou lis itilizatè yo
socket.on('updateUserList', (arr) => {
  renderUsers(arr);
});

socket.on('userConnected', (username) => {
  console.log('🟢 Itilizatè konekte:', username);
});

socket.on('userDisconnected', (username) => {
  console.log('🔴 Itilizatè dekonekte:', username);
});
