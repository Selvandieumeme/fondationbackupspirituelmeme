
/* ================================================================
   FUSION SCHOOL INTERNATIONAL
   DASHBOARD ADMIN / FONDATEUR

   Fichier : dashboardadminfusion.js

   CONTRAT API OFFICIEL
   ================================================================

   API :
   https://api.fondationbackupspirituel.com

   Routes FUSION SCHOOL INTERNATIONAL :

   POST /api/fusion/admin/login
   POST /api/fusion/admin/logout

   GET  /api/fusion/admin/registrations
   GET  /api/fusion/admin/users
   GET  /api/fusion/admin/statistics

   AUTHENTIFICATION :
   - Aucun secret permanent dans ce fichier.
   - Aucun mot de passe dans localStorage.
   - Aucun mot de passe dans sessionStorage.
   - Aucun endpoint /session utilisé.
   - Aucun cookie de session utilisé par FUSION Admin.
   - Les identifiants administrateur sont conservés uniquement
     en mémoire JavaScript pendant l'authentification active.
   - Le backend vérifie directement les valeurs .env.
   - Les routes protégées reçoivent les headers :
       X-Fusion-Admin-Identifier
       X-Fusion-Admin-Password
   - Les données utilisateur proviennent du backend.
   ================================================================ */

"use strict";







/* ================================================================
   01 — CONFIGURATION API
   ================================================================ */

const API_CONFIG = Object.freeze({

    baseURL:
        "https://api.fondationbackupspirituel.com",

    routes: Object.freeze({

        login:
            "/api/fusion/admin/login",

        logout:
            "/api/fusion/admin/logout",

        registrations:
            "/api/fusion/admin/registrations",

        users:
            "/api/fusion/admin/users",

        statistics:
            "/api/fusion/admin/statistics"

    }),

    requestTimeout:
        20000,

    recentLimit:
        10,

    autoRefreshMilliseconds:
        30000

});






/* ================================================================
   02 — ÉTAT DE L'APPLICATION
   ================================================================ */

const ADMIN_STATE = {

    authenticated:
        false,

    admin:
        null,

    /*
     * Les credentials ne sont jamais enregistrés
     * dans localStorage ou sessionStorage.
     *
     * Ils existent uniquement en mémoire JavaScript.
     */
    adminCredentials:
        null,

    registrations:
        [],

    students:
        [],

    directors:
        [],

    professors:
        [],

    agents:
        [],

    statistics:
        null,

    currentSection:
        "dashboard",

    lastSynchronization:
        null,

    refreshTimer:
        null,

    loading:
        false

};


/* ================================================================
   03 — RÉFÉRENCES DOM
   ================================================================ */

const DOM = {};


/* ================================================================
   04 — INITIALISATION DOM
   ================================================================ */

function initializeDOMReferences() {

    const ids = [

        "fusionAdminApp",

        "adminLoginScreen",
        "adminLoginForm",
        "adminIdentifier",
        "adminPassword",
        "toggleAdminPassword",
        "adminLoginMessage",
        "adminLoginButton",

        "adminDashboard",
        "adminUserName",
        "adminUserRole",
        "adminLogoutButton",

        "adminNavigation",

        "refreshDashboardButton",
        "refreshRegistrationsButton",
        "viewAllRegistrationsButton",

        "studentCounter",
        "directorCounter",
        "professorCounter",
        "agentCounter",
        "totalCounter",

        "apiConnectionStatus",
        "apiStatusIndicator",
        "apiStatusText",

        "recentRegistrationsContainer",
        "recentRegistrationsEmpty",

        "lastSynchronization",

        "studentSearch",
        "directorSearch",
        "professorSearch",
        "agentSearch",

        "studentsDataContainer",
        "directorsDataContainer",
        "professorsDataContainer",
        "agentsDataContainer",

        "allRegistrationsContainer",

        "statisticsContainer",

        "apiEndpointDisplay",
        "sessionStatus"

    ];


    ids.forEach(function (id) {

        DOM[id] =
            document.getElementById(id);

    });


    DOM.sections =
        Array.from(
            document.querySelectorAll(
                ".admin-content-section"
            )
        );


    DOM.navigationButtons =
        Array.from(
            document.querySelectorAll(
                ".admin-nav-button"
            )
        );

}


/* ================================================================
   05 — OUTILS
   ================================================================ */

function safeString(
    value,
    fallback = ""
) {

    if (
        value === null ||
        value === undefined
    ) {

        return fallback;

    }

    return String(value);

}


function isObject(value) {

    return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
    );

}


function isArray(value) {

    return Array.isArray(value);

}


