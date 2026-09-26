/* ================================================================
   FOBAS — LABORATOIRE DE CRÉATION WEB
   FICHIER : applaboratoirehtmlfobas.js
   VERSION : 1.0.0
   MOTEUR : FOBAS WEB LABORATORY ENGINE

   Fonctionnalités :
   - Gestion complète des projets
   - Gestion HTML / CSS / JavaScript
   - Éditeur avec Undo / Redo
   - Aperçu réel dans iframe
   - Pédagogique : Théorie / Pratique / Exercices / Devoirs
   - Dictionnaire HTML
   - Bibliothèque HTML
   - Gestion des ressources locales
   - IndexedDB pour images / vidéos
   - LocalStorage pour projets et paramètres
   - TTS / Écouter
   - Plein écran
   - Zoom laboratoire
   - Pinch 2 doigts laboratoire
   - Pinch 2 doigts écran/application
   - Touch / Android
   - Création / renommage / suppression
   - Sauvegarde automatique
   ================================================================ */

"use strict";

/* ================================================================
   01 — CONFIGURATION GÉNÉRALE
   ================================================================ */

const FOBAS_WEB_LAB = {
    version: "1.0.0",

    storageKey: "FOBAS_WEB_LABORATORY_PROJECTS_V1",
    currentProjectKey: "FOBAS_WEB_LABORATORY_CURRENT_PROJECT_V1",
    settingsKey: "FOBAS_WEB_LABORATORY_SETTINGS_V1",

    databaseName: "FOBAS_WEB_LABORATORY_DB",
    databaseVersion: 1,
    resourceStore: "resources",

    defaultProjectName: "Mon Projet",

    defaultFiles: {
        "index.html": {
            type: "html",
            content:
`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mon Projet FOBAS</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <main>
        <h1>Bienvenue dans FOBAS</h1>
        <p>Commencez votre création Web.</p>
        <button id="demoButton">Cliquer ici</button>
    </main>

    <script src="script.js"></script>
</body>
</html>`
        },

        "style.css": {
            type: "css",
            content:
`body {
    margin: 0;
    min-height: 100vh;
    font-family: Arial, sans-serif;
    background: #f4f7fb;
    color: #172033;
}

main {
    max-width: 900px;
    margin: 60px auto;
    padding: 30px;
    text-align: center;
}

h1 {
    margin-bottom: 15px;
}

button {
    padding: 12px 20px;
    border: 0;
    border-radius: 8px;
    cursor: pointer;
}`
        },

        "script.js": {
            type: "js",
            content:
`document.addEventListener("DOMContentLoaded", function () {

    const button = document.getElementById("demoButton");

    if (button) {
        button.addEventListener("click", function () {
            alert("JavaScript FOBAS fonctionne correctement.");
        });
    }

});`
        }
    },

    supportedExtensions: {
        html: "html",
        htm: "html",
        css: "css",
        js: "js",
        mjs: "js"
    },

    laboratoryZoomMin: 50,
    laboratoryZoomMax: 200,
    laboratoryZoomStep: 10,

    screenZoomMin: 70,
    screenZoomMax: 150,

    defaultLaboratoryZoom: 100,
    defaultScreenZoom: 100
};


/* ================================================================
   02 — ÉTAT GLOBAL
   ================================================================ */

const state = {

    projects: [],
    currentProjectId: null,

    activeFileName: "index.html",

    editorHistory: [],
    editorHistoryIndex: -1,

    currentPedagogicalChapter: 0,
    currentPedagogicalTab: "theorie",

    laboratoryZoom: 100,
    screenZoom: 100,

    currentPanel: "laboratoryPanel",

    dictionarySearch: "",
    librarySearch: "",
    libraryCategory: "all",

    db: null,

    toastTimer: null,

    autosaveTimer: null,

    touch: {
        globalPinch: false,
        labPinch: false,

        startDistance: 0,
        startGlobalZoom: 100,
        startLabZoom: 100,

        lastX: 0,
        lastY: 0
    }
};


/* ================================================================
   03 — DOM
   ================================================================ */

const dom = {};


/* ================================================================
   04 — UTILITAIRES DOM
   ================================================================ */

function byId(id) {
    return document.getElementById(id);
}


function cacheDOM() {

    const ids = [

        "fobasWebLaboratoryApp",
        "newProjectBtn",
        "saveProjectBtn",
        "projectManagerBtn",

        "pedagogicalBtn",
        "dictionaryBtn",
        "libraryBtn",
        "codeEditorBtn",
        "laboratoryBtn",

        "projectExplorerPanel",
        "currentProjectName",
        "renameProjectBtn",

        "newFileBtn",
        "openFileBtn",
        "deleteFileBtn",
        "projectFileTree",
        "openProjectsBtn",
        "deleteProjectBtn",

        "activeFileName",
        "activeFileType",
        "undoBtn",
        "redoBtn",
        "clearEditorBtn",
        "saveFileBtn",
        "codeEditor",
        "editorLineInfo",
        "editorCharacterInfo",

        "laboratoryPanel",
        "laboratoryProjectName",
        "runBtn",
        "refreshPreviewBtn",
        "initializeLabBtn",
        "listenLabBtn",
        "labZoomOutBtn",
        "labZoomValue",
        "labZoomInBtn",
        "fullscreenLabBtn",
        "closeLabBtn",
        "laboratoryViewport",
        "laboratoryCanvas",
        "previewFrame",
        "laboratoryStatusMessage",

        "pedagogicalPanel",
        "listenPedBtn",
        "closePedagogicalBtn",
        "chapterSelect",
        "previousChapterBtn",
        "nextChapterBtn",
        "addChapterBtn",
        "theorieTabBtn",
        "pratiqueTabBtn",
        "exercicesTabBtn",
        "devoirsTabBtn",
        "pedagogicalContent",

        "dictionaryPanel",
        "dictionarySearch",
        "listenDictionaryBtn",
        "closeDictionaryBtn",
        "dictionaryContent",

        "libraryPanel",
        "listenLibraryBtn",
        "closeLibraryBtn",
        "librarySearch",
        "libraryCategorySelect",
        "libraryContent",

        "projectManagerPanel",
        "closeProjectManagerBtn",
        "createProjectFromManagerBtn",
        "projectList",

        "resourcePanel",
        "closeResourcePanelBtn",
        "imageInput",
        "videoInput",
        "resourceList",

        "toast"
    ];

    ids.forEach(function (id) {
        dom[id] = byId(id);
    });
}


/* ================================================================
   05 — OUTILS GÉNÉRAUX
   ================================================================ */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function generateId(prefix) {

    return (
        String(prefix || "id") +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random().toString(36).slice(2, 9)
    );
}


