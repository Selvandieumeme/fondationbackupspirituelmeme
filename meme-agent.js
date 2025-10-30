/* meme-agent.js - MEME Inspector AI (client) */
/* Compatible avec Ecole-en-ligne.html + backend Render */

(function(){
  const SOCKET_URL = "https://examen-backend-ihlx.onrender.com";
  const AGENT_NAME = "MEME";
  const AGENT_ROLE = "Inspecteur";
  const AUTO_INTRO = true;

  // === UTILITAIRES ===
  function safeText(s){ return (s||'').toString(); }
  function detectLang(text){
    if(!text) return 'fr';
    const t = text.toLowerCase();
    if(t.includes('mwen')||t.includes('kijan')) return 'ht';
    if(t.includes('hello')) return 'en';
    if(t.includes('hola')) return 'es';
    return 'fr';
  }

  // === SYNTHÈSE VOCALE ===
  function speak(text, langHint='fr'){
    if(!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = (langHint==='ht') ? 'fr-FR' : (langHint==='en'?'en-US':(langHint==='es'?'es-ES':'fr-FR'));
    utter.rate = 1; utter.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  // === INSÉRER INTERFACE MEME ===
  function insertUI(){
    if(document.getElementById('meme-widget')) return;
    const widget = document.createElement('div');
    widget.id='meme-widget';
    widget.className='meme-widget';
    widget.innerHTML = `
      <div class="meme-avatar">ME<div class="meme-floating">AI</div></div>
    `;
    const bubble = document.createElement('div');
    bubble.id='meme-bubble';
    bubble.className='meme-bubble';
    bubble.innerHTML = `
      <div class="title">${AGENT_NAME} — ${AGENT_ROLE}</div>
      <div class="msg small">${AGENT_NAME} prêt. Cliquez pour interroger.</div>
      <div class="controls">
        <button class="ok">Poser Q</button>
        <button class="ko">Fermer</button>
      </div>
    `;
    document.body.appendChild(bubble);
    document.body.appendChild(widget);

    widget.addEventListener('click', ()=> bubble.classList.toggle('show'));
    bubble.querySelector('.ko').addEventListener('click', ()=> bubble.classList.remove('show'));
    bubble.querySelector('.ok').addEventListener('click', ()=> openQuickAsk());
  }

  function openQuickAsk(){
    let box = document.getElementById('meme-ask-box');
    if(box){ box.style.display='block'; return; }
    box = document.createElement('div');
    box.id='meme-ask-box';
    box.style.position='fixed';
    box.style.right='130px';
    box.style.bottom='120px';
    box.style.background='#f8f8f8';
    box.style.padding='10px';
    box.style.borderRadius='10px';
    box.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';
    const input = document.createElement('input');
    input.type='text';
    input.placeholder='Posez une question à MEME...';
    input.style.padding='8px';
    input.style.width='250px';
    const btn = document.createElement('button');
    btn.textContent='Envoyer';
    btn.style.marginLeft='8px';
    btn.addEventListener('click',()=>{ if(input.value.trim()) triggerQuery(input.value.trim()); });
    box.appendChild(input); box.appendChild(btn);
    document.body.appendChild(box);
  }

  // === SOCKET.IO ===
  function setupSocket(){
    if(!window.io) return console.warn('Socket.IO manquant pour MEME');
    const socket = io(SOCKET_URL);
    window.MEME_SOCKET = socket;

    socket.on('connect', ()=> console.log('[MEME] connecté:', socket.id));
    socket.on('meme-query-result', d => showBubble(d.answer || "Je n’ai pas de réponse."));
    socket.on('meme-class-start', d => showBubble(`Bienvenue dans la salle ${d.room}.`));
    socket.on('meme-class-end', d => showBubble(`Session ${d.room} terminée.`));
    return socket;
  }

  function hookJoinButton(socket){
    const btn = document.getElementById('joinBtn');
    const nameInput = document.getElementById('displayName');
    const classInput = document.getElementById('classCode');
    const roleSelect = document.getElementById('roleSelect');
    if(!btn || btn.dataset.hooked) return;
    btn.dataset.hooked = '1';
    btn.addEventListener('click',()=>{
      const user = nameInput.value || 'Utilisateur';
      const room = classInput.value || 'Classe';
      const role = roleSelect.value || 'student';
      showBubble(`${user} (${role}) rejoint ${room}.`);
      if(socket && socket.connected)
        socket.emit('meme-join-event',{username:user, room, role, ts:Date.now()});
    });
  }

  function showBubble(text){
    const b = document.getElementById('meme-bubble');
    if(!b) return;
    b.querySelector('.msg').innerText=text;
    b.classList.add('show');
    speak(text, detectLang(text));
    clearTimeout(b._t);
    b._t=setTimeout(()=>b.classList.remove('show'),8000);
  }

  function triggerQuery(text){
    const socket = window.MEME_SOCKET;
    const lang = detectLang(text);
    if(socket && socket.connected){
      socket.emit('meme-query',{ text, lang });
    } else {
      showBubble('Serveur indisponible.');
    }
  }

  // === INIT ===
  function init(){
    insertUI();
    const socket = setupSocket();
    hookJoinButton(socket);
    if(AUTO_INTRO) setTimeout(()=> showBubble(`${AGENT_NAME} en ligne — prêt à assister la classe.`), 1000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
