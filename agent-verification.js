/**
 * agent-verification.js - Version finale
 * Vérification automatique de l'Agent Autorisé et chargement du formulaire Transfert Express Haiti
 */

// ====================== Vérification Agent ======================
function verifyCurrentAgent() {
  const userEmailEl = document.getElementById("userEmail");
  const userRoleEl = document.getElementById("userAccountType");
  const msg = document.getElementById("verificationMessage");
  const container = document.getElementById("transfertExpressContainer");

  if (!userEmailEl || !userRoleEl || !msg || !container) {
    console.error("Éléments DOM manquants pour la vérification Agent");
    return;
  }

  const email = userEmailEl.textContent.trim().toLowerCase();
  const role = userRoleEl.textContent.trim().toLowerCase();

  msg.textContent = "Vérification en cours...";
  msg.style.color = "#007BFF";

  // ✅ Tcheke si itilizatè a se Agent Autorise
  if (role.includes("agent autorise")) {
    msg.textContent = "Agent autorisé confirmé ✅";
    msg.style.color = "green";

    // Chaje fòm transfert express Haiti la
    fetch("transfertexpresshaiti.html")
      .then(res => {
        if (!res.ok) throw new Error("Formulaire introuvable");
        return res.text();
      })
      .then(html => {
        container.innerHTML = html;

        // Initialiser JS Transfert Express pou Agent valide
        if (typeof initTransfertExpress === "function") {
          initTransfertExpress(container, email);
        } else {
          console.error("initTransfertExpress non défini");
        }
      })
      .catch(err => {
        console.error("Erreur chargement formulaire:", err);
        msg.textContent = "Erreur chargement formulaire.";
        msg.style.color = "red";
      });

  } else {
    msg.textContent = "Accès refusé. Agent non autorisé.";
    msg.style.color = "red";
  }
}

// ====================== Bouton Transfert Express ======================
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnTransfertExpress");
  if (btn) {
    btn.addEventListener("click", verifyCurrentAgent);
  } else {
    console.warn("Bouton #btnTransfertExpress introuvable dans le DOM");
  }
});
