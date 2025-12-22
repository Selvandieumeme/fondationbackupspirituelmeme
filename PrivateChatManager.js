// =======================
// ✅ PrivateChatManager.js FINAL PWOFESYONÈL
// =======================

// --- SOCKET.IO CONNECT
const socket = window.socket || io('https://fondationbackupspirituel.com');
window.socket = socket;

const CURRENT_USER = window.CURRENT_USER || new URLSearchParams(window.location.search).get('from') || 'Anonyme';
let targetUser = new URLSearchParams(window.location.search).get('to') || '';

// --- DOM Elements
const chatWindow = document.querySelector('.private-chat-window');
const header = chatWindow.querySelector('.pc-header');
const messagesContainer = chatWindow.querySelector('.pc-messages');
const inputField = chatWindow.querySelector('.pc-input textarea');
const sendBtn = chatWindow.querySelector('.pc-input .send-btn');
const minimizeBtn = header.querySelector('.minimize-btn');
const closeBtn = header.querySelector('.close-btn');
const typingIndicator = chatWindow.querySelector('.typing-indicator');

// --- Extra buttons
const attachBtn = header.querySelector('.attach-btn'); // 📷
const voiceBtn = header.querySelector('.voice-btn');   // 🎤
const blockBtn = header.querySelector('.block-btn');   // ⛔
const seenBtn = header.querySelector('.seen-btn');     // ✅

// --- State
let currentRoom = null;
let conversationId = null;
let typingTimeout = null;
let localStream = null;
let peerConnection = null;
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// ---------- UTILS ----------
function addMessage(msg, outgoing=false){
    const div = document.createElement('div');
    div.classList.add('msg', outgoing ? 'outgoing' : 'incoming');
    div.innerHTML = `
        <span>${msg.text || ''}</span>
        ${msg.attachments && msg.attachments.length ? msg.attachments.map(a=>`<div class="attachment"><img src="${a.url}" /></div>`).join('') : ''}
        <span class="msg-meta">${new Date(msg.createdAt || Date.now()).toLocaleTimeString()}</span>
    `;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showNotificationRedDot(userId){
    const userEl = document.querySelector(`.user[data-user="${userId}"]`);
    if(userEl) userEl.classList.add('has-new-message');
}

// ---------- SOCKET EVENTS ----------

// Resevwa istwa chat prive
socket.on('private_history', data => {
    conversationId = data.conversationId;
    currentRoom = data.room;
    messagesContainer.innerHTML = '';
    data.messages.forEach(m => addMessage(m, m.from === CURRENT_USER));
});

// Resevwa nouvo mesaj prive
socket.on('receive_private_message', msg => {
    if(msg.from === targetUser){
        addMessage(msg, false);
    } else if(msg.to === CURRENT_USER){
        showNotificationRedDot(msg.from);
    }
});

// Typing indicator
socket.on('typing', ({from,isTyping}) => {
    if(from === targetUser) typingIndicator.textContent = isTyping ? 'Typing...' : '';
});

// Seen / mark read
socket.on('message_seen', ({messageId, by}) => {
    // ou ka mete logik pou update seen status nan DOM
});

// ---------- UI EVENTS ----------

// Send mesaj
function sendPrivateMessage(){
    const text = inputField.value.trim();
    if(!text || !targetUser) return;
    const payload = { to: targetUser, text, conversationId, room: currentRoom };
    socket.emit('private_message', payload);
    addMessage({text, from: CURRENT_USER, createdAt: new Date()}, true);
    inputField.value = '';
    inputField.focus();
}

sendBtn.addEventListener('click', sendPrivateMessage);
inputField.addEventListener('keypress', (e) => {
    if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendPrivateMessage(); }
});

// Typing
inputField.addEventListener('input', () => {
    if(!currentRoom) return;
    socket.emit('typing', { room: currentRoom, isTyping:true });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(()=>{ socket.emit('typing',{ room:currentRoom, isTyping:false }); },2000);
});

// Minimize / close
minimizeBtn.addEventListener('click', ()=> chatWindow.classList.toggle('minimized'));
closeBtn.addEventListener('click', ()=> chatWindow.style.display='none');

