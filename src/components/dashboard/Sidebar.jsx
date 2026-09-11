import {
  MessageCircle, BarChart3, Calculator, MapPin, Users, PlayCircle, History, UserCircle, ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

const TAB_ICONS = {
  analytics: BarChart3, calculator: Calculator, stores: MapPin,
  artists: Users, tutorials: PlayCircle, history: History,
};

export default function Sidebar({ category, tabs, activeView, onNavigate, onProfileClick }) {
  const navItems = [
    { key: "chat", label: "Chat", icon: MessageCircle },
    ...tabs.map((t) => ({ key: t.key, label: t.label, icon: TAB_ICONS[t.key] })),
  ];

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-clay-200 bg-white">
      <div className="flex items-center gap-2 border-b border-clay-200 px-4 py-4">
        <Link to="/categories" className="text-ink-400 hover:text-ink-900" aria-label="Back to categories">
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0">
          <p className="truncate font-display text-base text-ink-900">{category.label}</p>
          <p className="truncate text-xs text-ink-400">{category.tagline}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const isActive = item.key === activeView;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={[
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-ochre-500/10 text-ochre-700 border-l-2 border-ochre-500"
                  : "text-ink-600 border-l-2 border-transparent hover:bg-clay-100 hover:text-ink-900",
              ].join(" ")}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-clay-200 p-2">
        <button
          onClick={onProfileClick}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-clay-100 hover:text-ink-900"
        >
          <UserCircle size={18} />
          Profile
        </button>
      </div>
    </aside>
  );
}