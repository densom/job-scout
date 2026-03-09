(function () {
  "use strict";

  let currentUrl = location.href;
  let isLoading = false;
  let lastExtracted = null; // stored for no-api-key debug display

  // ── DOM helpers ─────────────────────────────────────────────────────────────

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === "className") node.className = v;
        else if (k === "title") node.title = v;
        else if (k === "href") node.href = v;
        else node.setAttribute(k, v);
      }
    }
    for (const child of children) {
      if (typeof child === "string") node.appendChild(document.createTextNode(child));
      else if (child) node.appendChild(child);
    }
    return node;
  }

  function clearEl(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  // ── Sidebar structure ───────────────────────────────────────────────────────

  function createSidebar() {
    if (document.getElementById("job-scout-sidebar")) return;

    const toggleBtn = el("button", { id: "job-scout-toggle", title: "Collapse/Expand" }, "\u276E");
    toggleBtn.addEventListener("click", toggleSidebar);

    const header = el("div", { id: "job-scout-header" },
      el("span", { id: "job-scout-title-bar" }, "Job Scout"),
      toggleBtn
    );

    const body = el("div", { id: "job-scout-body" },
      el("div", { id: "job-scout-content" })
    );

    const sidebar = el("div", { id: "job-scout-sidebar" }, header, body);
    document.body.appendChild(sidebar);
  }

  function toggleSidebar() {
    const sidebar = document.getElementById("job-scout-sidebar");
    const btn = document.getElementById("job-scout-toggle");
    if (!sidebar) return;
    sidebar.classList.toggle("collapsed");
    btn.textContent = sidebar.classList.contains("collapsed") ? "\u276D" : "\u276E";
  }

  // ── Content extraction ──────────────────────────────────────────────────────

  function extractJobText() {
    const sel = (s) => document.querySelector(s)?.textContent?.trim() ?? "";
    const title = sel(".job-details-jobs-unified-top-card__job-title");
    const company = sel(".job-details-jobs-unified-top-card__company-name");
    const location = sel(".job-details-jobs-unified-top-card__primary-description-container");
    const description =
      sel(".jobs-description__content") ||
      sel(".jobs-box__html-content") ||
      document.querySelector("main")?.textContent?.trim() || "";
    const salary =
      sel(".job-details-jobs-unified-top-card__job-insight--highlight") ||
      sel(".compensation__salary") ||
      sel("[data-test-salary-range]") || "";
    return { title, company, location, description, salary };
  }

  // ── Render states ───────────────────────────────────────────────────────────

  function getContentEl() {
    return document.getElementById("job-scout-content");
  }

  function showSpinner() {
    const content = getContentEl();
    if (!content) return;
    clearEl(content);
    const wrap = el("div", { className: "job-scout-spinner-wrap" },
      el("div", { className: "job-scout-spinner" }),
      el("p", {}, "Summarizing...")
    );
    content.appendChild(wrap);
  }

  function showError(message, retryable) {
    const content = getContentEl();
    if (!content) return;
    clearEl(content);
    const wrapper = el("div", { className: "job-scout-error" },
      el("p", {}, message)
    );
    if (retryable) {
      const btn = el("button", { id: "job-scout-retry" }, "Retry");
      btn.addEventListener("click", () => runSummarize());
      wrapper.appendChild(btn);
    }
    content.appendChild(wrapper);
  }

  function showNoApiKey() {
    const content = getContentEl();
    if (!content) return;
    clearEl(content);
    const link = el("a", { href: "#" }, "Job Scout options page");
    link.addEventListener("click", (e) => {
      e.preventDefault();
      chrome.runtime.sendMessage({ action: "openOptions" });
    });
    const wrapper = el("div", { className: "job-scout-error" },
      el("p", {}, "No API key set."),
      el("p", {}, "Open the ", link, " to add your Anthropic API key.")
    );

    if (lastExtracted) {
      const { title, company, location, description } = lastExtracted;
      const fields = [
        ["Title", title],
        ["Company", company],
        ["Location", location],
        ["Salary", salary],
        ["Description", description],
      ];
      const debugSection = el("div", { className: "job-scout-section job-scout-debug" },
        el("div", { className: "job-scout-label" }, "Extracted Fields (debug)")
      );
      for (const [label, value] of fields) {
        debugSection.appendChild(
          el("div", { className: "job-scout-debug-field" },
            el("span", { className: "job-scout-debug-key" }, label + ": "),
            el("span", { className: "job-scout-debug-val" }, value || "(empty)")
          )
        );
      }
      wrapper.appendChild(debugSection);
    }

    content.appendChild(wrapper);
  }

  function showWarning(message, retryable) {
    const content = getContentEl();
    if (!content) return;
    clearEl(content);
    const wrapper = el("div", { className: "job-scout-warning" },
      el("p", {}, message)
    );
    if (retryable) {
      const btn = el("button", { id: "job-scout-retry" }, "Retry");
      btn.addEventListener("click", () => runSummarize());
      wrapper.appendChild(btn);
    }
    content.appendChild(wrapper);
  }

  function renderSummary(data) {
    const content = getContentEl();
    if (!content) return;
    clearEl(content);

    function section(label, ...valueNodes) {
      const s = el("div", { className: "job-scout-section" },
        el("div", { className: "job-scout-label" }, label)
      );
      for (const node of valueNodes) s.appendChild(node);
      return s;
    }

    const qualList = el("ul", { className: "job-scout-bullets" });
    for (const q of (data.qualifications ?? [])) {
      qualList.appendChild(el("li", {}, q));
    }

    content.appendChild(section("Job Title",
      el("div", { className: "job-scout-value" }, data.title ?? "\u2014")
    ));
    content.appendChild(section("Company",
      el("div", { className: "job-scout-value" }, data.company ?? "\u2014"),
      el("div", { className: "job-scout-sub" }, data.companyDescription ?? "")
    ));
    content.appendChild(section("Location / Remote",
      el("div", { className: "job-scout-value" }, data.location ?? "\u2014")
    ));
    if (data.salary) {
      content.appendChild(section("Salary",
        el("div", { className: "job-scout-value" }, data.salary)
      ));
    }
    content.appendChild(section("Role Summary",
      el("div", { className: "job-scout-sub" }, data.roleSummary ?? "\u2014")
    ));
    content.appendChild(section("Expectations & Qualifications", qualList));
  }

  // ── Main flow ───────────────────────────────────────────────────────────────

  function runSummarize() {
    if (isLoading) return;
    isLoading = true;
    showSpinner();

    // Give LinkedIn's SPA a moment to finish rendering job content
    setTimeout(() => {
      lastExtracted = extractJobText();
      const jobText = [lastExtracted.title, lastExtracted.company, lastExtracted.location, lastExtracted.salary, lastExtracted.description]
        .filter(Boolean).join("\n\n");

      if (jobText.length < 100) {
        isLoading = false;
        showWarning("Page may not have loaded fully. Try scrolling down and retrying.", true);
        return;
      }

      chrome.runtime.sendMessage(
        { action: "summarize", text: jobText, url: location.href },
        (response) => {
          isLoading = false;
          if (chrome.runtime.lastError) {
            showError("Extension error: " + chrome.runtime.lastError.message, true);
            return;
          }
          if (!response) {
            showError("No response from background script.", true);
            return;
          }
          if (response.error === "NO_API_KEY") {
            showNoApiKey();
            return;
          }
          if (response.error) {
            showError(response.error, true);
            return;
          }
          renderSummary(response);
        }
      );
    }, 1500);
  }

  function init() {
    chrome.storage.local.get("enabled", ({ enabled = true }) => {
      if (!enabled) return;
      createSidebar();
      runSummarize();
    });
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action !== "setEnabled") return;
    if (message.enabled) {
      createSidebar();
      const sidebar = document.getElementById("job-scout-sidebar");
      if (sidebar) sidebar.style.display = "";
      runSummarize();
    } else {
      const sidebar = document.getElementById("job-scout-sidebar");
      if (sidebar) sidebar.style.display = "none";
    }
  });

  // ── SPA navigation detection ────────────────────────────────────────────────

  function onUrlChange() {
    const newUrl = location.href;
    if (newUrl === currentUrl) return;
    currentUrl = newUrl;

    if (/\/jobs\/view\//.test(newUrl)) {
      isLoading = false;
      const content = getContentEl();
      if (content) clearEl(content);
      runSummarize();
    }
  }

  const _pushState = history.pushState.bind(history);
  history.pushState = function (...args) {
    _pushState(...args);
    setTimeout(onUrlChange, 200);
  };
  const _replaceState = history.replaceState.bind(history);
  history.replaceState = function (...args) {
    _replaceState(...args);
    setTimeout(onUrlChange, 200);
  };
  window.addEventListener("popstate", () => setTimeout(onUrlChange, 200));

  setInterval(onUrlChange, 2000);

  // ── Boot ─────────────────────────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
