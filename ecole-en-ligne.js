// ====================================================
// Connexion socket
// ====================================================
const socket = io('https://examen-backend-ihlx.onrender.com');

document.addEventListener('DOMContentLoaded', () => {
  const joinBtn = document.getElementById('joinBtn');
  const rejoinBtn = document.getElementById('rejoinBtn');
  const nameInput = document.getElementById('fullName');
  const roleSelect = document.getElementById('roleSelect');
  const roomInput = document.getElementById('roomCode');
  const oldRoomTeacher = document.getElementById('oldRoomTeacher');
  const loginPanel = document.getElementById('login-panel');
  const classroom = document.getElementById('classroom');
  const teacherVideoEl = document.getElementById('teacher-video');
  const studentVideosEl = document.getElementById('students-camera');
  const studentListEl = document.getElementById('student-list');
  const studentCountEl = document.getElementById('student-count');
  const raisedHandsEl = document.getElementById('raised-hands-list');
  const chatPanel = document.getElementById('chat-panel');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendChatBtn = document.getElementById('send-chat');
  const sidePanel = document.getElementById('side-panel');
  const controls = document.getElementById('controls');
  const backgroundSelector = document.getElementById('background-selector');
  const shareScreenBtn = document.getElementById('share-screen');
  const mainHandBtn = document.getElementById('main-hand');
  const changeBgBtn = document.getElementById('change-background-btn');
  const leaveBtn = document.getElementById('leave-class');
  const recordBtn = document.getElementById('record-btn');
  const downloadBtn = document.getElementById('download-btn');

  let role, room, localStream, mediaRecorder, recordedChunks = [];
  const peers = {}; // WebRTC peers

  // ====================================================
  // Montrer/kache chan ancien code pour teacher
  // ====================================================
  roleSelect.addEventListener('change', () => {
    oldRoomTeacher.style.display = (roleSelect.value === 'teacher') ? 'block' : 'none';
  });

  // ====================================================
  // Init local video + audio
  // ====================================================
  async function initLocalStream() {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (role === 'teacher') teacherVideoEl.srcObject = localStream;
      else {
        const placeholder = document.createElement('video');
        placeholder.srcObject = localStream;
        placeholder.autoplay = true;
        placeholder.playsInline = true;
        placeholder.muted = true;
        studentVideosEl.appendChild(placeholder);
      }
    } catch (err) {
      console.error('Erreur getUserMedia', err);
    }
  }

  // ====================================================
  // Join Room
  // ====================================================
  joinBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    role = roleSelect.value;
    room = roomInput.value.trim();

    if (!name || !room) return alert('Veuillez remplir tous les champs.');

    loginPanel.style.display = 'none';
    classroom.style.display = 'block';
    chatPanel.style.display = 'block';
    sidePanel.style.display = 'flex';
    controls.style.display = 'flex';

    await initLocalStream();
    socket.emit('joinRoom', { room, name, role });

    if (role === 'teacher') teacherControlsInit(socket, localStream);
    else studentControlsInit(socket, localStream);
  });

  // ====================================================
  // Rejoin Room
  // ====================================================
  rejoinBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    role = roleSelect.value;
    room = oldRoomTeacher.value.trim();

    if (!name || !room) return alert('Veuillez remplir tous les champs.');

    loginPanel.style.display = 'none';
    classroom.style.display = 'block';
    chatPanel.style.display = 'block';
    sidePanel.style.display = 'flex';
    controls.style.display = 'flex';

    await initLocalStream();
    socket.emit('rejoinRoom', { room, name, role });

    if (role === 'teacher') teacherControlsInit(socket, localStream);
    else studentControlsInit(socket, localStream);
  });

  // ====================================================
  // Chat
  // ====================================================
  sendChatBtn.addEventListener('click', () => {
    const msg = chatInput.value.trim();
    if (!msg) return;
    socket.emit('chatMessage', { room, name: nameInput.value, message: msg });
    chatInput.value = '';
  });

  socket.on('chatMessage', ({ name, message }) => {
    const div = document.createElement('div');
    div.textContent = `${name}: ${message}`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
  
  // ====================================================
  // Record Video
  // ====================================================
  recordBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      recordBtn.textContent = 'Enregistrer';
    } else {
      recordedChunks = [];
      mediaRecorder = new MediaRecorder(localStream);
      mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
      mediaRecorder.start();
      recordBtn.textContent = 'Stop';
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (recordedChunks.length === 0) return alert('Aucune vidéo enregistrée.');
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nameInput.value}-cours.webm`;
    a.click();
    URL.revokeObjectURL(url);
  });

});
