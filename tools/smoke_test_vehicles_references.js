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

function loadContext({ withLocalStorage = true } = {}) {
  const localStorage = createLocalStorage();
  const context = {
    window: withLocalStorage ? { localStorage } : {},
    console,
  };
  context.window.window = context.window;
  if (withLocalStorage) context.localStorage = localStorage;
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

  return { context, localStorage };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function blankQuote(context) {
  return clone(context.window.CalculatorBlankQuote);
}

const { context, localStorage } = loadContext();
const pricingConfig = context.window.PricingConfig;
const vehicles = pricingConfig.readVehicles();

const sprinter = vehicles.find((vehicle) => vehicle.vehicleId === "sprinter-488");
const box16 = vehicles.find((vehicle) => vehicle.vehicleId === "box-truck-16");
const enterprise = vehicles.find((vehicle) => vehicle.vehicleId === "enterprise-26");

assert(vehicles.length >= 5, "Expected seeded vehicle list to include at least five vehicles.");
assert(sprinter?.fuelType === "Diesel", "Expected Sprinter 488 to use Diesel.");
assert(box16?.fuelType === "Regular", "Expected Box truck 16 ft to be a real Regular vehicle.");
assert(enterprise?.vehicleName === "Enterprise 26 ft", "Expected Enterprise 26 ft seed vehicle.");
assert(box16.volume === box16.capacityCuFt && box16.payload === box16.maxWeightLb, "Expected legacy volume/payload compatibility fields.");

const editedVehicles = vehicles.map((vehicle) => (
  vehicle.vehicleId === "box-truck-16"
    ? { ...vehicle, mpg: 15, fuelType: "Diesel" }
    : vehicle
));
pricingConfig.saveVehicles(editedVehicles);
const editedBox16 = pricingConfig.readVehicles().find((vehicle) => vehicle.vehicleId === "box-truck-16");
assert(editedBox16.mpg === 15, "Expected edited MPG to persist.");
assert(editedBox16.fuelType === "Diesel", "Expected edited fuelType to persist.");

const deactivatedVehicles = pricingConfig.readVehicles().map((vehicle) => (
  vehicle.vehicleId === "sprinter-488" ? { ...vehicle, active: false } : vehicle
));
pricingConfig.saveVehicles(deactivatedVehicles);
const activeVehicles = pricingConfig.getActiveVehicles();
assert(!activeVehicles.some((vehicle) => vehicle.vehicleId === "sprinter-488"), "Expected active vehicles to exclude deactivated Sprinter.");
assert(pricingConfig.readVehicles().some((vehicle) => vehicle.vehicleId === "sprinter-488" && vehicle.active === false), "Expected deactivated vehicle to remain stored.");

const quote = clone(context.window.CalculatorMockData);
const result = context.window.PricingCalculator.calculateQuote(quote);
assert(result.totals.finalPrice > 0, "Expected calculation to work after vehicle normalization.");

const blankResult = context.window.PricingCalculator.calculateQuote(blankQuote(context));
assert(blankResult.totals.finalPrice === 0, "Expected blank quote to remain zero.");

const fallback = loadContext({ withLocalStorage: false }).context.window.PricingConfig.readVehicles();
assert(fallback.length >= 5, "Expected vehicle fallback to work without localStorage.");

const storedVehicles = JSON.parse(localStorage.getItem("vehicles"));
assert(Array.isArray(storedVehicles) && storedVehicles.length >= 5, "Expected vehicles localStorage bucket to persist canonical vehicles.");

console.log(JSON.stringify({
  seededVehicles: vehicles.length,
  boxTruck16FuelType: box16.fuelType,
  sprinterFuelType: sprinter.fuelType,
  activeAfterDeactivate: activeVehicles.length,
  editedBoxTruck16: {
    mpg: editedBox16.mpg,
    fuelType: editedBox16.fuelType,
  },
  fallbackVehicleCount: fallback.length,
  calculationFinalPrice: result.totals.finalPrice,
  blankFinalPrice: blankResult.totals.finalPrice,
}, null, 2));
