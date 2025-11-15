// inscriptionvip.js

const form = document.getElementById("vip-register-form");
const status = document.getElementById("status");
const submitBtn = form.querySelector("button[type='submit']");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

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

    // ✅ Validasyon debaz
    if (!dataToSend.nom || !dataToSend.dateNaissance || !dataToSend.ville || 
        !dataToSend.pays || !dataToSend.whatsapp || !dataToSend.email || 
        !dataToSend.password || !dataToSend.confirmPassword || 
        !dataToSend.emailRecup || !dataToSend.methodePaiement || 
        !dataToSend.montant) {
        status.textContent = "❌ Tout chan yo obligatwa!";
        status.style.color = "red";
        return;
    }

    // ✅ Confirm password
    if (dataToSend.password !== dataToSend.confirmPassword) {
        status.textContent = "❌ Mot de passe non confirmé !";
        status.style.color = "red";
        return;
    }

    // ✅ Validasyon WhatsApp (egzanp: dwe sèlman chif, min 8 chif)
    if (!/^\d{8,15}$/.test(dataToSend.whatsapp.replace(/\D/g, ''))) {
        status.textContent = "❌ WhatsApp invalide (min 8 chif)";
        status.style.color = "red";
        return;
    }

    // ✅ Validasyon montant
    if (isNaN(dataToSend.montant) || dataToSend.montant <= 0) {
        status.textContent = "❌ Montant invalide (dwe plis pase 0)";
        status.style.color = "red";
        return;
    }

    // ✅ Preparasyon fetch
    status.textContent = "Envoi en cours...";
    status.style.color = "black";
    submitBtn.disabled = true;

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
            status.style.color = "green";
        } else {
            status.textContent = result.message || "Erreur d'inscription";
            status.style.color = "red";
        }

    } catch (err) {
        console.error("❌ Fetch error:", err);
        status.textContent = "Erreur serveur";
        status.style.color = "red";
    } finally {
        submitBtn.disabled = false;
    }
});
