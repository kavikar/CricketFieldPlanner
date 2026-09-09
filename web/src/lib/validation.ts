import type { Fielder, Format, OverType, ValidationResult } from "../types";

export function validateField(
  players: Fielder[],
  format: Format,
  overType: OverType,
  isLeftHanded: boolean,
): ValidationResult {
  const violations: string[] = [];
  const illegalFielderIds = new Set<string>();

  // 1. Calculate how many players are outside the 30-yard circle (radius 25)
  let outsideCount = 0;
  const outsideFielders: Fielder[] = [];

  for (const player of players) {
    const dx = player.x - 50;
    const dy = player.y - 50;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 25) {
      outsideCount++;
      outsideFielders.push(player);
    }
  }

  let maxAllowedOutside: number | null;
  if (format === "T20") {
    maxAllowedOutside =
      overType === "Powerplay" ? 2 : overType === "Non-Powerplay" ? 5 : overType === "Death" ? 5 : 5;
  } else if (format === "ODI") {
    maxAllowedOutside =
      overType === "Powerplay" ? 2 : overType === "Non-Powerplay" ? 4 : overType === "Death" ? 5 : 4;
  } else {
    maxAllowedOutside = null;
  }

  if (maxAllowedOutside !== null) {
    if (outsideCount > maxAllowedOutside) {
      violations.push(
        `Too many outfielders: max ${maxAllowedOutside} allowed, currently has ${outsideCount}`,
      );
      for (const player of outsideFielders) illegalFielderIds.add(player.id);
    }

    const insideCount = 11 - outsideCount;
    if (insideCount < 2) {
      violations.push("At least 2 fielders must remain inside the 30-yard circle");
    }
  }

  // 2. Leg-side behind square rule (all formats): max 2 fielders behind square on leg-side (excluding WK)
  // Bird's-eye view convention: for RHB off-side=right(x>50), leg-side=left(x<50); mirrored for LHB
  const legSideBehindSquareFielders: Fielder[] = [];
  for (const player of players) {
    if (!player.isWK) {
      const isBehindSquare = player.y > 58;
      const isLegSide = isLeftHanded ? player.x > 50 : player.x < 50;
      if (isBehindSquare && isLegSide) legSideBehindSquareFielders.push(player);
    }
  }

  if (legSideBehindSquareFielders.length > 2) {
    violations.push(
      `Leg-side square limit: max 2 behind square leg, currently has ${legSideBehindSquareFielders.length}`,
    );
    for (const player of legSideBehindSquareFielders) illegalFielderIds.add(player.id);
  }

  // 3. Leg-side total limit: max 5 fielders total on leg-side (all formats)
  const legSideFielders: Fielder[] = [];
  for (const player of players) {
    const isLegSide = isLeftHanded ? player.x > 50 : player.x < 50;
    if (isLegSide) legSideFielders.push(player);
  }

  if (legSideFielders.length > 5) {
    violations.push(
      `Leg-side overcrowding: max 5 total allowed on leg-side, currently has ${legSideFielders.length}`,
    );
    for (const player of legSideFielders) illegalFielderIds.add(player.id);
  }

  return {
    isValid: violations.length === 0,
    outsideCircleCount: outsideCount,
    maxAllowedOutside,
    violations,
    illegalFielderIds,
  };
}

export function getFielderZone(x: number, y: number, isLeftHanded: boolean): string {
  const dx = x - 50;
  const dy = y - 50;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const isDeep = dist > 25;

  const vertLabel =
    y > 58 ? "Behind Crease (Back)" : y >= 42 && y <= 58 ? "Square of Wicket" : "In Front of Crease (Forward)";

  // Bird's-eye: right(x>50) = off-side for RHB, left(x<50) = leg-side for RHB; swapped for LHB
  const isRHSideOfField = x > 50;
  const zoneSide = isLeftHanded
    ? isRHSideOfField
      ? "Leg-side"
      : "Off-side"
    : isRHSideOfField
      ? "Off-side"
      : "Leg-side";

  const regionName = isDeep ? "Deep Outfield" : "Infield Circle";

  return `${zoneSide} ${vertLabel} (${regionName})`;
}
