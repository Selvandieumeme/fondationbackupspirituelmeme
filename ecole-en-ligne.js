// ============================================================
// ✅ ECOLE-EN-LIGNE.JS — Vèsyon FINAL optimize (pwofesè + elèv)
// ============================================================

// === [1] KONEKSYON BACKEND ===
const socket = io("https://examen-backend-ihlx.onrender.com");

// === [2] VARYAB GLOBAUX ===
let localStream, screenStream, recorder;
let chunks = [];
let raisedHands = new Set(); // pou swiv men elèv ki leve yo

// === [3] ELEMENT HTML ===
const joinBtn = document.getElementById("join-room");
const roomCodeInput = document.getElementById("room-code");
const usernameInput = document.getElementById("username");
const roleSelect = document.getElementById("role");
const teacherControls = document.getElementById("teacher-controls");
const teacherVideo = document.getElementById("teacher-video");
const studentVideos = document.getElementById("student-videos");
const muteAllBtn = document.getElementById("mute-all");
const stopAllBtn = document.getElementById("stop-all-video");
const startRecBtn = document.getElementById("start-rec");
const stopRecBtn = document.getElementById("stop-rec");
const uploadDoc = document.getElementById("upload-doc");
const messages = document.getElementById("messages");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send");

// ============================================================
// === [4] FONKSYON PWOFESE YO (AJISTE) ===
// ============================================================

joinBtn.onclick = async () => {
  const room = roomCodeInput.value.trim();
  const username = usernameInput.value.trim();
  const role = roleSelect.value;

  if (!room || !username) {
    alert("Remplissez tous les champs");
    return;
  }

  socket.emit("setUser", { username, role });
  socket.emit("join-room", room);

  // Si se pwofesè
  if (role === "teacher") {
    teacherControls.style.display = "flex";

    try {
      // 🎥 Aksè kamera & mikwo pwofesè a
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      teacherVideo.srcObject = localStream;

      // Voye id stream pou elèv yo
      socket.emit("teacher-stream-start", { room });

      // === 🎙️ Bouton kontwòl mikwo ===
      const muteMicBtn = document.createElement("button");
      muteMicBtn.textContent = "Mute Micro";
      teacherControls.appendChild(muteMicBtn);
      muteMicBtn.onclick = () => {
        localStream.getAudioTracks().forEach(
          (t) => (t.enabled = !t.enabled)
        );
        muteMicBtn.textContent = localStream.getAudioTracks()[0].enabled
          ? "Mute Micro"
          : "Unmute Micro";
      };

      // === 🎥 Bouton kontwòl kamera ===
      const muteCamBtn = document.createElement("button");
      muteCamBtn.textContent = "Mute Caméra";
      teacherControls.appendChild(muteCamBtn);
      muteCamBtn.onclick = () => {
        localStream.getVideoTracks().forEach(
          (t) => (t.enabled = !t.enabled)
        );
        muteCamBtn.textContent = localStream.getVideoTracks()[0].enabled
          ? "Mute Caméra"
          : "Unmute Caméra";
      };

      // === 🖥️ Bouton pataje ekran ===
      const shareScreenBtn = document.createElement("button");
      shareScreenBtn.textContent = "Partager Écran";
      teacherControls.appendChild(shareScreenBtn);
      shareScreenBtn.onclick = async () => {
        try {
          screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });
          const screenTrack = screenStream.getVideoTracks()[0];
          socket.emit("teacher-screen-share", { room });
          const preview = document.createElement("video");
          preview.srcObject = screenStream;
          preview.autoplay = true;
          preview.muted = true;
          preview.style.border = "3px solid gold";
          preview.style.borderRadius = "10px";
          preview.style.width = "70%";
          studentVideos.appendChild(preview);
          screenTrack.onended = () => preview.remove();
        } catch (err) {
          alert("Erreur partage écran : " + err.message);
        }
      };

      // === ✋ Bouton “Desann tout men” ===
      const lowerAllHandsBtn = document.createElement("button");
      lowerAllHandsBtn.textContent = "Descendre toutes les mains";
      teacherControls.appendChild(lowerAllHandsBtn);
      lowerAllHandsBtn.onclick = () => {
        socket.emit("lower-all-hands", room);
        raisedHands.clear();
        document.querySelectorAll(".hand-icon").forEach(el => el.remove());
      };

      // === 🎥 Anrejistreman sesyon pwofesè a ===
      startRecBtn.onclick = () => {
        if (!localStream)
          return alert("Activez la caméra avant d’enregistrer");
        recorder = new MediaRecorder(localStream);
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.start(1000);
        startRecBtn.disabled = true;
        stopRecBtn.disabled = false;
      };

      stopRecBtn.onclick = async () => {
        if (!recorder) return;
        recorder.stop();
        const blob = new Blob(chunks, { type: "video/webm" });
        const form = new FormData();
        form.append("file", blob, "session.webm");
        try {
          await fetch(
            "https://examen-backend-ihlx.onrender.com/upload-recording",
            { method: "POST", body: form }
          );
          alert("🎥 Enregistrement sauvegardé avec succès");
        } catch {
          alert("Erreur pendant le téléversement");
        }
        chunks = [];
        startRecBtn.disabled = false;
        stopRecBtn.disabled = true;
      };

      // === Bouton "mute all" ak "stop video all"
      muteAllBtn.onclick = () => socket.emit("mute-all", room);
      stopAllBtn.onclick = () => socket.emit("stop-all-video", room);

      // === Upload dokiman pwofesè
      uploadDoc.onchange = async () => {
        const file = uploadDoc.files[0];
        if (!file) return;
        const form = new FormData();
        form.append("document", file);
        try {
          await fetch(
            "https://examen-backend-ihlx.onrender.com/upload-doc",
            { method: "POST", body: form }
          );
          alert("📄 Document téléversé avec succès");
        } catch {
          alert("Erreur téléversement document");
        }
      };

      // === Chat pwofesè
      sendBtn.onclick = () => {
        const text = msgInput.value.trim();
        if (!text) return;
        const from = usernameInput.value.trim();
        socket.emit("chat-message", { from, message: text });
        const li = document.createElement("li");
        li.textContent = `Vous: ${text}`;
        messages.appendChild(li);
        msgInput.value = "";
      };

      socket.on("chat-message", (data) => {
        const li = document.createElement("li");
        li.textContent = `${data.from}: ${data.message}`;
        messages.appendChild(li);
      });

      // 📢 Resevwa notifikasyon men leve
      socket.on("hand-raised", ({ username }) => {
        if (!raisedHands.has(username)) {
          raisedHands.add(username);
          const hand = document.createElement("div");
          hand.classList.add("hand-icon");
          hand.textContent = `✋ ${username}`;
          hand.style.color = "orange";
          hand.style.fontWeight = "bold";
          messages.appendChild(hand);
        }
      });

      // 📢 Resevwa si pwofesè desann tout men
      socket.on("all-hands-lowered", () => {
        raisedHands.clear();
        document.querySelectorAll(".hand-icon").forEach(el => el.remove());
      });

    } catch (err) {
      alert("Erreur accès caméra/micro professeur : " + err.message);
    }
  }
};

