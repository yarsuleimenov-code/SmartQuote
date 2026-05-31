(function () {
  const key = "zaberman-calculator-draft";
  const estimateSnapshotKey = "zaberman-estimate-snapshot";

  window.CalculatorStorage = {
    save(draft) {
      const snapshot = {
        ...draft,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(snapshot));
      return true;
    },
    load() {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },
    clear() {
      localStorage.removeItem(key);
    },
    saveEstimateSnapshot(snapshot) {
      localStorage.setItem(estimateSnapshotKey, JSON.stringify(snapshot));
      return true;
    },
    loadEstimateSnapshot() {
      const raw = localStorage.getItem(estimateSnapshotKey);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },
    clearEstimateSnapshot() {
      localStorage.removeItem(estimateSnapshotKey);
    },
  };
})();
