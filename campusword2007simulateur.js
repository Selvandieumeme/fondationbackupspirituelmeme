
/* ==========================================================
   A1 — CAMPUSWORD2007SIMULATEUR ROOT
   SYSTEM FOUNDATION ROOT OBJECT
   ========================================================== */

window.CampusWord2007Simulateur = {

    version: "1.0.0",

    initialized: false,

    booting: false,

    ready: false,

    destroyed: false,

    buildName: "Campus Word 2007 Simulateur",

    state: {},

    config: {},

    registry: {}
};





/* ==========================================================
   A1.1 — ROOT UTILITIES
   ========================================================== */

CampusWord2007Simulateur.isReady = function () {

    return this.ready === true;
};

CampusWord2007Simulateur.isInitialized = function () {

    return this.initialized === true;
};

CampusWord2007Simulateur.markBooting = function () {

    this.booting = true;
};

CampusWord2007Simulateur.markReady = function () {

    this.booting = false;

    this.ready = true;

    this.initialized = true;
};

CampusWord2007Simulateur.markDestroyed = function () {

    this.destroyed = true;

    this.ready = false;
};









/* ==========================================================
   A1.2 — SYSTEM INFORMATION
   ========================================================== */

CampusWord2007Simulateur.SystemInformation = {

    getVersion() {

        return CampusWord2007Simulateur
            .version;
    },

    getBuildName() {

        return CampusWord2007Simulateur
            .buildName;
    },

    isReady() {

        return CampusWord2007Simulateur
            .ready;
    },

    isBooting() {

        return CampusWord2007Simulateur
            .booting;
    }
};




/* ==========================================================
   A1.3 — ROOT VALIDATION
   ========================================================== */

if (
    typeof CampusWord2007Simulateur !==
    "object"
) {

    throw new Error(
        "CampusWord2007Simulateur Root Missing"
    );
}




/* ==========================================================
   A2 — GLOBAL STATE
   CENTRALIZED STATE TREE
   ========================================================== */

CampusWord2007Simulateur.state = {

    application: {

    initialized: false,

    booting: false,

    ready: false,

    suspended: false,

    destroyed: false
},

    editor: {

        focused: false,

        textContent: "",

        caretPosition: 0,

        selectionStart: 0,

        selectionEnd: 0,

        activePage: 1,

        totalPages: 1
    },

    caret: {

        visible: true,

        blinking: false,

        x: 0,

        y: 0,

        height: 18,

        preferredColumn: 0
    },

    keyboard: {

        initialized: false,

        lastKey: null,

        ctrlKey: false,

        shiftKey: false,

        altKey: false
    },

    mouse: {

        x: 0,

        y: 0,

        isDown: false,

        leftButton: false,

        middleButton: false,

        rightButton: false,

        lastClickTime: 0,

        clickCount: 0
    },

    pointer: {

        startX: 0,

        startY: 0,

        currentX: 0,

        currentY: 0,

        deltaX: 0,

        deltaY: 0,

        dragging: false
    },

    touch: {

        active: false,

        x: 0,

        y: 0,

        fingerCount: 0
    },

    focus: {

        activeElement: null,

        focusedArea: null,

        lastFocusedArea: null
    },

    mobileKeyboard: {

        bridge: null,

        visible: false
    },

    page: {

        currentPage: 1,

        totalPages: 1,

        pageWidth: 816,

        pageHeight: 1056,

        contentHeight: 0,

        pageOffsetY: 0,

        pageTop: 0,

        pageBottom: 0
    },

    margins: {

        left: 96,

        right: 96,

        top: 96,

        bottom: 96
    },

    status: {

        wordCount: 0,

        characterCount: 0,

        zoomLevel: 100,

        viewMode: "print"
    },

    api: {

        initialized: false,

        configLoaded: false,

        statusLoaded: false,

        sessionLoaded: false,

        health: "unknown",

        lastCheck: null
    },

    session: {

        sessionId: null,

        userId: null,

        role: null,

        authenticated: false,

        loaded: false
    },

    layers: {

        initialized: false,

        simulation: false,

        validation: false,

        missions: false,

        events: false
    },

    input: {

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
    }
};







/* ==========================================================
   A2.1 — STATE ACCESSOR
   ========================================================== */

CampusWord2007Simulateur.State = {

    get(section) {

        return CampusWord2007Simulateur
            .state[section];
    },

    set(
        section,
        key,
        value
    ) {

        if (
            !CampusWord2007Simulateur
                .state[section]
        ) {

            return;
        }

        CampusWord2007Simulateur
            .state[section][key] =
                value;
    },

    merge(
        section,
        values
    ) {

        if (
            !CampusWord2007Simulateur
                .state[section]
        ) {

            return;
        }

        Object.assign(
            CampusWord2007Simulateur
                .state[section],
            values
        );
    }
};





/* ==========================================================
   A2.2 — STATE RESET ENGINE
   ========================================================== */

CampusWord2007Simulateur.StateResetEngine = {

    resetEditor() {

        const editor =
            CampusWord2007Simulateur
                .state
                .editor;

        editor.textContent = "";

        editor.caretPosition = 0;

        editor.selectionStart = 0;

        editor.selectionEnd = 0;

        editor.activePage = 1;

        editor.totalPages = 1;
    },

    resetCaret() {

        const caret =
            CampusWord2007Simulateur
                .state
                .caret;

        caret.x = 0;

        caret.y = 0;

        caret.visible = true;
    },

    resetMouse() {

        const mouse =
            CampusWord2007Simulateur
                .state
                .mouse;

        mouse.x = 0;

        mouse.y = 0;

        mouse.isDown = false;

        mouse.leftButton = false;

        mouse.middleButton = false;

        mouse.rightButton = false;
    }
};





/* ==========================================================
   A3 — CONFIG MANAGER
   CENTRAL APPLICATION CONFIGURATION
   ========================================================== */

CampusWord2007Simulateur.Config = {

    values: {

        application: {

            name:
                "Campus Word 2007 Simulateur",

            version:
                "1.0.0"
        },

        document: {

            pageWidth: 816,

            pageHeight: 1056,

            minPageCount: 1
        },

        margins: {

            left: 96,

            right: 96,

            top: 96,

            bottom: 96,

            minimum: 20,

            maximum: 250
        },

        caret: {

            width: 1,

            height: 18,

            blinkInterval: 500,

            defaultX: 0,

            defaultY: 0
        },

        ruler: {

            horizontalHeight: 24,

            verticalWidth: 24
        },

        scrollbar: {

            dragMultiplier: 5
        },

        keyboard: {

            enableShortcuts: true
        },

        render: {

            fontFamily:
                '"Times New Roman", serif',

            fontSize:
                "12pt",

            lineHeight:
                18
        },

        zoom: {

            defaultValue: 100,

            minimum: 10,

            maximum: 500
        },

        api: {

            healthCheckInterval:
                60000
        }
    }
};







/* ==========================================================
   A3.1 — CONFIG GETTER
   ========================================================== */

CampusWord2007Simulateur.Config.get =
function (section, key) {

    const config =
        this.values[section];

    if (!config) {
        return null;
    }

    return config[key];
};






/* ==========================================================
   A3.2 — CONFIG SETTER
   ========================================================== */

CampusWord2007Simulateur.Config.set =
function (
    section,
    key,
    value
) {

    if (
        !this.values[section]
    ) {

        this.values[section] = {};
    }

    this.values[section][key] =
        value;
};







/* ==========================================================
   A3.3 — CONFIG MERGE
   ========================================================== */

CampusWord2007Simulateur.Config.merge =
function (
    section,
    values
) {

    if (
        !this.values[section]
    ) {

        this.values[section] = {};
    }

    Object.assign(
        this.values[section],
        values
    );
};








/* ==========================================================
   A3.4 — CONFIG RESET
   ========================================================== */

CampusWord2007Simulateur.Config.reset =
function () {

    this.values.margins.left =
        96;

    this.values.margins.right =
        96;

    this.values.margins.top =
        96;

    this.values.margins.bottom =
        96;
};









/* ==========================================================
   A3.5 — CONFIG VALIDATION
   ========================================================== */

if (
    !CampusWord2007Simulateur.Config
) {

    throw new Error(
        "Config Manager Missing"
    );
}







/* ==========================================================
   A4 — LOGGER
   CENTRAL LOGGING SYSTEM
   ========================================================== */

CampusWord2007Simulateur.Logger = {

    enabled: true,

    showTimestamp: true,

    history: [],

    maxHistory: 1000,

    log(...args) {

        this.write(
            "LOG",
            args
        );
    },

    info(...args) {

        this.write(
            "INFO",
            args
        );
    },

    warn(...args) {

        this.write(
            "WARN",
            args
        );
    },

    error(...args) {

        this.write(
            "ERROR",
            args
        );
    },

    debug(...args) {

        this.write(
            "DEBUG",
            args
        );
    },

    write(
        level,
        args
    ) {

        if (
            !this.enabled
        ) {

            return;
        }

        const timestamp =
            new Date()
                .toISOString();

        const entry = {

            level,

            timestamp,

            data: [...args]
        };

        this.history.push(
            entry
        );

        if (
            this.history.length >
            this.maxHistory
        ) {

            this.history.shift();
        }

        const output = [];

        if (
            this.showTimestamp
        ) {

            output.push(
                "[" +
                timestamp +
                "]"
            );
        }

        output.push(
            "[CampusWord2007]"
        );

        output.push(
            "[" +
            level +
            "]"
        );

        console.log(
            ...output,
            ...args
        );
    },

    clearHistory() {

        this.history = [];
    },

    getHistory() {

        return [
            ...this.history
        ];
    },

    enable() {

        this.enabled = true;
    },

    disable() {

        this.enabled = false;
    }
};







/* ==========================================================
   A4.1 — LOGGER SHORTCUTS
   ========================================================== */

CampusWord2007Simulateur.Log =
    CampusWord2007Simulateur
        .Logger;




/* ==========================================================
   A4.2 — LOGGER CONFIGURATION
   ========================================================== */

CampusWord2007Simulateur.Logger.configure =
function (
    options = {}
) {

    if (
        typeof options.enabled ===
        "boolean"
    ) {

        this.enabled =
            options.enabled;
    }

    if (
        typeof options.showTimestamp ===
        "boolean"
    ) {

        this.showTimestamp =
            options.showTimestamp;
    }

    if (
        typeof options.maxHistory ===
        "number"
    ) {

        this.maxHistory =
            options.maxHistory;
    }
};






/* ==========================================================
   A4.3 — LOGGER RESET
   ========================================================== */

CampusWord2007Simulateur.Logger.reset =
function () {

    this.enabled = true;

    this.showTimestamp = true;

    this.history = [];

    this.maxHistory = 1000;
};






/* ==========================================================
   A4.4 — LOGGER VALIDATION
   ========================================================== */

if (
    !CampusWord2007Simulateur
        .Logger
) {

    throw new Error(
        "Logger Missing"
    );
}







/* ==========================================================
   A5 — EVENT BUS
   CENTRAL APPLICATION EVENT SYSTEM
   ========================================================== */

CampusWord2007Simulateur.EventBus = {

    events: {},

    initialized: false,

    initialize() {

        if (this.initialized) {
            return;
        }

        this.events = {};

        this.initialized = true;

        CampusWord2007Simulateur
            .Logger
            .info(
                "EventBus Initialized"
            );
    }
};







/* ==========================================================
   A5.1 — EVENT SUBSCRIPTION
   ========================================================== */

CampusWord2007Simulateur.EventBus.on =
function (
    eventName,
    callback
) {

    if (
        typeof callback !==
        "function"
    ) {

        return;
    }

    if (
        !this.events[eventName]
    ) {

        this.events[eventName] = [];
    }

    this.events[eventName]
        .push(
            callback
        );
};







/* ==========================================================
   A5.2 — EVENT UNSUBSCRIPTION
   ========================================================== */

CampusWord2007Simulateur.EventBus.off =
function (
    eventName,
    callback
) {

    const listeners =
        this.events[eventName];

    if (
        !listeners
    ) {

        return;
    }

    this.events[eventName] =
        listeners.filter(
            listener =>
                listener !== callback
        );
};






/* ==========================================================
   A5.3 — EVENT EMITTER
   ========================================================== */

CampusWord2007Simulateur.EventBus.emit =
function (
    eventName,
    payload = {}
) {

    const listeners =
        this.events[eventName];

    if (
        !listeners ||
        listeners.length === 0
    ) {

        return;
    }

    listeners.forEach(
        listener => {

            try {

                listener(
                    payload
                );

            } catch (error) {

                CampusWord2007Simulateur
                    .Logger
                    .error(
                        "Event Error:",
                        error
                    );
            }
        }
    );
};





/* ==========================================================
   A5.4 — EMIT ONCE
   ========================================================== */

CampusWord2007Simulateur.EventBus.once =
function (
    eventName,
    callback
) {

    const wrapper =
        payload => {

            callback(
                payload
            );

            this.off(
                eventName,
                wrapper
            );
        };

    this.on(
        eventName,
        wrapper
    );
};







/* ==========================================================
   A5.5 — CLEAR EVENT
   ========================================================== */

CampusWord2007Simulateur.EventBus.clear =
function (
    eventName
) {

    delete this.events[
        eventName
    ];
};






/* ==========================================================
   A5.6 — CLEAR ALL EVENTS
   ========================================================== */

CampusWord2007Simulateur.EventBus.clearAll =
function () {

    this.events = {};
};





/* ==========================================================
   A5.7 — EVENT COUNT
   ========================================================== */

CampusWord2007Simulateur.EventBus.listenerCount =
function (
    eventName
) {

    const listeners =
        this.events[eventName];

    if (
        !listeners
    ) {

        return 0;
    }

    return listeners.length;
};




/* ==========================================================
   A5.8 — EVENT BUS VALIDATION
   ========================================================== */

if (
    !CampusWord2007Simulateur
        .EventBus
) {

    throw new Error(
        "EventBus Missing"
    );
}






/* ==========================================================
   A6 — ERROR MANAGER
   CENTRALIZED ERROR HANDLING SYSTEM
   ========================================================== */

CampusWord2007Simulateur.ErrorManager = {

    initialized: false,

    errors: [],

    maxErrors: 1000,

    initialize() {

        if (this.initialized) {
            return;
        }

        this.attachGlobalHandlers();

       this.attachPromiseHandler();

        this.initialized = true;

        CampusWord2007Simulateur
            .Logger
            .info(
                "ErrorManager Initialized"
            );
    }
};








