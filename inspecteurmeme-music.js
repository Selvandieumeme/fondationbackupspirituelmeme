(function(){
  const MUSIC_LIST = [
    { name: "Gemissant", url: "https://fondationbackupspirituel.com/Gemissant.mp3", keywords: ["happy", "gemissant", "mizik", "son"] }
  ];

  const audioEl = document.createElement('audio');
  audioEl.controls = true;
  audioEl.style.width = '100%';
  audioEl.style.marginTop = '6px';

  const panel = document.getElementById('inspecteurmeme-panel');
  if(!panel) return;

  // Bouton jwe mizik
  const musicBtn = document.createElement('button');
  musicBtn.textContent = '📻 Jwe mizik';
  musicBtn.style.marginTop = '6px';
  musicBtn.className = 'inspecteurmeme-btn secondary';
  panel.appendChild(musicBtn);

  // Dropdown seleksyon (pou ka elaji plis mizik pita)
  const selectEl = document.createElement('select');
  selectEl.style.width = '100%';
  selectEl.style.marginTop = '6px';
  MUSIC_LIST.forEach((m,i)=>{
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = m.name;
    selectEl.appendChild(opt);
  });
  panel.appendChild(selectEl);
  panel.appendChild(audioEl);

  // Chaje mizik nan localStorage si genyen
  const savedIndex = localStorage.getItem('meme_music_index');
  if(savedIndex !== null && MUSIC_LIST[savedIndex]){
    selectEl.value = savedIndex;
    audioEl.src = MUSIC_LIST[savedIndex].url;
  }

  function playSelectedMusic(){
    const idx = parseInt(selectEl.value,10);
    if(MUSIC_LIST[idx]){
      audioEl.src = MUSIC_LIST[idx].url;
      audioEl.play().catch(e=>console.warn('[MEME Music] Play failed:', e));
      localStorage.setItem('meme_music_index', idx);
    }
  }

  musicBtn.addEventListener('click', playSelectedMusic);
  selectEl.addEventListener('change', ()=>playSelectedMusic());

  // 🔹 Obsevatè sou chat MEME nan stage la
  const chatMessages = document.getElementById('chatMessages'); 
  if(chatMessages){
    const observer = new MutationObserver(mutations=>{
      for(const m of mutations){
        for(const node of m.addedNodes){
          if(node.nodeType===1 && node.classList.contains('chat-message')){
            const text = node.textContent.toLowerCase();
            for(const [i, track] of MUSIC_LIST.entries()){
              if(track.keywords.some(k=>text.includes(k.toLowerCase()))){
                selectEl.value = i;
                playSelectedMusic();
                console.debug('[MEME Music] Jwe mizik otomatik:', track.name);
                return;
              }
            }
          }
        }
      }
    });
    observer.observe(chatMessages, { childList:true });
  }

})();
