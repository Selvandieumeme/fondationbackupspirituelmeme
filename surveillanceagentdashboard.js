async function chargerAgents() {
  const res = await fetch("/api/admin/agents");
  const agents = await res.json();

  const table = document.getElementById("agentsTable");
  table.innerHTML = "";

  agents.forEach(agent => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${agent.email}</td>
      <td>${agent.accountStatus}</td>
      <td>${agent.balance} G</td>
      <td>${agent.bonus} G</td>
      <td>${new Date(agent.updatedAt).toLocaleString()}</td>
      <td>
        ${
          agent.accountStatus === "ACTIF"
            ? `<button class="btn-block" onclick="bloquerAgent('${agent._id}')">Bloque</button>`
            : `<button class="btn-active" onclick="activerAgent('${agent._id}')">Aktive</button>`
        }
      </td>
      <td>
        ${
          agent.balanceFrozen
            ? `<button class="btn-unfreeze" onclick="unfreezeBalance('${agent._id}')">Unfreeze</button>`
            : `<button class="btn-freeze" onclick="freezeBalance('${agent._id}')">Freeze</button>`
        }
      </td>
    `;

    table.appendChild(row);
  });
}

// ------------------- BLOQUE / ACTIVER AGENT -------------------
async function bloquerAgent(id) {
  await fetch("/api/admin/agent/block", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId: id })
  });
  chargerAgents();
}

async function activerAgent(id) {
  await fetch("/api/admin/agent/activate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId: id })
  });
  chargerAgents();
}

// ------------------- FREEZE / UNFREEZE BALANCE -------------------
async function freezeBalance(id) {
  await fetch("/api/admin/agent/freeze-balance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId: id })
  });
  chargerAgents();
}

async function unfreezeBalance(id) {
  await fetch("/api/admin/agent/unfreeze-balance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId: id })
  });
  chargerAgents();
}

// ------------------- INITIAL LOAD -------------------
chargerAgents();
