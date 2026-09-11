import { useState } from "react";
import { useParams } from "react-router-dom";
import { getCategory, getTabsForCategory } from "../../data/categories";
import Sidebar from "./Sidebar";
import ChatPanel from "./ChatPanel";
import ProfileModal from "../profile/ProfileModal";

import AnalyticsTab from "../tabs/AnalyticsTab";
import CalculatorTab from "../tabs/CalculatorTab";
import StoreLocatorTab from "../tabs/StoreLocatorTab";
import SimilarArtistsTab from "../tabs/SimilarArtistsTab";
import TutorialsTab from "../tabs/TutorialsTab";
import ChatHistoryTab from "../tabs/ChatHistoryTab";

const TAB_COMPONENTS = {
  analytics: AnalyticsTab, calculator: CalculatorTab, stores: StoreLocatorTab,
  artists: SimilarArtistsTab, tutorials: TutorialsTab, history: ChatHistoryTab,
};

export default function CategoryDashboard() {
  const { category: categoryId } = useParams();
  const category = getCategory(categoryId);
  const tabs = getTabsForCategory(category);

  const [activeView, setActiveView] = useState("chat"); // "chat" or a tab.key
  const [profileOpen, setProfileOpen] = useState(false);

  const ActiveTabComponent = activeView !== "chat" ? TAB_COMPONENTS[activeView] : null;

  return (
    <div className="flex h-screen bg-clay-50">
      <Sidebar category={category} tabs={tabs} activeView={activeView} onNavigate={setActiveView} onProfileClick={() => setProfileOpen(true)} />

      <main className="flex flex-1 flex-col overflow-hidden p-4">
        {activeView === "chat" ? (
          <ChatPanel category={category} />
        ) : (
          <section className="flex h-full flex-col overflow-hidden rounded-xl border border-clay-200 bg-white">
            <div className="border-b border-clay-200 px-4 py-3">
              <p className="font-display text-base text-ink-900">{tabs.find((t) => t.key === activeView)?.label}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ActiveTabComponent category={category} />
            </div>
          </section>
        )}
      </main>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}