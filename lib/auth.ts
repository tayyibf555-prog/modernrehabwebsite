/**
 * Single-owner auth: shared password from env, HMAC-signed cookie.
 * Uses Web Crypto so it runs in both Edge (proxy.ts) and Node (server actions).
 *
 * If staff count > 1, swap this file for Clerk middleware (see CRM-SOP.md).
 */

export const COOKIE_NAME = "mr_admin";
export const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 14; // 14 days

const DEFAULT_PASSWORD = "modernrehab"; // local dev only
const DEFAULT_SECRET = "dev-secret-do-not-use-in-production";

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}
function cookieSecret(): string {
  return process.env.ADMIN_COOKIE_SECRET || DEFAULT_SECRET;
}

// Constant-time string equality. Length leak is acceptable for our threat
// model — the alternative requires equal-length strings up front.
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function checkPassword(submitted: string): boolean {
  return constantTimeEqual(submitted, adminPassword());
}

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(cookieSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function makeSessionToken(): Promise<string> {
  // Token format: <issuedAt>.<sig>
  const issuedAt = Math.floor(Date.now() / 1000).toString();
  const sig = await sign(issuedAt);
  return `${issuedAt}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [issuedAt, sig] = token.split(".");
  if (!issuedAt || !sig) return false;
  const expected = await sign(issuedAt);
  if (!constantTimeEqual(sig, expected)) return false;
  const issuedNum = Number(issuedAt);
  if (!Number.isFinite(issuedNum)) return false;
  const ageSec = Math.floor(Date.now() / 1000) - issuedNum;
  return ageSec >= 0 && ageSec <= COOKIE_MAX_AGE_SEC;
}
