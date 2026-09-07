// Cloudflare Pages Function. Ported from the Vercel Function at api/report.ts
// on 7 September 2026, because Cloudflare Pages does not run a root /api/
// folder. Pages routes every file under functions/ by its path, so this file
// answers /api/report, the same URL the Vercel version used. robots.txt
// already carries `Disallow: /api/`, so no routing or robots change was needed.
//
// The Astro build stays output: 'static' with no adapter. Pages serves the 77
// prerendered pages from dist/ and runs this Worker for /api/report only.
//
// What this endpoint is for: the paid Trip Budget Report. Every calculation
// happens in src/lib/report.ts, on the server, and the report exists only in
// this response. No part of it is ever built into a page, so nothing paid
// ships to a browser.
//
// The free planner at /tools/budget/ is untouched and stays free. It does its
// own arithmetic in the visitor's browser and never calls this endpoint. The
// two agree: given the same inputs they print the same totals.

import costData from '../../src/data/country-costs.json';
import { buildReport, type CostData } from '../../src/lib/report';

const data = costData as CostData;

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

// The one place that decides whether a request may have a report.
//
// Payment is not built yet, so nothing can be authorised and this returns
// false for everyone. The endpoint therefore answers 402 to every caller,
// which is the correct state today: the generator is finished and reviewed,
// and nothing is for sale.
//
// When payment lands, the verification goes in here and nowhere else. One way
// in, one function to audit. Do not add a second.
function isPaidRequest(_request: Request): boolean {
  return false;
}

// Pages calls onRequest for every method. The method check is kept explicit
// rather than exporting onRequestPost, so a GET gets the same JSON shape as
// every other refusal instead of the platform's default 405 page.
export async function onRequest(context: { request: Request }): Promise<Response> {
  const { request } = context;

  if (request.method !== 'POST') return fail(405, 'Method not allowed.');

  if (!isPaidRequest(request)) return fail(402, 'This report is not available.');

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
