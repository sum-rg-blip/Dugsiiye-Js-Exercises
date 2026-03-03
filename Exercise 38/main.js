
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav__link");
const sections = document.querySelectorAll("section");


navToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});


navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const observerOptions = {
  root: null,
  rootMargin: "-40% 0px -55% 0px",
  threshold: 0
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const id = entry.target.getAttribute("id");

    navLinks.forEach((link) => link.classList.remove("active"));
    const activeLink = document.querySelector(`.nav__link[href="#${id}"]`);
    if (activeLink) activeLink.classList.add("active");
  });
}, observerOptions);

sections.forEach((section) => observer.observe(section));

window.addEventListener("scroll", () => {
  if (window.scrollY < 30) {
    navLinks.forEach((link) => link.classList.remove("active"));
    const homeLink = document.querySelector(`.nav__link[href="#home"]`);
    if (homeLink) homeLink.classList.add("active");
  }
});
