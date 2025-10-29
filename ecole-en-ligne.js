// ✅ Koneksyon Socket.io avèk backend prensipal la
const socket = io("https://examen-backend-ihlx.onrender.com");

// ✅ Deklarasyon varyab prensipal yo
let localStream, screenStream, recorder, chunks = [];

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

// ✅ Bouton pataj ekran
const shareScreenBtn = document.createElement('button');
shareScreenBtn.id = 'share-screen';
shareScreenBtn.textContent = 'Partager écran';
teacherControls.appendChild(shareScreenBtn);

// ✅ Videyo pou ekran pataje
const screenVideo = document.createElement('video');
screenVideo.id = 'screen-video';
screenVideo.autoplay = true;
screenVideo.muted = false;
screenVideo.playsInline = true;
document.getElementById('video-section').appendChild(screenVideo);

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

    // 🔊 Voye track pwofesè yo
    localStream.getTracks().forEach(track => {
      socket.emit('teacher-stream', { trackId: track.id, kind: track.kind });
    });

  } catch (err) {
    alert('Erreur d’accès caméra/micro: ' + err.message);
  }
};

// ✅ Kontwòl pwofesè yo
muteAllBtn.onclick = () => {
  const room = roomCodeInput.value.trim();
  if (room) socket.emit('mute-all', room);
};

stopAllBtn.onclick = () => {
  const room = roomCodeInput.value.trim();
  if (room) socket.emit('stop-all-video', room);
};

// ✅ Anrejistreman sesyon
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
  try {
    await fetch('/upload-recording', { method: 'POST', body: form });
    alert('🎥 Enregistrement sauvegardé avec succès');
  } catch {
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
  } catch {
    alert('Erreur téléversement document');
  }
};

// ✅ Chat
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

socket.on('chat-message', data => {
  const li = document.createElement('li');
  li.textContent = `${data.from}: ${data.message}`;
  messages.appendChild(li);
});

// ✅ Kontwòl pwofesè sou elev
socket.on('mute-mic', () => {
  if (localStream) localStream.getAudioTracks().forEach(t => (t.enabled = false));
});
socket.on('stop-video', () => {
  if (localStream) localStream.getVideoTracks().forEach(t => (t.enabled = false));
});

// ✅ Pataj ekran
shareScreenBtn.onclick = async () => {
  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    screenVideo.srcObject = screenStream;
    const [videoTrack] = screenStream.getVideoTracks();
    socket.emit('share-screen', { room: roomCodeInput.value.trim(), trackId: videoTrack.id });
    videoTrack.onended = () => {
      socket.emit('stop-share-screen', roomCodeInput.value.trim());
      screenVideo.srcObject = null;
    };
  } catch (err) {
    alert('Impossible de partager l’écran: ' + err.message);
  }
};

socket.on('screen-shared', streamData => {
  if (!screenVideo.srcObject) {
    const mediaStream = new MediaStream();
    mediaStream.addTrack(streamData);
    screenVideo.srcObject = mediaStream;
  }
});

// ============================================================
// === SCRIPT ELEV: menm jan ak avan (rete entak)
// ============================================================
(async () => {
  const joinBtn = document.getElementById('join-room');
  const usernameInput = document.getElementById('username');
  const roomCodeInput = document.getElementById('room-code');
  const roleSelect = document.getElementById('role');
  const studentVideos = document.getElementById('student-videos');
  const uploadDoc = document.getElementById('upload-doc');

  joinBtn.addEventListener('click', async () => {
    if (roleSelect.value !== 'student') return;
    const username = usernameInput.value.trim();
    const room = roomCodeInput.value.trim();
    if (!username || !room) return alert('Remplissez tous les champs');

    const socket = io("https://examen-backend-ihlx.onrender.com");
    socket.emit('setUser', { username, role: 'student' });
    socket.emit('join-room', room);

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      const videoEl = document.createElement('video');
      videoEl.autoplay = true;
      videoEl.muted = false;
      videoEl.classList.add('student');
      videoEl.srcObject = localStream;
      studentVideos.appendChild(videoEl);

      // Bouton kontwòl yo
      const controls = document.createElement('div');
      controls.classList.add('student-controls');
      document.getElementById('room-controls').appendChild(controls);

      const muteMicBtn = document.createElement('button');
      muteMicBtn.textContent = 'Mute Micro';
      controls.appendChild(muteMicBtn);
      muteMicBtn.onclick = () => {
        localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
      };

      const muteCamBtn = document.createElement('button');
      muteCamBtn.textContent = 'Mute Caméra';
      controls.appendChild(muteCamBtn);
      muteCamBtn.onclick = () => {
        localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
      };

      localStream.getTracks().forEach(track => {
        socket.emit('student-stream', { trackId: track.id, kind: track.kind });
      });

    } catch (err) {
      alert('Erreur accès caméra/micro élève: ' + err.message);
    }
  });
})();

// ============================================================
// === SCRIPT PWOFÈ: KORIJÉ AK SOUTI MIKWO ===
// ============================================================
(async () => {
  const joinBtn = document.getElementById('join-room');
  const usernameInput = document.getElementById('username');
  const roomCodeInput = document.getElementById('room-code');
  const roleSelect = document.getElementById('role');
  const teacherControls = document.getElementById('teacher-controls');
  const teacherVideo = document.getElementById('teacher-video');
  const uploadDoc = document.getElementById('upload-doc');
  const studentVideos = document.getElementById('student-videos');

  joinBtn.addEventListener('click', async () => {
    if (roleSelect.value !== 'teacher') return;
    const username = usernameInput.value.trim();
    const room = roomCodeInput.value.trim();
    if (!username || !room) return;

    const socket = io("https://examen-backend-ihlx.onrender.com");
    socket.emit('setUser', { username, role: 'teacher' });
    socket.emit('join-room', room);

    teacherControls.style.display = 'flex';

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      teacherVideo.srcObject = localStream;

      // 🔊 Pwofesè ap tande elèv yo
      socket.on('new-student-stream', ({ userId, trackId, kind }) => {
        const audioEl = document.createElement(kind === 'audio' ? 'audio' : 'video');
        audioEl.autoplay = true;
        audioEl.controls = false;
        audioEl.classList.add('student');
        studentVideos.appendChild(audioEl);
      });

      // 🎤 Bouton kontwòl
      const muteMicBtn = document.createElement('button');
      muteMicBtn.textContent = 'Mute Micro';
      teacherControls.appendChild(muteMicBtn);
      muteMicBtn.onclick = () => {
        localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
      };

      const muteCamBtn = document.createElement('button');
      muteCamBtn.textContent = 'Mute Caméra';
      teacherControls.appendChild(muteCamBtn);
      muteCamBtn.onclick = () => {
        localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
      };

      // Voye stream pwofesè a bay elèv yo
      localStream.getTracks().forEach(track => {
        socket.emit('teacher-stream', { trackId: track.id, kind: track.kind });
      });

    } catch (err) {
      alert('Erreur caméra/micro professeur: ' + err.message);
    }
  });
})();
