// Cloudflare Pages Function — stores beta tester signups in Cloudflare KV.
// Requires a KV namespace bound as BETA_SIGNUPS in the Pages project settings
// (Settings -> Functions -> KV namespace bindings), for both Production and
// Preview environments. See web/README.md for setup steps.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Env {
  BETA_SIGNUPS: KVNamespace;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  if (!env.BETA_SIGNUPS) {
    return jsonResponse({ error: "Signup storage is not configured." }, 500);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const { email, hp } = (body ?? {}) as { email?: unknown; hp?: unknown };

  // Honeypot: a hidden field real visitors never fill in. A bot that fills
  // every field trips this. Respond as if it worked — don't tip it off.
  if (typeof hp === "string" && hp.trim() !== "") {
    return jsonResponse({ ok: true });
  }

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    return jsonResponse({ error: "Please provide a valid email address." }, 400);
  }

  const normalized = email.trim().toLowerCase();

  // Keying by email gives free deduplication — a repeat signup just refreshes
  // the timestamp instead of creating a second entry.
  await env.BETA_SIGNUPS.put(
    normalized,
    JSON.stringify({ email: normalized, submittedAt: new Date().toISOString() }),
  );

  return jsonResponse({ ok: true });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
