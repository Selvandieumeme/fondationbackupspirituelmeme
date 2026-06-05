// =====================================
// FOBAS DIGITAL AGENTS ACADEMYC
// Campus Numérique
// campusfobasnumeriques.js
// =====================================

const API_BASE_URL =
  "https://api.fondationbackupspirituel.com";

// =====================================
// UTILITAIRES
// =====================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// =====================================
// LANGUES
// =====================================

const translations = {
  fr: {
    createAccount: "Créer un compte",
    success: "Inscription effectuée avec succès.",
    passwordMismatch:
      "Les mots de passe ne correspondent pas.",
    roleRequired:
      "Veuillez sélectionner un profil."
  },

  en: {
    createAccount: "Create Account",
    success: "Registration successful.",
    passwordMismatch:
      "Passwords do not match.",
    roleRequired:
      "Please select a profile."
  },

  es: {
    createAccount: "Crear Cuenta",
    success: "Registro realizado correctamente.",
    passwordMismatch:
      "Las contraseñas no coinciden.",
    roleRequired:
      "Seleccione un perfil."
  }
};

let currentLanguage =
  localStorage.getItem("fobasAcademyLanguage") || "fr";



function applyLanguage() {

  const pageTexts = {

    fr: {
      title: "Créer un compte",
      subtitle:
        "Sélectionnez votre profil pour commencer."
    },

    en: {
      title: "Create Account",
      subtitle:
        "Select your profile to begin."
    },

    es: {
      title: "Crear Cuenta",
      subtitle:
        "Seleccione su perfil para comenzar."
    }
  };

  const registrationTitle =
    document.querySelector(
      ".registration-card h2"
    );

  const registrationText =
    document.querySelector(
      ".registration-card p"
    );

  if (registrationTitle) {
    registrationTitle.textContent =
      pageTexts[currentLanguage].title;
  }

  if (registrationText) {
    registrationText.textContent =
      pageTexts[currentLanguage].subtitle;
  }
}




// =====================================
// MESSAGE BOX
// =====================================

const formMessage = $("#formMessage");

function showMessage(message, type = "info") {
  if (!formMessage) return;

  formMessage.innerHTML = `
        <div class="message ${type}">
            ${message}
        </div>
    `;
}

// =====================================
// CHANGEMENT LANGUE
// =====================================

function initializeLanguageSystem() {

  applyLanguage();

  const buttons =
    document.querySelectorAll(
      "[data-lang]"
    );

  buttons.forEach((btn) => {

    btn.addEventListener(
      "click",
      () => {

        currentLanguage =
          btn.dataset.lang;

        localStorage.setItem(
          "fobasAcademyLanguage",
          currentLanguage
        );

        applyLanguage();

        showMessage(
          `Language: ${currentLanguage.toUpperCase()}`,
          "success"
        );
      }
    );

  });

}

// =====================================
// GESTION PROFILS
// =====================================

function hideAllForms() {
  const forms =
    document.querySelectorAll(".dynamic-form");

  forms.forEach((form) => {
    form.classList.add("hidden");
  });
}

function initializeProfileSelector() {
  const radios =
    document.querySelectorAll(
      'input[name="role"]'
    );

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      hideAllForms();

      const role = radio.value;

      if (role === "etudiant") {
        $("#etudiantForm")
          ?.classList.remove("hidden");
      }

      if (role === "directeur") {
        $("#directeurForm")
          ?.classList.remove("hidden");
      }

      if (role === "professeur") {
        $("#professeurForm")
          ?.classList.remove("hidden");
      }

      if (role === "agent") {
        $("#agentForm")
          ?.classList.remove("hidden");
      }
    });
  });
}

// =====================================
// PASSWORD TOGGLE
// =====================================

function initializePasswordToggle() {
  document.addEventListener(
    "click",
    function (event) {
      if (
        !event.target.classList.contains(
          "toggle-password"
        )
      )
        return;

      const wrapper =
        event.target.closest(".password-field");

      if (!wrapper) return;

      const input =
        wrapper.querySelector("input");

      if (!input) return;

      input.type =
        input.type === "password"
          ? "text"
          : "password";
    }
  );
}

// =====================================
// DIRECTEUR DYNAMIQUE
// =====================================

