// ecole-en-ligne.js
const socket = io('https://examen-backend-ihlx.onrender.com', { transports: ['websocket'] });

const fullName = document.getElementById('fullName');
const roomCode = document.getElementById('roomCode');
const oldRoomCode = document.getElementById('oldRoomCode');
const roleSelect = document.getElementById('roleSelect');
const joinBtn = document.getElementById('joinBtn');
const rejoinBtn = document.getElementById('rejoinBtn');

const loginPanel = document.getElementById('login-panel');

let localStream = null, role = null, room = null, name = null;
const peers = {}, remoteStreams = {};

joinBtn.addEventListener('click', async () => {
  name = fullName.value.trim(); room = roomCode.value.trim(); role = roleSelect.value;
  if (!name || !room) return alert('Nom et Code requis');
  socket.emit('join-room-request', { room, name, role, oldRoom: oldRoomCode.value.trim() }, (ack) => {
    if (ack.status==='ok') startClassroom();
    else if (ack.status==='pending') appendChat('Demande en attente...');
    else if (ack.status==='full') alert('Salle pleine');
  });
});

socket.on('join-accepted', () => startClassroom());
socket.on('join-rejected', ({ message }) => appendChat('Rejeté: '+message));
socket.on('participants', ({ list }) => updateParticipants(list));

async function startClassroom() {
  loginPanel.style.display = 'none';
  try { localStream = await navigator.mediaDevices.getUserMedia({ video:true,audio:true }); }
  catch(e){ alert('Erreur caméra/micro'); return; }

  // video affichage
  const v = document.createElement('video'); v.autoplay=true; v.muted=true; v.playsInline=true; v.srcObject=localStream;
  document.body.appendChild(v);

  // init teacher/student controls
  if(role==='teacher' && typeof teacherControlsInit==='function') teacherControlsInit({localStream,socket,room,name});
  if(role==='student' && typeof studentControlsInit==='function') studentControlsInit({localStream,socket,room,name});
}

// simple helper
function appendChat(msg){ console.log(msg); }
function updateParticipants(list){ console.log('Participants:',list); }
