// userPanel.js
// ✅ Panel itilizatè totalman endepandan

const socket = io();

// Seleksyon eleman HTML
const userList = document.getElementById('userList');
const userInput = document.getElementById('userInput'); // si ou gen sa sou paj lan

// ✅ Mete tout itilizatè yo ak status yo
function renderUsers(users) {
  if (!userList) return;
  userList.innerHTML = '';

  users.forEach(u => {
    const li = document.createElement('li');
    li.dataset.userId = u.userId;
    li.dataset.display = u.display;

    const dot = document.createElement('span');
    dot.classList.add('status-dot', u.connected ? 'online' : 'offline');
    li.appendChild(dot);

    li.appendChild(document.createTextNode(u.display));
    userList.appendChild(li);
  });
}

// ✅ Server voye lis itilizatè yo
socket.on('online-users', (arr) => {
  renderUsers(arr);
});

// ✅ Mande lis itilizatè yo dèske konekte
socket.emit('requestUserList');

// ✅ Klike sou yon itilizatè pou ouvri Chatprive.html
userList?.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;

  const targetId = li.dataset.userId;
  const targetDisplay = li.dataset.display;
  const currentUser = userInput?.value.trim() || 'Unknown';

  if (!targetId || targetId === currentUser) return;

  window.location.href =
    `Chatprive.html?from=${encodeURIComponent(currentUser)}&to=${encodeURIComponent(targetId)}`;
});

// ✅ Debug si ou vle
socket.on('userConnected', ({userId, display}) =>
  console.log('🟢 Konekte:', userId, display)
);

socket.on('userDisconnected', ({userId, display}) =>
  console.log('🔴 Dekonekte:', userId, display)
);
