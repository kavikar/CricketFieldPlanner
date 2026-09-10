/** Which of the eleven a player is. Only "fielder" roles are draggable. */
export type FielderRole = "bowler" | "keeper" | "fielder";

/**
 * A player on the field.
 *
 * `id` and `name` are IDENTITY — who this is. They never change when the player
 * moves. Where the player is standing is derived from x/y at render time via
 * `getPositionName()`, so it can never go stale the way the old baked-in
 * `label` did.
 */
export interface Fielder {
  id: string; // stable slot id: "bowler" | "keeper" | "f1".."f9"
  role: FielderRole;
  name: string; // squad name, user-editable
  x: number; // percentage coordinates (0 to 100), centre of field = (50, 50)
  y: number;
}

/** Squad names keyed by slot id. Persisted independently of field layout. */
export type Roster = Record<string, string>;

export interface PresetInfo {
  title: string;
  summary: string;
  advantages: string[];
  disadvantages: string[];
}

export interface ValidationResult {
  isValid: boolean;
  outsideCircleCount: number;
  maxAllowedOutside: number | null; // null if Test Match (no restrictions)
  violations: string[];
  illegalFielderIds: Set<string>;
}

export type Format = "T20" | "ODI" | "Test";
export type OverType = "Powerplay" | "Non-Powerplay" | "Death";
export type BowlerType = "Pace" | "Spin";
