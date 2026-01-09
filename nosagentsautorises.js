// =================== nosagentsautorises.js ===================

// Chak bouton depatman pral chaje paj "nosagentsfobas.html" dinamikman
document.querySelectorAll(".dept-buttons button").forEach(btn => {
  btn.addEventListener("click", () => {
    const dept = btn.dataset.dept;
    openDeptFOBAS(dept);
  });
});

// Fonksyon pou chaje paj "nosagentsfobas.html" nan menm espas la
function openDeptFOBAS(departement) {
  const container = document.getElementById("agentsFOBASContainer"); // Container prensipal

  if (!container) {
    console.error("Erreur: element #agentsFOBASContainer pa jwenn nan HTML la.");
    return;
  }

  fetch("nosagentsfobas.html")
    .then(res => res.text())
    .then(html => {
      container.innerHTML = html;

      // Asire DOM la fin chaje avan nou rele loadDept
      setTimeout(() => {
        const agentsContainer = container.querySelector("#agentsContainer");
        if (!agentsContainer) {
          console.error("Erreur: element #agentsContainer pa jwenn apre chargement HTML.");
          return;
        }

        if (typeof loadDept === "function") {
          loadDept(departement, agentsContainer); // pase container a
        } else {
          console.error("Fonksyon loadDept pa defini nan nosagentsfobas.js");
        }
      }, 100); // 100ms pou garanti HTML fin chaje
    })
    .catch(err => {
      container.innerHTML = "<p>Erreur lors du chargement des agents.</p>";
      console.error(err);
    });
}
