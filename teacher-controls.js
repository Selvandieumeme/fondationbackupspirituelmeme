// teacher-controls.js
// =====================
// Usage:
//   window.TeacherControls.init({
//     socket,
//     room,
//     username,
//     getLocalStream,
//     ui: { controlsContainer, pendingContainer, videoSection, mainRaiseList, connectedStudentsList, studentsCount }
//   });

(function () {
  const TeacherControls = {};

  function createBtn(text, attrs = {}) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    Object.entries(attrs).forEach(([k, v]) => b.setAttribute(k, v));
    Object.assign(b.style, {
      cursor: 'pointer',
      background: '#1976d2',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      padding: '6px 10px',
      fontSize: '14px',
    });
    b.onmouseenter = () => (b.style.background = '#125ca0');
    b.onmouseleave = () => (b.style.background = '#1976d2');
    return b;
  }

  function ensureEl(elOrSelector, tag = 'div') {
    if (!elOrSelector) return document.createElement(tag);
    if (typeof elOrSelector === 'string') {
      const found = document.querySelector(elOrSelector);
      if (found) return found;
      const created = document.createElement(tag);
      created.id = elOrSelector.replace(/[#.]/g, '');
      return created;
    }
    return elOrSelector;
  }

  TeacherControls.init = function (opts = {}) {
    if (!opts.socket) throw new Error('TeacherControls requires socket');
    const socket = opts.socket;
    const room = opts.room;
    const username = opts.username || 'Professeur';
    const getLocalStream = opts.getLocalStream || (() => null);
    const ui = opts.ui || {};

    const controlsContainer = ensureEl(ui.controlsContainer || '#teacher-controls', 'div');
    Object.assign(controlsContainer.style, {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      alignItems: 'center',
      margin: '10px 0',
    });

    const pendingContainer = ensureEl(ui.pendingContainer || '#pending-students', 'div');
    Object.assign(pendingContainer.style, {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
    });

    const mainRaiseList = ui.mainRaiseList || document.createElement('div');
    const connectedStudentsList = ui.connectedStudentsList || document.createElement('div');
    const studentsCount = ui.studentsCount || document.createElement('div');

    // --- Boutons Principaux ---
    const btnMuteAll = createBtn('🔇 Mute Tout');
    const btnStopAllVideo = createBtn('📷 Stop Tout Video');
    const btnAcceptAll = createBtn('✅ Asepte Tout');
    const btnLowerAllHands = createBtn('✋ Desann Tout Men');
    const btnBlock = createBtn('🚫 Bloke Elèv');
    const btnRecord = createBtn('🎥 Kòmanse Anrejistreman');
    const btnStopRecord = createBtn('⏹ Sispann Anrejistreman');
    const btnShareScreen = createBtn('🖥️ Pataje Ekran');
    const uploadInput = document.createElement('input');
    uploadInput.type = 'file';
    uploadInput.style.marginLeft = '6px';
    const btnAnnouncement = createBtn('📢 Fè Anons');

    // Ajoute yo nan UI
    [
      btnMuteAll,
      btnStopAllVideo,
      btnLowerAllHands,
      btnBlock,
      btnRecord,
      btnStopRecord,
      btnShareScreen,
      uploadInput,
      btnAnnouncement,
      btnAcceptAll,
    ].forEach((b) => controlsContainer.appendChild(b));

    if (!document.body.contains(controlsContainer))
      document.body.insertBefore(controlsContainer, document.body.firstChild);
    if (!document.body.contains(pendingContainer))
      document.body.insertBefore(pendingContainer, controlsContainer.nextSibling);

    // --- Fonksyon Anrejistreman ---
    let mediaRecorder = null;
    let recordedChunks = [];

    async function startRecording() {
      if (!navigator.mediaDevices) return alert("Navigatè ou pa sipòte MediaRecorder.");
      const stream = await getLocalStream();
      if (!stream) return alert('Pa gen videyo lokal pou anrejistre.');
      recordedChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size) recordedChunks.push(e.data);
      };
      mediaRecorder.start(1000);
      btnRecord.disabled = true;
      btnStopRecord.disabled = false;
      socket.emit('chat-message', {
        room,
        from: username,
        message: '🎬 Anrejistreman kòmanse.',
      });
    }

    async function stopRecording() {
      if (!mediaRecorder) return;
      mediaRecorder.stop();
      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const fd = new FormData();
        fd.append('file', blob, `${room || 'session'}-${Date.now()}.webm`);
        try {
          const res = await fetch('/upload-recording', { method: 'POST', body: fd });
          const json = await res.json().catch(() => ({}));
          if (json.success) {
            socket.emit('chat-message', {
              room,
              from: username,
              message: `📁 Anrejistreman disponib: ${json.path}`,
            });
            alert('✅ Anrejistreman telechaje avèk siksè.');
          } else alert('❌ Echec upload enregistrement.');
        } catch (err) {
          console.error(err);
          alert('⚠️ Erè upload anrejistreman.');
        }
      };
      btnRecord.disabled = false;
      btnStopRecord.disabled = true;
    }

    btnRecord.onclick = startRecording;
    btnStopRecord.onclick = stopRecording;
    btnStopRecord.disabled = true;

    // --- Pataje Ekran ---
    btnShareScreen.onclick = async () => {
      try {
        const s = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoSection =
          document.querySelector(ui.videoSection || '#video-section') || document.body;
        let preview = document.getElementById('teacher-screen-share-preview');
        if (!preview) {
          preview = document.createElement('video');
          preview.id = 'teacher-screen-share-preview';
          Object.assign(preview, { autoplay: true, muted: true });
          preview.style.maxWidth = '100%';
          videoSection.prepend(preview);
        }
        preview.srcObject = s;
        socket.emit('teacher-share-screen', { room });
        const t = s.getVideoTracks()[0];
        t.onended = () => {
          socket.emit('teacher-stop-screen', { room });
          preview.remove();
        };
      } catch (err) {
        console.error('Share screen fail', err);
        alert('Erreur partage écran: ' + err.message);
      }
    };

    // --- Upload Dokiman ---
    uploadInput.onchange = async () => {
      const file = uploadInput.files[0];
      if (!file) return;
      const form = new FormData();
      form.append('document', file);
      try {
        const res = await fetch('/upload-doc', { method: 'POST', body: form });
        const rjson = await res.json().catch(() => ({}));
        if (rjson.success) {
          socket.emit('chat-message', {
            room,
            from: username,
            message: `📄 Nouvo dokiman pataje: ${rjson.path}`,
          });
          alert('✅ Dokiman telechaje ak pataje.');
        } else alert('❌ Echec upload document.');
      } catch (err) {
        console.error(err);
        alert('⚠️ Erè upload dokiman.');
      }
    };

    // --- Kontwòl Global ---
    btnBlock.onclick = () => {
      const target = prompt('Antre non elèv pou bloke:');
      if (!target) return;
      socket.emit('teacher-block-student', { room, username: target });
    };

    btnLowerAllHands.onclick = () => socket.emit('teacher-lower-hand', { room });
    btnMuteAll.onclick = () => socket.emit('teacher-mute-all', { room });
    btnStopAllVideo.onclick = () => socket.emit('teacher-stop-all-video', { room });

    btnAcceptAll.onclick = () => {
      const entries = pendingContainer.querySelectorAll('[data-pending-name]');
      entries.forEach((el) => {
        const uname = el.getAttribute('data-pending-name');
        socket.emit('teacher-accept', { room, username: uname });
        el.parentElement?.remove();
      });
    };

    btnAnnouncement.onclick = () => {
      const text = prompt('Tèks anons la:');
      if (text)
        socket.emit('chat-message', {
          room,
          from: username,
          message: '📢 [ANONS]: ' + text,
        });
    };

    // --- Evènman Socket pou elèv pending ak joined ---
    socket.on('student-pending', (data) => {
      const uname = data.username;
      if (pendingContainer.querySelector(`[data-pending-name="${uname}"]`)) return;

      const wrap = document.createElement('div');
      Object.assign(wrap.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: '#333',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '6px',
      });

      const nameSpan = document.createElement('span');
      nameSpan.textContent = uname;
      nameSpan.setAttribute('data-pending-name', uname);
      const aBtn = createBtn('Asepte');
      const rBtn = createBtn('Rejte');
      aBtn.onclick = () => {
        socket.emit('teacher-accept', { room, username: uname });
        wrap.remove();
      };
      rBtn.onclick = () => {
        socket.emit('teacher-reject', { room, username: uname });
        wrap.remove();
      };
      wrap.append(nameSpan, aBtn, rBtn);
      pendingContainer.appendChild(wrap);
    });

    socket.on('student-joined', (data) => {
      const uname = data.username || data;
      const listEl =
        document.getElementById('teacher-student-list') ||
        Object.assign(document.createElement('div'), { id: 'teacher-student-list' });

      const item = document.createElement('div');
      Object.assign(item.style, {
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
        background: '#222',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '6px',
      });
      item.textContent = uname;

      const muteBtn = createBtn('Mute');
      const camBtn = createBtn('CamOff');
      const blockBtn = createBtn('Bloke');

      muteBtn.onclick = () =>
        socket.emit('teacher-toggle-mic', { room, username: uname, enabled: false });
      camBtn.onclick = () =>
        socket.emit('teacher-toggle-video', { room, username: uname, enabled: false });
      blockBtn.onclick = () => socket.emit('teacher-block-student', { room, username: uname });

      item.append(muteBtn, camBtn, blockBtn);
      listEl.appendChild(item);

      if (!document.body.contains(listEl)) controlsContainer.appendChild(listEl);
    });

    window.addEventListener('online', () => {
      if (room && username) socket.emit('join-room', { room, role: 'teacher', username });
    });

    return { container: controlsContainer, pendingContainer, startRecording, stopRecording };
  };

  window.TeacherControls = TeacherControls;
})();
