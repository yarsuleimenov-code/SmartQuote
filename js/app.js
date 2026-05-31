(function () {
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const app = window.CalculatorUI.createApp({
      initialQuote: clone(window.CalculatorBlankQuote),
      calculateQuote: window.PricingCalculator.calculateQuote,
      storage: window.CalculatorStorage,
      sheet: window.GoogleSheetIntegration,
    });
    app.init();
  });
})();
