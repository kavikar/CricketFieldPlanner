/**
 * Canonical cricket fielding positions, and naming derived from coordinates.
 *
 * Field geometry (bird's-eye, bowling end at top):
 *   centre of field = (50, 50)          striker's stumps ≈ (50, 58)
 *   bowler's stumps ≈ (50, 41)          30-yard circle radius = 25
 *   boundary radius ≈ 46                drag clamp radius = 44
 *
 * All anchors below are authored for a RIGHT-handed batter, so off-side is
 * x > 50 and leg-side is x < 50. For a left-hander the whole field is mirrored
 * (x -> 100 - x), so naming mirrors the query back into right-hander space
 * rather than duplicating the table.
 *
 * Position naming is nearest-anchor: real fielding positions are a radial
 * continuum around the striker, not a rectangular grid, and a fielder standing
 * between cover and point genuinely is "somewhere around cover point". Because
 * the name is computed, it always tracks where a player actually is.
 */

export interface PositionAnchor {
  name: string;
  x: number;
  y: number;
}

/** Where the two fixed roles stand. The bowler is at the bowling end. */
export const BOWLER_SPOT = { x: 50, y: 39 };
/** Keepers stand back to pace and up to the stumps for spin. */
export const KEEPER_SPOT_PACE = { x: 50, y: 72 };
export const KEEPER_SPOT_SPIN = { x: 50, y: 60 };

export const CENTRE = 50;
export const CIRCLE_RADIUS = 25;
export const BOUNDARY_RADIUS = 46;
export const OUTER_CLAMP_RADIUS = 44;
/** viewBox spans -7..107 so labels have room outside the boundary. */
export const VIEWBOX_MIN = -7;
export const VIEWBOX_SIZE = 114;

export const POSITION_ANCHORS: PositionAnchor[] = [
  // Straight, in the V
  { name: "Mid-off", x: 58, y: 37 },
  { name: "Mid-on", x: 42, y: 37 },
  { name: "Long-off", x: 61, y: 13 },
  { name: "Long-on", x: 39, y: 13 },
  { name: "Silly Mid-off", x: 54, y: 50 },
  { name: "Silly Mid-on", x: 46, y: 50 },

  // Off side, in front of square
  { name: "Extra Cover", x: 66, y: 42 },
  { name: "Deep Extra Cover", x: 80, y: 21 },
  { name: "Cover", x: 70, y: 48 },
  { name: "Deep Cover", x: 86, y: 31 },
  { name: "Cover Point", x: 74, y: 53 },

  // Off side, square
  { name: "Point", x: 73, y: 58 },
  { name: "Deep Point", x: 89, y: 58 },
  { name: "Silly Point", x: 57, y: 55 },

  // Off side, behind square
  { name: "Backward Point", x: 71, y: 62.5 },
  { name: "Gully", x: 68, y: 66 },
  { name: "1st Slip", x: 55, y: 66 },
  { name: "2nd Slip", x: 59.5, y: 67.5 },
  { name: "3rd Slip", x: 64, y: 69 },
  { name: "Third Man", x: 81, y: 82 },

  // Leg side, behind square
  { name: "Leg Slip", x: 44, y: 65 },
  { name: "Leg Gully", x: 40, y: 68 },
  { name: "Short Fine Leg", x: 38, y: 71 },
  { name: "Fine Leg", x: 26, y: 81 },
  { name: "Backward Square Leg", x: 32, y: 64 },
  { name: "Deep Backward Square Leg", x: 18, y: 70 },

  // Leg side, square
  { name: "Square Leg", x: 28, y: 58 },
  { name: "Deep Square Leg", x: 14, y: 58 },
  { name: "Short Leg", x: 44, y: 55 },

  // Leg side, in front of square
  { name: "Midwicket", x: 31, y: 47 },
  { name: "Deep Midwicket", x: 17, y: 34 },
];

const ANCHORS_BY_NAME = new Map(POSITION_ANCHORS.map((a) => [a.name, a]));

/** Look up a canonical anchor by name. Throws on a typo so presets fail loudly. */
export function anchor(name: string): PositionAnchor {
  const found = ANCHORS_BY_NAME.get(name);
  if (!found) throw new Error(`Unknown fielding position: ${name}`);
  return found;
}

/** Mirror an x coordinate across the pitch (right-hander <-> left-hander). */
export function mirrorX(x: number): number {
  return 100 - x;
}

/**
 * The name of the fielding position nearest to (x, y).
 *
 * For a left-handed batter the point is mirrored back into right-hander space
 * first, so a fielder on the batter's leg side is named a leg-side position
 * regardless of which hand is facing.
 */
export function getPositionName(x: number, y: number, isLeftHanded: boolean): string {
  const qx = isLeftHanded ? mirrorX(x) : x;

  let best = POSITION_ANCHORS[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const a of POSITION_ANCHORS) {
    const dx = a.x - qx;
    const dy = a.y - y;
    const dist = dx * dx + dy * dy; // squared distance is enough to rank
    if (dist < bestDist) {
      bestDist = dist;
      best = a;
    }
  }
  return best.name;
}

/** Distance from the centre of the field. */
export function distanceFromCentre(x: number, y: number): number {
  const dx = x - CENTRE;
  const dy = y - CENTRE;
  return Math.sqrt(dx * dx + dy * dy);
}

/** True when a player is outside the 30-yard fielding circle. */
export function isOutsideCircle(x: number, y: number): boolean {
  return distanceFromCentre(x, y) > CIRCLE_RADIUS;
}

/** "Off side" / "Leg side" for a coordinate, accounting for the batter's hand. */
export function getSide(x: number, isLeftHanded: boolean): "Off side" | "Leg side" | "Straight" {
  if (x === CENTRE) return "Straight";
  const isRightOfPitch = x > CENTRE;
  const isOff = isLeftHanded ? !isRightOfPitch : isRightOfPitch;
  return isOff ? "Off side" : "Leg side";
}
