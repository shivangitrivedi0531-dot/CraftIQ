import SimilarArtistsTab from "./components/tabs/SimilarArtistsTab";
import { useState } from "react";
import { motion } from "framer-motion";
import AnalyticsTab from "./components/tabs/AnalyticsTab";
import CalculatorTab from "./components/tabs/CalculatorTab";
import StoreLocatorTab from "./components/tabs/StoreLocatorTab";
import TutorialsTab from "./components/tabs/TutorialsTab";
import ChatHistoryTab from "./components/tabs/ChatHistoryTab";

const mockCategory = {
  id: "resin",
  label: "Resin Art",
  tagline: "Epoxy, molds & pours"
};

export default function App() {
  const [activeTab, setActiveTab] = useState("analytics");

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 md:p-8 relative overflow-hidden">
      {/* Background animation */}
      <motion.div className="fixed inset-0 -z-10">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 right-0 w-80 h-80 bg-rose-300/15 rounded-full blur-3xl"
          animate={{ y: [50, 0, 50], x: [-50, 0, -50] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
        />
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-12"
        >
          <div className="bg-gradient-to-r from-white/70 to-amber-50/70 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-amber-200/50 shadow-2xl">
            <h1 className="font-display text-4xl md:text-5xl bg-gradient-to-r from-amber-900 to-orange-700 bg-clip-text text-transparent">CraftIQ Analytics</h1>
            <p className="text-amber-800/70 text-base md:text-lg mt-2">✨ Warm insights for your {mockCategory.label}</p>
          </div>
        </motion.div>

        {/* Tab Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex gap-2 flex-wrap"
        >
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "analytics"
                ? "bg-ochre-500 text-white shadow-lg scale-105"
                : "bg-white/70 text-ink-700 hover:bg-white border border-amber-200/50"
            }`}
          >
            📊 Analytics
          </button>
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "calculator"
                ? "bg-ochre-500 text-white shadow-lg scale-105"
                : "bg-white/70 text-ink-700 hover:bg-white border border-amber-200/50"
            }`}
          >
            🧮 Calculator
          </button>
          <button
            onClick={() => setActiveTab("stores")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "stores"
                ? "bg-ochre-500 text-white shadow-lg scale-105"
                : "bg-white/70 text-ink-700 hover:bg-white border border-amber-200/50"
            }`}
          >
            🏪 Stores
          </button>
          <button
            onClick={() => setActiveTab("artists")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "artists"
                ? "bg-ochre-500 text-white shadow-lg scale-105"
                : "bg-white/70 text-ink-700 hover:bg-white border border-amber-200/50"
            }`}
          >
            👥 Artists
          </button>
          <button
            onClick={() => setActiveTab("tutorials")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
             activeTab === "tutorials"
                ? "bg-ochre-500 text-white shadow-lg scale-105"
                : "bg-white/70 text-ink-700 hover:bg-white border border-amber-200/50"
            }`}
          >
            🎥 Tutorials
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "history"
              ? "bg-ochre-500 text-white shadow-lg scale-105"
              : "bg-white/70 text-ink-700 hover:bg-white border border-amber-200/50"
          }`}
          >
            💬 History
          </button>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          key={activeTab}
        >
          {activeTab === "analytics" && <AnalyticsTab category={mockCategory} />}
          {activeTab === "calculator" && <CalculatorTab category={mockCategory} />}
          {activeTab === "stores" && <StoreLocatorTab category={mockCategory} />}
          {activeTab === "artists" && <SimilarArtistsTab category={mockCategory} />}
          {activeTab === "tutorials" && <TutorialsTab category={mockCategory} />}
          {activeTab === "history" && <ChatHistoryTab category={mockCategory} />}
        </motion.div>
      </div>
    </div>
  );
}