/* ==========================================================
   A6.1 — REGISTER ERROR
   ========================================================== */

CampusWord2007Simulateur
    .ErrorManager
    .register =
function (
    source,
    error
) {

    const entry = {

        timestamp:
            Date.now(),

        source:
            source ||

            "Unknown",

        message:
            error?.message ||

            String(error),

        stack:
            error?.stack ||

            null
    };

    this.errors.push(
        entry
    );

    if (
        this.errors.length >
        this.maxErrors
    ) {

        this.errors.shift();
    }

    CampusWord2007Simulateur
        .Logger
        .error(
            "[" +
            entry.source +
            "]",
            entry.message
        );

    CampusWord2007Simulateur
        .EventBus
        .emit(
            "system:error",
            entry
        );
};





/* ==========================================================
   A6.2 — GET ALL ERRORS
   ========================================================== */

CampusWord2007Simulateur
    .ErrorManager
    .getAll =
function () {

    return [
        ...this.errors
    ];
};







/* ==========================================================
   A6.3 — GET LAST ERROR
   ========================================================== */

CampusWord2007Simulateur
    .ErrorManager
    .getLast =
function () {

    if (
        this.errors.length === 0
    ) {

        return null;
    }

    return this.errors[
        this.errors.length - 1
    ];
};








/* ==========================================================
   A6.4 — CLEAR ERRORS
   ========================================================== */

CampusWord2007Simulateur
    .ErrorManager
    .clear =
function () {

    this.errors = [];
};





/* ==========================================================
   A6.5 — ERROR COUNT
   ========================================================== */

CampusWord2007Simulateur
    .ErrorManager
    .count =
function () {

    return this.errors.length;
};






/* ==========================================================
   A6.6 — GLOBAL ERROR CAPTURE
   ========================================================== */

CampusWord2007Simulateur
    .ErrorManager
    .attachGlobalHandlers =
function () {

    window.addEventListener(
        "error",
        event => {

            this.register(
                "WindowError",
                event.error ||
                new Error(
                    event.message
                )
            );
        }
    );
};







/* ==========================================================
   A6.7 — PROMISE ERROR CAPTURE
   ========================================================== */

CampusWord2007Simulateur
    .ErrorManager
    .attachPromiseHandler =
function () {

    window.addEventListener(
        "unhandledrejection",
        event => {

            this.register(
                "PromiseError",
                event.reason
            );
        }
    );
};









/* ==========================================================
   A6.8 — SAFE EXECUTION
   ========================================================== */

CampusWord2007Simulateur
    .ErrorManager
    .safe =
function (
    source,
    callback
) {

    try {

        return callback();

    } catch (error) {

        this.register(
            source,
            error
        );

        return null;
    }
};






/* ==========================================================
   A6.10 — ERROR MANAGER VALIDATION
   ========================================================== */

if (
    !CampusWord2007Simulateur
        .ErrorManager
) {

    throw new Error(
        "ErrorManager Missing"
    );
}








/* ==========================================================
   A7 — APPLICATION BOOTSTRAP
   SYSTEM STARTUP ENGINE
   ========================================================== */

CampusWord2007Simulateur.Bootstrap = {

    initialized: false,

    initialize() {

        if (this.initialized) {
            return;
        }

        CampusWord2007Simulateur
            .markBooting();

        CampusWord2007Simulateur
            .Logger
            .info(
                "Boot Sequence Started"
            );

        this.initializeCore();

        this.initializeInterface();

        this.initializeState();

        this.finishBoot();

        this.initialized = true;
    },

    initializeCore() {

        CampusWord2007Simulateur
            .EventBus
            .initialize();

        CampusWord2007Simulateur
            .ErrorManager
            .initialize();
    },

    initializeInterface() {

        this.loadingScreen =
            document.getElementById(
                "word-loading-screen"
            );

        this.wordApp =
            document.getElementById(
                "word-app"
            );

        this.root =
            document.getElementById(
                "campusword2007simulateur"
            );
    },

    initializeState() {

        CampusWord2007Simulateur
            .state
            .application
            .initialized = true;

        CampusWord2007Simulateur
            .state
            .application
            .booting = true;
    },

    finishBoot() {

        setTimeout(
            () => {

                if (
                    this.loadingScreen
                ) {

                    this.loadingScreen
                        .style
                        .display =
                            "none";
                }

                if (
                    this.wordApp
                ) {

                    this.wordApp
                        .style
                        .display =
                            "flex";
                }

                CampusWord2007Simulateur
                    .state
                    .application
                    .booting = false;

                CampusWord2007Simulateur
                    .state
                    .application
                    .ready = true;

                CampusWord2007Simulateur
                    .markReady();

                CampusWord2007Simulateur
                    .Logger
                    .info(
                        "System Ready"
                    );

                CampusWord2007Simulateur
                    .EventBus
                    .emit(
                        "application:ready"
                    );

            },
            500
        );
    }
};









/* ==========================================================
   A7.1 — DOM READY STARTUP
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        CampusWord2007Simulateur
            .Bootstrap
            .initialize();
    }
);







/* ==========================================================
   A7.2 — BOOTSTRAP VALIDATION
   ========================================================== */

if (
    !CampusWord2007Simulateur
        .Bootstrap
) {

    throw new Error(
        "Bootstrap Missing"
    );
}








/* ==========================================================
   B1 — REGISTRY MANAGER
   CENTRAL APPLICATION REGISTRY
   ========================================================== */

CampusWord2007Simulateur.Registry = {

    initialized: false,

    engines: {},

    modules: {},

    services: {},

    dom: {},

    components: {},

    initialize() {

        if (this.initialized) {

            return;
        }

        this.initialized = true;

        CampusWord2007Simulateur
            .Logger
            .info(
                "Registry Initialized"
            );
    }
};






/* ==========================================================
   B1.1 — ENGINE REGISTRY
   ========================================================== */

CampusWord2007Simulateur
    .Registry
    .registerEngine =
function (
    name,
    engine
) {

    if (
        !name ||
        !engine
    ) {

        return false;
    }

    this.engines[name] =
        engine;

    return true;
};

CampusWord2007Simulateur
    .Registry
    .getEngine =
function (
    name
) {

    return (
        this.engines[name] ||
        null
    );
};






/* ==========================================================
   B1.2 — MODULE REGISTRY
   ========================================================== */

CampusWord2007Simulateur
    .Registry
    .registerModule =
function (
    name,
    module
) {

    if (
        !name ||
        !module
    ) {

        return false;
    }

    this.modules[name] =
        module;

    return true;
};

CampusWord2007Simulateur
    .Registry
    .getModule =
function (
    name
) {

    return (
        this.modules[name] ||
        null
    );
};







/* ==========================================================
   B1.3 — SERVICE REGISTRY
   ========================================================== */

CampusWord2007Simulateur
    .Registry
    .registerService =
function (
    name,
    service
) {

    if (
        !name ||
        !service
    ) {

        return false;
    }

    this.services[name] =
        service;

    return true;
};

CampusWord2007Simulateur
    .Registry
    .getService =
function (
    name
) {

    return (
        this.services[name] ||
        null
    );
};






/* ==========================================================
   B1.4 — DOM REGISTRY
   ========================================================== */

CampusWord2007Simulateur
    .Registry
    .registerDOM =
function (
    name,
    element
) {

    if (
        !name ||
        !element
    ) {

        return false;
    }

    this.dom[name] =
        element;

    return true;
};

CampusWord2007Simulateur
    .Registry
    .getDOM =
function (
    name
) {

    return (
        this.dom[name] ||
        null
    );
};







/* ==========================================================
   B1.5 — COMPONENT REGISTRY
   ========================================================== */

CampusWord2007Simulateur
    .Registry
    .registerComponent =
function (
    name,
    component
) {

    if (
        !name ||
        !component
    ) {

        return false;
    }

    this.components[name] =
        component;

    return true;
};

CampusWord2007Simulateur
    .Registry
    .getComponent =
function (
    name
) {

    return (
        this.components[name] ||
        null
    );
};






/* ==========================================================
   B1.6 — REGISTRY EXISTENCE CHECK
   ========================================================== */

CampusWord2007Simulateur
    .Registry
    .has =
function (
    category,
    name
) {

    const group =
        this[category];

    if (
        !group
    ) {

        return false;
    }

    return (
        name in group
    );
};









/* ==========================================================
   B1.7 — REMOVE REGISTRY ENTRY
   ========================================================== */

CampusWord2007Simulateur
    .Registry
    .remove =
function (
    category,
    name
) {

    const group =
        this[category];

    if (
        !group
    ) {

        return false;
    }

    delete group[name];

    return true;
};







/* ==========================================================
   B1.8 — CLEAR REGISTRY
   ========================================================== */

CampusWord2007Simulateur
    .Registry
    .clear =
function () {

    this.engines = {};

    this.modules = {};

    this.services = {};

    this.dom = {};

    this.components = {};
};






/* ==========================================================
   B1.9 — REGISTRY VALIDATION
   ========================================================== */

if (
    !CampusWord2007Simulateur
        .Registry
) {

    throw new Error(
        "Registry Manager Missing"
    );
}






/* ==========================================================
   B2 — BOOTSTRAP ENGINE
   APPLICATION STARTUP ENGINE
   ========================================================== */

CampusWord2007Simulateur.BootstrapEngine = {

    initialized: false,

    booted: false,

    initialize() {

        if (
            this.initialized
        ) {

            return;
        }

        CampusWord2007Simulateur
            .markBooting();

        this.initialized = true;

        CampusWord2007Simulateur
            .Logger
            .info(
                "Bootstrap Engine Initialized"
            );
    }
};







/* ==========================================================
   B2.1 — START APPLICATION
   ========================================================== */

CampusWord2007Simulateur
    .BootstrapEngine
    .start =
function () {

    if (
        this.booted
    ) {

        return;
    }

    this.initialize();

    this.loadRegistries();

    this.validateDOM();

    this.booted = true;

    CampusWord2007Simulateur
        .Logger
        .info(
            "Application Started"
        );

    CampusWord2007Simulateur
        .EventBus
        .emit(
            "application:started"
        );
};









/* ==========================================================
   B2.2 — LOAD REGISTRIES
   ========================================================== */

CampusWord2007Simulateur
    .BootstrapEngine
    .loadRegistries =
function () {

    CampusWord2007Simulateur
        .Registry
        .initialize();

    CampusWord2007Simulateur
        .EventBus
        .initialize();

    CampusWord2007Simulateur
        .ErrorManager
        .initialize();
};







/* ==========================================================
   B2.3 — REQUIRED DOM VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .BootstrapEngine
    .validateDOM =
function () {

    const requiredIds = [

        "campusword2007simulateur",

        "word-app",

        "workspace",

        "document-viewport",

        "document-scroll-area",

        "document-canvas",

        "document-pages-container",

        "document-page-template"
    ];

    requiredIds.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );

            if (
                !element
            ) {

                throw new Error(
                    "Missing DOM Element: " +
                    id
                );
            }
        }
    );
};






/* ==========================================================
   B2.4 — REGISTER CORE DOM
   ========================================================== */

CampusWord2007Simulateur
    .BootstrapEngine
    .registerDOM =
function () {

    const registry =
        CampusWord2007Simulateur
            .Registry;

    registry.registerDOM(
        "root",
        document.getElementById(
            "campusword2007simulateur"
        )
    );

    registry.registerDOM(
        "workspace",
        document.getElementById(
            "workspace"
        )
    );

    registry.registerDOM(
        "viewport",
        document.getElementById(
            "document-viewport"
        )
    );

    registry.registerDOM(
        "canvas",
        document.getElementById(
            "document-canvas"
        )
    );

    registry.registerDOM(
        "pagesContainer",
        document.getElementById(
            "document-pages-container"
        )
    );

    registry.registerDOM(
        "pageTemplate",
        document.getElementById(
            "document-page-template"
        )
    );
};







/* ==========================================================
   B2.5 — UPDATE APPLICATION STATE
   ========================================================== */

CampusWord2007Simulateur
    .BootstrapEngine
    .updateState =
function () {

    CampusWord2007Simulateur
        .state
        .application
        .initialized = true;

    CampusWord2007Simulateur
        .state
        .application
        .booting = false;

    CampusWord2007Simulateur
        .state
        .application
        .ready = true;
};







/* ==========================================================
   B2.6 — MARK SYSTEM READY
   ========================================================== */

CampusWord2007Simulateur
    .BootstrapEngine
    .finish =
function () {

    this.registerDOM();

    this.updateState();

    CampusWord2007Simulateur
        .markReady();


   CampusWord2007Simulateur
    .DOMManager
    .initialize();

CampusWord2007Simulateur
    .DOMManager
    .initializeDocument();

    CampusWord2007Simulateur
        .Logger
        .info(
            "System Ready"
        );


    CampusWord2007Simulateur
        .EventBus
        .emit(
            "application:ready"
        );
};







/* ==========================================================
   B2.7 — SAFE BOOT
   ========================================================== */

CampusWord2007Simulateur
    .BootstrapEngine
    .boot =
function () {

    CampusWord2007Simulateur
        .ErrorManager
        .safe(
            "BootstrapEngine",

            () => {

                this.start();

                this.finish();
            }
        );
};






/* ==========================================================
   B2.8 — DOM READY STARTUP
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",

    () => {

        CampusWord2007Simulateur
            .BootstrapEngine
            .boot();
    }
);







/* ==========================================================
   B2.9 — BOOTSTRAP VALIDATION
   ========================================================== */

if (
    !CampusWord2007Simulateur
        .BootstrapEngine
) {

    throw new Error(
        "Bootstrap Engine Missing"
    );
}







/* ==========================================================
   B3 — DOM MANAGER
   CENTRAL DOM MANAGEMENT SYSTEM
   ========================================================== */

CampusWord2007Simulateur.DOMManager = {

    initialized: false,

    initialize() {

        if (
            this.initialized
        ) {

            return;
        }

        this.initialized = true;

        CampusWord2007Simulateur
            .Logger
            .info(
                "DOM Manager Initialized"
            );
    }
};







/* ==========================================================
   B3.1 — DOM CACHE
   ========================================================== */

CampusWord2007Simulateur
    .DOMManager
    .cache =
function () {

    const registry =
        CampusWord2007Simulateur
            .Registry;

    registry.registerDOM(
        "root",
        document.getElementById(
            "campusword2007simulateur"
        )
    );

    registry.registerDOM(
        "pagesContainer",
        document.getElementById(
            "document-pages-container"
        )
    );

    registry.registerDOM(
        "pageTemplate",
        document.getElementById(
            "document-page-template"
        )
    );
};






