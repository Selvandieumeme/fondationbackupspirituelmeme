/* ==========================================================
   CAMPUS WORD 2007 SIMULATOR
   PHASE 1A
   CORE BOOTSTRAP
   ========================================================== */

"use strict";

/* ==========================================================
   GLOBAL NAMESPACE
   ========================================================== */

const CampusWord2007Simulator = {};

/* ==========================================================
   GLOBAL CONFIGURATION
   ========================================================== */

CampusWord2007Simulator.config = {

    appName: "Campus Word 2007 Simulator",

    appCode: "CAMPUS_WORD_2007",

    version: "1.0.0",

    apiBaseUrl:
        "https://api.fondationbackupspirituel.com",

    debug: true,

    loadingDuration: 1500,

    apiTimeout: 15000
};

/* ==========================================================
   GLOBAL STATE
   ========================================================== */

CampusWord2007Simulator.state = {

    initialized: false,

    loading: true,

    online: false,

    activeTab: "home",

    zoomLevel: 100,

    currentDocument: null,

    documentLoaded: false,

    apiConnected: false,

    bootCompleted: false
};

/* ==========================================================
   DOM CACHE
   ========================================================== */

CampusWord2007Simulator.dom = {};

/* ==========================================================
   DOM MANAGER
   ========================================================== */

CampusWord2007Simulator.DOMManager = {

    cache() {

        const dom =
            CampusWord2007Simulator.dom;

        dom.loadingScreen =
            document.getElementById(
                "word-loading-screen"
            );

        dom.wordApp =
            document.getElementById(
                "word-app"
            );

        dom.titleBar =
            document.getElementById(
                "title-bar"
            );

        dom.officeButton =
            document.getElementById(
                "office-button"
            );

        dom.quickAccessToolbar =
            document.getElementById(
                "quick-access-toolbar"
            );

        dom.ribbonTabs =
            document.getElementById(
                "ribbon-tabs"
            );

        dom.ribbonContainer =
            document.getElementById(
                "ribbon-container"
            );

        dom.workspace =
            document.getElementById(
                "workspace"
            );

        dom.documentViewport =
            document.getElementById(
                "document-viewport"
            );

        dom.documentPage =
            document.getElementById(
                "document-page"
            );

        dom.pageContent =
            document.getElementById(
                "page-content"
            );

        dom.statusBar =
            document.getElementById(
                "status-bar"
            );

        dom.zoomControl =
            document.getElementById(
                "zoom-control"
            );

        dom.loadingProgressBar =
            document.getElementById(
                "loading-progress-bar"
            );

        dom.documentTitle =
            document.getElementById(
                "document-title"
            );

        return dom;
    }
};

/* ==========================================================
   EVENT BUS
   ========================================================== */

CampusWord2007Simulator.EventBus = {

    events: {},

    on(eventName, callback) {

        if (!this.events[eventName]) {

            this.events[eventName] = [];
        }

        this.events[eventName].push(
            callback
        );
    },

    emit(eventName, payload = {}) {

        if (
            !this.events[eventName]
        ) {
            return;
        }

        this.events[eventName]
            .forEach(callback => {

                try {

                    callback(payload);

                } catch (error) {

                    CampusWord2007Simulator
                        .ErrorManager
                        .capture(error);
                }

            });
    },

    remove(eventName) {

        delete this.events[eventName];
    }
};

/* ==========================================================
   ERROR MANAGER
   ========================================================== */

CampusWord2007Simulator.ErrorManager = {

    capture(error) {

        console.error(
            "[Campus Word Error]",
            error
        );

        CampusWord2007Simulator
            .EventBus
            .emit(
                "system:error",
                {
                    error
                }
            );
    }
};

/* ==========================================================
   LOADING MANAGER
   ========================================================== */

CampusWord2007Simulator.LoadingManager = {

    setProgress(percent) {

        const progressBar =
            CampusWord2007Simulator
                .dom
                .loadingProgressBar;

        if (!progressBar) {
            return;
        }

        progressBar.style.width =
            percent + "%";
    },

    show() {

        const screen =
            CampusWord2007Simulator
                .dom
                .loadingScreen;

        if (!screen) {
            return;
        }

        screen.style.display =
            "flex";
    },

    hide() {

        const screen =
            CampusWord2007Simulator
                .dom
                .loadingScreen;

        if (!screen) {
            return;
        }

        screen.style.opacity = "0";

        setTimeout(() => {

            screen.style.display =
                "none";

        }, 500);
    }
};

/* ==========================================================
   API MANAGER
   ========================================================== */

CampusWord2007Simulator.ApiManager = {

    async request(
        endpoint,
        options = {}
    ) {

        const baseUrl =
            CampusWord2007Simulator
                .config
                .apiBaseUrl;

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () =>
                    controller.abort(),
                CampusWord2007Simulator
                    .config
                    .apiTimeout
            );

        try {

            const response =
                await fetch(
                    `${baseUrl}${endpoint}`,
                    {
                        ...options,
                        signal:
                            controller.signal,
                        headers: {
                            "Content-Type":
                                "application/json",
                            ...(options.headers || {})
                        }
                    }
                );

            clearTimeout(timeout);

            return response;

        } catch (error) {

            clearTimeout(timeout);

            throw error;
        }
    },

    async checkConnection() {

        try {

            const response =
                await this.request(
                    "/campus-word-2007/status"
                );

            CampusWord2007Simulator
                .state
                .apiConnected =
                response.ok;

            return response.ok;

        } catch (error) {

            CampusWord2007Simulator
                .state
                .apiConnected =
                false;

            return false;
        }
    }
};

/* ==========================================================
   APPLICATION LOGGER
   ========================================================== */

CampusWord2007Simulator.Logger = {

    log(...data) {

        if (
            CampusWord2007Simulator
                .config
                .debug
        ) {

            console.log(
                "[Campus Word]",
                ...data
            );
        }
    },

    warn(...data) {

        console.warn(
            "[Campus Word]",
            ...data
        );
    },

    error(...data) {

        console.error(
            "[Campus Word]",
            ...data
        );
    }
};

/* ==========================================================
   BOOTSTRAP ENGINE
   ========================================================== */

CampusWord2007Simulator.Bootstrap = {

    async initialize() {

        try {

            CampusWord2007Simulator
                .Logger
                .log(
                    "Initialization started"
                );

            CampusWord2007Simulator
                .DOMManager
                .cache();

            CampusWord2007Simulator
                .LoadingManager
                .show();

            CampusWord2007Simulator
                .LoadingManager
                .setProgress(15);

            CampusWord2007Simulator
                .EventBus
                .emit(
                    "application:starting"
                );

            await this.loadConfiguration();

            CampusWord2007Simulator
                .LoadingManager
                .setProgress(40);

            await this.checkApi();

            CampusWord2007Simulator
                .LoadingManager
                .setProgress(75);

            await this.finalize();

            CampusWord2007Simulator
                .LoadingManager
                .setProgress(100);

            CampusWord2007Simulator
                .LoadingManager
                .hide();

            CampusWord2007Simulator
                .state
                .initialized = true;

            CampusWord2007Simulator
                .state
                .bootCompleted = true;

            CampusWord2007Simulator
                .state
                .loading = false;

            CampusWord2007Simulator
                .EventBus
                .emit(
                    "application:ready"
                );

            CampusWord2007Simulator
                .Logger
                .log(
                    "Initialization complete"
                );

        } catch (error) {

            CampusWord2007Simulator
                .ErrorManager
                .capture(error);
        }
    },

    async loadConfiguration() {

        CampusWord2007Simulator
            .Logger
            .log(
                "Loading configuration"
            );

        return true;
    },

    async checkApi() {

        CampusWord2007Simulator
            .Logger
            .log(
                "Checking API connection"
            );

        await CampusWord2007Simulator
            .ApiManager
            .checkConnection();
    },

    async finalize() {

        return new Promise(
            resolve => {

                setTimeout(
                    () => {

                        resolve();

                    },
                    500
                );
            }
        );
    }
};

/* ==========================================================
   GLOBAL EVENTS
   ========================================================== */

CampusWord2007Simulator
    .EventBus
    .on(
        "application:ready",
        () => {

   CampusWord2007Simulator
    .RulerEngine
    .initialize();

            CampusWord2007Simulator
                .Logger
                .log(
                    "Application Ready"
                );
        }
    );

/* ==========================================================
   DOM READY
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        CampusWord2007Simulator
            .Bootstrap
            .initialize();
    }
);

/* ==========================================================
   GLOBAL EXPORT
   ========================================================== */

window.CampusWord2007Simulator =
    CampusWord2007Simulator;






/* ==========================================================
   PHASE 1B
   APPLICATION LIFECYCLE
   STARTUP ENGINE
   SHUTDOWN ENGINE
   LAYOUT ENGINE
   RESIZE ENGINE
   RESPONSIVE ENGINE
   ========================================================== */

