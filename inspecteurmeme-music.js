(function(){
  const MUSIC_LIST = [
    { name: "Happy Tune", url: "https://www.example.com/music/happy.mp3", keywords: ["happy", "joy", "bonjou"] },
    { name: "Relaxing Beat", url: "https://www.example.com/music/relax.mp3", keywords: ["relax", "detann", "calm"] },
    { name: "Motivation", url: "https://www.example.com/music/motivation.mp3", keywords: ["motivation", "anpil enèji", "work"] }
  ];

  const audioEl = document.createElement('audio');
  audioEl.controls = true;
  audioEl.style.width = '100%';
  audioEl.style.marginTop = '6px';

  const panel = document.getElementById('inspecteurmeme-panel');
  if(panel){
    const musicBtn = document.createElement('button');
    musicBtn.textContent = '📻 Jwe mizik';
    musicBtn.style.marginTop = '6px';
    musicBtn.className = 'inspecteurmeme-btn secondary';
    panel.appendChild(musicBtn);

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

    // chaje mizik ki nan localStorage
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
    selectEl.addEventListener('change', ()=>{
      const idx = parseInt(selectEl.value,10);
      if(MUSIC_LIST[idx]){
        audioEl.src = MUSIC_LIST[idx].url;
        localStorage.setItem('meme_music_index', idx);
      }
    });

    // 🔹 OBSERVATEUR sou chat input / send button
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    if(chatInput && chatSend){
      chatSend.addEventListener('click', ()=>{
        const text = chatInput.value.toLowerCase();
        for(const [i, track] of MUSIC_LIST.entries()){
          if(track.keywords.some(k => text.includes(k.toLowerCase()))){
            selectEl.value = i;
            playSelectedMusic();
            break;
          }
        }
      });
      chatInput.addEventListener('keydown', (e)=>{
        if(e.key==='Enter' && !e.shiftKey){
          const text = chatInput.value.toLowerCase();
          for(const [i, track] of MUSIC_LIST.entries()){
            if(track.keywords.some(k => text.includes(k.toLowerCase()))){
              selectEl.value = i;
              playSelectedMusic();
              break;
            }
          }
        }
      });
    }

  }
})();
