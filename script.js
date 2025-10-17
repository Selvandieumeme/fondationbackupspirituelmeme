// script.js

// ✅ 1. Rekipere non itilizatè a depi nan localStorage
let user = localStorage.getItem('user');

// ✅ 2. Lè paj la chaje, montre oswa kache overlay login lan
window.addEventListener('load', () => {
  if (!user) {
    document.getElementById('loginOverlay').style.display = 'flex';
  } else {
    document.getElementById('loginOverlay').style.display = 'none';
  }
});

// ✅ 3. Bouton "Antre nan chat" pou mete non itilizatè a
document.getElementById('enterChatBtn').addEventListener('click', () => {
  const input = document.getElementById('usernameInput');
  const name = input.value.trim();

  if (name) {
    user = name;
    localStorage.setItem('user', name);
    document.getElementById('loginOverlay').style.display = 'none';
  } else {
    alert('Tanpri antre yon non avan ou antre nan chat la.');
  }
});

// ✅ 4. Konekte ak Socket.io
const socket = io();

// ✅ 5. Rekipere eleman HTML yo
const sendBtn = document.getElementById('send');
const msgInput = document.getElementById('msg');
const userInput = document.getElementById('user');
const messages = document.getElementById('messages');

// ✅ 6. Lè itilizatè a klike sou "Voye"
sendBtn.addEventListener('click', () => {
  const currentUser = userInput.value.trim() || 'Anonyme';
  const message = msgInput.value.trim();

  if (message) {
    socket.emit('chatMessage', { user: user, message: message });

    // ✅ 7. Lè gen nouvo mesaj soti nan lòt moun
    socket.on('chatMessage', (data) => {
      const { user, message, time } = data;
      const msg = document.createElement('p');
      msg.textContent = `${user} [${time}]: ${message}`;
      document.getElementById('messages').appendChild(msg);
    });
  }
});
