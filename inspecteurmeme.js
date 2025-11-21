/* inspecteurmeme.js — patched version
   Fixes: more reliable TTS voices, language fallback, fetch fallback for memeqa-data,
   better logs, and safer speak invocation.
*/
(function(){
  const SOCKET_SERVER = "https://examen-backend-ihlx.onrender.com";
  const IMG_BASE = ""; // set if images live in subfolder e.g. "/assets/"
  const IMAGES = {
    normal: IMG_BASE + "meme-front.png",
    happy: IMAGES_SAFE("meme-happy.png"),
    angry: IMAGES_SAFE("meme-angry.png"),
    sleep: IMAGES_SAFE("meme-sleep.png")
  };
  function IMAGES_SAFE(name){ return IMG_BASE + name; }

  const IDLE_MS = 10 * 60 * 1000; // 10 minutes
  // Map of short lang keys (used in DB) to speech code fallbacks.
  // NOTE: browsers may not have native 'ht-HT' voices — creole will fallback to a sensible voice.
  const LANG_MAP = { ht: "ht-HT", fr: "fr-FR", en: "en-US", es: "es-ES" };

  let MEME_QA = [];
  let idleTimer = null;
  let isSleeping = false;



function testLocalQuery(question) {
  if (!MEME_QA || MEME_QA.length === 0) {
    console.log("MEME_QA pa chaje toujou!");
    return;
  }

  const answer = MEME_QA.find(entry => 
    entry.question.toLowerCase().includes(question.toLowerCase())
  );

  if (answer) {
    console.log(">>> Repons jwenn:", answer.answer);
  } else {
    console.log(">>> Pa gen repons ki koresponn ak:", question);
  }
}



   

  if(typeof io === 'undefined'){
    console.error("inspecteurmeme.js: socket.io client missing. Include <script src=\"https://cdn.socket.io/4.6.1/socket.io.min.js\"></script>");
  }
  const socket = io ? io(SOCKET_SERVER, { transports: ['websocket'], autoConnect:true, reconnection:true }) : null;

  // DOM build (unchanged)
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

    <div id="inspecteurmeme-panel" role="dialog" aria-label="Inspecteurmeme Panel" style="display:none">
      <h4>Inspecteurmeme</h4>
      <input id="inspecteurmeme-name" type="text" placeholder="Nom / Prénom" />
      <select id="inspecteurmeme-lang">
        <option value="ht">🇭🇹 Kreyòl</option>
        <option value="fr">🇫🇷 Français</option>
        <option value="en">🇬🇧 English</option>
        <option value="es">🇪🇸 Español</option>
      </select>
      <div id="inspecteurmeme-chatbox" style="max-height:240px;overflow:auto;padding:6px;border:1px solid #eee;background:#fafafa"></div>
      <textarea id="inspecteurmeme-msg" placeholder="Ekri mesaj ou..." rows="2" style="width:100%;"></textarea>
      <div class="inspecteurmeme-row" style="margin-top:8px">
        <button id="inspecteurmeme-mic" class="inspecteurmeme-btn secondary">🎤 Akse Mikro</button>
        <button id="inspecteurmeme-send" class="inspecteurmeme-btn primary">📨 Voye</button>
      </div>
      <div id="inspecteurmeme-status">Koneksyon: ...</div>
    </div>
  `;








// --- Mete nouvo bouton mizik nan panel la ---
(function(){
  // Panel deja egziste
  if(panel){
    // 1️⃣ Kreye bouton la epi kenbe stil menm jan ak lòt bouton yo
    const playMusicBtn = document.createElement("button");
    playMusicBtn.textContent = "📻 Jwe mizik";
    playMusicBtn.className = "inspecteurmeme-btn secondary"; 
    playMusicBtn.style.marginLeft = "5px";

    // Mete li nan menm ranje ak bouton 'Akse Mikro' ak 'Voye'
    const row = panel.querySelector(".inspecteurmeme-row");
    if(row) row.appendChild(playMusicBtn);

    // 2️⃣ Kreye audio object nan JS (pa mete nan DOM)
    const audio = new Audio("https://fondationbackupspirituel.com/Gemissant.mp3");
    audio.loop = true;
    audio.preload = "auto";

    // 3️⃣ Ajoute event listener pou bouton an
    playMusicBtn.addEventListener("click", () => {
      if(audio.paused){
        audio.play();
        playMusicBtn.textContent = "⏸️ Sispann mizik";
      } else {
        audio.pause();
        playMusicBtn.textContent = "📻 Jwe mizik";
      }
    });
  }
})();




   

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

  function addSystem(msg){
    const d = document.createElement('div');
    d.style.fontSize = '13px';
    d.style.color = '#666';
    d.style.marginBottom = '6px';
    d.textContent = msg;
    chatbox.appendChild(d); chatbox.scrollTop = chatbox.scrollHeight;
    console.debug('[IM SYSTEM]', msg);
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





   // --- Socket handlers + fetch fallback
if(socket){
  socket.on('connect', () => {
    statusEl.textContent = 'Konekte (socket)';
    console.debug('[IM] socket connected, requesting memoire...');
    socket.emit('request-memeqa');
  });

  socket.on('disconnect', () => { statusEl.textContent = 'Dekonekte'; });

  // socket received memoire
  socket.on('memeqa-data', (data) => {
    MEME_QA = Array.isArray(data) ? data : [];
    logMEME_QAStatus('socket');           // DEBUG log
    addSystem(`Memwa chaje: ${MEME_QA.length} antre`);
    console.debug('[IM] memeqa-data received count=', MEME_QA.length);
  });

  socket.on('memeqa-update', (payload) => {
    addSystem('Memwa sou servèr modifye — rechaje...');
    console.debug('[IM] memeqa-update payload', payload);
    socket.emit('request-memeqa');
    setTimeout(fetchMemoryFallback, 800);
  });

  socket.on('answer', (payload) => {
    const text = payload?.answer || "M pa jwenn repons lan.";
    const lang = payload?.lang || langSelect.value || detectLangFromText(text) || 'ht';
    addAgent(text);
    speakText(text, lang).catch(e=>{ console.warn('TTS failed:', e); });
    animateFromText(text);
  });
} else {
  // no socket: fetch memory once as fallback
  setTimeout(fetchMemoryFallback, 300);
}

// --- Debug log MEME_QA ---
function logMEME_QAStatus(source){
  console.log(`>>> [DEBUG] MEME_QA loaded via ${source}, count=`, MEME_QA.length);
}

// fallback HTTP memoire
let fetchTried = false;
async function fetchMemoryFallback(){
  if(fetchTried) return;
  fetchTried = true;
  try{
    const url = SOCKET_SERVER + '/api/memeqas';
    console.debug('[IM] fetch fallback to', url);
    const resp = await fetch(url, { method: 'GET' });
    if(!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    MEME_QA = Array.isArray(data) ? data : [];
    logMEME_QAStatus('HTTP fallback'); // DEBUG log
    addSystem(`(HTTP) Memwa chaje: ${MEME_QA.length} antre`);
  }catch(err){
    console.warn('[IM] fetchMemoryFallback failed', err);
    addSystem('Pa t ka telechaje memwa via HTTP.');
  }
}

// handleQuestion debogaj
const _old_handleQuestion = handleQuestion;
handleQuestion = function(text){
  console.log(`>>> [DEBUG] handleQuestion called with text: "${text}"`);
  console.log('>>> [DEBUG] MEME_QA currently has', MEME_QA.length, 'entries');
  _old_handleQuestion(text);
};

   


   
  /* --- TTS / voice: more robust loading & better matching --- */
  let voices = [];
  function timeout(ms){ return new Promise(r=>setTimeout(r,ms)); }

  async function loadVoices(){ 
    // try multiple times with small delays to handle browsers that lazy-load voices
    for(let attempt=0; attempt<6; attempt++){
      voices = speechSynthesis.getVoices() || [];
      if(voices.length) break;
      // attach onvoiceschanged only on first attempt
      if(attempt===0){
        speechSynthesis.onvoiceschanged = () => { voices = speechSynthesis.getVoices() || []; console.debug('[IM] onvoiceschanged fired, voices=', voices.length); };
      }
      await timeout(250);
    }
    // final read
    voices = speechSynthesis.getVoices() || voices || [];
    console.debug('[IM] loadVoices finished, voices count=', voices.length);
    return voices;
  }

  function pickVoiceForLang(code){
    if(!voices.length) voices = speechSynthesis.getVoices() || [];
    const short = (code||'').split('-')[0].toLowerCase();
    // prefer exact startsWith, then contains, then default
    let cand = voices.filter(v => (v.lang||'').toLowerCase().startsWith(short));
    if(!cand.length){
      cand = voices.filter(v => (v.lang||'').toLowerCase().includes(short));
    }
    if(!cand.length){
      // try to pick by voice name hints (common)
      const hints = { fr:['fr'], en:['en'], es:['es','spanish'], ht:['creole','haiti'] };
      const h = hints[short] || [];
      for(const hstr of h){
        const c2 = voices.filter(v => (v.name||'').toLowerCase().includes(hstr));
        if(c2.length) { cand = c2; break; }
      }
    }
    const chosen = cand[0] || voices[0] || null;
    console.debug('[IM] pickVoiceForLang', code, '=>', chosen ? chosen.name + '|' + chosen.lang : 'null');
    return chosen;
  }





async function speakText(text, langKey='ht'){
  if(isSleeping) wakeUp();
  try{
    await loadVoices();
    const utter = new SpeechSynthesisUtterance(text);

    // ✅ map langKey nan LANG_MAP
    const code = LANG_MAP[langKey] || LANG_MAP['ht'];
    utter.lang = code;

    // ✅ toujou itilize menm vwa fi fransè a pou tout lang
    const v = voices.find(v =>
      v.lang.toLowerCase().startsWith('fr') &&
      /female|femme|amelie|marie|google français/i.test(v.name)
    );
    if(v) utter.voice = v;

    imgEl.classList.add('talking');

    // cancel ongoing speech
    try { speechSynthesis.cancel(); } catch(e){}

    // create promise that resolves on end
    const speakPromise = new Promise((res, rej) => {
      utter.onend = () => { imgEl.classList.remove('talking'); res(); };
      utter.onerror = (e) => { imgEl.classList.remove('talking'); rej(e); };
    });

    speechSynthesis.speak(utter);
    return speakPromise;

  } catch(err){
    imgEl.classList.remove('talking');
    console.warn('[IM] speakText error', err);
    throw err;
  }
}






   

  /* --- STT (SpeechRecognition) unchanged except ensure correct lang codes --- */
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
    try {
      recognition.start();
      addSystem("M ap tande...");
    } catch(e){
      console.warn('[IM] recognition.start error', e);
      addSystem("Pa kapab demare rekonesans vwa: " + (e.message||e));
    }
  });

  if(recognition){
    recognition.onresult = (ev) => {
      const txt = ev.results[0][0].transcript;
      addUser(txt);
      handleQuestion(txt);
    };
    recognition.onerror = (e) => addSystem("STT erè: " + (e.error || e.message || 'unknown'));
  }

  // send button + keyboard
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

 
   
   
   



 // ===============================================
// 🔹 Fonksyon prensipal pou jere kesyon yo
// ===============================================
function handleQuestion(text) {
  resetIdleTimer();
  const chosenLang = langSelect.value || detectLangFromText(text) || 'ht';

  // 1️⃣ — Eseye jwenn repons lokal via exact match nan lang chwazi
  let found = MEME_QA.find(d =>
    d && d.lang === chosenLang &&
    d.question &&
    d.question.trim().toLowerCase() === text.trim().toLowerCase()
  );
  if (found) {
    addAgent(found.answer);
    speakText(found.answer, found.lang).catch(() => {});
    animateFromText(found.answer);
    return;
  }

  // 2️⃣ — Eseye match contains nan lang chwazi
  found = MEME_QA.find(d =>
    d && d.lang === chosenLang &&
    d.question &&
    text.toLowerCase().includes(d.question.toLowerCase())
  );
  if (found) {
    addAgent(found.answer);
    speakText(found.answer, found.lang).catch(() => {});
    animateFromText(found.answer);
    return;
  }

  // 3️⃣ — Fallback: exact match nenpòt lang
  found = MEME_QA.find(d =>
    d && d.question &&
    d.question.trim().toLowerCase() === text.trim().toLowerCase()
  );
  if (found) {
    addAgent(found.answer);
    speakText(found.answer, found.lang || chosenLang).catch(() => {});
    animateFromText(found.answer);
    return;
  }

  // 4️⃣ — Fallback: contains match nenpòt lang
  found = MEME_QA.find(d =>
    d && d.question &&
    text.toLowerCase().includes(d.question.toLowerCase())
  );
  if (found) {
    addAgent(found.answer);
    speakText(found.answer, found.lang || chosenLang).catch(() => {});
    animateFromText(found.answer);
    return;
  }

  // 5️⃣ — Pa jwenn repons lokal: mande sèvè
  addSystem('M ap mande sèvè pou repons...');
  if (socket && socket.connected) {
    socket.emit('ask', { question: text, lang: chosenLang });
  } else {
    // Fallback HTTP POST sou API /ask
    fetch(SOCKET_SERVER + '/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: text, lang: chosenLang })
    })
      .then(r => r.json())
      .then(payload => {
        const DEFAULT_ANSWERS = {
          ht: "Mwen pa jwenn repons lan.",
          fr: "Je n’ai pas trouvé la réponse.",
          en: "I couldn’t find the answer.",
          es: "No encontré la respuesta."
        };

        const langKey =
          (payload?.lang && ['ht','fr','en','es'].includes(payload.lang))
            ? payload.lang
            : chosenLang;

        const textResp = payload?.answer || DEFAULT_ANSWERS[langKey];

        addAgent(textResp);
        speakText(textResp, langKey).catch(() => {});
        animateFromText(textResp);
      })
      .catch(err => {
        console.warn('[IM] HTTP ask failed', err);
        addSystem('Sèvè pa reponn kounye a.');
      });
  }
}


// ===============================================
// 🔹 Fonksyon pou netwaye tèks
// ===============================================
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[?.,!:-]/g, '') // retire ponktiyasyon
    .trim();
}


// ===============================================
// 🔹 Fonksyon pou jwenn repons lokal
// ===============================================
function findAnswer(text) {
  const normalized = normalize(text);

  for (const qa of MEME_QA) {
    if (normalize(qa.question) === normalized) {
      return qa.answer;
    }
  }

  // Retounen tèks default sèlman si pa gen repons lokal
  return "Mwen pa sèten, ou vle m eseye reponn sa ?";
}













   
   
  // emotion helpers unchanged
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

  // improved detectLangFromText: return null if no strong signal
  function detectLangFromText(text){
    if(!text) return null;
    const t = text.toLowerCase();
    const creoleTokens = ["bonjou","mwen","kijan","mesi","sispann","lapriye","ou","m'ap","m ap"];
    const frTokens = ["bonjour","merci","comment","vous","s'il","svp","monsieur","tu","merci"];
    const enTokens = ["hello","hi","how","please","thanks","you","what"];
    const esTokens = ["hola","como","gracias","por","favor","buenos","buenas"];
    let scores = { ht:0, fr:0, en:0, es:0 };
    t.split(/\W+/).forEach(w => {
      if(creoleTokens.includes(w)) scores.ht++;
      if(frTokens.includes(w)) scores.fr++;
      if(enTokens.includes(w)) scores.en++;
      if(esTokens.includes(w)) scores.es++;
    });
    // require at least 1 token and clear winner
    let keys = Object.keys(scores);
    let best = null, max = 0;
    for(const k of keys){ if(scores[k] > max){ max = scores[k]; best = k; } }
    if(max <= 0) return null;
    // ensure winner is distinct enough (>=1 lead)
    const sorted = keys.map(k=>scores[k]).sort((a,b)=>b-a);
    if(sorted[0] === sorted[1]) return null;
    return best;
  }

  // idle timer
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
  ['click','mousemove','keydown','touchstart'].forEach(ev => window.addEventListener(ev, resetIdleTimer, {passive:true}));
  resetIdleTimer();

  bubble.addEventListener('click', () => {
    if(panel.style.display === 'block'){ panel.style.display = 'none'; }
    else { panel.style.display = 'block'; msgBox.focus(); resetIdleTimer(); }
  });

  // small API
  window.inspecteurmeme = {
    getMemoryCount: () => MEME_QA.length,
    reloadMemory: () => { if(socket) socket.emit('request-memeqa'); fetchMemoryFallback(); },
    speak: (text, lang) => speakText(text, lang)
  };

  // ensure we try to fetch memos automatically once if socket didn't deliver
  setTimeout(()=>{ if(!MEME_QA.length) fetchMemoryFallback(); }, 1200);

})();


