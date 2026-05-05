const socket = io("https://api.fondationbackupspirituel.com");

let currentSession = null;

// ============================
// 🖥️ VIDEO / SCREEN SHARE (AJOUT NOUVO)
// ============================
let peer = null;

// 📡 START SCREEN SHARE (CLIENT)
async function startScreenShare() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    });

    peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    });

    stream.getTracks().forEach(track => {
      peer.addTrack(track, stream);
    });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          candidate: e.candidate,
          session: currentSession
        });
      }
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("offer", {
      offer,
      session: currentSession
    });

  } catch (err) {
    console.error("Screen share error:", err);
  }
}

// 📥 RECEIVE OFFER (TECHNICIAN)
socket.on("offer", async ({ offer }) => {

  peer = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }
    ]
  });

  peer.ontrack = (event) => {
    const video = document.getElementById("remoteVideo");
    if (video) video.srcObject = event.streams[0];
  };

  peer.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit("ice-candidate", {
        candidate: e.candidate,
        session: currentSession
      });
    }
  };

  await peer.setRemoteDescription(offer);

  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);

  socket.emit("answer", {
    answer,
    session: currentSession
  });
});

// 📤 RECEIVE ANSWER (CLIENT)
socket.on("answer", async ({ answer }) => {
  if (peer) {
    await peer.setRemoteDescription(answer);
  }
});

// ❄️ ICE CANDIDATES
socket.on("ice-candidate", async ({ candidate }) => {
  try {
    if (peer && candidate) {
      await peer.addIceCandidate(candidate);
    }
  } catch (e) {
    console.error("ICE error:", e);
  }
});

// ============================
// 🔑 GENERATE ID + PASSWORD (ORIGINAL)
// ============================
window.onload = () => {
  const id = Math.floor(100000000 + Math.random() * 900000000);
  const pass = Math.random().toString(36).substring(2, 8).toUpperCase();

  document.getElementById("sessionId").innerText = id;
  document.getElementById("sessionPass").innerText = pass;

  currentSession = id;

  socket.emit("create-session", { id, pass });
};
// ============================
// 🔗 CONNECT
// ============================
document.getElementById("connectBtn").onclick = () => {
  const id = document.getElementById("inputId").value;
  const pass = document.getElementById("inputPass").value;

  socket.emit("join-session", { id, pass });
};

// ============================
// 💬 CHAT
// ============================
document.getElementById("sendMsg").onclick = () => {
  const msg = document.getElementById("msgInput").value;
  socket.emit("chat", { session: currentSession, msg });
};

socket.on("chat", (msg) => {
  const div = document.createElement("div");
  div.innerText = msg;
  document.getElementById("messages").appendChild(div);
});





function sendFile(file, session) {
  const reader = new FileReader();

  reader.onload = function (e) {
    socket.emit("file-send", {
      session: session,
      name: file.name,
      type: file.type,
      file: e.target.result
    });
  };

  reader.readAsDataURL(file);
}

function installFile(session) {
  socket.emit("file-install", {
    session: session
  });
}









function connectAgent(agentId) {
  socket.emit("attach-agent", {
    session: currentSession,
    agentId: agentId
  });
}

// ============================
// ⛔ STOP SESSION
// ============================
document.getElementById("stopSession").onclick = () => {
  socket.emit("leave-session");

  if (peer) {
    peer.close();
    peer = null;
  }
};

// ============================
// 🔌 DISCONNECT AUTO
// ============================
window.addEventListener("beforeunload", () => {
  socket.emit("leave-session");

  if (peer) {
    peer.close();
  }
});
