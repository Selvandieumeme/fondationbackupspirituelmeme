// ===================== SURVEILLANCE AGENT JS =====================

async function chargerAgents() {
  try {
    const res = await fetch("https://api.fondationbackupspirituel.com/api/admin/agents");
    const agents = await res.json();

    const table = document.getElementById("agentsTable");
    table.innerHTML = ""; // Reset tablo a

    agents.forEach(agent => {
      const row = document.createElement("tr");

      // Kreye kolòn tèks
      const emailTd = document.createElement("td");
      emailTd.textContent = agent.email;

      const statusTd = document.createElement("td");
      statusTd.textContent = agent.accountStatus;

      const balanceTd = document.createElement("td");
      balanceTd.textContent = `${agent.balance} G`;

      const bonusTd = document.createElement("td");
      bonusTd.textContent = `${agent.bonus} G`;

      const activityTd = document.createElement("td");
      activityTd.textContent = new Date(agent.updatedAt).toLocaleString();

      // Kreye kolòn aksyon ak bouton
      const actionTd = document.createElement("td");
      const bloqueBtn = document.createElement("button");
      bloqueBtn.textContent = "Bloque";
      bloqueBtn.className = "btn-block";
      bloqueBtn.disabled = agent.accountStatus !== "ACTIF";
      bloqueBtn.onclick = () => bloquerAgent(agent._id);

      const activeBtn = document.createElement("button");
      activeBtn.textContent = "Aktive";
      activeBtn.className = "btn-active";
      activeBtn.disabled = agent.accountStatus === "ACTIF";
      activeBtn.onclick = () => activerAgent(agent._id);

      actionTd.appendChild(agent.accountStatus === "ACTIF" ? bloqueBtn : activeBtn);

      // Kolòn Freeze/Unfreeze
      const freezeTd = document.createElement("td");
      const freezeBtn = document.createElement("button");
      freezeBtn.textContent = agent.balanceFrozen ? "Unfreeze" : "Freeze";
      freezeBtn.className = agent.balanceFrozen ? "btn-unfreeze" : "btn-freeze";
      freezeBtn.onclick = () => {
        if (agent.balanceFrozen) unfreezeBalance(agent._id);
        else freezeBalance(agent._id);
      };
      freezeTd.appendChild(freezeBtn);

      // Mete tout kolòn nan row
      row.appendChild(emailTd);
      row.appendChild(statusTd);
      row.appendChild(balanceTd);
      row.appendChild(bonusTd);
      row.appendChild(activityTd);
      row.appendChild(actionTd);
      row.appendChild(freezeTd);

      // Mete row nan tablo
      table.appendChild(row);
    });

  } catch (err) {
    console.error("Erreur chargement agents:", err);
    alert("Erreur chargement agents. Reessayez plus tard.");
  }
}

// Chaje tablo lè paj la fin chaje
document.addEventListener("DOMContentLoaded", chargerAgents);
