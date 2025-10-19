/* ==========================================
   ChatPrive.js
   Chat prive pou 2 itilizatè sèlman
   Sèvi ak menm socket.io ke chat piblik la
   Pa modifye chat piblik oswa panel itilizatè yo
   ========================================== */

// Sèvi ak menm socket deja egziste
const privateSocket = window.__fbsp_shared_socket || io('https://examen-backend-ihlx.onrender.com');

// Referans DOM
const userList = document.getElementById('userList');
const body = document.body;

// Kenbe yon map pou fenèt prive yo
const privateWindows = new Map(); // key: "Itilizate1|Itilizate2", value: fenèt DOM

// Fonksyon pou jenere kle inik pou 2 itilizatè
function getPrivateKey(user1, user2) {
  return [user1, user2].sort().join('|'); // sort pou asire menm kle pou menm 2 itilizatè
}

// Fonksyon pou kreye ti fenèt chat prive
function openPrivateWindow(currentUser, targetUser) {
  const key = getPrivateKey(currentUser, targetUser);

  if (privateWindows.has(key)) return; // si fenèt deja egziste

  // Kreye eleman
  const container = document.createElement('div');
  container.classList.add('private-chat-window');
  container.style.position = 'fixed';
  container.style.bottom = '10px';
  container.style.right = `${10 + privateWindows.size * 220}px`; // espas pou plizyè fenèt
  container.style.width = '200px';
  container.style.background = '#fff';
  container.style.border = '1px solid #ccc';
  container.style.borderRadius = '8px';
  container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
  container.style.zIndex = 1000;
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.fontFamily = 'Poppins, sans-serif';
  container.style.fontSize = '12px';
  container.style.maxHeight = '300px';

  // Header
  const header = document.createElement('div');
  header.textContent = `Chat prive: ${targetUser}`;
  header.style.background = '#0057b7';
  header.style.color = '#fff';
  header.style.padding = '6px';
  header.style.fontWeight = '600';
  header.style.borderTopLeftRadius = '8px';
  header.style.borderTopRightRadius = '8px';
  container.appendChild(header);

  // Espas mesaj
  const messagesDiv = document.createElement('div');
  messagesDiv.classList.add('private-messages');
  messagesDiv.style.flex = '1';
  messagesDiv.style.overflowY = 'auto';
  messagesDiv.style.padding = '4px';
  messagesDiv.style.background = '#f4f6f9';
  container.appendChild(messagesDiv);

  // Input
  const inputDiv = document.createElement('div');
  inputDiv.style.display = 'flex';
  inputDiv.style.borderTop = '1px solid #ccc';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Ekri mesaj...';
  input.style.flex = '1';
  input.style.padding = '4px';
  input.style.border = 'none';
  inputDiv.appendChild(input);

  const sendBtn = document.createElement('button');
  sendBtn.textContent = 'Voye';
  sendBtn.style.background = '#0057b7';
  sendBtn.style.color = '#fff';
  sendBtn.style.border = 'none';
  sendBtn.style.padding = '4px 6px';
  sendBtn.style.cursor = 'pointer';
  inputDiv.appendChild(sendBtn);

  // Bouton efase lokal
  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Efase';
  clearBtn.style.background = '#e74c3c';
  clearBtn.style.color = '#fff';
  clearBtn.style.border = 'none';
  clearBtn.style.padding = '4px 6px';
  clearBtn.style.cursor = 'pointer';
  inputDiv.appendChild(clearBtn);

  container.appendChild(inputDiv);

  body.appendChild(container);
  privateWindows.set(key, container);

  // Fonksyon ajoute mesaj nan fenèt prive
  function addPrivateMessage(data, isMe = false) {
    const li = document.createElement('div');
    li.textContent = `[${data.user}]: ${data.message}`;
    li.style.marginBottom = '4px';
    li.style.padding = '2px 4px';
    li.style.borderRadius = '4px';
    li.style.background = isMe ? '#0057b7' : '#f7d600';
    li.style.color = isMe ? '#fff' : '#000';
    messagesDiv.appendChild(li);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // Evènman voye mesaj
  sendBtn.addEventListener('click', () => {
    const message = input.value.trim();
    if (!message) return;
    const data = { from: currentUser, to: targetUser, message, date: new Date() };
    privateSocket.emit('privateMessage', data);
    addPrivateMessage({ user: currentUser, message }, true);
    input.value = '';
  });

  // Enter key
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
  });

  // Bouton efase lokal
  clearBtn.addEventListener('click', () => {
    messagesDiv.innerHTML = '';
  });
}

// Klike sou non itilizatè pou louvri chat prive
userList.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  const targetUser = li.textContent.replace(/\s*$/,''); // retire espas final
  const currentUser = document.getElementById('user').value.trim() || 'Anonyme';
  if (targetUser && targetUser !== currentUser) {
    openPrivateWindow(currentUser, targetUser);
  }
});

// Resevwa mesaj prive
privateSocket.on('privateMessage', (data) => {
  const currentUser = document.getElementById('user').value.trim() || 'Anonyme';
  const otherUser = data.from === currentUser ? data.to : data.from;
  const key = getPrivateKey(currentUser, otherUser);

  // Louvri fenèt si li poko egziste
  if (!privateWindows.has(key)) {
    openPrivateWindow(currentUser, otherUser);
  }

  // Ajoute mesaj nan fenèt la
  const container = privateWindows.get(key);
  if (!container) return;
  const messagesDiv = container.querySelector('.private-messages');
  if (!messagesDiv) return;

  addPrivateMessage(data, data.from === currentUser);

  function addPrivateMessage(data, isMe = false) {
    const li = document.createElement('div');
    li.textContent = `[${data.from}]: ${data.message}`;
    li.style.marginBottom = '4px';
    li.style.padding = '2px 4px';
    li.style.borderRadius = '4px';
    li.style.background = isMe ? '#0057b7' : '#f7d600';
    li.style.color = isMe ? '#fff' : '#000';
    messagesDiv.appendChild(li);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
});
