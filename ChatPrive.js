/* =====================================================
   ChatPrive.js - Ajou
   Jesyon chat prive pou chak itilizatè
   ===================================================== */

// 1️⃣ — Reutilize menm socket deja egziste a
const socket = window.__fbsp_shared_socket || io();
window.__fbsp_shared_socket = socket;

// 2️⃣ — Seleksyon eleman HTML prensipal yo
const userList = document.getElementById('userList');

// 3️⃣ — Kenbe referans fenèt prive ki louvri yo
const privateWindows = {};

// 4️⃣ — Helper pou get deterministic room name
function getPrivateRoom(a,b){return a<b?`room-${a}-${b}`:`room-${b}-${a}`;}

// 5️⃣ — Fonksyon pou kreye fenèt prive
function openPrivateWindow(targetUser){
  const currentUser = document.getElementById('user')?.value.trim() || 'Anonyme';
  const windowId = `private-${currentUser}-${targetUser}`;
  if(privateWindows[windowId]) return;

  // Kreye container
  const container = document.createElement('div');
  container.classList.add('private-chat-window');
  container.id = windowId;

  // Header
  const header = document.createElement('div');
  header.classList.add('pc-header');
  header.textContent = `Chat prive: ${currentUser} ➜ ${targetUser}`;

  // Bouton call
  const controls = document.createElement('div');
  controls.classList.add('controls');
  const audioCallBtn = document.createElement('button'); audioCallBtn.textContent='📞 Audio';
  const videoCallBtn = document.createElement('button'); videoCallBtn.textContent='📹 Video';
  controls.appendChild(audioCallBtn); controls.appendChild(videoCallBtn);
  header.appendChild(controls);
  container.appendChild(header);

  // Espas mesaj
  const messagesDiv = document.createElement('div');
  messagesDiv.classList.add('pc-messages');
  container.appendChild(messagesDiv);

  // Input + bouton
  const inputContainer = document.createElement('div');
  inputContainer.classList.add('pc-input');

  const input = document.createElement('textarea');
  input.placeholder = 'Ekri mesaj ou...';
  inputContainer.appendChild(input);

  const attachBtn = document.createElement('button'); attachBtn.textContent='📎';
  const sendBtn = document.createElement('button'); sendBtn.textContent='Voye';
  const deleteBtn = document.createElement('button'); deleteBtn.textContent='Efase lokal';
  inputContainer.appendChild(attachBtn);
  inputContainer.appendChild(sendBtn);
  inputContainer.appendChild(deleteBtn);
  container.appendChild(inputContainer);

  document.body.appendChild(container);
  privateWindows[windowId]={container,messagesDiv,input,targetUser};

  // Event voye mesaj
  sendBtn.addEventListener('click',()=>{sendPrivateMessage(currentUser,targetUser,input.value,messagesDiv,input);});
  input.addEventListener('keypress',(e)=>{if(e.key==='Enter'){sendPrivateMessage(currentUser,targetUser,input.value,messagesDiv,input); e.preventDefault();}});

  // Bouton efase lokal
  deleteBtn.addEventListener('click',()=>{messagesDiv.innerHTML='';});

  // Bouton attach
  attachBtn.addEventListener('click',()=>{
    const fileInput = document.createElement('input');
    fileInput.type='file'; fileInput.multiple=true;
    fileInput.click();
    fileInput.onchange = ()=> {
      for(const f of fileInput.files){
        sendPrivateMessage(currentUser,targetUser,f.name,messagesDiv,input,[f]);
      }
    }
  });

  // Call buttons (emit signal)
  audioCallBtn.addEventListener('click',()=>{socket.emit('private_message_with_features',{to:targetUser, call:{type:'audio', action:'init'}});});
  videoCallBtn.addEventListener('click',()=>{socket.emit('private_message_with_features',{to:targetUser, call:{type:'video', action:'init'}});});
}

// 6️⃣ — Fonksyon voye mesaj prive (ak features)
function sendPrivateMessage(sender,receiver,message,messagesDiv,input,attachments=[]){
  if(!message.trim() && attachments.length===0) return;

  const data={to:receiver,text:message,attachments};
  socket.emit('private_message_with_features',data);

  addPrivateMessage({sender,receiver,message,attachments,date:new Date(),seen:false},messagesDiv,true);
  input.value='';
}

// 7️⃣ — Ajoute mesaj nan fenèt prive
function addPrivateMessage(data,messagesDiv,isMe){
  const msgDiv=document.createElement('div');
  msgDiv.classList.add('msg'); msgDiv.classList.add(isMe?'outgoing':'incoming');

  // Timestamp + text
  const ts = `[${new Date(data.date).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}] `;
  msgDiv.innerHTML=`${ts}${isMe?data.sender:data.sender}: ${data.message||''}`;

  // Attachments
  if(Array.isArray(data.attachments)){
    data.attachments.forEach(att=>{
      const a=document.createElement('div'); a.classList.add('attachment'); a.textContent=att.name||att;
      msgDiv.appendChild(a);
    });
  }

  // Seen ✓✓ pou outgoing
  if(isMe){
    const seenSpan=document.createElement('span'); seenSpan.classList.add('seen'); seenSpan.textContent='✓✓';
    msgDiv.appendChild(seenSpan);
  }

  messagesDiv.appendChild(msgDiv);
  messagesDiv.scrollTop=messagesDiv.scrollHeight;
}

// 8️⃣ — Resevwa mesaj atravè socket
socket.on('receive_private_message',(data)=>{
  const currentUser=document.getElementById('user')?.value.trim() || 'Anonyme';
  if(data.to!==currentUser && data.from!==currentUser) return;

  const windowId = `private-${data.from}-${data.to}`;
  const reverseWindowId = `private-${data.to}-${data.from}`;
  let win = privateWindows[windowId] || privateWindows[reverseWindowId];

  if(!win){
    const otherUser = data.from===currentUser?data.to:data.from;
    openPrivateWindow(otherUser);
    win = privateWindows[`private-${currentUser}-${otherUser}`];
  }

  addPrivateMessage({sender:data.from,receiver:data.to,message:data.text,attachments:data.attachments,date:data.createdAt,seen:false},win.messagesDiv,data.from===currentUser);
});

// 9️⃣ — Event pou mark seen
socket.on('message_seen',(data)=>{
  const currentUser=document.getElementById('user')?.value.trim() || 'Anonyme';
  const windowId=`private-${data.by}-${currentUser}`;
  const reverseWindowId=`private-${currentUser}-${data.by}`;
  const win = privateWindows[windowId] || privateWindows[reverseWindowId];
  if(win){
    // Ajoute ✓✓ si pa deja la
    win.messagesDiv.querySelectorAll('.msg.outgoing').forEach(msg=>{
      if(!msg.querySelector('.seen')) {
        const seenSpan=document.createElement('span'); seenSpan.classList.add('seen'); seenSpan.textContent='✓✓';
        msg.appendChild(seenSpan);
      }
    });
  }
});

//  🔟 — Lis itilizatè klike pou ouvri chat prive
userList.addEventListener('click',(e)=>{
  const li=e.target.closest('li');
  if(!li) return;
  const targetUser=li.textContent.replace(/\s/g,'');
  const currentUser=document.getElementById('user')?.value.trim() || 'Anonyme';
  if(targetUser && targetUser!==currentUser) openPrivateWindow(targetUser);
});
