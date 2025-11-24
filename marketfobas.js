// Lis pwodwi (20 pou demo)
const products = [];
for(let i=1; i<=20; i++){
  products.push({
    name: `Produit ${i}`,
    price: (Math.random()*100).toFixed(2) + " USD",
    img: `https://via.placeholder.com/150?text=Produit+${i}`
  });
}

const container = document.getElementById("product-container");

products.forEach((prod, index)=>{
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
    <img src="${prod.img}" alt="${prod.name}">
    <h3>${prod.name}</h3>
    <p>${prod.price}</p>
    <button data-product="${index}">Acheter</button>
  `;

  container.appendChild(card);
});

// Modal peman
const modal = document.getElementById("payment-modal");
const closeBtn = document.querySelector(".close");
const paypalBtn = document.getElementById("paypal-btn");

document.querySelectorAll(".product-card button").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    modal.style.display = "block";
  });
});

closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if(e.target==modal) modal.style.display = "none"; }

// Paypal redireksyon
paypalBtn.onclick = () => {
  window.location.href = "https://www.paypal.com/donate?hosted_button_id=YOUR_BUTTON_ID";
};