function generateDirectorForm() {
  const container =
    document.getElementById(
      "directeurFields"
    );

  if (!container) return;

  container.innerHTML = `
        <input type="text"
            name="nomComplet"
            placeholder="Nom complet">

        <input type="text"
            name="whatsapp"
            placeholder="WhatsApp">

        <input type="email"
            name="email"
            placeholder="Email">

        <input type="text"
            name="nomInstitution"
            placeholder="Nom de l'Institution">

        <select name="typeInstitution">
            <option value="">
                Type d'Institution
            </option>
            <option>École Classique</option>
            <option>Centre Professionnel</option>
            <option>Université</option>
            <option>Entreprise</option>
            <option>ONG</option>
            <option>Église</option>
        </select>

        <input type="text"
            name="pays"
            placeholder="Pays">

        <input type="text"
            name="ville"
            placeholder="Ville">

        <input type="number"
            id="nombreProfesseurs"
            name="nombreProfesseurs"
            min="0"
            placeholder="Nombre de Professeurs">

        <div id="professeursContainer"></div>

        <div class="password-field">
            <input type="password"
                name="password"
                placeholder="Mot de passe">
            <button
                type="button"
                class="toggle-password">
                👁
            </button>
        </div>

        <div class="password-field">
            <input type="password"
                name="confirmPassword"
                placeholder="Confirmation Mot de passe">
            <button
                type="button"
                class="toggle-password">
                👁
            </button>
        </div>
    `;

  const numberInput =
    document.getElementById(
      "nombreProfesseurs"
    );

  numberInput?.addEventListener(
    "input",
    function () {
      const total =
        parseInt(this.value) || 0;

      const professorsBox =
        document.getElementById(
          "professeursContainer"
        );

      professorsBox.innerHTML = "";

      for (let i = 1; i <= total; i++) {
        professorsBox.innerHTML += `
                    <div class="professeur-block">

                        <h4>
                            Professeur ${i}
                        </h4>

                        <input
                            type="text"
                            name="professeur_${i}"
                            placeholder="Nom Complet">

                        <select
                            name="domaine_${i}">
                            <option value="">
                                Domaine d'Enseignement
                            </option>

                            <option>
                                Informatique Fondamentale
                            </option>

                            <option>
                                Bureautique Professionnelle
                            </option>

                            <option>
                                Word Expert
                            </option>

                            <option>
                                Excel Expert
                            </option>

                            <option>
                                PowerPoint Expert
                            </option>

                            <option>
                                Access Expert
                            </option>

                            <option>
                                Windows Professionnel
                            </option>

                            <option>
                                Intelligence Artificielle
                            </option>

                            <option>
                                Développement Web
                            </option>

                            <option>
                                Mathématiques
                            </option>

                            <option>
                                Français
                            </option>

                            <option>
                                English
                            </option>

                            <option>
                                Español
                            </option>

                        </select>

                    </div>
                `;
      }
    }
  );
}

// =====================================
// PROFESSEUR FORM
// =====================================

function generateProfesseurForm() {
  const container =
    document.getElementById(
      "professeurFields"
    );

  if (!container) return;

  container.innerHTML = `
        <input type="text"
            name="nomComplet"
            placeholder="Nom complet">

        <input type="text"
            name="whatsapp"
            placeholder="WhatsApp">

        <input type="email"
            name="email"
            placeholder="Email">

        <input type="text"
            name="nomInstitution"
            placeholder="Nom de l'Institution">

        <input type="text"
            name="nomDirecteur"
            placeholder="Nom du Directeur">

        <select name="domaineEnseignement">
            <option value="">
                Domaine d'Enseignement
            </option>

            <option>
                Informatique Fondamentale
            </option>

            <option>
                Bureautique Professionnelle
            </option>

            <option>
                Word Expert
            </option>

            <option>
                Excel Expert
            </option>

            <option>
                PowerPoint Expert
            </option>

            <option>
                Access Expert
            </option>

            <option>
                Windows Professionnel
            </option>

            <option>
                Intelligence Artificielle
            </option>
        </select>

        <select name="niveauExperience">
            <option value="">
                Niveau d'Expérience
            </option>

            <option>
                Débutant
            </option>

            <option>
                Intermédiaire
            </option>

            <option>
                Avancé
            </option>

            <option>
                Expert
            </option>
        </select>

        <input type="text"
            name="pays"
            placeholder="Pays">

        <input type="text"
            name="ville"
            placeholder="Ville">

        <div class="password-field">
            <input type="password"
                name="password"
                placeholder="Mot de passe">
            <button type="button"
                class="toggle-password">
                👁
            </button>
        </div>

        <div class="password-field">
            <input type="password"
                name="confirmPassword"
                placeholder="Confirmation Mot de passe">
            <button type="button"
                class="toggle-password">
                👁
            </button>
        </div>
    `;
}

