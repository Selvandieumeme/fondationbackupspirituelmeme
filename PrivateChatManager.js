/* 
PrivateChatManager.js
Jere chat prive ak ChatPrive.html
- One-to-one chat
- Notifications wouj sou panel itilizate chat piblik
- Voye/ resevwa mesaj
- Mark read / typing
- Attachments, voice (simply handled)
- Minimize / close fenèt
*/

// SOCKET.IO CONNECT
const socket = io(); // asume socket.io client script deja enkli nan ChatPrive.html
const CURRENT_USER = window.CURRENT_USER; // id MongoDB itilizate a, mete sou paj la

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
    <span class="msg-meta">${new Date(msg.createdAt).toLocaleTimeString()}</span>
  `;
  messagesContainer.appendChild(div);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showNotificationRedDot(userId) {
  const userEl = document.querySelector(`.user[data-user="${userId}"]`);
  if(userEl) userEl.classList.add('has-new-message');
}

// ---------- SOCKET EVENTS ----------

// Resevwa istwa chat
socket.on('private_history', data => {
  conversationId = data.conversationId;
  currentRoom = data.room;
  messagesContainer.innerHTML = '';
  data.messages.forEach(m => addMessage(m, m.from === CURRENT_USER));
});

// Resevwa mesaj
socket.on('receive_private_message', msg => {
  if(msg.from === targetUser) addMessage(msg, false);
});

// Notifikasyon pou nouvo mesaj
socket.on('private_message_notification', data => {
  if(data.from !== targetUser) showNotificationRedDot(data.from);
});

// Acknowledge mesaj voye
socket.on('private_message_sent', msg => {
  addMessage(msg, true);
});

// Typing indicator
socket.on('typing', ({from,isTyping})=>{
  if(from === targetUser) typingIndicator.textContent = isTyping ? 'Typing...' : '';
});

// ---------- UI EVENTS ----------

// Send mesaj
sendBtn.addEventListener('click', ()=>{
  const text = inputField.value.trim();
  if(!text || !targetUser) return;
  socket.emit('private_message',{to: targetUser, text, conversationId, room: currentRoom});
  inputField.value = '';
});

// Detect typing
inputField.addEventListener('input', ()=>{
  socket.emit('typing',{room: currentRoom,isTyping:true});
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(()=>{socket.emit('typing',{room:currentRoom,isTyping:false})},2000);
});

// Minimize / close
minimizeBtn.addEventListener('click',()=>chatWindow.classList.toggle('minimized'));
closeBtn.addEventListener('click',()=>chatWindow.style.display='none');

// --- Fonksyon pou ouvè chat ak itilizate (lè klike sou panel chat piblik) ---
function openPrivateChat(targetUserId){
  targetUser = targetUserId;
  chatWindow.style.display = 'flex';
  socket.emit('request_private_chat',{targetUser});
}

// Ex: chak user nan panel chat piblik la gen klas .user ak data-user="<id>"
document.querySelectorAll('.user').forEach(el=>{
  el.addEventListener('click', ()=>{
    const uid = el.dataset.user;
    openPrivateChat(uid);
    // retire badge wouj si genyen
    el.classList.remove('has-new-message');
  });
});
