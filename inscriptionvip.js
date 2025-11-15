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
    const response = await fetch(
      "https://unconscionably-hexameral-margot.ngrok-free.dev/api/sessions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      }
    );

    const result = await response.json();

    if (result.success) {
      alert(result.message); // Inscription reussie 🎉
      form.reset();
    } else {
      alert("Erreur: " + result.message);
    }
  } catch (err) {
    console.error("❌ Fetch error:", err);
    alert("Erreur serveur, réessayez plus tard.");
  }
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
