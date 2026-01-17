const departments = [
  "Artibonite","Centre","Grand'Anse","Nippes","Nord",
  "Nord-Est","Nord-Ouest","Ouest","Sud","Sud-Est"
];

const agentsData = {
 "Ouest": [
  {
    name: "Marie Ange Noe",
    zone: "Petion-Ville",
    services: "Representante Communale Petion-Ville",
    phone: "50949451734",
    photo: "MarieNoePV.jpg"
  },
  {
    name: "Jean Paul Louis",
    zone: "Delmas",
    services: "Agent Autorisé",
    phone: "50911111111",
    photo: "JeanPaul.jpg"
  },
  {
    name: "Claudine Pierre",
    zone: "Tabarre",
    services: "Agent Autorisé",
    phone: "50922222222",
    photo: "Claudine.jpg"
  },
  {
    name: "Michel Joseph",
    zone: "Carrefour",
    services: "Agent Autorisé",
    phone: "50933333333",
    photo: "Michel.jpg"
  },
  {
    name: "Sophie Laurent",
    zone: "Pétion-Ville",
    services: "Agent Autorisé",
    phone: "50944444444",
    photo: "Sophie.jpg"
  },

  {
    name: "Patrick Simon",
    zone: "Delmas",
    services: "Agent Autorisé",
    phone: "50955555555",
    photo: "Patrick.jpg"
  },
  {
    name: "Isabelle François",
    zone: "Tabarre",
    services: "Agent Autorisé",
    phone: "50966666666",
    photo: "Isabelle.jpg"
  },
  {
    name: "Louis Bernard",
    zone: "Croix-des-Bouquets",
    services: "Agent Autorisé",
    phone: "50977777777",
    photo: "Louis.jpg"
  },
  {
    name: "Carla Dupont",
    zone: "Carrefour",
    services: "Agent Autorisé",
    phone: "50988888888",
    photo: "Carla.jpg"
  },
  {
    name: "Jean-Marie Pierre",
    zone: "Delmas",
    services: "Agent Autorisé",
    phone: "50999999999",
    photo: "JeanMarie.jpg"
  }
]
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
