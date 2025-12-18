// ------------------- Dashboard JS Final Konpatib -------------------
const historyBox = document.getElementById('history');
const formArea = document.getElementById('formArea');
const socket = io('https://examen-backend-ihlx.onrender.com'); // Socket.io backend

// Formatter montant en Gourdes
function formatGourdes(amount) {
  return Number(amount).toFixed(2);
}

// WhatsApp notification admin
function sendWhatsAppNotification(message) {
  const adminNumber = "50946057952";
  const url = "https://wa.me/" + adminNumber + "?text=" + encodeURIComponent(message);
  window.open(url, "_blank");
}

// Charger dashboard
async function loadDashboard() {
  try {
    // Chaje done itilizate a depi localStorage
    const user = JSON.parse(localStorage.getItem('walletUser'));
    if (!user) throw new Error("Itilizate pa defini nan localStorage");

    // Mete done nan dashboard
    document.getElementById('userName').textContent = user.fullName;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('balanceActuel').textContent = formatGourdes(user.balance || 0);
    document.getElementById('bonusActuel').textContent = formatGourdes(user.bonus || 0);

    // Chaje istwa si gen nan backend
    const res = await fetch(`https://examen-backend-ihlx.onrender.com/api/wallet/history?email=${encodeURIComponent(user.email)}`);
    const data = await res.json();
    historyBox.innerHTML = '';
    data.tx?.forEach(t => addHistory(t));
  } catch (e) {
    console.error('Erreur chargement dashboard:', e);
  }
}

// Ajouter un historique
function addHistory(t) {
  const div = document.createElement('div');
  div.className = 'item';
  div.innerHTML = `<b>${t.type.toUpperCase()}</b> | ${formatGourdes(t.amount)} Gourdes <br>
    Statut: <span class="${t.status === 'PENDING' ? 'pending' : 'active'}">${t.status}</span>`;
  historyBox.prepend(div);
}

// Afficher foms selon bouton menu
function showForm(type) {
  formArea.innerHTML = '';
  const user = JSON.parse(localStorage.getItem('walletUser'));
  if (!user) return;

  if (type === 'deposit' || type === 'withdraw' || type === 'bonus') {
    let label = type === 'deposit' ? 'Dépôt' : type === 'withdraw' ? 'Retrait' : 'Bonus';
    formArea.innerHTML = `
      <h3>${label} Wallet</h3>
      <input placeholder="WhatsApp" id="whatsapp" value="${user.whatsapp || ''}" />
      <input placeholder="Pays" id="country" />
      <input type="number" placeholder="Montant" id="amount" />
      <select id="method">
        <option>Moncash</option><option>Natcash</option>
        <option>Zelle</option><option>WU</option>
        <option>Paypal</option><option>Carte de crédit</option>
      </select>
      <button class="submit" onclick="submitAction('${type}')">${label}</button>`;
  }

  if (type === 'transfer') {
    formArea.innerHTML = `
      <h3>Transfert Wallet</h3>
      <input placeholder="Email destinataire" id="receiver" />
      <input type="number" placeholder="Montant" id="amount" />
      <button class="submit" onclick="submitTransfer()">Transférer</button>`;
  }

  if (type === 'changepass') {
    formArea.innerHTML = `
      <h3>Changer mot de passe</h3>
      <input type="password" placeholder="Nouveau mot de passe" id="newPass" />
      <input type="password" placeholder="Confirmer mot de passe" id="confirmPass" />
      <button class="submit" onclick="submitChangePass()">Modifier</button>`;
  }
}

// Soumettre Déposer / Retirer / Bonus
async function submitAction(type) {
  const whatsappInput = document.getElementById('whatsapp');
  const countryInput = document.getElementById('country');
  const amountInput = document.getElementById('amount');
  const methodSelect = document.getElementById('method');

  const body = {
    whatsapp: whatsappInput?.value || '',
    country: countryInput?.value || '',
    amount: Number(amountInput?.value),
    method: type === 'bonus' ? 'Bonus' : methodSelect?.value
  };

  try {
    const user = JSON.parse(localStorage.getItem('walletUser'));
    const res = await fetch(`https://examen-backend-ihlx.onrender.com/api/wallet/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, email: user.email })
    });
    const data = await res.json();
    if (res.ok) {
      loadDashboard();
      const actionLabel = type === 'deposit' ? 'DEPOT' : type === 'withdraw' ? 'RETRAIT' : 'BONUS';
      const message =
        `🔔 WALLET FOBAS - ${actionLabel}\n\nNom: ${user.fullName}\nEmail: ${user.email}\nMontant: ${Number(amountInput.value).toFixed(2)} Gourdes\nWhatsApp: ${body.whatsapp}\nPays: ${body.country}\nStatut: PENDING`;
      sendWhatsAppNotification(message);
      alert(data.message || 'Action envoyée');
    } else alert(data.message);
  } catch (e) {
    console.error('Erreur submitAction:', e);
  }
}

// Soumettre Transfert
async function submitTransfer() {
  const receiverInput = document.getElementById('receiver');
  const amountInput = document.getElementById('amount');
  const user = JSON.parse(localStorage.getItem('walletUser'));

  const body = {
    receiverEmail: receiverInput?.value,
    amount: Number(amountInput?.value),
    senderEmail: user.email
  };

  try {
    const res = await fetch('https://examen-backend-ihlx.onrender.com/api/wallet/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      loadDashboard();
      const message =
        `🔔 WALLET FOBAS - TRANSFERT\n\nExpéditeur: ${user.email}\nDestinataire: ${receiverInput.value}\nMontant: ${Number(amountInput.value).toFixed(2)} Gourdes\nStatut: ACTIVE`;
      sendWhatsAppNotification(message);
      alert(data.message);
    } else alert(data.message);
  } catch (e) {
    console.error('Erreur submitTransfer:', e);
  }
}

// Soumettre Changer mot de passe
async function submitChangePass() {
  const newPassInput = document.getElementById('newPass');
  const confirmPassInput = document.getElementById('confirmPass');

  if (!newPassInput?.value || !confirmPassInput?.value) {
    alert('Veuillez remplir tous les champs.');
    return;
  }
  if (newPassInput.value !== confirmPassInput.value) {
    alert('Les mots de passe ne correspondent pas.');
    return;
  }

  try {
    const res = await fetch('https://examen-backend-ihlx.onrender.com/api/wallet/changepassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: newPassInput.value })
    });
    const data = await res.json();
    if (res.ok) {
      alert('Mot de passe modifié avec succès');
      formArea.innerHTML = '';
    } else alert(data.message);
  } catch (e) {
    console.error('Erreur submitChangePass:', e);
  }
}

// Logout
function logout() {
  localStorage.removeItem('walletUser');
  window.location.href = '/login';
}

// Socket.io updates realtime
socket.on('wallet-update', () => loadDashboard());

// Initial dashboard load
loadDashboard();







document.getElementById("depositBtn").onclick = () => showForm("deposit");
document.getElementById("withdrawBtn").onclick = () => showForm("withdraw");
document.getElementById("transferBtn").onclick = () => showForm("transfer");
document.getElementById("bonusBtn").onclick = () => showForm("bonus");
document.getElementById("changePassBtn").onclick = () => showForm("changepass");
