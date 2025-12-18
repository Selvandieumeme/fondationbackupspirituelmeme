const historyBox = document.getElementById('history');
const formArea = document.getElementById('formArea');
const socket = io('https://examen-backend-ihlx.onrender.com'); // Socket.io backend

// ✅ Formatter montant en Gourdes
function formatGourdes(amount) {
  return Number(amount).toFixed(2);
}

// ✅ WhatsApp notification admin
function sendWhatsAppNotification(message) {
  const adminNumber = "50946057952";
  const url = "https://wa.me/" + adminNumber + "?text=" + encodeURIComponent(message);
  window.open(url, "_blank");
}

// ✅ Charger dashboard
async function loadDashboard() {
  try {
    const res = await fetch('https://examen-backend-ihlx.onrender.com/api/wallet/dashboard', {
      credentials: 'include'
    });
    const data = await res.json();

    const balanceValue = Number(data.wallet.balance) || 0;
    const bonusValue = Number(data.wallet.bonus) || 0;

    document.getElementById('userName').textContent = data.wallet.fullName;
    document.getElementById('userEmail').textContent = data.wallet.email;
    document.getElementById('balanceActuel').textContent = formatGourdes(balanceValue);
    document.getElementById('bonusActuel').textContent = formatGourdes(bonusValue);

    historyBox.innerHTML = '';
    data.tx.forEach(t => addHistory(t));

  } catch (e) {
    console.error('Erreur chargement dashboard:', e);
  }
}

// ✅ Ajouter un historique
function addHistory(t) {
  const div = document.createElement('div');
  div.className = 'item';
  div.innerHTML = `<b>${t.type.toUpperCase()}</b> | ${formatGourdes(t.amount)} Gourdes <br>
    Statut: <span class="${t.status === 'PENDING' ? 'pending' : 'active'}">${t.status}</span>`;
  historyBox.prepend(div);
}

// ✅ Afficher foms selon bouton menu
function showForm(type) {
  if (type === 'deposit' || type === 'withdraw' || type === 'bonus') {
    let label = type === 'deposit' ? 'Dépôt' : type === 'withdraw' ? 'Retrait' : 'Bonus';
    formArea.innerHTML = `
      <h3>${label} Wallet</h3>
      <input placeholder="WhatsApp" id="whatsapp" />
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

// ✅ Soumettre Déposer / Retirer / Bonus
async function submitAction(type) {
  const body = {
    whatsapp: whatsapp.value || '',
    country: country.value || '',
    amount: Number(amount.value),
    method: type === 'bonus' ? 'Bonus' : method.value
  };
  try {
    const res = await fetch(`https://examen-backend-ihlx.onrender.com/api/wallet/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      loadDashboard();

      const actionLabel = type === 'deposit' ? 'DEPOT' : type === 'withdraw' ? 'RETRAIT' : 'BONUS';
      const message =
        "🔔 WALLET FOBAS - " + actionLabel + "\n\n" +
        "Nom: " + document.getElementById('userName').textContent + "\n" +
        "Email: " + document.getElementById('userEmail').textContent + "\n" +
        "Montant: " + Number(amount.value).toFixed(2) + " Gourdes\n" +
        "WhatsApp: " + whatsapp.value + "\n" +
        "Pays: " + country.value + "\n" +
        "Statut: PENDING";

      sendWhatsAppNotification(message);

      alert(data.message || 'Action envoyée');
    } else alert(data.message);
  } catch (e) {
    console.error('Erreur submitAction:', e);
  }
}

// ✅ Soumettre Transfert
async function submitTransfer() {
  const body = {
    receiverEmail: receiver.value,
    amount: Number(amount.value)
  };
  try {
    const res = await fetch('https://examen-backend-ihlx.onrender.com/api/wallet/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      loadDashboard();

      const message =
        "🔔 WALLET FOBAS - TRANSFERT\n\n" +
        "Expéditeur: " + document.getElementById('userEmail').textContent + "\n" +
        "Destinataire: " + receiver.value + "\n" +
        "Montant: " + Number(amount.value).toFixed(2) + " Gourdes\n" +
        "Statut: ACTIVE";

      sendWhatsAppNotification(message);
      alert(data.message);
    } else alert(data.message);
  } catch (e) {
    console.error('Erreur submitTransfer:', e);
  }
}

// ✅ Soumettre Changer mot de passe
async function submitChangePass() {
  const newPassVal = newPass.value;
  const confirmPassVal = confirmPass.value;
  if (!newPassVal || !confirmPassVal) {
    alert('Veuillez remplir tous les champs.');
    return;
  }
  if (newPassVal !== confirmPassVal) {
    alert('Les mots de passe ne correspondent pas.');
    return;
  }
  try {
    const res = await fetch('https://examen-backend-ihlx.onrender.com/api/wallet/changepassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: newPassVal }),
      credentials: 'include'
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

// ✅ Logout
function logout() {
  fetch('https://examen-backend-ihlx.onrender.com/api/wallet/logout', { method: 'POST', credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.success) window.location.href = '/login';
      else alert('Erreur lors de la déconnexion.');
    })
    .catch(err => console.error('Erreur logout:', err));
}

// ✅ Socket.io updates realtime
socket.on('wallet-update', () => loadDashboard());

// ✅ Initial dashboard load
loadDashboard();
