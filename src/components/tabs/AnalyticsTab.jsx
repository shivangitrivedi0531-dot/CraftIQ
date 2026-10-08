import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Category options for manual testing & URL switching
const CATEGORY_MAP = {
  resin: { id: "resin", label: "Resin Art", icon: "🧪", subtitle: "Epoxy, Molds & Pours" },
  candle: { id: "candle", label: "Candle Making", icon: "🕯️", subtitle: "Waxes, Wicks & Fragrances" },
  crochet: { id: "crochet", label: "Crochet & Yarn", icon: "🧶", subtitle: "Yarns, Hooks & Needlecraft" },
  clay: { id: "clay", label: "Clay Sculpting", icon: "🏺", subtitle: "Polymer, Air-Dry & Modeling" },
  "pipe-cleaner": { id: "pipe-cleaner", label: "Pipe Cleaner", icon: "🌸", subtitle: "Chenille Stems & Floral Wire" }
};

// Pastel colors for the Product Comparison Bar Chart (matching reference image)
const BAR_COLORS = [
  "#FCA5A5", // Soft Coral / Pink
  "#DDD6FE", // Soft Lavender
  "#BAE6FD", // Soft Sky Blue
  "#BBF7D0", // Soft Sage Green
  "#FED7AA", // Warm Sand / Ochre
];

// Fallback intelligence if server is booting up
const DEFAULT_FALLBACK_DATA = {
  localMarketAverage: 650,
  marketPriceChange: "+5% vs last month",
  demandTrend: 18,
  demandMomentum: "+1% upward momentum",
  searchInterest: 85,
  weeklyProfitOpportunity: 1800,
  demandOverTime: [
    { week: "W1", demand: 25 },
    { week: "W2", demand: 42 },
    { week: "W3", demand: 72 },
    { week: "W4", demand: 86 }
  ],
  productPriceComparison: [
    { product: "Keychains", price: 450 },
    { product: "Coasters", price: 650 },
    { product: "Frames", price: 850 },
    { product: "Clocks", price: 720 },
    { product: "Trays", price: 620 }
  ],
  topInsights: [
    { icon: "fire", title: "Rising demand for personalized nameplates", subtitle: "Surge in custom wedding gifts" },
    { icon: "trend", title: "Resin jewellery searches increased by 32%", subtitle: "High engagement on Instagram reels" },
    { icon: "calendar", title: "Festive season boost expected next month", subtitle: "Prepare stock for Diwali & Rakhi" },
    { icon: "sparkle", title: "Geode style coasters are trending in Gujarat", subtitle: "Popular with interior designers" }
  ],
  quickRecommendations: [
    { id: 1, title: "Focus on custom nameplates", subtitle: "High demand and 65% profit margin" },
    { id: 2, title: "Create festive collection", subtitle: "Plan inventory for upcoming gifting season" },
    { id: 3, title: "Explore geode style coasters", subtitle: "Trending in your local urban areas" }
  ]
};

// SVG Sparkline component for KPI cards
function Sparkline({ color = "#10B981" }) {
  return (
    <svg className="w-full h-8 overflow-visible" viewBox="0 0 120 28" fill="none">
      <defs>
        <linearGradient id={`sparkGrad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M0,22 Q30,24 50,14 T90,8 T120,4"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M0,22 Q30,24 50,14 T90,8 T120,4 L120,28 L0,28 Z"
        fill={`url(#sparkGrad-${color.replace("#", "")})`}
      />
    </svg>
  );
}

// Custom Area Chart Tooltip
const CustomAreaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-1.5 border border-gray-700">
        <span className="w-2 h-2 rounded-full bg-orange-400"></span>
        <span>{label}: <strong>{payload[0].value} demand</strong></span>
      </div>
    );
  }
  return null;
};

// Custom Bar Chart Tooltip
const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-1.5 border border-gray-700">
        <span>{payload[0].payload.product}: <strong>₹{payload[0].value}</strong></span>
      </div>
    );
  }
  return null;
};

