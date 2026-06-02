const fs = require("fs");
const vm = require("vm");

function createLocalStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

function loadAdapter({ endpoint = "", fetchImpl }) {
  const localStorage = createLocalStorage();
  const window = {
    localStorage,
    PRICING_ADMIN_SCRIPT_URL: endpoint,
    ZabermanConfig: {
      pricingAdmin: {
        enabled: Boolean(endpoint),
        endpoint,
      },
    },
  };
  const context = {
    window,
    console,
    localStorage,
    fetch: fetchImpl,
  };
  context.window.window = context.window;
  vm.createContext(context);

  [
    "js/variables.js",
    "js/pricingConfig.js",
    "js/pricingAdminStorage.js",
  ].forEach((file) => {
    vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  });

  return { context, localStorage };
}

function buildVersionRecord(context, status) {
  const snapshot = context.window.PricingConfig.snapshot();
  return {
    variablesVersion: snapshot.variablesVersion,
    formulaVersion: snapshot.formulaVersion,
    status,
    updatedAt: snapshot.updatedAt,
    updatedBy: snapshot.updatedBy,
    changeNotes: snapshot.changeNotes,
    variablesSnapshot: snapshot,
  };
}

function assertLocalSave(localStorage, minVersions, minLogs) {
  const versions = JSON.parse(localStorage.getItem("variablesVersions"));
  const logs = JSON.parse(localStorage.getItem("calculationLogs"));

  if (!Array.isArray(versions) || versions.length < minVersions) {
    throw new Error(`Expected at least ${minVersions} local variablesVersions record(s).`);
  }

  if (!Array.isArray(logs) || logs.length < minLogs) {
    throw new Error(`Expected at least ${minLogs} local audit log record(s).`);
  }

  return { versions, logs };
}

async function testEmptyEndpointMode() {
  const { context, localStorage } = loadAdapter({
    endpoint: "",
    fetchImpl: async () => {
      throw new Error("Fetch should not be called when PRICING_ADMIN_SCRIPT_URL is empty.");
    },
  });

  if (context.window.PricingAdminStorage.isRemoteConfigured()) {
    throw new Error("Expected Pricing Admin remote endpoint to be disabled in empty endpoint mode.");
  }

  const saveResult = await context.window.PricingAdminStorage.saveVariablesVersion(
    buildVersionRecord(context, "empty-endpoint-smoke"),
  );

  if (!saveResult.success || !saveResult.local) {
    throw new Error("Expected local Pricing Admin save to succeed in empty endpoint mode.");
  }

  if (!saveResult.remote?.skipped || saveResult.remote.success) {
    throw new Error("Expected remote save to be skipped gracefully in empty endpoint mode.");
  }

  const { versions, logs } = assertLocalSave(localStorage, 2, 1);
  return {
    remoteConfigured: context.window.PricingAdminStorage.isRemoteConfigured(),
    remoteSkipped: saveResult.remote.skipped,
    variablesVersions: versions.length,
    auditLogs: logs.length,
  };
}

async function testConfiguredEndpointMode() {
  const endpoint = "https://example.test/pricing-admin";
  const fetchCalls = [];
  const { context, localStorage } = loadAdapter({
    endpoint,
    fetchImpl: async (url, options) => {
      fetchCalls.push({ url, options });
      return {
        status: 200,
        async text() {
          return JSON.stringify({ success: true, saved: true });
        },
      };
    },
  });

  if (!context.window.PricingAdminStorage.isRemoteConfigured()) {
    throw new Error("Expected Pricing Admin remote endpoint to be enabled in configured endpoint mode.");
  }

  const saveResult = await context.window.PricingAdminStorage.saveVariablesVersion(
    buildVersionRecord(context, "configured-endpoint-smoke"),
  );

  if (!saveResult.success || !saveResult.local) {
    throw new Error("Expected local Pricing Admin save to succeed in configured endpoint mode.");
  }

  if (!saveResult.remote?.success) {
    throw new Error("Expected remote save to succeed in configured endpoint mode.");
  }

  if (fetchCalls.length !== 1) {
    throw new Error(`Expected exactly one mocked fetch call, got ${fetchCalls.length}.`);
  }

  const call = fetchCalls[0];
  if (call.url !== endpoint) {
    throw new Error("Expected mocked fetch to use configured Pricing Admin endpoint.");
  }

  const body = JSON.parse(call.options.body);
  if (body.action !== "save_variables_version") {
    throw new Error("Expected remote action save_variables_version.");
  }

  const { versions, logs } = assertLocalSave(localStorage, 2, 1);
  return {
    remoteConfigured: context.window.PricingAdminStorage.isRemoteConfigured(),
    remoteSuccess: saveResult.remote.success,
    fetchCalls: fetchCalls.length,
    variablesVersions: versions.length,
    auditLogs: logs.length,
  };
}

(async () => {
  const emptyEndpoint = await testEmptyEndpointMode();
  const configuredEndpoint = await testConfiguredEndpointMode();

  console.log(JSON.stringify({
    emptyEndpoint,
    configuredEndpoint,
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
