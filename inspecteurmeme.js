// inspecteurmeme-fusion.js
(function(){
  console.log("👀 Inspecteur MEME client init...");

  // ==== Socket.io ====
  const socket = (typeof io === 'function') ? io() : null;

  // ==== DOM References ====
  const loginForm = document.getElementById('loginForm');
  const nameInput = document.getElementById('nameInput');
  const langSelect = document.getElementById('langSelect');
  const previewBtn = document.getElementById('previewBtn');
  const memePreview = document.getElementById('memePreview');
  const meme = document.getElementById('memeMain');
  const chatBox = document.getElementById('chatBox');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const micToggle = document.getElementById('micToggle');
  const teachMode = document.getElementById('teachMode');
  const forceJoin = document.getElementById('forceJoin');

  // ==== State ====
  let USER = { id:null, name:null, lang:'ht' };
  let MEME_QA_DATA = [];
  let talking = false;
  let idleTime = 0;
  let currentCorner = 0;
  let idleTimer = null;
  let micStream = null;
  let recognition = null;
  let speechActive = false;

  // ==== Utilities ====
  function logChat(text, cls){
    if(chatMessages){
      const d = document.createElement('div');
      d.className = 'chat-message ' + (cls||'');
      d.textContent = text;
      chatMessages.appendChild(d);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } else console.log('CHAT:', text);
  }

  function setMemeState(state){
    if(!meme) return;
    meme.className = 'meme-inspecteur';
    if(memePreview) memePreview.className = 'meme-inspecteur';
    switch(state){
      case 'walking': meme.classList.add('meme-walking'); if(memePreview) memePreview.classList.add('meme-walking'); break;
      case 'lying': meme.classList.add('meme-lying'); if(memePreview) memePreview.classList.add('meme-lying'); break;
      case 'smile': meme.classList.add('face-happy'); if(memePreview) memePreview.classList.add('face-happy'); break;
      case 'angry': meme.classList.add('face-angry'); if(memePreview) memePreview.classList.add('face-angry'); break;
      case 'sleep': meme.classList.add('face-sleep'); if(memePreview) memePreview.classList.add('face-sleep'); break;
      default: meme.classList.add('face-front'); if(memePreview) memePreview.classList.add('face-front'); break;
    }
  }

  function resetIdleTimer(){
    clearTimeout(idleTimer);
    idleTimer = setTimeout(()=> {
      if(!talking) setMemeState('lying');
    }, 300000);
  }

  resetIdleTimer();
  setMemeState('walking');

  // ==== Movement corners ====
  const corners = [
    { top:'12px', left:'12px' },
    { top:'12px', right:'12px' },
    { bottom:'12px', left:'12px' },
    { bottom:'12px', right:'12px' }
  ];

  function moveMeme(){
    try{
      if(talking){
        const pos = corners[currentCorner];
        meme.style.top = meme.style.left = meme.style.bottom = meme.style.right = '';
        for(const k in pos) meme.style[k] = pos[k];
        if(memePreview){
          memePreview.style.top = meme.style.top || '';
          memePreview.style.left = meme.style.left || '';
          memePreview.style.right = meme.style.right || '';
          memePreview.style.bottom = meme.style.bottom || '';
        }
        currentCorner = (currentCorner+1) % corners.length;
      } else {
        idleTime += 5;
        if(idleTime>=300) setMemeState('sleep');
        else setMemeState('face-front');
      }
    } catch(e){
      console.warn('moveMeme error', e);
    } finally {
      setTimeout(moveMeme, 5000);
    }
  }

  moveMeme();

  // ==== MEME Response ====
  function respond(answerObj, userLang){
    if(!answerObj) return;
    idleTime = 0;
    talking = true;

    // tone
    const tone = answerObj.tone || null;
    if(tone==='happy') setMemeState('smile');
    else if(tone==='angry') setMemeState('angry');
    else setMemeState('face-front');

    // show in chat
    const langs = ['ht','fr','en','es'];
    langs.forEach(L=>{
      const txt = answerObj[L] || (answerObj.responses && answerObj.responses[L]) || '';
      if(txt) logChat('MEME ('+L+'): '+txt);
    });

    // speak
    const speakText = (answerObj[userLang] || answerObj.en || answerObj.ht || '');
    if(speakText) speakOutLoud(speakText, userLang);

    setTimeout(()=>{ talking=false; setMemeState('face-front'); }, 4500);
  }

  function speakOutLoud(text, lang){
    try{
      if('speechSynthesis' in window){
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = (lang==='ht')?'fr-HT':(lang||'en');
        speechSynthesis.cancel();
        speechSynthesis.speak(utter);
      }
    } catch(e){ console.warn('speak error', e); }
  }

  // ==== Load MEME QA data ====
  async function loadMEMEData(){
    try{
      const res = await fetch('/api/memeqa');
      if(!res.ok) throw new Error('Fetch /api/memeqa failed');
      const data = await res.json();
      MEME_QA_DATA = data.map(item=>{
        return { question: item.question, answer: item.answer };
      });
      console.log('✅ MEME QA data loaded:', MEME_QA_DATA.length);
    } catch(err){
      console.warn('MEME QA load error', err);
    }
  }

  loadMEMEData();

  // ==== Idle auto-question ====
  setInterval(()=>{
    if(talking || MEME_QA_DATA.length===0) return;
    const idx = Math.floor(Math.random()*MEME_QA_DATA.length);
    const item = MEME_QA_DATA[idx];
    let qtext = '';
    if(item.question){
      if(typeof item.question==='string') qtext=item.question;
      else qtext=item.question[USER.lang]||item.question.ht||item.question.en||item.question.es||Object.values(item.question)[0];
    }
    if(qtext) respond({ ht:qtext, fr:qtext, en:qtext, es:qtext, tone:'happy' }, USER.lang);
  }, 15000);

  // ==== Chat send ====
  if(chatSend && chatInput){
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', e=>{ if(e.key==='Enter') sendMessage(); });
  }

  function sendMessage(){
    const msg = chatInput && chatInput.value.trim();
    if(!msg) return;

    // montre mesaj nan chat lokal
    logChat((USER.name||'Visitor') + ': ' + msg);

    // trete mesaj nan MEME menm si socket pa la
    handleIncoming({ studentId: USER.id||'local', studentName: USER.name||'Visitor', msg, lang: USER.lang });

    // si socket egziste, voye li tou
    if(socket) socket.emit('user-message', { text: msg, lang: USER.lang, user: USER.name||'Visitor', userId: USER.id });

    // netwaye chat input
    chatInput.value = '';
}



  
  // ==== Find answer locally ====
  function findAnswer(text){
    if(!MEME_QA_DATA || MEME_QA_DATA.length===0) return null;
    const t = text.toLowerCase();
    for(const item of MEME_QA_DATA){
      if(item.question){
        for(const k of Object.keys(item.question||{})){
          const q = (item.question[k]||'').toLowerCase();
          if(!q) continue;
          if(q===t || q.includes(t) || t.includes(q)) return (item.answer||item.responses);
        }
        // fallback string question
        if(typeof item.question==='string'){
          if(item.question.toLowerCase()===t || item.question.toLowerCase().includes(t)) return item.answer||item.responses;
        }
      }
    }
    return null;
  }

  // ==== Microphone ====
  if(micToggle) micToggle.addEventListener('click', async ()=>{
    if(speechActive){ stopMicrophone(); micToggle.textContent='Aktive Mikwo'; return; }
    try{
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if(SpeechRecognition){
        recognition = new SpeechRecognition();
        recognition.lang = USER.lang || 'ht';
        recognition.interimResults = false;
        recognition.continuous = true;
        recognition.maxAlternatives = 1;
        recognition.onresult = ev=>{
          const transcript = ev.results[ev.results.length-1][0].transcript.trim();
          handleIncoming({ studentId: USER.id||'local', studentName: USER.name||'Anon', msg: transcript, lang: USER.lang });
        };
        recognition.onerror = ev=>{ console.warn('SpeechRecognition error', ev); };
        recognition.onend = ()=>{ if(speechActive) try{ recognition.start(); }catch(e){console.warn(e);} };
        recognition.start();
        speechActive=true;
        micToggle.textContent='Dezaktive Mikwo';
      } else {
        micStream = await navigator.mediaDevices.getUserMedia({ audio:true });
        speechActive=true;
        micToggle.textContent='Dezaktive Mikwo';
        logChat('Mikwo aktive (pa gen rekonesans otomatik nan navigatè sa)');
      }
    } catch(err){
      console.warn('Mikwo pa disponib', err);
      alert('Mikwo pa disponib oswa pèmisyon refize.');
    }
  });

  function stopMicrophone(){
    speechActive=false;
    if(recognition){ try{ recognition.stop(); }catch(e){} recognition=null; }
    if(micStream){ micStream.getTracks().forEach(t=>t.stop()); micStream=null; }
  }

  function handleIncoming(data){
    talking=true; idleTime=0; resetIdleTimer(); setMemeState('walking');
    if(socket) socket.emit('muteAllExcept', data.studentId);
    logChat(data.studentName+': '+data.msg);
    const ans=findAnswer(data.msg);
    if(ans) respond(ans,data.lang||USER.lang);
    else respond({
      ht:'M pa genyen repons sa kounye a, men mwen ka aprann li.',
      fr:'Je n’ai pas encore cette réponse, mais je peux l’apprendre.',
      en:'I don’t have that answer yet, but I can learn it.',
      es:'No tengo esa respuesta todavía, pero puedo aprenderla.',
      tone:'front'
    }, data.lang||USER.lang);
  }

  // ==== Login ====
  if(loginForm) loginForm.addEventListener('submit', ev=>{
    ev.preventDefault();
    USER.name=nameInput.value.trim()||'Anon';
    USER.lang=langSelect.value||'ht';
    USER.id='user_'+Date.now();
    if(socket) socket.emit('joinClassroom',{ user: USER.name, userId: USER.id, lang: USER.lang });
    if(socket) socket.emit('joinClassroom',{ user:'MEME', userId:'MEME_0', lang:'ht' });
    logChat('SYSTEM: '+USER.name+' joined the class.');
    respond({ ht:'BIENVENUE', fr:'BIENVENUE', en:'WELCOME', es:'BIENVENUE', tone:'happy' }, USER.lang);
    chatInput && chatInput.focus();
  });

  // ==== Preview button ====
  if(previewBtn) previewBtn.addEventListener('click', ()=>{ setMemeState('smile'); setTimeout(()=>setMemeState('face-front'),2000); });

  // ==== Force join ====
  if(forceJoin) forceJoin.addEventListener('click', ()=>{
    if(socket) socket.emit('joinClassroom',{ user:'MEME', userId:'MEME_0', lang:'ht' });
    logChat('SYSTEM: MEME forced to join (test).');
    setMemeState('walking');
  });

  // ==== Teach mode ====
  if(teachMode) teachMode.addEventListener('click', ()=>{
    if(teachMode.dataset.on==='1'){
      teachMode.dataset.on='0'; teachMode.textContent='Mòd Pwofesè';
    } else {
      teachMode.dataset.on='1'; teachMode.textContent='Mòd Pwofesè (ON)';
      if(MEME_QA_DATA && MEME_QA_DATA.length){
        const idx=Math.floor(Math.random()*MEME_QA_DATA.length);
        const it=MEME_QA_DATA[idx];
        const q=it.questions?(it.questions[USER.lang]||Object.values(it.questions)[0]):(it.question||'');
        respond({ ht:q, fr:q, en:q, es:q, tone:'happy' }, USER.lang);
      }
    }
  });

  // ==== Socket events ====
  if(socket){
    socket.on('meme-response', data=>{ respond(data, USER.lang); });
    socket.on('broadcast-message', m=>{ logChat(m.from+': '+m.text); });
  }

  // ==== On unload ====
  window.addEventListener('beforeunload', ()=>{
    stopMicrophone();
    if(socket) socket.emit('leaveClassroom',{ userId: USER.id });
  });

  // ==== expose ====
  window.MEME = { respond, setMemeState, loadMEMEData, handleIncoming };
})();
