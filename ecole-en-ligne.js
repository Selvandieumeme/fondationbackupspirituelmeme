// === ECOLE-EN-LIGNE.JS (VERSION 2025 OPTIMISÉE) ===

const BACKEND_URL = "https://examen-backend-ihlx.onrender.com";
const socket = io(BACKEND_URL, { transports: ["websocket", "polling"] });

// ÉTATS GLOBAUX
let localStream = null;
let role = null;
let username = null;
let room = null;
const pcMap = new Map();

// === CONFIGURATION ICE SERVERS ===
const RTC_CONFIG = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

// === CRÉATION D’UNE VIDÉO DISTANTE ===
function createRemoteVideo(id, label) {
  const container = document.getElementById("student-videos") || document.body;
  let v = document.getElementById("remote-" + id);
  if (!v) {
    v = document.createElement("video");
    v.id = "remote-" + id;
    v.autoplay = true;
    v.playsInline = true;
    v.controls = false;
    v.muted = false;
    v.style.width = "240px";
    v.style.height = "180px";
    v.style.border = "3px solid #0d6efd";
    v.style.borderRadius = "8px";
    v.style.background = "#000";
    if (label) v.setAttribute("data-name", label);
    container.appendChild(v);
  }
  return v;
}

function removeRemoteVideo(id) {
  const el = document.getElementById("remote-" + id);
  if (el && el.parentElement) el.parentElement.removeChild(el);
}

// === CRÉATION DE CONNEXION PEER ===
function createPeerConnection(remoteId, isOfferer, remoteName = '') {
  if (pcMap.has(remoteId)) return pcMap.get(remoteId);
  const pc = new RTCPeerConnection(RTC_CONFIG);

  // 🔊 Envoi du flux local (audio + vidéo)
  if (localStream) {
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  }

  const remoteStream = new MediaStream();
  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach(t => remoteStream.addTrack(t));
    const v = createRemoteVideo(remoteId, remoteName);
    v.srcObject = remoteStream;
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) socket.emit('webrtc-ice', { to: remoteId, candidate: event.candidate });
  };

  pc.onconnectionstatechange = () => {
    if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
      try { pc.close(); } catch(e){}
      pcMap.delete(remoteId);
      removeRemoteVideo(remoteId);
    }
  };

  pcMap.set(remoteId, pc);
  return pc;
}

// === INITIALISATION STREAM LOCAL ===
async function initLocalStream() {
  try {
    if (!localStream) {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    }
    const tv = document.getElementById('teacher-video');
    if (tv && role === 'teacher') {
      tv.srcObject = localStream;
      tv.muted = true;
      await tv.play().catch(()=>{});
    }
  } catch (err) {
    console.error("Erreur accès caméra/micro:", err);
    alert("Impossible d'accéder à la caméra ou au micro: " + err.message);
  }
}

// === GESTION DU JOIN BUTTON ===
document.getElementById('join-btn').addEventListener('click', async () => {
  role = document.getElementById('role').value;
  username = document.getElementById('username').value.trim();
  room = document.getElementById('room-code').value.trim();

  if (!username || !room) return alert('Veuillez remplir tous les champs.');

  await initLocalStream();

  socket.emit('setUser', { username, role });
  socket.emit('join-room', { room, role, username });

  // === CHARGEMENT DES CONTROLES SELON LE ROLE ===
  if (role === 'teacher') {
    await loadScriptOnce('teacher-controls.js');
    if (window.TeacherControls) {
      window.TeacherControls.init({
        socket,
        room,
        username,
        getLocalStream: async () => localStream,
        ui: {
          controlsContainer: '#teacher-controls',
          pendingContainer: '#pending-students',
          videoSection: '#video-section'
        }
      });
      document.getElementById('teacher-controls').style.display = 'flex';
    }
  } else {
    await loadScriptOnce('student-controls.js');
    if (window.StudentControls) {
      window.StudentControls.init({
        socket,
        room,
        username,
        getLocalStream: async () => localStream,
        ui: {
          videoSection: '#video-section',
          chatInputSelector: '#msg'
        }
      });
    }
  }

  // === AFFICHAGE DES SECTIONS ===
  document.getElementById('room-controls').style.display = 'none';
  document.getElementById('video-section').style.display = 'flex';
  document.getElementById('chat-section').style.display = 'block';
});

// === CHARGEMENT UNIQUE DES SCRIPTS ===
const loadedScripts = new Set();
function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (loadedScripts.has(src)) return resolve();
    const s = document.createElement('script');
    s.src = src + '?v=' + Date.now();
    s.onload = () => { loadedScripts.add(src); resolve(); };
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

// === SIGNALISATION WEBRTC ===
socket.on('student-joined', async (data) => {
  const sid = data.socketId || data.id;
  const uname = data.username || '';
  if (!sid || role !== 'teacher') return;

  const pc = createPeerConnection(sid, true, uname);
  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('webrtc-offer', { to: sid, sdp: pc.localDescription });
  } catch (err) {
    console.error('Erreur lors de la création de l’offre:', err);
  }
});

socket.on('webrtc-offer', async ({ fromSocketId, sdp, username: remoteName }) => {
  const pc = createPeerConnection(fromSocketId, false, remoteName);
  await initLocalStream();

  localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit('webrtc-answer', { to: fromSocketId, sdp: pc.localDescription });
});

socket.on('webrtc-answer', async ({ fromSocketId, sdp }) => {
  const pc = pcMap.get(fromSocketId);
  if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
});

socket.on('webrtc-ice', async ({ fromSocketId, candidate }) => {
  const pc = pcMap.get(fromSocketId);
  if (pc && candidate) {
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn("ICE candidate error:", err);
    }
  }
});

socket.on('user-left', (sid) => {
  if (pcMap.has(sid)) {
    try { pcMap.get(sid).close(); } catch(e){}
    pcMap.delete(sid);
    removeRemoteVideo(sid);
  }
});

// === CHAT SYSTEM ===
const chatForm = document.getElementById('chat-form');
const messagesBox = document.getElementById('messages');
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = document.getElementById('msg').value.trim();
  if (!text) return;
  socket.emit('chat-message', { room, from: username, message: text });
  document.getElementById('msg').value = '';
});

socket.on('chat-message', (data) => {
  const li = document.createElement('li');
  li.textContent = `${data.from}: ${data.message}`;
  messagesBox.appendChild(li);
  messagesBox.scrollTop = messagesBox.scrollHeight;
});

// === CONNEXION SOCKET ===
socket.on('connect', () => console.log('✅ Connecté au backend Render'));
socket.on('disconnect', () => console.warn('⚠️ Déconnecté du backend Render'));
