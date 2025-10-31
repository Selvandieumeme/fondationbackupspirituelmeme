/* ecole-en-ligne.js
   Full frontend logic: Socket.io + WebRTC signaling + UI controls
   Assumes the following HTML IDs exist (from Ecole-en-ligne.html):
   - room-code, username, role, join-room
   - teacher-controls, teacher-video
   - student-videos, pending-students
   - mute-all, stop-all-video, start-rec, stop-rec, upload-doc, share-screen
   - messages, msg, send
   - plus container #video-section, #chat-section
*/

const socket = io("https://examen-backend-ihlx.onrender.com"); // or relative path if same origin

// --- Config ---
const MAX_STUDENTS = 100;
const ICE_CONFIG = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

// --- State ---
let localStream = null;
let role = null;
let room = null;
let username = null;
let isRecording = false;
let recorder = null;
let recordedChunks = [];
let pcMap = new Map(); // peer connections: key = peerSocketId or username, value = RTCPeerConnection
let remoteStreams = new Map(); // for remote videos if needed
let teacherSocketId = null;
let isTeacher = false;
let screenStream = null;

// --- DOM ---
const joinBtn = document.getElementById('join-room');
const roomCodeInput = document.getElementById('room-code');
const usernameInput = document.getElementById('username');
const roleSelect = document.getElementById('role');

const teacherControls = document.getElementById('teacher-controls');
const teacherVideo = document.getElementById('teacher-video');
const studentVideos = document.getElementById('student-videos');
const pendingStudentsDiv = document.getElementById('pending-students');

const muteAllBtn = document.getElementById('mute-all');
const stopAllBtn = document.getElementById('stop-all-video');
const startRecBtn = document.getElementById('start-rec');
const stopRecBtn = document.getElementById('stop-rec');
const uploadDoc = document.getElementById('upload-doc');
const shareScreenBtn = document.getElementById('share-screen');

const messagesList = document.getElementById('messages');
const msgInput = document.getElementById('msg');
const sendBtn = document.getElementById('send');

const videoSection = document.getElementById('video-section');

// Helper to create element safely
function $q(tag, props = {}) {
  const el = document.createElement(tag);
  for (const k in props) {
    if (k === 'class') el.className = props[k];
    else if (k === 'html') el.innerHTML = props[k];
    else el.setAttribute(k, props[k]);
  }
  return el;
}

/* --------------------
   JOIN / START FLOW
   -------------------- */
joinBtn.onclick = async () => {
  room = roomCodeInput.value.trim();
  username = usernameInput.value.trim();
  role = roleSelect.value;

  if (!room || !username) return alert('Remplissez tous les champs');

  // set user on socket
  socket.emit('setUser', { username, role });

  if (role === 'teacher') {
    isTeacher = true;
    // teacher obtains full media (audio+video)
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      teacherVideo.muted = true;
      teacherVideo.srcObject = localStream;
      teacherVideo.play().catch(()=>{});
    } catch (err) {
      console.error('getUserMedia teacher failed', err);
      alert('Impossible d\'accéder caméra/microphone (teacher): ' + err.message);
      return;
    }
    // show teacher controls
    if (teacherControls) teacherControls.style.display = 'flex';
    socket.emit('join-room', { room, role: 'teacher', username });
  } else {
    // student: request join
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      // allow student to join without media (view-only)
      console.warn('Student getUserMedia failed, will join view-only', err);
      localStream = null;
    }
    socket.emit('request-join', { room, username });
    // create student's control UI
    buildStudentControls();
  }
};

/* --------------------
   TEACHER: pending students UI
   -------------------- */
socket.on('student-pending', data => {
  // data: { username }
  if (!isTeacher) return;
  const usernamePending = data.username;
  const wrapper = $q('div', { id: `pending-${usernamePending}` });
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '8px';
  wrapper.style.margin = '4px';
  wrapper.innerHTML = `<strong style="color:#fff">${usernamePending}</strong>`;
  const acceptBtn = $q('button', { html: 'Accepter' });
  const rejectBtn = $q('button', { html: 'Rejeter' });
  acceptBtn.onclick = () => {
    socket.emit('teacher-accept', { room, username: usernamePending });
    wrapper.remove();
  };
  rejectBtn.onclick = () => {
    socket.emit('teacher-reject', { room, username: usernamePending });
    wrapper.remove();
  };
  wrapper.appendChild(acceptBtn);
  wrapper.appendChild(rejectBtn);
  pendingStudentsDiv.appendChild(wrapper);
});

