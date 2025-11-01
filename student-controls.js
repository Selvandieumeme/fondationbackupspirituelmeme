let studentControlsInit = (socket) => {
  const toggleMicBtn = document.getElementById('toggle-mic');
  const toggleCamBtn = document.getElementById('toggle-camera');
  const mainHandBtn = document.getElementById('main-hand');
  const leaveBtn = document.getElementById('leave-class');

  // Mute/Unmute pwòp mikwo/kamera
  toggleMicBtn.addEventListener('click', ()=>{
    localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
  });

  toggleCamBtn.addEventListener('click', ()=>{
    localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
  });

  // Main leve / desann
  mainHandBtn.addEventListener('click', ()=>{
    socket.emit('raiseHand');
  });

  leaveBtn.addEventListener('click', ()=>{
    window.location.reload();
  });

  // Evènman soti nan backend
  socket.on('blockedStudent', ({id})=>{
    if(socket.id === id){
      alert('Vous avez été bloqué par le professeur');
      window.location.reload();
    }
  });
};