function normalizeFileName(name) {

    return String(name || "")
        .trim()
        .replace(/[\\/:*?"<>|]/g, "_")
        .replace(/\s+/g, "_");
}


function getFileType(fileName) {

    const clean = String(fileName || "")
        .toLowerCase()
        .split("?")[0];

    const extension = clean.includes(".")
        ? clean.split(".").pop()
        : "";

    return FOBAS_WEB_LAB.supportedExtensions[extension] || "text";
}


function getFileIcon(type) {

    if (type === "html") return "🌐";
    if (type === "css") return "🎨";
    if (type === "js") return "⚙️";

    return "📄";
}


function getCurrentProject() {

    return state.projects.find(function (project) {
        return project.id === state.currentProjectId;
    }) || null;
}


function getCurrentFile() {

    const project = getCurrentProject();

    if (!project || !project.files) {
        return null;
    }

    return project.files[state.activeFileName] || null;
}


function setStatus(message) {

    if (dom.laboratoryStatusMessage) {
        dom.laboratoryStatusMessage.textContent = message;
    }
}


function showToast(message, duration) {

    if (!dom.toast) return;

    clearTimeout(state.toastTimer);

    dom.toast.textContent = String(message || "");
    dom.toast.classList.add("show");

    state.toastTimer = setTimeout(function () {
        dom.toast.classList.remove("show");
    }, duration || 2600);
}


/* ================================================================
   06 — LOCALSTORAGE
   ================================================================ */

function loadStoredProjects() {

    try {

        const raw = localStorage.getItem(
            FOBAS_WEB_LAB.storageKey
        );

        if (!raw) {
            state.projects = [];
            return;
        }

        const parsed = JSON.parse(raw);

        state.projects = Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "FOBAS : erreur de lecture des projets.",
            error
        );

        state.projects = [];
    }
}


function saveStoredProjects() {

    try {

        localStorage.setItem(
            FOBAS_WEB_LAB.storageKey,
            JSON.stringify(state.projects)
        );

        localStorage.setItem(
            FOBAS_WEB_LAB.currentProjectKey,
            String(state.currentProjectId || "")
        );

    } catch (error) {

        console.error(
            "FOBAS : erreur de sauvegarde.",
            error
        );

        showToast(
            "Impossible de sauvegarder localement. Le stockage du navigateur est peut-être plein."
        );
    }
}


function loadSettings() {

    try {

        const raw = localStorage.getItem(
            FOBAS_WEB_LAB.settingsKey
        );

        if (!raw) return;

        const settings = JSON.parse(raw);

        if (
            Number.isFinite(settings.laboratoryZoom)
        ) {
            state.laboratoryZoom =
                clamp(
                    settings.laboratoryZoom,
                    FOBAS_WEB_LAB.laboratoryZoomMin,
                    FOBAS_WEB_LAB.laboratoryZoomMax
                );
        }

        if (
            Number.isFinite(settings.screenZoom)
        ) {
            state.screenZoom =
                clamp(
                    settings.screenZoom,
                    FOBAS_WEB_LAB.screenZoomMin,
                    FOBAS_WEB_LAB.screenZoomMax
                );
        }

    } catch (error) {

        console.warn(
            "FOBAS : paramètres non récupérables.",
            error
        );
    }
}


function saveSettings() {

    try {

        localStorage.setItem(
            FOBAS_WEB_LAB.settingsKey,
            JSON.stringify({
                laboratoryZoom: state.laboratoryZoom,
                screenZoom: state.screenZoom
            })
        );

    } catch (error) {

        console.warn(
            "FOBAS : paramètres non sauvegardés.",
            error
        );
    }
}


function clamp(value, min, max) {

    return Math.min(
        max,
        Math.max(min, value)
    );
}


/* ================================================================
   07 — PROJETS
   ================================================================ */

function createProjectObject(name) {

    const now = new Date().toISOString();

    return {
        id: generateId("project"),
        name:
            String(name || FOBAS_WEB_LAB.defaultProjectName)
                .trim()
            || FOBAS_WEB_LAB.defaultProjectName,

        createdAt: now,
        updatedAt: now,

        files: JSON.parse(
            JSON.stringify(
                FOBAS_WEB_LAB.defaultFiles
            )
        )
    };
}


function createNewProject() {

    const proposedName = window.prompt(
        "Nom du nouveau projet :",
        "Mon Projet " + (state.projects.length + 1)
    );

    if (proposedName === null) {
        return;
    }

    const name = proposedName.trim();

    if (!name) {
        showToast("Le nom du projet est obligatoire.");
        return;
    }

    const project = createProjectObject(name);

    state.projects.push(project);
    state.currentProjectId = project.id;
    state.activeFileName = "index.html";

    saveStoredProjects();

    closePanel("projectManagerPanel");

    renderAll();

    openPanel("laboratoryPanel");

    loadActiveFileIntoEditor();

    runProject();

    showToast("Projet créé : " + project.name);
}


function renameCurrentProject() {

    const project = getCurrentProject();

    if (!project) return;

    const proposedName = window.prompt(
        "Nouveau nom du projet :",
        project.name
    );

    if (proposedName === null) return;

    const name = proposedName.trim();

    if (!name) {
        showToast("Le nom du projet est obligatoire.");
        return;
    }

    project.name = name;
    project.updatedAt = new Date().toISOString();

    saveStoredProjects();

    renderProjectInformation();
    renderProjectList();

    showToast("Projet renommé.");
}


function deleteCurrentProject() {

    const project = getCurrentProject();

    if (!project) return;

    const confirmed = window.confirm(
        "Supprimer définitivement le projet « " +
        project.name +
        " » ?"
    );

    if (!confirmed) return;

    state.projects = state.projects.filter(
        function (item) {
            return item.id !== project.id;
        }
    );

    const nextProject = state.projects[0];

    if (nextProject) {

        state.currentProjectId = nextProject.id;
        state.activeFileName = Object.keys(
            nextProject.files
        )[0] || "index.html";

    } else {

        const newProject = createProjectObject(
            FOBAS_WEB_LAB.defaultProjectName
        );

        state.projects.push(newProject);
        state.currentProjectId = newProject.id;
        state.activeFileName = "index.html";
    }

    saveStoredProjects();

    renderAll();

    loadActiveFileIntoEditor();

    runProject();

    showToast("Projet supprimé.");
}


function selectProject(projectId) {

    const project = state.projects.find(
        function (item) {
            return item.id === projectId;
        }
    );

    if (!project) return;

    state.currentProjectId = project.id;

    const firstFile = Object.keys(
        project.files || {}
    )[0];

    if (
        !project.files[state.activeFileName]
        && firstFile
    ) {
        state.activeFileName = firstFile;
    }

    saveStoredProjects();

    renderAll();

    loadActiveFileIntoEditor();

    runProject();

    closePanel("projectManagerPanel");

    showToast("Projet ouvert : " + project.name);
}


/* ================================================================
   08 — FICHIERS
   ================================================================ */

function createNewFile() {

    const project = getCurrentProject();

    if (!project) return;

    const rawName = window.prompt(
        "Nom du fichier :",
        "nouveau.html"
    );

    if (rawName === null) return;

    const fileName = normalizeFileName(rawName);

    if (!fileName) {
        showToast("Nom de fichier invalide.");
        return;
    }

    if (project.files[fileName]) {
        showToast("Ce fichier existe déjà.");
        return;
    }

    const type = getFileType(fileName);

    let content = "";

    if (type === "html") {

        content =
`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>${escapeHTML(fileName)}</title>
</head>
<body>

</body>
</html>`;

    } else if (type === "css") {

        content =
`/* ${fileName} */

body {
    margin: 0;
}`;

    } else if (type === "js") {

        content =
`// ${fileName}

document.addEventListener("DOMContentLoaded", function () {

});`;

    }

    project.files[fileName] = {
        type: type,
        content: content
    };

    project.updatedAt = new Date().toISOString();

    state.activeFileName = fileName;

    saveStoredProjects();

    renderFileTree();

    loadActiveFileIntoEditor();

    showToast("Fichier créé : " + fileName);
}


function openSelectedFile() {

    const project = getCurrentProject();

    if (!project) return;

    const fileNames = Object.keys(project.files);

    if (!fileNames.length) {
        showToast("Aucun fichier.");
        return;
    }

    let message =
        "Fichiers disponibles :\n\n" +
        fileNames.map(
            function (name, index) {
                return (index + 1) + ". " + name;
            }
        ).join("\n") +
        "\n\nEntrez le numéro :";

    const answer = window.prompt(message);

    if (answer === null) return;

    const index = Number(answer) - 1;

    if (
        !Number.isInteger(index)
        || index < 0
        || index >= fileNames.length
    ) {
        showToast("Sélection invalide.");
        return;
    }

    state.activeFileName = fileNames[index];

    loadActiveFileIntoEditor();

    showToast("Fichier ouvert.");
}


function deleteSelectedFile() {

    const project = getCurrentProject();

    if (!project) return;

    const fileName = state.activeFileName;

    if (!project.files[fileName]) {
        showToast("Aucun fichier sélectionné.");
        return;
    }

    if (
        Object.keys(project.files).length <= 1
    ) {
        showToast(
            "Le projet doit conserver au moins un fichier."
        );
        return;
    }

    const confirmed = window.confirm(
        "Supprimer le fichier « " +
        fileName +
        " » ?"
    );

    if (!confirmed) return;

    delete project.files[fileName];

    const nextFile = Object.keys(
        project.files
    )[0];

    state.activeFileName = nextFile;

    project.updatedAt = new Date().toISOString();

    saveStoredProjects();

    renderFileTree();

    loadActiveFileIntoEditor();

    runProject();

    showToast("Fichier supprimé.");
}


function selectFile(fileName) {

    const project = getCurrentProject();

    if (!project || !project.files[fileName]) {
        return;
    }

    saveCurrentEditorToState();

    state.activeFileName = fileName;

    loadActiveFileIntoEditor();

    renderFileTree();
}


function saveCurrentEditorToState() {

    const project = getCurrentProject();

    if (!project || !dom.codeEditor) return;

    const file = project.files[state.activeFileName];

    if (!file) return;

    file.content = dom.codeEditor.value;
    file.type = getFileType(
        state.activeFileName
    );

    project.updatedAt = new Date().toISOString();
}


function saveCurrentFile() {

    saveCurrentEditorToState();

    saveStoredProjects();

    renderFileTree();

    updateEditorInformation();

    setStatus(
        "Fichier « " +
        state.activeFileName +
        " » sauvegardé."
    );

    showToast("Fichier sauvegardé.");
}


function renameActiveFile() {

    const project = getCurrentProject();

    if (!project) return;

    const oldName = state.activeFileName;

    const proposed = window.prompt(
        "Nouveau nom du fichier :",
        oldName
    );

    if (proposed === null) return;

    const newName = normalizeFileName(proposed);

    if (!newName) {
        showToast("Nom invalide.");
        return;
    }

    if (
        newName !== oldName
        && project.files[newName]
    ) {
        showToast("Ce nom existe déjà.");
        return;
    }

    project.files[newName] =
        project.files[oldName];

    delete project.files[oldName];

    state.activeFileName = newName;

    project.updatedAt = new Date().toISOString();

    saveStoredProjects();

    renderFileTree();
    loadActiveFileIntoEditor();

    showToast("Fichier renommé.");
}


/* ================================================================
   09 — ÉDITEUR
   ================================================================ */

function loadActiveFileIntoEditor() {

    const project = getCurrentProject();

    if (!project || !dom.codeEditor) return;

    const file = project.files[state.activeFileName];

    if (!file) return;

    dom.codeEditor.value = file.content || "";

    resetEditorHistory();

    updateEditorInformation();
    updateEditorStatus();
}


function resetEditorHistory() {

    if (!dom.codeEditor) return;

    state.editorHistory = [
        dom.codeEditor.value
    ];

    state.editorHistoryIndex = 0;
}


function pushEditorHistory(value) {

    if (
        state.editorHistory[
            state.editorHistoryIndex
        ] === value
    ) {
        return;
    }

    state.editorHistory =
        state.editorHistory.slice(
            0,
            state.editorHistoryIndex + 1
        );

    state.editorHistory.push(value);

    if (state.editorHistory.length > 100) {
        state.editorHistory.shift();
    }

    state.editorHistoryIndex =
        state.editorHistory.length - 1;
}


function undoEditor() {

    if (
        state.editorHistoryIndex <= 0
    ) {
        showToast("Aucune modification à annuler.");
        return;
    }

    saveCurrentEditorToState();

    state.editorHistoryIndex--;

    dom.codeEditor.value =
        state.editorHistory[
            state.editorHistoryIndex
        ];

    saveCurrentEditorToState();

    updateEditorStatus();
}


function redoEditor() {

    if (
        state.editorHistoryIndex >=
        state.editorHistory.length - 1
    ) {
        showToast("Aucune modification à rétablir.");
        return;
    }

    state.editorHistoryIndex++;

    dom.codeEditor.value =
        state.editorHistory[
            state.editorHistoryIndex
        ];

    saveCurrentEditorToState();

    updateEditorStatus();
}


function clearEditor() {

    if (!dom.codeEditor) return;

    const confirmed = window.confirm(
        "Effacer tout le contenu de ce fichier ?"
    );

    if (!confirmed) return;

    dom.codeEditor.value = "";

    pushEditorHistory("");

    saveCurrentEditorToState();

    updateEditorStatus();

    showToast("Éditeur vidé.");
}


function updateEditorInformation() {

    const file = getCurrentFile();

    if (!file) return;

    if (dom.activeFileName) {
        dom.activeFileName.textContent =
            state.activeFileName;
    }

    if (dom.activeFileType) {
        dom.activeFileType.textContent =
            String(file.type || "text")
                .toUpperCase();
    }
}


function updateEditorStatus() {

    if (!dom.codeEditor) return;

    const value = dom.codeEditor.value;

    const beforeCursor =
        value.slice(
            0,
            dom.codeEditor.selectionStart || 0
        );

    const line =
        beforeCursor.split("\n").length;

    if (dom.editorLineInfo) {
        dom.editorLineInfo.textContent =
            "Ligne " + line;
    }

    if (dom.editorCharacterInfo) {
        dom.editorCharacterInfo.textContent =
            value.length +
            " caractère" +
            (value.length > 1 ? "s" : "");
    }
}


function initializeEditorEvents() {

    if (!dom.codeEditor) return;

    dom.codeEditor.addEventListener(
        "input",
        function () {

            saveCurrentEditorToState();

            pushEditorHistory(
                dom.codeEditor.value
            );

            updateEditorStatus();

            scheduleAutosave();
        }
    );

    dom.codeEditor.addEventListener(
        "keyup",
        updateEditorStatus
    );

    dom.codeEditor.addEventListener(
        "click",
        updateEditorStatus
    );

    dom.codeEditor.addEventListener(
        "select",
        updateEditorStatus
    );

    dom.codeEditor.addEventListener(
        "keydown",
        function (event) {

            if (
                (event.ctrlKey || event.metaKey)
                && event.key.toLowerCase() === "s"
            ) {
                event.preventDefault();
                saveCurrentFile();
            }

            if (
                (event.ctrlKey || event.metaKey)
                && event.key.toLowerCase() === "z"
            ) {
                event.preventDefault();

                if (event.shiftKey) {
                    redoEditor();
                } else {
                    undoEditor();
                }
            }

            if (
                (event.ctrlKey || event.metaKey)
                && event.key.toLowerCase() === "y"
            ) {
                event.preventDefault();
                redoEditor();
            }

        }
    );
}


function scheduleAutosave() {

    clearTimeout(state.autosaveTimer);

    state.autosaveTimer = setTimeout(
        function () {

            saveCurrentEditorToState();
            saveStoredProjects();

        },
        900
    );
}


/* ================================================================
   10 — ARBRE DES FICHIERS
   ================================================================ */

function renderFileTree() {

    if (!dom.projectFileTree) return;

    const project = getCurrentProject();

    if (!project) {
        dom.projectFileTree.innerHTML =
            '<div class="empty-project-message">Aucun projet.</div>';
        return;
    }

    const names = Object.keys(
        project.files || {}
    ).sort(function (a, b) {

        if (a === "index.html") return -1;
        if (b === "index.html") return 1;

        return a.localeCompare(b);
    });

    if (!names.length) {

        dom.projectFileTree.innerHTML =
            '<div class="empty-project-message">Aucun fichier.</div>';

        return;
    }

    dom.projectFileTree.innerHTML = "";

    names.forEach(function (fileName) {

        const file = project.files[fileName];

        const item = document.createElement("button");

        item.type = "button";
        item.className = "file-item";

        if (
            fileName === state.activeFileName
        ) {
            item.classList.add("active");
        }

        item.setAttribute(
            "role",
            "treeitem"
        );

        item.dataset.fileName = fileName;

        item.innerHTML =
            '<span class="file-icon">' +
            escapeHTML(
                getFileIcon(file.type)
            ) +
            '</span>' +

            '<span class="file-name">' +
            escapeHTML(fileName) +
            '</span>';

        item.addEventListener(
            "click",
            function () {
                selectFile(fileName);
            }
        );

        item.addEventListener(
            "contextmenu",
            function (event) {

                event.preventDefault();

                if (
                    window.confirm(
                        "Renommer « " +
                        fileName +
                        " » ?"
                    )
                ) {
                    state.activeFileName = fileName;
                    renameActiveFile();
                }
            }
        );

        dom.projectFileTree.appendChild(item);
    });
}


/* ================================================================
   11 — INFORMATIONS PROJET
   ================================================================ */

function renderProjectInformation() {

    const project = getCurrentProject();

    const name =
        project
            ? project.name
            : FOBAS_WEB_LAB.defaultProjectName;

    if (dom.currentProjectName) {
        dom.currentProjectName.textContent =
            name;
    }

    if (dom.laboratoryProjectName) {
        dom.laboratoryProjectName.textContent =
            name;
    }
}







/* ================================================================
   12 — EXÉCUTION DU PROJET
   ================================================================ */

function getProjectFile(project, name) {

    if (!project || !project.files || !name) {
        return "";
    }

    return project.files[name]
        ? project.files[name].content || ""
        : "";
}


/*
   Normalise une référence de fichier provenant du HTML.

   Exemples acceptés :
   style.css
   ./style.css
   css/style.css
   ./css/style.css?v=1
   js/app.js#main
*/
function normalizeProjectReference(reference) {

    let value = String(reference || "").trim();

    if (!value) {
        return "";
    }

    value = value.split("#")[0];
    value = value.split("?")[0];

    value = value.replace(/\\/g, "/");

    while (value.indexOf("./") === 0) {
        value = value.substring(2);
    }

    value = value.replace(/^\/+/, "");

    return value;
}


/*
   Vérifie si une référence correspond réellement à un fichier
   présent dans le projet.

   La recherche se fait d'abord sur le chemin exact.
   Si aucun chemin exact n'est trouvé, le nom simple est utilisé
   uniquement lorsqu'il est unique dans le projet.
*/
function resolveProjectFileName(project, reference) {

    if (!project || !project.files || !reference) {
        return null;
    }

    const normalizedReference =
        normalizeProjectReference(reference);

    if (!normalizedReference) {
        return null;
    }

    const fileNames =
        Object.keys(project.files);

    /*
       1 — Correspondance exacte.
    */
    const exactMatch =
        fileNames.find(function (name) {

            return (
                normalizeProjectReference(name) ===
                normalizedReference
            );

        });

    if (exactMatch) {
        return exactMatch;
    }

    /*
       2 — Correspondance par nom de fichier uniquement,
       seulement si ce nom est unique dans le projet.
    */
    const referenceBaseName =
        normalizedReference
            .split("/")
            .pop();

    const baseMatches =
        fileNames.filter(function (name) {

            return (
                normalizeProjectReference(name)
                    .split("/")
                    .pop() === referenceBaseName
            );

        });

    if (baseMatches.length === 1) {
        return baseMatches[0];
    }

    return null;
}


/*
   Détermine le HTML qui doit servir de page d'entrée.

   RÈGLE PRINCIPALE :
   si le fichier actuellement actif est un HTML/HTM,
   c'est LUI qui doit être utilisé.

   index.html n'est donc plus prioritaire.

   Si le fichier actif n'est pas un HTML, on utilise le premier
   HTML disponible comme solution de secours.
*/
function getActiveHTMLFileName(project) {

    if (!project || !project.files) {
        return null;
    }

    const activeFileName =
        state && state.activeFileName
            ? state.activeFileName
            : "";

    if (
        activeFileName &&
        project.files[activeFileName] &&
        getFileType(activeFileName) === "html"
    ) {

        return activeFileName;
    }

    /*
       Solution de secours si le fichier actif est CSS/JS
       ou si le fichier actif n'existe plus.
    */
    const firstHTML =
        Object.keys(project.files)
            .find(function (name) {

                return getFileType(name) === "html";

            });

    return firstHTML || null;
}


/*
   Construit le document qui sera envoyé au preview.

   IMPORTANT :
   - le HTML vient du fichier HTML actuellement actif ;
   - seuls les CSS réellement référencés par ce HTML
     sont intégrés ;
   - seuls les JS réellement référencés par ce HTML
     sont intégrés ;
   - les autres CSS/JS du projet ne sont pas injectés.
*/
function buildProjectDocument() {

    const project = getCurrentProject();

    if (!project) {
        return "";
    }

    const activeHTMLFileName =
        getActiveHTMLFileName(project);

    let html =
        activeHTMLFileName
            ? getProjectFile(
                project,
                activeHTMLFileName
            )
            : "";

    if (!html) {

        html =
`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
</head>
<body></body>
</html>`;
    }

    html =
        injectProjectAssets(
            html,
            project,
            activeHTMLFileName
        );

    return html;
}


/*
   Intègre les ressources locales référencées par le HTML actif.

   CSS :
   <link rel="stylesheet" href="style.css">

   devient :

   <style data-fobas-generated-css>
       contenu de style.css
   </style>

   JS :
   <script src="script.js"></script>

   devient :

   <script data-fobas-generated-js>
       contenu de script.js
   </script>

   Les ressources externes restent inchangées.
*/
function injectProjectAssets(
    html,
    project,
    activeHTMLFileName
) {

    let result =
        String(html || "");

    if (!project || !project.files) {
        return result;
    }

    /*
       ------------------------------------------------------------
       CSS LOCAUX RÉFÉRENCÉS PAR LE HTML ACTIF
       ------------------------------------------------------------
    */

    result =
        result.replace(
            /<link\b([^>]*?)>/gi,
            function (
                fullTag,
                attributes
            ) {

                const relMatch =
                    attributes.match(
                        /\brel\s*=\s*["']([^"']+)["']/i
                    );

                const hrefMatch =
                    attributes.match(
                        /\bhref\s*=\s*["']([^"']+)["']/i
                    );

                if (!hrefMatch) {
                    return fullTag;
                }

                const href =
                    hrefMatch[1].trim();

                const rel =
                    relMatch
                        ? relMatch[1].toLowerCase()
                        : "";

                /*
                   On ne touche qu'aux feuilles CSS locales.
                */
                if (
                    rel.split(/\s+/).indexOf("stylesheet") === -1
                ) {
                    return fullTag;
                }

                /*
                   Les URL externes restent dans le document.
                   Exemples :
                   https://...
                   http://...
                   //
                   data:...
                */
                if (
                    /^(?:https?:|\/\/|data:|blob:)/i.test(href)
                ) {
                    return fullTag;
                }

                const cssFileName =
                    resolveProjectFileName(
                        project,
                        href
                    );

                if (!cssFileName) {

                    /*
                       Si le fichier n'existe pas dans le projet,
                       on conserve le lien original au lieu de
                       casser silencieusement le HTML.
                    */
                    return fullTag;
                }

                const cssContent =
                    getProjectFile(
                        project,
                        cssFileName
                    );

                return (
                    "<style data-fobas-generated-css " +
                    'data-fobas-source="' +
                    escapeHTML(cssFileName) +
                    '">\n' +
                    cssContent +
                    "\n</style>"
                );
            }
        );


    /*
       ------------------------------------------------------------
       JAVASCRIPT LOCAUX RÉFÉRENCÉS PAR LE HTML ACTIF
       ------------------------------------------------------------
    */

    result =
        result.replace(
            /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
            function (
                fullTag,
                attributes,
                inlineContent
            ) {

                const srcMatch =
                    attributes.match(
                        /\bsrc\s*=\s*["']([^"']+)["']/i
                    );

                /*
                   Script déjà inline :
                   on le conserve exactement.
                */
                if (!srcMatch) {
                    return fullTag;
                }

                const src =
                    srcMatch[1].trim();

                /*
                   Les scripts externes restent inchangés.
                */
                if (
                    /^(?:https?:|\/\/|data:|blob:)/i.test(src)
                ) {
                    return fullTag;
                }

                const jsFileName =
                    resolveProjectFileName(
                        project,
                        src
                    );

                if (!jsFileName) {

                    /*
                       Si le fichier local n'existe pas,
                       on conserve le script original.
                    */
                    return fullTag;
                }

                const jsContent =
                    getProjectFile(
                        project,
                        jsFileName
                    );

                /*
                   On conserve les attributs du script
                   sauf src, puisque le code est maintenant
                   intégré directement dans le preview.
                */
                const cleanedAttributes =
                    attributes
                        .replace(
                            /\s+\bsrc\s*=\s*["'][^"']*["']/i,
                            ""
                        )
                        .trim();

                const attributeText =
                    cleanedAttributes
                        ? " " + cleanedAttributes
                        : "";

                return (
                    "<script" +
                    attributeText +
                    " data-fobas-generated-js" +
                    ' data-fobas-source="' +
                    escapeHTML(jsFileName) +
                    '">\n' +
                    jsContent +
                    "\n</script>"
                );
            }
        );


    /*
       ------------------------------------------------------------
       CAS PARTICULIER :
       certains fichiers peuvent avoir un script vide avec src
       et être détectés correctement par le bloc ci-dessus.
       Le contenu inline original n'est donc jamais perdu.
       ------------------------------------------------------------
    */

    return result;
}


/*
   Exécute le projet.

   Le contenu actuellement présent dans l'éditeur est d'abord
   sauvegardé, puis le HTML ACTIF est reconstruit et envoyé
   directement dans l'iframe du laboratoire.
*/
function runProject() {

    saveCurrentEditorToState();
    saveStoredProjects();

    const project =
        getCurrentProject();

    if (!project) {

        showToast(
            "Aucun projet disponible."
        );

        return;
    }

    const html =
        buildProjectDocument();

    if (!dom.previewFrame) {
        return;
    }

    dom.previewFrame.srcdoc =
        html;

    setStatus(
        "Projet exécuté : " +
        project.name
    );

    showToast(
        "Projet exécuté dans le laboratoire."
    );
}


/*
   Actualise le preview.

   runProject() reconstruit déjà entièrement le srcdoc.
   Il n'est donc pas nécessaire de demander ensuite à
   contentWindow.location.reload() de recharger l'ancien document.
*/
function refreshPreview() {

    runProject();

    setStatus(
        "Aperçu actualisé."
    );
}


/*
   Initialisation du laboratoire.
*/
function initializeLaboratory() {

    state.laboratoryZoom =
        FOBAS_WEB_LAB.defaultLaboratoryZoom;

    applyLaboratoryZoom();

    runProject();

    setStatus(
        "Laboratoire initialisé."
    );

    showToast(
        "Laboratoire initialisé."
    );
}






















/* ================================================================
   13 — PANNEAUX
   ================================================================ */

function openPanel(panelId) {

    const panels = [
        "pedagogicalPanel",
        "dictionaryPanel",
        "libraryPanel",
        "projectManagerPanel",
        "resourcePanel"
    ];

    panels.forEach(function (id) {

        if (id !== panelId) {
            closePanel(id, false);
        }
    });

    if (panelId === "laboratoryPanel") {

        if (dom.laboratoryPanel) {
            dom.laboratoryPanel.classList.remove("hidden");
        }

        state.currentPanel = panelId;

        setActiveToolbarButton(
            "laboratoryBtn"
        );

        return;
    }

    const panel = byId(panelId);

    if (!panel) return;

    panel.classList.remove("hidden");
    panel.setAttribute(
        "aria-hidden",
        "false"
    );

    state.currentPanel = panelId;

    const buttonMap = {
        pedagogicalPanel: "pedagogicalBtn",
        dictionaryPanel: "dictionaryBtn",
        libraryPanel: "libraryBtn"
    };

    if (buttonMap[panelId]) {
        setActiveToolbarButton(
            buttonMap[panelId]
        );
    }

    if (panelId === "pedagogicalPanel") {
        renderPedagogical();
    }

    if (panelId === "dictionaryPanel") {
        renderDictionary();
    }

    if (panelId === "libraryPanel") {
        renderLibrary();
    }

    if (panelId === "projectManagerPanel") {
        renderProjectList();
    }

    if (panelId === "resourcePanel") {
        renderResourceList();
    }
}


function closePanel(panelId, updateState) {

    const panel = byId(panelId);

    if (!panel) return;

    panel.classList.add("hidden");
    panel.setAttribute(
        "aria-hidden",
        "true"
    );

    if (updateState !== false) {

        if (
            panelId === state.currentPanel
        ) {
            state.currentPanel =
                "laboratoryPanel";
        }
    }
}


function closeAllOverlays() {

    [
        "pedagogicalPanel",
        "dictionaryPanel",
        "libraryPanel",
        "projectManagerPanel",
        "resourcePanel"
    ].forEach(function (id) {
        closePanel(id, false);
    });
}


function setActiveToolbarButton(buttonId) {

    [
        dom.pedagogicalBtn,
        dom.dictionaryBtn,
        dom.libraryBtn,
        dom.codeEditorBtn,
        dom.laboratoryBtn
    ].forEach(function (button) {

        if (button) {
            button.classList.remove("active");
        }
    });

    const button = byId(buttonId);

    if (button) {
        button.classList.add("active");
    }
}


function openCodeEditor() {

    closeAllOverlays();

    if (dom.editorPanel) {
        dom.editorPanel.classList.remove("hidden");
    }

    setActiveToolbarButton(
        "codeEditorBtn"
    );

    if (dom.codeEditor) {
        dom.codeEditor.focus();
    }
}


function openLaboratory() {

    closeAllOverlays();

    if (dom.laboratoryPanel) {
        dom.laboratoryPanel.classList.remove("hidden");
    }

    setActiveToolbarButton(
        "laboratoryBtn"
    );

    state.currentPanel =
        "laboratoryPanel";
}


/* ================================================================
   14 — PÉDAGOGIQUE
   ================================================================ */

const PEDAGOGICAL_CHAPTERS = [

    {
        id: "A",
        title: "A — Introduction au Web",
        theorie:
`Le Web permet de créer des pages et des applications accessibles
depuis un navigateur.

HTML construit la structure du document.
CSS contrôle la présentation.
JavaScript ajoute le comportement et l'interactivité.`,

        pratique:
`Créez une page HTML contenant un titre, un paragraphe,
une image et un bouton.`,

        exercices: [
            "Créer une page contenant un titre H1.",
            "Ajouter trois paragraphes.",
            "Créer un bouton HTML."
        ],

        devoirs:
`Créer une petite page de présentation personnelle avec HTML,
CSS et JavaScript.`
    },

    {
        id: "B",
        title: "B — Balises HTML",
        theorie:
`Une balise HTML décrit la structure et le rôle d'un élément.
Exemples : h1, p, a, img, section, article, button.`,

        pratique:
`Créez une structure HTML avec header, main, section et footer.`,

        exercices: [
            "Identifier les balises ouvrantes et fermantes.",
            "Créer une section.",
            "Ajouter un footer."
        ],

        devoirs:
`Construire une page complète avec header, main et footer.`
    },

    {
        id: "C",
        title: "C — Attributs HTML",
        theorie:
`Les attributs donnent des informations supplémentaires aux
éléments HTML. Exemples : id, class, href, src, alt, title.`,

        pratique:
`Créez un lien avec href, une image avec src et alt,
et un élément possédant id et class.`,

        exercices: [
            "Créer un élément avec id.",
            "Créer deux éléments avec la même class.",
            "Créer un lien."
        ],

        devoirs:
`Créer une page contenant plusieurs éléments correctement
identifiés avec id et class.`
    },

    {
        id: "D",
        title: "D — Structure d'un document HTML",
        theorie:
`Un document HTML moderne utilise généralement DOCTYPE,
html, head et body.`,

        pratique:
`Créez un document HTML5 complet avec charset et title.`,

        exercices: [
            "Ajouter DOCTYPE.",
            "Ajouter charset UTF-8.",
            "Ajouter title."
        ],

        devoirs:
`Créer un document HTML5 propre et correctement indenté.`
    },

    {
        id: "E",
        title: "E — Texte et titres",
        theorie:
`Les titres vont généralement de h1 à h6.
Les paragraphes utilisent p.
Des éléments comme strong et em permettent de donner
une importance ou une emphase au texte.`,

        pratique:
`Créez une page contenant h1, h2, p, strong et em.`,

        exercices: [
            "Créer un H1.",
            "Créer deux H2.",
            "Mettre un mot en strong."
        ],

        devoirs:
`Créer une page d'article structurée avec plusieurs niveaux
de titres et paragraphes.`
    },

    {
        id: "F",
        title: "F — Liens et navigation",
        theorie:
`La balise a permet de créer des liens.
L'attribut href indique la destination.`,

        pratique:
`Créez une navigation avec plusieurs liens.`,

        exercices: [
            "Créer un lien externe.",
            "Créer un lien interne.",
            "Créer une navigation."
        ],

        devoirs:
`Créer une mini-navigation entre plusieurs pages HTML.`
    },

    {
        id: "G",
        title: "G — Images",
        theorie:
`La balise img affiche une image.
src indique la source et alt fournit une description.`,

        pratique:
`Ajoutez une image avec src et alt.`,

        exercices: [
            "Insérer une image.",
            "Ajouter alt.",
            "Modifier les dimensions avec CSS."
        ],

        devoirs:
`Créer une galerie simple de trois images.`
    },

    {
        id: "H",
        title: "H — Listes",
        theorie:
`HTML propose les listes ordonnées ol et non ordonnées ul.
Chaque élément utilise li.`,

        pratique:
`Créez une liste de compétences et une liste numérotée.`,

        exercices: [
            "Créer une liste ul.",
            "Créer une liste ol.",
            "Ajouter cinq li."
        ],

        devoirs:
`Créer une page présentant une liste de services Web.`
    },

    {
        id: "I",
        title: "I — Tableaux",
        theorie:
`Les tableaux utilisent table, tr, th et td pour organiser
des données en lignes et colonnes.`,

        pratique:
`Créer un tableau de trois colonnes et quatre lignes.`,

        exercices: [
            "Créer un tableau.",
            "Ajouter une ligne d'en-tête.",
            "Ajouter quatre données."
        ],

        devoirs:
`Créer un tableau présentant les caractéristiques de plusieurs produits.`
    },

    {
        id: "J",
        title: "J — Formulaires",
        theorie:
`Les formulaires utilisent form, label, input, textarea,
select et button.`,

        pratique:
`Créer un formulaire de contact.`,

        exercices: [
            "Créer un input text.",
            "Créer un input email.",
            "Créer un bouton submit."
        ],

        devoirs:
`Créer un formulaire complet d'inscription.`
    },

    {
        id: "K",
        title: "K — CSS",
        theorie:
`CSS signifie Cascading Style Sheets.
Il permet de contrôler couleurs, tailles, espacements,
positionnement et présentation.`,

        pratique:
`Créez un fichier style.css et liez-le à index.html.`,

        exercices: [
            "Changer une couleur.",
            "Modifier une taille.",
            "Ajouter une marge."
        ],

        devoirs:
`Créer une interface Web avec une feuille CSS séparée.`
    },

    {
        id: "L",
        title: "L — Sélecteurs CSS",
        theorie:
`CSS utilise des sélecteurs comme élément, .class et #id
pour cibler les éléments.`,

        pratique:
`Créez plusieurs classes CSS et appliquez-les à la page.`,

        exercices: [
            "Créer un sélecteur de classe.",
            "Créer un sélecteur ID.",
            "Créer un sélecteur d'élément."
        ],

        devoirs:
`Construire une page utilisant plusieurs types de sélecteurs.`
    },

    {
        id: "M",
        title: "M — Box Model",
        theorie:
`Le Box Model comprend content, padding, border et margin.
Ces notions contrôlent l'espace occupé par les éléments.`,

        pratique:
`Créez une carte avec padding, border et margin.`,

        exercices: [
            "Ajouter padding.",
            "Ajouter border.",
            "Ajouter margin."
        ],

        devoirs:
`Créer trois cartes alignées avec un espacement propre.`
    },

    {
        id: "N",
        title: "N — Flexbox",
        theorie:
`Flexbox permet d'organiser les éléments sur un axe principal
et un axe secondaire.`,

        pratique:
`Utilisez display:flex pour créer une navigation horizontale.`,

        exercices: [
            "Créer un conteneur flex.",
            "Utiliser justify-content.",
            "Utiliser align-items."
        ],

        devoirs:
`Créer une interface avec plusieurs éléments disposés en Flexbox.`
    },

    {
        id: "O",
        title: "O — CSS Grid",
        theorie:
`CSS Grid permet de construire des mises en page en lignes
et colonnes.`,

        pratique:
`Créer une grille de cartes avec grid-template-columns.`,

        exercices: [
            "Créer une grille.",
            "Créer deux colonnes.",
            "Créer trois colonnes."
        ],

        devoirs:
`Créer une galerie responsive avec CSS Grid.`
    },

    {
        id: "P",
        title: "P — Responsive Design",
        theorie:
`Le responsive design adapte une interface aux différentes
dimensions d'écran, notamment Android, tablette et ordinateur.`,

        pratique:
`Utilisez une media query pour modifier la mise en page.`,

        exercices: [
            "Créer une media query.",
            "Adapter une taille.",
            "Adapter une grille."
        ],

        devoirs:
`Créer une page qui reste utilisable sur téléphone et ordinateur.`
    },

    {
        id: "Q",
        title: "Q — JavaScript",
        theorie:
`JavaScript ajoute de la logique et du comportement aux pages Web.
Il peut modifier le DOM et réagir aux événements.`,

        pratique:
`Créez un bouton qui modifie un texte.`,

        exercices: [
            "Créer une variable.",
            "Sélectionner un élément.",
            "Modifier textContent."
        ],

        devoirs:
`Créer une mini-interface interactive en JavaScript.`
    },

    {
        id: "R",
        title: "R — Variables et types",
        theorie:
`JavaScript utilise notamment const et let.
Les valeurs peuvent être des chaînes, nombres, booléens,
tableaux ou objets.`,

        pratique:
`Déclarez plusieurs variables et affichez-les dans la page.`,

        exercices: [
            "Créer une constante.",
            "Créer une variable.",
            "Créer un tableau."
        ],

        devoirs:
`Créer un petit programme utilisant plusieurs types de données.`
    },

    {
        id: "S",
        title: "S — Conditions",
        theorie:
`Les conditions permettent d'exécuter un bloc de code selon
une situation. if, else if et else sont couramment utilisés.`,

        pratique:
`Créez un programme qui affiche un message selon une valeur.`,

        exercices: [
            "Créer une condition if.",
            "Ajouter else.",
            "Comparer deux valeurs."
        ],

        devoirs:
`Créer un programme de vérification simple.`
    },

    {
        id: "T",
        title: "T — Boucles",
        theorie:
`Les boucles permettent de répéter une opération.
JavaScript propose notamment for, while et for...of.`,

        pratique:
`Affichez une liste de cinq éléments automatiquement.`,

        exercices: [
            "Créer une boucle for.",
            "Parcourir un tableau.",
            "Créer une liste automatiquement."
        ],

        devoirs:
`Créer un générateur simple de contenu HTML avec JavaScript.`
    },

    {
        id: "U",
        title: "U — Fonctions",
        theorie:
`Une fonction regroupe des instructions réutilisables.
Elle peut recevoir des paramètres et retourner une valeur.`,

        pratique:
`Créez une fonction calculant une somme.`,

        exercices: [
            "Créer une fonction.",
            "Ajouter un paramètre.",
            "Utiliser return."
        ],

        devoirs:
`Créer plusieurs fonctions pour une petite application.`
    },

    {
        id: "V",
        title: "V — Événements",
        theorie:
`Les événements permettent de réagir aux actions de l'utilisateur :
click, input, change, submit, touch et autres.`,

        pratique:
`Ajoutez un événement click à un bouton.`,

        exercices: [
            "Écouter click.",
            "Écouter input.",
            "Modifier le DOM."
        ],

        devoirs:
`Créer une interface avec plusieurs événements utilisateur.`
    },

    {
        id: "W",
        title: "W — DOM",
        theorie:
`Le DOM représente le document HTML sous forme d'arbre.
JavaScript peut créer, modifier et supprimer des éléments.`,

        pratique:
`Créez dynamiquement un élément HTML.`,

        exercices: [
            "Utiliser querySelector.",
            "Utiliser createElement.",
            "Utiliser appendChild."
        ],

        devoirs:
`Créer une liste entièrement générée par JavaScript.`
    },

    {
        id: "X",
        title: "X — Stockage local",
        theorie:
`localStorage permet de conserver des données simples dans
le navigateur. IndexedDB convient mieux aux données plus volumineuses
et structurées.`,

        pratique:
`Sauvegardez une préférence utilisateur avec localStorage.`,

        exercices: [
            "Utiliser setItem.",
            "Utiliser getItem.",
            "Supprimer une donnée."
        ],

        devoirs:
`Créer une petite application conservant ses données localement.`
    },

    {
        id: "Y",
        title: "Y — APIs Web",
        theorie:
`Les navigateurs proposent plusieurs APIs : Clipboard, Speech,
Fullscreen, File, Storage, Media et d'autres.`,

        pratique:
`Utilisez une API Web disponible dans le navigateur.`,

        exercices: [
            "Identifier une API.",
            "Tester une fonctionnalité.",
            "Gérer une erreur."
        ],

        devoirs:
`Créer une petite démonstration utilisant une API Web.`
    },

    {
        id: "Z",
        title: "Z — Projet Web complet",
        theorie:
`Un projet Web professionnel combine structure HTML,
présentation CSS, logique JavaScript, ressources et organisation
des fichiers.`,

        pratique:
`Construisez un mini-site avec plusieurs fichiers.`,

        exercices: [
            "Créer HTML.",
            "Créer CSS.",
            "Créer JavaScript.",
            "Tester dans le laboratoire."
        ],

        devoirs:
`Créer un projet Web complet et fonctionnel avec HTML, CSS
et JavaScript.`
    }
];


function renderChapterSelect() {

    if (!dom.chapterSelect) return;

    dom.chapterSelect.innerHTML = "";

    PEDAGOGICAL_CHAPTERS.forEach(
        function (chapter, index) {

            const option =
                document.createElement("option");

            option.value = String(index);
            option.textContent =
                chapter.title;

            if (
                index ===
                state.currentPedagogicalChapter
            ) {
                option.selected = true;
            }

            dom.chapterSelect.appendChild(
                option
            );
        }
    );
}


function renderPedagogicalTabs() {

    const map = {
        theorie: dom.theorieTabBtn,
        pratique: dom.pratiqueTabBtn,
        exercices: dom.exercicesTabBtn,
        devoirs: dom.devoirsTabBtn
    };

    Object.keys(map).forEach(
        function (key) {

            if (!map[key]) return;

            map[key].classList.toggle(
                "active",
                key === state.currentPedagogicalTab
            );
        }
    );
}


function renderPedagogical() {

    renderChapterSelect();
    renderPedagogicalTabs();

    const chapter =
        PEDAGOGICAL_CHAPTERS[
            state.currentPedagogicalChapter
        ];

    if (!chapter || !dom.pedagogicalContent) {
        return;
    }

    let content = "";

    if (
        state.currentPedagogicalTab ===
        "theorie"
    ) {

        content =
            "<h3>" +
            escapeHTML(chapter.title) +
            "</h3>" +
            "<p>" +
            escapeHTML(chapter.theorie) +
            "</p>";

    } else if (
        state.currentPedagogicalTab ===
        "pratique"
    ) {

        content =
            "<h3>Pratique</h3>" +
            "<p>" +
            escapeHTML(chapter.pratique) +
            "</p>";

    } else if (
        state.currentPedagogicalTab ===
        "exercices"
    ) {

        content =
            "<h3>Exercices</h3>" +
            "<ol>" +
            chapter.exercices.map(
                function (item) {
                    return (
                        "<li>" +
                        escapeHTML(item) +
                        "</li>"
                    );
                }
            ).join("") +
            "</ol>";

    } else {

        content =
            "<h3>Devoirs</h3>" +
            "<p>" +
            escapeHTML(chapter.devoirs) +
            "</p>";
    }

    dom.pedagogicalContent.innerHTML =
        content;
}


function changeChapter(direction) {

    const next =
        state.currentPedagogicalChapter +
        direction;

    if (
        next < 0
        || next >= PEDAGOGICAL_CHAPTERS.length
    ) {
        showToast(
            direction < 0
                ? "Vous êtes au premier chapitre."
                : "Vous êtes au dernier chapitre."
        );

        return;
    }

    state.currentPedagogicalChapter = next;

    renderPedagogical();
}


function addPedagogicalChapter() {

    const title = window.prompt(
        "Titre du nouveau chapitre :",
        "Nouveau chapitre"
    );

    if (title === null) return;

    const cleanTitle = title.trim();

    if (!cleanTitle) {
        showToast("Titre obligatoire.");
        return;
    }

    PEDAGOGICAL_CHAPTERS.push({

        id: String.fromCharCode(
            65 + PEDAGOGICAL_CHAPTERS.length
        ),

        title:
            cleanTitle,

        theorie:
            "Théorie à compléter.",

        pratique:
            "Pratique à compléter.",

        exercices: [
            "Exercice à compléter."
        ],

        devoirs:
            "Devoir à compléter."
    });

    state.currentPedagogicalChapter =
        PEDAGOGICAL_CHAPTERS.length - 1;

    renderPedagogical();

    showToast("Chapitre ajouté.");
}


/* ================================================================
   15 — DICTIONNAIRE HTML
   ================================================================ */

const HTML_DICTIONARY = [

    ["<!DOCTYPE>", "Déclare le type du document HTML."],
    ["html", "Élément racine d'un document HTML."],
    ["head", "Contient les informations du document."],
    ["body", "Contient le contenu visible de la page."],
    ["title", "Définit le titre du document."],
    ["meta", "Définit des métadonnées."],
    ["link", "Établit une relation avec une ressource externe."],
    ["style", "Contient du CSS directement dans HTML."],
    ["script", "Contient ou charge du JavaScript."],
    ["header", "Définit l'en-tête d'une section ou d'une page."],
    ["nav", "Définit une zone de navigation."],
    ["main", "Définit le contenu principal."],
    ["section", "Définit une section thématique."],
    ["article", "Définit un contenu autonome."],
    ["aside", "Définit un contenu complémentaire."],
    ["footer", "Définit le pied de page ou de section."],
    ["div", "Conteneur générique de type bloc."],
    ["span", "Conteneur générique en ligne."],
    ["h1", "Titre principal."],
    ["h2", "Titre de niveau 2."],
    ["h3", "Titre de niveau 3."],
    ["h4", "Titre de niveau 4."],
    ["h5", "Titre de niveau 5."],
    ["h6", "Titre de niveau 6."],
    ["p", "Paragraphe."],
    ["br", "Retour à la ligne."],
    ["hr", "Séparation thématique."],
    ["strong", "Importance forte."],
    ["em", "Emphase."],
    ["mark", "Texte marqué."],
    ["small", "Texte secondaire de petite taille."],
    ["sub", "Indice."],
    ["sup", "Exposant."],
    ["a", "Crée un lien hypertexte."],
    ["img", "Affiche une image."],
    ["picture", "Permet plusieurs sources d'image."],
    ["source", "Définit une source multimédia."],
    ["audio", "Intègre un contenu audio."],
    ["video", "Intègre un contenu vidéo."],
    ["track", "Ajoute une piste à une vidéo ou un média."],
    ["iframe", "Intègre une autre ressource Web."],
    ["ul", "Liste non ordonnée."],
    ["ol", "Liste ordonnée."],
    ["li", "Élément d'une liste."],
    ["dl", "Liste de définitions."],
    ["dt", "Terme d'une liste de définitions."],
    ["dd", "Description d'un terme."],
    ["table", "Tableau de données."],
    ["caption", "Titre d'un tableau."],
    ["thead", "En-tête d'un tableau."],
    ["tbody", "Corps d'un tableau."],
    ["tfoot", "Pied d'un tableau."],
    ["tr", "Ligne d'un tableau."],
    ["th", "Cellule d'en-tête."],
    ["td", "Cellule de données."],
    ["form", "Formulaire."],
    ["label", "Étiquette d'un champ."],
    ["input", "Champ de saisie."],
    ["textarea", "Zone de texte multiligne."],
    ["select", "Liste de sélection."],
    ["option", "Option d'une liste select."],
    ["optgroup", "Groupe d'options."],
    ["button", "Bouton interactif."],
    ["fieldset", "Groupe de champs."],
    ["legend", "Titre d'un fieldset."],
    ["datalist", "Liste de suggestions pour un champ."],
    ["output", "Résultat calculé."],
    ["progress", "Progression d'une opération."],
    ["meter", "Mesure dans une plage connue."],
    ["details", "Zone de contenu dépliable."],
    ["summary", "Titre d'un élément details."],
    ["dialog", "Boîte de dialogue."],
    ["canvas", "Surface graphique contrôlée par script."],
    ["svg", "Conteneur pour graphiques vectoriels."],
    ["template", "Modèle HTML non rendu immédiatement."],
    ["slot", "Point d'insertion pour Web Components."],
    ["id", "Identifiant unique d'un élément."],
    ["class", "Classe permettant de regrouper des éléments."],
    ["href", "Adresse cible d'un lien."],
    ["src", "Source d'une ressource."],
    ["alt", "Texte alternatif d'une image."],
    ["title", "Information complémentaire affichée par le navigateur."],
    ["name", "Nom d'un élément ou d'une donnée."],
    ["value", "Valeur d'un champ."],
    ["type", "Type d'un élément ou d'un champ."],
    ["placeholder", "Texte indicatif dans un champ."],
    ["required", "Rend un champ obligatoire."],
    ["disabled", "Désactive un élément."],
    ["checked", "Indique qu'une case ou option est sélectionnée."],
    ["selected", "Indique une option sélectionnée."],
    ["hidden", "Masque un élément."],
    ["data-*", "Attribut personnalisé destiné aux données."],
    ["aria-*", "Attributs utilisés pour l'accessibilité."]
];


function renderDictionary() {

    if (!dom.dictionaryContent) return;

    const query =
        state.dictionarySearch
            .trim()
            .toLowerCase();

    const filtered =
        HTML_DICTIONARY.filter(
            function (entry) {

                if (!query) return true;

                return (
                    entry[0]
                        .toLowerCase()
                        .includes(query)
                    ||
                    entry[1]
                        .toLowerCase()
                        .includes(query)
                );
            }
        );

    if (!filtered.length) {

        dom.dictionaryContent.innerHTML =
            '<div class="no-results">Aucun résultat.</div>';

        return;
    }

    dom.dictionaryContent.innerHTML =
        filtered.map(
            function (entry) {

                return (
                    '<article class="dictionary-entry">' +
                    '<strong>' +
                    escapeHTML(entry[0]) +
                    '</strong>' +
                    '<p>' +
                    escapeHTML(entry[1]) +
                    '</p>' +
                    '</article>'
                );
            }
        ).join("");
}


/* ================================================================
   16 — BIBLIOTHÈQUE HTML
   ================================================================ */

const HTML_LIBRARY = [

    {
        category: "Structure",
        name: "Page HTML5",
        code:
`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Ma page</title>
</head>
<body>

</body>
</html>`
    },

    {
        category: "Structure",
        name: "Section",
        code:
`<section>
    <h2>Titre de section</h2>
    <p>Contenu.</p>
</section>`
    },

    {
        category: "Texte",
        name: "Titre et paragraphe",
        code:
`<h1>Titre principal</h1>
<p>Mon paragraphe.</p>`
    },

    {
        category: "Navigation",
        name: "Lien",
        code:
`<a href="https://example.com">
    Visiter le site
</a>`
    },

    {
        category: "Navigation",
        name: "Navigation",
        code:
`<nav>
    <a href="index.html">Accueil</a>
    <a href="about.html">À propos</a>
    <a href="contact.html">Contact</a>
</nav>`
    },

    {
        category: "Multimédia",
        name: "Image",
        code:
`<img
    src="image.jpg"
    alt="Description de l'image"
>`
    },

    {
        category: "Multimédia",
        name: "Audio",
        code:
`<audio controls>
    <source src="audio.mp3" type="audio/mpeg">
</audio>`
    },

    {
        category: "Multimédia",
        name: "Vidéo",
        code:
`<video controls width="640">
    <source src="video.mp4" type="video/mp4">
</video>`
    },

    {
        category: "Formulaire",
        name: "Formulaire",
        code:
`<form>
    <label for="nom">Nom</label>
    <input
        id="nom"
        name="nom"
        type="text"
        required
    >

    <button type="submit">
        Envoyer
    </button>
</form>`
    },

    {
        category: "Formulaire",
        name: "Champ Email",
        code:
`<label for="email">Email</label>
<input
    id="email"
    name="email"
    type="email"
    placeholder="nom@example.com"
    required
>`
    },

    {
        category: "Formulaire",
        name: "Liste Select",
        code:
`<select id="choix">
    <option value="">Choisir</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
</select>`
    },

    {
        category: "Tableau",
        name: "Tableau",
        code:
`<table>
    <thead>
        <tr>
            <th>Nom</th>
            <th>Valeur</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Exemple</td>
            <td>100</td>
        </tr>
    </tbody>
</table>`
    },

    {
        category: "Interactivité",
        name: "Bouton JavaScript",
        code:
`<button id="monBouton">
    Cliquer
</button>

<script>
document
    .getElementById("monBouton")
    .addEventListener("click", function () {
        alert("Bonjour !");
    });
<\/script>`
    },

    {
        category: "Responsive",
        name: "Viewport",
        code:
`<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>`
    },

    {
        category: "Accessibilité",
        name: "Image accessible",
        code:
`<img
    src="photo.jpg"
    alt="Description précise de la photo"
>`
    }
];


function populateLibraryCategories() {

    if (!dom.libraryCategorySelect) return;

    const current =
        state.libraryCategory;

    const categories = [
        ...new Set(
            HTML_LIBRARY.map(
                function (item) {
                    return item.category;
                }
            )
        )
    ];

    dom.libraryCategorySelect.innerHTML =
        '<option value="all">Toutes les catégories</option>';

    categories.forEach(
        function (category) {

            const option =
                document.createElement("option");

            option.value = category;
            option.textContent = category;

            dom.libraryCategorySelect.appendChild(
                option
            );
        }
    );

    dom.libraryCategorySelect.value =
        categories.includes(current)
            ? current
            : "all";
}


function insertLibraryCode(code) {

    if (!dom.codeEditor) return;

    openCodeEditor();

    const start =
        dom.codeEditor.selectionStart || 0;

    const end =
        dom.codeEditor.selectionEnd || start;

    const current =
        dom.codeEditor.value;

    dom.codeEditor.value =
        current.slice(0, start) +
        code +
        current.slice(end);

    pushEditorHistory(
        dom.codeEditor.value
    );

    saveCurrentEditorToState();
    updateEditorStatus();

    showToast("Code inséré dans l'éditeur.");
}


function renderLibrary() {

    if (!dom.libraryContent) return;

    const query =
        state.librarySearch
            .trim()
            .toLowerCase();

    const category =
        state.libraryCategory;

    const filtered =
        HTML_LIBRARY.filter(
            function (item) {

                const matchQuery =
                    !query
                    ||
                    item.name
                        .toLowerCase()
                        .includes(query)
                    ||
                    item.category
                        .toLowerCase()
                        .includes(query)
                    ||
                    item.code
                        .toLowerCase()
                        .includes(query);

                const matchCategory =
                    category === "all"
                    ||
                    item.category === category;

                return (
                    matchQuery &&
                    matchCategory
                );
            }
        );

    if (!filtered.length) {

        dom.libraryContent.innerHTML =
            '<div class="no-results">Aucun élément trouvé.</div>';

        return;
    }

    dom.libraryContent.innerHTML =
        filtered.map(
            function (item, index) {

                return (
                    '<article class="library-card">' +

                    '<div class="library-card-header">' +

                    '<strong>' +
                    escapeHTML(item.name) +
                    '</strong>' +

                    '<span>' +
                    escapeHTML(item.category) +
                    '</span>' +

                    '</div>' +

                    '<pre><code>' +
                    escapeHTML(item.code) +
                    '</code></pre>' +

                    '<button ' +
                    'type="button" ' +
                    'class="library-insert-btn" ' +
                    'data-library-index="' +
                    HTML_LIBRARY.indexOf(item) +
                    '">' +
                    '＋ Insérer dans l’éditeur' +
                    '</button>' +

                    '</article>'
                );
            }
        ).join("");

    dom.libraryContent
        .querySelectorAll(
            ".library-insert-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                button.dataset.libraryIndex
                            );

                        if (
                            HTML_LIBRARY[index]
                        ) {
                            insertLibraryCode(
                                HTML_LIBRARY[index].code
                            );
                        }
                    }
                );
            }
        );
}


