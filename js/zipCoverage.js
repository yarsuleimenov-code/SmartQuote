(function () {
  const storageKey = "zaberman-zip-coverage-overrides";
  const defaultPriceCoefficient = 1;
  const validStatuses = new Set(["covered", "disabled", "approval_required"]);
  const coverageByZip = new Map(
    (window.CoverageZipData?.records || []).map((record) => [record.zip, record]),
  );

  function readOverrides() {
    try {
      const parsed = JSON.parse(window.localStorage?.getItem(storageKey) || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  function normalizeZip(zip) {
    return String(zip || "").replace(/\D/g, "").slice(0, 5);
  }

  function coverageRecord(zip) {
    const normalizedZip = normalizeZip(zip);
    return coverageByZip.get(normalizedZip) || null;
  }

  function get(zip) {
    const normalizedZip = normalizeZip(zip);
    const record = coverageRecord(normalizedZip);
    const saved = readOverrides()[normalizedZip] || {};
    return {
      zip: normalizedZip,
      region: record?.region || "",
      zone: record?.zone || "",
      inCoverageDataset: Boolean(record),
      coverageStatus: validStatuses.has(saved.coverageStatus) ? saved.coverageStatus : "covered",
      priceCoefficient: Number.isFinite(Number(saved.priceCoefficient))
        ? Number(saved.priceCoefficient)
        : defaultPriceCoefficient,
    };
  }

  window.ZipCoverage = {
    storageKey,
    defaultPriceCoefficient,
    get,
    readOverrides,
  };
})();
