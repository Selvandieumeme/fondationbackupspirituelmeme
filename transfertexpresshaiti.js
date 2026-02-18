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
  function genererCodeUnique(length = 12) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  function remplirAgentDepuisSession() {
    const nom = sessionStorage.getItem("fobas_agent_nom") || "";
    const email = sessionStorage.getItem("fobas_agent_email") || "";

    if (agentNomInput) agentNomInput.value = nom;
    if (agentEmailInput) agentEmailInput.value = email;
  }

  function initialiserDonneesSysteme() {
    if (codeUniqueInput) codeUniqueInput.value = genererCodeUnique();
    if (statutInput) statutInput.value = "PENDING";

    if (expirationInput) {
      const exp = new Date();
      exp.setDate(exp.getDate() + 21);
      expirationInput.value = exp.toISOString().split("T")[0];
    }
  }

  function validerFormulaire() {
    const champs = [
      expNom, expDocument, expPays, expVille, expAdresse, expWhatsapp,
      benNom, benVille, benAdresse, benWhatsapp,
      montantInput, deviseSelect
    ];
    return champs.every(c => c && c.value.trim() !== "");
  }


function initialiserDonneesSysteme() {
  const today = new Date();

  // ===== Date du jour (FORMAT HTML5) =====
  const todayISO = today.toISOString().split("T")[0];

  const dateDuJourInput = document.getElementById("date_du_jour");
  if (dateDuJourInput) {
    dateDuJourInput.value = todayISO;
  }

  // ===== Code unique =====
  if (codeUniqueInput) {
    codeUniqueInput.value = genererCodeUnique();
  }

  // ===== Statut =====
  if (statutInput) {
    statutInput.value = "PENDING";
  }

  // ===== Date expiration +21 jours =====
  if (expirationInput) {
    const exp = new Date(today);
    exp.setDate(exp.getDate() + 21);
    expirationInput.value = exp.toISOString().split("T")[0];
  }
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
















// ===================== TRANSFERER SAFE FRONTEND (ISOLÉ) =====================
// ⚠️ CE BLOC NE TOUCHE A AUCUN CODE EXISTANT
// ⚠️ IL SE CONTENTE D'ECOUTER LE BOUTON "TRANSFERER"
// ⚠️ COMPATIBLE AVEC /api/transferer-safe (server.js)
// ===========================================================================

(function () {
  const btnTransferer = document.getElementById("btn-transferer");
  if (!btnTransferer) return;

  btnTransferer.addEventListener("click", async function (e) {
    e.preventDefault();

    try {
      // ===================== RECUPERATION DONNEES FORMULAIRE =====================
      const data = {
        agentNom: document.getElementById("agent_nom")?.value || "",
        agentEmail: document.getElementById("agent_email")?.value || "",

        expediteur: {
          nom: document.getElementById("exp_nom")?.value || "",
          document: document.getElementById("exp_document")?.value || "",
          pays: document.getElementById("exp_pays")?.value || "",
          ville: document.getElementById("exp_ville")?.value || "",
          adresse: document.getElementById("exp_adresse")?.value || "",
          whatsapp: document.getElementById("exp_whatsapp")?.value || ""
        },

        beneficiaire: {
          nom: document.getElementById("ben_nom")?.value || "",
          pays: document.getElementById("ben_pays")?.value || "",
          ville: document.getElementById("ben_ville")?.value || "",
          adresse: document.getElementById("ben_adresse")?.value || "",
          whatsapp: document.getElementById("ben_whatsapp")?.value || ""
        },

        montant: Number(document.getElementById("montant")?.value || 0),
        devise: document.getElementById("devise")?.value || "",

        codeUnique: document.getElementById("code_unique")?.value || "",
        statut: document.getElementById("statut")?.value || "PENDING"
      };

      // ===================== VALIDATION MINIMALE =====================
      if (!data.agentEmail || !data.montant || data.montant <= 0) {
        alert("Données invalides ou montant incorrect");
        return;
      }

      // ===================== APPEL API SECURISE =====================
      btnTransferer.disabled = true;
      btnTransferer.innerText = "TRAITEMENT...";

      const response = await fetch("/api/transferer-safe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      // ===================== RESULTAT =====================
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Erreur transfert");
      }

      alert("✅ Transfert effectué avec succès");

      // RESET FORMULAIRE (SANS TOUCHER AU RESTE)
      document.querySelectorAll("input, select").forEach(el => {
        if (!el.hasAttribute("readonly")) el.value = "";
      });

      btnTransferer.disabled = false;
      btnTransferer.innerText = "TRANSFERER";

    } catch (err) {
      console.error("TRANSFERER FRONTEND ERROR:", err);
      alert(err.message || "Erreur lors du transfert");

      btnTransferer.disabled = false;
      btnTransferer.innerText = "TRANSFERER";
    }
  });
})();
