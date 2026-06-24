(function () {
  const pageSize = 100;
  const source = window.CoverageZipData || {};
  const records = Array.isArray(source.records) ? source.records : [];

  const fields = {
    search: document.getElementById("coverageZipSearch"),
    zone: document.getElementById("coverageZoneFilter"),
    clear: document.getElementById("coverageClearFilters"),
    rows: document.getElementById("coverageZipRows"),
    empty: document.getElementById("coverageEmptyState"),
    status: document.getElementById("coverageTableStatus"),
    total: document.getElementById("coverageTotalCount"),
    filtered: document.getElementById("coverageFilteredCount"),
    zones: document.getElementById("coverageZoneCount"),
    regions: document.getElementById("coverageRegionCount"),
    pageLabels: [
      document.getElementById("coveragePageLabel"),
      document.getElementById("coveragePageLabelBottom"),
    ],
    previousButtons: [
      document.getElementById("coveragePreviousPage"),
      document.getElementById("coveragePreviousPageBottom"),
    ],
    nextButtons: [
      document.getElementById("coverageNextPage"),
      document.getElementById("coverageNextPageBottom"),
    ],
  };

  let currentPage = 1;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function filteredRecords() {
    const search = fields.search.value.replace(/\D/g, "").slice(0, 5);
    const zone = fields.zone.value;

    if (fields.search.value !== search) fields.search.value = search;

    return records.filter((record) => {
      const matchesZip = !search || record.zip.startsWith(search);
      const matchesZone = !zone || record.zone === zone;
      return matchesZip && matchesZone;
    });
  }

  function renderRows(rows) {
    fields.rows.innerHTML = rows.map((record) => `
      <tr class="hover:bg-slate-50">
        <td class="px-5 py-3">
          <span class="font-mono font-semibold text-slate-800">${escapeHtml(record.zip)}</span>
        </td>
        <td class="px-5 py-3 text-slate-500">${escapeHtml(record.region)}</td>
        <td class="px-5 py-3">
          <span class="inline-flex px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            ${escapeHtml(record.zone)}
          </span>
        </td>
        <td class="px-5 py-3 text-right">
          <span class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <i data-lucide="circle-check" class="w-4 h-4"></i>
            Covered
          </span>
        </td>
      </tr>
    `).join("");
  }

  function setPaginationState(totalPages) {
    const previousDisabled = currentPage <= 1;
    const nextDisabled = currentPage >= totalPages;
    const pageText = `Page ${currentPage} of ${totalPages}`;

    fields.pageLabels.forEach((label) => {
      label.textContent = pageText;
    });

    fields.previousButtons.forEach((button) => {
      button.disabled = previousDisabled;
      button.classList.toggle("opacity-40", previousDisabled);
      button.classList.toggle("cursor-not-allowed", previousDisabled);
    });

    fields.nextButtons.forEach((button) => {
      button.disabled = nextDisabled;
      button.classList.toggle("opacity-40", nextDisabled);
      button.classList.toggle("cursor-not-allowed", nextDisabled);
    });
  }

  function render() {
    const filtered = filteredRecords();
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * pageSize;
    const pageRows = filtered.slice(start, start + pageSize);

    renderRows(pageRows);
    fields.filtered.textContent = filtered.length.toLocaleString();
    fields.status.textContent = filtered.length
      ? `Showing ${start + 1}-${Math.min(start + pageSize, filtered.length)} of ${filtered.length.toLocaleString()} matching ZIP codes`
      : "No ZIP codes match the current filters";
    fields.empty.classList.toggle("hidden", filtered.length > 0);
    fields.rows.closest("table").classList.toggle("hidden", filtered.length === 0);
    setPaginationState(totalPages);

    if (window.lucide) window.lucide.createIcons();
  }

  function initializeFilters() {
    const zones = Array.from(new Set(records.map((record) => record.zone))).sort();
    const regions = new Set(records.map((record) => record.region));

    fields.zone.insertAdjacentHTML(
      "beforeend",
      zones.map((zone) => `<option value="${escapeHtml(zone)}">${escapeHtml(zone)}</option>`).join(""),
    );

    fields.total.textContent = records.length.toLocaleString();
    fields.zones.textContent = zones.length.toLocaleString();
    fields.regions.textContent = regions.size.toLocaleString();
  }

  fields.search.addEventListener("input", () => {
    currentPage = 1;
    render();
  });

  fields.zone.addEventListener("change", () => {
    currentPage = 1;
    render();
  });

  fields.clear.addEventListener("click", () => {
    fields.search.value = "";
    fields.zone.value = "";
    currentPage = 1;
    fields.search.focus();
    render();
  });

  fields.previousButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (currentPage <= 1) return;
      currentPage -= 1;
      render();
      document.getElementById("coverageZipRows").closest("section").scrollIntoView({ behavior: "smooth" });
    });
  });

  fields.nextButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const totalPages = Math.max(1, Math.ceil(filteredRecords().length / pageSize));
      if (currentPage >= totalPages) return;
      currentPage += 1;
      render();
      document.getElementById("coverageZipRows").closest("section").scrollIntoView({ behavior: "smooth" });
    });
  });

  initializeFilters();
  render();
})();
