(function () {
  const backupVersion = 1;
  const appCheckpoint = "82525477f0b873d56b38669bc8678729b2dd0821";
  const preImportBackupKey = "zaberman-storage-preimport-backup";
  const backupMetaKey = "zaberman-storage-backup-meta";

  const storageKeys = [
    "currentVariables",
    "variablesVersions",
    "vehicles",
    "vehiclesSeedVersion",
    "fuelPrices",
    "drafts",
    "estimates",
    "calculationLogs",
    "zaberman-pricing-config",
    "zaberman-calculator-draft",
    "zaberman-calculator-drafts",
    "zaberman-current-draft-id",
    "zaberman-estimate-snapshot",
    "zaberman-estimate-snapshots",
    "zaberman-current-estimate-id",
  ];

  const jsonKeys = new Set([
    "currentVariables",
    "variablesVersions",
    "vehicles",
    "fuelPrices",
    "drafts",
    "estimates",
    "calculationLogs",
    "zaberman-pricing-config",
    "zaberman-calculator-draft",
    "zaberman-calculator-drafts",
    "zaberman-estimate-snapshot",
    "zaberman-estimate-snapshots",
  ]);

  function canUseLocalStorage() {
    try {
      return Boolean(window.localStorage);
    } catch {
      return false;
    }
  }

  function readRaw(key) {
    if (!canUseLocalStorage()) return null;
    return window.localStorage.getItem(key);
  }

  function writeRaw(key, value) {
    if (!canUseLocalStorage()) return false;
    if (value === null || value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, String(value));
    return true;
  }

  function parseJson(raw) {
    if (!raw) return { ok: true, value: null };
    try {
      return { ok: true, value: JSON.parse(raw) };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  function createBackupObject(reason = "manual-export") {
    const storage = {};
    storageKeys.forEach((key) => {
      const raw = readRaw(key);
      if (raw !== null) storage[key] = raw;
    });

    return {
      backupVersion,
      exportedAt: new Date().toISOString(),
      appCheckpoint,
      reason,
      storage,
    };
  }

  function validateBackup(backup) {
    if (!backup || typeof backup !== "object" || Array.isArray(backup)) {
      return { valid: false, error: "Backup must be a JSON object." };
    }
    if (backup.backupVersion !== backupVersion) {
      return { valid: false, error: `Unsupported backupVersion: ${backup.backupVersion || "missing"}.` };
    }
    if (!backup.storage || typeof backup.storage !== "object" || Array.isArray(backup.storage)) {
      return { valid: false, error: "Backup storage payload is missing or invalid." };
    }

    const unknownKeys = Object.keys(backup.storage).filter((key) => !storageKeys.includes(key));
    if (unknownKeys.length) {
      return { valid: false, error: `Backup contains unsupported storage keys: ${unknownKeys.join(", ")}.` };
    }

    const corruptedKeys = [];
    Object.entries(backup.storage).forEach(([key, raw]) => {
      if (raw !== null && raw !== undefined && typeof raw !== "string") corruptedKeys.push(key);
      if (jsonKeys.has(key) && raw) {
        const parsed = parseJson(raw);
        if (!parsed.ok) corruptedKeys.push(key);
      }
    });
    if (corruptedKeys.length) {
      return { valid: false, error: `Backup contains invalid JSON for: ${Array.from(new Set(corruptedKeys)).join(", ")}.` };
    }

    return { valid: true, keyCount: Object.keys(backup.storage).length };
  }

  function exportBackup() {
    const backup = createBackupObject();
    const json = JSON.stringify(backup, null, 2);
    if (typeof document !== "undefined" && typeof Blob !== "undefined" && typeof URL !== "undefined") {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const datePart = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `smartquote-backup-${datePart}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }
    writeRaw(backupMetaKey, JSON.stringify({ lastExportAt: backup.exportedAt, keyCount: Object.keys(backup.storage).length }));
    return backup;
  }

  function importBackup(backup) {
    const validation = validateBackup(backup);
    if (!validation.valid) return { success: false, error: validation.error };

    const preImport = createBackupObject("pre-import");
    writeRaw(preImportBackupKey, JSON.stringify(preImport));

    Object.entries(backup.storage).forEach(([key, raw]) => {
      writeRaw(key, raw);
    });

    const importedAt = new Date().toISOString();
    writeRaw(backupMetaKey, JSON.stringify({
      lastExportAt: parseJson(readRaw(backupMetaKey)).value?.lastExportAt || null,
      lastImportAt: importedAt,
      importedKeyCount: Object.keys(backup.storage).length,
      preImportBackupAt: preImport.exportedAt,
    }));
    return { success: true, importedAt, keyCount: Object.keys(backup.storage).length, preImportBackupAt: preImport.exportedAt };
  }

  function importBackupText(text) {
    let backup;
    try {
      backup = JSON.parse(text);
    } catch {
      return { success: false, error: "Backup file is not valid JSON." };
    }
    return importBackup(backup);
  }

  function storageHealth() {
    const corrupted = [];
    const present = [];
    storageKeys.forEach((key) => {
      const raw = readRaw(key);
      if (raw === null) return;
      present.push(key);
      if (jsonKeys.has(key) && !parseJson(raw).ok) corrupted.push(key);
    });
    const meta = parseJson(readRaw(backupMetaKey)).value || {};
    return { present, corrupted, meta };
  }

  function statusMessage(root, message, type = "info") {
    const target = root.querySelector("[data-storage-backup-status]");
    if (!target) return;
    const classes = {
      info: "text-slate-600",
      success: "text-emerald-700",
      warning: "text-amber-700",
      error: "text-red-700",
    };
    target.className = `text-xs font-semibold ${classes[type] || classes.info}`;
    target.textContent = message;
  }

  function renderBackupPanel(root) {
    if (!root) return;
    const health = storageHealth();
    const meta = health.meta || {};
    const warning = health.corrupted.length
      ? `<p class="mt-2 text-xs text-red-700">Corrupted storage detected: ${health.corrupted.join(", ")}. Export current data before making changes.</p>`
      : "";
    root.innerHTML = `
      <section class="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 class="font-bold text-slate-800">Storage / Backup</h3>
            <p class="text-sm text-slate-500 mt-1">Drafts and estimates are stored in this browser. Export a backup before clearing browser data or switching devices.</p>
            <p class="mt-2 text-xs text-slate-400">Stored keys: ${health.present.length}. Last export: ${meta.lastExportAt || "Never"}. Last import: ${meta.lastImportAt || "Never"}.</p>
            ${warning}
          </div>
          <div class="flex items-center gap-2">
            <button type="button" data-export-backup class="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900">Export Backup</button>
            <label class="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer">
              Import Backup
              <input type="file" accept="application/json,.json" data-import-backup class="hidden" />
            </label>
          </div>
        </div>
        <p data-storage-backup-status class="mt-3 text-xs font-semibold text-slate-600">Backup is local to this browser. Invalid imports are rejected before data is changed.</p>
      </section>
    `;

    root.querySelector("[data-export-backup]")?.addEventListener("click", () => {
      const backup = exportBackup();
      statusMessage(root, `Backup exported with ${Object.keys(backup.storage).length} storage keys.`, "success");
    });

    root.querySelector("[data-import-backup]")?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = importBackupText(String(reader.result || ""));
        if (result.success) {
          statusMessage(root, `Backup imported. ${result.keyCount} keys restored. Reload the page to refresh lists.`, "success");
          setTimeout(() => window.location.reload(), 800);
        } else {
          statusMessage(root, result.error, "error");
        }
      };
      reader.readAsText(file);
      event.target.value = "";
    });
  }

  window.StorageBackup = {
    backupVersion,
    appCheckpoint,
    storageKeys,
    preImportBackupKey,
    backupMetaKey,
    createBackupObject,
    validateBackup,
    exportBackup,
    importBackup,
    importBackupText,
    storageHealth,
    renderBackupPanel,
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      renderBackupPanel(document.getElementById("storageBackupRoot"));
    });
  }
})();
