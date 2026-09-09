import { describe, expect, it } from "vitest";
import { validateField, getFielderZone } from "./validation";
import type { Fielder } from "../types";

/**
 * Field is modelled on a 0-100 grid, center (striker's end) at (50, 50).
 * x < 50 = leg side for a RHB, x > 50 = off side (mirrored for LHB).
 * y > 58 = behind square; distance > 25 from center = outside the 30-yard circle.
 */
function fielder(id: string, x: number, y: number, isWK = false): Fielder {
  return { id, name: id, label: id, x, y, isWK };
}

/** Builds an XI: `outside` fielders parked well outside the circle, the rest packed in close. */
function elevenWith(outside: number): Fielder[] {
  const players: Fielder[] = [fielder("wk", 51, 60, true)];
  for (let i = 0; i < outside; i++) players.push(fielder(`out${i}`, 50 + i, 90));
  while (players.length < 11) players.push(fielder(`in${players.length}`, 50, 51));
  return players;
}

describe("validateField — 30-yard circle limits", () => {
  it("allows exactly the powerplay limit in T20 (max 2 outside)", () => {
    const result = validateField(elevenWith(2), "T20", "Powerplay", false);
    expect(result.isValid).toBe(true);
    expect(result.outsideCircleCount).toBe(2);
  });

  it("flags one fielder over the T20 powerplay limit", () => {
    const result = validateField(elevenWith(3), "T20", "Powerplay", false);
    expect(result.isValid).toBe(false);
    expect(result.violations.some((v) => v.includes("Too many outfielders"))).toBe(true);
  });

  it("allows up to 5 outside in T20 non-powerplay and death overs", () => {
    expect(validateField(elevenWith(5), "T20", "Non-Powerplay", false).isValid).toBe(true);
    expect(validateField(elevenWith(5), "T20", "Death", false).isValid).toBe(true);
  });

  it("caps ODI non-powerplay at 4 outside, not 5", () => {
    expect(validateField(elevenWith(4), "ODI", "Non-Powerplay", false).isValid).toBe(true);
    const result = validateField(elevenWith(5), "ODI", "Non-Powerplay", false);
    expect(result.isValid).toBe(false);
  });

  it("allows ODI death overs up to 5 outside", () => {
    expect(validateField(elevenWith(5), "ODI", "Death", false).isValid).toBe(true);
  });

  it("applies no circle restriction in Test cricket", () => {
    const result = validateField(elevenWith(9), "Test", "Non-Powerplay", false);
    expect(result.maxAllowedOutside).toBeNull();
    expect(result.violations.some((v) => v.includes("Too many outfielders"))).toBe(false);
  });

  it("requires at least 2 fielders inside the circle, scaled to the actual XI size", () => {
    // 10 fielders total (not 11) — regression test for a bug where the "at least 2
    // inside" check was hardcoded against 11 players regardless of the array length.
    const players = [fielder("wk", 51, 60, true), ...Array.from({ length: 9 }, (_, i) => fielder(`out${i}`, 50, 90))];
    const result = validateField(players, "Test", "Non-Powerplay", false);
    // Test format has no circle restriction, so this should still pass —
    // but with a T20/ODI format the same 9-outside/1-inside shape must fail.
    expect(result.violations.some((v) => v.includes("at least 2"))).toBe(false);

    const t20Result = validateField(players, "T20", "Death", false);
    expect(t20Result.violations).toContain("At least 2 fielders must remain inside the 30-yard circle");
  });
});

