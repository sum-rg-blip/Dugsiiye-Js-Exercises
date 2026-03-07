import { contractRemaining, findClientName, loadDB, parseNum, uid, updateDB } from "./storage.js";
import { isValidDate, showToast, todayISO } from "./app.js";

const form = document.getElementById("paymentForm");

function recalcContractStatus(contract) {
  const allPaid = contract.schedule.every((s) => Number(s.paidAmount) + 0.0001 >= Number(s.amount));
  contract.schedule.forEach((s) => {
    s.status = Number(s.paidAmount) + 0.0001 >= Number(s.amount) ? "PAID" : "PENDING";
  });
  contract.status = allPaid ? "CLOSED" : "ACTIVE";
}

export function applyPaymentToSchedule(contract, amount) {
  let remaining = Number(amount);
  for (const inst of contract.schedule) {
    const due = Number(inst.amount) - Number(inst.paidAmount);
    if (due <= 0) continue;
    const applied = Math.min(due, remaining);
    inst.paidAmount = Number((Number(inst.paidAmount) + applied).toFixed(2));
    remaining = Number((remaining - applied).toFixed(2));
    if (remaining <= 0) break;
  }
  recalcContractStatus(contract);
  return remaining;
}

if (form) {
  const contractSel = document.getElementById("paymentContract");
  const paymentsTbody = document.getElementById("paymentsTable");
  const remainingLabel = document.getElementById("paymentRemaining");
  document.getElementById("paymentDate").value = todayISO();

  function loadContracts() {
    const db = loadDB();
    const active = db.contracts.filter((c) => c.status === "ACTIVE");
    contractSel.innerHTML = `<option value="">Select contract</option>` + active.map((c) => `
      <option value="${c.id}">${c.id} | ${findClientName(db, c.clientId)} | Remaining ${contractRemaining(c).toFixed(2)}</option>
    `).join("");
  }

  function renderPayments() {
    const db = loadDB();
    paymentsTbody.innerHTML = db.payments
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((p) => `
      <tr>
        <td data-label="Date">${p.date}</td>
        <td data-label="Contract">${p.contractId}</td>
        <td data-label="Amount">${Number(p.amount).toFixed(2)}</td>
        <td data-label="Method">${p.method}</td>
        <td data-label="Note">${p.note || "-"}</td>
      </tr>`).join("") || `<tr><td colspan="5" class="no-data-cell">No payments yet.</td></tr>`;
  }

  function updateRemainingHint() {
    const db = loadDB();
    const contract = db.contracts.find((c) => c.id === contractSel.value);
    remainingLabel.textContent = contract ? `Remaining balance: ${contractRemaining(contract).toFixed(2)}` : "";
  }

  contractSel.addEventListener("change", updateRemainingHint);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const contractId = contractSel.value;
    const date = document.getElementById("paymentDate").value;
    const amount = parseNum(document.getElementById("paymentAmount").value);
    const method = document.getElementById("paymentMethod").value;
    const note = document.getElementById("paymentNote").value.trim();

    if (!contractId) return showToast("Select a contract.", true);
    if (!isValidDate(date)) return showToast("Payment date is invalid.", true);
    if (new Date(date) > new Date(todayISO())) return showToast("Payment date cannot be in the future.", true);
    if (!(amount > 0)) return showToast("Payment amount must be positive.", true);

    let paymentRecorded = false;
    let err = "";

    updateDB((db) => {
      const contract = db.contracts.find((c) => c.id === contractId);
      if (!contract) {
        err = "Contract not found.";
        return;
      }

      const remaining = contractRemaining(contract);
      if (amount - remaining > 0.0001) {
        err = `Overpayment blocked. Max allowed is ${remaining.toFixed(2)}.`;
        return;
      }

      const left = applyPaymentToSchedule(contract, amount);
      if (left > 0.0001) {
        err = "Could not apply full payment.";
        return;
      }

      db.payments.push({ id: uid("pay"), contractId, date, amount: Number(amount.toFixed(2)), method, note });
      paymentRecorded = true;
    });

    if (!paymentRecorded) return showToast(err || "Payment failed.", true);
    showToast("Payment posted successfully.");
    form.reset();
    document.getElementById("paymentDate").value = todayISO();
    loadContracts();
    renderPayments();
    updateRemainingHint();
  });

  loadContracts();
  renderPayments();
  updateRemainingHint();
}
