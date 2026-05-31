import { adminCookieHeader, constantTimeEqual, createAdminSession, getAdminToken } from "../../_auth.js";

export async function onRequestPost(context) {
  const configuredToken = getAdminToken(context.env);
  if (!configuredToken) {
    return json({ success: false, error: "Admin login is not configured." }, 500);
  }

  let payload;
  try {
    payload = await context.request.json();
  } catch {
    return json({ success: false, error: "Invalid JSON payload." }, 400);
  }

  const submittedToken = String(payload.token || "");
  if (!constantTimeEqual(submittedToken, configuredToken)) {
    return json({ success: false, error: "Invalid admin token." }, 401);
  }

  const session = await createAdminSession(context.env);
  return json(
    { success: true, role: "admin" },
    200,
    { "Set-Cookie": adminCookieHeader(session) }
  );
}

export async function onRequestGet() {
  return json({ success: false, error: "Use POST." }, 405);
}

function json(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}
