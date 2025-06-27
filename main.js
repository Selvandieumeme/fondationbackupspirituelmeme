<script src="/socket.io/socket.io.js"></script>

const socket = io(); // konekte ak serve a otomatikman

// Resevwa mesaj prive
socket.on('private message', ({ from, message }) => {
  // Afiche mesaj la sou paj la
});

// Fonksyon pou voye mesaj bay yon zanmi
function sendPrivate(toUserId, message) {
  socket.emit('private message', { to: toUserId, message });
}
