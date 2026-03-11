# Privacy Policy — Job Scout Chrome Extension

**Last updated:** March 2026

## What data we collect

Job Scout does not collect, store, or transmit any personal data to the extension developer.

## How the extension works

1. **API key** — Your Anthropic API key is stored locally on your device using `chrome.storage.local`. It is never sent to anyone other than Anthropic's API servers (`api.anthropic.com`) to authenticate your requests.

2. **Job posting text** — When you visit a LinkedIn job posting, the extension extracts visible text from the page (job title, company name, location, and job description). This text is sent directly to Anthropic's API to generate a summary. It is not sent to any other server.

3. **Cache** — Summaries are cached per job URL in `chrome.storage.session` (in-memory only). This cache is cleared automatically when you close the browser.

## What we do NOT do

- We do not track your browsing history.
- We do not collect analytics or usage data.
- We do not share any data with third parties (other than Anthropic for API calls).
- We do not store your data on any server controlled by the extension developer.

## Third-party services

Job Scout uses the [Anthropic API](https://www.anthropic.com) to generate job summaries. Job text from LinkedIn pages is sent to Anthropic for processing. Please review [Anthropic's Privacy Policy](https://www.anthropic.com/privacy) for details on how they handle data.

## Changes to this policy

If this policy changes, the updated version will be included with the extension update in the Chrome Web Store.

## Contact

For questions, open an issue on the extension's GitHub repository.
