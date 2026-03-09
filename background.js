import { API_URL, MODEL, SYSTEM_PROMPT, buildUserPrompt, parseApiResponse } from "./lib/bg-utils.js";

// ── Enable / disable toggle ──────────────────────────────────────────────────

function updateBadge(enabled) {
  chrome.action.setBadgeText({ text: enabled ? "" : "OFF" });
  chrome.action.setBadgeBackgroundColor({ color: "#888888" });
}

async function syncBadge() {
  const { enabled = true } = await chrome.storage.local.get("enabled");
  updateBadge(enabled);
}

chrome.runtime.onInstalled.addListener(syncBadge);
chrome.runtime.onStartup.addListener(syncBadge);

chrome.action.onClicked.addListener(async (tab) => {
  const { enabled = true } = await chrome.storage.local.get("enabled");
  const next = !enabled;
  await chrome.storage.local.set({ enabled: next });
  updateBadge(next);
  chrome.tabs.sendMessage(tab.id, { action: "setEnabled", enabled: next }).catch(() => {
    // Content script not present on this tab — no-op
  });
});

// ── Message handler ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "openOptions") {
    chrome.runtime.openOptionsPage();
    return;
  }
  if (message.action !== "summarize") return;

  handleSummarize(message.text, message.url)
    .then(sendResponse)
    .catch((err) => sendResponse({ error: err.message }));

  return true; // keep message channel open for async response
});

async function handleSummarize(jobText, url) {
  // Check session cache first
  const cacheKey = `cache:${url}`;
  const cached = await chrome.storage.session.get(cacheKey);
  if (cached[cacheKey]) {
    return cached[cacheKey];
  }

  // Get API key
  const stored = await chrome.storage.local.get("apiKey");
  const apiKey = stored.apiKey;
  if (!apiKey) {
    return { error: "NO_API_KEY" };
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(jobText) }]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const rawText = data.content?.[0]?.text ?? "";
  const result = parseApiResponse(rawText);

  // Store in session cache
  await chrome.storage.session.set({ [cacheKey]: result });

  return result;
}
