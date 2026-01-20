const socket = io();
const agentSelect = document.getElementById("agentSelect");

// Chaje lis agent dinamikman depi serve
fetch('/agents')
  .then(res => res.json())
  .then(agents => {
    agents.forEach(agent => {
      const option = document.createElement('option');
      option.value = agent.email;
      option.text = agent.fullName || agent.email;
      agentSelect.appendChild(option);
    });

    // Chwazi premye agent default
    if(agents[0]) watchAgent(agents[0].email);
  });

// Fonksyon pou chanje agent
agentSelect.addEventListener('change', () => {
  watchAgent(agentSelect.value);
});

function watchAgent(email) {
  socket.emit("watchAgent", email);
}

socket.on("agentUpdate", (agent) => {
  document.getElementById("agentEmail").innerText = agent.email;
  document.getElementById("agentStatus").innerText = agent.accountStatus;
  document.getElementById("agentBalance").innerText = agent.balance;
  document.getElementById("agentBonus").innerText = agent.bonus;
  document.getElementById("lastAction").innerText = agent.lastAction || "—";
});

// Aksyon buttons yo
function action(type) {
  const email = agentSelect.value;
  fetch(`/agent-action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, type })
  });
}