/* ================================================================
   17 — PROJECT MANAGER
   ================================================================ */

function renderProjectList() {

    if (!dom.projectList) return;

    if (!state.projects.length) {

        dom.projectList.innerHTML =
            '<div class="no-results">Aucun projet.</div>';

        return;
    }

    dom.projectList.innerHTML =
        state.projects.map(
            function (project) {

                const files =
                    Object.keys(
                        project.files || {}
                    );

                const active =
                    project.id ===
                    state.currentProjectId;

                return (
                    '<article class="project-list-item ' +
                    (active ? "active" : "") +
                    '">' +

                    '<div class="project-list-information">' +

                    '<strong>' +
                    escapeHTML(project.name) +
                    '</strong>' +

                    '<span>' +
                    files.length +
                    " fichier" +
                    (files.length > 1 ? "s" : "") +
                    '</span>' +

                    '</div>' +

                    '<button ' +
                    'type="button" ' +
                    'class="project-open-btn" ' +
                    'data-project-id="' +
                    escapeHTML(project.id) +
                    '">' +
                    'Ouvrir' +
                    '</button>' +

                    '</article>'
                );
            }
        ).join("");

    dom.projectList
        .querySelectorAll(
            ".project-open-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        selectProject(
                            button.dataset.projectId
                        );
                    }
                );
            }
        );
}


