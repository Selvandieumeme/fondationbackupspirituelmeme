// ================= DASHBOARD WALLET FOBAS =================
const userNameEl = document.getElementById("userName");
const userEmailEl = document.getElementById("userEmail");
const userStatusEl = document.getElementById("userStatus");
const walletBalanceEl = document.getElementById("walletBalance");
const walletBonusEl = document.getElementById("walletBonus");
const actionArea = document.getElementById("formArea");
const historyBox = document.getElementById("history");

// ---------- Données utilisateur depuis ANCIEN système ----------
const userName = localStorage.getItem("userName");
const userEmail = localStorage.getItem("userEmail");
const userStatus = localStorage.getItem("userStatus") || "ACTIF";

// Sécurité
if (!userEmail) {
  alert("Veuillez vous connecter d'abord.");
  window.location.href = "connexionwalletfobas.html";
}

// Injection header dashboard
userNameEl.textContent = userName;
userEmailEl.textContent = userEmail;
userStatusEl.textContent = userStatus;

// ---------- Utils ----------
function formatGourdes(amount) {
  return Number(amount || 0).toFixed(2) + " Gourdes";
}

// WhatsApp admin
function sendWhatsAppNotification(message) {
  const adminNumber = "50946057952";
  window.open(
    "https://wa.me/" + adminNumber + "?text=" + encodeURIComponent(message),
    "_blank"
  );
}

// ---------- Charger wallet (balance + bonus + historique) ----------
async function loadDashboard() {
  try {
    const res = await fetch(
      "https://examen-backend-ihlx.onrender.com/api/wallet/dashboard",
      {
        headers: {
          "x-user-email": userEmail
        }
      }
    );

    const data = await res.json();

    walletBalanceEl.textContent = formatGourdes(data.wallet?.balance);
    if (walletBonusEl)
      walletBonusEl.textContent = formatGourdes(data.wallet?.bonus);

    historyBox.innerHTML = "";
    data.tx?.forEach(addHistory);

  } catch (err) {
    console.error("Erreur dashboard:", err);
    walletBalanceEl.textContent = "0.00 Gourdes";
    if (walletBonusEl) walletBonusEl.textContent = "0.00 Gourdes";
  }
}

function addHistory(t) {
  const div = document.createElement("div");
  div.className = "item";
  div.innerHTML = `
    <b>${t.type.toUpperCase()}</b> | ${formatGourdes(t.amount)}<br>
    Statut: <span class="${t.status === "PENDING" ? "pending" : "active"}">
      ${t.status}
    </span>
  `;
  historyBox.prepend(div);
}

// ---------- AFFICHAGE DES FORMULAIRES ----------
function showForm(type) {
  actionArea.innerHTML = "";

  if (type === "deposit" || type === "withdraw" || type === "bonus") {
    const label =
      type === "deposit" ? "Dépôt" :
      type === "withdraw" ? "Retrait" : "Bonus";

    actionArea.innerHTML = `
      <h3>${label}</h3>
      <input id="whatsapp" placeholder="WhatsApp" />
      <input id="country" placeholder="Pays" />
      <input id="amount" type="number" placeholder="Montant" />
      <select id="method">
        <option>Moncash</option>
        <option>Natcash</option>
        <option>Zelle</option>
        <option>WU</option>
        <option>Paypal</option>
        <option>Carte de crédit</option>
      </select>
      <button onclick="submitAction('${type}')">${label}</button>
    `;
  }

  if (type === "transfer") {
    actionArea.innerHTML = `
      <h3>Transfert</h3>
      <input id="receiver" placeholder="Email destinataire" />
      <input id="amount" type="number" placeholder="Montant" />
      <button onclick="submitTransfer()">Transférer</button>
    `;
  }

  if (type === "changepass") {
    actionArea.innerHTML = `
      <h3>Changer mot de passe</h3>
      <input id="newPass" type="password" placeholder="Nouveau mot de passe" />
      <input id="confirmPass" type="password" placeholder="Confirmation" />
      <button onclick="submitChangePass()">Modifier</button>
    `;
  }
}

// ---------- ACTIONS ----------
async function submitAction(type) {
  const body = {
    email: userEmail,
    whatsapp: document.getElementById("whatsapp").value,
    country: document.getElementById("country").value,
    amount: Number(document.getElementById("amount").value),
    method: type === "bonus" ? "Bonus" : document.getElementById("method").value
  };

  try {
    const res = await fetch(
      `https://examen-backend-ihlx.onrender.com/api/wallet/${type}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    loadDashboard();

    sendWhatsAppNotification(
      `🔔 WALLET FOBAS - ${type.toUpperCase()}
Nom: ${userName}
Email: ${userEmail}
Montant: ${body.amount} Gourdes
Statut: PENDING`
    );

    alert(data.message || "Action envoyée");

  } catch (err) {
    console.error(err);
  }
}

async function submitTransfer() {
  const receiverEmail = document.getElementById("receiver").value;
  const amount = Number(document.getElementById("amount").value);

  try {
    const res = await fetch(
      "https://examen-backend-ihlx.onrender.com/api/wallet/transfer",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: userEmail,
          receiverEmail,
          amount
        })
      }
    );

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    loadDashboard();
    sendWhatsAppNotification(
      `🔁 TRANSFERT WALLET FOBAS
De: ${userEmail}
Vers: ${receiverEmail}
Montant: ${amount} Gourdes`
    );
    alert(data.message);

  } catch (err) {
    console.error(err);
  }
}

async function submitChangePass() {
  const newPass = document.getElementById("newPass").value;
  const confirm = document.getElementById("confirmPass").value;
  if (!newPass || newPass !== confirm) {
    return alert("Mot de passe invalide");
  }

  try {
    const res = await fetch(
      "https://examen-backend-ihlx.onrender.com/api/wallet/changepassword",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, newPassword: newPass })
      }
    );

    const data = await res.json();
    alert(data.message);
    actionArea.innerHTML = "";

  } catch (err) {
    console.error(err);
  }
}

// ---------- LOGOUT ----------
function logout() {
  localStorage.clear();
  window.location.href = "connexionwalletfobas.html";
}








// ---------- MENU BUTTONS BINDING (OBLIGATOIRE) ----------
document.getElementById("depositBtn")?.addEventListener("click", () => {
  showForm("deposit");
});

document.getElementById("withdrawBtn")?.addEventListener("click", () => {
  showForm("withdraw");
});

document.getElementById("transferBtn")?.addEventListener("click", () => {
  showForm("transfer");
});

document.getElementById("bonusBtn")?.addEventListener("click", () => {
  showForm("bonus");
});

document.getElementById("changePassBtn")?.addEventListener("click", () => {
  showForm("changepass");
});


// ---------- INIT ----------
loadDashboard();
