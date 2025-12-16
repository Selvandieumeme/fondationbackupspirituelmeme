// ================= DASHBOARD WALLET FOBAS =================
const userNameEl = document.getElementById("userName");
const userEmailEl = document.getElementById("userEmail");
const userStatusEl = document.getElementById("userStatus");
const walletBalanceEl = document.getElementById("walletBalance");
const walletBonusEl = document.getElementById("walletBonus");
const actionArea = document.getElementById("actionArea");

// Récupère enfòmasyon itilizate nan localStorage
const userName = localStorage.getItem("userName");
const userEmail = localStorage.getItem("userEmail");
const userStatus = localStorage.getItem("userStatus") || "active";

// Si itilizate pa konekte, redireksyon sou login
if (!userEmail) {
    alert("Veuillez vous connecter d'abord.");
    window.location.href = "connexionwalletfobas.html";
}

// Mete enfòmasyon nan dashboard
userNameEl.textContent = userName;
userEmailEl.textContent = userEmail;
userStatusEl.textContent = userStatus;

// --- Fonksyon pou chaje solde ak bonus ---
async function loadWallet() {
    try {
        const response = await fetch(`https://examen-backend-ihlx.onrender.com/api/wallet/me?email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();

        if (data.success) {
            walletBalanceEl.textContent = parseFloat(data.solde || 0).toFixed(2) + " Gourdes";
            if(walletBonusEl) walletBonusEl.textContent = parseFloat(data.bonus || 0).toFixed(2) + " Gourdes";
        } else {
            walletBalanceEl.textContent = (0).toFixed(2) + " Gourdes";
            if(walletBonusEl) walletBonusEl.textContent = (0).toFixed(2) + " Gourdes";
        }
    } catch(err) {
        console.error("Erreur loading wallet:", err);
        walletBalanceEl.textContent = (0).toFixed(2) + " Gourdes";
        if(walletBonusEl) walletBonusEl.textContent = (0).toFixed(2) + " Gourdes";
    }
}


loadWallet();
setInterval(loadWallet, 5000);





// =================== DEPO ===================
const depositBtn = document.getElementById("depositBtn");
if(depositBtn) {
    depositBtn.addEventListener("click", () => {
        actionArea.innerHTML = `
            <h3>Déposer de l'argent</h3>
            <form id="depositForm">
                <label>Nom / Prénom :</label>
                <input type="text" id="depositFullName" value="${userName}" readonly style="width:100%;padding:8px;margin-bottom:8px;">
                <label>Email :</label>
                <input type="email" id="depositEmail" value="${userEmail}" readonly style="width:100%;padding:8px;margin-bottom:8px;">
                <label>WhatsApp :</label>
                <input type="text" id="depositWhatsapp" placeholder="+509XXXXXXXX" required style="width:100%;padding:8px;margin-bottom:8px;">
                <label>Montant :</label>
                <input type="number" id="depositAmount" placeholder="Ex: 500" required style="width:100%;padding:8px;margin-bottom:8px;">
                <label>Méthode :</label>
                <select id="depositMethod" required style="width:100%;padding:8px;margin-bottom:12px;">
                    <option value="">Choisir méthode</option>
                    <option value="Moncash">Moncash</option>
                    <option value="Natcash">Natcash</option>
                    <option value="WU">WU</option>
                    <option value="Zelle">Zelle</option>
                    <option value="Carte de Credit">Carte de Credit</option>
                </select>
                <button type="submit" style="padding:10px 20px; background:#16a34a;color:#fff;border:none;border-radius:8px;">Déposer</button>
            </form>
            <p id="depositMsg" style="margin-top:10px;"></p>
        `;

        const depositForm = document.getElementById("depositForm");
        const depositMsg = document.getElementById("depositMsg");

        depositForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("depositEmail").value.trim();
            const whatsapp = document.getElementById("depositWhatsapp").value.trim();
            const amount = parseFloat(document.getElementById("depositAmount").value);
            const method = document.getElementById("depositMethod").value;

            if (!email || !whatsapp || isNaN(amount) || amount <= 0 || !method) {
                depositMsg.textContent = "⚠️ Tout chan obligatwa ak kantite valab (>0).";
                depositMsg.style.color = "red";
                return;
            }

            depositMsg.textContent = "⏳ Dépôt en cours...";
            depositMsg.style.color = "blue";

            try {
                const response = await fetch("https://examen-backend-ihlx.onrender.com/api/wallet/deposit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, amount, method })
                });

                const data = await response.json();

                if (data.success) {
                    depositMsg.textContent = "✅ Dépôt enregistré en Pending. L'administrateur validera bientôt.";
                    depositMsg.style.color = "#16a34a";

                    // Rafrechi solde imedyatman
                    loadWallet();

                    // Voye mesaj WhatsApp admin
                    const adminNumber = "50946057952";
                    const waMessage = `📥 NOUVO DÉPÔT WALLET FOBAS

👤 ${userName}
📧 Email: ${email}
📱 WhatsApp client: ${whatsapp}
💰 Montant: ${amount} Gourdes
💳 Méthode: ${method}
⏳ Statut: Pending (à valider)`;
                    window.open("https://wa.me/" + adminNumber + "?text=" + encodeURIComponent(waMessage), "_blank");

                    depositForm.reset();
                } else {
                    depositMsg.textContent = "⚠️ " + data.message;
                    depositMsg.style.color = "red";
                }
            } catch(err) {
                console.error(err);
                depositMsg.textContent = "⚠️ Erreur serveur, réessayez plus tard.";
                depositMsg.style.color = "red";
            }
        });
    });
}

















// =================== LOGOUT ===================
const logoutBtn = document.getElementById("logoutBtn");
if(logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "connexionwalletfobas.html";
    });
}

// =================== BONUS ===================
const bonusBtn = document.getElementById("bonusBtn");
if(bonusBtn && walletBonusEl) {
    bonusBtn.addEventListener("click", () => {
        actionArea.innerHTML = `<p>Votre solde Bonus actuel : <strong>${walletBonusEl.textContent}</strong></p>
                                <button id="withdrawBonusBtn">Retirer Bonus</button>`;

        const withdrawBonusBtn = document.getElementById("withdrawBonusBtn");
        if(withdrawBonusBtn) {
            withdrawBonusBtn.addEventListener("click", () => {
                alert("Demande de retrait du Bonus envoyée à l'administrateur via WhatsApp.");
            });
        }
    });
}











<script>
async function bulkDepositFOBAS() {
  const adminPassword = prompt("Mot de passe admin :");
  if (!adminPassword) return;

  // ✍️ Lis itilizate + montan
  const deposits = [
    { email: "fondationbackupspirituel@gmail.com", amount: 10000 },
    { email: "user2@gmail.com", amount: 5000 },
    { email: "user3@gmail.com", amount: 2000 }
  ];

  try {
    const res = await fetch(
      "https://examen-backend-ihlx.onrender.com/api/admin/bulk-deposit",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword, deposits })
      }
    );

    const data = await res.json();
    console.log("Résultat bulk deposit :", data);

    if (data.success) {
      alert("✅ Bulk dépôt effectué avec succès");
    } else {
      alert("⚠️ Erreur : " + data.message);
    }

  } catch (err) {
    console.error(err);
    alert("❌ Erreur serveur");
  }
}
</script>

<button onclick="bulkDepositFOBAS()">Bulk Dépôt Admin</button>
