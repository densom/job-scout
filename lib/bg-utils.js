export const API_URL = "https://api.anthropic.com/v1/messages";
export const MODEL = "claude-sonnet-4-20250514";
export const SYSTEM_PROMPT = "You are a concise job summarizer. Extract only the key facts. Be brief.";

export function buildUserPrompt(jobText) {
  return `Summarize the following job posting. Return ONLY valid JSON with exactly these fields:
{
  "title": "Job title",
  "company": "Company name",
  "companyDescription": "1-2 sentences on what the company does",
  "location": "Remote / Hybrid / Onsite + location",
  "roleSummary": "2-3 sentences on what this person will actually do day-to-day",
  "qualifications": ["bullet 1", "bullet 2", "...up to 8 bullets combining requirements and nice-to-haves"]
}

Job posting:
${jobText}`;
}

/**
 * Parses the raw text content from the Claude API response.
 * Strips markdown code fences if present, then JSON.parses.
 * Throws if parsing fails.
 */
export function parseApiResponse(rawText) {
  const jsonText = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return JSON.parse(jsonText);
}
