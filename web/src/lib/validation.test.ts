import { describe, expect, it } from "vitest";
import { validateField, getFielderZone } from "./validation";
import { describePosition, getPositionName, isOutsideCircle } from "./positions";
import { getPreset } from "../data/presets";
import type { Fielder } from "../types";

/** Build a field of nine fielders at the given coordinates, plus bowler and keeper. */
function field(coords: [number, number][]): Fielder[] {
  const players: Fielder[] = [
    { id: "bowler", role: "bowler", name: "Bowler", x: 50, y: 39 },
    { id: "keeper", role: "keeper", name: "Keeper", x: 50, y: 72 },
  ];
  coords.forEach(([x, y], i) => {
    players.push({ id: `f${i + 1}`, role: "fielder", name: `Player ${i + 1}`, x, y });
  });
  return players;
}

/** Nine fielders packed safely inside the circle on the off side. */
const NINE_INSIDE: [number, number][] = [
  [58, 45], [60, 48], [62, 51], [64, 54], [56, 43], [59, 55], [61, 45], [57, 50], [63, 48],
];

function replace(coords: [number, number][], index: number, value: [number, number]) {
  const next = [...coords];
  next[index] = value;
  return next;
}

describe("validateField — circle restrictions", () => {
  it("allows 2 outside in a T20 powerplay", () => {
    const coords = replace(replace(NINE_INSIDE, 0, [26, 81]), 1, [81, 82]);
    const result = validateField(field(coords), "T20", "Powerplay", false);
    expect(result.outsideCircleCount).toBe(2);
    expect(result.isValid).toBe(true);
  });

  it("rejects 3 outside in a T20 powerplay", () => {
    let coords = replace(NINE_INSIDE, 0, [26, 81]);
    coords = replace(coords, 1, [81, 82]);
    coords = replace(coords, 2, [89, 58]);
    const result = validateField(field(coords), "T20", "Powerplay", false);
    expect(result.outsideCircleCount).toBe(3);
    expect(result.isValid).toBe(false);
    expect(result.violations[0]).toContain("outside the circle");
  });

  it("allows 5 outside in T20 middle overs", () => {
    let coords = NINE_INSIDE;
    const deep: [number, number][] = [[26, 81], [81, 82], [89, 58], [61, 13], [39, 13]];
    deep.forEach((d, i) => {
      coords = replace(coords, i, d);
    });
    const result = validateField(field(coords), "T20", "Non-Powerplay", false);
    expect(result.outsideCircleCount).toBe(5);
    expect(result.isValid).toBe(true);
  });

  it("applies no circle limit in a Test match", () => {
    const coords = NINE_INSIDE.map(() => [26, 81] as [number, number]);
    const result = validateField(field(coords), "Test", "Non-Powerplay", false);
    expect(result.maxAllowedOutside).toBeNull();
  });

  it("does not count the bowler or keeper toward the circle limit", () => {
    const players = field(NINE_INSIDE);
    // Park both fixed roles far outside the circle.
    players[0] = { ...players[0], x: 20, y: 20 };
    players[1] = { ...players[1], x: 85, y: 85 };
    const result = validateField(players, "T20", "Powerplay", false);
    expect(result.outsideCircleCount).toBe(0);
    expect(result.isValid).toBe(true);
  });
});

describe("validateField — leg-side restrictions", () => {
  it("flags a third fielder behind square on the leg side as a no-ball", () => {
    let coords = NINE_INSIDE;
    const behind: [number, number][] = [[38, 71], [32, 64], [26, 81]];
    behind.forEach((d, i) => {
      coords = replace(coords, i, d);
    });
    const result = validateField(field(coords), "T20", "Non-Powerplay", false);
    expect(result.isValid).toBe(false);
    expect(result.violations.some((v) => v.includes("No-ball"))).toBe(true);
  });

  it("mirrors the behind-square rule for a left-handed batter", () => {
    let coords = NINE_INSIDE;
    // Mirrored copies of the same three leg-side spots.
    const behind: [number, number][] = [[62, 71], [68, 64], [74, 81]];
    behind.forEach((d, i) => {
      coords = replace(coords, i, d);
    });
    expect(validateField(field(coords), "T20", "Non-Powerplay", true).isValid).toBe(false);
  });

  it("flags more than 5 fielders on the leg side", () => {
    const coords: [number, number][] = [
      [42, 37], [31, 47], [28, 58], [38, 71], [44, 55], [40, 68], [58, 45], [60, 48], [62, 51],
    ];
    const result = validateField(field(coords), "T20", "Non-Powerplay", false);
    expect(result.violations.some((v) => v.includes("Leg-side limit"))).toBe(true);
  });
});