function escapeHTML(value) {

    return safeString(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ================================================================
   06 — NORMALISATION DU RÔLE
   ================================================================ */

function normalizeRole(role) {

    const value =
        safeString(role)
            .trim()
            .toLowerCase();

    const roles = {

        etudiant:
            "etudiant",

        directeur:
            "directeur",

        professeur:
            "professeur",

        agent:
            "agent",

        administrateur:
            "administrateur",

        fondateur:
            "fondateur"

    };


    return roles[value] || value;

}


function getRoleLabel(role) {

    const labels = {

        etudiant:
            "Étudiant",

        directeur:
            "Directeur",

        professeur:
            "Professeur",

        agent:
            "Agent",

        administrateur:
            "Administrateur",

        fondateur:
            "Fondateur"

    };


    return (
        labels[role] ||
        safeString(role, "Compte")
    );

}


/* ================================================================
   07 — NORMALISATION UTILISATEUR
   ================================================================ */

function normalizeUser(user) {

    if (!isObject(user)) {

        return null;

    }


    return {

        id:
            safeString(user.id),

        nomComplet:
            safeString(user.nomComplet),

        whatsapp:
            safeString(user.whatsapp),

        email:
            safeString(user.email),

        pays:
            safeString(user.pays),

        ville:
            safeString(user.ville),

        nomInstitution:
            safeString(user.nomInstitution),

        nomDirecteur:
            safeString(user.nomDirecteur),

        nomProfesseur:
            safeString(user.nomProfesseur),

        niveauEtude:
            safeString(user.niveauEtude),

        parcoursAcademique:
            safeString(user.parcoursAcademique),

        role:
            normalizeRole(user.role),

        createdAt:
            safeString(user.createdAt)

    };

}


/* ================================================================
   08 — DATE
   ================================================================ */

function formatDate(value) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return safeString(value);

    }


    return new Intl.DateTimeFormat(
        "fr-FR",
        {
            dateStyle:
                "medium",

            timeStyle:
                "short"
        }
    ).format(date);

}


/* ================================================================
   09 — CONSTRUCTION URL API
   ================================================================ */

function buildAPIURL(path) {

    if (
        typeof path !== "string" ||
        !path.startsWith("/")
    ) {

        throw new Error(
            "Route API invalide."
        );

    }


    return (
        API_CONFIG.baseURL.replace(/\/+$/, "") +
        path
    );

}


/* ================================================================
   10 — MESSAGE API
   ================================================================ */

function extractAPIMessage(
    data,
    status
) {

    if (isObject(data)) {

        if (
            typeof data.message ===
            "string" &&
            data.message.trim()
        ) {

            return data.message;

        }


        if (
            typeof data.error ===
            "string" &&
            data.error.trim()
        ) {

            return data.error;

        }

    }


    const messages = {

        400:
            "La requête envoyée au serveur est incorrecte.",

        401:
            "Authentification administrateur requise ou identifiant/mot de passe incorrect.",

        403:
            "Accès administrateur refusé.",

        404:
            "La route API demandée n'existe pas sur le serveur.",

        409:
            "Un conflit existe avec les données du serveur.",

        422:
            "Les données envoyées ne sont pas valides.",

        429:
            "Trop de tentatives. Veuillez patienter.",

        500:
            "Erreur interne du serveur.",

        502:
            "Le serveur API est momentanément indisponible.",

        503:
            "Le service API est temporairement indisponible."

    };


    return (
        messages[status] ||
        "Une erreur de communication avec le serveur est survenue."
    );

}


/* ================================================================
   11 — REQUÊTE API CENTRALE
   ================================================================ */

async function apiRequest(
    path,
    options = {}
) {

    const controller =
        new AbortController();


    const timeout =
        window.setTimeout(
            function () {

                controller.abort();

            },
            API_CONFIG.requestTimeout
        );


    const requestHeaders = {

        "Accept":
            "application/json"

    };


    /*
     * Le login reçoit uniquement son body JSON.
     *
     * Pour toutes les autres routes FUSION Admin,
     * les credentials conservés en mémoire sont envoyés
     * dans les headers attendus par le nouveau backend.
     *
     * Aucun cookie/session n'est utilisé.
     */

    const isLoginRoute =
        path === API_CONFIG.routes.login;


    if (!isLoginRoute) {

        if (
            ADMIN_STATE.adminCredentials &&
            typeof ADMIN_STATE.adminCredentials.identifier ===
                "string" &&
            typeof ADMIN_STATE.adminCredentials.password ===
                "string"
        ) {

            requestHeaders[
                "X-Fusion-Admin-Identifier"
            ] =
                ADMIN_STATE.adminCredentials.identifier;


            requestHeaders[
                "X-Fusion-Admin-Password"
            ] =
                ADMIN_STATE.adminCredentials.password;

        }

    }


    const requestOptions = {

        method:
            options.method || "GET",

        cache:
            "no-store",

        signal:
            controller.signal,

        headers:
            requestHeaders

    };


    if (
        options.body !== undefined &&
        options.body !== null
    ) {

        requestOptions.headers[
            "Content-Type"
        ] =
            "application/json";


        requestOptions.body =
            JSON.stringify(
                options.body
            );

    }


    try {

        const response =
            await fetch(
                buildAPIURL(path),
                requestOptions
            );


        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        let data = null;


        if (
            contentType.includes(
                "application/json"
            )
        ) {

            data =
                await response.json();

        } else {

            const text =
                await response.text();

            data =
                text
                    ? {
                        message:
                            text
                    }
                    : null;

        }


        if (!response.ok) {

            const error =
                new Error(
                    extractAPIMessage(
                        data,
                        response.status
                    )
                );


            error.status =
                response.status;


            error.data =
                data;


            throw error;

        }


        return data;

    } catch (error) {

        if (
            error.name ===
            "AbortError"
        ) {

            const timeoutError =
                new Error(
                    "Le serveur API n'a pas répondu dans le délai prévu."
                );


            timeoutError.code =
                "API_TIMEOUT";


            throw timeoutError;

        }


        if (
            error instanceof TypeError
        ) {

            const networkError =
                new Error(
                    "Impossible de joindre le serveur API. Vérifiez la connexion HTTPS et la disponibilité du serveur."
                );


            networkError.code =
                "API_NETWORK_ERROR";


            throw networkError;

        }


        throw error;

    } finally {

        window.clearTimeout(
            timeout
        );

    }

}


