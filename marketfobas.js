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
  { name: "Camera Espion", price: "250.00 USD", img: "./camerabrete;_espion.jpg" },
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
  { name: "Trompette", price: 1500.00 USD", img: "./trompette150.jpg" }.

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
  { name: "Trombone", price: "320.00 USD", img: "./trombonne_320.jpg" }
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