/* ================================================================
   18 — INDEXEDDB
   ================================================================ */

function openDatabase() {

    if (!("indexedDB" in window)) {
        console.warn(
            "IndexedDB non disponible."
        );
        return Promise.resolve(null);
    }

    return new Promise(
        function (resolve, reject) {

            const request =
                indexedDB.open(
                    FOBAS_WEB_LAB.databaseName,
                    FOBAS_WEB_LAB.databaseVersion
                );

            request.onupgradeneeded =
                function (event) {

                    const db =
                        event.target.result;

                    if (
                        !db.objectStoreNames.contains(
                            FOBAS_WEB_LAB.resourceStore
                        )
                    ) {

                        const store =
                            db.createObjectStore(
                                FOBAS_WEB_LAB.resourceStore,
                                {
                                    keyPath: "id"
                                }
                            );

                        store.createIndex(
                            "projectId",
                            "projectId",
                            {
                                unique: false
                            }
                        );
                    }
                };

            request.onsuccess =
                function () {

                    state.db =
                        request.result;

                    resolve(
                        state.db
                    );
                };

            request.onerror =
                function () {

                    reject(
                        request.error
                    );
                };
        }
    );
}


function addResourceToDatabase(resource) {

    if (!state.db) {
        return Promise.reject(
            new Error("IndexedDB indisponible.")
        );
    }

    return new Promise(
        function (resolve, reject) {

            const transaction =
                state.db.transaction(
                    [
                        FOBAS_WEB_LAB.resourceStore
                    ],
                    "readwrite"
                );

            const store =
                transaction.objectStore(
                    FOBAS_WEB_LAB.resourceStore
                );

            const request =
                store.put(resource);

            request.onsuccess =
                function () {
                    resolve(
                        request.result
                    );
                };

            request.onerror =
                function () {
                    reject(
                        request.error
                    );
                };
        }
    );
}