describe("built-in presets", () => {
  const combos = [
    ["Pace", "Powerplay"],
    ["Pace", "Non-Powerplay"],
    ["Pace", "Death"],
    ["Spin", "Powerplay"],
    ["Spin", "Non-Powerplay"],
    ["Spin", "Death"],
  ] as const;

  it.each(combos)("%s %s fields a legal eleven", (bowler, over) => {
    const players = getPreset(bowler, over, "T20");
    expect(players).toHaveLength(11);
    expect(players.filter((p) => p.role === "fielder")).toHaveLength(9);
    expect(players.filter((p) => p.role === "bowler")).toHaveLength(1);
    expect(players.filter((p) => p.role === "keeper")).toHaveLength(1);

    const result = validateField(players, "T20", over, false);
    expect(result.violations).toEqual([]);
  });

  it("stands the keeper up to the stumps for spin and back for pace", () => {
    const pace = getPreset("Pace", "Powerplay", "T20").find((p) => p.role === "keeper")!;
    const spin = getPreset("Spin", "Powerplay", "T20").find((p) => p.role === "keeper")!;
    expect(spin.y).toBeLessThan(pace.y);
  });
});

describe("getPositionName", () => {
  it("names the canonical spots", () => {
    expect(getPositionName(26, 81, false)).toBe("Fine Leg");
    expect(getPositionName(81, 82, false)).toBe("Third Man");
    expect(getPositionName(17, 34, false)).toBe("Deep Midwicket");
    expect(getPositionName(56, 65, false)).toBe("1st Slip");
  });

  it("tracks a player as they move, rather than keeping a stale label", () => {
    const atSlip = getPositionName(56, 65, false);
    const afterMoving = getPositionName(17, 34, false);
    expect(atSlip).toBe("1st Slip");
    expect(afterMoving).toBe("Deep Midwicket");
    expect(atSlip).not.toBe(afterMoving);
  });

  it("mirrors naming for a left-handed batter", () => {
    // Fine Leg for a right-hander is at x=26; mirrored, the same name sits at x=74.
    expect(getPositionName(26, 81, false)).toBe("Fine Leg");
    expect(getPositionName(74, 81, true)).toBe("Fine Leg");
    expect(getPositionName(26, 81, true)).toBe("Third Man");
  });
});

describe("describePosition", () => {
  it("names a fielder's actual fielding position", () => {
    const fielder = { role: "fielder" as const, x: 56, y: 65 };
    expect(describePosition(fielder, false)).toBe("1st Slip");
  });

  it("never looks up the bowler or keeper on the position map, even when their fixed spot sits nearest a named position", () => {
    // Regression: the bowler's spot (50, 39) is nearest the "Mid-off" anchor,
    // and the pace keeper's spot (50, 72) is nearest "1st Slip" — real fielding
    // positions those roles are not playing. describePosition must short-circuit
    // on role before ever calling getPositionName, not just usually get it right.
    const [bowler] = getPreset("Pace", "Powerplay", "T20").filter((p) => p.role === "bowler");
    const [keeper] = getPreset("Pace", "Powerplay", "T20").filter((p) => p.role === "keeper");

    // Prove the trap is real: naively naming their coordinates gives a wrong answer.
    expect(getPositionName(bowler.x, bowler.y, false)).not.toBe("Bowler");
    expect(getPositionName(keeper.x, keeper.y, false)).not.toBe("Wicketkeeper");

    expect(describePosition(bowler, false)).toBe("Bowler");
    expect(describePosition(keeper, false)).toBe("Wicketkeeper");
  });

  it("ignores handedness for the bowler and keeper", () => {
    const bowler = { role: "bowler" as const, x: 50, y: 39 };
    expect(describePosition(bowler, false)).toBe("Bowler");
    expect(describePosition(bowler, true)).toBe("Bowler");
  });
});

describe("isOutsideCircle / getFielderZone", () => {
  it("knows the 30-yard circle", () => {
    expect(isOutsideCircle(50, 50)).toBe(false);
    expect(isOutsideCircle(26, 81)).toBe(true);
  });

  it("describes a position with its depth", () => {
    expect(getFielderZone(26, 81, false)).toBe("Fine Leg (outside the circle)");
    expect(getFielderZone(56, 65, false)).toBe("1st Slip (inside the circle)");
  });
});
