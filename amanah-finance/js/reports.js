import { convertCurrency, getUsdToSosRate } from "./api.js";
import { contractRemaining, findClientName, loadDB, money, saveDB } from "./storage.js";
import { getOverdueInstallments, showToast } from "./app.js";

function paymentsByMonth(db) {
  const map = new Map();
  db.payments.forEach((p) => {
    const month = p.date.slice(0, 7);
    map.set(month, (map.get(month) || 0) + Number(p.amount));
  });
  const months = Array.from(map.keys()).sort();
  return { labels: months, values: months.map((m) => Number(map.get(m).toFixed(2))) };
}

function contractTypeCounts(db) {
  let q = 0;
  let m = 0;
  db.contracts.forEach((c) => (c.type === "QARD" ? q++ : m++));
  return { q, m };
}

async function renderDashboard() {
  if (document.body.dataset.page !== "dashboard") return;
  const db = loadDB();
  const overdues = getOverdueInstallments(db);
  const summary = document.getElementById("dashboardSummary");
  const dueTable = document.getElementById("dashboardDueTable");
  const recentTable = document.getElementById("dashboardRecentPayments");

  const activeContracts = db.contracts.filter((c) => c.status === "ACTIVE");
  const totalOutstanding = activeContracts.reduce((s, c) => s + contractRemaining(c), 0);

  const today = new Date();
  const weekEnd = new Date();
  weekEnd.setDate(today.getDate() + 7);
  const dueWeek = db.contracts.reduce((sum, c) => {
    return sum + c.schedule.filter((i) => {
      const due = new Date(i.dueDate);
      return due >= today && due <= weekEnd && Number(i.paidAmount) + 0.0001 < Number(i.amount);
    }).length;
  }, 0);

  document.getElementById("kpiActive").textContent = `${activeContracts.length}`;
  document.getElementById("kpiOutstanding").textContent = money(totalOutstanding);
  document.getElementById("kpiDueWeek").textContent = `${dueWeek}`;
  document.getElementById("kpiOverdue").textContent = `${overdues.length}`;

  if (summary) {
    summary.textContent = `Today: ${new Date().toLocaleDateString()} | Active contracts: ${activeContracts.length} | Overdue installments: ${overdues.length}`;
  }

  if (dueTable) {
    const dueRows = [];
    const next14 = new Date();
    next14.setDate(next14.getDate() + 14);
    db.contracts.forEach((contract) => {
      contract.schedule.forEach((inst) => {
        const due = new Date(inst.dueDate);
        if (due >= today && due <= next14 && Number(inst.paidAmount) + 0.0001 < Number(inst.amount)) {
          dueRows.push({
            contractId: contract.id,
            client: findClientName(db, contract.clientId),
            dueDate: inst.dueDate,
            amount: Number(inst.amount) - Number(inst.paidAmount)
          });
        }
      });
    });
    dueRows.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    dueTable.innerHTML = dueRows.slice(0, 6).map((r) => `
      <tr>
        <td data-label="Contract">${r.contractId}</td>
        <td data-label="Client">${r.client}</td>
        <td data-label="Due Date">${r.dueDate}</td>
        <td data-label="Amount">${money(r.amount)}</td>
      </tr>
    `).join("") || `<tr><td colspan="4" class="no-data-cell">No dues in the next 14 days.</td></tr>`;
  }

  if (recentTable) {
    recentTable.innerHTML = db.payments
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6)
      .map((p) => `
        <tr>
          <td data-label="Date">${p.date}</td>
          <td data-label="Contract">${p.contractId}</td>
          <td data-label="Client">${findClientName(db, db.contracts.find((c) => c.id === p.contractId)?.clientId)}</td>
          <td data-label="Amount">${money(p.amount)}</td>
        </tr>
      `).join("") || `<tr><td colspan="4" class="no-data-cell">No payments recorded yet.</td></tr>`;
  }

  const monthly = paymentsByMonth(db);
  const types = contractTypeCounts(db);

  if (window.Chart) {
    const ctx1 = document.getElementById("collectionsChart");
    const ctx2 = document.getElementById("typeChart");

    new Chart(ctx1, {
      type: "bar",
      data: { labels: monthly.labels, datasets: [{ label: "Collections", data: monthly.values, backgroundColor: "#0f766e" }] },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });

    new Chart(ctx2, {
      type: "doughnut",
      data: {
        labels: ["Qard Hasan", "Murabaha"],
        datasets: [{ data: [types.q, types.m], backgroundColor: ["#0f766e", "#5fa69f"] }]
      }
    });
  }

  const rateStatus = document.getElementById("rateStatus");
  const { rate, source } = await getUsdToSosRate();
  if (source === "live") rateStatus.textContent = `Live USD->SOS rate: ${rate.toFixed(3)}`;
  if (source === "cache") rateStatus.textContent = `Using last saved rate: ${rate.toFixed(3)}`;
  if (source === "none") rateStatus.textContent = "Rate unavailable";
}

