import type { Fielder, Roster } from "../types";

export const FIELDER_SLOT_IDS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9"] as const;
export const BOWLER_ID = "bowler";
export const KEEPER_ID = "keeper";
export const ALL_SLOT_IDS = [BOWLER_ID, KEEPER_ID, ...FIELDER_SLOT_IDS];

/** Names used until the user fills in their own squad. */
export function defaultName(slotId: string): string {
  if (slotId === BOWLER_ID) return "Bowler";
  if (slotId === KEEPER_ID) return "Keeper";
  const n = slotId.replace(/^f/, "");
  return `Player ${n}`;
}

export function defaultRoster(): Roster {
  const roster: Roster = {};
  for (const id of ALL_SLOT_IDS) roster[id] = defaultName(id);
  return roster;
}

export function isDefaultName(slotId: string, name: string): boolean {
  return name.trim() === defaultName(slotId);
}

/**
 * The short form shown inside a player's dot on the field.
 *
 * Defaults collapse to something a cricketer reads instantly — BWL, WK, P1..P9 —
 * and a real squad name becomes initials, so "Jasprit Bumrah" reads as "JB".
 */
export function shortLabel(slotId: string, name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  if (isDefaultName(slotId, trimmed)) {
    if (slotId === BOWLER_ID) return "BWL";
    if (slotId === KEEPER_ID) return "WK";
    return `P${slotId.replace(/^f/, "")}`;
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Apply squad names to a field layout, keyed by slot id. */
export function applyRoster(players: Fielder[], roster: Roster): Fielder[] {
  return players.map((p) => ({ ...p, name: roster[p.id] ?? p.name }));
}
