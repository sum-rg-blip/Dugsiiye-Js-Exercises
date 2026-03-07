import { showToast } from "./app.js";

const AUTH_KEY = "amanahSession";
const DEFAULT_USER = { username: "admin", password: "admin123" };

const form = document.getElementById("loginForm");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
      showToast("Username and password are required.", true);
      return;
    }

    if (username !== DEFAULT_USER.username || password !== DEFAULT_USER.password) {
      showToast("Invalid login credentials.", true);
      return;
    }

    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({ username, loginAt: new Date().toISOString() })
    );

    showToast("Login successful.");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 250);
  });
}
