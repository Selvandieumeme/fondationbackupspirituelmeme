// ========================================
// Fichier JS FINAL – Transfert Express Haiti
// ========================================

// 1️⃣ Sélection du formulaire et du message
const formTransfert = document.getElementById('formTransfert');
const messageEl = document.getElementById('transfertMessage');

// ========================================
// 2️⃣ Pré-remplir les champs Agent depuis dashboard
// ========================================
window.addEventListener('DOMContentLoaded', () => {
  // Supposons que dashboard la mete data agent la nan <span id="agentNameDashboard"> ak <span id="agentEmailDashboard">
  const agentNameField = document.getElementById('agentName');
  const agentEmailField = document.getElementById('agentEmail');

  const agentName = document.getElementById('agentNameDashboard')?.textContent || '';
  const agentEmail = document.getElementById('agentEmailDashboard')?.textContent || '';

  if (agentNameField) {
    agentNameField.value = agentName;
    agentNameField.readOnly = true; // empêche modification
  }

  if (agentEmailField) {
    agentEmailField.value = agentEmail;
    agentEmailField.readOnly = true; // empêche modification
  }
});

// ========================================
// 3️⃣ SUBMIT FORMULAIRE = BOUTON TRANSFERER
// ========================================
formTransfert.addEventListener('submit', async (e) => {
  e.preventDefault(); // Empêche reload

  messageEl.textContent = '';
  messageEl.style.color = '';

  const agentEmail = document.getElementById('agentEmail').value;
  const transferAmount = parseFloat(document.getElementById('transferAmount').value);

  if (!agentEmail || !transferAmount || transferAmount <= 0) {
    messageEl.style.color = 'red';
    messageEl.textContent = 'Montant ou email agent invalide.';
    return;
  }

  try {
    // 🔐 Vérifier balance et créer transfert côté serveur
    const response = await fetch('/api/transfert/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentName: document.getElementById('agentName').value,
        agentEmail,
        senderName: document.getElementById('senderName').value,
        senderCIN: document.getElementById('senderCIN').value,
        senderCountry: document.getElementById('senderCountry').value,
        senderAddress: document.getElementById('senderAddress').value,
        senderWhatsapp: document.getElementById('senderWhatsapp').value,
        receiverName: document.getElementById('receiverName').value,
        receiverCountry: document.getElementById('receiverCountry').value,
        receiverAddress: document.getElementById('receiverAddress').value,
        receiverWhatsapp: document.getElementById('receiverWhatsapp').value,
        transferAmount: transferAmount,
        transferCurrency: document.getElementById('transferCurrency').value
      })
    });

    const result = await response.json();

    if (!result.ok) {
      messageEl.style.color = 'red';
      messageEl.textContent = result.message;
      return;
    }

    // ✅ Succès final et code généré
    document.getElementById('transferCode').value = result.transferCode;
    document.getElementById('transferExpiration').value = result.transferExpiration;
    document.getElementById('transferStatus').value = 'PENDING';

    messageEl.style.color = 'green';
    messageEl.textContent = `Transfert réussi avec succès et il est en attente de retrait ✅
Code de transfert : ${result.transferCode}
Expiration : ${result.transferExpiration}`;

    // 🔄 Reset uniquement les champs client
    [
      'senderName', 'senderCIN', 'senderCountry', 'senderAddress', 'senderWhatsapp',
      'receiverName', 'receiverCountry', 'receiverAddress', 'receiverWhatsapp',
      'transferAmount', 'transferCurrency'
    ].forEach(id => document.getElementById(id).value = '');

  } catch (err) {
    messageEl.style.color = 'red';
    messageEl.textContent = 'Erreur serveur lors de la création du transfert.';
  }
});
