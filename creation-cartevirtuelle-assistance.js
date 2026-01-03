document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cardForm');
  const errorMsg = document.getElementById('errorMsg');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorMsg.textContent = '';
    
    // Récupération des champs
    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const country = form.country.value.trim();
    const amount = form.amount.value.trim();
    const purpose = form.purpose.value.trim();
    const serviceType = form.serviceType.value;
    const acceptTerms = form.acceptTerms.checked;

    // Validation
    if (!fullName) {
      errorMsg.textContent = 'Veuillez entrer votre nom complet.';
      return;
    }

    if (!email) {
      errorMsg.textContent = 'Veuillez entrer une adresse email valide.';
      return;
    }

    if (!country) {
      errorMsg.textContent = 'Veuillez indiquer votre pays.';
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      errorMsg.textContent = 'Veuillez entrer un montant valide supérieur à 0.';
      return;
    }

    if (!acceptTerms) {
      errorMsg.textContent = 'Vous devez accepter les conditions avant de continuer.';
      return;
    }

    // Définition du service
    const serviceLabel =
      serviceType === 'virtual'
        ? 'Demande de carte virtuelle (orientation partenaire)'
        : 'Achat assisté (service d’achat)';

    // Numéro WhatsApp
    const phone = '50946057952';

    // Message WhatsApp structuré (lisible, pro)
    const message = `
📩 Nouvelle demande depuis le site

🔹 Service : ${serviceLabel}
👤 Nom : ${fullName}
📧 Email : ${email}
🌍 Pays : ${country}
💰 Montant / estimation : ${amount} USD
📝 Description : ${purpose || 'Non précisé'}

✅ Conditions acceptées
    `;

    // Encodage + redirection
    const waUrl =
      'https://wa.me/' +
      phone +
      '?text=' +
      encodeURIComponent(message.trim());

    window.open(waUrl, '_blank');
  });
});










// === WALLET FOBAS SYSTEM === //
document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("createWalletForm");
  const msgBox = document.getElementById("wallet-msg");

  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // --- Récupération champs obligatwa ---
    const fullName = form.walletFullName.value.trim();
    const email = form.walletEmail.value.trim();

    if (!fullName || !email) {
      msgBox.textContent = "⚠️ Non ak Email obligatwa.";
      msgBox.style.color = "red";
      return;
    }

    // 🔐 Vérification email déjà existant
    try {
      const checkResponse = await fetch(
        "https://api.fondationbackupspirituel.com/api/wallet/check-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        }
      );

      const checkData = await checkResponse.json();

      if (!checkData.success) {
        msgBox.textContent = "⚠️ " + checkData.message;
        msgBox.style.color = "red";
        return; // ⛔ BLOKAJ TOTAL
      }
    } catch (err) {
      console.error("Erreur check email:", err);
      msgBox.textContent = "⚠️ Erreur vérification email, réessayez.";
      msgBox.style.color = "red";
      return;
    }



    
    const recoveryEmail = form.walletRecoveryEmail.value.trim();
    const whatsapp = form.walletWhatsApp.value.trim();
    const birthDate = form.walletBirthDate.value;
    const birthPlace = form.walletBirthPlace.value.trim();
    const password = form.walletPassword.value;
    const passwordConfirm = form.walletPasswordConfirm.value;
    const sponsorName = form.walletSponsorName.value.trim();

    // --- Validation ---
    if (!fullName || !email || !recoveryEmail || !whatsapp || !birthDate || !birthPlace || !password || !passwordConfirm ||
  !sponsorName) {
      msgBox.textContent = "⚠️ Tout chan yo obligatwa.";
      msgBox.style.color = "red";
      return;
    }

    if (password !== passwordConfirm) {
      msgBox.textContent = "⚠️ Mot de passe et confirmation ne correspondent pas.";
      msgBox.style.color = "red";
      return;
    }

    try {
      // --- POST request nan server.js ---
      const response = await fetch("https://api.fondationbackupspirituel.com/api/wallet/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletFullName: fullName,
          walletEmail: email,
          walletRecoveryEmail: recoveryEmail,
          walletWhatsApp: whatsapp,
          walletBirthDate: birthDate,
          walletBirthPlace: birthPlace,
          walletPassword: password,
          walletSponsorName: sponsorName
        })
      });

      const data = await response.json();

      if (data.success) {
        msgBox.textContent = "✅ " + data.message;
        msgBox.style.color = "#16a34a";

        // --- WhatsApp notification admin toujou mache ---
        const adminNumber = "50946057952";
        const waMessage = `🟢 Nouvo Demande Compte WALLET FOBAS\n\n👤 ${fullName}\n📧 ${email}\n📱 ${whatsapp}\n🌍 Email sekou: ${recoveryEmail}\n🏙️ Lye Nésans: ${birthPlace}\n📅 Dat Nésans: ${birthDate}`;
        const waLink = "https://wa.me/" + adminNumber + "?text=" + encodeURIComponent(waMessage);
        window.open(waLink, "_blank");

        form.reset();
      } else {
        msgBox.textContent = "⚠️ " + data.message;
        msgBox.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      msgBox.textContent = "⚠️ Erreur serveur, réessayez plus tard.";
      msgBox.style.color = "red";
    }
  });
});




















