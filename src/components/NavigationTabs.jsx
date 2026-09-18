import { Building2 } from "lucide-react";

export default function NavigationTabs({
  activeTab,
  onTabChange,
  tabs = [
    { id: "vinayak", name: "Vinayak", icon: Building2, tag: "Vinayak" },
    { id: "mittalu", name: "Mittalu", icon: Building2, tag: "Mittalu" },
  ],
}) {
  return (
    <div className="flex items-center pb-2 border-b border-gray-200">
      {/* Tabs list */}
      <nav
        className="flex items-center p-1.5 space-x-1.5 bg-gray-200/70 backdrop-blur-sm rounded-xl border border-gray-300/60 shadow-inner w-full sm:w-auto"
        aria-label="Company Tabs"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              type="button"
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-white text-blue-700 shadow-sm shadow-gray-200/50 font-bold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/40"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${isActive ? "text-blue-600" : "text-gray-500"}`}
              />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