/* --------------------
   ON ACCEPTED (student) -> Prepare PeerConnection for teacher stream
   -------------------- */
socket.on('accepted', async (data) => {
  // student accepted into room
  // data: { room }
  if (role !== 'student') return;
  // Save room and join
  socket.emit('join-room', { room, role: 'student', username });
  // Wait for teacher to initiate offer via signaling
  console.log('Accepted to room', data);
});

/* --------------------
   SIGNALING: teacher will send offers; we handle offer/answer/ice
   We'll standardize signaling events:
    - 'webrtc-offer' : sent by initiator (teacher) with { to: studentSocketId, sdp, fromUsername }
    - 'webrtc-answer': sent by student to teacher with { to: teacherSocketId, sdp }
    - 'webrtc-ice'   : any peer sends ICE candidate with { to, candidate }
   (server should just relay these via socket.to(...) calls)
   -------------------- */

// Create RTCPeerConnection and attach tracks to target video element
async function createPeerConnectionForTarget(targetId, isForStudent /* if teacher creating pc for student */, remoteVideoEl) {
  const pc = new RTCPeerConnection(ICE_CONFIG);

  // Handle ICE candidates
  pc.onicecandidate = (evt) => {
    if (evt.candidate) {
      socket.emit('webrtc-ice', { to: targetId, candidate: evt.candidate });
    }
  };

  // If this peer expects remote stream (students expect teacher stream)
  pc.ontrack = (evt) => {
    const stream = evt.streams && evt.streams[0] ? evt.streams[0] : evt.stream;
    if (!stream) return;
    // set remote video src
    remoteVideoEl.srcObject = stream;
    remoteVideoEl.autoplay = true;
    remoteVideoEl.playsInline = true;
  };

  // If teacher side: add local (teacher) tracks to connection
  if (isForStudent && localStream) {
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  }

  return pc;
}

// Student receives offer from teacher
socket.on('webrtc-offer', async ({ fromSocketId, sdp }) => {
  // Only students handle this
  if (isTeacher) return;
  try {
    // create a new hidden video element to attach teacher stream
    let teacherRemote = document.getElementById('teacher-remote-video');
    if (!teacherRemote) {
      teacherRemote = document.createElement('video');
      teacherRemote.id = 'teacher-remote-video';
      teacherRemote.autoplay = true;
      teacherRemote.muted = false; // students should hear teacher
      teacherRemote.playsInline = true;
      // place teacher remote video prominently (replace teacherVideo if present)
      teacherRemote.style.width = '100%';
      teacherRemote.style.maxWidth = '1200px';
      teacherRemote.style.border = '4px solid #0d6efd';
      teacherRemote.style.borderRadius = '12px';
      // Insert as first child of videoSection so teacher occupies main frame
      videoSection.insertBefore(teacherRemote, videoSection.firstChild);
    }

    const pc = new RTCPeerConnection(ICE_CONFIG);

    pc.onicecandidate = (evt) => {
      if (evt.candidate) socket.emit('webrtc-ice', { to: fromSocketId, candidate: evt.candidate });
    };

    pc.ontrack = (evt) => {
      const stream = evt.streams?.[0] ?? evt.stream;
      if (!stream) return;
      teacherRemote.srcObject = stream;
    };

    // If student has local media, add tracks (for two-way audio if allowed)
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // store pc for future ice/candidate handling
    pcMap.set(fromSocketId, pc);

    socket.emit('webrtc-answer', { to: fromSocketId, sdp: pc.localDescription });
    console.log('Student: sent answer to teacher');
  } catch (err) {
    console.error('Error handling webrtc-offer (student):', err);
  }
});

