let teacherControlsInit = async (socket) => {  
  const toggleMicBtn = document.getElementById('toggle-mic');
  const toggleCamBtn = document.getElementById('toggle-camera');
  const mainHandBtn = document.getElementById('main-hand');
  const leaveBtn = document.getElementById('leave-class');
  const teacherVideo = document.getElementById('teacher-video');

  const downloadBtn = document.getElementById('download-btn');
  const shareScreenBtn = document.getElementById('share-screen');
  const recordBtn = document.getElementById('record-video');

const changeBgBtn = document.getElementById('change-background-btn'); // itilize bouton ki deja nan HTML

  
  
  let localStream;
  let micEnabled = true;
  let camEnabled = true;

  // 🎥 OUVRI KAMERA + MIKWO OTOMATIKMAN
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
    teacherVideo.srcObject = localStream;
    teacherVideo.autoplay = true;
    teacherVideo.playsInline = true;
    teacherVideo.muted = false; // pwofesè pa mute pou elèv ka tande li
    
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
    socket.emit('toggleMic'); 
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
    mainHandBtn.style.backgroundColor = 'green'; // montre li aktive
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
// === UPLOAD DOKIMAN VERS SALLE ===
document.getElementById('uploadFile')?.addEventListener('click', async () => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '*/*';
  fileInput.onchange = async () => {
    const file = fileInput.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      await fetch('/upload', { method: 'POST', body: formData });
      alert("✅ Fichye telechaje nan salle la avèk siksè !");
    } catch (err) {
      alert("❌ Erè pandan upload la !");
    }
  };
  fileInput.click();
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
