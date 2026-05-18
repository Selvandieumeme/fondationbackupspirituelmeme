// ==========================
// FOBAS LOGIN SYSTEM
// ==========================

const API_URL =
"https://api.fondationbackupspirituel.com";


// ==========================
// DOM READY
// ==========================
window.addEventListener("DOMContentLoaded", () => {

  const form =
    document.getElementById("loginForm");

  const password =
    document.getElementById("password");

  const toggle =
    document.getElementById("togglePassword");

  const loginBtn =
    document.getElementById("loginBtn");

  const successBox =
    document.getElementById("successMessage");

  const errorBox =
    document.getElementById("errorMessage");


  // ==========================
  // TOGGLE PASSWORD
  // ==========================
  toggle?.addEventListener("click", () => {

    if (!password) return;

    password.type =
      password.type === "password"
        ? "text"
        : "password";

  });


  // ==========================
  // LOGIN SUBMIT
  // ==========================
  form?.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
      document.getElementById("email")
      ?.value
      ?.trim()
      ?.toLowerCase();

    const pass =
      document.getElementById("password")
      ?.value;

    // RESET
    hideMessages();

    // VALIDATION
    if (!email || !pass) {

      showError(
        "Tous les champs sont obligatoires"
      );

      return;
    }

    // LOADING
    loginBtn.disabled = true;
    loginBtn.innerText = "Connexion...";

    try {

      const response = await fetch(
        `${API_URL}/agents/login`,
        {
          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify({
            email,
            password:pass
          })
        }
      );

      const data =
        await response.json();

      // ERROR
      if (!data.success) {

        showError(
          data.message ||
          "Connexion impossible"
        );

        resetButton();
        return;
      }

      // ==========================
      // SAVE SESSION
      // ==========================
      localStorage.setItem(
        "userEmail",
        data.user.email
      );

      localStorage.setItem(
        "userRole",
        data.user.role
      );

      localStorage.setItem(
        "userName",
        data.user.name
      );

      localStorage.setItem(
        "referralCode",
        data.user.referralCode || ""
      );

      // SUCCESS
      showSuccess(
        "Connexion réussie"
      );

      // REDIRECT
      setTimeout(() => {

        window.location.href =
        "https://fondationbackupspirituel.com/dashboarddigitalagents.html";

      }, 1200);

    }

    catch (err) {

      console.error(
        "LOGIN ERROR:",
        err
      );

      showError(
        "Erreur serveur"
      );

    }

    finally {

      resetButton();

    }

  });


  // ==========================
  // SUCCESS
  // ==========================
  function showSuccess(message){

    if(!successBox) return;

    successBox.innerText = message;
    successBox.style.display = "block";
  }


  // ==========================
  // ERROR
  // ==========================
  function showError(message){

    if(!errorBox) return;

    errorBox.innerText = message;
    errorBox.style.display = "block";
  }


  // ==========================
  // HIDE ALERTS
  // ==========================
  function hideMessages(){

    if(successBox)
      successBox.style.display = "none";

    if(errorBox)
      errorBox.style.display = "none";
  }


  // ==========================
  // RESET BUTTON
  // ==========================
  function resetButton(){

    if(!loginBtn) return;

    loginBtn.disabled = false;
    loginBtn.innerText = "Se Connecter";
  }

});