export default function AnalyticsTab({ category }) {
  // Read category from URL query (?category=resin) or fallback to prop / default "resin"
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
  const [analyticsData, setAnalyticsData] = useState(DEFAULT_FALLBACK_DATA);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [timeFilter, setTimeFilter] = useState("Last 4 weeks");
  const [barTimeFilter, setBarTimeFilter] = useState("This month");

  const catMeta = CATEGORY_MAP[activeCategory] || CATEGORY_MAP.resin;

  // Prioritize URL query param over prop
  useEffect(() => {
    const checkCategoryFromUrlOrProp = () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const queryCat = urlParams.get("category");
        if (queryCat && CATEGORY_MAP[queryCat.toLowerCase()]) {
          setActiveCategory(queryCat.toLowerCase());
          return;
        }
      }

      if (category) {
        const catId = typeof category === "object" && category?.id ? category.id : category;
        if (typeof catId === "string" && CATEGORY_MAP[catId.toLowerCase()]) {
          setActiveCategory(catId.toLowerCase());
        }
      }
    };

    checkCategoryFromUrlOrProp();
    window.addEventListener("popstate", checkCategoryFromUrlOrProp);
    return () => window.removeEventListener("popstate", checkCategoryFromUrlOrProp);
  }, [category]);

  // Fetch live AI analytics from backend
  const fetchAnalytics = async (catId) => {
    setLoading(true);
    try {
      let res;
      // Try port 8001 first, fallback to 8000
      try {
        res = await fetch(`http://localhost:8001/api/analytics/${catId}`);
        if (!res.ok) throw new Error();
      } catch {
        res = await fetch(`http://localhost:8000/api/analytics/${catId}`);
      }

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setAnalyticsData(json.data);
          setLastUpdated("Live Gemini AI • Just now");
        }
      }
    } catch (err) {
      console.warn("Using offline intelligence database for analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(activeCategory);
  }, [activeCategory]);

  // Helper to switch category (also updates browser URL without reloading)
  const handleCategorySwitch = (newCat) => {
    setActiveCategory(newCat);
    if (typeof window !== "undefined") {
      const newUrl = `${window.location.pathname}?category=${newCat}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
  };

  const data = analyticsData || DEFAULT_FALLBACK_DATA;

  // Icon mapping for top insights
  const getInsightIcon = (iconType) => {
    switch (iconType) {
      case "fire":
        return <span className="text-orange-500 text-lg">🔥</span>;
      case "trend":
        return <span className="text-purple-500 text-lg">📈</span>;
      case "calendar":
        return <span className="text-blue-500 text-lg">📅</span>;
      case "sparkle":
      default:
        return <span className="text-amber-500 text-lg">✨</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-slate-800">
      {/* ------------------------------------------------------------- */}
      {/* TOP HERO BANNER (Directly matching the reference image)       */}
      {/* ------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFF4EE] via-[#FDF1F3] to-[#FCEEE8] border border-[#F5DDD5] p-6 md:p-8 shadow-sm"
      >
        {/* Subtle decorative glow & artwork placeholder */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-200 via-orange-100 to-transparent"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#A84A38]">
                TURN CREATIVITY INTO OPPORTUNITY
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Gemini AI Live
              </span>
            </div>

            <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#4A151B]">
              CraftIQ Analytics
            </h1>

            <p className="text-base md:text-lg text-[#6E2A20] font-medium">
              Market intelligence for your <strong className="text-[#A84A38]">{catMeta.label}</strong> journey
            </p>

            <p className="text-xs md:text-sm text-[#8C5D53] max-w-xl">
              Discover trends, track demand and make smarter creative decisions. Live pricing benchmarks and consumer momentum across India.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const insightsEl = document.getElementById("insights-section");
                  if (insightsEl) insightsEl.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-5 py-2.5 bg-[#A84A38] hover:bg-[#8F3C2C] active:scale-95 text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center gap-2"
              >
                Explore Insights <span>→</span>
              </button>

              <button
                type="button"
                onClick={() => fetchAnalytics(activeCategory)}
                disabled={loading}
                className="px-4 py-2.5 bg-white/80 hover:bg-white text-[#742A2A] rounded-xl text-xs font-semibold border border-[#E9D2CA] shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>{loading ? "⏳" : "🔄"}</span>
                <span>{loading ? "Fetching Gemini..." : "Refresh Live Data"}</span>
              </button>
            </div>
          </div>

          {/* Right Visual Card with Category Testing Switcher */}
          <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-white shadow-sm space-y-2.5 max-w-sm">
            <div className="flex items-center justify-between border-b border-rose-100 pb-2">
              <span className="text-[11px] font-bold text-[#A84A38] uppercase tracking-wider">
                Category Preview ({catMeta.label})
              </span>
              <span className="text-[10px] text-gray-500">{lastUpdated}</span>
            </div>

            <p className="text-xs text-[#7A4B42] italic">
              "Ideas, Trends & Opportunities for Your {catMeta.label}"
            </p>

            {/* Quick switcher buttons to easily test ?category=resin, candle, etc. */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Object.values(CATEGORY_MAP).map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCategorySwitch(c.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                    activeCategory === c.id
                      ? "bg-[#A84A38] text-white shadow-sm"
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

      {/* ------------------------------------------------------------- */}
      {/* 4 TOP KPI METRIC CARDS (Exact recreation of reference image)  */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Average Market Price */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl p-5 border border-[#F3E8E2] shadow-[0_2px_10px_rgba(180,120,100,0.05)] space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-lg shadow-inner">
              🛍️
            </div>
            <span className="text-xs text-gray-400 font-semibold cursor-help" title="Average retail price among verified craft makers in India">ⓘ</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#8C6B64] block">Average Market Price</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-extrabold text-[#2D1512]">
                ₹{data.localMarketAverage || 650}
              </span>
              <span className="text-xs text-[#8C6B64] font-medium">per unit</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
              ↑ {data.marketPriceChange || "+5% vs last month"}
            </span>
          </div>

          <Sparkline color="#10B981" />
        </motion.div>

        {/* Metric 2: Demand Trend */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl p-5 border border-[#F3E8E2] shadow-[0_2px_10px_rgba(180,120,100,0.05)] space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-lg shadow-inner">
              📈
            </div>
            <span className="text-xs text-gray-400 font-semibold cursor-help" title="Percentage growth in consumer search & social volume">ⓘ</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#8C6B64] block">Demand Trend</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-extrabold text-[#2D1512]">
                {data.demandTrend || 18}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
              ↑ {data.demandMomentum || "+1% upward momentum"}
            </span>
          </div>

          <Sparkline color="#059669" />
        </motion.div>

        {/* Metric 3: Search Interest */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl p-5 border border-[#F3E8E2] shadow-[0_2px_10px_rgba(180,120,100,0.05)] space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-lg shadow-inner">
              🔍
            </div>
            <span className="text-xs text-gray-400 font-semibold cursor-help" title="Relative popularity score out of 100 on Google Trends">ⓘ</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#8C6B64] block">Search Interest</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-extrabold text-[#2D1512]">
                {data.searchInterest || 85}
              </span>
              <span className="text-xs text-[#8C6B64] font-medium">out of 100</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              High National Volume
            </span>
          </div>

          <Sparkline color="#8B5CF6" />
        </motion.div>

        {/* Metric 4: Weekly Profit Opportunity */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl p-5 border border-[#F3E8E2] shadow-[0_2px_10px_rgba(180,120,100,0.05)] space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-lg font-bold text-amber-700 shadow-inner">
              ₹
            </div>
            <span className="text-xs text-gray-400 font-semibold cursor-help" title="Projected net weekly profit based on raw material costs and demand">ⓘ</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#8C6B64] block">Weekly Profit Opportunity</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-extrabold text-[#2D1512]">
                ₹{(data.weeklyProfitOpportunity || 1800).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#8C6B64] font-medium truncate">
              based on current demand and pricing
            </span>
          </div>

          <Sparkline color="#F59E0B" />
        </motion.div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TWO LARGE VISUAL CHARTS SIDE-BY-SIDE                          */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Chart: Demand Trend Over 4 Weeks */}
        <div className="bg-white rounded-2xl p-6 border border-[#F3E8E2] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-orange-500 text-lg">📈</span>
              <h3 className="font-bold text-base text-[#2D1512]">Demand Trend Over 4 Weeks</h3>
              <span className="text-xs text-gray-400 cursor-help" title="Weekly indexed demand score">ⓘ</span>
            </div>

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-xs font-semibold bg-[#FAF5F2] border border-[#F0DFD8] rounded-lg px-2.5 py-1.5 text-[#5C2B22] focus:outline-none"
            >
              <option>Last 4 weeks</option>
              <option>Last 8 weeks</option>
              <option>Quarterly</option>
            </select>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.demandOverTime || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="demandAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA580C" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#FB923C" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5EBE6" />
                <XAxis dataKey="week" stroke="#A88B82" fontSize={11} tickLine={false} />
                <YAxis stroke="#A88B82" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="demand"
                  stroke="#EA580C"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#demandAreaGradient)"
                  dot={{ r: 4, fill: "#EA580C", stroke: "#FFFFFF", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#EA580C", stroke: "#FFFFFF", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Market Price Comparison */}
        <div className="bg-white rounded-2xl p-6 border border-[#F3E8E2] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-rose-500 text-lg">📊</span>
              <h3 className="font-bold text-base text-[#2D1512]">Market Price Comparison</h3>
              <span className="text-xs text-gray-400 cursor-help" title="Average pricing benchmark for key products">ⓘ</span>
            </div>

            <select
              value={barTimeFilter}
              onChange={(e) => setBarTimeFilter(e.target.value)}
              className="text-xs font-semibold bg-[#FAF5F2] border border-[#F0DFD8] rounded-lg px-2.5 py-1.5 text-[#5C2B22] focus:outline-none"
            >
              <option>This month</option>
              <option>Previous Quarter</option>
              <option>All time avg</option>
            </select>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.productPriceComparison || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5EBE6" />
                <XAxis dataKey="product" stroke="#A88B82" fontSize={11} tickLine={false} />
                <YAxis stroke="#A88B82" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="price" radius={[8, 8, 0, 0]}>
                  {(data.productPriceComparison || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM SECTION: TOP INSIGHTS & QUICK RECOMMENDATIONS          */}
      {/* ------------------------------------------------------------- */}
      <div id="insights-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Top Insights (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-lg">💡</span>
            <h3 className="font-bold text-base text-[#2D1512]">Top Insights</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {(data.topInsights || []).map((insight, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -3, scale: 1.01 }}
                className="bg-white rounded-2xl p-4 border border-[#F3E8E2] shadow-[0_2px_8px_rgba(180,120,100,0.04)] flex items-start justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF4EE] flex items-center justify-center shrink-0 shadow-inner">
                    {getInsightIcon(insight.icon)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#2D1512] group-hover:text-[#A84A38] transition-colors leading-snug">
                      {insight.title}
                    </h4>
                    {insight.subtitle && (
                      <p className="text-[11px] text-[#8C6B64] mt-1 leading-relaxed">
                        {insight.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-[#FAF5F2] group-hover:bg-[#A84A38] text-gray-400 group-hover:text-white flex items-center justify-center text-xs shrink-0 transition-colors shadow-sm">
                  →
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Recommendations (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-rose-500 text-lg">🎯</span>
              <h3 className="font-bold text-base text-[#2D1512]">Quick Recommendations</h3>
            </div>
            <button
              type="button"
              className="text-xs font-bold text-[#A84A38] hover:underline"
            >
              View All →
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#F3E8E2] shadow-sm space-y-3">
            {(data.quickRecommendations || []).map((rec, idx) => (
              <motion.div
                key={rec.id || idx}
                whileHover={{ x: 2 }}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-[#FFF9F6] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0EB] text-[#C25E4A] font-extrabold text-xs flex items-center justify-center shrink-0 border border-[#F5DDD5]">
                    {rec.id || idx + 1}
                  </div>

                  <div>
                    <h5 className="font-bold text-xs text-[#2D1512] group-hover:text-[#A84A38] transition-colors">
                      {rec.title}
                    </h5>
                    <p className="text-[11px] text-[#8C6B64] mt-0.5">
                      {rec.subtitle}
                    </p>
                  </div>
                </div>

                <span className="text-gray-300 group-hover:text-[#A84A38] text-xs font-bold transition-colors">
                  →
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
