const socket = io();
let currentUser = "";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (res.ok) {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("chat").style.display = "block";
    currentUser = username;
    socket.emit("new user", username);
  } else {
    alert("Login echwe.");
  }
});

socket.on("users", (users) => {
  const usersList = document.getElementById("users");
  usersList.innerHTML = "";
  users.forEach((u) => {
    if (u !== currentUser) {
      const li = document.createElement("li");
      li.innerHTML = u + ' <button onclick="chatWith(\'' + u + '\')">Chat</button>';
      usersList.appendChild(li);
    }
  });
});

function chatWith(user) {
  const msg = prompt("Ekri mesaj ou pou " + user);
  if (msg) {
    socket.emit("private message", { to: user, message: msg });
  }
}

socket.on("private message", ({ from, message }) => {
  const box = document.getElementById("messages");
  const div = document.createElement("div");
  div.textContent = `Mesaj soti nan ${from}: ${message}`;
  box.appendChild(div);
});
