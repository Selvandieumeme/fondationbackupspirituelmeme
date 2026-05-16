// LOADER
window.addEventListener("load", () => {

  const loader = document.getElementById("loader");

  setTimeout(() => {
    loader.style.display = "none";
  }, 1000);

});

// MOBILE MENU
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

// BUTTON HOVER EFFECT
const buttons = document.querySelectorAll("button");

buttons.forEach((btn) => {

  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "scale(1.05)";
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "scale(1)";
  });

});

// SCROLL ANIMATION
const observer = new IntersectionObserver((entries) => {

  entries.forEach((entry) => {

    if(entry.isIntersecting){
      entry.target.classList.add("show");
    }

  });

});

const hiddenElements = document.querySelectorAll(
  ".feature-card, .stat-card, .agent-box, .business-card"
);

hiddenElements.forEach((el) => {

  el.style.opacity = "0";
  el.style.transform = "translateY(40px)";
  el.style.transition = "all 0.8s ease";

  observer.observe(el);

});

// APPLY SHOW CLASS
const style = document.createElement("style");
style.innerHTML = `
.show{
  opacity:1 !important;
  transform:translateY(0) !important;
}
`;

document.head.appendChild(style);

console.log("FOBAS DIGITAL AGENTS CONNECTED");
