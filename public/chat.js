// public/chat.js
const socket = io();

socket.on('private message', ({ from, message }) => {
  const chatBox = document.getElementById('chat');
  const p = document.createElement('p');
  p.innerText = `📨 Soti nan ${from}: ${message}`;
  chatBox.appendChild(p);
});

function sendPrivateMessage() {
  const to = document.getElementById('toUser').value;
  const message = document.getElementById('message').value;
  socket.emit('private message', { to, message });

  const chatBox = document.getElementById('chat');
  const p = document.createElement('p');
  p.innerText = `✅ Ou voye: ${message}`;
  chatBox.appendChild(p);

  document.getElementById('message').value = '';
}






const socket = io();
const userId = prompt("Antre ID ou pou chat la (ex: Eva, CEFOTECHCO):");

socket.on('private message', ({ from, message }) => {
  const p = document.createElement('p');
  p.innerText = `📨 Soti nan ${from}: ${message}`;
  document.getElementById('chat').appendChild(p);
});

function sendPrivateMessage() {
  const to = document.getElementById('toUser').value;
  const message = document.getElementById('message').value;

  socket.emit('private message', { to, message });

  const p = document.createElement('p');
  p.innerText = `✅ Ou voye bay ${to}: ${message}`;
  document.getElementById('chat').appendChild(p);

  document.getElementById('message').value = '';
}

// ✅ Chaje tout mesaj yo lè paj la louvri
async function loadMessages() {
  const res = await fetch(`/messages/${userId}`);
  const messages = await res.json();

  const chat = document.getElementById('chat');
  messages.forEach(msg => {
    const p = document.createElement('p');
    const prefix = msg.from === userId ? '✅ Ou voye' : `📨 Soti nan ${msg.from}`;
    p.innerText = `${prefix}: ${msg.message}`;
    chat.appendChild(p);
  });
}

loadMessages();





#chat p {
  margin: 4px 0;
  padding: 4px;
  border-bottom: 1px dashed #ccc;
}
