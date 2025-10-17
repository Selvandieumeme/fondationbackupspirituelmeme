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

// Bouton pou antre nan chat la
document.getElementById('enterChatBtn').addEventListener('click', () => {
  const input = document.getElementById('usernameInput');
  const name = input.value.trim();

  if (name) {
    username = name;
    localStorage.setItem('username', name);
    document.getElementById('loginOverlay').style.display = 'none';
    socket.emit('setUsername', username); // ✅ Voye non itilizatè a bay sèvè
    userInput.value = username; // Mete non itilizatè a nan input chat la si bezwen
  } else {
    alert('Tanpri antre yon non avan ou antre nan chat la.');
  }
});

// ✅ Lè moun voye mesaj
sendBtn.addEventListener('click', () => {
  const message = msgInput.value.trim();
  if (message) {
    socket.emit('chatMessage', {
      username: username || 'Anonyme', // toujou itilize username
      message: message
    });
    msgInput.value = '';
  }
});

// Pèmèt itilizatè tape Enter pou voye mesaj
msgInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendBtn.click();
});

// ✅ Resevwa nouvo mesaj soti nan sèvè
socket.on('chatMessage', (data) => {
  const sender = data.username || 'Anonyme'; // toujou pran username
  const time = data.date ? new Date(data.date).toLocaleTimeString() : '';
  const msg = document.createElement('p');
  msg.textContent = `${sender} [${time}]: ${data.message}`;
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
