// ================= TRANSFERT EXPRESS FINAL (FRONTEND ONLY) =================
document.addEventListener("DOMContentLoaded", () => {

  // ===================== ELEMENTS DASHBOARD =====================
  const btnTransfertExpress = document.getElementById("btnTransfertExpress");
  const loaderDiv = document.getElementById("transfertLoader");

  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");
  const userAccountTypeEl = document.getElementById("userAccountType");

  const titresAutorises = ["Agent Autorise", "FONDATEUR FOBAS"];

  // ===================== ELEMENTS FORMULAIRE =====================
  const agentNomInput = document.getElementById("agent_nom");
  const agentEmailInput = document.getElementById("agent_email");

  const expNom = document.getElementById("exp_nom");
  const expDocument = document.getElementById("exp_document");
  const expPays = document.getElementById("exp_pays");
  const expVille = document.getElementById("exp_ville");
  const expAdresse = document.getElementById("exp_adresse");
  const expWhatsapp = document.getElementById("exp_whatsapp");

  const benNom = document.getElementById("ben_nom");
  const benPays = document.getElementById("ben_pays");
  const benVille = document.getElementById("ben_ville");
  const benAdresse = document.getElementById("ben_adresse");
  const benWhatsapp = document.getElementById("ben_whatsapp");

  const montantInput = document.getElementById("montant");
  const deviseSelect = document.getElementById("devise");

  const btnTransferer = document.getElementById("btn-transferer");

  // ===================== OUTILS =====================
  function remplirAgentDepuisSession() {
    const nom = sessionStorage.getItem("fobas_agent_nom") || "";
    const email = sessionStorage.getItem("fobas_agent_email") || "";

    if (agentNomInput) agentNomInput.value = nom;
    if (agentEmailInput) agentEmailInput.value = email;
  }

  function validerFormulaire() {
    const champs = [
      expNom, expDocument, expPays, expVille, expAdresse, expWhatsapp,
      benNom, benVille, benAdresse, benWhatsapp,
      montantInput, deviseSelect
    ];
    return champs.every(c => c && c.value.trim() !== "");
  }

  function majBouton() {
    if (btnTransferer) {
      btnTransferer.disabled = !validerFormulaire();
    }
  }

  // ===================== ECOUTEURS CHAMP =====================
  [
    expNom, expDocument, expPays, expVille, expAdresse, expWhatsapp,
    benNom, benVille, benAdresse, benWhatsapp,
    montantInput, deviseSelect
  ].forEach(el => {
    el?.addEventListener("input", majBouton);
    el?.addEventListener("change", majBouton);
  });

  majBouton();

  // ===================== BOUTON TRANSFERT EXPRESS =====================
  if (btnTransfertExpress) {
    btnTransfertExpress.addEventListener("click", (e) => {
      e.preventDefault();

      const titreUtilisateur =
        userAccountTypeEl?.innerText.replace("Tit / Statut:", "").trim() || "";

      if (!titresAutorises.includes(titreUtilisateur)) {
        alert("Ou pa gen otorizasyon pou antre nan espas sa");
        return;
      }

      if (loaderDiv) loaderDiv.style.display = "flex";

      setTimeout(() => {

        if (loaderDiv) loaderDiv.style.display = "none";

        sessionStorage.setItem(
          "fobas_agent_nom",
          userNameEl?.innerText.trim() || ""
        );

        sessionStorage.setItem(
          "fobas_agent_email",
          userEmailEl?.innerText.trim() || ""
        );

        alert("Acces Transfert Express FOBAS autorise avec succes");

        window.location.href = "transfertexpresshaiti.html";

      }, 800);
    });
  }

  // ===================== INITIALISATION =====================
  remplirAgentDepuisSession();

  // ===================== BOUTON TRANSFERER =====================
  if (btnTransferer) {
    btnTransferer.addEventListener("click", async (e) => {

      e.preventDefault();

      // 🔒 BLOKAJ DOUBLE TRANSFERT
      if (window.transfertEnCours) return;
      window.transfertEnCours = true;

      if (!validerFormulaire()) {
        alert("Tanpri ranpli tout chan obligatwa yo.");
        window.transfertEnCours = false;
        return;
      }

      btnTransferer.disabled = true;
      btnTransferer.innerText = "TRAITEMENT...";

      const data = {
        agentNom: agentNomInput.value.trim(),
        agentEmail: agentEmailInput.value.trim(),

        expediteurNom: expNom.value.trim(),
        expediteurDocumentType: "",
        expediteurDocumentNumero: expDocument.value.trim(),
        expediteurPays: expPays.value.trim(),
        expediteurVille: expVille.value.trim(),
        expediteurAdresse: expAdresse.value.trim(),
        expediteurTelephone: expWhatsapp.value.trim(),

        beneficiaireNom: benNom.value.trim(),
        beneficiairePays: benPays.value.trim(),
        beneficiaireVille: benVille.value.trim(),
        beneficiaireAdresse: benAdresse.value.trim(),
        beneficiaireTelephone: benWhatsapp.value.trim(),

        montant: Number(montantInput.value),
        devise: deviseSelect.value.trim()
      };

      try {

        const response = await fetch("/api/transferer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Erreur transfert");
        }

        alert("✅ Transfert effectué avec succès.");

        document.querySelectorAll("input, select").forEach(el => {
          if (!el.hasAttribute("readonly")) el.value = "";
        });

      } catch (err) {

        console.error("TRANSFERER FRONTEND ERROR:", err);
        alert(err.message || "Erreur lors du transfert");

      } finally {

        btnTransferer.disabled = false;
        btnTransferer.innerText = "TRANSFERER";

        // 🔓 LIBERE BLOKAJ
        window.transfertEnCours = false;
      }

    });
  }

});
