document.addEventListener("DOMContentLoaded", () => {

  const agentNom = document.getElementById("agentNom");
  const agentEmail = document.getElementById("agentEmail");

  // ============================================================
  // AUTO-FILL AGENT INFO VIA URL (METÒD KI DEJA MACHE POU OU)
  // ============================================================
  if (window.location.search.includes("name=")) {

    const params = new URLSearchParams(window.location.search);

    const name = params.get("name");
    const email = params.get("email");
    const role = params.get("role");

    if (!name || !email) {
      alert("Accès refusé.");
      window.location.href =
        "https://fondationbackupspirituel.com/walletfobasdashboard.html";
      return;
    }

    // Ranpli chan yo dinamikman
    if (agentNom) {
      agentNom.value = name;
      agentNom.readOnly = true;
    }

    if (agentEmail) {
      agentEmail.value = email;
      agentEmail.readOnly = true;
    }
  }
});



  // ============================================================
  // 2) VERIFY EXPRESSFOBAS CODE
  // ============================================================

  verifyBtn.addEventListener("click", async () => {

    const code = codeInput.value.trim();

    if (!code) {
      verifyResult.innerHTML = `<span style="color:red">Antre yon code</span>`;
      return;
    }

    verifyBtn.disabled = true;
    verifyBtn.innerText = "⏳ Vérification...";

    verifyResult.innerHTML = "";

    try {

      const res = await fetch("https://api.fondationbackupspirituel.com/api/expressfobas/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });

      const result = await res.json();

      if (!res.ok) {
        verifyResult.innerHTML =
          `<span style="color:red;font-weight:bold">${result.message}</span>`;
        expressData = null;
        validateBtn.disabled = true;
        return;
      }

      // SUCCESS
      expressData = result.data;

      // AFFICHAGE PRO MAX
      verifyResult.innerHTML = `
        <div class="glass-box">
          <p><b>Code:</b> ${expressData.code}</p>
          <p><b>Expéditeur:</b> ${expressData.expediteurNom} (${expressData.expediteurPays})</p>
          <p><b>Bénéficiaire:</b> ${expressData.beneficiaireNom} (${expressData.beneficiairePays})</p>
          <p><b>Montant:</b> ${expressData.montant} HTG</p>
          <p><b>Frais:</b> ${expressData.frais} HTG</p>
          <p><b>Total Débité:</b> ${expressData.totalDebit} HTG</p>
          <p><b>Statut:</b> ${expressData.statut}</p>
          <p><b>Date:</b> ${new Date(expressData.dateCreation).toLocaleDateString()}</p>
          <p><b>Expiration:</b> ${new Date(expressData.dateExpiration).toLocaleDateString()}</p>
        </div>
      `;

      // si statut = Pending → ON PEUT RETIRER
      validateBtn.disabled = (expressData.statut !== "Pending");

    } catch (err) {
      console.error("🔥 ERREUR VERIFY:", err);
      verifyResult.innerHTML = `<span style="color:red">Erreur connexion serveur</span>`;
    }

    verifyBtn.disabled = false;
    verifyBtn.innerText = "Vérifier le Code";

  });

  // ============================================================
  // 3) VALIDER EXPRESS RETRAIT
  // ============================================================

  validateBtn.addEventListener("click", async () => {

    if (!expressData) return;

    validateBtn.disabled = true;
    validateBtn.innerText = "⏳ Traitement...";

    try {

      const payload = {
        code: expressData.code,
        agentNom: agentNom.value,
        agentEmail: agentEmail.value
      };

      const res = await fetch("https://api.fondationbackupspirituel.com/api/expressfobas/expressretrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        alert("❌ Erreur: " + result.message);
        validateBtn.disabled = false;
        validateBtn.innerText = "Valider ExpressRetrait";
        return;
      }

      // SUCCESS MAXIMUM
      verifyResult.innerHTML = `
        <div class="glass-success">
          🎉 <b>RETRAIT VALIDÉ AVEC SUCCÈS !</b><br><br>
          Code: <b>${expressData.code}</b><br>
          Nouveau statut: <b>ExpressFobas Retire</b><br>
          TotalDebit mis à: <b>0.00</b><br>
          Frais 5% ajouté à Agent ✔️ <br>
          Frais 10% ajouté à Admin ✔️ <br>
          Enregistré dans "retraitinternational" ✔️
        </div>
      `;

      validateBtn.innerText = "Retrait Effectué ✔️";

    } catch (err) {
      console.error("🔥 ERREUR RETRAIT:", err);
      alert("Erreur connexion serveur");
      validateBtn.disabled = false;
      validateBtn.innerText = "Valider ExpressRetrait";
    }

  });

});
