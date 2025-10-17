// script.js

let username = localStorage.getItem('username');

// Si itilizatè a poko gen non, montre overlay la
window.addEventListener('load', () => {
  if (!username) {
    document.getElementById('loginOverlay').style.display = 'flex';
  } else {
    document.getElementById('loginOverlay').style.display = 'none';
  }
});

// Bouton pou antre nan chat la
document.getElementById('enterChatBtn').addEventListener('click', () => {
  const input = document.getElementById('usernameInput');
  const name = input.value.trim();

  if (name) {
    username = name;
    localStorage.setItem('username', name);
    document.getElementById('loginOverlay').style.display = 'none';
    socket.emit('setUsername', username); // ✅ Nouvo pati enpòtan pou lis itilizatè yo
  } else {
    alert('Tanpri antre yon non avan ou antre nan chat la.');
  }
});


// ✅ Konekte ak Socket.io
const socket = io();

// Rekipere eleman yo
const sendBtn = document.getElementById('send');
const msgInput = document.getElementById('msg');
const userInput = document.getElementById('user');
const messages = document.getElementById('messages');

// ✅ Lè itilizatè a deja gen non nan localStorage, voye li sou sèvè
if (username) {
  socket.emit('setUsername', username);
}

// ✅ Lè moun voye mesaj
sendBtn.addEventListener('click', () => {
  const message = msgInput.value.trim();
  if (message) {
    socket.emit('chatMessage', {
      username: username || 'Anonyme',
      message: message
    });
    msgInput.value = '';
  }
});

// ✅ Resevwa nouvo mesaj soti nan sèvè
socket.on('chatMessage', (data) => {
  const { user, username, message, date } = data;
  const sender = username || user || 'Anonyme';
  const time = date ? new Date(date).toLocaleTimeString() : '';
  const msg = document.createElement('p');
  msg.textContent = `${sender} [${time}]: ${message}`;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
});


// ✅ Resevwa lis itilizatè konekte yo (kadran dwat la)
socket.on('updateUserList', (users) => {
  const usersList = document.getElementById('usersList');
  if (!usersList) return;
  usersList.innerHTML = '';
  users.forEach(u => {
    const li = document.createElement('li');
    li.textContent = `• ${u}`;
    li.style.padding = '3px 0';
    usersList.appendChild(li);
  });
});
