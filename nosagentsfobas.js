const agentsFOBAS = {
  "Nord-Ouest": [
    {
      nom: "Pierre Joseph",
      adresse: "Mare-Rouge, Nord-Ouest",
      whatsapp: "50946057952",
      services: ["Dépôt", "Retrait", "Transfert"],
      photos: [
        "agents/pierre1.jpg",
        "agents/pierre2.jpg",
        "agents/pierre3.jpg",
        "agents/pierre4.jpg",
        "agents/pierre5.jpg"
      ]
    }
  ],

  "Ouest": [
    {
      nom: "Sandra Louis",
      adresse: "Delmas 75, Ouest",
      whatsapp: "50937000000",
      services: ["Dépôt", "Transfert"],
      photos: [
        "agents/sandra1.jpg",
        "agents/sandra2.jpg",
        "agents/sandra3.jpg",
        "agents/sandra4.jpg",
        "agents/sandra5.jpg"
      ]
    }
  ]
};

function loadDept(dept) {
  const container = document.getElementById("agentsContainer");
  container.innerHTML = "";

  if (!agentsFOBAS[dept]) {
    container.innerHTML = `<p>Aucun agent disponible pour ${dept}</p>`;
    return;
  }

  agentsFOBAS[dept].forEach(agent => {
    const photosHTML = agent.photos.map(p => `<img src="${p}">`).join("");

    container.innerHTML += `
      <div class="agent-card">
        <div class="agent-name">${agent.nom}</div>
        <div class="agent-address">${agent.adresse}</div>

        <div class="photos">
          ${photosHTML}
        </div>

        <div class="services">
          Services : ${agent.services.join(" • ")}
        </div>

        <a class="whatsapp" href="https://wa.me/${agent.whatsapp}" target="_blank">
          Contacter via WhatsApp
        </a>
      </div>
    `;
  });
}
