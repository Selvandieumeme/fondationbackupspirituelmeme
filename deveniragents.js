// ==========================
// FOBAS DIGITAL AGENTS
// deveniragents.js
// FINAL VERSION
// ==========================

const API_URL = "https://api.fondationbackupspirituel.com";


// ==========================
// DOM READY
// ==========================
window.addEventListener("DOMContentLoaded", () => {

  console.log("DEVENIR AGENTS PAGE CONNECTED");


  // ==========================
  // ELEMENTS
  // ==========================
  const form = document.getElementById("agentForm");

  const pass1 = document.getElementById("agentPassword");
  const pass2 = document.getElementById("agentConfirmPassword");

  const toggle1 = document.getElementById("togglePass1");
  const toggle2 = document.getElementById("togglePass2");

  const submitBtn = document.getElementById("submitAgent");

  const successBox = document.getElementById("successMessage");

  const errorBox = document.getElementById("errorMessage");


  // ==========================
  // PASSWORD TOGGLE 1
  // ==========================
  toggle1?.addEventListener("click", () => {

    if (!pass1) return;

    pass1.type =
      pass1.type === "password"
        ? "text"
        : "password";

  });


  // ==========================
  // PASSWORD TOGGLE 2
  // ==========================
  toggle2?.addEventListener("click", () => {

    if (!pass2) return;

    pass2.type =
      pass2.type === "password"
        ? "text"
        : "password";

  });


  // ==========================
  // FORM SUBMIT
  // ==========================
  form?.addEventListener("submit", async (e) => {

    e.preventDefault();

    // ==========================
    // GET VALUES
    // ==========================
    const name =
      document.getElementById("agentName")
      ?.value
      ?.trim();

    const email =
      document.getElementById("agentEmail")
      ?.value
      ?.trim()
      ?.toLowerCase();

    const password =
      document.getElementById("agentPassword")
      ?.value;

    const confirm =
      document.getElementById("agentConfirmPassword")
      ?.value;


    // ==========================
    // RESET ALERTS
    // ==========================
    if (successBox) {
      successBox.style.display = "none";
    }

    if (errorBox) {
      errorBox.style.display = "none";
    }


    // ==========================
    // VALIDATION
    // ==========================
    if (!name || !email || !password || !confirm) {

      showError("Tous les champs sont obligatoires");
      return;

    }

    // EMAIL VALIDATION
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {

      showError("Adresse email invalide");
      return;

    }

    // PASSWORD LENGTH
    if (password.length < 6) {

      showError(
        "Le mot de passe doit contenir au moins 6 caractères"
      );

      return;
    }

    // PASSWORD MATCH
    if (password !== confirm) {

      showError(
        "Les mots de passe ne correspondent pas"
      );

      return;
    }


    // ==========================
    // LOADING BUTTON
    // ==========================
    if (submitBtn) {

      submitBtn.disabled = true;
      submitBtn.innerText = "Création...";

    }


    // ==========================
    // SEND TO API
    // ==========================
    try {

      const response = await fetch(
        `${API_URL}/agents/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name,
            email,
            password
          })
        }
      );

      const data = await response.json();


      // ==========================
      // API ERROR
      // ==========================
      if (!data || data.success === false) {

        showError(
          data?.message ||
          "Erreur inscription"
        );

        resetButton();
        return;
      }


      // ==========================
      // SAVE SESSION
      // ==========================
      localStorage.setItem(
        "userEmail",
        email
      );

      localStorage.setItem(
        "agentReferralCode",
        data.referralCode || ""
      );


      // ==========================
      // SUCCESS
      // ==========================
      showSuccess(
        "Compte Agent créé avec succès"
      );


      // ==========================
      // RESET FORM
      // ==========================
      form.reset();


      // ==========================
      // REDIRECT
      // ==========================
      setTimeout(() => {

        window.location.href =
          "/dashboard-agent.html";

      }, 1500);

    }

    catch (err) {

      console.error(
        "REGISTER ERROR:",
        err
      );

      showError(
        "Erreur serveur, veuillez réessayer"
      );

    }

    finally {

      resetButton();

    }

  });


  // ==========================
  // SUCCESS MESSAGE
  // ==========================
  function showSuccess(message) {

    if (!successBox) {
      alert(message);
      return;
    }

    successBox.innerText = message;
    successBox.style.display = "block";

  }


  // ==========================
  // ERROR MESSAGE
  // ==========================
  function showError(message) {

    if (!errorBox) {
      alert(message);
      return;
    }

    errorBox.innerText = message;
    errorBox.style.display = "block";

  }


  // ==========================
  // RESET BUTTON
  // ==========================
  function resetButton() {

    if (!submitBtn) return;

    submitBtn.disabled = false;
    submitBtn.innerText = "Envoyer";

  }

});
