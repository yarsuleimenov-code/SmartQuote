(function () {
  window.PRICING_ADMIN_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwXmpzrsjWWDj3wsrhQIOApk6ukj3lqCrjQ5uMgEFaGXPXRbyng4Vw-zPM4JF-JiENWHQ/exec";

  window.ZabermanConfig = {
    environment: "production",
    googleSheets: {
      enabled: true,
      endpoint: "/api/sheets/save",
    },
    pricingAdmin: {
      enabled: true,
      endpoint: window.PRICING_ADMIN_SCRIPT_URL,
    },
  };
})();
