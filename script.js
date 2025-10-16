// script.js
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
    socket.emit('chatMessage', { user, message });
    msgInput.value = '';
  }
});

// Lè gen nouvo mesaj soti nan lòt moun
socket.on('chatMessage', (data) => {
  const li = document.createElement('li');
  li.textContent = `${data.user}: ${data.message}`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});
