import type { BowlerType, Fielder, Format, OverType, ValidationResult } from "../types";
import { getPositionName, isOutsideCircle } from "./positions";
import { getApiKey } from "./apiKey";

const MODEL = "gemini-2.5-flash";

/** Thrown when the visitor hasn't configured their own Gemini API key yet. */
export class MissingApiKeyError extends Error {
  constructor() {
    super("No Gemini API key configured.");
    this.name = "MissingApiKeyError";
  }
}

export async function getTacticalAdvice(
  players: Fielder[],
  format: Format,
  overType: OverType,
  bowlerType: BowlerType,
  isLeftHanded: boolean,
  validation: ValidationResult,
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new MissingApiKeyError();

  const fieldSummary = players
    .map((p) => {
      const where =
        p.role === "bowler"
          ? "Bowler (at the stumps)"
          : p.role === "keeper"
            ? "Wicketkeeper"
            : `${getPositionName(p.x, p.y, isLeftHanded)}${isOutsideCircle(p.x, p.y) ? ", outside the circle" : ""}`;
      return `- ${p.name}: ${where}`;
    })
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

  // Called directly from the browser with the visitor's own key — this app
  // has no server component in the request path, so there's no server-side
  // key to keep secret here. Google's Generative Language API is designed to
  // be called this way for client-supplied keys.
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const apiMessage: string | undefined = data?.error?.message;
    if (res.status === 400 || res.status === 403) {
      throw new Error(
        `Gemini rejected this API key (${res.status}): ${apiMessage || res.statusText}. Check that the key is correct and has the Generative Language API enabled.`,
      );
    }
    throw new Error(`Tactical advisor error (${res.status}): ${apiMessage || res.statusText}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Tactical advisor returned no advice text.");
  return text.trim();
}
