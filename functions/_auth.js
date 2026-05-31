export const ADMIN_COOKIE = "zaberman_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;

const encoder = new TextEncoder();

export function getAdminToken(env) {
  return String(env.ADMIN_AUTH_TOKEN || "");
}

export function getSessionSecret(env) {
  return String(env.ADMIN_SESSION_SECRET || env.ADMIN_AUTH_TOKEN || "");
}

export function parseCookies(request) {
  const header = request.headers.get("Cookie") || "";
  return Object.fromEntries(
    header.split(";").map((cookie) => {
      const [name, ...value] = cookie.trim().split("=");
      return [name, value.join("=")];
    }).filter(([name]) => name)
  );
}

export async function createAdminSession(env, now = Date.now()) {
  const expiresAt = now + ADMIN_SESSION_TTL_SECONDS * 1000;
  const signature = await signSession(env, String(expiresAt));
  return `${expiresAt}.${signature}`;
}

export async function verifyAdminSession(request, env, now = Date.now()) {
  const secret = getSessionSecret(env);
  if (!secret) return false;

  const session = parseCookies(request)[ADMIN_COOKIE];
  if (!session) return false;

  const [expiresAt, signature] = session.split(".");
  const expiresAtNumber = Number(expiresAt);
  if (!Number.isFinite(expiresAtNumber) || expiresAtNumber <= now || !signature) {
    return false;
  }

  const expected = await signSession(env, expiresAt);
  return constantTimeEqual(signature, expected);
}

export function adminCookieHeader(session) {
  return `${ADMIN_COOKIE}=${session}; Max-Age=${ADMIN_SESSION_TTL_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

export function clearAdminCookieHeader() {
  return `${ADMIN_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

export function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

async function signSession(env, payload) {
  const secret = getSessionSecret(env);
  if (!secret) return "";

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
