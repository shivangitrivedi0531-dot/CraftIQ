import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DUMMY_ANALYTICS } from "../../data/dummyData";
import LocalMarketCard from "./charts/LocalMarketCard";
import DemandTrendCard from "./charts/DemandTrendCard";
import SearchInterestCard from "./charts/SearchInterestCard";
import DemandOverTimeChart from "./charts/DemandOverTimeChart";
import ProfitOpportunityCard from "./charts/ProfitOpportunityCard";

export default function AnalyticsTab({ category }) {
  const categoryId = category.id || "candle"; // Handle both category object and string
  const data = DUMMY_ANALYTICS[categoryId];

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-ink-400">No analytics data for this category</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 pb-6"
    >
      {/* Header */}
      <div className="mb-6">
        <p className="font-display text-xl text-ink-900">Market Analytics</p>
        <p className="text-sm text-ink-400 mt-1">Real-time insights for your {category.label || categoryId} business</p>
      </div>

      {/* A. Local Market Average */}
      <section>
        <LocalMarketCard value={data.localMarketAverage} />
      </section>

      {/* B & C: Trend + Interest (Side by side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <DemandTrendCard trend={data.demandTrend} />
        </section>
        <section>
          <SearchInterestCard interest={data.searchInterest} />
        </section>
      </div>

      {/* D. Demand Over Time Chart (Full width) */}
      <section>
        <DemandOverTimeChart data={data.demandOverTime} />
      </section>

      {/* E. Profit Opportunity (Full width, big stat) */}
      <section>
        <ProfitOpportunityCard value={data.weeklyProfitOpportunity} />
      </section>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xs text-ink-400 text-center mt-8"
      >
        💡 Data refreshes every hour. Last updated: just now
      </motion.p>
    </motion.div>
  );
}