import type { BowlerType, Fielder, Format, OverType, ValidationResult } from "../types";
import { getFielderZone } from "./validation";

export async function getTacticalAdvice(
  players: Fielder[],
  format: Format,
  overType: OverType,
  bowlerType: BowlerType,
  isLeftHanded: boolean,
  validation: ValidationResult,
): Promise<string> {
  const fieldSummary = players
    .map((p) => `- ${p.label} (${p.name}): X:${Math.round(p.x)}% Y:${Math.round(p.y)}% [${getFielderZone(p.x, p.y, isLeftHanded)}]`)
    .join("\n");

  const prompt = `You are a cricket tactics analyst. Given the fielding setup below, give a short (max 120 words) assessment: is it well suited to the situation, and up to 2 concrete tweaks to consider. Be concise and use cricket terminology.

Match format: ${format}
Phase: ${overType}
Bowler type: ${bowlerType}
Batter: ${isLeftHanded ? "Left-handed" : "Right-handed"}
Rule compliance: ${validation.isValid ? "Legal" : "ILLEGAL - " + validation.violations.join("; ")}
Fielders outside 30-yard circle: ${validation.outsideCircleCount}${validation.maxAllowedOutside !== null ? ` (max ${validation.maxAllowedOutside})` : ""}

Field positions:
${fieldSummary}`;

  const res = await fetch("/api/tactical-advice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || `Tactical advisor error (${res.status}): ${res.statusText}`);
  }

  const text = data?.text;
  if (!text) throw new Error("Tactical advisor returned no advice text.");
  return text.trim();
}