// Teacher receives answer from student
socket.on('webrtc-answer', async ({ fromSocketId, sdp, username: studentUsername }) => {
  if (!isTeacher) return;
  const pc = pcMap.get(fromSocketId);
  if (!pc) {
    console.warn('Teacher: no pc found for answer from', fromSocketId);
    return;
  }
  try {
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    console.log('Teacher: set remote description for', fromSocketId);
  } catch (err) {
    console.error('Teacher: failed to set remote desc', err);
  }
});

// ICE candidate relay
socket.on('webrtc-ice', async ({ fromSocketId, candidate }) => {
  try {
    const pc = pcMap.get(fromSocketId);
    if (pc && candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
      console.warn('No pc found for ice from', fromSocketId);
    }
  } catch (err) {
    console.error('Error adding ICE candidate', err);
  }
});

/* --------------------
   TEACHER: when teacher accepts a student, teacher should create an offer to that student's socket
   Server will need to emit an event to teacher providing the student's socket id when accepted.
   For simplicity, we'll expect server emits 'student-joined' to teacher with { username, socketId }
   (Our server.js earlier emits student-joined with username; we will ask server to also give socketId
    but if not available, teacher can use signaling approach: teacher emits 'init-offer' with username
    and server relays to that socket.)
   -------------------- */

// Server may emit 'student-joined' to teacher; we handle both forms (username and socketId)
socket.on('student-joined', async (data) => {
  // Data might be { username } or { username, socketId }
  if (!isTeacher) return;
  const studentName = data.username;
  const targetSocketId = data.socketId || data.id; // best-effort
  console.log('Teacher: student joined:', studentName, targetSocketId);

  // If server provided socketId -> create peer connection and send offer
  if (targetSocketId) {
    // create new pc for this student
    const pc = new RTCPeerConnection(ICE_CONFIG);

    // teacher adds own tracks to pc
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    pc.onicecandidate = (evt) => {
      if (evt.candidate) socket.emit('webrtc-ice', { to: targetSocketId, candidate: evt.candidate });
    };

    // On track from student (if two-way)
    pc.ontrack = (evt) => {
      const st = evt.streams?.[0] ?? evt.stream;
      if (!st) return;
      // create student video element or update existing
      let vid = document.getElementById(`student-${studentName}`);
      if (!vid) {
        vid = document.createElement('video');
        vid.id = `student-${studentName}`;
        vid.autoplay = true;
        vid.muted = false; // teacher hears student
        vid.width = 240;
        vid.height = 180;
        studentVideos.appendChild(vid);
      }
      vid.srcObject = st;
    };

    // create data channel if needed
    const dc = pc.createDataChannel('teacher-channel');

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // store pc keyed by socketId
    pcMap.set(targetSocketId, pc);

    // send offer via server
    socket.emit('webrtc-offer', { to: targetSocketId, sdp: pc.localDescription });
    console.log('Teacher: offer sent to', targetSocketId);
  } else {
    // If server only provided username, teacher should request server to resolve username -> socketId
    socket.emit('resolve-student', { room, username: studentName });
  }
});

/* --------------------
   Teacher: initiate offers for all currently connected students (if teacher joins later)
   Server can send 'init-teacher-offers' with array of students { username, socketId }
   -------------------- */
socket.on('init-teacher-offers', async (data) => {
  if (!isTeacher) return;
  if (!Array.isArray(data)) return;
  for (const s of data) {
    // reuse logic in student-joined
    socket.emit('student-joined', s);
  }
});

/* --------------------
   TEACHER / STUDENT Controls (mute, video toggle, raise/lower hand, block, leave, share screen, record)
   -------------------- */

// TEACHER global controls -> emit events that server will relay
if (muteAllBtn) muteAllBtn.onclick = () => socket.emit('teacher-mute-all', { room });
if (stopAllBtn) stopAllBtn.onclick = () => socket.emit('teacher-stop-all-video', { room });

