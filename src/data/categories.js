export const CATEGORIES = [
  { id: "candle", label: "Candle Making", tagline: "Wax, wicks & fragrance", hasCalculator: true },
  { id: "resin", label: "Resin Art", tagline: "Epoxy, molds & pours", hasCalculator: true },
  { id: "crochet", label: "Crochet", tagline: "Yarn, hooks & patterns", hasCalculator: true },
  { id: "pipe-cleaner", label: "Pipe Cleaner Art", tagline: "Wire, fuzz & figures", hasCalculator: false },
  { id: "clay", label: "Clay Art", tagline: "Sculpting, glazing & kilns", hasCalculator: false },
];

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export const BASE_TABS = [
  { key: "analytics", label: "Analytics" },
  { key: "calculator", label: "Calculator", requiresCalculator: true },
  { key: "stores", label: "Store Locator" },
  { key: "artists", label: "Similar Artists" },
  { key: "tutorials", label: "Tutorials" },
  { key: "history", label: "Chat History" },
];

export function getTabsForCategory(category) {
  return BASE_TABS.filter((t) => !t.requiresCalculator || category.hasCalculator);
}