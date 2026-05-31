import { clearAdminCookieHeader } from "../../_auth.js";

export async function onRequestPost() {
  return json(
    { success: true, role: "basic" },
    200,
    { "Set-Cookie": clearAdminCookieHeader() }
  );
}

export async function onRequestGet() {
  return json(
    { success: true, role: "basic" },
    200,
    { "Set-Cookie": clearAdminCookieHeader() }
  );
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
