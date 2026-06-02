const fs = require("fs");
const vm = require("vm");

function loadContext() {
  const store = new Map();
  const localStorage = {
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
  const context = {
    window: { localStorage },
    console,
    localStorage,
  };
  context.window.window = context.window;
  vm.createContext(context);

  [
    "js/zoneZipMap.js",
    "js/variables.js",
    "js/pricingConfig.js",
    "js/mockData.js",
    "js/calculator.js",
  ].forEach((file) => {
    vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  });

  return context;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function setFuel(context, fuelType, currentAvg, fuelSurchargePct) {
  const fuelPrices = JSON.parse(context.localStorage.getItem("fuelPrices"));
  const fuel = fuelPrices.find((entry) => entry.fuelType === fuelType);
  if (!fuel) throw new Error(`Missing fuel type ${fuelType}`);
  fuel.currentAvg = currentAvg;
  fuel.fuelSurchargePct = fuelSurchargePct;
  fuel.internalFuelPrice = currentAvg * (1 + fuelSurchargePct / 100);
  context.localStorage.setItem("fuelPrices", JSON.stringify(fuelPrices));
}

function buildQuote(context, vehicleName, fuelType) {
  const quote = clone(context.window.CalculatorBlankQuote);
  const vehicle = context.window.CalculatorVariables.vehicleTypes.find((entry) => entry.name === vehicleName);
  if (!vehicle) throw new Error(`Missing vehicle ${vehicleName}`);
  vehicle.fuelType = fuelType;
  context.window.CalculatorVariables.settings.interstateVehicleName = vehicleName;

  quote.route = {
    pickupZip: "90021",
    deliveryZip: "94601",
    pickupAddress: "",
    deliveryAddress: "",
  };
  quote.access = {
    pickup: { addressType: "House", coi: false, stairs: false, elevatorUnavailable: false, narrowAccess: false, floor: 1, longCarryFt: 0, crew: 2 },
    delivery: { addressType: "House", coi: false, stairs: false, elevatorUnavailable: false, narrowAccess: false, floor: 1, longCarryFt: 0, crew: 2 },
  };
  quote.items = [{
    id: "fuel-test-item",
    name: `${fuelType} fuel test`,
    length: 85,
    width: 63,
    height: 47,
    weight: 150,
    qty: 1,
    packaging: "Custom Crate",
    insurance: "Basic Liability",
    declaredValue: 0,
    storageDays: 0,
    fragile: false,
    nonStackable: false,
    crated: false,
    comment: "",
  }];
  return quote;
}

function calculate(context, quote) {
  return context.window.PricingCalculator.calculateQuote(quote);
}

const dieselContext = loadContext();
const dieselQuote = buildQuote(dieselContext, "Penske 26 ft", "Diesel");
const dieselBaseline = calculate(dieselContext, dieselQuote);
setFuel(dieselContext, "Diesel", 8, 10);
const dieselHigherCurrentAvg = calculate(dieselContext, dieselQuote);
setFuel(dieselContext, "Diesel", 8, 40);
const dieselHigherSurcharge = calculate(dieselContext, dieselQuote);

if (dieselHigherCurrentAvg.totals.finalPrice <= dieselBaseline.totals.finalPrice) {
  throw new Error("Expected Diesel currentAvg increase to increase final quote.");
}

if (dieselHigherSurcharge.totals.finalPrice <= dieselHigherCurrentAvg.totals.finalPrice) {
  throw new Error("Expected Diesel fuelSurchargePct increase to increase final quote.");
}

const regularContext = loadContext();
const regularQuote = buildQuote(regularContext, "Box truck 16 ft", "Regular");
const regularBaseline = calculate(regularContext, regularQuote);
setFuel(regularContext, "Regular", 8, 10);
const regularHigherCurrentAvg = calculate(regularContext, regularQuote);
setFuel(regularContext, "Regular", 8, 40);
const regularHigherSurcharge = calculate(regularContext, regularQuote);

if (regularHigherCurrentAvg.totals.finalPrice <= regularBaseline.totals.finalPrice) {
  throw new Error("Expected Regular currentAvg increase to increase final quote.");
}

if (regularHigherSurcharge.totals.finalPrice <= regularHigherCurrentAvg.totals.finalPrice) {
  throw new Error("Expected Regular fuelSurchargePct increase to increase final quote.");
}

const blankContext = loadContext();
const blankResult = calculate(blankContext, clone(blankContext.window.CalculatorBlankQuote));
if (blankResult.totals.finalPrice !== 0 || blankResult.items.length !== 0) {
  throw new Error("Expected blank quote to remain zero after fuel pricing changes.");
}

console.log(JSON.stringify({
  diesel: {
    baselineFinalPrice: dieselBaseline.totals.finalPrice,
    higherCurrentAvgFinalPrice: dieselHigherCurrentAvg.totals.finalPrice,
    higherSurchargeFinalPrice: dieselHigherSurcharge.totals.finalPrice,
  },
  regular: {
    baselineFinalPrice: regularBaseline.totals.finalPrice,
    higherCurrentAvgFinalPrice: regularHigherCurrentAvg.totals.finalPrice,
    higherSurchargeFinalPrice: regularHigherSurcharge.totals.finalPrice,
  },
  blankFinalPrice: blankResult.totals.finalPrice,
}, null, 2));
