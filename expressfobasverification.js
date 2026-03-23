document.addEventListener("DOMContentLoaded", () => {

  const verifyBtn = document.getElementById("verifyBtn");
  const codeInput = document.getElementById("codeInput");
  const resultBox = document.getElementById("resultBox");

  if (!verifyBtn) return;

  verifyBtn.addEventListener("click", async () => {

    const code = codeInput.value.trim();

    if (!code) {
      resultBox.innerHTML = `<span style="color:red">Veuillez entrer un code</span>`;
      return;
    }

    resultBox.innerHTML = "⏳ Vérification en cours...";

    try {

      const res = await fetch("https://api.fondationbackupspirituel.com/api/expressfobas/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      const result = await res.json();

      // ❌ ERREUR
      if (!res.ok) {
        resultBox.innerHTML = `<span style="color:red;font-weight:bold">${result.message}</span>`;
        return;
      }

      const data = result.data;

      // ✅ SUCCESS → AFFICHAGE COMPLET
      resultBox.innerHTML = `
        <div style="background:#f9f9f9;padding:15px;border-radius:10px">

          <b>Code:</b> ${data.code}<br><br>

          <b>Expéditeur:</b> ${data.expediteurNom} (${data.expediteurPays})<br>
          <b>Bénéficiaire:</b> ${data.beneficiaireNom} (${data.beneficiairePays})<br><br>

          <b>Agent:</b> ${data.agentNom}<br>
          <b>Email:</b> ${data.agentEmail}<br><br>

          <b>Montant:</b> ${data.montant} HTG<br>
          <b>Frais:</b> ${data.frais} HTG<br>
          <b>Total:</b> ${data.totalDebit} HTG<br><br>

          <b>Statut:</b> ${data.statut}<br>
          <b>Date:</b> ${new Date(data.dateCreation).toLocaleDateString()}<br>
          <b>Expiration:</b> ${new Date(data.dateExpiration).toLocaleDateString()}<br>

        </div>
      ";

    } catch (err) {
      console.error(err);
      resultBox.innerHTML =
        `<span style="color:red">Erreur serveur</span>`;
    }

  });

});