/* ==========================================================
   B3.2 — CREATE PAGE
   ========================================================== */

CampusWord2007Simulateur
    .DOMManager
    .createPage =
function (
    pageNumber
) {

    const template =
        CampusWord2007Simulateur
            .Registry
            .getDOM(
                "pageTemplate"
            );

    if (
        !template
    ) {

        return null;
    }

    const fragment =
        template.content.cloneNode(
            true
        );

    const page =
        fragment.querySelector(
            ".document-page"
        );

    page.setAttribute(
        "data-page-number",
        pageNumber
    );

    return page;
};







/* ==========================================================
   B3.3 — APPEND PAGE
   ========================================================== */

CampusWord2007Simulateur
    .DOMManager
    .appendPage =
function (
    pageElement
) {

    const container =
        CampusWord2007Simulateur
            .Registry
            .getDOM(
                "pagesContainer"
            );

    if (
        !container ||
        !pageElement
    ) {

        return;
    }

    container.appendChild(
        pageElement
    );
};






/* ==========================================================
   B3.4 — CREATE FIRST PAGE
   ========================================================== */

CampusWord2007Simulateur
    .DOMManager
    .createFirstPage =
function () {

    const page =
        this.createPage(
            1
        );

    if (
        !page
    ) {

        return;
    }

    this.appendPage(
        page
    );

    CampusWord2007Simulateur
        .state
        .page
        .currentPage = 1;

    CampusWord2007Simulateur
        .state
        .page
        .totalPages = 1;

    CampusWord2007Simulateur
        .state
        .editor
        .activePage = 1;

    CampusWord2007Simulateur
        .state
        .editor
        .totalPages = 1;
};






/* ==========================================================
   B3.5 — CLEAR PAGES
   ========================================================== */

CampusWord2007Simulateur
    .DOMManager
    .clearPages =
function () {

    const container =
        CampusWord2007Simulateur
            .Registry
            .getDOM(
                "pagesContainer"
            );

    if (
        !container
    ) {

        return;
    }

    container.innerHTML = "";
};






/* ==========================================================
   B3.6 — PAGE COUNT
   ========================================================== */

CampusWord2007Simulateur
    .DOMManager
    .getPageCount =
function () {

    const container =
        CampusWord2007Simulateur
            .Registry
            .getDOM(
                "pagesContainer"
            );

    if (
        !container
    ) {

        return 0;
    }

    return container
        .querySelectorAll(
            ".document-page"
        )
        .length;
};





/* ==========================================================
   B3.7 — INITIALIZE DOCUMENT
   ========================================================== */

CampusWord2007Simulateur
    .DOMManager
    .initializeDocument =
function () {

    this.cache();

    this.clearPages();

    this.createFirstPage();

    CampusWord2007Simulateur
        .Logger
        .info(
            "First Page Created"
        );
};






/* ==========================================================
   B3.8 — REGISTER WITH BOOTSTRAP
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(
        "application:ready",

        () => {

            CampusWord2007Simulateur
                .DOMManager
                .initialize();

            CampusWord2007Simulateur
                .DOMManager
                .initializeDocument();
        }
    );








/* ==========================================================
   B3.9 — DOM MANAGER VALIDATION
   ========================================================== */

if (
    !CampusWord2007Simulateur
        .DOMManager
) {

    throw new Error(
        "DOM Manager Missing"
    );
}







/* ==========================================================
   B4 — PAGE MANAGER
   DOCUMENT PAGE MANAGEMENT SYSTEM
   ========================================================== */

CampusWord2007Simulateur.PageManager = {

    initialized: false,

    initialize() {

        if (
            this.initialized
        ) {

            return;
        }

        this.initialized = true;

        CampusWord2007Simulateur
            .Logger
            .info(
                "Page Manager Initialized"
            );
    }
};








/* ==========================================================
   B4.1 — GET PAGE CONTAINER
   ========================================================== */

CampusWord2007Simulateur
    .PageManager
    .getContainer =
function () {

    return CampusWord2007Simulateur
        .Registry
        .getDOM(
            "pagesContainer"
        );
};







/* ==========================================================
   B4.2 — GET PAGE TEMPLATE
   ========================================================== */

CampusWord2007Simulateur
    .PageManager
    .getTemplate =
function () {

    return CampusWord2007Simulateur
        .Registry
        .getDOM(
            "pageTemplate"
        );
};









/* ==========================================================
   B4.3 — GET ALL PAGES
   ========================================================== */

CampusWord2007Simulateur
    .PageManager
    .getPages =
function () {

    const container =
        this.getContainer();

    if (
        !container
    ) {

        return [];
    }

    return Array.from(
        container.querySelectorAll(
            ".document-page"
        )
    );
};









/* ==========================================================
   B4.4 — GET PAGE COUNT
   ========================================================== */

CampusWord2007Simulateur
    .PageManager
    .getPageCount =
function () {

    return this
        .getPages()
        .length;
};








/* ==========================================================
   B4.5 — GET PAGE BY NUMBER
   ========================================================== */

CampusWord2007Simulateur
    .PageManager
    .getPage =
function (
    pageNumber
) {

    return document
        .querySelector(
            '.document-page[data-page-number="' +
            pageNumber +
            '"]'
        );
};








/* ==========================================================
   B4.6 — CREATE PAGE
   ========================================================== */

CampusWord2007Simulateur
    .PageManager
    .createPage =
function (
    pageNumber
) {

    const template =
        this.getTemplate();

    if (
        !template
    ) {

        return null;
    }

    const fragment =
        template.content
            .cloneNode(
                true
            );

    const page =
        fragment.querySelector(
            ".document-page"
        );

    page.setAttribute(
        "data-page-number",
        pageNumber
    );

    return page;
};









/* ==========================================================
   B4.7 — APPEND PAGE
   ========================================================== */

CampusWord2007Simulateur
    .PageManager
    .appendPage =
function (
    pageElement
) {

    const container =
        this.getContainer();

    if (
        !container ||
        !pageElement
    ) {

        return;
    }

    container.appendChild(
        pageElement
    );
};









/* ==========================================================
   B4.8 — ADD NEW PAGE
   ========================================================== */

CampusWord2007Simulateur
    .PageManager
    .addPage =
function () {

    const nextPageNumber =
        this.getPageCount() + 1;

    const page =
        this.createPage(
            nextPageNumber
        );

    if (
        !page
    ) {

        return null;
    }

    this.appendPage(
        page
    );

    CampusWord2007Simulateur
        .state
        .page
        .totalPages =
            nextPageNumber;

    CampusWord2007Simulateur
        .state
        .editor
        .totalPages =
            nextPageNumber;

    return page;
};











/* ==========================================================
   B4.9 — REMOVE PAGE
   ========================================================== */

CampusWord2007Simulateur
    .PageManager
    .removePage =
function (
    pageNumber
) {

    if (
        pageNumber <= 1
    ) {

        return false;
    }

    const page =
        this.getPage(
            pageNumber
        );

    if (
        !page
    ) {

        return false;
    }

    page.remove();

    this.refreshNumbers();

    return true;
};








/* ==========================================================
   B4.10 — REFRESH PAGE NUMBERS
   ========================================================== */

CampusWord2007Simulateur
    .PageManager
    .refreshNumbers =
function () {

    const pages =
        this.getPages();

    pages.forEach(
        (
            page,
            index
        ) => {

            page.setAttribute(
                "data-page-number",
                index + 1
            );
        }
    );

    const total =
        pages.length;

    CampusWord2007Simulateur
        .state
        .page
        .totalPages =
            total;

    CampusWord2007Simulateur
        .state
        .editor
        .totalPages =
            total;
};






/* ==========================================================
   B4.11 — GET ACTIVE PAGE
   ========================================================== */

CampusWord2007Simulateur
    .PageManager
    .getActivePage =
function () {

    return this.getPage(

        CampusWord2007Simulateur
            .state
            .editor
            .activePage
    );
};








/* ==========================================================
   B4.12 — SET ACTIVE PAGE
   ========================================================== */

CampusWord2007Simulateur
    .PageManager
    .setActivePage =
function (
    pageNumber
) {

    const page =
        this.getPage(
            pageNumber
        );

    if (
        !page
    ) {

        return false;
    }

    CampusWord2007Simulateur
        .state
        .editor
        .activePage =
            pageNumber;

    CampusWord2007Simulateur
        .state
        .page
        .currentPage =
            pageNumber;

    return true;
};








/* ==========================================================
   B4.13 — CREATE DOCUMENT
   ========================================================== */

CampusWord2007Simulateur
    .PageManager
    .createDocument =
function () {

    if (
        this.getPageCount() > 0
    ) {

        return;
    }

    this.addPage();
};








/* ==========================================================
   B4.14 — PAGE MANAGER READY EVENT
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(
        "application:ready",

        () => {

            CampusWord2007Simulateur
                .PageManager
                .initialize();
        }
    );








/* ==========================================================
   B4.15 — PAGE MANAGER VALIDATION
   ========================================================== */

if (
    !CampusWord2007Simulateur
        .PageManager
) {

    throw new Error(
        "Page Manager Missing"
    );
}








/* ==========================================================
   B5 — LAYOUT ENGINE
   APPLICATION LAYOUT MANAGEMENT SYSTEM
   ========================================================== */

CampusWord2007Simulateur.LayoutEngine = {

    initialized: false,

    initialize() {

        if (
            this.initialized
        ) {

            return;
        }

        this.initialized = true;

        CampusWord2007Simulateur
            .Logger
            .info(
                "Layout Engine Initialized"
            );
    }
};








/* ==========================================================
   B5.1 — ROOT LAYOUT ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .cacheRootLayout =
function () {

    const registry =
        CampusWord2007Simulateur
            .Registry;

    registry.registerDOM(
        "rootLayout",
        document.getElementById(
            "campusword2007simulateur"
        )
    );

    registry.registerDOM(
        "wordApp",
        document.getElementById(
            "word-app"
        )
    );
};









/* ==========================================================
   B5.2 — ROOT LAYOUT LOOKUP
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .getRootLayout =
function () {

    return CampusWord2007Simulateur
        .Registry
        .getDOM(
            "rootLayout"
        );
};








/* ==========================================================
   B5.3 — APPLICATION LAYOUT LOOKUP
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .getApplicationLayout =
function () {

    return CampusWord2007Simulateur
        .Registry
        .getDOM(
            "wordApp"
        );
};










/* ==========================================================
   B5.4 — ROOT LAYOUT VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .validateRootLayout =
function () {

    const root =
        this.getRootLayout();

    const app =
        this.getApplicationLayout();

    return (
        !!root &&
        !!app
    );
};







/* ==========================================================
   B5.5 — ROOT LAYOUT INITIALIZATION
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .initializeRootLayout =
function () {

    this.cacheRootLayout();

    if (
        !this.validateRootLayout()
    ) {

        throw new Error(
            "Root Layout Validation Failed"
        );
    }

    CampusWord2007Simulateur
        .Logger
        .info(
            "Root Layout Ready"
        );
};










/* ==========================================================
   B5.6 — APPLICATION READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(
        "application:ready",

        () => {

            CampusWord2007Simulateur
                .LayoutEngine
                .initialize();

            CampusWord2007Simulateur
                .LayoutEngine
                .initializeRootLayout();
        }
    );










/* ==========================================================
   B5.7 — LAYOUT ENGINE VALIDATION
   ========================================================== */

if (
    !CampusWord2007Simulateur
        .LayoutEngine
) {

    throw new Error(
        "Layout Engine Missing"
    );
}










