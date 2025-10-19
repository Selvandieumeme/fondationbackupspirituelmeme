/* =====================================================
   ChatPrive.js
   Jesyon chat prive pou chak itilizatè
   ===================================================== */

// 1️⃣ — Reutilize menm socket deja egziste a
const socket = window.__fbsp_shared_socket || io('https://examen-backend-ihlx.onrender.com');
window.__fbsp_shared_socket = socket;

// 2️⃣ — Seleksyon eleman HTML prensipal yo
const userList = document.getElementById('userList');

// 3️⃣ — Kenbe referans fenèt prive ki louvri yo
const privateWindows = {};

// 4️⃣ — Fonksyon pou kreye fenèt prive
function openPrivateWindow(targetUser) {
  const currentUser = document.getElementById('user')?.value.trim() || 'Anonyme';
  const windowId = `private-${currentUser}-${targetUser}`;

  // Si fenèt deja egziste, pa kreye nouvo
  if (privateWindows[windowId]) return;

  // Kreye fenèt prive
  const container = document.createElement('div');
  container.classList.add('private-chat-window');
  container.id = windowId;

  // Header fenèt
  const header = document.createElement('div');
  header.textContent = `Chat prive: ${currentUser} ➜ ${targetUser}`;
  container.appendChild(header);

  // Espas mesaj
  const messagesDiv = document.createElement('div');
  messagesDiv.classList.add('private-messages');
  container.appendChild(messagesDiv);

  // Input + bouton
  const inputContainer = document.createElement('div');
  inputContainer.style.display = 'flex';
  inputContainer.style.gap = '2px';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Ekri mesaj ou...';
  inputContainer.appendChild(input);

  const sendBtn = document.createElement('button');
  sendBtn.textContent = 'Voye';
  inputContainer.appendChild(sendBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Efase lokal';
  inputContainer.appendChild(deleteBtn);

  container.appendChild(inputContainer);

  document.body.appendChild(container);
  privateWindows[windowId] = { container, messagesDiv, input, targetUser };

  // Bouton voye mesaj
  sendBtn.addEventListener('click', () => {
    sendPrivateMessage(currentUser, targetUser, input.value, messagesDiv, input);
  });

  // Enter pou voye
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendPrivateMessage(currentUser, targetUser, input.value, messagesDiv, input);
    }
  });

  // Bouton efase lokal
  deleteBtn.addEventListener('click', () => {
    messagesDiv.innerHTML = '';
  });
}

// 5️⃣ — Fonksyon voye mesaj prive
function sendPrivateMessage(sender, receiver, message, messagesDiv, input) {
  if (!message.trim()) return;

  const data = {
    sender,
    receiver,
    message: message.trim(),
    date: new Date(),
    private: true
  };

  socket.emit('privateMessage', data);
  addPrivateMessage(data, messagesDiv, true);
  input.value = '';
}

// 6️⃣ — Ajoute mesaj nan fenèt prive
function addPrivateMessage(data, messagesDiv, isMe) {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = `[${new Date(data.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}] ${data.sender}: ${data.message}`;
  msgDiv.classList.add(isMe ? 'me' : 'other');
  messagesDiv.appendChild(msgDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// 7️⃣ — Resevwa mesaj prive atravè socket
socket.on('privateMessage', (data) => {
  const currentUser = document.getElementById('user')?.value.trim() || 'Anonyme';
  // Si mesaj se pou mwen oswa mwen se voye li
  if (data.receiver === currentUser || data.sender === currentUser) {
    const windowId = `private-${data.sender}-${data.receiver}`;
    const reverseWindowId = `private-${data.receiver}-${data.sender}`;
    let win = privateWindows[windowId] || privateWindows[reverseWindowId];

    if (!win) {
      // Ouvri nouvo fenèt si pa egziste
      const otherUser = data.sender === currentUser ? data.receiver : data.sender;
      openPrivateWindow(otherUser);
      win = privateWindows[`private-${currentUser}-${otherUser}`];
    }

    addPrivateMessage(data, win.messagesDiv, data.sender === currentUser);
  }
});

// 8️⃣ — Fè klik sou lis itilizatè yo pou louvri chat prive
userList.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  const targetUser = li.textContent.replace(/\s/g,''); // retire espas si genyen
  const currentUser = document.getElementById('user')?.value.trim() || 'Anonyme';
  if (targetUser && targetUser !== currentUser) {
    openPrivateWindow(targetUser);
  }
});
