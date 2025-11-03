// ====================================================
// Connexion Socket.io ak backend
// ====================================================
const socket = io('https://examen-backend-ihlx.onrender.com');

// ====================================================
// Récupération des éléments HTML
// ====================================================
const joinBtn = document.getElementById('joinBtn');
const nameInput = document.getElementById('fullName');
const roleSelect = document.getElementById('roleSelect');
const loginPanel = document.getElementById('login-panel');
const classroom = document.getElementById('classroom');
const teacherVideoEl = document.getElementById('teacher-video');
const studentVideosEl = document.getElementById('student-videos');
const studentListEl = document.getElementById('student-list');
const studentCountEl = document.getElementById('student-count');
const raisedHandsEl = document.getElementById('raised-hands-list');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat');

let role, localStream;
const peers = {}; // Gestion des connexions WebRTC

// ====================================================
// Fonction de création d'une connexion peer WebRTC
// ====================================================
function createPeerConnection(socketId) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });

  // Ajout des pistes locales
  if (localStream) {
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  }

  // Réception de flux distant
  pc.ontrack = (event) => {
    const stream = event.streams[0];
    if (!document.getElementById(socketId)) {
      const videoEl = document.createElement('video');
      videoEl.id = socketId;
      videoEl.srcObject = stream;
      videoEl.autoplay = true;
      videoEl.playsInline = true;
      videoEl.muted = false;
      videoEl.style.width = '240px';
      videoEl.style.height = '180px';
      studentVideosEl.appendChild(videoEl);
    }
  };

  // Gestion des ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('signal', { to: socketId, candidate: event.candidate });
    }
  };

  return pc;
}

// ====================================================
// Signaling - réception de SDP / ICE
// ====================================================
socket.on('signal', async ({ from, sdp, candidate }) => {
  if (!peers[from]) peers[from] = createPeerConnection(from);
  const pc = peers[from];

  if (sdp) {
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    if (sdp.type === 'offer') {
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('signal', { to: from, sdp: pc.localDescription });
    }
  }

  if (candidate) {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }
});

// ====================================================
// Lorsqu’un nouvel utilisateur rejoint
// ====================================================
socket.on('user-joined', async ({ socketId }) => {
  const pc = createPeerConnection(socketId);
  peers[socketId] = pc;

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit('signal', { to: socketId, sdp: pc.localDescription });
});

