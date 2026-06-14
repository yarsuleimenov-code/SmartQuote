(function () {
  // Demo/reference item templates used by References and Quick Quote. Values are not SKU-specific measurements.
  const catalog = [
    { id: "custom", label: "Custom", name: "", category: "Custom", length: 0, width: 0, height: 0, weight: 0, packaging: "Blanket Wrap", flags: "Standard", active: true },
    { id: "sofa", label: "Sofa", name: "Sofa", category: "Furniture", length: 84, width: 36, height: 34, weight: 180, packaging: "Blanket Wrap", flags: "Standard", active: true },
    { id: "loveseat", label: "Loveseat", name: "Loveseat", category: "Furniture", length: 60, width: 35, height: 34, weight: 120, packaging: "Blanket Wrap", flags: "Standard", active: true },
    { id: "dining-table", label: "Dining Table", name: "Dining Table", category: "Furniture", length: 72, width: 40, height: 30, weight: 220, packaging: "Blanket Wrap", flags: "May require 2 people", active: true },
    { id: "coffee-table", label: "Coffee Table", name: "Coffee Table", category: "Furniture", length: 48, width: 24, height: 18, weight: 70, packaging: "Blanket Wrap", flags: "Standard", active: true },
    { id: "dresser", label: "Dresser", name: "Dresser", category: "Furniture", length: 58, width: 20, height: 36, weight: 160, packaging: "Blanket Wrap", flags: "Heavy", active: true },
    { id: "nightstand", label: "Nightstand", name: "Nightstand", category: "Furniture", length: 24, width: 18, height: 28, weight: 45, packaging: "Blanket Wrap", flags: "Standard", active: true },
    { id: "queen-mattress", label: "Queen Mattress", name: "Queen Mattress", category: "Bedding", length: 80, width: 60, height: 12, weight: 100, packaging: "None", flags: "Bulky", active: true },
    { id: "king-mattress", label: "King Mattress", name: "King Mattress", category: "Bedding", length: 80, width: 76, height: 12, weight: 130, packaging: "None", flags: "Bulky", active: true },
    { id: "tv-monitor", label: "TV / Monitor", name: "TV / Monitor", category: "Electronics", length: 55, width: 6, height: 32, weight: 45, packaging: "TV / Monitor Box", flags: "Fragile", active: true },
    { id: "floor-lamp", label: "Floor Lamp", name: "Floor Lamp", category: "Decor", length: 16, width: 16, height: 60, weight: 20, packaging: "Bubble Protection", flags: "Fragile", active: true },
  ];

  window.ReferenceItemCatalog = {
    all() {
      return catalog.map((item) => ({ ...item }));
    },
    active() {
      return catalog.filter((item) => item.active).map((item) => ({ ...item }));
    },
    byId(id) {
      const item = catalog.find((entry) => entry.id === id);
      return item ? { ...item } : null;
    },
  };
})();
