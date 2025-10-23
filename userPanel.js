// userPanel.js
// ---------------------------
// Endepandan panel itilizatè pou chat piblik / prive
// ---------------------------

// ⚡ Asire socket.io disponib nan paj la
const socket = io(); // si socket.io deja enkli nan paj HTML

// ⚡ Seleksyon DOM pou panel itilizatè
const userList = document.getElementById('userList');
const userInput = document.getElementById('userNameInput'); // Optional: si ou gen yon input pou non itilizatè

// ---------------------------
// Fonksyon pou mete ajou lis itilizatè yo
// ---------------------------
function renderUsers(users) {
  if (!userList) return;
  userList.innerHTML = '';

  users.forEach(u => {
    const li = document.createElement('li');
    li.dataset.userId = u.userId;           // kenbe userId pou chat prive
    li.dataset.display = u.display;         // kenbe display name

    const dot = document.createElement('span');
    dot.classList.add('status-dot');
    dot.classList.add(u.connected ? 'online' : 'offline');
    li.appendChild(dot);

    li.appendChild(document.createTextNode(u.display)); // montre display name
    userList.appendChild(li);
  });
}

// ---------------------------
// Rele lè server voye lis itilizatè yo
// ---------------------------
socket.on('online-users', (arr) => {
  renderUsers(arr);
});

// ---------------------------
// Chaje lis itilizatè a imedyatman lè konekte
// ---------------------------
socket.emit('requestUserList');

// ---------------------------
// Lanse chat prive lè itilizatè klike sou yon lòt
// ---------------------------
if (userList) {
  userList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;

    const targetUserId = li.dataset.userId;
    const targetDisplay = li.dataset.display || li.textContent.trim();

    const currentUser = userInput?.value.trim() || 'Anonyme';
    if (!targetUserId || targetUserId === currentUser) return;

    // Redireksyon dirèk sou paj chat prive (si w gen yon Chatprive.html)
    const privateUrl = `https://fondationbackupspirituel.com/Chatprive.html?from=${encodeURIComponent(currentUser)}&to=${encodeURIComponent(targetUserId)}`;
    window.location.href = privateUrl;
  });
}

// ---------------------------
// Optional: konsol logs pou debug
// ---------------------------
socket.on('userConnected', ({ userId, display }) => {
  console.log(`🟢 Konekte: ${display} (${userId})`);
});

socket.on('userDisconnected', ({ userId, display }) => {
  console.log(`🔴 Dekonekte: ${display} (${userId})`);
});
