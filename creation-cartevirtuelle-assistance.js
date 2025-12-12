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

  if (!form) return; // Sekirite si seksyon an pa chaje

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // --- Récupération des champs ---
    const fullName = form.walletFullName.value.trim();
    const email = form.walletEmail.value.trim();
    const recoveryEmail = form.walletRecoveryEmail.value.trim();
    const whatsapp = form.walletWhatsApp.value.trim();
    const birthDate = form.walletBirthDate.value;
    const birthPlace = form.walletBirthPlace.value.trim();
    const password = form.walletPassword.value;
    const passwordConfirm = form.walletPasswordConfirm.value;

    // --- Validation ---
    if (!fullName || !email || !recoveryEmail || !whatsapp || !birthDate || !birthPlace || !password || !passwordConfirm) {
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
      const response = await fetch("https://examen-backend-ihlx.onrender.com/api/wallet/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletFullName: fullName,
          walletEmail: email,
          walletRecoveryEmail: recoveryEmail,
          walletWhatsApp: whatsapp,
          walletBirthDate: birthDate,
          walletBirthPlace: birthPlace,
          walletPassword: password
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