/* ==========================================================
   B5.8 — WORKSPACE LAYOUT CACHE
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .cacheWorkspaceLayout =
function () {

    const registry =
        CampusWord2007Simulateur
            .Registry;

    registry.registerDOM(
        "workspaceLayout",
        document.getElementById(
            "workspace"
        )
    );
};










/* ==========================================================
   B5.9 — WORKSPACE LAYOUT LOOKUP
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .getWorkspaceLayout =
function () {

    return CampusWord2007Simulateur
        .Registry
        .getDOM(
            "workspaceLayout"
        );
};








/* ==========================================================
   B5.10 — WORKSPACE METRICS ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .getWorkspaceMetrics =
function () {

    const workspace =
        this.getWorkspaceLayout();

    if (
        !workspace
    ) {

        return null;
    }

    const rect =
        workspace
            .getBoundingClientRect();

    return {

        width:
            rect.width,

        height:
            rect.height,

        top:
            rect.top,

        left:
            rect.left,

        right:
            rect.right,

        bottom:
            rect.bottom
    };
};








/* ==========================================================
   B5.11 — WORKSPACE REFRESH ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .refreshWorkspaceLayout =
function () {

    const metrics =
        this.getWorkspaceMetrics();

    if (
        !metrics
    ) {

        return false;
    }

    this.workspaceMetrics =
        metrics;

    return true;
};








/* ==========================================================
   B5.12 — WORKSPACE VALIDATION ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .validateWorkspaceLayout =
function () {

    const workspace =
        this.getWorkspaceLayout();

    if (
        !workspace
    ) {

        CampusWord2007Simulateur
            .Logger
            .error(
                "Workspace Layout Missing"
            );

        return false;
    }

    const metrics =
        this.getWorkspaceMetrics();

    if (
        !metrics
    ) {

        CampusWord2007Simulateur
            .Logger
            .error(
                "Workspace Metrics Missing"
            );

        return false;
    }

    if (
        metrics.width <= 0
    ) {

        CampusWord2007Simulateur
            .Logger
            .error(
                "Invalid Workspace Width"
            );

        return false;
    }

    if (
        metrics.height <= 0
    ) {

        CampusWord2007Simulateur
            .Logger
            .error(
                "Invalid Workspace Height"
            );

        return false;
    }

    return true;
};











/* ==========================================================
   B5.13 — VIEWPORT LAYOUT ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .cacheViewportLayout =
function () {

    const registry =
        CampusWord2007Simulateur
            .Registry;

    registry.registerDOM(
        "viewportLayout",
        document.getElementById(
            "document-viewport"
        )
    );
};








/* ==========================================================
   B5.13.1 — VIEWPORT LAYOUT LOOKUP
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .getViewportLayout =
function () {

    return CampusWord2007Simulateur
        .Registry
        .getDOM(
            "viewportLayout"
        );
};







/* ==========================================================
   B5.13.2 — VIEWPORT LAYOUT INITIALIZATION
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .initializeViewportLayout =
function () {

    this.cacheViewportLayout();

    const viewport =
        this.getViewportLayout();

    if (
        !viewport
    ) {

        throw new Error(
            "Viewport Layout Missing"
        );
    }

    CampusWord2007Simulateur
        .Logger
        .info(
            "Viewport Layout Ready"
        );
};







/* ==========================================================
   B5.13.3 — VIEWPORT LAYOUT READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(
        "application:ready",

        () => {

            CampusWord2007Simulateur
                .LayoutEngine
                .initializeViewportLayout();
        }
    );










/* ==========================================================
   B5.14 — VIEWPORT METRICS ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .getViewportMetrics =
function () {

    const viewport =
        this.getViewportLayout();

    if (
        !viewport
    ) {

        return null;
    }

    const rect =
        viewport
            .getBoundingClientRect();

    return {

        width:
            rect.width,

        height:
            rect.height,

        top:
            rect.top,

        left:
            rect.left,

        right:
            rect.right,

        bottom:
            rect.bottom
    };
};








/* ==========================================================
   B5.14.1 — VIEWPORT METRICS REFRESH
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .refreshViewportMetrics =
function () {

    const metrics =
        this.getViewportMetrics();

    if (
        !metrics
    ) {

        return false;
    }

    this.viewportMetrics =
        metrics;

    return true;
};









/* ==========================================================
   B5.14.2 — VIEWPORT METRICS LOOKUP
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .getCachedViewportMetrics =
function () {

    return (
        this.viewportMetrics ||
        null
    );
};








/* ==========================================================
   B5.14.3 — VIEWPORT METRICS VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .validateViewportMetrics =
function () {

    const metrics =
        this.getViewportMetrics();

    if (
        !metrics
    ) {

        return false;
    }

    if (
        metrics.width <= 0
    ) {

        return false;
    }

    if (
        metrics.height <= 0
    ) {

        return false;
    }

    return true;
};








/* ==========================================================
   B5.14.4 — VIEWPORT METRICS INITIALIZATION
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .initializeViewportMetrics =
function () {

    this.refreshViewportMetrics();

    if (
        !this.validateViewportMetrics()
    ) {

        throw new Error(
            "Viewport Metrics Validation Failed"
        );
    }

    CampusWord2007Simulateur
        .Logger
        .info(
            "Viewport Metrics Ready"
        );
};







/* ==========================================================
   B5.15 — RESPONSIVE LAYOUT ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .initializeResponsiveLayout =
function () {

    this.attachResizeListener();

    this.attachOrientationListener();

    this.refreshResponsiveLayout();

    CampusWord2007Simulateur
        .Logger
        .info(
            "Responsive Layout Ready"
        );
};









/* ==========================================================
   B5.15.1 — WINDOW RESIZE LISTENER
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .attachResizeListener =
function () {

    window.addEventListener(

        "resize",

        () => {

            this.refreshResponsiveLayout();
        }
    );
};








/* ==========================================================
   B5.15.2 — ORIENTATION LISTENER
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .attachOrientationListener =
function () {

    window.addEventListener(

        "orientationchange",

        () => {

            this.refreshResponsiveLayout();
        }
    );
};









/* ==========================================================
   B5.15.3 — RESPONSIVE REFRESH
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .refreshResponsiveLayout =
function () {

    this.refreshWorkspaceLayout();

    this.refreshViewportMetrics();

    CampusWord2007Simulateur
        .EventBus
        .emit(
            "layout:updated",
            {
                workspace:
                    this.workspaceMetrics,

                viewport:
                    this.viewportMetrics
            }
        );
};








/* ==========================================================
   B5.15.4 — VIEWPORT SIZE CATEGORY
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .getViewportCategory =
function () {

    const metrics =
        this.getViewportMetrics();

    if (
        !metrics
    ) {

        return "unknown";
    }

    if (
        metrics.width < 768
    ) {

        return "mobile";
    }

    if (
        metrics.width < 1024
    ) {

        return "tablet";
    }

    return "desktop";
};







/* ==========================================================
   B5.15.5 — ORIENTATION LOOKUP
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .getOrientation =
function () {

    const metrics =
        this.getViewportMetrics();

    if (
        !metrics
    ) {

        return "unknown";
    }

    if (
        metrics.width >
        metrics.height
    ) {

        return "landscape";
    }

    return "portrait";
};







/* ==========================================================
   B5.15.6 — RESPONSIVE STATE UPDATE
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .updateResponsiveState =
function () {

    this.viewportCategory =
        this.getViewportCategory();

    this.orientation =
        this.getOrientation();
};







/* ==========================================================
   B5.15.7 — RESPONSIVE VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .validateResponsiveLayout =
function () {

    return (

        this.validateWorkspaceLayout() &&

        this.validateViewportMetrics()
    );
};







/* ==========================================================
   B5.15.8 — RESPONSIVE INITIALIZATION
   ========================================================== */

CampusWord2007Simulateur
    .LayoutEngine
    .initializeResponsiveSystem =
function () {

    this.updateResponsiveState();

    this.initializeResponsiveLayout();

    if (
        !this.validateResponsiveLayout()
    ) {

        throw new Error(
            "Responsive Layout Validation Failed"
        );
    }
};







/* ==========================================================
   B5.15.9 — RESPONSIVE READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(
        "application:ready",

        () => {

            CampusWord2007Simulateur
                .LayoutEngine
                .initializeResponsiveSystem();
        }
    );











/* ==========================================================
   B5.15.10 — RESPONSIVE ENGINE VALIDATION
   ========================================================== */

if (

    !CampusWord2007Simulateur
        .LayoutEngine
        .initializeResponsiveSystem

) {

    throw new Error(
        "Responsive Layout Engine Missing"
    );
}






/* ==========================================================
   B6 — FOCUS ENGINE
   CENTRAL APPLICATION FOCUS SYSTEM
   ========================================================== */

CampusWord2007Simulateur.FocusEngine = {

    initialized: false,

    activeElement: null,

    focusedArea: null,

    lastFocusedArea: null,

    windowFocused: true,

    initialize() {

        if (
            this.initialized
        ) {

            return;
        }

        this.initialized = true;

        CampusWord2007Simulateur
            .Logger
            .info(
                "Focus Engine Initialized"
            );
    }
};







/* ==========================================================
   B6.1 — FOCUS STATE INITIALIZATION
   ========================================================== */

CampusWord2007Simulateur.FocusEngine = {

    initialized: false,

    initialize() {

        if (
            this.initialized
        ) {

            return;
        }

        this.initializeFocusState();

        this.initialized = true;

        CampusWord2007Simulateur
            .Logger
            .info(
                "Focus Engine Initialized"
            );
    }
};





/* ==========================================================
   B6.1.1 — INITIALIZE FOCUS STATE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .initializeFocusState =
function () {

    const focusState =
        CampusWord2007Simulateur
            .state
            .focus;

    if (
        !focusState
    ) {

        throw new Error(
            "Focus State Missing"
        );
    }

    if (
        typeof focusState
            .activeElement ===
        "undefined"
    ) {

        focusState.activeElement =
            null;
    }

    if (
        typeof focusState
            .focusedArea ===
        "undefined"
    ) {

        focusState.focusedArea =
            null;
    }

    if (
        typeof focusState
            .lastFocusedArea ===
        "undefined"
    ) {

        focusState.lastFocusedArea =
            null;
    }
};





/* ==========================================================
   B6.1.2 — GET FOCUS STATE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .getFocusState =
function () {

    return CampusWord2007Simulateur
        .state
        .focus;
};






/* ==========================================================
   B6.1.3 — RESET FOCUS STATE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .resetFocusState =
function () {

    const focusState =
        this.getFocusState();

    focusState.activeElement =
        null;

    focusState.focusedArea =
        null;

    focusState.lastFocusedArea =
        null;
};







/* ==========================================================
   B6.1.4 — FOCUS STATE VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateFocusState =
function () {

    const focusState =
        this.getFocusState();

    if (
        !focusState
    ) {

        return false;
    }

    return true;
};






/* ==========================================================
   B6.1.5 — FOCUS ENGINE READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(
        "application:ready",

        () => {

            CampusWord2007Simulateur
                .FocusEngine
                .initialize();
        }
    );






/* ==========================================================
   B6.1.6 — FOCUS ENGINE VALIDATION
   ========================================================== */

if (
    !CampusWord2007Simulateur
        .FocusEngine
) {

    throw new Error(
        "Focus Engine Missing"
    );
}









