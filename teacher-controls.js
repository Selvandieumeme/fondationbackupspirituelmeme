// teacher-controls.js — endepandan, pa manyen elèv
(() => {
  const socket = io("https://examen-backend-ihlx.onrender.com");
  const teacherControls = document.getElementById('teacher-controls');
  const teacherVideo = document.getElementById('teacher-video');
  const roomCodeInput = document.getElementById('room-code');
  const joinBtn = document.getElementById('join-room');
  const roleSelect = document.getElementById('role');
  const usernameInput = document.getElementById('username');

  let localStream = null;
  let peerConnections = {}; // si w bezwen Peers pa elèv

  // Helper pou kreye bouton san repete
  function addControlButton(id, text, onClick) {
    if (document.getElementById(id)) return document.getElementById(id);
    const b = document.createElement('button');
    b.id = id;
    b.textContent = text;
    b.style.margin = '6px';
    b.style.padding = '10px 14px';
    b.style.borderRadius = '8px';
    b.style.background = '#ffd700';
    b.style.color = '#0d6efd';
    b.style.cursor = 'pointer';
    b.addEventListener('click', onClick);
    teacherControls.appendChild(b);
    return b;
  }

  // Aksyon lè pwofesè antre
  async function teacherInit(room) {
    try {
      if (!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        teacherVideo.srcObject = localStream;
      }

      // Mute/Unmute mic kontwòl pwòp
      addControlButton('btn-mute-self', 'Mute Micro', () => {
        if (!localStream) return;
        const a = localStream.getAudioTracks();
        if (!a.length) return;
        a.forEach(t => t.enabled = !t.enabled);
        document.getElementById('btn-mute-self').textContent = a[0].enabled ? 'Mute Micro' : 'Unmute Micro';
      });

      // Mute/Unmute cam
      addControlButton('btn-mute-cam-self', 'Mute Caméra', () => {
        if (!localStream) return;
        const v = localStream.getVideoTracks();
        if (!v.length) return;
        v.forEach(t => t.enabled = !t.enabled);
        document.getElementById('btn-mute-cam-self').textContent = v[0].enabled ? 'Mute Caméra' : 'Unmute Caméra';
      });

      // Mute all students (notify backend)
      addControlButton('btn-mute-all', 'Mute All Students', () => {
        const room = roomCodeInput.value.trim();
        if (room) socket.emit('mute-all', room);
      });

      // Stop all videos (students)
      addControlButton('btn-stop-all', 'Stop All Video', () => {
        const room = roomCodeInput.value.trim();
        if (room) socket.emit('stop-all-video', room);
      });

      // Raise-hand controls (pouse/descann)
      addControlButton('btn-lower-all-hands', 'Lower All Hands', () => {
        const room = roomCodeInput.value.trim();
        if (room) socket.emit('lower-all-hands', { room });
      });

      // Block student (ask backend to block by username)
      addControlButton('btn-block-student', 'Block Student', () => {
        const student = prompt('Nom étudiant à bloquer (exact):');
        const room = roomCodeInput.value.trim();
        if (student && room) socket.emit('block-student', { student, room });
      });

      // Share screen
      addControlButton('btn-share-screen', 'Partager Écran', async () => {
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const vTrack = screenStream.getVideoTracks()[0];
          // Notify backend (server doit re-emit screen-shared)
          socket.emit('share-screen', { room, trackId: vTrack.id });
          vTrack.onended = () => socket.emit('stop-share-screen', room);
        } catch (err) {
          alert('Erreur partage écran: ' + err.message);
        }
      });

      // Emit teacher-stream tracks to server (notify so server can coordinate)
      if (localStream) {
        localStream.getTracks().forEach(track => {
          socket.emit('teacher-stream', { trackId: track.id, kind: track.kind });
        });
      }

    } catch (err) {
      console.error('Teacher init error:', err);
      alert('Erreur accès caméra/micro professeur: ' + (err.message || err));
    }
  }

  // Hook join action: si role = teacher, init controls
  joinBtn.addEventListener('click', async () => {
    // let the main page set user/join-room as it already does.
    setTimeout(() => {
      if (roleSelect.value === 'teacher') {
        const room = roomCodeInput.value.trim();
        if (!room) return;
        teacherInit(room);
      }
    }, 300); // ti délai pou main script fin emèt join-room
  });

  // Listen backend for events (mute all, stop video, block etc.)
  socket.on('mute-mic', () => {
    if (localStream) localStream.getAudioTracks().forEach(t => (t.enabled = false));
  });
  socket.on('stop-video', () => {
    if (localStream) localStream.getVideoTracks().forEach(t => (t.enabled = false));
  });

  // Optional: receive block-confirmation
  socket.on('student-blocked', ({ student }) => {
    alert(`${student} bloqué(e) par l'enseignant.`);
  });

