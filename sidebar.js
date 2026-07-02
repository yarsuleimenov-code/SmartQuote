const currentPage = window.location.pathname.split("/").pop() || "index.html";
const roleParam = new URLSearchParams(window.location.search).get("role");
const storedRole = window.localStorage?.getItem("zabermanUserRole");
const requestedRole = roleParam === "basic" ? "basic" : storedRole || "basic";
const userRole = requestedRole === "admin" ? "admin" : "basic";
const isAdmin = userRole === "admin";

if (roleParam === "basic") {
  window.localStorage?.setItem("zabermanUserRole", "basic");
}

const mainItems = [
  { label: "Quick Quote", href: "quick-quote.html" },
  { label: "New Calculation", href: "index.html" },
  { label: "My Drafts", href: "drafts.html" },
  { label: "My Estimates", href: "estimates.html" },
  { label: "Estimate Document", href: "estimate-document.html" },
  { label: "All Calculations", href: null, adminOnly: true },
];

const operationItems = [
  { label: "Cost Breakdown", href: "breakdown.html", icon: "file-text" },
  { label: "Invoices", href: "invoices.html", icon: "wallet" },
  { label: "eBOL", href: "ebol.html", icon: "clipboard-check" },
  { label: "Orders", href: "orders.html", icon: "package-check" },
];

const pricingItems = [
  { label: "Variables", href: "variables.html", icon: "sliders-horizontal" },
  { label: "References", href: "references.html", icon: "book-open" },
  { label: "ZIP Coverage", href: "coverage-zips.html", icon: "map-pinned" },
  { label: "Formulas", href: "formulas.html", icon: "sigma" },
];

const futureItems = [
  { label: "Analytics", icon: "bar-chart-3" },
  { label: "Automation", icon: "workflow" },
];

