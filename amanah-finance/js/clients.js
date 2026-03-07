import { loadDB, updateDB, uid } from "./storage.js";
import { showToast } from "./app.js";

const form = document.getElementById("clientForm");
if (form) {
  const searchInput = document.getElementById("clientSearch");
  const tbody = document.getElementById("clientsTable");

  const clearForm = () => {
    form.reset();
    document.getElementById("clientId").value = "";
  };

  const render = () => {
    const db = loadDB();
    const q = (searchInput.value || "").toLowerCase().trim();
    const rows = db.clients.filter((c) => {
      const hay = `${c.fullName} ${c.phone} ${c.guarantor}`.toLowerCase();
      return hay.includes(q);
    });
    tbody.innerHTML = rows.map((c) => `
      <tr>
        <td data-label="Name">${c.fullName}</td>
        <td data-label="Phone">${c.phone}</td>
        <td data-label="Address">${c.address}</td>
        <td data-label="Guarantor">${c.guarantor}</td>
        <td data-label="Created">${new Date(c.createdAt).toLocaleDateString()}</td>
        <td data-label="Actions">
          <button class="small-btn" data-edit="${c.id}">Edit</button>
          <button class="small-btn btn-muted" data-del="${c.id}">Delete</button>
        </td>
      </tr>
    `).join("") || `<tr><td colspan="6" class="no-data-cell">No clients found.</td></tr>`;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("clientId").value;
    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const guarantor = document.getElementById("guarantor").value.trim();

    if (!fullName || !phone || !address || !guarantor) {
      showToast("All client fields are required.", true);
      return;
    }

    updateDB((db) => {
      if (id) {
        const idx = db.clients.findIndex((c) => c.id === id);
        if (idx >= 0) db.clients[idx] = { ...db.clients[idx], fullName, phone, address, guarantor };
      } else {
        db.clients.push({ id: uid("client"), fullName, phone, address, guarantor, createdAt: new Date().toISOString() });
      }
    });

    showToast(id ? "Client updated." : "Client created.");
    clearForm();
    render();
  });

  document.getElementById("clearClientBtn").addEventListener("click", clearForm);

  tbody.addEventListener("click", (e) => {
    const editId = e.target.dataset.edit;
    const delId = e.target.dataset.del;
    if (editId) {
      const c = loadDB().clients.find((x) => x.id === editId);
      if (!c) return;
      document.getElementById("clientId").value = c.id;
      document.getElementById("fullName").value = c.fullName;
      document.getElementById("phone").value = c.phone;
      document.getElementById("address").value = c.address;
      document.getElementById("guarantor").value = c.guarantor;
    }
    if (delId) {
      updateDB((db) => {
        db.clients = db.clients.filter((c) => c.id !== delId);
        db.contracts = db.contracts.filter((co) => co.clientId !== delId);
      });
      showToast("Client and related contracts removed.");
      render();
    }
  });

  searchInput.addEventListener("input", render);
  render();
}
