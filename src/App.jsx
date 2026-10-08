import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnalyticsTab from "./components/tabs/AnalyticsTab";
import CalculatorTab from "./components/tabs/CalculatorTab";
import StoreLocatorTab from "./components/tabs/StoreLocatorTab";
import SimilarArtistsTab from "./components/tabs/SimilarArtistsTab";
import TutorialsTab from "./components/tabs/TutorialsTab";
import ChatHistoryTab from "./components/tabs/ChatHistoryTab";

const CATEGORY_MAP = {
  resin: { id: "resin", label: "Resin Art", icon: "🧪", tagline: "Epoxy, molds & pours" },
  candle: { id: "candle", label: "Candle Making", icon: "🕯️", tagline: "Waxes, wicks & fragrances" },
  crochet: { id: "crochet", label: "Crochet & Yarn", icon: "🧶", tagline: "Yarns, hooks & needlecraft" },
  clay: { id: "clay", label: "Clay Sculpting", icon: "🏺", tagline: "Polymer, air-dry & modeling" },
  "pipe-cleaner": { id: "pipe-cleaner", label: "Pipe Cleaner", icon: "🌸", tagline: "Chenille stems & wire crafts" },
};

export default function App() {
  const getInitialTab = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["analytics", "calculator", "stores", "artists", "tutorials", "history"].includes(tabParam.toLowerCase())) {
        return tabParam.toLowerCase();
      }
    }
    return "analytics";
  };

  const getInitialCategory = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get("category");
      if (catParam && CATEGORY_MAP[catParam.toLowerCase()]) {
        return catParam.toLowerCase();
      }
    }
    return "resin";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [activeCategory, setActiveCategory] = useState(getInitialCategory);

  // Keep state in sync with URL changes
  useEffect(() => {
    const handleUrlSync = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const catParam = params.get("category");
      if (tabParam && ["analytics", "calculator", "stores", "artists", "tutorials", "history"].includes(tabParam.toLowerCase())) {
        setActiveTab(tabParam.toLowerCase());
      }
      if (catParam && CATEGORY_MAP[catParam.toLowerCase()]) {
        setActiveCategory(catParam.toLowerCase());
      }
    };
    window.addEventListener("popstate", handleUrlSync);
    return () => window.removeEventListener("popstate", handleUrlSync);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("tab", tab);
      if (!params.get("category")) {
        params.set("category", activeCategory);
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
  };

  const currentCatObj = CATEGORY_MAP[activeCategory] || CATEGORY_MAP.resin;

  return (
    <div className="min-h-screen bg-[#FAF7F2] p-4 md:p-8 relative overflow-hidden font-sans text-slate-800">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Top Navbar / Navigation Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-[#F5DDD5] shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 bg-[#FFF4EE] rounded-xl border border-[#F5DDD5]">🎨</span>
            <div>
              <h1 className="font-serif text-lg md:text-xl font-bold text-[#4A151B] tracking-tight">
                CraftIQ Studio
              </h1>
              <p className="text-xs text-[#8C5D53] font-medium">
                Active: <span className="text-[#A84A38] font-bold">{currentCatObj.icon} {currentCatObj.label}</span>
              </p>
            </div>
          </div>

          {/* Tab Buttons */}
          <div className="flex gap-1.5 flex-wrap justify-center sm:justify-end">
            {[
              { id: "analytics", label: "Analytics", icon: "📊" },
              { id: "calculator", label: "Calculator", icon: "🧮" },
              { id: "stores", label: "Stores", icon: "🏪" },
              { id: "artists", label: "Artists", icon: "👥" },
              { id: "tutorials", label: "Tutorials", icon: "🎥" },
              { id: "history", label: "History", icon: "💬" }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-[#A84A38] text-white shadow-sm scale-105"
                      : "bg-[#FFF4EE]/60 hover:bg-[#FFF4EE] text-[#6E2A20] border border-[#F5DDD5]"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          key={activeTab}
        >
          {activeTab === "analytics" && <AnalyticsTab category={currentCatObj} />}
          {activeTab === "calculator" && <CalculatorTab category={currentCatObj} />}
          {activeTab === "stores" && <StoreLocatorTab category={currentCatObj} />}
          {activeTab === "artists" && <SimilarArtistsTab category={currentCatObj} />}
          {activeTab === "tutorials" && <TutorialsTab category={currentCatObj} />}
          {activeTab === "history" && <ChatHistoryTab category={currentCatObj} />}
        </motion.div>
      </div>
    </div>
  );
}