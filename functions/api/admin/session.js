import { verifyAdminSession } from "../../_auth.js";

export async function onRequestGet(context) {
  const isAdmin = await verifyAdminSession(context.request, context.env);
  return json({
    success: true,
    role: isAdmin ? "admin" : "basic",
    isAdmin,
  });
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
