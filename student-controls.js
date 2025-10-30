// student-controls.js (vèsyon rafine)
import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

const socket = io("https://examen-backend-ihlx.onrender.com");

const joinBtn = document.getElementById("join-room");
const usernameInput = document.getElementById("username");
const roomCodeInput = document.getElementById("room-code");
const roleSelect = document.getElementById("role");
const studentVideos = document.getElementById("student-videos");
const messages = document.getElementById("messages");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const uploadDoc = document.getElementById("upload-doc");
const studentControls = document.getElementById("student-controls");

joinBtn.addEventListener("click", async () => {
  if (roleSelect.value !== "student") return;

  const username = usernameInput.value.trim();
  const room = roomCodeInput.value.trim();
  if (!username || !room) return alert("Remplissez tous les champs");

  socket.emit("setUser", { username, role: "student" });
  socket.emit("join-room", room);

  try {
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    // === Video preview ===
    const videoEl = document.createElement("video");
    videoEl.autoplay = true;
    videoEl.muted = false;
    videoEl.srcObject = localStream;
    videoEl.classList.add("student");
    studentVideos.appendChild(videoEl);

    // === Bouton Mute Micro ===
    const muteMicBtn = document.createElement("button");
    muteMicBtn.textContent = "Mute Micro";
    studentControls.appendChild(muteMicBtn);
    muteMicBtn.onclick = () => {
      localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
      muteMicBtn.textContent = localStream.getAudioTracks()[0].enabled ? "Mute Micro" : "Unmute Micro";
    };

    // === Bouton Mute Caméra ===
    const muteCamBtn = document.createElement("button");
    muteCamBtn.textContent = "Mute Caméra";
    studentControls.appendChild(muteCamBtn);
    muteCamBtn.onclick = () => {
      localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
      muteCamBtn.textContent = localStream.getVideoTracks()[0].enabled ? "Mute Caméra" : "Unmute Caméra";
    };

    // === Bouton Leve Men ===
    const raiseHandBtn = document.createElement("button");
    raiseHandBtn.textContent = "✋ Leve men";
    studentControls.appendChild(raiseHandBtn);

    let handUp = false;
    raiseHandBtn.onclick = () => {
      handUp = !handUp;
      if (handUp) {
        socket.emit("raise-hand", { user: username, room });
        raiseHandBtn.textContent = "✋ Desann men";
      } else {
        socket.emit("lower-hand", { user: username, room });
        raiseHandBtn.textContent = "✋ Leve men";
      }
    };

    socket.on("raised-hand", (user) => {
      console.log("Hand raised:", user);
    });

    socket.on("all-hands-lowered", () => {
      handUp = false;
      raiseHandBtn.textContent = "✋ Leve men";
    });

    // === Bouton Pataje Ekran ===
    const shareScreenBtn = document.createElement("button");
    shareScreenBtn.textContent = "Partager Écran";
    studentControls.appendChild(shareScreenBtn);
    shareScreenBtn.onclick = async () => {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const preview = document.createElement("video");
        preview.srcObject = screenStream;
        preview.autoplay = true;
        preview.muted = true;
        preview.style.border = "3px solid green";
        preview.style.width = "70%";
        studentVideos.appendChild(preview);

        socket.emit("share-screen", { room, trackId: screenStream.id });

        screenStream.getVideoTracks()[0].onended = () => {
          preview.remove();
          socket.emit("stop-share-screen", room);
        };
      } catch (err) {
        alert("Erreur partage écran: " + err.message);
      }
    };

    // === Upload Document ===
    const uploadBtn = document.createElement("button");
    uploadBtn.textContent = "Upload Document";
    studentControls.appendChild(uploadBtn);
    uploadBtn.onclick = () => uploadDoc.click();

    uploadDoc.onchange = async () => {
      const file = uploadDoc.files[0]; if (!file) return;
      const form = new FormData(); form.append("document", file);
      await fetch("https://examen-backend-ihlx.onrender.com/upload-doc", { method: "POST", body: form });
      alert("Document uploaded!");
    };

    // === Chat ===
    sendBtn.onclick = () => {
      const text = msgInput.value.trim();
      if (!text) return;
      socket.emit("chat-message", { from: username, to: "all", message: text });
      const li = document.createElement("li"); li.textContent = `Vous: ${text}`; messages.appendChild(li);
      msgInput.value = "";
    };

    socket.on("chat-message", (data) => {
      const li = document.createElement("li");
      li.textContent = `${data.from}: ${data.message}`;
      messages.appendChild(li);
    });

    // === Réception contrôles du prof ===
    socket.on("mute-mic", () => localStream.getAudioTracks().forEach(t => t.enabled = false));
    socket.on("stop-video", () => localStream.getVideoTracks().forEach(t => t.enabled = false));

  } catch (err) {
    alert("Erreur caméra/micro élève: " + err.message);
  }
});
