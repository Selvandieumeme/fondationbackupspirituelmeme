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

  const codeUniqueInput = document.getElementById("code_unique");
  const statutInput = document.getElementById("statut");
  const dateDuJourInput = document.getElementById("date_du_jour");
  const expirationInput = document.getElementById("expiration");

  const btnTransferer = document.getElementById("btn-transferer");

  // ===================== OUTILS =====================
  function remplirAgentDepuisSession() {
    const nom = sessionStorage.getItem("fobas_agent_nom") || "";
    const email = sessionStorage.getItem("fobas_agent_email") || "";

    if (agentNomInput) agentNomInput.value = nom;
    if (agentEmailInput) agentEmailInput.value = email;
  }

  function initialiserDonneesSysteme() {
    const today = new Date();

    // ===== Date du jour (FORMAT HTML5) =====
    const todayISO = today.toISOString().split("T")[0];
    if (dateDuJourInput) dateDuJourInput.value = todayISO;

    // ===== Statut =====
    if (statutInput) statutInput.value = "PENDING";

    // ===== Date expiration +21 jours =====
    if (expirationInput) {
      const exp = new Date(today);
      exp.setDate(exp.getDate() + 21);
      expirationInput.value = exp.toISOString().split("T")[0];
    }

    // ❌ Pa mete codeUnique nan frontend, backend ap jere li
    if (codeUniqueInput) codeUniqueInput.value = "";
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

  [
    expNom, expDocument, expPays, expVille, expAdresse, expWhatsapp,
    benNom, benVille, benAdresse, benWhatsapp,
    montantInput, deviseSelect
  ].forEach(el => {
    el?.addEventListener("input", majBouton);
    el?.addEventListener("change", majBouton);
  });

  majBouton();

  // ===================== BOUTON TRANSFERT EXPRESS (VERIF TIT) =====================
  if (btnTransfertExpress) {
    btnTransfertExpress.addEventListener("click", (e) => {
      e.preventDefault();

      const titreUtilisateur =
        userAccountTypeEl?.innerText.replace("Tit / Statut:", "").trim() || "";

      // ⛔ BLOKAJ TOTAL SI PA OTORIZE
      if (!titresAutorises.includes(titreUtilisateur)) {
        alert("Ou pa gen otorizasyon pou antre nan espas sa");
        return;
      }

      // ✅ OTORIZE
      if (loaderDiv) loaderDiv.style.display = "flex";

      setTimeout(() => {
        if (loaderDiv) loaderDiv.style.display = "none";

        // Stockage frontend seulement
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

  // ===================== INITIALISATION PAGE TRANSFERT =====================
  remplirAgentDepuisSession();
  initialiserDonneesSysteme();
});
















// ================= TRANSFERT EXPRESS FINAL (FRONTEND ONLY) =================
document.addEventListener("DOMContentLoaded", () => {

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

  const statutInput = document.getElementById("statut");
  const expirationInput = document.getElementById("expiration");

  const btnTransferer = document.getElementById("btn-transferer");

  // ===================== FONKSYON VALIDASYON =====================
  function validerFormulaire() {
    const champs = [
      agentNomInput, agentEmailInput,
      expNom, expDocument, expPays, expVille, expAdresse, expWhatsapp,
      benNom, benPays, benVille, benAdresse, benWhatsapp,
      montantInput, deviseSelect
    ];
    return champs.every(c => c && c.value.trim() !== "");
  }

  function majBouton() {
    if (btnTransferer) {
      btnTransferer.disabled = !validerFormulaire();
    }
  }

  [
    agentNomInput, agentEmailInput,
    expNom, expDocument, expPays, expVille, expAdresse, expWhatsapp,
    benNom, benPays, benVille, benAdresse, benWhatsapp,
    montantInput, deviseSelect
  ].forEach(el => {
    el?.addEventListener("input", majBouton);
    el?.addEventListener("change", majBouton);
  });

  majBouton();

  // ===================== BOUTON TRANSFERER =====================
  if (btnTransferer) {
    btnTransferer.addEventListener("click", async (e) => {
      e.preventDefault();

      if (!validerFormulaire()) {
        alert("Tanpri ranpli tout chan obligatwa yo.");
        return;
      }

      btnTransferer.disabled = true;
      btnTransferer.innerText = "TRAITEMENT...";

      const data = {
        agentNom: agentNomInput.value.trim(),
        agentEmail: agentEmailInput.value.trim(),

        expediteur: {
          nom: expNom.value.trim(),
          documentType: "", // si ou bezwen, ou ka ranpli
          document: expDocument.value.trim(),
          pays: expPays.value.trim(),
          ville: expVille.value.trim(),
          adresse: expAdresse.value.trim(),
          whatsapp: expWhatsapp.value.trim()
        },

        beneficiaire: {
          nom: benNom.value.trim(),
          pays: benPays.value.trim(),
          ville: benVille.value.trim(),
          adresse: benAdresse.value.trim(),
          whatsapp: benWhatsapp.value.trim()
        },

        montant: Number(montantInput.value),
        devise: deviseSelect.value.trim(),

        statut: statutInput?.value || "PENDING",
        dateExpiration: expirationInput?.value ? new Date(expirationInput.value) : undefined
      };

      try {
        const response = await fetch("https://api.fondationbackupspirituel.com/api/transferts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Erreur transfert");
        }

        alert("✅ Transfert effectué avec succès. CodeUnique ap jenere otomatikman nan backend.");

        // Reset fòm
        document.querySelectorAll("input, select").forEach(el => {
          if (!el.hasAttribute("readonly")) el.value = "";
        });

      } catch (err) {
        console.error("TRANSFERER FRONTEND ERROR:", err);
        alert(err.message || "Erreur lors du transfert");
      } finally {
        btnTransferer.disabled = false;
        btnTransferer.innerText = "TRANSFERER";
      }
    });
  }
});
