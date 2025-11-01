let studentControlsInit = async (socket) => {
  const toggleMicBtn = document.getElementById('toggle-mic');
  const toggleCamBtn = document.getElementById('toggle-camera');
  const mainHandBtn = document.getElementById('main-hand');
  const leaveBtn = document.getElementById('leave-class');
  const studentVideoContainer = document.getElementById('student-videos');

  const downloadBtn = document.getElementById('download-file');
  const shareScreenBtn = document.getElementById('share-screen');
  const recordBtn = document.getElementById('record-video');

 const changeBgBtn = document.getElementById('change-background-btn'); // itilize bouton ki deja nan HTML
  

  let localStream;
  let micEnabled = true;
  let camEnabled = true;

  // 🎥 OUVRI KAMERA + MIKWO OTOMATIKMAN san mute
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    // Kreye videyo elèv la
    const studentVideo = document.createElement('video');
    studentVideo.autoplay = true;
    studentVideo.playsInline = true;
    studentVideo.muted = false; // mikwo pa mute pou lòt moun tande
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
    mainHandBtn.style.backgroundColor = 'green';
  });

  // 🚪 Kite klas la
  leaveBtn.addEventListener('click', () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    window.location.reload();
  });

  // ====================================================
  // BOUTONS ADDITIONNELS
  // ====================================================
 downloadBtn.addEventListener('click', () => {
    // kreye yon fichye test (ou ka ranplase ak kontni reyèl pita)
    const content = "Bienvenue sur Ecole-en-ligne !\nCeci est un fichier de démonstration téléchargé depuis la plateforme.";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "cours_ecole_en_ligne.txt"; // ou ka mete .pdf, .docx elatriye
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

  

  shareScreenBtn.addEventListener('click', async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      alert('Écran partagé activé (simulation).');
    } catch (err) {
      console.error(err);
    }
  });

  recordBtn.addEventListener('click', () => {
    alert('Enregistrement activé (simulation).');
  });

  // ====================================================
  // CHANGER FOND DE CLASSE
  // ====================================================
  let aiBackgrounds = [
    'url("https://source.unsplash.com/600x400/?avion")',
    'url("https://source.unsplash.com/600x400/?robo")',
    'url("https://source.unsplash.com/600x400/?maison")',
    'url("https://source.unsplash.com/600x400/?ciel")',
    'url("https://source.unsplash.com/600x400/?lame")',
    'url("https://source.unsplash.com/600x400/?decoration")'
    // Ajoute jiska 50 imaj diferan
  ];

  let currentBgIndex = 0;

  function changeBackgroundAI() {
    document.getElementById('classroom').style.backgroundImage = aiBackgrounds[currentBgIndex];
    document.getElementById('classroom').style.backgroundSize = 'cover';
    document.getElementById('classroom').style.backgroundPosition = 'center';
    currentBgIndex = (currentBgIndex + 1) % aiBackgrounds.length;
  }

  changeBgBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          document.getElementById('classroom').style.backgroundImage = `url(${ev.target.result})`;
          document.getElementById('classroom').style.backgroundSize = 'cover';
          document.getElementById('classroom').style.backgroundPosition = 'center';
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  });

  // Chanje AI otomatik chak 20 segonn
  setInterval(changeBackgroundAI, 20000);

  // 📡 Evènman backend
  socket.on('blockedStudent', ({ id }) => {
    if (socket.id === id) {
      alert('Vous avez été bloqué par le professeur');
      window.location.reload();
    }
  });
};
