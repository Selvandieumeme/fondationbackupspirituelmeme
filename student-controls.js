function studentControlsInit(socket, localStream) {
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

  // Partage écran student (optionnel)
  shareScreenBtn.addEventListener('click', async () => {
    alert("Fonction partage écran étudiant désactivée pour l'instant");
  });

  // Mains levées
  mainHandBtn.addEventListener('click', () => {
    socket.emit('raiseHand', { room: 'student' });
  });

  // Background AI
  changeBgBtn.addEventListener('click', () => {
    const bg = prompt('Entrez URL image de fond ou laissez vide pour AI automatique');
    document.getElementById('background-selector').style.backgroundImage = `url(${bg})`;
  });
}
