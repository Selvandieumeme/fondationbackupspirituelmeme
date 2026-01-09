// =================== nosagentsautorises.js ===================

// Container kote lis agents yo ap monte
const agentsContainer = document.getElementById("agentsContainer");

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
  const container = document.getElementById("agentsContainer");

  // Chaje paj nosagentsfobas.html
  fetch("nosagentsfobas.html")
    .then(response => response.text())
    .then(html => {
      container.innerHTML = html;

      // Apre paj la fin chaje, rele fonksyon loadDept nan nosagentsfobas.js pou montre agents yo
      setTimeout(() => {
        if (typeof loadDept === "function") {
          loadDept(departement);
        }
      }, 100); // 100ms pou garanti paj la fin chaje
    })
    .catch(err => {
      container.innerHTML = "<p>Erreur lors du chargement des agents.</p>";
      console.error(err);
    });
}
