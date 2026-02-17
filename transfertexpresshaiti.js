// ================= TRANSFERT EXPRESS - NOUVO SYSTEM =================
document.addEventListener("DOMContentLoaded", () => {
  const btnTransfert = document.getElementById("btnTransfertExpress"); // ID matche ak HTML
  if (!btnTransfert) return;

  btnTransfert.addEventListener("click", async (e) => {
    e.preventDefault();

    // Récupérer email itilizatè a dinamikman, selon sistèm ou a
    const userEmail = document.getElementById("userEmail")?.innerText.trim();
    if (!userEmail) return alert("Email manke. Tanpri konekte.");

    try {
      // Requête backend pou verifye itilizatè a
      const res = await fetch("https://api.fondationbackupspirituel.com/api/wallet/get-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });

      const user = await res.json();

      if (!res.ok || !user) {
        return alert("Itilizatè pa jwenn nan baz la.");
      }

      // Verifye tit itilizatè a
      const titresAutorises = ["Agent Autorise", "FONDATEUR FOBAS"];
      if (!titresAutorises.includes(user.walletAccountType)) {
        return alert("Ou pa gen otorizasyon pou antre nan Transfert Express FOBAS.");
      }

      // Mete nan sessionStorage pou paj transfert la ka li yo
      sessionStorage.setItem("fobas_agent_nom", user.fullName);
      sessionStorage.setItem("fobas_agent_email", user.email);

      // Redirije itilizatè sèlman si verification pase
      window.location.href = "transfertexpresshaiti.html";

    } catch (err) {
      console.error("Erè verifye user:", err);
      alert("Yon erè rive, tanpri eseye ankò.");
    }
  });
});

// -----------------------------
// 3️⃣ Récupération info utilisateur
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const btnTransfertExpress = document.getElementById("btnTransfertExpress");
  const loaderDiv = document.getElementById("transfertLoader");

  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");
  const userAccountTypeEl = document.getElementById("userAccountType");

  if (!btnTransfertExpress) return;

  const titresAutorises = ["Agent Autorise", "FONDATEUR FOBAS"];

  btnTransfertExpress.addEventListener("click", async (e) => {
    e.preventDefault();
    if (loaderDiv) loaderDiv.style.display = "flex";

    await new Promise((resolve) => setTimeout(resolve, 800));

    const titreUtilisateur = userAccountTypeEl?.innerText?.trim() || "";
    const userNomPrenom = userNameEl?.innerText?.trim() || "";
    const userEmail = userEmailEl?.innerText?.trim() || "";

    if (titresAutorises.includes(titreUtilisateur)) {
      if (loaderDiv) loaderDiv.style.display = "none";
      alert("Acces Transfert Express FOBAS autorise avec succes");

      const agentNomInput = document.getElementById("agent_nom");
      const agentEmailInput = document.getElementById("agent_email");
      const codeUniqueInput = document.getElementById("code_unique");
      const statutInput = document.getElementById("statut");
      const expirationInput = document.getElementById("expiration");

      if (agentNomInput) agentNomInput.value = userNomPrenom;
      if (agentEmailInput) agentEmailInput.value = userEmail;
      if (codeUniqueInput) codeUniqueInput.value = genererCodeUnique();
      if (statutInput) statutInput.value = "PENDING";

      const expiration = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);
      if (expirationInput) expirationInput.value = expiration.toISOString().split("T")[0];

      window.location.href = "transfertexpresshaiti.html";
    } else {
      if (loaderDiv) loaderDiv.style.display = "none";
      alert("Ou pa gen otorizasyon pou w antre nan espas sa");
      btnTransfertExpress.disabled = true;
    }
  });
});


// -----------------------------
// TRANSFERT EXPRESS FONCTIONS EXISTANTES
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {

  const agentNom = document.getElementById("agent_nom");
  const agentEmail = document.getElementById("agent_email");
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
  const btnTransferer = document.getElementById("btn-transferer");
  const btnRetrait = document.getElementById("btn-retrait");

  function genererCodeUnique(length = 12) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async function obtenirTauxDuJour() {
    return 132;
  }

  function remplirAgent() {
    const nom = sessionStorage.getItem("fobas_agent_nom");
    const email = sessionStorage.getItem("fobas_agent_email");

    if (agentNom && nom) agentNom.value = nom;
    if (agentEmail && email) agentEmail.value = email;
  }

  remplirAgent();

  function validerFormulaire() {
    const champs = [
      expNom, expDocument, expPays, expVille, expAdresse, expWhatsapp,
      benNom, benVille, benAdresse, benWhatsapp,
      montantInput, deviseSelect
    ];
    return champs.every(c => c && c.value.trim() !== "");
  }

  function majBouton() {
    btnTransferer.disabled = !validerFormulaire();
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

  btnTransferer.addEventListener("click", async () => {
    if (!validerFormulaire()) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const codeUnique = genererCodeUnique();
    codeUniqueInput.value = codeUnique;
    statutInput.value = "PENDING";

    const montant = parseFloat(montantInput.value);
    const devise = deviseSelect.value;
    const taux = await obtenirTauxDuJour();
    const montantHTG = (devise === "USD" || devise === "EUR") ? montant * taux : montant;

    const fraisHTG = Math.round(montantHTG * 0.08);
    const totalHTG = montantHTG + fraisHTG;

    const transfertData = {
      agent: { nom_prenom: agentNom.value, email: agentEmail.value },
      expediteur: {
        nom_prenom: expNom.value,
        document: expDocument.value,
        pays: expPays.value,
        ville: expVille.value,
        adresse: expAdresse.value,
        whatsapp: expWhatsapp.value
      },
      beneficiaire: {
        nom_prenom: benNom.value,
        pays: benPays.value,
        ville: benVille.value,
        adresse: benAdresse.value,
        whatsapp: benWhatsapp.value
      },
      transfert: {
        montant_original: montant,
        devise_originale: devise,
        taux_du_jour: taux,
        montant_htg: montantHTG,
        frais_htg: fraisHTG,
        total_htg: totalHTG,
        code_unique: codeUnique,
        statut: "PENDING",
        expiration: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
      }
    };

    try {
      const response = await fetch("https://api.fondationbackupspirituel.com/api/transfert-express", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transfertData)
      });

      const result = await response.json();

      if (response.ok) {
        alert("Transfert enregistré avec succès ! Code unique: " + codeUnique);
        document.querySelector("form")?.reset();
        statutInput.value = "PENDING";
        majBouton();
      } else {
        alert("Erreur lors de l'enregistrement: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau ou serveur.");
    }
  });
});
