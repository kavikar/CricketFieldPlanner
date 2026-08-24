import type { BowlerType, Fielder, Format, OverType, ValidationResult } from "../types";
import { getFielderZone } from "./validation";

const MODEL = "gemini-2.5-flash";

export function isGeminiConfigured(): boolean {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  return !!key && key !== "MY_GEMINI_API_KEY";
}

export async function getTacticalAdvice(
  players: Fielder[],
  format: Format,
  overType: OverType,
  bowlerType: BowlerType,
  isLeftHanded: boolean,
  validation: ValidationResult,
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "No Gemini API key configured. Add VITE_GEMINI_API_KEY to web/.env to enable AI tactical advice.",
    );
  }

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

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini API error (${res.status}): ${body || res.statusText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini API returned no advice text.");
  return text.trim();
}
