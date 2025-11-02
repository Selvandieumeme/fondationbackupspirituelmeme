// Konekte ak backend Render
const socket = io('https://examen-backend-ihlx.onrender.com');

// Elements HTML
const joinBtn = document.getElementById('joinBtn');
const roomInput = document.getElementById('roomCode');
const nameInput = document.getElementById('fullName');
const roleSelect = document.getElementById('roleSelect');
const loginPanel = document.getElementById('login-panel');
const classroom = document.getElementById('classroom');
const teacherVideoEl = document.getElementById('teacher-video');
const studentVideosEl = document.getElementById('student-videos');
const studentListEl = document.getElementById('student-list');
const studentCountEl = document.getElementById('student-count');
const raisedHandsEl = document.getElementById('raised-hands-list');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat');

let role, room, localStream;
const peers = {}; // pou WebRTC

// Kreye yon WebRTC peer connection
function createPeerConnection(socketId) {
  const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

  // Ajoute tracks lokal yo
  if (localStream) {
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  }

  // Resevwa tracks remote
  pc.ontrack = (event) => {
    const stream = event.streams[0];
    if (!document.getElementById(socketId)) {
      const videoEl = document.createElement('video');
      videoEl.id = socketId;
      videoEl.srcObject = stream;
      videoEl.autoplay = true;
      videoEl.playsInline = true;
      videoEl.muted = false;
      videoEl.style.width = '240px';
      videoEl.style.height = '180px';
      studentVideosEl.appendChild(videoEl);
    }
  };

  // ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('signal', { to: socketId, candidate: event.candidate });
    }
  };

  return pc;
}

// Resevwa signal (SDP / ICE)
socket.on('signal', async ({ from, sdp, candidate }) => {
  if (!peers[from]) peers[from] = createPeerConnection(from);
  const pc = peers[from];

  if (sdp) {
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    if (sdp.type === 'offer') {
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('signal', { to: from, sdp: pc.localDescription });
    }
  }
  if (candidate) {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }
});

// Lè yon nouvo itilizatè antre
socket.on('user-joined', async ({ socketId }) => {
  const pc = createPeerConnection(socketId);
  peers[socketId] = pc;

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit('signal', { to: socketId, sdp: pc.localDescription });
});

