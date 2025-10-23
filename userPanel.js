// userPanel.js
const socket = io(); // asire socket.io disponib

const userList = document.getElementById('userList');
const userInput = document.getElementById('userNameInput'); // Optional si gen input

// Mete ajou lis itilizatè
function renderUsers(users) {
  if (!userList) return;
  userList.innerHTML = '';

  users.forEach(u => {
    const li = document.createElement('li');
    li.dataset.userId = u.userId;  // id inik
    li.dataset.display = u.user;   // display name

    const dot = document.createElement('span');
    dot.classList.add('status-dot', u.connected ? 'online' : 'offline');
    li.appendChild(dot);

    li.appendChild(document.createTextNode(u.user));
    userList.appendChild(li);
  });

  // Si plis pase 5 itilizatè, ajoute scroll otomatik
  userList.style.overflowY = users.length > 5 ? 'auto' : 'hidden';
}

// Rele lè server voye lis itilizatè yo
socket.on('online-users', arr => renderUsers(arr));

// Demande lis itilizatè a imedyatman
socket.emit('requestUserList');

// Lanse chat prive lè itilizatè klike sou yon lòt
if (userList) {
  userList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;

    const targetUserId = li.dataset.userId;
    const targetDisplay = li.dataset.display || li.textContent.trim();

    const currentUser = userInput?.value.trim() || 'Anonyme';
    if (!targetUserId || targetUserId === currentUser) return;

    // Redireksyon Chatprive.html
    const privateUrl = `https://fondationbackupspirituel.com/Chatprive.html?from=${encodeURIComponent(currentUser)}&to=${encodeURIComponent(targetUserId)}`;
    window.location.href = privateUrl;
  });
}

// Debug logs
socket.on('userConnected', ({ userId, display }) => {
  console.log(`🟢 Konekte: ${display} (${userId})`);
});

socket.on('userDisconnected', ({ userId, display }) => {
  console.log(`🔴 Dekonekte: ${display} (${userId})`);
});
