document.addEventListener("DOMContentLoaded", () => {
  const btnTransfert = document.getElementById("btnTransfertExpress");
  const container = document.getElementById("transfertExpressContainer");

  // Event listener pou bouton prensipal
  if (btnTransfert) {
    btnTransfert.addEventListener("click", () => {
      showForm('expressTransfer'); // Nou itilize fonksyon dinamik
    });
  }
});

/**
 * ShowForm: Louvri modal verification Agent Autorisé
 * epi injecte formulaire transfè si Agent valide
 * formType: string (pou kounye a 'expressTransfer')
 */
function showForm(formType) {
  const container = document.getElementById("transfertExpressContainer");
  if (!container) return;

  container.innerHTML = ""; // Clear previous content

  // Louvri modal verification Agent
  fetch("agent-verification.html")
    .then(res => res.text())
    .then(html => {
      container.innerHTML = html;

      // Initialize modal verification
      // Pase formType pou li konnen ki fòm pou injecte apre verification
      if (typeof initAgentVerification === "function") {
        initAgentVerification(container, formType);
      } else {
        console.error("initAgentVerification non defini.");
      }
    })
    .catch(err => console.error("Erreur chargement modal:", err));
}
