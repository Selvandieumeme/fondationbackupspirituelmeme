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

      const result = await verifyAgent(email);

if (result.success === true) {
  msg.textContent = `Agent autorisé: ${result.agentName}`;
  msg.style.color = "#28a745";

  if (formType === 'expressTransfer') {
    fetch("transfertexpresshaiti.html")
      .then(res => res.text())
      .then(html => {
        container.innerHTML = html;

        if (typeof initTransfertExpress === "function") {
          initTransfertExpress(container, email);
        }
      });
  }

} else {
  msg.textContent = "Accès refusé. Agent non autorisé.";
  msg.style.color = "red";
}

    

       
