/**
 * Storage for the visitor's own Gemini API key.
 *
 * This is a "bring your own key" feature: the key is typed in by the visitor,
 * kept only in their browser's localStorage, and sent directly from their
 * browser straight to Google's API — it never passes through any server we
 * run, and we never see it. There is no shared/site key anywhere in this app.
 */

const STORAGE_KEY = "cricket-field-planner:gemini-api-key";

export function getApiKey(): string | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value && value.trim() ? value.trim() : null;
  } catch {
    // Storage can throw in private-browsing modes or when blocked by the user.
    return null;
  }
}

export function setApiKey(key: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, key.trim());
  } catch {
    // Best-effort — if storage is unavailable the caller will simply be asked
    // to re-enter the key next time.
  }
}

export function clearApiKey(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // No-op — nothing to clean up if storage was never reachable.
  }
}
