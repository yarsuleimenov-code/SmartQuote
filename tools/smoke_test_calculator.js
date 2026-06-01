const fs = require("fs");
const vm = require("vm");

const context = {
  window: {},
  console,
};
context.window.window = context.window;
vm.createContext(context);

[
  "js/zoneZipMap.js",
  "js/variables.js",
  "js/mockData.js",
  "js/calculator.js",
  "js/googleSheet.js",
].forEach((file) => {
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
});

const quote = JSON.parse(JSON.stringify(context.window.CalculatorMockData));
const result = context.window.PricingCalculator.calculateQuote(quote);
const payload = context.window.GoogleSheetIntegration.buildPayload(quote, result);
const blankQuote = JSON.parse(JSON.stringify(context.window.CalculatorBlankQuote));
const blankResult = context.window.PricingCalculator.calculateQuote(blankQuote);
const emptyQuote = JSON.parse(JSON.stringify(context.window.CalculatorMockData));
emptyQuote.items = [{
  id: "empty",
  name: "",
  length: 0,
  width: 0,
  height: 0,
  weight: 0,
  qty: 1,
  packaging: "None",
  insurance: "Basic Liability",
  declaredValue: 0,
  storageDays: 0,
  fragile: false,
  nonStackable: false,
  crated: false,
  comment: "",
}];
const emptyResult = context.window.PricingCalculator.calculateQuote(emptyQuote);
const nameOnlyQuote = JSON.parse(JSON.stringify(context.window.CalculatorMockData));
nameOnlyQuote.access = {
  pickup: { addressType: "House", coi: false, stairs: false, elevatorUnavailable: false, narrowAccess: false, floor: 1, longCarryFt: 0 },
  delivery: { addressType: "House", coi: false, stairs: false, elevatorUnavailable: false, narrowAccess: false, floor: 1, longCarryFt: 0 },
};
nameOnlyQuote.items = [{
  id: "name-only",
  name: "d",
  length: 0,
  width: 0,
  height: 0,
  weight: 0,
  qty: 1,
  packaging: "Custom Crate",
  insurance: "Full Coverage",
  declaredValue: 0,
  storageDays: 0,
  fragile: false,
  nonStackable: false,
  crated: false,
  comment: "",
}];
const nameOnlyResult = context.window.PricingCalculator.calculateQuote(nameOnlyQuote);

const excelTableQuote = JSON.parse(JSON.stringify(context.window.CalculatorMockData));
excelTableQuote.access = {
  pickup: { addressType: "House", coi: false, stairs: false, elevatorUnavailable: false, narrowAccess: false, floor: 1, longCarryFt: 0 },
  delivery: { addressType: "House", coi: false, stairs: false, elevatorUnavailable: false, narrowAccess: false, floor: 1, longCarryFt: 0 },
};
excelTableQuote.items = [{
  id: "excel-table",
  name: "Table",
  length: 140,
  width: 50,
  height: 20,
  weight: 500,
  qty: 1,
  packaging: "None",
  insurance: "Basic Liability",
  declaredValue: 0,
  storageDays: 0,
  fragile: false,
  nonStackable: false,
  crated: false,
  comment: "",
}];
const excelTableResult = context.window.PricingCalculator.calculateQuote(excelTableQuote);

const onePersonBookshelfQuote = JSON.parse(JSON.stringify(context.window.CalculatorBlankQuote));
onePersonBookshelfQuote.route = {
  pickupZip: "95827",
  deliveryZip: "11385",
  pickupAddress: "",
  deliveryAddress: "",
};
onePersonBookshelfQuote.access = {
  pickup: { addressType: "House", coi: false, stairs: false, elevatorUnavailable: false, narrowAccess: false, floor: 1, longCarryFt: 0, crew: 1 },
  delivery: { addressType: "House", coi: false, stairs: false, elevatorUnavailable: false, narrowAccess: false, floor: 1, longCarryFt: 0, crew: 1 },
};
onePersonBookshelfQuote.items = [{
  id: "one-person-bookshelf",
  name: "Bookshelf",
  length: 37,
  width: 52,
  height: 15,
  weight: 51,
  qty: 1,
  packaging: "Bubble Protection",
  insurance: "Basic Liability",
  declaredValue: 0,
  storageDays: 0,
  fragile: false,
  nonStackable: false,
  crated: false,
  comment: "",
}];
const onePersonBookshelfResult = context.window.PricingCalculator.calculateQuote(onePersonBookshelfQuote);
const quickTwoPersonBookshelfQuote = JSON.parse(JSON.stringify(onePersonBookshelfQuote));
quickTwoPersonBookshelfQuote.access.pickup.crew = 2;
quickTwoPersonBookshelfQuote.access.delivery.crew = 2;
const quickTwoPersonBookshelfResult = context.window.PricingCalculator.calculateQuote(quickTwoPersonBookshelfQuote);
const quickRoundedVolumeQuote = JSON.parse(JSON.stringify(quickTwoPersonBookshelfQuote));
quickRoundedVolumeQuote.items[0].length = Math.ceil(16.7) * 12;
quickRoundedVolumeQuote.items[0].width = 12;
quickRoundedVolumeQuote.items[0].height = 12;
quickRoundedVolumeQuote.items[0].weight = 51;
const quickRoundedVolumeResult = context.window.PricingCalculator.calculateQuote(quickRoundedVolumeQuote);

