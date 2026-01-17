const departments = [
  "Artibonite","Centre","Grand'Anse","Nippes","Nord",
  "Nord-Est","Nord-Ouest","Ouest","Sud","Sud-Est"
];

const agentsData = {
  "Ouest": [
    // Blòk 1 - premye 5 agents
    {
      name: "Marie Ange Noe",
      zone: "Petion-Ville",
      services: "Representante Communale Petion-Ville",
      phone: "50949451734",
      photo: "MarieNoePV.jpg"
    },
    {
      name: "Jean Paul Louis",
      zone: "Delmas 33",
      services: "Agent Autorisé Dépôt/Retrait/Transfert",
      phone: "509xxxxxxxx",
      photo: "JeanPaulDelmas.jpg"
    },
    {
      name: "Claudine Pierre",
      zone: "Tabarre",
      services: "Agent Autorisé Dépôt/Transfert",
      phone: "509xxxxxxxx",
      photo: "ClaudineTabarre.jpg"
    },
    {
      name: "Michel Joseph",
      zone: "Pétion-Ville",
      services: "Agent Autorisé Retrait/Transfert",
      phone: "509xxxxxxxx",
      photo: "MichelPV.jpg"
    },
    {
      name: "Sophie Laurent",
      zone: "Delmas 29",
      services: "Agent Autorisé Dépôt/Transfert",
      phone: "509xxxxxxxx",
      photo: "SophieDelmas.jpg"
    },

    // Blòk 2 - pwochen 5 agents
    {
      name: "Jean-Marie Pierre",
      zone: "Tabarre",
      services: "Agent Autorisé Dépôt/Retrait",
      phone: "509xxxxxxxx",
      photo: "JeanMarieTabarre.jpg"
    },
    {
      name: "Carla Dupont",
      zone: "Pétion-Ville",
      services: "Agent Autorisé Transfert",
      phone: "509xxxxxxxx",
      photo: "CarlaPV.jpg"
    },
    {
      name: "Patrick Simon",
      zone: "Delmas 30",
      services: "Agent Autorisé Dépôt/Retrait/Transfert",
      phone: "509xxxxxxxx",
      photo: "PatrickDelmas.jpg"
    },
    {
      name: "Isabelle François",
      zone: "Tabarre",
      services: "Agent Autorisé Dépôt/Transfert",
      phone: "509xxxxxxxx",
      photo: "IsabelleTabarre.jpg"
    },
    {
      name: "Louis Bernard",
      zone: "Pétion-Ville",
      services: "Agent Autorisé Retrait/Transfert",
      phone: "509xxxxxxxx",
      photo: "LouisPV.jpg"
    }
  ]
    
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
