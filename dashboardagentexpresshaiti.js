document.addEventListener("DOMContentLoaded", () => {
  const btnTransfert = document.getElementById("btnTransfertExpress");
  const container = document.getElementById("transfertExpressContainer");

  btnTransfert.addEventListener("click", () => {
    // Clear previous content
    container.innerHTML = "";

    // Inject agent verification modal
    fetch("agent-verification.html")
      .then(res => res.text())
      .then(html => {
        container.innerHTML = html;
        // Init JS modal verification
        initAgentVerification(container);
      })
      .catch(err => console.error("Erreur chargement modal:", err));
  });
});
