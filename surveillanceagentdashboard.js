document.addEventListener("DOMContentLoaded", chargerAgents);

async function chargerAgents() {
  try {
    const res = await fetch("https://api.fondationbackupspirituel.com/api/admin/agents");
    const agents = await res.json();

    if (!Array.isArray(agents)) {
      console.error("Réponse API invalide :", agents);
      return;
    }

    const table = document.getElementById("agentsTable");
    table.innerHTML = "";

    agents.forEach(agent => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${agent.email}</td>
        <td>${agent.accountStatus}</td>
        <td>${agent.balance} G</td>
        <td>${agent.bonus} G</td>
        <td>${new Date(agent.updatedAt).toLocaleString()}</td>

        <td>
          ${
            agent.accountStatus === "ACTIF"
              ? `<button class="btn-block" onclick="bloquerAgent('${agent._id}')">Bloque</button>`
              : `<button class="btn-active" onclick="activerAgent('${agent._id}')">Débloque</button>`
          }
          <button class="btn-block-bonus" onclick="blockBonus('${agent._id}')">Bloque Bonus</button>
          <button class="btn-unblock-bonus" onclick="unblockBonus('${agent._id}')">Débloque Bonus</button>
        </td>

        <td>
          ${
            agent.balanceFrozen
              ? `<button class="btn-unfreeze" onclick="unfreezeBalance('${agent._id}')">Unfreeze</button>`
              : `<button class="btn-freeze" onclick="freezeBalance('${agent._id}')">Freeze</button>`
          }
        </td>
      `;

      table.appendChild(tr);
    });

  } catch (err) {
    console.error("Erreur chargement agents :", err);
  }
}

// ===================== ACTIONS ADMIN =====================

async function postAction(url, agentId) {
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId })
  });

  chargerAgents(); // refresh auto
}

function bloquerAgent(id) {
  postAction("/api/admin/agent/block", id);
}
function activerAgent(id) {
  postAction("/api/admin/agent/activate", id);
}
function freezeBalance(id) {
  postAction("/api/admin/agent/freeze-balance", id);
}
function unfreezeBalance(id) {
  postAction("/api/admin/agent/unfreeze-balance", id);
}
function blockBonus(id) {
  postAction("/api/admin/agent/block-bonus", id);
}
function unblockBonus(id) {
  postAction("/api/admin/agent/unblock-bonus", id);
}
