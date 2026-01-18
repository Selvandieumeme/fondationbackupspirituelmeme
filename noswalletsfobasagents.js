const departments = [
  "Artibonite","Centre","Grand'Anse","Nippes","Nord",
  "Nord-Est","Nord-Ouest","Ouest","Sud","Sud-Est"
];

const agentsData = {
 "Ouest": [
  { name:"Marie Ange Noe", zone:"Petion-Ville", services:"Representante Commune Petion-Ville", phone:"50949451734", photo:"MarieNoePV.jpg" },
  { name:"Chery Sterline", zone:"Delmas", services:"Representante Commune Delmas", phone:"509111111111", photo:"Sterlinechery.jpg" },
  { name:"Delvas Joel", zone:"Santo 19, Croix-des-Bouquets", services:"Manager Ouest", phone:"50922222222", photo:"Delvasjoel.jpg" },
  { name:"Michel Joseph", zone:"Carrefour", services:"Agent Autorisé", phone:"50933333333", photo:"Michel.jpg" },
  { name:"Sophie Laurent", zone:"Pétion-Ville", services:"Agent Autorisé", phone:"50944444444", photo:"Sophie.jpg" },
  { name:"Patrick Simon", zone:"Delmas", services:"Agent Autorisé", phone:"50955555555", photo:"Patrick.jpg" },
  { name:"Isabelle François", zone:"Tabarre", services:"Agent Autorisé", phone:"50966666666", photo:"Isabelle.jpg" },
  { name:"Louis Bernard", zone:"Croix-des-Bouquets", services:"Agent Autorisé", phone:"50977777777", photo:"Louis.jpg" },
  { name:"Carla Dupont", zone:"Carrefour", services:"Agent Autorisé", phone:"50988888888", photo:"Carla.jpg" },
  { name:"Jean-Marie Pierre", zone:"Delmas", services:"Agent Autorisé", phone:"50999999999", photo:"JeanMarie.jpg" }
],

"Nord": [
  { name:"Wilner Desrosiers", zone:"Cap-Haïtien", services:"Agent Autorisé", phone:"50940101001", photo:"Wilner.jpg" },
  { name:"Nadia Joseph", zone:"Limonade", services:"Agent Autorisé", phone:"50940101002", photo:"Nadia.jpg" },
  { name:"Frantz Pierre", zone:"Quartier-Morin", services:"Agent Autorisé", phone:"50940101003", photo:"Frantz.jpg" },
  { name:"Esther Louis", zone:"Milot", services:"Agent Autorisé", phone:"50940101004", photo:"Esther.jpg" },
  { name:"Ronald Jean", zone:"Cap-Haïtien", services:"Agent Autorisé", phone:"50940101005", photo:"Ronald.jpg" },
  { name:"Sophia Bernard", zone:"Limonade", services:"Agent Autorisé", phone:"50940101006", photo:"Sophia.jpg" },
  { name:"David Charles", zone:"Milot", services:"Agent Autorisé", phone:"50940101007", photo:"David.jpg" },
  { name:"Carine Paul", zone:"Quartier-Morin", services:"Agent Autorisé", phone:"50940101008", photo:"Carine.jpg" },
  { name:"Junior Michel", zone:"Cap-Haïtien", services:"Agent Autorisé", phone:"50940101009", photo:"Junior.jpg" },
  { name:"Elodie Simon", zone:"Limonade", services:"Agent Autorisé", phone:"50940101010", photo:"Elodie.jpg" }
],

"Artibonite": [
  { name:"Renald Toussaint", zone:"Gonaïves", services:"Agent Autorisé", phone:"50940202001", photo:"Renald.jpg" },
  { name:"Myrlande Jean", zone:"Saint-Marc", services:"Agent Autorisé", phone:"50940202002", photo:"Myrlande.jpg" },
  { name:"Kervens Paul", zone:"Dessalines", services:"Agent Autorisé", phone:"50940202003", photo:"Kervens.jpg" },
  { name:"Judith Pierre", zone:"Petite-Rivière", services:"Agent Autorisé", phone:"50940202004", photo:"Judith.jpg" },
  { name:"Samuel Noel", zone:"Gonaïves", services:"Agent Autorisé", phone:"50940202005", photo:"Samuel.jpg" },
  { name:"Caroline Michel", zone:"Saint-Marc", services:"Agent Autorisé", phone:"50940202006", photo:"Caroline.jpg" },
  { name:"Richard Joseph", zone:"Dessalines", services:"Agent Autorisé", phone:"50940202007", photo:"Richard.jpg" },
  { name:"Elena Bernard", zone:"Petite-Rivière", services:"Agent Autorisé", phone:"50940202008", photo:"Elena.jpg" },
  { name:"Fritz Daniel", zone:"Gonaïves", services:"Agent Autorisé", phone:"50940202009", photo:"Fritz.jpg" },
  { name:"Sabrina Louis", zone:"Saint-Marc", services:"Agent Autorisé", phone:"50940202010", photo:"Sabrina.jpg" }
],

"Centre": [
  { name:"Jonas Pierre", zone:"Hinche", services:"Agent Autorisé", phone:"50940303001", photo:"Jonas.jpg" },
  { name:"Micheline Paul", zone:"Mirebalais", services:"Agent Autorisé", phone:"50940303002", photo:"Micheline.jpg" },
  { name:"Alix Joseph", zone:"Cerca-la-Source", services:"Agent Autorisé", phone:"50940303003", photo:"Alix.jpg" },
  { name:"Nancy Charles", zone:"Hinche", services:"Agent Autorisé", phone:"50940303004", photo:"Nancy.jpg" },
  { name:"Patrick Noel", zone:"Mirebalais", services:"Agent Autorisé", phone:"50940303005", photo:"PatrickC.jpg" },
  { name:"Sonia Pierre", zone:"Cerca-la-Source", services:"Agent Autorisé", phone:"50940303006", photo:"Sonia.jpg" },
  { name:"Wilson Jean", zone:"Hinche", services:"Agent Autorisé", phone:"50940303007", photo:"Wilson.jpg" },
  { name:"Rose Michel", zone:"Mirebalais", services:"Agent Autorisé", phone:"50940303008", photo:"Rose.jpg" },
  { name:"Kevin Louis", zone:"Cerca-la-Source", services:"Agent Autorisé", phone:"50940303009", photo:"Kevin.jpg" },
  { name:"Judeline Paul", zone:"Hinche", services:"Agent Autorisé", phone:"50940303010", photo:"Judeline.jpg" }
],

"Grand'Anse": [
  { name:"Alexandre Noel", zone:"Jérémie", services:"Agent Autorisé", phone:"50940404001", photo:"Alexandre.jpg" },
  { name:"Marlene Pierre", zone:"Anse-d’Hainault", services:"Agent Autorisé", phone:"50940404002", photo:"Marlene.jpg" },
  { name:"Stevens Jean", zone:"Corail", services:"Agent Autorisé", phone:"50940404003", photo:"Stevens.jpg" },
  { name:"Nadine Paul", zone:"Jérémie", services:"Agent Autorisé", phone:"50940404004", photo:"Nadine.jpg" },
  { name:"Olivier Charles", zone:"Anse-d’Hainault", services:"Agent Autorisé", phone:"50940404005", photo:"Olivier.jpg" },
  { name:"Elsa Bernard", zone:"Corail", services:"Agent Autorisé", phone:"50940404006", photo:"Elsa.jpg" },
  { name:"Patrick Louis", zone:"Jérémie", services:"Agent Autorisé", phone:"50940404007", photo:"PatrickG.jpg" },
  { name:"Carla Michel", zone:"Anse-d’Hainault", services:"Agent Autorisé", phone:"50940404008", photo:"CarlaG.jpg" },
  { name:"Junior Pierre", zone:"Corail", services:"Agent Autorisé", phone:"50940404009", photo:"JuniorG.jpg" },
  { name:"Samantha Noel", zone:"Jérémie", services:"Agent Autorisé", phone:"50940404010", photo:"Samantha.jpg" }
],

"Nippes": [
  { name:"Ronald Pierre", zone:"Miragoâne", services:"Agent Autorisé", phone:"50940505001", photo:"RonaldN.jpg" },
  { name:"Elsie Jean", zone:"Anse-à-Veau", services:"Agent Autorisé", phone:"50940505002", photo:"Elsie.jpg" },
  { name:"Marc Louis", zone:"Petit-Trou", services:"Agent Autorisé", phone:"50940505003", photo:"Marc.jpg" },
  { name:"Sonia Michel", zone:"Miragoâne", services:"Agent Autorisé", phone:"50940505004", photo:"SoniaN.jpg" },
  { name:"Fabrice Noel", zone:"Anse-à-Veau", services:"Agent Autorisé", phone:"50940505005", photo:"Fabrice.jpg" },
  { name:"Judith Pierre", zone:"Petit-Trou", services:"Agent Autorisé", phone:"50940505006", photo:"JudithN.jpg" },
  { name:"Wilson Jean", zone:"Miragoâne", services:"Agent Autorisé", phone:"50940505007", photo:"WilsonN.jpg" },
  { name:"Carine Louis", zone:"Anse-à-Veau", services:"Agent Autorisé", phone:"50940505008", photo:"CarineN.jpg" },
  { name:"Patrick Charles", zone:"Petit-Trou", services:"Agent Autorisé", phone:"50940505009", photo:"PatrickN.jpg" },
  { name:"Elodie Paul", zone:"Miragoâne", services:"Agent Autorisé", phone:"50940505010", photo:"ElodieN.jpg" }
],

"Nord-Est": [
  { name:"Daniel Pierre", zone:"Fort-Liberté", services:"Agent Autorisé", phone:"50940606001", photo:"Daniel.jpg" },
  { name:"Judeline Jean", zone:"Ouanaminthe", services:"Agent Autorisé", phone:"50940606002", photo:"JudelineNE.jpg" },
  { name:"Alfred Noel", zone:"Trou-du-Nord", services:"Agent Autorisé", phone:"50940606003", photo:"Alfred.jpg" },
  { name:"Sonia Louis", zone:"Fort-Liberté", services:"Agent Autorisé", phone:"50940606004", photo:"SoniaNE.jpg" },
  { name:"Patrick Michel", zone:"Ouanaminthe", services:"Agent Autorisé", phone:"50940606005", photo:"PatrickNE.jpg" },
  { name:"Carla Pierre", zone:"Trou-du-Nord", services:"Agent Autorisé", phone:"50940606006", photo:"CarlaNE.jpg" },
  { name:"Junior Jean", zone:"Fort-Liberté", services:"Agent Autorisé", phone:"50940606007", photo:"JuniorNE.jpg" },
  { name:"Rose Noel", zone:"Ouanaminthe", services:"Agent Autorisé", phone:"50940606008", photo:"RoseNE.jpg" },
  { name:"Kevin Louis", zone:"Trou-du-Nord", services:"Agent Autorisé", phone:"50940606009", photo:"KevinNE.jpg" },
  { name:"Marlene Charles", zone:"Fort-Liberté", services:"Agent Autorisé", phone:"50940606010", photo:"MarleneNE.jpg" }
],

"Nord-Ouest": [
  { name:"DUPRE Hilsaint", zone:"Temps Perdu, Mare Rouge", services:"Manager Nord-Ouest", phone:"50932303047", photo:"Hilsaintdupre.jpg" },
  { name:"Petide Weetbency", zone:"Bombardopolis", services:"Agent Autorisé", phone:"50943294137", photo:"Petitdewensbenleyagentbonbad.jpg" },
  { name:"Mentor Kerlin", zone:"Clenette, Bombardopolis", services:"Agent Autorisé", phone:"50932299183", photo:"MentorKerlinbonbad.jpg" },
  { name:"Sanon Pierre-Andre", zone:"Rue Bouco, Clenette", services:"Representant Commune Bombardopolis", phone:"50943428235", photo:"Sanonpierreandre.jpg" },
  { name:"Sereste Gabelus", zone:"Mare-Rouge", services:"Superviseur Nord-Ouest", phone:"50942586437", photo:"Serestegabelus.jpg" },
  { name:"Branchedor Dieuben", zone:"Rue Santrain, Mare-Rouge", services:"Agent Autorisé", phone:"50938098072", photo:"Branchedordieuben.jpg" },
  { name:"Junior Noel", zone:"Port-de-Paix", services:"Agent Autorisé", phone:"50940707007", photo:"JuniorNO.jpg" },
  { name:"Carla Louis", zone:"Saint-Louis-du-Nord", services:"Agent Autorisé", phone:"50940707008", photo:"CarlaNO.jpg" },
  { name:"Wilson Michel", zone:"Jean-Rabel", services:"Agent Autorisé", phone:"50940707009", photo:"WilsonNO.jpg" },
  { name:"Nadine Pierre", zone:"Port-de-Paix", services:"Agent Autorisé", phone:"50940707010", photo:"NadineNO.jpg" }
],

"Sud": [
  { name:"Alexis Pierre", zone:"Les Cayes", services:"Agent Autorisé", phone:"50940808001", photo:"Alexis.jpg" },
  { name:"Micheline Jean", zone:"Camp-Perrin", services:"Agent Autorisé", phone:"50940808002", photo:"MichelineS.jpg" },
  { name:"Ronald Noel", zone:"Aquin", services:"Agent Autorisé", phone:"50940808003", photo:"RonaldS.jpg" },
  { name:"Sonia Michel", zone:"Les Cayes", services:"Agent Autorisé", phone:"50940808004", photo:"SoniaS.jpg" },
  { name:"Patrick Pierre", zone:"Camp-Perrin", services:"Agent Autorisé", phone:"50940808005", photo:"PatrickS.jpg" },
  { name:"Elsa Jean", zone:"Aquin", services:"Agent Autorisé", phone:"50940808006", photo:"ElsaS.jpg" },
  { name:"Junior Noel", zone:"Les Cayes", services:"Agent Autorisé", phone:"50940808007", photo:"JuniorS.jpg" },
  { name:"Carla Michel", zone:"Camp-Perrin", services:"Agent Autorisé", phone:"50940808008", photo:"CarlaS.jpg" },
  { name:"Wilson Pierre", zone:"Aquin", services:"Agent Autorisé", phone:"50940808009", photo:"WilsonS.jpg" },
  { name:"Nadine Louis", zone:"Les Cayes", services:"Agent Autorisé", phone:"50940808010", photo:"NadineS.jpg" }
],

"Sud-Est": [
  { name:"Fabrice Jean", zone:"Jacmel", services:"Agent Autorisé", phone:"50940909001", photo:"FabriceSE.jpg" },
  { name:"Marlene Pierre", zone:"Marigot", services:"Agent Autorisé", phone:"50940909002", photo:"MarleneSE.jpg" },
  { name:"Ronald Noel", zone:"Cayes-Jacmel", services:"Agent Autorisé", phone:"50940909003", photo:"RonaldSE.jpg" },
  { name:"Sonia Michel", zone:"Jacmel", services:"Agent Autorisé", phone:"50940909004", photo:"SoniaSE.jpg" },
  { name:"Patrick Jean", zone:"Marigot", services:"Agent Autorisé", phone:"50940909005", photo:"PatrickSE.jpg" },
  { name:"Elsa Pierre", zone:"Cayes-Jacmel", services:"Agent Autorisé", phone:"50940909006", photo:"ElsaSE.jpg" },
  { name:"Junior Noel", zone:"Jacmel", services:"Agent Autorisé", phone:"50940909007", photo:"JuniorSE.jpg" },
  { name:"Carla Michel", zone:"Marigot", services:"Agent Autorisé", phone:"50940909008", photo:"CarlaSE.jpg" },
  { name:"Wilson Jean", zone:"Cayes-Jacmel", services:"Agent Autorisé", phone:"50940909009", photo:"WilsonSE.jpg" },
  { name:"Nadine Louis", zone:"Jacmel", services:"Agent Autorisé", phone:"50940909010", photo:"NadineSE.jpg" }
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