// ====================================================
// BOUTON "REJOINDRE" (VERSION NETTOYÉE)
// ====================================================
joinBtn.addEventListener('click', async () => {
  const name = nameInput.value.trim();
  role = roleSelect.value;

  if (!name) {
    alert('Veuillez entrer votre nom.');
    return;
  }

  let responded = false;

  try {
    socket.timeout(3000).emit('joinRoom', { name, role }, async (response) => {
      responded = true;

      if (response.status === 'full') {
        alert('Salle pleine (max 100 élèves)');
        return;
      }

      // Transition vers la salle de classe
      loginPanel.style.display = 'none';
      classroom.style.display = 'block';

      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        // Affichage vidéo local
        if (role === 'teacher') {
          teacherVideoEl.srcObject = localStream;
        } else {
          const studentLocal = document.createElement('video');
          studentLocal.srcObject = localStream;
          studentLocal.autoplay = true;
          studentLocal.playsInline = true;
          studentLocal.muted = true;
          studentLocal.style.width = '240px';
          studentLocal.style.height = '180px';
          studentVideosEl.appendChild(studentLocal);
        }

        localStream.getTracks().forEach(track => (track.enabled = true));
        socket.emit('streamReady', { role });
        socket.emit('readyForPeers');
      } catch (err) {
        console.error(err);
        alert('Erreur accès caméra/micro.');
      }

      // Initialiser les contrôles selon le rôle
      if (role === 'teacher') teacherControlsInit(socket);
      else studentControlsInit(socket);
    });
  } catch (err) {
    console.warn('Backend non disponible, mode local activé.');
  }

  // Mode local fallback
  setTimeout(async () => {
    if (!responded) {
      console.warn('Mode local activé.');
      loginPanel.style.display = 'none';
      classroom.style.display = 'block';

      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (role === 'teacher') teacherVideoEl.srcObject = localStream;
        else {
          const localPlaceholder = document.createElement('video');
          localPlaceholder.srcObject = localStream;
          localPlaceholder.autoplay = true;
          localPlaceholder.playsInline = true;
          localPlaceholder.muted = true;
          studentVideosEl.appendChild(localPlaceholder);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, 3500);
});











    // ====================================================
    // Initialisation local stream
    // ====================================================
    async function initLocalStream() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
            });

            if (role === 'teacher') {
                teacherVideoEl.srcObject = localStream;
                teacherVideoEl.autoplay = true;
                teacherVideoEl.playsInline = true;
                teacherVideoEl.muted = false;
            } else {
                const studentVideo = document.createElement('video');
                studentVideo.srcObject = localStream;
                studentVideo.autoplay = true;
                studentVideo.playsInline = true;
                studentVideo.muted = false;
                studentVideosEl.appendChild(studentVideo);
            }

            localStream.getTracks().forEach(track => (track.enabled = true));

            socket.emit('streamReady', { role });
            socket.emit('readyForPeers');
        } catch (err) {
            console.error('Erreur accès média :', err);
            alert("Impossible d'accéder à la caméra/micro : " + err.message);
        }
    }

    // ====================================================
    // WebRTC
    // ====================================================
    function createPeerConnection(socketId) {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

        if (localStream) localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

        pc.ontrack = (event) => {
            const stream = event.streams[0];
            if (!document.getElementById(socketId)) {
                const videoEl = document.createElement('video');
                videoEl.id = socketId;
                videoEl.srcObject = stream;
                videoEl.autoplay = true;
                videoEl.playsInline = true;
                videoEl.muted = false;
                videoEl.style.width = '240px';
                videoEl.style.height = '180px';
                studentVideosEl.appendChild(videoEl);
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) socket.emit('signal', { to: socketId, candidate: event.candidate });
        };

        return pc;
    }

    socket.on('signal', async ({ from, sdp, candidate }) => {
        if (!peers[from]) peers[from] = createPeerConnection(from);
        const pc = peers[from];

        if (sdp) {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            if (sdp.type === 'offer') {
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('signal', { to: from, sdp: pc.localDescription });
            }
        }
        if (candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on('user-joined', async ({ socketId }) => {
        const pc = createPeerConnection(socketId);
        peers[socketId] = pc;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('signal', { to: socketId, sdp: pc.localDescription });
    });

    // ====================================================
    // Student / Teacher updates
    // ====================================================
    socket.on('updateStudents', students => {
        studentListEl.innerHTML = '';
        let count = 0;
        students.forEach(s => {
            const div = document.createElement('div');
            div.textContent = s.name;
            div.style.color = s.online ? 'green' : 'gray';
            studentListEl.appendChild(div);
            if (s.online && s.role === 'student') count++;
        });
        studentCountEl.textContent = count;
    });

    socket.on('updateRaisedHands', hands => {
        raisedHandsEl.innerHTML = '';
        hands.forEach(s => {
            const div = document.createElement('div');
            div.textContent = s.name;
            raisedHandsEl.appendChild(div);
        });
    });

    sendChatBtn.addEventListener('click', () => {
        const msg = chatInput.value.trim();
        if (!msg) return;
        socket.emit('chatMessage', msg);
        chatInput.value = '';
    });

    socket.on('chatMessage', data => {
        const div = document.createElement('div');
        div.textContent = `${data.name}: ${data.msg}`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // ====================================================
    // Teacher controls init
    // ====================================================
    function teacherControlsInit() {
        let micEnabled = true;
        let camEnabled = true;

        function toggleButton(button, callback) {
            if (!button) return;
            button.addEventListener('click', callback);
        }

        toggleButton(shareScreenBtn, async () => await shareScreen());
        toggleButton(mainHandBtn, () => { mainHandBtn.style.backgroundColor = 'green'; socket.emit('raiseHand'); });
        toggleButton(changeBgBtn, () => selectLocalBackground());
        toggleButton(leaveBtn, () => { if(localStream)localStream.getTracks().forEach(track=>track.stop()); window.location.reload(); });

        const aiBackgrounds = [
            'url("https://source.unsplash.com/600x400/?avion")',
            'url("https://source.unsplash.com/600x400/?robo")',
            'url("https://source.unsplash.com/600x400/?maison")',
            'url("https://source.unsplash.com/600x400/?ciel")',
            'url("https://source.unsplash.com/600x400/?lame")',
            'url("https://source.unsplash.com/600x400/?decoration")'
        ];
        let currentBgIndex = 0;
        function changeBackgroundAI() {
            classroom.style.backgroundImage = aiBackgrounds[currentBgIndex];
            classroom.style.backgroundSize = 'cover';
            classroom.style.backgroundPosition = 'center';
            currentBgIndex = (currentBgIndex + 1) % aiBackgrounds.length;
        }
        setInterval(changeBackgroundAI, 20000);

        function selectLocalBackground() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                    classroom.style.backgroundImage = `url(${ev.target.result})`;
                    classroom.style.backgroundSize = 'cover';
                    classroom.style.backgroundPosition = 'center';
                };
                reader.readAsDataURL(file);
            };
            input.click();
        }
    }

    // ====================================================
    // Student controls init
    // ====================================================
    function studentControlsInit() {
        let micEnabled = true;
        let camEnabled = true;

        function toggleButton(button, callback) {
            if (!button) return;
            button.addEventListener('click', callback);
        }

        toggleButton(mainHandBtn, () => { mainHandBtn.style.backgroundColor = 'green'; socket.emit('raiseHand'); });
        toggleButton(changeBgBtn, () => selectLocalBackground());
        toggleButton(leaveBtn, () => { if(localStream)localStream.getTracks().forEach(track=>track.stop()); window.location.reload(); });
        toggleButton(shareScreenBtn, async () => await shareScreen());

        function selectLocalBackground() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                    classroom.style.backgroundImage = `url(${ev.target.result})`;
                    classroom.style.backgroundSize = 'cover';
                    classroom.style.backgroundPosition = 'center';
                };
                reader.readAsDataURL(file);
            };
            input.click();
        }
    }

    // ====================================================
    // Fonksyon partage écran pou tout moun
    // ====================================================
    async function shareScreen() {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            Object.values(peers).forEach(pc => {
                screenStream.getTracks().forEach(track => pc.addTrack(track, screenStream));
            });

            const screenVideoEl = document.getElementById('screen-video');
            screenVideoEl.srcObject = screenStream;
            screenVideoEl.style.display = 'block';

            screenStream.getVideoTracks()[0].addEventListener('ended', () => {
                Object.values(peers).forEach(pc => {
                    const senders = pc.getSenders().filter(s => s.track && s.track.kind === 'video');
                    senders.forEach(sender => pc.removeTrack(sender));
                });
                screenVideoEl.srcObject = null;
                screenVideoEl.style.display = 'none';
            });
        } catch (err) {
            console.error('Impossible de partager l\'écran :', err);
            alert('Impossible de partager l\'écran : ' + err.message);
        }
    }

});

});







    // ====================================================
    // Initialisation local stream
    // ====================================================
    async function initLocalStream() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
            });

            if (role === 'teacher') {
                teacherVideoEl.srcObject = localStream;
                teacherVideoEl.autoplay = true;
                teacherVideoEl.playsInline = true;
                teacherVideoEl.muted = false;
            } else {
                const studentVideo = document.createElement('video');
                studentVideo.srcObject = localStream;
                studentVideo.autoplay = true;
                studentVideo.playsInline = true;
                studentVideo.muted = false;
                studentVideosEl.appendChild(studentVideo);
            }

            localStream.getTracks().forEach(track => (track.enabled = true));

            socket.emit('streamReady', { role });
            socket.emit('readyForPeers');
        } catch (err) {
            console.error('Erreur accès média :', err);
            alert("Impossible d'accéder à la caméra/micro : " + err.message);
        }
    }

    // ====================================================
    // WebRTC
    // ====================================================
    function createPeerConnection(socketId) {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

        if (localStream) localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

        pc.ontrack = (event) => {
            const stream = event.streams[0];
            if (!document.getElementById(socketId)) {
                const videoEl = document.createElement('video');
                videoEl.id = socketId;
                videoEl.srcObject = stream;
                videoEl.autoplay = true;
                videoEl.playsInline = true;
                videoEl.muted = false;
                videoEl.style.width = '240px';
                videoEl.style.height = '180px';
                studentVideosEl.appendChild(videoEl);
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) socket.emit('signal', { to: socketId, candidate: event.candidate });
        };

        return pc;
    }

    socket.on('signal', async ({ from, sdp, candidate }) => {
        if (!peers[from]) peers[from] = createPeerConnection(from);
        const pc = peers[from];

        if (sdp) {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            if (sdp.type === 'offer') {
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('signal', { to: from, sdp: pc.localDescription });
            }
        }
        if (candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on('user-joined', async ({ socketId }) => {
        const pc = createPeerConnection(socketId);
        peers[socketId] = pc;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('signal', { to: socketId, sdp: pc.localDescription });
    });

    // ====================================================
    // Student / Teacher updates
    // ====================================================
    socket.on('updateStudents', students => {
        studentListEl.innerHTML = '';
        let count = 0;
        students.forEach(s => {
            const div = document.createElement('div');
            div.textContent = s.name;
            div.style.color = s.online ? 'green' : 'gray';
            studentListEl.appendChild(div);
            if (s.online && s.role === 'student') count++;
        });
        studentCountEl.textContent = count;
    });

    socket.on('updateRaisedHands', hands => {
        raisedHandsEl.innerHTML = '';
        hands.forEach(s => {
            const div = document.createElement('div');
            div.textContent = s.name;
            raisedHandsEl.appendChild(div);
        });
    });

    sendChatBtn.addEventListener('click', () => {
        const msg = chatInput.value.trim();
        if (!msg) return;
        socket.emit('chatMessage', msg);
        chatInput.value = '';
    });

    socket.on('chatMessage', data => {
        const div = document.createElement('div');
        div.textContent = `${data.name}: ${data.msg}`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // ====================================================
    // Teacher controls init
    // ====================================================
    function teacherControlsInit() {
        let micEnabled = true;
        let camEnabled = true;

        function toggleButton(button, callback) {
            if (!button) return;
            button.addEventListener('click', callback);
        }

        toggleButton(shareScreenBtn, async () => await shareScreen());
        toggleButton(mainHandBtn, () => { mainHandBtn.style.backgroundColor = 'green'; socket.emit('raiseHand'); });
        toggleButton(changeBgBtn, () => selectLocalBackground());
        toggleButton(leaveBtn, () => { if(localStream)localStream.getTracks().forEach(track=>track.stop()); window.location.reload(); });

        const aiBackgrounds = [
            'url("https://source.unsplash.com/600x400/?avion")',
            'url("https://source.unsplash.com/600x400/?robo")',
            'url("https://source.unsplash.com/600x400/?maison")',
            'url("https://source.unsplash.com/600x400/?ciel")',
            'url("https://source.unsplash.com/600x400/?lame")',
            'url("https://source.unsplash.com/600x400/?decoration")'
        ];
        let currentBgIndex = 0;
        function changeBackgroundAI() {
            classroom.style.backgroundImage = aiBackgrounds[currentBgIndex];
            classroom.style.backgroundSize = 'cover';
            classroom.style.backgroundPosition = 'center';
            currentBgIndex = (currentBgIndex + 1) % aiBackgrounds.length;
        }
        setInterval(changeBackgroundAI, 20000);

        function selectLocalBackground() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                    classroom.style.backgroundImage = `url(${ev.target.result})`;
                    classroom.style.backgroundSize = 'cover';
                    classroom.style.backgroundPosition = 'center';
                };
                reader.readAsDataURL(file);
            };
            input.click();
        }
    }

    // ====================================================
    // Student controls init
    // ====================================================
    function studentControlsInit() {
        let micEnabled = true;
        let camEnabled = true;

        function toggleButton(button, callback) {
            if (!button) return;
            button.addEventListener('click', callback);
        }

        toggleButton(mainHandBtn, () => { mainHandBtn.style.backgroundColor = 'green'; socket.emit('raiseHand'); });
        toggleButton(changeBgBtn, () => selectLocalBackground());
        toggleButton(leaveBtn, () => { if(localStream)localStream.getTracks().forEach(track=>track.stop()); window.location.reload(); });
        toggleButton(shareScreenBtn, async () => await shareScreen());

        function selectLocalBackground() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                    classroom.style.backgroundImage = `url(${ev.target.result})`;
                    classroom.style.backgroundSize = 'cover';
                    classroom.style.backgroundPosition = 'center';
                };
                reader.readAsDataURL(file);
            };
            input.click();
        }
    }

    // ====================================================
    // Fonksyon partage écran pou tout moun
    // ====================================================
    async function shareScreen() {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            Object.values(peers).forEach(pc => {
                screenStream.getTracks().forEach(track => pc.addTrack(track, screenStream));
            });

            const screenVideoEl = document.getElementById('screen-video');
            screenVideoEl.srcObject = screenStream;
            screenVideoEl.style.display = 'block';

            screenStream.getVideoTracks()[0].addEventListener('ended', () => {
                Object.values(peers).forEach(pc => {
                    const senders = pc.getSenders().filter(s => s.track && s.track.kind === 'video');
                    senders.forEach(sender => pc.removeTrack(sender));
                });
                screenVideoEl.srcObject = null;
                screenVideoEl.style.display = 'none';
            });
        } catch (err) {
            console.error('Impossible de partager l\'écran :', err);
            alert('Impossible de partager l\'écran : ' + err.message);
        }
    }

});
