(function () {
  const pageSize = 100;
  const storageKey = window.ZipCoverage.storageKey;
  const defaultPriceCoefficient = window.ZipCoverage.defaultPriceCoefficient;
  const source = window.CoverageZipData || {};
  const records = Array.isArray(source.records) ? source.records : [];
  const coverageStatuses = [
    {
      value: "covered",
      label: "✅ Covered",
      className: "border-emerald-300 bg-emerald-50 text-emerald-800",
    },
    {
      value: "disabled",
      label: "⛔ Excluded",
      className: "border-red-300 bg-red-50 text-red-800",
    },
    {
      value: "approval_required",
      label: "⚠ Review",
      className: "border-amber-300 bg-amber-50 text-amber-800",
    },
  ];
  const statusClassNames = coverageStatuses.flatMap((status) => status.className.split(" "));
  const zoneBadgeClasses = {
    "Boston": "bg-cyan-100 text-cyan-800",
    "CA (A)": "bg-blue-100 text-blue-800",
    "CA (C)": "bg-indigo-100 text-indigo-800",
    "CA (D)": "bg-violet-100 text-violet-800",
    "CA (LA)": "bg-fuchsia-100 text-fuchsia-800",
    "CA (SF)": "bg-rose-100 text-rose-800",
    "NY (DC)": "bg-orange-100 text-orange-800",
    "NY (LI)": "bg-amber-100 text-amber-800",
    "NY (NORTH)": "bg-lime-100 text-lime-800",
    "NY (SOUTH)": "bg-emerald-100 text-emerald-800",
    "NYC": "bg-teal-100 text-teal-800",
  };

  const fields = {
    search: document.getElementById("coverageZipSearch"),
    zone: document.getElementById("coverageZoneFilter"),
    coverage: document.getElementById("coverageStatusFilter"),
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
  let overrides = readOverrides();

  function readOverrides() {
    return window.ZipCoverage.readOverrides();
  }

  function writeOverrides() {
    try {
      window.localStorage?.setItem(storageKey, JSON.stringify(overrides));
      return true;
    } catch {
      return false;
    }
  }

  function recordSettings(record) {
    const saved = overrides[record.zip] || {};
    return {
      coverageStatus: coverageStatuses.some((status) => status.value === saved.coverageStatus)
        ? saved.coverageStatus
        : "covered",
      priceCoefficient: Number.isFinite(Number(saved.priceCoefficient))
        ? Number(saved.priceCoefficient)
        : defaultPriceCoefficient,
    };
  }

  function statusOptions(selectedValue) {
    return coverageStatuses.map((status) => `
      <option value="${status.value}" ${status.value === selectedValue ? "selected" : ""}>
        ${status.label}
      </option>
    `).join("");
  }

  function statusClassName(statusValue) {
    return coverageStatuses.find((status) => status.value === statusValue)?.className
      || coverageStatuses[0].className;
  }

  function applyStatusStyle(select, statusValue) {
    select.classList.remove(...statusClassNames);
    select.classList.add(...statusClassName(statusValue).split(" "));
  }

  function zoneBadgeClassName(zone) {
    return zoneBadgeClasses[zone] || "bg-slate-100 text-slate-700";
  }

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
    const coverageStatus = fields.coverage.value;

    if (fields.search.value !== search) fields.search.value = search;

    return records.filter((record) => {
      const matchesZip = !search || record.zip.startsWith(search);
      const matchesZone = !zone || record.zone === zone;
      const matchesCoverage = !coverageStatus || recordSettings(record).coverageStatus === coverageStatus;
      return matchesZip && matchesZone && matchesCoverage;
    });
  }

  function renderRows(rows) {
    fields.rows.innerHTML = rows.map((record) => {
      const settings = recordSettings(record);
      return `
      <tr class="hover:bg-slate-50">
        <td class="px-5 py-3">
          <span class="font-mono font-semibold text-slate-800">${escapeHtml(record.zip)}</span>
        </td>
        <td class="px-5 py-3 text-slate-500">${escapeHtml(record.region)}</td>
        <td class="px-5 py-3">
          <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${zoneBadgeClassName(record.zone)}">
            ${escapeHtml(record.zone)}
          </span>
        </td>
        <td class="px-5 py-3 text-right">
          <input
            class="zip-coefficient-input w-24 border border-slate-300 rounded-lg px-3 py-2 text-right font-mono font-semibold text-slate-700"
            data-zip="${escapeHtml(record.zip)}"
            type="number"
            min="0.5"
            max="2"
            step="0.05"
            value="${settings.priceCoefficient.toFixed(2)}"
            aria-label="ZIP coefficient for ${escapeHtml(record.zip)}"
            title="Future pricing coefficient; not active in quote calculations"
          />
        </td>
        <td class="px-5 py-3 text-right">
          <select
            class="coverage-status-select min-w-[220px] border rounded-lg px-3 py-2 text-sm font-medium ${statusClassName(settings.coverageStatus)}"
            data-zip="${escapeHtml(record.zip)}"
            aria-label="Coverage status for ZIP ${escapeHtml(record.zip)}"
            title="Set ZIP coverage status"
          >
            ${statusOptions(settings.coverageStatus)}
          </select>
        </td>
      </tr>
    `;
    }).join("");
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

  fields.coverage.addEventListener("change", () => {
    currentPage = 1;
    render();
  });

  fields.clear.addEventListener("click", () => {
    fields.search.value = "";
    fields.zone.value = "";
    fields.coverage.value = "";
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

  function handleRowEdit(event) {
    const coefficientInput = event.target.closest(".zip-coefficient-input");
    if (coefficientInput) {
      const zip = coefficientInput.dataset.zip;
      const existing = recordSettings({ zip });
      if (event.type === "input" && coefficientInput.value.trim() === "") return;
      const parsed = Number(coefficientInput.value);
      const priceCoefficient = Number.isFinite(parsed)
        ? Math.min(2, Math.max(0.5, Math.round(parsed * 100) / 100))
        : defaultPriceCoefficient;
      if (event.type === "change") coefficientInput.value = priceCoefficient.toFixed(2);

      if (existing.coverageStatus === "covered" && priceCoefficient === defaultPriceCoefficient) {
        delete overrides[zip];
      } else {
        overrides[zip] = {
          coverageStatus: existing.coverageStatus,
          priceCoefficient,
        };
      }

      const saved = writeOverrides();
      fields.status.textContent = saved
        ? `ZIP ${zip} coefficient saved locally; quote pricing remains unchanged`
        : `ZIP ${zip} coefficient could not be saved`;
      return;
    }

    if (event.type !== "change") return;
    const select = event.target.closest(".coverage-status-select");
    if (!select) return;

    const zip = select.dataset.zip;
    const existing = recordSettings({ zip });
    const coverageStatus = coverageStatuses.some((status) => status.value === select.value)
      ? select.value
      : "covered";
    applyStatusStyle(select, coverageStatus);

    if (coverageStatus === "covered" && existing.priceCoefficient === defaultPriceCoefficient) {
      delete overrides[zip];
    } else {
      overrides[zip] = {
        coverageStatus,
        priceCoefficient: existing.priceCoefficient,
      };
    }

    const saved = writeOverrides();
    fields.status.textContent = saved
      ? `ZIP ${zip} coverage status saved locally`
      : `ZIP ${zip} coverage status could not be saved`;
    if (fields.coverage.value) render();
  }

  fields.rows.addEventListener("input", handleRowEdit);
  fields.rows.addEventListener("change", handleRowEdit);

  initializeFilters();
  render();
})();
