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

async function renderFileTree() {

    if (!dom.projectFileTree) return;

    const project = getCurrentProject();

    if (!project) {

        dom.projectFileTree.innerHTML =
            '<div class="empty-project-message">' +
            'Aucun projet.' +
            '</div>';

        return;
    }

    /*
     * ------------------------------------------------------------
     * 1 — FICHIERS TEXTE DU PROJET
     * ------------------------------------------------------------
     */

    const fileEntries =
        Object.keys(
            project.files || {}
        ).map(
            function (fileName) {

                return {
                    name: fileName,
                    type:
                        project.files[fileName].type,
                    source: "project"
                };
            }
        );


    /*
     * ------------------------------------------------------------
     * 2 — RESSOURCES IMAGE / VIDÉO
     * ------------------------------------------------------------
     */

    let resourceEntries = [];

    try {

        const resources =
            await getProjectResources();

        resourceEntries =
            (resources || []).map(
                function (resource) {

                    return {
                        name: resource.name,

                        type:
                            resource.type ||
                            (
                                resource.kind === "image"
                                    ? "image"
                                    : "video"
                            ),

                        kind:
                            resource.kind,

                        resource:
                            resource,

                        source: "resource"
                    };
                }
            );

    } catch (error) {

        console.error(
            "Erreur chargement ressources dans l'arbre :",
            error
        );
    }


    /*
     * ------------------------------------------------------------
     * 3 — COMBINAISON FICHIERS + RESSOURCES
     * ------------------------------------------------------------
     */

    const entries =
        fileEntries.concat(
            resourceEntries
        );


    /*
     * ------------------------------------------------------------
     * 4 — TRI DYNAMIQUE
     *
     * index.html reste en premier.
     * Les autres éléments sont ensuite classés
     * par nom.
     * ------------------------------------------------------------
     */

    entries.sort(
        function (a, b) {

            if (a.name === "index.html") return -1;

            if (b.name === "index.html") return 1;

            return a.name.localeCompare(
                b.name
            );
        }
    );


    /*
     * ------------------------------------------------------------
     * 5 — AUCUN ÉLÉMENT
     * ------------------------------------------------------------
     */

    if (!entries.length) {

        dom.projectFileTree.innerHTML =
            '<div class="empty-project-message">' +
            'Aucun fichier.' +
            '</div>';

        return;
    }


    /*
     * ------------------------------------------------------------
     * 6 — RENDU DE L'ARBRE
     * ------------------------------------------------------------
     */

    dom.projectFileTree.innerHTML = "";


    entries.forEach(
        function (entry) {

            const item =
                document.createElement("button");

            item.type = "button";

            item.className =
                "file-item";


            /*
             * ----------------------------------------------------
             * FICHIER HTML / CSS / JS
             * ----------------------------------------------------
             */

            if (
                entry.source === "project"
                &&
                entry.name === state.activeFileName
            ) {

                item.classList.add(
                    "active"
                );
            }


            item.setAttribute(
                "role",
                "treeitem"
            );


            item.dataset.fileName =
                entry.name;


            /*
             * ----------------------------------------------------
             * ICÔNE
             * ----------------------------------------------------
             */

            let icon = "📄";

            if (
                entry.source === "resource"
            ) {

                if (
                    entry.kind === "image"
                ) {

                    icon = "🖼️";

                } else if (
                    entry.kind === "video"
                ) {

                    icon = "🎬";
                }

            } else {

                icon =
                    getFileIcon(
                        entry.type
                    );
            }


            /*
             * ----------------------------------------------------
             * NOM
             * ----------------------------------------------------
             */

            item.innerHTML =
                '<span class="file-icon">' +
                escapeHTML(icon) +
                '</span>' +

                '<span class="file-name">' +
                escapeHTML(entry.name) +
                '</span>';


            /*
             * ----------------------------------------------------
             * CLIC SUR UN FICHIER
             * ----------------------------------------------------
             */

            item.addEventListener(
                "click",
                function () {

                    /*
                     * Les fichiers HTML/CSS/JS
                     * continuent d'utiliser le système
                     * existant.
                     */

                    if (
                        entry.source === "project"
                    ) {

                        selectFile(
                            entry.name
                        );

                        return;
                    }


                    /*
                     * Les images/vidéos ne sont pas
                     * des fichiers texte de l'éditeur.
                     *
                     * Un clic les sélectionne comme
                     * ressource disponible.
                     */

                    if (
                        entry.source === "resource"
                    ) {

                        insertResourceIntoEditor(
                            entry.resource
                        );
                    }
                }
            );


            /*
             * ----------------------------------------------------
             * MENU CONTEXTUEL
             *
             * Renommage uniquement pour les vrais fichiers
             * du projet.
             *
             * On ne touche pas au nom IndexedDB ici.
             * ----------------------------------------------------
             */

            item.addEventListener(
                "contextmenu",
                function (event) {

                    event.preventDefault();


                    if (
                        entry.source !== "project"
                    ) {

                        return;
                    }


                    if (
                        window.confirm(
                            "Renommer « " +
                            entry.name +
                            " » ?"
                        )
                    ) {

                        state.activeFileName =
                            entry.name;

                        renameActiveFile();
                    }
                }
            );


            /*
             * ----------------------------------------------------
             * AJOUT DANS L'ARBRE
             * ----------------------------------------------------
             */

            dom.projectFileTree.appendChild(
                item
            );
        }
    );
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
   FOBAS — MEDIA FORMAT & PREVIEW ENGINE
   VERSION 1.0.0

   OBJECTIF :
   - Préparer les images et vidéos provenant d'Android.
   - Reconnaître le vrai type MIME du fichier.
   - Ne pas dépendre uniquement de l'extension.
   - Utiliser le Blob réel provenant d'IndexedDB.
   - Préparer les images pour <img src="">.
   - Préparer les vidéos pour <video>/<source src="">.
   - Supporter JPEG / JPG / PNG / WEBP / GIF / SVG.
   - Supporter HEIC / HEIF lorsque le navigateur possède
     un décodeur compatible.
   - Préparer MP4 / WebM / OGG / MOV et autres vidéos
     compatibles avec le navigateur.
   - Ne modifier aucune donnée dans IndexedDB.
   - Ne modifier aucun projet.
   - Ne modifier aucun fichier de l'éditeur.
   - Bloc totalement isolé.
   ================================================================ */

(function () {

    "use strict";


    /* ============================================================
       01 — CONFIGURATION
       ============================================================ */

    const FOBAS_MEDIA_ENGINE = {

        name:
            "FOBAS Media Format & Preview Engine",

        version:
            "1.0.0",

        imageTypes: [

            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/bmp",
            "image/svg+xml",
            "image/avif",
            "image/heic",
            "image/heif"

        ],

        videoTypes: [

            "video/mp4",
            "video/webm",
            "video/ogg",
            "video/quicktime",
            "video/x-m4v",
            "video/3gpp",
            "video/3gpp2",
            "video/x-msvideo"

        ]

    };


    /* ============================================================
       02 — NORMALISATION DU TYPE MIME
       ============================================================ */

    function normalizeMimeType(mimeType) {

        return String(
            mimeType || ""
        )
            .trim()
            .toLowerCase();

    }


    /* ============================================================
       03 — EXTRACTION DE L'EXTENSION
       ============================================================ */

    function getFileExtension(fileName) {

        const name =
            String(fileName || "")
                .trim()
                .toLowerCase();

        const lastDot =
            name.lastIndexOf(".");

        if (
            lastDot < 0 ||
            lastDot === name.length - 1
        ) {
            return "";
        }

        return name.substring(
            lastDot + 1
        );

    }


    /* ============================================================
       04 — DÉTECTION DU TYPE PAR EXTENSION
       ============================================================ */

    function mimeTypeFromExtension(fileName) {

        const extension =
            getFileExtension(fileName);

        const types = {

            jpg:
                "image/jpeg",

            jpeg:
                "image/jpeg",

            jpe:
                "image/jpeg",

            png:
                "image/png",

            webp:
                "image/webp",

            gif:
                "image/gif",

            bmp:
                "image/bmp",

            svg:
                "image/svg+xml",

            avif:
                "image/avif",

            heic:
                "image/heic",

            heif:
                "image/heif",

            mp4:
                "video/mp4",

            m4v:
                "video/x-m4v",

            webm:
                "video/webm",

            ogv:
                "video/ogg",

            ogg:
                "video/ogg",

            mov:
                "video/quicktime",

            "3gp":
                "video/3gpp",

            "3g2":
                "video/3gpp2",

            avi:
                "video/x-msvideo"

        };

        return types[extension] || "";

    }


    /* ============================================================
       05 — DÉTECTION DU TYPE RÉEL
       ============================================================ */

    function detectMediaType(
        blob,
        fileName,
        mimeType
    ) {

        const blobType =
            normalizeMimeType(
                blob && blob.type
            );

        const suppliedType =
            normalizeMimeType(
                mimeType
            );

        const extensionType =
            mimeTypeFromExtension(
                fileName
            );

        if (blobType) {
            return blobType;
        }

        if (suppliedType) {
            return suppliedType;
        }

        if (extensionType) {
            return extensionType;
        }

        return "";

    }


    /* ============================================================
       06 — TEST IMAGE
       ============================================================ */

    function isImageType(
        mimeType,
        fileName
    ) {

        const type =
            normalizeMimeType(
                mimeType
            );

        if (
            type.indexOf("image/") === 0
        ) {
            return true;
        }

        const extensionType =
            mimeTypeFromExtension(
                fileName
            );

        return (
            extensionType.indexOf("image/") === 0
        );

    }


    /* ============================================================
       07 — TEST VIDÉO
       ============================================================ */

    function isVideoType(
        mimeType,
        fileName
    ) {

        const type =
            normalizeMimeType(
                mimeType
            );

        if (
            type.indexOf("video/") === 0
        ) {
            return true;
        }

        const extensionType =
            mimeTypeFromExtension(
                fileName
            );

        return (
            extensionType.indexOf("video/") === 0
        );

    }


    /* ============================================================
       08 — BLOB → DATA URL
       ============================================================ */

    function blobToDataURL(blob) {

        return new Promise(
            function (
                resolve,
                reject
            ) {

                if (!(blob instanceof Blob)) {

                    reject(
                        new Error(
                            "FOBAS : le média fourni n'est pas un Blob."
                        )
                    );

                    return;
                }

                const reader =
                    new FileReader();

                reader.onload =
                    function () {

                        resolve(
                            String(
                                reader.result || ""
                            )
                        );

                    };

                reader.onerror =
                    function () {

                        reject(
                            new Error(
                                "FOBAS : impossible de lire le Blob."
                            )
                        );

                    };

                reader.onabort =
                    function () {

                        reject(
                            new Error(
                                "FOBAS : lecture du Blob interrompue."
                            )
                        );

                    };

                reader.readAsDataURL(
                    blob
                );

            }
        );

    }


    /* ============================================================
       09 — BLOB URL
       ============================================================ */

    function createBlobURL(blob) {

        if (!(blob instanceof Blob)) {
            return "";
        }

        try {

            return URL.createObjectURL(
                blob
            );

        } catch (error) {

            return "";

        }

    }


    /* ============================================================
       10 — TEST DE DÉCODAGE IMAGE
       ============================================================ */

    function testImageDecoding(
        source
    ) {

        return new Promise(
            function (resolve) {

                if (
                    typeof Image ===
                    "undefined"
                ) {

                    resolve(false);
                    return;

                }

                const image =
                    new Image();

                let finished =
                    false;

                const finish =
                    function (result) {

                        if (finished) {
                            return;
                        }

                        finished = true;

                        image.onload = null;
                        image.onerror = null;

                        resolve(
                            Boolean(result)
                        );

                    };

                image.onload =
                    function () {

                        finish(true);

                    };

                image.onerror =
                    function () {

                        finish(false);

                    };

                try {

                    image.src =
                        source;

                } catch (error) {

                    finish(false);

                }

                setTimeout(
                    function () {

                        finish(false);

                    },
                    8000
                );

            }
        );

    }


    /* ============================================================
       11 — PRÉPARATION IMAGE
       ============================================================ */

    async function prepareImage(
        blob,
        fileName,
        mimeType
    ) {

        if (!(blob instanceof Blob)) {

            throw new Error(
                "FOBAS : Blob image introuvable."
            );

        }

        const detectedType =
            detectMediaType(
                blob,
                fileName,
                mimeType
            );

        let effectiveType =
            detectedType;

        if (!effectiveType) {

            effectiveType =
                "application/octet-stream";

        }


        /* --------------------------------------------------------
           Première tentative :
           utiliser directement le Blob via Blob URL.
           -------------------------------------------------------- */

        const blobURL =
            createBlobURL(
                blob
            );

        if (blobURL) {

            const browserCanDecode =
                await testImageDecoding(
                    blobURL
                );

            if (browserCanDecode) {

                return {

                    success: true,

                    kind: "image",

                    source: blobURL,

                    sourceType: "blob",

                    mimeType:
                        effectiveType,

                    fileName:
                        String(
                            fileName || ""
                        ),

                    converted: false

                };

            }

            try {

                URL.revokeObjectURL(
                    blobURL
                );

            } catch (error) {
                /* Aucun traitement nécessaire. */
            }

        }


        /* --------------------------------------------------------
           Deuxième tentative :
           Data URL.
           -------------------------------------------------------- */

        let dataURL = "";

        try {

            dataURL =
                await blobToDataURL(
                    blob
                );

        } catch (error) {

            dataURL = "";

        }

        if (dataURL) {

            const browserCanDecode =
                await testImageDecoding(
                    dataURL
                );

            if (browserCanDecode) {

                return {

                    success: true,

                    kind: "image",

                    source: dataURL,

                    sourceType: "data",

                    mimeType:
                        effectiveType,

                    fileName:
                        String(
                            fileName || ""
                        ),

                    converted: false

                };

            }

        }


        /* --------------------------------------------------------
           HEIC / HEIF :
           si le navigateur ne possède pas de codec HEIC/HEIF,
           JavaScript natif ne peut pas inventer le décodage.
           On retourne néanmoins le Blob URL comme fallback.
           -------------------------------------------------------- */

        const isHEIC =
            effectiveType ===
                "image/heic" ||
            effectiveType ===
                "image/heif" ||
            getFileExtension(
                fileName
            ) === "heic" ||
            getFileExtension(
                fileName
            ) === "heif";

        if (isHEIC) {

            const fallbackURL =
                createBlobURL(
                    blob
                );

            if (fallbackURL) {

                return {

                    success: true,

                    kind: "image",

                    source:
                        fallbackURL,

                    sourceType:
                        "blob-fallback",

                    mimeType:
                        effectiveType,

                    fileName:
                        String(
                            fileName || ""
                        ),

                    converted: false,

                    requiresHEICDecoder:
                        true

                };

            }

        }


        throw new Error(
            "FOBAS : le navigateur ne peut pas décoder cette image (" +
            effectiveType +
            ")."
        );

    }


    /* ============================================================
       12 — TEST DE SUPPORT VIDÉO
       ============================================================ */

    function canBrowserPlayVideo(
        mimeType
    ) {

        try {

            const video =
                document.createElement(
                    "video"
                );

            if (
                !video ||
                typeof video.canPlayType !==
                    "function"
            ) {

                return false;

            }

            const result =
                video.canPlayType(
                    mimeType || ""
                );

            return (
                result === "probably" ||
                result === "maybe"
            );

        } catch (error) {

            return false;

        }

    }


    /* ============================================================
       13 — PRÉPARATION VIDÉO
       ============================================================ */

    async function prepareVideo(
        blob,
        fileName,
        mimeType
    ) {

        if (!(blob instanceof Blob)) {

            throw new Error(
                "FOBAS : Blob vidéo introuvable."
            );

        }

        const detectedType =
            detectMediaType(
                blob,
                fileName,
                mimeType
            );

        let effectiveType =
            detectedType;

        if (!effectiveType) {

            effectiveType =
                "application/octet-stream";

        }


        /* --------------------------------------------------------
           Le Blob URL est préférable pour les vidéos :
           il évite de transformer une grosse vidéo en Data URL.
           -------------------------------------------------------- */

        const blobURL =
            createBlobURL(
                blob
            );

        if (blobURL) {

            const playable =
                canBrowserPlayVideo(
                    effectiveType
                );

            return {

                success: true,

                kind: "video",

                source:
                    blobURL,

                sourceType:
                    "blob",

                mimeType:
                    effectiveType,

                fileName:
                    String(
                        fileName || ""
                    ),

                converted: false,

                browserPlayable:
                    playable

            };

        }


        /* --------------------------------------------------------
           Fallback Data URL
           -------------------------------------------------------- */

        const dataURL =
            await blobToDataURL(
                blob
            );

        if (dataURL) {

            return {

                success: true,

                kind: "video",

                source:
                    dataURL,

                sourceType:
                    "data",

                mimeType:
                    effectiveType,

                fileName:
                    String(
                        fileName || ""
                    ),

                converted: false,

                browserPlayable:
                    canBrowserPlayVideo(
                        effectiveType
                    )

            };

        }


        throw new Error(
            "FOBAS : impossible de préparer cette vidéo."
        );

    }


    /* ============================================================
       14 — PRÉPARATION UNIVERSELLE
       ============================================================ */

    async function prepareMedia(
        blob,
        fileName,
        mimeType,
        forcedKind
    ) {

        const detectedType =
            detectMediaType(
                blob,
                fileName,
                mimeType
            );

        let kind =
            String(
                forcedKind || ""
            )
                .trim()
                .toLowerCase();


        if (
            kind !== "image" &&
            kind !== "video"
        ) {

            if (
                isImageType(
                    detectedType,
                    fileName
                )
            ) {

                kind = "image";

            } else if (
                isVideoType(
                    detectedType,
                    fileName
                )
            ) {

                kind = "video";

            }

        }


        if (kind === "image") {

            return await prepareImage(
                blob,
                fileName,
                detectedType
            );

        }


        if (kind === "video") {

            return await prepareVideo(
                blob,
                fileName,
                detectedType
            );

        }


        throw new Error(
            "FOBAS : type de média non reconnu : " +
            String(
                detectedType || "inconnu"
            )
        );

    }


    /* ============================================================
       15 — LIBÉRATION D'UNE URL BLOB
       ============================================================ */

    function releaseMediaSource(
        source
    ) {

        const value =
            String(
                source || ""
            );

        if (
            value.indexOf(
                "blob:"
            ) === 0
        ) {

            try {

                URL.revokeObjectURL(
                    value
                );

            } catch (error) {
                /* Aucun traitement nécessaire. */
            }

        }

    }


    /* ============================================================
       16 — API PUBLIQUE FOBAS
       ============================================================ */

    window.FOBASMediaEngine = {

        version:
            FOBAS_MEDIA_ENGINE.version,

        prepare:
            prepareMedia,

        prepareImage:
            prepareImage,

        prepareVideo:
            prepareVideo,

        blobToDataURL:
            blobToDataURL,

        createBlobURL:
            createBlobURL,

        detectType:
            detectMediaType,

        isImage:
            isImageType,

        isVideo:
            isVideoType,

        canPlayVideo:
            canBrowserPlayVideo,

        release:
            releaseMediaSource

    };


    /* ============================================================
       17 — CONFIRMATION DE CHARGEMENT
       ============================================================ */

    window.FOBAS_MEDIA_ENGINE_READY =
        true;


})();














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
       2 — Correspondance par nom simple uniquement
       lorsqu'il est unique dans le projet.
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

    const firstHTML =
        Object.keys(project.files)
            .find(function (name) {

                return getFileType(name) === "html";

            });

    return firstHTML || null;
}


/* ================================================================
   12A — CONVERSION BLOB → DATA URL
   ================================================================ */

