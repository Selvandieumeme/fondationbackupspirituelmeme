// ======================================
// CONFIG API
// ======================================

const API_BASE_URL =
    "https://api.fondationbackupspirituel.com";


// ======================================
// ELEMENTS
// ======================================

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const togglePasswordBtn =
    document.getElementById("togglePassword");

const messageBox =
    document.getElementById("loginMessage");

const registerBtn =
    document.getElementById("registerBtn");


// ======================================
// MESSAGE UI
// ======================================

function showMessage(message, type = "error") {

    if (!messageBox) return;

    messageBox.textContent = message;

    messageBox.className =
        `message-box ${type}`;

}


// ======================================
// TOGGLE PASSWORD
// ======================================

if (togglePasswordBtn) {

    togglePasswordBtn.addEventListener(
        "click",
        () => {

            const currentType =
                passwordInput.getAttribute("type");

            passwordInput.setAttribute(
                "type",
                currentType === "password"
                    ? "text"
                    : "password"
            );

        }
    );

}


// ======================================
// REDIRECTION INSCRIPTION
// ======================================

if (registerBtn) {

    registerBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "https://fondationbackupspirituel.com/campusfobasnumeriques.html";

        }
    );

}


// ======================================
// SAVE SESSION
// ======================================

function saveSession(data) {

    if (!data) return;

    if (data.token) {

        localStorage.setItem(
            "campusToken",
            data.token
        );

    }

    if (data.user) {

        localStorage.setItem(
            "campusUser",
            JSON.stringify(data.user)
        );

    }

}


// ======================================
// LOGIN REQUEST
// ======================================

async function loginUser(email, password) {

    try {

        const response = await fetch(
            `${API_BASE_URL}/academiques/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Connexion impossible"
            );

        }

        saveSession(data);

        showMessage(
            "Connexion réussie",
            "success"
        );

        setTimeout(() => {

            window.location.href =
                "https://fondationbackupspirituel.com/campusnumeriques";

        }, 1000);

    } catch (error) {

        console.error(error);

        showMessage(
            error.message ||
            "Erreur serveur",
            "error"
        );

    }

}


// ======================================
// FORM SUBMIT
// ======================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value.trim();

            if (!email || !password) {

                showMessage(
                    "Veuillez remplir tous les champs"
                );

                return;
            }

            await loginUser(
                email,
                password
            );

        }
    );

}


// ======================================
// SESSION AUTO LOGIN
// ======================================

function checkExistingSession() {

    const token =
        localStorage.getItem(
            "campusToken"
        );

    if (!token) return;

    window.location.href =
        "https://fondationbackupspirituel.com/campusnumeriques";

}


// ======================================
// INIT
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkExistingSession();

    }
);