// Join room
joinBtn.addEventListener('click', async () => {
  room = roomInput.value;
  const name = nameInput.value;
  role = roleSelect.value;
  if (!room || !name) return alert('Veuillez remplir tous les champs.');

  let responded = false;

  try {
    socket.timeout(3000).emit('joinRoom', { room, name, role }, async (response) => {
      responded = true;
      if (response.status === 'full') {
        alert('Salle pleine (max 100 élèves)');
        return;
      }

      loginPanel.style.display = 'none';
      classroom.style.display = 'block';

      try {
        // Ouvri kamera + mikwo otomatikman
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (role === 'teacher') teacherVideoEl.srcObject = localStream;
        else {
          // Elèv ka wè pwofesè
          const teacherPlaceholder = document.createElement('video');
          teacherPlaceholder.id = 'teacher-video-local';
          teacherPlaceholder.srcObject = localStream;
          teacherPlaceholder.autoplay = true;
          teacherPlaceholder.playsInline = true;
          teacherPlaceholder.muted = true; // evite feedback
          studentVideosEl.appendChild(teacherPlaceholder);
        }

        localStream.getTracks().forEach(track => track.enabled = true);

        socket.emit('streamReady', { role });
        socket.emit('readyForPeers');
      } catch (err) {
        console.error(err);
      }

      if (role === 'teacher') teacherControlsInit(socket);
      else studentControlsInit(socket);
    });
  } catch (err) {
    console.warn('Backend non disponible, simulation locale activée.');
  }

  setTimeout(async () => {
    if (!responded) {
      console.warn('Mode local activé.');
      loginPanel.style.display = 'none';
      classroom.style.display = 'block';
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (role === 'teacher') teacherVideoEl.srcObject = localStream;
        else {
          const teacherPlaceholder = document.createElement('video');
          teacherPlaceholder.srcObject = localStream;
          teacherPlaceholder.autoplay = true;
          teacherPlaceholder.playsInline = true;
          teacherPlaceholder.muted = true;
          studentVideosEl.appendChild(teacherPlaceholder);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, 3500);
});

// Update student list
socket.on('updateStudents', students => {
  studentListEl.innerHTML = '';
  let count = 0;
  students.forEach(s => {
    const div = document.createElement('div');
    div.textContent = s.name;
    div.style.color = s.online ? 'green' : 'gray';
    studentListEl.appendChild(div);
    if (s.online && s.role === 'student') count++;
  });
  studentCountEl.textContent = count;
});

// Update mains levées
socket.on('updateRaisedHands', hands => {
  raisedHandsEl.innerHTML = '';
  hands.forEach(s => {
    const div = document.createElement('div');
    div.textContent = s.name;
    raisedHandsEl.appendChild(div);
  });
});

// Chat
sendChatBtn.addEventListener('click', () => {
  const msg = chatInput.value.trim();
  if (msg === '') return;
  socket.emit('chatMessage', msg);
  chatInput.value = '';
});

socket.on('chatMessage', data => {
  const div = document.createElement('div');
  div.textContent = `${data.name}: ${data.msg}`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});




// ====================================================
// BOUTONS ADDITIONNELS (Teacher / Student)
// ====================================================
document.addEventListener('DOMContentLoaded', () => {

    // === ELEMENTS HTML ===
    const classroom = document.getElementById('classroom');
    const teacherVideoEl = document.getElementById('teacher-video');
    const studentVideosEl = document.getElementById('student-videos');

    // Boutons
    const shareScreenBtn = document.getElementById('share-screen');
    const recordBtn = document.getElementById('record-video');
    const mainHandBtn = document.getElementById('main-hand');
    const downloadBtn = document.getElementById('download-btn');
    const downloadMenu = document.getElementById('download-menu');



  


  
// === TELECHARGER MENU ===
document.addEventListener('DOMContentLoaded', () => {
  const downloadBtn = document.getElementById('downloadBtn');
  const dropdownIcons = document.querySelector('.dropdown-icons');

  if (downloadBtn && dropdownIcons) {
    downloadBtn.addEventListener('click', () => {
      const isVisible = dropdownIcons.style.display === 'flex';
      dropdownIcons.style.display = isVisible ? 'none' : 'flex';
    });
  }
});






shareScreenBtn.addEventListener('click', async () => {
    try {
        await navigator.mediaDevices.getDisplayMedia({ video: true });
        alert('Écran partagé activé (simulation).');
    } catch (err) {
        console.error(err);
    }
});

recordBtn.addEventListener('click', () => alert('Enregistrement activé (simulation).'));

// Main leve (simulation vizyèl)
mainHandBtn.addEventListener('click', () => {
    mainHandBtn.style.backgroundColor = 'green';
});

// ====================================================
// CHANGER FOND DE CLASSE
// ====================================================
let aiBackgrounds = [
    'url("https://source.unsplash.com/600x400/?avion")',
    'url("https://source.unsplash.com/600x400/?robo")',
    'url("https://source.unsplash.com/600x400/?maison")',
    'url("https://source.unsplash.com/600x400/?ciel")',
    'url("https://source.unsplash.com/600x400/?lame")',
    'url("https://source.unsplash.com/600x400/?decoration")'
];
let currentBgIndex = 0;

function changeBackgroundAI() {
    classroom.style.backgroundImage = aiBackgrounds[currentBgIndex];
    classroom.style.backgroundSize = 'cover';
    classroom.style.backgroundPosition = 'center';
    currentBgIndex = (currentBgIndex + 1) % aiBackgrounds.length;
}

// Listener bouton pou chwazi fon lokal sèlman si bouton egziste
if (changeBgBtn) {
    changeBgBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                classroom.style.backgroundImage = `url(${ev.target.result})`;
                classroom.style.backgroundSize = 'cover';
                classroom.style.backgroundPosition = 'center';
            };
            reader.readAsDataURL(file);
        });

        input.click();
    });
}

// Chanje AI otomatik chak 20 segonn
setInterval(changeBackgroundAI, 20000);
