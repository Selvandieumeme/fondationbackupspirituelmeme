function teacherControlsInit({ localStream, socket, room, name } = {}) {
  socket.on('request-join', ({ socketId, name:candidateName }) => {
    const ok = confirm(`${candidateName} demande à rejoindre. Accepter ?`);
    socket.emit('teacher-accept-join',{ pendingSocketId:socketId, accept:ok });
  });

  socket.on('mute-all', () => { if(localStream) localStream.getAudioTracks().forEach(t=>t.enabled=false); });
}
