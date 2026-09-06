
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
```

### ⚠️ Yon detay enpòtan nan premye vèsyon sa a

Mwen fè `wifi.scan` la kòm yon **Bridge/Observer**, li **pa lanse scan lan yon dezyèm fwa**.

Sa enpòtan anpil paske Wi-Fi Lab Engine ou genyen deja gen pwòp:

```js
FOBAS.wifi.scan()
```

Si nou ta fè nouvo bridge la rele `scan()` epi ansyen bouton an rele `scan()` tou, nou ta riske fè **double execution**.

Se poutèt sa achitekti a kounye a se:

```text
Klike SCAN
      ↓
Cyber Action Bridge
      ↓
anrejistre:
wifi.scan
      ↓
Wi-Fi Lab Engine ki deja egziste
      ↓
scan virtuel la egzekite
```

Sa pwoteje travay Phase 2 a pandan nou kòmanse konstwi metadata/action layer Phase 3 a.

### Sa nou dwe verifye apre ou mete blok la

Lè paj la chaje, console la dwe montre:

```text
[FOBAS Cyber Action Bridge] Initialized successfully. 1.0.0
```

Epi lè ou klike:

**SCAN VIRTUAL NETWORKS**

bridge la dwe anrejistre:

```text
simulationId:
fobas-ethical-hacking-simulation

labId:
wifi

actionId:
wifi.scan

actionType:
scan

target:
virtual_networks

validationKey:
WIFI_SCAN_COMPLETED
```

**Scan lan dwe kontinye mache menm jan li te mache anvan.**

Apre sa, pwochen blok nou pa bezwen kreye ankò jiskaske `wifi.scan` sa a konfime li mache; pwochen aksyon teknik la ap se **`wifi.select_target`**, kote nou pral bay chak rezo yon `targetId` estab epi fè seleksyon elèv la vin yon vrè simulation action.