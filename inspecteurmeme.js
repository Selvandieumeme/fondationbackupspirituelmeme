// inspecteurmeme.js
(function() {
  console.log("👀 Inspecteur MEME client init...");

  // Socket.io client (sipoze /socket.io/socket.io.js deja entegre)
  const socket = (typeof io === 'function') ? io() : null;

  // DOM references (asire id sa yo egziste nan inspecteurmeme.html)
  const meme = document.getElementById('memeMain');
  const chatMessages = document.getElementById('chatMessages'); // si paj la genyen chatMessages
  const chatInput = document.getElementById('chatInput');       // si genyen
  const chatSend = document.getElementById('chatSend');         // si genyen

  // State
  let MEME_QA_DATA = [];
  let talking = false;
  let idleTime = 0;
  let currentCorner = 0;

  // Fonksyon ekspresyon MEME (imaj yo dwe nan repo rasin)
  function setMemeFace(face) {
    if(!meme) return;
    switch(face) {
      case 'face-front': meme.src = 'meme-front.png'; break;
      case 'face-happy':  meme.src = 'meme-happy.png'; break;
      case 'face-angry':  meme.src = 'meme-angry.png'; break;
      case 'face-sleep':  meme.src = 'meme-sleep.png'; break;
      default: meme.src = 'meme-front.png';
    }
  }

  // Kwen ekran pou deplase
  const corners = [
    { top: '10px', left: '10px' },
    { top: '10px', right: '10px' },
    { bottom: '10px', left: '10px' },
    { bottom: '10px', right: '10px' }
  ];

  function moveMeme() {
    if(!meme) return;
    if(talking) {
      const pos = corners[currentCorner];
      // netwaye style pos opposé (left/right/top/bottom) pou evite konfil
      meme.style.left = pos.left || '';
      meme.style.right = pos.right || '';
      meme.style.top = pos.top || '';
      meme.style.bottom = pos.bottom || '';
      currentCorner = (currentCorner + 1) % corners.length;
    } else {
      idleTime += 5;
      if(idleTime >= 300) setMemeFace('face-sleep');
      else setMemeFace('face-front');
    }
    setTimeout(moveMeme, 5000);
  }
  moveMeme();

  // Repons MEME (resevwa yon obj: { ht, fr, en, es, tone })
  function respond(answerObj) {
    if(!answerObj) return;
    idleTime = 0;
    talking = true;

    if(answerObj.tone === 'happy') setMemeFace('face-happy');
    else if(answerObj.tone === 'angry') setMemeFace('face-angry');
    else setMemeFace('face-front');

    // Ajoute repons nan chat (si chatMessages egziste)
    if(chatMessages) {
      ['ht','fr','en','es'].forEach(lang => {
        const text = answerObj[lang] || '';
        const div = document.createElement('div');
        div.className = 'chat-message meme-response';
        div.textContent = `MEME (${lang}): ${text}`;
        chatMessages.appendChild(div);
      });
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
      // sinon log pou debugging
      console.log('MEME response:', answerObj);
    }

    setTimeout(() => {
      talking = false;
      setMemeFace('face-front');
    }, 5000);
  }

  // Chaje MEME QA depi backend
  async function loadMEMEData() {
    try {
      const res = await fetch('/api/memeqa');
      if(!res.ok) {
        console.warn('Failed to fetch /api/memeqa', res.status);
        return;
      }
      const data = await res.json();
      // data se yon array dokiman Mongo — chak item gen .question (obj) & .answer (obj)
      MEME_QA_DATA = data.map(item => {
        // normalize si kesyon te estatik string oswa obj
        return {
          question: item.question,
          answer: item.answer
        };
      });
      console.log('✅ MEME QA loaded:', MEME_QA_DATA.length);
    } catch (err) {
      console.error('Error loadMEMEData', err);
    }
  }
  loadMEMEData();

  // Poze kesyon otomatik si pa gen moun kap pale
  setInterval(() => {
    if(talking || MEME_QA_DATA.length === 0) return;
    const idx = Math.floor(Math.random()*MEME_QA_DATA.length);
    const item = MEME_QA_DATA[idx];
    // chwazi tèks kesyon nan lang default (si question se obj, pran ht/fr/en/es)
    let q = '';
    if(item.question) {
      if(typeof item.question === 'string') q = item.question;
      else q = item.question.ht || item.question.fr || item.question.en || item.question.es || '';
    }
    if(q) respond({ ht: q, fr: q, en: q, es: q, tone: 'happy' });
  }, 15000);

  // Chat send (si eleman egziste)
  if(chatSend && chatInput) {
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', e => { if(e.key === 'Enter') sendMessage(); });
  }
  function sendMessage() {
    const msg = chatInput && chatInput.value.trim();
    if(!msg || !socket) return;
    socket.emit('user-message', { text: msg, lang: 'ht', user: 'Visitor' });
    if(chatInput) chatInput.value = '';
  }

  // Socket.io events
  if(socket) {
    socket.on('broadcast-message', data => {
      if(chatMessages) {
        const div = document.createElement('div');
        div.className = 'chat-message broadcast';
        div.textContent = `${data.from}: ${data.text}`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    });
    socket.on('meme-response', answer => {
      respond(answer);
    });
  }

  // expose for debug (optional)
  window.MEME = { respond, setMemeFace, loadMEMEData };
})();
