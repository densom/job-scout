import { describe, it, expect } from "vitest";
import { buildUserPrompt, parseApiResponse } from "../lib/bg-utils.js";

// ── buildUserPrompt ───────────────────────────────────────────────────────────

describe("buildUserPrompt", () => {
  it("includes the job text in the output", () => {
    const prompt = buildUserPrompt("Senior Engineer at Acme");
    expect(prompt).toContain("Senior Engineer at Acme");
  });

  it("instructs the model to return JSON only", () => {
    const prompt = buildUserPrompt("some text");
    expect(prompt).toContain("Return ONLY valid JSON");
  });

  it("specifies all required JSON fields", () => {
    const prompt = buildUserPrompt("some text");
    for (const field of ["title", "company", "companyDescription", "location", "roleSummary", "qualifications"]) {
      expect(prompt).toContain(`"${field}"`);
    }
  });
});

// ── parseApiResponse ──────────────────────────────────────────────────────────

describe("parseApiResponse", () => {
  const validJson = JSON.stringify({
    title: "Engineer",
    company: "Acme",
    companyDescription: "They build stuff.",
    location: "Remote",
    roleSummary: "You will build things.",
    qualifications: ["5 years experience", "Knows JS"],
  });

  it("parses plain JSON", () => {
    const result = parseApiResponse(validJson);
    expect(result.title).toBe("Engineer");
    expect(result.qualifications).toHaveLength(2);
  });

  it("strips ```json code fences", () => {
    const result = parseApiResponse("```json\n" + validJson + "\n```");
    expect(result.title).toBe("Engineer");
  });

  it("strips plain ``` code fences", () => {
    const result = parseApiResponse("```\n" + validJson + "\n```");
    expect(result.company).toBe("Acme");
  });

  it("throws on invalid JSON", () => {
    expect(() => parseApiResponse("not json at all")).toThrow();
  });

  it("throws on empty string", () => {
    expect(() => parseApiResponse("")).toThrow();
  });
});
