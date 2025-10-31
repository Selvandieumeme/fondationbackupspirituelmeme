// teacher-controls.js
// Usage:
//   Window.TeacherControls.init({ socket, room, username, getLocalStream, ui: { container selectors } })
//   - getLocalStream: function returning current localMediaStream (may be async or null initially)
//   - ui optional: { controlsContainer, pendingContainer, videoSection } DOM elements or selectors
(function () {
  const TeacherControls = {};

  function createBtn(text, attrs = {}) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    Object.entries(attrs).forEach(([k, v]) => b.setAttribute(k, v));
    b.style.cursor = 'pointer';
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
    const username = opts.username || 'teacher';
    const getLocalStream = opts.getLocalStream || (() => null);
    const ui = opts.ui || {};

    const controlsContainer = ensureEl(ui.controlsContainer || '#teacher-controls', 'div');
    controlsContainer.style.display = 'flex';
    controlsContainer.style.flexWrap = 'wrap';
    controlsContainer.style.gap = '8px';
    controlsContainer.style.alignItems = 'center';

    // ensure pending container
    const pendingContainer = ensureEl(ui.pendingContainer || '#pending-students', 'div');
    pendingContainer.style.display = 'flex';
    pendingContainer.style.flexWrap = 'wrap';
    pendingContainer.style.gap = '6px';

    // Buttons
    const btnMuteAll = createBtn('Mute All');
    const btnStopAllVideo = createBtn('Stop All Video');
    const btnAcceptAll = createBtn('Accepter Tout'); // optional mass-accept (use carefully)
    const btnLowerAllHands = createBtn('Desendre Toutes Mains');
    const btnBlock = createBtn('Bloquer Élève'); // requires username prompt
    const btnRecord = createBtn('Commencer Enregistrement');
    const btnStopRecord = createBtn('Arrêter Enregistrement');
    const btnShareScreen = createBtn('Partager Écran');
    const uploadInput = document.createElement('input');
    uploadInput.type = 'file';
    uploadInput.style.display = 'inline-block';
    uploadInput.style.marginLeft = '6px';

    const btnAnnouncement = createBtn('Diffuser Annonce');

    // Append UI
    controlsContainer.appendChild(btnMuteAll);
    controlsContainer.appendChild(btnStopAllVideo);
    controlsContainer.appendChild(btnLowerAllHands);
    controlsContainer.appendChild(btnBlock);
    controlsContainer.appendChild(btnRecord);
    controlsContainer.appendChild(btnStopRecord);
    controlsContainer.appendChild(btnShareScreen);
    controlsContainer.appendChild(uploadInput);
    controlsContainer.appendChild(btnAnnouncement);
    controlsContainer.appendChild(btnAcceptAll);
    if (!document.body.contains(controlsContainer)) {
      // If the container was not in DOM (created), append to top of body
      document.body.insertBefore(controlsContainer, document.body.firstChild);
    }
    if (!document.body.contains(pendingContainer)) {
      document.body.insertBefore(pendingContainer, controlsContainer.nextSibling);
    }

    // Recording helpers (teacher side)
    let mediaRecorder = null;
    let recordedChunks = [];

    async function startRecording() {
      const stream = await getLocalStream();
      if (!stream) return alert('Aucun flux local pour enregistrer');
      recordedChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size) recordedChunks.push(e.data);
      };
      mediaRecorder.start(1000);
      btnRecord.disabled = true;
      btnStopRecord.disabled = false;
      socket.emit('chat-message', { room, from: username, message: 'Enregistrement démarré (professeur).' });
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
          const json = await res.json();
          if (json.success) {
            alert('Enregistrement uploadé.');
            socket.emit('chat-message', { room, from: username, message: 'Enregistrement disponible: ' + json.path });
          } else {
            alert('Echec upload enregistrement');
          }
        } catch (err) {
          console.error(err);
          alert('Erreur upload enregistrement');
        }
      };
      btnRecord.disabled = false;
      btnStopRecord.disabled = true;
    }

    btnRecord.onclick = () => startRecording();
    btnStopRecord.onclick = () => stopRecording();
    btnStopRecord.disabled = true;

    // Share screen: teacher shares and server notifies students
    btnShareScreen.onclick = async () => {
      try {
        const s = await navigator.mediaDevices.getDisplayMedia({ video: true });
        // show a preview in video-section if present
        const videoSection = document.querySelector(ui.videoSection || '#video-section') || document.body;
        let screenEl = document.getElementById('teacher-screen-share-preview');
        if (!screenEl) {
          screenEl = document.createElement('video');
          screenEl.id = 'teacher-screen-share-preview';
          screenEl.autoplay = true;
          screenEl.muted = true;
          screenEl.style.maxWidth = '100%';
          videoSection.insertBefore(screenEl, videoSection.firstChild);
        }
        screenEl.srcObject = s;
        socket.emit('teacher-share-screen', { room });
        const t = s.getVideoTracks()[0];
        t.onended = () => {
          socket.emit('teacher-stop-screen', { room });
          if (screenEl) screenEl.remove();
        };
      } catch (err) {
        console.error('Share screen fail', err);
        alert('Erreur partage écran: ' + err.message);
      }
    };

    // Upload doc and broadcast link via chat
    uploadInput.onchange = async () => {
      const file = uploadInput.files[0];
      if (!file) return;
      const form = new FormData();
      form.append('document', file);
      try {
        const res = await fetch('/upload-doc', { method: 'POST', body: form });
        const rjson = await res.json();
        if (rjson.success) {
          socket.emit('chat-message', { room, from: username, message: `Document partagé: ${rjson.path}` });
          alert('Document uploadé et partagé en chat');
        } else alert('Échec upload document');
      } catch (err) {
        console.error(err);
        alert('Erreur upload doc');
      }
    };

    // Block single student by username
    btnBlock.onclick = () => {
      const target = prompt('Nom itilizatè elev pou blòk (eg: jean):');
      if (!target) return;
      socket.emit('teacher-block-student', { room, username: target });
    };

    // Lower all hands
    btnLowerAllHands.onclick = () => socket.emit('teacher-lower-hand', { room });

    // Mute all / stop all video
    btnMuteAll.onclick = () => socket.emit('teacher-mute-all', { room });
    btnStopAllVideo.onclick = () => socket.emit('teacher-stop-all-video', { room });

    // Accept all pending (helper) — use carefully (will attempt to accept only existing pending entries)
    btnAcceptAll.onclick = () => {
      // try to accept all pending child nodes in pendingContainer
      const pendingBtns = pendingContainer.querySelectorAll('div');
      pendingBtns.forEach((wrap) => {
        const nameEl = wrap.querySelector('span[data-pending-name]');
        if (nameEl) {
          const uname = nameEl.getAttribute('data-pending-name');
          socket.emit('teacher-accept', { room, username: uname });
          wrap.remove();
        }
      });
    };

    // Announcement
    btnAnnouncement.onclick = () => {
      const text = prompt('Texte de l\'annonce à diffuser:');
      if (!text) return;
      socket.emit('chat-message', { room, from: username, message: '[ANNONCE PROFESSEUR] ' + text });
    };

    // Server events: pending student
    socket.on('student-pending', (data) => {
      // data: { username }
      const uname = data.username;
      // create compact entry
      const wrap = document.createElement('div');
      wrap.style.display = 'flex';
      wrap.style.alignItems = 'center';
      wrap.style.gap = '6px';
      const nameSpan = document.createElement('span');
      nameSpan.textContent = uname;
      nameSpan.setAttribute('data-pending-name', uname);
      nameSpan.style.color = '#fff';
      const aBtn = createBtn('Accepter');
      const rBtn = createBtn('Rejeter');
      aBtn.onclick = () => {
        socket.emit('teacher-accept', { room, username: uname });
        wrap.remove();
      };
      rBtn.onclick = () => {
        socket.emit('teacher-reject', { room, username: uname });
        wrap.remove();
      };
      wrap.appendChild(nameSpan);
      wrap.appendChild(aBtn);
      wrap.appendChild(rBtn);
      pendingContainer.appendChild(wrap);
    });

    // handle notification when student joins (teacher may get socketId or not)
    socket.on('student-joined', (data) => {
      // data can contain { username, socketId }
      const uname = data.username || data;
      console.log('Student joined:', uname, data.socketId || data.id);
      // Optionally create small control next to student video (e.g. block, mute single)
      // Create a short UI indicator in pendingContainer or dedicated student list:
      const listEl = document.getElementById('teacher-student-list') || document.createElement('div');
      listEl.id = 'teacher-student-list';
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.gap = '6px';
      item.style.alignItems = 'center';
      item.textContent = uname;
      const muteBtn = createBtn('Mute');
      const camBtn = createBtn('CamOff');
      const blockBtn = createBtn('Block');
      muteBtn.onclick = () => socket.emit('teacher-toggle-mic', { room, username: uname, enabled: false });
      camBtn.onclick = () => socket.emit('teacher-toggle-video', { room, username: uname, enabled: false });
      blockBtn.onclick = () => socket.emit('teacher-block-student', { room, username: uname });
      item.appendChild(muteBtn);
      item.appendChild(camBtn);
      item.appendChild(blockBtn);
      listEl.appendChild(item);
      if (!document.body.contains(listEl)) controlsContainer.appendChild(listEl);
    });

    // reconnect handling: professor may leave and rejoin
    window.addEventListener('online', () => {
      // attempt to rejoin room as teacher if disconnected
      if (room && username) {
        socket.emit('join-room', { room, role: 'teacher', username });
      }
    });

    return {
      container: controlsContainer,
      pendingContainer,
      startRecording,
      stopRecording,
    };
  };

  // expose
  window.TeacherControls = TeacherControls;
})();
