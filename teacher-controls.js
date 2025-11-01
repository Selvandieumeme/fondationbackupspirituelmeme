let teacherControlsInit = async (socket) => {  
  const toggleMicBtn = document.getElementById('toggle-mic');
  const toggleCamBtn = document.getElementById('toggle-camera');
  const mainHandBtn = document.getElementById('main-hand');
  const leaveBtn = document.getElementById('leave-class');
  const teacherVideo = document.getElementById('teacher-video');

  let localStream;
  let micEnabled = true;
  let camEnabled = true;

  // 🎥 OUVRI KAMERA + MIKWO OTOMATIKMAN
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
    teacherVideo.srcObject = localStream;
    teacherVideo.autoplay = true;
    teacherVideo.playsInline = true;
    teacherVideo.muted = true; // mute video pwofesè pou li pa tande pwòp mikwo li
    
    // Enfòme backend ke pwofesè pare
    socket.emit('streamReady', { role: 'teacher' });

  } catch (err) {
    console.error("Erreur ouverture caméra/micro :", err);
    alert("Impossible d'accéder à la caméra ou au micro. Vérifiez vos autorisations.");
  }

  // 🔇 Mute/Unmute pwòp mikwo pwofesè
  toggleMicBtn.addEventListener('click', () => {
    micEnabled = !micEnabled;
    localStream.getAudioTracks().forEach(track => track.enabled = micEnabled);
    toggleMicBtn.textContent = micEnabled ? "Mic Off" : "Mic On";
    socket.emit('toggleMic'); // enfòme elèv yo sou chanjman
  });

  // 🎦 Kamera On/Off
  toggleCamBtn.addEventListener('click', () => {
    camEnabled = !camEnabled;
    localStream.getVideoTracks().forEach(track => track.enabled = camEnabled);
    toggleCamBtn.textContent = camEnabled ? "Camera Off" : "Camera On";
    socket.emit('toggleCamera');
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
  socket.on('updateMic', ({ id }) => {
    console.log(`Mikwo toggled pou ${id}`);
  });

  socket.on('updateCamera', ({ id }) => {
    console.log(`Camera toggled pou ${id}`);
  });

  socket.on('blockedStudent', ({ id }) => {
    alert(`Élève ${id} bloqué par le professeur`);
  });
};
