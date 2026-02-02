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
        Number(data.balance || 0).toFixed(2) + " FOBAS";

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
  qrDiv.innerHTML = "Génération du QR en cours...";

  try {
    const res = await fetch(
      `https://api.fondationbackupspirituel.com/merchant/generate-qr?email=${merchantEmail}`
    );
    const data = await res.json();

    if (data.success) {
      qrDiv.innerHTML = `
        <h3>QR Paiement FOBAS</h3>
        <img src="${data.qrUrl}" alt="QR Code FOBAS">
      `;
    } else {
      qrDiv.innerText = data.message || "Erreur génération QR";
    }

  } catch (err) {
    console.error("QR ERROR:", err);
    qrDiv.innerText = "Erreur serveur QR Code.";
  }
}

// ==========================
// 🚪 Déconnexion
// ==========================
function logout() {
  localStorage.removeItem("merchantConnected");
  localStorage.removeItem("merchantEmail");
  window.location.href = "merchantloginfobas.html";
}
