/**
 * Beta tester signup — collects an email address so the developer can add it
 * to the Android app's Play Console closed-testing list.
 *
 * This is the one intentional exception to the "no data collection" story
 * elsewhere in this app: it's a first-party, purpose-limited, user-initiated
 * signup (like a newsletter form), not passive tracking. See privacy.html
 * for the full disclosure.
 */

// Deliberately permissive — this only gates obviously-malformed input before
// it reaches the server; real validation (deliverability, uniqueness) isn't
// something a regex can do, and isn't the point here.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export class InvalidEmailError extends Error {
  constructor() {
    super("Please enter a valid email address.");
    this.name = "InvalidEmailError";
  }
}

export async function submitBetaSignup(email: string): Promise<void> {
  const trimmed = email.trim();
  if (!isValidEmail(trimmed)) throw new InvalidEmailError();

  const res = await fetch("/api/beta-signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: trimmed }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Signup failed (${res.status}): ${res.statusText}`);
  }
}