/* ==========================================================
   VIEWPORT STATE
   ========================================================== */

CampusWord2007Simulator.state.viewport = {

    width: window.innerWidth,

    height: window.innerHeight,

    mode: "desktop",

    orientation:
        window.innerWidth >
        window.innerHeight
            ? "landscape"
            : "portrait"
};

/* ==========================================================
   STARTUP ENGINE
   ========================================================== */

CampusWord2007Simulator.StartupEngine = {

    async start() {

        CampusWord2007Simulator
            .Logger
            .log(
                "Startup Engine Started"
            );

        CampusWord2007Simulator
            .LayoutEngine
            .initialize();

        CampusWord2007Simulator
            .ResponsiveEngine
            .detect();

        CampusWord2007Simulator
            .EventBus
            .emit(
                "startup:completed"
            );
    }
};

/* ==========================================================
   SHUTDOWN ENGINE
   ========================================================== */

CampusWord2007Simulator.ShutdownEngine = {

    async shutdown() {

        CampusWord2007Simulator
            .Logger
            .warn(
                "Application Shutdown"
            );

        CampusWord2007Simulator
            .EventBus
            .emit(
                "application:shutdown"
            );
    }
};

/* ==========================================================
   LAYOUT ENGINE
   ========================================================== */

CampusWord2007Simulator.LayoutEngine = {

    initialize() {

        this.updateViewport();

        this.updateDocumentArea();

        this.updateWorkspace();

        CampusWord2007Simulator
            .Logger
            .log(
                "Layout Initialized"
            );
    },

    updateViewport() {

        CampusWord2007Simulator
            .state
            .viewport
            .width =
            window.innerWidth;

        CampusWord2007Simulator
            .state
            .viewport
            .height =
            window.innerHeight;
    },

    updateWorkspace() {

        const workspace =
            CampusWord2007Simulator
                .dom
                .workspace;

        if (!workspace) {
            return;
        }

        workspace.dataset.viewport =
            CampusWord2007Simulator
                .state
                .viewport
                .mode;
    },

    updateDocumentArea() {

        const page =
            CampusWord2007Simulator
                .dom
                .documentPage;

        if (!page) {
            return;
        }

        page.dataset.ready = "true";
    },

    refresh() {

        this.updateViewport();

        this.updateWorkspace();

        this.updateDocumentArea();

        CampusWord2007Simulator
            .EventBus
            .emit(
                "layout:updated"
            );
    }
};

/* ==========================================================
   RESIZE ENGINE
   ========================================================== */

CampusWord2007Simulator.ResizeEngine = {

    resizeTimer: null,

    initialize() {

        window.addEventListener(
            "resize",
            () => {

                clearTimeout(
                    this.resizeTimer
                );

                this.resizeTimer =
                    setTimeout(
                        () => {

                            this.handleResize();

                        },
                        100
                    );
            }
        );

        window.addEventListener(
            "orientationchange",
            () => {

                this.handleResize();
            }
        );

        CampusWord2007Simulator
            .Logger
            .log(
                "Resize Engine Initialized"
            );
    },

    handleResize() {

        CampusWord2007Simulator
            .Logger
            .log(
                "Window Resized"
            );

        CampusWord2007Simulator
            .LayoutEngine
            .refresh();

        CampusWord2007Simulator
            .ResponsiveEngine
            .detect();

        CampusWord2007Simulator
            .EventBus
            .emit(
                "window:resized"
            );
    }
};

/* ==========================================================
   RESPONSIVE ENGINE
   ========================================================== */

CampusWord2007Simulator.ResponsiveEngine = {

    detect() {

        const width =
            window.innerWidth;

        let mode =
            "desktop";

        if (width <= 480) {

            mode = "mobile";

        } else if (
            width <= 1024
        ) {

            mode = "tablet";

        } else {

            mode = "desktop";
        }

        CampusWord2007Simulator
            .state
            .viewport
            .mode = mode;

        CampusWord2007Simulator
            .state
            .viewport
            .orientation =
            window.innerWidth >
            window.innerHeight
                ? "landscape"
                : "portrait";

        this.applyMode(mode);

        CampusWord2007Simulator
            .Logger
            .log(
                "Responsive Mode:",
                mode
            );

        CampusWord2007Simulator
            .EventBus
            .emit(
                "responsive:changed",
                {
                    mode
                }
            );
    },

    applyMode(mode) {

        document.body.classList.remove(
            "desktop-mode",
            "tablet-mode",
            "mobile-mode"
        );

        switch (mode) {

            case "mobile":

                document.body.classList.add(
                    "mobile-mode"
                );

                break;

            case "tablet":

                document.body.classList.add(
                    "tablet-mode"
                );

                break;

            default:

                document.body.classList.add(
                    "desktop-mode"
                );
        }
    }
};

/* ==========================================================
   WINDOW VISIBILITY ENGINE
   ========================================================== */

CampusWord2007Simulator.VisibilityEngine = {

    initialize() {

        document.addEventListener(
            "visibilitychange",
            () => {

                if (
                    document.hidden
                ) {

                    CampusWord2007Simulator
                        .EventBus
                        .emit(
                            "application:hidden"
                        );

                } else {

                    CampusWord2007Simulator
                        .EventBus
                        .emit(
                            "application:visible"
                        );
                }
            }
        );
    }
};

/* ==========================================================
   WINDOW FOCUS ENGINE
   ========================================================== */

CampusWord2007Simulator.FocusEngine = {

    initialize() {

        window.addEventListener(
            "focus",
            () => {

                CampusWord2007Simulator
                    .EventBus
                    .emit(
                        "application:focus"
                    );
            }
        );

        window.addEventListener(
            "blur",
            () => {

                CampusWord2007Simulator
                    .EventBus
                    .emit(
                        "application:blur"
                    );
            }
        );
    }
};

/* ==========================================================
   LIFECYCLE MANAGER
   ========================================================== */

CampusWord2007Simulator.LifecycleManager = {

    initialize() {

        CampusWord2007Simulator
            .StartupEngine
            .start();

        CampusWord2007Simulator
            .ResizeEngine
            .initialize();

        CampusWord2007Simulator
            .VisibilityEngine
            .initialize();

        CampusWord2007Simulator
            .FocusEngine
            .initialize();

        CampusWord2007Simulator
            .Logger
            .log(
                "Lifecycle Manager Initialized"
            );
    }
};

/* ==========================================================
   BEFORE UNLOAD
   ========================================================== */

window.addEventListener(
    "beforeunload",
    () => {

        CampusWord2007Simulator
            .ShutdownEngine
            .shutdown();
    }
);

/* ==========================================================
   APPLICATION READY HOOK
   ========================================================== */

CampusWord2007Simulator
    .EventBus
    .on(
        "application:ready",
        () => {

            CampusWord2007Simulator
                .LifecycleManager
                .initialize();
        }
    );

/* ==========================================================
   LIFECYCLE EVENTS
   ========================================================== */

CampusWord2007Simulator
    .EventBus
    .on(
        "responsive:changed",
        payload => {

            CampusWord2007Simulator
                .Logger
                .log(
                    "Mode Updated:",
                    payload.mode
                );
        }
    );

CampusWord2007Simulator
    .EventBus
    .on(
        "window:resized",
        () => {

            CampusWord2007Simulator
                .Logger
                .log(
                    "Resize Event Completed"
                );
        }
    );








/* ==========================================================
   PHASE 1C
   RIBBON MANAGER
   ACTIVE TABS
   TAB SWITCHING
   RIBBON STATES
   RIBBON EVENTS
   ========================================================== */

/* ==========================================================
   RIBBON STATE
   ========================================================== */

CampusWord2007Simulator.state.ribbon = {

    activeTab: "home",

    initialized: false,

    tabsLoaded: false
};

/* ==========================================================
   RIBBON CONFIGURATION
   ========================================================== */

CampusWord2007Simulator.RibbonConfig = {

    tabs: {

        home: {
            id: "tab-home",
            name: "Accueil"
        },

        insert: {
            id: "tab-insert",
            name: "Insertion"
        },

      format: {
            id: "tab-format",
            name: "Format"
        },

        pageLayout: {
            id: "tab-page-layout",
            name: "Mise en page"
        },

        references: {
            id: "tab-references",
            name: "Références"
        },

        mailings: {
            id: "tab-mailings",
            name: "Publipostage"
        },

        review: {
            id: "tab-review",
            name: "Révision"
        },

        view: {
            id: "tab-view",
            name: "Affichage"
        }
    }
};

/* ==========================================================
   RIBBON DOM CACHE
   ========================================================== */

CampusWord2007Simulator.RibbonDOM = {

    tabs: {}
};

