function initTransfertExpress(container, agentEmail, agentName) {
  const form = container.querySelector("#formTransfert");
  const msg = container.querySelector("#transfertMessage");

  if (!form || !msg || !agentEmail || !agentName) {
    console.error("Formulaire ou informations Agent manquants !");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    msg.textContent = "Traitement en cours...";
    msg.style.color = "#007BFF";

    // Récupérer inputs avèk fallback vide
    const payload = {
      agentEmail,
      agentName,
      sender: {
        name: form.senderName?.value?.trim() || "",
        cin: form.senderCIN?.value?.trim() || "",
        country: form.senderCountry?.value?.trim() || "",
        address: form.senderAddress?.value?.trim() || "",
        whatsapp: form.senderWhatsapp?.value?.trim() || ""
      },
      receiver: {
        name: form.receiverName?.value?.trim() || "",
        country: form.receiverCountry?.value?.trim() || "",
        address: form.receiverAddress?.value?.trim() || "",
        whatsapp: form.receiverWhatsapp?.value?.trim() || ""
      },
      amount: parseFloat(form.transferAmount?.value),
      devise: form.devise?.value || "HTG",
      withdrawCode: generateWithdrawCode(),
      createdAt: new Date(),
      status: "pending",
      expireAt: new Date(Date.now() + 7*24*60*60*1000) // 7 jours
    };

    // Vérification de base
    if (!payload.sender.name || !payload.receiver.name || !payload.amount || payload.amount <= 0) {
      msg.textContent = "Veuillez remplir tous les champs obligatoires avec des valeurs valides.";
      msg.style.color = "red";
      return;
    }

    try {
      if (typeof createTransfert !== "function") {
        throw new Error("createTransfert non défini !");
      }

      const result = await createTransfert(payload);

      if (result?.success) {
        msg.innerHTML = `
          ✅ Transfert créé avec succès!<br>
          Statut: ${payload.status}<br>
          <strong>Code unique:</strong> ${payload.withdrawCode}<br>
          ⏳ Expiration : 7 jours
        `;
        msg.style.color = "#28a745";
        form.reset();
      } else {
        msg.textContent = result?.message || "Erreur création transfert.";
        msg.style.color = "red";
      }
    } catch (err) {
      console.error("Erreur TRANSFERT EXPRESS:", err);
      msg.textContent = "Erreur connexion API FOBAS.";
      msg.style.color = "red";
    }
  });
}

// Helpers
function generateWithdrawCode() {
  return 'WR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
