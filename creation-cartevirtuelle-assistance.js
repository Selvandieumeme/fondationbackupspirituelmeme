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

  if (!form) return; // sekirite si seksyon an pa chaje

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const fullName = form.walletFullName.value.trim();
    const email = form.walletEmail.value.trim();
    const country = form.walletCountry.value.trim();

    if (!fullName || !email || !country) {
      msgBox.textContent = "⚠️ Tout chan yo obligatwa.";
      msgBox.style.color = "red";
      return;
    }

    // --- Mesaj ki pral voye bay WhatsApp admin nan ---
    const message =
      "🟢 *Nouvo Demande Compte WALLET FOBAS*" +
      "\n\n👤 *Nom complet:* " + fullName +
      "\n📧 *Email:* " + email +
      "\n🌍 *Pays:* " + country +
      "\n\n📌 *Tanpri verifye epi apwouve konto a manuellement.*";

    const encodedMsg = encodeURIComponent(message);

    // WhatsApp Admin
    const adminNumber = "50946057952";

    const waLink = "https://wa.me/" + adminNumber + "?text=" + encodedMsg;

    // Voye moun nan sou WhatsApp admin nan
    window.open(waLink, "_blank");

    msgBox.textContent = "✅ Votre demande a été envoyée à l’administrateur.";
    msgBox.style.color = "#16a34a";

    form.reset();
  });
});
