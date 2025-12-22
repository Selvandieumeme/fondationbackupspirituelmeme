(function(){
  const SOCKET_SERVER = "https://fondationbackupspirituel.com";
  const IMG_BASE = ""; // imaj yo nan rasin sit
  const IMAGES = {
    normal: IMG_BASE + "meme-front.png",
    happy: IMG_BASE + "meme-happy.png",
    angry: IMG_BASE + "meme-angry.png",
    sleep: IMG_BASE + "meme-sleep.png"
  };
  const IDLE_MS = 10*60*1000;
  const LANG_CODES = { ht:"ht-HT", fr:"fr-FR", en:"en-US", es:"es-ES" };

  function detectLangFromText(text){
    const t=text.toLowerCase();
    const creole=["bonjou","mwen","kijan","m ap","mesi"];
    const french=["bonjour","merci","comment"];
    const english=["hello","hi","how","good"];
    const spanish=["hola","buenos","como"];
    let scores={ht:0,fr:0,en:0,es:0};
    for(const w of t.split(/\W+/)){
      if(creole.includes(w)) scores.ht++;
      if(french.includes(w)) scores.fr++;
      if(english.includes(w)) scores.en++;
      if(spanish.includes(w)) scores.es++;
    }
    let best="ht",max=-1;
    for(const k of Object.keys(scores)){ if(scores[k]>max){max=scores[k];best=k;} }
    if(max===0) return null; return best;
  }

  // Inject HTML panel/avatar
  const xhr = new XMLHttpRequest();
  xhr.open('GET','Agentmeme.html',false);
  xhr.send();
  if(xhr.status===200){
    const div=document.createElement('div');
    div.innerHTML=xhr.responseText;
    document.body.appendChild(div);
  }

  const socket=io(SOCKET_SERVER,{transports:['websocket']});
  let MEME_QA=[],idleTimer=null,isSleeping=false;

  const bubble=document.getElementById('agentmeme-bubble');
  const imgEl=document.getElementById('agentmeme-img');
  const panel=document.getElementById('agentmeme-panel');
  const nameInput=document.getElementById('agentmeme-name');
  const langSelect=document.getElementById('agentmeme-lang');
  const chatbox=document.getElementById('agentmeme-chatbox');
  const msgBox=document.getElementById('agentmeme-msg');
  const micBtn=document.getElementById('agentmeme-mic');
  const sendBtn=document.getElementById('agentmeme-send');
  const statusEl=document.getElementById('agentmeme-status');

 
 
  
  // show/hide panel - toujou sou kwen anba dwat, responsive
bubble.addEventListener('click', () => {
  if(panel.style.display === 'block') {
    panel.style.display = 'none';
  } else {
    panel.style.display = 'block';

    // Ajoute styling pou panel toujou vizib sou tout aparèy
    panel.style.position = 'fixed';
    panel.style.right = '20px';
    panel.style.bottom = '160px';
    panel.style.width = '260px';
    panel.style.maxWidth = 'calc(100vw - 16px)';
    panel.style.zIndex = '999999';

    // Mobil & ti ekran
    if(window.innerWidth <= 600){
      panel.style.right = '8px';
      panel.style.left = '8px';
      panel.style.bottom = '120px';
      panel.style.width = 'auto';
      panel.style.padding = '8px';
    }
  }
  resetIdleTimer();
});
  
  
  
  
  
  
  
  
  // Socket.IO events
  socket.on('connect',()=>{statusEl.textContent='Konekte'; socket.emit('request-memeqa');});
  socket.on('disconnect',()=>{statusEl.textContent='Deconnecte';});
  socket.on('receive-memeqa',(data)=>{MEME_QA=Array.isArray(data)?data:[]; addSystemMessage(`Memwa chaje: ${MEME_QA.length} dokiman`);});
  socket.on('answer',(payload)=>{const text=payload?.answer||"M pa jwenn repons lan."; const lang=payload?.lang||langSelect.value||detectLangFromText(text)||'ht'; showAgent(text); speak(text,lang);});
  socket.on('memeqa-update',()=>{addSystemMessage('Memwa modifye sou servèr — rechaje...'); socket.emit('request-memeqa');});

  function addSystemMessage(text){const d=document.createElement('div');d.style.fontSize='13px';d.style.color='#666';d.style.marginBottom='6px';d.textContent=text; chatbox.appendChild(d); chatbox.scrollTop=chatbox.scrollHeight;}
  function showUser(text){const d=document.createElement('div');d.style.textAlign='right';d.style.marginBottom='6px';d.innerHTML=`<small style="color:#777">${escapeHtml(nameInput.value||'Itilizatè')}:</small><div style="display:inline-block;background:#e6f0ff;padding:6px;border-radius:8px;margin-top:2px;">${escapeHtml(text)}</div>`; chatbox.appendChild(d); chatbox.scrollTop=chatbox.scrollHeight;}
  function showAgent(text){const d=document.createElement('div');d.style.textAlign='left';d.style.marginBottom='6px';d.innerHTML=`<small style="color:#555">Agentmeme:</small><div style="display:inline-block;background:#fff;padding:6px;border-radius:8px;border:1px solid #efefef;margin-top:2px;">${escapeHtml(text)}</div>`; chatbox.appendChild(d); chatbox.scrollTop=chatbox.scrollHeight;}
  function escapeHtml(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}





// TTS
let voicesCache=[]; 
async function loadVoices(){
  return new Promise(res=>{
    voicesCache = speechSynthesis.getVoices();
    if(voicesCache.length) return res(voicesCache);
    speechSynthesis.onvoiceschanged = () => {
      voicesCache = speechSynthesis.getVoices();
      res(voicesCache);
    };
    setTimeout(()=>{voicesCache = speechSynthesis.getVoices(); res(voicesCache);}, 1200);
  });
}

function selectVoiceForLang(lang){
  if(!voicesCache.length) voicesCache = speechSynthesis.getVoices();
  const candidates = voicesCache.filter(v => (v.lang||'').toLowerCase().includes(lang.split('-')[0]));
  return candidates[0] || voicesCache[0] || null;
}

async function speak(text, langKey){
  if(isSleeping) wakeUp();
  await loadVoices();

  const utter = new SpeechSynthesisUtterance(text);

  // Chwazi lang
  const code = LANG_CODES[langKey] || LANG_CODES['ht'];
  utter.lang = code;

  // Chwazi vwa ki pi natirèl pou lang lan
  const v = selectVoiceForLang(code);
  if(v) utter.voice = v;

  // --- AJOUTE KLARITE VWA ---
  utter.pitch = 1.2;    // pitch >1 fè vwa pi klè, natirèl
  utter.rate = 1.0;     // vitès pale nòmal, chak mo pwononse byen

  // Efè vizyèl lè Agentmeme ap pale
  imgEl.classList.add('talking');

  // Anile tout pale ki rete nan queue a
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);

  utter.onend = () => imgEl.classList.remove('talking');
}

  


  
    // 1️⃣ Chèche repons nan memwa lokal avèk tags entak
    const match=MEME_QA.find(doc=>
      doc.question &&
      (text.toLowerCase().includes(doc.question.toLowerCase())||doc.question.toLowerCase().includes(text.toLowerCase())) &&
      doc.lang===chosenLang
    );
    if(match){showAgent(match.answer); speak(match.answer,match.lang||chosenLang); animateEmotionForAnswer(match.answer); return;}

    // 2️⃣ Chèche nenpòt kesyon san lang espesifik
    const matchAny=MEME_QA.find(doc=>text.toLowerCase().includes((doc.question||'').toLowerCase()));
    if(matchAny){showAgent(matchAny.answer); speak(matchAny.answer,matchAny.lang||chosenLang); animateEmotionForAnswer(matchAny.answer); return;}

    // 3️⃣ Pa jwenn repons => repons default selon lang chwazi avèk tags
    const defaultResponses={
      ht: { answer: "Mesi paske ou poze mwen kesyon sa, domaj mwen pa konnen li men, mwen kapab aprann li.", tags: ["salutation"] },
      fr: { answer: "Merci d'avoir posé cette question, désolé je ne la connais pas encore, mais je peux l'apprendre.", tags: ["salutation"] },
      en: { answer: "Thanks for asking me this question, sorry I don't know it yet, but I can learn it.", tags: ["salutation"] },
      es: { answer: "Gracias por hacerme esta pregunta, lo siento, no la sé todavía, pero puedo aprenderla.", tags: ["salutation"] }
    };
    const fallback = defaultResponses[chosenLang] || defaultResponses['ht'];
    showAgent(fallback.answer);
    speak(fallback.answer, chosenLang);

    // 4️⃣ Voye kesyon ak lang + tags sou servèr pou aprann pita
    const newQA = { question: text, answer: fallback.answer, lang: chosenLang, tags: fallback.tags };
    socket.emit('ask', newQA);
    addSystemMessage('M ap mande servèr...');
  }

  function animateEmotionForAnswer(ans){const a=ans.toLowerCase(); if(a.includes('m pa')||a.includes('pa')||a.includes('désolé')||a.includes('sorry')){setEmotion('angry'); setTimeout(()=>setEmotion('normal'),2800);} else if(a.length<50||a.includes('!')||a.includes('😀')||a.includes('ha')){setEmotion('happy'); setTimeout(()=>setEmotion('normal'),2800);} else{setEmotion('normal');}}
  function setEmotion(e){imgEl.classList.remove('happy','angry','sleep'); imgEl.src=IMAGES.normal; if(e==='happy'){imgEl.classList.add('happy'); imgEl.src=IMAGES.happy;} else if(e==='angry'){imgEl.classList.add('angry'); imgEl.src=IMAGES.angry;} else if(e==='sleep'){imgEl.classList.add('sleep'); imgEl.src=IMAGES.sleep;} else{imgEl.src=IMAGES.normal;}}

  // Idle + mouvman 4 kwen
  function resetIdleTimer(){clearTimeout(idleTimer); if(isSleeping) wakeUp(); idleTimer=setTimeout(()=>{isSleeping=true; setEmotion('sleep'); addSystemMessage('Agentmeme dòmi (10 min inaktivite)'); moveBubbleRandomCorner();},IDLE_MS);}
  function wakeUp(){if(!isSleeping) return; isSleeping=false; setEmotion('normal'); addSystemMessage('Agentmeme reveye — m la ankò!'); resetIdleTimer();}
  function moveBubbleRandomCorner(){const positions=[{bottom:'20px',right:'20px'},{bottom:'20px',left:'20px'},{top:'20px',left:'20px'},{top:'20px',right:'20px'}]; const pos=positions[Math.floor(Math.random()*positions.length)]; bubble.style.top=pos.top||''; bubble.style.bottom=pos.bottom||''; bubble.style.left=pos.left||''; bubble.style.right=pos.right||'';}

  ['click','mousemove','keydown','touchstart'].forEach(ev=>{window.addEventListener(ev,resetIdleTimer,{passive:true});});
  langSelect.addEventListener('change',()=>{resetIdleTimer(); addSystemMessage('Lang chanje: '+langSelect.value);});

  window.Agentmeme={getMemoryCount:()=>MEME_QA.length,speakNow:(t,l)=>speak(t,l||'ht'),setLang:(l)=>{langSelect.value=l; resetIdleTimer();}};
})();
