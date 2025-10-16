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
  } else {
    alert('Tanpri antre yon non avan ou antre nan chat la.');
  }
});




const socket = io();

// Rekipere eleman yo
const sendBtn = document.getElementById('send');
const msgInput = document.getElementById('msg');
const userInput = document.getElementById('user');
const messages = document.getElementById('messages');

// Lè moun voye mesaj
sendBtn.addEventListener('click', () => {
  const user = userInput.value.trim() || 'Anonyme';
  const message = msgInput.value.trim();
  if (message) {
    socket.emit('chatMessage', {
  username: username,
  message: message
});

// Lè gen nouvo mesaj soti nan lòt moun
socket.on('chatMessage', (data) => {
  const { username, message, time } = data;
  const msg = document.createElement('p');
  msg.textContent = `${username} [${time}]: ${message}`;
  document.getElementById('messages').appendChild(msg);
});
