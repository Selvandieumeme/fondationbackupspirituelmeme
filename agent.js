const io = require("socket.io-client");
const robot = require("robotjs");

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
