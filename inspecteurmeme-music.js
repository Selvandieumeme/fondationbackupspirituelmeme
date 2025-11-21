(function(){
  // 🔹 Lis mizik ak URL reyèl ou bay
  const MUSIC_LIST = [
    { name: "Gemissant", url: "https://fondationbackupspirituel.com/Gemissant.mp3", keywords: ["happy", "gemissant", "mizik", "son"] }
  ];

  // 🔹 Kreye eleman audio
  const audioEl = document.createElement('audio');
  audioEl.controls = true;
  audioEl.style.width = '100%';
  audioEl.style.marginTop = '6px';

  // 🔹 Kreye bouton
  const musicBtn = document.createElement('button');
  musicBtn.textContent = '📻 Jwe mizik';
  musicBtn.className = 'secondary'; // menm style ak lòt bouton
  musicBtn.style.marginTop = '6px';
  musicBtn.style.width = '100%';
  musicBtn.style.padding = '8px';

  // 🔹 Ajoute bouton ak audio nan login panel (.left)
  const leftPanel = document.querySelector('.left');
  if(!leftPanel) return;
  leftPanel.appendChild(musicBtn);
  leftPanel.appendChild(audioEl);

  // 🔹 Fonksyon jwe mizik
  function playMusic(){
    const track = MUSIC_LIST[0]; // pou kounye a nou jwe premye mizik la
    audioEl.src = track.url;
    audioEl.play().catch(e=>console.warn('[MEME Music] Play failed:', e));
  }

  musicBtn.addEventListener('click', playMusic);

  // 🔹 Optional: kenbe mizik chwazi nan localStorage
  const savedMusic = localStorage.getItem('meme_music_url');
  if(savedMusic){
    audioEl.src = savedMusic;
  }

  audioEl.addEventListener('play', ()=>{
    localStorage.setItem('meme_music_url', audioEl.src);
  });

})();