function getProjectResources() {

    const project =
        getCurrentProject();

    if (
        !state.db
        || !project
    ) {
        return Promise.resolve([]);
    }

    return new Promise(
        function (resolve, reject) {

            const transaction =
                state.db.transaction(
                    [
                        FOBAS_WEB_LAB.resourceStore
                    ],
                    "readonly"
                );

            const store =
                transaction.objectStore(
                    FOBAS_WEB_LAB.resourceStore
                );

            const index =
                store.index("projectId");

            const request =
                index.getAll(
                    project.id
                );

            request.onsuccess =
                function () {
                    resolve(
                        request.result || []
                    );
                };

            request.onerror =
                function () {
                    reject(
                        request.error
                    );
                };
        }
    );
}


function deleteResourceFromDatabase(
    resourceId
) {

    if (!state.db) {
        return Promise.resolve();
    }

    return new Promise(
        function (resolve, reject) {

            const transaction =
                state.db.transaction(
                    [
                        FOBAS_WEB_LAB.resourceStore
                    ],
                    "readwrite"
                );

            const store =
                transaction.objectStore(
                    FOBAS_WEB_LAB.resourceStore
                );

            const request =
                store.delete(resourceId);

            request.onsuccess =
                function () {
                    resolve();
                };

            request.onerror =
                function () {
                    reject(
                        request.error
                    );
                };
        }
    );
}










