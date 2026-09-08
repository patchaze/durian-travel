// Cloudflare Pages Function. Ported from the Vercel Function at api/report.ts
// on 7 September 2026, because Cloudflare Pages does not run a root /api/
// folder. Pages routes every file under functions/ by its path, so this file
// answers /api/report, the same URL the Vercel version used. robots.txt
// already carries `Disallow: /api/`, so no routing or robots change was needed.
//
// The Astro build stays output: 'static' with no adapter. Pages serves the 77
// prerendered pages from dist/ and runs this Worker for /api/report only.
//
// What this endpoint is for: the paid cost per country report. Every
// calculation happens in src/lib/report.ts, on the server, and the report
// exists only in this response. No part of it is ever built into a page, so
// nothing paid ships to a browser.
//
// The free comparison on /tools/cost-per-country/ is untouched and stays free.
// It does its own arithmetic in the visitor's browser and never calls this
// endpoint. The free planner at /tools/budget/ does not call it either.

import costData from '../../src/data/country-costs.json';
import { buildReport, type CostData } from '../../src/lib/report';

const data = costData as unknown as CostData;

// Set in the Cloudflare Pages dashboard, on the production and preview
// environments. Deliberately not in .env, .dev.vars or any committed file.
interface Env {
  REPORT_ACCESS_CODE?: string;
}

const fail = (status: number, message: string) =>
  new Response(JSON.stringify({ ok: false, message }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const html = (body: string) =>
  new Response(body, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });

// The header the page sends the access code in. A header rather than a body
// field, so the secret is not sitting in the JSON payload that gets parsed,
// echoed or logged alongside the answers.
const ACCESS_HEADER = 'x-durian-access';

// Length first, then every byte, with no early return. The comparison takes
// the same time whether the first character is wrong or the last one is, so a
// caller cannot learn the code one character at a time.
function sameSecret(given: string, expected: string): boolean {
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) {
    diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

// The one place that decides whether a request may have a report.
//
// Access is by a code Patricia sets herself, as REPORT_ACCESS_CODE in the
// Cloudflare Pages dashboard. The value is never in this repository: not in a
// file, not in a comment, not in a test, not in an example. It is read from
// the environment at request time and compared here, on the server, so it can
// never reach a browser or a build artifact.
//
// If REPORT_ACCESS_CODE is unset or empty this returns false for everybody.
// A missing secret is a closed door, never an open one. Nothing about a
// misconfigured deployment may make the report free.
//
// Payment is not built yet. When it lands, the verification goes in here and
// nowhere else. One way in, one function to audit. Do not add a second.
function isPaidRequest(request: Request, env: Env): boolean {
  const expected = typeof env?.REPORT_ACCESS_CODE === 'string' ? env.REPORT_ACCESS_CODE : '';
  if (!expected) return false;

  const given = request.headers.get(ACCESS_HEADER) ?? '';
  if (!given) return false;

  return sameSecret(given, expected);
}

// Pages calls onRequest for every method. The method check is kept explicit
// rather than exporting onRequestPost, so a GET gets the same JSON shape as
// every other refusal instead of the platform's default 405 page.
export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  if (request.method !== 'POST') return fail(405, 'Method not allowed.');

  if (!isPaidRequest(request, env)) return fail(402, 'This report is not available.');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, 'That did not go through. Try again.');
  }

  try {
    // buildReport normalises everything it is given, so a malformed body
    // produces a valid report built from defaults rather than an error.
    return html(buildReport(body, data));
  } catch (e) {
    console.error('[report] generation failed', e);
    return fail(500, 'The report could not be generated.');
  }
}