/* ================================================================
   12 — STATUT API
   ================================================================ */

function setAPIStatus(
    state,
    message
) {

    if (
        DOM.apiStatusText
    ) {

        DOM.apiStatusText.textContent =
            safeString(message);

    }


    if (
        DOM.apiStatusIndicator
    ) {

        DOM.apiStatusIndicator.dataset.status =
            state;

    }


    if (
        DOM.apiConnectionStatus
    ) {

        DOM.apiConnectionStatus.dataset.status =
            state;

    }

}


/* ================================================================
   13 — MESSAGE LOGIN
   ================================================================ */

function showLoginMessage(
    message,
    type = "error"
) {

    if (
        !DOM.adminLoginMessage
    ) {

        return;

    }


    DOM.adminLoginMessage.textContent =
        safeString(message);


    DOM.adminLoginMessage.dataset.type =
        type;

}


function clearLoginMessage() {

    if (
        !DOM.adminLoginMessage
    ) {

        return;

    }


    DOM.adminLoginMessage.textContent =
        "";


    DOM.adminLoginMessage.dataset.type =
        "";

}


/* ================================================================
   14 — BOUTON LOGIN
   ================================================================ */

function setLoginLoading(
    loading
) {

    if (
        !DOM.adminLoginButton
    ) {

        return;

    }


    DOM.adminLoginButton.disabled =
        loading;


    DOM.adminLoginButton.textContent =
        loading
            ? "Connexion..."
            : "Se connecter";

}


/* ================================================================
   15 — VISIBILITÉ MOT DE PASSE
   ================================================================ */

function togglePasswordVisibility() {

    if (
        !DOM.adminPassword
    ) {

        return;

    }


    const passwordVisible =
        DOM.adminPassword.type ===
        "text";


    DOM.adminPassword.type =
        passwordVisible
            ? "password"
            : "text";


    if (
        DOM.toggleAdminPassword
    ) {

        DOM.toggleAdminPassword.textContent =
            passwordVisible
                ? "👁"
                : "🙈";


        DOM.toggleAdminPassword.setAttribute(
            "aria-label",
            passwordVisible
                ? "Afficher le mot de passe"
                : "Masquer le mot de passe"
        );

    }

}


/* ================================================================
   16 — EXTRACTION ADMIN
   ================================================================ */

function getAdminUser(response) {

    if (!isObject(response)) {

        return null;

    }


    if (
        isObject(response.user)
    ) {

        return normalizeUser(
            response.user
        );

    }


    if (
        isObject(response.admin)
    ) {

        return normalizeUser(
            response.admin
        );

    }


    return null;

}


/* ================================================================
   17 — LOGIN ADMIN / FONDATEUR
   ================================================================ */

async function loginAdmin(
    identifier,
    password
) {

    if (
        !identifier ||
        !password
    ) {

        throw new Error(
            "Veuillez saisir l'identifiant et le mot de passe."
        );

    }


    setAPIStatus(
        "loading",
        "Authentification administrateur..."
    );


    const response =
        await apiRequest(
            API_CONFIG.routes.login,
            {

                method:
                    "POST",

                body: {

                    identifier:
                        identifier,

                    password:
                        password

                }

            }
        );


    /*
     * CONTRAT DE RÉPONSE ATTENDU :
     *
     * {
     *   success: true,
     *   authenticated: true,
     *   user: {
     *      id,
     *      nomComplet,
     *      email,
     *      role
     *   }
     * }
     */


    if (
        response?.success !== true ||
        response?.authenticated !== true
    ) {

        throw new Error(
            extractAPIMessage(
                response,
                401
            )
        );

    }


    const user =
        getAdminUser(
            response
        );


    if (!user) {

        throw new Error(
            "Le serveur n'a pas retourné les informations du compte administrateur."
        );

    }


    const backendRole =
        safeString(
            response.user?.role
        )
            .trim()
            .toLowerCase();


    if (
        backendRole !== "fondateur" &&
        backendRole !== "administrateur"
    ) {

        throw new Error(
            "Ce compte ne possède pas les droits administrateur."
        );

    }


    /*
     * IMPORTANT :
     *
     * Les credentials sont conservés uniquement en mémoire.
     *
     * Aucun localStorage.
     * Aucun sessionStorage.
     * Aucun cookie.
     */

    ADMIN_STATE.adminCredentials = {

        identifier:
            identifier,

        password:
            password

    };


    ADMIN_STATE.authenticated =
        true;


    ADMIN_STATE.admin =
        user;


    showDashboard();


    setAPIStatus(
        "online",
        "Authentification administrative réussie."
    );


    try {

        await loadDashboardData();

    } catch (error) {

        /*
         * loadDashboardData() gère déjà les erreurs
         * de synchronisation.
         */

        throw error;

    }

}


