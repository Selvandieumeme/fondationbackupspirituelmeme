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
// ======== DROPDOWN ========
    const downloadBtn = document.getElementById('download-btn');
    const downloadMenu = document.getElementById('download-menu');

    downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadMenu.style.display = downloadMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', () => {
        downloadMenu.style.display = 'none';
    });

    // ======== FONKSYON DOWNLOAD ========
    function downloadFile(filename, content, type = "text/plain") {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ======== FONKSYON UPLOAD ========
    function uploadFileToClass(callback) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = ".pdf,.mp4,.docx,.pptx";
        input.onchange = (e) => {
            const file = e.target.files[0];
            if(file) callback(file);
        };
        input.click();
    }

    // ======== ICON 📗 TELECHARGE DOCUMENT KOU ========
    const downloadClassDoc = document.getElementById('download-class-doc');
    if(downloadClassDoc){
        downloadClassDoc.addEventListener('click', () => {
            if(window.classFileContent){
                downloadFile("document_du_cours.pdf", window.classFileContent, "application/pdf");
            } else {
                alert("Aucun document disponible pour l'instant.");
            }
        });
    }

    // ======== ICON ⬆️ UPLOAD DOSYE ========
    const uploadToClassBtn = document.getElementById('upload-to-class');
    if(uploadToClassBtn){
        uploadToClassBtn.addEventListener('click', () => {
            uploadFileToClass(file => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    window.classFileContent = ev.target.result;
                    alert(`Fichier ${file.name} ajouté à la classe !`);
                    // backend upload ka fèt isit la
                };
                reader.readAsArrayBuffer(file); // oubyen readAsDataURL si PDF/IMG
            });
        });
    }

    // ======== ICON 🎬 ENREGISTRE + TELECHARGE VIDEO ========
    let mediaRecorder;
    let recordedChunks = [];
    const recordBtn = document.getElementById('record-video');

    if(recordBtn){
        recordBtn.addEventListener('click', async () => {
            if(!mediaRecorder || mediaRecorder.state === "inactive"){
                const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
                mediaRecorder = new MediaRecorder(stream);
                recordedChunks = [];
                mediaRecorder.ondataavailable = e => { if(e.data.size>0) recordedChunks.push(e.data); };
                mediaRecorder.start();
                alert("Enregistrement démarré !");
            } else if(mediaRecorder.state === "recording"){
                mediaRecorder.stop();
                mediaRecorder.onstop = () => {
                    const blob = new Blob(recordedChunks, { type: "video/mp4" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = "session_cours.mp4";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    alert("Vidéo téléchargée !");
                };
            }
        });
    }
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