/* ==========================================================
   B6.2 — ACTIVE ELEMENT TRACKING
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .activeElementTracked =
false;




/* ==========================================================
   B6.2.1 — GET ACTIVE ELEMENT
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .getActiveElement =
function () {

    return CampusWord2007Simulateur
        .state
        .focus
        .activeElement;
};





/* ==========================================================
   B6.2.2 — SET ACTIVE ELEMENT
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .setActiveElement =
function (
    element
) {

    CampusWord2007Simulateur
        .state
        .focus
        .activeElement =
            element || null;

    return true;
};





/* ==========================================================
   B6.2.3 — CLEAR ACTIVE ELEMENT
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .clearActiveElement =
function () {

    CampusWord2007Simulateur
        .state
        .focus
        .activeElement =
            null;
};







/* ==========================================================
   B6.2.4 — HAS ACTIVE ELEMENT
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .hasActiveElement =
function () {

    return (

        this.getActiveElement() !==
        null

    );
};





/* ==========================================================
   B6.2.5 — ACTIVE ELEMENT EXISTS
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .activeElementExists =
function () {

    const element =
        this.getActiveElement();

    if (
        !element
    ) {

        return false;
    }

    return document.body.contains(
        element
    );
};






/* ==========================================================
   B6.2.6 — GET ACTIVE ELEMENT ID
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .getActiveElementId =
function () {

    const element =
        this.getActiveElement();

    if (
        !element
    ) {

        return null;
    }

    return (
        element.id ||
        null
    );
};








/* ==========================================================
   B6.2.7 — GET ACTIVE ELEMENT TAG
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .getActiveElementTag =
function () {

    const element =
        this.getActiveElement();

    if (
        !element
    ) {

        return null;
    }

    return (
        element.tagName ||
        null
    );
};






/* ==========================================================
   B6.2.8 — ACTIVE ELEMENT VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateActiveElement =
function () {

    const element =
        this.getActiveElement();

    if (
        element === null
    ) {

        return true;
    }

    return (
        element instanceof
        Element
    );
};






/* ==========================================================
   B6.2.9 — TRACKING INITIALIZATION
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .initializeActiveElementTracking =
function () {

    if (
        this.activeElementTracked
    ) {

        return;
    }

    this.activeElementTracked =
        true;

    CampusWord2007Simulateur
        .Logger
        .info(
            "Active Element Tracking Ready"
        );
};





/* ==========================================================
   B6.2.10 — ACTIVE ELEMENT TRACKING VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateActiveElementTracking =
function () {

    return (

        this.validateFocusState() &&

        this.validateActiveElement()

    );
};





/* ==========================================================
   B6.2.11 — ACTIVE ELEMENT TRACKING READY
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(
        "application:ready",

        () => {

            CampusWord2007Simulateur
                .FocusEngine
                .initializeActiveElementTracking();
        }
    );




/* ==========================================================
   B6.3 — FOCUS AREA TRACKING
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .focusAreaTrackingReady =
false;





/* ==========================================================
   B6.3.1 — GET FOCUSED AREA
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .getFocusedArea =
function () {

    return CampusWord2007Simulateur
        .state
        .focus
        .focusedArea;
};





/* ==========================================================
   B6.3.2 — GET LAST FOCUSED AREA
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .getLastFocusedArea =
function () {

    return CampusWord2007Simulateur
        .state
        .focus
        .lastFocusedArea;
};




/* ==========================================================
   B6.3.3 — SET FOCUSED AREA
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .setFocusedArea =
function (
    area
) {

    const focusState =
        CampusWord2007Simulateur
            .state
            .focus;

    if (
        focusState.focusedArea !==
        area
    ) {

        focusState.lastFocusedArea =
            focusState.focusedArea;
    }

    focusState.focusedArea =
        area || null;

    return true;
};






/* ==========================================================
   B6.3.4 — CLEAR FOCUSED AREA
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .clearFocusedArea =
function () {

    const focusState =
        CampusWord2007Simulateur
            .state
            .focus;

    focusState.lastFocusedArea =
        focusState.focusedArea;

    focusState.focusedArea =
        null;
};







/* ==========================================================
   B6.3.5 — RESTORE LAST AREA
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .restoreLastArea =
function () {

    const focusState =
        CampusWord2007Simulateur
            .state
            .focus;

    if (
        !focusState.lastFocusedArea
    ) {

        return false;
    }

    focusState.focusedArea =
        focusState.lastFocusedArea;

    return true;
};





/* ==========================================================
   B6.3.6 — HAS FOCUSED AREA
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .hasFocusedArea =
function () {

    return (

        this.getFocusedArea() !==
        null

    );
};






/* ==========================================================
   B6.3.7 — HAS LAST FOCUSED AREA
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .hasLastFocusedArea =
function () {

    return (

        this.getLastFocusedArea() !==
        null

    );
};








/* ==========================================================
   B6.3.8 — AREA MATCH CHECK
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .isFocusedArea =
function (
    area
) {

    return (

        this.getFocusedArea() ===
        area

    );
};






/* ==========================================================
   B6.3.9 — FOCUS AREA VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateFocusedArea =
function () {

    const area =
        this.getFocusedArea();

    if (
        area === null
    ) {

        return true;
    }

    return (
        typeof area ===
        "string"
    );
};





/* ==========================================================
   B6.3.10 — LAST AREA VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateLastFocusedArea =
function () {

    const area =
        this.getLastFocusedArea();

    if (
        area === null
    ) {

        return true;
    }

    return (
        typeof area ===
        "string"
    );
};






/* ==========================================================
   B6.3.11 — INITIALIZE AREA TRACKING
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .initializeFocusAreaTracking =
function () {

    if (
        this.focusAreaTrackingReady
    ) {

        return;
    }

    this.focusAreaTrackingReady =
        true;

    CampusWord2007Simulateur
        .Logger
        .info(
            "Focus Area Tracking Ready"
        );
};




/* ==========================================================
   B6.3.12 — TRACKING VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateFocusAreaTracking =
function () {

    return (

        this.validateFocusedArea() &&

        this.validateLastFocusedArea()

    );
};






/* ==========================================================
   B6.3.13 — TRACKING READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(
        "application:ready",

        () => {

            CampusWord2007Simulateur
                .FocusEngine
                .initializeFocusAreaTracking();
        }
    );





/* ==========================================================
   B6.4 — FOCUS SET ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .focusSetReady =
false;





/* ==========================================================
   B6.4.1 — SET FOCUS
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .setFocus =
function (
    element,
    area
) {

    this.setActiveElement(
        element || null
    );

    this.setFocusedArea(
        area || null
    );

    return true;
};







/* ==========================================================
   B6.5 — FOCUS CLEAR ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .focusClearReady =
false;





/* ==========================================================
   B6.5.1 — CLEAR FOCUS
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .clearFocus =
function () {

    this.clearActiveElement();

    this.clearFocusedArea();

    return true;
};





/* ==========================================================
   B6.6 — FOCUS RESTORE ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .focusRestoreReady =
false;





/* ==========================================================
   B6.6.1 — RESTORE ACTIVE ELEMENT
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .restoreActiveElement =
function () {

    const element =
        this.getActiveElement();

    if (
        !element
    ) {

        return false;
    }

    if (
        !document.body.contains(
            element
        )
    ) {

        return false;
    }

    if (
        typeof element.focus ===
        "function"
    ) {

        element.focus();
    }

    return true;
};
 




/* ==========================================================
   B6.6.2 — RESTORE FOCUSED AREA
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .restoreFocusedArea =
function () {

    return this.restoreLastArea();
};





/* ==========================================================
   B6.6.3 — RESTORE COMPLETE FOCUS
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .restoreFocus =
function () {

    const areaRestored =
        this.restoreFocusedArea();

    const elementRestored =
        this.restoreActiveElement();

    return (
        areaRestored ||
        elementRestored
    );
};





/* ==========================================================
   B6.6.4 — CAN RESTORE FOCUS
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .canRestoreFocus =
function () {

    return (

        this.hasLastFocusedArea() ||

        this.hasActiveElement()

    );
};





/* ==========================================================
   B6.6.5 — INITIALIZE RESTORE ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .initializeFocusRestoreEngine =
function () {

    if (
        this.focusRestoreReady
    ) {

        return;
    }

    this.focusRestoreReady =
        true;

    CampusWord2007Simulateur
        .Logger
        .info(
            "Focus Restore Engine Ready"
        );
};





/* ==========================================================
   B6.6.6 — RESTORE ENGINE VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateFocusRestoreEngine =
function () {

    return (

        typeof this.restoreFocus ===
        "function" &&

        typeof this.restoreActiveElement ===
        "function" &&

        typeof this.restoreFocusedArea ===
        "function"

    );
};





/* ==========================================================
   B6.6.7 — RESTORE READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(
        "application:ready",

        () => {

            CampusWord2007Simulateur
                .FocusEngine
                .initializeFocusRestoreEngine();
        }
    );








/* ==========================================================
   B6.7 — FOCUS VALIDATION ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .focusValidationReady =
false;





/* ==========================================================
   B6.7.1 — VALIDATE ACTIVE ELEMENT STATE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateActiveElementState =
function () {

    return this
        .validateActiveElement();
};





/* ==========================================================
   B6.7.2 — VALIDATE FOCUSED AREA STATE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateFocusedAreaState =
function () {

    return (

        this.validateFocusedArea() &&

        this.validateLastFocusedArea()

    );
};





/* ==========================================================
   B6.7.3 — VALIDATE RESTORE STATE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateRestoreState =
function () {

    return (

        typeof this.restoreFocus ===
        "function" &&

        typeof this.restoreActiveElement ===
        "function" &&

        typeof this.restoreFocusedArea ===
        "function"

    );
};





/* ==========================================================
   B6.7.4 — VALIDATE FOCUS ENGINE STATE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateFocusEngineState =
function () {

    return (

        this.validateFocusState() &&

        this.validateActiveElementState() &&

        this.validateFocusedAreaState()

    );
};





/* ==========================================================
   B6.7.5 — VALIDATE FOCUS OPERATIONS
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateFocusOperations =
function () {

    return (

        typeof this.setFocus ===
        "function" &&

        typeof this.clearFocus ===
        "function" &&

        typeof this.restoreFocus ===
        "function"

    );
};





/* ==========================================================
   B6.7.6 — COMPLETE FOCUS VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateFocusEngine =
function () {

    return (

        this.validateFocusEngineState() &&

        this.validateFocusOperations() &&

        this.validateRestoreState()

    );
};





/* ==========================================================
   B6.7.7 — INITIALIZE VALIDATION ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .initializeFocusValidationEngine =
function () {

    if (
        this.focusValidationReady
    ) {

        return;
    }

    this.focusValidationReady =
        true;

    CampusWord2007Simulateur
        .Logger
        .info(
            "Focus Validation Engine Ready"
        );
};





/* ==========================================================
   B6.7.8 — VALIDATION READY CHECK
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .isFocusValidationReady =
function () {

    return (
        this.focusValidationReady ===
        true
    );
};





/* ==========================================================
   B6.7.9 — VALIDATION READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(
        "application:ready",

        () => {

            CampusWord2007Simulateur
                .FocusEngine
                .initializeFocusValidationEngine();
        }
    );





/* ==========================================================
   B6.8 — FOCUS EVENT ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .focusEventEngineReady =
false;





/* ==========================================================
   B6.8.1 — HANDLE ELEMENT FOCUS
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .handleFocusEvent =
function (
    element,
    area
) {

    this.setFocus(
        element,
        area
    );
};






/* ==========================================================
   B6.8.2 — HANDLE ELEMENT BLUR
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .handleBlurEvent =
function () {

    this.clearFocus();
};






/* ==========================================================
   B6.8.3 — REGISTER FOCUS LISTENER
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .registerFocusListener =
function (
    element,
    area
) {

    if (
        !(element instanceof Element)
    ) {

        return false;
    }

    element.addEventListener(
        "focus",

        () => {

            this.handleFocusEvent(
                element,
                area
            );
        }
    );

    return true;
};






/* ==========================================================
   B6.8.4 — REGISTER BLUR LISTENER
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .registerBlurListener =
function (
    element
) {

    if (
        !(element instanceof Element)
    ) {

        return false;
    }

    element.addEventListener(
        "blur",

        () => {

            this.handleBlurEvent();
        }
    );

    return true;
};






/* ==========================================================
   B6.8.5 — REGISTER FOCUS EVENTS
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .registerFocusEvents =
function (
    element,
    area
) {

    this.registerFocusListener(
        element,
        area
    );

    this.registerBlurListener(
        element
    );

    return true;
};






/* ==========================================================
   B6.8.6 — EMIT FOCUS CHANGED EVENT
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .emitFocusChanged =
function () {

    CampusWord2007Simulateur
        .EventBus
        .emit(
            "focus:changed",

            {
                activeElement:
                    this.getActiveElement(),

                focusedArea:
                    this.getFocusedArea()
            }
        );
};






/* ==========================================================
   B6.8.7 — EMIT FOCUS CLEARED EVENT
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .emitFocusCleared =
function () {

    CampusWord2007Simulateur
        .EventBus
        .emit(
            "focus:cleared"
        );
};






/* ==========================================================
   B6.8.8 — INITIALIZE EVENT ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .initializeFocusEventEngine =
function () {

    if (
        this.focusEventEngineReady
    ) {

        return;
    }

    this.focusEventEngineReady =
        true;

    CampusWord2007Simulateur
        .Logger
        .info(
            "Focus Event Engine Ready"
        );
};






/* ==========================================================
   B6.8.9 — EVENT ENGINE VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateFocusEventEngine =
function () {

    return (

        this.focusEventEngineReady ===
        true

    );
};






/* ==========================================================
   B6.8.10 — EVENT ENGINE READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(

        "application:ready",

        () => {

            CampusWord2007Simulateur
                .FocusEngine
                .initializeFocusEventEngine();
        }
    );









/* ==========================================================
   B6.9 — WINDOW FOCUS ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .windowFocusReady =
false;





/* ==========================================================
   B6.9.1 — HANDLE WINDOW FOCUS
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .handleWindowFocus =
function () {

    this.windowFocused =
        true;

    CampusWord2007Simulateur
        .EventBus
        .emit(
            "window:focus"
        );
};





/* ==========================================================
   B6.9.2 — IS WINDOW FOCUSED
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .isWindowFocused =
function () {

    return (
        this.windowFocused ===
        true
    );
};





/* ==========================================================
   B6.9.3 — REGISTER WINDOW FOCUS
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .registerWindowFocus =
function () {

    window.addEventListener(

        "focus",

        () => {

            this.handleWindowFocus();
        }
    );
};





/* ==========================================================
   B6.9.4 — INITIALIZE WINDOW FOCUS ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .initializeWindowFocusEngine =
function () {

    if (
        this.windowFocusReady
    ) {

        return;
    }

    this.registerWindowFocus();

    this.windowFocusReady =
        true;

    CampusWord2007Simulateur
        .Logger
        .info(
            "Window Focus Engine Ready"
        );
};





/* ==========================================================
   B6.9.5 — WINDOW FOCUS VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateWindowFocusEngine =
function () {

    return (

        this.windowFocusReady ===
        true &&

        typeof
        this.handleWindowFocus ===
        "function"

    );
};





/* ==========================================================
   B6.9.6 — WINDOW FOCUS READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(

        "application:ready",

        () => {

            CampusWord2007Simulateur
                .FocusEngine
                .initializeWindowFocusEngine();
        }
    );





/* ==========================================================
   B6.10 — WINDOW BLUR ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .windowBlurReady =
false;





/* ==========================================================
   B6.10.1 — HANDLE WINDOW BLUR
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .handleWindowBlur =
function () {

    this.windowFocused =
        false;

    CampusWord2007Simulateur
        .EventBus
        .emit(
            "window:blur"
        );
};





/* ==========================================================
   B6.10.2 — IS WINDOW BLURRED
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .isWindowBlurred =
function () {

    return (
        this.windowFocused ===
        false
    );
};





/* ==========================================================
   B6.10.3 — REGISTER WINDOW BLUR
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .registerWindowBlur =
function () {

    window.addEventListener(

        "blur",

        () => {

            this.handleWindowBlur();
        }
    );
};





/* ==========================================================
   B6.10.4 — INITIALIZE WINDOW BLUR ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .initializeWindowBlurEngine =
function () {

    if (
        this.windowBlurReady
    ) {

        return;
    }

    this.registerWindowBlur();

    this.windowBlurReady =
        true;

    CampusWord2007Simulateur
        .Logger
        .info(
            "Window Blur Engine Ready"
        );
};





/* ==========================================================
   B6.10.5 — WINDOW BLUR VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateWindowBlurEngine =
function () {

    return (

        this.windowBlurReady ===
        true &&

        typeof
        this.handleWindowBlur ===
        "function"

    );
};





/* ==========================================================
   B6.10.6 — WINDOW BLUR READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(

        "application:ready",

        () => {

            CampusWord2007Simulateur
                .FocusEngine
                .initializeWindowBlurEngine();
        }
    );








/* ==========================================================
   B6.11 — FOCUS SYNCHRONIZATION ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .focusSynchronizationReady =
false;





/* ==========================================================
   B6.11.1 — SYNCHRONIZE ACTIVE ELEMENT
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .synchronizeActiveElement =
function () {

    const domActiveElement =
        document.activeElement;

    if (
        !domActiveElement
    ) {

        return false;
    }

    this.setActiveElement(
        domActiveElement
    );

    return true;
};





/* ==========================================================
   B6.11.2 — SYNCHRONIZE WINDOW STATE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .synchronizeWindowState =
function () {

    this.windowFocused =
        document.hasFocus();

    return true;
};





/* ==========================================================
   B6.11.3 — SYNCHRONIZE FOCUS STATE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .synchronizeFocusState =
function () {

    this.synchronizeActiveElement();

    this.synchronizeWindowState();

    return true;
};





/* ==========================================================
   B6.11.4 — AUTO SYNCHRONIZE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .autoSynchronizeFocus =
function () {

    this.synchronizeFocusState();
};





/* ==========================================================
   B6.11.5 — START SYNCHRONIZATION
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .startFocusSynchronization =
function () {

    if (
        this.focusSynchronizationInterval
    ) {

        return;
    }

    this.focusSynchronizationInterval =
        setInterval(

            () => {

                this.autoSynchronizeFocus();

            },

            250
        );
};





/* ==========================================================
   B6.11.6 — STOP SYNCHRONIZATION
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .stopFocusSynchronization =
function () {

    if (
        !this.focusSynchronizationInterval
    ) {

        return;
    }

    clearInterval(
        this.focusSynchronizationInterval
    );

    this.focusSynchronizationInterval =
        null;
};





/* ==========================================================
   B6.11.7 — INITIALIZE SYNCHRONIZATION ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .initializeFocusSynchronizationEngine =
function () {

    if (
        this.focusSynchronizationReady
    ) {

        return;
    }

    this.startFocusSynchronization();

    this.focusSynchronizationReady =
        true;

    CampusWord2007Simulateur
        .Logger
        .info(
            "Focus Synchronization Engine Ready"
        );
};





/* ==========================================================
   B6.11.8 — SYNCHRONIZATION VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateFocusSynchronizationEngine =
function () {

    return (

        this.focusSynchronizationReady ===
        true &&

        typeof
        this.synchronizeFocusState ===
        "function"

    );
};





/* ==========================================================
   B6.11.9 — SYNCHRONIZATION READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(

        "application:ready",

        () => {

            CampusWord2007Simulateur
                .FocusEngine
                .initializeFocusSynchronizationEngine();
        }
    );






/* ==========================================================
   B6.12 — FOCUS READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .focusReady =
false;





/* ==========================================================
   B6.12.1 — CHECK FOCUS READINESS
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .checkFocusReadiness =
function () {

    return (

        this.activeElementTracked ===
        true &&

        this.focusAreaTrackingReady ===
        true &&

        this.windowFocusReady ===
        true &&

        this.windowBlurReady ===
        true &&

        this.focusSynchronizationReady ===
        true

    );
};





/* ==========================================================
   B6.12.2 — SET FOCUS READY
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .setFocusReady =
function () {

    if (
        !this.checkFocusReadiness()
    ) {

        return false;
    }

    this.focusReady =
        true;

    return true;
};





/* ==========================================================
   B6.12.3 — IS FOCUS READY
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .isFocusReady =
function () {

    return (
        this.focusReady ===
        true
    );
};





/* ==========================================================
   B6.12.4 — INITIALIZE READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .initializeFocusReadyHook =
function () {

    this.setFocusReady();

    if (
        this.focusReady
    ) {

        CampusWord2007Simulateur
            .Logger
            .info(
                "Focus Engine Ready"
            );
    }
};





/* ==========================================================
   B6.12.5 — READY HOOK VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateFocusReadyHook =
function () {

    return (

        typeof
        this.isFocusReady ===
        "function" &&

        typeof
        this.checkFocusReadiness ===
        "function"

    );
};





/* ==========================================================
   B6.12.6 — READY HOOK EVENT
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(

        "application:ready",

        () => {

            CampusWord2007Simulateur
                .FocusEngine
                .initializeFocusReadyHook();
        }
    );







/* ==========================================================
   B6.13 — FOCUS VALIDATION BLOCK
   FINAL FOCUS ENGINE VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .focusValidationBlockReady =
false;





/* ==========================================================
   B6.13.1 — VALIDATE CORE FOCUS STATE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateCoreFocusState =
function () {

    return (
        this.validateFocusState()
    );
};





/* ==========================================================
   B6.13.2 — VALIDATE ACTIVE ELEMENT TRACKING
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateActiveElementTrackingBlock =
function () {

    return (
        this.validateActiveElementTracking()
    );
};





/* ==========================================================
   B6.13.3 — VALIDATE FOCUS AREA TRACKING
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateFocusAreaTrackingBlock =
function () {

    return (
        this.validateFocusAreaTracking()
    );
};





/* ==========================================================
   B6.13.4 — VALIDATE RESTORE ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateRestoreEngineBlock =
function () {

    return (
        this.validateFocusRestoreEngine()
    );
};





/* ==========================================================
   B6.13.5 — VALIDATE FOCUS ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateFocusEngineBlock =
function () {

    return (
        this.validateFocusEngine()
    );
};





/* ==========================================================
   B6.13.6 — VALIDATE EVENT ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateEventEngineBlock =
function () {

    return (
        this.validateFocusEventEngine()
    );
};





/* ==========================================================
   B6.13.7 — VALIDATE WINDOW FOCUS ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateWindowFocusEngineBlock =
function () {

    return (
        this.validateWindowFocusEngine()
    );
};





/* ==========================================================
   B6.13.8 — VALIDATE WINDOW BLUR ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateWindowBlurEngineBlock =
function () {

    return (
        this.validateWindowBlurEngine()
    );
};





/* ==========================================================
   B6.13.9 — VALIDATE SYNCHRONIZATION ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateSynchronizationEngineBlock =
function () {

    return (
        this.validateFocusSynchronizationEngine()
    );
};





/* ==========================================================
   B6.13.10 — VALIDATE READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateReadyHookBlock =
function () {

    return (
        this.validateFocusReadyHook()
    );
};





/* ==========================================================
   B6.13.11 — COMPLETE FOCUS VALIDATION BLOCK
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .validateCompleteFocusBlock =
function () {

    return (

        this.validateCoreFocusState() &&

        this.validateActiveElementTrackingBlock() &&

        this.validateFocusAreaTrackingBlock() &&

        this.validateRestoreEngineBlock() &&

        this.validateFocusEngineBlock() &&

        this.validateEventEngineBlock() &&

        this.validateWindowFocusEngineBlock() &&

        this.validateWindowBlurEngineBlock() &&

        this.validateSynchronizationEngineBlock() &&

        this.validateReadyHookBlock()

    );
};





/* ==========================================================
   B6.13.12 — INITIALIZE VALIDATION BLOCK
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .initializeFocusValidationBlock =
function () {

    if (
        this.focusValidationBlockReady
    ) {

        return;
    }

    this.focusValidationBlockReady =
        true;

    CampusWord2007Simulateur
        .Logger
        .info(
            "Focus Validation Block Ready"
        );
};





/* ==========================================================
   B6.13.13 — VALIDATION BLOCK STATUS
   ========================================================== */

