// ===============================
// 🌐 Koneksyon Socket ak Backend
// ===============================
const socket = io('https://examen-backend-ihlx.onrender.com');

// ===============================
// 🎛️ Sélection éléments HTML
// ===============================
const joinBtn = document.getElementById('joinBtn');
const roomInput = document.getElementById('roomCode'); // <--- Code de la salle
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

let role, room, localStream;
const peers = {}; // peer connections WebRTC

// ===================================================
// 🔧 FONKSYON: Kreye koneksyon WebRTC ant itilizatè yo
// ===================================================
function createPeerConnection(socketId) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });

  if (localStream) {
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  }

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
    if (event.candidate) {
      socket.emit('signal', { to: socketId, candidate: event.candidate });
    }
  };

  return pc;
}

// ===================================================
// 🔄 Resevwa signal (SDP / ICE) ant kliyan yo
// ===================================================
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

// ===================================================
// 👥 Lè yon nouvo itilizatè rantre nan sal la
// ===================================================
socket.on('user-joined', async ({ socketId }) => {
  const pc = createPeerConnection(socketId);
  peers[socketId] = pc;
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit('signal', { to: socketId, sdp: pc.localDescription });
});

// ===================================================
// 🚪 Bouton "Rejoindre la Classe"
// ===================================================
joinBtn.addEventListener('click', async () => {
  const name = nameInput.value.trim();
  const role = roleSelect.value;
  room = roomInput.value.trim(); // <-- Récupère "Code de la salle"

  if (!name || !room) {
    alert('Veuillez entrer votre nom et le Code de la Classe.');
    return;
  }

  const payload = { name, role, room };
  let responded = false;

  try {
    socket.timeout(4000).emit('joinRoom', payload, async (response) => {
      responded = true;

      if (response?.status === 'full') {
        alert('Salle pleine (maximum 100 élèves)');
        return;
      }

      // ✅ Transition vers l’espace de classe
      loginPanel.style.display = 'none';
      classroom.style.display = 'block';

      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        if (role === 'teacher') {
          teacherVideoEl.srcObject = localStream;
        } else {
          const localVid = document.createElement('video');
          localVid.srcObject = localStream;
          localVid.autoplay = true;
          localVid.playsInline = true;
          localVid.muted = true;
          localVid.style.width = '240px';
          localVid.style.height = '180px';
          studentVideosEl.appendChild(localVid);
        }

        localStream.getTracks().forEach(track => (track.enabled = true));
        socket.emit('streamReady', { role });
        socket.emit('readyForPeers');
      } catch (err) {
        console.error('Erreur caméra/micro :', err);
        alert("Impossible d'accéder à la caméra/micro.");
      }

      if (role === 'teacher') teacherControlsInit(socket);
      else studentControlsInit(socket);
    });
  } catch (err) {
    console.warn('⚠️ Serveur non disponible, mode local activé.');
  }

  // 🔄 Mode local fallback (si backend pa reponn)
  setTimeout(async () => {
    if (!responded) {
      console.warn('Mode local sans serveur.');
      loginPanel.style.display = 'none';
      classroom.style.display = 'block';

      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        if (role === 'teacher') {
          teacherVideoEl.srcObject = localStream;
        } else {
          const fallbackVid = document.createElement('video');
          fallbackVid.srcObject = localStream;
          fallbackVid.autoplay = true;
          fallbackVid.playsInline = true;
          fallbackVid.muted = true;
          fallbackVid.style.width = '240px';
          fallbackVid.style.height = '180px';
          studentVideosEl.appendChild(fallbackVid);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, 4000);
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
