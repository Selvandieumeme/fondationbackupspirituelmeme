// ===============================
// 👁️ Afficher / cacher mot de passe
// ===============================
const toggle = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

toggle.addEventListener("click", () => {
  passwordInput.type =
    passwordInput.type === "password" ? "text" : "password";
});

// ===============================
// 🔐 LOGIN MERCHANT
// ===============================
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  if (!email || !password) {
    msg.style.color = "red";
    msg.innerText = "Veuillez remplir tous les champs.";
    return;
  }

  msg.style.color = "#0056b3";
  msg.innerText = "Connexion en cours...";

  try {
    const response = await fetch(
      "https://api.fondationbackupspirituel.com/merchant/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      }
    );

    // ⚠️ Si API pa renvoye JSON
    const text = await response.text();
    let result;

    try {
      result = JSON.parse(text);
    } catch (e) {
      throw new Error("Réponse serveur invalide (non JSON)");
    }

    if (!response.ok || !result.success) {
      msg.style.color = "red";
      msg.innerText = result.message || "Identifiants incorrects";
      return;
    }

    // ✅ LOGIN OK
    localStorage.setItem("merchantConnected", "true");
    localStorage.setItem("merchantEmail", result.merchant.email);

    msg.style.color = "green";
    msg.innerText = "Connexion réussie ✔️";

    setTimeout(() => {
      window.location.href = "merchantdashboardfobas.html";
    }, 800);

  } catch (err) {
    console.error("LOGIN MERCHANT ERROR:", err);
    msg.style.color = "red";
    msg.innerText = "Erreur serveur, veuillez réessayer.";
  }
});
