// ========================================
// Fichier JS FINAL – Transfert Express Haiti
// ========================================

// 1️⃣ Sélection du formulaire et du message
const formTransfert = document.getElementById('formTransfert');
const messageEl = document.getElementById('transfertMessage');

// 2️⃣ Création dynamique du bouton VALIDER
const btnValider = document.createElement('button');
btnValider.type = 'button';
btnValider.textContent = 'Valider';
btnValider.className = 'btn-primary';
btnValider.style.display = 'none';
formTransfert.appendChild(btnValider);

// ========================================
// 3️⃣ Pré-remplir les champs Agent depuis dashboard
// ========================================
window.addEventListener('DOMContentLoaded', () => {
  // On suppose que dashboard la affiche nom/email dans ces éléments
  const agentName = document.getElementById('userName')?.textContent.trim() || '';
  const agentEmail = document.getElementById('userEmail')?.textContent.trim() || '';

  const agentNameInput = document.getElementById('agentName');
  const agentEmailInput = document.getElementById('agentEmail');

  if (agentNameInput) {
    agentNameInput.value = agentName;
    agentNameInput.readOnly = true; // Empêche modification
  }

  if (agentEmailInput) {
    agentEmailInput.value = agentEmail;
    agentEmailInput.readOnly = true; // Empêche modification
  }
});

// ========================================
// 4️⃣ SUBMIT FORMULAIRE = BOUTON TRANSFERER
// ========================================
formTransfert.addEventListener('submit', async (e) => {
  e.preventDefault(); // Empêche le reload

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
    // 🔐 Étape 1 : Vérifier balance et créer transfert côté serveur
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

    // ✅ Code unique + expiration généré côté serveur
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

// ========================================
// 5️⃣ BOUTON VALIDER = CONFIRMATION FINALE
// ========================================
btnValider.addEventListener('click', async () => {
  const transfertData = {
    agentName: document.getElementById('agentName').value,
    agentEmail: document.getElementById('agentEmail').value,

    senderName: document.getElementById('senderName').value,
    senderCIN: document.getElementById('senderCIN').value,
    senderCountry: document.getElementById('senderCountry').value,
    senderAddress: document.getElementById('senderAddress').value,
    senderWhatsapp: document.getElementById('senderWhatsapp').value,

    receiverName: document.getElementById('receiverName').value,
    receiverCountry: document.getElementById('receiverCountry').value,
    receiverAddress: document.getElementById('receiverAddress').value,
    receiverWhatsapp: document.getElementById('receiverWhatsapp').value,

    transferAmount: parseFloat(document.getElementById('transferAmount').value),
    transferCurrency: document.getElementById('transferCurrency').value,
    transferCode: document.getElementById('transferCode').value,
    transferStatus: document.getElementById('transferStatus').value || 'PENDING',
    transferExpiration: document.getElementById('transferExpiration').value
  };

  try {
    const response = await fetch('/api/transfert/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transfertData)
    });

    const result = await response.json();

    if (!result.ok) {
      messageEl.style.color = 'red';
      messageEl.textContent = result.message;
      return;
    }

    messageEl.style.color = 'green';
    messageEl.textContent =
      'Transfert validé avec succès et il est en attente de retrait ✅';

    // 🔄 Reset uniquement les champs client
    [
      'senderName', 'senderCIN', 'senderCountry', 'senderAddress', 'senderWhatsapp',
      'receiverName', 'receiverCountry', 'receiverAddress', 'receiverWhatsapp',
      'transferAmount', 'transferCurrency'
    ].forEach(id => document.getElementById(id).value = '');

    btnValider.style.display = 'none';

  } catch (err) {
    messageEl.style.color = 'red';
    messageEl.textContent = 'Erreur serveur lors de la validation.';
  }
});