/* ================================================================
   19 — RESSOURCES IMAGE / VIDÉO
   ================================================================ */

function createMediaUploadControls() {

    if (!dom.resourceList) return;

    /*
       Evite kreye menm bouton/input plizyè fwa.
    */
    if (
        dom.resourceList.querySelector(
            "#fobasMediaUploadButton"
        )
    ) {
        return;
    }

    const uploadContainer =
        document.createElement("div");

    uploadContainer.id =
        "fobasMediaUploadContainer";

    uploadContainer.className =
        "resource-upload-container";


    const uploadButton =
        document.createElement("button");

    uploadButton.id =
        "fobasMediaUploadButton";

    uploadButton.type =
        "button";

    uploadButton.className =
        "resource-upload-btn";

    uploadButton.textContent =
        "🖼️ Upload Image / Video";


    const mediaInput =
        document.createElement("input");

    mediaInput.id =
        "fobasMediaUploadInput";

    mediaInput.type =
        "file";

    mediaInput.accept =
        "image/*,video/*";

    mediaInput.multiple =
        false;

    mediaInput.style.display =
        "none";


    uploadButton.addEventListener(
        "click",
        function () {

            mediaInput.click();

        }
    );


    mediaInput.addEventListener(
        "change",
        function () {

            const file =
                mediaInput.files &&
                mediaInput.files[0];

            if (!file) {
                mediaInput.value = "";
                return;
            }


            let kind = null;


            if (
                file.type &&
                file.type.startsWith("image/")
            ) {

                kind = "image";

            } else if (
                file.type &&
                file.type.startsWith("video/")
            ) {

                kind = "video";

            }


            if (!kind) {

                showToast(
                    "Se sèlman Image oswa Vidéo ki aksepte."
                );

                mediaInput.value = "";
                return;
            }


            handleResourceFile(
                file,
                kind
            );


            /*
               Pèmèt itilizatè a chwazi menm fichye a
               ankò pita si li vle.
            */
            mediaInput.value = "";

        }
    );


    uploadContainer.appendChild(
        uploadButton
    );

    uploadContainer.appendChild(
        mediaInput
    );


    /*
       Bouton an toujou rete anwo lis resous yo.
    */
    dom.resourceList.appendChild(
        uploadContainer
    );
}


function handleResourceFile(
    file,
    kind
) {

    const project =
        getCurrentProject();

    if (!project || !file) return;


    /*
       Double vérification pou anpeche yon move kalite
       fichye antre nan depo Image/Vidéo a.
    */
    if (
        kind === "image"
        &&
        !file.type.startsWith("image/")
    ) {

        showToast(
            "Fichye a pa yon image valide."
        );

        return;
    }


    if (
        kind === "video"
        &&
        !file.type.startsWith("video/")
    ) {

        showToast(
            "Fichye a pa yon vidéo valide."
        );

        return;
    }


    const resource = {

        id:
            generateId("resource"),

        projectId:
            project.id,

        name:
            file.name,

        type:
            file.type,

        kind:
            kind,

        size:
            file.size,

        createdAt:
            new Date().toISOString(),

        /*
           Binary Image/Vidéo a rete nan IndexedDB.
           Li pa antre nan project.files ni LocalStorage.
        */
        blob:
            file
    };


    addResourceToDatabase(
        resource
    )
    .then(
        function () {

            showToast(
                (
                    kind === "image"
                        ? "Image"
                        : "Vidéo"
                ) +
                " ajoutée : " +
                file.name
            );

            renderResourceList();

        }
    )
    .catch(
        function (error) {

            console.error(
                "Erreur ressource :",
                error
            );

            showToast(
                "Impossible d'enregistrer la ressource."
            );
        }
    );
}


