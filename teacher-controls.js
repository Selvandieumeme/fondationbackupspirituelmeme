let teacherControlsInit = (socket) => {
  const toggleMicBtn = document.getElementById('toggle-mic');
  const toggleCamBtn = document.getElementById('toggle-camera');
  const mainHandBtn = document.getElementById('main-hand');
  const leaveBtn = document.getElementById('leave-class');

  // Mute/Unmute tout elèv
  toggleMicBtn.addEventListener('click', ()=>{
    socket.emit('toggleMic');
  });

  toggleCamBtn.addEventListener('click', ()=>{
    socket.emit('toggleCamera');
  });

  // Main leve / desann (pwofè ka leve/desann pwòp men)
  mainHandBtn.addEventListener('click', ()=>{
    socket.emit('raiseHand');
  });

  // Kite klas la
  leaveBtn.addEventListener('click', ()=>{
    window.location.reload();
  });

  // Evènman soti nan backend
  socket.on('updateMic', ({id})=>{
    console.log(`Mikwo toggled pou ${id}`);
  });
  socket.on('updateCamera', ({id})=>{
    console.log(`Camera toggled pou ${id}`);
  });
  socket.on('blockedStudent', ({id})=>{
    alert(`Elève ${id} bloqué par le professeur`);
  });
};
