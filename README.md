# Job Scout

A Chrome extension that injects a concise summary sidebar on LinkedIn job postings, powered by the Anthropic Claude API.

## Features

- Activates automatically on `linkedin.com/jobs/view/` pages
- Extracts job details from the page DOM
- Calls the Claude API to produce a structured summary
- Fixed 360px sidebar with 5 sections: Job Title, Company, Location, Role Summary, Expectations & Qualifications
- Collapse/expand toggle
- Session cache — revisiting a job URL skips the API call
- Error handling with retry button

## Loading the Extension

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `job-scout` folder (the folder containing `manifest.json`)
5. The extension will appear in your extensions list

## Setting Your API Key

1. Click the **Job Scout** entry in `chrome://extensions`, then click **Extension options** — or right-click the extension icon in the toolbar and choose **Options**
2. Paste your [Anthropic API key](https://console.anthropic.com/account/keys) into the field
3. Click **Save**

Your key is stored locally in Chrome's sync storage and is only ever sent to `api.anthropic.com`.

## Usage

Navigate to any LinkedIn job posting URL (must contain `/jobs/view/`). The sidebar will appear on the right and populate automatically within a few seconds.

If the sidebar shows a warning that the page may not have loaded, scroll down to trigger LinkedIn's lazy-loaded content, then click **Retry**.

## Project Structure

```
job-scout/
  manifest.json   — MV3 extension manifest
  background.js   — Service worker: calls Claude API, manages session cache
  content.js      — Injected into LinkedIn: extracts DOM, renders sidebar
  sidebar.css     — Scoped sidebar styles
  options.html    — API key settings page
  options.js      — Saves/loads API key from chrome.storage.sync
  README.md
```