async function renderResourceList() {

    if (!dom.resourceList) return;


    try {

        const resources =
            await getProjectResources();


        /*
           On reconstruit proprement la zone afin que
           le bouton Upload Image / Video reste toujours
           visible.
        */
        dom.resourceList.innerHTML = "";


        createMediaUploadControls();


        if (!resources.length) {

            const empty =
                document.createElement("div");

            empty.className =
                "no-results";

            empty.textContent =
                "Aucune ressource locale.";

            dom.resourceList.appendChild(
                empty
            );

            return;
        }


        const resourcesContainer =
            document.createElement("div");

        resourcesContainer.id =
            "fobasMediaResourceItems";


        resources.forEach(
            function (resource) {

                const card =
                    document.createElement("article");

                card.className =
                    "resource-card";


                const info =
                    document.createElement("div");

                info.className =
                    "resource-information";


                const name =
                    document.createElement("strong");

                name.textContent =
                    resource.name;


                const details =
                    document.createElement("span");

                details.textContent =
                    (
                        resource.kind === "image"
                            ? "Image"
                            : "Vidéo"
                    ) +
                    " • " +
                    formatBytes(
                        resource.size
                    );


                info.appendChild(
                    name
                );

                info.appendChild(
                    details
                );


                const actions =
                    document.createElement("div");

                actions.className =
                    "resource-card-actions";


                const useButton =
                    document.createElement("button");

                useButton.type =
                    "button";

                useButton.className =
                    "resource-use-btn";

                useButton.textContent =
                    "Insérer";


                useButton.addEventListener(
                    "click",
                    function () {

                        insertResourceIntoEditor(
                            resource
                        );

                    }
                );


                const deleteButton =
                    document.createElement("button");

                deleteButton.type =
                    "button";

                deleteButton.className =
                    "danger-action";

                deleteButton.textContent =
                    "Supprimer";


                deleteButton.addEventListener(
                    "click",
                    async function () {

                        const confirmed =
                            window.confirm(
                                "Supprimer cette ressource ?"
                            );


                        if (!confirmed) {
                            return;
                        }


                        try {

                            await deleteResourceFromDatabase(
                                resource.id
                            );

                            showToast(
                                "Ressource supprimée."
                            );

                            renderResourceList();

                        } catch (error) {

                            console.error(
                                "Erreur suppression ressource :",
                                error
                            );

                            showToast(
                                "Impossible de supprimer la ressource."
                            );
                        }

                    }
                );


                actions.appendChild(
                    useButton
                );

                actions.appendChild(
                    deleteButton
                );


                card.appendChild(
                    info
                );

                card.appendChild(
                    actions
                );


                resourcesContainer.appendChild(
                    card
                );

            }
        );


        dom.resourceList.appendChild(
            resourcesContainer
        );


    } catch (error) {

        console.error(
            "Erreur ressources :",
            error
        );


        dom.resourceList.innerHTML = "";


        createMediaUploadControls();


        const errorMessage =
            document.createElement("div");

        errorMessage.className =
            "no-results";

        errorMessage.textContent =
            "Impossible de charger les ressources.";


        dom.resourceList.appendChild(
            errorMessage
        );
    }
}


function formatBytes(bytes) {

    if (!Number.isFinite(bytes)) {
        return "0 octet";
    }


    if (bytes < 1024) {

        return (
            bytes +
            " octets"
        );

    }


    if (bytes < 1024 * 1024) {

        return (
            (bytes / 1024).toFixed(1) +
            " Ko"
        );

    }


    if (bytes < 1024 * 1024 * 1024) {

        return (
            (bytes / (1024 * 1024)).toFixed(1) +
            " Mo"
        );

    }


    return (
        (bytes / (1024 * 1024 * 1024)).toFixed(1) +
        " Go"
    );
}


function insertResourceIntoEditor(
    resource
) {

    const fileType =
        getFileType(
            state.activeFileName
        );

    let code = "";


    if (
        resource.kind === "image"
    ) {

        if (
            fileType === "html"
        ) {

            code =
`<img
    src="${resource.name}"
    alt="${resource.name}"
>`;

        } else if (
            fileType === "css"
        ) {

            code =
`background-image: url("${resource.name}");`;

        } else {

            code =
`// Image : ${resource.name}`;
        }


    } else if (
        resource.kind === "video"
    ) {

        code =
`<video controls>
    <source
        src="${resource.name}"
        type="${resource.type}"
    >
</video>`;
    }


    if (!code) return;


    insertLibraryCode(
        code
    );


    showToast(
        "Référence de ressource insérée."
    );
}















/* ================================================================
   20 — ZOOM LABORATOIRE
   ================================================================ */

function applyLaboratoryZoom() {

    if (!dom.laboratoryCanvas) return;

    const zoom =
        state.laboratoryZoom / 100;

    dom.laboratoryCanvas.style.transform =
        "scale(" + zoom + ")";

    dom.laboratoryCanvas.style.transformOrigin =
        "top left";

    if (dom.labZoomValue) {

        dom.labZoomValue.textContent =
            state.laboratoryZoom + "%";
    }

    saveSettings();
}


function changeLaboratoryZoom(
    delta
) {

    state.laboratoryZoom =
        clamp(
            state.laboratoryZoom + delta,
            FOBAS_WEB_LAB.laboratoryZoomMin,
            FOBAS_WEB_LAB.laboratoryZoomMax
        );

    applyLaboratoryZoom();
}


function setLaboratoryZoomFromPinch(
    startZoom,
    startDistance,
    currentDistance
) {

    if (
        !startDistance
        || !currentDistance
    ) {
        return;
    }

    const ratio =
        currentDistance / startDistance;

    state.laboratoryZoom =
        clamp(
            Math.round(
                startZoom * ratio
            ),
            FOBAS_WEB_LAB.laboratoryZoomMin,
            FOBAS_WEB_LAB.laboratoryZoomMax
        );

    applyLaboratoryZoom();
}


/* ================================================================
   21 — ZOOM GLOBAL ÉCRAN / APPLICATION
   ================================================================ */

function applyScreenZoom() {

    const app =
        dom.fobasWebLaboratoryApp;

    if (!app) return;

    const zoom =
        state.screenZoom / 100;

    /*
       Le zoom CSS est utilisé ici pour conserver les dimensions
       et permettre le pinch à deux doigts sur l'interface entière.
    */

    app.style.zoom = String(zoom);

    if (!app.style.zoom) {

        app.style.transform =
            "scale(" + zoom + ")";

        app.style.transformOrigin =
            "top left";
    }

    saveSettings();
}


function setScreenZoom(value) {

    state.screenZoom =
        clamp(
            value,
            FOBAS_WEB_LAB.screenZoomMin,
            FOBAS_WEB_LAB.screenZoomMax
        );

    applyScreenZoom();
}


function setScreenZoomFromPinch(
    startZoom,
    startDistance,
    currentDistance
) {

    if (
        !startDistance
        || !currentDistance
    ) {
        return;
    }

    const ratio =
        currentDistance / startDistance;

    const next =
        Math.round(
            startZoom * ratio
        );

    setScreenZoom(next);
}


/* ================================================================
   22 — DISTANCE DE DEUX DOIGTS
   ================================================================ */

function getTouchDistance(
    touchA,
    touchB
) {

    const dx =
        touchA.clientX -
        touchB.clientX;

    const dy =
        touchA.clientY -
        touchB.clientY;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}


/* ================================================================
   23 — PINCH 2 DOIGTS
   ================================================================ */

function initializeTouchZoom() {

    const app =
        dom.fobasWebLaboratoryApp;

    if (!app) return;

    app.addEventListener(
        "touchstart",
        function (event) {

            if (event.touches.length !== 2) {
                return;
            }

            const target =
                event.target;

            const insideLab =
                dom.laboratoryViewport &&
                dom.laboratoryViewport.contains(
                    target
                );

            const distance =
                getTouchDistance(
                    event.touches[0],
                    event.touches[1]
                );

            if (insideLab) {

                state.touch.labPinch = true;
                state.touch.globalPinch = false;

                state.touch.startDistance =
                    distance;

                state.touch.startLabZoom =
                    state.laboratoryZoom;

            } else {

                state.touch.globalPinch = true;
                state.touch.labPinch = false;

                state.touch.startDistance =
                    distance;

                state.touch.startGlobalZoom =
                    state.screenZoom;
            }

        },
        {
            passive: false
        }
    );


    app.addEventListener(
        "touchmove",
        function (event) {

            if (event.touches.length !== 2) {
                return;
            }

            if (
                !state.touch.globalPinch
                &&
                !state.touch.labPinch
            ) {
                return;
            }

            event.preventDefault();

            const distance =
                getTouchDistance(
                    event.touches[0],
                    event.touches[1]
                );

            if (state.touch.labPinch) {

                setLaboratoryZoomFromPinch(
                    state.touch.startLabZoom,
                    state.touch.startDistance,
                    distance
                );

            } else if (
                state.touch.globalPinch
            ) {

                setScreenZoomFromPinch(
                    state.touch.startGlobalZoom,
                    state.touch.startDistance,
                    distance
                );
            }

        },
        {
            passive: false
        }
    );


    app.addEventListener(
        "touchend",
        function (event) {

            if (
                event.touches.length < 2
            ) {

                state.touch.globalPinch =
                    false;

                state.touch.labPinch =
                    false;

                state.touch.startDistance =
                    0;
            }
        },
        {
            passive: false
        }
    );


    app.addEventListener(
        "touchcancel",
        function () {

            state.touch.globalPinch =
                false;

            state.touch.labPinch =
                false;

            state.touch.startDistance =
                0;
        },
        {
            passive: false
        }
    );
}


/* ================================================================
   24 — PLEIN ÉCRAN
   ================================================================ */

async function toggleLaboratoryFullscreen() {

    const target =
        dom.laboratoryPanel;

    if (!target) return;

    try {

        if (!document.fullscreenElement) {

            await target.requestFullscreen();

            showToast(
                "Laboratoire en plein écran."
            );

        } else {

            await document.exitFullscreen();

            showToast(
                "Plein écran fermé."
            );
        }

    } catch (error) {

        console.warn(
            "Fullscreen non disponible :",
            error
        );

        showToast(
            "Le plein écran n'est pas disponible sur ce navigateur."
        );
    }
}


/* ================================================================
   25 — SYNTHÈSE VOCALE
   ================================================================ */

function speakText(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        showToast(
            "La synthèse vocale n'est pas disponible."
        );

        return;
    }

    const cleanText =
        String(text || "")
            .replace(/\s+/g, " ")
            .trim();

    if (!cleanText) {
        showToast("Aucun texte à écouter.");
        return;
    }

    window.speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(
            cleanText
        );

    utterance.lang = "fr-FR";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(
        utterance
    );
}


function listenLaboratory() {

    if (!dom.previewFrame) return;

    try {

        const doc =
            dom.previewFrame.contentDocument
            ||
            dom.previewFrame.contentWindow.document;

        const text =
            doc.body
                ? doc.body.innerText
                : "";

        speakText(text);

    } catch (error) {

        showToast(
            "Impossible de lire le contenu de l'aperçu."
        );
    }
}


function listenPedagogical() {

    if (!dom.pedagogicalContent) return;

    speakText(
        dom.pedagogicalContent.innerText
    );
}


function listenDictionary() {

    if (!dom.dictionaryContent) return;

    speakText(
        dom.dictionaryContent.innerText
    );
}


function listenLibrary() {

    if (!dom.libraryContent) return;

    speakText(
        dom.libraryContent.innerText
    );
}


/* ================================================================
   26 — ÉVÉNEMENTS PRINCIPAUX
   ================================================================ */

function bindButton(
    id,
    handler
) {

    const button = byId(id);

    if (!button) return;

    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            try {
                handler(event);
            } catch (error) {

                console.error(
                    "FOBAS action error [" +
                    id +
                    "] :",
                    error
                );

                showToast(
                    "Une erreur est survenue pendant l'action."
                );
            }
        }
    );
}


