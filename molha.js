/* ======================================================
   MOLHA OFFICIAL WEBSITE SCRIPT
   Compatible with molha.html
   ====================================================== */


/* MESSAGE LORSQUE UTILISATEUR CLIQUE SUR LE BOUTON */

function rejoindre() {

alert(
"Merci pour votre intérêt envers le Mouvement pour la Libération d'Haïti (MOLHA).\n\nUn espace d'adhésion sera bientôt disponible pour permettre aux citoyens de rejoindre officiellement le mouvement."
);

}



/* MESSAGE DE CHARGEMENT DU SITE */

document.addEventListener("DOMContentLoaded", function () {

console.log("Site officiel MOLHA chargé avec succès.");

});



/* EFFET ZOOM LEGER SUR LES PHOTOS */

const photos = document.querySelectorAll(".grid-photos img");

photos.forEach(function(img){

img.addEventListener("mouseover", function(){

img.style.transform = "scale(1.05)";
img.style.transition = "0.3s";

});

img.addEventListener("mouseout", function(){

img.style.transform = "scale(1)";

});

});



/* SCROLL DOUX POUR LES LIENS MENU */

document.querySelectorAll("nav a").forEach(function(link){

link.addEventListener("click", function(e){

e.preventDefault();

window.scrollTo({
top:0,
behavior:"smooth"
});

});

});



/* PETITE ANIMATION SUR LE BOUTON HERO */

const heroButton = document.querySelector(".hero button");

heroButton.addEventListener("mouseover", function(){

heroButton.style.transform = "scale(1.1)";
heroButton.style.transition = "0.3s";

});

heroButton.addEventListener("mouseout", function(){

heroButton.style.transform = "scale(1)";

});



/* ==========================
   MOLHA BANNER SCRIPT
   ========================== */

document.addEventListener("DOMContentLoaded", function(){

const banner = document.querySelector(".molha-banner-img");

if(banner){

console.log("Banner MOLHA chargé avec succès.");

}

});