// Attach image
attachBtn.addEventListener('click', ()=>{
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = e=>{
        const file = e.target.files[0];
        if(file){
            const reader = new FileReader();
            reader.onload = evt=>{
                const imgData = evt.target.result;
                const msg = { text:'', attachments:[{url: imgData}], from: CURRENT_USER, createdAt: new Date() };
                socket.emit('private_message', { to: targetUser, text:'', attachments:[{url: imgData}], conversationId, room: currentRoom });
                addMessage(msg, true);
            };
            reader.readAsDataURL(file);
        }
    };
    fileInput.click();
});

// Voice recording
voiceBtn.addEventListener('click', async ()=>{
    if(!navigator.mediaDevices) return alert('Voice recording not supported');
    const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    // Ou ka ajoute logic pou record & send audio kòm blob
    alert('Voice recording ready (implementation needed)');
});

// Block user
blockBtn.addEventListener('click', ()=>{
    if(!targetUser) return;
    socket.emit('block_user', { user: targetUser });
    alert(`User ${targetUser} blocked`);
});

// ---------- WebRTC Voice / Video Call ----------

const callBtn = header.querySelector('.call-btn');       // 📞
const videoCallBtn = header.querySelector('.video-call-btn'); // 📹

async function startCall(video=false){
    localStream = await navigator.mediaDevices.getUserMedia({ audio:true, video });
    const callWindow = document.createElement('div');
    callWindow.className = 'call-window';
    const localVideo = document.createElement('video'); localVideo.autoplay = true; localVideo.muted = true; localVideo.srcObject = localStream;
    const remoteVideo = document.createElement('video'); remoteVideo.autoplay = true;
    callWindow.appendChild(localVideo); callWindow.appendChild(remoteVideo);
    document.body.appendChild(callWindow);

    peerConnection = new RTCPeerConnection(config);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = e => remoteVideo.srcObject = e.streams[0];
    peerConnection.onicecandidate = e => { if(e.candidate) socket.emit('webrtc_candidate',{ candidate:e.candidate, to: targetUser }); };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('webrtc_offer',{ offer, to: targetUser });
}

callBtn.addEventListener('click', ()=> startCall(false));
videoCallBtn.addEventListener('click', ()=> startCall(true));

socket.on('webrtc_offer', async ({ offer, from })=>{
    if(from !== targetUser) return;
    peerConnection = new RTCPeerConnection(config);
    localStream = await navigator.mediaDevices.getUserMedia({ audio:true, video:true });
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    const remoteVideo = document.createElement('video'); remoteVideo.autoplay = true;
    const localVideo = document.createElement('video'); localVideo.autoplay = true; localVideo.muted = true; localVideo.srcObject = localStream;
    const callWindow = document.createElement('div'); callWindow.className='call-window';
    callWindow.appendChild(localVideo); callWindow.appendChild(remoteVideo); document.body.appendChild(callWindow);

    peerConnection.ontrack = e => remoteVideo.srcObject = e.streams[0];
    peerConnection.onicecandidate = e => { if(e.candidate) socket.emit('webrtc_candidate',{ candidate:e.candidate, to: from }); };

    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('webrtc_answer',{ answer, to: from });
});

socket.on('webrtc_answer', async ({ answer })=>{ await peerConnection.setRemoteDescription(answer); });
socket.on('webrtc_candidate', async ({ candidate })=>{ try{ await peerConnection.addIceCandidate(candidate); }catch(e){ console.error(e); } });

// ---------- OPEN CHAT ----------
function openPrivateChat(userId){
    targetUser = userId;
    chatWindow.style.display='flex';
    socket.emit('request_private_chat',{ targetUser });
}

// Panel chat piblik: klike sou itilizatè pou ouvè chat prive
document.querySelectorAll('.user').forEach(el=>{
    el.addEventListener('click', ()=>{
        const uid = el.dataset.user;
        openPrivateChat(uid);
        el.classList.remove('has-new-message');
    });
});

// ---------- INITIALIZATION ----------
chatWindow.style.display='none';
inputField.focus();
