/* ============================================
   inspecteurmeme-music.js
   Modil mizik endepandan pou MEME
   Totalman separe: pa afekte TTS/STT/chat/emotions
   ============================================ */
(function(){
  // 1️⃣ Lis mizik (URL mp3 oswa local folder)
  const MUSIC_LIST = [
    { name: "Happy Tune", url: "https://www.example.com/music/happy.mp3" },
    { name: "Relaxing Beat", url: "https://www.example.com/music/relax.mp3" },
    { name: "Motivation", url: "https://www.example.com/music/motivation.mp3" }
  ];

  // 2️⃣ Kreye eleman <audio> HTML5
  const audioEl = document.createElement('audio');
  audioEl.controls = true; 
  audioEl.style.width = '100%';
  audioEl.style.marginTop = '6px';

  // 3️⃣ Mete bouton "📻 Jwe mizik" nan panel MEME si li egziste
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

    // 4️⃣ Chaje mizik ki nan localStorage si genyen
    const savedIndex = localStorage.getItem('meme_music_index');
    if(savedIndex !== null && MUSIC_LIST[savedIndex]){
      selectEl.value = savedIndex;
      audioEl.src = MUSIC_LIST[savedIndex].url;
    }

    // 5️⃣ Event bouton pou jwe mizik
    musicBtn.addEventListener('click', () => {
      const idx = parseInt(selectEl.value,10);
      if(MUSIC_LIST[idx]){
        audioEl.src = MUSIC_LIST[idx].url;
        audioEl.play().catch(e => console.warn('[MEME Music] Play failed:', e));
        localStorage.setItem('meme_music_index', idx);
      }
    });

    // 6️⃣ Event chanjman nan select (chaje men pa jwe otomatik)
    selectEl.addEventListener('change', () => {
      const idx = parseInt(selectEl.value,10);
      if(MUSIC_LIST[idx]){
        audioEl.src = MUSIC_LIST[idx].url;
        localStorage.setItem('meme_music_index', idx);
      }
    });
  }
})();
