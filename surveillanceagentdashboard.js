const socket = io("https://api.fondationbackupspirituel.com"); // konekte Socket.io ak serve api

const agentSelect = document.getElementById("agentSelect");

// Chaje lis agent dinamikman depi API ou a
fetch('https://api.fondationbackupspirituel.com/agents')
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
  })
  .catch(err => console.error("❌ Erè chaje agents:", err));

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
  fetch(`https://api.fondationbackupspirituel.com/agent-action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, type })
  })
  .catch(err => console.error("❌ Agent action error:", err));
}

// Shortcut fonksyon pou chak bouton
function blockAccount() { action("BLOCK_ACCOUNT"); }
function unblockAccount() { action("UNBLOCK_ACCOUNT"); }
function freezeBalance() { action("FREEZE_BALANCE"); }
function unfreezeBalance() { action("UNFREEZE_BALANCE"); }
function blockBonus() { action("BLOCK_BONUS"); }
function unblockBonus() { action("UNBLOCK_BONUS"); }
