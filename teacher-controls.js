/* teacher-controls.js
   Teacher-side controls + WebRTC mesh signaling.
   Uses your backend at https://examen-backend-ihlx.onrender.com for Socket.IO signaling.
   NOTE: This implementation uses a mesh (peer-per-peer). For very large classes (dozens/100),
   consider switching to an SFU (mediasoup/Janus/Jitsi) server for scalability.
*/

const BACKEND = "https://examen-backend-ihlx.onrender.com";
const socket = io(BACKEND, { transports: ['websocket', 'polling'] });

// UI refs
const joinBtn = document.getElementById('joinBtn');
const roleSelect = document.getElementById('roleSelect');
const displayName = document.getElementById('displayName');
const classCodeInput = document.getElementById('classCode');
const statusDiv = document.getElementById('status');
const classroom = document.getElementById('classroom');
const controls = document.getElementById('controls');
const videosGrid = document.getElementById('videosGrid');
const participantsList = document.getElementById('participantsList');
const presenterVideo = document.getElementById('presenterVideo');

let localStream = null;
let isTeacher = false;
let room = null;
let myId = null;

// WebRTC state
const pcs = {}; // peerId -> RTCPeerConnection
const remoteStreams = {}; // peerId -> MediaStream

// STUN/TURN servers (add TURN in Render env if you have it)
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // If you have TURN on Render, add: { urls: process.env.TURN_URL, username: process.env.TURN_USER, credential: process.env.TURN_PASS }
  ]
};

async function startLocalMedia(){
  try{
    localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
    const localVideo = document.getElementById('localVideo');
    localVideo.srcObject = localStream;
    // attach local to presenter by default for teacher
    presenterVideo.srcObject = localStream;
  }catch(err){
    console.error('micro/cam denied',err);
    statusDiv.textContent = 'Pa jwenn aksè kamera/mikwo. Tcheke pèmisyon.';
  }
}

function buildTeacherControls(){
  controls.innerHTML = '';
  const buttons = [
    ['toggleMic','Mikwo'],['toggleCam','Kamera'],['shareScreen','Pataje ekran'],['record','Rekòde'],
    ['muteAll','Mute tout elèv'],['block','Bloke elèv'],['presenter','Fè prezantatè'],['endClass','Finir la classe']
  ];
  buttons.forEach(([id,label])=>{
    const btn = document.createElement('button'); btn.id=id; btn.textContent=label; controls.appendChild(btn);
  });

  document.getElementById('toggleMic').onclick = ()=>{
    if(!localStream) return; localStream.getAudioTracks().forEach(t=>t.enabled = !t.enabled);
  };
  document.getElementById('toggleCam').onclick = ()=>{
    if(!localStream) return; localStream.getVideoTracks().forEach(t=>t.enabled = !t.enabled);
  };
  document.getElementById('shareScreen').onclick = async ()=>{
    try{
      const screen = await navigator.mediaDevices.getDisplayMedia({video:true,audio:true});
      // replace tracks in each RTCPeerConnection with screen tracks
      const screenTrack = screen.getVideoTracks()[0];
      for(const pid of Object.keys(pcs)){
        const pc = pcs[pid];
        const senders = pc.getSenders();
        const sender = senders.find(s => s.track && s.track.kind === 'video');
        if(sender) sender.replaceTrack(screenTrack);
      }
      // also show locally
      presenterVideo.srcObject = screen;
      socket.emit('start-screen-share',{room});
    }catch(e){console.error(e)}
  };
  document.getElementById('muteAll').onclick = ()=>{ socket.emit('teacher-mute-all',{room}); };
  document.getElementById('block').onclick = ()=>{ 
    const sid = prompt('Entrez socket id ou non elèv la pou bloke:'); 
    if(sid) socket.emit('block-student',{room,studentId:sid});
  };
  document.getElementById('record').onclick = ()=>{
    if(!localStream) return alert('Pa gen stream lokal.');
    if(!window._recorder){
      const mediaRecorder = new MediaRecorder(localStream);
      let chunks = [];
      mediaRecorder.ondataavailable = e=>chunks.push(e.data);
      mediaRecorder.onstop = async ()=>{
        const blob = new Blob(chunks, {type: 'video/webm'});
        const fd = new FormData();
        fd.append('file', blob, `${room || 'session'}.webm`);
        try{
          await fetch(`${BACKEND}/upload`, { method:'POST', body: fd });
          alert('Rekòd upload fini.');
        }catch(e){console.error(e); alert('Erè upload');}
        chunks = [];
        window._recorder = null;
      };
      mediaRecorder.start();
      window._recorder = mediaRecorder;
      alert('Rekòd kòmanse.');
    } else {
      window._recorder.stop();
      alert('Rekòd sispann. Ap upload...');
    }
  };
  document.getElementById('presenter').onclick = ()=>{
    // toggle presenter to local teacher stream
    presenterVideo.srcObject = localStream;
    socket.emit('make-presenter',{room,by:myId});
  };
  document.getElementById('endClass').onclick = ()=>{ socket.emit('end-class',{room}); classroom.classList.add('hidden'); };
}

