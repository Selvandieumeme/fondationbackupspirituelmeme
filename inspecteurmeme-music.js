/* ============================================
   inspecteurmeme-music.js — vèsyon entèraktif
   MEME ka jwe mizik lè itilizatè mande nan chat
   Totalman endepandan: pa afekte TTS/STT/chat/emotions
   ============================================ */
(function(){
  // 1️⃣ Lis mizik (URL mp3 oswa folder lokal)
  const MUSIC_LIST = [
    { name: "Happy Tune", url: "https://www.example.com/music/happy.mp3", keywords: ["happy", "joy", "bonjou"] },
    { name: "Relaxing Beat", url: "https://www.example.com/music/relax.mp3", keywords: ["relax", "detann", "calm"] },
    { name: "Motivation", url: "https://www.example.com/music/motivation.mp3", keywords: ["motivation", "anpil enèji", "work"] }
  ];

  // 2️⃣ Eleman <audio>
  const audioEl = document.createElement('audio');
  audioEl.controls = true; 
  audioEl.style.width = '100%';
  audioEl.style.marginTop = '6px';

  // 3️⃣ Mete bouton + dropdown nan panel MEME
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
    MUSIC_LIST.forEach((m, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = m.name;
      selectEl.appendChild(opt);
    });
    panel.appendChild(selectEl);
    panel.appendChild(audioEl);

    // 4️⃣ Chaje mizik nan localStorage si genyen
    const savedIndex = localStorage.getItem('meme_music_index');
    if(savedIndex !== null && MUSIC_LIST[savedIndex]){
      selectEl.value = savedIndex;
      audioEl.src = MUSIC_LIST[savedIndex].url;
    }

    // 5️⃣ Event bouton pou jwe mizik
    musicBtn.addEventListener('click', () => {
      playSelectedMusic();
    });

    // 6️⃣ Event chanjman select
    selectEl.addEventListener('change', () => {
      const idx = parseInt(selectEl.value,10);
      if(MUSIC_LIST[idx]){
        audioEl.src = MUSIC_LIST[idx].url;
        localStorage.setItem('meme_music_index', idx);
      }
    });
  }

  // 🔹 Fonksyon pou jwe mizik chwazi a
  function playSelectedMusic(){
    const idx = parseInt(selectEl.value,10);
    if(MUSIC_LIST[idx]){
      audioEl.src = MUSIC_LIST[idx].url;
      audioEl.play().catch(e => console.warn('[MEME Music] Play failed:', e));
      localStorage.setItem('meme_music_index', idx);
    }
  }

  // 🔹 Fonksyon pou entèraksyon chat
  function handleChatForMusic(msg){
    if(!msg) return;
    const text = msg.toLowerCase();
    for(let i=0;i<MUSIC_LIST.length;i++){
      const track = MUSIC_LIST[i];
      for(const kw of track.keywords){
        if(text.includes(kw.toLowerCase())){
          selectEl.value = i;
          playSelectedMusic();
          console.debug('[MEME Music] Jwe mizik otomatikman:', track.name);
          return true; // jwenn mizik
        }
      }
    }
    return false;
  }

  // 🔹 Hook nan chat si window.inspecteurmeme egziste
  if(window.inspecteurmeme){
    const origHandle = window.inspecteurmeme._originalHandleQuestion || window.inspecteurmeme.handleQuestion;
    if(origHandle){
      // redefine handleQuestion san modifye fonksyonalite ekzistan
      window.inspecteurmeme._originalHandleQuestion = origHandle;
      window.inspecteurmeme.handleQuestion = function(text){
        handleChatForMusic(text); // otomatik mizik si matche
        origHandle(text); // rele fonksyon MEME egzistan
      }
    }
  }

})();
