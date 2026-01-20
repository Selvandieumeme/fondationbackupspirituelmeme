// ===================== SURVEILLANCE AGENT JS =====================

document.addEventListener("DOMContentLoaded", chargerAgents);

async function chargerAgents() {
  try {
    const res = await fetch("https://api.fondationbackupspirituel.com/api/admin/agents");
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Réponse API invalide :", data);
      return;
    }

    const table = document.getElementById("agentsTable");
    table.innerHTML = "";

    data.forEach(agent => {
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
        </td>

        <td>
          <button class="btn-freeze" onclick="freezeBalance('${agent._id}')">Freeze</button>
          <button class="btn-unfreeze" onclick="unfreezeBalance('${agent._id}')">Unfreeze</button>
          <button class="btn-block-bonus" onclick="blockBonus('${agent._id}')">Bloque Bonus</button>
          <button class="btn-unblock-bonus" onclick="unblockBonus('${agent._id}')">Débloque Bonus</button>
        </td>
      `;

      table.appendChild(tr);
    });

  } catch (err) {
    console.error("Erreur chargement agents :", err);
    alert("Erreur chargement agents");
  }
}

/* ===================== ACTIONS ADMIN ===================== */

function postAction(url, agentId, message) {
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId })
  })
  .then(() => {
    alert(message);
    chargerAgents(); // refresh état
  });
}

function bloquerAgent(id) {
  postAction("https://api.fondationbackupspirituel.com/api/admin/agent/block", id, "Agent bloqué");
}

function activerAgent(id) {
  postAction("https://api.fondationbackupspirituel.com/api/admin/agent/activate", id, "Agent débloqué");
}

function freezeBalance(id) {
  postAction("https://api.fondationbackupspirituel.com/api/admin/agent/freeze-balance", id, "Balance gelée");
}

function unfreezeBalance(id) {
  postAction("https://api.fondationbackupspirituel.com/api/admin/agent/unfreeze-balance", id, "Balance dégelée");
}

function blockBonus(id) {
  postAction("https://api.fondationbackupspirituel.com/api/admin/agent/block-bonus", id, "Bonus bloqué");
}

function unblockBonus(id) {
  postAction("https://api.fondationbackupspirituel.com/api/admin/agent/unblock-bonus", id, "Bonus débloqué");
}
