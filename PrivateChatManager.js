// =======================
// ✅ PrivateChatManager.js FINAL PWOFESYONÈL
// =======================

// SOCKET.IO CONNECT
const socket = window.socket || io('https://examen-backend-ihlx.onrender.com');
window.socket = socket;

const CURRENT_USER = window.CURRENT_USER || new URLSearchParams(window.location.search).get('from') || 'Anonyme';

// --- DOM Elements ---
const chatWindow = document.querySelector('.private-chat-window');
const header = chatWindow.querySelector('.pc-header');
const messagesContainer = chatWindow.querySelector('.pc-messages');
const inputField = chatWindow.querySelector('.pc-input textarea');
const sendBtn = chatWindow.querySelector('.pc-input .send-btn');
const minimizeBtn = header.querySelector('.minimize-btn');
const closeBtn = header.querySelector('.close-btn');
const typingIndicator = chatWindow.querySelector('.typing-indicator');

// --- State ---
let currentRoom = null;
let targetUser = null;
let conversationId = null;
let typingTimeout = null;

// ---------- UTILS ----------
function addMessage(msg, outgoing=false) {
  const div = document.createElement('div');
  div.classList.add('msg');
  div.classList.add(outgoing ? 'outgoing' : 'incoming');
  div.innerHTML = `
    <span>${msg.text || ''}</span>
    ${msg.attachments && msg.attachments.length ? msg.attachments.map(a=>`<div class="attachment"><img src="${a.url}" /></div>`).join('') : ''}
    <span class="msg-meta">${new Date(msg.createdAt || Date.now()).toLocaleTimeString()}</span>
  `;
  messagesContainer.appendChild(div);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Notifikasyon wouj sou itilizatè nan panel chat piblik
function showNotificationRedDot(userId) {
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
  if(msg.from === targetUser) {
    addMessage(msg, false);
  } else if(msg.to === CURRENT_USER) {
    showNotificationRedDot(msg.from);
  }
});

// Typing indicator
socket.on('typing', ({from,isTyping})=>{
  if(from === targetUser) typingIndicator.textContent = isTyping ? 'Typing...' : '';
});

// ---------- UI EVENTS ----------

// Voye mesaj
sendBtn.addEventListener('click', ()=> sendPrivateMessage());
inputField.addEventListener('keypress', (e)=>{
  if(e.key==='Enter' && !e.shiftKey) {
    e.preventDefault();
    sendPrivateMessage();
  }
});

function sendPrivateMessage(){
  const text = inputField.value.trim();
  if(!text || !targetUser) return;

  socket.emit('private_message',{
    to: targetUser,
    text,
    conversationId,
    room: currentRoom
  });

  addMessage({text, from: CURRENT_USER, createdAt: new Date()}, true);
  inputField.value = '';
  inputField.focus();
}

// Detect typing
inputField.addEventListener('input', ()=>{
  if(!currentRoom) return;
  socket.emit('typing',{room: currentRoom,isTyping:true});
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(()=>{socket.emit('typing',{room:currentRoom,isTyping:false})},2000);
});

// Minimize / close
minimizeBtn.addEventListener('click',()=>chatWindow.classList.toggle('minimized'));
closeBtn.addEventListener('click',()=>chatWindow.style.display='none');

// ---------- OPEN CHAT ----------
function openPrivateChat(userId){
  targetUser = userId;
  chatWindow.style.display = 'flex';
  socket.emit('request_private_chat',{targetUser});
}

// Panel chat piblik: klike sou itilizatè pou ouvè chat prive
document.querySelectorAll('.user').forEach(el=>{
  el.addEventListener('click', ()=>{
    const uid = el.dataset.user;
    openPrivateChat(uid);
    el.classList.remove('has-new-message'); // retire badge wouj
  });
});

// ---------- INITIALIZATION ----------
chatWindow.style.display = 'none';
inputField.focus();
