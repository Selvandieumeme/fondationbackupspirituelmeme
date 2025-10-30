// teacher-controls.js
import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

const socket = io("https://examen-backend-ihlx.onrender.com");

const joinBtn = document.getElementById("join-room");
const usernameInput = document.getElementById("username");
const roomCodeInput = document.getElementById("room-code");
const roleSelect = document.getElementById("role");
const teacherControls = document.getElementById("teacher-controls");
const teacherVideo = document.getElementById("teacher-video");
const studentVideos = document.getElementById("student-videos");
const messages = document.getElementById("messages");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const uploadDoc = document.getElementById("upload-doc");

let localStream, screenStream, recorder, chunks = [];

joinBtn.addEventListener("click", async () => {
  if (roleSelect.value !== "teacher") return;

  const username = usernameInput.value.trim();
  const room = roomCodeInput.value.trim();
  if (!username || !room) return alert("Remplissez tous les champs");

  socket.emit("setUser", { username, role: "teacher" });
  socket.emit("join-room", room);
  teacherControls.style.display = "flex";

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    teacherVideo.srcObject = localStream;

    // ----------------- Mikwo -----------------
    const muteMicBtn = document.createElement("button");
    muteMicBtn.textContent = "Mute Micro";
    teacherControls.appendChild(muteMicBtn);
    muteMicBtn.onclick = () => {
      localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
      muteMicBtn.textContent = localStream.getAudioTracks()[0].enabled ? "Mute Micro" : "Unmute Micro";
    };

    // ----------------- Kamera -----------------
    const muteCamBtn = document.createElement("button");
    muteCamBtn.textContent = "Mute Caméra";
    teacherControls.appendChild(muteCamBtn);
    muteCamBtn.onclick = () => {
      localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
      muteCamBtn.textContent = localStream.getVideoTracks()[0].enabled ? "Mute Caméra" : "Unmute Caméra";
    };

    // ----------------- Pataje Ekran -----------------
    const shareScreenBtn = document.createElement("button");
    shareScreenBtn.textContent = "Partager Écran";
    teacherControls.appendChild(shareScreenBtn);
    shareScreenBtn.onclick = async () => {
      try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const preview = document.createElement("video");
        preview.srcObject = screenStream;
        preview.autoplay = true;
        preview.muted = true;
        preview.style.border = "3px solid gold";
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

    // ----------------- Mute All / Stop All -----------------
    const muteAllBtn = document.createElement("button");
    muteAllBtn.textContent = "Mute All";
    teacherControls.appendChild(muteAllBtn);
    muteAllBtn.onclick = () => socket.emit("mute-all", room);

    const stopAllBtn = document.createElement("button");
    stopAllBtn.textContent = "Stop Video All";
    teacherControls.appendChild(stopAllBtn);
    stopAllBtn.onclick = () => socket.emit("stop-all-video", room);

    // ----------------- Start / Stop Recording -----------------
    const startRecBtn = document.createElement("button");
    startRecBtn.textContent = "Start Recording";
    teacherControls.appendChild(startRecBtn);

    const stopRecBtn = document.createElement("button");
    stopRecBtn.textContent = "Stop Recording";
    stopRecBtn.disabled = true;
    teacherControls.appendChild(stopRecBtn);

    startRecBtn.onclick = () => {
      if (!localStream) return alert("Activez la caméra avant d’enregistrer");
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
      await fetch("https://examen-backend-ihlx.onrender.com/upload-recording", { method: "POST", body: form });
      chunks = [];
      startRecBtn.disabled = false;
      stopRecBtn.disabled = true;
      alert("Recording saved!");
    };

    // ----------------- Upload Document -----------------
    const uploadBtn = document.createElement("button");
    uploadBtn.textContent = "Upload Document";
    teacherControls.appendChild(uploadBtn);
    uploadBtn.onclick = () => uploadDoc.click();

    uploadDoc.onchange = async () => {
      const file = uploadDoc.files[0]; if (!file) return;
      const form = new FormData(); form.append("document", file);
      await fetch("https://examen-backend-ihlx.onrender.com/upload-doc", { method: "POST", body: form });
      alert("Document uploaded!");
    };

    // ----------------- Chat -----------------
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

  } catch (err) {
    alert("Erreur caméra/micro: " + err.message);
  }
});
