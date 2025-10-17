// script.js

// ✅ 1. Rekipere non itilizatè a depi nan localStorage
let user = localStorage.getItem('user');

// ✅ 2. Konekte ak Socket.io
const socket = io();

// ✅ 3. Lè paj la chaje, montre oswa kache overlay login lan
window.addEventListener('load', () => {
  if (!user) {
    document.getElementById('loginOverlay').style.display = 'flex';
  } else {
    document.getElementById('loginOverlay').style.display = 'none';

    // ✅ Voye non itilizatè a bay server pou panel itilizatè yo
    if (socket && socket.connected) {
      socket.emit('setUser', user);
    }
  }
});

// ✅ 4. Rekipere eleman HTML yo
const sendBtn = document.getElementById('send');
const msgInput = document.getElementById('msg');
const messages = document.getElementById('messages');

// ✅ 5. Fonkksyon pou ajoute mesaj nan lis la ak dat
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
  li.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// ✅ 6. Voye mesaj lè itilizatè klike oswa tape Enter
function sendMessage() {
  const message = msgInput.value.trim();
  if (!message) return;

  // ✅ Voye non itilizatè a anvan premye mesaj si li poko voye
  if (socket && socket.connected) {
    socket.emit('setUser', user);
  }

  const data = { user, message, date: new Date() };
  socket.emit('chatMessage', data);
  addMessage(data, true); // montre mesaj lokal la
  msgInput.value = '';
}

sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// ✅ 7. Resevwa nouvo mesaj soti nan server la
socket.on('chatMessage', (data) => {
  // evite double mesaj lokal deja afiche
  if (data.user === user && new Date(data.date).getTime() === new Date().getTime()) {
    return;
  }
  addMessage(data);
});

// ✅ 8. Chaje mesaj ki deja nan DB lè nouvo itilizatè konekte
socket.on('loadMessages', (messagesArray) => {
  if (!Array.isArray(messagesArray)) return;
  messagesArray.forEach(msg => {
    const isMe = msg.user === user;
    addMessage(msg, isMe);
  });
});
