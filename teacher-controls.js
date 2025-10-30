/* teacher-controls.js
   Simplified real-time class for ~40 students.
   Teacher stream handled via backend (Render + Socket.IO).
*/

const BACKEND = "https://examen-backend-ihlx.onrender.com";
const socket = io(BACKEND, { transports: ['websocket', 'polling'] });

// UI references
const joinBtn = document.getElementById('joinBtn');
const roleSelect = document.getElementById('roleSelect');
const displayName = document.getElementById('displayName');
const classCodeInput = document.getElementById('classCode');
const statusDiv = document.getElementById('status');
const classroom = document.getElementById('classroom');
const controls = document.getElementById('controls');
const videosGrid = document.getElementById('videosGrid');
const presenterVideo = document.getElementById('presenterVideo');
const participantsList = document.getElementById('participantsList');

let isTeacher = false;
let room = null;
let myId = null;

// Only teacher sends stream
joinBtn.addEventListener('click', async () => {
  const role = roleSelect.value;
  const name = displayName.value.trim();
  const code = classCodeInput.value.trim();

  if (!name || !code) {
    statusDiv.textContent = 'Ranpli non ak kòd klas...';
    return;
  }

  room = code;
  isTeacher = role === 'teacher';

  socket.emit('join-room', { room, role, name });
  classroom.classList.remove('hidden');

  if (isTeacher) buildTeacherControls();
});

// Teacher controls
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

  let localStream = null;

  async function startStream() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    presenterVideo.srcObject = localStream;

    // Send tracks to backend
    const streamTracks = [...localStream.getTracks()];
    socket.emit('teacher-stream-ready', { room });
    streamTracks.forEach(track => socket.emit('add-track', { room, kind: track.kind }));
  }

  startStream();

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
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const screenTrack = screen.getVideoTracks()[0];
      socket.emit('teacher-share-screen', { room });
      presenterVideo.srcObject = screen;
    } catch (e) {
      console.error(e);
    }
  };

  document.getElementById('endClass').onclick = () => {
    socket.emit('end-class', { room });
    classroom.classList.add('hidden');
  };
}

// Socket events
socket.on('connect', () => { myId = socket.id; console.log('Connected as', myId); });

// Receive teacher stream for students
socket.on('teacher-stream', streamData => {
  const remoteVideo = document.createElement('video');
  remoteVideo.autoplay = true;
  remoteVideo.playsInline = true;
  remoteVideo.srcObject = streamData; // backend should provide MediaStream
  remoteVideo.classList.add('teacher-stream');
  if (!videosGrid.querySelector('.teacher-stream')) videosGrid.appendChild(remoteVideo);
});

// Update participant list
socket.on('participants', ({ names }) => {
  participantsList.innerHTML = '';
  names.forEach(n => {
    const div = document.createElement('div');
    div.className = 'participant-item';
    div.textContent = n;
    participantsList.appendChild(div);
  });
});
