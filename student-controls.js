// student-controls.js
// =====================
// Usage:
//   window.StudentControls.init({ socket, room, username, getLocalStream, ui: { videoSection, chatInputSelector } })

(function () {
  const StudentControls = {};

  function $el(tag, props = {}) {
    const e = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === 'html') e.innerHTML = v;
      else if (k === 'class') e.className = v;
      else e.setAttribute(k, v);
    });
    return e;
  }

  function styleBtn(btn) {
    Object.assign(btn.style, {
      cursor: 'pointer',
      background: '#1976d2',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      padding: '6px 10px',
      fontSize: '14px',
    });
    btn.onmouseenter = () => (btn.style.background = '#125ca0');
    btn.onmouseleave = () => (btn.style.background = '#1976d2');
    return btn;
  }

  StudentControls.init = function (opts = {}) {
    if (!opts.socket) throw new Error('StudentControls requires socket');
    const socket = opts.socket;
    const room = opts.room;
    const username = opts.username || 'student';
    const getLocalStream = opts.getLocalStream || (() => null);
    const ui = opts.ui || {};
    const videoSection = document.querySelector(ui.videoSection || '#video-section') || document.body;

    // --- Create control bar ---
    let bar = document.getElementById('student-control-bar');
    if (!bar) {
      bar = $el('div', { id: 'student-control-bar' });
      Object.assign(bar.style, {
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: '10px',
      });
      videoSection.appendChild(bar);
    }

    // --- Buttons ---
    const btnMute = styleBtn($el('button', { html: '🎤 Mute/Unmute' }));
    const btnCam = styleBtn($el('button', { html: '🎥 Cam On/Off' }));
    const btnRaise = styleBtn($el('button', { html: '✋ Lever la main' }));
    const btnLower = styleBtn($el('button', { html: '⬇️ Baisser main' }));
    const btnChat = styleBtn($el('button', { html: '💬 Chat' }));
    const btnLeave = styleBtn($el('button', { html: '🚪 Quitter' }));
    const btnShare = styleBtn($el('button', { html: '🖥️ Partager écran' }));
    const btnDownload = styleBtn($el('button', { html: '⬇️ Docs' }));
    const btnRecord = styleBtn($el('button', { html: '🔴 Record' }));

    [btnMute, btnCam, btnRaise, btnLower, btnChat, btnLeave, btnShare, btnDownload, btnRecord].forEach(b => bar.appendChild(b));

    // --- State ---
    let recording = false;

    // --- Handlers ---
    btnMute.onclick = async () => {
      const stream = await getLocalStream();
      if (!stream) return alert('Aucun flux local');
      const tracks = stream.getAudioTracks();
      if (!tracks.length) return alert('Pas de micro détecté');
      const enabled = tracks[0].enabled;
      tracks.forEach(t => t.enabled = !enabled);
      btnMute.textContent = enabled ? '🎤 Unmute' : '🎤 Mute';
      socket.emit('private-message', { from: username, to: 'teacher', message: enabled ? 'Micro muté' : 'Micro activé' });
    };

    btnCam.onclick = async () => {
      const stream = await getLocalStream();
      if (!stream) return alert('Aucun flux local');
      const tracks = stream.getVideoTracks();
      if (!tracks.length) return alert('Pas de caméra détectée');
      const enabled = tracks[0].enabled;
      tracks.forEach(t => t.enabled = !enabled);
      btnCam.textContent = enabled ? '🎥 Cam On' : '🎥 Cam Off';
    };

    btnRaise.onclick = () => {
      socket.emit('raise-hand', { user: username, room });
      btnRaise.disabled = true;
      btnRaise.textContent = '✋ Levée';
    };

    btnLower.onclick = () => {
      socket.emit('teacher-lower-hand', { username, room });
      btnRaise.disabled = false;
      btnRaise.textContent = '✋ Lever la main';
    };

    btnChat.onclick = () => {
      const input = document.querySelector(ui.chatInputSelector || '#msg');
      if (input) input.focus();
      else alert('Aucun champ chat trouvé');
    };

    btnLeave.onclick = () => {
      socket.emit('leave-room', room);
      getLocalStream()?.getTracks().forEach(t => t.stop());
      location.reload();
    };

    btnShare.onclick = async () => {
      if (!navigator.mediaDevices) return alert("Navigatè ou pa sipòte screen share.");
      try {
        const s = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const pv = document.createElement('video');
        Object.assign(pv, { autoplay: true, muted: true });
        Object.assign(pv.style, { maxWidth: '320px', marginTop: '8px' });
        pv.srcObject = s;
        videoSection.appendChild(pv);
        socket.emit('student-shared-screen', { room, username });
        const t = s.getVideoTracks()[0];
        t.onended = () => {
          pv.remove();
          socket.emit('student-stop-screen', { room, username });
        };
      } catch (err) {
        console.error('share screen student', err);
        alert('Erreur partage écran: ' + err.message);
      }
    };

    btnDownload.onclick = () => window.open('/uploads', '_blank');

    btnRecord.onclick = async () => {
      const stream = await getLocalStream();
      if (!stream) return alert('Aucun flux local');
      if (!recording) {
        try {
          const mr = new MediaRecorder(stream);
          const parts = [];
          mr.ondataavailable = (e) => { if (e.data && e.data.size) parts.push(e.data); };
          mr.start(1000);
          btnRecord.textContent = '⏹️ Stop';
          recording = true;
          btnRecord._recorder = mr;
          btnRecord._chunks = parts;
        } catch (err) {
          console.error('rec start err', err);
        }
      } else {
        const mr = btnRecord._recorder;
        const parts = btnRecord._chunks || [];
        if (mr) {
          mr.stop();
          mr.onstop = async () => {
            const blob = new Blob(parts, { type: 'video/webm' });
            const fd = new FormData();
            fd.append('file', blob, `${username}-${Date.now()}.webm`);
            try {
              const r = await fetch('/upload-recording', { method: 'POST', body: fd });
              const j = await r.json().catch(() => ({}));
              if (j.success) alert('✅ Enregistrement uploadé');
              else alert('❌ Echec upload');
            } catch (err) {
              console.error(err);
              alert('⚠️ Erreur upload');
            }
          };
        }
        btnRecord.textContent = '🔴 Record';
        recording = false;
      }
    };

    // --- Server commands ---
    socket.on('teacher-mute-all', () => {
      getLocalStream()?.getAudioTracks().forEach(t => t.enabled = false);
      alert('Le professeur a coupé les micros.');
    });
    socket.on('teacher-stop-all-video', () => {
      getLocalStream()?.getVideoTracks().forEach(t => t.enabled = false);
      alert('Le professeur a coupé les caméras.');
    });
    socket.on('teacher-block-student', ({ reason }) => {
      alert('Vous avez été retiré de la classe. ' + (reason || ''));
      location.reload();
    });
    socket.on('teacher-lower-hand', ({ username: name }) => {
      if (name === username) alert('Votre main a été baissée par le professeur.');
    });

    socket.on('chat-message', (data) => {
      const msgList = document.querySelector('#messages');
      if (msgList) {
        const li = document.createElement('li');
        li.textContent = `${data.from}: ${data.message}`;
        msgList.appendChild(li);
        msgList.scrollTop = msgList.scrollHeight;
      }
    });

    return {
      container: bar,
      buttons: { btnMute, btnCam, btnRaise, btnLower, btnChat, btnLeave, btnShare, btnDownload, btnRecord },
    };
  };

  window.StudentControls = StudentControls;
})();
