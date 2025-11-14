// inscriptionvip.js
document.getElementById('vip-register-form').addEventListener('submit', async function(e){
    e.preventDefault();
    const status = document.getElementById('status');

    const form = e.target;

    // Ranmase done yo
    const dataToSend = {
        nom: form.nom.value.trim(),
        dateNaissance: form.dateNaissance.value,
        ville: form.ville.value.trim(),
        pays: form.pays.value.trim(),
        whatsapp: form.whatsapp.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value,
        confirmPassword: form.confirmPassword.value,
        emailRecup: form.emailRecup.value.trim(),
        methodePaiement: form.methodePaiement.value,
        montant: Number(form.montant.value)
    };

    // Verifye password
    if(dataToSend.password !== dataToSend.confirmPassword){
        status.textContent = "Mot de passe non confirmé !";
        return;
    }

    status.textContent = "Envoi en cours...";

    try {
        const res = await fetch('http://localhost:4000/api/sessions', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataToSend)
});
        const result = await res.json();

        if(result.success){
            status.textContent = result.message;
            form.reset();
        } else {
            status.textContent = result.message || "Erreur d'inscription";
        }

    } catch(err){
        console.error(err);
        status.textContent = "Erreur serveur";
    }
});
