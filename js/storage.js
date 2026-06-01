(function () {
  const key = "zaberman-calculator-draft";
  const estimateSnapshotKey = "zaberman-estimate-snapshot";
  const draftsKey = "zaberman-calculator-drafts";
  const currentDraftKey = "zaberman-current-draft-id";
  const estimateSnapshotsKey = "zaberman-estimate-snapshots";
  const currentEstimateKey = "zaberman-current-estimate-id";

  function readJson(storageKey, fallback) {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function writeJson(storageKey, value) {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }

  function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  function createDisplayId(prefix) {
    const now = new Date();
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("");
    const time = [
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
      String(now.getSeconds()).padStart(2, "0"),
    ].join("");
    return `${prefix}-${date}-${time}-${Math.floor(Math.random() * 900 + 100)}`;
  }

  function isPlaceholderId(value) {
    return !value || ["QQ-NEW", "EST-NEW", "EST-291"].includes(value);
  }

  function normalizeDrafts() {
    const drafts = readJson(draftsKey, []);
    if (drafts.length) return drafts;
    const legacy = readJson(key, null);
    if (!legacy) return [];
    const migrated = { ...legacy, localId: legacy.localId || createId("draft") };
    writeJson(draftsKey, [migrated]);
    localStorage.setItem(currentDraftKey, migrated.localId);
    localStorage.setItem(key, JSON.stringify(migrated));
    return [migrated];
  }

  function normalizeEstimates() {
    const snapshots = readJson(estimateSnapshotsKey, []);
    if (snapshots.length) return snapshots;
    const legacy = readJson(estimateSnapshotKey, null);
    if (!legacy) return [];
    const migrated = { ...legacy, snapshotId: legacy.snapshotId || createId("estimate") };
    writeJson(estimateSnapshotsKey, [migrated]);
    localStorage.setItem(currentEstimateKey, migrated.snapshotId);
    localStorage.setItem(estimateSnapshotKey, JSON.stringify(migrated));
    return [migrated];
  }

  window.CalculatorStorage = {
    save(draft) {
      const estimateId = isPlaceholderId(draft.estimateId) ? createDisplayId("DRAFT") : draft.estimateId;
      const snapshot = {
        ...draft,
        estimateId,
        localId: draft.localId || createId("draft"),
        updatedAt: new Date().toISOString(),
      };
      draft.localId = snapshot.localId;
      draft.estimateId = snapshot.estimateId;

      const drafts = normalizeDrafts();
      const index = drafts.findIndex((entry) => entry.localId === snapshot.localId);
      if (index >= 0) {
        drafts[index] = snapshot;
      } else {
        drafts.unshift(snapshot);
      }

      writeJson(draftsKey, drafts);
      localStorage.setItem(currentDraftKey, snapshot.localId);
      localStorage.setItem(key, JSON.stringify(snapshot));
      return true;
    },
    load(id) {
      const drafts = normalizeDrafts();
      const targetId = id || localStorage.getItem(currentDraftKey);
      return drafts.find((draft) => draft.localId === targetId) || drafts[0] || null;
    },
    listDrafts() {
      return normalizeDrafts().sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
    },
    selectDraft(id) {
      const draft = this.load(id);
      if (!draft) return null;
      localStorage.setItem(currentDraftKey, draft.localId);
      localStorage.setItem(key, JSON.stringify(draft));
      return draft;
    },
    clear() {
      localStorage.removeItem(key);
      localStorage.removeItem(currentDraftKey);
    },
    deleteDraft(id) {
      const drafts = normalizeDrafts().filter((draft) => draft.localId !== id);
      writeJson(draftsKey, drafts);
      if (localStorage.getItem(currentDraftKey) !== id) return;
      const next = drafts[0] || null;
      if (next) {
        localStorage.setItem(currentDraftKey, next.localId);
        localStorage.setItem(key, JSON.stringify(next));
      } else {
        this.clear();
      }
    },
    saveEstimateSnapshot(snapshot) {
      const estimateId = isPlaceholderId(snapshot.estimateId || snapshot.quote?.estimateId)
        ? createDisplayId("EST")
        : snapshot.estimateId || snapshot.quote?.estimateId;
      const saved = {
        ...snapshot,
        estimateId,
        quote: snapshot.quote ? { ...snapshot.quote, estimateId } : snapshot.quote,
        snapshotId: snapshot.snapshotId || createId("estimate"),
      };

      const snapshots = normalizeEstimates();
      const index = snapshots.findIndex((entry) => entry.snapshotId === saved.snapshotId);
      if (index >= 0) {
        snapshots[index] = saved;
      } else {
        snapshots.unshift(saved);
      }

      writeJson(estimateSnapshotsKey, snapshots);
      localStorage.setItem(currentEstimateKey, saved.snapshotId);
      localStorage.setItem(estimateSnapshotKey, JSON.stringify(saved));
      return true;
    },
    loadEstimateSnapshot(id) {
      const snapshots = normalizeEstimates();
      const targetId = id || localStorage.getItem(currentEstimateKey);
      return snapshots.find((snapshot) => snapshot.snapshotId === targetId) || snapshots[0] || null;
    },
    listEstimateSnapshots() {
      return normalizeEstimates().sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    },
    selectEstimateSnapshot(id) {
      const snapshot = this.loadEstimateSnapshot(id);
      if (!snapshot) return null;
      localStorage.setItem(currentEstimateKey, snapshot.snapshotId);
      localStorage.setItem(estimateSnapshotKey, JSON.stringify(snapshot));
      return snapshot;
    },
    clearEstimateSnapshot() {
      localStorage.removeItem(estimateSnapshotKey);
      localStorage.removeItem(currentEstimateKey);
    },
    deleteEstimateSnapshot(id) {
      const snapshots = normalizeEstimates().filter((snapshot) => snapshot.snapshotId !== id);
      writeJson(estimateSnapshotsKey, snapshots);
      if (localStorage.getItem(currentEstimateKey) !== id) return;
      const next = snapshots[0] || null;
      if (next) {
        localStorage.setItem(currentEstimateKey, next.snapshotId);
        localStorage.setItem(estimateSnapshotKey, JSON.stringify(next));
      } else {
        this.clearEstimateSnapshot();
      }
    },
  };
})();
