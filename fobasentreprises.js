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
const selectCategorie = document.querySelector("#formEntreprise select[name='categorie']");
if(selectCategorie){
categories.forEach(cat => {
    let option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    selectCategorie.appendChild(option);
});
}

// Handle soumèt fòm enskripsyon antrepriz
const formEntreprise = document.getElementById("formEntreprise");

formEntreprise.addEventListener("submit", function(e) {

    e.preventDefault();

    // Rekipere valè yo (kounye a via name)
    const nomPrenom = this.querySelector('input[name="responsable"]').value.trim();
    const nomEntreprise = this.querySelector('input[name="nom_entreprise"]').value.trim();
    const adresseEntreprise = this.querySelector('input[name="adresse"]').value.trim();
    const paysEntreprise = this.querySelector('input[name="pays"]').value.trim();
    const emailEntreprise = this.querySelector('input[name="email_professionnel"]').value.trim();
    const telEntreprise = this.querySelector('input[name="whatsapp"]').value.trim();
    const categorieEntreprise = this.querySelector('select[name="categorie"]').value;
    const serviceEntreprise = this.querySelector('select[name="service"]').value;

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

    // Voye done yo sou email san redireksyon
    const formData = new FormData(this);

    formData.append("_subject", "Nouvo Enskripsyon Antrepriz FOBAS-ENTREPRISES");
    formData.append("_captcha", "false");
    formData.append("_template", "table");

    fetch("https://formsubmit.co/ajax/fobas614@gmail.com", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {

        // Alert pou konfime enskripsyon ak bonis si opsyon Site Web
        if(serviceEntreprise === "Créer Propre Site Web") {
            alert(`Enskripsyon w lan ale avèk siksè jwenn Fondateur Platfom nan.\n\nN.B: Ou elijib pou bonis espesyal si ou nan 10 premye yo!`);
        } else {
            alert("Enskripsyon w lan ale avèk siksè jwenn Fondateur Platfom nan.");
        }

        // Reinit fòm nan
        formEntreprise.reset();

    })
    .catch(error => {

        alert("Gen yon ti erè pandan voye enskripsyon an. Tanpri eseye ankò.");

        console.error("Erreur:", error);

    });

});
