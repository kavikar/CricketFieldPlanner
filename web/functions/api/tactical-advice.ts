// Cloudflare Pages Function — proxies Gemini calls so the API key stays server-side.
// Deployed automatically from this file; set GEMINI_API_KEY as a Pages secret
// (Cloudflare dashboard -> Workers & Pages -> project -> Settings -> Environment variables).

const MODEL = "gemini-2.5-flash";

interface Env {
  GEMINI_API_KEY: string;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  if (!env.GEMINI_API_KEY) {
    return jsonResponse({ error: "Server is not configured with a Gemini API key." }, 500);
  }

  let prompt: unknown;
  try {
    ({ prompt } = await request.json());
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  if (typeof prompt !== "string" || !prompt.trim()) {
    return jsonResponse({ error: "Missing prompt." }, 400);
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return jsonResponse({ error: `Gemini API error (${res.status}): ${body || res.statusText}` }, res.status);
  }

  const data: { candidates?: { content?: { parts?: { text?: string }[] } }[] } = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return jsonResponse({ error: "Gemini API returned no advice text." }, 502);
  }

  return jsonResponse({ text });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
