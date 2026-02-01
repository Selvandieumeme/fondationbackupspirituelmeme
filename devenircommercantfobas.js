// 🔹 Toggle zye pou montre/kache mot de passe
document.querySelectorAll(".toggle-password").forEach(span => {
  span.addEventListener("click", () => {
    const input = span.previousElementSibling;
    input.type = input.type === "password" ? "text" : "password";
    // Chanje ikon si ou vle (ex: 🔒 / 🔓)
  });
});

// 🔹 Fòm enskripsyon
document.getElementById("registerForm").addEventListener("submit", async e => {
  e.preventDefault();

  const business = document.getElementById("business").value.trim();
  const ownerName = document.getElementById("ownerName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const cin = document.getElementById("cin").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const address = document.getElementById("address").value.trim();
  const businessType = document.getElementById("businessType").value;
  const birthDate = document.getElementById("birthDate").value;
  const cinFile = document.getElementById("cinFile").files[0];

  const msg = document.getElementById("msg");
  msg.style.color = "#0056b3";
  msg.innerText = "Traitement en cours...";

  // ✅ Vérification champs obligatoires
  if (!business || !ownerName || !email || !password || !confirmPassword || !cin || !whatsapp || !address || !businessType || !birthDate || !cinFile) {
    msg.style.color = "red";
    msg.innerText = "Tous les champs sont obligatoires.";
    return;
  }

  // ✅ Vérification mot de passe / confirm password
  if (password !== confirmPassword) {
    msg.style.color = "red";
    msg.innerText = "Mot de passe et confirmation ne correspondent pas.";
    return;
  }

  try {
    // 🔹 Kreye FormData pou voye fichye + done
    const formData = new FormData();
    formData.append("fullName", ownerName);
    formData.append("email", email);
    formData.append("password", password); // backend ap hash li
    formData.append("business", business);
    formData.append("address", address);
    formData.append("whatsapp", whatsapp);
    formData.append("businessType", businessType);
    formData.append("birthDate", birthDate);
    formData.append("cin", cin);
    formData.append("cinFile", cinFile);

    // 🔹 Voye done sou API reyèl
    const response = await fetch("https://api.fondationbackupspirituel.com/merchant/register", {
      method: "POST",
      body: formData // multipart/form-data pou upload fichye
    });

    const result = await response.json();

    if (result.success) {
      msg.style.color = "green";
      msg.innerText = "Compte créé avec succès ✔️";
      setTimeout(() => window.location.href = "merchantloginfobas.html", 1200);
    } else {
      msg.style.color = "red";
      msg.innerText = result.message || "Erreur création compte";
    }

  } catch (err) {
    msg.style.color = "red";
    msg.innerText = "Erreur serveur, réessayez plus tard.";
    console.error("REGISTER MERCHANT ERROR:", err);
  }
});