/* ==========================================================
   RIBBON MANAGER
   ========================================================== */

CampusWord2007Simulator.RibbonManager = {

    initialize() {

        this.cacheTabs();

        this.attachEvents();

        this.activateTab("home");

        CampusWord2007Simulator
            .state
            .ribbon
            .initialized = true;

        CampusWord2007Simulator
            .state
            .ribbon
            .tabsLoaded = true;

        CampusWord2007Simulator
            .Logger
            .log(
                "Ribbon Manager Initialized"
            );

        CampusWord2007Simulator
            .EventBus
            .emit(
                "ribbon:initialized"
            );
    },

    cacheTabs() {

        const config =
            CampusWord2007Simulator
                .RibbonConfig
                .tabs;

        Object.keys(config)
            .forEach(key => {

                CampusWord2007Simulator
                    .RibbonDOM
                    .tabs[key] =
                    document.getElementById(
                        config[key].id
                    );
            });
    },

    attachEvents() {

        Object.keys(
            CampusWord2007Simulator
                .RibbonDOM
                .tabs
        ).forEach(tabKey => {

            const tabElement =
                CampusWord2007Simulator
                    .RibbonDOM
                    .tabs[tabKey];

            if (!tabElement) {
                return;
            }

            tabElement
                .addEventListener(
                    "click",
                    () => {

                        this.activateTab(
                            tabKey
                        );
                    }
                );

            tabElement
                .addEventListener(
                    "mouseenter",
                    () => {

                        CampusWord2007Simulator
                            .EventBus
                            .emit(
                                "ribbon:hover",
                                {
                                    tab:
                                        tabKey
                                }
                            );
                    }
                );
        });
    },

    activateTab(tabKey) {

        if (
            !CampusWord2007Simulator
                .RibbonDOM
                .tabs[tabKey]
        ) {
            return;
        }

        this.clearActiveTabs();

        CampusWord2007Simulator
            .RibbonDOM
            .tabs[tabKey]
            .classList
            .add(
                "active-tab"
            );

        CampusWord2007Simulator
            .state
            .activeTab =
            tabKey;

        CampusWord2007Simulator
            .state
            .ribbon
            .activeTab =
            tabKey;

        CampusWord2007Simulator
            .Logger
            .log(
                "Ribbon Tab Activated:",
                tabKey
            );

        CampusWord2007Simulator
            .EventBus
            .emit(
                "ribbon:tabChanged",
                {
                    activeTab:
                        tabKey
                }
            );
    },

    clearActiveTabs() {

        Object.values(
            CampusWord2007Simulator
                .RibbonDOM
                .tabs
        ).forEach(tab => {

            if (!tab) {
                return;
            }

            tab.classList.remove(
                "active-tab"
            );
        });
    },

    getActiveTab() {

        return CampusWord2007Simulator
            .state
            .ribbon
            .activeTab;
    }
};

/* ==========================================================
   RIBBON STATE MANAGER
   ========================================================== */

CampusWord2007Simulator.RibbonStateManager = {

    setState(stateName, value) {

        CampusWord2007Simulator
            .state
            .ribbon[stateName] =
            value;

        CampusWord2007Simulator
            .EventBus
            .emit(
                "ribbon:stateChanged",
                {
                    stateName,
                    value
                }
            );
    },

    getState(stateName) {

        return CampusWord2007Simulator
            .state
            .ribbon[stateName];
    }
};

/* ==========================================================
   RIBBON EVENT REGISTRY
   ========================================================== */

CampusWord2007Simulator.RibbonEvents = {

    initialize() {

        CampusWord2007Simulator
            .EventBus
            .on(
                "ribbon:tabChanged",
                payload => {

                    CampusWord2007Simulator
                        .Logger
                        .log(
                            "Active Ribbon Tab:",
                            payload.activeTab
                        );
                }
            );

        CampusWord2007Simulator
            .EventBus
            .on(
                "ribbon:hover",
                payload => {

                    CampusWord2007Simulator
                        .Logger
                        .log(
                            "Ribbon Hover:",
                            payload.tab
                        );
                }
            );

        CampusWord2007Simulator
            .EventBus
            .on(
                "ribbon:stateChanged",
                payload => {

                    CampusWord2007Simulator
                        .Logger
                        .log(
                            "Ribbon State Updated:",
                            payload.stateName,
                            payload.value
                        );
                }
            );
    }
};

/* ==========================================================
   RIBBON PANEL REGISTRY
   FUTURE PHASES
   ========================================================== */

CampusWord2007Simulator.RibbonPanels = {

    home: {},

    insert: {},

   format: {},

    pageLayout: {},

    references: {},

    mailings: {},

    review: {},

    view: {}
};

/* ==========================================================
   RIBBON LIFECYCLE
   ========================================================== */

CampusWord2007Simulator
    .EventBus
    .on(
        "application:ready",
        () => {

            CampusWord2007Simulator
                .RibbonManager
                .initialize();

            CampusWord2007Simulator
                .RibbonEvents
                .initialize();
        }
    );

/* ==========================================================
   PUBLIC API
   ========================================================== */

CampusWord2007Simulator.Ribbon = {

    activate(tabName) {

        CampusWord2007Simulator
            .RibbonManager
            .activateTab(
                tabName
            );
    },

    current() {

        return CampusWord2007Simulator
            .RibbonManager
            .getActiveTab();
    }
};







/* ==========================================================
   PHASE 1D
   STATUS BAR
   ZOOM MANAGER
   VIEW MODES
   ========================================================== */

/* ==========================================================
   STATUS STATE
   ========================================================== */

CampusWord2007Simulator.state.status = {

    pageNumber: 1,

    totalPages: 1,

    wordCount: 0,

    language: "Français",

    zoomPercentage: 100,

    viewMode: "print"
};

/* ==========================================================
   STATUS DOM CACHE
   ========================================================== */

CampusWord2007Simulator.StatusDOM = {

    pageNumber: null,

    wordCount: null,

    language: null,

    zoomPercentage: null,

    printLayout: null,

    webLayout: null,

    readingLayout: null
};

/* ==========================================================
   ZOOM STATE
   ========================================================== */

CampusWord2007Simulator.state.zoom = {

    current: 100,

    min: 25,

    max: 500,

    step: 10
};

/* ==========================================================
   STATUS MANAGER
   ========================================================== */

CampusWord2007Simulator.StatusManager = {

    initialize() {

        this.cache();

        this.refresh();

        CampusWord2007Simulator
            .Logger
            .log(
                "Status Manager Initialized"
            );
    },

    cache() {

        const dom =
            CampusWord2007Simulator.StatusDOM;

        dom.pageNumber =
            document.getElementById(
                "status-page-number"
            );

        dom.wordCount =
            document.getElementById(
                "status-word-count"
            );

        dom.language =
            document.getElementById(
                "status-language"
            );

        dom.zoomPercentage =
            document.getElementById(
                "status-zoom-percentage"
            );

        dom.printLayout =
            document.getElementById(
                "print-layout-view"
            );

        dom.webLayout =
            document.getElementById(
                "web-layout-view"
            );

        dom.readingLayout =
            document.getElementById(
                "reading-layout-view"
            );
    },

    refresh() {

        const state =
            CampusWord2007Simulator
                .state
                .status;

        const dom =
            CampusWord2007Simulator
                .StatusDOM;

        if (dom.pageNumber) {

            dom.pageNumber.textContent =
                `Page ${state.pageNumber} sur ${state.totalPages}`;
        }

        if (dom.wordCount) {

            dom.wordCount.textContent =
                `${state.wordCount} mot`;
        }

        if (dom.language) {

            dom.language.textContent =
                state.language;
        }

        if (dom.zoomPercentage) {

            dom.zoomPercentage.textContent =
                `${state.zoomPercentage}%`;
        }
    },

    update(data = {}) {

        Object.assign(
            CampusWord2007Simulator
                .state
                .status,
            data
        );

        this.refresh();

        CampusWord2007Simulator
            .EventBus
            .emit(
                "status:updated",
                data
            );
    }
};

/* ==========================================================
   ZOOM MANAGER
   ========================================================== */