describe("validateField — leg-side square limit (MCC Law 41.6)", () => {
  it("allows exactly 2 fielders behind square on the leg side for a RHB", () => {
    const players = [
      fielder("wk", 50, 60, true),
      fielder("f1", 30, 65),
      fielder("f2", 20, 70),
      ...Array.from({ length: 8 }, (_, i) => fielder(`fill${i}`, 50, 51)),
    ];
    expect(validateField(players, "Test", "Non-Powerplay", false).isValid).toBe(true);
  });

  it("flags a 3rd fielder behind square on the leg side for a RHB", () => {
    const players = [
      fielder("wk", 50, 60, true),
      fielder("f1", 30, 65),
      fielder("f2", 20, 70),
      fielder("f3", 10, 75),
      ...Array.from({ length: 7 }, (_, i) => fielder(`fill${i}`, 50, 51)),
    ];
    const result = validateField(players, "Test", "Non-Powerplay", false);
    expect(result.isValid).toBe(false);
    expect(result.violations.some((v) => v.includes("Leg-side square limit"))).toBe(true);
    expect(result.illegalFielderIds.has("f3")).toBe(true);
  });

  it("excludes the wicketkeeper from the behind-square leg-side count", () => {
    const players = [
      fielder("wk", 30, 70, true),
      fielder("f1", 30, 65),
      fielder("f2", 20, 70),
      ...Array.from({ length: 8 }, (_, i) => fielder(`fill${i}`, 50, 51)),
    ];
    expect(validateField(players, "Test", "Non-Powerplay", false).isValid).toBe(true);
  });

  it("mirrors the leg side for a left-handed batter", () => {
    // For a LHB, leg side is x > 50 — the same shape that was legal for a RHB
    // on the x < 50 side should now be illegal on the x > 50 side, and vice versa.
    const players = [
      fielder("wk", 50, 60, true),
      fielder("f1", 70, 65),
      fielder("f2", 80, 70),
      fielder("f3", 90, 75),
      ...Array.from({ length: 7 }, (_, i) => fielder(`fill${i}`, 50, 51)),
    ];
    expect(validateField(players, "Test", "Non-Powerplay", false).isValid).toBe(true); // RHB: these are off-side
    expect(validateField(players, "Test", "Non-Powerplay", true).isValid).toBe(false); // LHB: these are leg-side
  });
});

describe("validateField — leg-side total limit (MCC Law 41.7, max 5 on side)", () => {
  it("allows exactly 5 fielders on the leg side", () => {
    const players = [
      fielder("wk", 50, 60, true),
      ...Array.from({ length: 5 }, (_, i) => fielder(`leg${i}`, 30, 40 + i)),
      ...Array.from({ length: 5 }, (_, i) => fielder(`off${i}`, 70, 40 + i)),
    ];
    expect(validateField(players, "Test", "Non-Powerplay", false).isValid).toBe(true);
  });

  it("flags a 6th fielder on the leg side", () => {
    const players = [
      fielder("wk", 50, 60, true),
      ...Array.from({ length: 6 }, (_, i) => fielder(`leg${i}`, 30, 40 + i)),
      ...Array.from({ length: 4 }, (_, i) => fielder(`off${i}`, 70, 40 + i)),
    ];
    const result = validateField(players, "Test", "Non-Powerplay", false);
    expect(result.isValid).toBe(false);
    expect(result.violations.some((v) => v.includes("Leg-side overcrowding"))).toBe(true);
    expect(result.illegalFielderIds.size).toBe(6);
  });

  it("counts the wicketkeeper toward the leg-side total (unlike the square-leg sub-rule)", () => {
    const players = [
      fielder("wk", 30, 60, true), // WK placed on the leg side
      ...Array.from({ length: 5 }, (_, i) => fielder(`leg${i}`, 30, 40 + i)),
      ...Array.from({ length: 5 }, (_, i) => fielder(`off${i}`, 70, 40 + i)),
    ];
    const result = validateField(players, "Test", "Non-Powerplay", false);
    expect(result.isValid).toBe(false);
    expect(result.violations.some((v) => v.includes("Leg-side overcrowding"))).toBe(true);
  });
});

describe("getFielderZone", () => {
  it("labels a deep off-side fielder behind square for a RHB", () => {
    expect(getFielderZone(80, 70, false)).toBe("Off-side Behind Crease (Back) (Deep Outfield)");
  });

  it("swaps off/leg labelling for a left-handed batter", () => {
    expect(getFielderZone(80, 70, false)).toContain("Off-side");
    expect(getFielderZone(80, 70, true)).toContain("Leg-side");
  });

  it("labels a close infield catching position as square of the wicket", () => {
    expect(getFielderZone(40, 50, false)).toBe("Leg-side Square of Wicket (Infield Circle)");
  });
});
