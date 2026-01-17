const departments = [
  "Artibonite","Centre","Grand'Anse","Nippes","Nord",
  "Nord-Est","Nord-Ouest","Ouest","Sud","Sud-Est"
];

const agentsData = {
  "Ouest": [
    {
      name: "Jean Paul Louis",
      zone: "Delmas 33",
      services: "Dépôt, Retrait, Transfert",
      phone: "509xxxxxxxx",
      photo: "assets/agents/agent1.jpg"
    }
    // ajoute jiska ou vle
  ],
  "Nord": []
};

const deptButtons = document.getElementById("deptButtons");
const agentsContainer = document.getElementById("agentsContainer");

departments.forEach(dept => {
  const btn = document.createElement("button");
  btn.textContent = dept;
  btn.onclick = () => loadAgents(dept);
  deptButtons.appendChild(btn);
});

function loadAgents(dept) {
  agentsContainer.innerHTML = "";

  if (!agentsData[dept] || agentsData[dept].length === 0) {
    agentsContainer.innerHTML = `<p>Aucun agent disponible pour ${dept}</p>`;
    return;
  }

  agentsData[dept].forEach(agent => {
    const card = document.createElement("div");
    card.className = "agent-card";

    card.innerHTML = `
      <img src="${agent.photo}">
      <h4>${agent.name}</h4>
      <p>${agent.zone}</p>
      <p>${agent.services}</p>
      <a href="https://wa.me/${agent.phone}" target="_blank">WhatsApp</a>
    `;
    agentsContainer.appendChild(card);
  });
}