CampusWord2007Simulator.ZoomManager = {

    initialize() {

        this.cache();

        this.attachEvents();

        this.updateZoom(
            CampusWord2007Simulator
                .state
                .zoom
                .current
        );

        CampusWord2007Simulator
            .Logger
            .log(
                "Zoom Manager Initialized"
            );
    },

    cache() {

        this.zoomIn =
            document.getElementById(
                "zoom-in"
            );

        this.zoomOut =
            document.getElementById(
                "zoom-out"
            );

        this.zoomTrack =
            document.getElementById(
                "zoom-slider-track"
            );

        this.zoomThumb =
            document.getElementById(
                "zoom-slider-thumb"
            );
    },

    attachEvents() {

        if (this.zoomIn) {

            this.zoomIn
                .addEventListener(
                    "click",
                    () => {

                        this.zoomPlus();
                    }
                );
        }

        if (this.zoomOut) {

            this.zoomOut
                .addEventListener(
                    "click",
                    () => {

                        this.zoomMinus();
                    }
                );
        }

        if (this.zoomTrack) {

            this.zoomTrack
                .addEventListener(
                    "click",
                    event => {

                        this.handleTrackClick(
                            event
                        );
                    }
                );
        }
    },

    zoomPlus() {

        const state =
            CampusWord2007Simulator
                .state
                .zoom;

        this.updateZoom(
            state.current +
            state.step
        );
    },

    zoomMinus() {

        const state =
            CampusWord2007Simulator
                .state
                .zoom;

        this.updateZoom(
            state.current -
            state.step
        );
    },

    updateZoom(value) {

        const zoomState =
            CampusWord2007Simulator
                .state
                .zoom;

        value =
            Math.max(
                zoomState.min,
                Math.min(
                    zoomState.max,
                    value
                )
            );

        zoomState.current =
            value;

        CampusWord2007Simulator
            .state
            .zoomLevel =
            value;

        CampusWord2007Simulator
            .state
            .status
            .zoomPercentage =
            value;

        this.applyZoom(value);

        this.updateSlider(value);

        CampusWord2007Simulator
            .StatusManager
            .refresh();

        CampusWord2007Simulator
            .EventBus
            .emit(
                "zoom:changed",
                {
                    zoom:value
                }
            );
    },

    applyZoom(value) {

        const page =
            CampusWord2007Simulator
                .dom
                .documentPage;

        if (!page) {
            return;
        }

        const scale =
            value / 100;

        page.style.transform =
            `scale(${scale})`;

        page.style.transformOrigin =
            "top center";
    },

    updateSlider(value) {

        if (!this.zoomThumb) {
            return;
        }

        const zoomState =
            CampusWord2007Simulator
                .state
                .zoom;

        const percentage =
            (
                (
                    value -
                    zoomState.min
                ) /
                (
                    zoomState.max -
                    zoomState.min
                )
            ) * 100;

        this.zoomThumb.style.left =
            `${percentage}%`;
    },

    handleTrackClick(event) {

        if (!this.zoomTrack) {
            return;
        }

        const rect =
            this.zoomTrack
                .getBoundingClientRect();

        const clickX =
            event.clientX -
            rect.left;

        const ratio =
            clickX / rect.width;

        const zoomState =
            CampusWord2007Simulator
                .state
                .zoom;

        const newZoom =
            Math.round(
                zoomState.min +
                ratio *
                (
                    zoomState.max -
                    zoomState.min
                )
            );

        this.updateZoom(
            newZoom
        );
    }
};

/* ==========================================================
   VIEW MODE MANAGER
   ========================================================== */

CampusWord2007Simulator.ViewModeManager = {

    initialize() {

        this.attachEvents();

        this.activate(
            "print"
        );

        CampusWord2007Simulator
            .Logger
            .log(
                "View Mode Manager Initialized"
            );
    },

    attachEvents() {

        const printBtn =
            document.getElementById(
                "print-layout-view"
            );

        const webBtn =
            document.getElementById(
                "web-layout-view"
            );

        const readingBtn =
            document.getElementById(
                "reading-layout-view"
            );

        if (printBtn) {

            printBtn.addEventListener(
                "click",
                () => {

                    this.activate(
                        "print"
                    );
                }
            );
        }

        if (webBtn) {

            webBtn.addEventListener(
                "click",
                () => {

                    this.activate(
                        "web"
                    );
                }
            );
        }

        if (readingBtn) {

            readingBtn.addEventListener(
                "click",
                () => {

                    this.activate(
                        "reading"
                    );
                }
            );
        }
    },

    activate(mode) {

        CampusWord2007Simulator
            .state
            .status
            .viewMode =
            mode;

        document.body.dataset.viewMode =
            mode;

        CampusWord2007Simulator
            .EventBus
            .emit(
                "viewmode:changed",
                {
                    mode
                }
            );
    }
};

/* ==========================================================
   STATUS EVENTS
   ========================================================== */

CampusWord2007Simulator.StatusEvents = {

    initialize() {

        CampusWord2007Simulator
            .EventBus
            .on(
                "zoom:changed",
                payload => {

                    CampusWord2007Simulator
                        .Logger
                        .log(
                            "Zoom Changed:",
                            payload.zoom
                        );
                }
            );

        CampusWord2007Simulator
            .EventBus
            .on(
                "viewmode:changed",
                payload => {

                    CampusWord2007Simulator
                        .Logger
                        .log(
                            "View Mode:",
                            payload.mode
                        );
                }
            );

        CampusWord2007Simulator
            .EventBus
            .on(
                "status:updated",
                payload => {

                    CampusWord2007Simulator
                        .Logger
                        .log(
                            "Status Updated",
                            payload
                        );
                }
            );
    }
};

/* ==========================================================
   APPLICATION READY HOOK
   ========================================================== */

CampusWord2007Simulator
    .EventBus
    .on(
        "application:ready",
        () => {

            CampusWord2007Simulator
                .StatusManager
                .initialize();

            CampusWord2007Simulator
                .ZoomManager
                .initialize();

            CampusWord2007Simulator
                .ViewModeManager
                .initialize();

            CampusWord2007Simulator
                .StatusEvents
                .initialize();
        }
    );







/* ==========================================================
   PHASE 1E
   FOBAS API LAYER
   INIT
   CONFIG
   STATUS
   SESSION BOOTSTRAP
   ========================================================== */

/* ==========================================================
   API STATE
   ========================================================== */

CampusWord2007Simulator.state.api = {

    initialized: false,

    configLoaded: false,

    statusLoaded: false,

    sessionLoaded: false,

    health: "unknown",

    lastCheck: null
};

/* ==========================================================
   SESSION STATE
   ========================================================== */

CampusWord2007Simulator.state.session = {

    sessionId: null,

    userId: null,

    role: null,

    authenticated: false,

    loaded: false
};

/* ==========================================================
   FOBAS API
   ========================================================== */

CampusWord2007Simulator.FobasApi = {

    async init() {

        try {

            const response =
                await CampusWord2007Simulator
                    .ApiManager
                    .request(
                        "/campus-word-2007/init"
                    );

            if (!response.ok) {

                throw new Error(
                    "INIT_REQUEST_FAILED"
                );
            }

            const data =
                await response.json();

            CampusWord2007Simulator
                .state
                .api
                .initialized = true;

            CampusWord2007Simulator
                .EventBus
                .emit(
                    "api:init:success",
                    data
                );

            return data;

        } catch (error) {

            CampusWord2007Simulator
                .EventBus
                .emit(
                    "api:init:error",
                    error
                );

            throw error;
        }
    },

    async loadConfig() {

        try {

            const response =
                await CampusWord2007Simulator
                    .ApiManager
                    .request(
                        "/campus-word-2007/config"
                    );

            if (!response.ok) {

                throw new Error(
                    "CONFIG_REQUEST_FAILED"
                );
            }

            const config =
                await response.json();

            CampusWord2007Simulator
                .state
                .api
                .configLoaded = true;

            CampusWord2007Simulator
                .config
                .serverConfig =
                config;

            CampusWord2007Simulator
                .EventBus
                .emit(
                    "api:config:loaded",
                    config
                );

            return config;

        } catch (error) {

            CampusWord2007Simulator
                .EventBus
                .emit(
                    "api:config:error",
                    error
                );

            throw error;
        }
    },

    async loadStatus() {

        try {

            const response =
                await CampusWord2007Simulator
                    .ApiManager
                    .request(
                        "/campus-word-2007/status"
                    );

            if (!response.ok) {

                throw new Error(
                    "STATUS_REQUEST_FAILED"
                );
            }

            const status =
                await response.json();

            CampusWord2007Simulator
                .state
                .api
                .statusLoaded = true;

            CampusWord2007Simulator
                .state
                .api
                .health = "online";

            CampusWord2007Simulator
                .state
                .api
                .lastCheck =
                Date.now();

            CampusWord2007Simulator
                .EventBus
                .emit(
                    "api:status:loaded",
                    status
                );

            return status;

        } catch (error) {

            CampusWord2007Simulator
                .state
                .api
                .health = "offline";

            CampusWord2007Simulator
                .EventBus
                .emit(
                    "api:status:error",
                    error
                );

            throw error;
        }
    },

    async bootstrapSession() {

        try {

            const response =
                await CampusWord2007Simulator
                    .ApiManager
                    .request(
                        "/campus-word-2007/session/bootstrap"
                    );

            if (!response.ok) {

                throw new Error(
                    "SESSION_BOOTSTRAP_FAILED"
                );
            }

            const session =
                await response.json();

            CampusWord2007Simulator
                .state
                .session =
                {
                    ...CampusWord2007Simulator
                        .state
                        .session,

                    ...session,

                    loaded: true
                };

            CampusWord2007Simulator
                .state
                .api
                .sessionLoaded = true;

            CampusWord2007Simulator
                .EventBus
                .emit(
                    "session:loaded",
                    session
                );

            return session;

        } catch (error) {

            CampusWord2007Simulator
                .EventBus
                .emit(
                    "session:error",
                    error
                );

            throw error;
        }
    }
};

