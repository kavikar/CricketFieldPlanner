import type { Fielder, FielderRole, Roster } from "../types";
import { ALL_SLOT_IDS, defaultName, defaultRoster } from "./roster";

const SLOT_PREFIX = "cfp_preset_slot_";
const ROSTER_KEY = "cfp_roster";

/** How many custom field layouts a user can keep. */
export const CUSTOM_SLOT_COUNT = 5;

interface StoredField {
  v: 2;
  players: { id: string; role: FielderRole; x: number; y: number }[];
}

/**
 * Layouts store positions only — squad names live in the roster, so renaming a
 * player updates every saved field at once instead of freezing the old name in.
 */
export function serializeField(players: Fielder[]): string {
  const payload: StoredField = {
    v: 2,
    players: players.map((p) => ({ id: p.id, role: p.role, x: p.x, y: p.y })),
  };
  return JSON.stringify(payload);
}

export function deserializeField(data: string, roster: Roster): Fielder[] | null {
  try {
    const parsed = JSON.parse(data) as StoredField;
    if (!parsed || parsed.v !== 2 || !Array.isArray(parsed.players)) return null;

    const players = parsed.players.map((p) => ({
      id: p.id,
      role: p.role,
      name: roster[p.id] ?? defaultName(p.id),
      x: Number(p.x),
      y: Number(p.y),
    }));

    if (players.length !== ALL_SLOT_IDS.length) return null;
    if (players.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) return null;
    return players;
  } catch {
    return null;
  }
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private browsing or blocked storage — the app still works, just doesn't persist */
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* see safeSet */
  }
}

export function getCustomPresetSlot(slot: number): string | null {
  return safeGet(`${SLOT_PREFIX}${slot}`);
}

export function setCustomPresetSlot(slot: number, serialized: string): void {
  safeSet(`${SLOT_PREFIX}${slot}`, serialized);
}

export function clearCustomPresetSlot(slot: number): void {
  safeRemove(`${SLOT_PREFIX}${slot}`);
}

export function loadAllCustomSlots(): (string | null)[] {
  return Array.from({ length: CUSTOM_SLOT_COUNT }, (_, i) => getCustomPresetSlot(i + 1));
}

export function loadRoster(): Roster {
  const raw = safeGet(ROSTER_KEY);
  const roster = defaultRoster();
  if (!raw) return roster;
  try {
    const parsed = JSON.parse(raw) as Roster;
    for (const id of ALL_SLOT_IDS) {
      const name = parsed?.[id];
      if (typeof name === "string" && name.trim()) roster[id] = name.trim();
    }
  } catch {
    /* fall back to defaults */
  }
  return roster;
}

export function saveRoster(roster: Roster): void {
  safeSet(ROSTER_KEY, JSON.stringify(roster));
}
