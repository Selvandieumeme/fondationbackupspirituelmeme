// inscriptionvip.js

document.getElementById('vip-register-form').addEventListener('submit', async function(e){
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  // simple client-side check: mot de passe confirmé
  if(formData.get('password') !== formData.get('confirmPassword')){
    document.getElementById('status').textContent = "Mot de passe non confirmé!";
    return;
  }

  document.getElementById('status').textContent = "Envoi en cours...";

  try {
    // Voye fòm nan sou API ki egziste deja (sessions)
    const res = await fetch('/api/sessions', {
      method: 'POST',
      body: formData // Pa mete headers, FormData ap otomatikman gen multipart/form-data
    });

    const data = await res.json();

    if(data.success){
      document.getElementById('status').textContent = "Inscription reçue ! En attente de validation.";
      form.reset();
    } else {
      document.getElementById('status').textContent = data.message || "Erreur d'inscription";
    }

  } catch(err){
    console.error(err);
    document.getElementById('status').textContent = "Erreur serveur";
  }
});
