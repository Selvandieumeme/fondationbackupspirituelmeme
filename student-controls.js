// student-controls.js
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

    // Socket.io koneksyon
    const socket = io("https://examen-backend-ihlx.onrender.com");
    socket.emit('setUser', { username, role: 'student' });
    socket.emit('join-room', room);

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      // Kreye videyo elev
      const videoEl = document.createElement('video');
      videoEl.autoplay = true;
      videoEl.muted = false;
      videoEl.srcObject = localStream;
      videoEl.style.width = '250px';
      videoEl.style.height = '180px';
      videoEl.style.objectFit = 'cover';
      videoEl.style.border = '3px solid #0d6efd';
      videoEl.style.borderRadius = '10px';
      videoEl.style.margin = '5px';
      studentVideos.appendChild(videoEl);

      // Kontwòl pwòp medya elev
      const controlsContainer = document.createElement('div');
      controlsContainer.style.display = 'flex';
      controlsContainer.style.flexWrap = 'wrap';
      controlsContainer.style.justifyContent = 'center';
      controlsContainer.style.margin = '10px';
      document.getElementById('room-controls').appendChild(controlsContainer);

      // Bouton mute mikwo
      const muteMicBtn = document.createElement('button');
      muteMicBtn.textContent = 'Mute Micro';
      muteMicBtn.style.margin = '6px';
      muteMicBtn.style.padding = '10px 14px';
      muteMicBtn.style.borderRadius = '8px';
      muteMicBtn.style.cursor = 'pointer';
      muteMicBtn.style.background = '#ffd700';
      muteMicBtn.style.color = '#0d6efd';
      controlsContainer.appendChild(muteMicBtn);
      muteMicBtn.addEventListener('click', () => {
        localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
        muteMicBtn.textContent = localStream.getAudioTracks()[0].enabled ? 'Mute Micro' : 'Unmute Micro';
      });

      // Bouton mute kamera
      const muteCamBtn = document.createElement('button');
      muteCamBtn.textContent = 'Mute Caméra';
      muteCamBtn.style.margin = '6px';
      muteCamBtn.style.padding = '10px 14px';
      muteCamBtn.style.borderRadius = '8px';
      muteCamBtn.style.cursor = 'pointer';
      muteCamBtn.style.background = '#ffd700';
      muteCamBtn.style.color = '#0d6efd';
      controlsContainer.appendChild(muteCamBtn);
      muteCamBtn.addEventListener('click', () => {
        localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
        muteCamBtn.textContent = localStream.getVideoTracks()[0].enabled ? 'Mute Caméra' : 'Unmute Caméra';
      });

      // Upload dokiman elev
      if (uploadDoc) {
        const uploadBtn = document.createElement('button');
        uploadBtn.textContent = 'Upload Document';
        uploadBtn.style.margin = '6px';
        uploadBtn.style.padding = '10px 14px';
        uploadBtn.style.borderRadius = '8px';
        uploadBtn.style.cursor = 'pointer';
        uploadBtn.style.background = '#ffd700';
        uploadBtn.style.color = '#0d6efd';
        controlsContainer.appendChild(uploadBtn);
        uploadBtn.addEventListener('click', () => uploadDoc.click());

        uploadDoc.addEventListener('change', async () => {
          const file = uploadDoc.files[0];
          if (!file) return;
          const form = new FormData();
          form.append('document', file);
          await fetch('https://examen-backend-ihlx.onrender.com/upload-doc', { method: 'POST', body: form });
          alert('📄 Document uploaded');
        });
      }

      // Partage ekran elev
      const shareScreenBtn = document.createElement('button');
      shareScreenBtn.textContent = 'Partager Écran';
      shareScreenBtn.style.margin = '6px';
      shareScreenBtn.style.padding = '10px 14px';
      shareScreenBtn.style.borderRadius = '8px';
      shareScreenBtn.style.cursor = 'pointer';
      shareScreenBtn.style.background = '#ffd700';
      shareScreenBtn.style.color = '#0d6efd';
      controlsContainer.appendChild(shareScreenBtn);

      shareScreenBtn.addEventListener('click', async () => {
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const screenVideoEl = document.createElement('video');
          screenVideoEl.autoplay = true;
          screenVideoEl.muted = true;
          screenVideoEl.srcObject = screenStream;
          screenVideoEl.style.width = '300px';
          screenVideoEl.style.height = '200px';
          screenVideoEl.style.objectFit = 'cover';
          screenVideoEl.style.border = '3px solid #ff4500';
          screenVideoEl.style.borderRadius = '10px';
          screenVideoEl.style.margin = '5px';
          studentVideos.appendChild(screenVideoEl);

          // Emèt pou backend (Render + MongoDB)
          screenStream.getTracks().forEach(track => {
            socket.emit('student-stream', { trackId: track.id, kind: track.kind });
          });

        } catch (err) {
          alert('Erreur partage écran: ' + err.message);
        }
      });

      // Voye stream elev pou pwofesè wè
      localStream.getTracks().forEach(track => {
        socket.emit('student-stream', { trackId: track.id, kind: track.kind });
      });

    } catch (err) {
      alert('Erreur accès caméra/micro elev: ' + err.message);
    }
  });
})();
