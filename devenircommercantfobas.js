// 🔹 Toggle zye pou montre/kache mot de passe
document.querySelectorAll(".toggle-password").forEach(span => {
  span.addEventListener("click", () => {
    const input = span.previousElementSibling;
    input.type = input.type === "password" ? "text" : "password";
  });
});

// 🔹 Fòm enskripsyon
document.getElementById("registerForm").addEventListener("submit", async e => {
  e.preventDefault();

  const business = document.getElementById("business").value;
  const ownerName = document.getElementById("ownerName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value; // nouvo chan
  const cin = document.getElementById("cin").value;
  const whatsapp = document.getElementById("whatsapp").value;
  const address = document.getElementById("address").value;
  const businessType = document.getElementById("businessType").value;
  const birthDate = document.getElementById("birthDate").value;
  const cinFile = document.getElementById("cinFile").files[0];

  const msg = document.getElementById("msg");
  msg.style.color = "#0056b3";
  msg.innerText = "Traitement en cours...";

  // ✅ Vérification basique fichier CIN
  if(!cinFile){
    msg.style.color="red";
    msg.innerText="Veuillez uploader votre carte CIN.";
    return;
  }

  // ✅ Vérification mot de passe / confirm password
  if(password !== confirmPassword){
    msg.style.color="red";
    msg.innerText="Mot de passe et confirmation ne correspondent pas.";
    return;
  }

  // ✅ Simulasyon OCR pou CIN
  const cinFromImage = cin; // pou demo nou assume li menm
  if(cin !== cinFromImage){
    msg.style.color="red";
    msg.innerText="Numéro CIN ne correspond pas à la carte uploadée.";
    return;
  }

  // 🔹 Kreye objè pou voye sou backend
  const data = {
    fullName: ownerName,
    email,
    password, // backend => bcrypt hash
    business,
    address,
    whatsapp,
    businessType,
    birthDate,
    cin
  };

  try {
    // 🔹 Voye done sou API reyèl ou
    const response = await fetch("https://api.fondationbackupspirituel.com/merchant/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if(result.success){
      msg.style.color="green";
      msg.innerText="Compte créé avec succès ✔️";
      setTimeout(()=> window.location.href="merchantloginfobas.html", 1200);
    } else {
      msg.style.color="red";
      msg.innerText = result.message || "Erreur création compte";
    }

  } catch(err){
    msg.style.color="red";
    msg.innerText="Erreur serveur, réessayez plus tard.";
    console.error("REGISTER MERCHANT ERROR:", err);
  }
});
