Build a Chrome extension called "Job Scout" that displays a summary sidebar on LinkedIn job postings.



\## Behavior

\- Activates automatically on LinkedIn job posting pages (URL contains /jobs/view/)

\- Extracts job content from the page DOM

\- Calls the Anthropic Claude API to summarize

\- Injects a fixed sidebar on the right side of the page



\## Sidebar Sections

1\. \*\*Job Title\*\*

2\. \*\*Company\*\* — Name plus 1-2 sentence description of what the company does

3\. \*\*Location / Remote\*\* — Remote, hybrid, onsite, or location

4\. \*\*Role Summary\*\* — 2-3 sentences on what this person will actually be working on day-to-day

5\. \*\*Expectations \& Qualifications\*\* — Single bulleted list combining both (keep it tight, 6-8 bullets max)



\## Tech Requirements

\- Manifest V3

\- Content script for DOM extraction and sidebar injection

\- Background service worker for API calls

\- Options page to store Anthropic API key in chrome.storage.sync

\- Use model: claude-sonnet-4-20250514

\- Cache results per job URL using chrome.storage.session

\- Collapse/expand toggle on the sidebar

\- Loading spinner while API call runs



\## Project Structure

/job-scout

&nbsp; manifest.json

&nbsp; background.js

&nbsp; content.js

&nbsp; sidebar.css

&nbsp; options.html

&nbsp; options.js



\## LinkedIn DOM Selectors

\- Job title: .job-details-jobs-unified-top-card\_\_job-title

\- Company: .job-details-jobs-unified-top-card\_\_company-name

\- Location: .job-details-jobs-unified-top-card\_\_primary-description-container

\- Description: .jobs-description\_\_content or .jobs-box\_\_html-content

\- Fall back to scraping visible main content text if selectors fail



\## API Prompt

System: "You are a concise job summarizer. Extract only the key facts. Be brief."

Return structured JSON matching the 5 sidebar sections above.



\## Error Handling

\- No API key set → prompt user to visit options page

\- API failure → show error with retry button

\- Extracted text under 100 chars → warn that page may not have loaded



\## Style

\- Sidebar: 360px wide, fixed right edge, full height

\- Clean, minimal card layout per section

\- CSS isolated so it does not break LinkedIn's layout



Include a README with steps to load the unpacked extension and set the API key.

