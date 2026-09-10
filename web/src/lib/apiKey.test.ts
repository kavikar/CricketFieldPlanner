/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearApiKey, getApiKey, setApiKey } from "./apiKey";

describe("apiKey storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns null when no key has been set", () => {
    expect(getApiKey()).toBeNull();
  });

  it("round-trips a key through localStorage", () => {
    setApiKey("test-key-123");
    expect(getApiKey()).toBe("test-key-123");
  });

  it("trims whitespace when saving and reading", () => {
    setApiKey("  padded-key  ");
    expect(getApiKey()).toBe("padded-key");
  });

  it("treats a whitespace-only key as unset", () => {
    setApiKey("   ");
    expect(getApiKey()).toBeNull();
  });

  it("removes the key on clear", () => {
    setApiKey("test-key-123");
    clearApiKey();
    expect(getApiKey()).toBeNull();
  });

  it("does not throw and degrades to null when localStorage is unavailable", () => {
    const original = window.localStorage.getItem;
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("blocked by browser settings");
    });
    expect(() => getApiKey()).not.toThrow();
    expect(getApiKey()).toBeNull();
    window.localStorage.getItem = original;
  });
});
