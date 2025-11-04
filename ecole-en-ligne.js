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
    // Jenere nouvo code otomatikman pou pwofese chak fwa li chwazi wòl teacher
    if(roleSelect.value === 'teacher') {
      roomCodeInput.value = generateRoomCode();
    } else {
      roomCodeInput.value = '';
    }
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
// Bouton "Rejoindre" avec gestion réelle de connexion
// ====================================================
joinBtn.addEventListener('click', async () => {
  const name = fullNameInput.value.trim();
  const enteredRoom = roomCodeInput.value.trim();
  const oldRoom = oldRoomCodeInput.value.trim();
  role = roleSelect.value;

  if (!name || !enteredRoom) {
    alert("Veuillez remplir tous les champs obligatoires.");
    return;
  }

  // ✅ Bloque bouton pou evite double klik
  joinBtn.disabled = true;
  const originalText = joinBtn.textContent;
  joinBtn.textContent = "Connexion en cours...";

  // ====================================================
  // Définir la salle selon rôle
  // ====================================================
  if (role === 'teacher') {
    room = oldRoom ? oldRoom : enteredRoom;
  } else {
    room = enteredRoom;
  }

  try {
    if (role === 'teacher') {
      // 👩‍🏫 Professeur: antre dirèkteman
      socket.timeout(5000).emit('joinRoom', { room, name, role }, async (response) => {
        joinBtn.disabled = false;
        joinBtn.textContent = originalText;

        if (!response) {
          alert("Aucune réponse du serveur.");
          return;
        }

        if (response.status === "ok") {
          await initLocalStream();
          openClassroomUI();
          teacherControlsInit(socket, localStream);
        } else {
          alert("Erreur: " + (response.message || "Connexion échouée"));
        }
      });
    } else {
      // 🎓 Élève: demande d’accès, pwofesè dwe aksepte
      socket.timeout(5000).emit('requestJoinRoom', { room, name, role }, async (response) => {
        joinBtn.disabled = false;
        joinBtn.textContent = originalText;

        if (!response) {
          alert("Aucune réponse du serveur.");
          return;
        }

        if (response.status === "pending") {
          alert("En attente d'approbation du professeur...");
        } else if (response.status === "ok") {
          await initLocalStream();
          openClassroomUI();
          studentControlsInit(socket, localStream);
        } else {
          alert("Erreur: " + (response.message || "Connexion échouée"));
        }
      });
    }
  } catch (err) {
    console.warn("Backend non disponible. Mode local activé.");
    joinBtn.disabled = false;
    joinBtn.textContent = originalText;
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
      socket.timeout(5000).emit('joinRoom', { room, name, role }, async () => {
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

  

  // ====================================================
  // Reception d'une acceptation du professeur
  // ====================================================
  socket.on('studentAccepted', async () => {
    await initLocalStream();
    openClassroomUI();
    studentControlsInit(socket, localStream);
  });

  // ====================================================
  // Reception d'un refus du professeur
  // ====================================================
  socket.on('studentRejected', () => {
    alert('Votre accès a été refusé par le professeur.');
  });



// ====================================================
// 🔹 MODAL DEMANDE D'ACCÈS ÉLÈVE (Interface professeur)
// ====================================================

// Créer la structure du modal (invisible par défaut)
const accessModal = document.createElement('div');
accessModal.id = 'student-access-modal';
accessModal.style.cssText = `
  display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.6); z-index: 9999; justify-content: center; align-items: center;
`;

accessModal.innerHTML = `
  <div style="
    background: #fff; padding: 25px; border-radius: 12px; width: 320px; text-align: center;
    box-shadow: 0 0 20px rgba(0,0,0,0.2); font-family: 'Poppins', sans-serif;">
    <h3 id="studentNameTitle" style="margin-bottom: 20px;">Nouvel élève</h3>
    <button id="acceptStudentBtn" style="background:#28a745;color:white;border:none;padding:10px 15px;margin-right:10px;border-radius:8px;cursor:pointer;">Accepter</button>
    <button id="rejectStudentBtn" style="background:#dc3545;color:white;border:none;padding:10px 15px;border-radius:8px;cursor:pointer;">Refuser</button>
  </div>
`;
document.body.appendChild(accessModal);

const studentNameTitle = document.getElementById('studentNameTitle');
const acceptStudentBtn = document.getElementById('acceptStudentBtn');
const rejectStudentBtn = document.getElementById('rejectStudentBtn');

let pendingStudent = null; // sauvegarde temporaire du nom + id

// Quand le backend envoie une demande d'accès d'un élève
socket.on('studentJoinRequest', ({ name, id }) => {
  if(role !== 'teacher') return;
  pendingStudent = { name, id };
  studentNameTitle.textContent = `${name} demande à rejoindre la salle`;
  accessModal.style.display = 'flex';
});

// Boutons de décision du professeur
acceptStudentBtn.onclick = () => {
  if (pendingStudent) socket.emit('acceptStudent', { id: pendingStudent.id });
  accessModal.style.display = 'none';
  pendingStudent = null;
};

rejectStudentBtn.onclick = () => {
  if (pendingStudent) socket.emit('rejectStudent', { id: pendingStudent.id });
  accessModal.style.display = 'none';
  pendingStudent = null;
};





  // ====================================================
// 🎓 Gestion dynamique de la liste des élèves connectés
// ====================================================

// Conteneur de la liste des élèves (panel à droite)
const studentPanel = document.getElementById('student-list');

// Fonction pour créer un élément visuel d'élève
function createStudentListItem(name, status = 'online') {
  const studentItem = document.createElement('div');
  studentItem.classList.add('student-item');
  studentItem.innerHTML = `
    <div class="student-entry">
      <span class="student-name">${name}</span>
      <span class="student-status ${status === 'online' ? 'online' : 'offline'}"></span>
    </div>
  `;
  return studentItem;
}

// Mettre à jour l'état (online/offline) d'un élève existant
function updateStudentStatus(name, status) {
  const items = studentPanel.querySelectorAll('.student-name');
  items.forEach(item => {
    if (item.textContent === name) {
      const statusDot = item.parentElement.querySelector('.student-status');
      statusDot.className = `student-status ${status}`;
    }
  });
}

// Ajouter élève dans la liste quand accepté
socket.on('studentAccepted', ({ name }) => {
  const existing = [...studentPanel.querySelectorAll('.student-name')]
    .some(item => item.textContent === name);

  if (!existing) {
    const newStudent = createStudentListItem(name, 'online');
    studentPanel.appendChild(newStudent);
  }

  // Activer scroll automatique si >5 élèves
  if (studentPanel.children.length > 5) {
    studentPanel.style.overflowY = 'auto';
    studentPanel.style.maxHeight = '200px';
  }
});

// Mettre élève offline si déconnecté
socket.on('studentDisconnected', ({ name }) => {
  updateStudentStatus(name, 'offline');
});









  // ====================================================
// 🔔 Notification & Sound System for New Student Requests
// ====================================================

// --- 1. Kreye son notifikasyon (beep le yon elèv mande aksè)
const accessSound = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_7b0e82adab.mp3?filename=notification-3-126517.mp3');

// --- 2. Fonksyon pou montre notifikasyon vizyèl bèl
function showAccessNotification(studentName) {
  let notif = document.createElement('div');
  notif.className = 'student-access-notif';
  notif.innerHTML = `🎓 Nouvo elèv mande aksè: <strong>${studentName}</strong>`;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 5000);
}

// --- 3. Koute evènman socket pou nouvo elèv kap mande antre
socket.on('student-request-access', (studentName) => {
  accessSound.play().catch(() => {}); // jwe ti son an
  showAccessNotification(studentName); // montre notifikasyon vizyèl la
});

// --- 4. Konekte bouton "Accepter" ak lis elèv ki konekte nan panel dwat la
function acceptStudent(studentName, socketId) {
  // Emit si pwofesè a aksepte elèv la
  socket.emit('teacher-accept-student', { name: studentName, id: socketId });

  // Ajoute elèv la nan lis "Online Students" nan 2èm seksyon panel dwat la
  const studentListSection = document.querySelector('#student-list');
  if (studentListSection) {
    const li = document.createElement('li');
    li.className = 'student-online';
    li.innerHTML = `
      <span class="dot online"></span> ${studentName}
    `;
    studentListSection.appendChild(li);
  }

  // Si gen plis pase 5 elèv, aktive scroll otomatik
  if (studentListSection && studentListSection.children.length > 5) {
    studentListSection.style.overflowY = 'auto';
    studentListSection.style.maxHeight = '180px';
  }
}

// --- 5. Koute repons bouton “Accepter” yo
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('accept-btn')) {
    const studentName = e.target.dataset.name;
    const studentId = e.target.dataset.id;
    acceptStudent(studentName, studentId);
    e.target.disabled = true;
    e.target.textContent = "✅ Accepté";
  }
});
  
});
