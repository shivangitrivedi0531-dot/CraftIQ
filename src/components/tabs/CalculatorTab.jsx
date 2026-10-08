import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DUMMY_CALCULATOR_MATERIALS } from "../../data/dummyData";

// Category options for manual testing & URL switching
const CATEGORY_MAP = {
  resin: { id: "resin", label: "Resin Art", icon: "🧪", subtitle: "Epoxy, Molds & Pours" },
  candle: { id: "candle", label: "Candle Making", icon: "🕯️", subtitle: "Waxes, Wicks & Fragrances" },
  crochet: { id: "crochet", label: "Crochet & Yarn", icon: "🧶", subtitle: "Yarns, Hooks & Needlecraft" },
  clay: { id: "clay", label: "Clay Sculpting", icon: "🏺", subtitle: "Polymer, Air-Dry & Modeling" },
  "pipe-cleaner": { id: "pipe-cleaner", label: "Pipe Cleaner", icon: "🌸", subtitle: "Chenille Stems & Floral Wire" }
};

// Category-calibrated real-time fallback intelligence
const FALLBACK_ADVICE = {
  resin: {
    categoryLabel: "Resin Art",
    materialRates: { primaryMaterialPerUnit: 950, unitLabel: "₹ per 1kg kit (A+B)", consumablesEst: 50 },
    recommendedMarkup: 2.8,
    wastageBufferPercent: 8,
    marketPricePerUnit: "₹450 - ₹2,500 (Coaster set to Clock)",
    craftTips: [
      "Always add 7% to 10% extra resin for cup cling and mixing stick loss (standard epoxy resin formula).",
      "For deep casting (>2 cm), use 3:1 slow-cure resin to avoid micro-bubble trapping and thermal flash curing.",
      "Coasters & trays require 2:1 high-gloss scratch-resistant resin for crystal clear, bubble-free cure."
    ],
    pricingInsight: "Artisan coasters sell at ₹550–₹750 for sets of 2, offering a 65%+ net profit margin on Instagram."
  },
  candle: {
    categoryLabel: "Candle Making",
    materialRates: { primaryMaterialPerUnit: 320, unitLabel: "₹ per kg Soy Wax", consumablesEst: 45 },
    recommendedMarkup: 2.6,
    wastageBufferPercent: 5,
    marketPricePerUnit: "₹380 - ₹850 per scented jar",
    craftTips: [
      "Calculate wax weight as container water capacity × 0.86 (soy wax density factor).",
      "Optimal fragrance load is 8% to 10% for soy wax to maximize cold & hot scent throw without sweat oil pools.",
      "For 70mm diameter jars, use #30 ply cotton or booster wooden wicks to ensure an even melt pool."
    ],
    pricingInsight: "Scented glass jar candles priced at ₹499 yield ₹280+ gross profit per jar with high repeat purchase."
  },
  crochet: {
    categoryLabel: "Crochet & Yarn",
    materialRates: { primaryMaterialPerUnit: 180, unitLabel: "₹ per 100g Cotton Yarn", consumablesEst: 40 },
    recommendedMarkup: 2.4,
    wastageBufferPercent: 10,
    marketPricePerUnit: "₹450 - ₹1,800 (Plushie vs Tote bag)",
    craftTips: [
      "Always include labor cost! Standard craft wage in India is ₹120–₹180 per hour.",
      "Formula: (Total Materials × 1.2) + (Hours × Hourly Rate) = Wholesale; Retail = Wholesale × 1.6.",
      "Chenille amigurumi plushies command premium prices (₹600–₹1,200) with fast 2-3 hour crochet turnaround."
    ],
    pricingInsight: "Custom amigurumi keychains and bags yield 55% profit margin with high festive gifting demand."
  },
  clay: {
    categoryLabel: "Clay Sculpting",
    materialRates: { primaryMaterialPerUnit: 95, unitLabel: "₹ per 57g Polymer Block", consumablesEst: 35 },
    recommendedMarkup: 3.0,
    wastageBufferPercent: 6,
    marketPricePerUnit: "₹280 - ₹750 per pair/dish",
    craftTips: [
      "Bake polymer clay at 110°C–130°C for 30 mins per 6mm thickness to prevent brittle breakage.",
      "Apply UV resin or polyurethane glaze coat on earrings to double durability and perceived value.",
      "Dangle earrings only use 8–15g of polymer clay, yielding 4–6 pairs per single 57g block!"
    ],
    pricingInsight: "Polymer clay statement earrings have ultra-low material cost (~₹50) and retail at ₹350–₹550."
  },
  "pipe-cleaner": {
    categoryLabel: "Pipe Cleaner",
    materialRates: { primaryMaterialPerUnit: 65, unitLabel: "₹ per 100-pack Chenille Stems", consumablesEst: 30 },
    recommendedMarkup: 3.2,
    wastageBufferPercent: 5,
    marketPricePerUnit: "₹350 - ₹1,200 per bouquet",
    craftTips: [
      "A standard 5-tulip bouquet requires ~45 chenille stems (9 stems per tulip + 2 per leaf).",
      "Use 30cm florist stems and gradient pastel pipe cleaners for modern Korean aesthetic bouquets.",
      "Chenille bouquets never wilt, giving sellers strong appeal for birthday, anniversary & graduation gifts."
    ],
    pricingInsight: "A 5-flower bouquet material cost is ~₹110, retailing easily at ₹499–₹699."
  }
};

// Presets for Resin Calculator (Dimensions: Length/Width/Diam in inches, Depth in mm)
const RESIN_PRESETS = [
  { name: "Custom Shape", shape: "rectangle", length: 6, width: 6, depth: 10, diam: 6, ratio: "2:1", technique: "casting" },
  { name: "4\" Coaster (Round)", shape: "circle", diam: 4, depth: 8, ratio: "2:1", technique: "casting" },
  { name: "12\" Geode Clock (Round)", shape: "circle", diam: 12, depth: 10, ratio: "2:1", technique: "layered" },
  { name: "Serving Tray (12\" x 8\")", shape: "rectangle", length: 12, width: 8, depth: 15, ratio: "2:1", technique: "casting" },
  { name: "Bookmark (5.5\" x 1.5\")", shape: "rectangle", length: 5.5, width: 1.5, depth: 3, ratio: "2:1", technique: "coating" },
  { name: "Ocean Beach Board (14\" x 7\")", shape: "rectangle", length: 14, width: 7, depth: 6, ratio: "2:1", technique: "coating" },
  { name: "Deep Pour River Block (16\" x 10\")", shape: "rectangle", length: 16, width: 10, depth: 35, ratio: "3:1", technique: "deep_cast" }
];

// Presets for Candle Calculator
const CANDLE_PRESETS = [
  { name: "Custom Vessel", capacity: 150, diam: 65, wax: "soy", fragLoad: 8 },
  { name: "100ml Amber Jar", capacity: 100, diam: 55, wax: "soy", fragLoad: 8 },
  { name: "200ml Frosted Jar", capacity: 200, diam: 72, wax: "soy", fragLoad: 8 },
  { name: "250ml Luxury Ceramic", capacity: 250, diam: 80, wax: "coconut_soy", fragLoad: 10 },
  { name: "Bubble Cube Mold", capacity: 150, diam: 60, wax: "beeswax", fragLoad: 6 }
];

// Presets for Crochet Calculator
const CROCHET_PRESETS = [
  { name: "Custom Project", skeins: 2, yarnCost: 180, yarnType: "cotton", hours: 4, extras: 50 },
  { name: "Amigurumi Plushie", skeins: 1.5, yarnCost: 180, yarnType: "chenille", hours: 3.5, extras: 60 },
  { name: "Boho Tote Bag", skeins: 3.5, yarnCost: 160, yarnType: "cotton", hours: 7, extras: 120 },
  { name: "Granny Square Blanket", skeins: 8, yarnCost: 150, yarnType: "acrylic", hours: 22, extras: 40 },
  { name: "Coaster Set (4 pcs)", skeins: 0.8, yarnCost: 180, yarnType: "cotton", hours: 1.5, extras: 20 }
];