const referenceItems = [
  { label: "Lifecycle", href: "lifecycle.html", icon: "git-branch" },
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
  return mainItems.filter((item) => isAdmin || !item.adminOnly).map((item) => {
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
  return items.map((item) => `
    <a class="${iconLinkClass(item.href)}" href="${item.href}">
      <i data-lucide="${item.icon}" class="w-4"></i>
      ${item.label}
    </a>
  `).join("");
}

function renderFutureItems() {
  return futureItems.map((item) => `
    <div class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 bg-slate-900/20 cursor-not-allowed">
      <i data-lucide="${item.icon}" class="w-4"></i>
      ${item.label}
    </div>
  `).join("");
}

const adminSections = isAdmin ? `
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
` : "";

document.getElementById("sidebar").innerHTML = `
  <aside class="w-64 bg-[#203241] text-slate-300 min-h-screen fixed left-0 top-0 overflow-y-auto">

    <div class="p-6 border-b border-slate-700">
      <h1 class="text-2xl font-bold text-white tracking-wide">
        Zaberman LLC
      </h1>

      <div class="mt-6 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
          ${isAdmin ? "A" : "U"}
        </div>

        <div>
          <p class="text-white font-semibold text-sm">
            ${isAdmin ? "Admin" : "User"}
          </p>

          <p class="text-xs text-slate-400">
            ${isAdmin ? "Broker Calculator" : "Calculator"}
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

      ${adminSections}

      <div class="pt-4 mt-6 border-t border-slate-700">
        ${isAdmin ? `
          <button id="adminLogout" class="mb-2 w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800" type="button">
            <i data-lucide="log-out" class="w-4"></i>
            Sign Out
          </button>
        ` : `
          <a class="mb-2 flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800" href="admin-login.html">
            <i data-lucide="shield-check" class="w-4"></i>
            Admin Login
          </a>
        `}

        <a class="flex items-center gap-3 px-3 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500" href="https://yarsuleimenov-code.github.io/lean-ideas-v2/" target="_blank" rel="noopener noreferrer">
          <i data-lucide="message-square-warning" class="w-4"></i>
          Report an Issue
        </a>
      </div>

    </nav>

  </aside>
`;

const responsiveStyle = document.createElement("style");
responsiveStyle.textContent = `
  #sidebar + main {
    margin-left: 16rem !important;
    width: calc(100% - 16rem) !important;
    min-width: 0;
  }

  .smartquote-menu-toggle,
  .smartquote-sidebar-backdrop {
    display: none;
  }

  @media (max-width: 1279px) {
    #sidebar + main {
      margin-left: 0 !important;
      width: 100% !important;
    }

    #sidebar aside {
      z-index: 60;
      transform: translateX(-100%);
      transition: transform 160ms ease;
      box-shadow: 16px 0 40px rgba(15, 23, 42, 0.28);
    }

    body.smartquote-sidebar-open #sidebar aside {
      transform: translateX(0);
    }

    .smartquote-menu-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.75rem;
      color: #334155;
      background: #fff;
      flex: 0 0 auto;
    }

    .smartquote-sidebar-backdrop {
      position: fixed;
      inset: 0;
      z-index: 50;
      background: rgba(15, 23, 42, 0.42);
    }

    body.smartquote-sidebar-open .smartquote-sidebar-backdrop {
      display: block;
    }

    main > header,
    .topbar {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
      gap: 0.75rem;
    }

    main > header > :last-child,
    .topbar > :last-child {
      flex-wrap: wrap;
      justify-content: flex-end;
    }
  }

  @media (max-width: 767px) {
    main > header,
    .topbar {
      min-height: 4rem;
      height: auto !important;
      align-items: flex-start !important;
      padding-top: 0.75rem !important;
      padding-bottom: 0.75rem !important;
    }

    main > header h2,
    .topbar h2 {
      font-size: 1rem !important;
      line-height: 1.35 !important;
    }

    main > header a,
    main > header button,
    .topbar a,
    .topbar button {
      white-space: nowrap;
    }
  }
`;
document.head.appendChild(responsiveStyle);

const backdrop = document.createElement("button");
backdrop.type = "button";
backdrop.className = "smartquote-sidebar-backdrop";
backdrop.setAttribute("aria-label", "Close navigation");
document.body.appendChild(backdrop);

const firstHeader = document.querySelector("main > header, .topbar");
if (firstHeader) {
  const menuButton = document.createElement("button");
  menuButton.type = "button";
  menuButton.className = "smartquote-menu-toggle";
  menuButton.setAttribute("aria-label", "Open navigation");
  menuButton.innerHTML = `<i data-lucide="menu" class="w-5 h-5"></i>`;
  firstHeader.prepend(menuButton);
  menuButton.addEventListener("click", () => {
    document.body.classList.toggle("smartquote-sidebar-open");
  });
}

backdrop.addEventListener("click", () => {
  document.body.classList.remove("smartquote-sidebar-open");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.body.classList.remove("smartquote-sidebar-open");
  }
});

document.getElementById("sidebar")?.addEventListener("click", (event) => {
  const link = event.target.closest?.("a");
  if (link) {
    document.body.classList.remove("smartquote-sidebar-open");
  }
});

if (!isAdmin) {
  document.querySelectorAll("[data-admin-only]").forEach((element) => {
    element.hidden = true;
  });
}

document.getElementById("adminLogout")?.addEventListener("click", async () => {
  try {
    await fetch("/api/admin/logout", { method: "POST" });
  } finally {
    window.localStorage.setItem("zabermanUserRole", "basic");
    window.location.assign("index.html");
  }
});

if (isAdmin) {
  fetch("/api/admin/session")
    .then((response) => response.ok ? response.json() : { isAdmin: false })
    .then((session) => {
      if (!session.isAdmin) {
        window.localStorage.setItem("zabermanUserRole", "basic");
        window.location.reload();
      }
    })
    .catch(() => {});
}

if (window.lucide) {
  lucide.createIcons();
}
