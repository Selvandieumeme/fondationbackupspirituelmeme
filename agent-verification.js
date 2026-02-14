/**
 * initAgentVerification
 * container: div kote modal la injecte
 * formType: string ('expressTransfer')
 */
function initAgentVerification(container, formType) {
  const btnValidate = container.querySelector("#btnValidateAgent");
  const emailInput = container.querySelector("#agentEmail");
  const msg = container.querySelector("#verificationMessage");

  if (!btnValidate || !emailInput || !msg) {
    console.error("Éléments DOM manquants pour la vérification Agent");
    return;
  }

  btnValidate.addEventListener("click", async () => {
    const email = emailInput.value.trim().toLowerCase();

    if (!email) {
      msg.textContent = "Veuillez entrer un email valide.";
      msg.style.color = "red";
      return;
    }

    msg.textContent = "Vérification en cours...";
    msg.style.color = "#007BFF";

    try {
      if (typeof verifyAgent !== "function") {
        throw new Error("verifyAgent non défini");
      }

      const result = await verifyAgent(email);

      if (result && result.success === true) {
        msg.textContent = `Agent autorisé: ${result.agentName || email}`;
        msg.style.color = "green";

        if (formType === "expressTransfer") {
          fetch("transfertexpresshaiti.html")
            .then(res => {
              if (!res.ok) throw new Error("Formulaire introuvable");
              return res.text();
            })
            .then(html => {
              container.innerHTML = html;

              if (typeof initTransfertExpress === "function") {
                initTransfertExpress(container, email);
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

      } else {
        msg.textContent = "Accès refusé. Agent non autorisé.";
        msg.style.color = "red";
      }

    } catch (err) {
      console.error("Erreur vérification Agent:", err);
      msg.textContent = "Erreur connexion API FOBAS.";
      msg.style.color = "red";
    }
  });
}
