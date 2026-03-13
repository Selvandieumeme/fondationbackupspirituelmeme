// Smooth scroll pou bouton nan Hero Section
document.querySelectorAll(".hero button").forEach(button => {
    button.addEventListener("click", () => {
        document.getElementById("register").scrollIntoView({ behavior: "smooth" });
    });
});

// Lis kategori antrepriz
const categories = [
    "E-Ecole","E-Commerce","E-Eglise","E-Sante","E-Transport","E-Hotel",
    "E-Restaurant","E-Immobilier","E-Freelance","E-Entreprise","E-Consulting",
    "E-Technologie","E-Startup","E-Artisanat","E-Mode","E-Media","E-Event",
    "E-Formation","E-Agroalimentaire","E-Banque","E-Pharmacie","E-Tourisme",
    "E-Construction","E-Sport","E-Logistique","E-Livre","E-Musique","E-Design",
    "E-Production","E-Services"
];

// Populate dropdown nan fòm enskripsyon
const selectCategorie = document.getElementById("categorie");
categories.forEach(cat => {
    let option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    selectCategorie.appendChild(option);
});

// Handle soumèt fòm enskripsyon antrepriz
const formEntreprise = document.getElementById("formEntreprise");
formEntreprise.addEventListener("submit", function(e) {
    e.preventDefault();

    // Rekipere valè yo
    const nomEntreprise = this.querySelector("#nomEntreprise").value.trim();
    const emailEntreprise = this.querySelector("#emailEntreprise").value.trim();
    const telEntreprise = this.querySelector("#telEntreprise").value.trim();
    const categorieEntreprise = this.querySelector("#categorie").value;

    if (!nomEntreprise || !emailEntreprise || !telEntreprise || !categorieEntreprise) {
        alert("Tanpri ranpli tout chan yo pou enskripsyon an.");
        return;
    }

    // Kreye nouvo kat antrepriz nan seksyon Entreprises
    const entrepriseList = document.querySelector(".entreprise-list");
    const newCard = document.createElement("a");
    newCard.href = "https://fobas.tech";
    newCard.target = "_blank";
    newCard.className = "entreprise-card";
    newCard.textContent = `${nomEntreprise} (${categorieEntreprise})`;
    entrepriseList.appendChild(newCard);

    // Alert pou konfime enskripsyon
    alert(`Antrepriz "${nomEntreprise}" anrejistre avèk siksè nan FOBAS-ENTREPRISES!`);

    // Reinit fòm nan
    this.reset();
});
