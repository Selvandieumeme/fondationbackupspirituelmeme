(function(){
  // 🔹 Lis mizik
  const MUSIC_LIST = [
    { name: "Gemissant", url: "https://fondationbackupspirituel.com/Gemissant.mp3", keywords: ["happy", "gemissant", "mizik", "son"] }
  ];

  // 🔹 Fonksyon pou kreye bouton mizik
  function addMusicButton(){
    const rowDiv = document.querySelector('.inspecteurmeme-row');
    if(!rowDiv) return false; // panel poko chaje
    if(document.getElementById('memeMusicBtn')) return true; // deja ajoute

    const musicBtn = document.createElement('button');
    musicBtn.id = 'memeMusicBtn';
    musicBtn.textContent = '📻 Jwe mizik';
    musicBtn.className = 'inspecteurmeme-btn secondary';
    musicBtn.style.marginLeft = '6px';
    musicBtn.style.cursor = 'pointer';

    // kreye eleman audio kache
    const audioEl = document.createElement('audio');
    audioEl.id = 'memeAudio';
    audioEl.controls = true;
    audioEl.style.display = 'none';
    document.body.appendChild(audioEl);

    // fonksyon jwe mizik
    musicBtn.addEventListener('click', ()=>{
      const track = MUSIC_LIST[0];
      audioEl.src = track.url;
      audioEl.play().catch(e => console.warn('[MEME Music] Play failed:', e));
      localStorage.setItem('meme_music_url', track.url);
    });

    // chaje mizik si te deja nan localStorage
    const savedMusic = localStorage.getItem('meme_music_url');
    if(savedMusic) audioEl.src = savedMusic;

    // mete bouton an nan panel, anvan bouton "Voye"
    rowDiv.insertBefore(musicBtn, rowDiv.lastElementChild);
    return true;
  }

  // 🔹 Tann panel la egziste avan nou ajoute bouton
  function waitForPanel(attempts=0){
    if(addMusicButton()) return;
    if(attempts > 20) return console.warn('[MEME Music] Panel pa jwenn apre 20 tantativ');
    setTimeout(()=> waitForPanel(attempts+1), 200); // retry chak 200ms
  }

  waitForPanel();
})();
