import { loadDB, saveDB } from "./storage.js";

const API_URL = "https://api.frankfurter.app/latest?from=USD&to=SOS";

export async function getUsdToSosRate() {
  const db = loadDB();
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    const rate = Number(data?.rates?.SOS);
    if (!rate || rate <= 0) throw new Error("Invalid rate");
    db.settings.lastRate = { usdToSos: rate, fetchedAt: new Date().toISOString() };
    saveDB(db);
    return { rate, source: "live" };
  } catch {
    const cached = db.settings.lastRate?.usdToSos;
    if (cached) return { rate: Number(cached), source: "cache" };
    return { rate: null, source: "none" };
  }
}

export function convertCurrency(amount, base, usdToSos) {
  if (!usdToSos) return { primary: amount, secondary: null, secondaryLabel: "" };
  if (base === "USD") {
    return {
      primary: amount,
      secondary: amount * usdToSos,
      secondaryLabel: "SOS"
    };
  }
  return {
    primary: amount,
    secondary: amount / usdToSos,
    secondaryLabel: "USD"
  };
}