/* ================================================================
   18 — LOGOUT
   ================================================================ */

async function logoutAdmin() {

    stopAutoRefresh();


    try {

        /*
         * Le backend ne possède plus de session.
         *
         * La requête logout est néanmoins envoyée afin
         * de conserver le contrat API FUSION.
         *
         * Les headers d'authentification sont ajoutés
         * automatiquement par apiRequest().
         */

        await apiRequest(
            API_CONFIG.routes.logout,
            {
                method:
                    "POST"
            }
        );

    } catch (error) {

        /*
         * Même si le serveur ne répond pas,
         * l'état local doit être nettoyé.
         */

    }


    resetAdminState();


    showLoginScreen();


    clearLoginMessage();


    setAPIStatus(
        "offline",
        "Authentification administrateur fermée."
    );


    if (
        DOM.adminIdentifier
    ) {

        DOM.adminIdentifier.value =
            "";

    }


    if (
        DOM.adminPassword
    ) {

        DOM.adminPassword.value =
            "";

        DOM.adminPassword.type =
            "password";

    }

}


/* ================================================================
   19 — RÉINITIALISATION ÉTAT ADMIN
   ================================================================ */

function resetAdminState() {

    ADMIN_STATE.authenticated =
        false;


    ADMIN_STATE.admin =
        null;


    /*
     * Suppression immédiate des credentials
     * conservés uniquement en mémoire.
     */

    ADMIN_STATE.adminCredentials =
        null;


    ADMIN_STATE.registrations =
        [];


    ADMIN_STATE.students =
        [];


    ADMIN_STATE.directors =
        [];


    ADMIN_STATE.professors =
        [];


    ADMIN_STATE.agents =
        [];


    ADMIN_STATE.statistics =
        null;


    ADMIN_STATE.lastSynchronization =
        null;


    ADMIN_STATE.loading =
        false;

}


/* ================================================================
   20 — AFFICHAGE LOGIN
   ================================================================ */

function showLoginScreen() {

    if (
        DOM.adminLoginScreen
    ) {

        DOM.adminLoginScreen.classList.remove(
            "hidden"
        );

    }


    if (
        DOM.adminDashboard
    ) {

        DOM.adminDashboard.classList.add(
            "hidden"
        );

    }


    updateSessionStatus();

}


/* ================================================================
   21 — AFFICHAGE DASHBOARD
   ================================================================ */

function showDashboard() {

    if (
        DOM.adminLoginScreen
    ) {

        DOM.adminLoginScreen.classList.add(
            "hidden"
        );

    }


    if (
        DOM.adminDashboard
    ) {

        DOM.adminDashboard.classList.remove(
            "hidden"
        );

    }


    updateAdminIdentity();

    updateSessionStatus();

    startAutoRefresh();

}


/* ================================================================
   22 — IDENTITÉ ADMIN
   ================================================================ */

function updateAdminIdentity() {

    const admin =
        ADMIN_STATE.admin;


    if (!admin) {

        return;

    }


    if (
        DOM.adminUserName
    ) {

        DOM.adminUserName.textContent =
            admin.nomComplet ||
            admin.email ||
            "Administrateur";

    }


    if (
        DOM.adminUserRole
    ) {

        DOM.adminUserRole.textContent =
            getRoleLabel(
                admin.role
            );

    }

}


/* ================================================================
   23 — STATUT AUTHENTIFICATION
   ================================================================ */

function updateSessionStatus() {

    if (
        !DOM.sessionStatus
    ) {

        return;

    }


    DOM.sessionStatus.textContent =
        ADMIN_STATE.authenticated
            ? "Authentification administrateur active."
            : "Authentification administrateur inactive.";

}


/* ================================================================
   24 — CHARGEMENT DASHBOARD
   ================================================================ */

async function loadDashboardData() {

    if (
        !ADMIN_STATE.authenticated
    ) {

        return;

    }


    if (
        !ADMIN_STATE.adminCredentials
    ) {

        resetAdminState();

        showLoginScreen();


        setAPIStatus(
            "offline",
            "Authentification administrateur requise."
        );


        return;

    }


    if (
        ADMIN_STATE.loading
    ) {

        return;

    }


    ADMIN_STATE.loading =
        true;


    setAPIStatus(
        "loading",
        "Synchronisation des données..."
    );


    try {

        /*
         * Les inscriptions restent la source détaillée
         * des listes affichées dans le dashboard.
         */

        const registrationsResponse =
            await apiRequest(
                API_CONFIG.routes.registrations,
                {
                    method:
                        "GET"
                }
            );


        if (
            registrationsResponse?.success !== true
        ) {

            throw new Error(
                extractAPIMessage(
                    registrationsResponse,
                    500
                )
            );

        }


        const registrations =
            isArray(
                registrationsResponse.registrations
            )
                ? registrationsResponse.registrations
                : [];


        ADMIN_STATE.registrations =
            registrations
                .map(
                    normalizeUser
                )
                .filter(Boolean);


        distributeUsers();


        /*
         * Les statistiques sont également demandées
         * directement au backend.
         */

        const statisticsResponse =
            await apiRequest(
                API_CONFIG.routes.statistics,
                {
                    method:
                        "GET"
                }
            );


        if (
            statisticsResponse?.success === true &&
            isObject(
                statisticsResponse.statistics
            )
        ) {

            ADMIN_STATE.statistics =
                statisticsResponse.statistics;

        } else {

            ADMIN_STATE.statistics =
                null;

        }


        updateCounters();

        renderRecentRegistrations();

        renderCurrentDataSection();

        renderStatistics();

        updateSynchronization();


        setAPIStatus(
            "online",
            "Données synchronisées avec le serveur."
        );

    } catch (error) {

        if (
            error.status === 401 ||
            error.status === 403
        ) {

            resetAdminState();

            showLoginScreen();


            setAPIStatus(
                "offline",
                "Authentification administrateur requise. Veuillez vous reconnecter."
            );


            showLoginMessage(
                "L'authentification administrateur n'est plus valide. Veuillez vous reconnecter.",
                "error"
            );


            return;

        }


        setAPIStatus(
            "error",
            error.message ||
            "Impossible de synchroniser les données."
        );

    } finally {

        ADMIN_STATE.loading =
            false;

    }

}


