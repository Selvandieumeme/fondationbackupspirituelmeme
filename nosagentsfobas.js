// =======================
// DONNÉES AGENTS PAR DÉPARTEMENT
// =======================

const agentsFOBAS = {
  "Ouest": [
    // Bloc 1
    [
      { nom: "Agent O1-1", email: "o1-1@walletfobas.com", adresse: "Ouest 1", whatsapp: "5090000001", services: ["Dépôt"], photos:["agents/o1-1.jpg","agents/o1-2.jpg","agents/o1-3.jpg","agents/o1-4.jpg","agents/o1-5.jpg"] },
      { nom: "Agent O1-2", email: "o1-2@walletfobas.com", adresse: "Ouest 2", whatsapp: "5090000002", services: ["Retrait"], photos:["agents/o2-1.jpg","agents/o2-2.jpg","agents/o2-3.jpg","agents/o2-4.jpg","agents/o2-5.jpg"] },
      { nom: "Agent O1-3", email: "o1-3@walletfobas.com", adresse: "Ouest 3", whatsapp: "5090000003", services: ["Transfert"], photos:["agents/o3-1.jpg","agents/o3-2.jpg","agents/o3-3.jpg","agents/o3-4.jpg","agents/o3-5.jpg"] },
      { nom: "Agent O1-4", email: "o1-4@walletfobas.com", adresse: "Ouest 4", whatsapp: "5090000004", services: ["Dépôt","Retrait"], photos:["agents/o4-1.jpg","agents/o4-2.jpg","agents/o4-3.jpg","agents/o4-4.jpg","agents/o4-5.jpg"] },
      { nom: "Agent O1-5", email: "o1-5@walletfobas.com", adresse: "Ouest 5", whatsapp: "5090000005", services: ["Transfert","Retrait"], photos:["agents/o5-1.jpg","agents/o5-2.jpg","agents/o5-3.jpg","agents/o5-4.jpg","agents/o5-5.jpg"] }
    ],
    // Bloc 2
    [
      { nom: "Agent O2-1", email: "o2-1@walletfobas.com", adresse: "Ouest 6", whatsapp: "5090000010", services: ["Dépôt"], photos:["agents/o6-1.jpg","agents/o6-2.jpg","agents/o6-3.jpg","agents/o6-4.jpg","agents/o6-5.jpg"] },
      { nom: "Agent O2-2", email: "o2-2@walletfobas.com", adresse: "Ouest 7", whatsapp: "5090000011", services: ["Retrait"], photos:["agents/o7-1.jpg","agents/o7-2.jpg","agents/o7-3.jpg","agents/o7-4.jpg","agents/o7-5.jpg"] },
      { nom: "Agent O2-3", email: "o2-3@walletfobas.com", adresse: "Ouest 8", whatsapp: "5090000012", services: ["Transfert"], photos:["agents/o8-1.jpg","agents/o8-2.jpg","agents/o8-3.jpg","agents/o8-4.jpg","agents/o8-5.jpg"] },
      { nom: "Agent O2-4", email: "o2-4@walletfobas.com", adresse: "Ouest 9", whatsapp: "5090000013", services: ["Dépôt","Retrait"], photos:["agents/o9-1.jpg","agents/o9-2.jpg","agents/o9-3.jpg","agents/o9-4.jpg","agents/o9-5.jpg"] },
      { nom: "Agent O2-5", email: "o2-5@walletfobas.com", adresse: "Ouest 10", whatsapp: "5090000014", services: ["Transfert","Retrait"], photos:["agents/o10-1.jpg","agents/o10-2.jpg","agents/o10-3.jpg","agents/o10-4.jpg","agents/o10-5.jpg"] }
    ],
    // Bloc 3,4,5 ... ajouter selon besoin
  ],

  "Nord-Ouest": [
    // Bloc 1
    [
      { nom: "Agent N1-1", email: "n1-1@walletfobas.com", adresse: "Nord-Ouest 1", whatsapp: "5091000001", services: ["Dépôt"], photos:["agents/n1-1.jpg","agents/n1-2.jpg","agents/n1-3.jpg","agents/n1-4.jpg","agents/n1-5.jpg"] },
      { nom: "Agent N1-2", email: "n1-2@walletfobas.com", adresse: "Nord-Ouest 2", whatsapp: "5091000002", services: ["Retrait"], photos:["agents/n2-1.jpg","agents/n2-2.jpg","agents/n2-3.jpg","agents/n2-4.jpg","agents/n2-5.jpg"] },
      { nom: "Agent N1-3", email: "n1-3@walletfobas.com", adresse: "Nord-Ouest 3", whatsapp: "5091000003", services: ["Transfert"], photos:["agents/n3-1.jpg","agents/n3-2.jpg","agents/n3-3.jpg","agents/n3-4.jpg","agents/n3-5.jpg"] },
      { nom: "Agent N1-4", email: "n1-4@walletfobas.com", adresse: "Nord-Ouest 4", whatsapp: "5091000004", services: ["Dépôt","Retrait"], photos:["agents/n4-1.jpg","agents/n4-2.jpg","agents/n4-3.jpg","agents/n4-4.jpg","agents/n4-5.jpg"] },
      { nom: "Agent N1-5", email: "n1-5@walletfobas.com", adresse: "Nord-Ouest 5", whatsapp: "5091000005", services: ["Transfert","Retrait"], photos:["agents/n5-1.jpg","agents/n5-2.jpg","agents/n5-3.jpg","agents/n5-4.jpg","agents/n5-5.jpg"] }
    ],
    // Bloc 2,3,4,5 ...
  ],










function loadDept(dept) {
  const container = document.getElementById("agentsContainer");
  container.innerHTML = "";

  if (!agentsFOBAS[dept] || agentsFOBAS[dept].length === 0) {
    container.innerHTML = `<p>Aucun agent disponible pour ${dept}</p>`;
    return;
  }

  // Chak blok
  agentsFOBAS[dept].forEach((blocAgents, indexBloc) => {
    const blockDiv = document.createElement("div");
    blockDiv.className = "agents-block";
    blockDiv.innerHTML = `<h3>Bloc ${indexBloc + 1}</h3>`;

    blocAgents.forEach(agent => {
      const photosHTML = agent.photos.map(p => `<img src="${p}" alt="${agent.nom}">`).join("");
      blockDiv.innerHTML += `
        <div class="agent-card">
          <div class="agent-name">${agent.nom}</div>
          <div class="agent-email">📧 <a href="mailto:${agent.email}">${agent.email}</a></div>
          <div class="agent-address">${agent.adresse}</div>
          <div class="photos">${photosHTML}</div>
          <div class="services">Services : ${agent.services.join(" • ")}</div>
          <a class="whatsapp" href="https://wa.me/${agent.whatsapp}" target="_blank">Contacter via WhatsApp</a>
        </div>
      `;
    });

    container.appendChild(blockDiv);
  });
}
  // Ajouter tous lòt 8 depatman menm jan ak 5 blok
};
