/**
 * initAgentVerification
 * container: div kote modal la injecte
 * formType: string ('expressTransfer') pou chwazi fòm pou injecte apre verification
 */
function initAgentVerification(container, formType) {
  const btnValidate = container.querySelector("#btnValidateAgent");
  const emailInput = container.querySelector("#agentEmail");
  const msg = container.querySelector("#verificationMessage");

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
      const result = await verifyAgent(email);

      if (result.authorized) {
        msg.textContent = `Agent autorisé: ${result.agentName}`;
        msg.style.color = "#28a745";

        // Injecter form selon formType
        if (formType === 'expressTransfer') {
          fetch("transfertexpresshaiti.html")
            .then(res => res.text())
            .then(html => {
              container.innerHTML = html;
              // Initialiser JS transfert pou Agent valide
              if (typeof initTransfertExpress === "function") {
                initTransfertExpress(container, result.agentEmail);
              } else {
                console.error("initTransfertExpress non défini.");
              }
            })
            .catch(err => {
              console.error("Erreur chargement form transfert:", err);
              msg.textContent = "Erreur chargement formulaire.";
              msg.style.color = "red";
            });
        }

      } else {
        msg.textContent = "Accès refusé. Agent non autorisé.";
        msg.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      msg.textContent = "Erreur connexion API FOBAS.";
      msg.style.color = "red";
    }
  });
}