// Share screen (teacher)
if (shareScreenBtn) shareScreenBtn.onclick = async () => {
  if (!isTeacher) return;
  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    // attach to UI
    let screenEl = document.getElementById('screen-video');
    if (!screenEl) {
      screenEl = document.createElement('video');
      screenEl.id = 'screen-video';
      screenEl.autoplay = true;
      screenEl.muted = true;
      videoSection.insertBefore(screenEl, videoSection.firstChild);
    }
    screenEl.srcObject = screenStream;
    // Notify students
    socket.emit('teacher-share-screen', { room });
    // When screen stops
    const track = screenStream.getVideoTracks()[0];
    track.onended = () => {
      socket.emit('teacher-stop-screen', { room });
      if (screenEl) screenEl.remove();
      screenStream = null;
    };
  } catch (err) {
    console.error('Share screen failed', err);
    alert('Échec partage écran: ' + err.message);
  }
};

// Upload doc (teacher)
if (uploadDoc) uploadDoc.onchange = async () => {
  const file = uploadDoc.files[0];
  if (!file) return;
  const form = new FormData();
  form.append('document', file);
  try {
    const res = await fetch('/upload-doc', { method: 'POST', body: form });
    const json = await res.json();
    if (json.success) {
      alert('Document envoyé.');
      // notify classroom (teacher can broadcast link)
      socket.emit('chat-message', { room, from: username, message: `Document partagé: ${json.path}` });
    } else alert('Echèk upload');
  } catch (err) {
    console.error('upload-doc error', err);
  }
};

// RECORD session (teacher or student can record local stream and upload)
async function startLocalRecording(stream) {
  if (!stream) return;
  recordedChunks = [];
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = e => { if (e.data.size) recordedChunks.push(e.data); };
  recorder.start(1000);
  isRecording = true;
}
async function stopLocalRecordingAndUpload() {
  if (!recorder) return;
  recorder.stop();
  isRecording = false;
  recorder.onstop = async () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const form = new FormData();
    form.append('file', blob, 'session.webm');
    try {
      const resp = await fetch('/upload-recording', { method: 'POST', body: form });
      const json = await resp.json();
      if (json.success) alert('Enregistrement uploadé');
      else alert('Upload échoué');
    } catch (err) {
      console.error('upload recording error', err);
    }
  };
}

if (startRecBtn) startRecBtn.onclick = async () => {
  if (isTeacher && localStream) {
    await startLocalRecording(localStream);
    socket.emit('chat-message', { room, from: username, message: 'Enregistrement démarré par le professeur.' });
  } else if (!isTeacher && localStream) {
    await startLocalRecording(localStream);
  } else {
    alert('Pas de flux local à enregistrer.');
  }
};
if (stopRecBtn) stopRecBtn.onclick = async () => {
  await stopLocalRecordingAndUpload();
  if (isTeacher) socket.emit('chat-message', { room, from: username, message: 'Enregistrement terminé.' });
};

/* --------------------
   STUDENT UI Controls (created dynamically)
   -------------------- */