async function renderReportsPage() {
  if (document.body.dataset.page !== "reports") return;
  const db = loadDB();

  const overdueRows = getOverdueInstallments(db);
  const overdueTbody = document.getElementById("overdueTable");
  const totalsBox = document.getElementById("totalsByType");
  const currencySel = document.getElementById("currencySelect");
  const rateStatus = document.getElementById("reportRateStatus");
  const lateHandlingSel = document.getElementById("lateHandling");

  currencySel.value = db.settings.currency || "SOS";

  const { rate, source } = await getUsdToSosRate();
  if (source === "live") rateStatus.textContent = `Live rate loaded: ${rate.toFixed(3)} USD->SOS`;
  else if (source === "cache") rateStatus.textContent = `Using last saved rate: ${rate.toFixed(3)} USD->SOS`;
  else rateStatus.textContent = "Rate fetch failed and no cached rate available.";

  const base = currencySel.value;
  const totals = {
    QARD: db.contracts.filter((c) => c.type === "QARD").reduce((s, c) => s + contractRemaining(c), 0),
    MURABAHA: db.contracts.filter((c) => c.type === "MURABAHA").reduce((s, c) => s + contractRemaining(c), 0)
  };

  totalsBox.innerHTML = Object.entries(totals).map(([type, amount]) => {
    const c = convertCurrency(amount, base, rate);
    return `<article class="card"><h3>${type}</h3><p>${base} ${money(c.primary)}</p><small>${
      c.secondaryLabel ? `${c.secondaryLabel} ${money(c.secondary)}` : "Secondary currency unavailable"
    }</small></article>`;
  }).join("");

  overdueTbody.innerHTML = overdueRows.map((row) => {
    const c = convertCurrency(row.installment.amount - row.installment.paidAmount, base, rate);
    return `
    <tr>
      <td data-label="Contract">${row.contract.id}</td>
      <td data-label="Client">${findClientName(db, row.contract.clientId)}</td>
      <td data-label="Installment">#${row.installment.installmentNo}</td>
      <td data-label="Due Date">${row.installment.dueDate}</td>
      <td data-label="Due Amount">${base} ${money(c.primary)} ${c.secondaryLabel ? `( ${c.secondaryLabel} ${money(c.secondary)} )` : ""}</td>
      <td data-label="Action"><button class="small-btn" data-reschedule="${row.contract.id}:${row.installment.installmentNo}">Handle</button></td>
    </tr>`;
  }).join("") || `<tr><td colspan="6" class="no-data-cell">No overdue installments.</td></tr>`;

  overdueTbody.onclick = (e) => {
    const token = e.target.dataset.reschedule;
    if (!token) return;
    const [contractId, no] = token.split(":");
    const mode = lateHandlingSel.value;

    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    const nextISO = next.toISOString().slice(0, 10);

    const dbLive = loadDB();
    const contract = dbLive.contracts.find((c) => c.id === contractId);
    if (!contract) return showToast("Contract not found.", true);

    const inst = contract.schedule.find((i) => String(i.installmentNo) === String(no));
    if (!inst) return showToast("Installment not found.", true);

    if (mode === "REMINDER") {
      inst.dueDate = nextISO;
      saveDB(dbLive);
      showToast("Reminder logged and due date rescheduled by 1 month.");
    } else {
      const unpaid = Number(inst.amount) - Number(inst.paidAmount);
      dbLive.settings.charityBucket = Number(dbLive.settings.charityBucket || 0) + Math.max(0, unpaid * 0.02);
      saveDB(dbLive);
      showToast("Late handling recorded as charity bucket (not revenue).");
    }
    renderReportsPage();
  };

  currencySel.onchange = () => {
    const fresh = loadDB();
    fresh.settings.currency = currencySel.value;
    saveDB(fresh);
    renderReportsPage();
  };

  document.getElementById("exportCsvBtn").onclick = () => {
    const latest = loadDB();
    const lines = ["contractId,client,type,totalPayable,remaining,status"];
    latest.contracts.forEach((c) => {
      lines.push([c.id, findClientName(latest, c.clientId), c.type, c.totalPayable, contractRemaining(c), c.status].join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "amanah-report.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };
}

renderDashboard();
renderReportsPage();
