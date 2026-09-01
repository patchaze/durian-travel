// Vercel Function. Lives in /api at the repo root, not in src/pages, so the
// Astro build stays output: 'static' with no adapter. Vercel serves the 78
// prerendered pages from dist/ and routes /api/* here.
//
// Why a server endpoint at all: Brevo's contacts API needs a secret key. On a
// static site that key would be inlined into the client bundle and shipped to
// every visitor, which is the trap removed from ChatBot.astro in August. The
// key is read here, at request time, and never appears in a response body.
//
// Required environment variables, set in the Vercel dashboard, not in the repo:
//   BREVO_API_KEY   secret, no PUBLIC_ prefix
//   BREVO_LIST_ID   numeric id of the list to add contacts to
//
// robots.txt already disallows /api/, and the trailing-slash catch-all in
// vercel.json already excludes it, so no routing changes are needed.

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/contacts';

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;

// Deliberately vague to the caller, specific in the logs. A subscribe endpoint
// should not tell a stranger whether an address is already on a list.
const fail = (status: number, message: string) =>
  new Response(JSON.stringify({ ok: false, message }), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const ok = () =>
  new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return fail(405, 'Method not allowed.');

    const apiKey = process.env.BREVO_API_KEY;
    const listIdRaw = process.env.BREVO_LIST_ID;

    if (!apiKey || !listIdRaw) {
      console.error('[subscribe] BREVO_API_KEY or BREVO_LIST_ID is not set');
      return fail(500, 'Signup is not available right now.');
    }

    const listId = Number(listIdRaw);
    if (!Number.isFinite(listId)) {
      console.error('[subscribe] BREVO_LIST_ID is not a number:', listIdRaw);
      return fail(500, 'Signup is not available right now.');
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return fail(400, 'That did not go through. Try again.');
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!isEmail(email)) return fail(400, 'That does not look like an email address.');

    // Ours rather than the visitor's, but they arrive over the wire, so they
    // are treated as untrusted and clamped before being stored as attributes.
    const passport = typeof body.passport === 'string' ? body.passport.slice(0, 60) : '';
    const source = typeof body.source === 'string' ? body.source.slice(0, 60) : 'unknown';

    try {
      const res = await fetch(BREVO_ENDPOINT, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          email,
          listIds: [listId],
          updateEnabled: true, // resubscribing must not 400
          attributes: {
            PASSPORT: passport || 'not given',
            SIGNUP_SOURCE: source,
          },
        }),
      });

      if (res.ok) return ok();

      const detail = await res.text().catch(() => '');

      // An address already on the list is a success from the visitor's point of
      // view, whatever Brevo calls it.
      if (res.status === 400 && detail.includes('duplicate_parameter')) return ok();

      console.error('[subscribe] brevo responded', res.status, detail.slice(0, 300));
      return fail(502, 'That did not go through. Try again in a moment.');
    } catch (e) {
      console.error('[subscribe] request failed', e);
      return fail(502, 'That did not go through. Try again in a moment.');
    }
  },
};
