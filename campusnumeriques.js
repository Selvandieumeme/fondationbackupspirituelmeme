const API_BASE_URL = "https://api.fondationbackupspirituel.com";

async function loadCurrentUser() {
  const token = localStorage.getItem("campusToken");

  if (!token) {
    window.location.href = "/campusfobasnumeriques.html";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/academiques/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Session invalide");
    }

    const user = await response.json();

    document.getElementById("userFullName").textContent =
      user.nomComplet || "";

    document.getElementById("userRole").textContent =
      user.role || "";

    if (user.photoProfil) {
      document.getElementById("profilePhoto").src =
        user.photoProfil;
    }

    return user;

  } catch (error) {

    localStorage.removeItem("campusToken");

    window.location.href =
      "/campusfobasnumeriques.html";
  }
}




function buildSidebar(role) {

  const sidebar =
    document.getElementById("campusSidebar");

  const menus = {

    etudiant: [
      "Mes Formations",
      "Ma Progression",
      "Mes Examens",
      "Mes Certificats",
      "Professeur IA",
      "Laboratoires",
      "Mon Profil"
    ],

    professeur: [
      "Mes Étudiants",
      "Mes Classes",
      "Mes Devoirs",
      "Mes Examens",
      "Rapports",
      "Mon Profil"
    ],

    directeur: [
      "Mon Institution",
      "Mes Professeurs",
      "Mes Étudiants",
      "Rapports",
      "Résultats",
      "Abonnement",
      "Mon Profil"
    ],

    agent: [
      "Mon Lien de Parrainage",
      "Mes Affiliations",
      "Mes Institutions",
      "Mes Inscriptions",
      "Revenus Académiques",
      "Statistiques",
      "Mon Profil"
    ]
  };

  sidebar.innerHTML = "";

  menus[role]?.forEach(item => {

    const button =
      document.createElement("button");

    button.textContent = item;

    sidebar.appendChild(button);

  });
}



document
  .getElementById("logoutBtn")
  ?.addEventListener("click", () => {

    localStorage.removeItem("campusToken");

    window.location.href =
      "/campusfobasnumeriques.html";

});





document.addEventListener(
  "DOMContentLoaded",
  async () => {

    const user =
      await loadCurrentUser();

    if (!user) return;

    buildSidebar(user.role);

});




