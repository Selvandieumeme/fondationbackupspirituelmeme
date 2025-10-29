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

// ✅ Nouvo eleman pou pataj ekran
const shareScreenBtn = document.createElement('button');
shareScreenBtn.id = 'share-screen';
shareScreenBtn.textContent = 'Partager écran';
teacherControls.appendChild(shareScreenBtn);

// ✅ Videyo pou ekran pataje
const screenVideo = document.createElement('video');
screenVideo.id = 'screen-video';
screenVideo.autoplay = true;
screenVideo.muted = false; // pa mute paske se screen share
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

// ✅ Pataj ekran (teacher & student)
shareScreenBtn.onclick = async () => {
  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    screenVideo.srcObject = screenStream;

    // Voye stream la bay backend pou tout moun ka wè li
    const [videoTrack] = screenStream.getVideoTracks();
    socket.emit('share-screen', { room: roomCodeInput.value.trim(), trackId: videoTrack.id });

    // Lè moun sispann pataj ekran
    videoTrack.onended = () => {
      socket.emit('stop-share-screen', roomCodeInput.value.trim());
      screenVideo.srcObject = null;
    };
  } catch (err) {
    console.error('Erreur partage écran: ', err);
    alert('Impossible de partager l’écran: ' + err.message);
  }
};

// ✅ Resevwa pataj ekran
socket.on('screen-shared', streamData => {
  if (!screenVideo.srcObject) {
    // Re-create MediaStream object pou moun ki resevwa
    const mediaStream = new MediaStream();
    mediaStream.addTrack(streamData);
    screenVideo.srcObject = mediaStream;
  }
});







// === SCRIPT ELEV ENDÉPANDAN ===
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

      // === Videyo elev ===
      const videoEl = document.createElement('video');
      videoEl.autoplay = true;
      videoEl.muted = false;
      videoEl.classList.add('student');
      videoEl.srcObject = localStream;
      studentVideos.appendChild(videoEl);

      // === Bouton kontwòl pwòp elev yo ===
      const controlsContainer = document.createElement('div');
      controlsContainer.classList.add('student-controls');
      document.getElementById('room-controls').appendChild(controlsContainer);

      // Mute mikro
      const muteMicBtn = document.createElement('button');
      muteMicBtn.textContent = 'Mute Micro';
      muteMicBtn.classList.add('mute-mic');
      controlsContainer.appendChild(muteMicBtn);
      muteMicBtn.addEventListener('click', () => {
        localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      });

      // Mute kamera
      const muteCamBtn = document.createElement('button');
      muteCamBtn.textContent = 'Mute Caméra';
      muteCamBtn.classList.add('mute-cam');
      controlsContainer.appendChild(muteCamBtn);
      muteCamBtn.addEventListener('click', () => {
        localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      });

      // Upload dokiman
      if (uploadDoc) {
        const uploadBtn = document.createElement('button');
        uploadBtn.textContent = 'Téléverser Document';
        uploadBtn.classList.add('upload-doc');
        controlsContainer.appendChild(uploadBtn);

        uploadBtn.addEventListener('click', async () => {
          const file = uploadDoc.files[0];
          if (!file) return alert('Aucun fichier choisi');
          const form = new FormData();
          form.append('document', file);
          try {
            await fetch('/upload-doc', { method: 'POST', body: form });
            alert('📄 Document téléversé avec succès');
          } catch (err) {
            console.error(err);
            alert('Erreur téléversement document');
          }
        });
      }

      // Partager écran
      const shareScreenBtn = document.createElement('button');
      shareScreenBtn.textContent = 'Partager Écran';
      shareScreenBtn.classList.add('share-screen');
      controlsContainer.appendChild(shareScreenBtn);

      shareScreenBtn.addEventListener('click', async () => {
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const screenVideoEl = document.createElement('video');
          screenVideoEl.autoplay = true;
          screenVideoEl.muted = true;
          screenVideoEl.classList.add('student');
          screenVideoEl.srcObject = screenStream;
          studentVideos.appendChild(screenVideoEl);

          screenStream.getTracks().forEach(track => {
            socket.emit('student-stream', { trackId: track.id, kind: track.kind });
          });
        } catch (err) {
          alert('Erreur partage écran: ' + err.message);
        }
      });

      // Voye chak track videyo/mikwo nan server
      localStream.getTracks().forEach(track => {
        socket.emit('student-stream', { trackId: track.id, kind: track.kind });
      });

    } catch (err) {
      alert('Erreur accès caméra/micro elev: ' + err.message);
    }
  });
})();