CampusWord2007Simulateur
    .FocusEngine
    .isFocusValidationBlockReady =
function () {

    return (
        this.focusValidationBlockReady ===
        true
    );
};





/* ==========================================================
   B6.13.14 — VALIDATION BLOCK READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(

        "application:ready",

        () => {

            CampusWord2007Simulateur
                .FocusEngine
                .initializeFocusValidationBlock();
        }
    );





/* ==========================================================
   B6.13.15 — FINAL FOCUS ENGINE VALIDATION
   ========================================================== */

if (

    !CampusWord2007Simulateur
        .FocusEngine

) {

    throw new Error(
        "Focus Engine Missing"
    );
}







/* ==========================================================
   B7 — APPLICATION LIFECYCLE ENGINE
   CENTRAL APPLICATION LIFECYCLE SYSTEM
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine = {

    initialized: false,

    startupReady: false,

    readyStateReady: false,

    suspendReady: false,

    destroyReady: false,

    lifecycleReady: false,

    validationReady: false,

    initialize() {

        if (
            this.initialized
        ) {

            return;
        }

        this.initialized =
            true;

        CampusWord2007Simulateur
            .Logger
            .info(
                "Application Lifecycle Engine Initialized"
            );
    }
};





/* ==========================================================
   B7.0.1 — GET LIFECYCLE STATE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .getLifecycleState =
function () {

    return CampusWord2007Simulateur
        .state
        .application;
};





/* ==========================================================
   B7.0.2 — LIFECYCLE ENGINE EXISTS
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .exists =
function () {

    return (

        CampusWord2007Simulateur
            .ApplicationLifecycleEngine

        !==

        undefined

    );
};





/* ==========================================================
   B7.0.3 — LIFECYCLE ENGINE VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateLifecycleEngine =
function () {

    return (

        this.exists() &&

        typeof
        this.getLifecycleState ===
        "function"

    );
};





/* ==========================================================
   B7.0.4 — APPLICATION READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(

        "application:ready",

        () => {

            CampusWord2007Simulateur
                .ApplicationLifecycleEngine
                .initialize();
        }
    );





/* ==========================================================
   B7.0.5 — FINAL ENGINE VALIDATION
   ========================================================== */

if (

    !CampusWord2007Simulateur
        .ApplicationLifecycleEngine

) {

    throw new Error(
        "Application Lifecycle Engine Missing"
    );
}







/* ==========================================================
   B7.1 — LIFECYCLE STATE INITIALIZATION
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .lifecycleStateReady =
false;





/* ==========================================================
   B7.1.1 — INITIALIZE LIFECYCLE STATE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .initializeLifecycleState =
function () {

    const applicationState =
        CampusWord2007Simulateur
            .state
            .application;

    if (
        !applicationState
    ) {

        throw new Error(
            "Application State Missing"
        );
    }

    if (
        typeof applicationState
            .initialized ===
        "undefined"
    ) {

        applicationState.initialized =
            false;
    }

    if (
        typeof applicationState
            .booting ===
        "undefined"
    ) {

        applicationState.booting =
            false;
    }

    if (
        typeof applicationState
            .ready ===
        "undefined"
    ) {

        applicationState.ready =
            false;
    }

    if (
        typeof applicationState
            .destroyed ===
        "undefined"
    ) {

        applicationState.destroyed =
            false;
    }
};





/* ==========================================================
   B7.1.2 — GET APPLICATION STATE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .getApplicationState =
function () {

    return CampusWord2007Simulateur
        .state
        .application;
};





/* ==========================================================
   B7.1.3 — RESET APPLICATION STATE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .resetApplicationState =
function () {

    const state =
        this.getApplicationState();

    state.initialized =
        false;

    state.booting =
        false;

    state.ready =
        false;

    state.destroyed =
        false;
};





/* ==========================================================
   B7.1.4 — APPLICATION STATE VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateApplicationState =
function () {

    const state =
        this.getApplicationState();

    if (
        !state
    ) {

        return false;
    }

    return (

        typeof state.initialized ===
        "boolean" &&

        typeof state.booting ===
        "boolean" &&

        typeof state.ready ===
        "boolean" &&

        typeof state.destroyed ===
        "boolean"

    );
};





/* ==========================================================
   B7.1.5 — INITIALIZE LIFECYCLE STATE ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .initializeLifecycleStateEngine =
function () {

    if (
        this.lifecycleStateReady
    ) {

        return;
    }

    this.initializeLifecycleState();

    this.lifecycleStateReady =
        true;

    CampusWord2007Simulateur
        .Logger
        .info(
            "Lifecycle State Ready"
        );
};





/* ==========================================================
   B7.1.6 — LIFECYCLE STATE READY CHECK
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .isLifecycleStateReady =
function () {

    return (
        this.lifecycleStateReady ===
        true
    );
};





/* ==========================================================
   B7.1.7 — LIFECYCLE STATE READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(

        "application:ready",

        () => {

            CampusWord2007Simulateur
                .ApplicationLifecycleEngine
                .initializeLifecycleStateEngine();
        }
    );





/* ==========================================================
   B7.1.8 — LIFECYCLE STATE VALIDATION BLOCK
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateLifecycleStateEngine =
function () {

    return (

        this.lifecycleStateReady ===
        true &&

        this.validateApplicationState()

    );
};






/* ==========================================================
   B7.2 — STARTUP LIFECYCLE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .startupLifecycleReady =
false;





/* ==========================================================
   B7.2.1 — START APPLICATION BOOT
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .startBoot =
function () {

    const state =
        this.getApplicationState();

    state.booting =
        true;

    CampusWord2007Simulateur
        .EventBus
        .emit(
            "application:boot:start"
        );

    return true;
};





/* ==========================================================
   B7.2.2 — FINISH APPLICATION BOOT
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .finishBoot =
function () {

    const state =
        this.getApplicationState();

    state.booting =
        false;

    state.initialized =
        true;

    CampusWord2007Simulateur
        .EventBus
        .emit(
            "application:boot:finish"
        );

    return true;
};





/* ==========================================================
   B7.2.3 — IS BOOTING
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .isBooting =
function () {

    return (
        this.getApplicationState()
            .booting === true
    );
};





/* ==========================================================
   B7.2.4 — IS INITIALIZED
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .isInitialized =
function () {

    return (
        this.getApplicationState()
            .initialized === true
    );
};





/* ==========================================================
   B7.2.5 — STARTUP LIFECYCLE VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateStartupLifecycle =
function () {

    return (

        typeof
        this.startBoot ===
        "function" &&

        typeof
        this.finishBoot ===
        "function"

    );
};





/* ==========================================================
   B7.2.6 — INITIALIZE STARTUP LIFECYCLE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .initializeStartupLifecycle =
function () {

    if (
        this.startupLifecycleReady
    ) {

        return;
    }

    this.startupLifecycleReady =
        true;

    CampusWord2007Simulateur
        .Logger
        .info(
            "Startup Lifecycle Ready"
        );
};





/* ==========================================================
   B7.2.7 — STARTUP READY CHECK
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .isStartupLifecycleReady =
function () {

    return (
        this.startupLifecycleReady ===
        true
    );
};





/* ==========================================================
   B7.2.8 — STARTUP READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(

        "application:ready",

        () => {

            CampusWord2007Simulateur
                .ApplicationLifecycleEngine
                .initializeStartupLifecycle();
        }
    );






/* ==========================================================
   B7.3 — READY LIFECYCLE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .readyLifecycleReady =
false;





/* ==========================================================
   B7.3.1 — SET APPLICATION READY
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .setReady =
function () {

    const state =
        this.getApplicationState();

    state.ready =
        true;

    CampusWord2007Simulateur
        .EventBus
        .emit(
            "application:ready:state"
        );

    return true;
};





/* ==========================================================
   B7.3.2 — CLEAR APPLICATION READY
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .clearReady =
function () {

    const state =
        this.getApplicationState();

    state.ready =
        false;

    return true;
};





/* ==========================================================
   B7.3.3 — IS APPLICATION READY
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .isReady =
function () {

    return (

        this.getApplicationState()
            .ready === true

    );
};





/* ==========================================================
   B7.3.4 — CAN ENTER READY STATE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .canEnterReadyState =
function () {

    return (

        this.isInitialized() &&

        !this.isBooting()

    );
};





/* ==========================================================
   B7.3.5 — ENTER READY STATE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .enterReadyState =
function () {

    if (

        !this.canEnterReadyState()

    ) {

        return false;
    }

    this.setReady();

    return true;
};





/* ==========================================================
   B7.3.6 — READY LIFECYCLE VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateReadyLifecycle =
function () {

    return (

        typeof
        this.setReady ===
        "function" &&

        typeof
        this.isReady ===
        "function" &&

        typeof
        this.enterReadyState ===
        "function"

    );
};





/* ==========================================================
   B7.3.7 — INITIALIZE READY LIFECYCLE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .initializeReadyLifecycle =
function () {

    if (

        this.readyLifecycleReady

    ) {

        return;
    }

    this.readyLifecycleReady =
        true;

    CampusWord2007Simulateur
        .Logger
        .info(
            "Ready Lifecycle Ready"
        );
};





/* ==========================================================
   B7.3.8 — READY LIFECYCLE STATUS
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .isReadyLifecycleReady =
function () {

    return (

        this.readyLifecycleReady ===
        true

    );
};





/* ==========================================================
   B7.3.9 — READY LIFECYCLE HOOK
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(

        "application:ready",

        () => {

            CampusWord2007Simulateur
                .ApplicationLifecycleEngine
                .initializeReadyLifecycle();
        }
    );




/* ==========================================================
   B7.4 — SUSPEND LIFECYCLE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .suspendLifecycleReady =
false;





/* ==========================================================
   B7.4.1 — ENTER SUSPEND STATE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .enterSuspendState =
function () {

    const state =
        this.getApplicationState();

    if (
        state.suspended
    ) {

        return true;
    }

    state.suspended =
        true;

    CampusWord2007Simulateur
        .EventBus
        .emit(
            "application:suspend"
        );

    return true;
};





/* ==========================================================
   B7.4.2 — EXIT SUSPEND STATE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .exitSuspendState =
function () {

    const state =
        this.getApplicationState();

    if (
        !state.suspended
    ) {

        return true;
    }

    state.suspended =
        false;

    CampusWord2007Simulateur
        .EventBus
        .emit(
            "application:resume"
        );

    return true;
};





/* ==========================================================
   B7.4.3 — IS SUSPENDED
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .isSuspended =
function () {

    return (

        this
            .getApplicationState()
            .suspended ===
        true

    );
};





/* ==========================================================
   B7.4.4 — CAN SUSPEND
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .canSuspend =
function () {

    const state =
        this.getApplicationState();

    return (

        state.initialized &&

        !state.destroyed

    );
};





/* ==========================================================
   B7.4.5 — CAN RESUME
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .canResume =
function () {

    return (
        this.isSuspended()
    );
};





/* ==========================================================
   B7.4.6 — SUSPEND LIFECYCLE VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateSuspendLifecycle =
function () {

    const state =
        this.getApplicationState();

    return (

        typeof
        state.suspended ===
        "boolean" &&

        typeof
        this.enterSuspendState ===
        "function" &&

        typeof
        this.exitSuspendState ===
        "function" &&

        typeof
        this.isSuspended ===
        "function"

    );
};





/* ==========================================================
   B7.4.7 — INITIALIZE SUSPEND LIFECYCLE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .initializeSuspendLifecycle =
function () {

    if (
        this.suspendLifecycleReady
    ) {

        return;
    }

    this.suspendLifecycleReady =
        true;

    CampusWord2007Simulateur
        .Logger
        .info(
            "Suspend Lifecycle Ready"
        );
};





/* ==========================================================
   B7.4.8 — SUSPEND LIFECYCLE STATUS
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .isSuspendLifecycleReady =
function () {

    return (

        this
            .suspendLifecycleReady ===
        true

    );
};





/* ==========================================================
   B7.4.9 — SUSPEND LIFECYCLE HOOK
   ========================================================== */