/* ================================================================
   25 — DISTRIBUTION DES UTILISATEURS
   ================================================================ */

function distributeUsers() {

    ADMIN_STATE.students =
        ADMIN_STATE.registrations.filter(
            function (user) {

                return (
                    user.role ===
                    "etudiant"
                );

            }
        );


    ADMIN_STATE.directors =
        ADMIN_STATE.registrations.filter(
            function (user) {

                return (
                    user.role ===
                    "directeur"
                );

            }
        );


    ADMIN_STATE.professors =
        ADMIN_STATE.registrations.filter(
            function (user) {

                return (
                    user.role ===
                    "professeur"
                );

            }
        );


    ADMIN_STATE.agents =
        ADMIN_STATE.registrations.filter(
            function (user) {

                return (
                    user.role ===
                    "agent"
                );

            }
        );

}


/* ================================================================
   26 — COMPTEURS
   ================================================================ */

function updateCounters() {

    const statistics =
        ADMIN_STATE.statistics;


    if (
        statistics
    ) {

        setCounter(
            DOM.studentCounter,
            statistics.etudiants
        );


        setCounter(
            DOM.directorCounter,
            statistics.directeurs
        );


        setCounter(
            DOM.professorCounter,
            statistics.professeurs
        );


        setCounter(
            DOM.agentCounter,
            statistics.agents
        );


        setCounter(
            DOM.totalCounter,
            statistics.total
        );


        return;

    }


    setCounter(
        DOM.studentCounter,
        ADMIN_STATE.students.length
    );


    setCounter(
        DOM.directorCounter,
        ADMIN_STATE.directors.length
    );


    setCounter(
        DOM.professorCounter,
        ADMIN_STATE.professors.length
    );


    setCounter(
        DOM.agentCounter,
        ADMIN_STATE.agents.length
    );


    setCounter(
        DOM.totalCounter,
        ADMIN_STATE.registrations.length
    );

}


function setCounter(
    element,
    value
) {

    if (!element) {

        return;

    }


    const number =
        Number(value);


    element.textContent =
        Number.isFinite(number)
            ? number.toLocaleString(
                "fr-FR"
            )
            : "0";

}


/* ================================================================
   27 — INSCRIPTIONS RÉCENTES
   ================================================================ */

function renderRecentRegistrations() {

    if (
        !DOM.recentRegistrationsContainer
    ) {

        return;

    }


    const records =
        [...ADMIN_STATE.registrations]
            .sort(
                sortByDateDescending
            )
            .slice(
                0,
                API_CONFIG.recentLimit
            );


    if (
        records.length === 0
    ) {

        DOM.recentRegistrationsContainer.innerHTML =
            `
            <div class="empty-state">
                Aucune inscription à afficher.
            </div>
            `;

        return;

    }


    DOM.recentRegistrationsContainer.innerHTML =
        records
            .map(
                renderRegistrationCard
            )
            .join("");

}


/* ================================================================
   28 — TRI DATE
   ================================================================ */

function sortByDateDescending(
    a,
    b
) {

    const dateA =
        new Date(
            a.createdAt
        ).getTime();


    const dateB =
        new Date(
            b.createdAt
        ).getTime();


    if (
        Number.isNaN(dateA) &&
        Number.isNaN(dateB)
    ) {

        return 0;

    }


    if (
        Number.isNaN(dateA)
    ) {

        return 1;

    }


    if (
        Number.isNaN(dateB)
    ) {

        return -1;

    }


    return dateB - dateA;

}


/* ================================================================
   29 — CARTE INSCRIPTION
   ================================================================ */

