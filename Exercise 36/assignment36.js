const colorPicker = document.getElementById("colorPicker");
const previewBox = document.getElementById("previewBox");
const historyList = document.getElementById("history");
const clearBtn = document.getElementById("clearBtn");

let history = [];

// Update preview box (real-time)
function updatePreview(color) {
  previewBox.style.backgroundColor = color;
  previewBox.textContent = color;
}

// Add color to history list
function addToHistory(color) {
  history.push(color);

  const li = document.createElement("li");
  li.className = "color-item";

  const swatch = document.createElement("div");
  swatch.className = "swatch";
  swatch.style.backgroundColor = color;

  const text = document.createElement("span");
  text.textContent = color;

  li.appendChild(swatch);
  li.appendChild(text);

  historyList.appendChild(li);
}

// When user selects a color
colorPicker.addEventListener("input", (event) => {
  const selectedColor = event.target.value;

  updatePreview(selectedColor);
  addToHistory(selectedColor);
});

// Clear history
clearBtn.addEventListener("click", () => {
  history = [];
  historyList.innerHTML = "";
});

// Initialize with default value
updatePreview(colorPicker.value);