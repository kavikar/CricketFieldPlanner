import type { Fielder, Format, OverType, ValidationResult } from "../types";
import { CENTRE, getPositionName, isOutsideCircle } from "./positions";

/**
 * Fielding restrictions are written in terms of *fielders*: the bowler is at the
 * stumps and the keeper is behind them, so neither counts toward the circle or
 * leg-side limits. Only role "fielder" is counted below.
 */
function fieldersOnly(players: Fielder[]): Fielder[] {
  return players.filter((p) => p.role === "fielder");
}

/** Behind square on the leg side, from the striker's point of view. */
function isLegSide(player: Fielder, isLeftHanded: boolean): boolean {
  if (player.x === CENTRE) return false;
  return isLeftHanded ? player.x > CENTRE : player.x < CENTRE;
}

const BEHIND_SQUARE_Y = 58; // the striker's crease

export function validateField(
  players: Fielder[],
  format: Format,
  overType: OverType,
  isLeftHanded: boolean,
): ValidationResult {
  const violations: string[] = [];
  const illegalFielderIds = new Set<string>();
  const fielders = fieldersOnly(players);

  // 1. Fielders outside the 30-yard circle
  const outsideFielders = fielders.filter((p) => isOutsideCircle(p.x, p.y));
  const outsideCount = outsideFielders.length;

  let maxAllowedOutside: number | null;
  if (format === "T20") {
    // Overs 1-6 are the powerplay (max 2 out); 7-20 allow 5.
    maxAllowedOutside = overType === "Powerplay" ? 2 : 5;
  } else if (format === "ODI") {
    // Overs 1-10 max 2 out, 11-40 max 4, 41-50 max 5.
    maxAllowedOutside = overType === "Powerplay" ? 2 : overType === "Death" ? 5 : 4;
  } else {
    maxAllowedOutside = null; // Test cricket has no circle restriction
  }

  if (maxAllowedOutside !== null && outsideCount > maxAllowedOutside) {
    violations.push(
      `Too many fielders outside the circle: ${outsideCount} out, max ${maxAllowedOutside} allowed`,
    );
    for (const p of outsideFielders) illegalFielderIds.add(p.id);
  }

  // 2. Max 2 fielders behind square on the leg side (all formats). Breaching this
  //    is a no-ball, not just a bad field.
  const behindSquareLeg = fielders.filter(
    (p) => p.y > BEHIND_SQUARE_Y && isLegSide(p, isLeftHanded),
  );
  if (behindSquareLeg.length > 2) {
    violations.push(
      `No-ball: ${behindSquareLeg.length} fielders behind square on the leg side, max 2 allowed`,
    );
    for (const p of behindSquareLeg) illegalFielderIds.add(p.id);
  }

  // 3. Max 5 fielders on the leg side (limited overs).
  if (maxAllowedOutside !== null) {
    const legSide = fielders.filter((p) => isLegSide(p, isLeftHanded));
    if (legSide.length > 5) {
      violations.push(`Leg-side limit: ${legSide.length} fielders on the leg side, max 5 allowed`);
      for (const p of legSide) illegalFielderIds.add(p.id);
    }
  }

  return {
    isValid: violations.length === 0,
    outsideCircleCount: outsideCount,
    maxAllowedOutside,
    violations,
    illegalFielderIds,
  };
}

/**
 * A human description of where a player is standing, e.g.
 * "Deep Midwicket (Leg side, outside the circle)".
 */
export function getFielderZone(x: number, y: number, isLeftHanded: boolean): string {
  const name = getPositionName(x, y, isLeftHanded);
  const depth = isOutsideCircle(x, y) ? "outside the circle" : "inside the circle";
  return `${name} (${depth})`;
}
