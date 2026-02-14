function initTransfertExpress(container, agentEmail) {
  const form = container.querySelector("#formTransfert");
  const msg = container.querySelector("#transfertMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    msg.textContent = "Processing...";
    msg.style.color = "#007BFF";

    // Collect form data
    const payload = {
      agentEmail,
      sender: {
        name: form.senderName.value,
        cin: form.senderCIN.value,
        country: form.senderCountry.value,
        address: form.senderAddress.value,
        whatsapp: form.senderWhatsapp.value,
        tempId: generateTempId(), // expire 5min
      },
      receiver: {
        name: form.receiverName.value,
        country: form.receiverCountry.value,
        address: form.receiverAddress.value,
        whatsapp: form.receiverWhatsapp.value,
        tempId: generateTempId(), // expire 5min
      },
      amount: parseFloat(form.transferAmount.value),
      withdrawCode: generateWithdrawCode(), // expire 7 jours
    };

    try {
      const result = await createTransfert(payload);
      if (result.success) {
        msg.textContent = "Transfert créé avec succès! Statut: Attente Retrait";
        msg.style.color = "#28a745";
        form.reset();
      } else {
        msg.textContent = "Erreur création transfert.";
        msg.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      msg.textContent = "Erreur connexion API FOBAS.";
      msg.style.color = "red";
    }
  });
}

// Helpers
function generateTempId() {
  return 'TID-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
function generateWithdrawCode() {
  return 'WR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
