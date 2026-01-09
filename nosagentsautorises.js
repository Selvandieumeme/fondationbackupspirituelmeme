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
  // Container prensipal pou agents yo
  const container = document.getElementById("agentsFOBASContainer"); // <- itilize id kòrèk la

  if (!container) {
    console.error("Erreur: element #agentsFOBASContainer pa jwenn nan HTML la.");
    return;
  }

  // Chaje paj nosagentsfobas.html
  fetch("nosagentsfobas.html")
    .then(response => response.text())
    .then(html => {
      container.innerHTML = html;

      setTimeout(() => {
    const agentsContainer = container.querySelector("#agentsContainer");
    if (!agentsContainer) {
        console.error("Erreur: element #agentsContainer pa jwenn apre chargement HTML.");
        return;
    }

    if (typeof loadDept === "function") {
        loadDept(departement, agentsContainer); // <- pase container a
    } else {
        console.error("Fonksyon loadDept pa defini nan nosagentsfobas.js");
    }
}, 100ms);
      
    })
    .catch(err => {
      container.innerHTML = "<p>Erreur lors du chargement des agents.</p>";
      console.error(err);
    });
}
