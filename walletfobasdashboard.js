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


// ---------- GEO ZONE (SAFE FRONTEND) ----------
async function getGeoZone() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return `${data.country_code || "HT"}-${data.region || "UNK"}`;
  } catch (e) {
    return "unknown";
  }
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



// Montre Tit / Statut itilizate a
const userAccountTypeEl = document.getElementById("userAccountType");
if (userAccountTypeEl) {
  userAccountTypeEl.textContent = `Tit / Statut: ${data.wallet?.walletAccountType || 'Utilisateur'}`;
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

  // ------------------------- Date formatting -------------------------
  const dateStr = t.createdAt
    ? new Date(t.createdAt).toLocaleString("fr-HT", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
    : "";

  // ------------------------- Transfer details -------------------------
  let transferDetails = "";

  if (t.type === "transfer") {
    const isReceiver = t.senderEmail && t.email !== t.senderEmail;
    const isSender = t.receiverEmail && t.email !== t.receiverEmail;

    // Afichaj pou moun k ap resevwa
    if (isReceiver && t.senderEmail) {
      transferDetails = `
        De : <b>${t.senderName || "—"}</b> (${t.senderEmail})<br>
        Vers : <b>${t.receiverName || "—"}</b> (${t.email})
      `;
    }

    // Afichaj pou moun k ap voye
    if (isSender && t.receiverEmail) {
      transferDetails = `
        De : <b>${t.senderName || "—"}</b> (${t.email})<br>
        Vers : <b>${t.receiverName || "—"}</b> (${t.receiverEmail})
      `;
    }

    // ✅ Ajoute komisyon Agent ak Frais Platfòm si gen nan UI
    if (t.agentBonus) {
      transferDetails += `<br>✅ Bonus Agent: <b>${formatGourdes(t.agentBonus)}</b>`;
    }
    if (t.platformBonus) {
      transferDetails += `<br>💰 Frais Platfòm: <b>${formatGourdes(t.platformBonus)}</b>`;
    }
  }

  // ------------------------- Frais 1% pou transfert -------------------------
  if (t.type === "fees") {
    transferDetails = `💸 Frais 1% sou transfert: <b>${formatGourdes(t.amount)}</b>`;
  }




// ------------------------- ADMIN NOTE (SAFE) -------------------------
let adminNoteHtml = "";

if (t.type === "admin_note" && typeof t.note === "string") {
  adminNoteHtml = `
    <div style="
      margin-top:6px;
      padding:6px 8px;
      background:#fff7d6;
      border-left:4px solid #f1c40f;
      font-size:13px;
    ">
      📝 <b>Note Admin :</b><br>
      ${t.note}
    </div>
  `;
}
  





// ---------- ADMIN NOTE BADGE (SAFE, VISUEL SEULEMENT) ----------
let adminBadge = "";

if (t.type === "admin_note") {
  adminBadge = `
    <span style="
      display:inline-block;
      margin-left:6px;
      padding:2px 6px;
      background:#f1c40f;
      color:#000;
      font-size:11px;
      font-weight:bold;
      border-radius:4px;
    ">
      🛡️ MESSAGE ADMIN
    </span>
  `;
}


  

// ===============================================================
 div.innerHTML = `
  <b>${t.type.toUpperCase()}</b>${adminBadge} | ${formatGourdes(t.amount)}<br>
  ${transferDetails}
  ${adminNoteHtml}
  Statut: <span class="${t.status === "PENDING" ? "pending" : "active"}">
    ${t.status}
  </span><br>
  Date: ${dateStr}
`;

// ---------- PRIORITÉ AFFICHAGE ADMIN NOTE (SAFE) ----------
if (t.type === "admin_note") {
  historyBox.prepend(div); // toujours en haut
} else {
  historyBox.append(div); // comportement normal
}
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
Montant: ${body.amount} Wallets
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

  // 🔒 Sekirite: pa ka transfere bay tèt ou
  if (receiverEmail === userEmail) {
    return alert("Vous ne pouvez pas effectuer un transfert à vous-même");
  }

  // 🔄 Capture geoZone pou backend
  const geoZone = await getGeoZone(); // ✅ AJOUT SAFE

  // 🔄 Capture IP aparèy pou backend (pridan)
  let userIP = "0.0.0.0";
  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipRes.json();
    if (ipData && ipData.ip) userIP = ipData.ip;
  } catch (ipErr) {
    console.warn("Impossible de récupérer l'IP publique, valeur par défaut utilisée:", ipErr);
  }

  try {
    const res = await fetch(
      "https://api.fondationbackupspirituel.com/api/wallet/transfer",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail,
          "x-geo-zone": geoZone // ✅ AJOUT SAFE
        },
        body: JSON.stringify({
          senderEmail: userEmail,
          receiverEmail,
          amount,
          ipAddress: userIP // ✅ Entègrasyon IP san risk
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return alert(data.message || "Erreur lors du transfert");
    }

    // 🔄 Reload dashboard aprè tranzaksyon
    setTimeout(() => {
      loadDashboard();
    }, 800);

    // 📲 Notifikasyon WhatsApp
    sendWhatsAppNotification(
      `🔁 TRANSFERT FOBAS
De: ${userEmail}
Vers: ${receiverEmail}
Montant: ${amount} Gourdes
IP: ${userIP}`
    );

    alert(data.message || "Transfert effectué avec succès");

  } catch (err) {
    console.error("Erreur submitTransfer:", err);
    alert("Erreur serveur. Veuillez réessayer plus tard.");
  }
}






// ================================
// 1️⃣ Montre fòm selon bouton
// ================================
async function submitChangePass() {
  const oldPassword = document.getElementById("oldPass").value;
  const newPassword = document.getElementById("newPass").value;
  const confirmPassword = document.getElementById("confirmPass").value;
  const msg = document.getElementById("passwordMsg");

  msg.textContent = "";
  msg.style.color = "red";

  if (!oldPassword || !newPassword || !confirmPassword) {
    msg.textContent = "Tous les champs sont obligatoires";
    return;
  }

  if (newPassword !== confirmPassword) {
    msg.textContent = "Les mots de passe ne correspondent pas";
    return;
  }

  const email = localStorage.getItem("userEmail");
  if (!email) {
    msg.textContent = "Erreur: utilisateur non identifié";
    return;
  }

  try {
    const response = await fetch(
      "https://api.fondationbackupspirituel.com/api/wallet/change-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, oldPassword, newPassword })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      msg.textContent = data.message || "Erreur serveur";
      return;
    }

    msg.style.color = "green";
    msg.textContent = data.message;

    document.getElementById("oldPass").value = "";
    document.getElementById("newPass").value = "";
    document.getElementById("confirmPass").value = "";

  } catch (err) {
    console.error(err);
    msg.textContent = "Erreur serveur";
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