// ====== BLOK JS ENDÉPANDAN POU SECURITE DOUBLE SUBMIT + LOADER ======
document.addEventListener("DOMContentLoaded", () => {
  const createWalletForm = document.getElementById("createWalletForm");
  const msgBox = document.getElementById("wallet-msg");

  if (!createWalletForm) return;

  createWalletForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = createWalletForm.querySelector("button[type='submit']");
    if (!submitBtn) return;

    // Evite double submit
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;

    // Sove tèks orijinal bouton an
    const originalText = submitBtn.textContent;

    // Ajoute loader animé sou bouton an
    submitBtn.innerHTML = `<span style="display:inline-block;width:16px;height:16px;border:2px solid #fff;border-top:2px solid transparent;border-radius:50%;margin-right:8px;animation:spin 1s linear infinite;"></span>Création en cours...`;

    // Montre mesaj loading nan bwat mesaj la
    if (msgBox) {
      msgBox.textContent = "⏳ Nap trete demann ou, tanpri rete tann...";
      msgBox.style.color = "#0ea5e9";
    }

    // Récupération done fòmilè
    const formData = {
      walletFullName: createWalletForm.walletFullName.value.trim(),
      walletEmail: createWalletForm.walletEmail.value.trim(),
      walletRecoveryEmail: createWalletForm.walletRecoveryEmail.value.trim(),
      walletWhatsApp: createWalletForm.walletWhatsApp.value.trim(),
      walletBirthDate: createWalletForm.walletBirthDate.value,
      walletBirthPlace: createWalletForm.walletBirthPlace.value.trim(),
      walletPassword: createWalletForm.walletPassword.value,
      walletSponsorName: createWalletForm.walletSponsorName.value.trim(),
    };

    try {
      const response = await fetch("https://api.fondationbackupspirituel.com/api/wallet/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (msgBox) {
        if (data.success) {
          msgBox.textContent = "✅ " + data.message;
          msgBox.style.color = "#16a34a";
          createWalletForm.reset();
        } else {
          msgBox.textContent = "⚠️ " + data.message;
          msgBox.style.color = "red";
        }
      }
    } catch (err) {
      console.error("Erreur fetch:", err);
      if (msgBox) {
        msgBox.textContent = "⚠️ Erreur serveur, réessayez plus tard.";
        msgBox.style.color = "red";
      }
    } finally {
      // Reaktive bouton la
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});

// ====== ANIMATION CSS POUR LOADER ======
const style = document.createElement('style');
style.innerHTML = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
document.head.appendChild(style);
