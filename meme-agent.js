// meme-agent.js
// MEME-Inspecteur: AI assistant UI + TTS + socket logger
// Works with seed_meme_qa.js which should expose window.MEME_QA_DATA and window.MEME_AI
// Backend Socket URL:
const MEME_BACKEND = "https://examen-backend-ihlx.onrender.com";

(function () {
  // --- helper: ensure socket.io client available (load fallback) ---
  function ensureSocketIO(callback) {
    if (window.io) return callback(null, window.io);
    const src = "https://cdn.jsdelivr.net/npm/socket.io-client@4/dist/socket.io.min.js";
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => callback(null, window.io);
    s.onerror = (e) => callback(new Error("Failed to load socket.io client"), null);
    document.head.appendChild(s);
  }

  // --- UI creation ---
  const container = document.createElement("div");
  container.id = "meme-agent-container";
  container.innerHTML = `
    <style>
      /* MEME-Inspecteur styles (scoped) */
      #meme-agent-container{position:fixed;right:18px;bottom:18px;z-index:99999;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,Arial;}
      .meme-agent-card{width:320px;border-radius:14px;background:linear-gradient(180deg,rgba(255,255,255,0.98), rgba(250,250,255,0.9));box-shadow:0 12px 40px rgba(3,10,60,0.2);overflow:hidden;border:1px solid rgba(11,99,255,0.06)}
      .meme-header{display:flex;align-items:center;gap:12px;padding:12px 14px;background:linear-gradient(90deg,#0b63ff,#1e8bff);color:#fff}
      .meme-avatar{width:44px;height:44px;border-radius:10px;background:radial-gradient(circle at 30% 30%, #ffd43b, #f6b700);box-shadow:0 4px 12px rgba(246,183,0,0.25) inset}
      .meme-title{font-weight:700;font-size:14px;line-height:1}
      .meme-sub{font-size:12px;opacity:0.95}
      .meme-body{padding:12px;max-height:360px;overflow:auto}
      .meme-log{font-size:13px;color:#0b1220;margin:0 0 8px 0;background:linear-gradient(90deg,#fbfdff,#f1f6ff);padding:8px;border-radius:8px}
      .meme-controls{display:flex;gap:8px;padding:10px;border-top:1px solid rgba(11,99,255,0.04);background:rgba(250,250,255,0.95)}
      .meme-controls button{flex:1;padding:8px 10px;border-radius:10px;border:none;cursor:pointer;font-weight:600}
      .meme-btn-voice{background:linear-gradient(90deg,#ffd43b,#ffea8a);color:#08122a}
      .meme-btn-clear{background:linear-gradient(90deg,#0b63ff,#1e8bff);color:#fff}
      .meme-chat-panel{position:fixed;right:18px;bottom:80px;width:360px;max-height:60vh;border-radius:12px;box-shadow:0 18px 60px rgba(3,10,60,0.2);overflow:hidden;background:rgba(255,255,255,0.98);display:none;flex-direction:column}
      .meme-chat-header{padding:12px 14px;background:linear-gradient(90deg,#0b63ff,#1e8bff);color:#fff;font-weight:700}
      .meme-chat-messages{padding:12px; flex:1; overflow:auto; max-height:45vh; font-size:14px}
      .meme-chat-input{display:flex;padding:10px;border-top:1px solid #eef4ff;gap:8px}
      .meme-chat-input input{flex:1;padding:10px;border-radius:10px;border:1px solid #e6eefc}
      .meme-chat-input button{padding:10px 12px;border-radius:10px;border:none;background:linear-gradient(90deg,#ffd43b,#ffea8a);font-weight:700;cursor:pointer}
      .meme-msg-bubble{margin-bottom:8px;padding:8px 10px;border-radius:10px;background:#f6f9ff;color:#071230;box-shadow:0 6px 18px rgba(11,18,32,0.06)}
      .meme-msg-bubble.meme{background:linear-gradient(90deg,#ffd43b,#ffea8a);color:#071230}
    </style>

    <div class="meme-agent-card" role="region" aria-label="MEME-Inspecteur">
      <div class="meme-header">
        <div class="meme-avatar" aria-hidden="true"></div>
        <div>
          <div class="meme-title">MEME-Inspecteur</div>
          <div class="meme-sub">Admin AI — École en Ligne</div>
        </div>
      </div>
      <div class="meme-body" id="memeBody">
        <div class="meme-log" id="memeLog">MEME prêt — en attente d'événements...</div>
      </div>
      <div class="meme-controls">
        <button class="meme-btn-voice" id="memeVoiceToggle" title="Activer/désactiver la voix">Voix: ON</button>
        <button class="meme-btn-clear" id="memeClear">Effacer</button>
      </div>
    </div>

    <div class="meme-chat-panel" id="memeChatPanel" aria-hidden="true">
      <div class="meme-chat-header">MEME Chat</div>
      <div class="meme-chat-messages" id="memeChatMessages"></div>
      <div class="meme-chat-input">
        <input type="text" id="memeChatInput" placeholder="Écrire à MEME..." />
        <button id="memeSendBtn">Envoyer</button>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  const memeLog = document.getElementById("memeLog");
  const memeBody = document.getElementById("memeBody");
  const voiceBtn = document.getElementById("memeVoiceToggle");
  const clearBtn = document.getElementById("memeClear");
  const chatPanel = document.getElementById("memeChatPanel");
  const chatMessages = document.getElementById("memeChatMessages");
  const chatInput = document.getElementById("memeChatInput");
  const chatSend = document.getElementById("memeSendBtn");

  // --- state ---
  let socket = null;
  let voiceEnabled = true;
  let ready = false;

  // --- simple logger ---
  function log(msg, type = "info") {
    const ts = new Date().toLocaleTimeString();
    const p = document.createElement("div");
    p.className = "meme-log";
    p.textContent = `[${ts}] ${msg}`;
    memeBody.prepend(p);
    // keep single small summary in top tile
    memeLog.textContent = `${msg} · ${ts}`;
  }

  // --- chat message UI helper ---
  function pushChat(text, isMeme = false) {
    const d = document.createElement("div");
    d.className = "meme-msg-bubble" + (isMeme ? " meme" : "");
    d.textContent = text;
    chatMessages.appendChild(d);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // --- voice helper using Web Speech API ---
  function speak(text) {
    if (!voiceEnabled) return;
    if (!("speechSynthesis" in window)) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      // choose a clear voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length) {
        // pick first english or default voice - user can change in browser
        u.voice = voices.find(v => v.lang && v.lang.startsWith("en")) || voices[0];
      }
      u.rate = 1;
      u.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn("TTS failed:", e);
    }
  }

  // --- MEME AI fallback (if seed not loaded) ---
  function safeGetResponse(msg) {
    if (window.MEME_AI && typeof window.MEME_AI.getResponse === "function") {
      try { return window.MEME_AI.getResponse(msg); } catch(e){ console.warn(e); }
    }
    // minimal fallback
    const lower = (msg||"").toLowerCase();
    if (lower.includes("bonjour") || lower.includes("salut")) return "Bonjour — MEME-Inspecteur ici. Comment puis-je aider ?";
    if (lower.includes("aide") || lower.includes("probl")) return "Dis-moi ce qu'il te faut, je vais t'aider.";
    return "Je n'ai pas compris parfaitement — peux-tu reformuler ?";
  }

  // --- core event handlers ---
  function onStudentJoined(detail) {
    const name = detail?.name || "Un élève";
    const m = `👋 ${name} vient d'entrer en classe.`;
    log(m);
    pushChat(m);
    speak(`${name} vient d'entrer en classe.`);
    emitBackend("agentLog", {type:"studentJoined", detail});
  }

  function onStudentLeft(detail) {
    const name = detail?.name || "Un élève";
    const m = `🚪 ${name} a quitté la classe.`;
    log(m);
    pushChat(m);
    speak(`${name} a quitté la classe.`);
    emitBackend("agentLog", {type:"studentLeft", detail});
  }

  function onMicChange(detail) {
    const {name, status} = detail || {};
    const m = `🎙️ Micro de ${name || 'Un participant'} ${status ? "activé" : "désactivé"}.`;
    log(m);
    pushChat(m);
    speak(m);
    emitBackend("agentLog", {type:"micChange", detail});
  }

  function onCameraChange(detail) {
    const {name, status} = detail || {};
    const m = `📷 Caméra de ${name || 'Un participant'} ${status ? "activée" : "désactivée"}.`;
    log(m);
    pushChat(m);
    speak(m);
    emitBackend("agentLog", {type:"cameraChange", detail});
  }

  function onScreenShare(detail) {
    const {name, status} = detail || {};
    const m = `🖥️ ${name || 'Un participant'} ${status ? "partage son écran" : "a arrêté le partage"}.`;
    log(m);
    pushChat(m);
    speak(m);
    emitBackend("agentLog", {type:"screenShare", detail});
  }

  async function onChatMessage(detail) {
    const name = detail?.name || "Anonyme";
    const message = detail?.message || "";
    const m = `${name}: ${message}`;
    log(`Chat — ${m}`);
    pushChat(`${name}: ${message}`);
    emitBackend("agentLog", {type:"chat", detail});

    // generate MEME response (non-blocking)
    const response = safeGetResponse(message);
    // display and speak after slight delay so it feels natural
    setTimeout(()=>{
      pushChat(response, true);
      log(`MEME: ${response}`);
      speak(response);
      emitBackend("agentLog", {type:"memeResponse", message, response});
    }, 600);
  }

  function onJoinRequest(detail) {
    const {name, classCode} = detail || {};
    const m = `🟡 Demande: ${name || 'Un élève'} souhaite rejoindre la classe ${classCode || ''}.`;
    log(m);
    pushChat(m);
    speak(`Nouvo demann: ${name || 'Un élève'} mande aksè pou klase a.`);
    // optionally show accept/reject UI (simple confirm for now)
    // NOTE: keep it non-blocking and safe
    setTimeout(()=>{
      // Dispatch an event to let the teacher UI handle acceptance; fallback auto notify backend
      emitBackend("joinRequest", {detail});
    }, 400);
  }

  // --- backend emitter ---
  function emitBackend(eventName, payload) {
    try {
      if (socket && socket.connected) {
        socket.emit(eventName, payload);
      } else {
        // fallback log
        console.debug("Socket not connected; event:", eventName, payload);
      }
    } catch(e){ console.warn("emitBackend error:", e); }
  }

  // --- wire DOM controls ---
  voiceBtn.addEventListener("click", ()=>{
    voiceEnabled = !voiceEnabled;
    voiceBtn.textContent = `Voix: ${voiceEnabled ? "ON" : "OFF"}`;
    voiceBtn.style.opacity = voiceEnabled ? "1" : "0.7";
  });

  clearBtn.addEventListener("click", ()=>{
    chatMessages.innerHTML = "";
    memeBody.innerHTML = `<div class="meme-log">MEME prêt — historique effacé</div>`;
  });

  // chat panel toggle on header click
  container.querySelector(".meme-header").addEventListener("dblclick", ()=>{
    chatPanel.style.display = chatPanel.style.display === "flex" ? "none" : "flex";
    chatPanel.setAttribute("aria-hidden", chatPanel.style.display === "none" ? "true" : "false");
  });

  chatSend.addEventListener("click", ()=>{
    const text = chatInput.value.trim();
    if (!text) return;
    pushChat(`Vous: ${text}`);
    chatInput.value = "";
    // treat as local chat message to be processed by MEME
    onChatMessage({name: "Vous", message: text});
  });

  chatInput.addEventListener("keydown", (e)=>{
    if (e.key === "Enter") chatSend.click();
  });

  // --- listen to window custom events (other scripts can dispatch) ---
  window.addEventListener("studentJoined", (e) => onStudentJoined(e.detail || {}));
  window.addEventListener("studentLeft", (e) => onStudentLeft(e.detail || {}));
  window.addEventListener("micChange", (e) => onMicChange(e.detail || {}));
  window.addEventListener("cameraChange", (e) => onCameraChange(e.detail || {}));
  window.addEventListener("screenShare", (e) => onScreenShare(e.detail || {}));
  window.addEventListener("chatMessage", (e) => onChatMessage(e.detail || {}));
  window.addEventListener("joinRequest", (e) => onJoinRequest(e.detail || {}));

  // --- expose small API for other scripts to call MEME programmatically ---
  window.MEME_AGENT = {
    speak,
    pushChat,
    log,
    enableVoice: (v) => { voiceEnabled = !!v; voiceBtn.textContent = `Voix: ${voiceEnabled ? "ON" : "OFF"}`; },
    openChat: () => { chatPanel.style.display = "flex"; chatPanel.setAttribute("aria-hidden","false"); },
    closeChat: () => { chatPanel.style.display = "none"; chatPanel.setAttribute("aria-hidden","true"); },
    sendMessageToMeme: (name, message) => onChatMessage({name, message}),
  };

  // --- initialize socket connection and readiness ---
  ensureSocketIO((err, ioRef) => {
    if (err) {
      log("⚠️ Socket.IO non chargé — fonctionnalité backend limitée.");
      ready = true;
      return;
    }
    try {
      socket = ioRef(MEME_BACKEND, { transports: ["websocket"], reconnectionAttempts: 5 });
      socket.on("connect", ()=>{
        log("✅ MEME connecté au backend");
        // inform backend of agent presence
        socket.emit("agentConnected", {ts: Date.now(), agent: "MEME-Inspecteur"});
      });
      socket.on("disconnect", ()=>{
        log("⚠️ MEME déconnecté du backend");
      });
      // backend may send commands for MEME
      socket.on("agentCommand", (cmd) => {
        try {
          if (cmd?.type === "announce") {
            const text = cmd.text || "Annonce de l'administration.";
            pushChat(text, true);
            speak(text);
          }
        } catch(e){ console.warn(e); }
      });
      ready = true;
    } catch (e) {
      console.warn("Socket init error:", e);
      log("⚠️ Impossible de connecter au backend.");
      ready = true;
    }
  });

  // Try to load MEME QA data if not already loaded
  (async function loadSeedIfMissing(){
    if (window.MEME_QA_DATA && window.MEME_AI) {
      log("✅ Données MEME_QA chargées");
      return;
    }
    try {
      const resp = await fetch("meme_qa_data.json");
      if (!resp.ok) throw new Error("no seed file");
      const data = await resp.json();
      window.MEME_QA_DATA = data;
      window.MEME_AI = {
        getResponse: function (userMessage) {
          if (!window.MEME_QA_DATA) return "Je suis en train de charger mes connaissances...";
          const msg = (userMessage || "").toLowerCase();
          for (const item of window.MEME_QA_DATA.questions || []) {
            for (const pattern of item.patterns || []) {
              if (msg.includes(pattern.toLowerCase())) {
                const idx = Math.floor(Math.random() * (item.responses || []).length);
                return (item.responses || [])[idx] || "Désolé, je n'ai pas de réponse.";
              }
            }
          }
          return "Je ne suis pas sûr de comprendre, peux-tu reformuler ?";
        }
      };
      log("✅ seed_meme_qa chargé localement");
    } catch (e) {
      console.debug("seed_meme_qa non trouvé localement:", e);
    }
  })();

  // small intro
  setTimeout(() => {
    pushChat("MEME-Inspecteur activé — double-cliquez en haut de la carte pou ouvri chat.");
    log("MEME démarré");
  }, 800);

})();


