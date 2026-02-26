import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

/**
 * Tests for the cn() class-merging utility.
 *
 * cn() wraps clsx (conditional class logic) and tailwind-merge
 * (conflict resolution), so tests cover both layers.
 */
describe("cn", () => {
  it("returns a single class unchanged", () => {
    expect(cn("text-sm")).toBe("text-sm");
  });

  it("joins multiple classes", () => {
    expect(cn("px-4", "py-2", "rounded")).toBe("px-4 py-2 rounded");
  });

  it("filters out falsy values", () => {
    expect(cn("text-sm", false, null, undefined, "font-medium")).toBe(
      "text-sm font-medium"
    );
  });

  it("handles conditional object syntax from clsx", () => {
    expect(cn({ "bg-red-500": true, "bg-blue-500": false })).toBe("bg-red-500");
  });

  it("resolves Tailwind conflicts — last value wins", () => {
    // tailwind-merge should drop p-2 in favour of p-4
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("resolves conflicting text-size classes", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("does not strip non-conflicting classes", () => {
    // px and py are independent — both should remain
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("returns an empty string when given no arguments", () => {
    expect(cn()).toBe("");
  });
});
