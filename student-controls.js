let studentControlsInit = async (socket) => {
  const toggleMicBtn = document.getElementById('toggle-mic');
  const toggleCamBtn = document.getElementById('toggle-camera');
  const mainHandBtn = document.getElementById('main-hand');
  const leaveBtn = document.getElementById('leave-class');
  const studentVideoContainer = document.getElementById('student-videos');
  const shareScreenBtn = document.getElementById('share-screen'); // elèv pa pataje, sèlman gade pwofesè
  const changeBgBtn = document.getElementById('change-background-btn');

  let localStream;
  let micEnabled = true;
  let camEnabled = true;

  // === Inisyalize stream elèv
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    const studentVideo = document.createElement('video');
    studentVideo.autoplay = true;
    studentVideo.playsInline = true;
    studentVideo.muted = true; // pou evite bri lokal
    studentVideo.srcObject = localStream;
    studentVideoContainer.appendChild(studentVideo);

    socket.emit('streamReady', { role: 'student' });
  } catch (err) {
    console.error("Erreur ouverture caméra/micro :", err);
    alert("Impossible d'accéder à la caméra ou au micro. Vérifiez vos autorisations.");
  }

  // === Fonksyon jeneral pou toggle bouton
  function toggleButton(button, callback) {
    if (!button) return;
    button.addEventListener('click', callback);
  }

  // === Mikwo & Kamera
  toggleButton(toggleMicBtn, () => {
    micEnabled = !micEnabled;
    localStream.getAudioTracks().forEach(track => track.enabled = micEnabled);
    toggleMicBtn.textContent = micEnabled ? "Mic Off" : "Mic On";
  });

  toggleButton(toggleCamBtn, () => {
    camEnabled = !camEnabled;
    localStream.getVideoTracks().forEach(track => track.enabled = camEnabled);
    toggleCamBtn.textContent = camEnabled ? "Camera Off" : "Camera On";
  });

  // === Main leve
  toggleButton(mainHandBtn, () => {
    mainHandBtn.style.backgroundColor = 'green';
    socket.emit('raiseHand');
  });

  // === Kite klas
  toggleButton(leaveBtn, () => {
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    window.location.reload();
  });






// === Share Screen (pou elèv: kapab pataje si ou vle)
toggleButton(shareScreenBtn, async () => {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    // Ajoute track nan tout peers
    Object.values(peers).forEach(pc => {
      screenStream.getTracks().forEach(track => pc.addTrack(track, screenStream));
    });

    // Kreye videyo lokal pou elèv
    const localScreenVideo = document.createElement('video');
    localScreenVideo.autoplay = true;
    localScreenVideo.playsInline = true;
    localScreenVideo.muted = true;
    localScreenVideo.srcObject = screenStream;
    studentVideoContainer.appendChild(localScreenVideo);

    screenStream.getVideoTracks()[0].addEventListener('ended', () => {
      Object.values(peers).forEach(pc => {
        const senders = pc.getSenders().filter(s => s.track && s.track.kind === 'video');
        senders.forEach(sender => pc.removeTrack(sender));
      });
      localScreenVideo.remove();
    });

  } catch (err) {
    console.error('Impossible de partager l\'écran :', err);
    alert('Impossible de partager l\'écran : ' + err.message);
  }
});



  

  // === Chanje background
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
    document.getElementById('classroom').style.backgroundImage = aiBackgrounds[currentBgIndex];
    document.getElementById('classroom').style.backgroundSize = 'cover';
    document.getElementById('classroom').style.backgroundPosition = 'center';
    currentBgIndex = (currentBgIndex + 1) % aiBackgrounds.length;
  }

  setInterval(changeBackgroundAI, 20000);

  toggleButton(changeBgBtn, () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        document.getElementById('classroom').style.backgroundImage = `url(${ev.target.result})`;
        document.getElementById('classroom').style.backgroundSize = 'cover';
        document.getElementById('classroom').style.backgroundPosition = 'center';
      };
      reader.readAsDataURL(file);
    };
    input.click();
  });

  // === Backend events
  socket.on('blockedStudent', ({ id }) => {
    if (socket.id === id) {
      alert('Vous avez été bloqué par le professeur');
      window.location.reload();
    }
  });

  // ====================================================
  // Event pou resevwa ekran pwofesè a
  socket.on('screen-share', (streamData) => {
    const videoEl = document.getElementById('teacher-screen-video') || (() => {
      const v = document.createElement('video');
      v.id = 'teacher-screen-video';
      v.autoplay = true;
      v.playsInline = true;
      v.muted = true;
      studentVideoContainer.appendChild(v);
      return v;
    })();

    // Kreye MediaStream soti nan track pwofesè a
    const stream = new MediaStream();
    stream.addTrack(streamData);
    videoEl.srcObject = stream;
  });
};
