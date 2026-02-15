// Fichier JS pou "Transfert Express Haiti"

// 1️⃣ Chwazi fòm ak mesaj
const formTransfert = document.getElementById('formTransfert');
const messageEl = document.getElementById('transfertMessage');

// 2️⃣ Evènman sou submit fòm nan
formTransfert.addEventListener('submit', async (e) => {
  e.preventDefault(); // anpeche reload paj la

  // 3️⃣ Pran tout done yo
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
    transferCode: document.getElementById('transferCode').value || generateUniqueCode(),
    transferStatus: document.getElementById('transferStatus').value,
    transferExpiration: document.getElementById('transferExpiration').value || calculateExpiration()
  };

  // 4️⃣ Voye done yo nan backend san kraze dashboard
  try {
    const response = await fetch('/api/transfert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transfertData)
    });

    const result = await response.json();

    if (response.ok) {
      messageEl.style.color = 'green';
      messageEl.textContent = 'Transfert effectué avec succès ✅';
      formTransfert.reset(); // reset fòm nan pou nouvo antre
    } else {
      messageEl.style.color = 'red';
      messageEl.textContent = `Erreur : ${result.message}`;
    }

  } catch (err) {
    messageEl.style.color = 'red';
    messageEl.textContent = `Erreur serveur : ${err.message}`;
  }
});

// 5️⃣ Fonksyon pou jenere code inik
function generateUniqueCode() {
  return 'TX-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// 6️⃣ Fonksyon pou kalkile dat ekspirasyon 7 jou
function calculateExpiration() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0]; // fòm YYYY-MM-DD
}
