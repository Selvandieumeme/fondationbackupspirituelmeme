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

    const socket = io("https://examen-backend-ihlx.onrender.com");
    socket.emit('setUser', { username, role: 'student' });
    socket.emit('join-room', room);

    try {
      // Kreye preview videyo elev la (lokal sèlman pou elev la)
      const previewVideo = document.createElement('video');
      previewVideo.autoplay = true;
      previewVideo.muted = true; // preview pa dwe emèt odyo nan navigatè elev
      previewVideo.style.width = '250px';
      previewVideo.style.height = '180px';
      previewVideo.style.objectFit = 'cover';
      previewVideo.style.border = '3px solid #0d6efd';
      previewVideo.style.borderRadius = '10px';
      previewVideo.style.margin = '5px';
      studentVideos.appendChild(previewVideo);

      // Kontwòl elev yo
      const controlsContainer = document.createElement('div');
      controlsContainer.style.display = 'flex';
      controlsContainer.style.flexWrap = 'wrap';
      controlsContainer.style.justifyContent = 'center';
      controlsContainer.style.margin = '10px';
      document.getElementById('room-controls').appendChild(controlsContainer);

      const makeBtn = (text, action) => {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.margin = '6px';
        btn.style.padding = '10px 14px';
        btn.style.borderRadius = '8px';
        btn.style.cursor = 'pointer';
        btn.style.background = '#ffd700';
        btn.style.color = '#0d6efd';
        btn.onclick = action;
        controlsContainer.appendChild(btn);
        return btn;
      };

      // Bouton Mute/Unmute mikwo
      const muteMicBtn = makeBtn('Mute Micro', () => socket.emit('toggle-mic', { room, username }));

      // Bouton Mute/Unmute kamera
      const muteCamBtn = makeBtn('Mute Caméra', () => socket.emit('toggle-cam', { room, username }));

      // Bouton leve/desann men
      const handBtn = makeBtn('Lever Main', () => socket.emit('toggle-hand', { room, username }));

      // Upload dokiman
      if (uploadDoc) {
        const uploadBtn = makeBtn('Upload Document', () => uploadDoc.click());
        uploadDoc.addEventListener('change', async () => {
          const file = uploadDoc.files[0];
          if (!file) return;
          const form = new FormData();
          form.append('document', file);
          await fetch('https://examen-backend-ihlx.onrender.com/upload-doc', { method: 'POST', body: form });
          socket.emit('document-uploaded', { room, username, filename: file.name });
          alert('📄 Document uploaded');
        });
      }

      // Pataje ekran
      const shareScreenBtn = makeBtn('Partager Écran', async () => {
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          socket.emit('student-screen', { room, username });
          screenStream.getTracks().forEach(track => {
            // Emèt tout track dirèkteman sou backend
            socket.emit('student-stream', { trackId: track.id, kind: track.kind });
          });
        } catch (err) {
          alert('Erreur partage écran: ' + err.message);
        }
      });

      // Chat
      const msgInput = document.getElementById('msg');
      const sendBtn = document.getElementById('send');
      const messages = document.getElementById('messages');

      sendBtn.onclick = () => {
        const text = msgInput.value.trim();
        if (!text) return;
        socket.emit('chat-message', { room, from: username, message: text });
        const li = document.createElement('li');
        li.textContent = 'Vous: ' + text;
        messages.appendChild(li);
        msgInput.value = '';
      };

      socket.on('chat-message', data => {
        const li = document.createElement('li');
        li.textContent = data.from + ': ' + data.message;
        messages.appendChild(li);
      });

      // Resevwa stream lòt elev (WebRTC si backend sipòte)
      socket.on('remote-student-stream', data => {
        const remoteVideo = document.createElement('video');
        remoteVideo.autoplay = true;
        remoteVideo.srcObject = data.stream; // stream soti backend
        remoteVideo.style.width = '250px';
        remoteVideo.style.height = '180px';
        remoteVideo.style.objectFit = 'cover';
        remoteVideo.style.border = '3px solid #28a745';
        remoteVideo.style.borderRadius = '10px';
        remoteVideo.style.margin = '5px';
        studentVideos.appendChild(remoteVideo);
      });

    } catch (err) {
      alert('Erreur initialisation elev: ' + err.message);
    }
  });
})();
