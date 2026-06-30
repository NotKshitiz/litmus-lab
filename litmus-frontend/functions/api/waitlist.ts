// Cloudflare Pages Function — handles POST /api/waitlist
//
// To enable persistence, bind a KV namespace called WAITLIST in your Pages
// project (Settings → Functions → KV namespace bindings). Without the binding
// the function still returns 200 so the form works; it just won't store.
//
// Then set the build-time env var:  NEXT_PUBLIC_WAITLIST_ENDPOINT=/api/waitlist

interface Env {
  WAITLIST?: KVNamespace;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let email = "";
  try {
    const body = (await request.json()) as { email?: string };
    email = (body.email || "").trim().toLowerCase();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!EMAIL_RE.test(email)) {
    return json({ error: "Invalid email" }, 400);
  }

  if (env.WAITLIST) {
    await env.WAITLIST.put(`email:${email}`, new Date().toISOString());
  }

  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
