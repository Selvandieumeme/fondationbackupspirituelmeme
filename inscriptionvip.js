// inscriptionvip.js

document.getElementById('vip-register-form').addEventListener('submit', async function(e){
    e.preventDefault();

    const status = document.getElementById('status');

    // Ranmase done yo nan fòm nan
    const dataToSend = {
        nom: document.querySelector('input[name="nom"]').value.trim(),
        dateNaissance: document.querySelector('input[name="dateNaissance"]').value,
        ville: document.querySelector('input[name="ville"]').value.trim(),
        pays: document.querySelector('input[name="pays"]').value.trim(),
        whatsapp: document.querySelector('input[name="whatsapp"]').value.trim(),
        email: document.querySelector('input[name="email"]').value.trim(),
        password: document.querySelector('input[name="password"]').value,
        confirmPassword: document.querySelector('input[name="confirmPassword"]').value,
        emailRecup: document.querySelector('input[name="emailRecup"]').value.trim(),
        methodePaiement: document.querySelector('select[name="methodePaiement"]').value,
        montant: document.querySelector('input[name="montant"]').value
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
