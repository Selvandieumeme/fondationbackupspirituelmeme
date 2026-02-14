/**
 * initAgentVerification
 * container: div kote modal la injecte
 * formType: string ('expressTransfer')
 *
 * ✔ 100% dynamique
 * ✔ aucune donnée en dur
 * ✔ basé sur walletbalances (dashboard déjà chargé)
 */
function initAgentVerification(container, formType) {
  const btnValidate = container.querySelector("#btnValidateAgent");
  const emailInput = container.querySelector("#agentEmail");
  const msg = container.querySelector("#verificationMessage");

  if (!btnValidate || !emailInput || !msg) {
    console.error("DOM manquant pour vérification Agent");
    return;
  }

  // 🔐 Données déjà affichées dynamiquement sur le dashboard
  const dashboardEmailEl = document.getElementById("userEmail");
  const dashboardTypeEl = document.getElementById("userAccountType");

  if (!dashboardEmailEl || !dashboardTypeEl) {
    msg.textContent = "Erreur interne dashboard.";
    msg.style.color = "red";
    return;
  }

  const dashboardEmail = dashboardEmailEl.textContent.trim().toLowerCase();
  const isAgentAutorise = dashboardTypeEl.textContent.includes("Agent");

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
    if (!isAgentAutorise) {
      msg.textContent = "Accès refusé. Vous n'êtes pas Agent Autorisé.";
      msg.style.color = "red";
      return;
    }

    // ❌ Email ne correspond pas au compte connecté
    if (enteredEmail !== dashboardEmail) {
      msg.textContent = "Email non compatible avec votre compte.";
      msg.style.color = "red";
      return;
    }

    // ✅ SUCCÈS
    msg.textContent = "Accès autorisé.";
    msg.style.color = "#28a745";

    if (formType === "expressTransfer") {
      fetch("transfertexpresshaiti.html")
        .then(res => {
          if (!res.ok) throw new Error("Formulaire introuvable");
          return res.text();
        })
        .then(html => {
          container.innerHTML = html;

          if (typeof initTransfertExpress === "function") {
            initTransfertExpress(container, dashboardEmail);
          }
        })
        .catch(() => {
          msg.textContent = "Erreur chargement formulaire transfert.";
          msg.style.color = "red";
        });
    }
  });
}
