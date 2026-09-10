import { beforeEach, describe, expect, it, vi } from "vitest";
import { isValidEmail, submitBetaSignup, InvalidEmailError } from "./betaSignup";

describe("isValidEmail", () => {
  it("accepts a normal email address", () => {
    expect(isValidEmail("player@example.com")).toBe(true);
  });

  it("accepts an address with a subdomain and plus-tag", () => {
    expect(isValidEmail("tester+cricket@mail.example.co.uk")).toBe(true);
  });

  it("trims surrounding whitespace before checking", () => {
    expect(isValidEmail("  player@example.com  ")).toBe(true);
  });

  it.each(["", "not-an-email", "missing-at.com", "no-domain@", "@no-local.com", "spaces in@email.com"])(
    "rejects %j",
    (bad) => {
      expect(isValidEmail(bad)).toBe(false);
    },
  );
});

describe("submitBetaSignup", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects an invalid email before touching the network", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await expect(submitBetaSignup("not-an-email")).rejects.toBeInstanceOf(InvalidEmailError);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts the trimmed, valid email to /api/beta-signup", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true } as Response);

    await submitBetaSignup("  Player@Example.com  ");

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/beta-signup",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "Player@Example.com" }),
      }),
    );
  });

  it("surfaces the server's error message on failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({ error: "Signup storage is not configured." }),
    } as Response);

    await expect(submitBetaSignup("player@example.com")).rejects.toThrow(
      "Signup storage is not configured.",
    );
  });
});
