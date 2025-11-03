// ====================================================
// Connexion socket
// ====================================================
const socket = io('https://examen-backend-ihlx.onrender.com');

document.addEventListener('DOMContentLoaded', () => {
    // ====================================================
    // Elements HTML
    // ====================================================
    const joinBtn = document.getElementById('joinBtn');
    const roomInput = document.getElementById('generatedRoomCode'); // chanje pou matche ak HTML
   const studentRoomInputField = document.getElementById('studentRoomCode'); // pou elèv
    const nameInput = document.getElementById('fullName');
    const roleSelect = document.getElementById('roleSelect');
    const loginPanel = document.getElementById('login-panel');

    const rejoinRoomContainer = document.getElementById("rejoin-room-container");
    const rejoinRoomInput = document.getElementById("rejoinRoomCode");
    const rejoinRoomBtn = document.getElementById("rejoinRoomBtn");
    
    const classroom = document.getElementById('classroom');
    const teacherVideoEl = document.getElementById('teacher-video');
    const studentVideosEl = document.getElementById('student-videos');
    const studentListEl = document.getElementById('student-list');
    const studentCountEl = document.getElementById('student-count');
    const raisedHandsEl = document.getElementById('raised-hands-list');
    const chatPanel = document.getElementById('chat-panel');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat');
    const sidePanel = document.getElementById('side-panel');
    const controls = document.getElementById('controls');
    const backgroundSelector = document.getElementById('background-selector');
    const shareScreenBtn = document.getElementById('share-screen');
    const mainHandBtn = document.getElementById('main-hand');
    const changeBgBtn = document.getElementById('change-background-btn');
    const leaveBtn = document.getElementById('leave-class');

    let role, room, localStream;
    const peers = {}; // WebRTC peers

    // ====================================================
    // Panels initialement caches
    // ====================================================
    [classroom, chatPanel, sidePanel, controls, backgroundSelector].forEach(el => el.style.display = 'none');

    // ====================================================
    // ===== Fonksyon pou jenere kòd inik =====
    // ====================================================
    function generateRoomCode(length = 6) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }


    
// ====================================================
// ===== Chanjman wòl pou montre chan kòd pwofesè/elèv =====
// ====================================================
roleSelect.addEventListener('change', () => {
  if (roleSelect.value === 'teacher') {
      document.getElementById('room-code-container').style.display = 'block';
      if (studentRoomInputField) studentRoomInputField.parentElement.style.display = 'none';
      roomInput.value = generateRoomCode();

      // 👉 Montrer bouton rejoin sal la
      if (rejoinRoomContainer) rejoinRoomContainer.style.display = 'block';
  } else {
      document.getElementById('room-code-container').style.display = 'none';
      if (studentRoomInputField) studentRoomInputField.parentElement.style.display = 'block';

      // 👉 Kache bouton rejoin sal la
      if (rejoinRoomContainer) rejoinRoomContainer.style.display = 'none';
  }
});

// Inisyalizasyon lè paj la chaje
if (roleSelect.value === 'teacher') {
    document.getElementById('room-code-container').style.display = 'block';
    if (studentRoomInputField) studentRoomInputField.parentElement.style.display = 'none';
    roomInput.value = generateRoomCode();

    // 👉 Montrer bouton rejoin sal la
    if (rejoinRoomContainer) rejoinRoomContainer.style.display = 'block';
}



// ====================================================
// === GESTION REJOINDRE ANCIENNE SALLE ===
// ====================================================
const rejoinRoomContainer = document.getElementById("rejoin-room-container");
const rejoinRoomInput = document.getElementById("rejoinRoomCode");
const rejoinRoomBtn = document.getElementById("rejoinRoomBtn");

if (rejoinRoomBtn) {
  rejoinRoomBtn.addEventListener("click", () => {
    const oldCode = rejoinRoomInput.value.trim();
    if (!oldCode) {
      alert("Veuillez entrer un ancien code de salle !");
      return;
    }
    document.getElementById("generatedRoomCode").value = oldCode;
    joinBtn.click(); // itilize menm bouton 'Rejoindre' lan
  });
}



    
// Lè pwofese a vle rejwen ansyen salle
rejoinRoomBtn.addEventListener("click", () => {
  const oldCode = rejoinRoomInput.value.trim();
  if (!oldCode) {
    alert("Veuillez entrer un ancien code de salle !");
    return;
  }
  document.getElementById("generatedRoomCode").value = oldCode;
  joinBtn.click(); // sèvi ak menm bouton 'Rejoindre' la
});

    

    
    // ====================================================
    // Rejoindre bouton
    // ====================================================
    joinBtn.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        role = roleSelect.value;

        if (role === 'teacher') room = roomInput.value.trim();
        else room = studentRoomInputField.value.trim();

        if (!room || !name) {
            alert('Veuillez remplir tous les champs.');
            return;
        }

        let responded = false;

        try {
            socket.timeout(3000).emit('joinRoom', { room, name, role }, async (response) => {
                responded = true;
                if (response.status === 'full') {
                    alert('Salle pleine (max 100 élèves)');
                    return;
                }

                loginPanel.style.display = 'none';
                [classroom, chatPanel, sidePanel, controls, backgroundSelector].forEach(el => el.style.display = 'block');

                await initLocalStream();

                if (role === 'teacher') teacherControlsInit();
                else studentControlsInit();
            });
        } catch (err) {
            console.warn('Backend non disponible, simulation locale activée.');
        }

        setTimeout(async () => {
            if (!responded) {
                loginPanel.style.display = 'none';
                [classroom, chatPanel, sidePanel, controls, backgroundSelector].forEach(el => el.style.display = 'block');
                await initLocalStream();
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
