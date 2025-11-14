// inscriptionvip.js

document.getElementById('vip-register-form').addEventListener('submit', async function(e){
    e.preventDefault();

    const status = document.getElementById('status');

    // Ranmase done yo ak JSON
    const dataToSend = {
        fullname: document.querySelector('input[name="fullname"]').value.trim(),
        email: document.querySelector('input[name="email"]').value.trim(),
        password: document.querySelector('input[name="password"]').value,
        confirmPassword: document.querySelector('input[name="confirmPassword"]').value,
        phone: document.querySelector('input[name="phone"]').value.trim(),
        country: document.querySelector('input[name="country"]').value.trim()
    };

    // Verifye mot de passe
    if(dataToSend.password !== dataToSend.confirmPassword){
        status.textContent = "Mot de passe non confirmé !";
        return;
    }

    status.textContent = "Envoi en cours...";

    try {
        const res = await fetch('/api/sessions', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSend)
        });

        const result = await res.json();

        if(result.success){
            status.textContent = "Inscription reçue ! En attente de validation.";
            document.getElementById('vip-register-form').reset();
        } else {
            status.textContent = result.message || "Erreur d'inscription";
        }
    }
    catch(err){
        console.error(err);
        status.textContent = "Erreur serveur";
    }
});