function renderRegistrationCard(
    user
) {

    return `
        <article
            class="registration-card"
            data-user-id="${escapeHTML(user.id)}"
        >

            <div class="registration-card-header">

                <strong>
                    ${escapeHTML(
                        user.nomComplet ||
                        "Nom non renseigné"
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        getRoleLabel(
                            user.role
                        )
                    )}
                </span>

            </div>

            <div class="registration-card-body">

                <p>
                    <strong>Email :</strong>
                    ${escapeHTML(
                        user.email || "—"
                    )}
                </p>

                <p>
                    <strong>WhatsApp :</strong>
                    ${escapeHTML(
                        user.whatsapp || "—"
                    )}
                </p>

                <p>
                    <strong>Institution :</strong>
                    ${escapeHTML(
                        user.nomInstitution || "—"
                    )}
                </p>

                <p>
                    <strong>Inscription :</strong>
                    ${escapeHTML(
                        formatDate(
                            user.createdAt
                        )
                    )}
                </p>

            </div>

        </article>
    `;

}


/* ================================================================
   30 — RECHERCHE UTILISATEUR
   ================================================================ */

function userMatchesSearch(
    user,
    search
) {

    const query =
        safeString(search)
            .trim()
            .toLowerCase();


    if (!query) {

        return true;

    }


    const text = [

        user.nomComplet,

        user.email,

        user.whatsapp,

        user.pays,

        user.ville,

        user.nomInstitution,

        user.nomDirecteur,

        user.nomProfesseur,

        user.niveauEtude,

        user.parcoursAcademique,

        user.role

    ]
        .join(" ")
        .toLowerCase();


    return text.includes(
        query
    );

}


/* ================================================================
   31 — CARTE UTILISATEUR DÉTAILLÉE
   ================================================================ */

function renderDetailedUserCard(
    user,
    mode
) {

    const fields = [

        [
            "Nom complet",
            user.nomComplet
        ],

        [
            "WhatsApp",
            user.whatsapp
        ],

        [
            "Email",
            user.email
        ],

        [
            "Pays",
            user.pays
        ],

        [
            "Ville",
            user.ville
        ],

        [
            "Institution",
            user.nomInstitution
        ]

    ];


    if (
        mode === "student"
    ) {

        fields.push(

            [
                "Directeur",
                user.nomDirecteur
            ],

            [
                "Professeur",
                user.nomProfesseur
            ],

            [
                "Niveau d'étude",
                user.niveauEtude
            ],

            [
                "Parcours académique",
                user.parcoursAcademique
            ]

        );

    }


    fields.push(

        [
            "Rôle",
            getRoleLabel(
                user.role
            )
        ],

        [
            "Date d'inscription",
            formatDate(
                user.createdAt
            )
        ]

    );


    const fieldsHTML =
        fields
            .map(
                function (field) {

                    return `
                        <div class="data-field">

                            <span class="data-field-label">
                                ${escapeHTML(
                                    field[0]
                                )}
                            </span>

                            <span class="data-field-value">
                                ${escapeHTML(
                                    field[1] || "—"
                                )}
                            </span>

                        </div>
                    `;

                }
            )
            .join("");


    return `
        <article
            class="user-data-card"
            data-user-id="${escapeHTML(user.id)}"
        >

            <div class="user-data-card-header">

                <div>

                    <h3>
                        ${escapeHTML(
                            user.nomComplet ||
                            "Compte sans nom"
                        )}
                    </h3>

                    <span>
                        ${escapeHTML(
                            getRoleLabel(
                                user.role
                            )
                        )}
                    </span>

                </div>

            </div>

            <div class="user-data-grid">

                ${fieldsHTML}

            </div>

        </article>
    `;

}


/* ================================================================
   32 — COLLECTIONS
   ================================================================ */

function renderUserCollection(
    container,
    users,
    search,
    mode
) {

    if (!container) {

        return;

    }


    const filtered =
        users.filter(
            function (user) {

                return userMatchesSearch(
                    user,
                    search
                );

            }
        );


    if (
        filtered.length === 0
    ) {

        container.innerHTML =
            `
            <div class="empty-state">
                Aucun compte correspondant.
            </div>
            `;

        return;

    }


    container.innerHTML =
        filtered
            .map(
                function (user) {

                    return renderDetailedUserCard(
                        user,
                        mode
                    );

                }
            )
            .join("");

}


/* ================================================================
   33 — LISTES PAR PROFIL
   ================================================================ */

function renderStudents() {

    renderUserCollection(
        DOM.studentsDataContainer,
        ADMIN_STATE.students,
        DOM.studentSearch?.value,
        "student"
    );

}


function renderDirectors() {

    renderUserCollection(
        DOM.directorsDataContainer,
        ADMIN_STATE.directors,
        DOM.directorSearch?.value,
        "director"
    );

}


function renderProfessors() {

    renderUserCollection(
        DOM.professorsDataContainer,
        ADMIN_STATE.professors,
        DOM.professorSearch?.value,
        "professor"
    );

}


function renderAgents() {

    renderUserCollection(
        DOM.agentsDataContainer,
        ADMIN_STATE.agents,
        DOM.agentSearch?.value,
        "agent"
    );

}


/* ================================================================
   34 — TOUTES LES INSCRIPTIONS
   ================================================================ */

function renderAllRegistrations() {

    if (
        !DOM.allRegistrationsContainer
    ) {

        return;

    }


    const records =
        [...ADMIN_STATE.registrations]
            .sort(
                sortByDateDescending
            );


    if (
        records.length === 0
    ) {

        DOM.allRegistrationsContainer.innerHTML =
            `
            <div class="empty-state">
                Aucune inscription enregistrée.
            </div>
            `;

        return;

    }


    DOM.allRegistrationsContainer.innerHTML =
        records
            .map(
                function (user) {

                    return renderDetailedUserCard(
                        user,
                        user.role === "etudiant"
                            ? "student"
                            : "general"
                    );

                }
            )
            .join("");

}


