(function () {
  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function dimensions(item) {
    if (!item.length || !item.width || !item.height) return "-";
    return `${item.length} x ${item.width} x ${item.height} in`;
  }

  function render() {
    const tbody = document.getElementById("itemCatalogRows");
    const catalog = window.ReferenceItemCatalog?.active?.() || [];
    if (!tbody || !catalog.length) return;

    tbody.innerHTML = catalog.filter((item) => item.id !== "custom").map((item) => `
      <tr>
        <td class="px-4 py-3 font-medium text-slate-800">${escapeHtml(item.name || item.label)}</td>
        <td class="px-4 py-3">${escapeHtml(item.category || "-")}</td>
        <td class="px-4 py-3">${escapeHtml(dimensions(item))}</td>
        <td class="px-4 py-3">${escapeHtml(item.weight ? `${item.weight} lb` : "-")}</td>
        <td class="px-4 py-3 text-slate-500">${escapeHtml(item.packaging || "-")}</td>
        <td class="px-4 py-3 text-slate-500">${escapeHtml(item.flags || "Standard")}</td>
        <td class="px-4 py-3 text-center"><label class="inline-flex items-center gap-2"><input type="checkbox" checked class="accent-teal-500" disabled /><span class="text-xs text-slate-500">Active</span></label></td>
      </tr>
    `).join("");
  }

  document.addEventListener("DOMContentLoaded", render);
})();
