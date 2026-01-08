const agentsContainer = document.getElementById("agentsContainer");

const agentsData = {
  Ouest: [
    {
      name: "Jean Michel",
      address: "Delmas 33, Port-au-Prince",
      whatsapp: "50946057952",
      photos: [
        "agent1-1.jpg",
        "agent1-2.jpg",
        "agent1-3.jpg",
        "agent1-4.jpg",
        "agent1-5.jpg"
      ]
    }
  ]
};

document.querySelectorAll(".dept-buttons button").forEach(btn => {
  btn.addEventListener("click", () => {
    const dept = btn.dataset.dept;
    displayAgents(dept);
  });
});

function displayAgents(dept) {
  agentsContainer.innerHTML = "";

  if(!agentsData[dept]) {
    agentsContainer.innerHTML = "<p>Aucun agent disponible pour ce département.</p>";
    return;
  }

  agentsData[dept].forEach(agent => {
    const card = document.createElement("div");
    card.className = "agent-card";

    card.innerHTML = `
      <img src="${agent.photos[0]}" alt="${agent.name}">
      <h4>${agent.name}</h4>
      <p>${agent.address}</p>
      <a href="https://wa.me/${agent.whatsapp}" target="_blank">WhatsApp</a>
    `;

    agentsContainer.appendChild(card);
  });
}