/* ================================================================
   35 — STATISTIQUES
   ================================================================ */

function renderStatistics() {

    if (
        !DOM.statisticsContainer
    ) {

        return;

    }


    const statistics =
        ADMIN_STATE.statistics;


    const total =
        Number(
            statistics?.total ??
            ADMIN_STATE.registrations.length
        );


    const students =
        Number(
            statistics?.etudiants ??
            ADMIN_STATE.students.length
        );


    const directors =
        Number(
            statistics?.directeurs ??
            ADMIN_STATE.directors.length
        );


    const professors =
        Number(
            statistics?.professeurs ??
            ADMIN_STATE.professors.length
        );


    const agents =
        Number(
            statistics?.agents ??
            ADMIN_STATE.agents.length
        );


    if (
        total <= 0
    ) {

        DOM.statisticsContainer.innerHTML =
            `
            <div class="empty-state">
                Aucune donnée statistique disponible.
            </div>
            `;

        return;

    }


    DOM.statisticsContainer.innerHTML =
        `

        <div class="statistics-card">

            <h3>
                Répartition des comptes
            </h3>

            <div class="statistics-list">

                ${renderStatisticLine(
                    "Étudiants",
                    students,
                    total
                )}

                ${renderStatisticLine(
                    "Directeurs",
                    directors,
                    total
                )}

                ${renderStatisticLine(
                    "Professeurs",
                    professors,
                    total
                )}

                ${renderStatisticLine(
                    "Agents",
                    agents,
                    total
                )}

            </div>

        </div>

        `;

}


/* ================================================================
   36 — LIGNE STATISTIQUE
   ================================================================ */

function renderStatisticLine(
    label,
    value,
    total
) {

    const numericValue =
        Number(value) || 0;


    const numericTotal =
        Number(total) || 0;


    const percentage =
        numericTotal > 0
            ? (
                numericValue /
                numericTotal *
                100
            ).toFixed(1)
            : "0.0";


    return `

        <div class="statistic-row">

            <div class="statistic-row-header">

                <span>
                    ${escapeHTML(label)}
                </span>

                <strong>
                    ${numericValue}
                </strong>

            </div>

            <div class="statistic-progress">

                <div
                    class="statistic-progress-value"
                    style="width:${percentage}%"
                ></div>

            </div>

            <small>
                ${percentage} %
            </small>

        </div>

    `;

}


/* ================================================================
   37 — SYNCHRONISATION
   ================================================================ */

function updateSynchronization() {

    ADMIN_STATE.lastSynchronization =
        new Date();


    if (
        DOM.lastSynchronization
    ) {

        DOM.lastSynchronization.textContent =
            "Dernière synchronisation : " +
            formatDate(
                ADMIN_STATE.lastSynchronization
            );

    }

}


/* ================================================================
   38 — SECTION COURANTE
   ================================================================ */

function renderCurrentDataSection() {

    switch (
        ADMIN_STATE.currentSection
    ) {

        case "etudiants":

            renderStudents();

            break;


        case "directeurs":

            renderDirectors();

            break;


        case "professeurs":

            renderProfessors();

            break;


        case "agents":

            renderAgents();

            break;


        case "inscriptions":

            renderAllRegistrations();

            break;


        case "statistiques":

            renderStatistics();

            break;

    }

}


/* ================================================================
   39 — NAVIGATION
   ================================================================ */

function showSection(
    sectionName
) {

    const validSections = [

        "dashboard",
        "etudiants",
        "directeurs",
        "professeurs",
        "agents",
        "inscriptions",
        "statistiques",
        "parametres"

    ];


    if (
        !validSections.includes(
            sectionName
        )
    ) {

        sectionName =
            "dashboard";

    }


    ADMIN_STATE.currentSection =
        sectionName;


    DOM.sections.forEach(
        function (section) {

            const active =
                section.dataset.section ===
                sectionName;


            section.classList.toggle(
                "hidden",
                !active
            );


            section.classList.toggle(
                "active",
                active
            );

        }
    );


    DOM.navigationButtons.forEach(
        function (button) {

            button.classList.toggle(
                "active",
                button.dataset.adminSection ===
                sectionName
            );

        }
    );


    renderCurrentDataSection();

}


/* ================================================================
   40 — ACTUALISATION
   ================================================================ */

async function refreshDashboard() {

    if (
        !ADMIN_STATE.authenticated
    ) {

        return;

    }


    await loadDashboardData();

}


/* ================================================================
   41 — AUTO REFRESH
   ================================================================ */

function startAutoRefresh() {

    stopAutoRefresh();


    ADMIN_STATE.refreshTimer =
        window.setInterval(
            function () {

                if (
                    ADMIN_STATE.authenticated
                ) {

                    loadDashboardData();

                }

            },
            API_CONFIG.autoRefreshMilliseconds
        );

}


