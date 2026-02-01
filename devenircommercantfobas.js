document.getElementById("registerForm").addEventListener("submit", async e => {
  e.preventDefault();

  const business = document.getElementById("business").value;
  const ownerName = document.getElementById("ownerName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const cin = document.getElementById("cin").value;
  const whatsapp = document.getElementById("whatsapp").value;
  const address = document.getElementById("address").value;
  const businessType = document.getElementById("businessType").value;
  const birthDate = document.getElementById("birthDate").value;
  const cinFile = document.getElementById("cinFile").files[0];

  const msg = document.getElementById("msg");
  msg.style.color = "#0056b3";
  msg.innerText = "Traitement en cours...";

  // ✅ Vérification basique fichier CIN et numéro CIN
  if(!cinFile){
    msg.style.color="red";
    msg.innerText="Veuillez uploader votre carte CIN.";
    return;
  }

  // Ici ou ka ajoute yon vrai OCR / API pour lire CIN de l'image
  // Pou demo senp, nou pral fè yon comparaison **simulée**
  // Egzanp: si CIN nan fòm = CIN sou imaj (simulé)
  const cinFromImage = cin; // pou demo, nou assume li menm
  if(cin !== cinFromImage){
    msg.style.color="red";
    msg.innerText="Numéro CIN ne correspond pas à la carte uploadée.";
    return;
  }

  // Kreye objè pou sove nan localStorage
  const data = {
    business,
    ownerName,
    email,
    password, // backend => bcrypt hash 12
    cin,
    whatsapp,
    address,
    businessType,
    birthDate
  };

  // Sove nan localStorage pou demo
  localStorage.setItem("merchantAuth", JSON.stringify(data));

  msg.style.color="green";
  msg.innerText="Compte créé avec succès ✔️";

  setTimeout(()=>{
    window.location.href="merchantloginfobas.html";
  },1200);
});
