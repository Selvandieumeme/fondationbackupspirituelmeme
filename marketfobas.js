// ==== LIS PRODUITS MANYÈL ====
// Chak pwodwi separe, modifye name, price, img manyèlman
// Tout fichye imaj yo nan menm folder ak HTML la (rasin repo)
const products = [
  { name: "Caustic Soda", price: "150.00 USD", img: "./CausticSoda.jpg" },
  { name: "Kit System Solar", price: "120.00 USD", img: "./SolarDripSystem.jfif" },
  { name: "Moules Savons", price: "70.00 USD", img: "./Moulessavons.jpg" },
  { name: "Chaudiere Savons", price: "100.00 USD", img: "./chaudieresavon.jpg" },
  { name: "Laptop HP", price: "650.00 USD", img: "./Laptop_HP.jpg" },

  { name: "Camera Espion", price: "250.00 USD", img: "./Cameraprise_espion.jpg" },
  { name: "Camera Espion Pince", price: "250.00 USD", img: "./camera_espion.jpg" },
  { name: "Camera Espion Chargeur", price: "250.00 USD", img: "./camerachargeur_espion.jpg" },
  { name: "Camera Espion Horloge", price: "250.00 USD", img: "./camerahorloge_espion.jpg" },
  { name: "Camera Espion miroir", price: "250.00 USD", img: "./cameramirroir_espion.jpg" },

  { name: "Camera Espion Montre", price: "250.00 USD", img: "./cameramontre_espion.jpg" },
  { name: "Chemise femme", price: "110.00 USD", img: "./Chemise_femme.jpg" },
  { name: "Maillot Femme", price: "70.00 USD", img: "./Maillot_femme12.jpg" },
  { name: "Pantalon Femme", price: "90.00 USD", img: "./Pantalon_femme1.jpg" },
  { name: "Pantalon Femme", price: "120.00 USD", img: "./Pantalon_femme2.jpg" },

  { name: "Habiment femme ", price: "150.00 USD", img: "./habiment complet_femme1.jpg" },
  { name: "Habiment femme", price: "150.00 USD", img: "./habiment complet_femme3.jpg" },
  { name: "Habiment femme", price: "170.00 USD", img: "./habimentcomplet_femme.jpg" },
  { name: "Maillot homme", price: "70.00 USD", img: "./maillot.jpg" },
  { name: "Maillot femme", price: "70.00 USD", img: "./maillot_femme.jpg" },

   { name: "Camera Espion ", price: "200.00 USD", img: "./Cameraboudachargeur_espion.jpg" },
  { name: "Came Espion", price: "270.00 USD", img: "./Cameralunette_espion.jpg" },
  { name: "Camera Espion", price: "250.00 USD", img: "./Cameranontre_espion.jpg" },
  { name: "Camera Espion", price: "200.00 USD", img: "./Cameraplume_espion.jpg" },
  { name: "Camera Espion", price: "350.00 USD", img: "./Cameraprise_espion1.jpg" },

  { name: "Camare Espion ", price: "270.00 USD", img: "./Camerareveil_espion.jpg" },
  { name: "Camera Espion", price: "250.00 USD", img: "./camera_espion1.jpg" },
  { name: "Camera Espion", price: "270.00 USD", img: "./camerabouteille_espion.jpg" },
  { name: "Camera Espion", price: "250.00 USD", img: "./camerabreteespion.jpg" },
  { name: "Camera Espion", price: "200.00 USD", img: "./cameraplafonye_espion.jpg" },

  { name: "Casques ", price: "250.00 USD", img: "./Casque250.jpg" },
  { name: "Laptop", price: "650.00 USD", img: "./Laoptop650.jpg" },
  { name: "Laptop", price: "400.00 USD", img: "./Laptop400.jpg" },
  { name: "Laptop", price: "450.00 USD", img: "./Laptop450.jpg" },
  { name: "Laptop", price: "450.00 USD", img: "./Laptop_HP.jpg" },

  { name: "Harmonica ", price: "100.00 USD", img: "./SWANHarmonicade_blues.jpg" },
  { name: "Saxophone", price: "450.00 USD", img: "./Saxophone450.jpg" },
  { name: "Trompette", price: "650.00 USD", img: "./Trompette650.jpg" },
  { name: "Trompette", price: "320.00 USD", img: "./Trompette_320.jpg" },
  { name: "Trompette", price: "150.00 USD", img: "./trompette150.jpg" },

  { name: "Trompette ", price: "200.00 USD", img: "./trompette200.jpg" },
  { name: "Trompette", price: "220.00 USD", img: "./trompette220.jpg" },
  { name: "Trompette", price: "230.00 USD", img: "./trompette230.jpg" },
  { name: "Trompette", price: "270.00 USD", img: "./trompette270.jpg" },
  { name: "Trompette", price: "400.00 USD", img: "./trompette400.jpg" },

  { name: "Trompette ", price: "140.00 USD", img: "./trompette_140.jpg" },
  { name: "Trompette", price: "220.00 USD", img: "./trompette_220.jpg" },
  { name: "Trompette", price: "250.00 USD", img: "./trompette_250.jpg" },
  { name: "Trompette", price: "350.00 USD", img: "./trompette_350.jpg" },
  { name: "Trompette", price: "400.00 USD", img: "./trompette_400.jpg" },

  { name: "Trompette ", price: "230.00 USD", img: "./trompettea230.jpg" },
  { name: "Trompette", price: "320.00 USD", img: "./trompettee_320.jpg" },
  { name: "Trombone", price: "320.00 USD", img: "./trombonne320.jpg" },
  { name: "Trombone", price: "350.00 USD", img: "./trombonne350.jpg" },
  { name: "Trombone", price: "320.00 USD", img: "./trombonne_320.jpg" },

  { name: "Machine a coudre ", price: "300.00 USD", img: "./machineacoudre3000.jpg" },
  { name: "Machine a coudre", price: "400.00 USD", img: "./machineacoudre400.jpg" },
  { name: "Machine a coudre", price: "450.00 USD", img: "./machineacoudre450.jpg" },
  { name: "Machine a coudre", price: "750.00 USD", img: "./machineacoudre750.jpg" },
  { name: "Machine a coudre", price: "150.00 USD", img: "./machineacoudre_protable.jpg" },

  { name: "2 bouches tuyaux ", price: "80.00 USD", img: "./2bouchetuyaux80.jpg" },
  { name: "4 bouches tuyaux", price: "100.00 USD", img: "./4bouchestuyaux100.jpg" },
  { name: "AED Trainer XFT", price: "210.00 USD", img: "./AEDTrainerXFT210.jpg" },
  { name: "Appareil utile hospital", price: "200.00 USD", img: "./Appareilutilhospital.jpg" },
  { name: "Defibrillateur", price: "460.00 USD", img: "./DefibrillatorCarryBag460.jpg" },

  { name: "Fleurs apres arrosage ", price: "0.00 USD", img: "./Fleursapresarosagesolar.jpg" },
  { name: "Brasrobots restaurant", price: "350.00 USD", img: "./brasrobotrestaurant350.jpg" },
  { name: "Cardia Mobile", price: "80.00 USD", img: "./cardiamobile_80.jpg" },
  { name: "LabInfrared Sterilizer", price: "220.00 USD", img: "./LabInfraredSterilizer220.jpg" },
  { name: "kitpot plant moderne", price: "250.00 USD", img: "./kitpotplantmoderne250.jpg" },

  { name: "model solar plant ", price: "0.00 USD", img: "./modelessistemsolarplant.jpg" },
  { name: "Model Solar Plant", price: "0.00 USD", img: "./modelssistemsolarplant.jpg" },
  { name: "model tube jardin", price: "0.00 USD", img: "./modelstubesjardin.jpg" },
  { name: "model tube plante", price: "0.00 USD", img: "./modelstubesplants.jpg" },
  { name: "model tube plante", price: "0.00 USD", img: "./modelstubesplantssolar.jpg" },

  { name: "Nasal cannula", price: "75.00 USD", img: "./Nasalcannula_75.jpg" },
  { name: "Nasal cannula model", price: "0.00 USD", img: "./Nasalcannulamodel.jpg" },
  { name: "Nebulizer Machine", price: "150.00 USD", img: "./NebulizerMachine150.jpg" },
  { name: "Negative Pressure", price: "220.00 USD", img: "./NegativePressure220.jpg" },
  { name: "Pro Dental Surgical", price: "320.00 USD", img: "./PRODental_Surgical320.jpg" },

  { name: "Portable Nebulizer", price: "150.00 USD", img: "./PortableNebulizer150.jpg" },
  { name: "Robot restaurant", price: "14 000.00 USD", img: "./Robotrestaurant14000.jpg" },
  { name: "Model tube", price: "0.00 USD", img: "./modelstubessistemsolarplants.jpg" },
  { name: "model tuyaux", price: "0.00 USD", img: "./modeltuyauxjardin.jpg" },
  { name: "resultat solar plant", price: "0.00 USD", img: "./resultatsolarplant.jpg" },

  { name: "robot chien", price: "650.00 USD", img: "./robotchien650.jpg" },
  { name: "robot chien", price: "7 000.00 USD", img: "./robotchienintelligent7000.jpg" },
  { name: "robot cuisine", price: "3 000.00 USD", img: "./robotcuisine3000.jpg" },
  { name: "robot hotel", price: "14 000.00 USD", img: "./robothotel_14000.jpg" },
  { name: "robot intelligent", price: "4 000.00 USD", img: "./robotintelligent4000.jpg" },

  { name: "sistem solar plant", price: "170.00 USD", img: "./sistemsolarplant170.jpg" },
  { name: "tubes", price: "50.00 USD", img: "./tubes50.jpg" },
  { name: "Model tube", price: "0.00 USD", img: "./tubesistemsolarplant.png" },
  { name: "model tube", price: "0.00 USD", img: "./tubesolarplant.jpg" },
  { name: "Tube solar plant", price: "100.00 USD", img: "./tubesplants100.jpg" },

  { name: "tube plante", price: "160.00 USD", img: "./tubessistemplant160.jpg" },
  { name: "model tube", price: "0.00 USD", img: "./tubessistemsolarplant.jpg" },
  { name: "Tube solar plant", price: "100.00 USD", img: "./tubesspecialejardin.png" },
  { name: "2 babydolls", price: "120.00 USD", img: "./2babydolls120.jpg" },
  { name: "2 pieces babydolls", price: "110.00 USD", img: "./2piecesbabydoll110.jpg" },

  { name: "2 pieces babydolls", price: "120.00 USD", img: "./2piecesbabydoll120.jpg" },
  { name: "2 pieces chemise denuit", price: "110.00 USD", img: "./2pieceschemisedenuit110.jpg" },
  { name: "2 pieces chemise denuit", price: "150.00 USD", img: "./2pieceschemisedenuit150.jp" },
  { name: "2 pieces fille", price: "80.00 USD", img: "./2piecesfille80.jpg" },
  { name: "2 pieces robekimono", price: "120.00 USD", img: "./2piecesrobekimono120.jpg" },

  { name: "2 pieces robeskimono", price: "110.00 USD", img: "./2piecesrobeskimono110.jpg" },
  { name: "3 pieces babydoll", price: "110.00 USD", img: "./3piecesbabydoll110.jpg" },
  { name: "3 pieces babydoll", price: "130.00 USD", img: "./3piecesbabydoll130.jpg" },
  { name: "3 pieces lacebabydoll", price: "110.00 USD", img: "./3pieceslacebabydoll110.jpg" },
  { name: "3 pieces robeskimono", price: "110.00 USD", img: "./3piecesrobeskimono110.jpg" },

  { name: "3 pieces sexyfuzzy", price: "110.00 USD", img: "./3piecessecyfuzzy110.jpg" },
  { name: "4 pices babydoll", price: "120.00 USD", img: "./4picesbabydoll120.jpg" },
  { name: "4 pieces chemise denuit", price: "130.00 USD", img: "./4pieceschemisedenuit130.jpg" },
  { name: "Chemise de nuit", price: "120.00 USD", img: "./Chemisedenuit120.jpg" },
  { name: "Robe Babydoll Sexy", price: "110.00 USD", img: "./RobeBabydollSexy110.jpg" },

  { name: "babydoll", price: "120.00 USD", img: "./babydoll120.jpg" },
  { name: "babydoll", price: "150.00 USD", img: "./babydoll150.jpg" },
  { name: "babydoll", price: "170.00 USD", img: "./babydoll170.jpg" },
  { name: "babydoll", price: "80.00 USD", img: "./babydoll80.jpg" },
  { name: "babydoll", price: "100.00 USD", img: "./babydollbe100.jpg" },

  { name: "babydoll", price: "130.00 USD", img: "./babydollclassic130.jpg" },
  { name: "babydoll", price: "80.00 USD", img: "./babydolle80.jpg" },
  { name: "babydoll", price: "80.00 USD", img: "./babydolleee80.jpg" },
  { name: "babydoll", price: "120.00 USD", img: "./babydolll120.jpg" },
  { name: "babydoll", price: "100.00 USD", img: "./babydolllle100.jpg" },

  { name: "babydoll", price: "80.00 USD", img: "./babydolllle80.jpg" },
  { name: "babydoll", price: "120.00 USD", img: "./babydollllle120.jpg" },
  { name: "babydoll", price: "120.00 USD", img: "./babydollllll120.jpg" },
  { name: "babydoll", price: "100.00 USD", img: "./babydollmigonne100.jpg" },
  { name: "babydoll", price: "100.00 USD", img: "./babydollmosaic100.jpg" },

  { name: "babydoll", price: "100.00 USD", img: "./babydollsexy100.jpg" },
  { name: "babydoll", price: "100.00 USD", img: "./babydollsexybelle100.jpg" },
  { name: "babydoll", price: "190.00 USD", img: "./babydollsexybellle100.jpg" },
  { name: "babydoll", price: "100.00 USD", img: "./babydolsbelles100.jpg" },
  { name: "babydoll", price: "100.00 USD", img: "./babydouce100.jpg" },

  { name: "chemise de nuit", price: "100.00 USD", img: "./chemisedenuit100.jpg" },
  { name: "chemise de nuit", price: "100.00 USD", img: "./chemisedenuitbel100.jpg" },
  { name: "chemise de nuit", price: "100.00 USD", img: "./chemisedenuitbelle100.jpg" },
  { name: "chemise de nuit", price: "100.00 USD", img: "./chemisedenuitmoderne100.jpg" },
  { name: "Chemise de nuit", price: "100.00 USD", img: "./chemiseracerback100.jpg" },

  { name: "habiment complet femme", price: "170.00 USD", img: "./habimentscomplescouple170.jpg" },
  { name: "Jacket complet", price: "170.00 USD", img: "./kacketcomplet170.jpg" },
  { name: "Robe moderne", price: "100.00 USD", img: "./modernerobe100.jpg" },
  { name: "Robe moderne", price: "120.00 USD", img: "./modernerobe120.jpg" },
  { name: "Robe", price: "80.00 USD", img: "./robe80.jpg" },

  { name: "Robe babydoll", price: "110.00 USD", img: "./robebabydoll110.jpg" },
  { name: "Robe babydoll", price: "120.00 USD", img: "./robebabydoll120.jpg" },
  { name: "Robe", price: "90.00 USD", img: "./robebelllee90.jpg" },
  { name: "Robe", price: "250.00 USD", img: "./robelingerie250.jpg" },
  { name: "Robe longue", price: "150.00 USD", img: "./robelongue150.jpg" },

  { name: "Robe longue", price: "170.00 USD", img: "./robelongue170.jpg" },
  { name: "Robe longue", price: "150.00 USD", img: "./robelongues150.jpg" },
  { name: "Robe", price: "100.00 USD", img: "./robes100.jpg" },
  { name: "Robe", price: "100.00 USD", img: "./robesatin100.jpg" },
  { name: "Robe", price: "130.00 USD", img: "./robeslongue130.jpg" }

];

// ==== AFICHE PRODUIT NAN HTML ====
// Kenbe 5 pwodwi pa ranje (lin) ak menm fòm layout
const container = document.getElementById("product-container");

products.forEach((prod, index) => {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
    <img src="${prod.img}" alt="${prod.name}">
    <h3>${prod.name}</h3>
    <p>${prod.price}</p>
    <button class="buy-btn" data-index="${index}">Acheter</button>
  `;

  container.appendChild(card);
});

// ==== MODAL PEMAN ====
const modal = document.getElementById("payment-modal");
const closeBtn = document.querySelector(".close");
const paypalBtn = document.getElementById("paypal-btn");

// Louvri modal lè yo klike sou bouton "Acheter"
document.querySelectorAll(".buy-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const index = e.target.dataset.index;
    const prod = products[index];
    modal.style.display = "block";

    modal.querySelector("h2").textContent = `Acheter: ${prod.name}`;
  });
});

// Fè modal fèmen
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; }

// Paypal redireksyon otomatik
paypalBtn.onclick = () => {
  window.location.href = "https://www.paypal.com/donate?hosted_button_id=YOUR_BUTTON_ID";
};
