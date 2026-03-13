// Smooth scroll pou bouton nan Hero Section
document.querySelectorAll(".hero button").forEach(button => {
    button.addEventListener("click", () => {
        document.getElementById("register").scrollIntoView({ behavior: "smooth" });
    });
});

// Lis kategori antrepriz
const categories = [
    "E-Commerce","E-Ecole","E-Eglise","E-Hotel","E-Restaurant",
    "E-Clinique","E-Pharmacie","E-Banque","E-AgenceVoyage","E-Immobilier",
    "E-Universite","E-Media","E-Transport","E-Construction","E-Assurance",
    "E-Consulting","E-Association","E-Industrie","E-Agriculture","E-Startup",
    "E-Entreprise","E-Freelance","E-Technologie","E-Marketing","E-Evenementiel",
    "E-Securite","E-Formation","E-Logistique","E-ServiceJuridique","E-Finance"
];

// Populate dropdown kategori nan fòm enskripsyon
const selectCategorie = document.querySelector("#formEntreprise select:first-of-type");
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
    const nomPrenom = this.querySelector('input[placeholder="Nom/Prénom du responsable"]').value.trim();
    const nomEntreprise = this.querySelector('input[placeholder="Nom de l\'entreprise"]').value.trim();
    const adresseEntreprise = this.querySelector('input[placeholder="Adresse physique de l\'entreprise"]').value.trim();
    const paysEntreprise = this.querySelector('input[placeholder="Pays"]').value.trim();
    const emailEntreprise = this.querySelector('input[type="email"]').value.trim();
    const telEntreprise = this.querySelector('input[type="tel"]').value.trim();
    const categorieEntreprise = this.querySelector('select:first-of-type').value;
    const serviceEntreprise = this.querySelector('select:last-of-type').value;

    // Verifye si tout chan obligatwa ranpli
    if (!nomPrenom || !nomEntreprise || !adresseEntreprise || !paysEntreprise || !emailEntreprise || !telEntreprise || !categorieEntreprise || !serviceEntreprise) {
        alert("Tanpri ranpli tout chan yo pou enskripsyon an.");
        return;
    }

    // Kreye nouvo kat antrepriz nan seksyon Entreprises
    const entrepriseList = document.querySelector(".entreprise-list");
    const newCard = document.createElement("a");
    newCard.href = "https://fobas.tech";
    newCard.target = "_blank";
    newCard.className = "entreprise-card";
    newCard.textContent = `${nomEntreprise} (${categorieEntreprise}) - ${serviceEntreprise}`;
    entrepriseList.appendChild(newCard);

    // Alert pou konfime enskripsyon ak bonis si opsyon Site Web
    if(serviceEntreprise === "Créer Propre Site Web") {
        alert(`Antrepriz "${nomEntreprise}" anrejistre avèk siksè nan FOBAS-ENTREPRISES!\n\nN.B: Ou elijib pou bonis espesyal si ou nan 10 premye yo!`);
    } else {
        alert(`Antrepriz "${nomEntreprise}" anrejistre avèk siksè nan FOBAS-ENTREPRISES!`);
    }

    // Reinit fòm nan
    this.reset();
});
