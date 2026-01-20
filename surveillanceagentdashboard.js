// ===================== SURVEILLANCE AGENT JS =====================

// ------------------- FONKSYON ADMIN -------------------
// Fonksyon deja egziste nan dashboard ou
function bloquerAgent(agentEmail) {
  alert("Bloque agent: " + agentEmail);
  // Ranplase alert pa API admin ou si bezwen
}

function activerAgent(agentEmail) {
  alert("Aktive agent: " + agentEmail);
}

function freezeBalance(agentEmail) {
  alert("Freeze balance: " + agentEmail);
}

function unfreezeBalance(agentEmail) {
  alert("Unfreeze balance: " + agentEmail);
}

// ------------------- INITIAL LOAD -------------------
// Pou nouvo paj HTML, pa gen fetch ki kraze paj la
document.addEventListener("DOMContentLoaded", () => {
  console.log("Surveillance Agents page loaded. Boutons klike ap fonksyone.");
});