const caSouthNorthBedQuote = JSON.parse(JSON.stringify(context.window.CalculatorBlankQuote));
caSouthNorthBedQuote.route = {
  pickupZip: "90021",
  deliveryZip: "94601",
  pickupAddress: "",
  deliveryAddress: "",
};
caSouthNorthBedQuote.access = {
  pickup: { addressType: "House", coi: false, stairs: false, elevatorUnavailable: false, narrowAccess: false, floor: 1, longCarryFt: 0, crew: 2 },
  delivery: { addressType: "House", coi: false, stairs: false, elevatorUnavailable: false, narrowAccess: false, floor: 1, longCarryFt: 0, crew: 2 },
};
caSouthNorthBedQuote.items = [{
  id: "ca-south-north-bed",
  name: "Bed",
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
const caSouthNorthBedResult = context.window.PricingCalculator.calculateQuote(caSouthNorthBedQuote);

if (!result.routeSupported) {
  throw new Error("Expected demo route to be supported by ZIP map.");
}

if (!result.totals.finalPrice || result.totals.finalPrice <= 0) {
  throw new Error("Expected final price to be positive.");
}

if (!payload.items_json && (!payload.items || !payload.items.length)) {
  throw new Error("Expected payload items to be present.");
}

if (blankResult.totals.finalPrice !== 0 || blankResult.items.length !== 0) {
  throw new Error(`Expected blank initial quote to be zero, got ${blankResult.totals.finalPrice}.`);
}

if (emptyResult.totals.finalPrice !== 0 || emptyResult.totals.operationalCost !== 0) {
  throw new Error(`Expected empty item quote to be zero, got ${emptyResult.totals.finalPrice}.`);
}

if (nameOnlyResult.totals.finalPrice !== 0 || nameOnlyResult.totals.operationalCost !== 0) {
  throw new Error(`Expected name-only item quote to be zero, got ${nameOnlyResult.totals.finalPrice}.`);
}

if (excelTableResult.totals.finalPrice !== 1140) {
  throw new Error(`Expected Excel table benchmark to be 1140, got ${excelTableResult.totals.finalPrice}.`);
}

if (onePersonBookshelfResult.totals.finalPrice !== 320) {
  throw new Error(`Expected one-person bookshelf benchmark to be 320, got ${onePersonBookshelfResult.totals.finalPrice}.`);
}

if (quickTwoPersonBookshelfResult.crew.pickup !== 2 || quickTwoPersonBookshelfResult.crew.delivery !== 2) {
  throw new Error("Expected quick quote benchmark to use 2-person pickup and delivery crews.");
}

if (quickTwoPersonBookshelfResult.totals.finalPrice <= onePersonBookshelfResult.totals.finalPrice) {
  throw new Error("Expected 2-person quick quote benchmark to be higher than the 1-person benchmark.");
}

if (quickRoundedVolumeResult.totals.totalVolume !== 17) {
  throw new Error(`Expected Quick Quote 16.7 cu ft to round up to 17 cu ft, got ${quickRoundedVolumeResult.totals.totalVolume}.`);
}

if (onePersonBookshelfResult.items[0].effectiveVolume !== 17) {
  throw new Error(`Expected fractional effective volume to round up to 17 cu ft, got ${onePersonBookshelfResult.items[0].effectiveVolume}.`);
}

if (caSouthNorthBedResult.totals.finalPrice !== 850) {
  throw new Error(`Expected CA South -> CA North bed benchmark to stay 850, got ${caSouthNorthBedResult.totals.finalPrice}.`);
}

if (caSouthNorthBedResult.totals.packaging <= 0 || caSouthNorthBedResult.totals.additionalCharges !== 0) {
  throw new Error("Expected packaging to be tracked without changing confirmed additional charges benchmark.");
}

console.log(JSON.stringify({
  route: `${result.pickupZone} -> ${result.deliveryZone}`,
  distance: result.distance,
  finalPrice: result.totals.finalPrice,
  blankFinalPrice: blankResult.totals.finalPrice,
  emptyFinalPrice: emptyResult.totals.finalPrice,
  nameOnlyFinalPrice: nameOnlyResult.totals.finalPrice,
  excelTableFinalPrice: excelTableResult.totals.finalPrice,
  excelTableOperationalCost: excelTableResult.totals.operationalCost,
  onePersonBookshelfFinalPrice: onePersonBookshelfResult.totals.finalPrice,
  onePersonBookshelfCrew: onePersonBookshelfResult.crew,
  quickTwoPersonBookshelfFinalPrice: quickTwoPersonBookshelfResult.totals.finalPrice,
  quickTwoPersonBookshelfCrew: quickTwoPersonBookshelfResult.crew,
  quickRoundedVolume: quickRoundedVolumeResult.totals.totalVolume,
  quickRoundedVolumeFinalPrice: quickRoundedVolumeResult.totals.finalPrice,
  caSouthNorthBedFinalPrice: caSouthNorthBedResult.totals.finalPrice,
  itemCount: result.items.length,
}, null, 2));
