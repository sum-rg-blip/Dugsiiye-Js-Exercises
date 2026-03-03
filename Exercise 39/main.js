const form = document.getElementById("translatorForm");
const fromLang = document.getElementById("fromLang");
const toLang = document.getElementById("toLang");
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const translateBtn = document.getElementById("translateBtn");


const API_BASES = [
  "https://translate.argosopentech.com",
  "https://libretranslate.de"
];

const FALLBACK_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "so", name: "Somali" },
  { code: "ar", name: "Arabic" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "sw", name: "Swahili" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "tr", name: "Turkish" },
  { code: "hi", name: "Hindi" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" }
];

function createOption(code, name) {
  const option = document.createElement("option");
  option.value = code;
  option.textContent = `${name} (${code})`;
  return option;
}

function populateLanguageSelects(languages) {
  const sorted = languages
    .map((lang) => ({
      code: lang.code,
      name: lang.name || lang.code
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  fromLang.innerHTML = "";
  toLang.innerHTML = "";

  sorted.forEach((lang) => {
    fromLang.appendChild(createOption(lang.code, lang.name));
    toLang.appendChild(createOption(lang.code, lang.name));
  });

  fromLang.value = sorted.some((l) => l.code === "en") ? "en" : sorted[0].code;
  const fallbackTo = sorted.find((l) => l.code !== fromLang.value);
  toLang.value = sorted.some((l) => l.code === "so")
    ? "so"
    : (fallbackTo ? fallbackTo.code : sorted[0].code);
}

async function requestWithFallback(path, options) {
  let lastError = null;

  for (const base of API_BASES) {
    try {
      const response = await fetch(`${base}${path}`, options);
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`${response.status}: ${body}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`All free translation endpoints failed. ${lastError?.message || ""}`);
}

async function loadLanguages() {
  fromLang.disabled = true;
  toLang.disabled = true;
  translateBtn.disabled = true;
  outputText.textContent = "Loading languages...";

  try {
    const languages = await requestWithFallback("/languages", { method: "GET" });
    if (!Array.isArray(languages) || !languages.length) {
      throw new Error("No languages were returned by API.");
    }
    populateLanguageSelects(languages);
  } catch {
    
    populateLanguageSelects(FALLBACK_LANGUAGES);
  }

  fromLang.disabled = false;
  toLang.disabled = false;
  translateBtn.disabled = false;
  outputText.textContent = "Your translation will appear here.";
}

async function translateText(text, from, to) {
  try {
    const data = await requestWithFallback("/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: from,
        target: to,
        format: "text"
      })
    });

    if (!data || typeof data.translatedText !== "string") {
      throw new Error("Invalid translation response.");
    }
    return data.translatedText;
  } catch {
    
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(from)}|${encodeURIComponent(to)}`;
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Translation failed (${response.status}): ${body}`);
    }
    const data = await response.json();
    const translated = data?.responseData?.translatedText;
    if (!translated) {
      throw new Error("Translation failed: empty response.");
    }
    return translated;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = inputText.value.trim();
  const from = fromLang.value;
  const to = toLang.value;

  if (!text) {
    outputText.textContent = "Please enter text to translate.";
    return;
  }

  translateBtn.disabled = true;
  translateBtn.textContent = "Translating...";
  outputText.textContent = "Working...";

  try {
    const translated = await translateText(text, from, to);
    outputText.textContent = translated;
  } catch (error) {
    outputText.textContent = error.message;
  } finally {
    translateBtn.disabled = false;
    translateBtn.textContent = "Translate";
  }
});

loadLanguages().catch((error) => {
  outputText.textContent = error.message;
  translateBtn.disabled = true;
});
