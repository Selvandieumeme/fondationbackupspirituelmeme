/* teacher-controls.js
   Full RTC mesh for teacher, optimized for ~40 students.
   Teacher can use camera + mic, all students see/hear teacher in real-time.
*/

const BACKEND = "https://examen-backend-ihlx.onrender.com";
const socket = io(BACKEND, { transports: ['websocket', 'polling'] });

// UI refs
const joinBtn = document.getElementById('joinBtn');
const roleSelect = document.getElementById('roleSelect');
const displayName = document.getElementById('displayName');
const classCodeInput = document.getElementById('classCode');
const statusDiv = document.getElementById('status');
const classroom = document.getElementById('classroom');
const controls = document.getElementById('controls');
const videosGrid = document.getElementById('videosGrid');

let localStream = null;
let room = null;
let myId = null;
let pcs = {}; // peerId -> RTCPeerConnection
let remoteStreams = {}; // peerId -> MediaStream

const RTC_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// Start teacher media
async function startTeacherStream() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const presenterVideo = document.getElementById('presenterVideo');
    presenterVideo.srcObject = localStream;
  } catch (err) {
    console.error("Pa jwenn aksè kamera/mikwo", err);
    statusDiv.textContent = 'Pa jwenn aksè kamera/mikwo. Tcheke pèmisyon.';
  }
}

// Build teacher buttons
function buildTeacherControls() {
  controls.innerHTML = '';
  const buttons = [
    ['toggleMic', 'Mikwo'],
    ['toggleCam', 'Kamera'],
    ['shareScreen', 'Pataje ekran'],
    ['endClass', 'Finir la classe']
  ];
  buttons.forEach(([id, label]) => {
    const btn = document.createElement('button');
    btn.id = id;
    btn.textContent = label;
    controls.appendChild(btn);
  });

  document.getElementById('toggleMic').onclick = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
  };

  document.getElementById('toggleCam').onclick = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
  };

  document.getElementById('shareScreen').onclick = async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screen.getVideoTracks()[0];
      // Replace video track in all peer connections
      Object.values(pcs).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) sender.replaceTrack(screenTrack);
      });
      document.getElementById('presenterVideo').srcObject = screen;
    } catch (e) { console.error(e); }
  };

  document.getElementById('endClass').onclick = () => {
    socket.emit('end-class', { room });
    classroom.classList.add('hidden');
  };
}

// Join classroom
joinBtn.addEventListener('click', async () => {
  const role = roleSelect.value;
  const name = displayName.value.trim();
  const code = classCodeInput.value.trim();
  if (!name || !code) { statusDiv.textContent = 'Ranpli non ak kòd klas...'; return; }

  room = code;
  await startTeacherStream();
  classroom.classList.remove('hidden');
  buildTeacherControls();

  socket.emit('join-room', { room, role, name });
});

socket.on('connect', () => { myId = socket.id; console.log('Connected as', myId); });

// Peer connection handling
socket.on('participants', async ({ ids }) => {
  for (const pid of ids) {
    if (pid === myId) continue;
    await createPeerConnection(pid, true);
  }
});

socket.on('webrtc-offer', async ({ from, description }) => {
  const pc = await createPeerConnection(from, false);
  await pc.setRemoteDescription(new RTCSessionDescription(description));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit('webrtc-answer', { to: from, description: pc.localDescription });
});

socket.on('webrtc-answer', async ({ from, description }) => {
  const pc = pcs[from];
  if (!pc) return;
  await pc.setRemoteDescription(new RTCSessionDescription(description));
});

socket.on('ice-candidate', async ({ from, candidate }) => {
  const pc = pcs[from];
  if (!pc) return;
  await pc.addIceCandidate(new RTCIceCandidate(candidate));
});

async function createPeerConnection(peerId, isInitiator) {
  if (pcs[peerId]) return pcs[peerId];
  const pc = new RTCPeerConnection(RTC_CONFIG);
  pcs[peerId] = pc;
  const remoteStream = new MediaStream();
  remoteStreams[peerId] = remoteStream;

  pc.onicecandidate = e => { if (e.candidate) socket.emit('ice-candidate', { to: peerId, candidate: e.candidate }); };
  pc.ontrack = e => {
    remoteStream.addTrack(e.track);
    attachRemoteStream(peerId, remoteStream);
  };

  if (localStream) localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  if (isInitiator) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('webrtc-offer', { to: peerId, description: pc.localDescription });
  }

  return pc;
}

function attachRemoteStream(peerId, stream) {
  let tile = videosGrid.querySelector(`.participant[data-id="${peerId}"]`);
  if (!tile) {
    tile = document.createElement('div');
    tile.className = 'participant';
    tile.dataset.id = peerId;
    const vid = document.createElement('video');
    vid.autoplay = true;
    vid.playsInline = true;
    tile.appendChild(vid);
    videosGrid.appendChild(tile);
  }
  const vid = tile.querySelector('video');
  if (vid.srcObject !== stream) vid.srcObject = stream;
}
