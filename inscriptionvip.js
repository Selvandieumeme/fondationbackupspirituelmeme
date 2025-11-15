document.getElementById("vip-register-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const status = document.getElementById("status");
    const form = e.target;

    // Ranmase done yo
    const dataToSend = {
        nom: form.nom.value.trim(),
        dateNaissance: form.dateNaissance.value ? new Date(form.dateNaissance.value) : null,
        ville: form.ville.value.trim(),
        pays: form.pays.value.trim(),
        whatsapp: form.whatsapp.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value,  // pa gen chifreman
        emailRecup: form.emailRecup.value.trim(),
        methodePaiement: form.methodePaiement.value,
        montant: Number(form.montant.value)
    };

    // Confirm password
    if (form.password.value !== form.confirmPassword.value) {
        status.textContent = "Mot de passe non confirmé !";
        return;
    }

    status.textContent = "Envoi en cours...";

    try {
        const response = await fetch(
            "https://fondationbackupspirituelmeme-vip.vercel.app/api/sessions",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend)
            }
        );

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            form.reset();
            status.textContent = "Inscription réussie 🎉";
        } else {
            status.textContent = result.message || "Erreur d'inscription";
        }

    } catch (err) {
        console.error("❌ Fetch error:", err);
        status.textContent = "Erreur serveur";
    }
});
