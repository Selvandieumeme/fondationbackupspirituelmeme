
/* =========================================================
   FOBAS ETHICAL HACKING SIMULATION
   PREMIUM CYBERSECURITY SIMULATION CORE ENGINE
   CORE ENGINE v2.0
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       GLOBAL CONFIGURATION
    ====================================================== */

    const STORAGE_KEY =
        "FOBAS_ETHICAL_HACKING_SIMULATION_STATE";


    const VERSION =
        "2.0.0";


    const DEFAULT_LAB =
        "dashboard";


    /* =====================================================
       LAB DEFINITIONS
    ====================================================== */

    const LABS = {

        dashboard: {
            id: "dashboard",
            name: "Dashboard",
            type: "dashboard"
        },

        wifi: {
            id: "wifi",
            name: "Wi-Fi Security",
            type: "laboratory"
        },

        cameraEspion: {
            id: "cameraEspion",
            name: "Camera Espion",
            type: "laboratory"
        },

        cameraSurveillance: {
            id: "cameraSurveillance",
            name: "Camera Surveillance",
            type: "laboratory"
        }

    };


    /* =====================================================
       DEFAULT SIMULATION STATE
    ====================================================== */

    function createDefaultState() {

        const now =
            new Date().toISOString();


        return {

            version: VERSION,

            initialized: true,

            currentLab:
                DEFAULT_LAB,

            simulationStatus:
                "READY",

            started:
                false,

            completed:
                false,

            score:
                0,

            currentMissionId:
                null,

            currentActionId:
                null,

            actions: {},

            missions: {},

            labStates: {

                wifi: {

                    initialized: false,

                    active: false,

                    progress: 0

                },


                cameraEspion: {

                    initialized: false,

                    active: false,

                    progress: 0

                },


                cameraSurveillance: {

                    initialized: false,

                    active: false,

                    progress: 0

                }

            },

            metadata: {

                createdAt:
                    now,

                updatedAt:
                    now

            }

        };

    }


    /* =====================================================
       CENTRAL STATE
    ====================================================== */

    let simulationState =
        createDefaultState();


    let initialized =
        false;


    /* =====================================================
       STATE NORMALIZATION
       Protects older saved states.
    ====================================================== */

    function normalizeState(state) {

        const defaults =
            createDefaultState();


        if (
            !state ||
            typeof state !== "object"
        ) {

            return defaults;

        }


        const normalized = {

            ...defaults,

            ...state

        };


        normalized.actions =
            state.actions || {};


        normalized.missions =
            state.missions || {};


        normalized.labStates =
            state.labStates || {};


        Object.keys(
            defaults.labStates
        ).forEach(function (labId) {

            normalized.labStates[labId] = {

                ...defaults.labStates[labId],

                ...(state.labStates[labId] || {})

            };

        });


        normalized.metadata = {

            ...defaults.metadata,

            ...(state.metadata || {})

        };


        normalized.version =
            VERSION;


        normalized.initialized =
            true;


        return normalized;

    }


    /* =====================================================
       STATE ENGINE
    ====================================================== */

    const StateEngine = {


        getState: function () {

            return simulationState;

        },


        getSnapshot: function () {

            return JSON.parse(
                JSON.stringify(
                    simulationState
                )
            );

        },


        setState: function (newState) {

            if (
                !newState ||
                typeof newState !== "object"
            ) {

                return false;

            }


            simulationState =
                normalizeState(newState);


            touchState();


            this.render();


            return true;

        },


        update: function (updates) {

            if (
                !updates ||
                typeof updates !== "object"
            ) {

                return false;

            }


            Object.keys(updates).forEach(
                function (key) {

                    simulationState[key] =
                        updates[key];

                }
            );


            touchState();


            this.render();


            return true;

        },


        render: function () {

            UIEngine.updateStatus();

            UIEngine.updateStateIndicator();

            UIEngine.updateNavigationState();

            UIEngine.updateDocumentState();

        }

    };


    /* =====================================================
       STATE TIMESTAMP
    ====================================================== */

    function touchState() {

        if (
            !simulationState.metadata
        ) {

            simulationState.metadata = {};

        }


        simulationState.metadata.updatedAt =
            new Date().toISOString();

    }


    /* =====================================================
       NAVIGATION ENGINE
    ====================================================== */

    const NavigationEngine = {


        currentScreen:
            DEFAULT_LAB,


        goTo: function (labId) {

            if (
                !LABS[labId]
            ) {

                console.warn(
                    "Unknown laboratory:",
                    labId
                );

                return false;

            }


            this.currentScreen =
                labId;


            simulationState.currentLab =
                labId;


            Object.keys(LABS).forEach(
                function (id) {

                    const screen =
                        document.querySelector(
                            '[data-screen="' +
                            id +
                            '"]'
                        );


                    const button =
                        document.querySelector(
                            '[data-lab="' +
                            id +
                            '"]'
                        );


                    if (screen) {

                        screen.classList.toggle(
                            "activeScreen",
                            id === labId
                        );

                    }


                    if (button) {

                        button.classList.toggle(
                            "active",
                            id === labId
                        );


                        if (
                            id === labId
                        ) {

                            button.setAttribute(
                                "aria-current",
                                "page"
                            );

                        } else {

                            button.removeAttribute(
                                "aria-current"
                            );

                        }

                    }

                }
            );


            LabEngine.activate(
                labId
            );


            touchState();


            StateEngine.render();


            return true;

        }

    };


    /* =====================================================
       ACTION ENGINE
    ====================================================== */

    const ActionEngine = {


        registry: {},


        register: function (action) {

            if (
                !action ||
                !action.id
            ) {

                return false;

            }


            this.registry[action.id] =
                action;


            if (
                !simulationState.actions[
                    action.id
                ]
            ) {

                simulationState.actions[
                    action.id
                ] = {

                    id:
                        action.id,

                    label:
                        action.label ||
                        action.id,

                    executed:
                        false,

                    count:
                        0,

                    lastExecutedAt:
                        null

                };

            }


            return true;

        },


        execute: function (
            actionId,
            payload
        ) {

            const action =
                this.registry[actionId];


            if (!action) {

                console.warn(
                    "Unknown simulation action:",
                    actionId
                );

                return false;

            }


            if (
                !simulationState.actions[
                    actionId
                ]
            ) {

                simulationState.actions[
                    actionId
                ] = {

                    id:
                        actionId,

                    label:
                        action.label ||
                        actionId,

                    executed:
                        false,

                    count:
                        0,

                    lastExecutedAt:
                        null

                };

            }


            const state =
                simulationState.actions[
                    actionId
                ];


            state.executed =
                true;


            state.count =
                Number(state.count || 0) + 1;


            state.lastExecutedAt =
                new Date().toISOString();


            simulationState.currentActionId =
                actionId;


            if (
                typeof action.handler ===
                "function"
            ) {

                try {

                    action.handler(
                        payload || {}
                    );

                } catch (error) {

                    console.error(
                        "Action handler failed:",
                        error
                    );

                }

            }


            MissionEngine.evaluateActions(
                actionId,
                payload || {}
            );


            touchState();


            StateEngine.render();


            return true;

        },


        hasExecuted: function (
            actionId
        ) {

            return !!(
                simulationState.actions[
                    actionId
                ] &&
                simulationState.actions[
                    actionId
                ].executed
            );

        },


        getAction: function (
            actionId
        ) {

            return this.registry[
                actionId
            ] || null;

        }

    };


    /* =====================================================
       MISSION ENGINE
    ====================================================== */

    const MissionEngine = {


        registry: {},


        register: function (mission) {

            if (
                !mission ||
                !mission.id
            ) {

                return false;

            }


            this.registry[
                mission.id
            ] = mission;


            if (
                !simulationState.missions[
                    mission.id
                ]
            ) {

                simulationState.missions[
                    mission.id
                ] = {

                    id:
                        mission.id,

                    started:
                        false,

                    completed:
                        false,

                    progress:
                        0,

                    progressSteps:
                        0,

                    validation:
                        {},

                    startedAt:
                        null,

                    completedAt:
                        null

                };

            } else {

                const missionState =
                    simulationState.missions[
                        mission.id
                    ];


                if (
                    typeof missionState.progressSteps !==
                    "number"
                ) {

                    missionState.progressSteps =
                        0;

                }


                missionState.validation =
                    missionState.validation || {};

            }


            return true;

        },


        start: function (
            missionId
        ) {

            const mission =
                this.registry[
                    missionId
                ];


            if (!mission) {

                return false;

            }


            const missionState =
                simulationState.missions[
                    missionId
                ];


            if (!missionState) {

                return false;

            }


            missionState.started =
                true;


            missionState.completed =
                false;


            missionState.progress =
                0;


            missionState.progressSteps =
                0;


            missionState.validation =
                {};


            missionState.startedAt =
                new Date().toISOString();


            missionState.completedAt =
                null;


            simulationState.currentMissionId =
                missionId;


            simulationState.started =
                true;


            simulationState.completed =
                false;


            simulationState.simulationStatus =
                "MISSION_ACTIVE";


            touchState();


            StateEngine.render();


            return true;

        },


        evaluateActions: function (
            actionId,
            payload
        ) {

            const missionId =
                simulationState.currentMissionId;


            if (!missionId) {

                return false;

            }


            const mission =
                this.registry[
                    missionId
                ];


            if (!mission) {

                return false;

            }


            const missionState =
                simulationState.missions[
                    missionId
                ];


            if (
                !missionState ||
                !missionState.started ||
                missionState.completed
            ) {

                return false;

            }


            return ValidationEngine.validate(
                mission,
                missionState,
                actionId,
                payload || {}
            );

        },


        complete: function (
            missionId
        ) {

            const missionState =
                simulationState.missions[
                    missionId
                ];


            if (!missionState) {

                return false;

            }


            missionState.completed =
                true;


            missionState.progress =
                100;


            if (
                this.registry[missionId] &&
                Array.isArray(
                    this.registry[missionId].steps
                )
            ) {

                missionState.progressSteps =
                    this.registry[
                        missionId
                    ].steps.length;

            }


            missionState.completedAt =
                new Date().toISOString();


            simulationState.currentMissionId =
                null;


            simulationState.completed =
                true;


            simulationState.simulationStatus =
                "MISSION_COMPLETED";


            touchState();


            StateEngine.render();


            return true;

        },


        getMissionState: function (
            missionId
        ) {

            return simulationState.missions[
                missionId
            ] || null;

        },


        getMission: function (
            missionId
        ) {

            return this.registry[
                missionId
            ] || null;

        }

    };


    /* =====================================================
       VALIDATION ENGINE
    ====================================================== */

    const ValidationEngine = {


        validate: function (
            mission,
            missionState,
            actionId,
            payload
        ) {

            if (
                !mission ||
                !Array.isArray(
                    mission.steps
                )
            ) {

                return false;

            }


            const currentStepIndex =
                Number(
                    missionState.progressSteps || 0
                );


            const step =
                mission.steps[
                    currentStepIndex
                ];


            if (!step) {

                MissionEngine.complete(
                    mission.id
                );

                return true;

            }


            const expectedAction =
                step.actionId;


            if (
                expectedAction !==
                actionId
            ) {

                return false;

            }


            if (
                typeof step.validate ===
                "function"
            ) {

                let valid =
                    false;


                try {

                    valid =
                        !!step.validate(
                            payload,
                            simulationState
                        );

                } catch (error) {

                    console.error(
                        "Mission validation error:",
                        error
                    );


                    valid =
                        false;

                }


                if (!valid) {

                    return false;

                }

            }


            missionState.validation[
                step.id
            ] = {

                valid:
                    true,

                validatedAt:
                    new Date().toISOString()

            };


            missionState.progressSteps =
                currentStepIndex + 1;


            missionState.progress =
                Math.round(
                    (
                        missionState.progressSteps /
                        mission.steps.length
                    ) * 100
                );


            if (
                missionState.progressSteps >=
                mission.steps.length
            ) {

                MissionEngine.complete(
                    mission.id
                );

            } else {

                touchState();

                StateEngine.render();

            }


            return true;

        }

    };


    /* =====================================================
       LAB ENGINE
    ====================================================== */

    const LabEngine = {


        activate: function (
            labId
        ) {

            /*
             * Dashboard is not stored inside
             * labStates because it is not
             * a laboratory.
             */

            if (
                labId ===
                "dashboard"
            ) {

                Object.keys(
                    simulationState.labStates
                ).forEach(
                    function (id) {

                        simulationState.labStates[
                            id
                        ].active =
                            false;

                    }
                );


                this.renderLab(
                    "dashboard"
                );


                return true;

            }


            if (
                !simulationState.labStates[
                    labId
                ]
            ) {

                return false;

            }


            Object.keys(
                simulationState.labStates
            ).forEach(
                function (id) {

                    simulationState.labStates[
                        id
                    ].active =
                        false;

                }
            );


            simulationState.labStates[
                labId
            ].active =
                true;


            simulationState.labStates[
                labId
            ].initialized =
                true;


            this.renderLab(
                labId
            );


            return true;

        },


        renderLab: function (
            labId
        ) {

            if (
                labId ===
                "wifi"
            ) {

                renderWiFiLab();

                return;

            }


            if (
                labId ===
                "cameraEspion"
            ) {

                renderCameraEspionLab();

                return;

            }


            if (
                labId ===
                "cameraSurveillance"
            ) {

                renderCameraSurveillanceLab();

                return;

            }

        },


        getActiveLab: function () {

            if (
                simulationState.currentLab ===
                "dashboard"
            ) {

                return null;

            }


            return simulationState.currentLab;

        }

    };


    /* =====================================================
       SAVE ENGINE
    ====================================================== */

    const SaveEngine = {


        save: function () {

            try {

                touchState();


                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(
                        simulationState
                    )
                );


                UIEngine.notify(
                    "Simulation saved successfully.",
                    "success"
                );


                return true;

            } catch (error) {

                console.error(
                    "Save failed:",
                    error
                );


                UIEngine.notify(
                    "Unable to save simulation.",
                    "error"
                );


                return false;

            }

        },


        load: function () {

            try {

                const raw =
                    localStorage.getItem(
                        STORAGE_KEY
                    );


                if (!raw) {

                    UIEngine.notify(
                        "No saved simulation found.",
                        "warning"
                    );


                    return false;

                }


                const parsed =
                    JSON.parse(
                        raw
                    );


                if (
                    !parsed ||
                    typeof parsed !== "object"
                ) {

                    throw new Error(
                        "Invalid simulation state."
                    );

                }


                simulationState =
                    normalizeState(
                        parsed
                    );


                const targetLab =
                    LABS[
                        simulationState.currentLab
                    ]
                        ? simulationState.currentLab
                        : DEFAULT_LAB;


                NavigationEngine.goTo(
                    targetLab
                );


                UIEngine.notify(
                    "Simulation loaded successfully.",
                    "success"
                );


                return true;

            } catch (error) {

                console.error(
                    "Load failed:",
                    error
                );


                simulationState =
                    normalizeState(
                        simulationState
                    );


                UIEngine.notify(
                    "Unable to load simulation.",
                    "error"
                );


                return false;

            }

        },


        exists: function () {

            try {

                return !!localStorage.getItem(
                    STORAGE_KEY
                );

            } catch (error) {

                return false;

            }

        }

    };


    /* =====================================================
       RESET ENGINE
    ====================================================== */

    const ResetEngine = {


        reset: function () {

            const confirmed =
                window.confirm(
                    "Reset the complete FOBAS simulation?"
                );


            if (!confirmed) {

                return false;

            }


            simulationState =
                createDefaultState();


            localStorage.removeItem(
                STORAGE_KEY
            );


            NavigationEngine.goTo(
                DEFAULT_LAB
            );


            simulationState.simulationStatus =
                "READY";


            simulationState.started =
                false;


            simulationState.completed =
                false;


            touchState();


            StateEngine.render();


            UIEngine.notify(
                "Simulation reset successfully.",
                "success"
            );


            return true;

        }

    };


    /* =====================================================
       UI ENGINE
    ====================================================== */

    const UIEngine = {


        updateStatus: function () {

            const element =
                document.getElementById(
                    "simulationStatus"
                );


            if (!element) {

                return;

            }


            const status =
                simulationState.simulationStatus ||
                "READY";


            element.textContent =
                formatStatus(status);


            element.dataset.status =
                status.toLowerCase();


            element.setAttribute(
                "aria-label",
                "Simulation status: " +
                formatStatus(status)
            );

        },


        updateStateIndicator: function () {

            const element =
                document.getElementById(
                    "stateIndicator"
                );


            if (!element) {

                return;

            }


            element.textContent =
                formatStatus(
                    simulationState.simulationStatus
                );


            element.dataset.status =
                (
                    simulationState.simulationStatus ||
                    "ready"
                ).toLowerCase();

        },


        updateNavigationState: function () {

            const currentLab =
                simulationState.currentLab ||
                DEFAULT_LAB;


            document
                .querySelectorAll(
                    "[data-lab]"
                )
                .forEach(
                    function (button) {

                        const isActive =
                            button.dataset.lab ===
                            currentLab;


                        button.classList.toggle(
                            "active",
                            isActive
                        );


                        if (isActive) {

                            button.setAttribute(
                                "aria-current",
                                "page"
                            );

                        } else {

                            button.removeAttribute(
                                "aria-current"
                            );

                        }

                    }
                );

        },


        updateDocumentState: function () {

            if (
                !document.body
            ) {

                return;

            }


            document.body.dataset.simulationStatus =
                (
                    simulationState.simulationStatus ||
                    "ready"
                ).toLowerCase();


            document.body.dataset.currentLab =
                (
                    simulationState.currentLab ||
                    DEFAULT_LAB
                );

        },


        notify: function (
            message,
            type
        ) {

            /*
             * Lightweight notification system.
             * It creates a temporary notification
             * only when needed.
             */

            const existing =
                document.getElementById(
                    "fobasSimulationNotification"
                );


            if (existing) {

                existing.remove();

            }


            const notification =
                document.createElement(
                    "div"
                );


            notification.id =
                "fobasSimulationNotification";


            notification.className =
                "fobasSimulationNotification";


            notification.dataset.type =
                type || "info";


            notification.setAttribute(
                "role",
                "status"
            );


            notification.textContent =
                message;


            notification.style.position =
                "fixed";


            notification.style.right =
                "18px";


            notification.style.bottom =
                "84px";


            notification.style.zIndex =
                "9999";


            notification.style.maxWidth =
                "min(360px, calc(100vw - 36px))";


            notification.style.padding =
                "12px 16px";


            notification.style.border =
                "1px solid rgba(76, 201, 240, 0.30)";


            notification.style.borderRadius =
                "10px";


            notification.style.background =
                "rgba(7, 18, 31, 0.96)";


            notification.style.color =
                "#eaf8ff";


            notification.style.fontFamily =
                "inherit";


            notification.style.fontSize =
                "12px";


            notification.style.fontWeight =
                "700";


            notification.style.boxShadow =
                "0 14px 35px rgba(0,0,0,0.35)";


            notification.style.backdropFilter =
                "blur(14px)";


            notification.style.webkitBackdropFilter =
                "blur(14px)";


            notification.style.animation =
                "fobasNotificationIn 180ms ease";


            document.body.appendChild(
                notification
            );


            window.setTimeout(
                function () {

                    if (
                        notification &&
                        notification.parentNode
                    ) {

                        notification.style.opacity =
                            "0";

                        notification.style.transform =
                            "translateY(5px)";

                        notification.style.transition =
                            "opacity 160ms ease, transform 160ms ease";


                        window.setTimeout(
                            function () {

                                if (
                                    notification.parentNode
                                ) {

                                    notification.remove();

                                }

                            },
                            170
                        );

                    }

                },
                2600
            );


            console.log(
                "[FOBAS Simulation]",
                message
            );

        }

    };


    /* =====================================================
       STATUS FORMATTER
    ====================================================== */

    function formatStatus(
        status
    ) {

        const labels = {

            READY:
                "READY",

            MISSION_ACTIVE:
                "MISSION ACTIVE",

            MISSION_COMPLETED:
                "MISSION COMPLETED",

            ANALYSIS:
                "ANALYSIS",

            RUNNING:
                "RUNNING",

            PAUSED:
                "PAUSED",

            COMPLETED:
                "COMPLETED",

            ERROR:
                "ERROR"

        };


        return (
            labels[status] ||
            String(status || "READY")
                .replace(/_/g, " ")
        );

    }


    /* =====================================================
       ACTION MAP
    ====================================================== */

    const ACTION_MAP = {

        dashboard:
            "open_dashboard",

        wifi:
            "open_wifi_lab",

        cameraEspion:
            "open_camera_espion_lab",

        cameraSurveillance:
            "open_camera_surveillance_lab"

    };


    /* =====================================================
       CORE ACTION REGISTRATION
    ====================================================== */

    function registerCoreActions() {

        ActionEngine.register({

            id:
                "open_dashboard",

            label:
                "Open Dashboard",

            handler:
                function () {

                    simulationState.simulationStatus =
                        "READY";

                }

        });


        ActionEngine.register({

            id:
                "open_wifi_lab",

            label:
                "Open Wi-Fi Laboratory",

            handler:
                function () {

                    simulationState.started =
                        true;

                }

        });


        ActionEngine.register({

            id:
                "open_camera_espion_lab",

            label:
                "Open Camera Espion Laboratory",

            handler:
                function () {

                    simulationState.started =
                        true;

                }

        });


        ActionEngine.register({

            id:
                "open_camera_surveillance_lab",

            label:
                "Open Camera Surveillance Laboratory",

            handler:
                function () {

                    simulationState.started =
                        true;

                }

        });

    }


    /* =====================================================
       CORE MISSION REGISTRATION
    ====================================================== */

    function registerCoreMissions() {

        MissionEngine.register({

            id:
                "core_navigation_test",

            name:
                "Simulation Navigation Test",

            description:
                "Core navigation verification mission.",

            steps: [

                {

                    id:
                        "step_1",

                    actionId:
                        "open_wifi_lab"

                },

                {

                    id:
                        "step_2",

                    actionId:
                        "open_camera_espion_lab"

                },

                {

                    id:
                        "step_3",

                    actionId:
                        "open_camera_surveillance_lab"

                }

            ]

        });

    }


    /* =====================================================
       NAVIGATION EVENT BINDINGS
    ====================================================== */

    function bindNavigationEvents() {

        const buttons =
            document.querySelectorAll(
                "[data-lab]"
            );


        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const labId =
                            button.dataset.lab;


                        if (
                            !LABS[labId]
                        ) {

                            return;

                        }


                        const actionId =
                            ACTION_MAP[
                                labId
                            ];


                        if (
                            actionId
                        ) {

                            ActionEngine.execute(
                                actionId
                            );

                        }


                        NavigationEngine.goTo(
                            labId
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       LAB CARD / ENTER LAB EVENTS
    ====================================================== */

    function bindLaunchEvents() {

        const buttons =
            document.querySelectorAll(
                "[data-launch-lab]"
            );


        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        event.stopPropagation();


                        const labId =
                            button.dataset.launchLab;


                        if (
                            !LABS[labId] ||
                            labId ===
                            "dashboard"
                        ) {

                            return;

                        }


                        const actionId =
                            ACTION_MAP[
                                labId
                            ];


                        if (
                            actionId
                        ) {

                            ActionEngine.execute(
                                actionId
                            );

                        }


                        NavigationEngine.goTo(
                            labId
                        );

                    }
                );

            }
        );


        /*
         * Allows the complete lab card
         * to behave like a secondary
         * navigation surface.
         */

        const cards =
            document.querySelectorAll(
                "[data-open-lab]"
            );


        cards.forEach(
            function (card) {

                card.addEventListener(
                    "click",
                    function (event) {

                        const interactive =
                            event.target.closest(
                                "button, a, input, select, textarea"
                            );


                        if (interactive) {

                            return;

                        }


                        const labId =
                            card.dataset.openLab;


                        if (
                            !LABS[labId]
                        ) {

                            return;

                        }


                        const actionId =
                            ACTION_MAP[
                                labId
                            ];


                        if (
                            actionId
                        ) {

                            ActionEngine.execute(
                                actionId
                            );

                        }


                        NavigationEngine.goTo(
                            labId
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       CONTROL EVENT BINDINGS
    ====================================================== */

    function bindControlEvents() {

        const saveButton =
            document.getElementById(
                "saveSimulationBtn"
            );


        const loadButton =
            document.getElementById(
                "loadSimulationBtn"
            );


        const resetButton =
            document.getElementById(
                "resetSimulationBtn"
            );


        if (saveButton) {

            saveButton.addEventListener(
                "click",
                function () {

                    SaveEngine.save();

                }
            );

        }


        if (loadButton) {

            loadButton.addEventListener(
                "click",
                function () {

                    SaveEngine.load();

                }
            );

        }


        if (resetButton) {

            resetButton.addEventListener(
                "click",
                function () {

                    ResetEngine.reset();

                }
            );

        }

    }


    /* =====================================================
       KEYBOARD ACCESSIBILITY
    ====================================================== */

    function bindKeyboardEvents() {

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    return;

                }


                if (
                    event.altKey &&
                    event.key === "1"
                ) {

                    event.preventDefault();

                    NavigationEngine.goTo(
                        "dashboard"
                    );

                }


                if (
                    event.altKey &&
                    event.key === "2"
                ) {

                    event.preventDefault();

                    NavigationEngine.goTo(
                        "wifi"
                    );

                }


                if (
                    event.altKey &&
                    event.key === "3"
                ) {

                    event.preventDefault();

                    NavigationEngine.goTo(
                        "cameraEspion"
                    );

                }


                if (
                    event.altKey &&
                    event.key === "4"
                ) {

                    event.preventDefault();

                    NavigationEngine.goTo(
                        "cameraSurveillance"
                    );

                }

            }
        );

    }


    /* =====================================================
       LAB RENDERER — WIFI
    ====================================================== */

    function renderWiFiLab() {

        const container =
            document.getElementById(
                "wifiLabContainer"
            );


        if (!container) {

            return;

        }


        const labState =
            simulationState.labStates.wifi;


        const progress =
            Number(
                labState.progress || 0
            );


        container.innerHTML = `

            <div class="emptyLab">

                <div
                    class="emptyLabIcon"
                    aria-hidden="true"
                >
                    📶
                </div>

                <h3>
                    Wi-Fi Laboratory Ready
                </h3>

                <p>
                    Core simulation initialized.
                    Wi-Fi security modules can be
                    connected to this workspace.
                </p>

                <p
                    style="
                        margin-top:14px;
                        color:#4cc9f0;
                        font-size:11px;
                        font-weight:800;
                        letter-spacing:1px;
                    "
                >
                    LAB STATUS:
                    ${labState.active ? "ACTIVE" : "STANDBY"}
                    · PROGRESS:
                    ${progress}%
                </p>

            </div>

        `;

    }


    /* =====================================================
       LAB RENDERER — CAMERA ESPION
    ====================================================== */

    function renderCameraEspionLab() {

        const container =
            document.getElementById(
                "cameraEspionLabContainer"
            );


        if (!container) {

            return;

        }


        const labState =
            simulationState.labStates.cameraEspion;


        const progress =
            Number(
                labState.progress || 0
            );


        container.innerHTML = `

            <div class="emptyLab">

                <div
                    class="emptyLabIcon"
                    aria-hidden="true"
                >
                    📷
                </div>

                <h3>
                    Camera Espion Laboratory Ready
                </h3>

                <p>
                    Core simulation initialized.
                    Detection and analysis modules
                    can be connected to this workspace.
                </p>

                <p
                    style="
                        margin-top:14px;
                        color:#4cc9f0;
                        font-size:11px;
                        font-weight:800;
                        letter-spacing:1px;
                    "
                >
                    LAB STATUS:
                    ${labState.active ? "ACTIVE" : "STANDBY"}
                    · PROGRESS:
                    ${progress}%
                </p>

            </div>

        `;

    }


    /* =====================================================
       LAB RENDERER — CAMERA SURVEILLANCE
    ====================================================== */

    function renderCameraSurveillanceLab() {

        const container =
            document.getElementById(
                "cameraSurveillanceLabContainer"
            );


        if (!container) {

            return;

        }


        const labState =
            simulationState.labStates.cameraSurveillance;


        const progress =
            Number(
                labState.progress || 0
            );


        container.innerHTML = `

            <div class="emptyLab">

                <div
                    class="emptyLabIcon"
                    aria-hidden="true"
                >
                    🎥
                </div>

                <h3>
                    Camera Surveillance Laboratory Ready
                </h3>

                <p>
                    Core simulation initialized.
                    Surveillance modules can be
                    connected to this workspace.
                </p>

                <p
                    style="
                        margin-top:14px;
                        color:#4cc9f0;
                        font-size:11px;
                        font-weight:800;
                        letter-spacing:1px;
                    "
                >
                    LAB STATUS:
                    ${labState.active ? "ACTIVE" : "STANDBY"}
                    · PROGRESS:
                    ${progress}%
                </p>

            </div>

        `;

    }


    /* =====================================================
       GLOBAL PUBLIC API
    ====================================================== */

    window.FOBASCybersecuritySimulation = {

        version:
            VERSION,

        state:
            StateEngine,

        navigation:
            NavigationEngine,

        actions:
            ActionEngine,

        missions:
            MissionEngine,

        validation:
            ValidationEngine,

        labs:
            LabEngine,

        save:
            SaveEngine,

        reset:
            ResetEngine,

        ui:
            UIEngine,

        config: {

            storageKey:
                STORAGE_KEY,

            labs:
                LABS

        }

    };


    /* =====================================================
       INITIALIZATION
    ====================================================== */

    function initializeSimulation() {

        if (initialized) {

            return;

        }


        initialized =
            true;


        registerCoreActions();

        registerCoreMissions();

        bindNavigationEvents();

        bindLaunchEvents();

        bindControlEvents();

        bindKeyboardEvents();


        const initialLab =
            LABS[
                simulationState.currentLab
            ]
                ? simulationState.currentLab
                : DEFAULT_LAB;


        simulationState.currentLab =
            initialLab;


        simulationState.simulationStatus =
            "READY";


        NavigationEngine.goTo(
            initialLab
        );


        StateEngine.render();


        console.log(
            "FOBAS Ethical Hacking Simulation initialized.",
            VERSION
        );

    }


    /* =====================================================
       DOCUMENT READY
    ====================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeSimulation,
            {
                once: true
            }
        );

    } else {

        initializeSimulation();

    }


})();






















/* =========================================================
   FOBAS ETHICAL HACKING SIMULATION
   WI-FI SECURITY LAB ENGINE
   PHASE 2 — TECHNICAL WORKSPACE
   VERSION 1.0.0

   PURPOSE:
   - Creates the technical Wi-Fi laboratory workspace.
   - Displays virtual Wi-Fi networks.
   - Displays SSID, BSSID, Channel, Encryption and Signal.
   - Calculates simulation security status.
   - Integrates with FOBAS Core Engine v2.0.
   - Does NOT interact with real Wi-Fi hardware.
   - Does NOT perform real network scanning.
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       DEPENDENCY CHECK
    ====================================================== */

    if (
        !window.FOBASCybersecuritySimulation
    ) {

        console.error(
            "[FOBAS Wi-Fi Lab] Core Simulation Engine not found."
        );

        return;

    }


    const FOBAS =
        window.FOBASCybersecuritySimulation;


    if (
        !FOBAS.labs ||
        !FOBAS.state
    ) {

        console.error(
            "[FOBAS Wi-Fi Lab] Required FOBAS Core APIs are unavailable."
        );

        return;

    }


    /* =====================================================
       ENGINE CONFIGURATION
    ====================================================== */

    const ENGINE_VERSION =
        "1.0.0";

    const LAB_ID =
        "wifi";

    const LAB_STATE =
        "labStates";


    /* =====================================================
       VIRTUAL WI-FI NETWORK DATABASE
       
       IMPORTANT:
       These are simulated networks only.
       No real wireless network is accessed.
    ====================================================== */

    const VIRTUAL_WIFI_NETWORKS = [

        {

            id:
                "wifi_target_alpha",

            ssid:
                "FOBAS-LAB-01",

            bssid:
                "02:FO:BA:5A:01:01",

            channel:
                6,

            encryption:
                "WPA2-PSK",

            signal:
                -48,

            security:
                "secure",

            securityScore:
                92

        },

        {

            id:
                "wifi_target_beta",

            ssid:
                "CyberLab-Training",

            bssid:
                "02:FO:BA:5A:02:02",

            channel:
                11,

            encryption:
                "WPA2-PSK",

            signal:
                -61,

            security:
                "secure",

            securityScore:
                86

        },

        {

            id:
                "wifi_target_gamma",

            ssid:
                "FOBAS-GUEST",

            bssid:
                "02:FO:BA:5A:03:03",

            channel:
                1,

            encryption:
                "WPA",

            signal:
                -57,

            security:
                "warning",

            securityScore:
                58

        },

        {

            id:
                "wifi_target_delta",

            ssid:
                "Training-Network",

            bssid:
                "02:FO:BA:5A:04:04",

            channel:
                3,

            encryption:
                "WEP",

            signal:
                -66,

            security:
                "vulnerable",

            securityScore:
                24

        },

        {

            id:
                "wifi_target_epsilon",

            ssid:
                "Open-Lab-Network",

            bssid:
                "02:FO:BA:5A:05:05",

            channel:
                9,

            encryption:
                "OPEN",

            signal:
                -73,

            security:
                "vulnerable",

            securityScore:
                8

        }

    ];


    /* =====================================================
       INTERNAL ENGINE STATE
    ====================================================== */

    const engineState = {

        initialized:
            false,

        scanning:
            false,

        scanCompleted:
            false,

        networks:
            [],

        selectedNetworkId:
            null,

        lastScanAt:
            null

    };


    /* =====================================================
       STATE INITIALIZATION
    ====================================================== */

    function ensureLabState() {

        const state =
            FOBAS.state.getState();

        if (
            !state.labStates
        ) {

            state.labStates = {};

        }

        if (
            !state.labStates[LAB_ID]
        ) {

            state.labStates[LAB_ID] = {

                initialized:
                    false,

                active:
                    false,

                progress:
                    0

            };

        }

        const wifiState =
            state.labStates[LAB_ID];


        if (
            typeof wifiState.progress !==
            "number"
        ) {

            wifiState.progress =
                0;

        }


        if (
            typeof wifiState.initialized !==
            "boolean"
        ) {

            wifiState.initialized =
                false;

        }


        if (
            typeof wifiState.active !==
            "boolean"
        ) {

            wifiState.active =
                false;

        }


        return wifiState;

    }


    /* =====================================================
       SECURITY STATUS FORMATTER
    ====================================================== */

    function getSecurityStatus(
        network
    ) {

        if (
            !network
        ) {

            return {

                key:
                    "unknown",

                label:
                    "UNKNOWN"

            };

        }


        const encryption =
            String(
                network.encryption ||
                ""
            ).toUpperCase();


        /*
         * Simulation security classification.
         */

        if (
            encryption === "OPEN" ||
            encryption === "WEP"
        ) {

            return {

                key:
                    "vulnerable",

                label:
                    "VULNERABLE"

            };

        }


        if (
            encryption === "WPA"
        ) {

            return {

                key:
                    "warning",

                label:
                    "WARNING"

            };

        }


        return {

            key:
                "secure",

            label:
                "SECURE"

        };

    }


    /* =====================================================
       SIGNAL QUALITY
    ====================================================== */

    function getSignalQuality(
        signal
    ) {

        const value =
            Number(signal);


        if (
            !Number.isFinite(value)
        ) {

            return {

                percentage:
                    0,

                label:
                    "UNKNOWN"

            };

        }


        /*
         * Typical Wi-Fi RSSI range used
         * only for visual simulation.
         */

        const minimum =
            -100;

        const maximum =
            -30;


        let percentage =
            (
                (value - minimum) /
                (maximum - minimum)
            ) * 100;


        percentage =
            Math.max(
                0,
                Math.min(
                    100,
                    Math.round(
                        percentage
                    )
                )
            );


        let label =
            "WEAK";


        if (
            percentage >= 75
        ) {

            label =
                "EXCELLENT";

        } else if (
            percentage >= 55
        ) {

            label =
                "GOOD";

        } else if (
            percentage >= 35
        ) {

            label =
                "FAIR";

        }


        return {

            percentage:
                percentage,

            label:
                label

        };

    }


    /* =====================================================
       HTML ESCAPE
       Prevents virtual network data from
       being interpreted as HTML.
    ====================================================== */

    function escapeHTML(
        value
    ) {

        return String(
            value == null
                ? ""
                : value
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

    }


    /* =====================================================
       ENGINE STYLE INJECTION
       
       Keeps Phase 2 visually self-contained.
    ====================================================== */

    function injectStyles() {

        if (
            document.getElementById(
                "fobasWifiLabEngineStyles"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "fobasWifiLabEngineStyles";


        style.textContent = `

            /* =========================================
               WIFI LAB WORKSPACE
            ========================================== */

            .fobasWifiWorkspace {

                width:100%;
                min-height:520px;

                display:flex;
                flex-direction:column;

                gap:18px;

                position:relative;

            }


            /* =========================================
               TOP TECHNICAL HEADER
            ========================================== */

            .fobasWifiLabTopbar {

                display:flex;
                align-items:center;
                justify-content:space-between;

                gap:18px;

                padding:18px 20px;

                border:1px solid
                    rgba(76,201,240,.18);

                border-radius:16px;

                background:
                    linear-gradient(
                        135deg,
                        rgba(9,24,40,.96),
                        rgba(5,14,25,.96)
                    );

                box-shadow:
                    0 18px 45px
                    rgba(0,0,0,.25);

            }


            .fobasWifiLabIdentity {

                display:flex;
                align-items:center;

                gap:13px;

                min-width:0;

            }


            .fobasWifiLabIdentityIcon {

                width:46px;
                height:46px;

                display:grid;
                place-items:center;

                border-radius:13px;

                background:
                    rgba(76,201,240,.10);

                border:1px solid
                    rgba(76,201,240,.25);

                font-size:22px;

                flex-shrink:0;

            }


            .fobasWifiLabIdentityText {

                min-width:0;

            }


            .fobasWifiLabIdentityText strong {

                display:block;

                color:#f3fbff;

                font-size:14px;

                letter-spacing:.8px;

                text-transform:uppercase;

            }


            .fobasWifiLabIdentityText span {

                display:block;

                margin-top:4px;

                color:#7e9bad;

                font-size:10px;

                letter-spacing:1.1px;

                text-transform:uppercase;

            }


            /* =========================================
               SCAN STATUS
            ========================================== */

            .fobasWifiScanStatus {

                display:flex;
                align-items:center;

                gap:9px;

                padding:9px 12px;

                border-radius:999px;

                border:1px solid
                    rgba(76,201,240,.18);

                background:
                    rgba(76,201,240,.06);

                color:#9edff4;

                font-size:10px;

                font-weight:900;

                letter-spacing:1px;

                white-space:nowrap;

            }


            .fobasWifiScanDot {

                width:7px;
                height:7px;

                border-radius:50%;

                background:#4cc9f0;

                box-shadow:
                    0 0 12px
                    rgba(76,201,240,.8);

            }


            .fobasWifiScanStatus.scanning
            .fobasWifiScanDot {

                animation:
                    fobasWifiScanPulse
                    .8s infinite;

            }


            @keyframes fobasWifiScanPulse {

                0% {
                    opacity:.35;
                    transform:scale(.8);
                }

                50% {
                    opacity:1;
                    transform:scale(1.35);
                }

                100% {
                    opacity:.35;
                    transform:scale(.8);
                }

            }


            /* =========================================
               CONTROL BAR
            ========================================== */

            .fobasWifiControlBar {

                display:flex;
                align-items:center;
                justify-content:space-between;

                gap:14px;

                flex-wrap:wrap;

                padding:14px 16px;

                border:1px solid
                    rgba(255,255,255,.07);

                border-radius:14px;

                background:
                    rgba(255,255,255,.025);

            }


            .fobasWifiControlInfo {

                color:#7890a0;

                font-size:10px;

                font-weight:700;

                letter-spacing:.8px;

                text-transform:uppercase;

            }


            .fobasWifiScanButton {

                min-height:42px;

                padding:0 18px;

                border:1px solid
                    rgba(76,201,240,.35);

                border-radius:10px;

                background:
                    linear-gradient(
                        135deg,
                        rgba(76,201,240,.16),
                        rgba(76,201,240,.05)
                    );

                color:#eafaff;

                font-size:11px;

                font-weight:900;

                letter-spacing:1px;

                cursor:pointer;

                transition:
                    transform .18s ease,
                    border-color .18s ease,
                    box-shadow .18s ease;

                touch-action:manipulation;

            }


            .fobasWifiScanButton:hover {

                transform:
                    translateY(-2px);

                border-color:
                    rgba(76,201,240,.65);

                box-shadow:
                    0 10px 25px
                    rgba(76,201,240,.10);

            }


            .fobasWifiScanButton:active {

                transform:
                    translateY(0);

            }


            .fobasWifiScanButton:disabled {

                opacity:.55;

                cursor:wait;

                transform:none;

            }


            /* =========================================
               NETWORK TABLE CONTAINER
            ========================================== */

            .fobasWifiNetworkPanel {

                overflow:hidden;

                border:1px solid
                    rgba(76,201,240,.12);

                border-radius:16px;

                background:
                    rgba(3,10,18,.78);

                box-shadow:
                    0 20px 50px
                    rgba(0,0,0,.20);

            }


            .fobasWifiPanelHeader {

                display:flex;
                align-items:center;
                justify-content:space-between;

                gap:12px;

                padding:16px 18px;

                border-bottom:1px solid
                    rgba(255,255,255,.06);

            }


            .fobasWifiPanelTitle {

                color:#eaf8ff;

                font-size:11px;

                font-weight:900;

                letter-spacing:1.2px;

                text-transform:uppercase;

            }


            .fobasWifiNetworkCount {

                color:#4cc9f0;

                font-size:10px;

                font-weight:900;

                letter-spacing:1px;

            }


            /* =========================================
               NETWORK LIST
            ========================================== */

            .fobasWifiNetworkList {

                display:flex;

                flex-direction:column;

            }


            .fobasWifiNetworkRow {

                display:grid;

                grid-template-columns:
                    minmax(145px,1.4fr)
                    minmax(145px,1.3fr)
                    80px
                    minmax(105px,1fr)
                    110px
                    120px;

                gap:12px;

                align-items:center;

                padding:15px 18px;

                border-bottom:1px solid
                    rgba(255,255,255,.045);

                cursor:pointer;

                transition:
                    background .18s ease,
                    transform .18s ease;

            }


            .fobasWifiNetworkRow:last-child {

                border-bottom:none;

            }


            .fobasWifiNetworkRow:hover {

                background:
                    rgba(76,201,240,.045);

            }


            .fobasWifiNetworkRow.selected {

                background:
                    linear-gradient(
                        90deg,
                        rgba(76,201,240,.09),
                        rgba(76,201,240,.025)
                    );

                box-shadow:
                    inset 3px 0 0
                    #4cc9f0;

            }


            .fobasWifiNetworkHeader {

                background:
                    rgba(255,255,255,.025);

                cursor:default;

            }


            .fobasWifiNetworkHeader:hover {

                background:
                    rgba(255,255,255,.025);

            }


            .fobasWifiCell {

                min-width:0;

                color:#9bb1bf;

                font-size:10px;

                font-weight:700;

                overflow:hidden;

                text-overflow:ellipsis;

                white-space:nowrap;

            }


            .fobasWifiNetworkHeader
            .fobasWifiCell {

                color:#587080;

                font-size:9px;

                font-weight:900;

                letter-spacing:.9px;

                text-transform:uppercase;

            }


            .fobasWifiSSID {

                display:flex;
                align-items:center;

                gap:9px;

                color:#edfaff;

                font-weight:900;

            }


            .fobasWifiSSIDIcon {

                width:27px;
                height:27px;

                display:grid;
                place-items:center;

                border-radius:8px;

                background:
                    rgba(76,201,240,.08);

                border:1px solid
                    rgba(76,201,240,.14);

                flex-shrink:0;

                font-size:12px;

            }


            .fobasWifiBSSID {

                font-family:
                    ui-monospace,
                    SFMono-Regular,
                    Menlo,
                    Monaco,
                    Consolas,
                    monospace;

                font-size:9px;

                letter-spacing:.3px;

                color:#7895a6;

            }


            /* =========================================
               SIGNAL METER
            ========================================== */

            .fobasWifiSignal {

                display:flex;

                align-items:center;

                gap:8px;

            }


            .fobasWifiSignalBars {

                width:38px;
                height:18px;

                display:flex;

                align-items:flex-end;

                gap:2px;

            }


            .fobasWifiSignalBar {

                width:7px;

                border-radius:2px 2px 0 0;

                background:
                    rgba(120,144,157,.20);

            }


            .fobasWifiSignalBar:nth-child(1) {
                height:5px;
            }

            .fobasWifiSignalBar:nth-child(2) {
                height:9px;
            }

            .fobasWifiSignalBar:nth-child(3) {
                height:13px;
            }

            .fobasWifiSignalBar:nth-child(4) {
                height:18px;
            }


            .fobasWifiSignalBar.active {

                background:#4cc9f0;

                box-shadow:
                    0 0 8px
                    rgba(76,201,240,.25);

            }


            .fobasWifiSignalText {

                color:#93aeba;

                font-size:9px;

                font-weight:900;

            }


            /* =========================================
               SECURITY BADGES
            ========================================== */

            .fobasWifiSecurityBadge {

                display:inline-flex;

                align-items:center;

                justify-content:center;

                width:max-content;

                min-width:82px;

                padding:6px 9px;

                border-radius:999px;

                font-size:8px;

                font-weight:900;

                letter-spacing:.8px;

            }


            .fobasWifiSecurityBadge.secure {

                color:#9bf2c2;

                background:
                    rgba(72,199,142,.09);

                border:1px solid
                    rgba(72,199,142,.18);

            }


            .fobasWifiSecurityBadge.warning {

                color:#ffd58a;

                background:
                    rgba(255,193,7,.08);

                border:1px solid
                    rgba(255,193,7,.18);

            }


            .fobasWifiSecurityBadge.vulnerable {

                color:#ff9d9d;

                background:
                    rgba(255,82,82,.08);

                border:1px solid
                    rgba(255,82,82,.18);

            }


            /* =========================================
               EMPTY / SCANNING STATE
            ========================================== */

            .fobasWifiEmptyState {

                min-height:220px;

                display:flex;

                flex-direction:column;

                align-items:center;

                justify-content:center;

                gap:10px;

                padding:30px;

                text-align:center;

            }


            .fobasWifiEmptyIcon {

                width:56px;
                height:56px;

                display:grid;
                place-items:center;

                border-radius:16px;

                border:1px solid
                    rgba(76,201,240,.16);

                background:
                    rgba(76,201,240,.06);

                font-size:25px;

            }


            .fobasWifiEmptyState strong {

                color:#eaf8ff;

                font-size:13px;

                letter-spacing:.5px;

            }


            .fobasWifiEmptyState span {

                max-width:430px;

                color:#6e8594;

                font-size:10px;

                line-height:1.7;

            }


            /* =========================================
               RESPONSIVE TABLET / MOBILE
            ========================================== */

            @media (max-width:1050px) {

                .fobasWifiNetworkRow {

                    grid-template-columns:
                        minmax(145px,1.3fr)
                        minmax(125px,1.2fr)
                        70px
                        minmax(95px,1fr)
                        100px;

                }

                .fobasWifiNetworkRow
                .fobasWifiCell:nth-child(6) {

                    display:none;

                }

                .fobasWifiNetworkHeader
                .fobasWifiCell:nth-child(6) {

                    display:none;

                }

            }


            @media (max-width:760px) {

                .fobasWifiLabTopbar {

                    align-items:flex-start;

                    flex-direction:column;

                }


                .fobasWifiScanStatus {

                    width:100%;

                    justify-content:center;

                }


                .fobasWifiNetworkPanel {

                    overflow-x:auto;

                }


                .fobasWifiNetworkList {

                    min-width:700px;

                }

            }


            @media (max-width:560px) {

                .fobasWifiControlBar {

                    align-items:stretch;

                    flex-direction:column;

                }


                .fobasWifiScanButton {

                    width:100%;

                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* =====================================================
       SIGNAL HTML
    ====================================================== */

    function renderSignal(
        signal
    ) {

        const quality =
            getSignalQuality(
                signal
            );


        const thresholds = [

            25,
            50,
            75,
            100

        ];


        const bars =
            thresholds.map(
                function (
                    threshold
                ) {

                    const active =
                        quality.percentage >=
                        threshold;

                    return `

                        <span
                            class="fobasWifiSignalBar ${
                                active
                                    ? "active"
                                    : ""
                            }"
                        ></span>

                    `;

                }
            ).join("");


        return `

            <div
                class="fobasWifiSignal"
                title="Signal ${escapeHTML(signal)} dBm"
            >

                <div
                    class="fobasWifiSignalBars"
                    aria-hidden="true"
                >
                    ${bars}
                </div>

                <span
                    class="fobasWifiSignalText"
                >
                    ${escapeHTML(signal)} dBm
                </span>

            </div>

        `;

    }


    /* =====================================================
       NETWORK ROW
    ====================================================== */

    function renderNetworkRow(
        network,
        selected
    ) {

        const security =
            getSecurityStatus(
                network
            );


        return `

            <div
                class="
                    fobasWifiNetworkRow
                    ${
                        selected
                            ? "selected"
                            : ""
                    }
                "
                data-wifi-network-id="${escapeHTML(
                    network.id
                )}"
                role="button"
                tabindex="0"
                aria-selected="${
                    selected
                        ? "true"
                        : "false"
                }"
            >

                <div
                    class="
                        fobasWifiCell
                        fobasWifiSSID
                    "
                >

                    <span
                        class="fobasWifiSSIDIcon"
                        aria-hidden="true"
                    >
                        📶
                    </span>

                    <span>
                        ${escapeHTML(
                            network.ssid
                        )}
                    </span>

                </div>


                <div
                    class="
                        fobasWifiCell
                        fobasWifiBSSID
                    "
                >
                    ${escapeHTML(
                        network.bssid
                    )}
                </div>


                <div
                    class="fobasWifiCell"
                >
                    CH ${escapeHTML(
                        network.channel
                    )}
                </div>


                <div
                    class="fobasWifiCell"
                >
                    ${escapeHTML(
                        network.encryption
                    )}
                </div>


                <div
                    class="fobasWifiCell"
                >
                    ${renderSignal(
                        network.signal
                    )}
                </div>


                <div
                    class="fobasWifiCell"
                >

                    <span
                        class="
                            fobasWifiSecurityBadge
                            ${security.key}
                        "
                    >
                        ${security.label}
                    </span>

                </div>

            </div>

        `;

    }


    /* =====================================================
       NETWORK TABLE
    ====================================================== */

    function renderNetworkTable() {

        const networks =
            engineState.networks;


        if (
            !engineState.scanCompleted ||
            !networks.length
        ) {

            return `

                <div
                    class="fobasWifiEmptyState"
                >

                    <div
                        class="fobasWifiEmptyIcon"
                        aria-hidden="true"
                    >
                        📡
                    </div>

                    <strong>
                        Wi-Fi Environment Ready
                    </strong>

                    <span>
                        Launch a virtual scan to
                        discover simulated wireless
                        networks inside the FOBAS
                        training environment.
                    </span>

                </div>

            `;

        }


        const rows =
            networks.map(
                function (
                    network
                ) {

                    return renderNetworkRow(
                        network,
                        network.id ===
                        engineState.selectedNetworkId
                    );

                }
            ).join("");


        return `

            <div
                class="
                    fobasWifiNetworkRow
                    fobasWifiNetworkHeader
                "
                aria-hidden="true"
            >

                <div class="fobasWifiCell">
                    SSID
                </div>

                <div class="fobasWifiCell">
                    BSSID
                </div>

                <div class="fobasWifiCell">
                    CHANNEL
                </div>

                <div class="fobasWifiCell">
                    ENCRYPTION
                </div>

                <div class="fobasWifiCell">
                    SIGNAL
                </div>

                <div class="fobasWifiCell">
                    SECURITY
                </div>

            </div>


            ${rows}

        `;

    }


    /* =====================================================
       MAIN WORKSPACE RENDERER
    ====================================================== */

    function renderWorkspace() {

        const container =
            document.getElementById(
                "wifiLabContainer"
            );


        if (!container) {

            return;

        }


        const wifiState =
            ensureLabState();


        const scanStatus =
            engineState.scanning
                ? "SCANNING"
                : (
                    engineState.scanCompleted
                        ? "SCAN COMPLETE"
                        : "READY"
                );


        const lastScan =
            engineState.lastScanAt
                ? new Date(
                    engineState.lastScanAt
                ).toLocaleTimeString()
                : "—";


        container.innerHTML = `

            <div
                class="fobasWifiWorkspace"
                data-engine="wifi"
                data-engine-version="${ENGINE_VERSION}"
            >

                <!-- =====================================
                     TECHNICAL LAB TOPBAR
                ====================================== -->

                <div
                    class="fobasWifiLabTopbar"
                >

                    <div
                        class="fobasWifiLabIdentity"
                    >

                        <div
                            class="fobasWifiLabIdentityIcon"
                            aria-hidden="true"
                        >
                            📡
                        </div>

                        <div
                            class="fobasWifiLabIdentityText"
                        >

                            <strong>
                                Wi-Fi Security Laboratory
                            </strong>

                            <span>
                                Virtual Wireless Analysis Environment
                            </span>

                        </div>

                    </div>


                    <div
                        class="
                            fobasWifiScanStatus
                            ${
                                engineState.scanning
                                    ? "scanning"
                                    : ""
                            }
                        "
                    >

                        <span
                            class="fobasWifiScanDot"
                            aria-hidden="true"
                        ></span>

                        <span>
                            ${scanStatus}
                        </span>

                    </div>

                </div>


                <!-- =====================================
                     CONTROL BAR
                ====================================== -->

                <div
                    class="fobasWifiControlBar"
                >

                    <div
                        class="fobasWifiControlInfo"
                    >

                        Virtual environment
                        · Last scan:
                        ${escapeHTML(lastScan)}

                    </div>


                    <button
                        type="button"
                        id="fobasWifiScanNetworksBtn"
                        class="fobasWifiScanButton"
                        ${
                            engineState.scanning
                                ? "disabled"
                                : ""
                        }
                    >

                        ${
                            engineState.scanning
                                ? "SCANNING..."
                                : "SCAN VIRTUAL NETWORKS"
                        }

                    </button>

                </div>


                <!-- =====================================
                     NETWORK DISCOVERY PANEL
                ====================================== -->

                <section
                    class="fobasWifiNetworkPanel"
                    aria-label="Virtual Wi-Fi Networks"
                >

                    <div
                        class="fobasWifiPanelHeader"
                    >

                        <span
                            class="fobasWifiPanelTitle"
                        >
                            Discovered Networks
                        </span>

                        <span
                            class="fobasWifiNetworkCount"
                        >
                            ${
                                engineState.networks.length
                            }
                            NETWORKS
                        </span>

                    </div>


                    <div
                        class="fobasWifiNetworkList"
                        id="fobasWifiNetworkList"
                    >

                        ${renderNetworkTable()}

                    </div>

                </section>

            </div>

        `;


        bindWorkspaceEvents();


        /*
         * Keep Core state synchronized.
         */

        wifiState.initialized =
            true;

        wifiState.active =
            true;

        wifiState.progress =
            engineState.scanCompleted
                ? 25
                : 0;

    }


    /* =====================================================
       NETWORK SELECTION
    ====================================================== */

    function selectNetwork(
        networkId
    ) {

        const network =
            engineState.networks.find(
                function (
                    item
                ) {

                    return item.id ===
                        networkId;

                }
            );


        if (!network) {

            return false;

        }


        engineState.selectedNetworkId =
            networkId;


        renderWorkspace();


        console.log(
            "[FOBAS Wi-Fi Lab] Selected virtual network:",
            network.ssid
        );


        return true;

    }


    /* =====================================================
       NETWORK ROW EVENTS
    ====================================================== */

    function bindNetworkSelection() {

        const rows =
            document.querySelectorAll(
                "[data-wifi-network-id]"
            );


        rows.forEach(
            function (
                row
            ) {

                row.addEventListener(
                    "click",
                    function () {

                        selectNetwork(
                            row.dataset.wifiNetworkId
                        );

                    }
                );


                row.addEventListener(
                    "keydown",
                    function (
                        event
                    ) {

                        if (
                            event.key ===
                            "Enter" ||
                            event.key ===
                            " "
                        ) {

                            event.preventDefault();

                            selectNetwork(
                                row.dataset.wifiNetworkId
                            );

                        }

                    }
                );

            }
        );

    }


    /* =====================================================
       SCAN SIMULATION
    ====================================================== */

    function startVirtualScan() {

        if (
            engineState.scanning
        ) {

            return false;

        }


        engineState.scanning =
            true;

        engineState.scanCompleted =
            false;

        engineState.networks =
            [];

        engineState.selectedNetworkId =
            null;


        renderWorkspace();


        /*
         * Simulated scanning delay.
         * No real network API is used.
         */

        window.setTimeout(
            function () {

                engineState.networks =
                    VIRTUAL_WIFI_NETWORKS.map(
                        function (
                            network
                        ) {

                            return {
                                ...network
                            };

                        }
                    );


                engineState.scanning =
                    false;

                engineState.scanCompleted =
                    true;

                engineState.lastScanAt =
                    new Date().toISOString();


                const wifiState =
                    ensureLabState();


                wifiState.initialized =
                    true;

                wifiState.active =
                    true;

                wifiState.progress =
                    25;


                renderWorkspace();


                if (
                    FOBAS.ui &&
                    typeof FOBAS.ui.notify ===
                    "function"
                ) {

                    FOBAS.ui.notify(
                        "Virtual Wi-Fi scan completed. Networks discovered.",
                        "success"
                    );

                }


                console.log(
                    "[FOBAS Wi-Fi Lab] Virtual scan completed.",
                    engineState.networks
                );

            },
            1200
        );


        return true;

    }


    /* =====================================================
       WORKSPACE EVENTS
    ====================================================== */

    function bindWorkspaceEvents() {

        const scanButton =
            document.getElementById(
                "fobasWifiScanNetworksBtn"
            );


        if (scanButton) {

            scanButton.addEventListener(
                "click",
                function () {

                    startVirtualScan();

                }
            );

        }


        bindNetworkSelection();

    }


    /* =====================================================
       PATCH CORE LAB RENDERER
       
       We preserve the original renderer for
       Camera Espion and Camera Surveillance.
    ====================================================== */

    function integrateWithCore() {

        if (
            !FOBAS.labs ||
            typeof FOBAS.labs.renderLab !==
            "function"
        ) {

            console.error(
                "[FOBAS Wi-Fi Lab] Core Lab Renderer unavailable."
            );

            return false;

        }


        const originalRenderLab =
            FOBAS.labs.renderLab;


        if (
            FOBAS.labs.__wifiEngineIntegrated
        ) {

            return true;

        }


        FOBAS.labs.renderLab =
            function (
                labId
            ) {

                if (
                    labId ===
                    LAB_ID
                ) {

                    renderWorkspace();

                    return;

                }


                /*
                 * All non-Wi-Fi laboratories
                 * continue using the original
                 * FOBAS Core renderer.
                 */

                return originalRenderLab.call(
                    FOBAS.labs,
                    labId
                );

            };


        FOBAS.labs.__wifiEngineIntegrated =
            true;


        return true;

    }


    /* =====================================================
       PUBLIC WI-FI ENGINE API
    ====================================================== */

    const WiFiLabEngine = {

        version:
            ENGINE_VERSION,

        id:
            LAB_ID,

        state:
            engineState,

        networks:
            VIRTUAL_WIFI_NETWORKS,

        initialize:
            function () {

                injectStyles();

                ensureLabState();

                integrateWithCore();

                engineState.initialized =
                    true;

                return true;

            },

        render:
            function () {

                renderWorkspace();

            },

        scan:
            function () {

                return startVirtualScan();

            },

        selectNetwork:
            function (
                networkId
            ) {

                return selectNetwork(
                    networkId
                );

            },

        getSelectedNetwork:
            function () {

                if (
                    !engineState.selectedNetworkId
                ) {

                    return null;

                }

                return (
                    engineState.networks.find(
                        function (
                            network
                        ) {

                            return network.id ===
                                engineState.selectedNetworkId;

                        }
                    ) ||
                    null
                );

            },

        getNetworks:
            function () {

                return engineState.networks.map(
                    function (
                        network
                    ) {

                        return {
                            ...network
                        };

                    }
                );

            },

        getSecurityStatus:
            function (
                network
            ) {

                return getSecurityStatus(
                    network
                );

            },

        getSignalQuality:
            function (
                signal
            ) {

                return getSignalQuality(
                    signal
                );

            }

    };


    /* =====================================================
       REGISTER GLOBAL ENGINE
    ====================================================== */

    FOBAS.wifi =
        WiFiLabEngine;


    window.FOBASWiFiLabEngine =
        WiFiLabEngine;


    /* =====================================================
       INITIALIZE ENGINE
    ====================================================== */

    function initializeWiFiLabEngine() {

        if (
            !WiFiLabEngine.initialize()
        ) {

            return;

        }


        /*
         * If the user is already inside the
         * Wi-Fi laboratory when this block loads,
         * render immediately.
         */

        const state =
            FOBAS.state.getState();


        if (
            state.currentLab ===
            LAB_ID
        ) {

            renderWorkspace();

        }


        console.log(
            "FOBAS Wi-Fi Lab Engine initialized.",
            ENGINE_VERSION
        );

    }


    /* =====================================================
       SAFE INITIALIZATION
    ====================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeWiFiLabEngine,
            {
                once:true
            }
        );

    } else {

        initializeWiFiLabEngine();

    }


})();




















// =========================================================
// FOBAS ETHICAL HACKING SIMULATION
// CYBERSECURITY ACTION BRIDGE
// PHASE 3.1 — UNIVERSAL CYBER ACTION LAYER
// VERSION 1.0.0
// =========================================================
//
// PURPOSE:
//     Creates the first technical action layer for the
//     FOBAS Cybersecurity Simulation.
//
// CURRENT SCOPE:
//     - Wi-Fi Virtual Scan
//
// IMPORTANT:
//     - Does NOT modify the existing Word Universal Registry.
//     - Does NOT modify Ranise IA.
//     - Does NOT modify Campus pedagogical engines.
//     - Does NOT create pedagogical content.
//     - Does NOT perform real Wi-Fi scanning.
//     - Does NOT access real network hardware.
//     - Does NOT execute real cybersecurity attacks.
//     - Uses only the existing virtual FOBAS simulation.
//
// ARCHITECTURE:
//
//     BUTTON
//        ↓
//     ACTION ID
//        ↓
//     CYBER ACTION LAYER
//        ↓
//     WIFI LAB ENGINE
//        ↓
//     SIMULATION STATE
//        ↓
//     SIMULATION EVENT
//
// CURRENT ACTION:
//
//     wifi.scan
//
// =========================================================


(function(){

    "use strict";


    // =====================================================
    // DEPENDENCY CHECK
    // =====================================================

    if(
        !window.FOBASCybersecuritySimulation
    ){

        console.error(
            "[FOBAS Cyber Action Bridge] " +
            "FOBAS Cybersecurity Simulation Core not found."
        );

        return;

    }


    const FOBAS =
        window.FOBASCybersecuritySimulation;


    // =====================================================
    // ENGINE CONFIGURATION
    // =====================================================

    const ENGINE_VERSION =
        "1.0.0";


    const ENGINE_ID =
        "fobas-cyber-action-bridge";


    const SIMULATION_ID =
        "fobas-ethical-hacking-simulation";


    const WIFI_LAB_ID =
        "wifi";


    // =====================================================
    // ACTION DEFINITIONS
    // =====================================================

    const ACTIONS = {

        "wifi.scan":{

            actionId:
                "wifi.scan",

            simulationId:
                SIMULATION_ID,

            labId:
                WIFI_LAB_ID,

            elementId:
                "fobasWifiScanButton",

            actionType:
                "scan",

            target:
                "virtual_networks",

            requiredState:
                "wifi_ready",

            resultState:
                "wifi_scan_completed",

            validationKey:
                "WIFI_SCAN_COMPLETED",

            enabled:
                true

        }

    };


    // =====================================================
    // INTERNAL STATE
    // =====================================================

    const state = {

        initialized:
            false,

        lastActionId:
            null,

        lastActionStatus:
            null,

        lastActionAt:
            null,

        actionCount:
            0

    };


    // =====================================================
    // EVENT LISTENERS
    // =====================================================

    const listeners = {};


    // =====================================================
    // NORMALIZE
    // =====================================================

    function normalize(
        value
    ){

        return String(
            value || ""
        )
        .trim()
        .toLowerCase();

    }


    // =====================================================
    // GET ACTION DEFINITION
    // =====================================================

    function getAction(
        actionId
    ){

        const key =
            normalize(
                actionId
            );


        return ACTIONS[key] ||
            null;

    }


    // =====================================================
    // EMIT SIMULATION EVENT
    // =====================================================

    function emit(
        eventName,
        payload
    ){

        const eventListeners =
            listeners[eventName];


        if(
            Array.isArray(
                eventListeners
            )
        ){

            eventListeners
                .slice()
                .forEach(
                    function(listener){

                        try{

                            listener(
                                payload
                            );

                        }
                        catch(error){

                            console.error(
                                "[FOBAS Cyber Action Bridge] " +
                                "Event listener error:",
                                error
                            );

                        }

                    }
                );

        }


        // -------------------------------------------------
        // GLOBAL CUSTOM EVENT
        // -------------------------------------------------

        try{

            window.dispatchEvent(
                new CustomEvent(
                    "FOBAS:CyberSimulationAction",
                    {
                        detail:payload
                    }
                )
            );

        }
        catch(error){

            console.warn(
                "[FOBAS Cyber Action Bridge] " +
                "Custom event unavailable.",
                error
            );

        }

    }


    // =====================================================
    // SUBSCRIBE TO EVENT
    // =====================================================

    function on(
        eventName,
        listener
    ){

        if(
            typeof listener !==
            "function"
        ){

            return false;

        }


        if(
            !listeners[eventName]
        ){

            listeners[eventName] =
                [];

        }


        listeners[eventName]
            .push(
                listener
            );


        return true;

    }


    // =====================================================
    // CREATE ACTION EVENT
    // =====================================================

    function createActionEvent(
        action,
        status,
        extraData
    ){

        const eventData = {

            eventType:
                "simulation_action",

            eventVersion:
                "1.0.0",

            timestamp:
                new Date()
                    .toISOString(),

            simulationId:
                action.simulationId,

            labId:
                action.labId,

            actionId:
                action.actionId,

            elementId:
                action.elementId,

            actionType:
                action.actionType,

            target:
                action.target,

            requiredState:
                action.requiredState,

            resultState:
                action.resultState,

            validationKey:
                action.validationKey,

            status:
                status

        };


        if(
            extraData &&
            typeof extraData ===
            "object"
        ){

            Object.keys(
                extraData
            )
            .forEach(
                function(key){

                    eventData[key] =
                        extraData[key];

                }
            );

        }


        return eventData;

    }


    // =====================================================
    // RECORD ACTION
    // =====================================================

    function recordAction(
        action,
        status,
        extraData
    ){

        state.lastActionId =
            action.actionId;

        state.lastActionStatus =
            status;

        state.lastActionAt =
            new Date()
                .toISOString();

        state.actionCount +=
            1;


        const eventData =
            createActionEvent(
                action,
                status,
                extraData
            );


        emit(
            "action",
            eventData
        );


        return eventData;

    }


    // =====================================================
    // RESOLVE ACTION FROM ELEMENT
    // =====================================================

    function resolveActionFromElement(
        element
    ){

        if(
            !element
        ){

            return null;

        }


        let current =
            element;


        for(
            let level = 0;
            level < 8 &&
            current;
            level++
        ){

            if(
                current.getAttribute
            ){

                const dataAction =
                    normalize(
                        current.getAttribute(
                            "data-action"
                        )
                    );


                if(
                    dataAction &&
                    ACTIONS[dataAction]
                ){

                    return ACTIONS[
                        dataAction
                    ];

                }

            }


            current =
                current.parentElement;

        }


        return null;

    }


    // =====================================================
    // GET WIFI ENGINE
    // =====================================================

    function getWiFiEngine(){

        if(
            FOBAS.wifi
        ){

            return FOBAS.wifi;

        }


        if(
            window.FOBASWiFiLabEngine
        ){

            return window.FOBASWiFiLabEngine;

        }


        return null;

    }


    // =====================================================
    // EXECUTE WIFI SCAN
    // =====================================================

    function executeWiFiScan(
        action
    ){

        if(
            !action
        ){

            return Promise.resolve(
                false
            );

        }


        const wifiEngine =
            getWiFiEngine();


        if(
            !wifiEngine ||
            typeof wifiEngine.scan !==
            "function"
        ){

            console.error(
                "[FOBAS Cyber Action Bridge] " +
                "Wi-Fi Lab Engine is unavailable."
            );


            recordAction(
                action,
                "failed",
                {
                    error:
                        "wifi_engine_unavailable"
                }
            );


            return Promise.resolve(
                false
            );

        }


        // -------------------------------------------------
        // ACTION START
        // -------------------------------------------------

        recordAction(
            action,
            "started"
        );


        let scanResult;


        try{

            scanResult =
                wifiEngine.scan();

        }
        catch(error){

            recordAction(
                action,
                "failed",
                {
                    error:
                        error &&
                        error.message
                            ? error.message
                            : "scan_execution_error"
                }
            );


            console.error(
                "[FOBAS Cyber Action Bridge] " +
                "Wi-Fi scan execution error:",
                error
            );


            return Promise.resolve(
                false
            );

        }


        // -------------------------------------------------
        // HANDLE PROMISE RESULT
        // -------------------------------------------------

        if(
            scanResult &&
            typeof scanResult.then ===
            "function"
        ){

            return scanResult
                .then(
                    function(result){

                        recordAction(
                            action,
                            "completed",
                            {
                                result:
                                    result ===
                                    undefined
                                        ? true
                                        : result
                            }
                        );


                        return (
                            result ===
                            undefined
                                ? true
                                : result
                        );

                    }
                )
                .catch(
                    function(error){

                        recordAction(
                            action,
                            "failed",
                            {
                                error:
                                    error &&
                                    error.message
                                        ? error.message
                                        : "scan_failed"
                            }
                        );


                        console.error(
                            "[FOBAS Cyber Action Bridge] " +
                            "Wi-Fi scan failed:",
                            error
                        );


                        return false;

                    }
                );

        }


        // -------------------------------------------------
        // HANDLE SYNCHRONOUS RESULT
        // -------------------------------------------------

        recordAction(
            action,
            "completed",
            {
                result:
                    scanResult ===
                    undefined
                        ? true
                        : scanResult
            }
        );


        return Promise.resolve(
            scanResult ===
            undefined
                ? true
                : scanResult
        );

    }


    // =====================================================
    // EXECUTE ACTION
    // =====================================================

    function execute(
        actionId
    ){

        const action =
            getAction(
                actionId
            );


        if(
            !action
        ){

            console.warn(
                "[FOBAS Cyber Action Bridge] " +
                "Unknown action:",
                actionId
            );


            return Promise.resolve(
                false
            );

        }


        if(
            !action.enabled
        ){

            recordAction(
                action,
                "disabled"
            );


            return Promise.resolve(
                false
            );

        }


        switch(
            action.actionId
        ){

            case "wifi.scan":

                return executeWiFiScan(
                    action
                );


            default:

                console.warn(
                    "[FOBAS Cyber Action Bridge] " +
                    "No executor registered for:",
                    action.actionId
                );


                recordAction(
                    action,
                    "unsupported"
                );


                return Promise.resolve(
                    false
                );

        }

    }


    // =====================================================
    // HANDLE ACTION ELEMENT
    // =====================================================

    function handleActionElement(
        element
    ){

        const action =
            resolveActionFromElement(
                element
            );


        if(
            !action
        ){

            return false;

        }


        if(
            action.actionId !==
            "wifi.scan"
        ){

            return false;

        }


        // -------------------------------------------------
        // PROTECT AGAINST DUPLICATE EXECUTION
        // -------------------------------------------------

        if(
            element.dataset &&
            element.dataset.fobasCyberActionBound ===
            "true"
        ){

            return false;

        }


        if(
            element.dataset
        ){

            element.dataset
                .fobasCyberActionBound =
                "true";

        }


        execute(
            action.actionId
        );


        return true;

    }


    // =====================================================
    // DOCUMENT ACTION BRIDGE
    // =====================================================

    function handleDocumentClick(
        event
    ){

        if(
            !event ||
            !event.target
        ){

            return;

        }


        const action =
            resolveActionFromElement(
                event.target
            );


        if(
            !action
        ){

            return;

        }


        if(
            action.actionId !==
            "wifi.scan"
        ){

            return;

        }


        // -------------------------------------------------
        // IMPORTANT:
        // The Wi-Fi Lab Engine already owns the actual
        // scan implementation.
        //
        // This bridge only records and exposes the
        // technical action.
        //
        // We therefore DO NOT execute the scan here.
        // The original Wi-Fi engine listener continues
        // to execute the scan normally.
        // -------------------------------------------------

        recordAction(
            action,
            "requested"
        );

    }


    // =====================================================
    // OBSERVE SIMULATION ACTIONS
    // =====================================================

    function bindDocumentBridge(){

        document.addEventListener(
            "click",
            handleDocumentClick,
            true
        );

    }


    // =====================================================
    // REGISTER ACTIONS ON UI
    // =====================================================

    function annotateActionElements(){

        const elements =
            document.querySelectorAll(
                '[data-action="wifi.scan"]'
            );


        elements.forEach(
            function(element){

                if(
                    element.dataset
                ){

                    element.dataset
                        .simulationId =
                        SIMULATION_ID;

                    element.dataset
                        .labId =
                        WIFI_LAB_ID;

                    element.dataset
                        .actionId =
                        "wifi.scan";

                }

            }
        );

    }


    // =====================================================
    // PUBLIC API
    // =====================================================

    const CyberActionBridge = {

        version:
            ENGINE_VERSION,

        id:
            ENGINE_ID,

        simulationId:
            SIMULATION_ID,

        state:
            state,

        actions:
            ACTIONS,

        getAction:
            getAction,

        resolveActionFromElement:
            resolveActionFromElement,

        execute:
            execute,

        recordAction:
            recordAction,

        on:
            on,

        emit:
            emit,

        annotate:
            annotateActionElements

    };


    // =====================================================
    // REGISTER GLOBAL API
    // =====================================================

    window.FOBASCyberActionBridge =
        CyberActionBridge;


    // =====================================================
    // REGISTER INSIDE FOBAS CORE
    // =====================================================

    FOBAS.cyberActions =
        CyberActionBridge;


    // =====================================================
    // INITIALIZATION
    // =====================================================

    function initializeCyberActionBridge(){

        bindDocumentBridge();

        annotateActionElements();

        state.initialized =
            true;


        console.log(
            "[FOBAS Cyber Action Bridge] " +
            "Initialized successfully.",
            ENGINE_VERSION
        );

    }


    // =====================================================
    // DOM READY
    // =====================================================

    if(
        document.readyState ===
        "loading"
    ){

        document.addEventListener(
            "DOMContentLoaded",
            initializeCyberActionBridge,
            {
                once:true
            }
        );

    }
    else{

        initializeCyberActionBridge();

    }


})();


















/* =========================================================
   FOBAS ETHICAL HACKING SIMULATION
   WI-FI TARGET SELECTION ACTION EXTENSION
   ACTION: wifi.select_target
   VERSION 1.0.0

   PURPOSE:
   - Gives every virtual Wi-Fi network a stable targetId.
   - Converts target selection into a real simulation action.
   - Extends the existing Cyber Action Bridge.
   - Does NOT execute real Wi-Fi operations.
   - Does NOT modify Ranise or pedagogical systems.
   - Does NOT modify the Word Universal Practice Registry.
   - Does NOT duplicate the Wi-Fi scan operation.
========================================================= */

(function () {

    "use strict";

    /* =====================================================
       DEPENDENCY VALIDATION
    ===================================================== */

    if (!window.FOBASCybersecuritySimulation) {

        console.error(
            "[FOBAS Wi-Fi Target] Core Simulation Engine not found."
        );

        return;
    }

    if (!window.FOBASCyberActionBridge) {

        console.error(
            "[FOBAS Wi-Fi Target] Cyber Action Bridge not found."
        );

        return;
    }

    const FOBAS = window.FOBASCybersecuritySimulation;
    const CyberActionBridge = window.FOBASCyberActionBridge;


    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const ENGINE_VERSION = "1.0.0";

    const ACTION_ID = "wifi.select_target";

    const SIMULATION_ID =
        "fobas-ethical-hacking-simulation";

    const LAB_ID = "wifi";


    /* =====================================================
       INTERNAL STATE
    ===================================================== */

    const targetState = {

        initialized: false,

        selectedTargetId: null,

        selectedNetworkId: null,

        lastSelectionAt: null

    };


    /* =====================================================
       STABLE TARGET ID GENERATOR
    ===================================================== */

    function createStableTargetId(network, index) {

        if (!network) {

            return "wifi-target-unknown";

        }

        /*
         * Existing ID is preserved if one already exists.
         */

        if (network.targetId) {

            return String(network.targetId);

        }

        /*
         * Stable technical identifier.
         *
         * Example:
         * wifi-target-001
         * wifi-target-002
         */

        return "wifi-target-" +
            String(index + 1).padStart(3, "0");
    }


    /* =====================================================
       TARGET METADATA ENRICHMENT
    ===================================================== */

    function enrichWiFiTargets() {

        if (!FOBAS.wifi) {

            console.error(
                "[FOBAS Wi-Fi Target] Wi-Fi Lab Engine unavailable."
            );

            return false;
        }

        if (!Array.isArray(FOBAS.wifi.networks)) {

            console.error(
                "[FOBAS Wi-Fi Target] Wi-Fi network database unavailable."
            );

            return false;
        }

        FOBAS.wifi.networks.forEach(function (network, index) {

            if (!network) {
                return;
            }

            /*
             * Add stable targetId without replacing
             * the existing network ID.
             */

            if (!network.targetId) {

                network.targetId =
                    createStableTargetId(network, index);
            }

        });

        return true;
    }


    /* =====================================================
       FIND TARGET BY NETWORK ID
    ===================================================== */

    function findTargetByNetworkId(networkId) {

        if (!FOBAS.wifi) {
            return null;
        }

        const networks = FOBAS.wifi.networks;

        if (!Array.isArray(networks)) {
            return null;
        }

        return networks.find(function (network) {

            return network &&
                   String(network.id) === String(networkId);

        }) || null;
    }


    /* =====================================================
       FIND TARGET BY TARGET ID
    ===================================================== */

    function findTargetByTargetId(targetId) {

        if (!FOBAS.wifi) {
            return null;
        }

        const networks = FOBAS.wifi.networks;

        if (!Array.isArray(networks)) {
            return null;
        }

        return networks.find(function (network) {

            return network &&
                   String(network.targetId) === String(targetId);

        }) || null;
    }


    /* =====================================================
       SECURITY STATUS RESOLUTION
    ===================================================== */

    function resolveSecurityStatus(network) {

        if (!network) {

            return "unknown";

        }

        if (
            typeof FOBAS.wifi.getSecurityStatus ===
            "function"
        ) {

            return FOBAS.wifi.getSecurityStatus(network);

        }

        const encryption =
            String(network.encryption || "").toUpperCase();

        if (
            encryption === "OPEN" ||
            encryption === "WEP"
        ) {

            return "vulnerable";

        }

        if (encryption === "WPA") {

            return "warning";

        }

        return "secure";
    }


    /* =====================================================
       ACTION EVENT CREATION
    ===================================================== */

    function createTargetSelectionEvent(network) {

        if (!network) {

            return null;

        }

        return {

            simulationId: SIMULATION_ID,

            labId: LAB_ID,

            actionId: ACTION_ID,

            actionType: "select_target",

            status: "completed",

            timestamp: new Date().toISOString(),

            targetId:
                String(network.targetId || ""),

            targetNetworkId:
                network.id !== undefined &&
                network.id !== null
                    ? String(network.id)
                    : null,

            targetSSID:
                network.ssid ||
                network.name ||
                "",

            BSSID:
                network.bssid ||
                "",

            channel:
                network.channel !== undefined
                    ? network.channel
                    : null,

            encryption:
                network.encryption ||
                network.security ||
                "",

            signal:
                network.signal !== undefined
                    ? network.signal
                    : null,

            securityStatus:
                resolveSecurityStatus(network),

            resultState:
                "wifi_target_selected",

            validationKey:
                "WIFI_TARGET_SELECTED"

        };
    }


    /* =====================================================
       RECORD TARGET SELECTION
    ===================================================== */

    function recordTargetSelection(network) {

        if (!network) {

            return null;

        }

        const event =
            createTargetSelectionEvent(network);

        if (!event) {

            return null;

        }

        targetState.selectedTargetId =
            event.targetId;

        targetState.selectedNetworkId =
            event.targetNetworkId;

        targetState.lastSelectionAt =
            event.timestamp;


        /* =================================================
           RECORD THROUGH EXISTING CYBER ACTION BRIDGE
        ================================================= */

        if (
            CyberActionBridge &&
            typeof CyberActionBridge.recordAction ===
            "function"
        ) {

            CyberActionBridge.recordAction(event);

        }


        /* =================================================
           EMIT STANDARD SIMULATION EVENT
        ================================================= */

        window.dispatchEvent(
            new CustomEvent(
                "FOBAS:CyberSimulationAction",
                {
                    detail: event
                }
            )
        );


        /* =================================================
           EMIT SPECIFIC TARGET EVENT
        ================================================= */

        window.dispatchEvent(
            new CustomEvent(
                "FOBAS:WiFiTargetSelected",
                {
                    detail: event
                }
            )
        );


        return event;
    }


    /* =====================================================
       PATCH EXISTING WIFI SELECT FUNCTION
       
       IMPORTANT:
       The Wi-Fi Lab Engine remains the OWNER of the
       actual selection operation.

       This extension only observes the completed
       selection and converts it into a standardized
       cybersecurity action.
    ===================================================== */

    function integrateSelectionAction() {

        if (!FOBAS.wifi) {

            console.error(
                "[FOBAS Wi-Fi Target] Wi-Fi engine unavailable."
            );

            return false;
        }

        if (
            FOBAS.wifi.__wifiTargetSelectionIntegrated
        ) {

            return true;

        }


        if (
            typeof FOBAS.wifi.selectNetwork !==
            "function"
        ) {

            console.error(
                "[FOBAS Wi-Fi Target] selectNetwork() not available."
            );

            return false;

        }


        const originalSelectNetwork =
            FOBAS.wifi.selectNetwork;


        FOBAS.wifi.selectNetwork =
            function (networkId) {

                /*
                 * Let the original Wi-Fi engine perform
                 * the real simulation selection.
                 */

                const result =
                    originalSelectNetwork.call(
                        FOBAS.wifi,
                        networkId
                    );


                /*
                 * Retrieve the network after selection.
                 */

                let selectedNetwork = null;


                if (
                    typeof FOBAS.wifi.getSelectedNetwork ===
                    "function"
                ) {

                    selectedNetwork =
                        FOBAS.wifi.getSelectedNetwork();

                }


                /*
                 * Fallback if getSelectedNetwork()
                 * is unavailable.
                 */

                if (!selectedNetwork) {

                    selectedNetwork =
                        findTargetByNetworkId(networkId);

                }


                /*
                 * Ensure the selected target has
                 * a stable targetId.
                 */

                if (
                    selectedNetwork &&
                    !selectedNetwork.targetId
                ) {

                    const networks =
                        FOBAS.wifi.networks || [];

                    const index =
                        networks.indexOf(
                            selectedNetwork
                        );

                    selectedNetwork.targetId =
                        createStableTargetId(
                            selectedNetwork,
                            index >= 0 ? index : 0
                        );

                }


                /*
                 * Record the standardized action.
                 */

                if (selectedNetwork) {

                    recordTargetSelection(
                        selectedNetwork
                    );

                }


                return result;

            };


        /*
         * Integration marker prevents
         * duplicate wrapping.
         */

        FOBAS.wifi.__wifiTargetSelectionIntegrated =
            true;


        return true;
    }


    /* =====================================================
       REGISTER ACTION INSIDE EXISTING CYBER ACTION LAYER
    ===================================================== */

    function registerAction() {

        if (
            !CyberActionBridge ||
            !CyberActionBridge.actions
        ) {

            console.error(
                "[FOBAS Wi-Fi Target] Existing Cyber Action Registry unavailable."
            );

            return false;
        }


        /*
         * Do not replace the existing action registry.
         *
         * Extend it with one new action only.
         */

        CyberActionBridge.actions[ACTION_ID] = {

            actionId:
                ACTION_ID,

            simulationId:
                SIMULATION_ID,

            labId:
                LAB_ID,

            elementId:
                null,

            actionType:
                "select_target",

            target:
                "virtual_wifi_network",

            requiredState:
                "wifi_scan_completed",

            resultState:
                "wifi_target_selected",

            validationKey:
                "WIFI_TARGET_SELECTED",

            enabled:
                true

        };


        return true;
    }


    /* =====================================================
       TARGET LOOKUP API
    ===================================================== */

    function getSelectedTarget() {

        if (
            !targetState.selectedTargetId
        ) {

            return null;

        }

        return findTargetByTargetId(
            targetState.selectedTargetId
        );
    }


    /* =====================================================
       GET TARGET BY ID
    ===================================================== */

    function getTarget(targetId) {

        return findTargetByTargetId(
            targetId
        );

    }


    /* =====================================================
       GET ALL TARGETS
    ===================================================== */

    function getTargets() {

        if (
            !FOBAS.wifi ||
            !Array.isArray(FOBAS.wifi.networks)
        ) {

            return [];

        }

        return FOBAS.wifi.networks.map(
            function (network, index) {

                if (
                    network &&
                    !network.targetId
                ) {

                    network.targetId =
                        createStableTargetId(
                            network,
                            index
                        );

                }

                return network;

            }
        );

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    const WiFiTargetSelectionExtension = {

        version:
            ENGINE_VERSION,

        id:
            ACTION_ID,

        state:
            targetState,

        initialize:
            function () {

                if (targetState.initialized) {

                    return true;

                }

                if (!FOBAS.wifi) {

                    return false;

                }

                enrichWiFiTargets();

                registerAction();

                if (!integrateSelectionAction()) {

                    return false;

                }

                targetState.initialized =
                    true;

                console.log(
                    "[FOBAS Wi-Fi Target] " +
                    "Target Selection Action initialized successfully. " +
                    ENGINE_VERSION
                );

                return true;
            },

        getSelectedTarget:
            getSelectedTarget,

        getTarget:
            getTarget,

        getTargets:
            getTargets,

        findTargetByNetworkId:
            findTargetByNetworkId,

        recordSelection:
            recordTargetSelection

    };


    /* =====================================================
       PUBLIC GLOBAL API
    ===================================================== */

    window.FOBASWiFiTargetSelection =
        WiFiTargetSelectionExtension;


    if (FOBAS.wifi) {

        FOBAS.wifi.targetSelection =
            WiFiTargetSelectionExtension;

    }


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeWiFiTargetSelection() {

        WiFiTargetSelectionExtension.initialize();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeWiFiTargetSelection,
            {
                once: true
            }
        );

    } else {

        initializeWiFiTargetSelection();

    }

})();














/* =========================================================
   FOBAS ETHICAL HACKING SIMULATION
   WI-FI TARGET ANALYSIS ACTION EXTENSION
   ACTION: wifi.analyze_target
   VERSION 1.0.0

   PURPOSE:
   - Analyzes the already selected virtual Wi-Fi target.
   - Reads virtual target security metadata.
   - Produces a virtual security analysis result.
   - Extends the existing Cyber Action Bridge.
   - Does NOT execute real Wi-Fi operations.
   - Does NOT perform scanning.
   - Does NOT perform packet capture.
   - Does NOT perform authentication attacks.
   - Does NOT modify the Wi-Fi Core Engine.
   - Does NOT modify wifi.select_target.
   - Does NOT modify Ranise or pedagogical systems.
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       DEPENDENCY VALIDATION
    ===================================================== */

    if (!window.FOBASCybersecuritySimulation) {

        console.error(
            "[FOBAS Wi-Fi Analysis] Core Simulation Engine not found."
        );

        return;
    }


    if (!window.FOBASCyberActionBridge) {

        console.error(
            "[FOBAS Wi-Fi Analysis] Cyber Action Bridge not found."
        );

        return;
    }


    if (!window.FOBASWiFiTargetSelection) {

        console.error(
            "[FOBAS Wi-Fi Analysis] Wi-Fi Target Selection Extension not found."
        );

        return;
    }


    const FOBAS =
        window.FOBASCybersecuritySimulation;

    const CyberActionBridge =
        window.FOBASCyberActionBridge;

    const WiFiTargetSelection =
        window.FOBASWiFiTargetSelection;


    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const ENGINE_VERSION =
        "1.0.0";

    const ACTION_ID =
        "wifi.analyze_target";

    const SIMULATION_ID =
        "fobas-ethical-hacking-simulation";

    const LAB_ID =
        "wifi";


    /* =====================================================
       INTERNAL STATE
    ===================================================== */

    const analysisState = {

        initialized:
            false,

        analyzedTargetId:
            null,

        analyzedNetworkId:
            null,

        lastAnalysisAt:
            null,

        lastResult:
            null

    };


    /* =====================================================
       TARGET RESOLUTION
    ===================================================== */

    function resolveSelectedTarget() {

        if (
            !WiFiTargetSelection ||
            typeof WiFiTargetSelection.getSelectedTarget !==
                "function"
        ) {

            return null;

        }

        return WiFiTargetSelection.getSelectedTarget();

    }


    /* =====================================================
       SECURITY STATUS RESOLUTION
    ===================================================== */

    function resolveSecurityStatus(network) {

        if (!network) {

            return "unknown";

        }


        if (
            FOBAS.wifi &&
            typeof FOBAS.wifi.getSecurityStatus ===
                "function"
        ) {

            return FOBAS.wifi.getSecurityStatus(
                network
            );

        }


        const encryption =
            String(
                network.encryption ||
                network.security ||
                ""
            ).toUpperCase();


        if (
            encryption === "OPEN" ||
            encryption === "WEP"
        ) {

            return "vulnerable";

        }


        if (encryption === "WPA") {

            return "warning";

        }


        if (
            encryption === "WPA2" ||
            encryption === "WPA3"
        ) {

            return "secure";

        }


        return "unknown";

    }


    /* =====================================================
       SECURITY LEVEL RESOLUTION
    ===================================================== */

    function resolveSecurityLevel(
        securityStatus
    ) {

        switch (
            String(
                securityStatus ||
                ""
            ).toLowerCase()
        ) {

            case "vulnerable":

                return "élevé";

            case "warning":

                return "moyen";

            case "secure":

                return "faible";

            default:

                return "inconnu";

        }

    }


    /* =====================================================
       ENCRYPTION NORMALIZATION
    ===================================================== */

    function resolveEncryption(network) {

        if (!network) {

            return "UNKNOWN";

        }

        return String(
            network.encryption ||
            network.security ||
            "UNKNOWN"
        );

    }


    /* =====================================================
       SIGNAL ANALYSIS
    ===================================================== */

    function analyzeSignal(signal) {

        if (
            signal === null ||
            signal === undefined ||
            signal === ""
        ) {

            return {

                value:
                    null,

                quality:
                    "inconnue"

            };

        }


        const numericSignal =
            Number(signal);


        if (
            Number.isNaN(numericSignal)
        ) {

            return {

                value:
                    signal,

                quality:
                    "inconnue"

            };

        }


        /*
         * Virtual signal interpretation only.
         *
         * No radio hardware is accessed.
         */

        if (numericSignal >= -50) {

            return {

                value:
                    numericSignal,

                quality:
                    "excellente"

            };

        }


        if (numericSignal >= -65) {

            return {

                value:
                    numericSignal,

                quality:
                    "bonne"

            };

        }


        if (numericSignal >= -75) {

            return {

                value:
                    numericSignal,

                quality:
                    "moyenne"

            };

        }


        return {

            value:
                numericSignal,

            quality:
                "faible"

        };

    }


    /* =====================================================
       VIRTUAL SECURITY FINDINGS
    ===================================================== */

    function generateSecurityFindings(
        network,
        securityStatus
    ) {

        const findings = [];

        const encryption =
            resolveEncryption(network)
                .toUpperCase();


        /*
         * OPEN NETWORK
         */

        if (encryption === "OPEN") {

            findings.push({

                code:
                    "OPEN_NETWORK",

                severity:
                    "high",

                title:
                    "Réseau ouvert",

                description:
                    "Le réseau virtuel ne présente aucun chiffrement."

            });

        }


        /*
         * WEP
         */

        if (encryption === "WEP") {

            findings.push({

                code:
                    "WEAK_ENCRYPTION",

                severity:
                    "high",

                title:
                    "Chiffrement faible",

                description:
                    "Le réseau virtuel utilise un mécanisme de chiffrement considéré comme faible."

            });

        }


        /*
         * WPA
         */

        if (encryption === "WPA") {

            findings.push({

                code:
                    "LEGACY_WPA",

                severity:
                    "medium",

                title:
                    "Protection ancienne",

                description:
                    "Le réseau virtuel utilise WPA, une protection plus ancienne que les mécanismes modernes."

            });

        }


        /*
         * WPA2
         */

        if (encryption === "WPA2") {

            findings.push({

                code:
                    "WPA2_CONFIGURATION",

                severity:
                    "low",

                title:
                    "Protection WPA2",

                description:
                    "Le réseau virtuel utilise WPA2."

            });

        }


        /*
         * WPA3
         */

        if (encryption === "WPA3") {

            findings.push({

                code:
                    "WPA3_CONFIGURATION",

                severity:
                    "info",

                title:
                    "Protection WPA3",

                description:
                    "Le réseau virtuel utilise WPA3."

            });

        }


        /*
         * UNKNOWN ENCRYPTION
         */

        if (
            encryption === "UNKNOWN" ||
            encryption === ""
        ) {

            findings.push({

                code:
                    "UNKNOWN_ENCRYPTION",

                severity:
                    "medium",

                title:
                    "Chiffrement non identifié",

                description:
                    "Le mécanisme de protection du réseau virtuel n'a pas pu être déterminé."

            });

        }


        /*
         * UNKNOWN SECURITY STATUS
         */

        if (
            String(
                securityStatus ||
                ""
            ).toLowerCase() ===
            "unknown"
        ) {

            findings.push({

                code:
                    "UNKNOWN_SECURITY_STATUS",

                severity:
                    "medium",

                title:
                    "État de sécurité inconnu",

                description:
                    "L'état de sécurité du réseau virtuel nécessite une vérification supplémentaire."

            });

        }


        return findings;

    }


    /* =====================================================
       CREATE VIRTUAL ANALYSIS REPORT
    ===================================================== */

    function createAnalysisReport(
        network
    ) {

        if (!network) {

            return null;

        }


        const securityStatus =
            resolveSecurityStatus(
                network
            );


        const signalAnalysis =
            analyzeSignal(
                network.signal
            );


        const findings =
            generateSecurityFindings(
                network,
                securityStatus
            );


        return {

            analysisType:
                "virtual_wifi_security_analysis",

            analysisVersion:
                ENGINE_VERSION,

            targetId:
                String(
                    network.targetId ||
                    ""
                ),

            networkId:
                network.id !== undefined &&
                network.id !== null
                    ? String(network.id)
                    : null,

            SSID:
                network.ssid ||
                network.name ||
                "",

            BSSID:
                network.bssid ||
                "",

            channel:
                network.channel !== undefined
                    ? network.channel
                    : null,

            encryption:
                resolveEncryption(
                    network
                ),

            signal:
                signalAnalysis.value,

            signalQuality:
                signalAnalysis.quality,

            securityStatus:
                securityStatus,

            securityLevel:
                resolveSecurityLevel(
                    securityStatus
                ),

            findings:
                findings,

            findingCount:
                findings.length,

            virtual:
                true,

            realWiFiOperation:
                false,

            packetCapture:
                false,

            authenticationAttempt:
                false,

            connectionAttempt:
                false,

            generatedAt:
                new Date().toISOString()

        };

    }


    /* =====================================================
       CREATE ANALYSIS ACTION EVENT
    ===================================================== */

    function createAnalysisEvent(
        network,
        report
    ) {

        if (
            !network ||
            !report
        ) {

            return null;

        }


        return {

            simulationId:
                SIMULATION_ID,

            labId:
                LAB_ID,

            actionId:
                ACTION_ID,

            actionType:
                "analyze_target",

            status:
                "completed",

            timestamp:
                report.generatedAt,

            targetId:
                String(
                    network.targetId ||
                    ""
                ),

            targetNetworkId:
                network.id !== undefined &&
                network.id !== null
                    ? String(network.id)
                    : null,

            targetSSID:
                network.ssid ||
                network.name ||
                "",

            BSSID:
                network.bssid ||
                "",

            channel:
                network.channel !== undefined
                    ? network.channel
                    : null,

            encryption:
                resolveEncryption(
                    network
                ),

            signal:
                network.signal !== undefined
                    ? network.signal
                    : null,

            securityStatus:
                report.securityStatus,

            securityLevel:
                report.securityLevel,

            analysis:
                report,

            resultState:
                "wifi_target_analyzed",

            validationKey:
                "WIFI_TARGET_ANALYZED"

        };

    }


    /* =====================================================
       RECORD ANALYSIS ACTION
    ===================================================== */

    function recordAnalysis(
        network,
        report
    ) {

        if (
            !network ||
            !report
        ) {

            return null;

        }


        const event =
            createAnalysisEvent(
                network,
                report
            );


        if (!event) {

            return null;

        }


        analysisState.analyzedTargetId =
            event.targetId;


        analysisState.analyzedNetworkId =
            event.targetNetworkId;


        analysisState.lastAnalysisAt =
            event.timestamp;


        analysisState.lastResult =
            event;


        /* =================================================
           RECORD THROUGH EXISTING CYBER ACTION BRIDGE
        ================================================= */

        if (
            CyberActionBridge &&
            typeof CyberActionBridge.recordAction ===
                "function"
        ) {

            CyberActionBridge.recordAction(
                event
            );

        }


        /* =================================================
           EMIT STANDARD SIMULATION EVENT
        ================================================= */

        window.dispatchEvent(
            new CustomEvent(
                "FOBAS:CyberSimulationAction",
                {
                    detail:
                        event
                }
            )
        );


        /* =================================================
           EMIT SPECIFIC WI-FI ANALYSIS EVENT
        ================================================= */

        window.dispatchEvent(
            new CustomEvent(
                "FOBAS:WiFiTargetAnalyzed",
                {
                    detail:
                        event
                }
            )
        );


        return event;

    }


    /* =====================================================
       ANALYZE SELECTED TARGET
    ===================================================== */

    function analyzeSelectedTarget() {

        /*
         * The action requires a target that has already
         * been selected by wifi.select_target.
         */

        const selectedTarget =
            resolveSelectedTarget();


        if (!selectedTarget) {

            console.warn(
                "[FOBAS Wi-Fi Analysis] " +
                "Aucun target Wi-Fi virtuel sélectionné."
            );

            return null;

        }


        const report =
            createAnalysisReport(
                selectedTarget
            );


        if (!report) {

            return null;

        }


        return recordAnalysis(
            selectedTarget,
            report
        );

    }


    /* =====================================================
       ANALYZE TARGET BY TARGET ID
    ===================================================== */

    function analyzeTarget(
        targetId
    ) {

        if (
            targetId === undefined ||
            targetId === null ||
            targetId === ""
        ) {

            return null;

        }


        if (
            !WiFiTargetSelection ||
            typeof WiFiTargetSelection.getTarget !==
                "function"
        ) {

            return null;

        }


        const target =
            WiFiTargetSelection.getTarget(
                targetId
            );


        if (!target) {

            console.warn(
                "[FOBAS Wi-Fi Analysis] " +
                "Target Wi-Fi virtuel introuvable."
            );

            return null;

        }


        /*
         * The target must be the target already selected
         * by wifi.select_target.
         */

        const selectedTarget =
            resolveSelectedTarget();


        if (!selectedTarget) {

            console.warn(
                "[FOBAS Wi-Fi Analysis] " +
                "Aucun target sélectionné."
            );

            return null;

        }


        if (
            String(
                selectedTarget.targetId
            ) !==
            String(
                target.targetId
            )
        ) {

            console.warn(
                "[FOBAS Wi-Fi Analysis] " +
                "Le target demandé n'est pas le target actuellement sélectionné."
            );

            return null;

        }


        const report =
            createAnalysisReport(
                target
            );


        if (!report) {

            return null;

        }


        return recordAnalysis(
            target,
            report
        );

    }


    /* =====================================================
       REGISTER ACTION INSIDE EXISTING CYBER ACTION LAYER
    ===================================================== */

    function registerAction() {

        if (
            !CyberActionBridge ||
            !CyberActionBridge.actions
        ) {

            console.error(
                "[FOBAS Wi-Fi Analysis] " +
                "Existing Cyber Action Registry unavailable."
            );

            return false;

        }


        /*
         * Extend the existing registry.
         *
         * No existing action is replaced.
         */

        CyberActionBridge.actions[ACTION_ID] = {

            actionId:
                ACTION_ID,

            simulationId:
                SIMULATION_ID,

            labId:
                LAB_ID,

            elementId:
                null,

            actionType:
                "analyze_target",

            target:
                "virtual_wifi_network",

            requiredState:
                "wifi_target_selected",

            resultState:
                "wifi_target_analyzed",

            validationKey:
                "WIFI_TARGET_ANALYZED",

            enabled:
                true

        };


        return true;

    }


    /* =====================================================
       GET LAST ANALYSIS
    ===================================================== */

    function getLastAnalysis() {

        return analysisState.lastResult;

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    const WiFiTargetAnalysisExtension = {

        version:
            ENGINE_VERSION,

        id:
            ACTION_ID,

        state:
            analysisState,

        initialize:
            function () {

                if (
                    analysisState.initialized
                ) {

                    return true;

                }


                if (!FOBAS.wifi) {

                    console.error(
                        "[FOBAS Wi-Fi Analysis] " +
                        "Wi-Fi Lab Engine unavailable."
                    );

                    return false;

                }


                if (
                    !WiFiTargetSelection
                ) {

                    return false;

                }


                /*
                 * Register only the new analysis action.
                 */

                if (
                    !registerAction()
                ) {

                    return false;

                }


                analysisState.initialized =
                    true;


                console.log(
                    "[FOBAS Wi-Fi Analysis] " +
                    "Target Analysis Action initialized successfully. " +
                    ENGINE_VERSION
                );


                return true;

            },


        analyzeSelectedTarget:
            analyzeSelectedTarget,


        analyzeTarget:
            analyzeTarget,


        getLastAnalysis:
            getLastAnalysis

    };


    /* =====================================================
       PUBLIC GLOBAL API
    ===================================================== */

    window.FOBASWiFiTargetAnalysis =
        WiFiTargetAnalysisExtension;


    if (FOBAS.wifi) {

        FOBAS.wifi.targetAnalysis =
            WiFiTargetAnalysisExtension;

    }


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeWiFiTargetAnalysis() {

        WiFiTargetAnalysisExtension.initialize();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeWiFiTargetAnalysis,
            {
                once:
                    true
            }
        );

    } else {

        initializeWiFiTargetAnalysis();

    }

})();























/* =========================================================
   FOBAS SIMULATION DE PIRATAGE ÉTHIQUE
   EXTENSION D'ÉVALUATION DE LA SÉCURITÉ WI-FI
   ACTION : wifi.assess_security
   VERSION 1.0.0

   OBJECTIF :
   - Évaluer le résultat de l'analyse du target Wi-Fi virtuel.
   - Utiliser uniquement les données produites par
     wifi.analyze_target.
   - Produire une évaluation de sécurité entièrement virtuelle.
   - Étendre le Cyber Action Bridge existant.
   - Ne réaliser aucune opération Wi-Fi réelle.
   - Ne pas effectuer de scan.
   - Ne pas effectuer de capture de paquets.
   - Ne pas effectuer de tentative d'authentification.
   - Ne pas effectuer de tentative de connexion.
   - Ne pas modifier le Core Engine.
   - Ne pas modifier wifi.select_target.
   - Ne pas modifier wifi.analyze_target.
   - Ne pas modifier les systèmes pédagogiques de Ranise.
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       VALIDATION DES DÉPENDANCES
    ===================================================== */

    if (!window.FOBASCybersecuritySimulation) {

        console.error(
            "[FOBAS Wi-Fi Security] " +
            "Moteur principal de simulation introuvable."
        );

        return;
    }


    if (!window.FOBASCyberActionBridge) {

        console.error(
            "[FOBAS Wi-Fi Security] " +
            "Cyber Action Bridge introuvable."
        );

        return;
    }


    if (!window.FOBASWiFiTargetAnalysis) {

        console.error(
            "[FOBAS Wi-Fi Security] " +
            "Extension d'analyse du target Wi-Fi introuvable."
        );

        return;
    }


    const FOBAS =
        window.FOBASCybersecuritySimulation;

    const CyberActionBridge =
        window.FOBASCyberActionBridge;

    const WiFiTargetAnalysis =
        window.FOBASWiFiTargetAnalysis;


    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const ENGINE_VERSION =
        "1.0.0";

    const ACTION_ID =
        "wifi.assess_security";

    const SIMULATION_ID =
        "fobas-ethical-hacking-simulation";

    const LAB_ID =
        "wifi";


    /* =====================================================
       ÉTAT INTERNE
    ===================================================== */

    const securityAssessmentState = {

        initialized:
            false,

        assessedTargetId:
            null,

        assessedNetworkId:
            null,

        lastAssessmentAt:
            null,

        lastResult:
            null

    };


    /* =====================================================
       RÉSOLUTION DE LA DERNIÈRE ANALYSE
    ===================================================== */

    function resolveLastAnalysis() {

        if (
            !WiFiTargetAnalysis ||
            typeof WiFiTargetAnalysis.getLastAnalysis !==
                "function"
        ) {

            return null;

        }


        const lastAnalysis =
            WiFiTargetAnalysis.getLastAnalysis();


        if (!lastAnalysis) {

            return null;

        }


        /*
         * Une évaluation n'est autorisée que si l'action
         * précédente est bien wifi.analyze_target.
         */

        if (
            String(
                lastAnalysis.actionId ||
                ""
            ) !==
            "wifi.analyze_target"
        ) {

            return null;

        }


        /*
         * Vérification supplémentaire de l'état produit
         * par l'analyse précédente.
         */

        if (
            String(
                lastAnalysis.resultState ||
                ""
            ) !==
            "wifi_target_analyzed"
        ) {

            return null;

        }


        return lastAnalysis;

    }


    /* =====================================================
       RÉSOLUTION DE L'ÉTAT DE SÉCURITÉ
    ===================================================== */

    function resolveSecurityStatus(
        analysis
    ) {

        if (
            !analysis
        ) {

            return "unknown";

        }


        return String(
            analysis.securityStatus ||
            "unknown"
        ).toLowerCase();

    }


    /* =====================================================
       NORMALISATION DU NIVEAU DE SÉCURITÉ
    ===================================================== */

    function resolveSecurityLevel(
        analysis
    ) {

        if (
            !analysis
        ) {

            return "inconnu";

        }


        const level =
            String(
                analysis.securityLevel ||
                ""
            ).toLowerCase();


        if (level === "élevé") {

            return "élevé";

        }


        if (level === "moyen") {

            return "moyen";

        }


        if (level === "faible") {

            return "faible";

        }


        return "inconnu";

    }


    /* =====================================================
       RÉSOLUTION DU NIVEAU DE RISQUE
    ===================================================== */

    function resolveRiskLevel(
        analysis
    ) {

        const securityStatus =
            resolveSecurityStatus(
                analysis
            );


        const encryption =
            String(
                analysis.encryption ||
                ""
            ).toUpperCase();


        /*
         * Réseau ouvert :
         * niveau de risque élevé.
         */

        if (
            encryption === "OPEN" ||
            securityStatus === "vulnerable"
        ) {

            return {

                code:
                    "HIGH",

                label:
                    "Risque élevé",

                score:
                    90

            };

        }


        /*
         * WEP :
         * niveau de risque élevé.
         */

        if (
            encryption === "WEP"
        ) {

            return {

                code:
                    "HIGH",

                label:
                    "Risque élevé",

                score:
                    85

            };

        }


        /*
         * WPA :
         * niveau de risque moyen.
         */

        if (
            encryption === "WPA" ||
            securityStatus === "warning"
        ) {

            return {

                code:
                    "MEDIUM",

                label:
                    "Risque moyen",

                score:
                    60

            };

        }


        /*
         * WPA2 :
         * niveau de risque faible dans le cadre
         * de cette simulation pédagogique.
         */

        if (
            encryption === "WPA2"
        ) {

            return {

                code:
                    "LOW",

                label:
                    "Risque faible",

                score:
                    25

            };

        }


        /*
         * WPA3 :
         * niveau de risque faible.
         */

        if (
            encryption === "WPA3"
        ) {

            return {

                code:
                    "LOW",

                label:
                    "Risque faible",

                score:
                    15

            };

        }


        /*
         * Données insuffisantes.
         */

        return {

            code:
                "UNKNOWN",

            label:
                "Risque indéterminé",

            score:
                null

        };

    }


    /* =====================================================
       RÉSOLUTION DU NIVEAU DE PROTECTION
    ===================================================== */

    function resolveProtectionLevel(
        analysis
    ) {

        const encryption =
            String(
                analysis &&
                analysis.encryption
                    ? analysis.encryption
                    : ""
            ).toUpperCase();


        switch (encryption) {

            case "OPEN":

                return "Aucune protection";

            case "WEP":

                return "Protection faible";

            case "WPA":

                return "Protection ancienne";

            case "WPA2":

                return "Protection moderne";

            case "WPA3":

                return "Protection renforcée";

            default:

                return "Protection inconnue";

        }

    }


    /* =====================================================
       RECOMMANDATIONS DE SÉCURITÉ
    ===================================================== */

    function generateRecommendations(
        analysis,
        risk
    ) {

        const recommendations = [];


        const encryption =
            String(
                analysis &&
                analysis.encryption
                    ? analysis.encryption
                    : ""
            ).toUpperCase();


        /* -------------------------------------------------
           RÉSEAU OUVERT
        ------------------------------------------------- */

        if (
            encryption === "OPEN"
        ) {

            recommendations.push(
                "Activer un mécanisme de chiffrement Wi-Fi moderne."
            );

            recommendations.push(
                "Éviter l'utilisation d'un réseau sans protection pour les communications sensibles."
            );

        }


        /* -------------------------------------------------
           WEP
        ------------------------------------------------- */

        else if (
            encryption === "WEP"
        ) {

            recommendations.push(
                "Remplacer WEP par une protection Wi-Fi moderne."
            );

            recommendations.push(
                "Privilégier WPA2 ou WPA3 selon les capacités du réseau."
            );

        }


        /* -------------------------------------------------
           WPA
        ------------------------------------------------- */

        else if (
            encryption === "WPA"
        ) {

            recommendations.push(
                "Migrer vers une protection Wi-Fi plus moderne."
            );

            recommendations.push(
                "Privilégier WPA2 ou WPA3 lorsque cela est possible."
            );

        }


        /* -------------------------------------------------
           WPA2
        ------------------------------------------------- */

        else if (
            encryption === "WPA2"
        ) {

            recommendations.push(
                "Maintenir une configuration WPA2 correctement protégée."
            );

            recommendations.push(
                "Utiliser un mot de passe robuste et unique."
            );

        }


        /* -------------------------------------------------
           WPA3
        ------------------------------------------------- */

        else if (
            encryption === "WPA3"
        ) {

            recommendations.push(
                "Maintenir la configuration WPA3 à jour."
            );

            recommendations.push(
                "Conserver une politique de mot de passe robuste."
            );

        }


        /* -------------------------------------------------
           PROTECTION INCONNUE
        ------------------------------------------------- */

        else {

            recommendations.push(
                "Identifier précisément le mécanisme de protection du réseau."
            );

            recommendations.push(
                "Effectuer une vérification de configuration dans un environnement autorisé."
            );

        }


        /* -------------------------------------------------
           RECOMMANDATION GÉNÉRALE
        ------------------------------------------------- */

        if (
            risk &&
            risk.code === "HIGH"
        ) {

            recommendations.push(
                "Prioriser la correction des faiblesses identifiées dans cet environnement virtuel."
            );

        }


        return recommendations;

    }


    /* =====================================================
       CRÉATION DU RAPPORT D'ÉVALUATION
    ===================================================== */

    function createSecurityAssessment(
        analysis
    ) {

        if (
            !analysis
        ) {

            return null;

        }


        const securityStatus =
            resolveSecurityStatus(
                analysis
            );


        const securityLevel =
            resolveSecurityLevel(
                analysis
            );


        const risk =
            resolveRiskLevel(
                analysis
            );


        const protectionLevel =
            resolveProtectionLevel(
                analysis
            );


        const recommendations =
            generateRecommendations(
                analysis,
                risk
            );


        return {

            assessmentType:
                "virtual_wifi_security_assessment",

            assessmentVersion:
                ENGINE_VERSION,

            targetId:
                analysis.targetId ||
                null,

            networkId:
                analysis.targetNetworkId ||
                analysis.networkId ||
                null,

            SSID:
                analysis.targetSSID ||
                analysis.SSID ||
                "",

            BSSID:
                analysis.BSSID ||
                "",

            channel:
                analysis.channel !== undefined
                    ? analysis.channel
                    : null,

            encryption:
                analysis.encryption ||
                "UNKNOWN",

            signal:
                analysis.signal !== undefined
                    ? analysis.signal
                    : null,

            signalQuality:
                analysis.signalQuality ||
                "inconnue",

            securityStatus:
                securityStatus,

            securityLevel:
                securityLevel,

            protectionLevel:
                protectionLevel,

            riskCode:
                risk.code,

            riskLevel:
                risk.label,

            riskScore:
                risk.score,

            findings:
                Array.isArray(
                    analysis.analysis &&
                    analysis.analysis.findings
                )
                    ? analysis.analysis.findings
                    : [],

            findingCount:
                Array.isArray(
                    analysis.analysis &&
                    analysis.analysis.findings
                )
                    ? analysis.analysis.findings.length
                    : 0,

            recommendations:
                recommendations,

            virtual:
                true,

            realWiFiOperation:
                false,

            packetCapture:
                false,

            authenticationAttempt:
                false,

            connectionAttempt:
                false,

            generatedAt:
                new Date().toISOString()

        };

    }


    /* =====================================================
       CRÉATION DE L'ÉVÉNEMENT D'ACTION
    ===================================================== */

    function createAssessmentEvent(
        analysis,
        assessment
    ) {

        if (
            !analysis ||
            !assessment
        ) {

            return null;

        }


        return {

            simulationId:
                SIMULATION_ID,

            labId:
                LAB_ID,

            actionId:
                ACTION_ID,

            actionType:
                "assess_security",

            status:
                "completed",

            timestamp:
                assessment.generatedAt,

            targetId:
                assessment.targetId,

            targetNetworkId:
                assessment.networkId,

            targetSSID:
                assessment.SSID,

            BSSID:
                assessment.BSSID,

            channel:
                assessment.channel,

            encryption:
                assessment.encryption,

            signal:
                assessment.signal,

            signalQuality:
                assessment.signalQuality,

            securityStatus:
                assessment.securityStatus,

            securityLevel:
                assessment.securityLevel,

            protectionLevel:
                assessment.protectionLevel,

            riskCode:
                assessment.riskCode,

            riskLevel:
                assessment.riskLevel,

            riskScore:
                assessment.riskScore,

            findingCount:
                assessment.findingCount,

            findings:
                assessment.findings,

            recommendations:
                assessment.recommendations,

            assessment:
                assessment,

            resultState:
                "wifi_security_assessed",

            validationKey:
                "WIFI_SECURITY_ASSESSED"

        };

    }


    /* =====================================================
       ENREGISTREMENT DE L'ÉVALUATION
    ===================================================== */

    function recordSecurityAssessment(
        analysis,
        assessment
    ) {

        if (
            !analysis ||
            !assessment
        ) {

            return null;

        }


        const event =
            createAssessmentEvent(
                analysis,
                assessment
            );


        if (!event) {

            return null;

        }


        securityAssessmentState.assessedTargetId =
            event.targetId;


        securityAssessmentState.assessedNetworkId =
            event.targetNetworkId;


        securityAssessmentState.lastAssessmentAt =
            event.timestamp;


        securityAssessmentState.lastResult =
            event;


        /* =================================================
           ENREGISTREMENT DANS LE CYBER ACTION BRIDGE
        ================================================= */

        if (
            CyberActionBridge &&
            typeof CyberActionBridge.recordAction ===
                "function"
        ) {

            CyberActionBridge.recordAction(
                event
            );

        }


        /* =================================================
           ÉVÉNEMENT CYBERSÉCURITÉ STANDARD
        ================================================= */

        window.dispatchEvent(
            new CustomEvent(
                "FOBAS:CyberSimulationAction",
                {
                    detail:
                        event
                }
            )
        );


        /* =================================================
           ÉVÉNEMENT SPÉCIFIQUE À L'ÉVALUATION WI-FI
        ================================================= */

        window.dispatchEvent(
            new CustomEvent(
                "FOBAS:WiFiSecurityAssessed",
                {
                    detail:
                        event
                }
            )
        );


        return event;

    }


    /* =====================================================
       ÉVALUER LA DERNIÈRE ANALYSE
    ===================================================== */

    function assessLastAnalysis() {

        /*
         * L'action ne peut commencer qu'après
         * wifi.analyze_target.
         */

        const analysis =
            resolveLastAnalysis();


        if (!analysis) {

            console.warn(
                "[FOBAS Wi-Fi Security] " +
                "Aucune analyse Wi-Fi virtuelle valide n'est disponible."
            );

            return null;

        }


        const assessment =
            createSecurityAssessment(
                analysis
            );


        if (!assessment) {

            return null;

        }


        return recordSecurityAssessment(
            analysis,
            assessment
        );

    }


    /* =====================================================
       ÉVALUER UNE ANALYSE PAR TARGET ID
    ===================================================== */

    function assessTarget(
        targetId
    ) {

        if (
            targetId === undefined ||
            targetId === null ||
            targetId === ""
        ) {

            return null;

        }


        const analysis =
            resolveLastAnalysis();


        if (!analysis) {

            console.warn(
                "[FOBAS Wi-Fi Security] " +
                "Aucune analyse précédente valide."
            );

            return null;

        }


        if (
            String(
                analysis.targetId ||
                ""
            ) !==
            String(
                targetId
            )
        ) {

            console.warn(
                "[FOBAS Wi-Fi Security] " +
                "Le target demandé ne correspond pas au target analysé."
            );

            return null;

        }


        const assessment =
            createSecurityAssessment(
                analysis
            );


        if (!assessment) {

            return null;

        }


        return recordSecurityAssessment(
            analysis,
            assessment
        );

    }


    /* =====================================================
       ENREGISTREMENT DE L'ACTION DANS LE REGISTRE
    ===================================================== */

    function registerAction() {

        if (
            !CyberActionBridge ||
            !CyberActionBridge.actions
        ) {

            console.error(
                "[FOBAS Wi-Fi Security] " +
                "Registre des actions Cyber indisponible."
            );

            return false;

        }


        /*
         * Ajout d'une seule nouvelle action.
         *
         * Les actions existantes ne sont ni remplacées
         * ni modifiées.
         */

        CyberActionBridge.actions[ACTION_ID] = {

            actionId:
                ACTION_ID,

            simulationId:
                SIMULATION_ID,

            labId:
                LAB_ID,

            elementId:
                null,

            actionType:
                "assess_security",

            target:
                "virtual_wifi_network",

            requiredState:
                "wifi_target_analyzed",

            resultState:
                "wifi_security_assessed",

            validationKey:
                "WIFI_SECURITY_ASSESSED",

            enabled:
                true

        };


        return true;

    }


    /* =====================================================
       RÉCUPÉRER LA DERNIÈRE ÉVALUATION
    ===================================================== */

    function getLastAssessment() {

        return securityAssessmentState.lastResult;

    }


    /* =====================================================
       RÉCUPÉRER LE RAPPORT D'ÉVALUATION
    ===================================================== */

    function getAssessmentReport() {

        if (
            !securityAssessmentState.lastResult
        ) {

            return null;

        }


        return (
            securityAssessmentState
                .lastResult
                .assessment ||
            null
        );

    }


    /* =====================================================
       API PUBLIQUE
    ===================================================== */

    const WiFiSecurityAssessmentExtension = {

        version:
            ENGINE_VERSION,

        id:
            ACTION_ID,

        state:
            securityAssessmentState,

        initialize:
            function () {

                if (
                    securityAssessmentState.initialized
                ) {

                    return true;

                }


                if (!FOBAS.wifi) {

                    console.error(
                        "[FOBAS Wi-Fi Security] " +
                        "Moteur Wi-Fi indisponible."
                    );

                    return false;

                }


                if (
                    !WiFiTargetAnalysis
                ) {

                    console.error(
                        "[FOBAS Wi-Fi Security] " +
                        "Extension d'analyse Wi-Fi indisponible."
                    );

                    return false;

                }


                /*
                 * Enregistrer uniquement la nouvelle action.
                 */

                if (
                    !registerAction()
                ) {

                    return false;

                }


                securityAssessmentState.initialized =
                    true;


                console.log(
                    "[FOBAS Wi-Fi Security] " +
                    "Extension d'évaluation de sécurité initialisée avec succès. " +
                    ENGINE_VERSION
                );


                return true;

            },


        assessLastAnalysis:
            assessLastAnalysis,


        assessTarget:
            assessTarget,


        getLastAssessment:
            getLastAssessment,


        getAssessmentReport:
            getAssessmentReport

    };


    /* =====================================================
       API GLOBALE PUBLIQUE
    ===================================================== */

    window.FOBASWiFiSecurityAssessment =
        WiFiSecurityAssessmentExtension;


    if (FOBAS.wifi) {

        FOBAS.wifi.securityAssessment =
            WiFiSecurityAssessmentExtension;

    }


    /* =====================================================
       INITIALISATION
    ===================================================== */

    function initializeWiFiSecurityAssessment() {

        WiFiSecurityAssessmentExtension.initialize();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeWiFiSecurityAssessment,
            {
                once:
                    true
            }
        );

    } else {

        initializeWiFiSecurityAssessment();

    }

})();











// ============================================================
// FOBAS CYBERSECURITY SIMULATION
// WIFI CONFIGURATION INSPECTION ENGINE
// ACTION: wifi.inspect_configuration
//
// Rôle :
// - Inspecter la configuration virtuelle du réseau Wi-Fi
//   après l'évaluation de sécurité.
// - Utiliser exclusivement les données déjà présentes
//   dans la simulation.
// - Ne réalise aucune opération Wi-Fi réelle.
//
// Chaîne officielle :
//
// wifi.scan
//      ↓
// wifi.select_target
//      ↓
// wifi.analyze_target
//      ↓
// wifi.assess_security
//      ↓
// wifi.inspect_configuration
//
// IMPORTANT :
// - Ne modifie PAS wifi.select_target.
// - Ne modifie PAS wifi.analyze_target.
// - Ne modifie PAS wifi.assess_security.
// - Ne réalise aucun scan réel.
// - Ne capture aucun paquet.
// - Ne tente aucune authentification.
// - Ne tente aucune connexion.
// - Ne réalise aucune attaque.
// ============================================================

(function(){

    "use strict";

    // ========================================================
    // 1. DÉPENDANCES
    // ========================================================

    const FOBAS =
        window.FOBASCybersecuritySimulation;

    const CyberActionBridge =
        window.FOBASCyberActionBridge;

    const WiFiSecurityAssessment =
        window.FOBASWiFiSecurityAssessment;


    // ========================================================
    // 2. VÉRIFICATION DES DÉPENDANCES
    // ========================================================

    if(!FOBAS){

        console.error(
            "[FOBAS] Le moteur principal de simulation cybersécurité est introuvable."
        );

        return;
    }

    if(!CyberActionBridge){

        console.error(
            "[FOBAS] Le CyberActionBridge est introuvable."
        );

        return;
    }

    if(!WiFiSecurityAssessment){

        console.error(
            "[FOBAS] Le moteur wifi.assess_security est introuvable."
        );

        return;
    }


    // ========================================================
    // 3. IDENTIFIANTS STABLES
    // ========================================================

    const ENGINE_VERSION = "1.0.0";

    const ACTION_ID =
        "wifi.inspect_configuration";

    const SIMULATION_ID =
        "fobas-ethical-hacking-simulation";

    const LAB_ID =
        "wifi";


    // ========================================================
    // 4. ÉTAT INTERNE DU MOTEUR
    // ========================================================

    const state = {

        initialized: false,

        inspectedTargetId: null,

        inspectedNetworkId: null,

        lastInspectionAt: null,

        lastResult: null

    };


    // ========================================================
    // 5. OUTIL : NORMALISATION D'UNE VALEUR
    // ========================================================

    function normalize(value){

        if(value === null || value === undefined){

            return "";
        }

        return String(value).trim();
    }


    // ========================================================
    // 6. OUTIL : NORMALISATION DE L'ENCRYPTION
    // ========================================================

    function normalizeEncryption(network){

        if(!network){

            return "UNKNOWN";
        }

        const encryption =
            normalize(
                network.encryption ||
                network.security ||
                network.securityType
            ).toUpperCase();

        if(!encryption){

            return "UNKNOWN";
        }

        if(
            encryption.includes("WPA3")
        ){

            return "WPA3";
        }

        if(
            encryption.includes("WPA2")
        ){

            return "WPA2";
        }

        if(
            encryption === "WPA" ||
            encryption.includes("WPA-")
        ){

            return "WPA";
        }

        if(
            encryption.includes("WEP")
        ){

            return "WEP";
        }

        if(
            encryption.includes("OPEN") ||
            encryption.includes("NONE")
        ){

            return "OPEN";
        }

        return encryption;
    }


    // ========================================================
    // 7. OUTIL : RÉCUPÉRATION DU STATUT DE SÉCURITÉ
    // ========================================================

    function resolveSecurityStatus(network){

        if(!network){

            return "unknown";
        }

        try{

            if(
                FOBAS.wifi &&
                typeof FOBAS.wifi.getSecurityStatus === "function"
            ){

                const result =
                    FOBAS.wifi.getSecurityStatus(network);

                if(result){

                    return normalize(result).toLowerCase();
                }
            }

        }catch(error){

            console.warn(
                "[FOBAS] Impossible de récupérer le statut de sécurité du réseau.",
                error
            );
        }


        const encryption =
            normalizeEncryption(network);


        if(
            encryption === "OPEN" ||
            encryption === "WEP"
        ){

            return "vulnerable";
        }

        if(
            encryption === "WPA"
        ){

            return "warning";
        }

        if(
            encryption === "WPA2" ||
            encryption === "WPA3"
        ){

            return "secure";
        }

        return "unknown";
    }


    // ========================================================
    // 8. OUTIL : RÉCUPÉRATION DU RÉSEAU
    // ========================================================

    function getNetworkById(networkId){

        if(!networkId){

            return null;
        }

        if(
            !FOBAS.wifi ||
            !Array.isArray(FOBAS.wifi.networks)
        ){

            return null;
        }

        return (
            FOBAS.wifi.networks.find(function(network){

                return (
                    network &&
                    (
                        network.id === networkId ||
                        network.networkId === networkId ||
                        network.targetId === networkId
                    )
                );

            }) || null
        );
    }


    // ========================================================
    // 9. RÉCUPÉRATION DE L'ÉVALUATION PRÉCÉDENTE
    // ========================================================

    function getLastValidAssessment(){

        let assessment = null;

        try{

            if(
                typeof WiFiSecurityAssessment.getLastAssessment ===
                "function"
            ){

                assessment =
                    WiFiSecurityAssessment.getLastAssessment();
            }

        }catch(error){

            console.warn(
                "[FOBAS] Impossible de récupérer la dernière évaluation Wi-Fi.",
                error
            );
        }


        if(!assessment){

            return null;
        }


        if(
            assessment.actionId !==
            "wifi.assess_security"
        ){

            return null;
        }


        if(
            assessment.resultState !==
            "wifi_security_assessed"
        ){

            return null;
        }


        return assessment;
    }


    // ========================================================
    // 10. CONSTRUCTION DE L'INSPECTION
    // ========================================================

    function buildInspection(assessment){

        if(!assessment){

            return null;
        }


        const networkId =
            assessment.networkId ||
            assessment.targetNetworkId ||
            null;


        const network =
            getNetworkById(networkId);


        const encryption =
            normalizeEncryption(network || assessment);


        const securityStatus =
            resolveSecurityStatus(
                network || assessment
            );


        const inspectionItems = [];


        // ----------------------------------------------------
        // SSID
        // ----------------------------------------------------

        inspectionItems.push({

            parameter: "SSID",

            value:
                normalize(
                    assessment.SSID ||
                    (network && network.SSID)
                ) || "Non renseigné",

            status: "inspecté",

            description:
                "Le nom du réseau virtuel a été identifié."

        });


        // ----------------------------------------------------
        // BSSID
        // ----------------------------------------------------

        inspectionItems.push({

            parameter: "BSSID",

            value:
                normalize(
                    assessment.BSSID ||
                    (network && network.BSSID)
                ) || "Non renseigné",

            status: "inspecté",

            description:
                "L'identifiant matériel virtuel du point d'accès a été identifié."

        });


        // ----------------------------------------------------
        // CANAL
        // ----------------------------------------------------

        inspectionItems.push({

            parameter: "Canal",

            value:
                normalize(
                    assessment.channel ||
                    (network && network.channel)
                ) || "Non renseigné",

            status: "inspecté",

            description:
                "Le canal radio virtuel associé au réseau a été identifié."

        });


        // ----------------------------------------------------
        // CHIFFREMENT
        // ----------------------------------------------------

        let encryptionStatus =
            "inconnu";


        if(encryption === "OPEN"){

            encryptionStatus =
                "critique";

        }else if(encryption === "WEP"){

            encryptionStatus =
                "faible";

        }else if(encryption === "WPA"){

            encryptionStatus =
                "ancien";

        }else if(encryption === "WPA2"){

            encryptionStatus =
                "moderne";

        }else if(encryption === "WPA3"){

            encryptionStatus =
                "renforcé";
        }


        inspectionItems.push({

            parameter: "Chiffrement",

            value: encryption,

            status: encryptionStatus,

            description:
                "Le mécanisme de protection virtuelle du réseau a été inspecté."

        });


        // ----------------------------------------------------
        // STATUT DE SÉCURITÉ
        // ----------------------------------------------------

        inspectionItems.push({

            parameter: "Statut de sécurité",

            value:
                securityStatus,

            status:
                securityStatus === "secure"
                    ? "satisfaisant"
                    : securityStatus === "warning"
                        ? "à surveiller"
                        : securityStatus === "vulnerable"
                            ? "vulnérable"
                            : "indéterminé",

            description:
                "Le niveau de sécurité déjà évalué a été confirmé à partir des données de la simulation."

        });


        // ----------------------------------------------------
        // SIGNAL
        // ----------------------------------------------------

        const signal =
            assessment.signal !== undefined
                ? assessment.signal
                : (
                    network &&
                    network.signal !== undefined
                        ? network.signal
                        : null
                );


        inspectionItems.push({

            parameter: "Signal",

            value:
                signal !== null &&
                signal !== undefined &&
                signal !== ""
                    ? signal
                    : "Non renseigné",

            status: "inspecté",

            description:
                "La valeur du signal virtuel disponible dans la simulation a été relevée."

        });


        // ====================================================
        // 11. OBSERVATIONS
        // ====================================================

        const observations = [];


        if(encryption === "OPEN"){

            observations.push(
                "Le réseau virtuel ne présente aucun mécanisme de chiffrement."
            );

        }else if(encryption === "WEP"){

            observations.push(
                "Le réseau virtuel utilise WEP, une protection considérée comme obsolète."
            );

        }else if(encryption === "WPA"){

            observations.push(
                "Le réseau virtuel utilise WPA, une protection ancienne qui doit être surveillée."
            );

        }else if(encryption === "WPA2"){

            observations.push(
                "Le réseau virtuel utilise WPA2, une protection moderne couramment utilisée."
            );

        }else if(encryption === "WPA3"){

            observations.push(
                "Le réseau virtuel utilise WPA3, une protection renforcée."
            );

        }else{

            observations.push(
                "Le mécanisme de protection du réseau virtuel n'a pas pu être déterminé."
            );
        }


        if(securityStatus === "secure"){

            observations.push(
                "L'évaluation précédente indique un niveau de sécurité satisfaisant."
            );

        }else if(securityStatus === "warning"){

            observations.push(
                "L'évaluation précédente indique qu'une vigilance supplémentaire est nécessaire."
            );

        }else if(securityStatus === "vulnerable"){

            observations.push(
                "L'évaluation précédente indique la présence d'une faiblesse de sécurité."
            );

        }else{

            observations.push(
                "Le statut de sécurité reste indéterminé."
            );
        }


        // ====================================================
        // 12. RECOMMANDATIONS PÉDAGOGIQUES
        // ====================================================

        const recommendations = [];


        if(encryption === "OPEN"){

            recommendations.push(
                "Activer une protection Wi-Fi moderne."
            );

            recommendations.push(
                "Éviter l'utilisation d'un réseau ouvert pour des communications sensibles."
            );

        }else if(encryption === "WEP"){

            recommendations.push(
                "Remplacer WEP par une protection Wi-Fi moderne."
            );

            recommendations.push(
                "Privilégier WPA2 ou WPA3 selon les capacités du réseau."
            );

        }else if(encryption === "WPA"){

            recommendations.push(
                "Envisager une migration vers WPA2 ou WPA3."
            );

            recommendations.push(
                "Vérifier régulièrement la configuration de sécurité."
            );

        }else if(encryption === "WPA2"){

            recommendations.push(
                "Maintenir WPA2 correctement configuré."
            );

            recommendations.push(
                "Utiliser WPA3 lorsque l'infrastructure le permet."
            );

        }else if(encryption === "WPA3"){

            recommendations.push(
                "Maintenir WPA3 activé et correctement configuré."
            );

            recommendations.push(
                "Continuer les vérifications périodiques de la configuration."
            );

        }else{

            recommendations.push(
                "Identifier précisément le mécanisme de protection avant toute décision de sécurité."
            );
        }


        // ====================================================
        // 13. RAPPORT FINAL D'INSPECTION
        // ====================================================

        return {

            inspectionType:
                "virtual_wifi_configuration_inspection",

            inspectionVersion:
                ENGINE_VERSION,

            targetId:
                assessment.targetId || null,

            networkId:
                networkId,

            SSID:
                assessment.SSID ||
                (network && network.SSID) ||
                null,

            BSSID:
                assessment.BSSID ||
                (network && network.BSSID) ||
                null,

            channel:
                assessment.channel ||
                (network && network.channel) ||
                null,

            encryption:
                encryption,

            signal:
                signal,

            signalQuality:
                assessment.signalQuality ||
                null,

            securityStatus:
                securityStatus,

            inspectionItems:
                inspectionItems,

            inspectionItemCount:
                inspectionItems.length,

            observations:
                observations,

            observationCount:
                observations.length,

            recommendations:
                recommendations,

            recommendationCount:
                recommendations.length,

            virtual:
                true,

            realWiFiOperation:
                false,

            packetCapture:
                false,

            authenticationAttempt:
                false,

            connectionAttempt:
                false,

            attackExecution:
                false,

            inspectedAt:
                new Date().toISOString()

        };
    }


    // ========================================================
    // 14. INSPECTER LA DERNIÈRE ÉVALUATION
    // ========================================================

    function inspectLastAssessment(){

        const assessment =
            getLastValidAssessment();


        if(!assessment){

            console.warn(
                "[FOBAS] L'inspection de configuration nécessite une évaluation de sécurité Wi-Fi valide."
            );

            return null;
        }


        const inspection =
            buildInspection(assessment);


        if(!inspection){

            console.warn(
                "[FOBAS] Impossible de construire l'inspection de configuration."
            );

            return null;
        }


        state.inspectedTargetId =
            inspection.targetId;

        state.inspectedNetworkId =
            inspection.networkId;

        state.lastInspectionAt =
            inspection.inspectedAt;


        // ====================================================
        // 15. ÉVÉNEMENT STANDARDISÉ
        // ====================================================

        const event = {

            simulationId:
                SIMULATION_ID,

            labId:
                LAB_ID,

            actionId:
                ACTION_ID,

            actionType:
                "inspect_configuration",

            status:
                "completed",

            timestamp:
                inspection.inspectedAt,

            targetId:
                inspection.targetId,

            targetNetworkId:
                inspection.networkId,

            targetSSID:
                inspection.SSID,

            BSSID:
                inspection.BSSID,

            channel:
                inspection.channel,

            encryption:
                inspection.encryption,

            securityStatus:
                inspection.securityStatus,

            inspection:
                inspection,

            resultState:
                "wifi_configuration_inspected",

            validationKey:
                "WIFI_CONFIGURATION_INSPECTED"

        };


        state.lastResult =
            event;


        // ====================================================
        // 16. ENREGISTREMENT DANS LE CYBER ACTION BRIDGE
        // ====================================================

        try{

            if(
                typeof CyberActionBridge.recordAction ===
                "function"
            ){

                CyberActionBridge.recordAction(event);
            }

        }catch(error){

            console.error(
                "[FOBAS] Erreur lors de l'enregistrement de wifi.inspect_configuration.",
                error
            );

            return null;
        }


        // ====================================================
        // 17. ÉVÉNEMENTS GLOBAUX
        // ====================================================

        try{

            window.dispatchEvent(
                new CustomEvent(
                    "FOBAS:CyberSimulationAction",
                    {
                        detail: event
                    }
                )
            );


            window.dispatchEvent(
                new CustomEvent(
                    "FOBAS:WiFiConfigurationInspected",
                    {
                        detail: event
                    }
                )
            );

        }catch(error){

            console.warn(
                "[FOBAS] Impossible d'émettre les événements globaux.",
                error
            );
        }


        console.log(
            "[FOBAS] Inspection de configuration Wi-Fi terminée.",
            event
        );


        return event;
    }


    // ========================================================
    // 18. INSPECTER UNE CIBLE PRÉCISE
    // ========================================================

    function inspectTarget(targetId){

        const assessment =
            getLastValidAssessment();


        if(!assessment){

            console.warn(
                "[FOBAS] Aucune évaluation de sécurité valide n'est disponible."
            );

            return null;
        }


        if(
            targetId &&
            assessment.targetId !== targetId
        ){

            console.warn(
                "[FOBAS] La cible demandée n'est pas la cible actuellement évaluée."
            );

            return null;
        }


        return inspectLastAssessment();
    }


    // ========================================================
    // 19. ACCÈS AU DERNIER RÉSULTAT
    // ========================================================

    function getLastInspection(){

        return state.lastResult;
    }


    // ========================================================
    // 20. ACCÈS AU RAPPORT D'INSPECTION
    // ========================================================

    function getInspectionReport(){

        if(
            !state.lastResult
        ){

            return null;
        }


        return (
            state.lastResult.inspection ||
            null
        );
    }


    // ========================================================
    // 21. INITIALISATION
    // ========================================================

    function initialize(){

        if(state.initialized){

            return true;
        }


        // ----------------------------------------------------
        // Vérification du registre d'actions
        // ----------------------------------------------------

        if(
            !CyberActionBridge.actions
        ){

            CyberActionBridge.actions = {};
        }


        // ====================================================
        // 22. ENREGISTREMENT OFFICIEL DE L'ACTION
        // ====================================================

        CyberActionBridge.actions[ACTION_ID] = {

            actionId:
                ACTION_ID,

            simulationId:
                SIMULATION_ID,

            labId:
                LAB_ID,

            elementId:
                null,

            actionType:
                "inspect_configuration",

            target:
                "virtual_wifi_network",

            requiredState:
                "wifi_security_assessed",

            resultState:
                "wifi_configuration_inspected",

            validationKey:
                "WIFI_CONFIGURATION_INSPECTED",

            enabled:
                true

        };


        state.initialized =
            true;


        console.log(
            "[FOBAS] wifi.inspect_configuration initialisé."
        );


        return true;
    }


    // ========================================================
    // 23. API PUBLIQUE
    // ========================================================

    const PublicAPI = {

        initialize:

            initialize,

        inspectLastAssessment:

            inspectLastAssessment,

        inspectTarget:

            inspectTarget,

        getLastInspection:

            getLastInspection,

        getInspectionReport:

            getInspectionReport,

        getInspectedTargetId:

            function(){

                return state.inspectedTargetId;

            },

        getInspectedNetworkId:

            function(){

                return state.inspectedNetworkId;

            },

        getLastInspectionAt:

            function(){

                return state.lastInspectionAt;

            },

        getEngineVersion:

            function(){

                return ENGINE_VERSION;

            }

    };


    // ========================================================
    // 24. EXPOSITION GLOBALE
    // ========================================================

    window.FOBASWiFiConfigurationInspection =
        PublicAPI;


    // ========================================================
    // 25. EXPOSITION DANS FOBAS.WIFI
    // ========================================================

    if(!FOBAS.wifi){

        FOBAS.wifi = {};
    }


    FOBAS.wifi.configurationInspection =
        PublicAPI;


    // ========================================================
    // 26. INITIALISATION AUTOMATIQUE
    // ========================================================

    initialize();


})();














// =====================================================
// FOBAS ETHICAL HACKING SIMULATION
// WIFI CONFIGURATION HARDENING ENGINE
//
// ACTION:
// wifi.harden_configuration
//
// OBJECTIF:
// Appliquer une remédiation défensive virtuelle à la
// configuration Wi-Fi après son inspection.
//
// IMPORTANT :
// - Simulation 100 % virtuelle
// - Aucune connexion Wi-Fi réelle
// - Aucun scan réel
// - Aucune capture de paquets
// - Aucune tentative d'authentification
// - Aucun craquage de mot de passe
// - Aucune exécution d'attaque
// - Ne modifie pas les moteurs précédents
// - Nécessite wifi.inspect_configuration
// - Produit wifi_configuration_hardened
// =====================================================

(function () {

    "use strict";


    // =====================================================
    // DÉPENDANCES
    // =====================================================

    const FOBAS =
        window.FOBASCybersecuritySimulation;

    const CyberActionBridge =
        window.FOBASCyberActionBridge;

    const WiFiConfigurationInspection =
        window.FOBASWiFiConfigurationInspection;


    // =====================================================
    // VALIDATION DES DÉPENDANCES
    // =====================================================

    if (!FOBAS) {

        console.error(
            "[FOBAS] Le moteur principal de simulation cybersécurité est introuvable."
        );

        return;
    }


    if (!CyberActionBridge) {

        console.error(
            "[FOBAS] Le Cyber Action Bridge est introuvable."
        );

        return;
    }


    if (!WiFiConfigurationInspection) {

        console.error(
            "[FOBAS] Le moteur d'inspection de configuration Wi-Fi est introuvable."
        );

        return;
    }


    // =====================================================
    // CONSTANTES
    // =====================================================

    const ENGINE_VERSION =
        "1.0.0";

    const ACTION_ID =
        "wifi.harden_configuration";

    const SIMULATION_ID =
        "fobas-ethical-hacking-simulation";

    const LAB_ID =
        "wifi";


    // =====================================================
    // ÉTAT INTERNE
    // =====================================================

    let initialized = false;

    let hardenedTargetId = null;

    let hardenedNetworkId = null;

    let lastHardeningAt = null;

    let lastResult = null;


    // =====================================================
    // OUTIL : HORODATAGE
    // =====================================================

    function now() {

        return new Date().toISOString();

    }


    // =====================================================
    // RÉCUPÉRATION DE LA DERNIÈRE INSPECTION
    // =====================================================

    function getLastInspection() {

        if (
            typeof WiFiConfigurationInspection
                .getLastInspection !==
            "function"
        ) {

            return null;
        }


        const inspection =
            WiFiConfigurationInspection
                .getLastInspection();


        if (!inspection) {

            return null;

        }


        if (
            inspection.actionId !==
            "wifi.inspect_configuration"
        ) {

            return null;

        }


        if (
            inspection.resultState !==
            "wifi_configuration_inspected"
        ) {

            return null;

        }


        return inspection;

    }


    // =====================================================
    // RÉCUPÉRATION DU RAPPORT D'INSPECTION
    // =====================================================

    function getInspectionReport() {

        const inspection =
            getLastInspection();


        if (!inspection) {

            return null;

        }


        if (
            inspection.inspection
        ) {

            return inspection.inspection;

        }


        return null;

    }


    // =====================================================
    // NORMALISATION DU CHIFFREMENT
    // =====================================================

    function normalizeEncryption(
        encryption
    ) {

        if (
            encryption === null ||
            encryption === undefined
        ) {

            return "UNKNOWN";

        }


        return String(encryption)
            .trim()
            .toUpperCase();

    }


    // =====================================================
    // DÉTERMINATION DE LA CONFIGURATION CIBLE
    // =====================================================

    function determineTargetConfiguration(
        report
    ) {

        const encryption =
            normalizeEncryption(
                report &&
                report.encryption
            );


        let targetEncryption =
            encryption;


        let remediationRequired =
            false;


        let remediationReason =
            "Aucune modification nécessaire.";


        // -------------------------------------------------
        // OPEN
        // -------------------------------------------------

        if (
            encryption === "OPEN"
        ) {

            targetEncryption =
                "WPA3";

            remediationRequired =
                true;

            remediationReason =
                "Le réseau simulé ne dispose d'aucune protection.";

        }


        // -------------------------------------------------
        // WEP
        // -------------------------------------------------

        else if (
            encryption === "WEP"
        ) {

            targetEncryption =
                "WPA3";

            remediationRequired =
                true;

            remediationReason =
                "Le réseau simulé utilise un mécanisme de chiffrement obsolète.";

        }


        // -------------------------------------------------
        // WPA
        // -------------------------------------------------

        else if (
            encryption === "WPA"
        ) {

            targetEncryption =
                "WPA2";

            remediationRequired =
                true;

            remediationReason =
                "Le réseau simulé utilise une protection ancienne.";

        }


        // -------------------------------------------------
        // WPA2
        // -------------------------------------------------

        else if (
            encryption === "WPA2"
        ) {

            targetEncryption =
                "WPA2";

            remediationRequired =
                false;

            remediationReason =
                "La configuration WPA2 est conservée dans la simulation.";

        }


        // -------------------------------------------------
        // WPA3
        // -------------------------------------------------

        else if (
            encryption === "WPA3"
        ) {

            targetEncryption =
                "WPA3";

            remediationRequired =
                false;

            remediationReason =
                "La configuration WPA3 est déjà renforcée.";

        }


        // -------------------------------------------------
        // INCONNU
        // -------------------------------------------------

        else {

            targetEncryption =
                "WPA2";

            remediationRequired =
                true;

            remediationReason =
                "Le mécanisme de protection n'est pas déterminé.";

        }


        return {

            originalEncryption:
                encryption,

            targetEncryption:
                targetEncryption,

            remediationRequired:
                remediationRequired,

            remediationReason:
                remediationReason

        };

    }


    // =====================================================
    // DÉTERMINATION DU STATUT WPS
    // =====================================================

    function determineWPSConfiguration(
        report
    ) {

        let originalStatus =
            "unknown";


        if (
            report &&
            report.wpsStatus
        ) {

            originalStatus =
                String(
                    report.wpsStatus
                ).toLowerCase();

        }


        if (
            originalStatus ===
            "enabled"
        ) {

            return {

                originalStatus:
                    "enabled",

                targetStatus:
                    "disabled",

                remediationRequired:
                    true,

                reason:
                    "Le WPS est activé et sera désactivé dans la simulation."

            };

        }


        if (
            originalStatus ===
            "disabled"
        ) {

            return {

                originalStatus:
                    "disabled",

                targetStatus:
                    "disabled",

                remediationRequired:
                    false,

                reason:
                    "Le WPS est déjà désactivé dans la simulation."

            };

        }


        return {

            originalStatus:
                "unknown",

            targetStatus:
                "disabled",

            remediationRequired:
                true,

            reason:
                "L'état du WPS est inconnu ; la configuration cible simulée le désactive."

        };

    }


    // =====================================================
    // GÉNÉRATION DES MODIFICATIONS
    // =====================================================

    function buildChanges(
        report
    ) {

        const encryptionConfiguration =
            determineTargetConfiguration(
                report
            );


        const wpsConfiguration =
            determineWPSConfiguration(
                report
            );


        const changes = [];


        // -------------------------------------------------
        // Chiffrement
        // -------------------------------------------------

        changes.push({

            category:
                "chiffrement",

            parameter:
                "encryption",

            previousValue:
                encryptionConfiguration
                    .originalEncryption,

            newValue:
                encryptionConfiguration
                    .targetEncryption,

            changed:
                encryptionConfiguration
                    .originalEncryption !==
                encryptionConfiguration
                    .targetEncryption,

            reason:
                encryptionConfiguration
                    .remediationReason

        });


        // -------------------------------------------------
        // WPS
        // -------------------------------------------------

        changes.push({

            category:
                "wps",

            parameter:
                "wps",

            previousValue:
                wpsConfiguration
                    .originalStatus,

            newValue:
                wpsConfiguration
                    .targetStatus,

            changed:
                wpsConfiguration
                    .originalStatus !==
                wpsConfiguration
                    .targetStatus,

            reason:
                wpsConfiguration
                    .reason

        });


        return changes;

    }


    // =====================================================
    // GÉNÉRATION DU NOUVEAU NIVEAU DE SÉCURITÉ
    // =====================================================

    function determineSecurityLevel(
        encryption
    ) {

        switch (
            normalizeEncryption(
                encryption
            )
        ) {

            case "WPA3":

                return "faible";

            case "WPA2":

                return "faible";

            case "WPA":

                return "moyen";

            case "WEP":

                return "élevé";

            case "OPEN":

                return "élevé";

            default:

                return "inconnu";

        }

    }


    // =====================================================
    // GÉNÉRATION DU NOUVEAU RISQUE
    // =====================================================

    function determineRisk(
        encryption
    ) {

        switch (
            normalizeEncryption(
                encryption
            )
        ) {

            case "WPA3":

                return {

                    riskCode:
                        "LOW",

                    riskLevel:
                        "Risque faible",

                    riskScore:
                        15

                };


            case "WPA2":

                return {

                    riskCode:
                        "LOW",

                    riskLevel:
                        "Risque faible",

                    riskScore:
                        25

                };


            case "WPA":

                return {

                    riskCode:
                        "MEDIUM",

                    riskLevel:
                        "Risque moyen",

                    riskScore:
                        60

                };


            case "WEP":

                return {

                    riskCode:
                        "HIGH",

                    riskLevel:
                        "Risque élevé",

                    riskScore:
                        85

                };


            case "OPEN":

                return {

                    riskCode:
                        "HIGH",

                    riskLevel:
                        "Risque élevé",

                    riskScore:
                        90

                };


            default:

                return {

                    riskCode:
                        "UNKNOWN",

                    riskLevel:
                        "Risque indéterminé",

                    riskScore:
                        null

                };

        }

    }


    // =====================================================
    // GÉNÉRATION DES RECOMMANDATIONS POST-HARDENING
    // =====================================================

    function buildPostHardeningRecommendations(
        encryption
    ) {

        const recommendations = [];


        const normalized =
            normalizeEncryption(
                encryption
            );


        if (
            normalized === "WPA3"
        ) {

            recommendations.push(
                "Maintenir WPA3 comme mécanisme de protection principal."
            );

            recommendations.push(
                "Maintenir WPS désactivé lorsque cette fonction n'est pas nécessaire."
            );

        }


        else if (
            normalized === "WPA2"
        ) {

            recommendations.push(
                "Maintenir WPA2 avec une configuration correctement protégée."
            );

            recommendations.push(
                "Évaluer une migration vers WPA3 lorsque l'environnement le permet."
            );

        }


        else {

            recommendations.push(
                "Vérifier à nouveau la configuration de sécurité."
            );

        }


        recommendations.push(
            "Effectuer une nouvelle vérification après toute modification de configuration."
        );


        return recommendations;

    }


    // =====================================================
    // CRÉATION DU RAPPORT DE HARDENING
    // =====================================================

    function createHardeningReport(
        inspection
    ) {

        const report =
            inspection.inspection ||
            {};


        const changes =
            buildChanges(
                report
            );


        const encryptionConfiguration =
            determineTargetConfiguration(
                report
            );


        const wpsConfiguration =
            determineWPSConfiguration(
                report
            );


        const targetEncryption =
            encryptionConfiguration
                .targetEncryption;


        const risk =
            determineRisk(
                targetEncryption
            );


        const changedCount =
            changes.filter(
                function (change) {

                    return change.changed === true;

                }
            ).length;


        const recommendations =
            buildPostHardeningRecommendations(
                targetEncryption
            );


        return {

            hardeningType:
                "virtual_wifi_configuration_hardening",

            hardeningVersion:
                ENGINE_VERSION,

            targetId:
                inspection.targetId ||
                null,

            networkId:
                inspection.networkId ||
                null,

            SSID:
                inspection.SSID ||
                null,

            BSSID:
                inspection.BSSID ||
                null,

            channel:
                inspection.channel ||
                null,

            previousEncryption:
                encryptionConfiguration
                    .originalEncryption,

            resultingEncryption:
                targetEncryption,

            previousWPSStatus:
                wpsConfiguration
                    .originalStatus,

            resultingWPSStatus:
                wpsConfiguration
                    .targetStatus,

            securityLevel:
                determineSecurityLevel(
                    targetEncryption
                ),

            riskCode:
                risk.riskCode,

            riskLevel:
                risk.riskLevel,

            riskScore:
                risk.riskScore,

            changes:
                changes,

            changeCount:
                changes.length,

            changedCount:
                changedCount,

            remediationApplied:
                changedCount > 0,

            remediationStatus:
                changedCount > 0
                    ? "completed"
                    : "already_hardened",

            recommendations:
                recommendations,

            virtual:
                true,

            realWiFiOperation:
                false,

            packetCapture:
                false,

            authenticationAttempt:
                false,

            connectionAttempt:
                false,

            attackExecution:
                false,

            credentialRecovery:
                false,

            generatedAt:
                now()

        };

    }


    // =====================================================
    // ENREGISTREMENT DE L'ACTION
    // =====================================================

    function recordHardening(
        hardeningReport
    ) {

        const event = {

            simulationId:
                SIMULATION_ID,

            labId:
                LAB_ID,

            actionId:
                ACTION_ID,

            actionType:
                "harden_configuration",

            status:
                "completed",

            timestamp:
                now(),

            targetId:
                hardeningReport.targetId,

            targetNetworkId:
                hardeningReport.networkId,

            targetSSID:
                hardeningReport.SSID,

            BSSID:
                hardeningReport.BSSID,

            channel:
                hardeningReport.channel,

            previousEncryption:
                hardeningReport.previousEncryption,

            resultingEncryption:
                hardeningReport.resultingEncryption,

            previousWPSStatus:
                hardeningReport.previousWPSStatus,

            resultingWPSStatus:
                hardeningReport.resultingWPSStatus,

            securityLevel:
                hardeningReport.securityLevel,

            riskCode:
                hardeningReport.riskCode,

            riskLevel:
                hardeningReport.riskLevel,

            riskScore:
                hardeningReport.riskScore,

            remediationApplied:
                hardeningReport.remediationApplied,

            remediationStatus:
                hardeningReport.remediationStatus,

            hardening:
                hardeningReport,

            resultState:
                "wifi_configuration_hardened",

            validationKey:
                "WIFI_CONFIGURATION_HARDENED"

        };


        // -------------------------------------------------
        // Enregistrement dans le Cyber Action Bridge
        // -------------------------------------------------

        if (
            typeof CyberActionBridge.recordAction ===
            "function"
        ) {

            CyberActionBridge.recordAction(
                event
            );

        }


        // -------------------------------------------------
        // Événement global
        // -------------------------------------------------

        window.dispatchEvent(
            new CustomEvent(
                "FOBAS:CyberSimulationAction",
                {
                    detail:
                        event
                }
            )
        );


        // -------------------------------------------------
        // Événement spécifique Wi-Fi
        // -------------------------------------------------

        window.dispatchEvent(
            new CustomEvent(
                "FOBAS:WiFiConfigurationHardened",
                {
                    detail:
                        event
                }
            )
        );


        return event;

    }


    // =====================================================
    // HARDENING DE LA DERNIÈRE INSPECTION
    // =====================================================

    function hardenLastInspection() {

        const inspection =
            getLastInspection();


        if (!inspection) {

            console.warn(
                "[FOBAS] Impossible d'appliquer le hardening : aucune inspection Wi-Fi valide n'est disponible."
            );

            return null;

        }


        const hardeningReport =
            createHardeningReport(
                inspection
            );


        const event =
            recordHardening(
                hardeningReport
            );


        hardenedTargetId =
            hardeningReport.targetId;


        hardenedNetworkId =
            hardeningReport.networkId;


        lastHardeningAt =
            event.timestamp;


        lastResult =
            event;


        return event;

    }


    // =====================================================
    // HARDENING D'UNE CIBLE
    // =====================================================

    function hardenTarget(
        targetId
    ) {

        const inspection =
            getLastInspection();


        if (!inspection) {

            console.warn(
                "[FOBAS] Aucune inspection Wi-Fi valide n'est disponible."
            );

            return null;

        }


        if (
            targetId &&
            inspection.targetId !==
            targetId
        ) {

            console.warn(
                "[FOBAS] La cible demandée ne correspond pas à la dernière cible inspectée."
            );

            return null;

        }


        return hardenLastInspection();

    }


    // =====================================================
    // INITIALISATION
    // =====================================================

    function initialize() {

        if (initialized) {

            return true;

        }


        initialized = true;


        // -------------------------------------------------
        // Registre central des actions
        // -------------------------------------------------

        CyberActionBridge.actions =
            CyberActionBridge.actions ||
            {};


        CyberActionBridge.actions[
            ACTION_ID
        ] = {

            actionId:
                ACTION_ID,

            simulationId:
                SIMULATION_ID,

            labId:
                LAB_ID,

            elementId:
                null,

            actionType:
                "harden_configuration",

            target:
                "virtual_wifi_network",

            requiredState:
                "wifi_configuration_inspected",

            resultState:
                "wifi_configuration_hardened",

            validationKey:
                "WIFI_CONFIGURATION_HARDENED",

            enabled:
                true

        };


        return true;

    }


    // =====================================================
    // API PUBLIQUE
    // =====================================================

    const API = {

        engineVersion:
            ENGINE_VERSION,

        actionId:
            ACTION_ID,

        simulationId:
            SIMULATION_ID,

        labId:
            LAB_ID,

        initialize:
            initialize,

        hardenLastInspection:
            hardenLastInspection,

        hardenTarget:
            hardenTarget,

        getLastHardening:
            function () {

                return lastResult;

            },

        getHardeningReport:
            function () {

                if (!lastResult) {

                    return null;

                }


                return lastResult.hardening ||
                    null;

            },

        getHardenedTarget:
            function () {

                return {

                    targetId:
                        hardenedTargetId,

                    networkId:
                        hardenedNetworkId,

                    hardenedAt:
                        lastHardeningAt

                };

            }

    };


    // =====================================================
    // EXPOSITION GLOBALE
    // =====================================================

    window.FOBASWiFiConfigurationHardening =
        API;


    // =====================================================
    // INTÉGRATION DANS FOBAS.WIFI
    // =====================================================

    FOBAS.wifi =
        FOBAS.wifi ||
        {};


    FOBAS.wifi.configurationHardening =
        API;


    // =====================================================
    // INITIALISATION AUTOMATIQUE
    // =====================================================

    initialize();


    // =====================================================
    // MESSAGE DE CONTRÔLE
    // =====================================================

    console.info(
        "[FOBAS] wifi.harden_configuration initialisé avec succès."
    );


})();















// =====================================================
// FOBAS ETHICAL HACKING SIMULATION
// WIFI HARDENING VERIFICATION ENGINE
//
// ACTION:
// wifi.verify_hardening
//
// OBJECTIF:
// Vérifier virtuellement que la remédiation de sécurité
// appliquée à la configuration Wi-Fi a bien produit une
// configuration renforcée.
//
// IMPORTANT :
// - Simulation 100 % virtuelle
// - Aucune opération Wi-Fi réelle
// - Aucun scan réel
// - Aucune capture de paquets
// - Aucune tentative d'authentification
// - Aucune tentative de connexion
// - Aucun craquage de mot de passe
// - Aucune exécution d'attaque
// - Ne modifie pas les moteurs précédents
// - Nécessite wifi.harden_configuration
// - Produit wifi_hardening_verified
// =====================================================

(function () {

    "use strict";


    // =====================================================
    // DÉPENDANCES
    // =====================================================

    const FOBAS =
        window.FOBASCybersecuritySimulation;

    const CyberActionBridge =
        window.FOBASCyberActionBridge;

    const WiFiConfigurationHardening =
        window.FOBASWiFiConfigurationHardening;


    // =====================================================
    // VALIDATION DES DÉPENDANCES
    // =====================================================

    if (!FOBAS) {

        console.error(
            "[FOBAS] Le moteur principal de simulation cybersécurité est introuvable."
        );

        return;
    }


    if (!CyberActionBridge) {

        console.error(
            "[FOBAS] Le Cyber Action Bridge est introuvable."
        );

        return;
    }


    if (!WiFiConfigurationHardening) {

        console.error(
            "[FOBAS] Le moteur de hardening de configuration Wi-Fi est introuvable."
        );

        return;
    }


    // =====================================================
    // CONSTANTES
    // =====================================================

    const ENGINE_VERSION =
        "1.0.0";

    const ACTION_ID =
        "wifi.verify_hardening";

    const SIMULATION_ID =
        "fobas-ethical-hacking-simulation";

    const LAB_ID =
        "wifi";


    // =====================================================
    // ÉTAT INTERNE
    // =====================================================

    let initialized = false;

    let verifiedTargetId = null;

    let verifiedNetworkId = null;

    let lastVerificationAt = null;

    let lastResult = null;


    // =====================================================
    // HORODATAGE
    // =====================================================

    function now() {

        return new Date().toISOString();

    }


    // =====================================================
    // RÉCUPÉRATION DU DERNIER HARDENING
    // =====================================================

    function getLastHardening() {

        if (
            typeof WiFiConfigurationHardening
                .getLastHardening !==
            "function"
        ) {

            return null;
        }


        const hardening =
            WiFiConfigurationHardening
                .getLastHardening();


        if (!hardening) {

            return null;

        }


        if (
            hardening.actionId !==
            "wifi.harden_configuration"
        ) {

            return null;

        }


        if (
            hardening.resultState !==
            "wifi_configuration_hardened"
        ) {

            return null;

        }


        return hardening;

    }


    // =====================================================
    // RÉCUPÉRATION DU RAPPORT DE HARDENING
    // =====================================================

    function getHardeningReport() {

        const hardening =
            getLastHardening();


        if (!hardening) {

            return null;

        }


        if (
            hardening.hardening
        ) {

            return hardening.hardening;

        }


        return null;

    }


    // =====================================================
    // NORMALISATION DU CHIFFREMENT
    // =====================================================

    function normalizeEncryption(
        encryption
    ) {

        if (
            encryption === null ||
            encryption === undefined
        ) {

            return "UNKNOWN";

        }


        return String(encryption)
            .trim()
            .toUpperCase();

    }


    // =====================================================
    // VÉRIFICATION DU CHIFFREMENT
    // =====================================================

    function verifyEncryption(
        encryption
    ) {

        const normalized =
            normalizeEncryption(
                encryption
            );


        if (
            normalized === "WPA3"
        ) {

            return {

                verified:
                    true,

                status:
                    "strong",

                code:
                    "WPA3_HARDENING_VERIFIED",

                description:
                    "La configuration simulée utilise WPA3."

            };

        }


        if (
            normalized === "WPA2"
        ) {

            return {

                verified:
                    true,

                status:
                    "acceptable",

                code:
                    "WPA2_HARDENING_VERIFIED",

                description:
                    "La configuration simulée utilise WPA2."

            };

        }


        if (
            normalized === "WPA"
        ) {

            return {

                verified:
                    false,

                status:
                    "warning",

                code:
                    "LEGACY_WPA_REMAINS",

                description:
                    "Une protection WPA ancienne demeure dans la configuration simulée."

            };

        }


        if (
            normalized === "WEP"
        ) {

            return {

                verified:
                    false,

                status:
                    "critical",

                code:
                    "WEP_REMAINS",

                description:
                    "WEP demeure présent dans la configuration simulée."

            };

        }


        if (
            normalized === "OPEN"
        ) {

            return {

                verified:
                    false,

                status:
                    "critical",

                code:
                    "OPEN_NETWORK_REMAINS",

                description:
                    "Le réseau simulé demeure sans protection."

            };

        }


        return {

            verified:
                false,

            status:
                "unknown",

            code:
                "UNKNOWN_ENCRYPTION",

            description:
                "Le mécanisme de protection ne peut pas être vérifié."

        };

    }


    // =====================================================
    // VÉRIFICATION DU WPS
    // =====================================================

    function verifyWPS(
        wpsStatus
    ) {

        const normalized =
            wpsStatus === null ||
            wpsStatus === undefined
                ? "unknown"
                : String(
                    wpsStatus
                ).trim().toLowerCase();


        if (
            normalized === "disabled"
        ) {

            return {

                verified:
                    true,

                status:
                    "secure",

                code:
                    "WPS_DISABLED",

                description:
                    "Le WPS est désactivé dans la configuration simulée."

            };

        }


        if (
            normalized === "enabled"
        ) {

            return {

                verified:
                    false,

                status:
                    "warning",

                code:
                    "WPS_ENABLED",

                description:
                    "Le WPS reste activé dans la configuration simulée."

            };

        }


        return {

            verified:
                false,

            status:
                "unknown",

            code:
                "WPS_STATUS_UNKNOWN",

            description:
                "L'état du WPS ne peut pas être confirmé."

        };

    }


    // =====================================================
    // CONSTRUCTION DES VÉRIFICATIONS
    // =====================================================

    function buildChecks(
        report
    ) {

        const checks = [];


        // -------------------------------------------------
        // Vérification du chiffrement
        // -------------------------------------------------

        const encryptionCheck =
            verifyEncryption(
                report &&
                report.resultingEncryption
            );


        checks.push({

            category:
                "chiffrement",

            parameter:
                "encryption",

            expected:
                "WPA2 ou WPA3",

            actual:
                normalizeEncryption(
                    report &&
                    report.resultingEncryption
                ),

            verified:
                encryptionCheck.verified,

            status:
                encryptionCheck.status,

            code:
                encryptionCheck.code,

            description:
                encryptionCheck.description

        });


        // -------------------------------------------------
        // Vérification WPS
        // -------------------------------------------------

        const wpsCheck =
            verifyWPS(
                report &&
                report.resultingWPSStatus
            );


        checks.push({

            category:
                "wps",

            parameter:
                "wps",

            expected:
                "disabled",

            actual:
                report &&
                report.resultingWPSStatus
                    ? report.resultingWPSStatus
                    : "unknown",

            verified:
                wpsCheck.verified,

            status:
                wpsCheck.status,

            code:
                wpsCheck.code,

            description:
                wpsCheck.description

        });


        return checks;

    }


    // =====================================================
    // CALCUL DU STATUT DE VÉRIFICATION
    // =====================================================

    function determineVerificationStatus(
        checks
    ) {

        if (
            !Array.isArray(checks) ||
            checks.length === 0
        ) {

            return {

                verified:
                    false,

                code:
                    "NO_VERIFICATION_CHECKS",

                status:
                    "unknown",

                label:
                    "Vérification indéterminée"

            };

        }


        const allVerified =
            checks.every(
                function (check) {

                    return check.verified === true;

                }
            );


        if (allVerified) {

            return {

                verified:
                    true,

                code:
                    "HARDENING_VERIFIED",

                status:
                    "verified",

                label:
                    "Hardening vérifié"

            };

        }


        return {

            verified:
                false,

            code:
                "HARDENING_NOT_VERIFIED",

            status:
                "failed",

            label:
                "Hardening non vérifié"

        };

    }


    // =====================================================
    // CALCUL DU RISQUE RÉSIDUEL
    // =====================================================

    function determineResidualRisk(
        encryption
    ) {

        switch (
            normalizeEncryption(
                encryption
            )
        ) {

            case "WPA3":

                return {

                    riskCode:
                        "LOW",

                    riskLevel:
                        "Risque faible",

                    riskScore:
                        15

                };


            case "WPA2":

                return {

                    riskCode:
                        "LOW",

                    riskLevel:
                        "Risque faible",

                    riskScore:
                        25

                };


            case "WPA":

                return {

                    riskCode:
                        "MEDIUM",

                    riskLevel:
                        "Risque moyen",

                    riskScore:
                        60

                };


            case "WEP":

                return {

                    riskCode:
                        "HIGH",

                    riskLevel:
                        "Risque élevé",

                    riskScore:
                        85

                };


            case "OPEN":

                return {

                    riskCode:
                        "HIGH",

                    riskLevel:
                        "Risque élevé",

                    riskScore:
                        90

                };


            default:

                return {

                    riskCode:
                        "UNKNOWN",

                    riskLevel:
                        "Risque indéterminé",

                    riskScore:
                        null

                };

        }

    }


    // =====================================================
    // CONSTRUCTION DES RECOMMANDATIONS
    // =====================================================

    function buildRecommendations(
        verificationStatus,
        encryption,
        wpsStatus
    ) {

        const recommendations = [];


        if (
            verificationStatus.verified
        ) {

            recommendations.push(
                "La configuration de sécurité virtuelle a été vérifiée avec succès."
            );

            recommendations.push(
                "Maintenir le mécanisme de protection actuel et effectuer des vérifications régulières."
            );

        }

        else {

            if (
                normalizeEncryption(
                    encryption
                ) !== "WPA2" &&
                normalizeEncryption(
                    encryption
                ) !== "WPA3"
            ) {

                recommendations.push(
                    "Renforcer le mécanisme de protection avant de considérer la mission comme terminée."
                );

            }


            if (
                String(
                    wpsStatus || ""
                ).toLowerCase() !==
                "disabled"
            ) {

                recommendations.push(
                    "Désactiver WPS dans la configuration simulée."
                );

            }


            recommendations.push(
                "Relancer la vérification après correction de la configuration."
            );

        }


        return recommendations;

    }


    // =====================================================
    // CRÉATION DU RAPPORT DE VÉRIFICATION
    // =====================================================

    function createVerificationReport(
        hardening
    ) {

        const report =
            hardening.hardening ||
            {};


        const checks =
            buildChecks(
                report
            );


        const verificationStatus =
            determineVerificationStatus(
                checks
            );


        const residualRisk =
            determineResidualRisk(
                report.resultingEncryption
            );


        const verifiedCount =
            checks.filter(
                function (check) {

                    return check.verified === true;

                }
            ).length;


        const recommendations =
            buildRecommendations(
                verificationStatus,
                report.resultingEncryption,
                report.resultingWPSStatus
            );


        return {

            verificationType:
                "virtual_wifi_hardening_verification",

            verificationVersion:
                ENGINE_VERSION,

            targetId:
                hardening.targetId ||
                null,

            networkId:
                hardening.networkId ||
                null,

            SSID:
                hardening.SSID ||
                null,

            BSSID:
                hardening.BSSID ||
                null,

            channel:
                hardening.channel ||
                null,

            resultingEncryption:
                report.resultingEncryption ||
                "UNKNOWN",

            resultingWPSStatus:
                report.resultingWPSStatus ||
                "unknown",

            verificationStatus:
                verificationStatus.status,

            verificationCode:
                verificationStatus.code,

            verificationLabel:
                verificationStatus.label,

            verified:
                verificationStatus.verified,

            checks:
                checks,

            checkCount:
                checks.length,

            verifiedCount:
                verifiedCount,

            failedCount:
                checks.length -
                verifiedCount,

            residualRiskCode:
                residualRisk.riskCode,

            residualRiskLevel:
                residualRisk.riskLevel,

            residualRiskScore:
                residualRisk.riskScore,

            recommendations:
                recommendations,

            virtual:
                true,

            realWiFiOperation:
                false,

            packetCapture:
                false,

            authenticationAttempt:
                false,

            connectionAttempt:
                false,

            attackExecution:
                false,

            credentialRecovery:
                false,

            generatedAt:
                now()

        };

    }


    // =====================================================
    // ENREGISTREMENT DE L'ACTION
    // =====================================================

    function recordVerification(
        verificationReport
    ) {

        const event = {

            simulationId:
                SIMULATION_ID,

            labId:
                LAB_ID,

            actionId:
                ACTION_ID,

            actionType:
                "verify_hardening",

            status:
                verificationReport.verified
                    ? "completed"
                    : "failed",

            timestamp:
                now(),

            targetId:
                verificationReport.targetId,

            targetNetworkId:
                verificationReport.networkId,

            targetSSID:
                verificationReport.SSID,

            BSSID:
                verificationReport.BSSID,

            channel:
                verificationReport.channel,

            resultingEncryption:
                verificationReport.resultingEncryption,

            resultingWPSStatus:
                verificationReport.resultingWPSStatus,

            verificationStatus:
                verificationReport.verificationStatus,

            verificationCode:
                verificationReport.verificationCode,

            verified:
                verificationReport.verified,

            residualRiskCode:
                verificationReport.residualRiskCode,

            residualRiskLevel:
                verificationReport.residualRiskLevel,

            residualRiskScore:
                verificationReport.residualRiskScore,

            verification:
                verificationReport,

            resultState:
                verificationReport.verified
                    ? "wifi_hardening_verified"
                    : "wifi_hardening_verification_failed",

            validationKey:
                verificationReport.verified
                    ? "WIFI_HARDENING_VERIFIED"
                    : "WIFI_HARDENING_VERIFICATION_FAILED"

        };


        // -------------------------------------------------
        // Enregistrement dans le Cyber Action Bridge
        // -------------------------------------------------

        if (
            typeof CyberActionBridge.recordAction ===
            "function"
        ) {

            CyberActionBridge.recordAction(
                event
            );

        }


        // -------------------------------------------------
        // Événement global
        // -------------------------------------------------

        window.dispatchEvent(
            new CustomEvent(
                "FOBAS:CyberSimulationAction",
                {
                    detail:
                        event
                }
            )
        );


        // -------------------------------------------------
        // Événement spécifique Wi-Fi
        // -------------------------------------------------

        window.dispatchEvent(
            new CustomEvent(
                "FOBAS:WiFiHardeningVerified",
                {
                    detail:
                        event
                }
            )
        );


        return event;

    }


    // =====================================================
    // VÉRIFICATION DU DERNIER HARDENING
    // =====================================================

    function verifyLastHardening() {

        const hardening =
            getLastHardening();


        if (!hardening) {

            console.warn(
                "[FOBAS] Impossible de vérifier le hardening : aucun hardening Wi-Fi valide n'est disponible."
            );

            return null;

        }


        const verificationReport =
            createVerificationReport(
                hardening
            );


        const event =
            recordVerification(
                verificationReport
            );


        verifiedTargetId =
            verificationReport.targetId;


        verifiedNetworkId =
            verificationReport.networkId;


        lastVerificationAt =
            event.timestamp;


        lastResult =
            event;


        return event;

    }


    // =====================================================
    // VÉRIFICATION D'UNE CIBLE
    // =====================================================

    function verifyTarget(
        targetId
    ) {

        const hardening =
            getLastHardening();


        if (!hardening) {

            console.warn(
                "[FOBAS] Aucun hardening Wi-Fi valide n'est disponible."
            );

            return null;

        }


        if (
            targetId &&
            hardening.targetId !==
            targetId
        ) {

            console.warn(
                "[FOBAS] La cible demandée ne correspond pas à la dernière cible renforcée."
            );

            return null;

        }


        return verifyLastHardening();

    }


    // =====================================================
    // INITIALISATION
    // =====================================================

    function initialize() {

        if (initialized) {

            return true;

        }


        initialized = true;


        // -------------------------------------------------
        // Registre central des actions
        // -------------------------------------------------

        CyberActionBridge.actions =
            CyberActionBridge.actions ||
            {};


        CyberActionBridge.actions[
            ACTION_ID
        ] = {

            actionId:
                ACTION_ID,

            simulationId:
                SIMULATION_ID,

            labId:
                LAB_ID,

            elementId:
                null,

            actionType:
                "verify_hardening",

            target:
                "virtual_wifi_network",

            requiredState:
                "wifi_configuration_hardened",

            resultState:
                "wifi_hardening_verified",

            validationKey:
                "WIFI_HARDENING_VERIFIED",

            enabled:
                true

        };


        return true;

    }


    // =====================================================
    // API PUBLIQUE
    // =====================================================

    const API = {

        engineVersion:
            ENGINE_VERSION,

        actionId:
            ACTION_ID,

        simulationId:
            SIMULATION_ID,

        labId:
            LAB_ID,

        initialize:
            initialize,

        verifyLastHardening:
            verifyLastHardening,

        verifyTarget:
            verifyTarget,

        getLastVerification:
            function () {

                return lastResult;

            },

        getVerificationReport:
            function () {

                if (!lastResult) {

                    return null;

                }


                return lastResult.verification ||
                    null;

            },

        getVerifiedTarget:
            function () {

                return {

                    targetId:
                        verifiedTargetId,

                    networkId:
                        verifiedNetworkId,

                    verifiedAt:
                        lastVerificationAt

                };

            }

    };


    // =====================================================
    // EXPOSITION GLOBALE
    // =====================================================

    window.FOBASWiFiHardeningVerification =
        API;


    // =====================================================
    // INTÉGRATION DANS FOBAS.WIFI
    // =====================================================

    FOBAS.wifi =
        FOBAS.wifi ||
        {};


    FOBAS.wifi.hardeningVerification =
        API;


    // =====================================================
    // INITIALISATION AUTOMATIQUE
    // =====================================================

    initialize();


    // =====================================================
    // MESSAGE DE CONTRÔLE
    // =====================================================

    console.info(
        "[FOBAS] wifi.verify_hardening initialisé avec succès."
    );


})();




















// =====================================================
// FOBAS WIFI MISSION COMPLETION ENGINE
// ACTION: wifi.complete_mission
//
// FINAL BLOCK OF THE WIFI LAB
//
// PIPELINE:
// wifi.verify_hardening
//        ↓
// wifi_hardening_verified
//        ↓
// wifi.complete_mission
//        ↓
// wifi_mission_completed
//
// IMPORTANT:
// - Virtual simulation only.
// - Does NOT perform real Wi-Fi operations.
// - Does NOT connect to real networks.
// - Does NOT capture packets.
// - Does NOT attempt authentication.
// - Does NOT recover credentials.
// - Does NOT execute attacks.
// - Does NOT automatically launch another laboratory.
// =====================================================

(function(){

    "use strict";

    // =================================================
    // DEPENDENCIES
    // =================================================

    const Simulation =
        window.FOBASCybersecuritySimulation;

    const CyberActionBridge =
        window.FOBASCyberActionBridge;

    const HardeningVerification =
        window.FOBASWiFiHardeningVerification;


    // =================================================
    // SAFETY CHECK
    // =================================================

    if(!Simulation){

        console.warn(
            "[FOBAS WiFi Mission Completion] " +
            "FOBASCybersecuritySimulation introuvable."
        );

        return;
    }

    if(!CyberActionBridge){

        console.warn(
            "[FOBAS WiFi Mission Completion] " +
            "FOBASCyberActionBridge introuvable."
        );

        return;
    }

    if(!HardeningVerification){

        console.warn(
            "[FOBAS WiFi Mission Completion] " +
            "FOBASWiFiHardeningVerification introuvable."
        );

        return;
    }


    // =================================================
    // CONSTANTES
    // =================================================

    const ENGINE_VERSION = "1.0.0";

    const ACTION_ID =
        "wifi.complete_mission";

    const SIMULATION_ID =
        "fobas-ethical-hacking-simulation";

    const LAB_ID =
        "wifi";

    const REQUIRED_STATE =
        "wifi_hardening_verified";

    const RESULT_STATE =
        "wifi_mission_completed";

    const VALIDATION_KEY =
        "WIFI_MISSION_COMPLETED";


    // =================================================
    // ETAT INTERNE
    // =================================================

    let initialized = false;

    let missionCompleted = false;

    let completedTargetId = null;

    let completedNetworkId = null;

    let lastCompletionAt = null;

    let lastResult = null;


    // =================================================
    // UTILITAIRES
    // =================================================

    function now(){

        return new Date().toISOString();
    }


    function safeString(value){

        if(
            value === null ||
            value === undefined
        ){

            return "";
        }

        return String(value);
    }


    function normalizeEncryption(value){

        const encryption =
            safeString(value)
                .trim()
                .toUpperCase();

        if(!encryption){

            return "UNKNOWN";
        }

        return encryption;
    }


    function normalizeVerificationStatus(value){

        const status =
            safeString(value)
                .trim()
                .toLowerCase();

        if(
            status === "verified"
        ){

            return "verified";
        }

        return status || "unknown";
    }


    // =================================================
    // RECUPERATION DE LA DERNIERE VERIFICATION
    // =================================================

    function getLastSuccessfulVerification(){

        try{

            if(
                typeof HardeningVerification
                    .getLastVerification !==
                "function"
            ){

                return null;
            }

            const verification =
                HardeningVerification
                    .getLastVerification();

            if(!verification){

                return null;
            }

            if(
                verification.actionId !==
                "wifi.verify_hardening"
            ){

                return null;
            }

            if(
                verification.resultState !==
                REQUIRED_STATE
            ){

                return null;
            }

            if(
                verification.verified !== true
            ){

                return null;
            }

            return verification;

        }catch(error){

            console.warn(
                "[FOBAS WiFi Mission Completion] " +
                "Impossible de récupérer la vérification finale.",
                error
            );

            return null;
        }
    }


    // =================================================
    // CONSTRUCTION DU RAPPORT FINAL
    // =================================================

    function buildCompletionReport(
        verification
    ){

        const targetId =
            verification.targetId ||
            null;

        const networkId =
            verification.networkId ||
            null;

        const resultingEncryption =
            normalizeEncryption(
                verification.resultingEncryption
            );

        const resultingWPSStatus =
            safeString(
                verification.resultingWPSStatus
            ) || "unknown";

        const verificationStatus =
            normalizeVerificationStatus(
                verification.verificationStatus
            );

        const verificationCode =
            safeString(
                verification.verificationCode
            ) || "HARDENING_VERIFIED";

        const residualRiskCode =
            safeString(
                verification.residualRiskCode
            ) || "UNKNOWN";

        const residualRiskLevel =
            safeString(
                verification.residualRiskLevel
            ) || "inconnu";

        const residualRiskScore =
            typeof verification.residualRiskScore ===
            "number"
                ? verification.residualRiskScore
                : null;


        return {

            // -----------------------------------------
            // IDENTIFICATION
            // -----------------------------------------

            completionType:
                "virtual_wifi_mission_completion",

            engineVersion:
                ENGINE_VERSION,

            simulationId:
                SIMULATION_ID,

            labId:
                LAB_ID,

            actionId:
                ACTION_ID,


            // -----------------------------------------
            // CIBLE
            // -----------------------------------------

            targetId:
                targetId,

            networkId:
                networkId,

            SSID:
                verification.SSID || null,

            BSSID:
                verification.BSSID || null,

            channel:
                verification.channel || null,


            // -----------------------------------------
            // CONFIGURATION FINALE
            // -----------------------------------------

            resultingEncryption:
                resultingEncryption,

            resultingWPSStatus:
                resultingWPSStatus,


            // -----------------------------------------
            // VERIFICATION FINALE
            // -----------------------------------------

            verificationStatus:
                verificationStatus,

            verificationCode:
                verificationCode,

            verified:
                true,


            // -----------------------------------------
            // RISQUE RESIDUEL
            // -----------------------------------------

            residualRiskCode:
                residualRiskCode,

            residualRiskLevel:
                residualRiskLevel,

            residualRiskScore:
                residualRiskScore,


            // -----------------------------------------
            // RESULTAT DE LA MISSION
            // -----------------------------------------

            missionCompleted:
                true,

            passed:
                true,

            completionStatus:
                "completed",

            completionLabel:
                "Mission Wi-Fi terminée avec succès",


            // -----------------------------------------
            // ETAPE SUIVANTE
            // -----------------------------------------

            nextStage:
                "next_lab",


            // -----------------------------------------
            // SECURITE / VIRTUALISATION
            // -----------------------------------------

            virtual:
                true,

            realWiFiOperation:
                false,

            packetCapture:
                false,

            authenticationAttempt:
                false,

            connectionAttempt:
                false,

            attackExecution:
                false,

            credentialRecovery:
                false,


            // -----------------------------------------
            // HORODATAGE
            // -----------------------------------------

            completedAt:
                now()
        };
    }


    // =================================================
    // ENREGISTREMENT DE L'ACTION
    // =================================================

    function recordCompletion(
        completionReport
    ){

        const event = {

            simulationId:
                SIMULATION_ID,

            labId:
                LAB_ID,

            actionId:
                ACTION_ID,

            actionType:
                "complete_mission",

            status:
                "completed",

            timestamp:
                completionReport.completedAt,


            // -----------------------------------------
            // CIBLE
            // -----------------------------------------

            targetId:
                completionReport.targetId,

            targetNetworkId:
                completionReport.networkId,

            targetSSID:
                completionReport.SSID,

            targetBSSID:
                completionReport.BSSID,

            channel:
                completionReport.channel,


            // -----------------------------------------
            // ETAT FINAL
            // -----------------------------------------

            resultingEncryption:
                completionReport.resultingEncryption,

            resultingWPSStatus:
                completionReport.resultingWPSStatus,

            verificationStatus:
                completionReport.verificationStatus,

            verificationCode:
                completionReport.verificationCode,

            verified:
                true,


            // -----------------------------------------
            // MISSION
            // -----------------------------------------

            missionCompleted:
                true,

            passed:
                true,

            completionStatus:
                "completed",


            // -----------------------------------------
            // RISQUE
            // -----------------------------------------

            residualRiskCode:
                completionReport.residualRiskCode,

            residualRiskLevel:
                completionReport.residualRiskLevel,

            residualRiskScore:
                completionReport.residualRiskScore,


            // -----------------------------------------
            // RAPPORT COMPLET
            // -----------------------------------------

            completion:
                completionReport,


            // -----------------------------------------
            // ETATS DU PIPELINE
            // -----------------------------------------

            requiredState:
                REQUIRED_STATE,

            resultState:
                RESULT_STATE,

            validationKey:
                VALIDATION_KEY,


            // -----------------------------------------
            // SECURITE
            // -----------------------------------------

            virtual:
                true,

            realWiFiOperation:
                false,

            packetCapture:
                false,

            authenticationAttempt:
                false,

            connectionAttempt:
                false,

            attackExecution:
                false,

            credentialRecovery:
                false
        };


        try{

            if(
                typeof CyberActionBridge.recordAction ===
                "function"
            ){

                CyberActionBridge.recordAction(
                    event
                );
            }

        }catch(error){

            console.warn(
                "[FOBAS WiFi Mission Completion] " +
                "Erreur lors de l'enregistrement de l'action.",
                error
            );
        }


        // =============================================
        // EVENEMENT GLOBAL
        // =============================================

        try{

            window.dispatchEvent(
                new CustomEvent(
                    "FOBAS:CyberSimulationAction",
                    {
                        detail: event
                    }
                )
            );

        }catch(error){

            console.warn(
                "[FOBAS WiFi Mission Completion] " +
                "Impossible d'émettre l'événement global.",
                error
            );
        }


        // =============================================
        // EVENEMENT SPECIFIQUE WIFI
        // =============================================

        try{

            window.dispatchEvent(
                new CustomEvent(
                    "FOBAS:WiFiMissionCompleted",
                    {
                        detail: event
                    }
                )
            );

        }catch(error){

            console.warn(
                "[FOBAS WiFi Mission Completion] " +
                "Impossible d'émettre l'événement Wi-Fi.",
                error
            );
        }


        return event;
    }


    // =================================================
    // COMPLETION DE LA MISSION
    // =================================================

    function completeMission(){

        // ---------------------------------------------
        // EVITER UNE DOUBLE COMPLETION
        // ---------------------------------------------

        if(missionCompleted){

            return lastResult;
        }


        // ---------------------------------------------
        // RECUPERER LA VERIFICATION
        // ---------------------------------------------

        const verification =
            getLastSuccessfulVerification();


        if(!verification){

            console.warn(
                "[FOBAS WiFi Mission Completion] " +
                "La mission ne peut pas être terminée."
            );

            console.warn(
                "[FOBAS WiFi Mission Completion] " +
                "La vérification Hardening doit être réussie."
            );

            return null;
        }


        // ---------------------------------------------
        // VERIFICATION STRICTE DE L'ETAT
        // ---------------------------------------------

        if(
            verification.resultState !==
            REQUIRED_STATE
        ){

            console.warn(
                "[FOBAS WiFi Mission Completion] " +
                "Etat requis non atteint : " +
                REQUIRED_STATE
            );

            return null;
        }


        if(
            verification.verified !== true
        ){

            console.warn(
                "[FOBAS WiFi Mission Completion] " +
                "La vérification finale n'est pas validée."
            );

            return null;
        }


        // ---------------------------------------------
        // CONSTRUCTION DU RAPPORT
        // ---------------------------------------------

        const completionReport =
            buildCompletionReport(
                verification
            );


        // ---------------------------------------------
        // MISE A JOUR DE L'ETAT INTERNE
        // ---------------------------------------------

        missionCompleted =
            true;

        completedTargetId =
            completionReport.targetId;

        completedNetworkId =
            completionReport.networkId;

        lastCompletionAt =
            completionReport.completedAt;


        // ---------------------------------------------
        // ENREGISTREMENT
        // ---------------------------------------------

        const event =
            recordCompletion(
                completionReport
            );


        lastResult = {

            actionId:
                ACTION_ID,

            status:
                "completed",

            resultState:
                RESULT_STATE,

            validationKey:
                VALIDATION_KEY,

            missionCompleted:
                true,

            passed:
                true,

            targetId:
                completionReport.targetId,

            networkId:
                completionReport.networkId,

            completion:
                completionReport,

            event:
                event
        };


        return lastResult;
    }


    // =================================================
    // INITIALISATION
    // =================================================

    function initialize(){

        if(initialized){

            return true;
        }


        // ---------------------------------------------
        // REGISTRE ACTION
        // ---------------------------------------------

        try{

            if(
                !CyberActionBridge.actions
            ){

                CyberActionBridge.actions = {};
            }


            CyberActionBridge.actions[
                ACTION_ID
            ] = {

                actionId:
                    ACTION_ID,

                simulationId:
                    SIMULATION_ID,

                labId:
                    LAB_ID,

                elementId:
                    null,

                actionType:
                    "complete_mission",

                target:
                    "virtual_wifi_mission",

                requiredState:
                    REQUIRED_STATE,

                resultState:
                    RESULT_STATE,

                validationKey:
                    VALIDATION_KEY,

                enabled:
                    true
            };

        }catch(error){

            console.warn(
                "[FOBAS WiFi Mission Completion] " +
                "Impossible d'enregistrer l'action.",
                error
            );
        }


        initialized = true;

        return true;
    }


    // =================================================
    // API PUBLIQUE
    // =================================================

    const API = {

        initialize:

            initialize,


        completeMission:

            completeMission,


        getLastCompletion:

            function(){

                return lastResult;
            },


        getCompletionReport:

            function(){

                return lastResult &&
                       lastResult.completion
                    ? lastResult.completion
                    : null;
            },


        isMissionCompleted:

            function(){

                return missionCompleted === true;
            },


        getCompletedTarget:

            function(){

                return {

                    targetId:
                        completedTargetId,

                    networkId:
                        completedNetworkId
                };
            },


        getLastCompletionAt:

            function(){

                return lastCompletionAt;
            }
    };


    // =================================================
    // EXPOSITION GLOBALE
    // =================================================

    window.FOBASWiFiMissionCompletion =
        API;


    // =================================================
    // EXPOSITION DANS FOBAS.WIFI
    // =================================================

    window.FOBAS =
        window.FOBAS || {};

    window.FOBAS.wifi =
        window.FOBAS.wifi || {};

    window.FOBAS.wifi.missionCompletion =
        API;


    // =================================================
    // INITIALISATION AUTOMATIQUE
    // =================================================

    initialize();


    // =================================================
    // CONFIRMATION TECHNIQUE
    // =================================================

    console.log(
        "[FOBAS WiFi Mission Completion] " +
        "Module initialisé avec succès.",
        {
            actionId:
                ACTION_ID,

            requiredState:
                REQUIRED_STATE,

            resultState:
                RESULT_STATE,

            validationKey:
                VALIDATION_KEY,

            virtual:
                true
        }
    );


})();















/* =========================================================
   FOBAS WIFI PRACTICAL SELECTION PANEL
   SAFE UI ADD-ON v1.0.0

   OBJECTIVE:
   - Does NOT replace the Wi-Fi renderer.
   - Does NOT modify the Core Engine.
   - Does NOT modify existing Wi-Fi scan logic.
   - Does NOT create a second Wi-Fi simulation.
   - Displays the practical panel only after a
     virtual Wi-Fi network is selected.

   IMPORTANT:
   - 100% virtual simulation.
   - No real Wi-Fi operation.
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       CONFIGURATION
    ====================================================== */

    const CONTAINER_ID =
        "wifiLabContainer";

    const PANEL_ID =
        "fobasWifiPracticalPanel";

    const STYLE_ID =
        "fobasWifiPracticalPanelStyle";


    /* =====================================================
       INTERNAL STATE
    ====================================================== */

    let selectedNetwork =
        null;


    /* =====================================================
       GET WIFI CONTAINER
    ====================================================== */

    function getWiFiContainer() {

        return document.getElementById(
            CONTAINER_ID
        );

    }


    /* =====================================================
       GET WIFI NETWORK DATA
       Uses the existing virtual Wi-Fi data whenever
       available.
    ====================================================== */

    function getAvailableNetworks() {

        try {

            if (
                window.FOBASCybersecuritySimulation &&
                window.FOBASCybersecuritySimulation.wifi &&
                Array.isArray(
                    window.FOBASCybersecuritySimulation.wifi.networks
                )
            ) {

                return (
                    window.FOBASCybersecuritySimulation.wifi.networks
                );

            }

        } catch (error) {

            console.warn(
                "[FOBAS Wi-Fi Panel] Unable to read Core Wi-Fi networks.",
                error
            );

        }


        try {

            if (
                window.FOBAS &&
                window.FOBAS.wifi &&
                Array.isArray(
                    window.FOBAS.wifi.networks
                )
            ) {

                return (
                    window.FOBAS.wifi.networks
                );

            }

        } catch (error) {

            console.warn(
                "[FOBAS Wi-Fi Panel] Unable to read FOBAS Wi-Fi networks.",
                error
            );

        }


        return [];

    }


    /* =====================================================
       NORMALIZE TEXT
    ====================================================== */

    function normalizeText(value) {

        return String(
            value || ""
        )
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();

    }


    /* =====================================================
       FIND NETWORK FROM CLICKED ELEMENT
    ====================================================== */

    function findNetworkFromElement(
        element
    ) {

        const networks =
            getAvailableNetworks();


        if (
            !networks.length ||
            !element
        ) {

            return null;

        }


        /*
         * First try explicit data attributes.
         */

        let current =
            element;


        for (
            let depth = 0;
            current &&
            depth < 8;
            depth += 1
        ) {

            const networkId =
                current.dataset
                    ? (
                        current.dataset.networkId ||
                        current.dataset.targetId
                    )
                    : null;


            if (networkId) {

                const found =
                    networks.find(
                        function (network) {

                            return (
                                String(
                                    network.id ||
                                    network.networkId ||
                                    network.targetId
                                ) ===
                                String(networkId)
                            );

                        }
                    );


                if (found) {

                    return found;

                }

            }


            current =
                current.parentElement;

        }


        /*
         * Second method:
         * Match the SSID contained in the clicked
         * network element.
         */

        current =
            element;


        for (
            let depth = 0;
            current &&
            depth < 8;
            depth += 1
        ) {

            const text =
                normalizeText(
                    current.textContent
                );


            if (text) {

                const found =
                    networks.find(
                        function (network) {

                            const ssid =
                                normalizeText(
                                    network.ssid ||
                                    network.SSID ||
                                    network.name
                                );


                            if (!ssid) {

                                return false;

                            }


                            return text.includes(
                                ssid
                            );

                        }
                    );


                if (found) {

                    return found;

                }

            }


            current =
                current.parentElement;

        }


        /*
         * Third method:
         * If the existing renderer uses a table,
         * compare the clicked row with the known
         * SSIDs.
         */

        const row =
            element.closest
                ? element.closest("tr")
                : null;


        if (row) {

            const rowText =
                normalizeText(
                    row.textContent
                );


            const found =
                networks.find(
                    function (network) {

                        const ssid =
                            normalizeText(
                                network.ssid ||
                                network.SSID ||
                                network.name
                            );


                        return (
                            ssid &&
                            rowText.includes(ssid)
                        );

                    }
                );


            if (found) {

                return found;

            }

        }


        return null;

    }


    /* =====================================================
       NORMALIZE NETWORK OBJECT
    ====================================================== */

    function normalizeNetwork(
        network
    ) {

        if (!network) {

            return null;

        }


        return {

            id:
                network.id ||
                network.networkId ||
                network.targetId ||
                null,

            targetId:
                network.targetId ||
                network.id ||
                network.networkId ||
                null,

            ssid:
                network.ssid ||
                network.SSID ||
                network.name ||
                "Réseau Wi-Fi virtuel",

            bssid:
                network.bssid ||
                network.BSSID ||
                "—",

            channel:
                network.channel ||
                network.channelNumber ||
                network.chan ||
                "—",

            encryption:
                network.encryption ||
                network.security ||
                network.securityType ||
                "—",

            signal:
                network.signal ||
                network.signalStrength ||
                network.rssi ||
                "—"

        };

    }


    /* =====================================================
       CREATE STYLE
    ====================================================== */

    function installStyles() {

        if (
            document.getElementById(
                STYLE_ID
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            STYLE_ID;


        style.textContent = `

            #${PANEL_ID} {

                width:100%;

                margin:28px 0 0;

                padding:0;

                box-sizing:border-box;

                animation:
                    fobasWifiPanelIn
                    240ms
                    ease
                    both;

            }


            #${PANEL_ID}
            .fobasWifiPanelShell {

                width:100%;

                box-sizing:border-box;

                padding:22px;

                border:1px solid
                    rgba(76,201,240,0.25);

                border-radius:18px;

                background:
                    linear-gradient(
                        145deg,
                        rgba(8,20,34,0.98),
                        rgba(5,12,23,0.98)
                    );

                box-shadow:
                    0 20px 50px
                    rgba(0,0,0,0.35),

                    inset 0 1px 0
                    rgba(255,255,255,0.04);

                color:#eaf8ff;

                box-sizing:border-box;

            }


            #${PANEL_ID}
            .fobasWifiPanelHeader {

                display:flex;

                align-items:flex-start;

                justify-content:space-between;

                gap:18px;

                margin-bottom:20px;

            }


            #${PANEL_ID}
            .fobasWifiPanelEyebrow {

                display:block;

                margin-bottom:7px;

                color:#4cc9f0;

                font-size:10px;

                font-weight:900;

                letter-spacing:1.8px;

                text-transform:uppercase;

            }


            #${PANEL_ID}
            .fobasWifiPanelTitle {

                margin:0;

                color:#ffffff;

                font-size:20px;

                line-height:1.25;

                font-weight:900;

            }


            #${PANEL_ID}
            .fobasWifiPanelSubtitle {

                margin:7px 0 0;

                color:#91a9bc;

                font-size:12px;

                line-height:1.6;

            }


            #${PANEL_ID}
            .fobasWifiTargetBadge {

                flex:0 0 auto;

                padding:7px 10px;

                border:1px solid
                    rgba(76,201,240,0.28);

                border-radius:999px;

                background:
                    rgba(76,201,240,0.08);

                color:#4cc9f0;

                font-size:9px;

                font-weight:900;

                letter-spacing:1px;

                white-space:nowrap;

            }


            #${PANEL_ID}
            .fobasWifiTargetGrid {

                display:grid;

                grid-template-columns:
                    repeat(5, minmax(0, 1fr));

                gap:10px;

                margin-bottom:20px;

            }


            #${PANEL_ID}
            .fobasWifiTargetItem {

                min-width:0;

                padding:13px;

                border:1px solid
                    rgba(255,255,255,0.07);

                border-radius:12px;

                background:
                    rgba(255,255,255,0.025);

            }


            #${PANEL_ID}
            .fobasWifiTargetLabel {

                display:block;

                margin-bottom:6px;

                color:#71899c;

                font-size:9px;

                font-weight:800;

                letter-spacing:1px;

                text-transform:uppercase;

            }


            #${PANEL_ID}
            .fobasWifiTargetValue {

                display:block;

                overflow:hidden;

                color:#f4fbff;

                font-size:12px;

                font-weight:800;

                text-overflow:ellipsis;

                white-space:nowrap;

            }


            #${PANEL_ID}
            .fobasWifiMission {

                padding:17px;

                border:1px solid
                    rgba(76,201,240,0.14);

                border-radius:14px;

                background:
                    rgba(76,201,240,0.035);

            }


            #${PANEL_ID}
            .fobasWifiMissionTitle {

                margin:0 0 13px;

                color:#ffffff;

                font-size:11px;

                font-weight:900;

                letter-spacing:1.2px;

                text-transform:uppercase;

            }


            #${PANEL_ID}
            .fobasWifiSteps {

                display:grid;

                grid-template-columns:
                    repeat(7, minmax(0, 1fr));

                gap:7px;

            }


            #${PANEL_ID}
            .fobasWifiStep {

                min-height:58px;

                display:flex;

                flex-direction:column;

                align-items:center;

                justify-content:center;

                gap:5px;

                padding:8px 5px;

                border:1px solid
                    rgba(255,255,255,0.06);

                border-radius:10px;

                background:
                    rgba(255,255,255,0.025);

                color:#667d90;

                text-align:center;

            }


            #${PANEL_ID}
            .fobasWifiStepNumber {

                font-size:10px;

                font-weight:900;

            }


            #${PANEL_ID}
            .fobasWifiStepName {

                font-size:8px;

                font-weight:800;

                line-height:1.2;

            }


            #${PANEL_ID}
            .fobasWifiActionArea {

                margin-top:17px;

                display:flex;

                align-items:center;

                justify-content:space-between;

                gap:15px;

                padding-top:17px;

                border-top:1px solid
                    rgba(255,255,255,0.06);

            }


            #${PANEL_ID}
            .fobasWifiActionText {

                color:#91a9bc;

                font-size:11px;

                line-height:1.5;

            }


            #${PANEL_ID}
            .fobasWifiActionButton {

                flex:0 0 auto;

                border:1px solid
                    rgba(76,201,240,0.38);

                border-radius:10px;

                padding:11px 16px;

                background:
                    rgba(76,201,240,0.10);

                color:#4cc9f0;

                font-family:inherit;

                font-size:10px;

                font-weight:900;

                letter-spacing:0.8px;

                cursor:pointer;

                transition:
                    transform 160ms ease,
                    background 160ms ease,
                    border-color 160ms ease;

            }


            #${PANEL_ID}
            .fobasWifiActionButton:hover {

                transform:translateY(-1px);

                background:
                    rgba(76,201,240,0.17);

                border-color:
                    rgba(76,201,240,0.62);

            }


            @keyframes fobasWifiPanelIn {

                from {

                    opacity:0;

                    transform:
                        translateY(10px);

                }

                to {

                    opacity:1;

                    transform:
                        translateY(0);

                }

            }


            @media (max-width: 900px) {

                #${PANEL_ID}
                .fobasWifiTargetGrid {

                    grid-template-columns:
                        repeat(2, minmax(0, 1fr));

                }


                #${PANEL_ID}
                .fobasWifiSteps {

                    grid-template-columns:
                        repeat(4, minmax(0, 1fr));

                }

            }


            @media (max-width: 560px) {

                #${PANEL_ID} {

                    margin-top:20px;

                }


                #${PANEL_ID}
                .fobasWifiPanelShell {

                    padding:16px;

                    border-radius:14px;

                }


                #${PANEL_ID}
                .fobasWifiPanelHeader {

                    flex-direction:column;

                }


                #${PANEL_ID}
                .fobasWifiTargetGrid {

                    grid-template-columns:
                        1fr 1fr;

                }


                #${PANEL_ID}
                .fobasWifiSteps {

                    grid-template-columns:
                        repeat(2, minmax(0, 1fr));

                }


                #${PANEL_ID}
                .fobasWifiActionArea {

                    flex-direction:column;

                    align-items:stretch;

                }


                #${PANEL_ID}
                .fobasWifiActionButton {

                    width:100%;

                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* =====================================================
       CREATE PRACTICAL PANEL
    ====================================================== */

    function renderPanel(
        network
    ) {

        const container =
            getWiFiContainer();


        if (
            !container ||
            !network
        ) {

            return false;

        }


        const normalized =
            normalizeNetwork(
                network
            );


        if (!normalized) {

            return false;

        }


        selectedNetwork =
            normalized;


        installStyles();


        let panel =
            document.getElementById(
                PANEL_ID
            );


        if (!panel) {

            panel =
                document.createElement(
                    "section"
                );


            panel.id =
                PANEL_ID;


            panel.setAttribute(
                "aria-label",
                "Espace pratique Wi-Fi"
            );


            container.appendChild(
                panel
            );

        }


        panel.innerHTML = `

            <div
                class="fobasWifiPanelShell"
            >

                <div
                    class="fobasWifiPanelHeader"
                >

                    <div>

                        <span
                            class="fobasWifiPanelEyebrow"
                        >
                            LABORATOIRE 01 · ESPACE PRATIQUE
                        </span>

                        <h3
                            class="fobasWifiPanelTitle"
                        >
                            Poste d'analyse Wi-Fi virtuel
                        </h3>

                        <p
                            class="fobasWifiPanelSubtitle"
                        >
                            Cible virtuelle sélectionnée.
                            L'élève peut maintenant commencer
                            le parcours pédagogique d'analyse
                            et de renforcement.
                        </p>

                    </div>

                    <span
                        class="fobasWifiTargetBadge"
                    >
                        CIBLE SÉLECTIONNÉE
                    </span>

                </div>


                <div
                    class="fobasWifiTargetGrid"
                >

                    <div
                        class="fobasWifiTargetItem"
                    >

                        <span
                            class="fobasWifiTargetLabel"
                        >
                            SSID
                        </span>

                        <span
                            class="fobasWifiTargetValue"
                            title="${escapeHtml(normalized.ssid)}"
                        >
                            ${escapeHtml(normalized.ssid)}
                        </span>

                    </div>


                    <div
                        class="fobasWifiTargetItem"
                    >

                        <span
                            class="fobasWifiTargetLabel"
                        >
                            BSSID
                        </span>

                        <span
                            class="fobasWifiTargetValue"
                            title="${escapeHtml(normalized.bssid)}"
                        >
                            ${escapeHtml(normalized.bssid)}
                        </span>

                    </div>


                    <div
                        class="fobasWifiTargetItem"
                    >

                        <span
                            class="fobasWifiTargetLabel"
                        >
                            Canal
                        </span>

                        <span
                            class="fobasWifiTargetValue"
                        >
                            ${escapeHtml(normalized.channel)}
                        </span>

                    </div>


                    <div
                        class="fobasWifiTargetItem"
                    >

                        <span
                            class="fobasWifiTargetLabel"
                        >
                            Chiffrement
                        </span>

                        <span
                            class="fobasWifiTargetValue"
                            title="${escapeHtml(normalized.encryption)}"
                        >
                            ${escapeHtml(normalized.encryption)}
                        </span>

                    </div>


                    <div
                        class="fobasWifiTargetItem"
                    >

                        <span
                            class="fobasWifiTargetLabel"
                        >
                            Signal
                        </span>

                        <span
                            class="fobasWifiTargetValue"
                        >
                            ${escapeHtml(normalized.signal)}
                        </span>

                    </div>

                </div>


                <div
                    class="fobasWifiMission"
                >

                    <p
                        class="fobasWifiMissionTitle"
                    >
                        PARCOURS DE LA MISSION
                    </p>


                    <div
                        class="fobasWifiSteps"
                    >

                        <div class="fobasWifiStep">

                            <span
                                class="fobasWifiStepNumber"
                            >
                                1
                            </span>

                            <span
                                class="fobasWifiStepName"
                            >
                                Cible
                            </span>

                        </div>


                        <div class="fobasWifiStep">

                            <span
                                class="fobasWifiStepNumber"
                            >
                                2
                            </span>

                            <span
                                class="fobasWifiStepName"
                            >
                                Analyse
                            </span>

                        </div>


                        <div class="fobasWifiStep">

                            <span
                                class="fobasWifiStepNumber"
                            >
                                3
                            </span>

                            <span
                                class="fobasWifiStepName"
                            >
                                Évaluation
                            </span>

                        </div>


                        <div class="fobasWifiStep">

                            <span
                                class="fobasWifiStepNumber"
                            >
                                4
                            </span>

                            <span
                                class="fobasWifiStepName"
                            >
                                Inspection
                            </span>

                        </div>


                        <div class="fobasWifiStep">

                            <span
                                class="fobasWifiStepNumber"
                            >
                                5
                            </span>

                            <span
                                class="fobasWifiStepName"
                            >
                                Durcissement
                            </span>

                        </div>


                        <div class="fobasWifiStep">

                            <span
                                class="fobasWifiStepNumber"
                            >
                                6
                            </span>

                            <span
                                class="fobasWifiStepName"
                            >
                                Vérification
                            </span>

                        </div>


                        <div class="fobasWifiStep">

                            <span
                                class="fobasWifiStepNumber"
                            >
                                7
                            </span>

                            <span
                                class="fobasWifiStepName"
                            >
                                Mission
                            </span>

                        </div>

                    </div>


                    <div
                        class="fobasWifiActionArea"
                    >

                        <div
                            class="fobasWifiActionText"
                        >
                            Cible prête.
                            L'étape suivante consiste
                            à analyser virtuellement
                            sa sécurité.
                        </div>


                        <button
                            type="button"
                            class="fobasWifiActionButton"
                            id="fobasWifiAnalyzeButton"
                        >
                            ANALYZE TARGET
                        </button>

                    </div>

                </div>

            </div>

        `;


        const analyzeButton =
            document.getElementById(
                "fobasWifiAnalyzeButton"
            );


        if (analyzeButton) {

            analyzeButton.addEventListener(
                "click",
                function () {

                    runAnalysis();

                }
            );

        }


        /*
         * Keep the practical panel visible.
         */

        window.setTimeout(
            function () {

                try {

                    panel.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest"
                    });

                } catch (error) {

                    /* Silent compatibility fallback. */

                }

            },
            40
        );


        return true;

    }


    /* =====================================================
       HTML ESCAPE
    ====================================================== */

    function escapeHtml(
        value
    ) {

        return String(
            value === null ||
            value === undefined
                ? "—"
                : value
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =====================================================
       REGISTER TARGET WITH EXISTING SELECTION ENGINE
    ====================================================== */

    function registerTargetSelection(
        network
    ) {

        const targetId =
            network.targetId ||
            network.id;


        if (!targetId) {

            return;

        }


        try {

            if (
                window.FOBASWiFiTargetSelection &&
                typeof
                    window.FOBASWiFiTargetSelection.recordSelection ===
                    "function"
            ) {

                window.FOBASWiFiTargetSelection
                    .recordSelection(
                        targetId
                    );

                return;

            }

        } catch (error) {

            console.warn(
                "[FOBAS Wi-Fi Panel] Target selection bridge unavailable.",
                error
            );

        }

    }


    /* =====================================================
       ANALYZE BUTTON
       Only launches the existing virtual analysis
       engine when available.
    ====================================================== */

    function runAnalysis() {

        if (!selectedNetwork) {

            return;

        }


        registerTargetSelection(
            selectedNetwork
        );


        try {

            if (
                window.FOBASWiFiTargetAnalysis &&
                typeof
                    window.FOBASWiFiTargetAnalysis
                        .analyzeSelectedTarget ===
                    "function"
            ) {

                const result =
                    window.FOBASWiFiTargetAnalysis
                        .analyzeSelectedTarget();


                if (result) {

                    updateActionMessage(
                        "Analyse virtuelle terminée. L'étape suivante est l'évaluation de sécurité."
                    );

                }

                return;

            }

        } catch (error) {

            console.error(
                "[FOBAS Wi-Fi Panel] Virtual analysis failed:",
                error
            );

        }


        updateActionMessage(
            "Le moteur d'analyse virtuelle est en attente de connexion."
        );

    }


    /* =====================================================
       UPDATE ACTION MESSAGE
    ====================================================== */

    function updateActionMessage(
        message
    ) {

        const element =
            document.querySelector(
                "#" +
                PANEL_ID +
                " .fobasWifiActionText"
            );


        if (element) {

            element.textContent =
                message;

        }

    }


    /* =====================================================
       NETWORK CLICK HANDLER
       Event delegation means this also works when
       the five networks are dynamically rendered later.
    ====================================================== */

    function handleNetworkClick(
        event
    ) {

        const container =
            getWiFiContainer();


        if (
            !container
        ) {

            return;

        }


        /*
         * Do not interfere with buttons inside
         * the practical panel itself.
         */

        if (
            event.target.closest &&
            event.target.closest(
                "#" + PANEL_ID
            )
        ) {

            return;

        }


        const network =
            findNetworkFromElement(
                event.target
            );


        if (!network) {

            return;

        }


        const normalized =
            normalizeNetwork(
                network
            );


        if (!normalized) {

            return;

        }


        registerTargetSelection(
            normalized
        );


        renderPanel(
            normalized
        );

    }


    /* =====================================================
       INITIALIZATION
    ====================================================== */

    function initialize() {

        const container =
            getWiFiContainer();


        if (!container) {

            return;

        }


        /*
         * Event delegation.
         * No modification of existing network renderer.
         */

        if (
            container.dataset
                .fobasPracticalPanelBound !==
            "true"
        ) {

            container.addEventListener(
                "click",
                handleNetworkClick
            );


            container.dataset
                .fobasPracticalPanelBound =
                "true";

        }


        console.log(
            "[FOBAS Wi-Fi Practical Panel] Ready."
        );

    }


    /* =====================================================
       PUBLIC API
    ====================================================== */

    window.FOBASWiFiPracticalPanel = {

        version:
            "1.0.0",

        initialize:
            initialize,

        getSelectedNetwork:
            function () {

                return selectedNetwork;

            },

        showForNetwork:
            function (network) {

                if (!network) {

                    return false;

                }


                const normalized =
                    normalizeNetwork(
                        network
                    );


                if (!normalized) {

                    return false;

                }


                registerTargetSelection(
                    normalized
                );


                return renderPanel(
                    normalized
                );

            },

        hide:
            function () {

                const panel =
                    document.getElementById(
                        PANEL_ID
                    );


                if (panel) {

                    panel.remove();

                }


                selectedNetwork =
                    null;

            }

    };


    /* =====================================================
       SAFE START
    ====================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once:true
            }
        );

    } else {

        initialize();

    }


})();




