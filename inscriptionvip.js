document.getElementById('vip-register-form').addEventListener('submit', async function(e){
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  
  // simple client-side check
  if(formData.get('password') !== formData.get('confirmPassword')){
    document.getElementById('status').textContent = "Mot de passe non confirmé!";
    return;
  }

  document.getElementById('status').textContent = "Envoi en cours...";

  try{
    const res = await fetch('/api/vip/register', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if(data.success){
      document.getElementById('status').textContent = "Inscription reçue ! En attente de validation.";
      form.reset();
    } else {
      document.getElementById('status').textContent = data.message || "Erreur d'inscription";
    }
  }catch(err){
    console.error(err);
    document.getElementById('status').textContent = "Erreur serveur";
  }
});
