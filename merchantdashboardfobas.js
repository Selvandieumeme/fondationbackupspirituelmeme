// ==========================
// 🔐 Vérification accès dashboard
// ==========================
const merchantConnected = localStorage.getItem("merchantConnected");
const merchantEmail     = localStorage.getItem("merchantEmail");

if (!merchantConnected || merchantConnected !== "true" || !merchantEmail) {
  window.location.href = "merchantloginfobas.html";
}

// ==========================
// 🔄 Charger données dashboard
// ==========================
async function loadDashboard() {
  try {
    const res = await fetch(
      `https://api.fondationbackupspirituel.com/merchant/dashboard?email=${merchantEmail}`
    );
    const data = await res.json();

    if (data.success) {
      document.getElementById("balance").innerText =
        Number(data.balance || 0).toFixed(2) + " HTG";

      document.getElementById("payments").innerText =
        Array.isArray(data.payments) ? data.payments.length : 0;
    } else {
      document.getElementById("msg").innerText =
        data.message || "Erreur chargement dashboard";
    }

  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    document.getElementById("msg").innerText =
      "Erreur serveur, veuillez réessayer.";
  }
}

// Charger dès ouverture page
loadDashboard();

// ==========================
// 📷 Générer QR Paiement
// ==========================
async function generateQR() {
  const qrDiv = document.getElementById("qr");
  const amountInput = document.getElementById("amountInput");
  const amount = parseFloat(amountInput.value);

  if (isNaN(amount) || amount <= 0) {
    alert("Montant invalide. Tanpri antre yon kantite valab.");
    return;
  }

  qrDiv.innerHTML = "Génération du QR en cours...";

  try {
    const res = await fetch(
      `https://api.fondationbackupspirituel.com/merchant/generate-qr?email=${merchantEmail}&amount=${amount}`
    );

    const data = await res.json();

    if (data.success) {
      qrDiv.innerHTML = `<h3>QR Paiement HTG</h3><img src="${data.qrUrl}" alt="QR Code HTG">`;
    } else {
      qrDiv.innerText = data.message || "Erreur génération QR";
    }
  } catch (err) {
    console.error("QR ERROR:", err);
    qrDiv.innerText = "Erreur serveur QR Code.";
  }
}







// ==========================
// 💸 Transfert Wallet ➜ Merchant
// ==========================
document.getElementById("transferBtn").addEventListener("click", async () => {
  const amountInput = document.getElementById("transferAmount");
  const amount = parseFloat(amountInput.value);
  const msgDiv = document.getElementById("transferMsg");

  if (isNaN(amount) || amount <= 0) {
    msgDiv.innerText = "Montant invalide. Tanpri antre yon kantite valab.";
    return;
  }

  msgDiv.innerText = "Transfert en cours...";

  try {
    const res = await fetch(
      `https://api.fondationbackupspirituel.com/wallet/transfer-to-merchant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: merchantEmail, // kont merchant ou vle ajoute lajan
          amount: amount
        })
      }
    );

    const data = await res.json();

    if (data.success) {
      msgDiv.innerText = `Transfert fini! Nouvo solde: ${data.newMerchantBalance.toFixed(2)} HTG`;
      // Update solde dashboard imedyatman
      document.getElementById("balance").innerText = data.newMerchantBalance.toFixed(2) + " HTG";
      amountInput.value = "";
    } else {
      msgDiv.innerText = data.message || "Erè transfert";
    }

  } catch (err) {
    console.error("TRANSFER ERROR:", err);
    msgDiv.innerText = "Erè serveur, tanpri reessayez.";
  }
});









// ==========================
// 🚪 Déconnexion
// ==========================
function logout() {
  localStorage.removeItem("merchantConnected");
  localStorage.removeItem("merchantEmail");
  window.location.href = "merchantloginfobas.html";
}
