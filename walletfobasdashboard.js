// ================= DASHBOARD WALLET FOBAS =================
const userNameEl = document.getElementById("userName");
const userEmailEl = document.getElementById("userEmail");
const userStatusEl = document.getElementById("userStatus");
const walletBalanceEl = document.getElementById("balanceActuel");
const walletBonusEl = document.getElementById("bonusActuel");
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
if (userStatusEl) {
  userStatusEl.textContent = userStatus;
}






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
      "https://api.fondationbackupspirituel.com/api/wallet/dashboard",
      {
        headers: {
          "x-user-email": userEmail
        }
      }
    );

    const data = await res.json();

    walletBalanceEl.textContent = formatGourdes(data.wallet?.balance || 0);
    if (walletBonusEl) {
      walletBonusEl.textContent = formatGourdes(data.wallet?.bonus || 0);
    }

    // 🔒 PWOTEKSYON ISTORIK (SA KI TE MANKE A)
    historyBox.innerHTML = "";

    if (Array.isArray(data.tx) && data.tx.length > 0) {
      data.tx
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach(addHistory);
    } else {
      historyBox.innerHTML =
        "<p style='opacity:.6'>Aucune transaction</p>";
    }

  } catch (err) {
    console.error("Erreur dashboard:", err);
    walletBalanceEl.textContent = "0.00 Gourdes";
    if (walletBonusEl) {
      walletBonusEl.textContent = "0.00 Gourdes";
    }
  }
}




// ---------- ADD HISTORY VISUAL ---------- 
function addHistory(t) {
  const div = document.createElement("div");
  div.className = "item";
  const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleString("fr-HT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "";
  div.innerHTML = `
    <b>${t.type.toUpperCase()}</b> | ${formatGourdes(t.amount)}<br>
    Statut: <span class="${t.status === "PENDING" ? "pending" : "active"}">
      ${t.status}
    </span><br>
    Date: ${dateStr}
  `;
  historyBox.prepend(div);
}

// ---------- EXPORT CSV FINAL ---------- 
async function exportHistoryCSV() {
  try {
    // Chaje done itilizatè depi backend
    const res = await fetch("https://api.fondationbackupspirituel.com/api/wallet/dashboard", {
      headers: { "x-user-email": userEmail }
    });
    const data = await res.json();

    const rows = [];
    rows.push(["Balance Actuel", formatGourdes(data.wallet.balance)]);
    rows.push(["Bonus Actuel", formatGourdes(data.wallet.bonus)]);
    rows.push([]); // Liy vid
    rows.push(["Type", "Montant", "Statut", "Date"]);

    data.tx.forEach(t => {
      // Fòmate dat pou CSV lisib
      const date = t.createdAt ? new Date(t.createdAt).toLocaleString("fr-HT", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }) : "";
      rows.push([
        t.type.toUpperCase(),
        formatGourdes(t.amount),
        t.status,
        date
      ]);
    });

    const csvContent = rows
  .map(row =>
    row
      .map(value =>
        `"${String(value).replace(/"/g, '""')}"`
      )
      .join(",")
  )
  .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Historique_Wallet_${userEmail}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (err) {
    console.error(err);
    alert("Erreur lors de l'export CSV");
  }
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
      <input type="hidden" id="userEmailHidden" value="${userEmail}" />
      <input id="oldPass" type="password" placeholder="Ancien mot de passe" />
      <input id="newPass" type="password" placeholder="Nouveau mot de passe" />
      <input id="confirmPass" type="password" placeholder="Confirmation" />
      <button onclick="submitChangePass()">Modifier</button>
      <p id="passwordMsg"></p>
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
      `https://api.fondationbackupspirituel.com/api/wallet/${type}`,
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

    // ---------- INIT ----------
// ⏳ Attendre que MongoDB écrive la transaction
setTimeout(() => {
  loadDashboard(); // recharge historique + balance
}, 800);

// Nettoyage formulaire
setTimeout(() => {
  actionArea.innerHTML = "";
}, 1000);

  } catch (err) {
    console.error(err);
  }
}








