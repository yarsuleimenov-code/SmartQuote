import { verifyAdminSession } from "./_auth.js";

const ADMIN_PAGES = new Set([
  "/breakdown.html",
  "/invoices.html",
  "/ebol.html",
  "/orders.html",
  "/variables.html",
  "/references.html",
  "/coverage-zips.html",
  "/formulas.html",
  "/lifecycle.html",
]);

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (!ADMIN_PAGES.has(url.pathname)) {
    return context.next();
  }

  const isAdmin = await verifyAdminSession(context.request, context.env);
  if (isAdmin) {
    return context.next();
  }

  const loginUrl = new URL("/admin-login.html", url.origin);
  loginUrl.searchParams.set("returnTo", `${url.pathname}${url.search}`);
  return Response.redirect(loginUrl.toString(), 302);
}
