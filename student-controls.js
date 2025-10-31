// student-controls.js
// Usage:
//   Window.StudentControls.init({ socket, room, username, getLocalStream, ui: { videoSection, chatInputSelector } })
//   - getLocalStream: function that returns current MediaStream (or null)
//   - student controls will be injected under #video-section by default
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

  StudentControls.init = function (opts = {}) {
    if (!opts.socket) throw new Error('StudentControls requires socket');
    const socket = opts.socket;
    const room = opts.room;
    const username = opts.username || 'student';
    const getLocalStream = opts.getLocalStream || (() => null);
    const ui = opts.ui || {};
    const videoSection = document.querySelector(ui.videoSection || '#video-section') || document.body;

    // control bar container
    let bar = document.getElementById('student-control-bar');
    if (!bar) {
      bar = $el('div', { id: 'student-control-bar' });
      bar.style.display = 'flex';
      bar.style.gap = '8px';
      bar.style.justifyContent = 'center';
      bar.style.flexWrap = 'wrap';
      bar.style.marginTop = '10px';
      videoSection.appendChild(bar);
    }

    // Buttons
    const btnMute = $el('button', { html: '🎤 Mute/Unmute' });
    const btnCam = $el('button', { html: '🎥 On/Off Cam' });
    const btnRaise = $el('button', { html: '✋ Lever la main' });
    const btnLower = $el('button', { html: '⬇️ Baisser main' });
    const btnChat = $el('button', { html: '💬 Chat' });
    const btnLeave = $el('button', { html: '🚪 Quitter' });
    const btnShare = $el('button', { html: '🖥️ Partager écran' });
    const btnDownload = $el('button', { html: '⬇️ Docs' });
    const btnRecord = $el('button', { html: '🔴 Record' });

    [btnMute, btnCam, btnRaise, btnLower, btnChat, btnLeave, btnShare, btnDownload, btnRecord].forEach(b => bar.appendChild(b));

    // State
    let recording = false;

    // Handlers
    btnMute.onclick = async () => {
      const stream = await getLocalStream();
      if (!stream) return alert('Aucun flux local');
      const aTracks = stream.getAudioTracks();
      if (!aTracks.length) return alert('Pas de micro détecté');
      const enabled = aTracks[0].enabled;
      aTracks.forEach(t => t.enabled = !enabled);
      btnMute.textContent = enabled ? '🎤 Unmute' : '🎤 Mute';
      socket.emit('private-message', { from: username, to: 'teacher', message: enabled ? 'Micro muté' : 'Micro activé' });
    };

    btnCam.onclick = async () => {
      const stream = await getLocalStream();
      if (!stream) return alert('Aucun flux local');
      const vTracks = stream.getVideoTracks();
      if (!vTracks.length) return alert('Pas de caméra détectée');
      const enabled = vTracks[0].enabled;
      vTracks.forEach(t => t.enabled = !enabled);
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
      // stop local tracks
      getLocalStream()?.getTracks().forEach(t => t.stop());
      // reload to reset UI
      location.reload();
    };

    btnShare.onclick = async () => {
      try {
        const s = await navigator.mediaDevices.getDisplayMedia({ video: true });
        // small preview
        const pv = document.createElement('video');
        pv.autoplay = true;
        pv.muted = true;
        pv.style.maxWidth = '320px';
        pv.style.marginTop = '8px';
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

    btnDownload.onclick = () => {
      // open uploads listing. Server exposes /uploads (if left enabled)
      window.open('/uploads', '_blank');
    };

    btnRecord.onclick = async () => {
      const stream = await getLocalStream();
      if (!stream) return alert('Aucun flux local');
      if (!recording) {
        // start local recording
        try {
          const mr = new MediaRecorder(stream);
          const parts = [];
          mr.ondataavailable = (e) => { if (e.data && e.data.size) parts.push(e.data); };
          mr.start(1000);
          btnRecord.textContent = '⏹️ Stop';
          recording = true;
          // store on element for stop
          btnRecord._recorder = mr;
          btnRecord._chunks = parts;
        } catch (err) {
          console.error('rec start err', err);
        }
      } else {
        // stop and upload
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
              const j = await r.json();
              if (j.success) alert('Enregistrement uploadé');
              else alert('Echec upload');
            } catch (err) {
              console.error(err);
              alert('Erreur upload');
            }
          };
        }
        btnRecord.textContent = '🔴 Record';
        recording = false;
      }
    };

    // Handle server commands (teacher actions)
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
      if (name === username) {
        alert('Votre main a été baissée par le professeur.');
      }
    });

    // auto-focus chat input when chat message arrives
    socket.on('chat-message', (data) => {
      // Show message to student UI (server also stores)
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