// =====================================
// AGENT FORM
// =====================================

function generateAgentForm() {
  const container =
    document.getElementById(
      "agentFields"
    );

  if (!container) return;

  container.innerHTML = `
        <input type="text"
            name="nomComplet"
            placeholder="Nom complet">

        <input type="text"
            name="whatsapp"
            placeholder="WhatsApp">

        <input type="email"
            name="email"
            placeholder="Email">

        <input type="text"
            name="pays"
            placeholder="Pays">

        <input type="text"
            name="ville"
            placeholder="Ville">

        <div class="password-field">
            <input type="password"
                name="password"
                placeholder="Mot de passe">

            <button type="button"
                class="toggle-password">
                👁
            </button>
        </div>

        <div class="password-field">
            <input type="password"
                name="confirmPassword"
                placeholder="Confirmation Mot de passe">

            <button type="button"
                class="toggle-password">
                👁
            </button>
        </div>
    `;
}

// =====================================
// VALIDATION
// =====================================

function validatePasswords(form) {
  const password =
    form.querySelector(
      'input[name="password"]'
    );

  const confirm =
    form.querySelector(
      'input[name="confirmPassword"]'
    );

  if (
    !password ||
    !confirm
  )
    return false;

  return (
    password.value === confirm.value
  );
}

// =====================================
// SUBMIT
// =====================================

async function submitForm(form) {

  if (!validatePasswords(form)) {

    showMessage(
      translations[currentLanguage]
        .passwordMismatch,
      "error"
    );

    return;
  }

  const data =
    Object.fromEntries(
      new FormData(form).entries()
    );

  const selectedRole =
    document.querySelector(
      'input[name="role"]:checked'
    );

  if (!selectedRole) {

    showMessage(
      translations[currentLanguage]
        .roleRequired,
      "error"
    );

    return;
  }

  data.role =
    selectedRole.value;

  // =====================================
  // DIRECTEUR -> PROFESSEURS ARRAY
  // =====================================

  if (data.role === "directeur") {

    data.professeurs = [];

    Object.keys(data).forEach(
      (key) => {

        if (
          key.startsWith(
            "professeur_"
          )
        ) {

          if (
            data[key] &&
            data[key].trim()
          ) {

            data.professeurs.push(
              data[key].trim()
            );
          }

          delete data[key];
        }

        if (
          key.startsWith(
            "domaine_"
          )
        ) {

          delete data[key];
        }
      }
    );
  }

  try {

    console.log(
      "FOBAS DATA",
      data
    );

    const response =
      await fetch(
        `${API_BASE_URL}/academiques/register`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(
            data
          )
        }
      );

    const result =
      await response.json();

    if (!response.ok) {

      throw new Error(
        result.message ||
        "Registration failed"
      );
    }

    showMessage(
      result.message ||
      translations[
        currentLanguage
      ].success,
      "success"
    );

    form.reset();

  } catch (error) {

    console.error(error);

    showMessage(
      error.message,
      "error"
    );
  }
}

// =====================================
// LISTENERS
// =====================================

function initializeForms() {
  const forms =
    document.querySelectorAll(
      ".dynamic-form"
    );

  forms.forEach((form) => {
    form.addEventListener(
      "submit",
      async function (event) {
        event.preventDefault();
        await submitForm(form);
      }
    );
  });
}

// =====================================
// START
// =====================================

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initializeLanguageSystem();
    initializeProfileSelector();
    initializePasswordToggle();

    generateDirectorForm();
    generateProfesseurForm();
    generateAgentForm();

    initializeForms();
  }
);
