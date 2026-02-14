/**
 * initAgentVerification
 * container: div kote modal la injecte
 * formType: string ('expressTransfer')
 *
 * ⚠️ Aucun appel API
 * ⚠️ Aucune vérification serveur
 * ✅ Basé uniquement sur les données du dashboard (walletbalances)
 */
function initAgentVerification(container, formType) {
  const btnValidate = container.querySelector("#btnValidateAgent");
  const emailInput = container.querySelector("#agentEmail");
  const msg = container.querySelector("#verificationMessage");

  // Sécurité DOM
  if (!btnValidate || !emailInput || !msg) {
    console.error("Éléments DOM manquants pour la vérification Agent");
    return;
  }

  // 🔐 Données réelles venant du dashboard (injectées depuis MongoDB)
  const dashboardEmailEl = document.getElementById("userEmail");
  const dashboardRoleEl = document.getElementById("userRole");

  if (!dashboardEmailEl || !dashboardRoleEl) {
    msg.textContent = "Erreur interne dashboard.";
    msg.style.color = "red";
    return;
  }

  const dashboardEmail = dashboardEmailEl.textContent.trim().toLowerCase();
  const dashboardRole = dashboardRoleEl.textContent.trim();

  btnValidate.addEventListener("click", () => {
    const enteredEmail = emailInput.value.trim().toLowerCase();

    if (!enteredEmail) {
      msg.textContent = "Veuillez entrer un email valide.";
      msg.style.color = "red";
      return;
    }

    msg.textContent = "Vérification en cours...";
    msg.style.color = "#007BFF";

    // ❌ Pas Agent Autorisé
    if (dashboardRole !== "Agent Autorise") {
      msg.textContent = "Accès refusé. Vous n'êtes pas Agent Autorisé.";
      msg.style.color = "red";
      return;
    }

    // ❌ Email non compatible avec le compte connecté
    if (enteredEmail !== dashboardEmail) {
      msg.textContent = "Email non compatible avec votre compte.";
      msg.style.color = "red";
      return;
    }

    // ✅ ACCÈS AUTORISÉ
    msg.textContent = "Accès autorisé.";
    msg.style.color = "#28a745";

    if (formType === "expressTransfer") {
      fetch("transfertexpresshaiti.html")
        .then(res => {
          if (!res.ok) {
            throw new Error("Formulaire introuvable");
          }
          return res.text();
        })
        .then(html => {
          container.innerHTML = html;

          if (typeof initTransfertExpress === "function") {
            initTransfertExpress(container, dashboardEmail);
          } else {
            console.error("initTransfertExpress non défini");
          }
        })
        .catch(err => {
          console.error(err);
          msg.textContent = "Erreur chargement formulaire transfert.";
          msg.style.color = "red";
        });
    }
  });
}
