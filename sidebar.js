const currentPage = window.location.pathname.split("/").pop() || "index.html";

const mainItems = [
  { label: "Quick Quote", href: "quick-quote.html" },
  { label: "New Calculation", href: "index.html" },
  { label: "My Drafts", href: "drafts.html" },
  { label: "My Estimates", href: "estimates.html" },
  { label: "All Calculations", href: null },
];

const operationItems = [
  { label: "Cost Breakdown", href: "breakdown.html", icon: "file-text" },
  { label: "Invoices", href: "invoices.html", icon: "wallet" },
  { label: "eBOL", href: "ebol.html", icon: "clipboard-check" },
  { label: "Orders", href: "orders.html", icon: "package-check" }
];

const pricingItems = [
  { label: "Variables", href: "variables.html", icon: "sliders-horizontal" },
  { label: "References", href: "references.html", icon: "book-open" },
  { label: "Formulas", href: "formulas.html", icon: "sigma" }
];

const futureItems = [
  { label: "Analytics", icon: "bar-chart-3" },
  { label: "Automation", icon: "workflow" }
];

const referenceItems = [
  { label: "Lifecycle", href: "lifecycle.html", icon: "git-branch" }
];

function isActive(href) {
  return href === currentPage;
}

function linkClass(href) {
  return isActive(href)
    ? "block px-3 py-1 rounded bg-slate-800 text-white font-semibold"
    : "block px-3 py-1 rounded hover:bg-slate-800 text-white";
}

function iconLinkClass(href) {
  return isActive(href)
    ? "flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 text-white"
    : "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800";
}

function renderMainItems() {
  return mainItems.map(item => {
    if (!item.href) {
      return `
        <div class="px-3 py-1 rounded text-slate-500 bg-slate-900/20 cursor-not-allowed">
          ${item.label}
        </div>
      `;
    }

    return `
      <a class="${linkClass(item.href)}" href="${item.href}">
        ${item.label}
      </a>
    `;
  }).join("");
}

function renderIconLinks(items) {
  return items.map(item => `
    <a class="${iconLinkClass(item.href)}" href="${item.href}">
      <i data-lucide="${item.icon}" class="w-4"></i>
      ${item.label}
    </a>
  `).join("");
}

function renderFutureItems() {
  return futureItems.map(item => `
    <div class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 bg-slate-900/20 cursor-not-allowed">
      <i data-lucide="${item.icon}" class="w-4"></i>
      ${item.label}
    </div>
  `).join("");
}

document.getElementById("sidebar").innerHTML = `
  <aside class="w-64 bg-[#203241] text-slate-300 min-h-screen fixed left-0 top-0 overflow-y-auto">

    <div class="p-6 border-b border-slate-700">
      <h1 class="text-2xl font-bold text-[#12365a]">
        zaberman
      </h1>

      <div class="mt-6 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
          z
        </div>

        <div>
          <p class="text-white font-semibold text-sm">
            Admin
          </p>

          <p class="text-xs text-slate-400">
            Broker Calculator MVP
          </p>
        </div>
      </div>
    </div>

    <nav class="p-4 text-sm">

      <p class="uppercase text-xs text-slate-500 mb-3">
        MAIN
      </p>

      <div class="space-y-1 mb-6">
        <div class="bg-slate-800 rounded-lg">
          <div class="w-full flex items-center justify-between px-3 py-2 text-white">
            <div class="flex items-center gap-3">
              <i data-lucide="calculator" class="w-4"></i>
              Calculator
            </div>

            <i data-lucide="chevron-down" class="w-4"></i>
          </div>

          <div class="px-2 pb-2 space-y-1 text-sm">
            ${renderMainItems()}
          </div>
        </div>
      </div>

      <p class="uppercase text-xs text-slate-500 mb-3">
        OPERATIONS
      </p>

      <div class="space-y-1 mb-6">
        ${renderIconLinks(operationItems)}
      </div>

      <p class="uppercase text-xs text-slate-500 mb-3">
        PRICING ENGINE
      </p>

      <div class="space-y-1 mb-6">
        ${renderIconLinks(pricingItems)}
      </div>

      <p class="uppercase text-xs text-slate-500 mb-3">
        FUTURE
      </p>

      <div class="space-y-1 mb-6">
        ${renderFutureItems()}
      </div>

      <p class="uppercase text-xs text-slate-500 mb-3">
        REFERENCE
      </p>

      <div class="space-y-1">
        ${renderIconLinks(referenceItems)}
      </div>

    </nav>

  </aside>
`;

if (window.lucide) {
  lucide.createIcons();
}
