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
  { name: "Maillot femme", price: "70.00 USD", img: "./maillot_femme.jpg" }
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
