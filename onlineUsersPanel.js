// onlineUsersPanel.js — itilize socket.io ki deja egziste
(function(){
  const EVENTS = {
    REQUEST: 'request-online-users',
    LIST: 'online-users',
    CONNECTED: 'user-connected',
    DISCONNECTED: 'user-disconnected',
  };

  // DOM eleman
  const listEl = document.getElementById('online-users-list');
  if(!listEl){
    console.warn('[onlineUsersPanel] Pa jwenn <ul id="online-users-list">.');
    return;
  }

  // tcheke si window.socket deja egziste
  if(!window.socket || typeof window.socket.on !== 'function'){
    console.error('[onlineUsersPanel] window.socket pa defini! Asire script.js gentan kreye li.');
    return;
  }

  const socket = window.socket; // itilize menm koneksyon an
  const users = new Map(); // kenbe lis itilizatè lokalman

  function render(){
    listEl.innerHTML = '';
    const arr = Array.from(users.values()).sort((a,b)=>{
      if(a.connected === b.connected) return (a.name||'').localeCompare(b.name||'');
      return a.connected ? -1 : 1;
    });

    arr.forEach(u=>{
      const li = document.createElement('li');
      li.className = 'online-user-item ' + (u.connected? 'connected':'disconnected');
      li.innerHTML = `
        <div style="display:flex;align-items:center;">
          <span class="status-dot ${u.connected?'connected':'disconnected'}"></span>
          <span class="name">${u.name}</span>
        </div>
        <div style="font-size:12px;opacity:0.8;">
          ${u.connected?'konekte':'dekonekte'}
        </div>
      `;
      listEl.appendChild(li);
    });
  }

  // koute evènman ki soti nan server.js
  socket.on(EVENTS.LIST, (payload)=>{
    if(!Array.isArray(payload)) return;
    payload.forEach(u => users.set(String(u.id), {id:String(u.id), name:u.name, connected:!!u.connected}));
    render();
  });

  socket.on(EVENTS.CONNECTED, (u)=>{
    users.set(String(u.id), {id:String(u.id), name:u.name, connected:true});
    render();
  });

  socket.on(EVENTS.DISCONNECTED, (u)=>{
    const id = String(u.id);
    if(users.has(id)){
      const entry = users.get(id);
      entry.connected = false;
      if(u.name) entry.name = u.name;
      users.set(id, entry);
    } else {
      users.set(id, {id, name:u.name, connected:false});
    }
    render();
  });

  // mande server a lis itilizatè yo
  function requestList(){
    socket.emit(EVENTS.REQUEST);
  }

  // dèske koneksyon an deja louvri
  if(socket.connected) requestList();
  else socket.once('connect', requestList);

})();
