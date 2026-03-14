// ==================== FONKSYON UTILITAIRES ====================
function generateCode() {
  const a = Math.floor(1000 + Math.random() * 9000);
  const b = Math.floor(1000 + Math.random() * 9000);
  return `FBS-${a}-${b}`;
}

function convertUsdToHtg(usd, taux) {
  return Math.round(usd * taux);
}

function calculateFee(htg) {
  return Math.round(htg * 0.15);
}

module.exports = {
  generateCode,
  convertUsdToHtg,
  calculateFee
};