/* ===================================================
   MEME-AGENT INTELLIGENT — Vokal + Chat Entèaktif
   Pa modifye okenn lòt pati nan kòd prensipal la
=================================================== */
(function(){
  // Sekirite: tcheke si browser sipòte API yo
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const synth = window.speechSynthesis;
  if (!SpeechRecognition || !synth) {
    console.warn("Ce navigateur ne supporte pas la reconnaissance vocale ou la synthèse vocale.");
    return;
  }

  // Kreyasyon sistèm tande
  const recognition = new SpeechRecognition();
  recognition.lang = 'fr-FR'; // ou ka mete 'ht-HT' si ou vle Kreyòl
  recognition.continuous = true;
  recognition.interimResults = false;

  // Kreye ti chat bubble pou repons agent lan
  const agentBox = document.createElement('div');
  agentBox.id = 'meme-agent-box';
  agentBox.style.cssText = `
    position:fixed;bottom:30px;right:30px;z-index:9999;
    max-width:380px;background:rgba(255,255,255,0.95);
    border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.25);
    padding:18px 22px;font-size:1rem;font-weight:600;
    color:#0b1220;backdrop-filter:blur(6px);
    border:2px solid #ffd43b;display:none;
  `;
  document.body.appendChild(agentBox);

  // Fonksyon pou fè agent lan pale ak afiche repons
  function memeSpeak(text) {
    agentBox.innerText = "🤖 " + text;
    agentBox.style.display = "block";

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'fr-FR';
    utter.pitch = 1;
    utter.rate = 1;
    synth.speak(utter);

    // Fè mesaj la disparèt dousman aprè kèk segond
    setTimeout(()=>{
      agentBox.style.opacity = "0";
      setTimeout(()=>{ agentBox.style.display="none";agentBox.style.opacity="1"; },1000);
    },7000);
  }

  // Repons entèlijan selon mo kle yo
  function handleCommand(text){
    const lower = text.toLowerCase();

    if(lower.includes("bonjour") || lower.includes("salut")){
      memeSpeak("Bonjour, je suis Mème Agent ! Comment puis-je vous aider ?");
    }
    else if(lower.includes("mème") && lower.includes("présent")){
      memeSpeak("Toujours là, prêt à aider la classe !");
    }
    else if(lower.includes("explique") || lower.includes("aide moi")){
      memeSpeak("D'accord ! Peux-tu préciser ce que tu veux que j'explique ?");
    }
    else if(lower.includes("merci")){
      memeSpeak("Avec plaisir !");
    }
    else if(lower.includes("au revoir")){
      memeSpeak("Au revoir, à très bientôt !");
    }
    else if(lower.includes("sécurité")){
      memeSpeak("Toutes les connexions sont chiffrées et sécurisées.");
    }
    else if(lower.includes("agent") || lower.includes("assistant")){
      memeSpeak("Oui, je t’écoute !");
    }
  }

  // Kòmanse tande otomatikman
  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim();
    console.log("🎧 Mème-Agent a entendu :", transcript);
    handleCommand(transcript);
  };

  recognition.onerror = (e) => {
    console.error("Erreur de reconnaissance vocale:", e);
  };

  recognition.onend = () => {
    // Rekòmanse otomatikman si li sispann
    recognition.start();
  };

  // Lanse tande a apre 2 segond pou asire paj la chaje
  setTimeout(()=> recognition.start(), 2000);

})();
