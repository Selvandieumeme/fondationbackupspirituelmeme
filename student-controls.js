let studentControlsInit = async (socket) => {
  const toggleMicBtn = document.getElementById('toggle-mic');
  const toggleCamBtn = document.getElementById('toggle-camera');
  const mainHandBtn = document.getElementById('main-hand');
  const leaveBtn = document.getElementById('leave-class');
  const studentVideoContainer = document.getElementById('student-videos');

  let localStream;
  let micEnabled = true;
  let camEnabled = true;

  // 🎥 OUVRI KAMERA + MIKWO OTOMATIKMAN
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    // Kreye videyo elèv la
    const studentVideo = document.createElement('video');
    studentVideo.autoplay = true;
    studentVideo.playsInline = true;
    studentVideo.muted = true; // mute pou pa fè echo sou pwòp mikwo
    studentVideo.srcObject = localStream;
    studentVideoContainer.appendChild(studentVideo);

    // Enfòme backend ke elèv pare
    socket.emit('streamReady', { role: 'student' });

  } catch (err) {
    console.error("Erreur ouverture caméra/micro :", err);
    alert("Impossible d'accéder à la caméra ou au micro. Vérifiez vos autorisations.");
  }

  // 🔇 Mute/Unmute pwòp mikwo
  toggleMicBtn.addEventListener('click', () => {
    micEnabled = !micEnabled;
    localStream.getAudioTracks().forEach(track => track.enabled = micEnabled);
    toggleMicBtn.textContent = micEnabled ? "Mic Off" : "Mic On";
  });

  // 🎦 Kamera On/Off
  toggleCamBtn.addEventListener('click', () => {
    camEnabled = !camEnabled;
    localStream.getVideoTracks().forEach(track => track.enabled = camEnabled);
    toggleCamBtn.textContent = camEnabled ? "Camera Off" : "Camera On";
  });

  // ✋ Main leve / desann
  mainHandBtn.addEventListener('click', () => {
    socket.emit('raiseHand');
  });

  // 🚪 Kite klas la
  leaveBtn.addEventListener('click', () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    window.location.reload();
  });

  // 📡 Evènman backend
  socket.on('blockedStudent', ({ id }) => {
    if (socket.id === id) {
      alert('Vous avez été bloqué par le professeur');
      window.location.reload();
    }
  });
};
