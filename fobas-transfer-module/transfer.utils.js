// ==================== FONKSYON UTILITAIRES FOBAS ====================

// Jenere yon kòd inik pou transfè a
function generateCode() {
  const a = Math.floor(1000 + Math.random() * 9000);
  const b = Math.floor(1000 + Math.random() * 9000);
  return `FBS-${a}-${b}`;
}

// Kalkile frais transfè a (HTG sèlman)
function calculateFee(montant) {
  return Math.round(montant * 0.15); // 15% frais sou montant
}

module.exports = {
  generateCode,
  calculateFee
};
