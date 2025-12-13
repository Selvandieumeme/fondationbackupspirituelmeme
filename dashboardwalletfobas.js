// Chaje enfòmasyon itilizate nan localStorage
const userNameEl = document.getElementById("userName");
const userEmailEl = document.getElementById("userEmail");
const userStatusEl = document.getElementById("userStatus");
const actionArea = document.getElementById("actionArea");

const userName = localStorage.getItem("userName");
const userEmail = localStorage.getItem("userEmail");
const userStatus = localStorage.getItem("userStatus") || "active"; // si status pa estoke

if (!userEmail) {
    alert("Veuillez vous connecter d'abord.");
    window.location.href = "connexionwalletfobas.html";
}

userNameEl.textContent = userName;
userEmailEl.textContent = userEmail;
userStatusEl.textContent = userStatus;

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "connexionwalletfobas.html";
});

// Aksyon bouton (senp alèt pou kounye a, ou ka konekte ak backend pita)
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
