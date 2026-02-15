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
// 3️⃣ SUBMIT FORMULAIRE = BOUTON TRANSFERER
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
    // 🔐 Étape 1 : Vérifier balance agent
    const response = await fetch('/api/transfert/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentEmail, transferAmount })
    });

    const result = await response.json();

    if (!result.ok) {
      messageEl.style.color = 'red';
      messageEl.textContent = result.message;
      return;
    }

    // ✅ Génération code + expiration côté serveur
    document.getElementById('transferCode').value = result.code;
    document.getElementById('transferExpiration').value = result.expiration;

    messageEl.style.color = 'green';
    messageEl.textContent = `Code de transfert généré : ${result.code}`;

    // Affiche le bouton VALIDER
    btnValider.style.display = 'inline-block';

  } catch (err) {
    messageEl.style.color = 'red';
    messageEl.textContent = 'Erreur serveur. Veuillez réessayer.';
  }
});

// ========================================
// 4️⃣ BOUTON VALIDER = VALIDATION DÉFINITIVE
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

    // ✅ Succès final
    messageEl.style.color = 'green';
    messageEl.textContent =
      'Transfert réussi avec succès et il est en attente de retrait ✅';

    // 🔄 Reset UNIQUEMENT les champs client
    [
      'senderName',
      'senderCIN',
      'senderCountry',
      'senderAddress',
      'senderWhatsapp',
      'receiverName',
      'receiverCountry',
      'receiverAddress',
      'receiverWhatsapp',
      'transferAmount',
      'transferCurrency'
    ].forEach(id => document.getElementById(id).value = '');

    btnValider.style.display = 'none';

  } catch (err) {
    messageEl.style.color = 'red';
    messageEl.textContent = 'Erreur serveur lors de la validation.';
  }
});
