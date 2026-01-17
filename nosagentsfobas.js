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
      services: ["Depot"],
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
      services: ["Central"], 
      photos: ["MEMESEL.jpg"]
    },
    {
      nom: "Dupre Hilsaint",
      email: "o1-2@walletfobas.com",
      adresse: "Suprendre, Mare-Rouge",
      whatsapp: "50932303047",
      services: ["MANAGER NORD-OUEST"],
      photos: ["Hilsaintdupre.jpg"]
    },
    {
      nom: "Agent O1-3",
      email: "o1-3@walletfobas.com",
      adresse: "Surprendre, Mare-Rouge",
      whatsapp: "50932303047",
      services: ["MANAGER NORD-OUEST"],
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

// Bloc 3 — Done inik pou evite doublons
[
  {
    nom: "Agent O3-1",
    email: "o3-1@walletfobas.com",
    adresse: "Nord-Ouest 11",
    whatsapp: "5090000020",
    services: ["Dépôt"],
    photos: ["agents/o11-1.jpg"]
  },
  {
    nom: "Agent O3-2",
    email: "o3-2@walletfobas.com",
    adresse: "Nord-Ouest 12",
    whatsapp: "5090000021",
    services: ["Retrait"],
    photos: ["agents/o12-1.jpg"]
  },
  {
    nom: "Agent O3-3",
    email: "o3-3@walletfobas.com",
    adresse: "Nord-Ouest 13",
    whatsapp: "5090000022",
    services: ["Transfert"],
    photos: ["agents/o13-1.jpg"]
  },
  {
    nom: "Agent O3-4",
    email: "o3-4@walletfobas.com",
    adresse: "Nord-Ouest 14",
    whatsapp: "5090000023",
    services: ["Dépôt", "Retrait"],
    photos: ["agents/o14-1.jpg"]
  },
  {
    nom: "Agent O3-5",
    email: "o3-5@walletfobas.com",
    adresse: "Nord-Ouest 15",
    whatsapp: "5090000024",
    services: ["Transfert", "Retrait"],
    photos: ["agents/o15-1.jpg"]
  }
]
],
};

// =======================
// FONKSYON POU CHAJÉ AGENTS NAN DOM
// =======================

function loadDept(dept, container) {
  if (!container) return console.error("Container pa defini");

  container.innerHTML = ""; // reset container

  if (!agentsFOBAS[dept] || agentsFOBAS[dept].length === 0) {
    container.innerHTML = `<p>Aucun agent disponible pour ${dept}</p>`;
    return;
  }

  agentsFOBAS[dept].forEach((blocAgents, indexBloc) => {
    const blockDiv = document.createElement("div");
    blockDiv.className = "agents-block";

    // Tit blòk (opsyonèl)
    const title = document.createElement("h3");
    title.textContent = `Bloc ${indexBloc + 1}`;
    blockDiv.appendChild(title);

    // Kreye grid pou chak blòk (5 kolòn fiks)
    const gridDiv = document.createElement("div");
    gridDiv.className = "agents-grid";
    gridDiv.style.gridTemplateColumns = "repeat(5, 1fr)"; // fòse 5 kolòn pa liy

    blocAgents.forEach(agent => {
      let photo = agent.photos && agent.photos.length
        ? agent.photos[0]
        : "agents/placeholder.jpg"; // fallback si pa gen imaj

      const cardHTML = `
        <div class="agent-card">
          <img src="${photo}" alt="${agent.nom}" onerror="this.src='agents/placeholder.jpg';">
          <div class="agent-name">${agent.nom}</div>
          <div class="agent-address">${agent.adresse}</div>
          <div class="services">Services: ${agent.services.join(" • ")}</div>
          <a class="whatsapp" href="https://wa.me/${agent.whatsapp}" target="_blank">
            WhatsApp
          </a>
        </div>
      `;

      gridDiv.innerHTML += cardHTML;
    });

    blockDiv.appendChild(gridDiv);
    container.appendChild(blockDiv);
  });
}

// Egzanp: chaje li nan container ki deja egziste nan HTML
const container = document.getElementById("agentsContainer");
loadDept("Ouest", container);
