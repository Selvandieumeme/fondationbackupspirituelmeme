// =======================
// DONNÉES AGENTS PAR DÉPARTEMENT
// =======================

const agentsFOBAS = {
  "Ouest": [
  // Bloc 1
  [
    {
      nom: "M. MEME Selvandieu",
      email: "memeselvandieu@fobas.com",
      adresse: "Rue la Paix, Mare-Rouge",
      whatsapp: "50946057952",
      services: ["Dépôt"],
      photos: ["MEMESEL.jpg"]
    },
    {
      nom: "Agent O1-2",
      email: "o1-2@walletfobas.com",
      adresse: "Ouest 2",
      whatsapp: "5090000002",
      services: ["Retrait"],
      photos: ["agents/o2-1.jpg"]
    },
    {
      nom: "Agent O1-3",
      email: "o1-3@walletfobas.com",
      adresse: "Ouest 3",
      whatsapp: "5090000003",
      services: ["Transfert"],
      photos: ["agents/o3-1.jpg"]
    },
    {
      nom: "Agent O1-4",
      email: "o1-4@walletfobas.com",
      adresse: "Ouest 4",
      whatsapp: "5090000004",
      services: ["Dépôt", "Retrait"],
      photos: ["agents/o4-1.jpg"]
    },
    {
      nom: "Agent O1-5",
      email: "o1-5@walletfobas.com",
      adresse: "Ouest 5",
      whatsapp: "5090000005",
      services: ["Transfert", "Retrait"],
      photos: ["agents/o5-1.jpg"]
    }
  ],

  // Bloc 2
  [
    {
      nom: "Agent O2-1",
      email: "o2-1@walletfobas.com",
      adresse: "Ouest 6",
      whatsapp: "5090000010",
      services: ["Dépôt"],
      photos: ["agents/o6-1.jpg"]
    },
    {
      nom: "Agent O2-2",
      email: "o2-2@walletfobas.com",
      adresse: "Ouest 7",
      whatsapp: "5090000011",
      services: ["Retrait"],
      photos: ["agents/o7-1.jpg"]
    },
    {
      nom: "Agent O2-3",
      email: "o2-3@walletfobas.com",
      adresse: "Ouest 8",
      whatsapp: "5090000012",
      services: ["Transfert"],
      photos: ["agents/o8-1.jpg"]
    },
    {
      nom: "Agent O2-4",
      email: "o2-4@walletfobas.com",
      adresse: "Ouest 9",
      whatsapp: "5090000013",
      services: ["Dépôt", "Retrait"],
      photos: ["agents/o9-1.jpg"]
    },
    {
      nom: "Agent O2-5",
      email: "o2-5@walletfobas.com",
      adresse: "Ouest 10",
      whatsapp: "5090000014",
      services: ["Transfert", "Retrait"],
      photos: ["agents/o10-1.jpg"]
    }
  ]
],

  "Nord-Ouest": [
  // Bloc 1
  [
    {
      nom: "M. MEME Selvandieu",
      email: "memeselvandieu@fobas.com",
      adresse: "Rue la Paix, Mare-Rouge",
      whatsapp: "50946057952",
      services: ["Dépôt"],
      photos: ["MEMESEL.jpg"]
    },
    {
      nom: "Agent O1-2",
      email: "o1-2@walletfobas.com",
      adresse: "Nord-Ouest 2",
      whatsapp: "5090000002",
      services: ["Retrait"],
      photos: ["agents/o2-1.jpg"]
    },
    {
      nom: "Agent O1-3",
      email: "o1-3@walletfobas.com",
      adresse: "Nord-Ouest 3",
      whatsapp: "5090000003",
      services: ["Transfert"],
      photos: ["agents/o3-1.jpg"]
    },
    {
      nom: "Agent O1-4",
      email: "o1-4@walletfobas.com",
      adresse: "Nord-Ouest 4",
      whatsapp: "5090000004",
      services: ["Dépôt", "Retrait"],
      photos: ["agents/o4-1.jpg"]
    },
    {
      nom: "Agent O1-5",
      email: "o1-5@walletfobas.com",
      adresse: "Nord-Ouest 5",
      whatsapp: "5090000005",
      services: ["Transfert", "Retrait"],
      photos: ["agents/o5-1.jpg"]
    }
  ],

  // Bloc 2
  [
    {
      nom: "Agent O2-1",
      email: "o2-1@walletfobas.com",
      adresse: "Nord-Ouest 6",
      whatsapp: "5090000010",
      services: ["Dépôt"],
      photos: ["agents/o6-1.jpg"]
    },
    {
      nom: "Agent O2-2",
      email: "o2-2@walletfobas.com",
      adresse: "Nord-Ouest 7",
      whatsapp: "5090000011",
      services: ["Retrait"],
      photos: ["agents/o7-1.jpg"]
    },
    {
      nom: "Agent O2-3",
      email: "o2-3@walletfobas.com",
      adresse: "Nord-Ouest 8",
      whatsapp: "5090000012",
      services: ["Transfert"],
      photos: ["agents/o8-1.jpg"]
    },
    {
      nom: "Agent O2-4",
      email: "o2-4@walletfobas.com",
      adresse: "Nord-Ouest 9",
      whatsapp: "5090000013",
      services: ["Dépôt", "Retrait"],
      photos: ["agents/o9-1.jpg"]
    },
    {
      nom: "Agent O2-5",
      email: "o2-5@walletfobas.com",
      adresse: "Nord-Ouest 10",
      whatsapp: "5090000014",
      services: ["Transfert", "Retrait"],
      photos: ["agents/o10-1.jpg"]
    }
  ]
],
};

// =======================
// FONKSYON POU CHAJÉ AGENTS NAN DOM
// =======================

function loadDept(dept, container) {
  if (!container) {
    console.error("Erreur: container pa defini pou loadDept");
    return;
  }

  container.innerHTML = "";

  if (!agentsFOBAS[dept] || agentsFOBAS[dept].length === 0) {
    container.innerHTML = `<p>Aucun agent disponible pour ${dept}</p>`;
    return;
  }

  agentsFOBAS[dept].forEach((blocAgents, indexBloc) => {
    const blockDiv = document.createElement("div");
    blockDiv.className = "agents-block";
    blockDiv.innerHTML = `<h3>Bloc ${indexBloc + 1}</h3>`;

    blocAgents.forEach(agent => {
  // pran sèlman premye foto chak agent
  let photo = agent.photos && agent.photos.length
  ? agent.photos[0]
  : "agents/placeholder.jpg";

  blockDiv.innerHTML += `
    <div class="agent-card">
      <img src="${photo}" alt="${agent.nom}">
      <div class="agent-name">${agent.nom}</div>
      <div class="agent-email">📧 <a href="mailto:${agent.email}">${agent.email}</a></div>
      <div class="agent-address">${agent.adresse}</div>
      <div class="services">Services : ${agent.services.join(" • ")}</div>
      <a class="whatsapp" href="https://wa.me/${agent.whatsapp}" target="_blank">Contacter via WhatsApp</a>
    </div>
  `;
});
    container.appendChild(blockDiv);
  });
}
