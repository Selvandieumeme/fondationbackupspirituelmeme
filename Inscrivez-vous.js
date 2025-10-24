(function(){
  // Elements
  const form = document.getElementById('registerForm');
  const nom = document.getElementById('nom');
  const prenom = document.getElementById('prenom');
  const dateNaissance = document.getElementById('dateNaissance');
  const lieuNaissance = document.getElementById('lieuNaissance');
  const adresse = document.getElementById('adresse');
  const ville = document.getElementById('ville');
  const pays = document.getElementById('pays');
  const telephone = document.getElementById('telephone');
  const sexe = document.getElementById('sexe');
  const email = document.getElementById('email');
  const recovery = document.getElementById('recoveryEmail');
  const password = document.getElementById('password');
  const confirm = document.getElementById('confirmPassword');
  const submitBtn = document.getElementById('submitBtn');
  const formMessage = document.getElementById('formMessage');
  const pwMeterBar = document.getElementById('pwMeterBar');
  const pwScore = document.getElementById('pwScore');
  const togglePwd = document.getElementById('togglePwd');
  const terms = document.getElementById('terms');

  // Email validator
  function isValidEmail(v){
    try { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v); } catch(e){ return false; }
  }

  // Generic non-empty validator
  function isFilled(el){
    return el && el.value.trim().length > 0;
  }

  // Update submit button state
  function updateSubmitState(){
    const ready = isFilled(nom) && isFilled(prenom) && isFilled(dateNaissance) && isFilled(lieuNaissance)
      && isFilled(adresse) && isFilled(ville) && isFilled(pays) && isFilled(telephone) && isFilled(sexe)
      && isValidEmail(email.value) && isValidEmail(recovery.value)
      && password.value.length >= 12 && password.value === confirm.value
      && terms.checked;
    submitBtn.disabled = !ready;
  }

  // Toggle password visibility
  togglePwd.addEventListener('click', ()=>{
    const t = password.type === 'password' ? 'text' : 'password';
    password.type = t;
    togglePwd.textContent = t === 'password' ? 'Montrer' : 'Cacher';
  });

  // Password scoring
  function scorePassword(pw){
    if(window.zxcvbn){
      try{ return zxcvbn(pw).score; } catch(e){ return 0; }
    }
    let score = 0;
    if(pw.length >= 12) score++;
    if(/[A-Z]/.test(pw)) score++;
    if(/[0-9]/.test(pw)) score++;
    if(/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score,4);
  }

  // Render password meter
  function renderPwMeter(){
    const s = scorePassword(password.value);
    pwScore.textContent = `${s}/4`;
    const pct = (s/4)*100;
    pwMeterBar.style.width = pct + '%';
  }

  // Inputs list for generic validation
  const allInputs = [nom, prenom, dateNaissance, lieuNaissance, adresse, ville, pays, telephone, sexe, email, recovery, password, confirm];

  allInputs.forEach(el => {
    el.addEventListener('input', ()=>{
      const errorEl = document.getElementById(el.id+'Error');
      if(errorEl) errorEl.classList.add('hidden');
      renderPwMeter();
      updateSubmitState();
    });
  });

  // Terms checkbox
  terms.addEventListener('change', updateSubmitState);

  // Confirm password match
  confirm.addEventListener('input', ()=>{
    const err = document.getElementById('confirmError');
    if(confirm.value && confirm.value !== password.value){
      err.textContent = 'Les mots de passe ne correspondent pas.';
      err.classList.remove('hidden');
    } else {
      err.classList.add('hidden');
    }
    updateSubmitState();
  });

  // Form submission
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    formMessage.textContent = '';
    updateSubmitState();
    if(submitBtn.disabled){
      formMessage.textContent = 'Veuillez remplir correctement tous les champs.';
      formMessage.className = 'mt-3 text-sm text-red-600';
      return;
    }
    // Ici, vous pouvez ajouter la logique d'envoi du formulaire (fetch/AJAX)
    formMessage.textContent = 'Inscription réussie !';
    formMessage.className = 'mt-3 text-sm text-green-600';
  });

})();
