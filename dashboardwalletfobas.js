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

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "connexionwalletfobas.html";
});

// Bouton aksyon (depo, retrait, transfert, change password)
document.getElementById("depositBtn").addEventListener("click", () => {
    actionArea.innerHTML = "<p>Fonction dépôt sera implémentée ici.</p>";
});
document.getElementById("withdrawBtn").addEventListener("click", () => {
    actionArea.innerHTML = "<p>Fonction retrait sera implémentée ici.</p>";
});
document.getElementById("transferBtn").addEventListener("click", () => {
    actionArea.innerHTML = "<p>Fonction transfert sera implémentée ici.</p>";
});
document.getElementById("changePasswordBtn").addEventListener("click", () => {
    actionArea.innerHTML = "<p>Fonction changer le mot de passe sera implémentée ici.</p>";
});
