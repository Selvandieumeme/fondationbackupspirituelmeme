document.addEventListener("DOMContentLoaded", () => {

  const verifyBtn = document.getElementById("verifyBtn");
  const codeInput = document.getElementById("codeInput");
  const resultBox = document.getElementById("resultBox");

  if (!verifyBtn) {
    console.error("❌ Bouton verifyBtn pa jwenn");
    return;
  }

  verifyBtn.addEventListener("click", async () => {

    console.log("🟢 CLICK DETECTED");

    const code = codeInput.value.trim();

    if (!code) {
      resultBox.innerHTML = "<span style='color:red'>Antre yon code</span>";
      return;
    }

    // 🔄 LOADER
    verifyBtn.disabled = true;
    verifyBtn.innerText = "⏳ Verification en cours...";

    try {

      console.log("📡 Envoi requête API...");

      const res = await fetch("https://api.fondationbackupspirituel.com/api/expressfobas/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      console.log("📥 Réponse reçue");

      const result = await res.json();

      console.log("📊 DATA:", result);

      if (!res.ok) {
        resultBox.innerHTML =
          `<span style="color:red;font-weight:bold">${result.message}</span>`;
        return;
      }

      const d = result.data;

      resultBox.innerHTML = `
        <div style="text-align:left">
          <p><b>Code:</b> ${d.code}</p>
          <p><b>Expéditeur:</b> ${d.expediteurNom}</p>
          <p><b>Bénéficiaire:</b> ${d.beneficiaireNom}</p>
          <p><b>Montant:</b> ${d.montant} HTG</p>
          <p><b>Statut:</b> ${d.statut}</p>
        </div>
      ";

    } catch (err) {

      console.error("🔥 ERREUR FETCH:", err);

      resultBox.innerHTML =
        "<span style='color:red'>Erreur connexion serveur</span>";

    } finally {

      // 🔓 REACTIVATE BUTTON
      verifyBtn.disabled = false;
      verifyBtn.innerText = "Vérifier";
    }

  });

});
