/**
 * Extracts job text from a document object.
 * Accepts `doc` as a parameter so it can be called with a real or jsdom document.
 */
export function extractJobText(doc) {
  const sel = (s) => doc.querySelector(s)?.textContent?.trim() ?? "";
  const title = sel(".job-details-jobs-unified-top-card__job-title");
  const company = sel(".job-details-jobs-unified-top-card__company-name");
  const location = sel(".job-details-jobs-unified-top-card__primary-description-container");
  const description =
    sel(".jobs-description__content") ||
    sel(".jobs-box__html-content") ||
    doc.querySelector("main")?.textContent?.trim() || "";
  return [title, company, location, description].filter(Boolean).join("\n\n");
}