function buildStudentControls() {
  // create a control bar for student under videoSection if not exists
  if (document.getElementById('student-control-bar')) return;
  const bar = $q('div', { id: 'student-control-bar' });
  bar.style.display = 'flex';
  bar.style.justifyContent = 'center';
  bar.style.gap = '10px';
  bar.style.marginTop = '10px';

  const btnMute = $q('button', { html: '🎤 Mute' });
  const btnCam = $q('button', { html: '🎥 Cam Off' });
  const btnRaise = $q('button', { html: '✋ Lever la main' });
  const btnLower = $q('button', { html: '⬇️ Baisser la main' });
  const btnChat = $q('button', { html: '💬 Chat' });
  const btnLeave = $q('button', { html: '🚪 Quitter' });
  const btnShare = $q('button', { html: '🖥️ Partager écran' });
  const btnDownloadDoc = $q('button', { html: '⬇️ Docs' });
  const btnRecord = $q('button', { html: '🔴 Enregistrer' });

  // handlers
  btnMute.onclick = () => {
    if (!localStream) return alert('No local media');
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0) return alert('No audio track available');
    const enabled = audioTracks[0].enabled;
    audioTracks.forEach(t => t.enabled = !enabled);
    btnMute.innerHTML = enabled ? '🎤 Unmute' : '🎤 Mute';
    // notify teacher optionally
    socket.emit('private-message', { from: username, to: 'teacher', message: enabled ? 'Student muted mic' : 'Student unmuted mic' });
  };

  btnCam.onclick = () => {
    if (!localStream) return alert('No local media');
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length === 0) return alert('No video track available');
    const enabled = videoTracks[0].enabled;
    videoTracks.forEach(t => t.enabled = !enabled);
    btnCam.innerHTML = enabled ? '🎥 Cam On' : '🎥 Cam Off';
  };

  btnRaise.onclick = () => {
    socket.emit('raise-hand', { user: username, room });
    btnRaise.disabled = true;
    btnRaise.innerHTML = '✋ Levé';
  };

  btnLower.onclick = () => {
    socket.emit('teacher-lower-hand', { username, room });
    btnRaise.disabled = false;
    btnRaise.innerHTML = '✋ Lever la main';
  };

  btnChat.onclick = () => {
    // focus chat input
    msgInput.focus();
  };

  btnLeave.onclick = () => {
    socket.emit('leave-room', room);
    location.reload();
  };

  btnShare.onclick = async () => {
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true });
      // show local screen preview
      const scrVid = document.createElement('video');
      scrVid.autoplay = true;
      scrVid.muted = true;
      scrVid.style.maxWidth = '400px';
      scrVid.srcObject = s;
      videoSection.appendChild(scrVid);
      // notify (server can emit to teacher that this student shared screen)
      socket.emit('student-shared-screen', { room, username });
      const t = s.getVideoTracks()[0];
      t.onended = () => { scrVid.remove(); socket.emit('student-stop-screen', { room, username }); };
    } catch (err) {
      console.error('student share screen failed', err);
      alert('Partage écran échoué: ' + err.message);
    }
  };

  btnDownloadDoc.onclick = () => {
    // attempt to open /uploads listing or server provided doc links via chat messages
    window.open('/uploads', '_blank');
  };

  btnRecord.onclick = async () => {
    if (!isRecording) {
      if (!localStream) return alert('No local stream to record');
      await startLocalRecording(localStream);
      btnRecord.innerHTML = '⏹️ Stop';
    } else {
      await stopLocalRecordingAndUpload();
      btnRecord.innerHTML = '🔴 Enregistrer';
    }
  };

  [btnMute, btnCam, btnRaise, btnLower, btnChat, btnLeave, btnShare, btnDownloadDoc, btnRecord].forEach(b => bar.appendChild(b));
  videoSection.appendChild(bar);
}

/* --------------------
   Chat: sending & receiving
   -------------------- */
sendBtn.onclick = () => {
  const text = msgInput.value.trim();
  if (!text) return;
  socket.emit('chat-message', { room, from: username, message: text });
  appendMessage(`Vous: ${text}`);
  msgInput.value = '';
};

socket.on('chat-message', data => {
  // data: { from, message, date }
  appendMessage(`${data.from}: ${data.message}`);
});

function appendMessage(txt) {
  const li = document.createElement('li');
  li.textContent = txt;
  messagesList.appendChild(li);
  messagesList.scrollTop = messagesList.scrollHeight;
}

/* --------------------
   Global events from server
   -------------------- */
socket.on('teacher-mute-all', () => {
  if (localStream) localStream.getAudioTracks().forEach(t => t.enabled = false);
  appendMessage('Système: Le professeur a coupé les micros.');
});

socket.on('teacher-stop-all-video', () => {
  if (localStream) localStream.getVideoTracks().forEach(t => t.enabled = false);
  appendMessage('Système: Le professeur a coupé les caméras.');
});

socket.on('teacher-block-student', ({ reason }) => {
  alert('Vous avez été retiré de la classe. ' + (reason || ''));
  location.reload();
});

socket.on('screen-shared', ({ id }) => {
  // server says someone shared -> teacher probably; we can display notice
  appendMessage('Système: Un écran est partagé par le professeur.');
});

socket.on('screen-stopped', ({ id }) => {
  appendMessage('Système: Partage écran terminé.');
});

/* --------------------
   Clean up before unload
   -------------------- */
window.addEventListener('beforeunload', () => {
  try {
    socket.emit('leave-room', room);
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }
  } catch (e) {}
});