/* ==========================================================
   API HEALTH MONITOR
   ========================================================== */

CampusWord2007Simulator.ApiHealthMonitor = {

    interval: null,

    start() {

        if (this.interval) {

            clearInterval(
                this.interval
            );
        }

        this.interval =
            setInterval(
                async () => {

                    try {

                        await CampusWord2007Simulator
                            .FobasApi
                            .loadStatus();

                    } catch (error) {

                        CampusWord2007Simulator
                            .Logger
                            .warn(
                                "API Offline"
                            );
                    }

                },
                60000
            );

        CampusWord2007Simulator
            .Logger
            .log(
                "API Health Monitor Started"
            );
    },

    stop() {

        clearInterval(
            this.interval
        );

        this.interval = null;
    }
};

/* ==========================================================
   SESSION MANAGER
   ========================================================== */

CampusWord2007Simulator.SessionManager = {

    getSession() {

        return CampusWord2007Simulator
            .state
            .session;
    },

    isAuthenticated() {

        return !!(
            CampusWord2007Simulator
                .state
                .session
                .authenticated
        );
    },

    getRole() {

        return CampusWord2007Simulator
            .state
            .session
            .role;
    }
};

/* ==========================================================
   API BOOTSTRAP ENGINE
   ========================================================== */

CampusWord2007Simulator.ApiBootstrapEngine = {

    async initialize() {

        try {

            CampusWord2007Simulator
                .Logger
                .log(
                    "FOBAS API Bootstrap Started"
                );

            await CampusWord2007Simulator
                .FobasApi
                .init();

            await CampusWord2007Simulator
                .FobasApi
                .loadConfig();

            await CampusWord2007Simulator
                .FobasApi
                .loadStatus();

            await CampusWord2007Simulator
                .FobasApi
                .bootstrapSession();

            CampusWord2007Simulator
                .ApiHealthMonitor
                .start();

            CampusWord2007Simulator
                .EventBus
                .emit(
                    "api:bootstrap:complete"
                );

            CampusWord2007Simulator
                .Logger
                .log(
                    "FOBAS API Bootstrap Complete"
                );

        } catch (error) {

            CampusWord2007Simulator
                .ErrorManager
                .capture(error);
        }
    }
};

/* ==========================================================
   API EVENTS
   ========================================================== */

CampusWord2007Simulator.ApiEvents = {

    initialize() {

        CampusWord2007Simulator
            .EventBus
            .on(
                "api:init:success",
                data => {

                    CampusWord2007Simulator
                        .Logger
                        .log(
                            "INIT Loaded",
                            data
                        );
                }
            );

        CampusWord2007Simulator
            .EventBus
            .on(
                "api:config:loaded",
                config => {

                    CampusWord2007Simulator
                        .Logger
                        .log(
                            "CONFIG Loaded",
                            config
                        );
                }
            );

        CampusWord2007Simulator
            .EventBus
            .on(
                "api:status:loaded",
                status => {

                    CampusWord2007Simulator
                        .Logger
                        .log(
                            "STATUS Loaded",
                            status
                        );
                }
            );

        CampusWord2007Simulator
            .EventBus
            .on(
                "session:loaded",
                session => {

                    CampusWord2007Simulator
                        .Logger
                        .log(
                            "SESSION Loaded",
                            session
                        );
                }
            );
    }
};

/* ==========================================================
   APPLICATION READY
   ========================================================== */

CampusWord2007Simulator
    .EventBus
    .on(
        "application:ready",
        async () => {

            CampusWord2007Simulator
                .ApiEvents
                .initialize();

            await CampusWord2007Simulator
                .ApiBootstrapEngine
                .initialize();
        }
    );










/* ==========================================================
   PHASE 1F
   SYSTEM LAYERS REGISTRATION
   ========================================================== */

/* ==========================================================
   LAYER STATE
   ========================================================== */

CampusWord2007Simulator.state.layers = {

    initialized: false,

    simulation: false,

    validation: false,

    missions: false,

    events: false
};

/* ==========================================================
   LAYER REGISTRY
   ========================================================== */

CampusWord2007Simulator.LayerRegistry = {

    layers: {},

    register(name, layer) {

        this.layers[name] = layer;

        CampusWord2007Simulator
            .Logger
            .log(
                `Layer Registered: ${name}`
            );

        CampusWord2007Simulator
            .EventBus
            .emit(
                "layer:registered",
                {
                    name
                }
            );
    },

    get(name) {

        return this.layers[name];
    },

    exists(name) {

        return !!this.layers[name];
    },

    getAll() {

        return this.layers;
    }
};

/* ==========================================================
   SIMULATION LAYER
   ========================================================== */

CampusWord2007Simulator.SimulationLayer = {

    id: "simulation-layer",

    version: "1.0.0",

    initialized: false,

    active: false,

    missionsLoaded: false,

    start() {

        this.active = true;

        CampusWord2007Simulator
            .EventBus
            .emit(
                "simulation:start"
            );
    },

    stop() {

        this.active = false;

        CampusWord2007Simulator
            .EventBus
            .emit(
                "simulation:stop"
            );
    }
};

/* ==========================================================
   VALIDATION LAYER
   ========================================================== */

CampusWord2007Simulator.ValidationLayer = {

    id: "validation-layer",

    version: "1.0.0",

    initialized: false,

    active: false,

    validate() {

        CampusWord2007Simulator
            .Logger
            .log(
                "Validation Engine Pending"
            );
    }
};

/* ==========================================================
   MISSION LAYER
   ========================================================== */

CampusWord2007Simulator.MissionLayer = {

    id: "mission-layer",

    version: "1.0.0",

    initialized: false,

    active: false,

    currentMission: null,

    missions: [],

    loadMission(id) {

        CampusWord2007Simulator
            .Logger
            .log(
                "Mission Loader Pending",
                id
            );
    }
};

/* ==========================================================
   EVENTS LAYER
   ========================================================== */

CampusWord2007Simulator.SystemEventsLayer = {

    id: "events-layer",

    version: "1.0.0",

    initialized: false,

    active: false,

    dispatch(eventName, payload) {

        CampusWord2007Simulator
            .EventBus
            .emit(
                eventName,
                payload
            );
    }
};

/* ==========================================================
   LAYER MANAGER
   ========================================================== */

CampusWord2007Simulator.LayerManager = {

    initialize() {

        this.registerLayers();

        this.activateLayerStates();

        CampusWord2007Simulator
            .state
            .layers
            .initialized = true;

        CampusWord2007Simulator
            .EventBus
            .emit(
                "layers:initialized"
            );

        CampusWord2007Simulator
            .Logger
            .log(
                "System Layers Initialized"
            );
    },

    registerLayers() {

        CampusWord2007Simulator
            .LayerRegistry
            .register(
                "simulation",
                CampusWord2007Simulator
                    .SimulationLayer
            );

        CampusWord2007Simulator
            .LayerRegistry
            .register(
                "validation",
                CampusWord2007Simulator
                    .ValidationLayer
            );

        CampusWord2007Simulator
            .LayerRegistry
            .register(
                "missions",
                CampusWord2007Simulator
                    .MissionLayer
            );

        CampusWord2007Simulator
            .LayerRegistry
            .register(
                "events",
                CampusWord2007Simulator
                    .SystemEventsLayer
            );
    },

    activateLayerStates() {

        CampusWord2007Simulator
            .state
            .layers
            .simulation = true;

        CampusWord2007Simulator
            .state
            .layers
            .validation = true;

        CampusWord2007Simulator
            .state
            .layers
            .missions = true;

        CampusWord2007Simulator
            .state
            .layers
            .events = true;
    }
};

/* ==========================================================
   SYSTEM EVENT DEFINITIONS
   ========================================================== */

CampusWord2007Simulator.SystemEvents = {

    APPLICATION_READY:
        "application:ready",

    APPLICATION_SHUTDOWN:
        "application:shutdown",

    SIMULATION_START:
        "simulation:start",

    SIMULATION_STOP:
        "simulation:stop",

    MISSION_LOADED:
        "mission:loaded",

    MISSION_COMPLETED:
        "mission:completed",

    VALIDATION_STARTED:
        "validation:started",

    VALIDATION_COMPLETED:
        "validation:completed"
};

