
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







