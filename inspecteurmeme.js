/* inspecteurmeme.js
   Inspecteurmeme widget:
   - Connects to https://examen-backend-ihlx.onrender.com via socket.io
   - Loads memeqas into local memory (MEME_QA)
   - Re-requests memos when server emits memeqa-update
   - Handles text input and voice input, replies via TTS in same language
   - Changes avatar images for emotions and goes to sleep after 10 minutes idle
*/

/* CONFIG */
(function(){
  const SOCKET_SERVER = "https://examen-backend-ihlx.onrender.com";
  const IMG_BASE = ""; // images in repo root; change if images in subfolder
  const IMAGES = {
    normal: IMG_BASE + "meme-front.png",
    happy: IMAGES_SAFE("meme-happy.png"),
    angry: IMAGES_SAFE("meme-angry.png"),
    sleep: IMAGES_SAFE("meme-sleep.png")
  };

  /** helper to avoid ReferenceError if images not present */
  function IMAGES_SAFE(name){ return IMG_BASE + name; }

  const IDLE_MS = 10 * 60 * 1000; // 10 minutes
  const LANG_MAP = { ht: "ht-HT", fr: "fr-FR", en: "en-US", es: "es-ES" };

  // local memory
  let MEME_QA = [];
  let idleTimer = null;
  let isSleeping = false;

  // socket.io (make sure socket.io client script is loaded on page)
  if(typeof io === 'undefined'){
    console.error("inspecteurmeme.js: socket.io client missing. Include <script src=\"https://cdn.socket.io/4.6.1/socket.io.min.js\"></script>");
  }
  const socket = io(SOCKET_SERVER, { transports: ['websocket'] });

  /* --- Build DOM if not present --- */
  let root = document.getElementById('inspecteurmeme-root');
  if(!root){
    root = document.createElement('div');
    root.id = 'inspecteurmeme-root';
    document.body.appendChild(root);
  }

  root.innerHTML = `
    <div id="inspecteurmeme-bubble" title="Klike pou louvri Inspecteurmeme">
      <img id="inspecteurmeme-img" src="${IMAGES.normal}" alt="Inspecteurmeme">
    </div>

    <div id="inspecteurmeme-panel" role="dialog" aria-label="Inspecteurmeme Panel">
      <h4>Inspecteurmeme</h4>
      <input id="inspecteurmeme-name" type="text" placeholder="Nom / Prénom" />
      <select id="inspecteurmeme-lang">
        <option value="ht">🇭🇹 Kreyòl</option>
        <option value="fr">🇫🇷 Français</option>
        <option value="en">🇬🇧 English</option>
        <option value="es">🇪🇸 Español</option>
      </select>
      <div id="inspecteurmeme-chatbox"></div>
      <textarea id="inspecteurmeme-msg" placeholder="Ekri mesaj ou..."></textarea>
      <div class="inspecteurmeme-row" style="margin-top:8px">
        <button id="inspecteurmeme-mic" class="inspecteurmeme-btn secondary">🎤 Akse Mikro</button>
        <button id="inspecteurmeme-send" class="inspecteurmeme-btn primary">📨 Voye</button>
      </div>
      <div id="inspecteurmeme-status">Koneksyon: ...</div>
    </div>
  `;

  // elements
  const bubble = document.getElementById('inspecteurmeme-bubble');
  const imgEl = document.getElementById('inspecteurmeme-img');
  const panel = document.getElementById('inspecteurmeme-panel');
  const nameInput = document.getElementById('inspecteurmeme-name');
  const langSelect = document.getElementById('inspecteurmeme-lang');
  const chatbox = document.getElementById('inspecteurmeme-chatbox');
  const msgBox = document.getElementById('inspecteurmeme-msg');
  const micBtn = document.getElementById('inspecteurmeme-mic');
  const sendBtn = document.getElementById('inspecteurmeme-send');
  const statusEl = document.getElementById('inspecteurmeme-status');

  /* --- UI helpers --- */
  function addSystem(msg){
    const d = document.createElement('div');
    d.style.fontSize = '13px';
    d.style.color = '#666';
    d.style.marginBottom = '6px';
    d.textContent = msg;
    chatbox.appendChild(d); chatbox.scrollTop = chatbox.scrollHeight;
  }
  function addUser(msg){
    const d = document.createElement('div');
    d.style.textAlign = 'right'; d.style.marginBottom='6px';
    d.innerHTML = `<div style="display:inline-block;background:#e6f0ff;padding:6px;border-radius:8px;">${escapeHtml(msg)}</div>`;
    chatbox.appendChild(d); chatbox.scrollTop = chatbox.scrollHeight;
  }
  function addAgent(msg){
    const d = document.createElement('div');
    d.style.textAlign = 'left'; d.style.marginBottom='6px';
    d.innerHTML = `<div style="display:inline-block;background:#fff;padding:6px;border-radius:8px;border:1px solid #efefef;">${escapeHtml(msg)}</div>`;
    chatbox.appendChild(d); chatbox.scrollTop = chatbox.scrollHeight;
  }
  function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* --- Socket events --- */
  socket.on('connect', () => {
    statusEl.textContent = 'Konekte (socket)';
    socket.emit('request-memeqa'); // request full memory
  });

  socket.on('disconnect', () => { statusEl.textContent = 'Dekonekte'; });

  socket.on('memeqa-data', (data) => {
    MEME_QA = Array.isArray(data) ? data : [];
    addSystem(`Memwa chaje: ${MEME_QA.length} antre`);
  });

  socket.on('memeqa-update', (payload) => {
    addSystem('Memwa sou servèr modifye — rechaje...');
    socket.emit('request-memeqa');
  });

  socket.on('answer', (payload) => {
    const text = payload?.answer || "M pa jwenn repons lan.";
    const lang = payload?.lang || langSelect.value || detectLangFromText(text) || 'ht';
    addAgent(text);
    speakText(text, lang);
    animateFromText(text);
  });

  /* --- TTS / voice --- */
  let voices = [];
  function loadVoices(){ return new Promise(res => {
    voices = speechSynthesis.getVoices();
    if(voices.length) return res(voices);
    speechSynthesis.onvoiceschanged = () => { voices = speechSynthesis.getVoices(); res(voices); };
    setTimeout(()=>{ voices = speechSynthesis.getVoices(); res(voices); }, 1200);
  }); }

  function pickVoiceForLang(code){
    if(!voices.length) voices = speechSynthesis.getVoices();
    const short = (code||'').split('-')[0];
    const cand = voices.filter(v => (v.lang||'').toLowerCase().startsWith(short));
    return cand[0] || voices[0] || null;
  }

  async function speakText(text, langKey='ht'){
    if(isSleeping) wakeUp();
    await loadVoices();
    const utter = new SpeechSynthesisUtterance(text);
    const code = LANG_MAP[langKey] || LANG_MAP['ht'];
    utter.lang = code;
    const v = pickVoiceForLang(code);
    if(v) utter.voice = v;
    imgEl.classList.add('talking');
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
    utter.onend = () => imgEl.classList.remove('talking');
  }

  /* --- STT (SpeechRecognition) --- */
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  if(recognition){
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  }

  micBtn.addEventListener('click', () => {
    if(!recognition){ alert("Navigatè pa sipòte rekonesans vwa."); return; }
    const langCode = LANG_MAP[langSelect.value] || LANG_MAP['ht'];
    recognition.lang = langCode;
    recognition.start();
    addSystem("M ap tande...");
  });

  if(recognition){
    recognition.onresult = (ev) => {
      const txt = ev.results[0][0].transcript;
      addUser(txt);
      handleQuestion(txt);
    };
    recognition.onerror = (e) => addSystem("STT erè: " + (e.error || e.message || 'unknown'));
  }

  /* --- send button --- */
  sendBtn.addEventListener('click', () => {
    const txt = msgBox.value.trim();
    if(!txt) return;
    addUser(txt);
    msgBox.value = '';
    handleQuestion(txt);
  });

  msgBox.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendBtn.click(); }
  });

  /* --- main logic: handle incoming questions --- */
  function handleQuestion(text){
    resetIdleTimer();
    let chosenLang = langSelect.value || detectLangFromText(text) || 'ht';

    // 1) exact lang + exact match
    let found = MEME_QA.find(d => d && d.lang === chosenLang && d.question && d.question.trim().toLowerCase() === text.trim().toLowerCase());
    if(found){ addAgent(found.answer); speakText(found.answer, found.lang); animateFromText(found.answer); return; }

    // 2) contains match in chosen lang
    found = MEME_QA.find(d => d && d.lang === chosenLang && d.question && text.toLowerCase().includes(d.question.toLowerCase()));
    if(found){ addAgent(found.answer); speakText(found.answer, found.lang); animateFromText(found.answer); return; }

    // 3) any-lang contains
    found = MEME_QA.find(d => d && d.question && text.toLowerCase().includes(d.question.toLowerCase()));
    if(found){ addAgent(found.answer); speakText(found.answer, found.lang || chosenLang); animateFromText(found.answer); return; }

    // 4) fallback ask server (server will emit 'answer')
    addSystem('M ap mande servèr pou repons...');
    socket.emit('ask', { question: text, lang: chosenLang });
  }

  /* --- small heuristics for emotion from text --- */
  function animateFromText(ans){
    const a = (ans||'').toLowerCase();
    if(a.includes('m pa') || a.includes('pa') || a.includes('désolé') || a.includes('sorry') || a.includes('erè')){
      setEmotion('angry'); setTimeout(()=> setEmotion('normal'), 3000);
    } else if(a.length < 80 && (a.includes('!') || a.includes('😀') || a.includes('ha') || a.includes('bonjou') || a.includes('merci'))){
      setEmotion('happy'); setTimeout(()=> setEmotion('normal'), 3000);
    } else {
      setEmotion('normal');
    }
  }

  function setEmotion(e){
    imgEl.classList.remove('happy','angry','sleep','talking');
    imgEl.src = IMAGES.normal;
    if(e === 'happy'){ imgEl.classList.add('happy'); imgEl.src = IMAGES.happy; }
    else if(e === 'angry'){ imgEl.classList.add('angry'); imgEl.src = IMAGES.angry; }
    else if(e === 'sleep'){ imgEl.classList.add('sleep'); imgEl.src = IMAGES.sleep; }
    else { imgEl.src = IMAGES.normal; }
  }

  /* --- language detection helper --- */
  function detectLangFromText(text){
    if(!text) return null;
    const t = text.toLowerCase();
    const creoleTokens = ["bonjou","mwen","kijan","mesi","sispann","lapriye","ou"];
    const frTokens = ["bonjour","merci","comment","vous","s'il","svp","monsieur"];
    const enTokens = ["hello","hi","how","please","thanks","you"];
    const esTokens = ["hola","como","gracias","por favor","buenos"];
    let scores = { ht:0, fr:0, en:0, es:0 };
    t.split(/\W+/).forEach(w => {
      if(creoleTokens.includes(w)) scores.ht++;
      if(frTokens.includes(w)) scores.fr++;
      if(enTokens.includes(w)) scores.en++;
      if(esTokens.includes(w)) scores.es++;
    });
    let best = 'ht', max = -1;
    for(const k of Object.keys(scores)){ if(scores[k] > max){ max = scores[k]; best = k; } }
    return max === 0 ? null : best;
  }

  /* --- Idle timer (sleep after 10 minutes inactivity) --- */
  function resetIdleTimer(){
    clearTimeout(idleTimer);
    if(isSleeping) wakeUp();
    idleTimer = setTimeout(()=> {
      isSleeping = true;
      setEmotion('sleep');
      addSystem('Agentmeme dòmi (pa gen entèraksyon depi 10 min).');
    }, IDLE_MS);
  }
  function wakeUp(){
    if(!isSleeping) return;
    isSleeping = false;
    setEmotion('normal');
    addSystem('Agentmeme reveye!');
    resetIdleTimer();
  }
  // reset idle on user interactions
  ['click','mousemove','keydown','touchstart'].forEach(ev => window.addEventListener(ev, resetIdleTimer, {passive:true}));
  resetIdleTimer();

  /* --- bubble click toggles panel --- */
  bubble.addEventListener('click', () => {
    if(panel.style.display === 'block'){ panel.style.display = 'none'; }
    else { panel.style.display = 'block'; msgBox.focus(); resetIdleTimer(); }
  });

  /* --- expose small API --- */
  window.inspecteurmeme = {
    getMemoryCount: () => MEME_QA.length,
    reloadMemory: () => socket.emit('request-memeqa'),
    speak: (text, lang) => speakText(text, lang)
  };

})();
