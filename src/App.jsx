import { useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import NavigationTabs from "./components/NavigationTabs";
import VinayakTab from "./components/VinayakTab";
import MittaluTab from "./components/MittaluTab";

export default function App() {
  const [activeTab, setActiveTab] = useState("vinayak");
  const [refreshKeys, setRefreshKeys] = useState({ vinayak: 0, mittalu: 0 });
  const [tabLoading, setTabLoading] = useState({
    vinayak: false,
    mittalu: false,
  });

  const handleRefresh = useCallback(() => {
    setRefreshKeys((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab] + 1,
    }));
  }, [activeTab]);

  const handleVinayakLoading = useCallback((isLoading) => {
    setTabLoading((prev) =>
      prev.vinayak === isLoading ? prev : { ...prev, vinayak: isLoading },
    );
  }, []);

  const handleMittaluLoading = useCallback((isLoading) => {
    setTabLoading((prev) =>
      prev.mittalu === isLoading ? prev : { ...prev, mittalu: isLoading },
    );
  }, []);

  const currentEntityTitle =
    activeTab === "vinayak" ? "Vinayak Enterprises" : "Mittalu Pvt Ltd";

  return (
    <div className="min-h-screen text-gray-900 font-sans p-4 sm:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* TOP HEADER */}
        <header className="border-b border-gray-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 transition-all duration-200">
                {currentEntityTitle}
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base font-medium">
              Sales Team Dashboard — Pending Dispatch Summary
            </p>
          </div>

          {/* REFRESH BUTTON (TOP RIGHT) */}
          <div className="flex items-center self-end sm:self-center">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={tabLoading[activeTab]}
              title="Refresh dashboard data"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-gray-500 ${tabLoading[activeTab] ? "animate-spin text-blue-600" : ""}`}
              />
              <span>{tabLoading[activeTab] ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </header>

        {/* NAVIGATION TABS */}
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* TAB CONTENTS */}
        <main className="transition-opacity duration-200">
          <VinayakTab
            key={`vinayak-${refreshKeys.vinayak}`}
            isActive={activeTab === "vinayak"}
            onLoadingChange={handleVinayakLoading}
          />

          <MittaluTab
            key={`mittalu-${refreshKeys.mittalu}`}
            isActive={activeTab === "mittalu"}
            onLoadingChange={handleMittaluLoading}
          />
        </main>
      </div>
    </div>
  );
}
