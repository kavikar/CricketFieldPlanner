/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTacticalAdvice, MissingApiKeyError } from "./gemini";
import { setApiKey } from "./apiKey";
import type { Fielder, ValidationResult } from "../types";

const players: Fielder[] = [
  { id: "keeper", role: "keeper", name: "Keeper", x: 50, y: 60 },
  { id: "f1", role: "fielder", name: "Player 1", x: 26, y: 81 },
];
const validation: ValidationResult = {
  isValid: true,
  outsideCircleCount: 0,
  maxAllowedOutside: 2,
  violations: [],
  illegalFielderIds: new Set(),
};

describe("getTacticalAdvice", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("throws MissingApiKeyError and never calls the network when no key is configured", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await expect(
      getTacticalAdvice(players, "T20", "Powerplay", "Pace", false, validation),
    ).rejects.toBeInstanceOf(MissingApiKeyError);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("calls Google's API directly with the visitor's own key once one is configured", async () => {
    setApiKey("visitor-key");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: "Solid setup." }] } }] }),
    } as Response);

    const advice = await getTacticalAdvice(players, "T20", "Powerplay", "Pace", false, validation);

    expect(advice).toBe("Solid setup.");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("generativelanguage.googleapis.com");
    expect(String(url)).toContain("key=visitor-key");
  });

  it("surfaces a clear message when Google rejects the key", async () => {
    setApiKey("bad-key");
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({ error: { message: "API key not valid" } }),
    } as Response);

    await expect(getTacticalAdvice(players, "T20", "Powerplay", "Pace", false, validation)).rejects.toThrow(
      /API key/,
    );
  });
});
