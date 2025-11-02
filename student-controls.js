let studentControlsInit = async (socket) => {
  const toggleMicBtn = document.getElementById('toggle-mic');
  const toggleCamBtn = document.getElementById('toggle-camera');
  const mainHandBtn = document.getElementById('main-hand');
  const leaveBtn = document.getElementById('leave-class');
  const studentVideoContainer = document.getElementById('student-videos');
  const shareScreenBtn = document.getElementById('share-screen');
  const changeBgBtn = document.getElementById('change-background-btn');

  let localStream;
  let micEnabled = true;
  let camEnabled = true;

  // === Inisyalize stream elèv ===
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    const studentVideo = document.createElement('video');
    studentVideo.autoplay = true;
    studentVideo.playsInline = true;
    studentVideo.muted = true; // evite echo
    studentVideo.srcObject = localStream;
    studentVideoContainer.appendChild(studentVideo);

    socket.emit('streamReady', { role: 'student' });
  } catch (err) {
    console.error("Erreur ouverture caméra/micro :", err);
    alert("Impossible d'accéder à la caméra ou au micro. Vérifiez vos autorisations.");
  }

  // === Fonksyon jeneral ===
  function toggleButton(button, callback) {
    if (!button) return;
    button.addEventListener('click', callback);
  }

  // === Mikwo & Kamera ===
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

  // === Main leve ===
  toggleButton(mainHandBtn, () => {
    mainHandBtn.style.backgroundColor = 'green';
    socket.emit('raiseHand');
  });

  // === Kite klas ===
  toggleButton(leaveBtn, () => {
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    window.location.reload();
  });

  // === Share Screen (si elèv ka pataje) ===
  toggleButton(shareScreenBtn, async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      Object.values(peers || {}).forEach(pc => {
        screenStream.getTracks().forEach(track => pc.addTrack(track, screenStream));
      });

      const localScreenVideo = document.createElement('video');
      localScreenVideo.autoplay = true;
      localScreenVideo.playsInline = true;
      localScreenVideo.muted = true;
      localScreenVideo.srcObject = screenStream;
      studentVideoContainer.appendChild(localScreenVideo);

      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        localScreenVideo.remove();
      });

    } catch (err) {
      console.error('Impossible de partager l\'écran :', err);
      alert('Impossible de partager l\'écran : ' + err.message);
    }
  });

  // === Chanje background ===
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
    const classroom = document.getElementById('classroom');
    classroom.style.backgroundImage = aiBackgrounds[currentBgIndex];
    classroom.style.backgroundSize = 'cover';
    classroom.style.backgroundPosition = 'center';
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
        const classroom = document.getElementById('classroom');
        classroom.style.backgroundImage = `url(${ev.target.result})`;
        classroom.style.backgroundSize = 'cover';
        classroom.style.backgroundPosition = 'center';
      };
      reader.readAsDataURL(file);
    };
    input.click();
  });

  // === Resevwa stream pwofesè oswa lòt elèv ===
  socket.on('incomingStream', (streamData) => {
    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    video.srcObject = streamData;
    studentVideoContainer.appendChild(video);
  });

  // === Ekran pwofesè ===
  socket.on('screen-share', (streamData) => {
    const videoEl = document.getElementById('teacher-screen-video') || (() => {
      const v = document.createElement('video');
      v.id = 'teacher-screen-video';
      v.autoplay = true;
      v.playsInline = true;
      v.muted = false;
      studentVideoContainer.appendChild(v);
      return v;
    })();

    const stream = new MediaStream();
    stream.addTrack(streamData);
    videoEl.srcObject = stream;
  });
};
