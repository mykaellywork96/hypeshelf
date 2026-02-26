import { describe, it, expect } from "vitest";
import { validateLink } from "@/lib/validateLink";

/**
 * Tests for the server-side URL validator used in the Convex `add` mutation.
 *
 * This is the security-critical path — it prevents users from storing
 * javascript:, data:, or other dangerous protocols in the database.
 */
describe("validateLink", () => {
  // ── Happy path ────────────────────────────────────────────────────────────

  it("accepts a valid https URL", () => {
    const url = "https://letterboxd.com/film/dune-part-two/";
    expect(validateLink(url)).toBe(url);
  });

  it("accepts a valid http URL", () => {
    const url = "http://example.com/page";
    expect(validateLink(url)).toBe(url);
  });

  it("trims leading and trailing whitespace", () => {
    expect(validateLink("  https://example.com  ")).toBe("https://example.com");
  });

  it("preserves a URL with query params and hash", () => {
    const url = "https://example.com/search?q=dune&page=2#results";
    expect(validateLink(url)).toBe(url);
  });

  // ── Invalid URL format ─────────────────────────────────────────────────────

  it("throws on an empty string", () => {
    expect(() => validateLink("")).toThrow(
      "Invalid URL. Make sure it starts with https:// or http://"
    );
  });

  it("throws on a plain word with no protocol", () => {
    expect(() => validateLink("not-a-url")).toThrow(
      "Invalid URL. Make sure it starts with https:// or http://"
    );
  });

  it("throws on a domain with no protocol", () => {
    expect(() => validateLink("www.example.com")).toThrow(
      "Invalid URL. Make sure it starts with https:// or http://"
    );
  });

  // ── Blocked protocols ──────────────────────────────────────────────────────

  it("blocks javascript: protocol", () => {
    expect(() => validateLink("javascript:alert('xss')")).toThrow(
      'URLs must use http or https. Received: "javascript:"'
    );
  });

  it("blocks data: protocol", () => {
    expect(() => validateLink("data:text/html,<h1>hi</h1>")).toThrow(
      'URLs must use http or https. Received: "data:"'
    );
  });

  it("blocks ftp: protocol", () => {
    expect(() => validateLink("ftp://files.example.com")).toThrow(
      'URLs must use http or https. Received: "ftp:"'
    );
  });
});
