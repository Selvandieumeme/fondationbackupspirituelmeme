// ✅ Koneksyon Socket.io avèk backend prensipal la
const socket = io("https://examen-backend-ihlx.onrender.com");

// ✅ Deklarasyon varyab prensipal yo
let localStream, recorder, chunks = [];

// ✅ Seleksyon tout eleman HTML yo
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

// ✅ Antre nan sal la
joinBtn.onclick = async () => {
  const room = roomCodeInput.value.trim();
  const username = usernameInput.value.trim();
  const role = roleSelect.value;

  if (!room || !username) {
    alert('Remplissez tous les champs');
    return;
  }

  socket.emit('setUser', { username, role });
  socket.emit('join-room', room);

  if (role === 'teacher') {
    teacherControls.style.display = 'block';
  }

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    teacherVideo.srcObject = localStream;
  } catch (err) {
    alert('Erreur d’accès caméra/micro: ' + err.message);
  }
};

// ✅ Bouton pwofesè yo
muteAllBtn.onclick = () => {
  const room = roomCodeInput.value.trim();
  if (room) socket.emit('mute-all', room);
};

stopAllBtn.onclick = () => {
  const room = roomCodeInput.value.trim();
  if (room) socket.emit('stop-all-video', room);
};

// ✅ Anrejistreman videyo sesyon an
startRecBtn.onclick = () => {
  if (!localStream) {
    alert('Activez la caméra d’abord');
    return;
  }
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

  try {
    await fetch('/upload-recording', { method: 'POST', body: form });
    alert('🎥 Enregistrement sauvegardé avec succès');
  } catch (e) {
    console.error(e);
    alert('Erreur pendant le téléversement de la vidéo');
  }

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

  try {
    await fetch('/upload-doc', { method: 'POST', body: form });
    alert('📄 Document téléversé avec succès');
  } catch (err) {
    console.error(err);
    alert('Erreur pendant le téléversement du document');
  }
};

// ✅ Chat — voye mesaj
sendBtn.onclick = () => {
  const text = msgInput.value.trim();
  if (!text) return;

  const from = usernameInput.value.trim();
  socket.emit('chat-message', { from, message: text });

  const li = document.createElement('li');
  li.textContent = `Vous: ${text}`;
  messages.appendChild(li);
  msgInput.value = '';
};

// ✅ Resevwa mesaj
socket.on('chat-message', data => {
  const li = document.createElement('li');
  li.textContent = `${data.from}: ${data.message}`;
  messages.appendChild(li);
});

// ✅ Kontwòl pwofesè yo (mute ak sispann videyo)
socket.on('mute-mic', () => {
  if (localStream) {
    localStream.getAudioTracks().forEach(track => (track.enabled = false));
  }
});

socket.on('stop-video', () => {
  if (localStream) {
    localStream.getVideoTracks().forEach(track => (track.enabled = false));
  }
});
