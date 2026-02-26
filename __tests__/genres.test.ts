import { describe, it, expect } from "vitest";
import { GENRES, GENRE_MAP, DEFAULT_GENRE_CLASSES } from "@/lib/genres";

/**
 * Data-integrity tests for the genres list.
 *
 * These catch typos or malformed entries that would silently break
 * the genre filter UI or the card pill styles at runtime.
 */
describe("GENRES", () => {
  it("is a non-empty array", () => {
    expect(GENRES.length).toBeGreaterThan(0);
  });

  it("every genre has a non-empty value, label, and classes", () => {
    for (const genre of GENRES) {
      expect(genre.value.trim()).not.toBe("");
      expect(genre.label.trim()).not.toBe("");
      expect(genre.classes.trim()).not.toBe("");
    }
  });

  it("has no duplicate genre values", () => {
    const values = GENRES.map((g) => g.value);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });

  it("genre values are lowercase (consistent with DB storage)", () => {
    for (const genre of GENRES) {
      expect(genre.value).toBe(genre.value.toLowerCase());
    }
  });
});

describe("GENRE_MAP", () => {
  it("has an entry for every item in GENRES", () => {
    for (const genre of GENRES) {
      expect(GENRE_MAP[genre.value]).toBeDefined();
    }
  });

  it("maps each value back to its own genre record", () => {
    for (const genre of GENRES) {
      expect(GENRE_MAP[genre.value]).toEqual(genre);
    }
  });

  it("has the same number of entries as GENRES", () => {
    expect(Object.keys(GENRE_MAP).length).toBe(GENRES.length);
  });
});

describe("DEFAULT_GENRE_CLASSES", () => {
  it("is a non-empty string", () => {
    expect(typeof DEFAULT_GENRE_CLASSES).toBe("string");
    expect(DEFAULT_GENRE_CLASSES.trim()).not.toBe("");
  });
});
