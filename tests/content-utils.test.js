import { describe, it, expect, beforeEach } from "vitest";
import { JSDOM } from "jsdom";
import { extractJobText } from "../lib/content-utils.js";

function makeDoc(html) {
  return new JSDOM(html).window.document;
}

// ── extractJobText ────────────────────────────────────────────────────────────

describe("extractJobText", () => {
  it("extracts text using primary LinkedIn selectors", () => {
    const doc = makeDoc(`
      <div class="job-details-jobs-unified-top-card__job-title">Senior Engineer</div>
      <div class="job-details-jobs-unified-top-card__company-name">Acme Corp</div>
      <div class="job-details-jobs-unified-top-card__primary-description-container">New York, NY</div>
      <div class="jobs-description__content">Work on exciting stuff every day.</div>
    `);
    const text = extractJobText(doc);
    expect(text).toContain("Senior Engineer");
    expect(text).toContain("Acme Corp");
    expect(text).toContain("New York, NY");
    expect(text).toContain("Work on exciting stuff");
  });

  it("falls back to .jobs-box__html-content when primary description selector is absent", () => {
    const doc = makeDoc(`
      <div class="job-details-jobs-unified-top-card__job-title">Staff Engineer</div>
      <div class="jobs-box__html-content">Fallback description content here.</div>
    `);
    const text = extractJobText(doc);
    expect(text).toContain("Staff Engineer");
    expect(text).toContain("Fallback description content here.");
  });

  it("falls back to <main> when job-specific selectors are absent", () => {
    const doc = makeDoc(`
      <main>Main content with job description text that is long enough.</main>
    `);
    const text = extractJobText(doc);
    expect(text).toContain("Main content with job description");
  });

  it("returns empty string when no matching content exists", () => {
    const doc = makeDoc("<div>Unrelated content</div>");
    const text = extractJobText(doc);
    expect(text).toBe("");
  });

  it("joins sections with double newlines", () => {
    const doc = makeDoc(`
      <div class="job-details-jobs-unified-top-card__job-title">Engineer</div>
      <div class="job-details-jobs-unified-top-card__company-name">Corp</div>
    `);
    const text = extractJobText(doc);
    expect(text).toContain("Engineer\n\nCorp");
  });

  it("omits empty sections from the output", () => {
    const doc = makeDoc(`
      <div class="job-details-jobs-unified-top-card__job-title">Engineer</div>
      <div class="job-details-jobs-unified-top-card__company-name"></div>
      <div class="jobs-description__content">Description here.</div>
    `);
    const text = extractJobText(doc);
    expect(text).not.toContain("\n\n\n");
    expect(text).toContain("Engineer");
    expect(text).toContain("Description here.");
  });
});
