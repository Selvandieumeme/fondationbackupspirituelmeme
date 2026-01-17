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
],
    
  "Nord": [
  {
    name: "Wilner Desrosiers",
    zone: "Cap-Haïtien",
    services: "Agent Autorisé",
    phone: "50940101001",
    photo: "Wilner.jpg"
  },
  {
    name: "Nadia Joseph",
    zone: "Limonade",
    services: "Agent Autorisé",
    phone: "50940101002",
    photo: "Nadia.jpg"
  },
  {
    name: "Frantz Pierre",
    zone: "Quartier-Morin",
    services: "Agent Autorisé",
    phone: "50940101003",
    photo: "Frantz.jpg"
  },
  {
    name: "Esther Louis",
    zone: "Milot",
    services: "Agent Autorisé",
    phone: "50940101004",
    photo: "Esther.jpg"
  },
  {
    name: "Ronald Jean",
    zone: "Cap-Haïtien",
    services: "Agent Autorisé",
    phone: "50940101005",
    photo: "Ronald.jpg"
  },

  {
    name: "Sophia Bernard",
    zone: "Limonade",
    services: "Agent Autorisé",
    phone: "50940101006",
    photo: "Sophia.jpg"
  },
  {
    name: "David Charles",
    zone: "Milot",
    services: "Agent Autorisé",
    phone: "50940101007",
    photo: "David.jpg"
  },
  {
    name: "Carine Paul",
    zone: "Quartier-Morin",
    services: "Agent Autorisé",
    phone: "50940101008",
    photo: "Carine.jpg"
  },
  {
    name: "Junior Michel",
    zone: "Cap-Haïtien",
    services: "Agent Autorisé",
    phone: "50940101009",
    photo: "Junior.jpg"
  },
  {
    name: "Elodie Simon",
    zone: "Limonade",
    services: "Agent Autorisé",
    phone: "50940101010",
    photo: "Elodie.jpg"
  }
]
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
