import type { Fielder } from "../types";

const STORAGE_PREFIX = "tactical_presets_slot_";

export function serializeField(players: Fielder[]): string {
  return players
    .map((p) => `${p.id},${p.name},${p.label},${p.x},${p.y},${p.isWK ? 1 : 0}`)
    .join(";");
}

export function deserializeField(data: string): Fielder[] | null {
  try {
    return data.split(";").map((entry) => {
      const parts = entry.split(",");
      return {
        id: parts[0],
        name: parts[1],
        label: parts[2],
        x: parseFloat(parts[3]),
        y: parseFloat(parts[4]),
        isWK: parts[5] === "1",
      };
    });
  } catch {
    return null;
  }
}

export function getCustomPresetSlot(slot: number): string | null {
  return localStorage.getItem(`${STORAGE_PREFIX}${slot}`);
}

export function setCustomPresetSlot(slot: number, serialized: string): void {
  localStorage.setItem(`${STORAGE_PREFIX}${slot}`, serialized);
}

export function clearCustomPresetSlot(slot: number): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${slot}`);
}
