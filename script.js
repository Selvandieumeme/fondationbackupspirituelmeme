// script.js

// ✅ 1. Rekipere non itilizatè a depi nan localStorage
let user = localStorage.getItem('user');

// ✅ 4. Konekte ak Socket.io
const socket = io();

// ✅ 2. Lè paj la chaje, montre oswa kache overlay login lan
window.addEventListener('load', () => {
  if (!user) {
    document.getElementById('loginOverlay').style.display = 'flex';
  } else {
    document.getElementById('loginOverlay').style.display = 'none';

    // ✅ Voye non itilizatè a bay server pou panel itilizatè yo
    if (socket && socket.connected) {
      socket.emit('setUsername', user);
    }
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

    // ✅ Voye non itilizatè a bay server pou panel itilizatè yo
    if (socket && socket.connected) {
      socket.emit('setUsername', user);
    }
  } else {
    alert('Tanpri antre yon non avan ou antre nan chat la.');
  }
});

// ✅ 5. Rekipere eleman HTML yo
const sendBtn = document.getElementById('send');
const msgInput = document.getElementById('msg');
const messages = document.getElementById('messages');

// ✅ 6. Lè itilizatè a klike sou "Voye"
sendBtn.addEventListener('click', () => {
  const message = msgInput.value.trim();

  if (message) {
    socket.emit('chatMessage', { user: user, message: message });

    // ✅ 7. Lè gen nouvo mesaj soti nan lòt moun
    socket.on('chatMessage', (data) => {
      const { user: msgUser, message, date } = data;
      const msg = document.createElement('p');
      const time = new Date(date).toLocaleTimeString();
      msg.textContent = `${msgUser} [${time}]: ${message}`;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    });
  }
});
