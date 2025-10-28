const socket = io("https://examen-backend-ihlx.onrender.com");

let localStream, recorder, chunks = [];

const joinBtn = document.getElementById('join-room');
const roomCodeInput = document.getElementById('room-code');
const usernameInput = document.getElementById('username');
const roleSelect = document.getElementById('role');
const teacherControls = document.getElementById('teacher-controls');
const teacherVideo = document.getElementById('teacher-video');
const studentVideos = document.getElementById('student-videos');
const muteAllBtn = document.getElementById('mute-all');
const stopAllBtn = document.getElementById('stop-all-video');
const startRecBtn = document.getElementById('start-rec');
const stopRecBtn = document.getElementById('stop-rec');
const uploadDoc = document.getElementById('upload-doc');
const messages = document.getElementById('messages');
const msgInput = document.getElementById('msg');
const sendBtn = document.getElementById('send');

// ✅ Konekte nan sal la
joinBtn.onclick = async () => {
  const room = roomCodeInput.value.trim();
  const username = usernameInput.value.trim();
  const role = roleSelect.value;

  if (!room || !username) return alert('Remplissez tous les champs');

  socket.emit('setUser', { username, role });
  socket.emit('join-room', room);

  if (role === 'teacher') teacherControls.style.display = 'block';

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    teacherVideo.srcObject = localStream;
  } catch (err) {
    alert('Erreur d’accès caméra/micro: ' + err.message);
  }
};

// ✅ Bouton pwofesè yo
muteAllBtn.onclick = () => socket.emit('mute-all', roomCodeInput.value.trim());
stopAllBtn.onclick = () => socket.emit('stop-all-video', roomCodeInput.value.trim());

// ✅ Anrejistreman videyo
startRecBtn.onclick = () => {
  if (!localStream) return alert('Activez la caméra d’abord');
  recorder = new MediaRecorder(localStream);
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.start(1000);
  startRecBtn.disabled = true;
  stopRecBtn.disabled = false;
};

stopRecBtn.onclick = async () => {
  if (!recorder) return;
  recorder.stop();
  const blob = new Blob(chunks, { type: 'video/webm' });
  const form = new FormData();
  form.append('file', blob, 'session.webm');
  await fetch('./upload-recording', { method: 'POST', body: form });
  chunks = [];
  startRecBtn.disabled = false;
  stopRecBtn.disabled = true;
};

// ✅ Upload dokiman
uploadDoc.onchange = async () => {
  const file = uploadDoc.files[0];
  if (!file) return;
  const form = new FormData();
  form.append('document', file);
  await fetch('./upload-doc', { method: 'POST', body: form });
  alert('📄 Document téléversé avec succès');
};

// ✅ Chat
sendBtn.onclick = () => {
  const text = msgInput.value.trim();
  if (!text) return;
  const from = usernameInput.value.trim();
  socket.emit('chat-message', { from, message: text });
  const li = document.createElement('li');
  li.textContent = 'Vous: ' + text;
  messages.appendChild(li);
  msgInput.value = '';
};

// ✅ Resevwa mesaj
socket.on('chat-message', data => {
  const li = document.createElement('li');
  li.textContent = `${data.from}: ${data.message}`;
  messages.appendChild(li);
});

// ✅ Kontwòl pwofesè yo
socket.on('mute-mic', () => {
  if (localStream) localStream.getAudioTracks().forEach(t => (t.enabled = false));
});
socket.on('stop-video', () => {
  if (localStream) localStream.getVideoTracks().forEach(t => (t.enabled = false));
});