/* ==========================================================
   LAYER EVENTS
   ========================================================== */

CampusWord2007Simulator.LayerEvents = {

    initialize() {

        CampusWord2007Simulator
            .EventBus
            .on(
                "layer:registered",
                payload => {

                    CampusWord2007Simulator
                        .Logger
                        .log(
                            "Layer Available:",
                            payload.name
                        );
                }
            );

        CampusWord2007Simulator
            .EventBus
            .on(
                "layers:initialized",
                () => {

                    CampusWord2007Simulator
                        .Logger
                        .log(
                            "All Layers Ready"
                        );
                }
            );

        CampusWord2007Simulator
            .EventBus
            .on(
                "simulation:start",
                () => {

                    CampusWord2007Simulator
                        .Logger
                        .log(
                            "Simulation Engine Started"
                        );
                }
            );

        CampusWord2007Simulator
            .EventBus
            .on(
                "simulation:stop",
                () => {

                    CampusWord2007Simulator
                        .Logger
                        .log(
                            "Simulation Engine Stopped"
                        );
                }
            );
    }
};

/* ==========================================================
   INTERNAL SERVICE REGISTRY
   ========================================================== */

CampusWord2007Simulator.ServiceRegistry = {

    services: {},

    register(name, service) {

        this.services[name] =
            service;
    },

    get(name) {

        return this.services[name];
    }
};

/* ==========================================================
   FUTURE MODULE REGISTRY
   ========================================================== */

CampusWord2007Simulator.ModuleRegistry = {

    modules: {},

    register(name, module) {

        this.modules[name] =
            module;
    },

    get(name) {

        return this.modules[name];
    }
};

/* ==========================================================
   APPLICATION READY
   ========================================================== */

CampusWord2007Simulator
    .EventBus
    .on(
        "application:ready",
        () => {

            CampusWord2007Simulator
                .LayerEvents
                .initialize();

            CampusWord2007Simulator
                .LayerManager
                .initialize();
        }
    );

/* ==========================================================
   PUBLIC API
   ========================================================== */

CampusWord2007Simulator.SystemLayers = {

    get(name) {

        return CampusWord2007Simulator
            .LayerRegistry
            .get(name);
    },

    exists(name) {

        return CampusWord2007Simulator
            .LayerRegistry
            .exists(name);
    },

    list() {

        return CampusWord2007Simulator
            .LayerRegistry
            .getAll();
    }
};







































































CampusWord2007Simulator.MouseEngine = {};

CampusWord2007Simulator.MouseState = {

    x: 0,

    y: 0,

    isDown: false,

    leftButton: false,

    rightButton: false,

    middleButton: false,

    lastClickTime: 0,

    clickCount: 0
};






/* ==========================================================
   MOUSE ENGINE CORE
   ========================================================== */

CampusWord2007Simulator.MouseEngine = {

    initialized: false,

    initialize() {

        if (this.initialized) {
            return;
        }

        document.addEventListener(
            "mousemove",
            this.handleMove.bind(this)
        );

        document.addEventListener(
            "mousedown",
            this.handleDown.bind(this)
        );

        document.addEventListener(
            "mouseup",
            this.handleUp.bind(this)
        );

        document.addEventListener(
            "contextmenu",
            this.handleContextMenu.bind(this)
        );

        this.initialized = true;

        CampusWord2007Simulator
            .Logger
            .log(
                "Mouse Engine Initialized"
            );
    },

    handleMove(event) {

        const state =
            CampusWord2007Simulator
                .MouseState;

        state.x =
            event.clientX;

        state.y =
            event.clientY;

        CampusWord2007Simulator
            .EventBus
            .emit(
                "mouse:move",
                {
                    x: state.x,
                    y: state.y
                }
            );
    },

    handleDown(event) {

        const state =
            CampusWord2007Simulator
                .MouseState;

        state.isDown = true;

        if (event.button === 0) {
            state.leftButton = true;
        }

        if (event.button === 1) {
            state.middleButton = true;
        }

        if (event.button === 2) {
            state.rightButton = true;
        }

        CampusWord2007Simulator
            .EventBus
            .emit(
                "mouse:down",
                {
                    button:
                        event.button
                }
            );
    },

    handleUp(event) {

        const state =
            CampusWord2007Simulator
                .MouseState;

        state.isDown = false;

        state.leftButton = false;

        state.middleButton = false;

        state.rightButton = false;

        CampusWord2007Simulator
            .EventBus
            .emit(
                "mouse:up",
                {
                    button:
                        event.button
                }
            );
    },

    handleContextMenu(event) {

        CampusWord2007Simulator
            .EventBus
            .emit(
                "mouse:rightclick",
                {
                    x:
                        event.clientX,
                    y:
                        event.clientY
                }
            );
    }
};







CampusWord2007Simulator.TouchEngine = {};

CampusWord2007Simulator.TouchState = {

    active: false,

    x: 0,

    y: 0,

    fingerCount: 0
};



CampusWord2007Simulator.MobileKeyboardState = {

    bridge: null
};


CampusWord2007Simulator.CursorEngine = {};

CampusWord2007Simulator.CursorRegistry = {

    default: "default",

    text: "text",

    pointer: "pointer",

    move: "move",

    wait: "wait"
};


CampusWord2007Simulator.VirtualFocusEngine = {};

CampusWord2007Simulator.VirtualFocusState = {

    activeElement: null,

    focusedArea: null,

    lastFocusedArea: null
};



CampusWord2007Simulator.PointerTracker = {};


CampusWord2007Simulator.PointerState = {

    startX: 0,

    startY: 0,

    currentX: 0,

    currentY: 0,

    deltaX: 0,

    deltaY: 0,

    dragging: false
};








/* ==========================================================
   POINTER TRACKER RUNTIME
   ========================================================== */

CampusWord2007Simulator.PointerTracker = {

    initialized: false,

    initialize() {

        if (this.initialized) {
            return;
        }

        this.attachEvents();

        this.initialized = true;

        CampusWord2007Simulator
            .Logger
            .log(
                "Pointer Tracker Initialized"
            );
    },

    attachEvents() {

        CampusWord2007Simulator
            .EventBus
            .on(
                "mouse:down",
                payload => {

                    this.handleDown(
                        payload
                    );
                }
            );

        CampusWord2007Simulator
            .EventBus
            .on(
                "mouse:move",
                payload => {

                    this.handleMove(
                        payload
                    );
                }
            );

        CampusWord2007Simulator
            .EventBus
            .on(
                "mouse:up",
                payload => {

                    this.handleUp(
                        payload
                    );
                }
            );
    },





       handleDown() {

        const state =
            CampusWord2007Simulator
                .PointerState;

        const mouse =
            CampusWord2007Simulator
                .MouseState;

        state.startX =
            mouse.x;

        state.startY =
            mouse.y;

        state.currentX =
            mouse.x;

        state.currentY =
            mouse.y;

        state.deltaX = 0;

        state.deltaY = 0;

        state.dragging = false;

        CampusWord2007Simulator
            .EventBus
            .emit(
                "pointer:start",
                {
                    x: mouse.x,
                    y: mouse.y
                }
            );
    },





       handleMove() {

        const pointer =
            CampusWord2007Simulator
                .PointerState;

        const mouse =
            CampusWord2007Simulator
                .MouseState;

        pointer.currentX =
            mouse.x;

        pointer.currentY =
            mouse.y;

        pointer.deltaX =
            mouse.x -
            pointer.startX;

        pointer.deltaY =
            mouse.y -
            pointer.startY;

        CampusWord2007Simulator
            .EventBus
            .emit(
                "pointer:update",
                {
                    currentX:
                        pointer.currentX,

                    currentY:
                        pointer.currentY,

                    deltaX:
                        pointer.deltaX,

                    deltaY:
                        pointer.deltaY
                }
            );
    },

   





       handleUp() {

        const pointer =
            CampusWord2007Simulator
                .PointerState;

        CampusWord2007Simulator
            .EventBus
            .emit(
                "pointer:end",
                {
                    x:
                        pointer.currentX,

                    y:
                        pointer.currentY
                }
            );

        pointer.dragging =
            false;
    }
};









/* ==========================================================
   EDITOR STATE
   ========================================================== */

CampusWord2007Simulator.EditorState = {

    focused: false,

    textContent: "",

    caretPosition: 0,

    selectionStart: 0,

    selectionEnd: 0
};




/* ==========================================================
   EDITABLE SURFACE ENGINE
   ========================================================== */

