const socket = io("https://api.fondationbackupspirituel.com");

let currentSession = null;

// 🔑 GENERATE ID + PASSWORD
document.getElementById("generateBtn").onclick = () => {
  const id = Math.floor(100000000 + Math.random() * 900000000);
  const pass = Math.random().toString(36).substring(2, 8).toUpperCase();

  document.getElementById("sessionId").innerText = id;
  document.getElementById("sessionPass").innerText = pass;

  currentSession = id;

  socket.emit("create-session", { id, pass });
};

// 🔗 CONNECT
document.getElementById("connectBtn").onclick = () => {
  const id = document.getElementById("inputId").value;
  const pass = document.getElementById("inputPass").value;

  socket.emit("join-session", { id, pass });
};

// 💬 CHAT
document.getElementById("sendMsg").onclick = () => {
  const msg = document.getElementById("msgInput").value;
  socket.emit("chat", { session: currentSession, msg });
};

socket.on("chat", (msg) => {
  const div = document.createElement("div");
  div.innerText = msg;
  document.getElementById("messages").appendChild(div);
});

// ⛔ STOP SESSION
document.getElementById("stopSession").onclick = () => {
  socket.emit("leave-session");
};

// 🔌 DISCONNECT AUTO
window.addEventListener("beforeunload", () => {
  socket.emit("leave-session");
});
