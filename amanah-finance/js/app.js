import { loadDB } from "./storage.js";

const AUTH_KEY = "amanahSession";

const navItems = [
  ["Dashboard", "index.html", "dashboard"],
  ["Clients", "clients.html", "clients"],
  ["Contracts", "contracts.html", "contracts"],
  ["Payments", "payments.html", "payments"],
  ["Reports", "reports.html", "reports"]
];

function isAuthenticated() {
  return Boolean(localStorage.getItem(AUTH_KEY));
}

function enforceAuth() {
  const page = document.body.dataset.page;
  const authed = isAuthenticated();

  if (page === "login") {
    if (authed) window.location.href = "index.html";
    return;
  }

  if (!authed) {
    window.location.href = "login.html";
  }
}

export function renderNav() {
  const nav = document.getElementById("mainNav");
  if (!nav) return;
  const current = document.body.dataset.page;
  const topbar = nav.closest(".topbar");

  if (current === "login") {
    nav.innerHTML = "";
    return;
  }

  const links = navItems
    .map(([label, href, page]) => `<a href="${href}" class="${current === page ? "active" : ""}">${label}</a>`)
    .join("");

  nav.innerHTML = `${links}<button id="logoutBtn" class="logout-btn">Logout</button>`;

  let toggle = document.getElementById("navToggle");
  if (!toggle && topbar) {
    toggle = document.createElement("button");
    toggle.id = "navToggle";
    toggle.className = "menu-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Toggle navigation menu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "☰";
    topbar.insertBefore(toggle, nav);
  }
}

function bindLogout() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = "login.html";
  });
}

function bindMobileNav() {
  const nav = document.getElementById("mainNav");
  const toggle = document.getElementById("navToggle");
  if (!nav || !toggle) return;

  const closeMenu = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "☰";
  };

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.textContent = isOpen ? "✕" : "☰";
  });

  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) closeMenu();
  });
}

let toastTimer;
export function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = isError ? "#b42318" : "#15221f";
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

export function todayISO() {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function isValidDate(value) {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

export function getOverdueInstallments(db = loadDB()) {
  const today = new Date(todayISO());
  const rows = [];
  db.contracts.forEach((contract) => {
    contract.schedule.forEach((inst) => {
      const due = new Date(inst.dueDate);
      if (due < today && Number(inst.paidAmount) + 0.0001 < Number(inst.amount)) {
        rows.push({ contract, installment: inst });
      }
    });
  });
  return rows;
}

enforceAuth();
renderNav();
bindLogout();
bindMobileNav();