CampusWord2007Simulator.EditableSurfaceEngine = {

    initialized: false,

    editorElement: null,

    initialize() {

        if (this.initialized) {
            return;
        }

        this.cache();

        this.attachEvents();

        this.initialized = true;

        CampusWord2007Simulator
            .Logger
            .log(
                "Editable Surface Initialized"
            );
    },

    cache() {

        this.editorElement =
            document.getElementById(
                "document-editor-surface"
            );
    },

attachEvents() {

    if (!this.editorElement) {
        return;
    }

   const bridge =
        document.getElementById(
            "mobile-keyboard-bridge"
        );
    this.editorElement
        .addEventListener(
            "click",
            () => {

                CampusWord2007Simulator
                    .EditorState
                    .focused = true;

                CampusWord2007Simulator
                    .EventBus
                    .emit(
                        "editor:focus"
                    );

            }
        );
}

};





   
 












/* ==========================================================
   POINTER EVENTS
   ========================================================== */

CampusWord2007Simulator.PointerEvents = {

    initialize() {

        CampusWord2007Simulator
            .EventBus
            .on(
                "pointer:start",
                () => {}
            );

        CampusWord2007Simulator
            .EventBus
            .on(
                "pointer:update",
                () => {}
            );

        CampusWord2007Simulator
            .EventBus
            .on(
                "pointer:end",
                () => {}
            );
    }
};












/* ==========================================================
   INPUT LIFECYCLE MANAGER
   ========================================================== */

/* ==========================================================
   INPUT FOUNDATION STATE
   ========================================================== */

CampusWord2007Simulator.state.input = {

    initialized: false,

    mouseReady: false,

    touchReady: false,

    cursorReady: false,

    focusReady: false,

    pointerReady: false,
   
    editorReady: false,
   
   caretReady: false,

   caretMovementReady: false,
   
   keyboardReady: false,

   textInputReady: false,

    renderReady: false,

   mobileKeyboardReady: false
   
};







/* ==========================================================
   TEXT INPUT ENGINE
   ========================================================== */

CampusWord2007Simulator.TextInputEngine = {

    initialized: false,

    initialize() {

        if (this.initialized) {
            return;
        }

        CampusWord2007Simulator
            .EventBus
            .on(
                "keyboard:input",
                event => {

                    this.insertCharacter(
                        event.key
                    );
                }
            );

        this.initialized = true;

        CampusWord2007Simulator
            .Logger
            .log(
                "Text Input Engine Initialized"
            );
    },

    insertCharacter(character) {

        if (
            !character ||
            character.length !== 1
        ) {
            return;
        }

        const editor =
            CampusWord2007Simulator
                .EditorState;

        editor.textContent +=
            character;

        editor.caretPosition++;

        CampusWord2007Simulator
            .EventBus
            .emit(
                "editor:textchanged",
                {
                    text:
                        editor.textContent
                }
            );
    }
};








/* ==========================================================
   INPUT LIFECYCLE MANAGER
   ========================================================== */

CampusWord2007Simulator.InputLifecycleManager = {

    initialize() {

        this.initializeMouse();

        this.initializeTouch();

        this.initializeCursor();

        this.initializeFocus();

        this.initializePointer();
       
        this.initializeEditor();

        this.initializeCaret();

       this.initializeCaretMovement();
       
       this.initializeKeyboard();

       this.initializeTextInput();

      this.initializeRenderer();

      this.initializeMobileKeyboard();

        CampusWord2007Simulator
            .state
            .input
            .initialized = true;

        CampusWord2007Simulator
            .Logger
            .log(
                "Input Lifecycle Initialized"
            );

        CampusWord2007Simulator
            .EventBus
            .emit(
                "input:initialized"
            );
    },

    initializeMouse() {

        if (
            CampusWord2007Simulator
                .MouseEngine
                .initialize
        ) {

            CampusWord2007Simulator
                .MouseEngine
                .initialize();
        }

        CampusWord2007Simulator
            .state
            .input
            .mouseReady = true;
    },

    initializeTouch() {

        if (
            CampusWord2007Simulator
                .TouchEngine
                .initialize
        ) {

            CampusWord2007Simulator
                .TouchEngine
                .initialize();
        }

        CampusWord2007Simulator
            .state
            .input
            .touchReady = true;
    },

    initializeCursor() {

        if (
            CampusWord2007Simulator
                .CursorEngine
                .initialize
        ) {

            CampusWord2007Simulator
                .CursorEngine
                .initialize();
        }

        CampusWord2007Simulator
            .state
            .input
            .cursorReady = true;
    },

    initializeFocus() {

        if (
            CampusWord2007Simulator
                .VirtualFocusEngine
                .initialize
        ) {

            CampusWord2007Simulator
                .VirtualFocusEngine
                .initialize();
        }

        CampusWord2007Simulator
            .state
            .input
            .focusReady = true;
    },

    initializePointer() {

        if (
            CampusWord2007Simulator
                .PointerTracker
                .initialize
        ) {

            CampusWord2007Simulator
                .PointerTracker
                .initialize();
        }

        CampusWord2007Simulator
            .state
            .input
            .pointerReady = true;
    },




   initializeEditor() {

    if (
        CampusWord2007Simulator
            .EditableSurfaceEngine &&
        CampusWord2007Simulator
            .EditableSurfaceEngine
            .initialize
    ) {

        CampusWord2007Simulator
            .EditableSurfaceEngine
            .initialize();
    }

    CampusWord2007Simulator
        .state
        .input
        .editorReady = true;
},


   initializeCaret() {

    if (
        CampusWord2007Simulator
            .CaretEngine &&
        CampusWord2007Simulator
            .CaretEngine
            .initialize
    ) {

        CampusWord2007Simulator
            .CaretEngine
            .initialize();
    }

    CampusWord2007Simulator
        .state
        .input
        .caretReady = true;
},

initializeCaretMovement() {

    if (
        CampusWord2007Simulator
            .CaretMovementEngine &&
        CampusWord2007Simulator
            .CaretMovementEngine
            .initialize
    ) {

        CampusWord2007Simulator
            .CaretMovementEngine
            .initialize();
    }

    CampusWord2007Simulator
        .state
        .input
        .caretMovementReady = true;
},
   

initializeKeyboard() {

    if (
        CampusWord2007Simulator
            .KeyboardEngine &&
        CampusWord2007Simulator
            .KeyboardEngine
            .initialize
    ) {

        CampusWord2007Simulator
            .KeyboardEngine
            .initialize();
    }

    CampusWord2007Simulator
        .state
        .input
        .keyboardReady = true;
},

initializeTextInput() {

    if (
        CampusWord2007Simulator
            .TextInputEngine &&
        CampusWord2007Simulator
            .TextInputEngine
            .initialize
    ) {

        CampusWord2007Simulator
            .TextInputEngine
            .initialize();
    }

    CampusWord2007Simulator
        .state
        .input
        .textInputReady = true;
},

initializeRenderer() {

    if (
        CampusWord2007Simulator
            .DocumentRenderEngine &&
        CampusWord2007Simulator
            .DocumentRenderEngine
            .initialize
    ) {

        CampusWord2007Simulator
            .DocumentRenderEngine
            .initialize();
    }

    CampusWord2007Simulator
        .state
        .input
        .renderReady = true;
},

initializeMobileKeyboard() {

    if (
        CampusWord2007Simulator
            .MobileKeyboardEngine &&
        CampusWord2007Simulator
            .MobileKeyboardEngine
            .initialize
    ) {

        CampusWord2007Simulator
            .MobileKeyboardEngine
            .initialize();
    }

    CampusWord2007Simulator
        .state
        .input
        .mobileKeyboardReady = true;
}
};




/* ==========================================================
   INPUT EVENTS
   ========================================================== */

CampusWord2007Simulator.InputEvents = {

    initialize() {

        CampusWord2007Simulator
            .EventBus
            .on(
                "input:initialized",
                () => {

                    CampusWord2007Simulator
                        .Logger
                        .log(
                            "Virtual Input Foundation Ready"
                        );
                }
            );
    }
};





/* ==========================================================
   APPLICATION READY
   ========================================================== */

CampusWord2007Simulator
    .EventBus
    .on(
        "application:ready",
        () => {

            CampusWord2007Simulator
                .InputEvents
                .initialize();

           CampusWord2007Simulator
                .PointerEvents
                .initialize();

            CampusWord2007Simulator
                .InputLifecycleManager
                .initialize();
        }
    );









/* ==========================================================
   CARET STATE
   ========================================================== */

CampusWord2007Simulator.CaretState = {

    visible: true,

    blinking: false,

    x: 20,

    y: 20,

    height: 18
};





   /* ==========================================================
   KEYBOARD STATE
   ========================================================== */

CampusWord2007Simulator.KeyboardState = {

    initialized: false,

    lastKey: null,

    ctrlKey: false,

    shiftKey: false,

    altKey: false
   
};



/* ==========================================================
   CARET ENGINE
   ========================================================== */

