/* student-controls.js
   Student-side logic + WebRTC mesh signaling.
   Connects to your backend on Render for signaling.
*/

const BACKEND = "https://examen-backend-ihlx.onrender.com";
const socket = io(BACKEND, { transports: ['websocket', 'polling'] });

const joinBtn = document.getElementById('joinBtn');
let localStream = null;
let room = null;
let myName = null;
let myRole = null;
let myId = null;

// WebRTC state
const pcs = {};
const remoteStreams = {};

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

async function startLocal(){
  try{
    localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
    document.getElementById('localVideo').srcObject = localStream;
  }catch(e){
    console.warn('no media',e);
  }
}

joinBtn.addEventListener('click', async ()=>{
  const role = document.getElementById('roleSelect').value;
  const name = document.getElementById('displayName').value.trim();
  const code = document.getElementById('classCode').value.trim();
  if(!name||!code) return alert('Ranpli non ak kòd klas.');
  room = code; myName = name; myRole = role;
  await startLocal();
  socket.emit('join-request',{room,name,role});
  document.getElementById('status').textContent = 'Demann voye. Ap tann repons pwofese...';
});

socket.on('connect', ()=>{ myId = socket.id; console.log('student connected', myId); });

socket.on('join-response', data=>{
  if(data.accepted){
    document.getElementById('status').textContent='Aksepte! Antre nan klas.';
    socket.emit('joined',{room,name:myName,role:myRole});
    document.getElementById('classroom').classList.remove('hidden');
  } else {
    document.getElementById('status').textContent='Rejete pa pwofese.';
  }
});

// when server sends list of participants (ids), create peer connections to them (newcomer initiates)
socket.on('participants', async ({ ids })=>{
  for(const pid of ids){
    if(pid === myId) continue;
    await createPeerConnection(pid, true);
  }
});

socket.on('webrtc-offer', async ({ from, description })=>{
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

async function createPeerConnection(peerId, isInitiator){
  if(pcs[peerId]) return pcs[peerId];
  const pc = new RTCPeerConnection(RTC_CONFIG);
  pcs[peerId] = pc;
  const remoteStream = new MediaStream();
  remoteStreams[peerId] = remoteStream;

  pc.onicecandidate = (e)=>{
    if(e.candidate){
      socket.emit('ice-candidate',{ to: peerId, candidate: e.candidate });
    }
  };

  pc.ontrack = (e)=>{
    remoteStream.addTrack(e.track);
    attachRemoteStreamToUI(peerId, remoteStream);
  };

  if(localStream){
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  }

  if(isInitiator){
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('webrtc-offer',{ to: peerId, description: pc.localDescription });
  }

  return pc;
}

function attachRemoteStreamToUI(peerId, stream){
  let tile = document.getElementById('videosGrid')?.querySelector(`.participant[data-id="${peerId}"]`);
  if(!tile){
    const tpl = document.getElementById('participantTpl').content.cloneNode(true);
    tile = tpl.querySelector('.participant');
    tile.dataset.id = peerId;
    tile.querySelector('.pname').textContent = peerId;
    document.getElementById('videosGrid').appendChild(tile);
  }
  const vid = tile.querySelector('video');
  if(vid.srcObject !== stream) vid.srcObject = stream;
  updateParticipantsList(peerId);
}

function updateParticipantsList(peerId){
  const participantsList = document.getElementById('participantsList');
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
  socket.emit('chat-message',{room,text,fromName:myName});
  document.getElementById('chatInput').value='';
});

socket.on('chat-message', m=>{
  const el = document.createElement('div'); el.textContent = `${m.fromName || m.from}: ${m.text}`; document.getElementById('chatMessages').appendChild(el);
});

// teacher commands
socket.on('teacher-mute-all', ()=>{ if(localStream) localStream.getAudioTracks().forEach(t=>t.enabled=false); });

socket.on('blocked', ({ reason })=>{
  alert('Ou bloke: ' + (reason || 'Motif pa disponib'));
  // optional: disconnect socket or hide UI
  socket.disconnect();
});
