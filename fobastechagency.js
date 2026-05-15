// =========================
// FOBAS TECH UI READY
// =========================
console.log("FOBAS TECH AGENCY READY");


// =========================
// SCROLL CONTACT
// =========================
function scrollToContact() {

  document.getElementById("contact")
  .scrollIntoView({
    behavior: "smooth"
  });
}


// =========================
// CONTACT FORM
// =========================
const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", async function(e) {

  e.preventDefault();

  const data = {

    nom: document.getElementById("nom").value.trim(),

    email: document.getElementById("email").value.trim(),

    service: document.getElementById("service").value.trim(),

    message: document.getElementById("message").value.trim()
  };


  if (
    !data.nom ||
    !data.email ||
    !data.service ||
    !data.message
  ) {

    alert("Veuillez remplir tous les champs.");

    return;
  }


  try {

    const response = await fetch("https://api.fondationbackupspirituel.com/contact", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(data)
    });


    if (response.ok) {

      alert("Votre demande a été envoyée avec succès.");

      contactForm.reset();

    } else {

      alert("Erreur lors de l’envoi.");
    }

  } catch(error) {

    console.error(error);

    alert("Impossible de contacter le serveur.");
  }
});