function initializeButtons() {

    /* Projets */

    bindButton(
        "newProjectBtn",
        createNewProject
    );

    bindButton(
        "saveProjectBtn",
        function () {

            saveCurrentEditorToState();
            saveStoredProjects();

            setStatus(
                "Projet sauvegardé."
            );

            showToast(
                "Projet sauvegardé."
            );
        }
    );

    bindButton(
        "projectManagerBtn",
        function () {
            openPanel(
                "projectManagerPanel"
            );
        }
    );

    bindButton(
        "renameProjectBtn",
        renameCurrentProject
    );

    bindButton(
        "deleteProjectBtn",
        deleteCurrentProject
    );

    bindButton(
        "openProjectsBtn",
        function () {
            openPanel(
                "projectManagerPanel"
            );
        }
    );

    bindButton(
        "createProjectFromManagerBtn",
        createNewProject
    );


    /* Fichiers */

    bindButton(
        "newFileBtn",
        createNewFile
    );

    bindButton(
        "openFileBtn",
        openSelectedFile
    );

    bindButton(
        "deleteFileBtn",
        deleteSelectedFile
    );


    /* Éditeur */

    bindButton(
        "undoBtn",
        undoEditor
    );

    bindButton(
        "redoBtn",
        redoEditor
    );

    bindButton(
        "clearEditorBtn",
        clearEditor
    );

    bindButton(
        "saveFileBtn",
        saveCurrentFile
    );


    /* Barre principale */

    bindButton(
        "pedagogicalBtn",
        function () {
            openPanel(
                "pedagogicalPanel"
            );
        }
    );

    bindButton(
        "dictionaryBtn",
        function () {
            openPanel(
                "dictionaryPanel"
            );
        }
    );

    bindButton(
        "libraryBtn",
        function () {
            openPanel(
                "libraryPanel"
            );
        }
    );

    bindButton(
        "codeEditorBtn",
        openCodeEditor
    );

    bindButton(
        "laboratoryBtn",
        openLaboratory
    );


    /* Laboratoire */

    bindButton(
        "runBtn",
        runProject
    );

    bindButton(
        "refreshPreviewBtn",
        refreshPreview
    );

    bindButton(
        "initializeLabBtn",
        initializeLaboratory
    );

    bindButton(
        "listenLabBtn",
        listenLaboratory
    );

    bindButton(
        "labZoomOutBtn",
        function () {
            changeLaboratoryZoom(
                -FOBAS_WEB_LAB.laboratoryZoomStep
            );
        }
    );

    bindButton(
        "labZoomInBtn",
        function () {
            changeLaboratoryZoom(
                FOBAS_WEB_LAB.laboratoryZoomStep
            );
        }
    );

    bindButton(
        "fullscreenLabBtn",
        toggleLaboratoryFullscreen
    );

    bindButton(
        "closeLabBtn",
        function () {
            closePanel(
                "laboratoryPanel"
            );

            showToast(
                "Laboratoire fermé."
            );
        }
    );


    /* Pédagogique */

    bindButton(
        "listenPedBtn",
        listenPedagogical
    );

    bindButton(
        "closePedagogicalBtn",
        function () {
            closePanel(
                "pedagogicalPanel"
            );
        }
    );

    bindButton(
        "previousChapterBtn",
        function () {
            changeChapter(-1);
        }
    );

    bindButton(
        "nextChapterBtn",
        function () {
            changeChapter(1);
        }
    );

    bindButton(
        "addChapterBtn",
        addPedagogicalChapter
    );


    /* Dictionnaire */

    bindButton(
        "listenDictionaryBtn",
        listenDictionary
    );

    bindButton(
        "closeDictionaryBtn",
        function () {
            closePanel(
                "dictionaryPanel"
            );
        }
    );


    /* Bibliothèque */

    bindButton(
        "listenLibraryBtn",
        listenLibrary
    );

    bindButton(
        "closeLibraryBtn",
        function () {
            closePanel(
                "libraryPanel"
            );
        }
    );


    /* Gestionnaire */

    bindButton(
        "closeProjectManagerBtn",
        function () {
            closePanel(
                "projectManagerPanel"
            );
        }
    );


    /* Ressources */

    bindButton(
        "closeResourcePanelBtn",
        function () {
            closePanel(
                "resourcePanel"
            );
        }
    );
}


/* ================================================================
   27 — ONGLETS PÉDAGOGIQUES
   ================================================================ */

function initializePedagogicalTabs() {

    const buttons = [
        [
            dom.theorieTabBtn,
            "theorie"
        ],
        [
            dom.pratiqueTabBtn,
            "pratique"
        ],
        [
            dom.exercicesTabBtn,
            "exercices"
        ],
        [
            dom.devoirsTabBtn,
            "devoirs"
        ]
    ];

    buttons.forEach(
        function (pair) {

            const button = pair[0];
            const tab = pair[1];

            if (!button) return;

            button.addEventListener(
                "click",
                function () {

                    state.currentPedagogicalTab =
                        tab;

                    renderPedagogical();
                }
            );
        }
    );


    if (dom.chapterSelect) {

        dom.chapterSelect.addEventListener(
            "change",
            function () {

                const value =
                    Number(
                        dom.chapterSelect.value
                    );

                if (
                    Number.isInteger(value)
                    &&
                    value >= 0
                    &&
                    value <
                    PEDAGOGICAL_CHAPTERS.length
                ) {

                    state.currentPedagogicalChapter =
                        value;

                    renderPedagogical();
                }
            }
        );
    }
}


/* ================================================================
   28 — RECHERCHE DICTIONNAIRE
   ================================================================ */

function initializeDictionary() {

    if (!dom.dictionarySearch) return;

    dom.dictionarySearch.addEventListener(
        "input",
        function () {

            state.dictionarySearch =
                dom.dictionarySearch.value;

            renderDictionary();
        }
    );
}


/* ================================================================
   29 — RECHERCHE BIBLIOTHÈQUE
   ================================================================ */

function initializeLibrary() {

    populateLibraryCategories();

    if (dom.librarySearch) {

        dom.librarySearch.addEventListener(
            "input",
            function () {

                state.librarySearch =
                    dom.librarySearch.value;

                renderLibrary();
            }
        );
    }

    if (dom.libraryCategorySelect) {

        dom.libraryCategorySelect.addEventListener(
            "change",
            function () {

                state.libraryCategory =
                    dom.libraryCategorySelect.value;

                renderLibrary();
            }
        );
    }
}


















 /* ================================================================
    30 — RESSOURCES
    ================================================================ */

function initializeResourceInputs() {

    if (dom.imageInput) {

        dom.imageInput.addEventListener(
            "change",
            function () {

                const file =
                    dom.imageInput.files[0];

                if (file) {
                    handleResourceFile(
                        file,
                        "image"
                    );
                }

                dom.imageInput.value = "";
            }
        );
    }


    if (dom.videoInput) {

        dom.videoInput.addEventListener(
            "change",
            function () {

                const file =
                    dom.videoInput.files[0];

                if (file) {
                    handleResourceFile(
                        file,
                        "video"
                    );
                }

                dom.videoInput.value = "";
            }
        );
    }


    /* ============================================================
       NOUVEAU — UPLOAD IMAGE / VIDÉO
       Connexion du nouveau bouton visible dans l'explorateur
       ============================================================ */

    const mediaUploadInput =
        document.getElementById(
            "mediaUploadInput"
        );

    if (mediaUploadInput) {

        mediaUploadInput.addEventListener(
            "change",
            function () {

                const file =
                    mediaUploadInput.files[0];

                if (!file) {
                    mediaUploadInput.value = "";
                    return;
                }


                let kind = "";

                if (
                    file.type &&
                    file.type.startsWith("image/")
                ) {

                    kind = "image";

                } else if (
                    file.type &&
                    file.type.startsWith("video/")
                ) {

                    kind = "video";
                }


                if (!kind) {

                    showToast(
                        "Format image ou vidéo non reconnu."
                    );

                    mediaUploadInput.value = "";

                    return;
                }


                handleResourceFile(
                    file,
                    kind
                );


                mediaUploadInput.value = "";
            }
        );
    }
}
















/* ================================================================
   31 — DRAG & DROP DE RESSOURCES SUR L'ÉDITEUR
   ================================================================ */

function initializeFileDragAndDrop() {

    if (!dom.codeEditor) return;

    dom.codeEditor.addEventListener(
        "dragover",
        function (event) {
            event.preventDefault();
        }
    );

    dom.codeEditor.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();

            const files =
                Array.from(
                    event.dataTransfer.files || []
                );

            files.forEach(
                function (file) {

                    if (
                        file.type.startsWith("image/")
                    ) {

                        handleResourceFile(
                            file,
                            "image"
                        );

                    } else if (
                        file.type.startsWith("video/")
                    ) {

                        handleResourceFile(
                            file,
                            "video"
                        );
                    }
                }
            );
        }
    );
}


/* ================================================================
   32 — CLAVIER GLOBAL
   ================================================================ */

function initializeGlobalKeyboard() {

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                if (
                    document.fullscreenElement
                ) {

                    document.exitFullscreen()
                        .catch(function () {});
                }

                closeAllOverlays();
            }

        }
    );
}


/* ================================================================
   33 — FERMETURE PAR CLIC SUR BACKDROP
   ================================================================ */

function initializeBackdropEvents() {

    const panels = [
        "pedagogicalPanel",
        "dictionaryPanel",
        "libraryPanel",
        "projectManagerPanel",
        "resourcePanel"
    ];

    panels.forEach(
        function (id) {

            const panel = byId(id);

            if (!panel) return;

            panel.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === panel
                    ) {
                        closePanel(id);
                    }
                }
            );
        }
    );
}


/* ================================================================
   34 — INITIALISATION D'UN PROJET PAR DÉFAUT
   ================================================================ */

function ensureProjectExists() {

    if (!state.projects.length) {

        const project =
            createProjectObject(
                FOBAS_WEB_LAB.defaultProjectName
            );

        state.projects.push(project);

        state.currentProjectId =
            project.id;

        state.activeFileName =
            "index.html";

        saveStoredProjects();

        return;
    }

    let savedProjectId = null;

    try {

        savedProjectId =
            localStorage.getItem(
                FOBAS_WEB_LAB.currentProjectKey
            );

    } catch (error) {
        savedProjectId = null;
    }

    const exists =
        state.projects.some(
            function (project) {
                return project.id === savedProjectId;
            }
        );

    if (exists) {

        state.currentProjectId =
            savedProjectId;

    } else {

        state.currentProjectId =
            state.projects[0].id;
    }

    const project =
        getCurrentProject();

    if (project) {

        const names =
            Object.keys(
                project.files || {}
            );

        if (
            !project.files[state.activeFileName]
            &&
            names.length
        ) {
            state.activeFileName =
                names[0];
        }
    }
}


/* ================================================================
   35 — RENDU GLOBAL
   ================================================================ */

function renderAll() {

    renderProjectInformation();

    renderFileTree();

    updateEditorInformation();

    renderProjectList();

    renderChapterSelect();

    renderPedagogicalTabs();

    populateLibraryCategories();

    applyLaboratoryZoom();

    applyScreenZoom();
}


/* ================================================================
   36 — INITIALISATION PRINCIPALE
   ================================================================ */

async function initializeFOBASWebLaboratory() {

    try {

        cacheDOM();

        loadSettings();

        loadStoredProjects();

        ensureProjectExists();

        await openDatabase()
            .catch(
                function (error) {

                    console.warn(
                        "IndexedDB indisponible :",
                        error
                    );
                }
            );

        initializeButtons();

        initializeEditorEvents();

        initializePedagogicalTabs();

        initializeDictionary();

        initializeLibrary();

        initializeResourceInputs();

        initializeFileDragAndDrop();

        initializeGlobalKeyboard();

        initializeBackdropEvents();

        initializeTouchZoom();

        renderAll();

        loadActiveFileIntoEditor();

        openLaboratory();

        runProject();

        setStatus(
            "FOBAS — Laboratoire prêt."
        );

        console.log(
            "FOBAS Web Laboratory Engine " +
            FOBAS_WEB_LAB.version +
            " — prêt."
        );

    } catch (error) {

        console.error(
            "FOBAS — Erreur critique d'initialisation :",
            error
        );

        showToast(
            "Erreur d'initialisation du laboratoire."
        );
    }
}


/* ================================================================
   37 — AUTO-DÉMARRAGE
   ================================================================ */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeFOBASWebLaboratory
    );

} else {

    initializeFOBASWebLaboratory();
}


/* ================================================================
   38 — API PUBLIQUE FOBAS
   Permet également de contrôler le laboratoire depuis la console
   ou depuis d'autres modules compatibles.
   ================================================================ */

window.FOBASWebLaboratory = {

    version:
        FOBAS_WEB_LAB.version,

    run: runProject,

    refresh: refreshPreview,

    initialize:
        initializeLaboratory,

    newProject:
        createNewProject,

    saveProject:
        function () {

            saveCurrentEditorToState();
            saveStoredProjects();
        },

    newFile:
        createNewFile,

    saveFile:
        saveCurrentFile,

    openFile:
        openSelectedFile,

    deleteFile:
        deleteSelectedFile,

    undo:
        undoEditor,

    redo:
        redoEditor,

    laboratoryZoomIn:
        function () {
            changeLaboratoryZoom(
                FOBAS_WEB_LAB.laboratoryZoomStep
            );
        },

    laboratoryZoomOut:
        function () {
            changeLaboratoryZoom(
                -FOBAS_WEB_LAB.laboratoryZoomStep
            );
        },

    screenZoom:
        setScreenZoom,

    speak:
        speakText,

    openPanel:
        openPanel,

    closePanel:
        closePanel
};