function stopAutoRefresh() {

    if (
        ADMIN_STATE.refreshTimer !== null
    ) {

        window.clearInterval(
            ADMIN_STATE.refreshTimer
        );


        ADMIN_STATE.refreshTimer =
            null;

    }

}


/* ================================================================
   42 — NAVIGATION EVENTS
   ================================================================ */

function initializeNavigationEvents() {

    DOM.navigationButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    showSection(
                        button.dataset.adminSection
                    );

                }
            );

        }
    );

}


/* ================================================================
   43 — RECHERCHE EVENTS
   ================================================================ */

function initializeSearchEvents() {

    if (
        DOM.studentSearch
    ) {

        DOM.studentSearch.addEventListener(
            "input",
            renderStudents
        );

    }


    if (
        DOM.directorSearch
    ) {

        DOM.directorSearch.addEventListener(
            "input",
            renderDirectors
        );

    }


    if (
        DOM.professorSearch
    ) {

        DOM.professorSearch.addEventListener(
            "input",
            renderProfessors
        );

    }


    if (
        DOM.agentSearch
    ) {

        DOM.agentSearch.addEventListener(
            "input",
            renderAgents
        );

    }

}


/* ================================================================
   44 — LOGIN EVENTS
   ================================================================ */

function initializeLoginEvents() {

    if (
        DOM.adminLoginForm
    ) {

        DOM.adminLoginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                clearLoginMessage();


                const identifier =
                    DOM.adminIdentifier
                        ?.value
                        .trim();


                const password =
                    DOM.adminPassword
                        ?.value;


                if (
                    !identifier ||
                    !password
                ) {

                    showLoginMessage(
                        "Veuillez saisir l'identifiant et le mot de passe.",
                        "error"
                    );


                    return;

                }


                setLoginLoading(
                    true
                );


                try {

                    await loginAdmin(
                        identifier,
                        password
                    );


                    /*
                     * Le champ visible est nettoyé.
                     *
                     * Le credential nécessaire aux requêtes
                     * protégées reste uniquement dans
                     * ADMIN_STATE.adminCredentials.
                     */

                    if (
                        DOM.adminPassword
                    ) {

                        DOM.adminPassword.value =
                            "";

                    }

                } catch (error) {

                    /*
                     * En cas d'échec, aucune credential
                     * ne doit rester dans l'état authentifié.
                     */

                    ADMIN_STATE.authenticated =
                        false;

                    ADMIN_STATE.admin =
                        null;

                    ADMIN_STATE.adminCredentials =
                        null;


                    showLoginMessage(
                        error.message ||
                        "Connexion impossible.",
                        "error"
                    );


                    setAPIStatus(
                        "error",
                        error.message ||
                        "Échec de connexion au serveur."
                    );

                } finally {

                    setLoginLoading(
                        false
                    );

                }

            }
        );

    }


    if (
        DOM.toggleAdminPassword
    ) {

        DOM.toggleAdminPassword.addEventListener(
            "click",
            togglePasswordVisibility
        );

    }


    if (
        DOM.adminLogoutButton
    ) {

        DOM.adminLogoutButton.addEventListener(
            "click",
            logoutAdmin
        );

    }

}


/* ================================================================
   45 — REFRESH EVENTS
   ================================================================ */

function initializeRefreshEvents() {

    if (
        DOM.refreshDashboardButton
    ) {

        DOM.refreshDashboardButton.addEventListener(
            "click",
            refreshDashboard
        );

    }


    if (
        DOM.refreshRegistrationsButton
    ) {

        DOM.refreshRegistrationsButton.addEventListener(
            "click",
            async function () {

                await refreshDashboard();


                showSection(
                    "inscriptions"
                );

            }
        );

    }


    if (
        DOM.viewAllRegistrationsButton
    ) {

        DOM.viewAllRegistrationsButton.addEventListener(
            "click",
            function () {

                showSection(
                    "inscriptions"
                );

            }
        );

    }

}


/* ================================================================
   46 — PARAMÈTRES
   ================================================================ */

function initializeSettings() {

    if (
        DOM.apiEndpointDisplay
    ) {

        DOM.apiEndpointDisplay.textContent =
            API_CONFIG.baseURL;

    }

}


/* ================================================================
   47 — VISIBILITÉ PAGE
   ================================================================ */

function initializeVisibilityHandler() {

    document.addEventListener(
        "visibilitychange",
        function () {

            if (
                document.visibilityState ===
                "visible" &&
                ADMIN_STATE.authenticated
            ) {

                loadDashboardData();

            }

        }
    );

}


/* ================================================================
   48 — INITIALISATION
   ================================================================ */

async function initializeFusionAdminDashboard() {

    initializeDOMReferences();

    initializeNavigationEvents();

    initializeSearchEvents();

    initializeLoginEvents();

    initializeRefreshEvents();

    initializeSettings();

    initializeVisibilityHandler();


    showLoginScreen();


    showSection(
        "dashboard"
    );


    setAPIStatus(
        "online",
        "Serveur API prêt. Connectez-vous."
    );

}


/* ================================================================
   49 — DÉMARRAGE
   ================================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeFusionAdminDashboard,
        {
            once: true
        }
    );

} else {

    initializeFusionAdminDashboard();

}


/* ================================================================
   FIN
   ================================================================ */




