function blobToDataURL(blob) {

    return new Promise(
        function (resolve, reject) {

            if (!(blob instanceof Blob)) {

                reject(
                    new Error(
                        "Ressource binaire invalide."
                    )
                );

                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                function () {

                    resolve(
                        String(
                            reader.result || ""
                        )
                    );

                };

            reader.onerror =
                function () {

                    reject(
                        reader.error ||
                        new Error(
                            "Impossible de lire la ressource binaire."
                        )
                    );

                };

            reader.readAsDataURL(blob);

        }
    );
}


/* ================================================================
   12B — RECHERCHE D'UNE RESSOURCE INDEXEDDB
   ================================================================ */

function resolveProjectResource(
    resources,
    reference
) {

    if (
        !Array.isArray(resources) ||
        !reference
    ) {
        return null;
    }

    const normalizedReference =
        normalizeProjectReference(
            reference
        );

    if (!normalizedReference) {
        return null;
    }

    /*
       1 — Correspondance exacte.
    */
    const exactMatch =
        resources.find(
            function (resource) {

                return (
                    resource &&
                    resource.name &&
                    normalizeProjectReference(
                        resource.name
                    ) === normalizedReference
                );

            }
        );

    if (exactMatch) {
        return exactMatch;
    }

    /*
       2 — Correspondance par nom simple
       lorsqu'il est unique.
    */
    const referenceBaseName =
        normalizedReference
            .split("/")
            .pop();

    const baseMatches =
        resources.filter(
            function (resource) {

                if (
                    !resource ||
                    !resource.name
                ) {
                    return false;
                }

                return (
                    normalizeProjectReference(
                        resource.name
                    )
                    .split("/")
                    .pop() ===
                    referenceBaseName
                );

            }
        );

    if (baseMatches.length === 1) {
        return baseMatches[0];
    }

    return null;
}


/* ================================================================
   12C — VÉRIFICATION DES URL EXTERNES
   ================================================================ */

function isExternalOrNonFileReference(reference) {

    const value =
        String(reference || "").trim();

    if (!value) {
        return true;
    }

    return (
        /^(?:https?:|\/\/|data:|blob:|javascript:|mailto:|tel:|#)/i
            .test(value)
    );
}


/* ================================================================
   12D — PRÉPARATION D'UNE RESSOURCE MÉDIA
   ================================================================ */

/*
   Utilise le nouveau moteur FOBASMediaEngine lorsqu'il est
   disponible.

   Si le moteur n'est pas disponible, on conserve un fallback
   direct vers le Blob → Data URL afin de ne pas casser
   l'ancien système.
*/
async function prepareProjectMediaResource(
    resource
) {

    if (
        !resource ||
        !(resource.blob instanceof Blob)
    ) {
        return null;
    }

    /*
       ------------------------------------------------------------
       NOUVEAU MOTEUR FOBAS
       ------------------------------------------------------------
    */
    if (
        window.FOBASMediaEngine &&
        typeof window.FOBASMediaEngine.prepare ===
            "function"
    ) {

        try {

            const mediaResult =
                await window.FOBASMediaEngine.prepare(
                    resource.blob,
                    resource.name,
                    resource.type,
                    resource.kind
                );

            if (
                mediaResult &&
                mediaResult.source
            ) {

                return mediaResult;

            }

        } catch (error) {

            console.warn(
                "FOBAS — Media Engine n'a pas pu préparer :",
                resource.name,
                error
            );

        }

    }


    /*
       ------------------------------------------------------------
       FALLBACK COMPATIBLE AVEC L'ANCIEN SYSTÈME
       ------------------------------------------------------------
    */

    try {

        const dataURL =
            await blobToDataURL(
                resource.blob
            );

        if (!dataURL) {
            return null;
        }

        return {

            success: true,

            kind:
                resource.kind || "",

            source:
                dataURL,

            sourceType:
                "data",

            mimeType:
                resource.type ||
                resource.blob.type ||
                "",

            fileName:
                resource.name || "",

            converted:
                false

        };

    } catch (error) {

        console.warn(
            "FOBAS — Impossible de préparer la ressource :",
            resource.name,
            error
        );

        return null;
    }
}


/* ================================================================
   12E — INJECTION DES IMAGES / VIDÉOS INDEXEDDB
   ================================================================ */

async function injectProjectMedia(
    html,
    project
) {

    let result =
        String(html || "");

    if (!project) {
        return result;
    }

    /*
       Récupération des ressources du projet
       depuis IndexedDB.
    */
    let resources = [];

    try {

        resources =
            await getProjectResources();

    } catch (error) {

        console.warn(
            "FOBAS — Impossible de récupérer les ressources IndexedDB :",
            error
        );

        return result;
    }

    if (
        !Array.isArray(resources) ||
        !resources.length
    ) {
        return result;
    }


    /*
       ------------------------------------------------------------
       IMAGES
       ------------------------------------------------------------
    */

    result =
        await replaceAsyncHTMLAttribute(
            result,
            /<img\b([^>]*?)>/gi,
            "src",
            resources
        );


    /*
       ------------------------------------------------------------
       VIDÉOS AVEC SRC DIRECT
       ------------------------------------------------------------
    */

    result =
        await replaceAsyncHTMLAttribute(
            result,
            /<video\b([^>]*?)>/gi,
            "src",
            resources
        );


    /*
       ------------------------------------------------------------
       AUDIO
       ------------------------------------------------------------
    */

    result =
        await replaceAsyncHTMLAttribute(
            result,
            /<audio\b([^>]*?)>/gi,
            "src",
            resources
        );


    /*
       ------------------------------------------------------------
       SOURCE VIDEO / AUDIO
       ------------------------------------------------------------
    */

    result =
        await replaceAsyncHTMLAttribute(
            result,
            /<source\b([^>]*?)>/gi,
            "src",
            resources
        );


    /*
       ------------------------------------------------------------
       POSTER VIDEO
       ------------------------------------------------------------
    */

    result =
        await replaceAsyncHTMLAttribute(
            result,
            /<video\b([^>]*?)>/gi,
            "poster",
            resources
        );

    return result;
}


/* ================================================================
   12F — REMPLACEMENT ASYNCHRONE D'UN ATTRIBUT HTML
   ================================================================ */

async function replaceAsyncHTMLAttribute(
    html,
    tagPattern,
    attributeName,
    resources
) {

    const matches = [];

    String(html || "").replace(
        tagPattern,
        function (
            fullTag,
            attributes
        ) {

            const attributePattern =
                new RegExp(
                    "\\b" +
                    attributeName +
                    "\\s*=\\s*([\"'])(.*?)\\1",
                    "i"
                );

            const attributeMatch =
                attributes.match(
                    attributePattern
                );

            if (!attributeMatch) {
                return fullTag;
            }

            matches.push({

                fullTag:
                    fullTag,

                attributes:
                    attributes,

                value:
                    attributeMatch[2]

            });

            return fullTag;
        }
    );

    if (!matches.length) {
        return html;
    }

    const replacements =
        new Map();


    for (
        const match of matches
    ) {

        const reference =
            String(
                match.value || ""
            ).trim();


        /*
           Ne jamais toucher aux ressources déjà résolues
           ou aux URL externes.
        */
        if (
            isExternalOrNonFileReference(
                reference
            )
        ) {
            continue;
        }


        /*
           Recherche dans IndexedDB.
        */
        const resource =
            resolveProjectResource(
                resources,
                reference
            );

        if (
            !resource ||
            !(resource.blob instanceof Blob)
        ) {
            continue;
        }


        /*
           Préparation par le nouveau moteur FOBAS.
        */
        const mediaResult =
            await prepareProjectMediaResource(
                resource
            );

        if (
            !mediaResult ||
            !mediaResult.source
        ) {
            continue;
        }


        /*
           Source finale réellement utilisable
           par le document Preview.
        */
        const mediaSource =
            String(
                mediaResult.source
            );


        /*
           Conserve tous les autres attributs
           de la balise.
        */
        const attributePattern =
            new RegExp(
                "(\\b" +
                attributeName +
                "\\s*=\\s*)([\"'])(.*?)\\2",
                "i"
            );


        const newTag =
            match.fullTag.replace(
                attributePattern,
                function (
                    fullAttribute,
                    prefix,
                    quote
                ) {

                    return (
                        prefix +
                        quote +
                        mediaSource +
                        quote
                    );

                }
            );


        replacements.set(
            match.fullTag,
            newTag
        );

    }


    if (!replacements.size) {
        return html;
    }


    /*
       Application des remplacements.
    */
    let result =
        String(html || "");


    replacements.forEach(
        function (
            newTag,
            oldTag
        ) {

            result =
                result.split(
                    oldTag
                ).join(
                    newTag
                );

        }
    );


    return result;
}


/* ================================================================
   12G — CONSTRUCTION DU DOCUMENT FINAL
   ================================================================ */

async function buildProjectDocument() {

    const project =
        getCurrentProject();

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


    /*
       ------------------------------------------------------------
       1 — CSS ET JAVASCRIPT DU PROJET
       ------------------------------------------------------------
    */

    html =
        injectProjectAssets(
            html,
            project,
            activeHTMLFileName
        );


    /*
       ------------------------------------------------------------
       2 — IMAGES / VIDÉOS / AUDIO INDEXEDDB
       ------------------------------------------------------------
    */

    html =
        await injectProjectMedia(
            html,
            project
        );


    return html;
}


/* ================================================================
   12H — INJECTION CSS / JAVASCRIPT
   ================================================================ */

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
       CSS LOCAUX
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


                if (
                    rel.split(/\s+/)
                        .indexOf("stylesheet") === -1
                ) {
                    return fullTag;
                }


                /*
                   Ressources externes :
                   ne pas modifier.
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
       JAVASCRIPT LOCAUX
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
                   Script inline existant :
                   conservation intégrale.
                */
                if (!srcMatch) {
                    return fullTag;
                }


                const src =
                    srcMatch[1].trim();


                /*
                   Script externe :
                   conservation intégrale.
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
                    return fullTag;
                }


                const jsContent =
                    getProjectFile(
                        project,
                        jsFileName
                    );


                /*
                   Suppression uniquement de src.
                   Les autres attributs sont conservés.
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


    return result;
}


/* ================================================================
   12I — EXÉCUTION DU PROJET
   ================================================================ */

async function runProject() {

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


    let html = "";


    try {

        html =
            await buildProjectDocument();

    } catch (error) {

        console.error(
            "FOBAS — Erreur lors de la construction du preview :",
            error
        );

        showToast(
            "Erreur lors de la préparation du preview."
        );

        return;
    }


    if (!dom.previewFrame) {
        return;
    }


    /*
       Le document final contient maintenant :
       - HTML actif
       - CSS local intégré
       - JavaScript local intégré
       - images IndexedDB préparées
       - vidéos IndexedDB préparées
       - audio IndexedDB préparé
       - posters IndexedDB préparés
    */
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


/* ================================================================
   12J — ACTUALISATION DU PREVIEW
   ================================================================ */

function refreshPreview() {

    runProject();

    setStatus(
        "Aperçu actualisé."
    );
}


/* ================================================================
   12K — INITIALISATION DU LABORATOIRE
   ================================================================ */

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

    title: "A — Introduction au Web et aux technologies Web",

    theorie:
`CHAPITRE A — INTRODUCTION AU WEB

1. QU'EST-CE QUE LE WEB ?

Le Web, appelé aussi World Wide Web (WWW), est un système qui permet
d'accéder à des pages, des documents, des images, des vidéos,
des applications et différents services à travers Internet.

Un utilisateur utilise généralement un navigateur Web pour consulter
un site ou une application Web.

Exemples de navigateurs :
Chrome, Firefox, Edge, Safari, Opera et autres navigateurs modernes.

Important :
Internet et le Web ne sont pas exactement la même chose.

Internet est l'infrastructure mondiale qui permet à différents
ordinateurs, serveurs et appareils de communiquer.

Le Web est un service qui fonctionne sur Internet et qui permet
notamment d'accéder à des ressources avec des adresses Web (URL)
et des protocoles comme HTTP et HTTPS.


2. SITE WEB ET APPLICATION WEB

Un site Web est généralement constitué de plusieurs pages ou
ressources accessibles depuis un navigateur.

Une application Web est un système interactif qui permet à
l'utilisateur d'effectuer des opérations directement dans le
navigateur.

Exemples :
- site institutionnel ;
- site scolaire ;
- boutique en ligne ;
- plateforme de formation ;
- tableau de bord ;
- application de gestion ;
- laboratoire virtuel.

Une même réalisation peut être à la fois un site Web et une
application Web selon ses fonctionnalités.


3. COMMENT FONCTIONNE UNE PAGE WEB ?

Lorsqu'un utilisateur demande une page Web, plusieurs éléments
peuvent intervenir :

Utilisateur
    ↓
Navigateur Web
    ↓
Internet / réseau
    ↓
Serveur Web
    ↓
Ressources Web
    ↓
Navigateur
    ↓
Affichage de la page

Le navigateur reçoit les ressources nécessaires et les interprète
pour afficher la page.

Les ressources peuvent comprendre :
- HTML ;
- CSS ;
- JavaScript ;
- images ;
- audio ;
- vidéo ;
- polices ;
- données provenant d'un serveur.


4. LES TROIS TECHNOLOGIES FONDAMENTALES

La création Web repose notamment sur trois technologies essentielles :

HTML
CSS
JavaScript

HTML = HyperText Markup Language

HTML définit la structure et le contenu de la page.

CSS = Cascading Style Sheets

CSS définit la présentation et l'apparence de la page.

JavaScript

JavaScript permet d'ajouter du comportement, de la logique et
de l'interactivité.

On peut retenir :

HTML → structure
CSS → présentation
JavaScript → comportement


5. HTML : CONSTRUIRE LA STRUCTURE

HTML permet de décrire les différents éléments d'une page.

Exemples :

- titre ;
- paragraphe ;
- lien ;
- image ;
- liste ;
- tableau ;
- formulaire ;
- vidéo ;
- audio ;
- section ;
- article ;
- bouton.

Exemple simple :

<h1>Bienvenue</h1>

<p>Ma première page Web.</p>

Dans cet exemple :

<h1> représente un titre principal.

<p> représente un paragraphe.


6. CSS : STYLISER LA PAGE

CSS permet de modifier l'apparence des éléments HTML.

On peut notamment contrôler :

- couleurs ;
- tailles ;
- marges ;
- espacements ;
- bordures ;
- arrière-plans ;
- positions ;
- dimensions ;
- typographie ;
- disposition des éléments ;
- adaptation aux écrans mobiles.

Exemple :

h1 {
    color: blue;
    font-size: 32px;
}

HTML définit ce qu'est l'élément.

CSS définit principalement comment cet élément doit apparaître.


7. JAVASCRIPT : AJOUTER L'INTERACTIVITÉ

JavaScript permet à une page Web de réagir aux actions
de l'utilisateur.

Exemples :

- cliquer sur un bouton ;
- afficher ou cacher un élément ;
- modifier un texte ;
- vérifier un formulaire ;
- effectuer un calcul ;
- changer une image ;
- créer une animation ;
- manipuler le contenu HTML ;
- communiquer avec une API ;
- sauvegarder des informations localement.

Exemple :

<button onclick="alert('Bonjour !')">
    Cliquer
</button>

Lorsqu'on clique sur le bouton, JavaScript exécute une action.


8. LE NAVIGATEUR WEB

Le navigateur est le logiciel utilisé pour consulter et exécuter
les ressources Web.

Il interprète notamment :

HTML → structure
CSS → présentation
JavaScript → comportement

Le navigateur possède également un environnement d'exécution
permettant au JavaScript de manipuler la page.

Exemples d'éléments du navigateur :

- barre d'adresse ;
- onglets ;
- historique ;
- favoris ;
- outils de développement ;
- moteur de rendu ;
- console JavaScript.


9. QU'EST-CE QU'UNE URL ?

URL signifie Uniform Resource Locator.

Une URL permet d'indiquer l'adresse d'une ressource sur le Web.

Exemple :

https://www.exemple.com/index.html

Une URL peut contenir :

- protocole ;
- domaine ;
- chemin ;
- nom de fichier ;
- paramètres ;
- fragment.

Exemple :

https://www.exemple.com/produits?id=10#details

Le navigateur utilise cette adresse pour accéder à la ressource
correspondante.


10. HTTP ET HTTPS

HTTP signifie HyperText Transfer Protocol.

HTTPS signifie HyperText Transfer Protocol Secure.

HTTPS permet de sécuriser la communication entre le navigateur
et le serveur grâce au chiffrement de la connexion.

Pour un site Web moderne, HTTPS est particulièrement important
pour la sécurité et la protection des échanges.


11. CLIENT ET SERVEUR

Dans une architecture Web, le client est généralement le navigateur
ou l'appareil de l'utilisateur.

Le serveur est un ordinateur ou un système informatique qui fournit
des ressources ou des services.

Exemple :

Client
→ demande une page

Serveur
→ traite la demande

Serveur
→ renvoie les ressources

Navigateur
→ affiche la page


12. FRONT-END ET BACK-END

Front-end désigne principalement la partie visible et interactive
exécutée du côté utilisateur.

Technologies principales :

HTML
CSS
JavaScript

Back-end désigne principalement la partie exécutée côté serveur.

Elle peut gérer :

- utilisateurs ;
- authentification ;
- bases de données ;
- traitements ;
- fichiers ;
- API ;
- logique métier ;
- sécurité.

Le front-end et le back-end peuvent communiquer à travers
des requêtes réseau et des API.


13. QU'EST-CE QU'UNE PAGE HTML ?

Une page HTML est généralement enregistrée dans un fichier portant
l'extension :

.html

Exemple :

index.html

Un document HTML moderne commence généralement par :

<!DOCTYPE html>

Puis possède une structure générale comme :

<html>
<head>
    ...
</head>

<body>
    ...
</body>
</html>

La partie head contient notamment les informations destinées
au navigateur et les ressources nécessaires.

La partie body contient principalement le contenu affiché
dans la page.


14. LE FICHIER index.html

Dans de nombreux projets Web, le fichier principal est appelé :

index.html

Il peut servir de page d'accueil.

Exemple d'organisation :

mon-projet/
│
├── index.html
├── about.html
├── contact.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── images/
    └── logo.png

Cette organisation facilite la gestion du projet.


15. ORGANISATION D'UN PROJET WEB

Un projet Web peut contenir plusieurs types de fichiers.

HTML :
contient les pages et la structure.

CSS :
contient les règles de présentation.

JavaScript :
contient la logique et l'interactivité.

Images :
contiennent les ressources graphiques.

Audio :
contient les sons.

Vidéo :
contient les vidéos.

Un projet bien organisé est plus facile à maintenir et à modifier.


16. CHEMIN RELATIF ET CHEMIN ABSOLU

Un chemin relatif indique une ressource par rapport au fichier
actuellement utilisé.

Exemple :

images/logo.png

Un chemin absolu peut indiquer une adresse complète :

https://www.exemple.com/images/logo.png

Les chemins relatifs sont particulièrement utiles pour organiser
les ressources d'un projet local.


17. BALISE, ÉLÉMENT ET ATTRIBUT

Une balise HTML est une instruction utilisée pour définir
la structure d'un document.

Exemple :

<p>

Un élément HTML peut comprendre une balise ouvrante, un contenu
et une balise fermante.

Exemple :

<p>Bonjour</p>

Un attribut fournit une information supplémentaire à un élément.

Exemple :

<a href="https://www.exemple.com">
    Visiter le site
</a>

Ici :

<a> = élément de lien

href = attribut

"https://www.exemple.com" = valeur de l'attribut


18. IMBRICATION DES ÉLÉMENTS

Les éléments HTML peuvent être placés à l'intérieur d'autres éléments.

Exemple :

<section>
    <h2>Présentation</h2>
    <p>Bienvenue sur mon site.</p>
</section>

L'organisation doit respecter correctement l'ordre
d'ouverture et de fermeture des éléments.


19. DOCUMENT HTML VALIDE ET PROPRE

Un document HTML doit être organisé de manière claire.

Il faut notamment :

- utiliser une structure HTML correcte ;
- respecter l'imbrication ;
- fermer les éléments qui doivent l'être ;
- utiliser des attributs appropriés ;
- éviter les répétitions inutiles ;
- utiliser des noms de fichiers clairs ;
- organiser correctement les ressources.


20. ACCESSIBILITÉ WEB

Une page Web doit être conçue pour être utilisable par
le plus grand nombre de personnes possible.

Quelques bonnes pratiques :

- utiliser une structure sémantique ;
- fournir un texte alternatif aux images importantes ;
- associer correctement les labels aux champs de formulaire ;
- utiliser des titres dans un ordre logique ;
- conserver une bonne lisibilité ;
- ne pas dépendre uniquement de la couleur ;
- rendre les commandes utilisables au clavier lorsque nécessaire.

L'accessibilité est une partie importante de la conception Web.


21. RESPONSIVE WEB DESIGN

Une page Web responsive s'adapte aux différentes tailles d'écran.

Elle peut être consultée sur :

- smartphone ;
- tablette ;
- ordinateur portable ;
- ordinateur de bureau.

Le CSS permet notamment d'utiliser :

- unités relatives ;
- flexbox ;
- grid ;
- media queries ;
- dimensions adaptatives.

Un développeur Web doit penser aux appareils mobiles dès
la conception de l'interface.


22. OUTILS DU DÉVELOPPEUR

Les navigateurs modernes disposent d'outils permettant
d'analyser une page Web.

On peut notamment examiner :

- HTML ;
- CSS ;
- JavaScript ;
- console ;
- réseau ;
- stockage ;
- performances.

La console permet également d'identifier certaines erreurs
JavaScript.


23. ERREURS COURANTES DU DÉBUTANT

Quelques erreurs fréquentes :

- oublier une balise ;
- mal fermer une balise ;
- utiliser un mauvais chemin de fichier ;
- oublier une image ;
- utiliser un mauvais nom de fichier ;
- créer des identifiants HTML en double ;
- écrire du CSS incorrect ;
- créer une erreur JavaScript ;
- oublier de sauvegarder les modifications ;
- tester uniquement sur un seul type d'écran.

Le développeur doit apprendre à observer les erreurs et à les
corriger méthodiquement.


24. LES ÉTAPES DE CRÉATION D'UNE PAGE WEB

Une méthode simple :

1. définir l'objectif de la page ;
2. préparer la structure HTML ;
3. ajouter le contenu ;
4. organiser les sections ;
5. créer le CSS ;
6. ajouter JavaScript si nécessaire ;
7. tester dans le navigateur ;
8. corriger les erreurs ;
9. vérifier l'affichage mobile ;
10. améliorer l'accessibilité ;
11. tester les interactions ;
12. finaliser le projet.


25. HTML, CSS ET JAVASCRIPT TRAVAILLENT ENSEMBLE

Exemple conceptuel :

HTML :

<button id="monBouton">
    Cliquer
</button>

CSS :

#monBouton {
    padding: 10px;
}

JavaScript :

document
    .getElementById("monBouton")
    .addEventListener("click", function () {
        alert("Bouton activé !");
    });

HTML crée le bouton.

CSS définit son apparence.

JavaScript définit son comportement.


26. PREMIÈRE VISION DU MÉTIER DE DÉVELOPPEUR WEB

Le développement Web ne consiste pas seulement à écrire du code.

Le développeur doit également :

- analyser un besoin ;
- concevoir une solution ;
- organiser un projet ;
- écrire du code ;
- tester ;
- rechercher les erreurs ;
- corriger ;
- améliorer ;
- sécuriser ;
- documenter ;
- maintenir le projet.

La programmation est donc une partie d'un processus plus large
de conception informatique.


27. RÈGLE FONDAMENTALE DU CHAPITRE A

Avant de vouloir créer une application Web complexe, il faut
comprendre les bases :

Web
↓
Navigateur
↓
HTML
↓
CSS
↓
JavaScript
↓
Interaction
↓
Application Web

Cette base permet ensuite d'étudier les balises HTML en profondeur
dans le Chapitre B, puis les autres technologies Web dans les
chapitres suivants.`,

    pratique:
`TRAVAUX PRATIQUES — CHAPITRE A

TP 1 — Découvrir une page Web

1. Ouvrir un navigateur Web.
2. Créer un nouveau fichier nommé index.html.
3. Écrire une structure HTML5 minimale.
4. Ajouter un titre principal.
5. Ajouter un paragraphe.
6. Enregistrer le fichier.
7. Ouvrir la page dans le navigateur.

Objectif :
Comprendre la relation entre un fichier HTML et son affichage
dans le navigateur.


TP 2 — Première structure HTML

Créer une page contenant :

- DOCTYPE ;
- html ;
- head ;
- title ;
- body ;
- h1 ;
- p.

Objectif :
Comprendre la structure générale d'un document HTML.


TP 3 — Découvrir CSS

1. Créer une page HTML.
2. Ajouter un fichier style.css.
3. Relier le fichier CSS à la page.
4. Modifier la couleur du titre.
5. Modifier la taille du texte.
6. Ajouter une marge.

Objectif :
Comprendre la séparation entre structure et présentation.


TP 4 — Découvrir JavaScript

1. Créer un bouton HTML.
2. Ajouter JavaScript.
3. Détecter le clic.
4. Afficher un message.
5. Modifier ensuite le texte d'un élément.

Objectif :
Comprendre le principe de l'interactivité.


TP 5 — Organiser un projet

Créer cette organisation :

mon-premier-site/
│
├── index.html
├── about.html
├── contact.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── images/

Créer les trois pages HTML et relier correctement
les fichiers CSS et JavaScript.


TP 6 — Navigation

Créer des liens permettant de passer :

index.html
→ about.html
→ contact.html
→ index.html

Ajouter également un lien externe.


TP 7 — Page responsive

Créer une page simple contenant :

- titre ;
- texte ;
- image ;
- bouton.

Utiliser CSS pour que la page reste lisible
sur smartphone et ordinateur.


TP 8 — Analyse

Ouvrir les outils de développement du navigateur.

Observer :

- HTML ;
- CSS ;
- console ;
- réseau.

Identifier une erreur volontairement créée dans le code,
puis la corriger.


TP 9 — Mini-projet

Créer une petite page Web personnelle comprenant :

- nom du projet ;
- titre ;
- présentation ;
- image ;
- lien ;
- bouton ;
- CSS ;
- JavaScript.

Objectif :
Réunir les trois technologies fondamentales.


TP 10 — Première application Web

Créer une petite interface interactive contenant :

- un titre ;
- une zone de texte ;
- un bouton ;
- une zone de résultat.

Lorsque l'utilisateur clique sur le bouton,
JavaScript doit modifier le résultat.

Objectif :
Comprendre le passage d'une simple page Web
vers une interface interactive.`,

    exercices: [
        "Expliquer avec ses propres mots ce qu'est le Web.",
        "Expliquer la différence entre Internet et le Web.",
        "Donner la définition de HTML.",
        "Donner la définition de CSS.",
        "Donner la définition de JavaScript.",
        "Expliquer le rôle du navigateur Web.",
        "Citer cinq navigateurs Web.",
        "Expliquer ce qu'est un serveur Web.",
        "Expliquer ce qu'est un client dans une architecture Web.",
        "Expliquer la différence entre front-end et back-end.",
        "Donner la signification de WWW.",
        "Donner la signification de HTML.",
        "Donner la signification de CSS.",
        "Donner la signification de URL.",
        "Donner la signification de HTTP.",
        "Donner la signification de HTTPS.",
        "Expliquer pourquoi HTTPS est utilisé.",
        "Créer un fichier index.html.",
        "Créer la structure HTML5 minimale d'une page.",
        "Ajouter un titre dans une page HTML.",
        "Ajouter trois paragraphes.",
        "Créer un lien HTML.",
        "Créer un lien vers une autre page du même projet.",
        "Créer un lien vers un site externe.",
        "Créer un dossier images.",
        "Ajouter une image dans un projet Web.",
        "Créer un fichier CSS externe.",
        "Relier un fichier CSS à une page HTML.",
        "Modifier la couleur d'un titre avec CSS.",
        "Modifier la taille d'un texte avec CSS.",
        "Créer un fichier JavaScript externe.",
        "Relier JavaScript à une page HTML.",
        "Créer un bouton HTML.",
        "Détecter un clic sur un bouton avec JavaScript.",
        "Afficher un message après un clic.",
        "Modifier le contenu d'un élément avec JavaScript.",
        "Expliquer la différence entre HTML, CSS et JavaScript.",
        "Expliquer ce qu'est une URL.",
        "Identifier le protocole dans une URL.",
        "Identifier le domaine dans une URL.",
        "Expliquer la différence entre chemin relatif et chemin absolu.",
        "Créer une organisation simple de projet Web.",
        "Expliquer pourquoi il faut organiser les fichiers d'un projet.",
        "Expliquer ce qu'est une page Web responsive.",
        "Citer trois appareils pouvant afficher une page responsive.",
        "Expliquer pourquoi l'accessibilité est importante.",
        "Identifier une erreur HTML dans une structure simple.",
        "Identifier une erreur de chemin vers une image.",
        "Identifier une erreur CSS simple.",
        "Identifier une erreur JavaScript simple.",
        "Créer une petite page utilisant HTML, CSS et JavaScript."
    ],

    devoirs:
`DEVOIR — PREMIER PROJET WEB

Créer un mini-site Web complet en utilisant les connaissances
du Chapitre A.

Le projet doit contenir au minimum :

1. Une page index.html servant de page d'accueil.

2. Une deuxième page HTML.

3. Une troisième page HTML.

4. Une navigation permettant de passer d'une page à l'autre.

5. Des titres et des paragraphes.

6. Au moins une image correctement intégrée.

7. Un fichier CSS externe.

8. Un fichier JavaScript externe.

9. Au moins un bouton interactif.

10. Une action JavaScript déclenchée par l'utilisateur.

11. Une organisation claire des fichiers.

Organisation recommandée :

mon-premier-site/
│
├── index.html
├── about.html
├── contact.html
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js
│
└── images/

CONTRAINTES

Le projet doit :

- utiliser une structure HTML correcte ;
- utiliser HTML pour la structure ;
- utiliser CSS pour la présentation ;
- utiliser JavaScript pour l'interactivité ;
- contenir une navigation fonctionnelle ;
- utiliser des chemins de fichiers corrects ;
- être lisible sur smartphone ;
- être lisible sur ordinateur ;
- ne pas contenir de liens cassés ;
- ne pas contenir d'erreurs JavaScript visibles dans la console ;
- utiliser des noms de fichiers clairs ;
- respecter une organisation propre du projet.

PARTIE ÉCRITE

L'étudiant doit également expliquer :

1. Qu'est-ce que le Web ?
2. Quelle est la différence entre Internet et le Web ?
3. Quel est le rôle de HTML ?
4. Quel est le rôle de CSS ?
5. Quel est le rôle de JavaScript ?
6. Quel est le rôle du navigateur ?
7. Qu'est-ce qu'une URL ?
8. Quelle est la différence entre HTTP et HTTPS ?
9. Quelle est la différence entre front-end et back-end ?
10. Pourquoi faut-il organiser correctement un projet Web ?

OBJECTIF FINAL

À la fin de ce devoir, l'étudiant doit être capable de
comprendre le fonctionnement général d'un projet Web et de
construire une première petite réalisation utilisant
HTML, CSS et JavaScript.

Le Chapitre B permettra ensuite d'étudier beaucoup plus
profondément les balises HTML et leur utilisation.`
},





{
    id: "B",

    title:
        "B — Balises HTML et construction d'une page Web",

    theorie:
`Une balise HTML (HTML tag) est un élément utilisé pour
décrire la structure, le contenu et le rôle d'une partie
d'une page Web.

HTML signifie HyperText Markup Language. HTML ne sert pas
principalement à décorer une page : il sert à organiser
et à donner une structure sémantique au contenu.

Une balise peut généralement être écrite avec une balise
ouvrante et une balise fermante :

<p>Mon paragraphe</p>

Certaines balises sont des éléments vides (void elements)
et ne possèdent pas de balise fermante, par exemple :

<img>
<br>
<hr>
<input>
<meta>
<link>

Un élément HTML peut également recevoir des attributs
(HTML attributes) qui donnent des informations
supplémentaires :

<a href="https://example.com">Visiter</a>

Ici, a est la balise, href est l'attribut et
"https://example.com" est sa valeur.

============================================================
1 — STRUCTURE GÉNÉRALE D'UN DOCUMENT HTML
============================================================

Un document HTML5 complet peut utiliser :

<!DOCTYPE html>
<html>
<head>
    <title>Ma page</title>
</head>
<body>
    Contenu de la page
</body>
</html>

<!DOCTYPE html> est une déclaration indiquant au navigateur
qu'il doit interpréter le document comme HTML moderne.

<html> est l'élément racine du document.

<head> contient les informations du document qui ne sont pas
normalement affichées comme contenu principal.

<title> définit le titre du document affiché notamment dans
l'onglet du navigateur.

<body> contient le contenu principal visible de la page.

Dans <head>, on peut notamment rencontrer :

<meta> pour les métadonnées.

<link> pour établir une relation avec une ressource externe,
par exemple une feuille CSS.

<style> pour placer du CSS directement dans le document HTML.

<script> pour placer ou charger du JavaScript.

<base> permet de définir une URL de base pour les URL
relatives du document.

<noscript> permet de fournir un contenu lorsque JavaScript
n'est pas disponible ou désactivé.

Exemple :

<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <base href="./">

    <title>Mon site Web</title>

    <link rel="stylesheet" href="style.css">

    <style>
        body {
            margin: 0;
        }
    </style>

    <script src="script.js" defer></script>
</head>

============================================================
2 — TITRES ET TEXTE
============================================================

Les titres utilisent h1 à h6 :

<h1>Titre principal</h1>
<h2>Titre de section</h2>
<h3>Sous-section</h3>
<h4>Titre de niveau 4</h4>
<h5>Titre de niveau 5</h5>
<h6>Titre de niveau 6</h6>

<p> permet de créer un paragraphe.

<br> effectue un retour à la ligne.

<hr> représente une séparation thématique.

<pre> conserve les espaces et les retours à la ligne du texte.

<blockquote> représente une citation longue.

Exemple :

<p>Voici un paragraphe.</p>

<p>
    Première ligne<br>
    Deuxième ligne
</p>

<hr>

<blockquote>
    Ceci est une citation.
</blockquote>

<pre>
Texte
    avec
        des espaces conservés
</pre>

============================================================
3 — FORMATAGE ET IMPORTANCE DU TEXTE
============================================================

<strong> indique une importance forte.

<b> attire l'attention sur du texte sans lui donner
nécessairement une importance sémantique forte.

<em> indique une emphase.

<i> représente un texte dans une voix ou un registre différent,
par exemple un terme technique ou étranger selon le contexte.

<u> représente un texte souligné ou annoté.

<mark> met en évidence une partie du texte.

<small> représente un texte secondaire ou de petite importance.

<del> représente du contenu supprimé.

<ins> représente du contenu ajouté.

<sub> permet d'écrire un indice.

<sup> permet d'écrire un exposant.

<s> représente du contenu qui n'est plus pertinent ou exact.

Exemple :

<p>
    <strong>Important</strong> :
    respecter la structure HTML.
</p>

<p>
    <em>HTML</em> est un langage de balisage.
</p>

<p>
    H<sub>2</sub>O
</p>

<p>
    x<sup>2</sup>
</p>

<p>
    <del>Ancienne information</del>
    <ins>Nouvelle information</ins>
</p>

<p>
    <mark>Information importante</mark>
</p>

============================================================
4 — INFORMATIONS ET ÉLÉMENTS SÉMANTIQUES
============================================================

<abbr> représente une abréviation.

<cite> représente le titre d'une œuvre ou une référence
créative.

<q> représente une courte citation.

<dfn> représente le terme défini.

<address> représente des informations de contact.

<time> représente une date ou une heure.

<data> associe une valeur lisible par une machine à un contenu.

Exemple :

<p>
    <abbr title="HyperText Markup Language">
        HTML
    </abbr>
</p>

<p>
    <dfn>HTML</dfn> est un langage de balisage.
</p>

<p>
    Il a écrit <cite>Mon premier livre Web</cite>.
</p>

<p>
    Il a déclaré :
    <q>Le Web commence par une bonne structure.</q>
</p>

<address>
    FOBAS<br>
    Haïti
</address>

<time datetime="2026-09-27">
    27 septembre 2026
</time>

<data value="100">
    Produit 100
</data>

============================================================
5 — CODE ET INFORMATIONS TECHNIQUES
============================================================

<code> représente un fragment de code informatique.

<kbd> représente une entrée effectuée par l'utilisateur,
comme une touche du clavier.

<samp> représente une sortie produite par un programme.

<var> représente une variable.

Exemple :

<p>
    Utilisez <code>document.querySelector()</code>.
</p>

<p>
    Appuyez sur <kbd>Ctrl</kbd> + <kbd>S</kbd>.
</p>

<p>
    Résultat :
    <samp>Fichier enregistré</samp>
</p>

<p>
    La variable <var>nom</var> contient le nom de l'utilisateur.
</p>

============================================================
6 — LIENS ET NAVIGATION
============================================================

<a> crée un lien hypertexte.

L'attribut href indique la destination.

Exemple :

<a href="about.html">
    À propos
</a>

Un lien peut pointer vers :

une autre page :

<a href="contact.html">Contact</a>

une section de la même page :

<a href="#services">Services</a>

un site externe :

<a href="https://example.com">
    Site externe
</a>

une adresse électronique :

<a href="mailto:contact@example.com">
    Envoyer un email
</a>

un numéro de téléphone :

<a href="tel:+50900000000">
    Appeler
</a>

L'attribut target peut contrôler la cible du lien :

<a href="https://example.com"
   target="_blank">
    Ouvrir le site
</a>

L'attribut download peut demander le téléchargement
d'une ressource lorsque cela est applicable :

<a href="document.pdf" download>
    Télécharger le document
</a>

<nav> représente une zone de navigation.

Exemple :

<nav>
    <a href="index.html">Accueil</a>
    <a href="about.html">À propos</a>
    <a href="services.html">Services</a>
    <a href="contact.html">Contact</a>
</nav>

============================================================
7 — IMAGES
============================================================

<img> permet d'afficher une image.

Les attributs importants comprennent :

src : source de l'image.

alt : texte alternatif.

width : largeur.

height : hauteur.

loading : stratégie de chargement.

Exemple :

<img
    src="photo.jpg"
    alt="Photo de présentation"
    width="400"
    height="300"
    loading="lazy"
>

L'attribut alt est particulièrement important pour
l'accessibilité et lorsque l'image ne peut pas être affichée.

<figure> représente une illustration ou un contenu référencé.

<figcaption> fournit sa légende.

Exemple :

<figure>
    <img
        src="ordinateur.jpg"
        alt="Ordinateur portable"
    >

    <figcaption>
        Ordinateur utilisé pour la programmation Web.
    </figcaption>
</figure>

<picture> permet de proposer différentes sources d'image.

Exemple :

<picture>
    <source
        media="(max-width: 600px)"
        srcset="mobile.jpg"
    >

    <img
        src="desktop.jpg"
        alt="Illustration responsive"
    >
</picture>

============================================================
8 — LISTES
============================================================

<ul> représente une liste non ordonnée.

<ol> représente une liste ordonnée.

<li> représente un élément de liste.

Exemple :

<ul>
    <li>HTML</li>
    <li>CSS</li>
    <li>JavaScript</li>
</ul>

<ol>
    <li>Créer le fichier HTML.</li>
    <li>Ajouter le CSS.</li>
    <li>Ajouter JavaScript.</li>
</ol>

Les listes de définitions utilisent :

<dl> : liste de définitions.

<dt> : terme.

<dd> : description.

Exemple :

<dl>
    <dt>HTML</dt>
    <dd>Structure d'une page Web.</dd>

    <dt>CSS</dt>
    <dd>Présentation d'une page Web.</dd>

    <dt>JavaScript</dt>
    <dd>Logique et interactivité.</dd>
</dl>

============================================================
9 — CONTENEURS ET STRUCTURE SÉMANTIQUE
============================================================

<div> est un conteneur générique de type bloc.

<span> est un conteneur générique en ligne.

Les éléments sémantiques HTML5 permettent de donner
un rôle plus précis aux différentes parties d'une page.

<header> représente un en-tête.

<main> représente le contenu principal.

<section> représente une section thématique.

<article> représente un contenu autonome.

<aside> représente un contenu complémentaire.

<footer> représente un pied de page ou de section.

Exemple :

<header>
    <h1>Mon site Web</h1>
</header>

<nav>
    <a href="#accueil">Accueil</a>
    <a href="#services">Services</a>
</nav>

<main>

    <section id="accueil">
        <h2>Accueil</h2>
        <p>Bienvenue sur mon site.</p>
    </section>

    <section id="services">

        <article>
            <h3>Service Web</h3>
            <p>Création de sites Web.</p>
        </article>

        <aside>
            <h3>Information</h3>
            <p>Informations complémentaires.</p>
        </aside>

    </section>

</main>

<footer>
    <p>Copyright 2026</p>
</footer>

============================================================
10 — TABLEAUX
============================================================

<table> représente un tableau de données.

<caption> donne un titre au tableau.

<thead> contient l'en-tête.

<tbody> contient les données principales.

<tfoot> contient le pied du tableau.

<tr> représente une ligne.

<th> représente une cellule d'en-tête.

<td> représente une cellule de données.

<colgroup> permet de regrouper des colonnes.

<col> représente une colonne ou une partie de colonne.

Exemple :

<table>

    <caption>
        Liste des étudiants
    </caption>

    <colgroup>
        <col>
        <col>
        <col>
    </colgroup>

    <thead>
        <tr>
            <th>Nom</th>
            <th>Classe</th>
            <th>Note</th>
        </tr>
    </thead>

    <tbody>
        <tr>
            <td>Jean</td>
            <td>NS3</td>
            <td>85</td>
        </tr>

        <tr>
            <td>Marie</td>
            <td>NS3</td>
            <td>90</td>
        </tr>
    </tbody>

    <tfoot>
        <tr>
            <td colspan="2">
                Moyenne
            </td>

            <td>
                87.5
            </td>
        </tr>
    </tfoot>

</table>

colspan permet à une cellule de couvrir plusieurs colonnes.

rowspan permet à une cellule de couvrir plusieurs lignes.

Exemple :

<table>
    <tr>
        <th rowspan="2">
            Étudiant
        </th>

        <th colspan="2">
            Résultats
        </th>
    </tr>

    <tr>
        <th>HTML</th>
        <th>CSS</th>
    </tr>
</table>

============================================================
11 — FORMULAIRES
============================================================

<form> représente un formulaire.

<label> identifie un champ.

<input> permet différentes formes de saisie.

<textarea> permet une saisie multiligne.

<select> crée une liste de sélection.

<option> représente une option.

<optgroup> regroupe des options.

<button> crée un bouton.

<fieldset> regroupe plusieurs champs.

<legend> donne un titre au groupe.

<datalist> fournit des suggestions.

<output> représente un résultat calculé.

<meter> représente une mesure dans une plage connue.

<progress> représente la progression d'une opération.

Exemple :

<form>

    <fieldset>

        <legend>
            Informations personnelles
        </legend>

        <label for="nom">
            Nom
        </label>

        <input
            id="nom"
            name="nom"
            type="text"
            placeholder="Votre nom"
            required
        >

        <label for="email">
            Email
        </label>

        <input
            id="email"
            name="email"
            type="email"
            placeholder="nom@example.com"
            required
        >

        <label for="message">
            Message
        </label>

        <textarea
            id="message"
            name="message"
            rows="5"
            placeholder="Votre message"
        ></textarea>

        <label for="pays">
            Pays
        </label>

        <select
            id="pays"
            name="pays"
        >
            <option value="">
                Choisir
            </option>

            <option value="haiti">
                Haïti
            </option>

            <option value="france">
                France
            </option>
        </select>

        <button type="submit">
            Envoyer
        </button>

    </fieldset>

</form>

============================================================
12 — TYPES DE INPUT
============================================================

<input> peut utiliser plusieurs types de données.

type="text"
pour un texte.

type="password"
pour un mot de passe.

type="email"
pour une adresse email.

type="number"
pour une valeur numérique.

type="tel"
pour un numéro de téléphone.

type="url"
pour une adresse Web.

type="search"
pour une recherche.

type="date"
pour une date.

type="time"
pour une heure.

type="datetime-local"
pour une date et une heure locales.

type="month"
pour un mois.

type="week"
pour une semaine.

type="color"
pour choisir une couleur.

type="file"
pour sélectionner un fichier.

type="checkbox"
pour une case à cocher.

type="radio"
pour choisir une option dans un groupe.

type="range"
pour une valeur dans une plage.

type="hidden"
pour une donnée non affichée directement.

type="submit"
pour envoyer le formulaire.

type="reset"
pour réinitialiser le formulaire.

type="button"
pour un bouton générique.

Exemple :

<input type="text">

<input type="password">

<input type="email">

<input type="number">

<input type="tel">

<input type="url">

<input type="search">

<input type="date">

<input type="time">

<input type="datetime-local">

<input type="month">

<input type="week">

<input type="color">

<input type="file">

<input type="checkbox">

<input type="radio">

<input type="range">

<input type="hidden">

<input type="submit">

<input type="reset">

<input type="button">

============================================================
13 — ATTRIBUTS DE FORMULAIRE
============================================================

Les attributs courants des formulaires comprennent :

name
value
placeholder
required
disabled
readonly
checked
selected
min
max
step
minlength
maxlength
pattern
autocomplete

Exemple :

<input
    type="text"
    name="nom"
    value=""
    placeholder="Votre nom"
    minlength="2"
    maxlength="50"
    required
    autocomplete="name"
>

<input
    type="number"
    name="age"
    min="1"
    max="100"
    step="1"
>

<input
    type="checkbox"
    name="accepter"
    checked
>

<input
    type="text"
    value="Information fixe"
    readonly
>

<input
    type="text"
    disabled
>

============================================================
14 — AUDIO ET VIDÉO
============================================================

<audio> permet d'intégrer un contenu audio.

<video> permet d'intégrer un contenu vidéo.

<source> définit une source multimédia.

<track> permet notamment d'ajouter des sous-titres
ou d'autres pistes textuelles à une vidéo.

Attributs courants :

controls
autoplay
muted
loop
poster
preload

Exemple audio :

<audio controls>
    <source
        src="audio.mp3"
        type="audio/mpeg"
    >
</audio>

Exemple vidéo :

<video
    controls
    width="640"
    poster="poster.jpg"
    preload="metadata"
>

    <source
        src="video.mp4"
        type="video/mp4"
    >

    <track
        src="subtitles.vtt"
        kind="subtitles"
        srclang="fr"
        label="Français"
    >

</video>

autoplay demande le démarrage automatique lorsque les
conditions du navigateur le permettent.

muted démarre le média sans son.

loop répète le média.

poster définit une image d'aperçu pour une vidéo.

preload indique une préférence de chargement.

============================================================
15 — INTÉGRATION DE CONTENUS EXTERNES
============================================================

<iframe> permet d'intégrer une autre ressource Web
dans la page.

Exemple :

<iframe
    src="https://example.com"
    title="Exemple de contenu Web"
    width="600"
    height="400"
></iframe>

<embed> permet d'intégrer certains contenus externes.

<object> permet également d'intégrer une ressource externe
et peut contenir un contenu de remplacement.

Exemple :

<embed
    src="document.pdf"
    type="application/pdf"
>

<object
    data="document.pdf"
    type="application/pdf"
>
    Document PDF
</object>

============================================================
16 — ÉLÉMENTS INTERACTIFS
============================================================

<details> crée une zone que l'utilisateur peut ouvrir
et fermer.

<summary> définit le titre visible de cette zone.

Exemple :

<details>
    <summary>
        Voir les détails
    </summary>

    <p>
        Voici les informations supplémentaires.
    </p>
</details>

<dialog> représente une boîte de dialogue.

Exemple :

<dialog id="maBoite">
    <p>Bonjour.</p>
</dialog>

Un programme JavaScript peut contrôler l'ouverture
et la fermeture d'une boîte de dialogue.

============================================================
17 — ATTRIBUTS HTML IMPORTANTS
============================================================

id identifie de manière unique un élément dans le document.

class permet de regrouper des éléments.

title fournit une information complémentaire.

name donne un nom à un élément ou à une donnée.

value représente une valeur.

type indique un type.

href indique la destination d'un lien.

src indique la source d'une ressource.

alt fournit un texte alternatif.

Les attributs data-* permettent de stocker des données
personnalisées dans un élément.

Exemple :

<div
    id="profil"
    class="card"
    data-user-id="25"
    title="Profil utilisateur"
>
    <span>
        Utilisateur
    </span>
</div>

Les attributs aria-* sont utilisés pour améliorer
l'accessibilité lorsque cela est nécessaire.

Exemple :

<button
    type="button"
    aria-label="Fermer le menu"
>
    X
</button>

============================================================
18 — CANVAS, SVG ET TEMPLATES
============================================================

<canvas> fournit une surface graphique contrôlée
principalement par JavaScript.

Exemple :

<canvas
    id="graphique"
    width="400"
    height="200"
>
</canvas>

<svg> permet de représenter des graphiques vectoriels.

Exemple :

<svg
    width="200"
    height="100"
    viewBox="0 0 200 100"
>
    <rect
        x="10"
        y="10"
        width="180"
        height="80"
    ></rect>
</svg>

<template> contient un modèle HTML qui n'est pas rendu
immédiatement comme contenu normal.

<slot> est utilisé principalement avec les Web Components
pour définir un point d'insertion de contenu.

============================================================
19 — STRUCTURE D'UNE PAGE WEB COMPLÈTE
============================================================

Une page Web bien organisée peut réunir plusieurs
éléments sémantiques :

<!DOCTYPE html>

<html lang="fr">

<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Mon site Web
    </title>

    <link
        rel="stylesheet"
        href="style.css"
    >

    <script
        src="script.js"
        defer
    ></script>

    <noscript>
        JavaScript est nécessaire pour certaines fonctionnalités.
    </noscript>
</head>

<body>

    <header>

        <h1>
            Mon site Web
        </h1>

        <nav>
            <a href="index.html">
                Accueil
            </a>

            <a href="services.html">
                Services
            </a>

            <a href="contact.html">
                Contact
            </a>
        </nav>

    </header>

    <main>

        <section id="presentation">

            <h2>
                Présentation
            </h2>

            <p>
                Bienvenue sur mon site.
            </p>

        </section>

        <section id="services">

            <h2>
                Services
            </h2>

            <article>

                <h3>
                    Création Web
                </h3>

                <p>
                    Création de pages et applications Web.
                </p>

            </article>

            <aside>

                <h3>
                    Information
                </h3>

                <p>
                    Informations complémentaires.
                </p>

            </aside>

        </section>

    </main>

    <footer>

        <address>
            Haïti
        </address>

        <p>
            <small>
                © 2026
            </small>
        </p>

    </footer>

</body>

</html>

============================================================
20 — RÈGLE IMPORTANTE
============================================================

Une bonne page HTML ne consiste pas simplement à empiler
des balises.

Il faut choisir chaque élément selon son rôle.

Utilisez les titres pour structurer les niveaux de contenu.

Utilisez les paragraphes pour les paragraphes.

Utilisez les liens pour la navigation.

Utilisez les images avec un texte alternatif pertinent.

Utilisez les listes pour les ensembles d'éléments.

Utilisez les tableaux pour les données tabulaires.

Utilisez les formulaires pour collecter des informations.

Utilisez les éléments sémantiques comme header, main,
section, article, aside et footer pour clarifier la structure.

Utilisez les attributs correctement.

Une structure HTML claire facilite ensuite le travail
avec CSS, JavaScript, l'accessibilité, le référencement
et la maintenance du projet.`,

    pratique:
`TRAVAUX PRATIQUES — CONSTRUCTION PROGRESSIVE D'UNE PAGE WEB

Objectif : construire progressivement une vraie page Web
en utilisant les principales balises HTML étudiées.

------------------------------------------------------------
TP 1 — STRUCTURE HTML5
------------------------------------------------------------

Créez un fichier index.html contenant :

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Mon premier site Web
    </title>
</head>

<body>

</body>
</html>

Vérifiez que le document s'exécute correctement dans
le laboratoire.

------------------------------------------------------------
TP 2 — TITRES ET TEXTES
------------------------------------------------------------

Dans <body>, ajoutez :

un h1 ;

deux h2 ;

des paragraphes p ;

un strong ;

un em ;

un mark ;

un texte avec sub ;

un texte avec sup ;

un hr ;

un blocquote ;

un pre.

------------------------------------------------------------
TP 3 — NAVIGATION
------------------------------------------------------------

Créez une navigation avec nav et a.

Ajoutez :

Accueil ;

À propos ;

Services ;

Contact.

Créez également une section possédant un id et créez
un lien interne vers cette section.

Ajoutez un lien externe.

Ajoutez également un lien mailto et un lien tel.

------------------------------------------------------------
TP 4 — IMAGES
------------------------------------------------------------

Ajoutez une image avec :

src ;

alt ;

width ;

height ;

loading.

Ensuite, créez une figure avec figcaption.

Enfin, expérimentez picture avec une source alternative.

------------------------------------------------------------
TP 5 — LISTES
------------------------------------------------------------

Créez :

une liste ul ;

une liste ol ;

une liste de définitions avec dl, dt et dd.

Présentez par exemple cinq compétences Web.

------------------------------------------------------------
TP 6 — STRUCTURE SÉMANTIQUE
------------------------------------------------------------

Construisez :

header ;

nav ;

main ;

section ;

article ;

aside ;

footer.

Organisez les éléments pour créer une page professionnelle.

------------------------------------------------------------
TP 7 — TABLEAU
------------------------------------------------------------

Créez un tableau contenant :

caption ;

colgroup ;

col ;

thead ;

tbody ;

tfoot ;

tr ;

th ;

td.

Utilisez également colspan et rowspan dans un exercice
de mise en forme de données.

------------------------------------------------------------
TP 8 — FORMULAIRE
------------------------------------------------------------

Créez un formulaire contenant :

fieldset ;

legend ;

label ;

input text ;

input email ;

input number ;

input tel ;

textarea ;

select ;

option ;

optgroup ;

button.

Ajoutez les attributs :

name ;

value ;

placeholder ;

required ;

min ;

max ;

step ;

minlength ;

maxlength ;

autocomplete.

Ajoutez également une checkbox et deux boutons radio.

------------------------------------------------------------
TP 9 — MÉDIAS
------------------------------------------------------------

Ajoutez :

un audio avec controls ;

une vidéo avec controls ;

source ;

track.

Testez :

controls ;

muted ;

loop ;

poster ;

preload.

------------------------------------------------------------
TP 10 — ÉLÉMENTS INTERACTIFS
------------------------------------------------------------

Créez :

un details avec summary ;

une dialog.

Utilisez JavaScript si nécessaire pour ouvrir et fermer
la boîte de dialogue.

------------------------------------------------------------
TP 11 — INTÉGRATION
------------------------------------------------------------

Testez :

iframe ;

embed ;

object.

Intégrez une ressource appropriée et observez le résultat
dans le laboratoire.

------------------------------------------------------------
TP 12 — ÉLÉMENTS AVANCÉS
------------------------------------------------------------

Créez :

un canvas ;

un SVG ;

un template.

Identifiez le rôle de chacun.

------------------------------------------------------------
TP FINAL — MINI SITE
------------------------------------------------------------

Construisez une page Web complète contenant au minimum :

header ;

nav ;

main ;

section ;

article ;

aside ;

footer ;

h1 ;

h2 ;

p ;

a ;

img ;

figure ;

figcaption ;

ul ;

ol ;

dl ;

table ;

form ;

audio ;

video.

La page doit être correctement structurée et testée
dans le laboratoire FOBAS.`,

    exercices: [

        "Exercice 1 — Écrire un document HTML5 complet avec <!DOCTYPE html>, html, head, title et body.",

        "Exercice 2 — Créer une page contenant un h1, trois h2 et plusieurs paragraphes p correctement structurés.",

        "Exercice 3 — Utiliser strong, b, em, i, u, mark, small, del, ins, sub, sup et s dans une page de démonstration.",

        "Exercice 4 — Créer un exemple utilisant br, hr, pre et blockquote.",

        "Exercice 5 — Créer une abréviation avec abbr, une citation avec cite et q, une définition avec dfn et une date avec time.",

        "Exercice 6 — Créer un exemple utilisant code, kbd, samp et var pour présenter des informations informatiques.",

        "Exercice 7 — Créer une navigation avec nav et plusieurs liens a vers des pages différentes.",

        "Exercice 8 — Créer un lien interne avec href vers une section possédant un id.",

        "Exercice 9 — Créer un lien externe avec target, un lien mailto et un lien tel.",

        "Exercice 10 — Insérer une image avec src, alt, width, height et loading.",

        "Exercice 11 — Créer une figure contenant img et figcaption.",

        "Exercice 12 — Créer une image responsive avec picture et source.",

        "Exercice 13 — Créer une liste ul contenant cinq compétences Web.",

        "Exercice 14 — Créer une liste ol présentant cinq étapes pour créer une page Web.",

        "Exercice 15 — Créer une liste de définitions avec dl, dt et dd pour expliquer HTML, CSS et JavaScript.",

        "Exercice 16 — Construire une page utilisant header, nav, main, section, article, aside et footer.",

        "Exercice 17 — Créer un tableau avec table, caption, thead, tbody, tfoot, tr, th et td.",

        "Exercice 18 — Ajouter colgroup et col dans un tableau et expliquer leur rôle.",

        "Exercice 19 — Utiliser colspan et rowspan dans un tableau.",

        "Exercice 20 — Créer un formulaire avec form, label, input et button.",

        "Exercice 21 — Créer des champs input de type text, password, email, number, tel, url et search.",

        "Exercice 22 — Créer des champs input de type date, time, datetime-local, month, week et color.",

        "Exercice 23 — Créer des champs input de type file, checkbox, radio, range et hidden.",

        "Exercice 24 — Créer des boutons submit, reset et button.",

        "Exercice 25 — Créer un formulaire utilisant textarea, select, option et optgroup.",

        "Exercice 26 — Ajouter fieldset et legend pour organiser un formulaire.",

        "Exercice 27 — Ajouter datalist et proposer plusieurs suggestions à l'utilisateur.",

        "Exercice 28 — Créer un output pour afficher un résultat calculé.",

        "Exercice 29 — Créer une progress et une meter et expliquer la différence entre les deux.",

        "Exercice 30 — Utiliser les attributs name, value, placeholder, required, disabled et readonly.",

        "Exercice 31 — Utiliser checked, selected, min, max et step.",

        "Exercice 32 — Utiliser minlength, maxlength, pattern et autocomplete.",

        "Exercice 33 — Créer un lecteur audio avec audio et source.",

        "Exercice 34 — Créer un lecteur vidéo avec video et source.",

        "Exercice 35 — Ajouter track à une vidéo pour fournir une piste de sous-titres.",

        "Exercice 36 — Tester controls, autoplay, muted, loop, poster et preload.",

        "Exercice 37 — Intégrer une ressource avec iframe.",

        "Exercice 38 — Tester embed et object avec une ressource appropriée.",

        "Exercice 39 — Créer details et summary pour afficher du contenu dépliable.",

        "Exercice 40 — Créer une dialog et préparer son ouverture avec JavaScript.",

        "Exercice 41 — Créer un canvas avec une largeur et une hauteur définies.",

        "Exercice 42 — Créer un SVG contenant une forme vectorielle simple.",

        "Exercice 43 — Créer un template HTML et expliquer pourquoi son contenu n'est pas rendu immédiatement.",

        "Exercice 44 — Identifier les rôles de id, class, data-* et aria-* dans une page HTML.",

        "Exercice 45 — Construire une page complète réunissant structure, texte, navigation, image, listes, tableau, formulaire et multimédia.",

        "Exercice 46 — Vérifier la structure d'une page HTML et corriger les erreurs de fermeture ou d'imbrication des balises.",

        "Exercice 47 — Créer un mini-site composé de plusieurs pages HTML reliées par une navigation.",

        "Exercice 48 — Créer une page professionnelle de présentation personnelle utilisant les balises HTML étudiées.",

        "Exercice 49 — Tester la page dans le laboratoire FOBAS et vérifier que les éléments HTML sont correctement affichés.",

        "Exercice 50 — Expliquer oralement le rôle de dix balises HTML choisies parmi celles étudiées dans ce chapitre."
    ],

    devoirs:
`DEVOIR — CRÉATION D'UN MINI SITE WEB COMPLET

Construisez un mini-site Web professionnel en utilisant
les balises HTML étudiées dans le Chapitre B.

Le projet doit contenir au minimum les fichiers :

index.html
about.html
services.html
contact.html

------------------------------------------------------------
1 — PAGE D'ACCUEIL
------------------------------------------------------------

index.html doit contenir :

DOCTYPE ;

html ;

head ;

meta ;

title ;

link ;

header ;

nav ;

main ;

section ;

article ;

aside ;

footer.

------------------------------------------------------------
2 — CONTENU TEXTUEL
------------------------------------------------------------

Utilisez correctement :

h1 à h6 ;

p ;

br ;

hr ;

pre ;

blockquote ;

strong ;

b ;

em ;

i ;

u ;

mark ;

small ;

del ;

ins ;

sub ;

sup ;

s.

Ajoutez également des exemples avec :

abbr ;

cite ;

q ;

dfn ;

time ;

address ;

data ;

code ;

kbd ;

samp ;

var.

------------------------------------------------------------
3 — NAVIGATION
------------------------------------------------------------

Les quatre pages doivent être reliées par une navigation.

Utilisez :

a ;

nav ;

href.

Ajoutez au moins :

un lien interne ;

un lien externe ;

un lien email ;

un lien téléphonique.

------------------------------------------------------------
4 — IMAGES
------------------------------------------------------------

Ajoutez au moins :

une image avec img ;

un texte alt pertinent ;

une figure avec figcaption ;

une démonstration de picture et source.

------------------------------------------------------------
5 — LISTES
------------------------------------------------------------

Ajoutez :

une liste ul ;

une liste ol ;

une liste dl avec dt et dd.

------------------------------------------------------------
6 — TABLEAU
------------------------------------------------------------

Créez un tableau contenant :

caption ;

colgroup ;

col ;

thead ;

tbody ;

tfoot ;

tr ;

th ;

td.

Le tableau doit utiliser au moins une fois :

colspan ;

rowspan.

------------------------------------------------------------
7 — FORMULAIRE
------------------------------------------------------------

La page contact.html doit contenir un formulaire utilisant :

form ;

label ;

input ;

textarea ;

button ;

select ;

option ;

optgroup ;

fieldset ;

legend.

Ajoutez plusieurs types de input :

text ;

password ;

email ;

number ;

tel ;

url ;

search ;

date ;

time ;

datetime-local ;

month ;

week ;

color ;

file ;

checkbox ;

radio ;

range ;

hidden ;

submit ;

reset ;

button.

Utilisez également :

name ;

value ;

placeholder ;

required ;

disabled ;

readonly ;

checked ;

selected ;

min ;

max ;

step ;

minlength ;

maxlength ;

pattern ;

autocomplete.

Ajoutez également :

datalist ;

output ;

meter ;

progress.

------------------------------------------------------------
8 — AUDIO ET VIDÉO
------------------------------------------------------------

Ajoutez au moins :

audio ;

video ;

source ;

track.

Testez les attributs :

controls ;

muted ;

loop ;

poster ;

preload.

------------------------------------------------------------
9 — INTÉGRATION ET INTERACTIVITÉ
------------------------------------------------------------

Ajoutez une démonstration avec :

iframe ;

embed ;

object ;

details ;

summary ;

dialog.

------------------------------------------------------------
10 — ÉLÉMENTS GRAPHIQUES ET AVANCÉS
------------------------------------------------------------

Ajoutez une démonstration de :

canvas ;

svg ;

template.

------------------------------------------------------------
11 — ATTRIBUTS
------------------------------------------------------------

Utilisez correctement :

id ;

class ;

data-* ;

aria-*.

Chaque id utilisé pour identifier un élément dans une page
doit être choisi avec soin.

------------------------------------------------------------
12 — ORGANISATION
------------------------------------------------------------

Le projet doit être proprement indenté.

Les balises doivent être correctement imbriquées.

Les balises doivent être correctement fermées lorsqu'elles
nécessitent une fermeture.

Les images doivent posséder un alt pertinent.

Les liens doivent avoir une destination appropriée.

Les champs de formulaire doivent être associés à leurs labels.

------------------------------------------------------------
13 — TEST FINAL
------------------------------------------------------------

Ouvrez le projet dans le Laboratoire FOBAS.

Testez toutes les pages.

Testez tous les liens.

Testez le formulaire.

Testez les images.

Testez l'audio et la vidéo.

Testez les éléments interactifs.

Vérifiez qu'aucune erreur HTML évidente ne bloque
l'affichage de la page.

------------------------------------------------------------
OBJECTIF FINAL
------------------------------------------------------------

À la fin du devoir, l'étudiant doit être capable de construire
une structure HTML complète, organisée et sémantique, puis de
la préparer pour son intégration avec CSS et JavaScript.`
},







{
    id: "C",

    title:
        "C — CSS, mise en forme, mise en page et Responsive Design",

    theorie:
`CSS — CASCADING STYLE SHEETS

CSS est le langage utilisé pour définir la présentation,
l'apparence, la mise en page et le comportement visuel
des documents HTML.

Dans le Chapitre B, nous avons appris à construire la
structure d'une page avec HTML.

Dans ce Chapitre C, nous allons apprendre à transformer
cette structure en une véritable interface Web organisée,
lisible, responsive et professionnelle.

HTML = STRUCTURE
CSS  = PRÉSENTATION
JavaScript = COMPORTEMENT ET INTERACTIVITÉ


============================================================
ILLUSTRATION VISUELLE — HTML + CSS + LAYOUT
============================================================

<div style="
    width:100%;
    margin:25px auto;
    padding:20px;
    border-radius:20px;
    background:linear-gradient(145deg,#111827,#1e293b,#334155);
    box-shadow:0 20px 45px rgba(0,0,0,.35);
    overflow:hidden;
">

    <svg
        viewBox="0 0 1000 720"
        width="100%"
        role="img"
        aria-label="Illustration 3D de la structure HTML et de sa mise en forme CSS"
        style="
            display:block;
            width:100%;
            height:auto;
            min-height:520px;
        "
    >

        <defs>

            <linearGradient id="cBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#0f172a"/>
                <stop offset="55%" stop-color="#1e3a8a"/>
                <stop offset="100%" stop-color="#312e81"/>
            </linearGradient>

            <linearGradient id="cHtml" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#f97316"/>
                <stop offset="100%" stop-color="#dc2626"/>
            </linearGradient>

            <linearGradient id="cCss" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#38bdf8"/>
                <stop offset="100%" stop-color="#2563eb"/>
            </linearGradient>

            <linearGradient id="cBox" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#22c55e"/>
                <stop offset="100%" stop-color="#15803d"/>
            </linearGradient>

            <linearGradient id="cLayout" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#a855f7"/>
                <stop offset="100%" stop-color="#7e22ce"/>
            </linearGradient>

            <filter id="cShadow">
                <feDropShadow
                    dx="0"
                    dy="14"
                    stdDeviation="12"
                    flood-opacity=".38"
                />
            </filter>

            <filter id="cGlow">
                <feGaussianBlur
                    stdDeviation="8"
                    result="blur"
                />
            </filter>

        </defs>

        <rect
            x="0"
            y="0"
            width="1000"
            height="720"
            rx="35"
            fill="url(#cBg)"
        />

        <ellipse
            cx="500"
            cy="630"
            rx="350"
            ry="45"
            fill="#000000"
            opacity=".35"
            filter="url(#cGlow)"
        />

        <text
            x="500"
            y="62"
            text-anchor="middle"
            fill="#ffffff"
            font-size="32"
            font-weight="700"
            font-family="Arial, sans-serif"
        >
            HTML + CSS = PAGE WEB
        </text>

        <text
            x="500"
            y="94"
            text-anchor="middle"
            fill="#cbd5e1"
            font-size="17"
            font-family="Arial, sans-serif"
        >
            Structure • Style • Layout • Responsive Design
        </text>


        <!-- HTML CARD -->

        <g filter="url(#cShadow)">

            <polygon
                points="105,175 270,135 355,185 190,225"
                fill="#fb923c"
            />

            <polygon
                points="105,175 190,225 190,375 105,325"
                fill="#c2410c"
            />

            <polygon
                points="190,225 355,185 355,335 190,375"
                fill="url(#cHtml)"
            />

            <text
                x="270"
                y="255"
                text-anchor="middle"
                fill="#ffffff"
                font-size="25"
                font-weight="700"
                font-family="Arial, sans-serif"
            >
                HTML
            </text>

            <text
                x="270"
                y="286"
                text-anchor="middle"
                fill="#fee2e2"
                font-size="17"
                font-family="Arial, sans-serif"
            >
                STRUCTURE
            </text>

            <text
                x="270"
                y="315"
                text-anchor="middle"
                fill="#ffffff"
                font-size="14"
                font-family="monospace"
            >
                header • main • section
            </text>

        </g>


        <!-- CSS CARD -->

        <g filter="url(#cShadow)">

            <polygon
                points="645,185 810,145 895,195 730,235"
                fill="#60a5fa"
            />

            <polygon
                points="645,185 730,235 730,385 645,335"
                fill="#1d4ed8"
            />

            <polygon
                points="730,235 895,195 895,345 730,385"
                fill="url(#cCss)"
            />

            <text
                x="810"
                y="265"
                text-anchor="middle"
                fill="#ffffff"
                font-size="25"
                font-weight="700"
                font-family="Arial, sans-serif"
            >
                CSS
            </text>

            <text
                x="810"
                y="296"
                text-anchor="middle"
                fill="#dbeafe"
                font-size="17"
                font-family="Arial, sans-serif"
            >
                PRÉSENTATION
            </text>

            <text
                x="810"
                y="325"
                text-anchor="middle"
                fill="#ffffff"
                font-size="14"
                font-family="monospace"
            >
                color • spacing • layout
            </text>

        </g>


        <!-- CENTER PAGE / BOX MODEL -->

        <g filter="url(#cShadow)">

            <polygon
                points="335,335 565,285 665,340 435,390"
                fill="#86efac"
            />

            <polygon
                points="335,335 435,390 435,550 335,495"
                fill="#15803d"
            />

            <polygon
                points="435,390 665,340 665,500 435,550"
                fill="url(#cBox)"
            />

            <text
                x="550"
                y="405"
                text-anchor="middle"
                fill="#ffffff"
                font-size="23"
                font-weight="700"
                font-family="Arial, sans-serif"
            >
                BOX MODEL
            </text>

            <text
                x="550"
                y="434"
                text-anchor="middle"
                fill="#dcfce7"
                font-size="15"
                font-family="Arial, sans-serif"
            >
                margin • border • padding • content
            </text>

            <rect
                x="480"
                y="458"
                width="115"
                height="55"
                rx="8"
                fill="#ffffff"
                opacity=".92"
            />

            <text
                x="537"
                y="492"
                text-anchor="middle"
                fill="#166534"
                font-size="14"
                font-weight="700"
                font-family="Arial, sans-serif"
            >
                CONTENT
            </text>

        </g>


        <!-- LAYOUT -->

        <g filter="url(#cShadow)">

            <polygon
                points="180,500 350,465 435,515 265,550"
                fill="#c084fc"
            />

            <polygon
                points="180,500 265,550 265,625 180,575"
                fill="#6b21a8"
            />

            <polygon
                points="265,550 435,515 435,590 265,625"
                fill="url(#cLayout)"
            />

            <text
                x="350"
                y="555"
                text-anchor="middle"
                fill="#ffffff"
                font-size="19"
                font-weight="700"
                font-family="Arial, sans-serif"
            >
                FLEX / GRID
            </text>

            <text
                x="350"
                y="580"
                text-anchor="middle"
                fill="#f3e8ff"
                font-size="14"
                font-family="Arial, sans-serif"
            >
                LAYOUT
            </text>

        </g>


        <!-- RESPONSIVE -->

        <g filter="url(#cShadow)">

            <rect
                x="610"
                y="470"
                width="145"
                height="105"
                rx="15"
                fill="#0f172a"
                stroke="#38bdf8"
                stroke-width="5"
            />

            <rect
                x="630"
                y="490"
                width="105"
                height="65"
                rx="7"
                fill="#172554"
            />

            <circle
                cx="682"
                cy="565"
                r="4"
                fill="#38bdf8"
            />

            <text
                x="682"
                y="600"
                text-anchor="middle"
                fill="#ffffff"
                font-size="19"
                font-weight="700"
                font-family="Arial, sans-serif"
            >
                RESPONSIVE
            </text>

            <text
                x="682"
                y="624"
                text-anchor="middle"
                fill="#bae6fd"
                font-size="13"
                font-family="Arial, sans-serif"
            >
                Mobile • Tablet • Desktop
            </text>

        </g>


        <!-- CONNECTORS -->

        <path
            d="M355 260 C430 220 560 220 645 270"
            fill="none"
            stroke="#ffffff"
            stroke-width="4"
            stroke-dasharray="10 8"
            opacity=".8"
        />

        <path
            d="M500 350 C500 300 500 260 500 220"
            fill="none"
            stroke="#ffffff"
            stroke-width="3"
            stroke-dasharray="8 8"
            opacity=".6"
        />

        <path
            d="M435 520 C500 500 560 500 610 520"
            fill="none"
            stroke="#ffffff"
            stroke-width="4"
            stroke-dasharray="10 8"
            opacity=".8"
        />

        <text
            x="500"
            y="685"
            text-anchor="middle"
            fill="#e2e8f0"
            font-size="16"
            font-family="Arial, sans-serif"
        >
            Construire → Styliser → Organiser → Adapter
        </text>

    </svg>
</div>


============================================================
1 — INTRODUCTION AU CSS
============================================================

CSS signifie Cascading Style Sheets.

CSS permet de contrôler la présentation visuelle d'un
document HTML.

HTML décrit la structure et le sens du contenu.

CSS contrôle notamment :

les couleurs ;

les dimensions ;

les espacements ;

les bordures ;

les arrière-plans ;

la typographie ;

la position des éléments ;

la disposition des éléments ;

les animations ;

la présentation responsive.


Syntaxe générale :

selecteur {
    propriete: valeur;
}

Exemple :

p {
    color: blue;
    font-size: 18px;
}

Le sélecteur indique l'élément ciblé.

La propriété indique ce que nous voulons modifier.

La valeur indique comment la propriété doit être appliquée.

Une déclaration CSS est composée d'une propriété et d'une
valeur.


Commentaires CSS :

/* Ceci est un commentaire CSS */


============================================================
2 — LES TROIS MÉTHODES CSS
============================================================

Il existe trois principales méthodes pour appliquer du CSS.

------------------------------------------------------------
CSS INLINE
------------------------------------------------------------

<p style="color: blue;">
    Texte bleu
</p>

Le CSS est directement placé dans l'attribut style.

Cette méthode peut être utile pour une modification très
ponctuelle mais elle est difficile à maintenir dans un
grand projet.


------------------------------------------------------------
CSS INTERNE
------------------------------------------------------------

<style>

    p {
        color: blue;
    }

</style>

Le CSS est placé dans l'élément style du document HTML.


------------------------------------------------------------
CSS EXTERNE
------------------------------------------------------------

<link
    rel="stylesheet"
    href="style.css"
>

Le CSS est placé dans un fichier séparé.

Exemple :

style.css

p {
    color: blue;
}

Pour un projet professionnel, la séparation du HTML et du
CSS facilite généralement l'organisation et la maintenance.


============================================================
3 — SÉLECTEURS CSS
============================================================

Le sélecteur détermine les éléments auxquels une règle CSS
doit être appliquée.

------------------------------------------------------------
SÉLECTEUR D'ÉLÉMENT
------------------------------------------------------------

p {
    color: black;
}

------------------------------------------------------------
SÉLECTEUR DE CLASSE
------------------------------------------------------------

.card {
    padding: 20px;
}

HTML :

<div class="card">
    Contenu
</div>

------------------------------------------------------------
SÉLECTEUR D'ID
------------------------------------------------------------

#header {
    background: black;
}

------------------------------------------------------------
SÉLECTEUR UNIVERSEL
------------------------------------------------------------

* {
    box-sizing: border-box;
}

------------------------------------------------------------
PLUSIEURS SÉLECTEURS
------------------------------------------------------------

h1,
h2,
h3 {
    font-family: Arial, sans-serif;
}

------------------------------------------------------------
DESCENDANT
------------------------------------------------------------

nav a {
    text-decoration: none;
}

------------------------------------------------------------
ENFANT DIRECT
------------------------------------------------------------

nav > a {
    display: inline-block;
}

------------------------------------------------------------
ATTRIBUT
------------------------------------------------------------

input[type="email"] {
    border: 1px solid gray;
}

------------------------------------------------------------
PSEUDO-CLASSE
------------------------------------------------------------

button:hover {
    transform: scale(1.02);
}

------------------------------------------------------------
PSEUDO-ÉLÉMENT
------------------------------------------------------------

.card::before {
    content: "";
}


============================================================
4 — CASCADE, HÉRITAGE ET SPÉCIFICITÉ
============================================================

CSS signifie Cascading Style Sheets parce que plusieurs
règles peuvent s'appliquer au même élément.

La cascade détermine quelle déclaration sera utilisée.

L'héritage permet à certaines propriétés d'être transmises
des éléments parents vers leurs descendants.

La spécificité permet de déterminer quelle règle est la
plus précise lorsqu'il existe plusieurs règles concurrentes.

Ordre simplifié :

sélecteur d'élément

classe et pseudo-classe

id

styles inline

!important possède une priorité particulière et doit être
utilisé avec prudence.


Exemple :

p {
    color: black;
}

.text {
    color: blue;
}

#message {
    color: red;
}

Un élément possédant id="message", class="text" et étant
un paragraphe sera affecté par plusieurs règles, mais la
spécificité intervient dans le choix final.


============================================================
5 — COULEURS
============================================================

CSS permet de définir des couleurs de plusieurs manières.

Nom :

color: red;

HEX :

color: #ff0000;

RGB :

color: rgb(255, 0, 0);

RGBA :

color: rgba(255, 0, 0, 0.5);

HSL :

color: hsl(0, 100%, 50%);

HSLA :

color: hsla(0, 100%, 50%, 0.5);

On peut également utiliser :

opacity: 0.5;


============================================================
6 — TEXTE ET TYPOGRAPHIE
============================================================

Propriétés importantes :

color

font-family

font-size

font-weight

font-style

font-variant

line-height

letter-spacing

word-spacing

text-align

text-decoration

text-transform

text-indent

text-shadow

Exemple :

body {
    font-family: Arial, sans-serif;
    font-size: 16px;
    line-height: 1.6;
}

h1 {
    text-align: center;
    text-transform: uppercase;
}

p {
    letter-spacing: 0.3px;
}


============================================================
7 — UNITÉS CSS
============================================================

Unités absolues :

px

cm

mm

in

pt

pc


Unités relatives :

%

em

rem

vw

vh

vmin

vmax

ch

ex


px représente généralement une unité basée sur le pixel CSS.

% dépend généralement de la dimension de référence.

em dépend de la taille de police du contexte.

rem dépend de la taille de police de l'élément racine.

vw représente une fraction de la largeur du viewport.

vh représente une fraction de la hauteur du viewport.


============================================================
8 — LE MODÈLE DE BOÎTE — BOX MODEL
============================================================

Chaque élément HTML peut être considéré comme une boîte.

Le Box Model est composé de :

CONTENT

PADDING

BORDER

MARGIN


Exemple :

.card {

    width: 300px;

    padding: 20px;

    border: 2px solid black;

    margin: 30px;

}

La propriété box-sizing permet de contrôler la manière dont
la largeur et la hauteur sont calculées.

Très souvent :

* {
    box-sizing: border-box;
}

Avec border-box, le padding et la bordure sont inclus dans
la largeur et la hauteur déclarées.


============================================================
9 — BACKGROUNDS
============================================================

CSS permet de contrôler les arrière-plans.

background-color

background-image

background-repeat

background-position

background-size

background-attachment

Exemple :

.hero {
    background-color: #0f172a;
    background-image: url("image.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

CSS permet également les gradients.

Exemple :

background: linear-gradient(
    135deg,
    #2563eb,
    #7c3aed
);

Gradient radial :

background: radial-gradient(
    circle,
    white,
    blue
);


============================================================
10 — BORDURES
============================================================

Propriétés :

border

border-width

border-style

border-color

border-radius

outline

Exemple :

.card {
    border: 1px solid #d1d5db;
    border-radius: 16px;
}

On peut définir chaque côté :

border-top

border-right

border-bottom

border-left.


============================================================
11 — ESPACEMENT ET DIMENSIONS
============================================================

margin définit l'espace extérieur.

padding définit l'espace intérieur.

width définit la largeur.

height définit la hauteur.

min-width définit une largeur minimale.

max-width définit une largeur maximale.

min-height définit une hauteur minimale.

max-height définit une hauteur maximale.

gap définit l'espace entre les éléments d'un layout
Flexbox ou Grid.


Exemple :

.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}


============================================================
12 — DISPLAY
============================================================

display contrôle le mode d'affichage d'un élément.

Valeurs importantes :

block

inline

inline-block

none

contents

flex

grid


block occupe généralement toute la largeur disponible.

inline reste dans le flux du texte.

inline-block permet notamment de combiner certaines
caractéristiques du inline et du block.

none retire l'élément de la mise en page.

flex active Flexbox.

grid active CSS Grid.


============================================================
13 — POSITIONNEMENT
============================================================

CSS propose plusieurs modes de positionnement.

static

relative

absolute

fixed

sticky


Exemple :

.card {
    position: relative;
}

.badge {
    position: absolute;
    top: 10px;
    right: 10px;
}

position: fixed peut maintenir un élément par rapport
au viewport.

position: sticky permet à un élément de rester visible
pendant le défilement selon les conditions définies.

Propriétés :

top

right

bottom

left

inset

z-index


============================================================
14 — OVERFLOW
============================================================

overflow contrôle le contenu qui dépasse les limites
d'une boîte.

Valeurs :

visible

hidden

scroll

auto


Exemple :

.panel {
    width: 300px;
    height: 200px;
    overflow: auto;
}

On peut également utiliser :

overflow-x

overflow-y


============================================================
15 — FLEXBOX
============================================================

Flexbox est un système de mise en page unidimensionnel.

Activation :

.container {
    display: flex;
}

Propriétés principales du conteneur :

flex-direction

justify-content

align-items

align-content

flex-wrap

gap


Exemple :

.container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 20px;
}


Les éléments enfants peuvent utiliser :

flex-grow

flex-shrink

flex-basis

flex

order

align-self


Exemple :

.item {
    flex: 1;
}


============================================================
16 — CSS GRID
============================================================

CSS Grid est un système de mise en page basé sur les
lignes et les colonnes.

Activation :

.container {
    display: grid;
}

Exemple :

.container {
    display: grid;

    grid-template-columns:
        repeat(3, 1fr);

    gap: 20px;
}


Propriétés importantes :

grid-template-columns

grid-template-rows

grid-column

grid-row

grid-area

gap


Unités et fonctions utiles :

fr

repeat()

minmax()

auto-fit

auto-fill


Exemple responsive :

.container {
    display: grid;

    grid-template-columns:
        repeat(
            auto-fit,
            minmax(220px, 1fr)
        );

    gap: 20px;
}


============================================================
17 — RESPONSIVE DESIGN
============================================================

Le Responsive Web Design permet à une page de s'adapter
aux différentes tailles d'écran.

Un site responsive doit pouvoir fonctionner sur :

téléphone ;

tablette ;

ordinateur portable ;

ordinateur de bureau ;

écrans plus larges.


Les media queries permettent d'appliquer des règles selon
les caractéristiques du viewport.

Exemple :

@media (max-width: 600px) {

    .menu {
        flex-direction: column;
    }

}


Approche mobile-first :

On commence par concevoir le style destiné aux petits
écrans puis on ajoute progressivement les adaptations
pour les écrans plus larges.


============================================================
18 — IMAGES ET CONTENUS RESPONSIVES
============================================================

Une image doit généralement pouvoir s'adapter à son
conteneur.

Exemple :

img {
    max-width: 100%;
    height: auto;
}


object-fit permet de contrôler l'ajustement d'une image
ou d'une vidéo dans sa boîte.

Exemple :

img {
    width: 100%;
    height: 250px;
    object-fit: cover;
}


object-position permet de contrôler la position du contenu.

aspect-ratio permet de conserver un rapport largeur/hauteur.

Exemple :

.video {
    aspect-ratio: 16 / 9;
}


============================================================
19 — FORMULAIRES AVEC CSS
============================================================

CSS peut être utilisé pour créer des formulaires lisibles
et professionnels.

Exemple :

input,
textarea,
select {
    width: 100%;
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
}

button {
    padding: 12px 20px;
    cursor: pointer;
}


On peut cibler différents états :

:focus

:focus-visible

:checked

:disabled

:required

:valid

:invalid

:placeholder-shown


Exemple :

input:focus {
    outline: 2px solid blue;
}


============================================================
20 — LIENS ET BOUTONS
============================================================

Les liens peuvent utiliser plusieurs états.

a:link

a:visited

a:hover

a:active

a:focus


Exemple :

a {
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}


Les boutons peuvent également recevoir des effets :

button:hover {
    transform: translateY(-2px);
}

button:active {
    transform: translateY(0);
}


============================================================
21 — PSEUDO-CLASSES
============================================================

Les pseudo-classes permettent de cibler un état ou une
position particulière.

Exemples :

:hover

:active

:focus

:focus-visible

:visited

:first-child

:last-child

:nth-child()

:nth-of-type()

:not()

:is()

:where()


Exemple :

li:nth-child(even) {
    background: #f1f5f9;
}


============================================================
22 — PSEUDO-ÉLÉMENTS
============================================================

Les pseudo-éléments ciblent une partie particulière d'un
élément ou permettent de générer du contenu.

Exemples :

::before

::after

::first-letter

::first-line

::selection

::placeholder


Exemple :

.card::before {
    content: "";
    display: block;
    height: 4px;
    background: blue;
}


============================================================
23 — OMBRES ET EFFETS
============================================================

box-shadow permet de créer une ombre autour d'une boîte.

Exemple :

.card {
    box-shadow:
        0 10px 30px
        rgba(0, 0, 0, 0.15);
}


text-shadow permet d'ajouter une ombre au texte.

opacity contrôle la transparence globale d'un élément.


============================================================
24 — TRANSITIONS
============================================================

Une transition permet de rendre un changement visuel
progressif.

Propriétés :

transition-property

transition-duration

transition-timing-function

transition-delay

transition


Exemple :

.button {
    transition:
        transform 0.2s ease,
        background-color 0.2s ease;
}

.button:hover {
    transform: translateY(-2px);
}


============================================================
25 — TRANSFORMATIONS
============================================================

La propriété transform permet de modifier visuellement
la position, l'échelle, la rotation ou l'inclinaison
d'un élément.

Fonctions :

translate()

translateX()

translateY()

scale()

rotate()

skew()

skewX()

skewY()


Exemple :

.card:hover {
    transform:
        translateY(-5px)
        scale(1.02);
}


transform-origin permet de définir le point d'origine
de la transformation.


============================================================
26 — ANIMATIONS CSS
============================================================

Les animations CSS utilisent notamment @keyframes.

Exemple :

@keyframes apparition {

    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }

}


.box {
    animation:
        apparition
        0.8s
        ease
        both;
}


Propriétés importantes :

animation-name

animation-duration

animation-delay

animation-iteration-count

animation-direction

animation-fill-mode

animation-play-state

animation-timing-function


============================================================
27 — VARIABLES CSS
============================================================

Les variables CSS permettent de centraliser des valeurs
réutilisables.

Exemple :

:root {

    --couleur-principale: #2563eb;

    --couleur-secondaire: #7c3aed;

    --espacement: 20px;

    --rayon: 12px;

}


Utilisation :

.card {

    padding: var(--espacement);

    border-radius: var(--rayon);

    color: var(--couleur-principale);

}


Les variables facilitent la modification globale d'un
design.


============================================================
28 — FONCTIONS CSS
============================================================

CSS possède plusieurs fonctions utiles.

var()

calc()

min()

max()

clamp()

rgb()

hsl()


Exemple :

.container {
    width: calc(100% - 40px);
}


Exemple :

.title {
    font-size:
        clamp(
            28px,
            5vw,
            60px
        );
}


clamp() permet de définir une valeur minimale, une valeur
flexible et une valeur maximale.


============================================================
29 — LAYOUT D'UNE VRAIE PAGE WEB
============================================================

Une page Web professionnelle peut utiliser une structure
comme :

HEADER

NAVIGATION

MAIN

SECTION

ARTICLE

ASIDE

FOOTER


CSS peut organiser cette structure avec Flexbox ou Grid.

Exemple :

.page {
    min-height: 100vh;

    display: grid;

    grid-template-rows:
        auto
        auto
        1fr
        auto;
}


Une section peut utiliser :

display: grid;

ou :

display: flex;


L'objectif est de créer une hiérarchie visuelle claire.


============================================================
30 — DESIGN D'UNE INTERFACE WEB
============================================================

CSS permet de construire des composants visuels.

Exemples :

cards

menus

barres de navigation

boutons

badges

alertes

panneaux

hero sections

footers

formulaires

galeries

portfolios

landing pages


Un composant doit idéalement avoir une structure claire
et des classes réutilisables.

Exemple :

.card {

    padding: 20px;

    border-radius: 16px;

    background: white;

    box-shadow:
        0 10px 30px
        rgba(0,0,0,.10);
}


============================================================
31 — ACCESSIBILITÉ VISUELLE
============================================================

Le design CSS doit également respecter les besoins
d'accessibilité.

Il faut notamment faire attention :

au contraste ;

à la lisibilité ;

à la taille du texte ;

à l'espacement ;

à la visibilité du focus ;

à l'utilisation de la couleur ;

aux animations excessives.


Exemple :

button:focus-visible {
    outline:
        3px solid
        #2563eb;

    outline-offset:
        3px;
}


Pour les utilisateurs sensibles aux animations :

@media (prefers-reduced-motion: reduce) {

    * {
        animation-duration: 0.01ms;
        transition-duration: 0.01ms;
        scroll-behavior: auto;
    }

}


============================================================
32 — ORGANISATION PROFESSIONNELLE DU CSS
============================================================

Un projet professionnel doit garder un CSS organisé.

On peut notamment séparer :

variables ;

base ;

typographie ;

layout ;

composants ;

formulaires ;

responsive ;

animations.


Exemple de structure :

css/

    variables.css

    base.css

    layout.css

    components.css

    forms.css

    responsive.css


Pour un petit projet, un seul fichier style.css peut être
suffisant.

Pour un projet plus important, une organisation modulaire
peut faciliter la maintenance.


============================================================
33 — DÉBOGAGE CSS
============================================================

Lorsqu'un style ne fonctionne pas, il faut rechercher
méthodiquement la cause.

Vérifiez :

le sélecteur ;

la classe ;

l'id ;

la syntaxe ;

les accolades ;

les propriétés ;

les valeurs ;

la spécificité ;

la cascade ;

l'héritage ;

le Box Model ;

la largeur ;

la hauteur ;

le positionnement ;

Flexbox ;

Grid ;

les media queries.


Les outils de développement du navigateur permettent
notamment d'inspecter un élément et de voir les règles
CSS qui lui sont appliquées.

Un développeur doit apprendre à identifier la cause d'un
problème au lieu de modifier le code au hasard.


============================================================
CONCLUSION DU CHAPITRE C
============================================================

Dans le Chapitre B, nous avons appris à construire la
structure HTML d'une page.

Dans le Chapitre C, nous avons appris à transformer cette
structure en interface visuelle.

Nous avons étudié :

sélecteurs ;

cascade ;

spécificité ;

couleurs ;

typographie ;

unités ;

Box Model ;

backgrounds ;

bordures ;

dimensions ;

display ;

positionnement ;

overflow ;

Flexbox ;

Grid ;

Responsive Design ;

images responsives ;

formulaires ;

pseudo-classes ;

pseudo-éléments ;

ombres ;

transitions ;

transformations ;

animations ;

variables CSS ;

fonctions CSS ;

layout ;

composants ;

accessibilité ;

organisation du CSS ;

débogage.

La prochaine étape consiste à combiner HTML et CSS pour
construire des interfaces Web complètes et responsive.`,

    pratique:
`TRAVAUX PRATIQUES — CSS ET CONSTRUCTION D'UNE INTERFACE WEB

Objectif général :

Transformer progressivement une page HTML créée dans le
Chapitre B en une interface Web organisée, esthétique,
responsive et professionnelle.

------------------------------------------------------------
TP 1 — PREMIER FICHIER CSS
------------------------------------------------------------

Créez :

style.css

Reliez-le à index.html avec :

<link
    rel="stylesheet"
    href="style.css"
>

Modifiez :

la couleur du texte ;

la couleur du fond ;

la taille du texte.


------------------------------------------------------------
TP 2 — SÉLECTEURS
------------------------------------------------------------

Créez des règles CSS pour :

h1 ;

h2 ;

p ;

une classe ;

un id ;

un groupe de sélecteurs.


------------------------------------------------------------
TP 3 — COULEURS
------------------------------------------------------------

Testez :

nom ;

HEX ;

RGB ;

RGBA ;

HSL ;

HSLA.


------------------------------------------------------------
TP 4 — TYPOGRAPHIE
------------------------------------------------------------

Modifiez :

font-family ;

font-size ;

font-weight ;

line-height ;

text-align ;

text-transform ;

letter-spacing.


------------------------------------------------------------
TP 5 — BOX MODEL
------------------------------------------------------------

Créez une carte contenant :

content ;

padding ;

border ;

margin.

Testez :

content-box ;

border-box.


------------------------------------------------------------
TP 6 — BACKGROUND
------------------------------------------------------------

Ajoutez :

background-color ;

background-image ;

background-size ;

background-position ;

background-repeat.


------------------------------------------------------------
TP 7 — BORDURES
------------------------------------------------------------

Créez plusieurs cartes avec :

border ;

border-radius ;

outline.


------------------------------------------------------------
TP 8 — DIMENSIONS
------------------------------------------------------------

Testez :

width ;

height ;

min-width ;

max-width ;

min-height ;

max-height.


------------------------------------------------------------
TP 9 — DISPLAY
------------------------------------------------------------

Créez des exemples avec :

block ;

inline ;

inline-block ;

none.


------------------------------------------------------------
TP 10 — POSITIONNEMENT
------------------------------------------------------------

Créez un badge placé dans un coin d'une carte avec :

position: relative ;

position: absolute.


------------------------------------------------------------
TP 11 — FLEXBOX
------------------------------------------------------------

Créez une navigation horizontale avec Flexbox.

Testez :

flex-direction ;

justify-content ;

align-items ;

gap ;

flex-wrap.


------------------------------------------------------------
TP 12 — FLEXBOX AVANCÉ
------------------------------------------------------------

Créez trois cartes.

Testez :

flex-grow ;

flex-shrink ;

flex-basis ;

order ;

align-self.


------------------------------------------------------------
TP 13 — GRID
------------------------------------------------------------

Créez une grille de six cartes avec :

display: grid ;

grid-template-columns ;

gap.


------------------------------------------------------------
TP 14 — GRID RESPONSIVE
------------------------------------------------------------

Utilisez :

repeat() ;

minmax() ;

auto-fit ;

1fr.


------------------------------------------------------------
TP 15 — OVERFLOW
------------------------------------------------------------

Créez un panneau avec une hauteur limitée.

Testez :

hidden ;

scroll ;

auto.


------------------------------------------------------------
TP 16 — IMAGES RESPONSIVES
------------------------------------------------------------

Ajoutez :

max-width: 100% ;

height: auto ;

object-fit ;

aspect-ratio.


------------------------------------------------------------
TP 17 — FORMULAIRE
------------------------------------------------------------

Stylisez le formulaire du Chapitre B.

Modifiez :

input ;

label ;

textarea ;

select ;

button.


------------------------------------------------------------
TP 18 — ÉTATS DU FORMULAIRE
------------------------------------------------------------

Testez :

:focus ;

:required ;

:valid ;

:invalid ;

:disabled ;

:checked.


------------------------------------------------------------
TP 19 — LIENS
------------------------------------------------------------

Créez les styles :

normal ;

hover ;

active ;

visited ;

focus.


------------------------------------------------------------
TP 20 — PSEUDO-CLASSES
------------------------------------------------------------

Utilisez :

:first-child ;

:last-child ;

:nth-child() ;

:not().


------------------------------------------------------------
TP 21 — PSEUDO-ÉLÉMENTS
------------------------------------------------------------

Créez un élément décoratif avec :

::before

et

::after


------------------------------------------------------------
TP 22 — OMBRES
------------------------------------------------------------

Ajoutez :

box-shadow ;

text-shadow.


------------------------------------------------------------
TP 23 — TRANSITIONS
------------------------------------------------------------

Créez un bouton avec un effet progressif au survol.


------------------------------------------------------------
TP 24 — TRANSFORMATIONS
------------------------------------------------------------

Testez :

translate ;

scale ;

rotate ;

skew.


------------------------------------------------------------
TP 25 — ANIMATION
------------------------------------------------------------

Créez une animation avec :

@keyframes ;

animation-duration ;

animation-iteration-count.


------------------------------------------------------------
TP 26 — VARIABLES CSS
------------------------------------------------------------

Créez :

:root

avec plusieurs variables de couleurs et d'espacement.

Réutilisez-les dans plusieurs composants.


------------------------------------------------------------
TP 27 — FONCTIONS CSS
------------------------------------------------------------

Testez :

calc() ;

min() ;

max() ;

clamp().


------------------------------------------------------------
TP 28 — RESPONSIVE DESIGN
------------------------------------------------------------

Créez une page qui s'adapte à :

mobile ;

tablette ;

ordinateur.


------------------------------------------------------------
TP 29 — MOBILE-FIRST
------------------------------------------------------------

Commencez avec une interface destinée au téléphone.

Ajoutez ensuite des adaptations pour les écrans plus larges.


------------------------------------------------------------
TP 30 — NAVIGATION RESPONSIVE
------------------------------------------------------------

Créez une navigation qui change de disposition sur petit
écran.


------------------------------------------------------------
TP 31 — LAYOUT COMPLET
------------------------------------------------------------

Construisez :

header ;

nav ;

main ;

section ;

article ;

aside ;

footer.

Utilisez Flexbox ou Grid.


------------------------------------------------------------
TP 32 — CARD PROFESSIONNELLE
------------------------------------------------------------

Créez une carte contenant :

image ;

titre ;

description ;

bouton.

Ajoutez :

bordure ;

ombre ;

rayon ;

hover ;

transition.


------------------------------------------------------------
TP 33 — HERO SECTION
------------------------------------------------------------

Créez une section d'accueil avec :

titre ;

description ;

bouton ;

image.

Rendez-la responsive.


------------------------------------------------------------
TP 34 — ACCESSIBILITÉ
------------------------------------------------------------

Ajoutez un état focus-visible clair aux liens et boutons.

Testez également :

prefers-reduced-motion.


------------------------------------------------------------
TP 35 — DÉBOGAGE
------------------------------------------------------------

Utilisez les outils du navigateur pour identifier :

une règle CSS ;

une règle écrasée ;

une mauvaise dimension ;

un problème Flexbox ;

un problème Grid.


------------------------------------------------------------
TP FINAL — TRANSFORMATION DU MINI-SITE DU CHAPITRE B
------------------------------------------------------------

Reprenez le mini-site HTML créé dans le Chapitre B.

Ajoutez un fichier :

style.css

Transformez progressivement le projet avec :

couleurs ;

typographie ;

Box Model ;

Flexbox ;

Grid ;

responsive design ;

formulaires stylisés ;

boutons ;

cards ;

navigation ;

footer ;

animations ;

variables CSS.

Le résultat doit fonctionner sur téléphone, tablette et
ordinateur.`,

    exercices: [

        "Exercice 1 — Écrire une règle CSS complète avec un sélecteur, une propriété et une valeur.",

        "Exercice 2 — Créer une règle CSS ciblant tous les paragraphes.",

        "Exercice 3 — Créer une classe CSS et l'appliquer à plusieurs éléments HTML.",

        "Exercice 4 — Créer un sélecteur utilisant un id.",

        "Exercice 5 — Utiliser le sélecteur universel *.",

        "Exercice 6 — Regrouper plusieurs sélecteurs dans une seule règle CSS.",

        "Exercice 7 — Créer un sélecteur descendant.",

        "Exercice 8 — Créer un sélecteur enfant direct avec >.",

        "Exercice 9 — Créer un sélecteur d'attribut pour un champ email.",

        "Exercice 10 — Expliquer la différence entre une classe et un id.",

        "Exercice 11 — Créer une page utilisant CSS inline, interne et externe.",

        "Exercice 12 — Utiliser les couleurs avec des noms, HEX et RGB.",

        "Exercice 13 — Créer une couleur avec RGBA et expliquer la transparence.",

        "Exercice 14 — Utiliser HSL pour créer une couleur.",

        "Exercice 15 — Modifier la typographie d'une page avec font-family, font-size et font-weight.",

        "Exercice 16 — Modifier line-height, letter-spacing et text-align.",

        "Exercice 17 — Créer un exemple avec text-transform et text-decoration.",

        "Exercice 18 — Utiliser les unités px, %, em et rem.",

        "Exercice 19 — Utiliser vw et vh pour créer une section responsive.",

        "Exercice 20 — Construire une démonstration complète du Box Model.",

        "Exercice 21 — Utiliser box-sizing: border-box.",

        "Exercice 22 — Créer un élément avec un background-color et un background-image.",

        "Exercice 23 — Créer un gradient linéaire.",

        "Exercice 24 — Créer un gradient radial.",

        "Exercice 25 — Créer une carte avec border, border-radius et outline.",

        "Exercice 26 — Créer un conteneur avec width, max-width, margin et padding.",

        "Exercice 27 — Démontrer les différences entre block, inline, inline-block et none.",

        "Exercice 28 — Créer un badge positionné avec relative et absolute.",

        "Exercice 29 — Créer un élément fixe avec position: fixed.",

        "Exercice 30 — Créer un élément sticky avec position: sticky.",

        "Exercice 31 — Créer une navigation complète avec Flexbox.",

        "Exercice 32 — Utiliser justify-content, align-items et gap.",

        "Exercice 33 — Utiliser flex-grow, flex-shrink et flex-basis.",

        "Exercice 34 — Créer une grille CSS de trois colonnes.",

        "Exercice 35 — Utiliser repeat(), minmax() et 1fr avec CSS Grid.",

        "Exercice 36 — Créer une grille responsive avec auto-fit.",

        "Exercice 37 — Créer un formulaire stylisé avec CSS.",

        "Exercice 38 — Styliser les états :hover, :focus, :active et :disabled.",

        "Exercice 39 — Utiliser :first-child, :last-child et :nth-child().",

        "Exercice 40 — Créer un effet visuel avec ::before et ::after.",

        "Exercice 41 — Créer une carte avec box-shadow et text-shadow.",

        "Exercice 42 — Créer un bouton avec transition et transform.",

        "Exercice 43 — Créer une animation CSS avec @keyframes.",

        "Exercice 44 — Créer des variables CSS dans :root et les utiliser avec var().",

        "Exercice 45 — Utiliser calc(), min(), max() et clamp().",

        "Exercice 46 — Créer une page responsive avec une media query.",

        "Exercice 47 — Construire un layout complet avec header, nav, main, section, article, aside et footer.",

        "Exercice 48 — Créer une interface de type landing page avec hero section, cards et boutons.",

        "Exercice 49 — Inspecter une page avec les outils de développement et identifier une erreur CSS.",

        "Exercice 50 — Transformer une page HTML du Chapitre B en interface Web responsive complète avec CSS."
    ],

    devoirs:
`DEVOIR — CRÉATION D'UNE INTERFACE WEB PROFESSIONNELLE RESPONSIVE

Objectif :

Reprendre le mini-site HTML réalisé dans le Chapitre B et
le transformer en une interface Web complète grâce au CSS.

Le projet doit contenir au minimum :

index.html

about.html

services.html

contact.html

style.css


============================================================
1 — STRUCTURE
============================================================

Conservez la structure HTML créée dans le Chapitre B.

Le projet doit utiliser correctement :

header ;

nav ;

main ;

section ;

article ;

aside ;

footer.


============================================================
2 — FICHIER CSS
============================================================

Créez un fichier :

style.css

Toutes les principales règles de présentation doivent être
organisées dans ce fichier.


============================================================
3 — IDENTITÉ VISUELLE
============================================================

Définissez une identité visuelle avec :

couleur principale ;

couleur secondaire ;

couleur de fond ;

couleur du texte ;

typographie ;

espacements ;

rayons de bordure.


Utilisez des variables CSS.


============================================================
4 — TYPOGRAPHIE
============================================================

Stylisez :

h1 ;

h2 ;

h3 ;

p ;

li ;

liens.


Utilisez correctement :

font-family ;

font-size ;

font-weight ;

line-height ;

text-align ;

text-transform.


============================================================
5 — NAVIGATION
============================================================

Créez une navigation professionnelle.

La navigation doit fonctionner sur :

téléphone ;

tablette ;

ordinateur.


Ajoutez des effets :

hover ;

focus ;

active.


============================================================
6 — HERO
============================================================

Créez une Hero Section sur la page d'accueil contenant :

un titre ;

une description ;

un bouton ;

une image ou illustration.


La section doit être responsive.


============================================================
7 — CARDS
============================================================

La page services doit présenter plusieurs services
sous forme de cartes.

Chaque carte doit contenir :

titre ;

description ;

bouton ou lien.


Utilisez :

padding ;

border ;

border-radius ;

box-shadow ;

transition.


============================================================
8 — FLEXBOX
============================================================

Utilisez Flexbox pour organiser au moins une partie
importante du projet.


============================================================
9 — CSS GRID
============================================================

Utilisez CSS Grid pour organiser une galerie ou une
section de cartes.


============================================================
10 — FORMULAIRE
============================================================

Stylisez le formulaire de contact.

Les champs doivent être lisibles et correctement espacés.

Ajoutez des styles pour :

focus ;

valid ;

invalid ;

disabled ;

button.


============================================================
11 — IMAGES
============================================================

Les images doivent :

s'adapter au conteneur ;

ne pas provoquer de débordement ;

conserver un rapport adapté.


Utilisez si nécessaire :

max-width ;

height ;

object-fit ;

object-position ;

aspect-ratio.


============================================================
12 — RESPONSIVE DESIGN
============================================================

Le site doit fonctionner correctement sur :

petit téléphone ;

grand téléphone ;

tablette ;

ordinateur portable ;

ordinateur de bureau.


Utilisez au moins une media query.

L'approche mobile-first est recommandée.


============================================================
13 — EFFETS VISUELS
============================================================

Ajoutez avec modération :

ombres ;

transitions ;

transformations ;

animations ;

gradients.


Les effets ne doivent pas empêcher la lecture du contenu.


============================================================
14 — ACCESSIBILITÉ
============================================================

Vérifiez :

contraste ;

lisibilité ;

focus visible ;

taille des textes ;

navigation ;

réduction des animations.


Utilisez :

:focus-visible

et, lorsque cela est pertinent :

prefers-reduced-motion.


============================================================
15 — ORGANISATION DU CSS
============================================================

Organisez le CSS de manière logique.

Exemple :

/* VARIABLES */

/* RESET / BASE */

/* TYPOGRAPHIE */

/* HEADER */

/* NAVIGATION */

/* MAIN */

/* SECTIONS */

/* CARDS */

/* FORMULAIRES */

/* FOOTER */

/* RESPONSIVE */

/* ANIMATIONS */


============================================================
16 — DÉBOGAGE
============================================================

Testez le projet.

Vérifiez :

les sélecteurs ;

les propriétés ;

les valeurs ;

les dimensions ;

les espacements ;

Flexbox ;

Grid ;

les media queries ;

les débordements ;

les éléments cachés.


============================================================
17 — TEST FINAL
============================================================

Ouvrez le projet dans le Laboratoire FOBAS.

Testez toutes les pages.

Testez tous les liens.

Testez le formulaire.

Testez les images.

Testez la navigation.

Testez les cartes.

Testez l'affichage sur différentes tailles d'écran.


============================================================
OBJECTIF FINAL
============================================================

À la fin du devoir, l'étudiant doit être capable de partir
d'une structure HTML et de créer une interface Web complète,
organisée, esthétique, responsive et maintenable avec CSS.

Le projet final doit démontrer la maîtrise de :

sélecteurs ;

cascade ;

spécificité ;

couleurs ;

typographie ;

unités ;

Box Model ;

backgrounds ;

bordures ;

dimensions ;

display ;

positionnement ;

overflow ;

Flexbox ;

Grid ;

Responsive Design ;

images responsives ;

formulaires ;

pseudo-classes ;

pseudo-éléments ;

ombres ;

transitions ;

transformations ;

animations ;

variables CSS ;

fonctions CSS ;

layout ;

composants ;

accessibilité ;

organisation CSS ;

débogage.`
},









{
    id: "D",

    title:
        "D — Intégration HTML et CSS et création d'interfaces Web complètes",

    theorie:
`CHAPITRE D — INTÉGRATION HTML + CSS

Dans le Chapitre B, nous avons appris à construire la
structure d'une page Web avec HTML.

Dans le Chapitre C, nous avons appris à contrôler son
apparence, sa mise en page et son adaptation aux différents
écrans avec CSS.

Dans ce Chapitre D, nous allons combiner HTML et CSS pour
construire de véritables interfaces Web complètes,
organisées, responsive, accessibles et maintenables.

HTML = STRUCTURE
CSS = PRÉSENTATION
HTML + CSS = INTERFACE WEB

JavaScript pourra ensuite être ajouté pour apporter de la
logique et de l'interactivité avancée.


============================================================
ILLUSTRATION VISUELLE — INTÉGRATION HTML + CSS
============================================================

<div style="
    width:100%;
    margin:25px auto;
    padding:18px;
    border-radius:22px;
    background:linear-gradient(145deg,#020617,#172554,#312e81);
    box-shadow:0 25px 55px rgba(0,0,0,.38);
    overflow:hidden;
">

<svg
    viewBox="0 0 1200 780"
    width="100%"
    role="img"
    aria-label="Illustration 3D montrant l'intégration HTML et CSS dans une interface Web responsive"
    style="
        display:block;
        width:100%;
        height:auto;
        min-height:560px;
    "
>

<defs>

    <linearGradient id="dBackground"
        x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#020617"/>
        <stop offset="50%" stop-color="#172554"/>
        <stop offset="100%" stop-color="#312e81"/>
    </linearGradient>

    <linearGradient id="dHtml"
        x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fb923c"/>
        <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>

    <linearGradient id="dCss"
        x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>

    <linearGradient id="dInterface"
        x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#a78bfa"/>
        <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>

    <linearGradient id="dResponsive"
        x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#34d399"/>
        <stop offset="100%" stop-color="#059669"/>
    </linearGradient>

    <filter id="dShadow">
        <feDropShadow
            dx="0"
            dy="18"
            stdDeviation="14"
            flood-opacity=".42"
        />
    </filter>

</defs>


<rect
    x="0"
    y="0"
    width="1200"
    height="780"
    rx="35"
    fill="url(#dBackground)"
/>


<text
    x="600"
    y="58"
    text-anchor="middle"
    fill="#ffffff"
    font-size="34"
    font-weight="700"
    font-family="Arial, sans-serif"
>
    HTML + CSS
</text>

<text
    x="600"
    y="90"
    text-anchor="middle"
    fill="#cbd5e1"
    font-size="18"
    font-family="Arial, sans-serif"
>
    Construction d'une interface Web complète et responsive
</text>


<!-- HTML -->

<g filter="url(#dShadow)">

    <polygon
        points="95,185 285,140 380,195 190,240"
        fill="#fdba74"
    />

    <polygon
        points="95,185 190,240 190,410 95,355"
        fill="#c2410c"
    />

    <polygon
        points="190,240 380,195 380,365 190,410"
        fill="url(#dHtml)"
    />

    <text
        x="285"
        y="278"
        text-anchor="middle"
        fill="#ffffff"
        font-size="28"
        font-weight="700"
        font-family="Arial, sans-serif"
    >
        HTML
    </text>

    <text
        x="285"
        y="310"
        text-anchor="middle"
        fill="#fee2e2"
        font-size="17"
        font-family="Arial, sans-serif"
    >
        STRUCTURE
    </text>

    <text
        x="285"
        y="342"
        text-anchor="middle"
        fill="#ffffff"
        font-size="14"
        font-family="monospace"
    >
        header • main • footer
    </text>

</g>


<!-- CSS -->

<g filter="url(#dShadow)">

    <polygon
        points="820,190 1010,145 1105,200 915,245"
        fill="#7dd3fc"
    />

    <polygon
        points="820,190 915,245 915,415 820,360"
        fill="#1d4ed8"
    />

    <polygon
        points="915,245 1105,200 1105,370 915,415"
        fill="url(#dCss)"
    />

    <text
        x="1010"
        y="283"
        text-anchor="middle"
        fill="#ffffff"
        font-size="28"
        font-weight="700"
        font-family="Arial, sans-serif"
    >
        CSS
    </text>

    <text
        x="1010"
        y="315"
        text-anchor="middle"
        fill="#dbeafe"
        font-size="17"
        font-family="Arial, sans-serif"
    >
        DESIGN
    </text>

    <text
        x="1010"
        y="347"
        text-anchor="middle"
        fill="#ffffff"
        font-size="14"
        font-family="monospace"
    >
        layout • couleur • responsive
    </text>

</g>


<!-- INTERFACE -->

<g filter="url(#dShadow)">

    <polygon
        points="360,365 705,290 830,360 485,435"
        fill="#c4b5fd"
    />

    <polygon
        points="360,365 485,435 485,650 360,580"
        fill="#5b21b6"
    />

    <polygon
        points="485,435 830,360 830,575 485,650"
        fill="url(#dInterface)"
    />

    <!-- browser -->

    <rect
        x="525"
        y="410"
        width="255"
        height="135"
        rx="12"
        fill="#ffffff"
        opacity=".96"
    />

    <rect
        x="525"
        y="410"
        width="255"
        height="25"
        rx="12"
        fill="#e2e8f0"
    />

    <circle cx="543" cy="423" r="4" fill="#ef4444"/>
    <circle cx="557" cy="423" r="4" fill="#f59e0b"/>
    <circle cx="571" cy="423" r="4" fill="#22c55e"/>

    <rect
        x="540"
        y="450"
        width="225"
        height="18"
        rx="5"
        fill="#dbeafe"
    />

    <rect
        x="540"
        y="480"
        width="90"
        height="48"
        rx="7"
        fill="#c4b5fd"
    />

    <rect
        x="642"
        y="480"
        width="123"
        height="14"
        rx="5"
        fill="#e2e8f0"
    />

    <rect
        x="642"
        y="503"
        width="95"
        height="14"
        rx="5"
        fill="#e2e8f0"
    />

    <text
        x="657"
        y="585"
        text-anchor="middle"
        fill="#ffffff"
        font-size="22"
        font-weight="700"
        font-family="Arial, sans-serif"
    >
        INTERFACE WEB
    </text>

</g>


<!-- RESPONSIVE DEVICES -->

<g filter="url(#dShadow)">

    <!-- desktop -->

    <rect
        x="120"
        y="495"
        width="170"
        height="105"
        rx="12"
        fill="#0f172a"
        stroke="#34d399"
        stroke-width="5"
    />

    <rect
        x="138"
        y="512"
        width="134"
        height="70"
        rx="5"
        fill="#064e3b"
    />

    <rect
        x="175"
        y="606"
        width="60"
        height="8"
        rx="4"
        fill="#64748b"
    />

    <!-- tablet -->

    <rect
        x="850"
        y="480"
        width="110"
        height="145"
        rx="13"
        fill="#0f172a"
        stroke="#34d399"
        stroke-width="5"
    />

    <rect
        x="866"
        y="500"
        width="78"
        height="100"
        rx="5"
        fill="#064e3b"
    />

    <!-- phone -->

    <rect
        x="995"
        y="495"
        width="65"
        height="125"
        rx="13"
        fill="#0f172a"
        stroke="#34d399"
        stroke-width="5"
    />

    <rect
        x="1005"
        y="515"
        width="45"
        height="83"
        rx="5"
        fill="#064e3b"
    />

</g>


<text
    x="205"
    y="650"
    text-anchor="middle"
    fill="#a7f3d0"
    font-size="17"
    font-weight="700"
    font-family="Arial, sans-serif"
>
    DESKTOP
</text>

<text
    x="905"
    y="650"
    text-anchor="middle"
    fill="#a7f3d0"
    font-size="17"
    font-weight="700"
    font-family="Arial, sans-serif"
>
    TABLET
</text>

<text
    x="1027"
    y="650"
    text-anchor="middle"
    fill="#a7f3d0"
    font-size="17"
    font-weight="700"
    font-family="Arial, sans-serif"
>
    MOBILE
</text>


<!-- CONNECTIONS -->

<path
    d="M380 270 C470 250 700 250 820 275"
    fill="none"
    stroke="#ffffff"
    stroke-width="4"
    stroke-dasharray="12 9"
/>

<path
    d="M600 380 C600 340 600 310 600 275"
    fill="none"
    stroke="#ffffff"
    stroke-width="3"
    stroke-dasharray="9 8"
/>

<path
    d="M485 600 C400 630 320 640 290 570"
    fill="none"
    stroke="#34d399"
    stroke-width="4"
    stroke-dasharray="10 8"
/>

<path
    d="M830 550 C850 580 870 590 900 590"
    fill="none"
    stroke="#34d399"
    stroke-width="4"
    stroke-dasharray="10 8"
/>


<text
    x="600"
    y="730"
    text-anchor="middle"
    fill="#e2e8f0"
    font-size="17"
    font-family="Arial, sans-serif"
>
    STRUCTURE → DESIGN → COMPOSANTS → RESPONSIVE → INTERFACE COMPLÈTE
</text>

</svg>
</div>


============================================================
1 — OBJECTIF DE L'INTÉGRATION HTML + CSS
============================================================

L'objectif est maintenant de ne plus considérer HTML et CSS
comme deux apprentissages séparés.

HTML construit la structure.

CSS transforme cette structure en interface.

Exemple :

HTML :

<header>
    <h1>Mon site</h1>
</header>

CSS :

header {
    padding: 30px;
    text-align: center;
}

Le HTML fournit l'élément.

Le CSS définit sa présentation.


============================================================
2 — ORGANISATION D'UN PROJET WEB
============================================================

Un projet simple peut être organisé ainsi :

mon-site/

    index.html

    about.html

    services.html

    contact.html

    css/

        style.css

    images/

        logo.png

        photo.jpg

    media/

        video.mp4

        audio.mp3


L'organisation peut évoluer selon la taille du projet.


============================================================
3 — RELIER HTML ET CSS
============================================================

Dans chaque page HTML :

<link
    rel="stylesheet"
    href="css/style.css"
>

Il faut vérifier que le chemin du fichier CSS est correct.

Exemple :

index.html

css/style.css

Le chemin devient :

href="css/style.css"


============================================================
4 — STRUCTURE HTML ET CLASSES CSS
============================================================

Une bonne intégration nécessite des classes permettant
d'identifier les composants.

Exemple :

<section class="hero">

    <div class="hero-content">

        <h1>
            Bienvenue
        </h1>

        <p>
            Découvrez notre service.
        </p>

        <a
            href="services.html"
            class="btn"
        >
            Découvrir
        </a>

    </div>

</section>


CSS :

.hero {
    padding: 80px 20px;
}

.hero-content {
    max-width: 800px;
    margin: 0 auto;
}

.btn {
    display: inline-block;
    padding: 12px 20px;
}


============================================================
5 — SYSTÈME DE CONTENEUR
============================================================

Un conteneur permet de contrôler la largeur du contenu.

Exemple :

.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}


HTML :

<div class="container">

    Contenu

</div>


Ce modèle est très utile pour les pages responsive.


============================================================
6 — HEADER ET NAVIGATION
============================================================

Une interface professionnelle doit disposer d'un en-tête
clairement structuré.

Exemple :

<header class="site-header">

    <div class="container">

        <a
            href="index.html"
            class="logo"
        >
            Mon Site
        </a>

        <nav class="site-nav">

            <a href="index.html">
                Accueil
            </a>

            <a href="about.html">
                À propos
            </a>

            <a href="services.html">
                Services
            </a>

            <a href="contact.html">
                Contact
            </a>

        </nav>

    </div>

</header>


============================================================
7 — HERO SECTION
============================================================

La Hero Section est généralement une zone importante
située au début d'une page.

Elle peut contenir :

titre ;

description ;

bouton ;

image ;

illustration.


Exemple :

<section class="hero">

    <div class="container hero-grid">

        <div class="hero-content">

            <p class="eyebrow">
                Création Web
            </p>

            <h1>
                Construisez votre présence Web
            </h1>

            <p>
                Une interface claire, moderne et responsive.
            </p>

            <a
                href="services.html"
                class="btn"
            >
                Découvrir
            </a>

        </div>

        <div class="hero-media">
            <img
                src="images/hero.jpg"
                alt="Illustration de création Web"
            >
        </div>

    </div>

</section>


============================================================
8 — SECTIONS ET HIÉRARCHIE VISUELLE
============================================================

Chaque section doit avoir un rôle clair.

Exemple :

<section class="services">

    <div class="container">

        <h2>
            Nos services
        </h2>

        <p>
            Découvrez nos services.
        </p>

    </div>

</section>


La hiérarchie doit permettre à l'utilisateur de comprendre
rapidement la page.


============================================================
9 — SYSTÈME DE CARTES
============================================================

Les cartes permettent de présenter des informations
répétitives.

Exemple :

<div class="cards">

    <article class="card">

        <h3>
            Création Web
        </h3>

        <p>
            Création de sites Web.
        </p>

        <a href="#">
            En savoir plus
        </a>

    </article>

</div>


CSS :

.cards {
    display: grid;
    grid-template-columns:
        repeat(
            auto-fit,
            minmax(240px, 1fr)
        );
    gap: 20px;
}

.card {
    padding: 24px;
    border-radius: 16px;
    background: white;
    box-shadow:
        0 10px 30px
        rgba(0,0,0,.10);
}


============================================================
10 — BOUTONS RÉUTILISABLES
============================================================

Créer une classe réutilisable :

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-height: 44px;

    padding: 12px 20px;

    border: 0;

    border-radius: 10px;

    text-decoration: none;

    cursor: pointer;

    transition:
        transform .2s ease,
        box-shadow .2s ease;
}


.btn:hover {
    transform:
        translateY(-2px);
}


Un même composant peut être utilisé sur plusieurs pages.


============================================================
11 — VARIANTES DE COMPOSANTS
============================================================

On peut créer des variantes.

Exemple :

.btn-primary

.btn-secondary

.btn-outline

.btn-danger


HTML :

<a
    href="#"
    class="btn btn-primary"
>
    Commencer
</a>

<a
    href="#"
    class="btn btn-outline"
>
    En savoir plus
</a>


Cette approche permet de réutiliser une base commune.


============================================================
12 — FLEXBOX DANS UNE INTERFACE RÉELLE
============================================================

Flexbox peut être utilisé pour :

navigation ;

barres d'outils ;

alignement de boutons ;

groupes de cartes ;

header ;

footer.


Exemple :

.site-header .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
}


============================================================
13 — GRID DANS UNE INTERFACE RÉELLE
============================================================

Grid peut être utilisé pour :

galeries ;

cards ;

hero sections ;

dashboard ;

zones principales.


Exemple :

.hero-grid {
    display: grid;

    grid-template-columns:
        1fr 1fr;

    gap: 40px;

    align-items: center;
}


============================================================
14 — RESPONSIVE DESIGN RÉEL
============================================================

Une interface complète doit s'adapter.

Exemple :

.hero-grid {
    grid-template-columns:
        1fr 1fr;
}


Sur mobile :

@media (max-width: 768px) {

    .hero-grid {
        grid-template-columns:
            1fr;
    }

}


L'objectif n'est pas seulement de réduire les dimensions.

Il faut parfois modifier complètement la disposition.


============================================================
15 — NAVIGATION RESPONSIVE
============================================================

Sur grand écran :

navigation horizontale.

Sur petit écran :

navigation verticale ou transformée selon les fonctionnalités
disponibles.

Exemple :

.site-nav {
    display: flex;
    gap: 20px;
}

@media (max-width: 700px) {

    .site-nav {
        flex-direction: column;
        gap: 10px;
    }

}


============================================================
16 — FOOTER
============================================================

Le footer peut contenir :

navigation secondaire ;

contact ;

adresse ;

liens ;

copyright ;

informations légales.


Exemple :

<footer class="site-footer">

    <div class="container">

        <p>
            © 2026 Mon Site Web
        </p>

        <nav>
            <a href="about.html">
                À propos
            </a>

            <a href="contact.html">
                Contact
            </a>
        </nav>

    </div>

</footer>


============================================================
17 — FORMULAIRE PROFESSIONNEL
============================================================

Le HTML définit les champs.

CSS organise leur présentation.

Exemple :

.form-group {
    display: grid;
    gap: 8px;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
}


Le formulaire doit rester utilisable sur téléphone.


============================================================
18 — TABLEAUX RESPONSIVES
============================================================

Les tableaux larges peuvent provoquer un débordement
sur téléphone.

On peut créer un conteneur :

.table-wrapper {
    width: 100%;
    overflow-x: auto;
}


HTML :

<div class="table-wrapper">

    <table>
        ...
    </table>

</div>


============================================================
19 — IMAGES ET MÉDIAS
============================================================

Les médias doivent respecter leur conteneur.

Exemple :

.media img,
.media video {
    display: block;
    width: 100%;
    max-width: 100%;
    height: auto;
}


Pour une image dans une carte :

.card img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
}


============================================================
20 — GALERIE RESPONSIVE
============================================================

Une galerie peut utiliser Grid.

Exemple :

.gallery {
    display: grid;

    grid-template-columns:
        repeat(
            auto-fit,
            minmax(180px, 1fr)
        );

    gap: 16px;
}

.gallery img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
}


============================================================
21 — DESIGN SYSTEM SIMPLE
============================================================

Un projet peut définir des variables communes.

:root {

    --color-primary: #2563eb;

    --color-secondary: #7c3aed;

    --color-text: #0f172a;

    --color-muted: #64748b;

    --color-background: #f8fafc;

    --color-surface: #ffffff;

    --radius-small: 8px;

    --radius-medium: 14px;

    --spacing-small: 8px;

    --spacing-medium: 16px;

    --spacing-large: 32px;

}


Tous les composants peuvent réutiliser ces valeurs.


============================================================
22 — ÉTATS VISUELS
============================================================

Une interface doit indiquer visuellement les différents
états des composants.

Exemples :

normal ;

hover ;

focus ;

active ;

disabled ;

selected ;

checked ;

valid ;

invalid.


Ces états permettent à l'utilisateur de comprendre
l'interaction avec l'interface.


============================================================
23 — ACCESSIBILITÉ HTML + CSS
============================================================

L'accessibilité ne dépend pas uniquement du HTML.

CSS doit également préserver :

contraste ;

focus visible ;

lisibilité ;

espacement ;

taille des zones interactives ;

réduction des animations.


Les boutons et liens doivent être facilement identifiables.


============================================================
24 — MOBILE-FIRST
============================================================

Le mobile-first consiste à commencer par la présentation
destinée aux petits écrans.

Exemple :

.card-grid {
    display: grid;
    grid-template-columns: 1fr;
}


Puis :

@media (min-width: 768px) {

    .card-grid {
        grid-template-columns:
            repeat(2, 1fr);
    }

}


Puis éventuellement :

@media (min-width: 1100px) {

    .card-grid {
        grid-template-columns:
            repeat(3, 1fr);
    }

}


============================================================
25 — BREAKPOINTS
============================================================

Les breakpoints doivent être choisis en fonction du contenu
et non uniquement selon des modèles fixes d'appareils.

Exemple :

petit écran ;

écran moyen ;

grand écran.


L'objectif est de modifier le layout lorsque le contenu
commence à manquer d'espace.


============================================================
26 — PAGES MULTIPLES
============================================================

Un vrai site peut comporter plusieurs pages.

Exemple :

index.html

about.html

services.html

contact.html


Le même fichier CSS peut être utilisé par plusieurs pages.

Cela permet de conserver une identité visuelle cohérente.


============================================================
27 — COMPOSANTS RÉUTILISABLES
============================================================

Les composants CSS réutilisables peuvent comprendre :

container ;

btn ;

card ;

badge ;

alert ;

form-group ;

section ;

hero ;

gallery ;

table-wrapper.


Il faut éviter de créer inutilement une règle différente
pour chaque élément lorsque le même composant peut être
réutilisé.


============================================================
28 — COHÉRENCE VISUELLE
============================================================

Un site professionnel doit conserver une cohérence entre
ses pages.

Les éléments suivants doivent généralement rester cohérents :

couleurs ;

typographie ;

espacements ;

boutons ;

cartes ;

navigation ;

footer ;

rayons ;

ombres.


L'utilisateur doit reconnaître qu'il se trouve toujours
sur le même site.


============================================================
29 — HIÉRARCHIE DES CONTENUS
============================================================

La mise en page doit guider visuellement l'utilisateur.

On peut utiliser :

taille ;

contraste ;

espacement ;

position ;

groupement ;

répétition.


Un titre principal doit être identifiable.

Les sections doivent être séparées.

Les informations secondaires doivent être moins dominantes.


============================================================
30 — OPTIMISATION VISUELLE
============================================================

Une interface doit éviter :

trop de couleurs ;

trop d'ombres ;

trop d'animations ;

trop de tailles différentes ;

espacements incohérents ;

éléments inutiles.


Le CSS doit servir la compréhension et l'utilisation
de l'interface.


============================================================
31 — TEST RESPONSIVE
============================================================

Une page doit être testée sur plusieurs dimensions.

Vérifiez :

aucun débordement horizontal ;

aucun texte coupé ;

aucun bouton inaccessible ;

aucune image déformée ;

navigation utilisable ;

formulaire utilisable ;

tableau consultable ;

footer correctement affiché.


============================================================
32 — DÉBOGAGE DE L'INTÉGRATION
============================================================

Lorsqu'une interface ne fonctionne pas correctement,
vérifiez successivement :

1. Le fichier CSS est-il correctement lié ?

2. Le chemin du fichier est-il correct ?

3. Le sélecteur correspond-il à l'élément ?

4. La propriété existe-t-elle ?

5. La valeur est-elle valide ?

6. Une autre règle CSS écrase-t-elle la règle ?

7. La spécificité est-elle différente ?

8. Le parent possède-t-il une contrainte ?

9. Flexbox ou Grid est-il correctement configuré ?

10. Une media query modifie-t-elle le comportement ?


============================================================
33 — CONSTRUCTION D'UNE INTERFACE WEB COMPLÈTE
============================================================

Une interface complète peut suivre cette progression :

1. définir la structure HTML ;

2. créer les classes ;

3. connecter le fichier CSS ;

4. définir les variables ;

5. créer le conteneur ;

6. styliser le body ;

7. créer le header ;

8. créer la navigation ;

9. construire la Hero Section ;

10. créer les sections ;

11. créer les cartes ;

12. ajouter les images ;

13. construire les formulaires ;

14. organiser les tableaux ;

15. construire le footer ;

16. appliquer Flexbox ;

17. appliquer Grid ;

18. ajouter les états ;

19. ajouter les transitions ;

20. ajouter les animations nécessaires ;

21. créer les media queries ;

22. tester le mobile ;

23. tester la tablette ;

24. tester le bureau ;

25. corriger les problèmes ;

26. vérifier l'accessibilité ;

27. vérifier la cohérence ;

28. finaliser le projet.


============================================================
RÈGLE FONDAMENTALE DU CHAPITRE D
============================================================

Ne pas écrire du HTML et du CSS au hasard.

Chaque élément HTML doit avoir une fonction.

Chaque classe CSS doit avoir une raison.

Chaque règle CSS doit contribuer à la présentation,
à l'organisation, à la lisibilité, à l'accessibilité
ou à l'adaptation de l'interface.

HTML construit.

CSS organise et présente.

L'intégration des deux permet de construire une véritable
interface Web.`,

    pratique:
`TRAVAUX PRATIQUES — INTÉGRATION HTML + CSS

Objectif :

Construire progressivement une véritable interface Web
à partir des connaissances acquises dans les Chapitres B et C.


------------------------------------------------------------
TP 1 — CRÉER LE PROJET
------------------------------------------------------------

Créez :

mon-site/

index.html

about.html

services.html

contact.html

css/style.css

images/


------------------------------------------------------------
TP 2 — RELIER HTML ET CSS
------------------------------------------------------------

Reliez toutes les pages à :

css/style.css

Vérifiez que le CSS est chargé correctement.


------------------------------------------------------------
TP 3 — CRÉER LE CONTENEUR
------------------------------------------------------------

Créez une classe :

.container

Utilisez :

width ;

max-width ;

margin ;

padding.


------------------------------------------------------------
TP 4 — HEADER
------------------------------------------------------------

Construisez un header professionnel avec :

logo ;

navigation ;

conteneur.


------------------------------------------------------------
TP 5 — NAVIGATION
------------------------------------------------------------

Créez une navigation reliant :

Accueil ;

À propos ;

Services ;

Contact.


------------------------------------------------------------
TP 6 — HERO
------------------------------------------------------------

Créez une Hero Section avec :

h1 ;

paragraphe ;

bouton ;

image.


------------------------------------------------------------
TP 7 — FLEXBOX
------------------------------------------------------------

Utilisez Flexbox pour organiser le header et la navigation.


------------------------------------------------------------
TP 8 — GRID
------------------------------------------------------------

Créez une grille de trois cartes de services.


------------------------------------------------------------
TP 9 — CARTES
------------------------------------------------------------

Créez plusieurs cards avec :

titre ;

texte ;

lien ;

padding ;

border ;

border-radius ;

box-shadow.


------------------------------------------------------------
TP 10 — BOUTONS
------------------------------------------------------------

Créez :

btn-primary ;

btn-secondary ;

btn-outline.


------------------------------------------------------------
TP 11 — FORMULAIRE
------------------------------------------------------------

Créez une page contact avec un formulaire professionnel.


------------------------------------------------------------
TP 12 — ÉTATS DU FORMULAIRE
------------------------------------------------------------

Stylisez :

focus ;

valid ;

invalid ;

disabled ;

required.


------------------------------------------------------------
TP 13 — TABLEAU
------------------------------------------------------------

Créez un tableau responsive avec un wrapper
overflow-x: auto.


------------------------------------------------------------
TP 14 — GALERIE
------------------------------------------------------------

Créez une galerie responsive avec CSS Grid.


------------------------------------------------------------
TP 15 — IMAGES
------------------------------------------------------------

Rendez toutes les images responsives.


------------------------------------------------------------
TP 16 — FOOTER
------------------------------------------------------------

Créez un footer commun aux différentes pages.


------------------------------------------------------------
TP 17 — VARIABLES
------------------------------------------------------------

Créez un mini design system avec :

couleurs ;

rayons ;

espacements.


------------------------------------------------------------
TP 18 — COMPOSANTS
------------------------------------------------------------

Créez des classes réutilisables :

container ;

btn ;

card ;

badge ;

form-group.


------------------------------------------------------------
TP 19 — RESPONSIVE
------------------------------------------------------------

Créez une première version mobile.

Puis adaptez-la à la tablette et au bureau.


------------------------------------------------------------
TP 20 — MOBILE-FIRST
------------------------------------------------------------

Construisez une grille :

1 colonne mobile ;

2 colonnes tablette ;

3 colonnes bureau.


------------------------------------------------------------
TP 21 — NAVIGATION RESPONSIVE
------------------------------------------------------------

Adaptez la navigation aux petits écrans.


------------------------------------------------------------
TP 22 — HERO RESPONSIVE
------------------------------------------------------------

Sur ordinateur :

texte + image côte à côte.

Sur mobile :

texte puis image.


------------------------------------------------------------
TP 23 — CARTES RESPONSIVES
------------------------------------------------------------

Faites passer les cartes :

3 colonnes ;

2 colonnes ;

1 colonne.


------------------------------------------------------------
TP 24 — FORMULAIRE RESPONSIVE
------------------------------------------------------------

Assurez-vous que tous les champs utilisent correctement
la largeur disponible.


------------------------------------------------------------
TP 25 — TABLEAU RESPONSIVE
------------------------------------------------------------

Testez le tableau sur un écran étroit.

Corrigez tout débordement.


------------------------------------------------------------
TP 26 — ACCESSIBILITÉ
------------------------------------------------------------

Ajoutez :

focus-visible ;

contraste suffisant ;

zones interactives correctement dimensionnées.


------------------------------------------------------------
TP 27 — TRANSITIONS
------------------------------------------------------------

Ajoutez des transitions aux boutons et aux cartes.


------------------------------------------------------------
TP 28 — ANIMATIONS
------------------------------------------------------------

Ajoutez une animation d'apparition légère à une section.


------------------------------------------------------------
TP 29 — TEST DES MÉDIAS
------------------------------------------------------------

Testez :

images ;

audio ;

vidéo.


Vérifiez leur adaptation aux différents écrans.


------------------------------------------------------------
TP 30 — MULTI-PAGES
------------------------------------------------------------

Assurez-vous que les quatre pages utilisent la même identité
visuelle.


------------------------------------------------------------
TP 31 — DEBUG
------------------------------------------------------------

Utilisez les outils du navigateur pour rechercher
une erreur CSS volontairement introduite.


------------------------------------------------------------
TP 32 — TEST RESPONSIVE
------------------------------------------------------------

Testez le site sur :

petit écran ;

écran moyen ;

grand écran.


Vérifiez :

largeur ;

navigation ;

images ;

texte ;

boutons ;

tableaux.


------------------------------------------------------------
TP 33 — PROJET INTÉGRÉ
------------------------------------------------------------

Construisez une interface complète contenant :

header ;

nav ;

hero ;

sections ;

cards ;

gallery ;

formulaire ;

tableau ;

footer.

Le site doit être responsive et utiliser le CSS de manière
organisée.`,

    exercices: [

        "Exercice 1 — Créer une structure de projet contenant quatre pages HTML et un fichier CSS externe.",

        "Exercice 2 — Relier quatre pages HTML au même fichier CSS.",

        "Exercice 3 — Créer un conteneur responsive avec width, max-width, margin et padding.",

        "Exercice 4 — Créer un header contenant un logo et une navigation.",

        "Exercice 5 — Construire une navigation reliant quatre pages HTML.",

        "Exercice 6 — Créer une Hero Section avec titre, paragraphe, bouton et image.",

        "Exercice 7 — Organiser une Hero Section avec Flexbox.",

        "Exercice 8 — Organiser une Hero Section avec CSS Grid.",

        "Exercice 9 — Créer une carte réutilisable pour présenter un service.",

        "Exercice 10 — Créer trois cartes utilisant exactement la même classe CSS.",

        "Exercice 11 — Créer trois variantes de bouton avec des classes réutilisables.",

        "Exercice 12 — Ajouter des effets hover et focus aux boutons.",

        "Exercice 13 — Créer une grille responsive de cartes avec auto-fit et minmax().",

        "Exercice 14 — Créer une galerie responsive avec CSS Grid.",

        "Exercice 15 — Rendre toutes les images d'une page responsives.",

        "Exercice 16 — Créer un formulaire professionnel avec HTML et CSS.",

        "Exercice 17 — Styliser les états focus, valid, invalid et disabled d'un formulaire.",

        "Exercice 18 — Créer un tableau placé dans un conteneur responsive.",

        "Exercice 19 — Construire un footer réutilisable sur plusieurs pages.",

        "Exercice 20 — Créer des variables CSS pour les couleurs, espacements et rayons.",

        "Exercice 21 — Créer un système de composants avec container, card, button et form-group.",

        "Exercice 22 — Construire une interface mobile-first.",

        "Exercice 23 — Ajouter un breakpoint pour tablette.",

        "Exercice 24 — Ajouter un breakpoint pour grand écran.",

        "Exercice 25 — Transformer une grille de trois colonnes en une colonne sur mobile.",

        "Exercice 26 — Transformer une Hero Section horizontale en disposition verticale sur mobile.",

        "Exercice 27 — Créer une navigation qui change de disposition sur petit écran.",

        "Exercice 28 — Vérifier qu'une page ne produit aucun débordement horizontal.",

        "Exercice 29 — Ajouter une transition aux cartes.",

        "Exercice 30 — Ajouter une animation CSS légère à une section.",

        "Exercice 31 — Ajouter un focus-visible accessible aux boutons et liens.",

        "Exercice 32 — Créer une galerie combinant images, texte et boutons.",

        "Exercice 33 — Créer une section de services avec quatre cartes responsive.",

        "Exercice 34 — Créer une page À propos complète avec plusieurs sections.",

        "Exercice 35 — Créer une page Services avec cards, boutons et images.",

        "Exercice 36 — Créer une page Contact avec formulaire et informations de contact.",

        "Exercice 37 — Utiliser Flexbox pour aligner correctement un header.",

        "Exercice 38 — Utiliser Grid pour construire un layout principal avec contenu et aside.",

        "Exercice 39 — Créer un layout avec header, nav, main, section, aside et footer.",

        "Exercice 40 — Créer un design cohérent utilisant les mêmes variables CSS sur toutes les pages.",

        "Exercice 41 — Tester le site sur téléphone et corriger les problèmes de mise en page.",

        "Exercice 42 — Tester le site sur tablette et corriger les problèmes de mise en page.",

        "Exercice 43 — Tester le site sur ordinateur et corriger les problèmes de mise en page.",

        "Exercice 44 — Identifier une règle CSS qui est écrasée par une autre règle et expliquer pourquoi.",

        "Exercice 45 — Corriger un problème de spécificité dans une interface.",

        "Exercice 46 — Créer une page avec une identité visuelle cohérente comprenant couleurs, typographie, espacements et composants.",

        "Exercice 47 — Construire un mini-site de quatre pages entièrement responsive.",

        "Exercice 48 — Transformer une page HTML simple du Chapitre B en interface professionnelle avec les techniques du Chapitre C et du Chapitre D.",

        "Exercice 49 — Tester l'accessibilité visuelle et le comportement responsive d'une interface.",

        "Exercice 50 — Construire et présenter une interface Web complète réalisée avec HTML et CSS."
    ],

    devoirs:
`DEVOIR FINAL — CRÉATION D'UN SITE WEB COMPLET RESPONSIVE

Objectif :

Construire un véritable mini-site Web en combinant
les connaissances des Chapitres B, C et D.

Le projet doit démontrer que l'étudiant sait passer
de la structure HTML à une interface Web complète.


============================================================
1 — STRUCTURE DU PROJET
============================================================

Le projet doit contenir au minimum :

index.html

about.html

services.html

contact.html

css/

    style.css

images/


Les pages doivent être reliées entre elles.


============================================================
2 — PAGE D'ACCUEIL
============================================================

index.html doit contenir :

header ;

nav ;

main ;

hero ;

section ;

article ;

aside ;

footer.


La Hero Section doit présenter :

un titre principal ;

une description ;

un bouton ;

une image ou illustration.


============================================================
3 — PAGE À PROPOS
============================================================

about.html doit contenir :

titre ;

présentation ;

plusieurs sections ;

images ;

liste ;

au moins une carte d'information.


============================================================
4 — PAGE SERVICES
============================================================

services.html doit présenter plusieurs services.

Chaque service doit être présenté dans une carte.

Les cartes doivent être organisées avec :

CSS Grid ou Flexbox.


============================================================
5 — PAGE CONTACT
============================================================

contact.html doit contenir :

informations de contact ;

formulaire ;

label ;

input ;

textarea ;

select ;

button ;

fieldset ;

legend.


Le formulaire doit être responsive.


============================================================
6 — IDENTITÉ VISUELLE
============================================================

Définissez dans :root :

couleur principale ;

couleur secondaire ;

couleur du texte ;

couleur du fond ;

couleur de surface ;

rayons ;

espacements.


Utilisez les variables dans l'ensemble du projet.


============================================================
7 — TYPOGRAPHIE
============================================================

Définissez une hiérarchie claire pour :

h1 ;

h2 ;

h3 ;

p ;

li ;

liens.


Le texte doit rester lisible sur téléphone.


============================================================
8 — CONTENEUR
============================================================

Créez une classe :

.container

Elle doit contrôler la largeur maximale du contenu.


============================================================
9 — NAVIGATION
============================================================

La navigation doit :

relier toutes les pages ;

être clairement visible ;

posséder des états hover et focus ;

s'adapter aux petits écrans.


============================================================
10 — HERO
============================================================

La Hero Section doit être organisée avec :

Flexbox ou Grid.

Elle doit passer à une disposition adaptée sur mobile.


============================================================
11 — SERVICES
============================================================

Créez au minimum quatre cartes.

Chaque carte doit contenir :

titre ;

description ;

lien ou bouton.


Les cartes doivent être responsives.


============================================================
12 — GALERIE
============================================================

Ajoutez une galerie d'images responsive.

Utilisez :

CSS Grid ;

gap ;

object-fit ;

aspect-ratio.


============================================================
13 — FORMULAIRE
============================================================

Le formulaire doit utiliser des styles pour :

focus ;

valid ;

invalid ;

disabled ;

hover.


Les champs doivent avoir une largeur adaptée
aux petits écrans.


============================================================
14 — TABLEAU
============================================================

Ajoutez un tableau sur une page appropriée.

Le tableau doit être placé dans un conteneur permettant
le défilement horizontal sur petit écran si nécessaire.


============================================================
15 — FOOTER
============================================================

Toutes les pages doivent posséder un footer cohérent.

Le footer doit contenir :

nom du site ;

copyright ;

liens utiles ;

informations complémentaires.


============================================================
16 — RESPONSIVE DESIGN
============================================================

Le site doit fonctionner sur :

téléphone ;

tablette ;

ordinateur.


Utilisez une approche mobile-first.

Ajoutez les media queries nécessaires.


============================================================
17 — FLEXBOX
============================================================

Utilisez Flexbox au minimum pour :

navigation ;

header ;

ou une autre partie importante du projet.


============================================================
18 — CSS GRID
============================================================

Utilisez Grid au minimum pour :

services ;

galerie ;

ou une autre partie importante du projet.


============================================================
19 — COMPOSANTS RÉUTILISABLES
============================================================

Le projet doit utiliser des classes réutilisables.

Exemples :

container ;

btn ;

card ;

badge ;

form-group.


============================================================
20 — EFFETS
============================================================

Ajoutez raisonnablement :

hover ;

transition ;

transform ;

box-shadow.


Les effets doivent rester utiles et ne doivent pas nuire
à la lisibilité.


============================================================
21 — ACCESSIBILITÉ
============================================================

Vérifiez :

contraste ;

focus visible ;

lisibilité ;

taille des zones interactives ;

alt des images ;

structure des titres.


Ajoutez :

:focus-visible


Si des animations sont utilisées, prévoyez une gestion
appropriée de :

prefers-reduced-motion.


============================================================
22 — COHÉRENCE
============================================================

Toutes les pages doivent utiliser :

mêmes couleurs ;

même typographie ;

mêmes boutons ;

mêmes cartes ;

mêmes espacements ;

même navigation ;

même footer.


Le site doit donner l'impression d'être un seul projet.


============================================================
23 — QUALITÉ DU CODE
============================================================

Le code doit être :

indenté ;

lisible ;

organisé ;

commenté lorsque nécessaire ;

sans répétitions inutiles ;

sans balises mal imbriquées ;

sans règles CSS inutiles.


============================================================
24 — TEST
============================================================

Tester :

toutes les pages ;

tous les liens ;

les images ;

le formulaire ;

les boutons ;

la navigation ;

le tableau ;

la galerie ;

les différentes tailles d'écran.


============================================================
25 — CORRECTION DES PROBLÈMES
============================================================

L'étudiant doit rechercher et corriger :

débordement horizontal ;

images déformées ;

texte coupé ;

boutons trop petits ;

espacement incorrect ;

navigation cassée ;

grille non responsive ;

formulaire trop large ;

règles CSS contradictoires.


============================================================
26 — TEST DANS LE LABORATOIRE FOBAS
============================================================

Ouvrez le projet dans le Laboratoire FOBAS.

Chargez :

index.html

Vérifiez le rendu.

Naviguez ensuite vers :

about.html

services.html

contact.html


============================================================
27 — PRÉSENTATION FINALE
============================================================

L'étudiant doit être capable d'expliquer :

comment HTML construit la structure ;

comment CSS modifie la présentation ;

comment fonctionne le conteneur ;

pourquoi utiliser Flexbox ;

pourquoi utiliser Grid ;

comment fonctionne le responsive design ;

pourquoi utiliser les variables CSS ;

comment fonctionne une media query ;

comment corriger un problème CSS.


============================================================
OBJECTIF FINAL
============================================================

À la fin du Chapitre D, l'étudiant doit être capable de
prendre une structure HTML et de la transformer en un
véritable site Web complet.

Il doit savoir :

construire plusieurs pages ;

relier les pages ;

organiser le projet ;

utiliser un fichier CSS externe ;

créer des composants réutilisables ;

utiliser Flexbox ;

utiliser Grid ;

créer une Hero Section ;

créer des cartes ;

créer des formulaires stylisés ;

créer des galeries ;

créer des tableaux responsives ;

créer une navigation responsive ;

utiliser les variables CSS ;

gérer les états visuels ;

ajouter des transitions ;

utiliser des animations avec modération ;

respecter les principes d'accessibilité ;

tester différentes tailles d'écran ;

déboguer HTML + CSS ;

maintenir une cohérence visuelle.


============================================================
RÉSULTAT ATTENDU
============================================================

L'étudiant ne doit plus seulement savoir écrire des balises
HTML ou des règles CSS isolées.

Il doit être capable de combiner les deux technologies pour
produire une interface Web réelle, structurée, responsive,
accessible et cohérente.

HTML construit la structure.

CSS donne la présentation.

L'intégration HTML + CSS produit l'interface Web.

La prochaine étape pourra alors introduire JavaScript pour
ajouter la logique, les événements, les interactions et le
comportement dynamique aux interfaces construites.`
},
















{
    id: "E",

    title:
        "E — JavaScript et création d'interfaces Web interactives",

    theorie:
`CHAPITRE E — JAVASCRIPT

Dans les Chapitres B et C, nous avons appris à construire
la structure et la présentation des pages Web.

Dans le Chapitre D, nous avons combiné HTML et CSS pour
construire des interfaces Web complètes, responsive,
accessibles et cohérentes.

Dans ce Chapitre E, nous allons apprendre JavaScript,
le langage qui permet d'ajouter de la logique, des
événements, des interactions, des calculs, des validations,
des modifications dynamiques du contenu et des comportements
interactifs aux interfaces Web.

HTML = STRUCTURE
CSS = PRÉSENTATION
JAVASCRIPT = LOGIQUE + INTERACTION + COMPORTEMENT

HTML construit les éléments.

CSS organise et présente les éléments.

JavaScript permet à la page de réagir aux actions de
l'utilisateur et de modifier son comportement.

Exemple :

HTML :

<button id="btn">
    Cliquer
</button>

JavaScript :

const btn = document.querySelector("#btn");

btn.addEventListener("click", function () {
    alert("Bonjour !");
});

L'utilisateur clique.

JavaScript détecte l'événement.

JavaScript exécute une action.


============================================================
ILLUSTRATION VISUELLE — HTML + CSS + JAVASCRIPT
============================================================

<div style="
    width:100%;
    margin:25px auto;
    padding:18px;
    border-radius:22px;
    background:linear-gradient(145deg,#020617,#172554,#312e81);
    box-shadow:0 25px 55px rgba(0,0,0,.38);
    overflow:hidden;
">

<svg
    viewBox="0 0 1200 780"
    width="100%"
    role="img"
    aria-label="Illustration montrant HTML, CSS et JavaScript construisant une interface Web interactive"
    style="
        display:block;
        width:100%;
        height:auto;
        min-height:560px;
    "
>

<defs>

    <linearGradient
        id="eBackground"
        x1="0"
        y1="0"
        x2="1"
        y2="1"
    >
        <stop offset="0%" stop-color="#020617"/>
        <stop offset="50%" stop-color="#172554"/>
        <stop offset="100%" stop-color="#312e81"/>
    </linearGradient>

    <linearGradient
        id="eHtml"
        x1="0"
        y1="0"
        x2="1"
        y2="1"
    >
        <stop offset="0%" stop-color="#fb923c"/>
        <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>

    <linearGradient
        id="eCss"
        x1="0"
        y1="0"
        x2="1"
        y2="1"
    >
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>

    <linearGradient
        id="eJs"
        x1="0"
        y1="0"
        x2="1"
        y2="1"
    >
        <stop offset="0%" stop-color="#fde047"/>
        <stop offset="100%" stop-color="#eab308"/>
    </linearGradient>

    <linearGradient
        id="eInterface"
        x1="0"
        y1="0"
        x2="1"
        y2="1"
    >
        <stop offset="0%" stop-color="#a78bfa"/>
        <stop offset="100%"
            stop-color="#7c3aed"
        />
    </linearGradient>

    <linearGradient
        id="eInteractive"
        x1="0"
        y1="0"
        x2="1"
        y2="1"
    >
        <stop offset="0%" stop-color="#34d399"/>
        <stop offset="100%" stop-color="#059669"/>
    </linearGradient>

    <filter id="eShadow">
        <feDropShadow
            dx="0"
            dy="18"
            stdDeviation="14"
            flood-opacity=".42"
        />
    </filter>

</defs>


<rect
    x="0"
    y="0"
    width="1200"
    height="780"
    rx="35"
    fill="url(#eBackground)"
/>


<text
    x="600"
    y="58"
    text-anchor="middle"
    fill="#ffffff"
    font-size="34"
    font-weight="700"
    font-family="Arial, sans-serif"
>
    HTML + CSS + JAVASCRIPT
</text>

<text
    x="600"
    y="90"
    text-anchor="middle"
    fill="#cbd5e1"
    font-size="18"
    font-family="Arial, sans-serif"
>
    Structure → Design → Logique → Interaction
</text>


<!-- HTML -->

<g filter="url(#eShadow)">

    <polygon
        points="80,190 255,145 345,195 170,240"
        fill="#fdba74"
    />

    <polygon
        points="80,190 170,240 170,390 80,340"
        fill="#c2410c"
    />

    <polygon
        points="170,240 345,195 345,345 170,390"
        fill="url(#eHtml)"
    />

    <text
        x="257"
        y="278"
        text-anchor="middle"
        fill="#ffffff"
        font-size="27"
        font-weight="700"
        font-family="Arial, sans-serif"
    >
        HTML
    </text>

    <text
        x="257"
        y="309"
        text-anchor="middle"
        fill="#fee2e2"
        font-size="17"
        font-family="Arial, sans-serif"
    >
        STRUCTURE
    </text>

</g>


<!-- CSS -->

<g filter="url(#eShadow)">

    <polygon
        points="855,190 1030,145 1120,195 945,240"
        fill="#7dd3fc"
    />

    <polygon
        points="855,190 945,240 945,390 855,340"
        fill="#1d4ed8"
    />

    <polygon
        points="945,240 1120,195 1120,345 945,390"
        fill="url(#eCss)"
    />

    <text
        x="1032"
        y="278"
        text-anchor="middle"
        fill="#ffffff"
        font-size="27"
        font-weight="700"
        font-family="Arial, sans-serif"
    >
        CSS
    </text>

    <text
        x="1032"
        y="309"
        text-anchor="middle"
        fill="#dbeafe"
        font-size="17"
        font-family="Arial, sans-serif"
    >
        PRÉSENTATION
    </text>

</g>


<!-- JAVASCRIPT -->

<g filter="url(#eShadow)">

    <polygon
        points="400,215 600,165 800,215 600,265"
        fill="#fef08a"
    />

    <polygon
        points="400,215 600,265 600,450 400,400"
        fill="#a16207"
    />

    <polygon
        points="600,265 800,215 800,400 600,450"
        fill="url(#eJs)"
    />

    <text
        x="700"
        y="315"
        text-anchor="middle"
        fill="#111827"
        font-size="30"
        font-weight="700"
        font-family="Arial, sans-serif"
    >
        JAVASCRIPT
    </text>

    <text
        x="700"
        y="348"
        text-anchor="middle"
        fill="#422006"
        font-size="17"
        font-family="Arial, sans-serif"
    >
        LOGIQUE + INTERACTION
    </text>

    <text
        x="700"
        y="382"
        text-anchor="middle"
        fill="#111827"
        font-size="14"
        font-family="monospace"
    >
        events • DOM • fonctions • données
    </text>

</g>


<!-- INTERFACE -->

<g filter="url(#eShadow)">

    <polygon
        points="350,435 690,350 850,425 510,510"
        fill="#c4b5fd"
    />

    <polygon
        points="350,435 510,510 510,690 350,615"
        fill="#5b21b6"
    />

    <polygon
        points="510,510 850,425 850,605 510,690"
        fill="url(#eInterface)"
    />

    <!-- browser -->

    <rect
        x="555"
        y="470"
        width="250"
        height="120"
        rx="12"
        fill="#ffffff"
        opacity=".97"
    />

    <rect
        x="555"
        y="470"
        width="250"
        height="24"
        rx="12"
        fill="#e2e8f0"
    />

    <circle
        cx="573"
        cy="482"
        r="4"
        fill="#ef4444"
    />

    <circle
        cx="587"
        cy="482"
        r="4"
        fill="#f59e0b"
    />

    <circle
        cx="601"
        cy="482"
        r="4"
        fill="#22c55e"
    />

    <rect
        x="575"
        y="510"
        width="205"
        height="15"
        rx="5"
        fill="#dbeafe"
    />

    <rect
        x="575"
        y="538"
        width="85"
        height="34"
        rx="7"
        fill="#c4b5fd"
    />

    <rect
        x="672"
        y="538"
        width="108"
        height="12"
        rx="5"
        fill="#e2e8f0"
    />

    <rect
        x="672"
        y="557"
        width="85"
        height="10"
        rx="5"
        fill="#e2e8f0"
    />

</g>


<!-- INTERACTIVE COMPONENTS -->

<g filter="url(#eShadow)">

    <rect
        x="110"
        y="500"
        width="180"
        height="90"
        rx="18"
        fill="#064e3b"
        stroke="#34d399"
        stroke-width="5"
    />

    <text
        x="200"
        y="535"
        text-anchor="middle"
        fill="#a7f3d0"
        font-size="18"
        font-weight="700"
        font-family="Arial, sans-serif"
    >
        ÉVÉNEMENT
    </text>

    <text
        x="200"
        y="563"
        text-anchor="middle"
        fill="#ffffff"
        font-size="15"
        font-family="monospace"
    >
        click()
    </text>


    <rect
        x="900"
        y="500"
        width="180"
        height="90"
        rx="18"
        fill="#064e3b"
        stroke="#34d399"
        stroke-width="5"
    />

    <text
        x="990"
        y="535"
        text-anchor="middle"
        fill="#a7f3d0"
        font-size="18"
        font-weight="700"
        font-family="Arial, sans-serif"
    >
        DOM
    </text>

    <text
        x="990"
        y="563"
        text-anchor="middle"
        fill="#ffffff"
        font-size="15"
        font-family="monospace"
    >
        modify()
    </text>

</g>


<!-- CONNECTIONS -->

<path
    d="M345 270 C400 270 430 270 470 285"
    fill="none"
    stroke="#ffffff"
    stroke-width="4"
    stroke-dasharray="12 9"
/>

<path
    d="M730 285 C800 270 840 270 855 270"
    fill="none"
    stroke="#ffffff"
    stroke-width="4"
    stroke-dasharray="12 9"
/>

<path
    d="M600 450 C600 470 600 480 600 500"
    fill="none"
    stroke="#fde047"
    stroke-width="5"
    stroke-dasharray="10 8"
/>

<path
    d="M290 545 C350 545 390 545 510 570"
    fill="none"
    stroke="#34d399"
    stroke-width="4"
    stroke-dasharray="10 8"
/>

<path
    d="M850 550 C875 550 885 545 900 545"
    fill="none"
    stroke="#34d399"
    stroke-width="4"
    stroke-dasharray="10 8"
/>


<text
    x="600"
    y="735"
    text-anchor="middle"
    fill="#e2e8f0"
    font-size="17"
    font-family="Arial, sans-serif"
>
    HTML → STRUCTURE | CSS → DESIGN | JAVASCRIPT → LOGIQUE + INTERACTION
</text>

</svg>
</div>


============================================================
1 — QU'EST-CE QUE JAVASCRIPT ?
============================================================

JavaScript est un langage de programmation utilisé notamment
pour rendre les pages Web interactives et dynamiques.

Il peut :

modifier le contenu HTML ;

modifier les styles ;

réagir aux événements ;

effectuer des calculs ;

contrôler des formulaires ;

valider des données ;

manipuler des tableaux ;

manipuler des objets ;

stocker des données localement ;

communiquer avec des serveurs ;

consommer des API ;

créer des interfaces dynamiques.


============================================================
2 — HTML + CSS + JAVASCRIPT
============================================================

Une application Web peut être comprise ainsi :

HTML
    ↓
Structure

CSS
    ↓
Présentation

JavaScript
    ↓
Logique et comportement


Exemple :

HTML :

<button id="counterButton">
    Ajouter
</button>

<p id="counterValue">
    0
</p>


JavaScript :

let counter = 0;

const button =
    document.querySelector("#counterButton");

const value =
    document.querySelector("#counterValue");

button.addEventListener("click", () => {

    counter++;

    value.textContent = counter;

});


Le HTML crée les éléments.

Le CSS peut les présenter.

JavaScript contrôle le comportement.


============================================================
3 — COMMENT CHARGER JAVASCRIPT
============================================================

Méthode recommandée :

<script src="js/app.js"></script>

Il est généralement préférable de placer le script
avant la fermeture de :

</body>


On peut également utiliser :

<script
    src="js/app.js"
    defer
></script>


Avec defer, le navigateur charge le script tout en
préparant la page et exécute le script après l'analyse
du document HTML.


============================================================
4 — PREMIER PROGRAMME
============================================================

Exemple :

console.log("Bonjour JavaScript");


La fonction console.log() permet d'afficher une information
dans la console du navigateur.

La console est particulièrement utile pour le développement
et le débogage.


============================================================
5 — COMMENTAIRES
============================================================

Commentaire sur une ligne :

// Ceci est un commentaire


Commentaire sur plusieurs lignes :

/*
    Ceci est un commentaire
    sur plusieurs lignes.
*/


Les commentaires servent à expliquer le code lorsque cela
est nécessaire.


============================================================
6 — VARIABLES
============================================================

JavaScript permet de créer des variables.

Exemple :

let nom = "FOBAS";

const ageMinimum = 18;


Utilisez :

let

lorsqu'une variable doit pouvoir être réaffectée.

Utilisez :

const

lorsque la référence ne doit pas être réaffectée.


Exemple :

let compteur = 0;

compteur = 1;


Avec const :

const site = "FOBAS";


============================================================
7 — TYPES DE DONNÉES
============================================================

JavaScript possède plusieurs types de données.

Exemples :

String :

const nom = "Jean";


Number :

const age = 25;


Boolean :

const actif = true;


Undefined :

let valeur;


Null :

const resultat = null;


Object :

const utilisateur = {
    nom: "Jean",
    age: 25
};


Array :

const langues = [
    "HTML",
    "CSS",
    "JavaScript"
];


============================================================
8 — STRING
============================================================

Une chaîne de caractères est un texte.

Exemple :

const message = "Bonjour";


On peut utiliser les template literals :

const nom = "Jean";

const message =
    \`Bonjour \${nom}\`;


Cela permet d'intégrer des variables dans une chaîne.


============================================================
9 — NOMBRES
============================================================

Exemples :

const a = 10;
const b = 5;

const addition = a + b;
const soustraction = a - b;
const multiplication = a * b;
const division = a / b;


JavaScript peut également utiliser :

%

pour obtenir le reste d'une division.


Exemple :

const reste = 10 % 3;


Résultat :

1


============================================================
10 — OPÉRATEURS
============================================================

Opérateurs arithmétiques :

+

-

*

/

%

**


Opérateurs de comparaison :

===

!==

>

<

>=

<=


Opérateurs logiques :

&&

||

!


Il est recommandé de privilégier :

===

plutôt que des comparaisons implicites lorsque cela
correspond au besoin.


============================================================
11 — INCRÉMENTATION ET DÉCRÉMENTATION
============================================================

Exemple :

let compteur = 0;

compteur++;

compteur--;


On peut également écrire :

compteur += 5;

compteur -= 2;

compteur *= 2;

compteur /= 2;


============================================================
12 — CONDITIONS
============================================================

JavaScript peut prendre des décisions.

Exemple :

const age = 20;

if (age >= 18) {

    console.log("Majeur");

} else {

    console.log("Mineur");

}


Plusieurs conditions :

if (score >= 90) {

    console.log("Excellent");

} else if (score >= 75) {

    console.log("Très bien");

} else {

    console.log("À améliorer");

}


============================================================
13 — OPÉRATEUR TERNAIRE
============================================================

Exemple :

const age = 20;

const statut =
    age >= 18
        ? "Majeur"
        : "Mineur";


L'opérateur ternaire est utile pour des décisions simples.

Il ne faut pas l'utiliser pour remplacer des conditions
complexes difficiles à lire.


============================================================
14 — SWITCH
============================================================

Exemple :

const niveau = "débutant";

switch (niveau) {

    case "débutant":
        console.log("Niveau 1");
        break;

    case "intermédiaire":
        console.log("Niveau 2");
        break;

    case "expert":
        console.log("Niveau 3");
        break;

    default:
        console.log("Niveau inconnu");

}


============================================================
15 — BOUCLE FOR
============================================================

Exemple :

for (
    let i = 0;
    i < 5;
    i++
) {

    console.log(i);

}


Les boucles permettent de répéter une opération.


============================================================
16 — BOUCLE WHILE
============================================================

Exemple :

let compteur = 0;

while (compteur < 5) {

    console.log(compteur);

    compteur++;

}


La condition doit pouvoir devenir fausse afin d'éviter
une boucle infinie.


============================================================
17 — BOUCLE DO...WHILE
============================================================

Exemple :

let nombre = 0;

do {

    console.log(nombre);

    nombre++;

} while (nombre < 5);


Le bloc est exécuté au moins une fois.


============================================================
18 — BREAK ET CONTINUE
============================================================

break permet d'arrêter une boucle.

Exemple :

for (
    let i = 0;
    i < 10;
    i++
) {

    if (i === 5) {
        break;
    }

}


continue permet de passer à l'itération suivante.


============================================================
19 — FONCTIONS
============================================================

Une fonction regroupe une logique réutilisable.

Exemple :

function saluer() {

    console.log("Bonjour");

}


Appel :

saluer();


============================================================
20 — PARAMÈTRES ET RETOUR
============================================================

Exemple :

function additionner(a, b) {

    return a + b;

}


Utilisation :

const resultat =
    additionner(10, 5);


Une fonction peut recevoir des paramètres et retourner
une valeur.


============================================================
21 — FONCTIONS FLÉCHÉES
============================================================

Exemple :

const additionner =
    (a, b) => {

        return a + b;

    };


Pour une expression simple :

const carre =
    nombre => nombre * nombre;


Les fonctions fléchées sont très utilisées dans
les applications JavaScript modernes.


============================================================
22 — PORTÉE DES VARIABLES
============================================================

Les variables déclarées avec let et const respectent
la portée des blocs.

Exemple :

if (true) {

    let message = "Bonjour";

}


message n'est pas accessible en dehors de ce bloc.


Une bonne gestion de la portée permet d'éviter
des conflits et des comportements inattendus.


============================================================
23 — DOM
============================================================

DOM signifie :

Document Object Model.

Le navigateur transforme le document HTML en une structure
que JavaScript peut manipuler.

JavaScript peut ainsi :

chercher des éléments ;

modifier leur contenu ;

modifier leurs attributs ;

modifier leurs classes ;

créer des éléments ;

supprimer des éléments ;

écouter des événements.


============================================================
24 — SÉLECTIONNER UN ÉLÉMENT
============================================================

Exemple :

const titre =
    document.querySelector("h1");


Avec un ID :

const bouton =
    document.querySelector("#btn");


Avec une classe :

const cartes =
    document.querySelectorAll(".card");


querySelector retourne le premier élément correspondant.

querySelectorAll retourne une collection d'éléments.


============================================================
25 — MODIFIER LE TEXTE
============================================================

Exemple :

const titre =
    document.querySelector("#title");

titre.textContent =
    "Nouveau titre";


textContent permet de modifier le texte.


Pour du contenu HTML contrôlé :

element.innerHTML = "...";


Attention :

innerHTML ne doit pas être utilisé avec des données
utilisateur non fiables sans traitement approprié.


============================================================
26 — ATTRIBUTS HTML
============================================================

JavaScript peut lire et modifier des attributs.

Exemple :

const image =
    document.querySelector("img");

image.setAttribute(
    "alt",
    "Logo FOBAS"
);


Lire :

const valeur =
    image.getAttribute("alt");


Supprimer :

image.removeAttribute("title");


============================================================
27 — CLASSES CSS
============================================================

JavaScript peut contrôler les classes CSS.

Exemple :

element.classList.add("active");

element.classList.remove("active");

element.classList.toggle("active");

element.classList.contains("active");


Cette technique permet de séparer la logique JavaScript
de la présentation CSS.


============================================================
28 — STYLES DIRECTS
============================================================

JavaScript peut modifier directement un style.

Exemple :

element.style.display = "none";


Cependant, pour une interface organisée, il est souvent
préférable de modifier une classe CSS :

element.classList.add("hidden");


CSS :

.hidden {
    display: none;
}


============================================================
29 — CRÉER DES ÉLÉMENTS
============================================================

Exemple :

const paragraph =
    document.createElement("p");

paragraph.textContent =
    "Nouveau contenu";


Ajouter :

document.body.appendChild(
    paragraph
);


============================================================
30 — SUPPRIMER DES ÉLÉMENTS
============================================================

Exemple :

const element =
    document.querySelector(".card");

element.remove();


La suppression doit être utilisée lorsque l'interface
doit réellement retirer l'élément du DOM.


============================================================
31 — ÉVÉNEMENTS
============================================================

Un événement représente une action ou un changement.

Exemples :

click ;

dblclick ;

input ;

change ;

submit ;

focus ;

blur ;

keydown ;

keyup ;

mouseover ;

mouseout ;

DOMContentLoaded.


============================================================
32 — addEventListener()
============================================================

Exemple :

const button =
    document.querySelector("#btn");

button.addEventListener(
    "click",
    function () {

        console.log("Cliqué");

    }
);


Cette méthode permet d'attacher un gestionnaire
d'événement à un élément.


============================================================
33 — ÉVÉNEMENTS DE SOURIS ET TACTILES
============================================================

Pour une interface moderne, il faut également tenir compte
des appareils tactiles.

Les événements Pointer Events peuvent être utilisés :

pointerdown ;

pointermove ;

pointerup ;

pointercancel.


Ils peuvent faciliter la création d'interactions
compatibles avec souris, stylet et tactile.


============================================================
34 — OBJET EVENT
============================================================

Exemple :

button.addEventListener(
    "click",
    function (event) {

        console.log(event);

    }
);


L'objet event contient des informations sur l'événement.


============================================================
35 — preventDefault()
============================================================

Certains événements possèdent un comportement par défaut.

Exemple :

form.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

    }
);


Cela permet notamment de contrôler un formulaire
avec JavaScript avant son envoi.


============================================================
36 — FORMULAIRES
============================================================

JavaScript peut lire les champs d'un formulaire.

Exemple :

const nameInput =
    document.querySelector("#name");

console.log(nameInput.value);


Pour écouter la soumission :

form.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        console.log(
            nameInput.value
        );

    }
);


============================================================
37 — VALIDATION DES DONNÉES
============================================================

Un formulaire peut être vérifié avant traitement.

Exemple :

if (nameInput.value.trim() === "") {

    console.log(
        "Le nom est obligatoire."
    );

}


JavaScript peut vérifier :

champs obligatoires ;

longueur ;

format ;

valeurs numériques ;

correspondance de champs ;

conditions spécifiques.


La validation côté client améliore l'expérience utilisateur,
mais elle ne remplace pas une validation côté serveur
pour les applications qui communiquent avec un serveur.


============================================================
38 — TABLEAUX
============================================================

Exemple :

const languages = [
    "HTML",
    "CSS",
    "JavaScript"
];


Accéder à un élément :

languages[0];


Longueur :

languages.length;


Ajouter :

languages.push("PHP");


Retirer le dernier :

languages.pop();


============================================================
39 — MÉTHODES DE TABLEAUX
============================================================

Méthodes importantes :

push()

pop()

shift()

unshift()

slice()

splice()

includes()

indexOf()

join()

concat()


Ces méthodes permettent de manipuler les données.


============================================================
40 — forEach()
============================================================

Exemple :

const languages = [
    "HTML",
    "CSS",
    "JavaScript"
];

languages.forEach(
    language => {

        console.log(language);

    }
);


forEach permet d'exécuter une fonction pour chaque
élément du tableau.


============================================================
41 — map()
============================================================

map permet de produire un nouveau tableau.

Exemple :

const numbers = [
    1,
    2,
    3
];

const doubles =
    numbers.map(
        number => number * 2
    );


Résultat :

[2, 4, 6]


============================================================
42 — filter()
============================================================

filter permet de conserver certains éléments.

Exemple :

const numbers = [
    5,
    10,
    15,
    20
];

const results =
    numbers.filter(
        number => number >= 15
    );


Résultat :

[15, 20]


============================================================
43 — find()
============================================================

find retourne le premier élément correspondant.

Exemple :

const users = [
    {
        id: 1,
        name: "Jean"
    },
    {
        id: 2,
        name: "Marie"
    }
];

const user =
    users.find(
        item => item.id === 2
    );


============================================================
44 — some() ET every()
============================================================

some vérifie si au moins un élément respecte
une condition.

every vérifie si tous les éléments respectent
une condition.


Exemple :

const numbers = [
    10,
    20,
    30
];

numbers.some(
    number => number > 25
);

numbers.every(
    number => number > 0
);


============================================================
45 — OBJETS
============================================================

Un objet regroupe des propriétés et éventuellement
des méthodes.

Exemple :

const student = {

    name: "Jean",

    age: 20,

    level: "NS3"

};


Lire une propriété :

student.name;


Ou :

student["name"];


Modifier :

student.age = 21;


Ajouter :

student.city = "Port-au-Prince";


============================================================
46 — OBJETS ET MÉTHODES
============================================================

Exemple :

const user = {

    name: "Jean",

    sayHello() {

        console.log(
            "Bonjour " + this.name
        );

    }

};


Appel :

user.sayHello();


============================================================
47 — DESTRUCTURING
============================================================

Exemple :

const user = {

    name: "Jean",

    age: 25

};


On peut écrire :

const {
    name,
    age
} = user;


Pour un tableau :

const numbers = [
    10,
    20
];

const [
    first,
    second
] = numbers;


============================================================
48 — SPREAD OPERATOR
============================================================

Exemple :

const first = [
    1,
    2
];

const second = [
    3,
    4
];

const combined = [
    ...first,
    ...second
];


Il permet notamment de créer des copies ou de combiner
des données.


============================================================
49 — JSON
============================================================

JSON signifie :

JavaScript Object Notation.

Il est couramment utilisé pour échanger des données.

Exemple :

const user = {
    name: "Jean",
    age: 25
};


Convertir en JSON :

const json =
    JSON.stringify(user);


Reconvertir :

const object =
    JSON.parse(json);


============================================================
50 — localStorage
============================================================

localStorage permet de conserver des données dans
le navigateur.

Exemple :

localStorage.setItem(
    "name",
    "Jean"
);


Lire :

const name =
    localStorage.getItem("name");


Supprimer :

localStorage.removeItem("name");


Tout supprimer :

localStorage.clear();


Pour les objets :

localStorage.setItem(
    "user",
    JSON.stringify(user)
);


Puis :

const savedUser =
    JSON.parse(
        localStorage.getItem("user")
    );


Il faut gérer le cas où aucune donnée n'existe.


============================================================
51 — DATE ET HEURE
============================================================

JavaScript possède l'objet Date.

Exemple :

const now = new Date();


On peut obtenir différentes informations :

now.getFullYear();

now.getMonth();

now.getDate();

now.getHours();

now.getMinutes();


Attention :

getMonth() commence à 0 pour janvier.


============================================================
52 — MATH
============================================================

L'objet Math fournit plusieurs opérations.

Exemples :

Math.round()

Math.floor()

Math.ceil()

Math.abs()

Math.max()

Math.min()

Math.random()


Exemple :

const random =
    Math.floor(
        Math.random() * 10
    );


============================================================
53 — CONVERSION DE DONNÉES
============================================================

Convertir en nombre :

Number("25");


Entier :

parseInt("25", 10);


Nombre décimal :

parseFloat("25.5");


Convertir en chaîne :

String(25);


Il faut vérifier les conversions lorsque les données
proviennent d'un utilisateur.


============================================================
54 — NULL, UNDEFINED ET VALEURS ABSENTES
============================================================

undefined signifie généralement qu'une valeur n'a pas
été définie.

null représente volontairement l'absence de valeur.

Exemple :

let value;

const result = null;


Une application doit prévoir les valeurs absentes
avant de les utiliser.


============================================================
55 — OPTIONAL CHAINING
============================================================

Exemple :

const city =
    user?.address?.city;


Cela permet d'éviter certaines erreurs lorsque
des propriétés intermédiaires n'existent pas.


============================================================
56 — NULLISH COALESCING
============================================================

Exemple :

const name =
    user.name ?? "Utilisateur";


La valeur de remplacement est utilisée lorsque
la valeur est null ou undefined.


============================================================
57 — MODULES JAVASCRIPT
============================================================

Un projet important peut être divisé en plusieurs fichiers.

Exemple :

js/

    app.js

    ui.js

    storage.js

    validation.js


Export :

export function saveData() {

}


Import :

import {
    saveData
} from "./storage.js";


Les modules permettent de mieux organiser
les grands projets.


============================================================
58 — ASYNC ET PROMISES
============================================================

Certaines opérations sont asynchrones.

Exemple :

setTimeout(
    () => {

        console.log("Terminé");

    },
    1000
);


Les Promises représentent également des opérations
qui peuvent réussir ou échouer.

Exemple :

const promise =
    new Promise(
        (resolve, reject) => {

            resolve("OK");

        }
    );


============================================================
59 — async / await
============================================================

Exemple :

async function loadData() {

    const result =
        await somePromise;

    console.log(result);

}


async et await permettent d'écrire du code asynchrone
de manière plus lisible.


============================================================
60 — FETCH ET API
============================================================

fetch() permet de communiquer avec une ressource
HTTP.

Exemple :

async function loadUsers() {

    const response =
        await fetch("/api/users");

    const data =
        await response.json();

    console.log(data);

}


Dans une application réelle, il faut vérifier
les erreurs réseau et le statut HTTP.


============================================================
61 — GESTION DES ERREURS
============================================================

JavaScript fournit :

try

catch

finally


Exemple :

try {

    const data =
        JSON.parse(text);

} catch (error) {

    console.error(
        "Erreur :",
        error
    );

} finally {

    console.log(
        "Opération terminée"
    );

}


============================================================
62 — THROW
============================================================

Une fonction peut signaler volontairement une erreur.

Exemple :

function divide(a, b) {

    if (b === 0) {

        throw new Error(
            "Division par zéro impossible."
        );

    }

    return a / b;

}


============================================================
63 — DEBUGGING
============================================================

Les outils principaux sont :

console.log()

console.warn()

console.error()

console.table()

debugger


Exemple :

console.table(users);


Le navigateur permet également d'utiliser
les DevTools pour :

inspecter le DOM ;

voir les erreurs ;

examiner les événements ;

placer des breakpoints ;

observer les variables ;

tester le code.


============================================================
64 — ARCHITECTURE D'UNE APPLICATION
============================================================

Un projet JavaScript peut séparer :

données ;

interface ;

événements ;

stockage ;

validation ;

communication réseau.


Exemple :

js/

    app.js

    state.js

    ui.js

    events.js

    storage.js

    api.js


La séparation facilite la maintenance.


============================================================
65 — ÉTAT D'UNE INTERFACE
============================================================

Une interface interactive possède souvent un état.

Exemple :

const state = {

    count: 0,

    isMenuOpen: false,

    currentPage: 1

};


JavaScript modifie l'état.

L'interface peut ensuite être mise à jour.


============================================================
66 — CRÉER UN MENU INTERACTIF
============================================================

HTML :

<button
    id="menuButton"
>
    Menu
</button>

<nav id="mobileMenu">
    ...
</nav>


JavaScript :

const menuButton =
    document.querySelector(
        "#menuButton"
    );

const mobileMenu =
    document.querySelector(
        "#mobileMenu"
    );

menuButton.addEventListener(
    "click",
    () => {

        mobileMenu.classList.toggle(
            "open"
        );

    }
);


CSS peut ensuite contrôler
l'apparence de la classe open.


============================================================
67 — CRÉER UN COMPTEUR
============================================================

let count = 0;

const button =
    document.querySelector("#add");

const output =
    document.querySelector("#output");

button.addEventListener(
    "click",
    () => {

        count++;

        output.textContent =
            count;

    }
);


============================================================
68 — CRÉER UNE LISTE DYNAMIQUE
============================================================

Exemple :

const tasks = [
    "Apprendre HTML",
    "Apprendre CSS",
    "Apprendre JavaScript"
];


JavaScript peut générer les éléments HTML
correspondants dynamiquement.

Il faut éviter d'insérer des données utilisateur
non fiables avec innerHTML.


============================================================
69 — RECHERCHE ET FILTRAGE
============================================================

Une interface peut filtrer des données.

Exemple :

const results =
    products.filter(
        product =>
            product.name
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                )
    );


Cette logique peut être utilisée pour :

recherche ;

catalogue ;

bibliothèque ;

liste d'étudiants ;

cours ;

produits.


============================================================
70 — PAGINATION
============================================================

Une grande quantité de données peut être divisée
en plusieurs pages.

Variables possibles :

currentPage ;

itemsPerPage ;

totalPages.


JavaScript calcule les éléments à afficher
pour la page actuelle.


============================================================
71 — INTERACTION AVEC CSS
============================================================

JavaScript ne doit pas nécessairement modifier
les propriétés CSS une par une.

Préférer souvent :

element.classList.add("active");

ou :

element.classList.remove("hidden");


Le CSS conserve la responsabilité de la présentation.


============================================================
72 — ACCESSIBILITÉ ET JAVASCRIPT
============================================================

JavaScript ne doit pas rendre une interface
inaccessible.

Il faut notamment :

préserver le clavier ;

conserver les boutons et liens appropriés ;

gérer le focus ;

indiquer les états ;

utiliser les attributs ARIA lorsque nécessaire ;

ne pas dépendre uniquement de la souris ;

prévoir les utilisateurs tactiles.


============================================================
73 — CLAVIER
============================================================

Exemple :

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            console.log(
                "Échap détecté"
            );

        }

    }
);


Les interfaces importantes doivent rester utilisables
avec le clavier.


============================================================
74 — DELEGATION D'ÉVÉNEMENTS
============================================================

Lorsque plusieurs éléments dynamiques possèdent
le même type d'interaction, on peut utiliser
la délégation d'événements.

Exemple :

container.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".delete-button"
            );

        if (!button) return;

        console.log(
            "Suppression demandée"
        );

    }
);


Cette technique est particulièrement utile
pour les listes dynamiques.


============================================================
75 — PERFORMANCE
============================================================

Un bon code JavaScript doit éviter :

boucles inutiles ;

calculs répétés ;

manipulations DOM excessives ;

écouteurs inutiles ;

chargement inutile de ressources.


Il faut également éviter de bloquer inutilement
le thread principal.


============================================================
76 — SÉCURITÉ JAVASCRIPT DE BASE
============================================================

Il faut être prudent avec :

innerHTML ;

eval() ;

données utilisateur ;

URLs ;

contenus externes ;

stockage local.


Ne jamais utiliser :

eval()

pour exécuter arbitrairement du texte utilisateur.

Les données utilisateur doivent être traitées
comme non fiables.


============================================================
77 — STRUCTURE D'UN PROJET JAVASCRIPT
============================================================

Exemple :

mon-app/

    index.html

    about.html

    css/

        style.css

    js/

        app.js

        ui.js

        storage.js

        validation.js

        api.js

    images/


Cette organisation facilite l'évolution du projet.


============================================================
78 — CYCLE D'UNE INTERACTION
============================================================

Une interaction Web peut suivre ce modèle :

1. L'utilisateur agit.

2. Un événement est déclenché.

3. JavaScript reçoit l'événement.

4. JavaScript vérifie les données.

5. JavaScript modifie l'état.

6. JavaScript met à jour le DOM.

7. CSS présente le nouvel état.


Exemple :

CLICK
  ↓
EVENT
  ↓
FUNCTION
  ↓
STATE
  ↓
DOM
  ↓
CSS
  ↓
NOUVELLE INTERFACE


============================================================
79 — BONNES PRATIQUES
============================================================

Utiliser des noms explicites.

Éviter les variables inutiles.

Préférer const lorsque possible.

Utiliser let lorsque la réaffectation est nécessaire.

Créer des fonctions courtes et compréhensibles.

Éviter la duplication.

Séparer logique, présentation et données.

Valider les données.

Gérer les erreurs.

Tester les cas normaux et les cas limites.

Commenter uniquement lorsque cela apporte
une véritable information.


============================================================
80 — CONSTRUCTION D'UNE APPLICATION WEB INTERACTIVE
============================================================

Progression recommandée :

1. créer le HTML ;

2. créer le CSS ;

3. charger JavaScript ;

4. sélectionner les éléments ;

5. créer l'état ;

6. créer les fonctions ;

7. écouter les événements ;

8. traiter les données ;

9. modifier le DOM ;

10. utiliser les classes CSS ;

11. gérer les formulaires ;

12. valider les entrées ;

13. stocker les données si nécessaire ;

14. charger les données si nécessaire ;

15. gérer les erreurs ;

16. tester ;

17. déboguer ;

18. optimiser ;

19. vérifier l'accessibilité ;

20. finaliser.


============================================================
RÈGLE FONDAMENTALE DU CHAPITRE E
============================================================

Ne pas écrire du JavaScript au hasard.

Chaque variable doit avoir une fonction.

Chaque fonction doit avoir une responsabilité claire.

Chaque événement doit avoir une raison.

Chaque modification du DOM doit répondre à un besoin
de l'interface.

JavaScript doit contrôler la logique et le comportement.

HTML construit.

CSS présente.

JavaScript fait fonctionner l'interface.

HTML + CSS + JavaScript permettent de construire
des applications Web interactives.`,


    pratique:
`TRAVAUX PRATIQUES — JAVASCRIPT

Objectif :

Apprendre progressivement à utiliser JavaScript pour
transformer une page HTML + CSS en interface interactive.


------------------------------------------------------------
TP 1 — CRÉER LE DOSSIER JAVASCRIPT
------------------------------------------------------------

Créez :

mon-app/

    index.html

    css/

        style.css

    js/

        app.js


------------------------------------------------------------
TP 2 — RELIER JAVASCRIPT
------------------------------------------------------------

Reliez :

js/app.js

à :

index.html

Utilisez une balise script appropriée.


------------------------------------------------------------
TP 3 — CONSOLE
------------------------------------------------------------

Affichez dans la console :

Bonjour JavaScript.


------------------------------------------------------------
TP 4 — VARIABLES
------------------------------------------------------------

Créez plusieurs variables avec :

const

et :

let


------------------------------------------------------------
TP 5 — TYPES
------------------------------------------------------------

Créez des variables contenant :

texte ;

nombre ;

boolean ;

null ;

undefined ;

tableau ;

objet.


------------------------------------------------------------
TP 6 — CALCULATRICE SIMPLE
------------------------------------------------------------

Créez une fonction capable de calculer :

addition ;

soustraction ;

multiplication ;

division.


------------------------------------------------------------
TP 7 — CONDITIONS
------------------------------------------------------------

Créez un programme qui détermine si un nombre
est positif, négatif ou égal à zéro.


------------------------------------------------------------
TP 8 — BOUCLE
------------------------------------------------------------

Affichez les nombres de 1 à 20 avec une boucle.


------------------------------------------------------------
TP 9 — FONCTIONS
------------------------------------------------------------

Créez une fonction :

saluer(nom)


Elle doit retourner un message personnalisé.


------------------------------------------------------------
TP 10 — FONCTION CALCUL
------------------------------------------------------------

Créez :

calculerMoyenne()


La fonction doit calculer la moyenne
de plusieurs nombres.


------------------------------------------------------------
TP 11 — TABLEAUX
------------------------------------------------------------

Créez un tableau de 10 éléments.


Ajoutez :

push()


Supprimez :

pop()


Affichez la longueur.


------------------------------------------------------------
TP 12 — forEach
------------------------------------------------------------

Parcourez un tableau avec :

forEach()


------------------------------------------------------------
TP 13 — map
------------------------------------------------------------

Créez un tableau de nombres puis produisez
un nouveau tableau contenant leurs doubles.


------------------------------------------------------------
TP 14 — filter
------------------------------------------------------------

Filtrez un tableau pour conserver uniquement
les nombres supérieurs à 10.


------------------------------------------------------------
TP 15 — OBJETS
------------------------------------------------------------

Créez un objet étudiant contenant :

nom ;

âge ;

niveau ;

école.


------------------------------------------------------------
TP 16 — OBJETS ET MÉTHODES
------------------------------------------------------------

Ajoutez une méthode permettant à l'étudiant
de retourner un message de présentation.


------------------------------------------------------------
TP 17 — DOM
------------------------------------------------------------

Créez :

h1 ;

p ;

button.


Sélectionnez-les avec JavaScript.


------------------------------------------------------------
TP 18 — MODIFIER LE TEXTE
------------------------------------------------------------

Au clic d'un bouton, modifiez le texte d'un paragraphe.


------------------------------------------------------------
TP 19 — MODIFIER UNE CLASSE
------------------------------------------------------------

Au clic d'un bouton :

ajoutez une classe ;

supprimez une classe ;

utilisez toggle.


------------------------------------------------------------
TP 20 — CHANGER UNE IMAGE
------------------------------------------------------------

Créez un bouton permettant de modifier
la source d'une image.


------------------------------------------------------------
TP 21 — AFFICHER / MASQUER
------------------------------------------------------------

Créez un bouton :

Afficher

et :

Masquer


Utilisez une classe CSS.


------------------------------------------------------------
TP 22 — TOGGLE
------------------------------------------------------------

Créez un menu qui s'ouvre et se ferme
avec :

classList.toggle()


------------------------------------------------------------
TP 23 — COMPTEUR
------------------------------------------------------------

Créez :

+

-

Reset


Le compteur doit fonctionner avec JavaScript.


------------------------------------------------------------
TP 24 — CALCULATRICE
------------------------------------------------------------

Créez une calculatrice comprenant :

addition ;

soustraction ;

multiplication ;

division ;

effacement.


------------------------------------------------------------
TP 25 — FORMULAIRE
------------------------------------------------------------

Créez un formulaire avec :

nom ;

email ;

message ;

bouton.


Interceptez :

submit


------------------------------------------------------------
TP 26 — VALIDATION
------------------------------------------------------------

Vérifiez :

nom obligatoire ;

email obligatoire ;

message obligatoire.


------------------------------------------------------------
TP 27 — VALIDATION EMAIL
------------------------------------------------------------

Vérifiez que l'adresse email respecte
un format raisonnable.


------------------------------------------------------------
TP 28 — MESSAGE D'ERREUR
------------------------------------------------------------

Affichez les erreurs directement
dans l'interface.


------------------------------------------------------------
TP 29 — TABLEAU DYNAMIQUE
------------------------------------------------------------

Créez un tableau de données JavaScript
et affichez-le dynamiquement dans HTML.


------------------------------------------------------------
TP 30 — LISTE DYNAMIQUE
------------------------------------------------------------

Créez une liste de tâches avec :

ajouter ;

supprimer ;

terminer.


------------------------------------------------------------
TP 31 — RECHERCHE
------------------------------------------------------------

Ajoutez une zone de recherche
pour filtrer une liste.


------------------------------------------------------------
TP 32 — FILTRE
------------------------------------------------------------

Créez plusieurs catégories et permettez
de filtrer les éléments par catégorie.


------------------------------------------------------------
TP 33 — localStorage
------------------------------------------------------------

Enregistrez une donnée dans :

localStorage


Puis rechargez la page et récupérez-la.


------------------------------------------------------------
TP 34 — OBJET DANS localStorage
------------------------------------------------------------

Enregistrez un objet avec :

JSON.stringify()


Puis récupérez-le avec :

JSON.parse()


------------------------------------------------------------
TP 35 — PRÉFÉRENCE UTILISATEUR
------------------------------------------------------------

Créez une préférence :

mode clair ;

mode sombre.


Sauvegardez le choix dans localStorage.


------------------------------------------------------------
TP 36 — DATE
------------------------------------------------------------

Affichez la date actuelle
dans l'interface.


------------------------------------------------------------
TP 37 — HORLOGE
------------------------------------------------------------

Créez une horloge dynamique
avec :

setInterval()


------------------------------------------------------------
TP 38 — COMPTE À REBOURS
------------------------------------------------------------

Créez un compte à rebours simple.


------------------------------------------------------------
TP 39 — GESTION DES ERREURS
------------------------------------------------------------

Utilisez :

try

catch

pour gérer une opération pouvant échouer.


------------------------------------------------------------
TP 40 — FETCH
------------------------------------------------------------

Utilisez fetch() pour récupérer
des données depuis une API publique adaptée
à l'apprentissage.


------------------------------------------------------------
TP 41 — ASYNC / AWAIT
------------------------------------------------------------

Transformez l'exemple précédent
avec async et await.


------------------------------------------------------------
TP 42 — ÉTAT D'APPLICATION
------------------------------------------------------------

Créez un objet state contenant
plusieurs valeurs représentant
l'état d'une interface.


------------------------------------------------------------
TP 43 — RENDU DYNAMIQUE
------------------------------------------------------------

Créez une fonction :

render()


Elle doit mettre à jour l'interface
à partir de l'état.


------------------------------------------------------------
TP 44 — ÉVÉNEMENTS DYNAMIQUES
------------------------------------------------------------

Créez une liste dont les boutons
sont générés dynamiquement.


------------------------------------------------------------
TP 45 — EVENT DELEGATION
------------------------------------------------------------

Utilisez la délégation d'événements
pour gérer les boutons d'une liste dynamique.


------------------------------------------------------------
TP 46 — MODULES
------------------------------------------------------------

Séparez le projet en plusieurs fichiers :

app.js ;

ui.js ;

storage.js.


Utilisez :

export

et :

import


------------------------------------------------------------
TP 47 — ACCESSIBILITÉ
------------------------------------------------------------

Vérifiez que les interactions JavaScript
restent utilisables au clavier.


Ajoutez une gestion correcte du focus.


------------------------------------------------------------
TP 48 — DEBUG
------------------------------------------------------------

Introduisez volontairement une erreur.

Utilisez :

console.log()

console.error()

debugger


pour la trouver et la corriger.


------------------------------------------------------------
TP 49 — PROJET INTERACTIF
------------------------------------------------------------

Construisez une interface contenant :

menu ;

compteur ;

formulaire ;

validation ;

liste dynamique ;

recherche ;

stockage local.


------------------------------------------------------------
TP 50 — PROJET COMPLET
------------------------------------------------------------

Construisez une application Web complète
avec :

HTML ;

CSS ;

JavaScript ;

DOM ;

événements ;

fonctions ;

tableaux ;

objets ;

formulaire ;

validation ;

localStorage ;

gestion des erreurs ;

interface responsive.

L'application doit être testée sur téléphone,
tablette et ordinateur.`,


    exercices: [

        "Exercice 1 — Créer un fichier JavaScript externe et le relier à une page HTML.",

        "Exercice 2 — Afficher un message dans la console avec console.log().",

        "Exercice 3 — Déclarer des variables avec const et let.",

        "Exercice 4 — Identifier les principaux types de données JavaScript.",

        "Exercice 5 — Effectuer des opérations d'addition, soustraction, multiplication et division.",

        "Exercice 6 — Utiliser les opérateurs de comparaison.",

        "Exercice 7 — Utiliser les opérateurs logiques &&, || et !.",

        "Exercice 8 — Créer une condition if / else.",

        "Exercice 9 — Créer plusieurs conditions avec else if.",

        "Exercice 10 — Utiliser l'opérateur ternaire pour une décision simple.",

        "Exercice 11 — Utiliser switch pour gérer plusieurs cas.",

        "Exercice 12 — Créer une boucle for.",

        "Exercice 13 — Créer une boucle while.",

        "Exercice 14 — Utiliser do...while.",

        "Exercice 15 — Utiliser break dans une boucle.",

        "Exercice 16 — Utiliser continue dans une boucle.",

        "Exercice 17 — Créer une fonction simple.",

        "Exercice 18 — Créer une fonction avec paramètres.",

        "Exercice 19 — Créer une fonction qui retourne une valeur.",

        "Exercice 20 — Transformer une fonction classique en fonction fléchée.",

        "Exercice 21 — Créer un tableau contenant dix valeurs.",

        "Exercice 22 — Ajouter et supprimer des éléments d'un tableau.",

        "Exercice 23 — Parcourir un tableau avec forEach().",

        "Exercice 24 — Créer un nouveau tableau avec map().",

        "Exercice 25 — Filtrer un tableau avec filter().",

        "Exercice 26 — Rechercher un élément avec find().",

        "Exercice 27 — Utiliser some() et every().",

        "Exercice 28 — Créer un objet représentant un étudiant.",

        "Exercice 29 — Ajouter une méthode à un objet.",

        "Exercice 30 — Utiliser this dans un objet.",

        "Exercice 31 — Utiliser le destructuring avec un objet.",

        "Exercice 32 — Utiliser le destructuring avec un tableau.",

        "Exercice 33 — Utiliser le spread operator pour combiner deux tableaux.",

        "Exercice 34 — Convertir un objet en JSON avec JSON.stringify().",

        "Exercice 35 — Convertir un JSON en objet avec JSON.parse().",

        "Exercice 36 — Sélectionner un élément HTML avec querySelector().",

        "Exercice 37 — Sélectionner plusieurs éléments avec querySelectorAll().",

        "Exercice 38 — Modifier le texte d'un élément avec textContent.",

        "Exercice 39 — Modifier un attribut HTML avec setAttribute().",

        "Exercice 40 — Lire un attribut avec getAttribute().",

        "Exercice 41 — Ajouter et supprimer une classe CSS avec classList.",

        "Exercice 42 — Utiliser classList.toggle() pour ouvrir et fermer un élément.",

        "Exercice 43 — Créer dynamiquement un élément HTML avec createElement().",

        "Exercice 44 — Ajouter un élément au DOM avec appendChild().",

        "Exercice 45 — Supprimer dynamiquement un élément du DOM.",

        "Exercice 46 — Réagir à un clic avec addEventListener().",

        "Exercice 47 — Utiliser l'objet Event dans un gestionnaire d'événement.",

        "Exercice 48 — Empêcher le comportement par défaut d'un formulaire avec preventDefault().",

        "Exercice 49 — Créer un compteur interactif avec les boutons +, - et Reset.",

        "Exercice 50 — Créer une calculatrice JavaScript simple.",

        "Exercice 51 — Créer un menu mobile contrôlé par JavaScript.",

        "Exercice 52 — Créer une interface Afficher / Masquer.",

        "Exercice 53 — Créer une galerie interactive permettant de changer d'image.",

        "Exercice 54 — Créer un formulaire contrôlé par JavaScript.",

        "Exercice 55 — Vérifier qu'un champ obligatoire n'est pas vide.",

        "Exercice 56 — Vérifier la longueur minimale d'un mot de passe.",

        "Exercice 57 — Vérifier le format d'une adresse email.",

        "Exercice 58 — Afficher un message d'erreur dans le DOM.",

        "Exercice 59 — Afficher un message de succès après validation.",

        "Exercice 60 — Créer une liste dynamique de tâches.",

        "Exercice 61 — Ajouter une tâche dans une liste.",

        "Exercice 62 — Supprimer une tâche d'une liste.",

        "Exercice 63 — Marquer une tâche comme terminée.",

        "Exercice 64 — Filtrer une liste de tâches.",

        "Exercice 65 — Ajouter une recherche instantanée dans une liste.",

        "Exercice 66 — Créer une liste de produits à partir d'un tableau d'objets.",

        "Exercice 67 — Afficher dynamiquement des cartes de produits.",

        "Exercice 68 — Filtrer les produits par catégorie.",

        "Exercice 69 — Rechercher un produit par son nom.",

        "Exercice 70 — Trier un tableau de données.",

        "Exercice 71 — Créer une pagination simple.",

        "Exercice 72 — Enregistrer une donnée avec localStorage.",

        "Exercice 73 — Lire une donnée depuis localStorage.",

        "Exercice 74 — Supprimer une donnée de localStorage.",

        "Exercice 75 — Enregistrer un objet dans localStorage.",

        "Exercice 76 — Construire une préférence de thème clair / sombre.",

        "Exercice 77 — Conserver le thème choisi après rechargement de la page.",

        "Exercice 78 — Afficher la date actuelle avec l'objet Date.",

        "Exercice 79 — Construire une horloge avec setInterval().",

        "Exercice 80 — Construire un compte à rebours.",

        "Exercice 81 — Utiliser Math.random() pour générer une valeur aléatoire.",

        "Exercice 82 — Convertir correctement une valeur texte en nombre.",

        "Exercice 83 — Gérer null et undefined dans une application.",

        "Exercice 84 — Utiliser optional chaining pour accéder à une propriété facultative.",

        "Exercice 85 — Utiliser nullish coalescing pour fournir une valeur par défaut.",

        "Exercice 86 — Utiliser try / catch pour gérer une erreur.",

        "Exercice 87 — Générer volontairement une erreur avec throw new Error().",

        "Exercice 88 — Utiliser async et await avec une Promise.",

        "Exercice 89 — Utiliser fetch() pour récupérer des données.",

        "Exercice 90 — Vérifier le statut d'une réponse HTTP avant de traiter les données.",

        "Exercice 91 — Afficher des données récupérées depuis une API dans le DOM.",

        "Exercice 92 — Créer un objet state pour représenter l'état d'une interface.",

        "Exercice 93 — Créer une fonction render() qui met à jour l'interface.",

        "Exercice 94 — Utiliser la délégation d'événements avec event.target.",

        "Exercice 95 — Utiliser closest() pour identifier un composant interactif.",

        "Exercice 96 — Séparer un projet JavaScript en plusieurs modules.",

        "Exercice 97 — Utiliser export et import dans une application.",

        "Exercice 98 — Ajouter une interaction clavier avec keydown.",

        "Exercice 99 — Ajouter une gestion de la touche Escape pour fermer une interface.",

        "Exercice 100 — Construire une application Web complète combinant HTML, CSS et JavaScript."
    ],


    devoirs:
`DEVOIR FINAL — CRÉATION D'UNE APPLICATION WEB INTERACTIVE

Objectif :

Construire une véritable application Web interactive
en combinant les connaissances des Chapitres B, C, D et E.

Le projet doit démontrer que l'étudiant sait passer :

de la structure HTML

à la présentation CSS

puis à la logique JavaScript

afin de produire une interface Web fonctionnelle,
responsive, accessible et interactive.


============================================================
1 — STRUCTURE DU PROJET
============================================================

Le projet doit contenir au minimum :

index.html

css/

    style.css

js/

    app.js

images/


Pour un projet plus avancé, l'étudiant peut organiser
JavaScript en plusieurs modules :

js/

    app.js

    ui.js

    storage.js

    validation.js

    data.js


============================================================
2 — INTERFACE HTML
============================================================

La page doit contenir au minimum :

header ;

navigation ;

main ;

section ;

formulaire ;

zone de contenu dynamique ;

footer.


L'étudiant doit utiliser une structure HTML
correctement organisée.


============================================================
3 — CSS
============================================================

Le projet doit reprendre les principes du Chapitre D :

conteneur ;

variables CSS ;

Flexbox ;

Grid ;

composants réutilisables ;

responsive design ;

états visuels ;

focus-visible ;

transitions raisonnables.


L'interface doit fonctionner sur :

téléphone ;

tablette ;

ordinateur.


============================================================
4 — JAVASCRIPT
============================================================

Le projet doit obligatoirement utiliser JavaScript
pour produire des interactions réelles.

JavaScript doit être chargé depuis un fichier externe.


============================================================
5 — ÉTAT DE L'APPLICATION
============================================================

Créez un objet :

state


Il doit contenir au minimum plusieurs informations
représentant l'état courant de l'application.

Exemple :

const state = {

    items: [],

    search: "",

    currentPage: 1

};


============================================================
6 — DOM
============================================================

JavaScript doit sélectionner plusieurs éléments
de l'interface et les manipuler.

Utilisez notamment :

querySelector()

querySelectorAll()

textContent

classList

createElement()


============================================================
7 — ÉVÉNEMENTS
============================================================

Le projet doit utiliser :

click ;

input ;

change ;

submit ;

au moins un événement clavier.


Les événements doivent avoir une fonction réelle
dans l'application.


============================================================
8 — FONCTIONS
============================================================

Créez plusieurs fonctions spécialisées.

Exemples :

render();

addItem();

deleteItem();

updateItem();

filterItems();

validateForm();


Chaque fonction doit avoir une responsabilité
compréhensible.


============================================================
9 — FORMULAIRE
============================================================

Le projet doit contenir un formulaire.

Il doit être contrôlé par JavaScript.

Le formulaire doit vérifier :

champs obligatoires ;

format des données ;

valeurs incorrectes ;

erreurs.


Les erreurs doivent être présentées clairement
à l'utilisateur.


============================================================
10 — VALIDATION
============================================================

La validation JavaScript doit notamment gérer :

champ vide ;

valeur incorrecte ;

format incorrect ;

longueur insuffisante.


La validation côté client améliore l'expérience,
mais ne doit pas être considérée comme une sécurité
suffisante pour une application serveur.


============================================================
11 — DONNÉES
============================================================

Utilisez un tableau d'objets.

Exemple :

const items = [

    {
        id: 1,
        title: "HTML"
    },

    {
        id: 2,
        title: "CSS"
    },

    {
        id: 3,
        title: "JavaScript"
    }

];


Les données doivent être affichées dynamiquement.


============================================================
12 — AFFICHAGE DYNAMIQUE
============================================================

Créez une fonction :

render()


Elle doit générer ou mettre à jour
la partie dynamique de l'interface.


============================================================
13 — RECHERCHE
============================================================

Ajoutez une zone de recherche.

Lorsque l'utilisateur saisit du texte,
la liste doit être filtrée.


La recherche doit fonctionner sans recharger
la page.


============================================================
14 — FILTRE
============================================================

Ajoutez au minimum un filtre par catégorie
ou par autre propriété des données.


============================================================
15 — SUPPRESSION
============================================================

Chaque élément dynamique doit pouvoir être supprimé.


La suppression doit mettre à jour :

les données ;

l'interface.


============================================================
16 — MODIFICATION
============================================================

Ajoutez si possible une fonction permettant
de modifier un élément existant.


Le formulaire peut être réutilisé pour :

ajouter ;

modifier.


============================================================
17 — localStorage
============================================================

Le projet doit enregistrer les données importantes
dans localStorage.


Utilisez :

JSON.stringify()


pour enregistrer les objets.


Utilisez :

JSON.parse()


pour les récupérer.


============================================================
18 — RECHARGEMENT
============================================================

Après fermeture et réouverture de la page,
les données enregistrées doivent pouvoir être
récupérées lorsque le projet fonctionne
dans un contexte permettant l'accès à localStorage.


============================================================
19 — THÈME
============================================================

Ajoutez si possible :

mode clair ;

mode sombre.


Le choix doit être sauvegardé dans localStorage.


============================================================
20 — CALCUL OU LOGIQUE
============================================================

L'application doit effectuer au moins
un véritable traitement JavaScript.

Exemples :

calcul ;

compteur ;

moyenne ;

total ;

statistique ;

filtrage ;

tri.


============================================================
21 — TABLEAU OU CARTES
============================================================

Les données doivent être présentées
dans une interface organisée.

L'étudiant peut utiliser :

cartes ;

tableau ;

liste ;

grille.


Le contenu doit être généré dynamiquement.


============================================================
22 — API — OPTION AVANCÉE
============================================================

Pour un niveau avancé, utilisez :

fetch()


pour récupérer des données depuis une API.


Le code doit utiliser :

async ;

await ;

try ;

catch.


Les erreurs réseau doivent être traitées.


============================================================
23 — GESTION DES ERREURS
============================================================

L'application doit prévoir les erreurs.

Utilisez :

try {

    ...

} catch (error) {

    ...

}


Les erreurs doivent être traitées
sans faire planter inutilement toute l'interface.


============================================================
24 — ACCESSIBILITÉ
============================================================

Vérifiez :

navigation clavier ;

focus visible ;

boutons accessibles ;

labels ;

messages d'erreur compréhensibles ;

structure des titres ;

zones interactives suffisamment grandes.


JavaScript ne doit pas supprimer
l'accessibilité native des éléments HTML.


============================================================
25 — RESPONSIVE DESIGN
============================================================

L'application doit fonctionner correctement
sur différentes tailles d'écran.

Vérifiez :

aucun débordement horizontal ;

aucun bouton inaccessible ;

aucun texte coupé ;

formulaire utilisable ;

navigation utilisable ;

cartes correctement organisées.


============================================================
26 — INTERACTION MOBILE
============================================================

L'application doit être utilisable
sur écran tactile.

Les interactions ne doivent pas dépendre
uniquement du survol de la souris.


============================================================
27 — SÉCURITÉ
============================================================

L'étudiant doit éviter :

eval() ;

exécution arbitraire de code ;

insertion dangereuse de données utilisateur ;

utilisation aveugle de innerHTML.


Lorsque du texte utilisateur doit être affiché,
préférer notamment :

textContent


lorsque du HTML n'est pas nécessaire.


============================================================
28 — ORGANISATION DU CODE
============================================================

Le JavaScript doit être :

indenté ;

lisible ;

organisé ;

commenté lorsque nécessaire ;

sans duplication inutile ;

avec des noms de variables explicites.


Les fonctions doivent avoir des responsabilités
claires.


============================================================
29 — DEBUGGING
============================================================

L'étudiant doit être capable d'utiliser :

console.log();

console.warn();

console.error();

console.table();

debugger;


Il doit également savoir utiliser
les outils de développement du navigateur.


============================================================
30 — TESTS
============================================================

Tester :

chargement ;

navigation ;

boutons ;

formulaire ;

validation ;

recherche ;

filtres ;

ajout ;

modification ;

suppression ;

stockage ;

thème ;

responsive ;

clavier.


============================================================
31 — CAS LIMITES
============================================================

Tester également :

champ vide ;

texte très long ;

aucun résultat ;

liste vide ;

valeur incorrecte ;

donnée absente ;

localStorage vide ;

erreur de récupération ;

réseau indisponible si une API est utilisée.


============================================================
32 — LABORATOIRE FOBAS
============================================================

Ouvrez le projet dans le Laboratoire FOBAS.

Chargez :

index.html


Vérifiez :

HTML ;

CSS ;

JavaScript ;


puis testez toutes les interactions.


============================================================
33 — PRÉSENTATION
============================================================

L'étudiant doit être capable d'expliquer :

qu'est-ce que JavaScript ;

comment charger JavaScript ;

comment fonctionne une variable ;

différence entre let et const ;

types de données ;

conditions ;

boucles ;

fonctions ;

tableaux ;

objets ;

DOM ;

événements ;

formulaires ;

validation ;

localStorage ;

JSON ;

Promises ;

async / await ;

fetch ;

gestion des erreurs ;

modules ;

debugging.


============================================================
34 — ARCHITECTURE DE L'APPLICATION
============================================================

L'étudiant doit pouvoir expliquer le chemin :

UTILISATEUR

    ↓

ÉVÉNEMENT

    ↓

JAVASCRIPT

    ↓

LOGIQUE

    ↓

ÉTAT

    ↓

DOM

    ↓

CSS

    ↓

INTERFACE


============================================================
35 — CRITÈRES TECHNIQUES
============================================================

L'application doit démontrer :

HTML correctement structuré ;

CSS correctement organisé ;

JavaScript fonctionnel ;

DOM manipulé correctement ;

événements fonctionnels ;

fonctions réutilisables ;

données structurées ;

validation ;

gestion des erreurs ;

responsive design ;

accessibilité ;

code lisible.


============================================================
OBJECTIF FINAL DU CHAPITRE E
============================================================

À la fin du Chapitre E, l'étudiant doit être capable
de transformer une interface HTML + CSS statique
en véritable interface Web interactive.

Il doit savoir :

écrire du JavaScript ;

déclarer des variables ;

manipuler les types ;

utiliser les conditions ;

utiliser les boucles ;

créer des fonctions ;

manipuler des tableaux ;

manipuler des objets ;

utiliser le DOM ;

réagir aux événements ;

modifier le contenu ;

modifier les classes CSS ;

créer et supprimer des éléments ;

gérer des formulaires ;

valider des données ;

utiliser localStorage ;

manipuler JSON ;

gérer des opérations asynchrones ;

utiliser async / await ;

communiquer avec une API ;

gérer les erreurs ;

organiser un projet en modules ;

déboguer une application ;

respecter les principes d'accessibilité ;

construire des interfaces interactives ;


============================================================
RÉSULTAT ATTENDU
============================================================

L'étudiant ne doit plus seulement savoir écrire
du HTML et du CSS.

Il doit maintenant être capable de créer
une véritable interface Web dynamique.

HTML construit la structure.

CSS donne la présentation.

JavaScript ajoute :

la logique ;

les événements ;

les interactions ;

les traitements ;

les données ;

le comportement dynamique.


La combinaison :

HTML + CSS + JavaScript

constitue la base fondamentale du développement
d'interfaces Web interactives.

Après ce Chapitre E, l'étudiant possède les bases
nécessaires pour passer à des applications Web
plus avancées, à la communication avec des API,
à l'organisation de projets JavaScript plus complexes
et éventuellement à des frameworks ou bibliothèques
modernes.`
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

function handleResourceFile(
    file,
    kind
) {

    const project =
        getCurrentProject();

    if (!project || !file) return;

    const resource = {

        id: generateId("resource"),

        projectId: project.id,

        name: file.name,

        type: file.type,

        kind: kind,

        size: file.size,

        createdAt:
            new Date().toISOString(),

        blob: file
    };

    addResourceToDatabase(resource)
        .then(
            async function () {

                showToast(
                    "Ressource ajoutée : " +
                    file.name
                );

                /*
                 * Recharge la liste des ressources
                 * du panneau Ressources.
                 */
                await renderResourceList();

                /*
                 * Recharge l'arbre principal du projet.
                 *
                 * Le Block 10 récupère alors les ressources
                 * enregistrées dans IndexedDB et les affiche
                 * avec les fichiers HTML / CSS / JS.
                 */
                await renderFileTree();
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

        if (!resources.length) {

            dom.resourceList.innerHTML =
                '<div class="no-results">' +
                "Aucune ressource locale." +
                "</div>";

            return;
        }

        dom.resourceList.innerHTML = "";

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

                info.innerHTML =
                    "<strong>" +
                    escapeHTML(resource.name) +
                    "</strong>" +

                    "<span>" +
                    escapeHTML(
                        resource.kind
                    ) +
                    " • " +
                    formatBytes(
                        resource.size
                    ) +
                    "</span>";

                const actions =
                    document.createElement("div");

                actions.className =
                    "resource-card-actions";

                const useButton =
                    document.createElement("button");

                useButton.type = "button";
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

                deleteButton.type = "button";
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

                        if (!confirmed) return;

                        await deleteResourceFromDatabase(
                            resource.id
                        );

                        /*
                         * Recharge le panneau Ressources.
                         */
                        await renderResourceList();

                        /*
                         * Recharge également l'arbre
                         * principal du projet.
                         */
                        await renderFileTree();

                        showToast(
                            "Ressource supprimée."
                        );
                    }
                );

                actions.appendChild(
                    useButton
                );

                actions.appendChild(
                    deleteButton
                );

                card.appendChild(info);
                card.appendChild(actions);

                dom.resourceList.appendChild(
                    card
                );
            }
        );

    } catch (error) {

        console.error(
            "Erreur ressources :",
            error
        );

        dom.resourceList.innerHTML =
            '<div class="no-results">' +
            "Impossible de charger les ressources." +
            "</div>";
    }
}


function formatBytes(bytes) {

    if (!Number.isFinite(bytes)) {
        return "0 octet";
    }

    if (bytes < 1024) {
        return bytes + " octets";
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

    if (resource.kind === "image") {

        if (fileType === "html") {

            code =
`<img
    src="${resource.name}"
    alt="${resource.name}"
>`;

        } else if (fileType === "css") {

            code =
`background-image: url("${resource.name}");`;

        } else {

            code =
`// Image : ${resource.name}`;
        }

    } else if (resource.kind === "video") {

        code =
`<video controls>
    <source
        src="${resource.name}"
        type="${resource.type}"
    >
</video>`;
    }

    if (!code) return;

    insertLibraryCode(code);

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