export default function CalculatorTab({ category }) {
  // ---------------------------------------------------------------------------
  // Category URL synchronization & Props handling
  // ---------------------------------------------------------------------------
  const getInitialCategory = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const queryCat = urlParams.get("category");
      if (queryCat && CATEGORY_MAP[queryCat.toLowerCase()]) {
        return queryCat.toLowerCase();
      }
    }
    if (typeof category === "object" && category?.id) return category.id.toLowerCase();
    if (typeof category === "string" && CATEGORY_MAP[category.toLowerCase()]) return category.toLowerCase();
    return "resin";
  };

  const [activeCategory, setActiveCategory] = useState(getInitialCategory);
  const [activeMode, setActiveMode] = useState("smart"); // "smart" (Specialized) or "itemized" (Existing feature)
  
  // Gemini AI real-time advice state
  const [geminiAdvice, setGeminiAdvice] = useState(FALLBACK_ADVICE[activeCategory] || FALLBACK_ADVICE["resin"]);
  const [isLiveGemini, setIsLiveGemini] = useState(false);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Sync category with URL and browser history
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const queryCat = urlParams.get("category");
      if (queryCat && CATEGORY_MAP[queryCat.toLowerCase()]) {
        setActiveCategory(queryCat.toLowerCase());
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleCategorySwitch = (newCat) => {
    setActiveCategory(newCat);
    if (typeof window !== "undefined") {
      const newUrl = `${window.location.pathname}?category=${newCat}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
  };

  // Fetch real-time Gemini AI pricing intelligence
  const fetchAdvice = async (catId) => {
    setLoadingAdvice(true);
    const endpoints = [
      `http://localhost:8001/api/calculator/advice/${catId}`,
      `http://localhost:8000/api/calculator/advice/${catId}`
    ];

    let fetched = false;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setGeminiAdvice(json.data);
            setIsLiveGemini(Boolean(json.isLive));
            fetched = true;
            break;
          }
        }
      } catch {
        // try next endpoint
      }
    }

    if (!fetched) {
      // Graceful fallback to calibrated craft intelligence
      setGeminiAdvice(FALLBACK_ADVICE[catId] || FALLBACK_ADVICE["resin"]);
      setIsLiveGemini(false);
    }
    setLoadingAdvice(false);
  };

  useEffect(() => {
    fetchAdvice(activeCategory);
  }, [activeCategory]);

  // ---------------------------------------------------------------------------
  // 1. RESIN CALCULATOR STATE
  // ---------------------------------------------------------------------------
  const [resinPreset, setResinPreset] = useState("Custom Shape");
  const [resinShape, setResinShape] = useState("rectangle"); // rectangle, circle
  const [resinLength, setResinLength] = useState(6); // inches
  const [resinWidth, setResinWidth] = useState(6); // inches
  const [resinDepth, setResinDepth] = useState(10); // millimeters (mm)
  const [resinDiameter, setResinDiameter] = useState(6); // inches
  const [resinRatio, setResinRatio] = useState("2:1"); // 2:1, 3:1, 1:1
  const [resinTechnique, setResinTechnique] = useState("casting"); // casting, coating, layered, deep_cast
  const [resinWastage, setResinWastage] = useState(8); // 8% cup cling buffer (recommended standard)
  const [resinBatch, setResinBatch] = useState(1);
  // Resin price is entered by user (not assumed, since resin prices differ widely)
  const [resinCostPerKg, setResinCostPerKg] = useState("");
  const [resinPigmentsCost, setResinPigmentsCost] = useState(40);
  const [resinMoldCost, setResinMoldCost] = useState(30);
  // Labor price is manual: entered by user only (starts at 0 / empty)
  const [resinLaborPrice, setResinLaborPrice] = useState("");

  // Apply Resin Preset
  const handleResinPresetChange = (name) => {
    setResinPreset(name);
    const p = RESIN_PRESETS.find(item => item.name === name);
    if (!p) return;
    setResinShape(p.shape);
    if (p.shape === "rectangle") {
      setResinLength(p.length);
      setResinWidth(p.width);
      setResinDepth(p.depth);
    } else {
      setResinDiameter(p.diam);
      setResinDepth(p.depth);
    }
    if (p.ratio) setResinRatio(p.ratio);
    if (p.technique) setResinTechnique(p.technique);
  };

  // Compute Resin Formula:
  // Length & Width in inches -> converted to cm (1 in = 2.54 cm)
  // Depth in millimeters -> converted to cm (1 mm = 0.1 cm)
  const depthMm = parseFloat(resinDepth) || 0;
  const depthCm = Math.max(0.01, depthMm * 0.1);
  let volumeCm3 = 0;
  if (resinShape === "circle") {
    const diamInches = parseFloat(resinDiameter) || 0;
    const diamCm = Math.max(0.1, diamInches * 2.54);
    const radiusCm = diamCm / 2;
    volumeCm3 = Math.PI * Math.pow(radiusCm, 2) * depthCm;
  } else {
    const lenInches = parseFloat(resinLength) || 0;
    const widInches = parseFloat(resinWidth) || 0;
    const lenCm = Math.max(0.1, lenInches * 2.54);
    const widCm = Math.max(0.1, widInches * 2.54);
    volumeCm3 = lenCm * widCm * depthCm;
  }

  // Standard Epoxy Resin density = 1.13 g/cm3
  const density = 1.13;
  const wastageMultiplier = 1 + (resinWastage / 100);
  const singleResinGrams = Math.round(volumeCm3 * density * wastageMultiplier * 10) / 10;
  const singleResinMl = Math.round(volumeCm3 * wastageMultiplier * 10) / 10;

  // Batch calculations
  const totalResinGrams = Math.round(singleResinGrams * resinBatch);
  let resinPartA = 0;
  let resinPartB = 0;
  if (resinRatio === "3:1") {
    resinPartA = Math.round(totalResinGrams * 0.75);
    resinPartB = Math.round(totalResinGrams * 0.25);
  } else if (resinRatio === "1:1") {
    resinPartA = Math.round(totalResinGrams * 0.5);
    resinPartB = Math.round(totalResinGrams * 0.5);
  } else {
    // 2:1 ratio
    resinPartA = Math.round(totalResinGrams * (2 / 3));
    resinPartB = Math.round(totalResinGrams * (1 / 3));
  }

  // Costing: Resin price is entered by user (not assumed). Labor is also manual.
  const costPerKgNum = parseFloat(resinCostPerKg) || 0;
  const hasResinCost = costPerKgNum > 0;
  const rawResinCost = hasResinCost ? Math.round((totalResinGrams / 1000) * costPerKgNum) : 0;
  const totalMaterialCost = Math.round(rawResinCost + (resinPigmentsCost * resinBatch) + (resinMoldCost * resinBatch));
  const totalLaborCost = parseFloat(resinLaborPrice) || 0;
  const totalProductionCost = totalMaterialCost + totalLaborCost;
  const suggestedSellingPrice = hasResinCost ? Math.round(totalProductionCost * 2.8) : 0;
  const wholesalePrice = hasResinCost ? Math.round(totalProductionCost * 1.6) : 0;
  const netProfit = hasResinCost ? suggestedSellingPrice - totalProductionCost : 0;
  const profitMarginPercent = suggestedSellingPrice > 0 ? Math.round((netProfit / suggestedSellingPrice) * 100) : 0;

  // ---------------------------------------------------------------------------
  // 2. CANDLE CALCULATOR STATE
  // ---------------------------------------------------------------------------
  const [candlePreset, setCandlePreset] = useState("200ml Frosted Jar");
  const [candleCapacity, setCandleCapacity] = useState(200); // ml of water
  const [candleDiam, setCandleDiam] = useState(72); // mm
  const [candleBatch, setCandleBatch] = useState(3);
  const [candleWaxType, setCandleWaxType] = useState("soy"); // soy, beeswax, paraffin, coconut_soy
  const [candleFragLoad, setCandleFragLoad] = useState(8); // %
  const [candleWaxRate, setCandleWaxRate] = useState(320); // ₹ per kg
  const [candleFragRate, setCandleFragRate] = useState(380); // ₹ per 100ml
  const [candleJarCost, setCandleJarCost] = useState(45); // ₹ per pc
  const [candleWickCost, setCandleWickCost] = useState(18); // ₹ per pc
  const [candleLaborHours, setCandleLaborHours] = useState(1.0);
  const [candleHourlyWage, setCandleHourlyWage] = useState(150);

  // Apply Candle Preset
  const handleCandlePresetChange = (name) => {
    setCandlePreset(name);
    const p = CANDLE_PRESETS.find(i => i.name === name);
    if (!p) return;
    setCandleCapacity(p.capacity);
    setCandleDiam(p.diam);
    setCandleWaxType(p.wax);
    setCandleFragLoad(p.fragLoad);
  };

  // Candle Math
  const waxDensity = candleWaxType === "beeswax" ? 0.90 : candleWaxType === "paraffin" ? 0.80 : candleWaxType === "coconut_soy" ? 0.84 : 0.86;
  const singleWaxGrams = Math.round(candleCapacity * waxDensity);
  const singleFragGrams = Math.round(singleWaxGrams * (candleFragLoad / 100));
  const totalWaxGrams = singleWaxGrams * candleBatch;
  const totalFragGrams = singleFragGrams * candleBatch;
  
  // Wick Recommendation based on diameter
  const wickRecommendation = candleDiam < 55 ? "Cotton #18 / #24 Ply" : candleDiam < 72 ? "Cotton #30 or Single Wood Wick" : candleDiam < 85 ? "Booster Wood Wick or Cotton #36" : "Double Cotton Wicks (#24 x 2)";

  // Candle Costing
  const candleWaxCostTotal = Math.round((totalWaxGrams / 1000) * candleWaxRate);
  const candleFragCostTotal = Math.round((totalFragGrams / 100) * candleFragRate);
  const candleContainersTotal = (candleJarCost + candleWickCost) * candleBatch;
  const candleMaterialsTotal = candleWaxCostTotal + candleFragCostTotal + candleContainersTotal;
  const candleLaborTotal = Math.round(candleLaborHours * candleHourlyWage);
  const candleTotalCost = candleMaterialsTotal + candleLaborTotal;
  const candleUnitPrice = Math.round((candleTotalCost * 2.6) / candleBatch);
  const candleSuggestedTotal = candleUnitPrice * candleBatch;
  const candleProfit = candleSuggestedTotal - candleTotalCost;

  // ---------------------------------------------------------------------------
  // 3. CROCHET CALCULATOR STATE
  // ---------------------------------------------------------------------------
  const [crochetPreset, setCrochetPreset] = useState("Amigurumi Plushie");
  const [crochetSkeins, setCrochetSkeins] = useState(1.5);
  const [crochetYarnCost, setCrochetYarnCost] = useState(180);
  const [crochetYarnType, setCrochetYarnType] = useState("chenille");
  const [crochetExtrasCost, setCrochetExtrasCost] = useState(60); // eyes, stuffing, keyring
  const [crochetHours, setCrochetHours] = useState(3.5);
  const [crochetHourlyWage, setCrochetHourlyWage] = useState(150);
  const [crochetBatch, setCrochetBatch] = useState(1);

  const handleCrochetPresetChange = (name) => {
    setCrochetPreset(name);
    const p = CROCHET_PRESETS.find(i => i.name === name);
    if (!p) return;
    setCrochetSkeins(p.skeins);
    setCrochetYarnCost(p.yarnCost);
    setCrochetYarnType(p.yarnType);
    setCrochetHours(p.hours);
    setCrochetExtrasCost(p.extras);
  };

  const crochetMaterialsTotal = Math.round(((crochetSkeins * crochetYarnCost) + crochetExtrasCost) * crochetBatch);
  const crochetLaborTotal = Math.round(crochetHours * crochetHourlyWage * crochetBatch);
  const crochetTotalCost = crochetMaterialsTotal + crochetLaborTotal;
  const crochetWholesale = Math.round(crochetTotalCost * 1.5);
  const crochetRetail = Math.round(crochetTotalCost * 2.4);
  const crochetProfit = crochetRetail - crochetTotalCost;

  // ---------------------------------------------------------------------------
  // 4. CLAY CALCULATOR STATE
  // ---------------------------------------------------------------------------
  const [clayBlocks, setClayBlocks] = useState(1); // 57g blocks
  const [clayBlockCost, setClayBlockCost] = useState(95);
  const [clayFindingsCost, setClayFindingsCost] = useState(40); // hooks, jump rings
  const [clayBakingHours, setClayBakingHours] = useState(1.5);
  const [clayHourlyWage, setClayHourlyWage] = useState(150);
  const [clayBatchPairs, setClayBatchPairs] = useState(4); // e.g. 4 pairs of earrings from 1 block

  const clayMaterialsTotal = Math.round((clayBlocks * clayBlockCost) + clayFindingsCost);
  const clayLaborTotal = Math.round(clayBakingHours * clayHourlyWage);
  const clayTotalCost = clayMaterialsTotal + clayLaborTotal;
  const claySuggestedTotal = Math.round(clayTotalCost * 3.0);
  const clayUnitRetail = Math.round(claySuggestedTotal / Math.max(1, clayBatchPairs));
  const clayProfit = claySuggestedTotal - clayTotalCost;

  // ---------------------------------------------------------------------------
  // 5. PIPE CLEANER CALCULATOR STATE
  // ---------------------------------------------------------------------------
  const [flowerCount, setFlowerCount] = useState(5);
  const [stemsPerFlower, setStemsPerFlower] = useState(9);
  const [stemPackCost, setStemPackCost] = useState(65); // 100 pack
  const [wrappingCost, setWrappingCost] = useState(60); // floral tape, wire, paper
  const [pipeLaborHours, setPipeLaborHours] = useState(1.2);
  const [pipeHourlyWage, setPipeHourlyWage] = useState(150);

  const totalStemsNeeded = Math.round(flowerCount * stemsPerFlower);
  const packsNeeded = Math.ceil(totalStemsNeeded / 100);
  const pipeMaterialsTotal = Math.round((packsNeeded * stemPackCost) + wrappingCost);
  const pipeLaborTotal = Math.round(pipeLaborHours * pipeHourlyWage);
  const pipeTotalCost = pipeMaterialsTotal + pipeLaborTotal;
  const pipeRetail = Math.round(pipeTotalCost * 3.2);
  const pipeProfit = pipeRetail - pipeTotalCost;

  // ---------------------------------------------------------------------------
  // 6. ITEMIZED MATERIALS CHECKLIST (Existing Feature Preserved & Enhanced)
  // ---------------------------------------------------------------------------
  const rawDefaultMaterials = DUMMY_CALCULATOR_MATERIALS[activeCategory] || DUMMY_CALCULATOR_MATERIALS["resin"] || [];
  const [itemizedQuantities, setItemizedQuantities] = useState({});
  const [customItems, setCustomItems] = useState([]);
  const [newCustomName, setNewCustomName] = useState("");
  const [newCustomCost, setNewCustomCost] = useState("");

  const handleItemizedQtyChange = (idx, val) => {
    setItemizedQuantities(prev => ({ ...prev, [idx]: val }));
  };

  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (!newCustomName.trim()) return;
    const cost = parseFloat(newCustomCost) || 0;
    setCustomItems([...customItems, { name: newCustomName.trim(), cost }]);
    setNewCustomName("");
    setNewCustomCost("");
  };

  const handleClearItemized = () => {
    setItemizedQuantities({});
    setCustomItems([]);
  };

  const itemizedMaterialsList = [...rawDefaultMaterials, ...customItems];
  const itemizedTotalMaterialCost = itemizedMaterialsList.reduce((sum, item, idx) => {
    const qty = parseFloat(itemizedQuantities[idx]) || 0;
    return sum + (item.cost * qty);
  }, 0);
  const itemizedSuggestedPrice = Math.round(itemizedTotalMaterialCost * 2.5);
  const itemizedProfit = itemizedSuggestedPrice - itemizedTotalMaterialCost;

  // Quick action: Apply Gemini live material rate to calculator
  const applyGeminiMaterialRate = () => {
    if (!geminiAdvice?.materialRates?.primaryMaterialPerUnit) return;
    const rate = geminiAdvice.materialRates.primaryMaterialPerUnit;
    if (activeCategory === "resin") setResinCostPerKg(rate);
    else if (activeCategory === "candle") setCandleWaxRate(rate);
    else if (activeCategory === "crochet") setCrochetYarnCost(rate);
    else if (activeCategory === "clay") setClayBlockCost(rate);
    else if (activeCategory === "pipe-cleaner") setStemPackCost(rate);
  };

  // Copy formal costing quote
  const handleCopyQuote = () => {
    let quote = `CRAFTIQ ARTISAN COSTING QUOTE\nCategory: ${CATEGORY_MAP[activeCategory]?.label || activeCategory}\n`;
    if (activeCategory === "resin") {
      quote += `Item: ${resinPreset}\nDimensions: ${resinShape === "circle" ? `Ø ${resinDiameter}" x ${resinDepth}mm` : `${resinLength}" x ${resinWidth}" x ${resinDepth}mm`}\nResin Needed: ${totalResinGrams}g (Part A: ${resinPartA}g, Part B: ${resinPartB}g)\n${hasResinCost ? `Resin Rate: ₹${costPerKgNum}/kg\n` : ""}Material Cost: ₹${totalMaterialCost}\nLabor Cost: ₹${totalLaborCost}\nSuggested Retail Price: ₹${suggestedSellingPrice} (Net Margin: ₹${netProfit})\n`;
    } else if (activeCategory === "candle") {
      quote += `Item: ${candlePreset} (${candleCapacity}ml)\nWax Needed: ${totalWaxGrams}g | Fragrance: ${totalFragGrams}g\nWick: ${wickRecommendation}\nBatch Cost: ₹${candleTotalCost} (₹${Math.round(candleTotalCost/candleBatch)}/pc)\nSuggested Selling Price: ₹${candleSuggestedTotal} (₹${candleUnitPrice}/pc)\n`;
    } else if (activeCategory === "crochet") {
      quote += `Project: ${crochetPreset}\nYarn: ${crochetSkeins} skeins (${crochetYarnType})\nMaterial: ₹${crochetMaterialsTotal} | Labor (${crochetHours}h): ₹${crochetLaborTotal}\nSuggested Retail Price: ₹${crochetRetail}\n`;
    } else {
      quote += `Total Material: ₹${itemizedTotalMaterialCost}\nSuggested Retail: ₹${itemizedSuggestedPrice}\n`;
    }
    quote += `\nGenerated via CraftIQ AI Assistant`;
    navigator.clipboard?.writeText(quote);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);
  };

  const catMeta = CATEGORY_MAP[activeCategory] || CATEGORY_MAP["resin"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-slate-800">
      {/* ------------------------------------------------------------------- */}
      {/* TOP HERO BANNER (Matches Analytics page design & color scheme)      */}
      {/* ------------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFF4EE] via-[#FDF1F3] to-[#FCEEE8] border border-[#F5DDD5] p-6 md:p-8 shadow-sm"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-200 via-orange-100 to-transparent"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#A84A38]">
                SMART PRODUCTION & PRICING ENGINE
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                isLiveGemini
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-amber-100 text-amber-800 border-amber-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveGemini ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
                {isLiveGemini ? "Gemini AI Live Rates" : "Grounded Craft Engine"}
              </span>
            </div>

            <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#4A151B]">
              CraftIQ Calculator
            </h1>

            <p className="text-base md:text-lg text-[#6E2A20] font-medium">
              Precise formulas & pricing benchmarks for your <strong className="text-[#A84A38]">{catMeta.label}</strong>
            </p>

            <p className="text-xs md:text-sm text-[#8C5D53] max-w-xl">
              Modeled after professional craft studio calculators & artisan pricing standards. Calculate exact volumes, Part A/B ratios, cup cling buffers & profitable selling prices.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopyQuote}
                className="px-5 py-2.5 bg-[#A84A38] hover:bg-[#8F3C2C] active:scale-95 text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center gap-2"
              >
                <span>{copiedQuote ? "✓ Copied to Clipboard!" : "📋 Copy Costing Quote"}</span>
              </button>

              <button
                type="button"
                onClick={() => fetchAdvice(activeCategory)}
                disabled={loadingAdvice}
                className="px-4 py-2.5 bg-white/80 hover:bg-white text-[#742A2A] rounded-xl text-xs font-semibold border border-[#E9D2CA] shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>{loadingAdvice ? "⏳" : "🔄"}</span>
                <span>{loadingAdvice ? "Querying Gemini..." : "Refresh Live Rates"}</span>
              </button>

              {/* Mode Toggle Button */}
              <div className="flex bg-[#F5DDD5]/50 p-1 rounded-xl border border-[#E9D2CA]">
                <button
                  type="button"
                  onClick={() => setActiveMode("smart")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeMode === "smart"
                      ? "bg-white text-[#A84A38] shadow-sm"
                      : "text-[#8C5D53] hover:text-[#4A151B]"
                  }`}
                >
                  ⚡ Smart Formula
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode("itemized")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeMode === "itemized"
                      ? "bg-white text-[#A84A38] shadow-sm"
                      : "text-[#8C5D53] hover:text-[#4A151B]"
                  }`}
                >
                  📦 Itemized Checklist
                </button>
              </div>
            </div>
          </div>

          {/* Category Switcher Pill Header (Matching Analytics tab) */}
          <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-white shadow-sm space-y-2.5 max-w-sm">
            <div className="flex items-center justify-between border-b border-rose-100 pb-2">
              <span className="text-[11px] font-bold text-[#A84A38] uppercase tracking-wider">
                Select Category ({catMeta.label})
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                {activeMode === "smart" ? "Formula Mode" : "Checklist Mode"}
              </span>
            </div>

            <p className="text-xs text-[#7A4B42] italic">
              "Tailored formulas for {catMeta.label} makers"
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {Object.values(CATEGORY_MAP).map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCategorySwitch(c.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                    activeCategory === c.id
                      ? "bg-[#A84A38] text-white shadow-sm scale-105"
                      : "bg-[#F7EBE5] text-[#742A2A] hover:bg-[#EED9D1]"
                  }`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------------- */}
      {/* GEMINI AI REAL-TIME INTELLIGENCE BAR                                */}
      {/* ------------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 border border-[#F3E8E2] shadow-[0_2px_10px_rgba(180,120,100,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-start md:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-xl shrink-0">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A84A38]">
                Gemini Market Intelligence
              </span>
              <span className="text-[11px] bg-rose-50 text-rose-700 font-medium px-2 py-0.5 rounded-full border border-rose-200">
                {catMeta.label}
              </span>
            </div>
            <p className="text-xs text-[#6E2A20] font-medium mt-0.5">
              Current Raw Material Benchmark:{" "}
              <strong>₹{geminiAdvice.materialRates?.primaryMaterialPerUnit || 950}</strong>{" "}
              <span className="text-[#8C5D53]">({geminiAdvice.materialRates?.unitLabel || "standard"})</span> | Recommended Markup:{" "}
              <strong className="text-emerald-700">{geminiAdvice.recommendedMarkup || 2.8}x</strong>
            </p>
            <p className="text-[11px] text-[#8C5D53] italic mt-0.5">
              💡 {geminiAdvice.pricingInsight || "Accurate pricing ensures sustainable craft business growth."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={applyGeminiMaterialRate}
          className="self-start md:self-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FFF4EE] text-[#A84A38] hover:bg-[#FCEEE8] border border-[#F5DDD5] transition-all whitespace-nowrap flex items-center gap-1.5"
        >
          <span>⚡ Apply Gemini Rate (₹{geminiAdvice.materialRates?.primaryMaterialPerUnit})</span>
        </button>
      </motion.div>

      {/* =================================================================== */}
      {/* MODE 1: SPECIALIZED SMART RECIPE CALCULATOR                          */}
      {/* =================================================================== */}
      <AnimatePresence mode="wait">
        {activeMode === "smart" && (
          <motion.div
            key={`smart-${activeCategory}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* ------------------------------------------------------------- */}
            {/* A. RESIN ART CALCULATOR                                       */}
            {/* ------------------------------------------------------------- */}
            {activeCategory === "resin" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 cols: Controls & Inputs */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Preset Selector */}
                  <div className="bg-white rounded-2xl p-6 border border-[#F3E8E2] shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-lg text-[#4A151B] flex items-center gap-2">
                        <span>🧪</span> Epoxy Resin Mold & Pour Estimator
                      </h3>
                      <span className="text-[11px] bg-rose-50 text-[#A84A38] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                        Formula: L × W × D × 1.13 + 8%
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#8C6B64] block mb-2">
                        Quick Project Presets:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {RESIN_PRESETS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => handleResinPresetChange(p.name)}
                            className={`text-xs p-2 rounded-xl border text-left transition-all ${
                              resinPreset === p.name
                                ? "bg-[#FFF4EE] border-[#A84A38] text-[#4A151B] font-bold shadow-sm"
                                : "bg-gray-50/70 border-gray-200 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <span className="block truncate">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Shape Selector & Unit Notice */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <label className="text-xs font-semibold text-[#8C6B64] block mb-1">Mold Shape</label>
                        <div className="flex bg-[#F5DDD5]/40 p-1 rounded-xl border border-[#E9D2CA]">
                          <button
                            type="button"
                            onClick={() => setResinShape("rectangle")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              resinShape === "rectangle" ? "bg-white text-[#A84A38] shadow-sm" : "text-[#8C5D53]"
                            }`}
                          >
                            Rectangle / Tray
                          </button>
                          <button
                            type="button"
                            onClick={() => setResinShape("circle")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              resinShape === "circle" ? "bg-white text-[#A84A38] shadow-sm" : "text-[#8C5D53]"
                            }`}
                          >
                            Round / Coaster
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#FFF4EE] border border-[#F5DDD5] px-3 py-1.5 rounded-xl self-start sm:self-end">
                        <span className="text-[11px] font-bold text-[#A84A38] flex items-center gap-1">
                          <span>📐</span> Length & Width: <strong>Inches (in)</strong> | Depth: <strong>Millimeters (mm)</strong>
                        </span>
                      </div>
                    </div>

                    {/* Dimensions Inputs */}
                    <div className="pt-2">
                      <label className="text-xs font-semibold text-[#8C6B64] block mb-2">
                        Mold Dimensions:
                      </label>
                      {resinShape === "rectangle" ? (
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <span className="text-[11px] text-gray-500 block mb-1">Length (inches)</span>
                            <div className="relative">
                              <input
                                type="number"
                                min="0.1"
                                step="0.5"
                                value={resinLength}
                                onChange={(e) => { setResinLength(e.target.value); setResinPreset("Custom Shape"); }}
                                className="w-full px-3 py-2 pr-7 border border-[#E9D2CA] rounded-xl text-sm font-semibold text-center focus:ring-2 focus:ring-[#A84A38] outline-none bg-white"
                              />
                              <span className="absolute right-2.5 top-2.5 text-xs text-gray-400 font-bold pointer-events-none">in</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-[11px] text-gray-500 block mb-1">Width (inches)</span>
                            <div className="relative">
                              <input
                                type="number"
                                min="0.1"
                                step="0.5"
                                value={resinWidth}
                                onChange={(e) => { setResinWidth(e.target.value); setResinPreset("Custom Shape"); }}
                                className="w-full px-3 py-2 pr-7 border border-[#E9D2CA] rounded-xl text-sm font-semibold text-center focus:ring-2 focus:ring-[#A84A38] outline-none bg-white"
                              />
                              <span className="absolute right-2.5 top-2.5 text-xs text-gray-400 font-bold pointer-events-none">in</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-[11px] text-gray-500 block mb-1">Depth / Height (mm)</span>
                            <div className="relative">
                              <input
                                type="number"
                                min="0.5"
                                step="1"
                                value={resinDepth}
                                onChange={(e) => { setResinDepth(e.target.value); setResinPreset("Custom Shape"); }}
                                className="w-full px-3 py-2 pr-8 border border-[#E9D2CA] rounded-xl text-sm font-semibold text-center focus:ring-2 focus:ring-[#A84A38] outline-none bg-white"
                              />
                              <span className="absolute right-2.5 top-2.5 text-xs text-gray-400 font-bold pointer-events-none">mm</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[11px] text-gray-500 block mb-1">Diameter (inches)</span>
                            <div className="relative">
                              <input
                                type="number"
                                min="0.1"
                                step="0.5"
                                value={resinDiameter}
                                onChange={(e) => { setResinDiameter(e.target.value); setResinPreset("Custom Shape"); }}
                                className="w-full px-3 py-2 pr-7 border border-[#E9D2CA] rounded-xl text-sm font-semibold text-center focus:ring-2 focus:ring-[#A84A38] outline-none bg-white"
                              />
                              <span className="absolute right-2.5 top-2.5 text-xs text-gray-400 font-bold pointer-events-none">in</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-[11px] text-gray-500 block mb-1">Depth / Thickness (mm)</span>
                            <div className="relative">
                              <input
                                type="number"
                                min="0.5"
                                step="1"
                                value={resinDepth}
                                onChange={(e) => { setResinDepth(e.target.value); setResinPreset("Custom Shape"); }}
                                className="w-full px-3 py-2 pr-8 border border-[#E9D2CA] rounded-xl text-sm font-semibold text-center focus:ring-2 focus:ring-[#A84A38] outline-none bg-white"
                              />
                              <span className="absolute right-2.5 top-2.5 text-xs text-gray-400 font-bold pointer-events-none">mm</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mix Ratio & Technique */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <label className="text-xs font-semibold text-[#8C6B64] block mb-1.5">Mix Ratio (A : B)</label>
                        <select
                          value={resinRatio}
                          onChange={(e) => setResinRatio(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#A84A38] outline-none bg-white"
                        >
                          <option value="2:1">2:1 (High Gloss Art Resin)</option>
                          <option value="3:1">3:1 (Ultra Clear Deep Cast)</option>
                          <option value="1:1">1:1 (Quick Doming & Coating)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#8C6B64] block mb-1.5">Pour Technique</label>
                        <select
                          value={resinTechnique}
                          onChange={(e) => setResinTechnique(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#A84A38] outline-none bg-white"
                        >
                          <option value="casting">Standard Mold Casting</option>
                          <option value="coating">Surface Gloss Doming (1-2mm)</option>
                          <option value="layered">Layered Geode / Florals</option>
                          <option value="deep_cast">Deep Pour (&gt;2.5 cm)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#8C6B64] block mb-1.5">
                          Cup Cling Buffer
                        </label>
                        <select
                          value={resinWastage}
                          onChange={(e) => setResinWastage(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#A84A38] outline-none bg-white"
                        >
                          <option value={5}>+5% (Minimal)</option>
                          <option value={8}>+8% (Recommended Standard)</option>
                          <option value={10}>+10% (Multi-Cup Mix)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Commercial Batch & Cost Rates Card */}
                  <div className="bg-white rounded-2xl p-6 border border-[#F3E8E2] shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="font-serif font-bold text-base text-[#4A151B]">
                        💰 Material Costs & Artisan Labor
                      </h3>
                      <span className="text-xs text-gray-500 font-sans font-normal">
                        Batch Count: <strong>{resinBatch} pcs</strong>
                      </span>
                    </div>

                    {/* Dedicated Resin Kit Price Input */}
                    <div className="p-4 bg-[#FFF9F6] rounded-2xl border border-[#F5DDD5] space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <label className="text-xs font-bold text-[#6E2A20] flex items-center gap-1.5">
                          <span>🧴</span> Your Resin Kit Price (₹ per kg / liter):
                        </label>
                        <span className="text-[11px] text-[#8C6B64] italic">
                          (Prices differ by brand & ratio — enter yours below)
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative w-full sm:w-52">
                          <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold">₹</span>
                          <input
                            type="number"
                            min="100"
                            placeholder="Enter ₹/kg price (e.g. 950)"
                            value={resinCostPerKg}
                            onChange={(e) => setResinCostPerKg(e.target.value)}
                            className="w-full pl-7 pr-3 py-2 border border-[#E9D2CA] rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#A84A38] outline-none bg-white text-center sm:text-left"
                          />
                        </div>

                        {/* Quick Preset Options */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] text-gray-500 mr-0.5">Quick tiers:</span>
                          <button
                            type="button"
                            onClick={() => setResinCostPerKg(750)}
                            className="text-[11px] px-2.5 py-1 bg-white hover:bg-[#FFF4EE] border border-[#E9D2CA] rounded-lg text-[#742A2A] transition-all font-medium"
                          >
                            Budget (₹750/kg)
                          </button>
                          <button
                            type="button"
                            onClick={() => setResinCostPerKg(950)}
                            className="text-[11px] px-2.5 py-1 bg-white hover:bg-[#FFF4EE] border border-[#E9D2CA] rounded-lg text-[#742A2A] transition-all font-medium"
                          >
                            Standard 2:1 (₹950/kg)
                          </button>
                          <button
                            type="button"
                            onClick={() => setResinCostPerKg(1300)}
                            className="text-[11px] px-2.5 py-1 bg-white hover:bg-[#FFF4EE] border border-[#E9D2CA] rounded-lg text-[#742A2A] transition-all font-medium"
                          >
                            Deep Cast 3:1 (₹1,300/kg)
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Batch Units</span>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={resinBatch}
                          onChange={(e) => setResinBatch(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center focus:ring-2 focus:ring-[#A84A38] outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Pigments / Gold Foil (₹)</span>
                        <input
                          type="number"
                          min="0"
                          value={resinPigmentsCost}
                          onChange={(e) => setResinPigmentsCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center focus:ring-2 focus:ring-[#A84A38] outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Labor Price ₹ (Manual)</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="0 (Optional)"
                          value={resinLaborPrice}
                          onChange={(e) => setResinLaborPrice(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center focus:ring-2 focus:ring-[#A84A38] outline-none"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-[#8C6B64] italic">
                      💡 Labor price is not added automatically — enter your own making charge above if you want to include labor.
                    </p>
                  </div>
                </div>

                {/* Right 5 cols: Live Results & Costing Breakdown */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Results Panel */}
                  <div className="bg-gradient-to-br from-[#FFF8F4] to-[#FFF0E6] rounded-3xl p-6 border border-[#F5DDD5] shadow-md space-y-5">
                    <div className="flex items-center justify-between border-b border-[#F0D5CB] pb-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#A84A38]">
                          Calculated Mix Recipe
                        </span>
                        <h4 className="font-serif font-bold text-xl text-[#4A151B]">
                          Total Resin Needed
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-extrabold text-[#A84A38]">{totalResinGrams}</span>
                        <span className="text-xs text-[#8C5D53] font-bold ml-1">grams</span>
                        <div className="text-[11px] text-gray-500 font-mono">≈ {Math.round(totalResinGrams / 1.13)} ml</div>
                      </div>
                    </div>

                    {/* Part A vs Part B Split */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/80 p-3.5 rounded-2xl border border-white shadow-sm">
                        <div className="flex items-center justify-between text-xs font-bold text-[#6E2A20] mb-1">
                          <span>Part A (Resin)</span>
                          <span className="text-[10px] bg-rose-100 text-[#A84A38] px-1.5 py-0.5 rounded">
                            {resinRatio === "3:1" ? "75%" : resinRatio === "1:1" ? "50%" : "66.7%"}
                          </span>
                        </div>
                        <p className="text-2xl font-extrabold text-[#4A151B]">{resinPartA} <span className="text-xs font-semibold">g</span></p>
                        <p className="text-[10px] text-gray-500">Pour this first into cup</p>
                      </div>

                      <div className="bg-white/80 p-3.5 rounded-2xl border border-white shadow-sm">
                        <div className="flex items-center justify-between text-xs font-bold text-[#6E2A20] mb-1">
                          <span>Part B (Hardener)</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            {resinRatio === "3:1" ? "25%" : resinRatio === "1:1" ? "50%" : "33.3%"}
                          </span>
                        </div>
                        <p className="text-2xl font-extrabold text-[#4A151B]">{resinPartB} <span className="text-xs font-semibold">g</span></p>
                        <p className="text-[10px] text-gray-500">Stir slowly for 3 mins</p>
                      </div>
                    </div>

                    {/* Commercial Pricing Breakdown */}
                    <div className="bg-white rounded-2xl p-4 border border-[#F3E8E2] space-y-2.5">
                      <div className="flex justify-between text-xs text-[#6E2A20]">
                        <span>Raw Epoxy Cost ({totalResinGrams}g):</span>
                        <span className="font-semibold">
                          {hasResinCost ? (
                            `₹${rawResinCost}`
                          ) : (
                            <span className="text-amber-700 italic">Enter resin ₹/kg on left</span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-[#6E2A20]">
                        <span>Pigments, Mold & Extras:</span>
                        <span className="font-semibold">₹{(resinPigmentsCost + resinMoldCost) * resinBatch}</span>
                      </div>
                      <div className="flex justify-between text-xs text-[#6E2A20]">
                        <span>Labor / Making Charge:</span>
                        <span className="font-semibold">
                          {totalLaborCost > 0 ? `₹${totalLaborCost}` : "₹0 (Not entered)"}
                        </span>
                      </div>
                      <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between text-xs font-bold text-[#4A151B]">
                        <span>Total Production Cost:</span>
                        <span>
                          {hasResinCost
                            ? `₹${totalProductionCost}`
                            : `₹${(resinPigmentsCost + resinMoldCost) * resinBatch + totalLaborCost} + resin`}
                        </span>
                      </div>
                    </div>

                    {/* Final Selling Price Callout */}
                    <div className="bg-[#4A151B] text-white rounded-2xl p-4 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-rose-200 uppercase font-semibold">Suggested Retail Price</span>
                        {hasResinCost && (
                          <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                            {profitMarginPercent}% Margin
                          </span>
                        )}
                      </div>
                      {hasResinCost ? (
                        <>
                          <div className="flex items-baseline justify-between">
                            <span className="text-3xl font-extrabold">₹{suggestedSellingPrice}</span>
                            <span className="text-xs text-rose-200">Wholesale: ₹{wholesalePrice}</span>
                          </div>
                          <div className="text-xs text-rose-200/80 pt-1 border-t border-white/10 flex justify-between">
                            <span>Net Profit: <strong>+₹{netProfit}</strong></span>
                            <span>{resinBatch > 1 ? `(₹${Math.round(netProfit / resinBatch)} / pc)` : "Per project"}</span>
                          </div>
                        </>
                      ) : (
                        <div className="py-2 text-center text-rose-200/90 text-xs">
                          👈 Enter your Resin Kit ₹/kg on the left to calculate selling price & profit margin!
                        </div>
                      )}
                    </div>

                    {/* Pro Craft Tip */}
                    <div className="text-[11px] text-[#7A4B42] bg-white/60 p-3 rounded-xl border border-white/80 space-y-1">
                      <p className="font-bold">✨ Resin Art Pro Tip:</p>
                      <p>{geminiAdvice.craftTips?.[0] || "Degas bubbles with a heat gun 5 mins after pouring. Keep workspace warm (24°C-28°C)."}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* B. CANDLE MAKING CALCULATOR (CandleScience Grounded)           */}
            {/* ------------------------------------------------------------- */}
            {activeCategory === "candle" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white rounded-2xl p-6 border border-[#F3E8E2] shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-lg text-[#4A151B] flex items-center gap-2">
                        <span>🕯️</span> Scented Candle Batch Calculator
                      </h3>
                      <span className="text-[11px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                        Density Factor: {waxDensity}
                      </span>
                    </div>

                    {/* Presets */}
                    <div>
                      <label className="text-xs font-semibold text-[#8C6B64] block mb-2">Vessel Preset:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {CANDLE_PRESETS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => handleCandlePresetChange(p.name)}
                            className={`text-xs p-2 rounded-xl border text-left transition-all ${
                              candlePreset === p.name
                                ? "bg-[#FFF4EE] border-[#A84A38] text-[#4A151B] font-bold shadow-sm"
                                : "bg-gray-50/70 border-gray-200 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <span className="block truncate">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Vessel Specs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Water Capacity (ml)</span>
                        <input
                          type="number"
                          min="20"
                          value={candleCapacity}
                          onChange={(e) => { setCandleCapacity(parseFloat(e.target.value) || 0); setCandlePreset("Custom Vessel"); }}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-sm font-semibold text-center focus:ring-2 focus:ring-[#A84A38] outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Diameter (mm)</span>
                        <input
                          type="number"
                          min="20"
                          value={candleDiam}
                          onChange={(e) => setCandleDiam(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-sm font-semibold text-center focus:ring-2 focus:ring-[#A84A38] outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Batch (Jars)</span>
                        <input
                          type="number"
                          min="1"
                          value={candleBatch}
                          onChange={(e) => setCandleBatch(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-sm font-semibold text-center focus:ring-2 focus:ring-[#A84A38] outline-none"
                        />
                      </div>
                    </div>

                    {/* Wax Type & Fragrance Load */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-[#8C6B64] block mb-1.5">Wax Type</label>
                        <select
                          value={candleWaxType}
                          onChange={(e) => setCandleWaxType(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#A84A38] outline-none bg-white"
                        >
                          <option value="soy">Soy Wax (Density 0.86)</option>
                          <option value="coconut_soy">Coconut Soy Blend (0.84)</option>
                          <option value="beeswax">Natural Beeswax (0.90)</option>
                          <option value="paraffin">Paraffin Blend (0.80)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#8C6B64] block mb-1.5">Fragrance Oil Load (%)</label>
                        <select
                          value={candleFragLoad}
                          onChange={(e) => setCandleFragLoad(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#A84A38] outline-none bg-white"
                        >
                          <option value={6}>6% (Subtle floral)</option>
                          <option value={8}>8% (Standard Recommended)</option>
                          <option value={10}>10% (Maximum Scent Throw)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Commercial Costs Card */}
                  <div className="bg-white rounded-2xl p-6 border border-[#F3E8E2] shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-base text-[#4A151B]">
                      Raw Material & Packaging Rates
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Wax ₹ / kg</span>
                        <input
                          type="number"
                          value={candleWaxRate}
                          onChange={(e) => setCandleWaxRate(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Fragrance ₹/100ml</span>
                        <input
                          type="number"
                          value={candleFragRate}
                          onChange={(e) => setCandleFragRate(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Jar Container ₹</span>
                        <input
                          type="number"
                          value={candleJarCost}
                          onChange={(e) => setCandleJarCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Wick & Label ₹</span>
                        <input
                          type="number"
                          value={candleWickCost}
                          onChange={(e) => setCandleWickCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 5 cols: Results */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-gradient-to-br from-[#FFF8F4] to-[#FFF0E6] rounded-3xl p-6 border border-[#F5DDD5] shadow-md space-y-5">
                    <div className="flex items-center justify-between border-b border-[#F0D5CB] pb-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#A84A38]">
                          Batch Recipe ({candleBatch} Jars)
                        </span>
                        <h4 className="font-serif font-bold text-xl text-[#4A151B]">
                          Wax & Oil Requirement
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-extrabold text-[#A84A38]">{totalWaxGrams}</span>
                        <span className="text-xs text-[#8C5D53] font-bold ml-1">g wax</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/80 p-3.5 rounded-2xl border border-white shadow-sm">
                        <span className="text-xs font-bold text-[#6E2A20] block mb-1">Fragrance Oil</span>
                        <p className="text-2xl font-extrabold text-[#4A151B]">{totalFragGrams} <span className="text-xs font-semibold">g</span></p>
                        <p className="text-[10px] text-gray-500">Add at 65°C-70°C</p>
                      </div>

                      <div className="bg-white/80 p-3.5 rounded-2xl border border-white shadow-sm">
                        <span className="text-xs font-bold text-[#6E2A20] block mb-1">Recommended Wick</span>
                        <p className="text-xs font-extrabold text-[#A84A38] mt-1">{wickRecommendation}</p>
                        <p className="text-[10px] text-gray-500">Based on {candleDiam}mm width</p>
                      </div>
                    </div>

                    {/* Costing */}
                    <div className="bg-white rounded-2xl p-4 border border-[#F3E8E2] space-y-2 text-xs text-[#6E2A20]">
                      <div className="flex justify-between">
                        <span>Total Wax Cost:</span>
                        <span className="font-semibold">₹{candleWaxCostTotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fragrance Oil Cost:</span>
                        <span className="font-semibold">₹{candleFragCostTotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jars & Wicks Total:</span>
                        <span className="font-semibold">₹{candleContainersTotal}</span>
                      </div>
                      <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between font-bold text-[#4A151B]">
                        <span>Cost Per Candle:</span>
                        <span>₹{Math.round(candleTotalCost / candleBatch)}</span>
                      </div>
                    </div>

                    <div className="bg-[#4A151B] text-white rounded-2xl p-4 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-rose-200 uppercase font-semibold">Suggested Retail Price</span>
                        <span className="text-xs text-emerald-300 font-bold">₹{candleUnitPrice} / jar</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold">₹{candleSuggestedTotal}</span>
                        <span className="text-xs text-rose-200">Total Batch Revenue</span>
                      </div>
                      <div className="text-xs text-rose-200/80 pt-1 border-t border-white/10 flex justify-between">
                        <span>Net Profit: <strong>+₹{candleProfit}</strong></span>
                        <span>₹{Math.round(candleProfit / candleBatch)} profit per jar</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* C. CROCHET & YARN PRICING CALCULATOR                           */}
            {/* ------------------------------------------------------------- */}
            {activeCategory === "crochet" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white rounded-2xl p-6 border border-[#F3E8E2] shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-lg text-[#4A151B] flex items-center gap-2">
                      <span>🧶</span> Artisan Crochet Labor & Yarn Estimator
                    </h3>

                    <div>
                      <label className="text-xs font-semibold text-[#8C6B64] block mb-2">Preset Project:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {CROCHET_PRESETS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => handleCrochetPresetChange(p.name)}
                            className={`text-xs p-2 rounded-xl border text-left transition-all ${
                              crochetPreset === p.name
                                ? "bg-[#FFF4EE] border-[#A84A38] text-[#4A151B] font-bold shadow-sm"
                                : "bg-gray-50/70 border-gray-200 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <span className="block truncate">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Yarn Skeins (100g)</span>
                        <input
                          type="number"
                          step="0.5"
                          value={crochetSkeins}
                          onChange={(e) => setCrochetSkeins(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Yarn Cost ₹ / skein</span>
                        <input
                          type="number"
                          value={crochetYarnCost}
                          onChange={(e) => setCrochetYarnCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Yarn Type</span>
                        <select
                          value={crochetYarnType}
                          onChange={(e) => setCrochetYarnType(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold outline-none bg-white"
                        >
                          <option value="cotton">4-Ply Cotton</option>
                          <option value="chenille">Velvet / Chenille</option>
                          <option value="acrylic">Soft Acrylic</option>
                          <option value="wool">Chunky Milk Cotton</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Eyes, Stuffing & Tags ₹</span>
                        <input
                          type="number"
                          value={crochetExtrasCost}
                          onChange={(e) => setCrochetExtrasCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Crochet Hours</span>
                        <input
                          type="number"
                          step="0.5"
                          value={crochetHours}
                          onChange={(e) => setCrochetHours(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Artisan Hourly Rate ₹</span>
                        <input
                          type="number"
                          value={crochetHourlyWage}
                          onChange={(e) => setCrochetHourlyWage(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-gradient-to-br from-[#FFF8F4] to-[#FFF0E6] rounded-3xl p-6 border border-[#F5DDD5] shadow-md space-y-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A84A38]">
                      Artisan Valuation
                    </span>
                    <h4 className="font-serif font-bold text-xl text-[#4A151B]">
                      Fair Craft Pricing
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/80 p-3.5 rounded-2xl border border-white shadow-sm">
                        <span className="text-xs font-bold text-[#6E2A20] block mb-1">Total Materials</span>
                        <p className="text-2xl font-extrabold text-[#4A151B]">₹{crochetMaterialsTotal}</p>
                        <p className="text-[10px] text-gray-500">Yarn + Safety hardware</p>
                      </div>

                      <div className="bg-white/80 p-3.5 rounded-2xl border border-white shadow-sm">
                        <span className="text-xs font-bold text-[#6E2A20] block mb-1">Labor Valuation</span>
                        <p className="text-2xl font-extrabold text-[#A84A38]">₹{crochetLaborTotal}</p>
                        <p className="text-[10px] text-gray-500">{crochetHours}h @ ₹{crochetHourlyWage}/hr</p>
                      </div>
                    </div>

                    <div className="bg-[#4A151B] text-white rounded-2xl p-4 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-rose-200 uppercase font-semibold">Suggested Selling Price</span>
                        <span className="text-xs text-emerald-300 font-bold">Wholesale: ₹{crochetWholesale}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold">₹{crochetRetail}</span>
                        <span className="text-xs text-rose-200 font-medium">Fair Living Wage Included</span>
                      </div>
                      <div className="text-xs text-rose-200/80 pt-1 border-t border-white/10 flex justify-between">
                        <span>Net Craft Profit: <strong>+₹{crochetProfit}</strong></span>
                        <span>Total Hours: {crochetHours}h</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* D. CLAY SCULPTING CALCULATOR                                   */}
            {/* ------------------------------------------------------------- */}
            {activeCategory === "clay" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white rounded-2xl p-6 border border-[#F3E8E2] shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-lg text-[#4A151B] flex items-center gap-2">
                      <span>🏺</span> Polymer & Air-Dry Clay Batch Estimator
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Clay Blocks (57g)</span>
                        <input
                          type="number"
                          value={clayBlocks}
                          onChange={(e) => setClayBlocks(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Block Cost ₹</span>
                        <input
                          type="number"
                          value={clayBlockCost}
                          onChange={(e) => setClayBlockCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Yield (Pieces/Pairs)</span>
                        <input
                          type="number"
                          value={clayBatchPairs}
                          onChange={(e) => setClayBatchPairs(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Findings & Varnish ₹</span>
                        <input
                          type="number"
                          value={clayFindingsCost}
                          onChange={(e) => setClayFindingsCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Labor (Hours)</span>
                        <input
                          type="number"
                          step="0.5"
                          value={clayBakingHours}
                          onChange={(e) => setClayBakingHours(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Hourly Wage ₹</span>
                        <input
                          type="number"
                          value={clayHourlyWage}
                          onChange={(e) => setClayHourlyWage(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-gradient-to-br from-[#FFF8F4] to-[#FFF0E6] rounded-3xl p-6 border border-[#F5DDD5] shadow-md space-y-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A84A38]">
                      Batch Pricing & Margin
                    </span>
                    <h4 className="font-serif font-bold text-xl text-[#4A151B]">
                      ₹{clayUnitRetail} <span className="text-sm font-sans font-medium text-[#8C5D53]">/ pair</span>
                    </h4>

                    <div className="bg-white rounded-2xl p-4 border border-[#F3E8E2] space-y-2 text-xs text-[#6E2A20]">
                      <div className="flex justify-between">
                        <span>Total Batch Cost:</span>
                        <span className="font-semibold">₹{clayTotalCost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost Per Unit:</span>
                        <span className="font-semibold">₹{Math.round(clayTotalCost / clayBatchPairs)}</span>
                      </div>
                      <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between font-bold text-[#4A151B]">
                        <span>Total Batch Selling Price:</span>
                        <span>₹{claySuggestedTotal}</span>
                      </div>
                    </div>

                    <div className="bg-[#4A151B] text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs text-rose-200 uppercase font-semibold">Net Profit</span>
                        <p className="text-2xl font-extrabold">+₹{clayProfit}</p>
                      </div>
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-400/30">
                        3.0x Artisan Markup
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* E. PIPE CLEANER CRAFT CALCULATOR                               */}
            {/* ------------------------------------------------------------- */}
            {activeCategory === "pipe-cleaner" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white rounded-2xl p-6 border border-[#F3E8E2] shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-lg text-[#4A151B] flex items-center gap-2">
                      <span>🌸</span> Chenille Flower Bouquet Estimator
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Flower Count</span>
                        <input
                          type="number"
                          value={flowerCount}
                          onChange={(e) => setFlowerCount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Stems per Flower</span>
                        <input
                          type="number"
                          value={stemsPerFlower}
                          onChange={(e) => setStemsPerFlower(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">100-Pack Stem Cost ₹</span>
                        <input
                          type="number"
                          value={stemPackCost}
                          onChange={(e) => setStemPackCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Tape, Wire & Wrap ₹</span>
                        <input
                          type="number"
                          value={wrappingCost}
                          onChange={(e) => setWrappingCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Labor (Hours)</span>
                        <input
                          type="number"
                          step="0.5"
                          value={pipeLaborHours}
                          onChange={(e) => setPipeLaborHours(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block mb-1">Hourly Wage ₹</span>
                        <input
                          type="number"
                          value={pipeHourlyWage}
                          onChange={(e) => setPipeHourlyWage(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-gradient-to-br from-[#FFF8F4] to-[#FFF0E6] rounded-3xl p-6 border border-[#F5DDD5] shadow-md space-y-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A84A38]">
                      Bouquet Valuation
                    </span>
                    <h4 className="font-serif font-bold text-xl text-[#4A151B]">
                      {totalStemsNeeded} <span className="text-sm font-sans font-medium text-[#8C5D53]">stems ({packsNeeded} packs)</span>
                    </h4>

                    <div className="bg-white rounded-2xl p-4 border border-[#F3E8E2] space-y-2 text-xs text-[#6E2A20]">
                      <div className="flex justify-between">
                        <span>Materials (Stems + Wrapping):</span>
                        <span className="font-semibold">₹{pipeMaterialsTotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Labor Cost:</span>
                        <span className="font-semibold">₹{pipeLaborTotal}</span>
                      </div>
                      <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between font-bold text-[#4A151B]">
                        <span>Total Production Cost:</span>
                        <span>₹{pipeTotalCost}</span>
                      </div>
                    </div>

                    <div className="bg-[#4A151B] text-white rounded-2xl p-4 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-rose-200 uppercase font-semibold">Suggested Bouquet Price</span>
                        <span className="text-xs text-emerald-300 font-bold">3.2x Markup</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold">₹{pipeRetail}</span>
                        <span className="text-xs text-rose-200">Net Profit: +₹{pipeProfit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* MODE 2: ITEMIZED MATERIALS CHECKLIST (Existing Feature Preserved)   */}
        {/* =================================================================== */}
        {activeMode === "itemized" && (
          <motion.div
            key={`itemized-${activeCategory}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#F3E8E2] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#4A151B]">
                    📦 Itemized Materials Checklist ({catMeta.label})
                  </h3>
                  <p className="text-xs text-[#8C5D53] mt-0.5">
                    Enter quantities for standard supply units to calculate total production cost and suggested retail price.
                  </p>
                </div>

                {Object.keys(itemizedQuantities).length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearItemized}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-all self-start"
                  >
                    Clear All Quantities
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {itemizedMaterialsList.map((material, idx) => {
                  const qty = itemizedQuantities[idx] || "";
                  const subtotal = ((parseFloat(qty) || 0) * material.cost).toFixed(0);

                  return (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-4 p-4 bg-[#FFF9F6] rounded-2xl border border-[#F5DDD5]/60 hover:border-[#A84A38]/40 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#4A151B]">{material.name}</p>
                        <p className="text-xs text-[#8C6B64]">₹{material.cost} per unit</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono">Qty:</span>
                        <input
                          type="number"
                          placeholder="0"
                          min="0"
                          step="0.1"
                          value={qty}
                          onChange={(e) => handleItemizedQtyChange(idx, e.target.value)}
                          className="w-24 px-3 py-2 border border-[#E9D2CA] rounded-xl text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-[#A84A38] bg-white"
                        />
                      </div>

                      <div className="text-right min-w-[80px]">
                        <p className="text-sm font-extrabold text-[#A84A38]">
                          ₹{subtotal}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Add Custom Item Row */}
              <form onSubmit={handleAddCustomItem} className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Add custom supply (e.g. UV Resin, Glaze)"
                  value={newCustomName}
                  onChange={(e) => setNewCustomName(e.target.value)}
                  className="flex-1 w-full px-4 py-2.5 border border-[#E9D2CA] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#A84A38] outline-none"
                />
                <input
                  type="number"
                  placeholder="Cost ₹"
                  value={newCustomCost}
                  onChange={(e) => setNewCustomCost(e.target.value)}
                  className="w-full sm:w-28 px-3 py-2.5 border border-[#E9D2CA] rounded-xl text-xs font-semibold text-center focus:ring-2 focus:ring-[#A84A38] outline-none"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#A84A38] hover:bg-[#8F3C2C] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  + Add Item
                </button>
              </form>

              {/* Results Cards (Matching previous structure with refined warm theme) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center">
                  <p className="text-xs font-bold text-[#8C5D53] uppercase tracking-wider">Total Material Cost</p>
                  <p className="font-serif text-3xl font-extrabold text-[#A84A38] mt-2">
                    ₹{itemizedTotalMaterialCost.toFixed(0)}
                  </p>
                  <p className="text-xs text-[#8C6B64] mt-1">Direct production input</p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center">
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Suggested Selling Price</p>
                  <p className="font-serif text-3xl font-extrabold text-emerald-700 mt-2">
                    ₹{itemizedSuggestedPrice.toFixed(0)}
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">With 2.5x standard markup</p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 text-center">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Estimated Profit</p>
                  <p className="font-serif text-3xl font-extrabold text-amber-800 mt-2">
                    ₹{itemizedProfit.toFixed(0)}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">Net margin per batch</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}