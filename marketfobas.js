// ==== LIS PRODUITS MANYÈL ====
// Chak pwodwi separe, modifye name, price, img manyèlman
// Asire tout fichye imaj yo nan menm folder ak HTML la (rasin repo a)
const products = [
  {
    name: "Caustic Soda",
    price: "120.00 USD",
    img: "100_CausticSoda.jpg" // <- rename pou evite % ki ka kreye pwoblèm sou GitHub Pages
  },
  {
    name: "Produit 2",
    price: "15.00 USD",
    img: "produit2.jpg"
  },
  {
    name: "Produit 3",
    price: "30.00 USD",
    img: "produit3.jpg"
  },
  {
    name: "Produit 4",
    price: "40.00 USD",
    img: "produit4.jpg"
  },
  {
    name: "Produit 5",
    price: "12.00 USD",
    img: "produit5.jpg"
  }
  // Ou ka kontinye ajoute nenpòt kantite pwodwi
];

// ==== AFICHE PRODUIT NAN HTML ====
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

    // Mete non pwodwi nan modal, san chanje bouton yo
    modal.querySelector("h2").textContent = `Acheter: ${prod.name}`;
  });
});

// Fè modal fèmen lè yo klike sou "x" oswa deyò modal
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => {
  if (e.target == modal) modal.style.display = "none";
}

// Paypal redireksyon otomatik
paypalBtn.onclick = () => {
  window.location.href = "https://www.paypal.com/donate?hosted_button_id=YOUR_BUTTON_ID";
};
