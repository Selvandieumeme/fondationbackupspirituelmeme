(function(){
  // 🔹 Lis mizik
  const MUSIC_LIST = [
    { name: "Gemissant", url: "https://fondationbackupspirituel.com/Gemissant.mp3", keywords: ["happy", "gemissant", "mizik", "son"] }
  ];

  // 🔹 Kreye bouton mizik
  const musicBtn = document.createElement('button');
  musicBtn.textContent = '📻 Jwe mizik';
  musicBtn.className = 'secondary'; // menm style ak lòt bouton
  musicBtn.style.marginLeft = '6px';
  musicBtn.style.cursor = 'pointer';

  // 🔹 Kreye eleman audio HTML5
  const audioEl = document.createElement('audio');
  audioEl.controls = true;
  audioEl.style.display = 'none'; // kache audio men li ka jwe
  document.body.appendChild(audioEl);

  // 🔹 Fonksyon jwe mizik
  function playMusic(){
    const track = MUSIC_LIST[0]; // nou itilize premye mizik nan lis la
    audioEl.src = track.url;
    audioEl.play().catch(e => console.warn('[MEME Music] Play failed:', e));
    localStorage.setItem('meme_music_url', track.url);
  }

  musicBtn.addEventListener('click', playMusic);

  // 🔹 Chaje mizik si te deja nan localStorage
  const savedMusic = localStorage.getItem('meme_music_url');
  if(savedMusic){
    audioEl.src = savedMusic;
  }

  // 🔹 Mete bouton an bò kote “Aktive Mikwo” nan controls
  const controlsDiv = document.querySelector('.controls');
  if(controlsDiv){
    controlsDiv.appendChild(musicBtn);
  }

})();