async function submitTransfer() {
  const receiverEmail = document.getElementById("receiver").value;
  const amount = Number(document.getElementById("amount").value);

  if (receiverEmail === userEmail) {
    return alert("Vous ne pouvez pas vous transférer de l'argent à vous-même");
  }

  try {
    const res = await fetch(
      "https://api.fondationbackupspirituel.com/api/wallet/transfer",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail
        },
        body: JSON.stringify({
          senderEmail: userEmail,
          receiverEmail,
          amount
        })
      }
    );

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    setTimeout(() => {
      loadDashboard();
    }, 800);

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







// ---------- CHANGER MOT DE PASSE ----------
async function submitChangePass() {
  // Récupération des valeurs
  const oldPassword = document.getElementById("oldPass")?.value.trim() || "";
  const newPassword = document.getElementById("newPass")?.value.trim() || "";
  const confirmPassword = document.getElementById("confirmPass")?.value.trim() || "";
  const email = document.getElementById("userEmailHidden")?.value.trim() || "";
  const msgEl = document.getElementById("passwordMsg");

  if (!msgEl) {
    alert("Erreur interface: message container manquant");
    return;
  }

  // Vérification frontend rapide
  if (!oldPassword || !newPassword || !confirmPassword) {
    msgEl.textContent = "❌ Tous les champs sont obligatoires";
    return;
  }

  if (newPassword !== confirmPassword) {
    msgEl.textContent = "❌ Confirmation incorrecte";
    return;
  }

  try {
    // Envoi request POST vers backend
    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, oldPassword, newPassword })
    });

    // Lecture réponse JSON
    const data = await res.json();

    if (res.ok) {
      msgEl.style.color = "green";
      msgEl.textContent = data.message || "✅ Mot de passe modifié avec succès";
      // Nettoyer les champs après succès
      document.getElementById("oldPass").value = "";
      document.getElementById("newPass").value = "";
      document.getElementById("confirmPass").value = "";
    } else {
      msgEl.style.color = "red";
      msgEl.textContent = data.message || "❌ Erreur serveur";
    }

  } catch (err) {
    console.error("Erreur JS submitChangePass:", err);
    msgEl.style.color = "red";
    msgEl.textContent = "❌ Erreur serveur";
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





// ================= EXPORT HISTORIQUE CSV =================
function exportHistoryCSV() {
  const rows = [];

  // Header wallet
  rows.push(["Balance Actuel", walletBalanceEl?.textContent || ""]);
  rows.push(["Bonus Actuel", walletBonusEl?.textContent || ""]);
  rows.push([]);

  // Header transactions
  rows.push(["Type", "Montant", "Statut", "Date"]);

  let transactionsToExport = [];

  // Si allTransactions egziste ak gen done, itilize li
  if (Array.isArray(window.allTransactions) && window.allTransactions.length) {
    transactionsToExport = window.allTransactions;
  } else {
    // Sinon li done nan vizyèl dashboard la
    const txItems = historyBox?.querySelectorAll(".item") || [];
    txItems.forEach(item => {
      const type = item.querySelector("b")?.textContent?.trim() || "";
      const amount = item.querySelector("b")?.nextSibling?.textContent?.trim() || "";
      const status = item.querySelector("span")?.textContent?.trim() || "";
      const date = item.dataset?.date || "";
      if (type || amount || status) {
        transactionsToExport.push({ type, amount, status, createdAt: date });
      }
    });
  }

  if (!transactionsToExport.length) {
    alert("Aucune transaction à exporter");
    return;
  }

  // Ajoute chak tranzaksyon nan CSV
  transactionsToExport.forEach(tx => {
    const date = tx.createdAt
      ? new Date(tx.createdAt).toLocaleString("fr-HT", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })
      : "";
    rows.push([tx.type.toUpperCase(), tx.amount, tx.status, date]);
  });

  const csvContent = rows
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `Historique_Wallet_${userEmail}_${Date.now()}.csv`
  );

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}




// ✅ AUTO-LOAD SANS DOUBLON
if (typeof loadDashboard === "function") {
  document.addEventListener("DOMContentLoaded", loadDashboard);
}
