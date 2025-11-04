// ====================================================
// Connexion socket
// ====================================================
const socket = io('https://examen-backend-ihlx.onrender.com');

document.addEventListener('DOMContentLoaded', () => {
  // ====================================================
  // Elements HTML
  // ====================================================
  const joinBtn = document.getElementById('joinBtn');
  const rejoinBtn = document.getElementById('rejoinBtn');
  const fullNameInput = document.getElementById('fullName');
  const roomCodeInput = document.getElementById('roomCode');
  const oldRoomCodeInput = document.getElementById('oldRoomCode');
  const roleSelect = document.getElementById('roleSelect');

  const loginPanel = document.getElementById('login-panel');
  const classroom = document.getElementById('classroom');
  const teacherVideoEl = document.getElementById('teacher-video');
  const studentVideosEl = document.getElementById('student-videos');
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
  // Montrer/kache chan "Ancien code" selon rôle
  // ====================================================
  roleSelect.addEventListener('change', () => {
    oldRoomCodeInput.style.display = (roleSelect.value === 'teacher') ? 'block' : 'none';
  });

  // ====================================================
  // Générer un nouveau Code de la Salle pour professeur
  // ====================================================
  function generateRoomCode() {
    return 'ROOM-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  // ====================================================
  // Initialiser stream local (vidéo + audio)
  // ====================================================
  async function initLocalStream() {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (role === 'teacher') {
        teacherVideoEl.srcObject = localStream;
      } else {
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
  // Ouvrir UI Salle de classe
  // ====================================================
  function openClassroomUI() {
    loginPanel.style.display = 'none';
    classroom.style.display = 'block';
    chatPanel.style.display = 'block';
    sidePanel.style.display = 'block';
    controls.style.display = 'flex';
    backgroundSelector.style.display = 'block';
  }

  // ====================================================
  // Bouton "Rejoindre"
  // ====================================================
  joinBtn.addEventListener('click', async () => {
    const name = fullNameInput.value.trim();
    const enteredRoom = roomCodeInput.value.trim();
    const oldRoom = oldRoomCodeInput.value.trim();
    role = roleSelect.value;

    if(!name || !enteredRoom) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if(role === 'teacher') {
      // Professeur: utiliser ancien code si fourni, sinon générer nouveau
      room = oldRoom ? oldRoom : generateRoomCode();
    } else {
      // Élève: utiliser code du professeur
      room = enteredRoom;
    }

    try {
      socket.timeout(5000).emit('joinRoom', { room, name, role }, async (response) => {
        if(response && response.status === 'full') {
          alert("Salle pleine (max 100 élèves).");
          return;
        }
        await initLocalStream();
        openClassroomUI();

        if(role === 'teacher') teacherControlsInit(socket, localStream);
        else studentControlsInit(socket, localStream);
      });
    } catch(err) {
      console.warn("Backend non disponible. Mode local activé.");
      await initLocalStream();
      openClassroomUI();
    }
  });

  // ====================================================
  // Bouton "Retourner dans la salle" (professeurs uniquement)
  // ====================================================
  rejoinBtn.addEventListener('click', async () => {
    const name = fullNameInput.value.trim();
    const oldRoom = oldRoomCodeInput.value.trim();
    role = roleSelect.value;

    if(role !== 'teacher') {
      alert("Ce bouton est seulement pour les Professeurs.");
      return;
    }
    if(!name || !oldRoom) {
      alert("Veuillez remplir votre nom et votre ancien code.");
      return;
    }

    room = oldRoom;

    try {
      socket.timeout(5000).emit('joinRoom', { room, name, role }, async (response) => {
        await initLocalStream();
        openClassroomUI();
        teacherControlsInit(socket, localStream);
      });
    } catch(err) {
      console.warn("Backend non disponible. Mode local activé.");
      await initLocalStream();
      openClassroomUI();
    }
  });

  // ====================================================
  // Chat
  // ====================================================
  sendChatBtn.addEventListener('click', () => {
    const msg = chatInput.value.trim();
    if (!msg) return;
    socket.emit('chatMessage', { room, name: fullNameInput.value, message: msg });
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
    a.download = `${fullNameInput.value}-cours.webm`;
    a.click();
    URL.revokeObjectURL(url);
  });

});
