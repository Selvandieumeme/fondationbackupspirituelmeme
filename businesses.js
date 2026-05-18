// ==========================
// FOBAS BUSINESSES
// ==========================

const API_URL =
"https://api.fondationbackupspirituel.com";


// ==========================
// LOADER
// ==========================
window.addEventListener("load", () => {

  const loader =
    document.getElementById("loader");

  setTimeout(() => {

    if(loader){
      loader.style.display = "none";
    }

  }, 800);

  loadBusinesses();

});


// ==========================
// LOAD BUSINESSES
// ==========================
async function loadBusinesses() {

  try {

    const res = await fetch(
      `${API_URL}/business/all`
    );

    const data = await res.json();

    const grid =
      document.getElementById("businessGrid");

    if(!grid) return;

    grid.innerHTML = "";

    if(!data.businesses?.length){

      grid.innerHTML = `
        <p>Aucun business disponible</p>
      `;

      return;
    }

    data.businesses.forEach((business) => {

      grid.innerHTML += `

      <div class="business-card">

        <div class="business-banner">

          <img
            src="${
              business.logo ||
              'https://via.placeholder.com/150'
            }"
          />

        </div>

        <div class="business-content">

          <h3>
            ${business.businessName || "FOBAS BUSINESS"}
          </h3>

          <div class="business-info">

            <p>
              <i class="fa-solid fa-location-dot"></i>
              ${business.city || "Ville"}
            </p>

            <p>
              <i class="fa-brands fa-whatsapp"></i>
              ${business.whatsapp || "Whatsapp"}
            </p>

            <p>
              <i class="fa-solid fa-user"></i>
              ${business.name || "Entrepreneur"}
            </p>

          </div>

          <button class="business-btn">
            Voir Business
          </button>

        </div>

      </div>

      `;

    });

  }

  catch(error){

    console.error(
      "BUSINESS LOAD ERROR:",
      error
    );

  }

}


// ==========================
// SEARCH
// ==========================
const search =
document.getElementById("searchBusiness");

search?.addEventListener("input", () => {

  const value =
    search.value.toLowerCase();

  const cards =
    document.querySelectorAll(".business-card");

  cards.forEach((card) => {

    const text =
      card.innerText.toLowerCase();

    card.style.display =
      text.includes(value)
      ? "block"
      : "none";

  });

});


// ==========================
// DEBUG
// ==========================
console.log(
  "FOBAS BUSINESSES CONNECTED"
);