CampusWord2007Simulateur
    .EventBus
    .on(

        "application:ready",

        () => {

            CampusWord2007Simulateur
                .ApplicationLifecycleEngine
                .initializeSuspendLifecycle();
        }
    );









/* ==========================================================
   B7.5 — DESTROY LIFECYCLE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .destroyLifecycleReady =
false;





/* ==========================================================
   B7.5.1 — ENTER DESTROY STATE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .enterDestroyState =
function () {

    const state =
        this.getApplicationState();

    if (
        state.destroyed
    ) {

        return true;
    }

    state.destroyed =
        true;

    state.ready =
        false;

    state.booting =
        false;

    state.suspended =
        false;

    CampusWord2007Simulateur
        .EventBus
        .emit(
            "application:destroy"
        );

    return true;
};





/* ==========================================================
   B7.5.2 — IS DESTROYED
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .isDestroyed =
function () {

    return (

        this
            .getApplicationState()
            .destroyed ===
        true

    );
};





/* ==========================================================
   B7.5.3 — CAN DESTROY
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .canDestroy =
function () {

    const state =
        this.getApplicationState();

    return (

        state.initialized &&

        !state.destroyed

    );
};





/* ==========================================================
   B7.5.4 — DESTROY STATE VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateDestroyState =
function () {

    const state =
        this.getApplicationState();

    return (

        typeof
        state.destroyed ===
        "boolean"

    );
};





/* ==========================================================
   B7.5.5 — DESTROY LIFECYCLE VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateDestroyLifecycle =
function () {

    return (

        typeof
        this.enterDestroyState ===
        "function" &&

        typeof
        this.isDestroyed ===
        "function" &&

        typeof
        this.canDestroy ===
        "function" &&

        this.validateDestroyState()

    );
};





/* ==========================================================
   B7.5.6 — INITIALIZE DESTROY LIFECYCLE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .initializeDestroyLifecycle =
function () {

    if (
        this.destroyLifecycleReady
    ) {

        return;
    }

    this.destroyLifecycleReady =
        true;

    CampusWord2007Simulateur
        .Logger
        .info(
            "Destroy Lifecycle Ready"
        );
};





/* ==========================================================
   B7.5.7 — DESTROY LIFECYCLE STATUS
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .isDestroyLifecycleReady =
function () {

    return (

        this
            .destroyLifecycleReady ===
        true

    );
};








/* ==========================================================
   B7.6 — LIFECYCLE VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .lifecycleValidationReady =
false;





/* ==========================================================
   B7.6.1 — VALIDATE STATE LIFECYCLE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateStateLifecycle =
function () {

    return (

        this.validateApplicationState &&

        this.validateApplicationState()

    );
};





/* ==========================================================
   B7.6.2 — VALIDATE STARTUP LIFECYCLE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateStartupLifecycleBlock =
function () {

    return (

        this.validateStartupLifecycle &&

        this.validateStartupLifecycle()

    );
};





/* ==========================================================
   B7.6.3 — VALIDATE READY LIFECYCLE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateReadyLifecycleBlock =
function () {

    return (

        this.validateReadyLifecycle &&

        this.validateReadyLifecycle()

    );
};





/* ==========================================================
   B7.6.4 — VALIDATE SUSPEND LIFECYCLE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateSuspendLifecycleBlock =
function () {

    return (

        this.validateSuspendLifecycle &&

        this.validateSuspendLifecycle()

    );
};





/* ==========================================================
   B7.6.5 — VALIDATE DESTROY LIFECYCLE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateDestroyLifecycleBlock =
function () {

    return (

        this.validateDestroyLifecycle &&

        this.validateDestroyLifecycle()

    );
};





/* ==========================================================
   B7.6.6 — VALIDATE COMPLETE LIFECYCLE
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateLifecycle =
function () {

    return (

        this.validateStateLifecycle() &&

        this.validateStartupLifecycleBlock() &&

        this.validateReadyLifecycleBlock() &&

        this.validateSuspendLifecycleBlock() &&

        this.validateDestroyLifecycleBlock()

    );
};





/* ==========================================================
   B7.6.7 — INITIALIZE LIFECYCLE VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .initializeLifecycleValidation =
function () {

    if (
        this.lifecycleValidationReady
    ) {

        return;
    }

    this.lifecycleValidationReady =
        true;

    if (
        CampusWord2007Simulateur
            .Logger &&
        typeof
        CampusWord2007Simulateur
            .Logger
            .info ===
        "function"
    ) {

        CampusWord2007Simulateur
            .Logger
            .info(
                "Lifecycle Validation Ready"
            );
    }
};





/* ==========================================================
   B7.6.8 — LIFECYCLE VALIDATION STATUS
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .isLifecycleValidationReady =
function () {

    return (

        this.lifecycleValidationReady ===
        true

    );
};





/* ==========================================================
   B7.6.9 — REMOVED AUTO HOOK
   ========================================================== */

/*
   Intentionally disabled.

   Previous EventBus hook caused
   startup instability on some builds.

   initializeLifecycleValidation()
   must be called explicitly
   by the Application Lifecycle Engine.
*/





/* ==========================================================
   B7.6.10 — GET LIFECYCLE VALIDATION REPORT
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .getLifecycleValidationReport =
function () {

    return {

        state:
            this.validateStateLifecycle(),

        startup:
            this.validateStartupLifecycleBlock(),

        ready:
            this.validateReadyLifecycleBlock(),

        suspend:
            this.validateSuspendLifecycleBlock(),

        destroy:
            this.validateDestroyLifecycleBlock(),

        complete:
            this.validateLifecycle()
    };
};









/* ==========================================================
   B7.7 — LIFECYCLE READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .lifecycleHookReady =
false;





/* ==========================================================
   B7.7.1 — IS LIFECYCLE READY
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .isLifecycleReady =
function () {

    return (

        this.isLifecycleStateReady() &&

        this.isStartupLifecycleReady() &&

        this.isReadyLifecycleReady() &&

        this.isSuspendLifecycleReady() &&

        this.isDestroyLifecycleReady() &&

        this.isLifecycleValidationReady()

    );
};





/* ==========================================================
   B7.7.2 — EMIT LIFECYCLE READY
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .emitLifecycleReady =
function () {

    if (

        !this.isLifecycleReady()

    ) {

        return false;
    }

    if (

        CampusWord2007Simulateur
            .EventBus &&

        typeof
        CampusWord2007Simulateur
            .EventBus
            .emit ===
        "function"

    ) {

        CampusWord2007Simulateur
            .EventBus
            .emit(
                "lifecycle:ready"
            );
    }

    return true;
};





/* ==========================================================
   B7.7.3 — INITIALIZE READY HOOK
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .initializeLifecycleReadyHook =
function () {

    if (

        this.lifecycleHookReady

    ) {

        return;
    }

    this.lifecycleHookReady =
        true;

    this.emitLifecycleReady();

    if (

        CampusWord2007Simulateur
            .Logger &&

        typeof
        CampusWord2007Simulateur
            .Logger
            .info ===
        "function"

    ) {

        CampusWord2007Simulateur
            .Logger
            .info(
                "Lifecycle Ready Hook Initialized"
            );
    }
};





/* ==========================================================
   B7.7.4 — READY HOOK STATUS
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .isLifecycleHookReady =
function () {

    return (

        this.lifecycleHookReady ===
        true

    );
};





/* ==========================================================
   B7.7.5 — GET LIFECYCLE STATUS
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .getLifecycleStatus =
function () {

    return {

        state:
            this.isLifecycleStateReady(),

        startup:
            this.isStartupLifecycleReady(),

        ready:
            this.isReadyLifecycleReady(),

        suspend:
            this.isSuspendLifecycleReady(),

        destroy:
            this.isDestroyLifecycleReady(),

        validation:
            this.isLifecycleValidationReady(),

        lifecycle:
            this.isLifecycleReady()
    };
};





/* ==========================================================
   B7.7.6 — READY HOOK VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateLifecycleReadyHook =
function () {

    return (

        typeof
        this.isLifecycleReady ===
        "function" &&

        typeof
        this.emitLifecycleReady ===
        "function" &&

        typeof
        this.getLifecycleStatus ===
        "function"

    );
};





/* ==========================================================
   B7.7.7 — REMOVED AUTO HOOK
   ========================================================== */

/*
   Intentionally disabled.

   Previous automatic
   EventBus application:ready hook
   caused startup instability.

   initializeLifecycleReadyHook()
   must be called explicitly
   by the lifecycle bootstrap.
*/





/* ==========================================================
   B7.7.8 — READY HOOK REPORT
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .getLifecycleReadyReport =
function () {

    return {

        hookReady:
            this.isLifecycleHookReady(),

        lifecycleReady:
            this.isLifecycleReady(),

        valid:
            this.validateLifecycleReadyHook()
    };
};










/* ==========================================================
   B7.8 — LIFECYCLE VALIDATION BLOCK
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .lifecycleValidationBlockReady =
false;





/* ==========================================================
   B7.8.1 — VALIDATE LIFECYCLE STATE BLOCK
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateLifecycleStateBlock =
function () {

    return (

        typeof
        this.isLifecycleStateReady ===
        "function"

    );
};





/* ==========================================================
   B7.8.2 — VALIDATE STARTUP BLOCK
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateStartupBlock =
function () {

    return (

        typeof
        this.isStartupLifecycleReady ===
        "function"

    );
};





/* ==========================================================
   B7.8.3 — VALIDATE READY BLOCK
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateReadyBlock =
function () {

    return (

        typeof
        this.isReadyLifecycleReady ===
        "function"

    );
};





/* ==========================================================
   B7.8.4 — VALIDATE SUSPEND BLOCK
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateSuspendBlock =
function () {

    return (

        typeof
        this.isSuspendLifecycleReady ===
        "function"

    );
};





/* ==========================================================
   B7.8.5 — VALIDATE DESTROY BLOCK
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateDestroyBlock =
function () {

    return (

        typeof
        this.isDestroyLifecycleReady ===
        "function"

    );
};





/* ==========================================================
   B7.8.6 — VALIDATE LIFECYCLE VALIDATION BLOCK
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateValidationBlock =
function () {

    return (

        typeof
        this.isLifecycleValidationReady ===
        "function"

    );
};





/* ==========================================================
   B7.8.7 — VALIDATE READY HOOK BLOCK
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateReadyHookBlock =
function () {

    return (

        typeof
        this.isLifecycleHookReady ===
        "function"

    );
};





/* ==========================================================
   B7.8.8 — COMPLETE VALIDATION BLOCK
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .validateLifecycleBlock =
function () {

    return (

        this.validateLifecycleStateBlock() &&

        this.validateStartupBlock() &&

        this.validateReadyBlock() &&

        this.validateSuspendBlock() &&

        this.validateDestroyBlock() &&

        this.validateValidationBlock() &&

        this.validateReadyHookBlock()

    );
};





/* ==========================================================
   B7.8.9 — INITIALIZE VALIDATION BLOCK
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .initializeLifecycleValidationBlock =
function () {

    if (
        this.lifecycleValidationBlockReady
    ) {

        return;
    }

    this.lifecycleValidationBlockReady =
        true;

    if (

        CampusWord2007Simulateur
            .Logger &&

        typeof
        CampusWord2007Simulateur
            .Logger
            .info ===
        "function"

    ) {

        CampusWord2007Simulateur
            .Logger
            .info(
                "Lifecycle Validation Block Ready"
            );
    }
};





/* ==========================================================
   B7.8.10 — VALIDATION BLOCK STATUS
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .isLifecycleValidationBlockReady =
function () {

    return (

        this.lifecycleValidationBlockReady ===
        true

    );
};





/* ==========================================================
   B7.8.11 — VALIDATION BLOCK REPORT
   ========================================================== */

CampusWord2007Simulateur
    .ApplicationLifecycleEngine
    .getLifecycleBlockReport =
function () {

    return {

        state:
            this.validateLifecycleStateBlock(),

        startup:
            this.validateStartupBlock(),

        ready:
            this.validateReadyBlock(),

        suspend:
            this.validateSuspendBlock(),

        destroy:
            this.validateDestroyBlock(),

        validation:
            this.validateValidationBlock(),

        hook:
            this.validateReadyHookBlock(),

        complete:
            this.validateLifecycleBlock()
    };
};











