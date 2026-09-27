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