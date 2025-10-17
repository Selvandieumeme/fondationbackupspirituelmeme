// ✅ onlineUsersPanel.js — vèsyon final (sèvi sèlman ak "setUser")
(function(){
  const EVENTS = {
    REQUEST: 'requestUserList',
    LIST: 'updateUserList',
    CONNECTED: 'userConnected',
    DISCONNECTED: 'userDisconnected',
    SETUSER: 'setUser'
  };

  // 🔹 jwenn eleman pou lis itilizatè yo
  const listEl = document.getElementById('userList');
  if(!listEl){
    console.warn('[onlineUsersPanel] Pa jwenn #userList nan paj la.');
    return;
  }

  // 🔹 verifye si socket.io konekte deja
  if(!window.socket || typeof window.socket.on !== 'function'){
    console.error('[onlineUsersPanel] window.socket pa disponib. Asire script.js deja chaje avan.');
    return;
  }

  const socket = window.socket;
  const users = new Map();

  // 🔹 fonksyon pou rafrechi afichaj itilizatè yo
  function render(){
    listEl.innerHTML = '';
    const arr = Array.from(users.values()).sort((a,b)=>{
      if(a.connected === b.connected) return a.name.localeCompare(b.name);
      return a.connected ? -1 : 1;
    });
    arr.forEach(u=>{
      const li = document.createElement('li');
      li.className = 'online-user-item ' + (u.connected ? 'connected' : 'disconnected');
      li.innerHTML = `
        <div style="display:flex;align-items:center;">
          <span class="status-dot ${u.connected ? 'connected':'disconnected'}"></span>
          <span class="name">${u.name}</span>
        </div>
        <div style="font-size:12px;opacity:0.8;">
          ${u.connected ? '🟢 konekte' : '🔴 dekonekte'}
        </div>
      `;
      listEl.appendChild(li);
    });
  }

  // 🔹 Evènman Socket.IO yo
  socket.on(EVENTS.LIST, (arr)=>{
    if(!Array.isArray(arr)) return;
    arr.forEach(username=>{
      users.set(username, { name: username, connected: true });
    });
    render();
  });

  socket.on(EVENTS.CONNECTED, (username)=>{
    users.set(username, { name: username, connected: true });
    render();
  });

  socket.on(EVENTS.DISCONNECTED, (username)=>{
    if(users.has(username)){
      const u = users.get(username);
      u.connected = false;
      users.set(username, u);
    } else {
      users.set(username, { name: username, connected: false });
    }
    render();
  });

  // 🔹 Mande server a lis itilizatè yo
  function requestList(){
    socket.emit(EVENTS.REQUEST);
  }

  if(socket.connected) requestList();
  else socket.once('connect', requestList);

})();
