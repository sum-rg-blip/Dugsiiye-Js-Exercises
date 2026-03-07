import { contractRemaining, findClientName, loadDB, parseNum, uid, updateDB } from "./storage.js";
import { showToast } from "./app.js";

const form = document.getElementById("contractForm");

function addMonthsKeepDay(startDate, plus) {
  const d = new Date(startDate);
  const day = d.getDate();
  d.setMonth(d.getMonth() + plus);
  if (d.getDate() < day) d.setDate(0);
  return d;
}

export function generateSchedule(startDate, months, totalPayable) {
  const m = Number(months);
  const t = Number(totalPayable);
  const each = Math.floor((t / m) * 100) / 100;
  let allocated = 0;
  const out = [];

  for (let i = 0; i < m; i++) {
    const amount = i === m - 1 ? Number((t - allocated).toFixed(2)) : each;
    allocated += amount;
    const dueDate = addMonthsKeepDay(startDate, i).toISOString().slice(0, 10);
    out.push({
      installmentNo: i + 1,
      dueDate,
      amount: Number(amount.toFixed(2)),
      paidAmount: 0,
      status: "PENDING"
    });
  }
  return out;
}

if (form) {
  const clientSel = document.getElementById("contractClient");
  const typeSel = document.getElementById("contractType");
  const principalWrap = document.getElementById("principalWrap");
  const costWrap = document.getElementById("costWrap");
  const profitWrap = document.getElementById("profitWrap");
  const preview = document.getElementById("contractPreview");
  const tbody = document.getElementById("contractsTable");

  const scheduleCard = document.getElementById("scheduleCard");
  const scheduleTable = document.getElementById("scheduleTable");

  function loadClients() {
    const db = loadDB();
    clientSel.innerHTML = `<option value="">Select client</option>` + db.clients
      .map((c) => `<option value="${c.id}">${c.fullName} (${c.phone})</option>`)
      .join("");
  }

  function toggleTypeFields() {
    const isMur = typeSel.value === "MURABAHA";
    principalWrap.classList.toggle("hidden", isMur);
    costWrap.classList.toggle("hidden", !isMur);
    profitWrap.classList.toggle("hidden", !isMur);
  }

  function calcPreview() {
    const type = typeSel.value;
    const months = parseNum(document.getElementById("months").value);
    if (!months || months < 1) {
      preview.textContent = "";
      return;
    }
    if (type === "QARD") {
      const principal = parseNum(document.getElementById("principal").value);
      if (principal > 0) {
        preview.textContent = `Qard Hasan: total payable ${principal.toFixed(2)} (no profit). Installment ${
          (principal / months).toFixed(2)
        }`;
      }
    } else {
      const cost = parseNum(document.getElementById("costPrice").value);
      const profit = parseNum(document.getElementById("profitAmount").value);
      if (cost >= 0 && profit >= 0) {
        const total = cost + profit;
        preview.textContent = `Murabaha: cost ${cost.toFixed(2)} + fixed profit ${profit.toFixed(2)} = ${
          total.toFixed(2)
        }. Installment ${(total / months).toFixed(2)}`;
      }
    }
  }

  function renderContracts() {
    const db = loadDB();
    tbody.innerHTML = db.contracts.map((c) => `
      <tr>
        <td data-label="ID">${c.id}</td>
        <td data-label="Client">${findClientName(db, c.clientId)}</td>
        <td data-label="Type">${c.type}</td>
        <td data-label="Total">${Number(c.totalPayable).toFixed(2)}</td>
        <td data-label="Remaining">${contractRemaining(c).toFixed(2)}</td>
        <td data-label="Status"><span class="badge ${c.status === "CLOSED" ? "success" : ""}">${c.status}</span></td>
        <td data-label="Details"><button class="small-btn" data-show="${c.id}">Schedule</button></td>
      </tr>
    `).join("") || `<tr><td colspan="7" class="no-data-cell">No contracts yet.</td></tr>`;
  }

  function showSchedule(contractId) {
    const contract = loadDB().contracts.find((c) => c.id === contractId);
    if (!contract) {
      showToast("Contract not found.", true);
      return;
    }
    scheduleCard.classList.remove("hidden");
    scheduleTable.innerHTML = contract.schedule.map((s) => `
      <tr>
        <td data-label="No">${s.installmentNo}</td>
        <td data-label="Due Date">${s.dueDate}</td>
        <td data-label="Amount">${Number(s.amount).toFixed(2)}</td>
        <td data-label="Paid">${Number(s.paidAmount).toFixed(2)}</td>
        <td data-label="Status"><span class="badge ${s.status === "PAID" ? "success" : "warn"}">${s.status}</span></td>
      </tr>
    `).join("");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const db = loadDB();
    const clientId = clientSel.value;
    const type = typeSel.value;
    const months = parseNum(document.getElementById("months").value);
    const startDate = document.getElementById("startDate").value;

    if (!clientId || !db.clients.find((c) => c.id === clientId)) return showToast("Valid client is required.", true);
    if (!months || months < 1 || months > 120) return showToast("Months must be between 1 and 120.", true);
    if (!startDate) return showToast("Start date required.", true);

    let principal = 0;
    let costPrice = 0;
    let profitAmount = 0;
    let totalPayable = 0;

    if (type === "QARD") {
      principal = parseNum(document.getElementById("principal").value);
      if (!(principal > 0)) return showToast("Principal must be positive.", true);
      totalPayable = principal;
    } else {
      costPrice = parseNum(document.getElementById("costPrice").value);
      profitAmount = parseNum(document.getElementById("profitAmount").value);
      if (costPrice < 0 || profitAmount < 0 || Number.isNaN(costPrice) || Number.isNaN(profitAmount)) {
        return showToast("Cost and profit must be non-negative numbers.", true);
      }
      totalPayable = costPrice + profitAmount;
      if (!(totalPayable > 0)) return showToast("Murabaha total must be positive.", true);
    }

    const schedule = generateSchedule(startDate, months, totalPayable);

    updateDB((live) => {
      live.contracts.push({
        id: uid("contract"),
        clientId,
        type,
        principal: type === "QARD" ? principal : null,
        costPrice: type === "MURABAHA" ? costPrice : null,
        profitAmount: type === "MURABAHA" ? profitAmount : null,
        totalPayable: Number(totalPayable.toFixed(2)),
        months,
        startDate,
        status: "ACTIVE",
        schedule
      });
    });

    showToast("Contract created.");
    form.reset();
    toggleTypeFields();
    preview.textContent = "";
    renderContracts();
  });

  ["input", "change"].forEach((evt) => form.addEventListener(evt, calcPreview));
  typeSel.addEventListener("change", toggleTypeFields);

  tbody.addEventListener("click", (e) => {
    const id = e.target.dataset.show;
    if (id) showSchedule(id);
  });

  loadClients();
  toggleTypeFields();
  renderContracts();
}
