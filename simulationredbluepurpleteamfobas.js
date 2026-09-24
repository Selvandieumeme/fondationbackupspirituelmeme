/* ============================================================
   WHITEHAT CYBERRANGE
   Red / Blue / Purple Team Wireless Security Training
   simulationredbluepurpleteamfobas.js
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     APPLICATION STATE
  ========================================================== */

  const state = {
    scanning: false,
    scanTimer: null,

    selectedTarget: null,

    networks: [],

    events: [],

    findings: [],

    controlsFixed: 0,

    detectionEvents: 0,

    containment: 100,

    risk: 18,

    retest: false,

    credentialChecked: false,

    credentialAvailable: false,

    fingerprinted: false,

    workflowRunning: false,

    zoom: 1,

    reportGenerated: false
  };


  /* ==========================================================
     DEMO LAB DATA
     ----------------------------------------------------------
     These are synthetic training targets.
     No real Wi-Fi credentials are recovered.
  ========================================================== */

  const LAB_NETWORKS = [
    {
      ssid: "WHITEHAT-LAB",
      bssid: "AA:BB:CC:11:22:33",
      protocol: "WPA2-Personal",
      signal: "Excellent",
      profile: "strong",
      scenario: "credential"
    },

    {
      ssid: "CYBERRANGE-WPA3",
      bssid: "AA:BB:CC:44:55:66",
      protocol: "WPA3-Personal",
      signal: "Good",
      profile: "strong",
      scenario: "auth-anomaly"
    },

    {
      ssid: "TRAINING-WIFI",
      bssid: "AA:BB:CC:77:88:99",
      protocol: "WPA2-Personal",
      signal: "Good",
      profile: "weak",
      scenario: "credential"
    },

    {
      ssid: "PURPLE-TEAM-LAB",
      bssid: "AA:BB:CC:10:20:30",
      protocol: "WPA3-Personal",
      signal: "Weak",
      profile: "strong",
      scenario: "rogue-ap"
    }
  ];


  /* ==========================================================
     DOM HELPERS
  ========================================================== */

  const $ = (id) => document.getElementById(id);

  const qs = (selector) =>
    document.querySelector(selector);

  const qsa = (selector) =>
    Array.from(document.querySelectorAll(selector));


  /* ==========================================================
     ELEMENT REFERENCES
  ========================================================== */

  const el = {
    systemStatus: $("systemStatus"),
    systemDot: $("systemDot"),

    scanBtn: $("scanWifiBtn"),
    stopScanBtn: $("stopScanBtn"),
    scanIndicator: $("scanIndicator"),
    scanStatusText: $("scanStatusText"),
    networkCount: $("networkCount"),
    wifiResults: $("wifiResults"),

    clearTargetBtn: $("clearTargetBtn"),

    ssid: $("ssid"),
    bssid: $("bssid"),
    protocol: $("protocol"),
    signal: $("signal"),
    credentialProfile: $("credentialProfile"),
    scenario: $("scenario"),

    targetName: $("targetName"),
    securityName: $("securityName"),
    targetState: $("targetState"),

    riskMetric: $("riskMetric"),
    riskScore: $("riskScore"),
    detectMetric: $("detectMetric"),
    detectScore: $("detectScore"),
    containMetric: $("containMetric"),
    retestMetric: $("retestMetric"),
    retestScore: $("retestScore"),
    riskBar: $("riskBar"),

    fingerprintBtn: $("fingerprintBtn"),
    fpSsid: $("fpSsid"),
    fpBssid: $("fpBssid"),
    fpSecurity: $("fpSecurity"),
    fpSignal: $("fpSignal"),
    fpIdentity: $("fpIdentity"),
    fpState: $("fpState"),

    credentialRecoveryBtn: $("credentialRecoveryBtn"),
    credentialSource: $("credentialSource"),
    credentialStatus: $("credentialStatus"),
    credentialResult: $("credentialResult"),

    console: $("console"),
    clearConsole: $("clearConsole"),
    commandInput: $("commandInput"),
    runCommand: $("runCommand"),

    timeline: $("timeline"),

    generateReportBtn: $("generateReportBtn"),
    exportBtn: $("exportBtn"),

    reportProtocol: $("reportProtocol"),
    reportTarget: $("reportTarget"),
    reportFindings: $("reportFindings"),
    reportControls: $("reportControls"),
    reportRetest: $("reportRetest"),
    reportRisk: $("reportRisk"),
    reportConclusion: $("reportConclusion"),
    reportFindingList: $("reportFindingList")
  };


  /* ==========================================================
     INITIALIZATION
  ========================================================== */

  function init() {

    setSystemStatus("LAB READY");

    bindEvents();

    updateTargetFromForm();

    updateTelemetry();

    printConsole(
      "WHITEHAT CYBERRANGE initialized."
    );

    printConsole(
      "Training environment ready."
    );

    printConsole(
      "Type 'help' to display available lab commands."
    );

    addTimeline(
      "SYSTEM",
      "CyberRange initialized",
      "LAB READY"
    );

    renderNetworks();

    setupMobileGestures();
  }


  /* ==========================================================
     EVENT BINDINGS
  ========================================================== */

  function bindEvents() {

    el.scanBtn?.addEventListener(
      "click",
      startWifiScan
    );

    el.stopScanBtn?.addEventListener(
      "click",
      stopWifiScan
    );

    el.clearTargetBtn?.addEventListener(
      "click",
      clearTarget
    );

    el.fingerprintBtn?.addEventListener(
      "click",
      fingerprintTarget
    );

    el.credentialRecoveryBtn?.addEventListener(
      "click",
      checkSavedCredential
    );

    el.clearConsole?.addEventListener(
      "click",
      clearConsole
    );

    el.runCommand?.addEventListener(
      "click",
      runConsoleCommand
    );

    el.commandInput?.addEventListener(
      "keydown",
      (event) => {

        if (event.key === "Enter") {
          runConsoleCommand();
        }

      }
    );

    el.generateReportBtn?.addEventListener(
      "click",
      generateReport
    );

    el.exportBtn?.addEventListener(
      "click",
      exportReport
    );


    [
      el.ssid,
      el.bssid,
      el.protocol,
      el.signal,
      el.credentialProfile,
      el.scenario
    ].forEach((input) => {

      input?.addEventListener(
        "input",
        updateTargetFromForm
      );

      input?.addEventListener(
        "change",
        updateTargetFromForm
      );

    });


    qsa(".action").forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          const command =
            button.dataset.cmd;

          executeTeamAction(command);

        }
      );

    });
  }


  /* ==========================================================
     SYSTEM STATUS
  ========================================================== */

  function setSystemStatus(
    text,
    mode = "ready"
  ) {

    if (el.systemStatus) {
      el.systemStatus.textContent = text;
    }

    if (!el.systemDot) return;

    el.systemDot.classList.remove(
      "ready",
      "warning",
      "danger",
      "active"
    );

    el.systemDot.classList.add(mode);
  }


  /* ==========================================================
     WIFI DISCOVERY
  ========================================================== */

  function startWifiScan() {

    if (state.scanning) return;

    state.scanning = true;

    state.networks = [];

    renderNetworks();

    setSystemStatus(
      "SCANNING",
      "active"
    );

    if (el.scanStatusText) {
      el.scanStatusText.textContent =
        "Scanning authorized training environment...";
    }

    el.scanIndicator?.classList.add(
      "active"
    );

    printConsole(
      "Starting wireless discovery..."
    );

    addTimeline(
      "DISCOVERY",
      "Wi-Fi discovery started",
      "RUNNING"
    );


    let index = 0;

    state.scanTimer = setInterval(() => {

      if (index >= LAB_NETWORKS.length) {

        finishWifiScan();

        return;
      }

      state.networks.push(
        {
          ...LAB_NETWORKS[index]
        }
      );

      renderNetworks();

      index++;

    }, 650);
  }


  function finishWifiScan() {

    stopWifiScan(false);

    setSystemStatus(
      "LAB READY",
      "ready"
    );

    if (el.scanStatusText) {
      el.scanStatusText.textContent =
        "Discovery complete";
    }

    printConsole(
      `${state.networks.length} training networks discovered.`
    );

    addTimeline(
      "DISCOVERY",
      "Wireless discovery completed",
      `${state.networks.length} targets`
    );
  }


  function stopWifiScan(log = true) {

    if (state.scanTimer) {

      clearInterval(
        state.scanTimer
      );

      state.scanTimer = null;
    }

    state.scanning = false;

    el.scanIndicator?.classList.remove(
      "active"
    );

    if (el.scanStatusText) {
      el.scanStatusText.textContent =
        "Ready to scan";
    }

    if (log) {

      printConsole(
        "Wireless discovery stopped."
      );

      addTimeline(
        "DISCOVERY",
        "Wireless discovery stopped",
        "STOPPED"
      );
    }
  }


  function renderNetworks() {

    if (!el.wifiResults) return;

    el.wifiResults.innerHTML = "";

    if (!state.networks.length) {

      const empty =
        document.createElement("div");

      empty.className =
        "empty-state";

      empty.innerHTML = `
        <strong>No networks discovered</strong>
        <p>
          Start a scan to populate the wireless environment.
        </p>
      `;

      el.wifiResults.appendChild(
        empty
      );

      if (el.networkCount) {
        el.networkCount.textContent = "0";
      }

      return;
    }


    state.networks.forEach(
      (network, index) => {

        const card =
          document.createElement("article");

        card.className =
          "wifi-card";

        card.innerHTML = `
          <div class="wifi-card-main">

            <div>
              <span class="mini-label">
                SSID
              </span>

              <strong>
                ${escapeHtml(network.ssid)}
              </strong>
            </div>

            <div>
              <span class="mini-label">
                BSSID
              </span>

              <span>
                ${escapeHtml(network.bssid)}
              </span>
            </div>

            <div>
              <span class="mini-label">
                SECURITY
              </span>

              <span>
                ${escapeHtml(network.protocol)}
              </span>
            </div>

            <div>
              <span class="mini-label">
                SIGNAL
              </span>

              <span>
                ${escapeHtml(network.signal)}
              </span>
            </div>

          </div>

          <button
            class="btn primary select-network"
            type="button"
            data-index="${index}"
          >
            Select Target
          </button>
        `;

        el.wifiResults.appendChild(
          card
        );
      }
    );


    qsa(".select-network").forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset.index
              );

            selectNetwork(
              state.networks[index]
            );

          }
        );
      }
    );


    if (el.networkCount) {
      el.networkCount.textContent =
        String(state.networks.length);
    }
  }


  function selectNetwork(network) {

    if (!network) return;

    state.selectedTarget = {
      ...network
    };

    if (el.ssid)
      el.ssid.value =
        network.ssid;

    if (el.bssid)
      el.bssid.value =
        network.bssid;

    if (el.protocol)
      el.protocol.value =
        network.protocol;

    if (el.signal)
      el.signal.value =
        network.signal;

    if (el.credentialProfile)
      el.credentialProfile.value =
        network.profile;

    if (el.scenario)
      el.scenario.value =
        network.scenario;

    updateTargetFromForm();

    printConsole(
      `Target selected: ${network.ssid}`
    );

    addTimeline(
      "TARGET",
      `Target selected: ${network.ssid}`,
      network.protocol
    );
  }


  /* ==========================================================
     TARGET WORKSPACE
  ========================================================== */

  function updateTargetFromForm() {

    const target = {
      ssid:
        el.ssid?.value.trim() ||
        "WHITEHAT-LAB",

      bssid:
        el.bssid?.value.trim() ||
        "AA:BB:CC:11:22:33",

      protocol:
        el.protocol?.value ||
        "WPA2-Personal",

      signal:
        el.signal?.value ||
        "Good",

      profile:
        el.credentialProfile?.value ||
        "strong",

      scenario:
        el.scenario?.value ||
        "credential"
    };

    state.selectedTarget =
      target;

    if (el.targetName)
      el.targetName.textContent =
        target.ssid;

    if (el.securityName)
      el.securityName.textContent =
        target.protocol;

    updateTargetState();
    updateTelemetry();
  }


  function updateTargetState() {

    const target =
      state.selectedTarget;

    if (!target) return;

    let status =
      "HARDENED";

    if (
      target.profile === "weak"
    ) {
      status =
        "TRAINING WEAKNESS";
    }

    if (target.scenario === "rogue-ap") {
      status =
        "MONITOR";
    }

    if (target.scenario === "auth-anomaly") {
      status =
        "MONITOR";
    }

    if (el.targetState) {

      el.targetState.textContent =
        status;

      el.targetState.classList.remove(
        "good-text"
      );

      if (
        status === "HARDENED"
      ) {
        el.targetState.classList.add(
          "good-text"
        );
      }
    }
  }


  function clearTarget() {

    state.selectedTarget = null;

    state.fingerprinted = false;

    if (el.ssid)
      el.ssid.value =
        "";

    if (el.bssid)
      el.bssid.value =
        "";

    if (el.fpSsid)
      el.fpSsid.textContent =
        "—";

    if (el.fpBssid)
      el.fpBssid.textContent =
        "—";

    if (el.fpSecurity)
      el.fpSecurity.textContent =
        "—";

    if (el.fpSignal)
      el.fpSignal.textContent =
        "—";

    if (el.fpIdentity)
      el.fpIdentity.textContent =
        "—";

    if (el.fpState)
      el.fpState.textContent =
        "—";

    if (el.targetName)
      el.targetName.textContent =
        "—";

    if (el.securityName)
      el.securityName.textContent =
        "—";

    if (el.targetState)
      el.targetState.textContent =
        "NO TARGET";

    printConsole(
      "Target workspace cleared."
    );

    addTimeline(
      "TARGET",
      "Target cleared",
      "READY"
    );
  }


  /* ==========================================================
     AP FINGERPRINT
  ========================================================== */

  function fingerprintTarget() {

    const target =
      state.selectedTarget;

    if (!target) {

      printConsole(
        "No target selected."
      );

      return;
    }

    state.fingerprinted = true;

    const identity =
      generateFingerprint(
        target
      );

    if (el.fpSsid)
      el.fpSsid.textContent =
        target.ssid;

    if (el.fpBssid)
      el.fpBssid.textContent =
        target.bssid;

    if (el.fpSecurity)
      el.fpSecurity.textContent =
        target.protocol;

    if (el.fpSignal)
      el.fpSignal.textContent =
        target.signal;

    if (el.fpIdentity)
      el.fpIdentity.textContent =
        identity;

    if (el.fpState)
      el.fpState.textContent =
        target.profile === "weak"
          ? "TRAINING FINDING"
          : "HARDENED";

    printConsole(
      `Fingerprint generated: ${identity}`
    );

    addTimeline(
      "FINGERPRINT",
      `AP fingerprint completed for ${target.ssid}`,
      identity
    );

    if (
      target.profile === "weak"
    ) {

      addFinding(
        "Credential security weakness",
        "Training profile is configured as weak.",
        "HIGH"
      );
    }
  }


  function generateFingerprint(target) {

    const input =
      [
        target.ssid,
        target.bssid,
        target.protocol,
        target.signal
      ].join("|");

    let hash = 0;

    for (
      let i = 0;
      i < input.length;
      i++
    ) {

      hash =
        (
          (hash << 5) -
          hash +
          input.charCodeAt(i)
        ) |
        0;
    }

    return (
      "AP-" +
      Math.abs(hash)
        .toString(16)
        .toUpperCase()
        .padStart(8, "0")
    );
  }


  /* ==========================================================
     AUTHORIZED CREDENTIAL CHECK
     ----------------------------------------------------------
     Browser-safe behavior:
     - does NOT extract Wi-Fi passwords
     - does NOT brute-force credentials
     - does NOT attack nearby networks
     - demonstrates how an authorized recovery adapter
       would report its state.
  ========================================================== */

  function checkSavedCredential() {

    const target =
      state.selectedTarget;

    if (!target) {

      printConsole(
        "Select a lab target first."
      );

      return;
    }

    state.credentialChecked = true;

    if (el.credentialSource)
      el.credentialSource.textContent =
        "Authorized lab adapter";

    if (el.credentialStatus)
      el.credentialStatus.textContent =
        "CHECKED";

    if (el.credentialResult)
      el.credentialResult.textContent =
        "Credential not exposed by browser";

    printConsole(
      `Credential check requested for ${target.ssid}.`
    );

    printConsole(
      "Browser sandbox prevents direct extraction of OS Wi-Fi credentials."
    );

    addTimeline(
      "CREDENTIAL",
      `Credential recovery check: ${target.ssid}`,
      "NO SECRET EXPOSED"
    );

    addFinding(
      "Credential exposure boundary",
      "The browser application does not expose operating-system Wi-Fi secrets.",
      "INFO"
    );

    updateTelemetry();
  }


  /* ==========================================================
     RED / BLUE / PURPLE ACTIONS
  ========================================================== */

  function executeTeamAction(command) {

    if (!state.selectedTarget) {

      printConsole(
        "Select a target before running a team action."
      );

      return;
    }


    switch (command) {

      case "recon":
        runRecon();
        break;

      case "enumerate":
        runEnumeration();
        break;

      case "validate":
        validateTrainingWeakness();
        break;

      case "evidence":
        collectEvidence();
        break;

      case "monitor":
        analyzeTelemetry();
        break;

      case "investigate":
        investigateIncident();
        break;

      case "contain":
        containIncident();
        break;

      case "harden":
        hardenControls();
        break;

      case "orchestrate":
        runPurpleExercise();
        break;

      case "retest":
        runRetest();
        break;

      case "report":
        generateReport();
        break;

      default:
        printConsole(
          `Unknown team action: ${command}`
        );
    }
  }


  /* ==========================================================
     RED TEAM
  ========================================================== */

  function runRecon() {

    const target =
      state.selectedTarget;

    printConsole(
      `[RED] Reconnaissance started: ${target.ssid}`
    );

    addTimeline(
      "RED",
      `Reconnaissance: ${target.ssid}`,
      "COMPLETED"
    );

    state.detectionEvents++;

    if (
      target.profile === "weak"
    ) {
      state.risk =
        Math.min(
          100,
          state.risk + 18
        );
    }

    updateTelemetry();
  }


  function runEnumeration() {

    const target =
      state.selectedTarget;

    printConsole(
      `[RED] Security posture enumeration: ${target.protocol}`
    );

    addTimeline(
      "RED",
      "Security posture enumerated",
      target.protocol
    );

    state.detectionEvents++;

    if (
      target.protocol === "WPA2-Personal" &&
      target.profile === "weak"
    ) {

      addFinding(
        "Weak training configuration",
        "Lab target uses the weak credential profile.",
        "HIGH"
      );
    }

    updateTelemetry();
  }


  function validateTrainingWeakness() {

    const target =
      state.selectedTarget;

    printConsole(
      "[RED] Validating configured training weakness..."
    );

    if (
      target.profile === "weak"
    ) {

      addFinding(
        "Training weakness validated",
        "The selected lab profile intentionally exposes a security weakness for assessment.",
        "HIGH"
      );

      printConsole(
        "[RED] Training weakness confirmed."
      );

    } else {

      printConsole(
        "[RED] No intentional weakness configured."
      );

      addFinding(
        "No intentional weakness",
        "Selected target is configured as hardened.",
        "INFO"
      );
    }

    state.detectionEvents++;

    updateTelemetry();
  }


  function collectEvidence() {

    printConsole(
      "[RED] Collecting assessment evidence..."
    );

    addTimeline(
      "EVIDENCE",
      "Red Team evidence collected",
      `${state.findings.length} findings`
    );

    state.detectionEvents++;

    updateTelemetry();
  }


  /* ==========================================================
     BLUE TEAM
  ========================================================== */

  function analyzeTelemetry() {

    printConsole(
      "[BLUE] Analyzing telemetry..."
    );

    state.detectionEvents++;

    addTimeline(
      "BLUE",
      "Telemetry analysis completed",
      `${state.detectionEvents} events`
    );

    updateTelemetry();
  }


  function investigateIncident() {

    printConsole(
      "[BLUE] Investigating detected activity..."
    );

    state.detectionEvents++;

    addTimeline(
      "BLUE",
      "Incident investigation completed",
      "EVIDENCE CORRELATED"
    );

    updateTelemetry();
  }


  function containIncident() {

    printConsole(
      "[BLUE] Applying simulated containment control..."
    );

    state.containment =
      Math.max(
        0,
        state.containment - 5
      );

    addTimeline(
      "BLUE",
      "Containment control applied",
      `${state.containment}%`
    );

    state.detectionEvents++;

    updateTelemetry();
  }


  function hardenControls() {

    printConsole(
      "[BLUE] Applying defensive hardening..."
    );

    state.controlsFixed =
      Math.min(
        3,
        state.controlsFixed + 1
      );

    state.risk =
      Math.max(
        5,
        state.risk - 12
      );

    addTimeline(
      "BLUE",
      "Defensive control hardened",
      `${state.controlsFixed}/3`
    );

    updateTelemetry();
  }


  /* ==========================================================
     PURPLE TEAM
  ========================================================== */

  async function runPurpleExercise() {

    if (state.workflowRunning) {
      return;
    }

    state.workflowRunning = true;

    printConsole(
      "[PURPLE] Starting coordinated exercise..."
    );

    addTimeline(
      "PURPLE",
      "Purple Team exercise started",
      "RUNNING"
    );

    const steps = [
      ["Reconnaissance", runRecon],
      ["Enumeration", runEnumeration],
      ["Detection", analyzeTelemetry],
      ["Investigation", investigateIncident],
      ["Containment", containIncident],
      ["Hardening", hardenControls],
      ["Evidence", collectEvidence]
    ];

    for (
      const [name, action] of steps
    ) {

      printConsole(
        `[PURPLE] ${name}...`
      );

      action();

      await delay(450);
    }

    printConsole(
      "[PURPLE] Exercise completed."
    );

    addTimeline(
      "PURPLE",
      "Purple Team exercise completed",
      "READY FOR RETEST"
    );

    state.workflowRunning = false;

    updateTelemetry();
  }


  /* ==========================================================
     RETEST
  ========================================================== */

  function runRetest() {

    const target =
      state.selectedTarget;

    if (!target) {

      printConsole(
        "Select a target before retesting."
      );

      return;
    }

    printConsole(
      "[PURPLE] Running defensive retest..."
    );

    const passed =
      state.controlsFixed >= 3 ||
      target.profile === "strong";

    state.retest = passed;

    if (passed) {

      printConsole(
        "[PURPLE] Retest PASSED."
      );

      addTimeline(
        "RETEST",
        "Defensive controls passed retest",
        "PASS"
      );

    } else {

      printConsole(
        "[PURPLE] Retest requires additional hardening."
      );

      addTimeline(
        "RETEST",
        "Defensive retest requires remediation",
        "REVIEW"
      );
    }

    updateTelemetry();
    generateReport();
  }


  /* ==========================================================
     TELEMETRY
  ========================================================== */

  function updateTelemetry() {

    const risk =
      calculateRisk();

    state.risk =
      Math.max(
        0,
        Math.min(
          100,
          risk
        )
      );


    let riskLabel =
      "LOW";

    if (state.risk >= 70) {
      riskLabel = "HIGH";
    } else if (state.risk >= 40) {
      riskLabel = "MEDIUM";
    }


    if (el.riskMetric)
      el.riskMetric.textContent =
        riskLabel;

    if (el.riskScore)
      el.riskScore.textContent =
        `${state.risk}/100`;

    if (el.riskBar) {

      el.riskBar.style.width =
        `${state.risk}%`;
    }


    if (el.detectMetric) {

      el.detectMetric.textContent =
        state.detectionEvents
          ? "ACTIVE"
          : "READY";
    }


    if (el.detectScore) {

      el.detectScore.textContent =
        `${state.detectionEvents} events`;
    }


    if (el.containMetric) {

      el.containMetric.textContent =
        `${state.containment}%`;
    }


    if (el.retestMetric) {

      el.retestMetric.textContent =
        state.retest
          ? "PASSED"
          : "PENDING";
    }


    if (el.retestScore) {

      el.retestScore.textContent =
        `${state.controlsFixed}/3 controls`;
    }


    updateReportPreview();
  }


  function calculateRisk() {

    let risk = 18;

    const target =
      state.selectedTarget;

    if (!target) {
      return risk;
    }

    if (
      target.profile === "weak"
    ) {
      risk += 35;
    }

    if (
      target.protocol === "WPA2-Personal"
    ) {
      risk += 5;
    }

    risk +=
      Math.min(
        20,
        state.findings.length * 5
      );

    risk -=
      state.controlsFixed * 10;

    if (state.retest) {
      risk -= 10;
    }

    return Math.max(
      5,
      Math.min(
        100,
        risk
      )
    );
  }


  /* ==========================================================
     FINDINGS
  ========================================================== */

  function addFinding(
    title,
    description,
    severity = "INFO"
  ) {

    const exists =
      state.findings.some(
        (finding) =>
          finding.title === title
      );

    if (exists) return;

    state.findings.push({
      id:
        cryptoSafeId(),

      title,

      description,

      severity,

      timestamp:
        new Date().toISOString()
    });

    addTimeline(
      "FINDING",
      title,
      severity
    );

    renderFindings();

    updateTelemetry();
  }


  function renderFindings() {

    if (!el.reportFindingList)
      return;

    el.reportFindingList.innerHTML =
      "";

    state.findings.forEach(
      (finding) => {

        const item =
          document.createElement("div");

        item.className =
          "finding-item";

        item.innerHTML = `
          <strong>
            ${escapeHtml(finding.title)}
          </strong>

          <span>
            ${escapeHtml(finding.severity)}
          </span>

          <p>
            ${escapeHtml(finding.description)}
          </p>
        `;

        el.reportFindingList.appendChild(
          item
        );
      }
    );
  }


  /* ==========================================================
     INCIDENT TIMELINE
  ========================================================== */

  function addTimeline(
    type,
    message,
    status
  ) {

    const event = {
      id:
        cryptoSafeId(),

      type,

      message,

      status,

      timestamp:
        new Date().toISOString()
    };

    state.events.push(event);

    if (!el.timeline) return;

    const item =
      document.createElement("div");

    item.className =
      "timeline-item";

    item.innerHTML = `
      <div class="timeline-marker">
        ${escapeHtml(type)}
      </div>

      <div class="timeline-content">

        <strong>
          ${escapeHtml(message)}
        </strong>

        <span>
          ${escapeHtml(status)}
        </span>

        <small>
          ${formatTime(event.timestamp)}
        </small>

      </div>
    `;

    el.timeline.prepend(
      item
    );
  }


  /* ==========================================================
     CONSOLE
  ========================================================== */

  function printConsole(
    message,
    type = "info"
  ) {

    if (!el.console) return;

    const line =
      document.createElement("div");

    line.className =
      `console-line ${type}`;

    line.innerHTML = `
      <span class="console-time">
        [${formatTime(new Date())}]
      </span>

      <span>
        ${escapeHtml(message)}
      </span>
    `;

    el.console.appendChild(
      line
    );

    el.console.scrollTop =
      el.console.scrollHeight;
  }


  function clearConsole() {

    if (el.console) {
      el.console.innerHTML =
        "";
    }

    printConsole(
      "Console cleared."
    );
  }


  /* ==========================================================
     COMMAND CONSOLE
  ========================================================== */

  function runConsoleCommand() {

    const raw =
      el.commandInput?.value.trim();

    if (!raw) return;

    printConsole(
      `lab@cyberrange:~$ ${raw}`,
      "command"
    );

    el.commandInput.value =
      "";

    const parts =
      raw.split(/\s+/);

    const command =
      parts[0].toLowerCase();


    switch (command) {

      case "help":
        commandHelp();
        break;

      case "status":
        commandStatus();
        break;

      case "scan":
        startWifiScan();
        break;

      case "stop":
        stopWifiScan();
        break;

      case "target":
        commandTarget(parts.slice(1));
        break;

      case "fingerprint":
        fingerprintTarget();
        break;

      case "credential":
        checkSavedCredential();
        break;

      case "recon":
        executeTeamAction("recon");
        break;

      case "enumerate":
        executeTeamAction("enumerate");
        break;

      case "validate":
        executeTeamAction("validate");
        break;

      case "evidence":
        executeTeamAction("evidence");
        break;

      case "monitor":
        executeTeamAction("monitor");
        break;

      case "investigate":
        executeTeamAction("investigate");
        break;

      case "contain":
        executeTeamAction("contain");
        break;

      case "harden":
        executeTeamAction("harden");
        break;

      case "purple":
        executeTeamAction("orchestrate");
        break;

      case "retest":
        executeTeamAction("retest");
        break;

      case "report":
        generateReport();
        break;

      case "clear":
        clearConsole();
        break;

      default:
        printConsole(
          `Unknown command: ${command}. Type help.`
        );
    }
  }


  function commandHelp() {

    const commands = [
      "help",
      "status",
      "scan",
      "stop",
      "target",
      "fingerprint",
      "credential",
      "recon",
      "enumerate",
      "validate",
      "evidence",
      "monitor",
      "investigate",
      "contain",
      "harden",
      "purple",
      "retest",
      "report",
      "clear"
    ];

    printConsole(
      "Available lab commands:"
    );

    commands.forEach(
      (command) => {

        printConsole(
          `  ${command}`
        );
      }
    );

    printConsole(
      "Credential command checks the authorized lab adapter boundary; it does not extract OS Wi-Fi passwords."
    );
  }


  function commandStatus() {

    const target =
      state.selectedTarget;

    printConsole(
      `Target: ${
        target
          ? target.ssid
          : "NONE"
      }`
    );

    printConsole(
      `Protocol: ${
        target
          ? target.protocol
          : "NONE"
      }`
    );

    printConsole(
      `Risk: ${state.risk}/100`
    );

    printConsole(
      `Findings: ${state.findings.length}`
    );

    printConsole(
      `Controls fixed: ${state.controlsFixed}/3`
    );

    printConsole(
      `Retest: ${
        state.retest
          ? "PASS"
          : "PENDING"
      }`
    );
  }


  function commandTarget(args) {

    const requested =
      args.join(" ").trim();

    if (!requested) {

      printConsole(
        "Usage: target <SSID>"
      );

      return;
    }

    const network =
      state.networks.find(
        (item) =>
          item.ssid.toLowerCase() ===
          requested.toLowerCase()
      );

    if (!network) {

      printConsole(
        `Target not found in current lab discovery: ${requested}`
      );

      return;
    }

    selectNetwork(network);
  }


  /* ==========================================================
     REPORTING
  ========================================================== */

  function generateReport() {

    const target =
      state.selectedTarget;

    if (!target) {

      printConsole(
        "Cannot generate report without a target."
      );

      return;
    }

    state.reportGenerated =
      true;

    updateReportPreview();

    addTimeline(
      "REPORT",
      "Security assessment generated",
      "READY"
    );

    printConsole(
      "Security assessment generated."
    );
  }


  function updateReportPreview() {

    const target =
      state.selectedTarget;

    if (!target) return;

    const risk =
      state.risk;

    let riskLabel =
      "LOW";

    if (risk >= 70) {
      riskLabel = "HIGH";
    } else if (risk >= 40) {
      riskLabel = "MEDIUM";
    }


    if (el.reportProtocol)
      el.reportProtocol.textContent =
        target.protocol;

    if (el.reportTarget)
      el.reportTarget.textContent =
        target.ssid;

    if (el.reportFindings)
      el.reportFindings.textContent =
        String(state.findings.length);

    if (el.reportControls)
      el.reportControls.textContent =
        `${state.controlsFixed}/3`;

    if (el.reportRetest)
      el.reportRetest.textContent =
        state.retest
          ? "PASSED"
          : "PENDING";

    if (el.reportRisk)
      el.reportRisk.textContent =
        riskLabel;

    if (el.reportConclusion) {

      if (state.retest) {

        el.reportConclusion.textContent =
          "Defensive controls were retested successfully in the training environment.";

      } else if (
        state.findings.length
      ) {

        el.reportConclusion.textContent =
          "Findings were identified. Apply defensive controls and run the retest.";

      } else {

        el.reportConclusion.textContent =
          "Run the Red / Blue / Purple workflow to populate the assessment.";
      }
    }

    renderFindings();
  }


  function exportReport() {

    const target =
      state.selectedTarget;

    if (!target) {

      printConsole(
        "Select a target before exporting."
      );

      return;
    }


    const report = {

      application:
        "WhiteHat CyberRange",

      generatedAt:
        new Date().toISOString(),

      environment:
        "Authorized training laboratory",

      target: {
        ssid:
          target.ssid,

        bssid:
          target.bssid,

        protocol:
          target.protocol,

        signal:
          target.signal,

        profile:
          target.profile,

        scenario:
          target.scenario
      },

      risk:
        state.risk,

      findings:
        state.findings,

      controlsFixed:
        state.controlsFixed,

      detectionEvents:
        state.detectionEvents,

      containment:
        state.containment,

      retest:
        state.retest,

      timeline:
        state.events
    };


    const blob =
      new Blob(
        [
          JSON.stringify(
            report,
            null,
            2
          )
        ],
        {
          type:
            "application/json"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement("a");

    link.href =
      url;

    link.download =
      `whitehat-cyberrange-${safeFileName(
        target.ssid
      )}.json`;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );


    printConsole(
      "Assessment JSON exported."
    );

    addTimeline(
      "REPORT",
      "JSON assessment exported",
      "COMPLETED"
    );
  }


  /* ==========================================================
     MOBILE TWO-FINGER ZOOM
     ----------------------------------------------------------
     Native browser pinch zoom remains enabled by the viewport
     setting in the HTML. This handler provides an additional
     application-level visual zoom without changing text input
     behavior.
  ========================================================== */

  function setupMobileGestures() {

    let initialDistance =
      null;

    let initialZoom =
      state.zoom;


    document.addEventListener(
      "touchstart",
      (event) => {

        if (
          event.touches.length !== 2
        ) {
          return;
        }

        initialDistance =
          distanceBetweenTouches(
            event.touches[0],
            event.touches[1]
          );

        initialZoom =
          state.zoom;
      },
      {
        passive: true
      }
    );


    document.addEventListener(
      "touchmove",
      (event) => {

        if (
          event.touches.length !== 2 ||
          initialDistance === null
        ) {
          return;
        }

        const distance =
          distanceBetweenTouches(
            event.touches[0],
            event.touches[1]
          );

        const ratio =
          distance /
          initialDistance;

        state.zoom =
          clamp(
            initialZoom * ratio,
            0.85,
            1.35
          );

        document.documentElement
          .style
          .setProperty(
            "--app-zoom",
            state.zoom.toFixed(2)
          );
      },
      {
        passive: true
      }
    );


    document.addEventListener(
      "touchend",
      (event) => {

        if (
          event.touches.length < 2
        ) {
          initialDistance = null;
        }
      },
      {
        passive: true
      }
    );
  }


  function distanceBetweenTouches(
    a,
    b
  ) {

    const dx =
      a.clientX -
      b.clientX;

    const dy =
      a.clientY -
      b.clientY;

    return Math.sqrt(
      dx * dx +
      dy * dy
    );
  }


  /* ==========================================================
     UTILITY FUNCTIONS
  ========================================================== */

  function delay(ms) {

    return new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          ms
        )
    );
  }


  function clamp(
    value,
    min,
    max
  ) {

    return Math.min(
      max,
      Math.max(
        min,
        value
      )
    );
  }


  function cryptoSafeId() {

    if (
      window.crypto &&
      typeof window.crypto.randomUUID ===
        "function"
    ) {

      return window.crypto.randomUUID();
    }

    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .slice(2)
    );
  }


  function formatTime(
    timestamp
  ) {

    const date =
      timestamp instanceof Date
        ? timestamp
        : new Date(timestamp);

    return date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    );
  }


  function safeFileName(
    value
  ) {

    return String(value)
      .replace(
        /[^a-z0-9_-]+/gi,
        "_"
      )
      .replace(
        /^_+|_+$/g,
        ""
      )
      .slice(0, 60) ||
      "target";
  }


  function escapeHtml(
    value
  ) {

    return String(value)
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


  /* ==========================================================
     START APPLICATION
  ========================================================== */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();
  }

})();