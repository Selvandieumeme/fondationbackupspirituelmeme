// ==== LIS PRODUITS MANYÈL ====
// Chak pwodwi separe, modifye name, price, img manyèlman
// Tout fichye imaj yo nan menm folder ak HTML la (rasin repo)
const products = [
  { name: "Caustic Soda", price: "150.00 USD", img: "./CausticSoda.jpg" },
  { name: "Kit System Solar", price: "120.00 USD", img: "./SolarDripSystem.jfif" },
  { name: "Moules Savons", price: "100.00 USD", img: "./Moulessavons.jpg" },
  { name: "Chaudiere Savons", price: "40.00 USD", img: "./chaudieresavon.jpg" },
  { name: "Produit 5", price: "12.00 USD", img: "./produit5.jpg" },

  { name: "Produit 6", price: "20.00 USD", img: "./produit6.jpg" },
  { name: "Produit 7", price: "25.00 USD", img: "./produit7.jpg" },
  { name: "Produit 8", price: "18.00 USD", img: "./produit8.jpg" },
  { name: "Produit 9", price: "22.00 USD", img: "./produit9.jpg" },
  { name: "Produit 10", price: "35.00 USD", img: "./produit10.jpg" },

  { name: "Produit 11", price: "27.00 USD", img: "./produit11.jpg" },
  { name: "Produit 12", price: "33.00 USD", img: "./produit12.jpg" },
  { name: "Produit 13", price: "19.00 USD", img: "./produit13.jpg" },
  { name: "Produit 14", price: "28.00 USD", img: "./produit14.jpg" },
  { name: "Produit 15", price: "45.00 USD", img: "./produit15.jpg" },

  { name: "Produit 16", price: "23.00 USD", img: "./produit16.jpg" },
  { name: "Produit 17", price: "31.00 USD", img: "./produit17.jpg" },
  { name: "Produit 18", price: "29.00 USD", img: "./produit18.jpg" },
  { name: "Produit 19", price: "36.00 USD", img: "./produit19.jpg" },
  { name: "Produit 20", price: "50.00 USD", img: "./produit20.jpg" }
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
