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
  <div style="
    text-align:left;
    background:#f9f9f9;
    padding:15px;
    border-radius:10px;
    box-shadow:0 2px 8px rgba(0,0,0,0.1);
    font-size:14px;
    line-height:1.6;
  ">

    <p><b>📌 Code:</b> ${d.code}</p>

    <hr>

    <p><b>👤 Expéditeur:</b> ${d.expediteurNom} (${d.expediteurPays})</p>
    <p><b>👥 Bénéficiaire:</b> ${d.beneficiaireNom} (${d.beneficiairePays})</p>

    <hr>

    <p><b>🧑‍💼 Agent:</b> ${d.agentNom}</p>
    <p><b>📧 Email:</b> ${d.agentEmail}</p>

    <hr>

    <p><b>💰 Montant:</b> ${d.montant} HTG</p>
    <p><b>💸 Frais (15%):</b> ${d.frais} HTG</p>
    <p><b>🧾 Total débité:</b> ${d.totalDebit} HTG</p>

    <hr>

    <p><b>📊 Statut:</b> 
      <span style="
        color:${d.statut === "Pending" ? "orange" : (d.statut.includes("Annule") ? "red" : "green")};
        font-weight:bold;
      ">
        ${d.statut}
      </span>
    </p>

    <p><b>📅 Date création:</b> ${new Date(d.dateCreation).toLocaleDateString()}</p>
    <p><b>⏳ Date expiration:</b> ${new Date(d.dateExpiration).toLocaleDateString()}</p>

  </div>
`;

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
