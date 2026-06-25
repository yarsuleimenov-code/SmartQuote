(function () {
  const formulas = Array.isArray(window.FormulaMasterData) ? window.FormulaMasterData : [];
  const state = { search: "", block: "all" };

  const variableTerms = [
    ...(window.FormulaCatalogMetadata?.variableTerms || []),
    "Rounding Increment", "Heavy Threshold", "Bulky Threshold", "Margin Rate", "Broker Fee Rate",
    "Storage Rate", "Packaging Rate", "Protection Rate", "Fixed Fee", "Fuel Surcharge",
    "Internal Fuel Price", "MPG", "Maintenance Per Mile", "Driver Cost Per Mile", "Wage Per Minute",
    "Pickup Wage Per Mile", "Management Fee", "Dispatch Fee", "Repair Cost Per Unit",
    "Exclusive Delivery Multiplier", "Priority Date Fee", "Rate",
  ];
  const referenceTerms = [
    ...(window.FormulaCatalogMetadata?.referenceTerms || []),
    "ZIP", "Zone", "Distance Matrix", "Vehicle", "Fuel Type", "Packaging", "Protection Plan",
    "Route Matrix", "Reference", "Payload", "Capacity",
  ];

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function highlight(text) {
    const terms = [
      ...variableTerms.map((term) => ({ term, className: "text-blue-700 font-semibold" })),
      ...referenceTerms.map((term) => ({ term, className: "text-emerald-700 font-semibold" })),
    ].sort((left, right) => right.term.length - left.term.length);
    const pattern = new RegExp(`(${terms.map(({ term }) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");

    return escapeHtml(text).replace(pattern, (match) => {
      const found = terms.find(({ term }) => term.toLowerCase() === match.toLowerCase());
      return `<span class="${found?.className || "text-slate-900"}">${match}</span>`;
    });
  }

  function blockId(block) {
    return `formula-block-${String(block).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
  }

  function filterRecords(records, search, block) {
    const query = String(search || "").trim().toLowerCase();
    return records.filter((formula) => {
      const blockMatch = block === "all" || formula.block === block;
      const searchMatch = !query || [
        formula.id, formula.block, formula.name, formula.formula, formula.description,
        formula.source, formula.output, formula.usedIn,
      ].some((value) => String(value).toLowerCase().includes(query));
      return blockMatch && searchMatch;
    });
  }

  function filteredFormulas() {
    return filterRecords(formulas, state.search, state.block);
  }

  function renderStats(visibleCount) {
    const blocks = new Set(formulas.map((formula) => formula.block));
    document.getElementById("formulaTotal").textContent = formulas.length;
    document.getElementById("formulaVisible").textContent = visibleCount;
    document.getElementById("formulaBlocks").textContent = blocks.size;
  }

  function renderNavigation() {
    const blocks = [...new Set(formulas.map((formula) => formula.block))];
    const select = document.getElementById("formulaBlockFilter");
    select.innerHTML = `<option value="all">All blocks</option>${blocks.map((block) =>
      `<option value="${escapeHtml(block)}">${escapeHtml(block)}</option>`).join("")}`;
    document.getElementById("formulaBlockLinks").innerHTML = blocks.map((block) =>
      `<a href="#${blockId(block)}" class="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700">${escapeHtml(block)}</a>`
    ).join("");
  }

  function render() {
    const visible = filteredFormulas();
    const groups = new Map();
    visible.forEach((formula) => {
      if (!groups.has(formula.block)) groups.set(formula.block, []);
      groups.get(formula.block).push(formula);
    });

    renderStats(visible.length);
    const root = document.getElementById("formulaCatalog");
    if (!visible.length) {
      root.innerHTML = `<div class="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500">No formulas match the current filters.</div>`;
      return;
    }

    root.innerHTML = [...groups.entries()].map(([block, records]) => `
      <section id="${blockId(block)}" class="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <h2 class="font-bold text-slate-800">${escapeHtml(block)}</h2>
            <p class="mt-1 text-xs text-slate-500">${records.length} formula${records.length === 1 ? "" : "s"} from target architecture masterdata</p>
          </div>
          <span class="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">${escapeHtml(records[0].id.split("-")[0])}</span>
        </div>
        <div class="divide-y divide-slate-200">
          ${records.map((formula) => `
            <article class="grid grid-cols-[110px_minmax(260px,1fr)_minmax(360px,1.8fr)] gap-4 px-5 py-4">
              <div>
                <span class="inline-flex rounded bg-slate-900 px-2 py-1 font-mono text-xs font-semibold text-white">${escapeHtml(formula.id)}</span>
                <p class="mt-2 text-xs text-slate-400">${escapeHtml(formula.level)}</p>
              </div>
              <div>
                <h3 class="font-semibold text-slate-800">${escapeHtml(formula.name)}</h3>
                <p class="mt-2 text-sm leading-5 text-slate-500">${escapeHtml(formula.description)}</p>
              </div>
              <div class="space-y-3">
                <div class="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 font-mono text-sm text-slate-900">${highlight(formula.formula)}</div>
                <div class="grid grid-cols-3 gap-2 text-xs">
                  <div class="rounded-md border border-slate-200 p-2"><span class="text-slate-400">Input / Source</span><p class="mt-1 text-slate-800">${highlight(formula.source)}</p></div>
                  <div class="rounded-md border border-slate-200 p-2"><span class="text-slate-400">Output</span><p class="mt-1 text-slate-800">${highlight(formula.output)}</p></div>
                  <div class="rounded-md border border-slate-200 p-2"><span class="text-slate-400">Used In</span><p class="mt-1 text-slate-800">${highlight(formula.usedIn)}</p></div>
                </div>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `).join("");
  }

  function init() {
    renderNavigation();
    document.getElementById("formulaSearch").addEventListener("input", (event) => {
      state.search = event.target.value;
      render();
    });
    document.getElementById("formulaBlockFilter").addEventListener("change", (event) => {
      state.block = event.target.value;
      render();
    });
    document.getElementById("clearFormulaFilters").addEventListener("click", () => {
      state.search = "";
      state.block = "all";
      document.getElementById("formulaSearch").value = "";
      document.getElementById("formulaBlockFilter").value = "all";
      render();
    });
    render();
    if (window.lucide) window.lucide.createIcons();
  }

  window.FormulaCatalog = { filterRecords };
  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", init);
})();
