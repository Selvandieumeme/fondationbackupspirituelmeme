document.getElementById("verifyBtn").addEventListener("click", async () => {
  const email = document.getElementById("emailInput").value.trim();
  const fullnameField = document.getElementById("fullnameOutput");
  const msg = document.getElementById("verifyMsg");

  fullnameField.value = "";
  msg.textContent = "";

  if (!email) {
    msg.textContent = "Veuillez entrer un email.";
    msg.style.color = "red";
    return;
  }

  try {
    const res = await fetch("https://api.fondationbackupspirituel.com/api/wallet/verify-identity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (!data.success) {
      msg.textContent = data.message;
      msg.style.color = "red";
      return;
    }

    fullnameField.value = data.fullName;
    msg.textContent = "Identité vérifiée avec succès.";
    msg.style.color = "green";

  } catch (err) {
    msg.textContent = "Erreur serveur.";
    msg.style.color = "red";
  }
});
