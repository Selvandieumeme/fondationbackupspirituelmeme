// dashboardwalletfobas.js
const userNameEl = document.getElementById("userName");
const userEmailEl = document.getElementById("userEmail");
const userStatusEl = document.getElementById("userStatus");
const walletBalanceEl = document.getElementById("walletBalance");
const actionArea = document.getElementById("actionArea");

// Récupère enfòmasyon itilizate nan localStorage
const userName = localStorage.getItem("userName"); // pran non ki sòti nan login
const userEmail = localStorage.getItem("userEmail");
const userStatus = localStorage.getItem("userStatus") || "active"; // si pa gen status, default active

// Si itilizate pa konekte, redireksyon sou login
if (!userEmail) {
    alert("Veuillez vous connecter d'abord.");
    window.location.href = "connexionwalletfobas.html";
}

// Mete enfòmasyon nan dashboard
userNameEl.textContent = userName;
userEmailEl.textContent = userEmail;
userStatusEl.textContent = userStatus;
walletBalanceEl.textContent = "0.00 Gourdes";





// ----------------------- ROUTE API POU DEPOSIT -----------------------
app.post("/api/wallet/deposit", async (req, res) => {
  try {
    const { email, amount, method } = req.body;

    if (!email || !amount || amount <= 0 || !method) {
      return res.status(400).json({ success: false, message: "Champs invalid." });
    }

    const user = await WalletUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Itilizate pa egziste." });
    }

    const balanceBefore = Number(user.solde);

    const transaction = new Transaction({
      userId: user._id,
      type: "deposit",
      amount: Number(amount),
      balanceBefore: balanceBefore,
      balanceAfter: balanceBefore, // pending
      method,
      status: "Pending"
    });

    await transaction.save();

    // 📲 WhatsApp Admin
    const adminNumber = "+50946057952";
    const waMessage = `📥 NOUVELLE DEMANDE DEPOT
👤 ${user.fullName}
📧 ${user.email}
💰 Montant: ${amount} G
💳 Méthode: ${method}
📱 WhatsApp client: ${user.whatsapp}
Statut: PENDING`;

    await axios.post("https://api.callmebot.com/whatsapp.php", null, {
      params: {
        phone: adminNumber,
        apikey: "YOUR_API_KEY",
        text: waMessage
      }
    });

    return res.json({
      success: true,
      message: "Dépôt enregistré en Pending."
    });

  } catch (err) {
    console.error("Erreur deposit API:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});


// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "connexionwalletfobas.html";
});







// --- Nouvo bouton Bonus ---
const walletBonusEl = document.getElementById("walletBonus");
if(walletBonusEl) walletBonusEl.textContent = "0.00 Gourdes"; // default bonus

const bonusBtn = document.getElementById("bonusBtn");
if(bonusBtn) {
    bonusBtn.addEventListener("click", () => {
        actionArea.innerHTML = `<p>Votre solde Bonus actuel : <strong>${walletBonusEl.textContent}</strong></p>
                                <button id="withdrawBonusBtn">Retirer Bonus</button>`;

        // Bouton pou retire bonus
        document.getElementById("withdrawBonusBtn").addEventListener("click", () => {
            alert("Demande de retrait du Bonus envoyée à l'administrateur via WhatsApp.");
            // Isi nap ka ajoute kòd pou voye notif WhatsApp ak backend aprè
        });
    });
    }
