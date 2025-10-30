/* meme-agent.js - MEME Inspector AI (client) */
/* Place in repo root and include in Ecole-en-ligne.html after socket.io script */

(function(){
  const SOCKET_URL = (location.origin && location.origin !== 'null') ? location.origin : "https://examen-backend-ihlx.onrender.com";
  const AGENT_NAME = "MEME";
  const AGENT_ROLE = "Inspecteur";
  const AUTO_INTRO = true;
  const LANG_PRIORITY = ['ht','fr','en','es'];

  // small utils
  function nowTs(){ return new Date().toLocaleTimeString(); }
  function safeText(s){ return (s||'').toString(); }

  // TTS function (client-side)
  function speak(text, langHint='fr'){
    if(!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0; utter.pitch = 1.0; utter.volume = 1.0;
    // choose voice best-match
    const voices = window.speechSynthesis.getVoices();
    let candidate = null;
    if(voices && voices.length){
      candidate = voices.find(v=>v.lang && v.lang.toLowerCase().startsWith(langHint)) || voices.find(v=>v.lang && v.lang.startsWith('fr')) || voices[0];
    }
    if(candidate) utter.voice = candidate;
    // fallback for creole: use fr voices (browser limitation)
    utter.lang = (langHint==='ht') ? 'fr-FR' : (langHint==='en' ? 'en-US' : (langHint==='es' ? 'es-ES' : 'fr-FR'));
    try{ window.speechSynthesis.cancel(); window.speechSynthesis.speak(utter); } catch(e){ console.warn('MEME TTS error', e); }
  }

  // Lang guess by keywords
  function detectLang(text){
    if(!text) return 'fr';
    const t = text.toLowerCase();
    const score = { ht:0, fr:0, en:0, es:0 };
    const map = {
      ht: ['mwen','ou','kijan','tanpri','pa','bon','byen','kisa','mwen bezwen','edit'],
      fr: ['bonjour','merci','comment','professeur','s\'il','pouquoi','bonjour'],
      en: ['hello','please','teacher','how','can','you','thanks'],
      es: ['hola','gracias','profesor','por favor','como','no entiendo']
    };
    Object.keys(map).forEach(k => map[k].forEach(w => { if(t.includes(w)) score[k]++; }));
    return Object.keys(score).reduce((a,b)=>score[a]>=score[b]?a:b);
  }

  // UI insertion
  function insertUI(){
    if(document.getElementById('meme-widget')) return;
    const widget = document.createElement('div'); widget.id='meme-widget'; widget.className='meme-widget';
    const avatar = document.createElement('div'); avatar.className='meme-avatar'; avatar.innerText='ME';
    const float = document.createElement('div'); float.className='meme-floating'; float.innerText='AI';
    avatar.appendChild(float); widget.appendChild(avatar);

    const bubble = document.createElement('div'); bubble.id='meme-bubble'; bubble.className='meme-bubble';
    bubble.innerHTML = `<div class="title">${AGENT_NAME} — ${AGENT_ROLE}</div>
      <div class="msg small">${AGENT_NAME} prêt. Cliquez pour interroger.</div>
      <div class="controls">
        <button class="ok">Poser Q</button>
        <button class="ko">Fermer</button>
      </div>`;

    document.body.appendChild(bubble); document.body.appendChild(widget);

    widget.addEventListener('click', ()=> bubble.classList.toggle('show'));
    bubble.querySelector('.ko').addEventListener('click', ()=> bubble.classList.remove('show'));
    bubble.querySelector('.ok').addEventListener('click', ()=>{
      bubble.querySelector('.msg').innerText = `${AGENT_NAME} écoute...`;
      bubble.classList.add('show');
      speak(`Bonjour, je suis ${AGENT_NAME}. Comment puis-je aider ?`, 'fr');
      openQuickAsk();
    });
  }

  // Quick ask small UI
  function openQuickAsk(){
    let box = document.getElementById('meme-ask-box');
    if(box){ box.style.display='block'; return; }
    box = document.createElement('div'); box.id='meme-ask-box';
    box.style.position='fixed'; box.style.right='132px'; box.style.bottom='120px'; box.style.zIndex=12001;
    box.style.background='white'; box.style.padding='10px'; box.style.borderRadius='8px';
    box.style.boxShadow='0 8px 20px rgba(13,110,253,0.12)';
    const input = document.createElement('input'); input.type='text'; input.placeholder='Posez une question à MEME...';
    input.style.padding='8px'; input.style.width='320px'; input.style.border='1px solid #ddd'; input.style.borderRadius='6px';
    const btn = document.createElement('button'); btn.innerText='Envoyer'; btn.style.marginLeft='8px'; btn.style.padding='8px 10px';
    box.appendChild(input); box.appendChild(btn); document.body.appendChild(box);
    btn.addEventListener('click', ()=> { if(input.value.trim()){ triggerQuery(input.value.trim()); input.value=''; } });
    input.addEventListener('keydown', (e)=> { if(e.key==='Enter') btn.click(); });
  }

  // Show bubble + optional tts
  function showBubble(text, speakIt=true){
    const b = document.getElementById('meme-bubble');
    if(!b) return;
    b.querySelector('.msg').innerText = text;
    b.classList.add('show');
    if(speakIt){
      const lang = detectLang(text);
      speak(text, lang);
    }
    clearTimeout(b._t); b._t = setTimeout(()=> b.classList.remove('show'), 9000);
  }

  // Socket setup
  function setupSocketAndHooks(){
    if(!window.io) { console.warn('Socket.io client not found for MEME'); return null; }
    const socket = io(SOCKET_URL);
    window.MEME_SOCKET = socket;

    socket.on('connect', ()=> console.log('[MEME] socket connected', socket.id));

    // Receive broadcasted join event
    socket.on('meme-join-event', data => {
      const { username, room, role } = data || {};
      showBubble(`${username} (${role}) vient de rejoindre ${room}.`, true);
    });

    // Receive query result for requester
    socket.on('meme-query-result', payload => {
      if(!payload) return;
      const ans = payload.answer || 'Je n’ai pas de réponse.';
      showBubble(ans, true);
    });

    // Receive server-requested speak (e.g. class-start)
    socket.on('meme-speak', ({ text }) => {
      if(text) showBubble(text, true);
    });

    socket.on('meme-class-start', ({ room })=>{
      const msg = `Bienvenue dans la salle ${room || ''}. Bon cours !`;
      showBubble(msg, true);
    });
    socket.on('meme-class-end', ({ room })=>{
      const msg = `Au revoir à tous — session ${room || ''} terminée.`;
      showBubble(msg, true);
    });

    // Hook the page join button
    hookJoinButton(socket);

    return socket;
  }

  // Hook join to emit meme-join-event (and local show)
  function hookJoinButton(socket){
    const joinBtn = document.getElementById('join-room');
    if(!joinBtn) return;
    if(joinBtn.dataset.memeHooked) return;
    joinBtn.dataset.memeHooked = '1';
    const inputUser = document.getElementById('username');
    const inputRoom = document.getElementById('room-code');
    const inputRole = document.getElementById('role');

    joinBtn.addEventListener('click', ()=>{
      const username = (inputUser && inputUser.value.trim()) || 'Utilisateur';
      const room = (inputRoom && inputRoom.value.trim()) || 'general';
      const role = (inputRole && inputRole.value) || 'student';
      // local feedback
      showBubble(`${AGENT_NAME}: ${username} a demandé à rejoindre ${room}.`, true);
      // emit to server
      if(socket && socket.connected) socket.emit('meme-join-event', { username, room, role, ts: Date.now() });
    });
  }

  // Trigger a query to server
  function triggerQuery(text){
    const socket = window.MEME_SOCKET;
    const lang = detectLang(text);
    showBubble(`Recherche: ${text}`, true);
    if(socket && socket.connected){
      const roomEl = document.getElementById('room-code');
      const room = roomEl ? (roomEl.value || '') : '';
      socket.emit('meme-query', { text, lang, room });
    } else {
      // fallback local
      const ans = localFallback(text, detectLang(text));
      showBubble(ans, true);
    }
  }

  function localFallback(q, lang){
    const lq = q.toLowerCase();
    if(lq.includes('bonjour')||lq.includes('hello')) return (lang==='en' ? 'Hello!' : 'Bonjour!');
    return (lang==='fr' ? 'Désolé, je ne sais pas encore. Je peux apprendre si vous l’ajoutez.' : 'I don’t know yet.');
  }

  // Speech recognition: optional background listener to detect trouble words
  function startRecognizer(socket){
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if(!SpeechRecognition) return null;
    const rec = new SpeechRecognition();
    rec.continuous = true; rec.interimResults = false;
    rec.lang = 'fr-FR';
    rec.onresult = (ev) => {
      const text = Array.from(ev.results).map(r=>r[0].transcript).join(' ').trim();
      if(!text) return;
      // detect struggle sentences
      const low = text.toLowerCase();
      if(/(je n|je ne|can't|no entiendo|pa ka|m pa ka|i can't)/.test(low)){
        // notify server
        const room = (document.getElementById('room-code') && document.getElementById('room-code').value) || '';
        if(socket && socket.connected) socket.emit('meme-help-request', { text, room, ts: Date.now() });
        showBubble('Je peux aider — pose ta question à MEME.', true);
      }
    };
    rec.onerror = (e)=> console.warn('MEME recog err', e);
    try { rec.start(); } catch(e){ console.warn('MEME recog start err', e); }
    return rec;
  }

  // Auto triggers: welcome on load then connect socket
  function init(){
    insertUI();
    const socket = setupSocketAndHooks();
    if(AUTO_INTRO) setTimeout(()=> showBubble(`${AGENT_NAME} en ligne — Inspecteur prêt.`, true), 800);
    try { startRecognizer(socket); } catch(e){}
    // expose API
    window.MEME_AGENT = { triggerQuery, speak: (t,l)=> speak(t,l), showBubble };
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();


<script src="seed_meme_qa.js"></script>

<script src="meme_qa_data.json"></script>  
})();