CampusWord2007Simulator.CaretEngine = {

    initialized: false,

    element: null,

    blinkTimer: null,

    initialize() {

        if (this.initialized) {
            return;
        }
   
        this.element =
            document.getElementById(
                "virtual-caret"
            );

        if (!this.element) {
            return;
        }

        this.render();

        this.startBlinking();

        this.initialized = true;

        CampusWord2007Simulator
            .Logger
            .log(
                "Caret Engine Initialized"
            );
    },

    render() {

        const state =
            CampusWord2007Simulator
                .CaretState;

        if (!this.element) {
            return;
        }

        this.element.style.left =
            state.x + "px";

        this.element.style.top =
            state.y + "px";

        this.element.style.height =
            state.height + "px";
    },

    startBlinking() {

        this.blinkTimer =
            setInterval(
                () => {

                    const state =
                        CampusWord2007Simulator
                            .CaretState;

                    state.visible =
                        !state.visible;

                    if (!this.element) {
                        return;
                    }

                    this.element.style.opacity =
                        state.visible
                            ? "1"
                            : "0";

                },
                500
            );
    }
};






/* ==========================================================
   KEYBOARD ENGINE
   ========================================================== */

CampusWord2007Simulator.KeyboardEngine = {

    initialized: false,

    initialize() {

        if (this.initialized) {
            return;
        }

        document.addEventListener(
            "keydown",
            this.handleKeyDown.bind(this)
        );

        document.addEventListener(
            "keyup",
            this.handleKeyUp.bind(this)
        );

        document.addEventListener(
            "keypress",
            this.handleKeyPress.bind(this)
        );

        this.initialized = true;

        CampusWord2007Simulator
            .Logger
            .log(
                "Keyboard Engine Initialized"
            );
    },

    handleKeyDown(event) {

        const state =
            CampusWord2007Simulator
                .KeyboardState;

        state.lastKey =
            event.key;

        state.ctrlKey =
            event.ctrlKey;

        state.shiftKey =
            event.shiftKey;

        state.altKey =
            event.altKey;

        CampusWord2007Simulator
            .EventBus
            .emit(
                "keyboard:keydown",
                {
                    key:
                        event.key,

                    code:
                        event.code,

                    ctrlKey:
                        event.ctrlKey,

                    shiftKey:
                        event.shiftKey,

                    altKey:
                        event.altKey
                }
            );
    },

    handleKeyUp(event) {

        CampusWord2007Simulator
            .EventBus
            .emit(
                "keyboard:keyup",
                {
                    key:
                        event.key,

                    code:
                        event.code
                }
            );
    },

    handleKeyPress(event) {

        CampusWord2007Simulator
            .EventBus
            .emit(
                "keyboard:input",
                {
                    key:
                        event.key,

                    code:
                        event.code
                }
            );
    }
};










/* ==========================================================
   MOBILE KEYBOARD ENGINE
   ========================================================== */

CampusWord2007Simulator.MobileKeyboardEngine = {

    initialized: false,

    initialize() {

        if (this.initialized) {
            return;
        }

        const bridge =
            document.getElementById(
                "mobile-keyboard-bridge"
            );

        if (!bridge) {
            return;
        }

        CampusWord2007Simulator
            .MobileKeyboardState
            .bridge = bridge;

        const editor =
            document.getElementById(
                "document-editor-surface"
            );

        if (editor) {

            editor.addEventListener(
                "click",
                () => {

                    bridge.focus();
                }
            );

            editor.addEventListener(
                "touchstart",
                () => {

                    bridge.focus();
                }
            );
        }

        bridge.addEventListener(
            "input",
            event => {

                const value =
                    event.target.value;

                if (
                    value.length > 0
                ) {

                    const character =
                        value[
                            value.length - 1
                        ];

                    CampusWord2007Simulator
                        .EventBus
                        .emit(
                            "keyboard:input",
                            {
                                key:
                                    character
                            }
                        );
                }

                event.target.value = "";
            }
        );

        this.initialized = true;

       console.log(
    "Mobile Keyboard Initialized"
);

        CampusWord2007Simulator
            .Logger
            .log(
                "Mobile Keyboard Initialized"
            );
    }
   
};








/* ==========================================================
   DOCUMENT RENDER ENGINE
   ========================================================== */

CampusWord2007Simulator.DocumentRenderEngine = {

    initialized: false,

    surface: null,

    textLayer: null,

    initialize() {

        if (this.initialized) {
            return;
        }

        this.surface =
            document.getElementById(
                "document-editor-surface"
            );

        this.textLayer =
            document.getElementById(
                "document-text-layer"
            );

        if (
            !this.surface ||
            !this.textLayer
        ) {
            return;
        }

        CampusWord2007Simulator
            .EventBus
            .on(
                "editor:textchanged",
                () => {

                    this.render();
                }
            );

        this.render();

        this.initialized = true;

        CampusWord2007Simulator
            .Logger
            .log(
                "Document Render Initialized"
            );
    },

    render() {

    if (!this.textLayer) {
        return;
    }

    this.textLayer.textContent =
        CampusWord2007Simulator
            .EditorState
            .textContent;

    const caretState =
        CampusWord2007Simulator
            .CaretState;

    const editorState =
        CampusWord2007Simulator
            .EditorState;

    const characterWidth = 8;

    caretState.x =
        20 +
        (
            editorState.caretPosition *
            characterWidth
        );

    caretState.y = 0;

        if (
        CampusWord2007Simulator
            .CaretEngine
            .render
    ) {

        CampusWord2007Simulator
            .CaretEngine
            .render();
    }
}
};


















/* ==========================================================
   CARET MOVEMENT ENGINE
   ========================================================== */

CampusWord2007Simulator.CaretMovementEngine = {

    initialized: false,

    initialize() {

        if (this.initialized) {
            return;
        }

        CampusWord2007Simulator
            .EventBus
            .on(
                "keyboard:keydown",
                event => {

                    this.handleKey(
                        event
                    );
                }
            );

        this.initialized = true;

        CampusWord2007Simulator
            .Logger
            .log(
                "Caret Movement Initialized"
            );
    },

    handleKey(event) {

        switch (
            event.key
        ) {

            case "ArrowLeft":

                this.moveLeft();

                break;

            case "ArrowRight":

                this.moveRight();

                break;
        }
    },

    moveLeft() {

        const editor =
            CampusWord2007Simulator
                .EditorState;

        if (
            editor.caretPosition <= 0
        ) {
            return;
        }

        editor.caretPosition--;

        CampusWord2007Simulator
            .DocumentRenderEngine
            .render();
    },

    moveRight() {

        const editor =
            CampusWord2007Simulator
                .EditorState;

        if (
            editor.caretPosition >=
            editor.textContent.length
        ) {
            return;
        }

        editor.caretPosition++;

        CampusWord2007Simulator
            .DocumentRenderEngine
            .render();
    }
};












/* ==========================================================
   RULER ENGINE
   ========================================================== */

CampusWord2007Simulator.RulerEngine = {

    initialized: false,

    horizontalRuler: null,

    verticalRuler: null,

    initialize() {

        if (this.initialized) {
            return;
        }

        this.horizontalRuler =
            document.getElementById(
                "horizontal-ruler"
            );

        this.verticalRuler =
            document.getElementById(
                "vertical-ruler"
            );

        this.attachEvents();

        this.initialized = true;

        CampusWord2007Simulator
            .Logger
            .log(
                "Ruler Engine Initialized"
            );
    },

    attachEvents() {

        if (
            this.horizontalRuler
        ) {

            this.horizontalRuler
                .addEventListener(
                    "click",
                    event => {

                        this.onHorizontalClick(
                            event
                        );
                    }
                );
        }

        if (
            this.verticalRuler
        ) {

            this.verticalRuler
                .addEventListener(
                    "click",
                    event => {

                        this.onVerticalClick(
                            event
                        );
                    }
                );
        }
    },

   onHorizontalClick(event) {

    const rect =
        this.horizontalRuler
            .getBoundingClientRect();

    const x =
        event.clientX -
        rect.left;

    CampusWord2007Simulator
        .CaretState
        .x = x;

    if (
        CampusWord2007Simulator
            .CaretEngine
            .render
    ) {

        CampusWord2007Simulator
            .CaretEngine
            .render();
    }

    CampusWord2007Simulator
        .Logger
        .log(
            "Horizontal Ruler Click:",
            x
        );
},
    onVerticalClick(event) {

    const rect =
        this.verticalRuler
            .getBoundingClientRect();

    const y =
        event.clientY -
        rect.top;

    CampusWord2007Simulator
        .CaretState
        .y = y;

    if (
        CampusWord2007Simulator
            .CaretEngine
            .render
    ) {

        CampusWord2007Simulator
            .CaretEngine
            .render();
    }

    CampusWord2007Simulator
        .Logger
        .log(
            "Vertical Ruler Click:",
            y
        );
}