joinBtn.addEventListener('click', async ()=>{
  const role = roleSelect.value; const name = displayName.value.trim(); const code = classCodeInput.value.trim();
  if(!name||!code) { statusDiv.textContent='Ranpli non ak kòd klas...'; return; }
  room = code; isTeacher = (role==='teacher');
  await startLocalMedia();
  socket.emit('join-room',{room,role,name});
  classroom.classList.remove('hidden');
  if(isTeacher) buildTeacherControls();
});

socket.on('connect', ()=>{ myId = socket.id; console.log('connected',myId); });

// Once teacher or student is accepted and emits 'joined', server will send 'participants' list
socket.on('participants', async ({ ids })=>{
  // ids = array of socket ids already in room
  // Newcomer should create offer to each existing participant
  for(const pid of ids){
    if(pid === myId) continue;
    await createPeerConnection(pid, true);
  }
});

// Handle incoming signaling
socket.on('webrtc-offer', async ({ from, description })=>{
  // create pc if not exists and set remote desc then answer
  await createPeerConnection(from, false);
  const pc = pcs[from];
  await pc.setRemoteDescription(new RTCSessionDescription(description));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit('webrtc-answer',{ to: from, description: pc.localDescription });
});

socket.on('webrtc-answer', async ({ from, description })=>{
  const pc = pcs[from];
  if(!pc) return console.warn('no pc for answer from', from);
  await pc.setRemoteDescription(new RTCSessionDescription(description));
});

socket.on('ice-candidate', async ({ from, candidate })=>{
  const pc = pcs[from];
  if(!pc) return;
  try{
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }catch(e){ console.warn('bad ice', e); }
});

// helper to create pc
async function createPeerConnection(peerId, isInitiator){
  if(pcs[peerId]) return pcs[peerId];
  const pc = new RTCPeerConnection(RTC_CONFIG);
  pcs[peerId] = pc;
  // create remote stream for this peer
  const remoteStream = new MediaStream();
  remoteStreams[peerId] = remoteStream;

  pc.onicecandidate = (e)=>{
    if(e.candidate){
      socket.emit('ice-candidate',{ to: peerId, candidate: e.candidate });
    }
  };

  pc.ontrack = (e)=>{
    // add track(s) to remoteStream and attach to UI
    remoteStream.addTrack(e.track);
    attachRemoteStreamToUI(peerId, remoteStream);
  };

  // add local tracks
  if(localStream){
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  }

  // if initiator, create offer
  if(isInitiator){
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('webrtc-offer',{ to: peerId, description: pc.localDescription });
  }

  return pc;
}

function attachRemoteStreamToUI(peerId, stream){
  // find existing participant tile by data-id, else create one
  let tile = videosGrid.querySelector(`.participant[data-id="${peerId}"]`);
  if(!tile){
    const tpl = document.getElementById('participantTpl').content.cloneNode(true);
    tile = tpl.querySelector('.participant');
    tile.dataset.id = peerId;
    tile.querySelector('.pname').textContent = peerId;
    videosGrid.appendChild(tile);
  }
  const vid = tile.querySelector('video');
  if(vid.srcObject !== stream) vid.srcObject = stream;
  updateParticipantsList(peerId);
}

function updateParticipantsList(peerId){
  // ensure participant list contains the peer
  if(!participantsList.querySelector(`[data-id="${peerId}"]`)){
    const div = document.createElement('div'); div.className='participant-item'; div.dataset.id = peerId;
    div.textContent = peerId;
    participantsList.appendChild(div);
  }
  document.getElementById('presentCount').textContent = participantsList.querySelectorAll('.participant-item').length;
}

// chat
const chatForm = document.getElementById('chatForm');
chatForm?.addEventListener('submit', e=>{
  e.preventDefault();
  const text = document.getElementById('chatInput').value.trim(); if(!text) return;
  socket.emit('chat-message',{room,text,fromName:displayName.value.trim() || myId});
  document.getElementById('chatInput').value='';
});

socket.on('chat-message', m=>{
  const el = document.createElement('div'); el.textContent = `${m.fromName || m.from}: ${m.text}`; document.getElementById('chatMessages').appendChild(el);
});

// join request handling
socket.on('join-request', data=>{
  if(!isTeacher) return;
  const {studentId, studentName} = data;
  const el = document.createElement('div');
  el.innerHTML = `<strong>${studentName}</strong> mande antre — <button class='accept'>Aksepte</button> <button class='reject'>Rejte</button>`;
  statusDiv.appendChild(el);
  el.querySelector('.accept').onclick = ()=> socket.emit('join-response',{room,studentId,accepted:true});
  el.querySelector('.reject').onclick = ()=> socket.emit('join-response',{room,studentId,accepted:false});
});

// teacher mute all command (apply locally for teacher preview)
socket.on('teacher-mute-all', ()=>{ if(localStream) localStream.getAudioTracks().forEach(t=>t.enabled=false); });

// when someone is made presenter, attach their stream to presenterVideo if available
socket.on('presenter-made', ({ by })=>{
  // if by is me, ensure local stream is presenter
  if(by === myId){
    presenterVideo.srcObject = localStream;
  } else if(remoteStreams[by]){
    presenterVideo.srcObject = remoteStreams[by];
  } else {
    // wait until stream arrives
    console.log('presenter made, waiting for stream', by);
  }
});