/* ==========================================================
   C1.1 — MOUSE STATE VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine =
CampusWord2007Simulateur
    .MouseEngine || {};





/* ==========================================================
   C1.1.1 — GET MOUSE STATE
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .getMouseState =
function () {

    return CampusWord2007Simulateur
        .state
        .mouse;
};





/* ==========================================================
   C1.1.2 — VALIDATE MOUSE STATE EXISTS
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .validateMouseState =
function () {

    const mouseState =
        this.getMouseState();

    return !!mouseState;
};





/* ==========================================================
   C1.1.3 — VALIDATE MOUSE POSITION
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .validateMousePosition =
function () {

    const mouseState =
        this.getMouseState();

    return (

        typeof mouseState.x ===
        "number" &&

        typeof mouseState.y ===
        "number"

    );
};





/* ==========================================================
   C1.1.4 — VALIDATE BUTTON STATE
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .validateMouseButtons =
function () {

    const mouseState =
        this.getMouseState();

    return (

        typeof mouseState.isDown ===
        "boolean" &&

        typeof mouseState.leftButton ===
        "boolean" &&

        typeof mouseState.middleButton ===
        "boolean" &&

        typeof mouseState.rightButton ===
        "boolean"

    );
};





/* ==========================================================
   C1.1.5 — VALIDATE CLICK STATE
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .validateMouseClicks =
function () {

    const mouseState =
        this.getMouseState();

    return (

        typeof mouseState.lastClickTime ===
        "number" &&

        typeof mouseState.clickCount ===
        "number"

    );
};





/* ==========================================================
   C1.1.6 — COMPLETE MOUSE VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .validateMouseEngine =
function () {

    return (

        this.validateMouseState() &&

        this.validateMousePosition() &&

        this.validateMouseButtons() &&

        this.validateMouseClicks()

    );
};





/* ==========================================================
   C1.1.7 — MOUSE VALIDATION REPORT
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .getMouseValidationReport =
function () {

    return {

        state:
            this.validateMouseState(),

        position:
            this.validateMousePosition(),

        buttons:
            this.validateMouseButtons(),

        clicks:
            this.validateMouseClicks(),

        complete:
            this.validateMouseEngine()
    };
};







/* ==========================================================
   C1.2 — POSITION TRACKING
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .positionTrackingReady =
false;





/* ==========================================================
   C1.2.1 — GET MOUSE X
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .getMouseX =
function () {

    return CampusWord2007Simulateur
        .state
        .mouse
        .x;
};





/* ==========================================================
   C1.2.2 — GET MOUSE Y
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .getMouseY =
function () {

    return CampusWord2007Simulateur
        .state
        .mouse
        .y;
};





/* ==========================================================
   C1.2.3 — SET MOUSE POSITION
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .setMousePosition =
function (
    x,
    y
) {

    const mouseState =
        CampusWord2007Simulateur
            .state
            .mouse;

    mouseState.x =
        Number(x) || 0;

    mouseState.y =
        Number(y) || 0;

    return true;
};





/* ==========================================================
   C1.2.4 — GET MOUSE POSITION
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .getMousePosition =
function () {

    return {

        x:
            this.getMouseX(),

        y:
            this.getMouseY()
    };
};





/* ==========================================================
   C1.2.5 — RESET MOUSE POSITION
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .resetMousePosition =
function () {

    return this.setMousePosition(
        0,
        0
    );
};





/* ==========================================================
   C1.2.6 — POSITION EXISTS
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .hasMousePosition =
function () {

    return (

        typeof
        this.getMouseX() ===
        "number" &&

        typeof
        this.getMouseY() ===
        "number"

    );
};





/* ==========================================================
   C1.2.7 — POSITION VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .validateMousePositionTracking =
function () {

    return (

        typeof
        this.getMouseX() ===
        "number" &&

        typeof
        this.getMouseY() ===
        "number"

    );
};





/* ==========================================================
   C1.2.8 — INITIALIZE POSITION TRACKING
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .initializePositionTracking =
function () {

    if (
        this.positionTrackingReady
    ) {

        return;
    }

    this.positionTrackingReady =
        true;

    if (

        CampusWord2007Simulateur
            .Logger &&

        typeof
        CampusWord2007Simulateur
            .Logger
            .info ===
        "function"

    ) {

        CampusWord2007Simulateur
            .Logger
            .info(
                "Mouse Position Tracking Ready"
            );
    }
};





/* ==========================================================
   C1.2.9 — POSITION TRACKING STATUS
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .isPositionTrackingReady =
function () {

    return (

        this.positionTrackingReady ===
        true

    );
};





/* ==========================================================
   C1.2.10 — POSITION TRACKING REPORT
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .getPositionTrackingReport =
function () {

    return {

        ready:
            this.isPositionTrackingReady(),

        valid:
            this.validateMousePositionTracking(),

        position:
            this.getMousePosition()
    };
};








/* ==========================================================
   C1.3 — BUTTON TRACKING
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .buttonTrackingReady =
false;





/* ==========================================================
   C1.3.1 — IS MOUSE DOWN
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .isMouseDown =
function () {

    return CampusWord2007Simulateur
        .state
        .mouse
        .isDown;
};





/* ==========================================================
   C1.3.2 — SET MOUSE DOWN
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .setMouseDown =
function (
    value
) {

    CampusWord2007Simulateur
        .state
        .mouse
        .isDown =
            !!value;

    return true;
};





/* ==========================================================
   C1.3.3 — SET BUTTON STATE
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .setButtonState =
function (
    button,
    pressed
) {

    const mouseState =
        CampusWord2007Simulateur
            .state
            .mouse;

    switch (
        button
    ) {

        case "left":

            mouseState.leftButton =
                !!pressed;

            break;

        case "middle":

            mouseState.middleButton =
                !!pressed;

            break;

        case "right":

            mouseState.rightButton =
                !!pressed;

            break;

        default:

            return false;
    }

    return true;
};





/* ==========================================================
   C1.3.4 — IS LEFT BUTTON DOWN
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .isLeftButtonDown =
function () {

    return CampusWord2007Simulateur
        .state
        .mouse
        .leftButton;
};





/* ==========================================================
   C1.3.5 — IS MIDDLE BUTTON DOWN
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .isMiddleButtonDown =
function () {

    return CampusWord2007Simulateur
        .state
        .mouse
        .middleButton;
};





/* ==========================================================
   C1.3.6 — IS RIGHT BUTTON DOWN
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .isRightButtonDown =
function () {

    return CampusWord2007Simulateur
        .state
        .mouse
        .rightButton;
};





/* ==========================================================
   C1.3.7 — CLEAR BUTTON STATES
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .clearButtonStates =
function () {

    const mouseState =
        CampusWord2007Simulateur
            .state
            .mouse;

    mouseState.isDown =
        false;

    mouseState.leftButton =
        false;

    mouseState.middleButton =
        false;

    mouseState.rightButton =
        false;

    return true;
};





/* ==========================================================
   C1.3.8 — BUTTON VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .validateButtonTracking =
function () {

    const mouseState =
        CampusWord2007Simulateur
            .state
            .mouse;

    return (

        typeof mouseState.isDown ===
        "boolean" &&

        typeof mouseState.leftButton ===
        "boolean" &&

        typeof mouseState.middleButton ===
        "boolean" &&

        typeof mouseState.rightButton ===
        "boolean"

    );
};





/* ==========================================================
   C1.3.9 — INITIALIZE BUTTON TRACKING
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .initializeButtonTracking =
function () {

    if (
        this.buttonTrackingReady
    ) {

        return;
    }

    this.buttonTrackingReady =
        true;

    if (

        CampusWord2007Simulateur
            .Logger &&

        typeof
        CampusWord2007Simulateur
            .Logger
            .info ===
        "function"

    ) {

        CampusWord2007Simulateur
            .Logger
            .info(
                "Mouse Button Tracking Ready"
            );
    }
};





/* ==========================================================
   C1.3.10 — BUTTON TRACKING STATUS
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .isButtonTrackingReady =
function () {

    return (

        this.buttonTrackingReady ===
        true

    );
};





/* ==========================================================
   C1.3.11 — BUTTON TRACKING REPORT
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .getButtonTrackingReport =
function () {

    return {

        ready:
            this.isButtonTrackingReady(),

        valid:
            this.validateButtonTracking(),

        isDown:
            this.isMouseDown(),

        left:
            this.isLeftButtonDown(),

        middle:
            this.isMiddleButtonDown(),

        right:
            this.isRightButtonDown()
    };
};














/* ==========================================================
   C1.4 — CLICK TRACKING
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .clickTrackingReady =
false;





/* ==========================================================
   C1.4.1 — GET CLICK COUNT
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .getClickCount =
function () {

    return CampusWord2007Simulateur
        .state
        .mouse
        .clickCount;
};





/* ==========================================================
   C1.4.2 — SET CLICK COUNT
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .setClickCount =
function (
    count
) {

    CampusWord2007Simulateur
        .state
        .mouse
        .clickCount =
            Math.max(
                0,
                Number(count) || 0
            );

    return true;
};





/* ==========================================================
   C1.4.3 — INCREMENT CLICK COUNT
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .incrementClickCount =
function () {

    const mouseState =
        CampusWord2007Simulateur
            .state
            .mouse;

    mouseState.clickCount++;

    return mouseState.clickCount;
};





/* ==========================================================
   C1.4.4 — RESET CLICK COUNT
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .resetClickCount =
function () {

    return this.setClickCount(
        0
    );
};





/* ==========================================================
   C1.4.5 — GET LAST CLICK TIME
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .getLastClickTime =
function () {

    return CampusWord2007Simulateur
        .state
        .mouse
        .lastClickTime;
};





/* ==========================================================
   C1.4.6 — SET LAST CLICK TIME
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .setLastClickTime =
function (
    timestamp
) {

    CampusWord2007Simulateur
        .state
        .mouse
        .lastClickTime =
            Number(timestamp) || 0;

    return true;
};





/* ==========================================================
   C1.4.7 — REGISTER CLICK
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .registerClick =
function () {

    this.incrementClickCount();

    this.setLastClickTime(
        Date.now()
    );

    return true;
};





/* ==========================================================
   C1.4.8 — CLICK TRACKING VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .validateClickTracking =
function () {

    const mouseState =
        CampusWord2007Simulateur
            .state
            .mouse;

    return (

        typeof
        mouseState.clickCount ===
        "number" &&

        typeof
        mouseState.lastClickTime ===
        "number"

    );
};





/* ==========================================================
   C1.4.9 — INITIALIZE CLICK TRACKING
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .initializeClickTracking =
function () {

    if (
        this.clickTrackingReady
    ) {

        return;
    }

    this.clickTrackingReady =
        true;

    if (

        CampusWord2007Simulateur
            .Logger &&

        typeof
        CampusWord2007Simulateur
            .Logger
            .info ===
        "function"

    ) {

        CampusWord2007Simulateur
            .Logger
            .info(
                "Mouse Click Tracking Ready"
            );
    }
};





/* ==========================================================
   C1.4.10 — CLICK TRACKING STATUS
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .isClickTrackingReady =
function () {

    return (

        this.clickTrackingReady ===
        true

    );
};





/* ==========================================================
   C1.4.11 — CLICK TRACKING REPORT
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .getClickTrackingReport =
function () {

    return {

        ready:
            this.isClickTrackingReady(),

        valid:
            this.validateClickTracking(),

        clickCount:
            this.getClickCount(),

        lastClickTime:
            this.getLastClickTime()
    };
};








/* ==========================================================
   C1.5 — MOUSE EVENT ENGINE
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .mouseEventsReady =
false;





/* ==========================================================
   C1.5.1 — HANDLE MOUSE MOVE
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .handleMouseMove =
function (
    event
) {

    if (
        !event
    ) {

        return;
    }

    this.setMousePosition(

        event.clientX,

        event.clientY
    );
};





/* ==========================================================
   C1.5.2 — HANDLE MOUSE DOWN
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .handleMouseDown =
function (
    event
) {

    if (
        !event
    ) {

        return;
    }

    this.setMouseDown(
        true
    );

    switch (
        event.button
    ) {

        case 0:

            this.setButtonState(
                "left",
                true
            );

            break;

        case 1:

            this.setButtonState(
                "middle",
                true
            );

            break;

        case 2:

            this.setButtonState(
                "right",
                true
            );

            break;
    }
};





/* ==========================================================
   C1.5.3 — HANDLE MOUSE UP
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .handleMouseUp =
function (
    event
) {

    if (
        !event
    ) {

        return;
    }

    this.setMouseDown(
        false
    );

    switch (
        event.button
    ) {

        case 0:

            this.setButtonState(
                "left",
                false
            );

            break;

        case 1:

            this.setButtonState(
                "middle",
                false
            );

            break;

        case 2:

            this.setButtonState(
                "right",
                false
            );

            break;
    }
};





/* ==========================================================
   C1.5.4 — HANDLE CLICK
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .handleClick =
function () {

    this.registerClick();
};





/* ==========================================================
   C1.5.5 — REGISTER EVENTS
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .registerMouseEvents =
function () {

    document.addEventListener(

        "mousemove",

        this.handleMouseMove
            .bind(
                this
            )
    );

    document.addEventListener(

        "mousedown",

        this.handleMouseDown
            .bind(
                this
            )
    );

    document.addEventListener(

        "mouseup",

        this.handleMouseUp
            .bind(
                this
            )
    );

    document.addEventListener(

        "click",

        this.handleClick
            .bind(
                this
            )
    );

    return true;
};





/* ==========================================================
   C1.5.6 — INITIALIZE MOUSE EVENTS
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .initializeMouseEvents =
function () {

    if (
        this.mouseEventsReady
    ) {

        return;
    }

    this.registerMouseEvents();

    this.mouseEventsReady =
        true;

    if (

        CampusWord2007Simulateur
            .Logger &&

        typeof
        CampusWord2007Simulateur
            .Logger
            .info ===
        "function"

    ) {

        CampusWord2007Simulateur
            .Logger
            .info(
                "Mouse Event Engine Ready"
            );
    }
};





/* ==========================================================
   C1.5.7 — MOUSE EVENT STATUS
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .isMouseEventEngineReady =
function () {

    return (

        this.mouseEventsReady ===
        true

    );
};





/* ==========================================================
   C1.5.8 — MOUSE EVENT VALIDATION
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .validateMouseEvents =
function () {

    return (

        typeof
        this.handleMouseMove ===
        "function" &&

        typeof
        this.handleMouseDown ===
        "function" &&

        typeof
        this.handleMouseUp ===
        "function" &&

        typeof
        this.handleClick ===
        "function"

    );
};





/* ==========================================================
   C1.5.9 — MOUSE EVENT REPORT
   ========================================================== */

CampusWord2007Simulateur
    .MouseEngine
    .getMouseEventReport =
function () {

    return {

        ready:
            this.isMouseEventEngineReady(),

        valid:
            this.validateMouseEvents()
    };
};