// === SCRIPT ENDÉPANDAN POU PWOFÈSE ===
(async () => {
  const joinBtn = document.getElementById('join-room');
  const usernameInput = document.getElementById('username');
  const roomCodeInput = document.getElementById('room-code');
  const roleSelect = document.getElementById('role');
  const teacherControls = document.getElementById('teacher-controls');
  const teacherVideo = document.getElementById('teacher-video');
  const uploadDoc = document.getElementById('upload-doc');

  joinBtn.addEventListener('click', async () => {
    if (roleSelect.value !== 'teacher') return;

    const username = usernameInput.value.trim();
    const room = roomCodeInput.value.trim();
    if (!username || !room) return alert('Remplissez tous les champs');

    const socket = io("https://examen-backend-ihlx.onrender.com");
    socket.emit('setUser', { username, role: 'teacher' });
    socket.emit('join-room', room);

    teacherControls.style.display = 'flex';

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      teacherVideo.srcObject = localStream;

      // Mute mikwo pa pwofesè a
      document.getElementById('mute-all').addEventListener('click', () => {
        localStream.getAudioTracks().forEach(track => track.enabled = false);
        socket.emit('mute-all', room);
      });

      // Sispann videyo pa pwofesè a
      document.getElementById('stop-all-video').addEventListener('click', () => {
        localStream.getVideoTracks().forEach(track => track.enabled = false);
        socket.emit('stop-all-video', room);
      });

      // Start Recording
      let recorder, chunks = [];
      document.getElementById('start-rec').addEventListener('click', () => {
        recorder = new MediaRecorder(localStream);
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.start(1000);
        document.getElementById('start-rec').disabled = true;
        document.getElementById('stop-rec').disabled = false;
      });

      // Stop Recording
      document.getElementById('stop-rec').addEventListener('click', async () => {
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
          alert('Erreur téléversement vidéo');
        }
        chunks = [];
        document.getElementById('start-rec').disabled = false;
        document.getElementById('stop-rec').disabled = true;
      });

      // Upload dokiman
      if (uploadDoc) {
        uploadDoc.addEventListener('change', async () => {
          const file = uploadDoc.files[0];
          if (!file) return;
          const form = new FormData();
          form.append('document', file);
          await fetch('/upload-doc', { method: 'POST', body: form });
          alert('📄 Document téléversé avec succès');
        });
      }

      // Pataje ekran pwofesè
      document.getElementById('teacher-controls').insertAdjacentHTML(
        'beforeend',
        `<button id="share-screen" style="margin:6px;padding:10px 14px;border-radius:8px;cursor:pointer;background:#ffd700;color:#0d6efd;font-weight:bold;">Partager Écran</button>`
      );

      document.getElementById('share-screen').addEventListener('click', async () => {
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const screenVideoEl = document.createElement('video');
          screenVideoEl.autoplay = true;
          screenVideoEl.muted = true;
          screenVideoEl.srcObject = screenStream;
          screenVideoEl.style.width = '400px';
          screenVideoEl.style.height = '300px';
          screenVideoEl.style.objectFit = 'cover';
          screenVideoEl.style.border = '3px solid #ff4500';
          screenVideoEl.style.borderRadius = '10px';
          screenVideoEl.style.margin = '5px';
          document.getElementById('video-section').appendChild(screenVideoEl);

          screenStream.getTracks().forEach(track => {
            socket.emit('teacher-stream', { trackId: track.id, kind: track.kind });
          });
        } catch (err) {
          alert('Erreur partage écran: ' + err.message);
        }
      });

      // Voye chak track mikwo/videyo pwofesè
      localStream.getTracks().forEach(track => {
        socket.emit('teacher-stream', { trackId: track.id, kind: track.kind });
      });

    } catch (err) {
      alert('Erreur accès caméra/micro professeur: ' + err.message);
    }
  });
})();
