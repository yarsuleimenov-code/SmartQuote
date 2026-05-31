export async function onRequestPost(context) {
  const endpoint = context.env.APPS_SCRIPT_ENDPOINT;
  const token = context.env.SHEETS_AUTH_TOKEN;

  if (!endpoint || !token) {
    return json({ success: false, error: "Sheets proxy is not configured." }, 500);
  }

  let payload;
  try {
    payload = await context.request.json();
  } catch {
    return json({ success: false, error: "Invalid JSON payload." }, 400);
  }

  payload.auth_token = token;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { success: false, error: text || "Invalid Apps Script response." };
  }

  return json(data, response.ok ? 200 : response.status);
}

export async function onRequestGet(context) {
  return json({
    success: true,
    configured: Boolean(context.env.APPS_SCRIPT_ENDPOINT && context.env.SHEETS_AUTH_TOKEN),
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
