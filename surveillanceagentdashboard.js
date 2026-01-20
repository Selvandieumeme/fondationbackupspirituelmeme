// ===================== SURVEILLANCE AGENT JS =====================
async function chargerAgents() {
  try {
    const res = await fetch("/api/admin/agents");
    const agents = await res.json();

    const table = document.getElementById("agentsTable");
    table.innerHTML = "";

    agents.forEach(agent => {
      const row = document.createElement("tr");

      // Kreye bouton ak klas pou style
      const bloqueBtn = document.createElement("button");
      bloqueBtn.textContent = "Bloque";
      bloqueBtn.className = "btn-block";
      bloqueBtn.disabled = agent.accountStatus !== "ACTIF"; // disable si deja pa ACTIF
      bloqueBtn.onclick = () => bloquerAgent(agent._id);

      const activeBtn = document.createElement("button");
      activeBtn.textContent = "Aktive";
      activeBtn.className = "btn-active";
      activeBtn.disabled = agent.accountStatus === "ACTIF"; // disable si deja ACTIF
      activeBtn.onclick = () => activerAgent(agent._id);

      const freezeBtn = document.createElement("button");
      freezeBtn.textContent = agent.balanceFrozen ? "Unfreeze" : "Freeze";
      freezeBtn.className = agent.balanceFrozen ? "btn-unfreeze" : "btn-freeze";
      freezeBtn.onclick = () => {
        if (agent.balanceFrozen) unfreezeBalance(agent._id);
        else freezeBalance(agent._id);
      };

      // Ranje row ak tout <td>
      row.innerHTML = `
        <td>${agent.email}</td>
        <td>${agent.accountStatus}</td>
        <td>${agent.balance} G</td>
        <td>${agent.bonus} G</td>
        <td>${new Date(agent.updatedAt).toLocaleString()}</td>
        <td></td> <!-- Aksyon Bloque / Aktive -->
        <td></td> <!-- Freeze / Unfreeze -->
      `;

      // Mete bouton yo nan <td> respektif
      row.children[5].appendChild(agent.accountStatus === "ACTIF" ? bloqueBtn : activeBtn);
      row.children[6].appendChild(freezeBtn);

      table.appendChild(row);
    });
  } catch (err) {
    console.error("Erreur chargement agents:", err);
    alert("Erreur chargement agents. Reessayez plus tard.");
  }
}

// ------------------- BLOQUE / ACTIVER AGENT -------------------
async function bloquerAgent(id) {
  try {
    await fetch("/api/admin/agent/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: id })
    });
    await chargerAgents(); // refresh table apre aksyon
  } catch (err) {
    console.error("Erreur bloquerAgent:", err);
    alert("Erreur lors du blocage de l'agent.");
  }
}

async function activerAgent(id) {
  try {
    await fetch("/api/admin/agent/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: id })
    });
    await chargerAgents();
  } catch (err) {
    console.error("Erreur activerAgent:", err);
    alert("Erreur lors de l'activation de l'agent.");
  }
}

// ------------------- FREEZE / UNFREEZE BALANCE -------------------
async function freezeBalance(id) {
  try {
    await fetch("/api/admin/agent/freeze-balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: id })
    });
    await chargerAgents();
  } catch (err) {
    console.error("Erreur freezeBalance:", err);
    alert("Erreur lors du freeze de la balance.");
  }
}

async function unfreezeBalance(id) {
  try {
    await fetch("/api/admin/agent/unfreeze-balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: id })
    });
    await chargerAgents();
  } catch (err) {
    console.error("Erreur unfreezeBalance:", err);
    alert("Erreur lors du unfreeze de la balance.");
  }
}

// ------------------- INITIAL LOAD -------------------
chargerAgents();
