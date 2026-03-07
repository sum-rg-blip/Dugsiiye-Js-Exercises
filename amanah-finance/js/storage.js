const DB_KEY = "amanahDB";

const defaultDB = {
  clients: [],
  contracts: [],
  payments: [],
  settings: { currency: "SOS", lastRate: null, charityBucket: 0 }
};

const clone = (obj) => JSON.parse(JSON.stringify(obj));

export function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
    return clone(defaultDB);
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      ...clone(defaultDB),
      ...parsed,
      settings: { ...defaultDB.settings, ...(parsed.settings || {}) }
    };
  } catch {
    localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
    return clone(defaultDB);
  }
}

export function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function updateDB(mutator) {
  const db = loadDB();
  mutator(db);
  saveDB(db);
  return db;
}

export function money(value) {
  return Number(value || 0).toFixed(2);
}

export function parseNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

export function contractRemaining(contract) {
  const totalPaid = contract.schedule.reduce((sum, s) => sum + Number(s.paidAmount || 0), 0);
  return Math.max(0, Number(contract.totalPayable) - totalPaid);
}

export function findClientName(db, clientId) {
  return db.clients.find((c) => c.id === clientId)?.fullName || "Unknown";
}