// ============================================================
// === [5] SCRIPT ELEV — AK MAIN LEVEE ===
// ============================================================

(async () => {
  const joinBtn = document.getElementById("join-room");
  const usernameInput = document.getElementById("username");
  const roomCodeInput = document.getElementById("room-code");
  const roleSelect = document.getElementById("role");
  const studentVideos = document.getElementById("student-videos");

  joinBtn.addEventListener("click", async () => {
    if (roleSelect.value !== "student") return;
    const username = usernameInput.value.trim();
    const room = roomCodeInput.value.trim();
    if (!username || !room) return alert("Remplissez tous les champs");

    const socket = io("https://examen-backend-ihlx.onrender.com");
    socket.emit("setUser", { username, role: "student" });
    socket.emit("join-room", room);

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const videoEl = document.createElement("video");
      videoEl.autoplay = true;
      videoEl.muted = false;
      videoEl.classList.add("student");
      videoEl.srcObject = localStream;
      studentVideos.appendChild(videoEl);

      // === ✋ Bouton “Leve men”
      const raiseHandBtn = document.createElement("button");
      raiseHandBtn.textContent = "✋ Leve men";
      raiseHandBtn.style.marginTop = "10px";
      document.getElementById("room-controls").appendChild(raiseHandBtn);

      let handUp = false;
      raiseHandBtn.onclick = () => {
        handUp = !handUp;
        if (handUp) {
          socket.emit("raise-hand", { username, room });
          raiseHandBtn.textContent = "✋ Desann men";
        } else {
          socket.emit("lower-hand", { username, room });
          raiseHandBtn.textContent = "✋ Leve men";
        }
      };

      socket.on("all-hands-lowered", () => {
        handUp = false;
        raiseHandBtn.textContent = "✋ Leve men";
      });

    } catch (err) {
      alert("Erreur accès caméra/micro élève : " + err.message);
    }
  });
})();
