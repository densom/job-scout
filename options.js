const input = document.getElementById("api-key");
const saveBtn = document.getElementById("save-btn");
const statusEl = document.getElementById("status");

// Load existing key on page open
chrome.storage.local.get("apiKey", ({ apiKey }) => {
  if (apiKey) input.value = apiKey;
});

saveBtn.addEventListener("click", () => {
  const key = input.value.trim();
  if (!key) {
    setStatus("Please enter an API key.", "error");
    return;
  }
  chrome.storage.local.set({ apiKey: key }, () => {
    if (chrome.runtime.lastError) {
      setStatus("Failed to save: " + chrome.runtime.lastError.message, "error");
    } else {
      setStatus("Saved!", "success");
      setTimeout(() => setStatus("", ""), 3000);
    }
  });
});

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = type;
}
