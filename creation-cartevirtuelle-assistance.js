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
