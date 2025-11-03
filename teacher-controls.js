function teacherControlsInit(socket, localStream) {
  const toggleMic = document.getElementById('toggle-mic');
  const toggleCamera = document.getElementById('toggle-camera');
  const shareScreenBtn = document.getElementById('share-screen');
  const mainHandBtn = document.getElementById('main-hand');
  const changeBgBtn = document.getElementById('change-background-btn');

  toggleMic.addEventListener('click', () => {
    localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
  });

  toggleCamera.addEventListener('click', () => {
    localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
  });

  // Partage écran teacher
  shareScreenBtn.addEventListener('click', async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const teacherVideo = document.getElementById('teacher-video');
    teacherVideo.srcObject = screenStream;
    screenStream.getTracks().forEach(track => {
      track.onended = () => teacherVideo.srcObject = localStream;
    });
  });

  // Mains levées
  mainHandBtn.addEventListener('click', () => {
    socket.emit('raiseHand', { room: 'teacher' });
  });

  // Background AI
  changeBgBtn.addEventListener('click', () => {
    const bg = prompt('Entrez URL image de fond ou laissez vide pour AI automatique');
    document.getElementById('background-selector').style.backgroundImage = `url(${bg})`;
  });
}
