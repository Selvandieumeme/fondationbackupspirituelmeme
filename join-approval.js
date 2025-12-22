// === SCRIPT ENDEPANDAN OTORIZASYON ELEV ===
// Sauvegarde sa nan fichye: join-approval.js
(async () => {
  const socket = io("https://fondationbackupspirituel.com");

  // --- Bouton Rejoindre (pati elev) ---
  const joinBtn = document.getElementById("join-room");
  const usernameInput = document.getElementById("username");
  const roomCodeInput = document.getElementById("room-code");
  const roleSelect = document.getElementById("role");

  // Lè elèv la klike "Rejoindre"
  joinBtn?.addEventListener("click", () => {
    if (roleSelect?.value !== "student") return;

    const username = usernameInput.value.trim();
    const room = roomCodeInput.value.trim();
    if (!username || !room) {
      alert("Remplissez tous les champs avant de rejoindre la classe");
      return;
    }

    // Voye demann bay pwofesè a atravè serveur
    socket.emit("student-join-request", { username, room });
    alert("⏳ En attente d’approbation du professeur...");
  });

  // --- Kote pwofesè a resevwa demann yo ---
  socket.on("join-request-pending", ({ username, room }) => {
    if (document.getElementById("role")?.value !== "teacher") return;

    // Kreye ti fenèt konfimasyon
    const ask = confirm(`👩‍🎓 ${username} souhaite rejoindre la classe ${room}.\nAcceptez-vous ?`);
    if (ask) {
      socket.emit("join-request-accepted", { username, room });
    } else {
      socket.emit("join-request-rejected", { username, room });
    }
  });

  // --- Notifikasyon pou elèv la ---
  socket.on("join-request-result", ({ status, room }) => {
    if (status === "accepted") {
      alert(`✅ Accès accordé ! Bienvenue dans la classe ${room}`);
      // Ou ka ajoute otomatikman li rantre
      socket.emit("join-room", room);
    } else {
      alert("❌ Accès refusé par le professeur.");
    }
  });
})();
