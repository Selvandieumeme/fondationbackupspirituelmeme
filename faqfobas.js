const faqData = [
  // ================= DEPOT (1–20) =================
  {
    category: "depot",
    question: "Comment effectuer un dépôt sur Wallet FOBAS ?",
    answer: "Pour effectuer un dépôt, connectez-vous, choisissez Dépôt, sélectionnez un agent autorisé ou un moyen numérique, puis validez."
  },
  {
    category: "depot",
    question: "Le dépôt est-il instantané ?",
    answer: "Oui. Dès que l’agent valide la transaction, votre solde est mis à jour en temps réel."
  },

  // ================= RETRAIT (21–40) =================
  {
    category: "retrait",
    question: "Comment retirer de l’argent ?",
    answer: "Allez dans Retrait, générez un code, présentez-le à un agent FOBAS avec votre pièce d’identité."
  },

  // ================= TRANSFERT (41–60) =================
  {
    category: "transfert",
    question: "Puis-je transférer vers un autre utilisateur FOBAS ?",
    answer: "Oui. Le transfert est immédiat et gratuit entre comptes FOBAS."
  },

  // ================= BONUS (61–75) =================
  {
    category: "bonus",
    question: "Comment gagner des bonus ?",
    answer: "Vous gagnez des bonus en utilisant régulièrement la plateforme et via les promotions FOBAS."
  },

  // ================= SECURITE (76–90) =================
  {
    category: "securite",
    question: "Wallet FOBAS est-il sécurisé ?",
    answer: "Oui. Chiffrement, vérification multi-niveaux et surveillance anti-fraude sont en place."
  },

  // ================= COMPTE (91–100) =================
  {
    category: "compte",
    question: "Comment créer un compte Wallet FOBAS ?",
    answer: "Inscrivez-vous avec vos informations réelles. Un compte = une identité."
  }
];

// ================= RENDER FAQ =================
function renderFAQ(list) {
  const container = document.getElementById("faqContainer");
  container.innerHTML = "";
  list.forEach(item => {
    container.innerHTML += `
      <div class="faq-item">
        <strong>${item.question}</strong>
        <p>${item.answer}</p>
      </div>
    `;
  });
}

function filterFAQ(category) {
  if (category === "all") {
    renderFAQ(faqData);
  } else {
    renderFAQ(faqData.filter(f => f.category === category));
  }
}

// ================= CHATBOT =================
function sendChat() {
  const input = document.getElementById("chatInput");
  const msg = input.value.toLowerCase();
  const chat = document.getElementById("chatMessages");

  chat.innerHTML += `<div><strong>Vous:</strong> ${input.value}</div>`;

  const found = faqData.find(f => msg.includes(f.category) || msg.includes(f.question.toLowerCase().slice(0, 5)));

  chat.innerHTML += `<div><strong>FOBAS:</strong> ${found ? found.answer : "Merci. Un agent vous assistera bientôt."}</div>`;

  input.value = "";
}

renderFAQ(faqData);
