import {
  CirclePause,
  Clock as ClockFading,
  Scissors,
  TriangleAlert,
  User2,
  Check,
  ChevronRight,
  Activity,
  Package,
  Truck,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Layers
} from 'lucide-react';
import { useState, useEffect } from 'react';

// UTILITY FUNCTIONS
const getWeekdayFromDateStr = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split(/[-/]/);
  let d;
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      d = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      const day = parseInt(parts[0], 10);
      const year = parseInt(parts[2], 10);
      const monthStr = parts[1];
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      let monthIndex = monthNames.indexOf(monthStr.toLowerCase());
      if (monthIndex === -1) {
        monthIndex = parseInt(monthStr, 10) - 1;
      }
      d = new Date(year, monthIndex, day);
    }
  } else {
    d = new Date(dateStr);
  }
  if (!d || isNaN(d.getTime())) return "";
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return weekdays[d.getDay()];
};

const isUnattributedIssue = (name) => !!name && name.startsWith("Unattributed");

const getWeekMajorityMonth = (startMondayStr) => {
  if (!startMondayStr) return "";
  const parts = startMondayStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return startMondayStr.substring(0, 7);
  const [year, month, day] = parts;
  const baseDate = new Date(year, month - 1, day);
  const monthCounts = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const monthStr = `${yyyy}-${mm}`;
    monthCounts[monthStr] = (monthCounts[monthStr] || 0) + 1;
  }
  return Object.keys(monthCounts).reduce((a, b) => monthCounts[a] > monthCounts[b] ? a : b);
};

const doesWeekOverlapMonth = (startMondayStr, targetMonthStr) => {
  if (!startMondayStr || !targetMonthStr) return false;
  const parts = startMondayStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return false;
  const [year, month, day] = parts;
  const baseDate = new Date(year, month - 1, day);
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dayMonthStr = `${yyyy}-${mm}`;
    if (dayMonthStr === targetMonthStr) {
      return true;
    }
  }
  return false;
};

const getMondayOfCurrentWeek = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(d.setDate(diff));
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, '0');
  const dd = String(monday.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const calculateBundle = (val) => {

  if (val % 3 === 0) {
    return val / 3;
  } else if (val > 3) {
    return Math.round(val / 3);
  } else {
    return 'N/A';
  }
}

export default function App() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [pendingData, setPendingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        const result = await response.json();

        if (result.pendingDates || result.totalPendingOrders !== undefined) {
          setPendingData(result);
        }

        if (result.data || Array.isArray(result)) {
          const list = result.data || (Array.isArray(result) ? result : []);
          setWeeklyData(list);
          if (list.length > 0) {
            const currentWeekMonday = getMondayOfCurrentWeek();
            const match = list.find(w => w.week === currentWeekMonday);
            if (match) {
              setSelectedWeek(match.week);
            } else {
              const pastWeeks = list.filter(w => w.week <= currentWeekMonday);
              if (pastWeeks.length > 0) {
                setSelectedWeek(pastWeeks[pastWeeks.length - 1].week);
              } else {
                setSelectedWeek(list[list.length - 1].week);
              }
            }
          }
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err.message);
      }
    };
    fetchData();
  }, [API_URL]);

  useEffect(() => {
    setExpandedDay(null);
  }, [selectedWeek]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div role="status">
            <svg aria-hidden="true" className="w-12 h-12 animate-spin text-gray-300 fill-blue-600" viewBox="0 0 100 101" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
          <p className="text-sm text-gray-500 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-red-600 border border-red-300 bg-red-50 p-6 rounded-lg shadow-sm">
          Error: {error}
        </div>
      </div>
    );
  }

  // Render Pending Dispatch Dashboard if pendingDates exists
  if (pendingData && pendingData.pendingDates) {
    const { pendingDates, grandTotalQty, totalPendingOrders } = pendingData;
    const maxQty = Math.max(0, ...pendingDates.map(d => d.totalQty));
    const peakDay = pendingDates.find(d => d.totalQty === maxQty) || pendingDates[0];
    const avgQtyPerDay = pendingDates.length > 0 ? (grandTotalQty / pendingDates.length).toFixed(1) : 0;

    return (
      <div className="min-h-screen text-gray-900 font-sans p-4 sm:p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* HEADER */}
          <header className="border-b border-gray-200 pb-5 flex flex-col sm:flex-row justify-between items-center gap-y-4 sm:gap-y-0">
            <div className="space-y-1.5 text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Vinayak Enterprises</h1>
              <p className="text-gray-700 text-md font-bold">Sales Team Dashboard — Pending Dispatch Summary</p>
            </div>
            {/* <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                Live Data Connected
              </span>
            </div> */}
          </header>

          {/* CARDS SECTION */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800 capitalize">Total Pending Orders</span>
                <div className="bg-blue-50 p-2 rounded-lg">
                  <ShoppingBag className='text-blue-600 size-6' />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xl font-black text-gray-900">
                  {totalPendingOrders} Orders
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800 capitalize">Total Pending Dispatch Quantity</span>
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <Layers className='text-emerald-600 size-6' />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xl font-black text-gray-900">
                  {grandTotalQty} MT
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800 capitalize">Date With Most Dispatch Ordes</span>
                <div className="bg-amber-50 p-2 rounded-lg">
                  <TrendingUp className='text-amber-600 size-6' />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xl font-bold text-gray-900 truncate" title={peakDay?.dispatchDate}>
                  {peakDay?.dispatchDate || 'N/A'}
                </p>
                <span className="text-xl text-amber-600 font-bold">
                  {peakDay?.totalQty || 0} MT
                </span>
              </div>
            </div>
          </section>

          <div className="space-y-8">

            {/* TABLE UI: STYLED JUST LIKE "Production Hours Lost Overview" SECTION */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-white">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Pending Dispatch Overview
                </h2>
              </div>

              {pendingDates.length === 0 ? (
                <p className="text-gray-500 italic p-6">No pending dispatches recorded.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pendingDates.map((day) => {
                    const isExpanded = expandedDay === day.dispatchDate;
                    const isHighQty = day.totalQty > 75;
                    const weekday = getWeekdayFromDateStr(day.dispatchDate);
                    const ordersList = day.orders || (day.orderIds ? day.orderIds.map(id => ({ orderId: id, clientName: 'Unknown', qty: (day.totalQty / (day.orderCount || 1)).toFixed(1) })) : []);
                    const count = day.orderCount || ordersList.length;

                    return (
                      <div key={day.dispatchDate} className="group flex flex-col">
                        <button
                          type="button"
                          onClick={() => setExpandedDay(isExpanded ? null : day.dispatchDate)}
                          aria-expanded={isExpanded}
                          className={`w-full flex items-center justify-between py-4 px-6 transition-colors duration-200 text-left focus:outline-none ${isHighQty
                            ? `bg-red-50/80 border-l-4 border-red-500 ${isExpanded ? 'bg-red-200/90' : ''} hover:bg-red-200/90 cursor-pointer`
                            : `hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <ChevronRight
                              className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isHighQty
                                ? `text-red-500 group-hover:text-red-600 ${isExpanded ? 'rotate-90 text-red-600' : ''}`
                                : `text-gray-400 group-hover:text-gray-500 ${isExpanded ? 'rotate-90 text-gray-600' : ''}`
                                }`}
                            />
                            {weekday && (
                              <span className={`font-bold text-sm w-12 sm:w-16 ${isHighQty ? 'text-red-950' : 'text-gray-700'}`}>
                                {weekday}
                              </span>
                            )}
                            <span className={`font-medium text-sm ${isHighQty ? 'text-red-800' : 'text-gray-700'}`}>
                              {day.dispatchDate}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 sm:gap-8 lg:gap-12">
                            <span className={`hidden sm:inline-flex items-center justify-center font-semibold px-2.5 py-1 rounded-full text-xs ${isHighQty ? 'bg-red-100/80 text-amber-900' : 'bg-blue-50 text-blue-700'}`}>
                              {count} {count === 1 ? 'Order' : 'Orders'}
                            </span>
                            <span className={`font-semibold text-right ${isHighQty ? 'text-red-950' : 'text-gray-700'}`}>
                              {day.totalQty} MT
                            </span>
                          </div>
                        </button>

                        <div
                          className={`transition-all duration-300 ease-in-out overflow-hidden bg-gray-50/50 ${isExpanded ? 'max-h-250 opacity-100 border-b border-gray-100' : 'max-h-0 opacity-0 pointer-events-none'
                            }`}
                        >
                          {/* Nested Table for Detailed Orders */}
                          <div className="mx-6 sm:mx-12 my-6 border border-gray-200 rounded-lg overflow-x-auto shadow-sm bg-white">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="px-5 py-3.5 font-semibold text-gray-600">Order ID</th>
                                  <th className="px-5 py-3.5 font-semibold text-gray-600">Client Name</th>
                                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-center">SO ID</th>
                                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-right">Quantity (MT)</th>
                                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-right">Bundle</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {ordersList.map((order, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                                    <td className="px-5 py-3.5">
                                      <div className="flex items-center gap-2">
                                        <Package className="size-4 text-indigo-500 shrink-0" />
                                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded text-xs font-semibold font-mono">
                                          {order.orderId}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-700 text-sm font-bold">
                                      {order.clientName}
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                      {order.soId ? (
                                        <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded text-xs font-mono font-semibold">
                                          #{order.soId}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400 text-xs italic">-</span>
                                      )}
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-bold text-gray-700">
                                      {order.qty} MT
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-bold text-gray-700">
                                      {calculateBundle(order.qty)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>



          </div>
        </div>
      </div>
    );
  }

  // Fallback for weekly production data if API emits production data structure
  if (weeklyData.length === 0) return <div className="p-8 text-center text-gray-500">No data available.</div>;

  const currentWeekIndex = weeklyData.findIndex(w => w.week === selectedWeek);
  const currentWeek = currentWeekIndex !== -1 ? weeklyData[currentWeekIndex] : weeklyData[weeklyData.length - 1];

  const topOperator = currentWeek.operatorMatrix?.length > 0 ? currentWeek.operatorMatrix[0] : { name: 'None', total: 0 };
  const topFault = currentWeek.whereTheHoursWent?.length > 0 ? currentWeek.whereTheHoursWent[0] : { name: 'None', hours: 0, occurrences: 0 };
  const totalCuts = currentWeek.totalCuts ?? 0;
  const faultCategories = (currentWeek.whereTheHoursWent || []).map(f => f.name);

  const operatorRows = (() => {
    const byName = {};
    (currentWeek.operatorMatrix || []).forEach(op => {
      byName[op.name] = { name: op.name, total: op.total, breakdown: op.breakdown || {}, cuts: 0 };
    });
    (currentWeek.operatorCuts || []).forEach(op => {
      if (byName[op.name]) {
        byName[op.name].cuts = op.cuts;
      } else {
        byName[op.name] = { name: op.name, total: 0, breakdown: {}, cuts: op.cuts };
      }
    });
    return Object.values(byName);
  })();

  const mostFrequentIncident = (() => {
    let maxTotal = 0;
    let maxCategory = 'None';

    faultCategories.forEach(category => {
      const catTotal = operatorRows.reduce((sum, op) => sum + (op.breakdown?.[category] || 0), 0);
      if (catTotal > maxTotal) {
        maxTotal = catTotal;
        maxCategory = category;
      }
    });

    return { name: maxCategory, total: maxTotal };
  })();

  const generateWeekDates = (startMondayStr) => {
    if (!startMondayStr) return [];
    const dates = [];
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const parts = startMondayStr.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return [];
    const [year, month, day] = parts;
    const baseDate = new Date(year, month - 1, day);
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);

      const formatStandard = `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}`;
      const formatAlternative = `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;

      dates.push({
        weekday: weekdays[i],
        dateLabel: formatStandard,
        dateLabelAlt: formatAlternative
      });
    }
    return dates;
  };

  const dailyIssueData = currentWeek ? generateWeekDates(currentWeek.week).map(day => {
    const source = currentWeek.dailyIssueBreakdown || [];
    const record = source.find(d => d.date === day.dateLabel || d.date === day.dateLabelAlt);
    return {
      ...day,
      productionHoursLost: record?.productionHoursLost ?? 0,
      issues: record?.issues ?? []
    };
  }) : [];

  const maxDayHours = Math.max(0, ...dailyIssueData.map(d => d.productionHoursLost));
  const hasAnyDailyIssues = dailyIssueData.some(d => d.issues.length > 0);

  const currentMonthKey = currentWeek?.week ? getWeekMajorityMonth(currentWeek.week) : "";
  const currentMonthWeeks = weeklyData.filter(w => w.week && doesWeekOverlapMonth(w.week, currentMonthKey));

  return (
    <div className="min-h-screen text-gray-900 font-sans p-4 sm:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <header className="border-b border-gray-200 pb-5 flex flex-col sm:flex-row justify-between items-center gap-y-4 sm:gap-y-0">
          <div className="space-y-1.5 text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Vinayak Enterprises</h1>
            <p className="text-gray-700 text-md font-bold">Weekly Production Report</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative inline-block text-left z-20 pt-1">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-x-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 cursor-pointer"
                id="menu-button"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <svg className="h-4.5 w-4.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Week of {formatWeekDate(currentWeek.week)}</span>
                <svg className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.041l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                  <div className="absolute right-0 sm:left-0 z-20 mt-2 w-60 origin-top-right sm:origin-top-left rounded-lg bg-white shadow-lg ring-1 ring-gray-200 ring-opacity-5 focus:outline-none transition-all duration-200">
                    <div className="py-1" role="none">
                      {currentMonthWeeks.map((w) => {
                        const isSelected = w.week === selectedWeek;
                        return (
                          <button
                            key={w.week}
                            onClick={() => {
                              setSelectedWeek(w.week);
                              setDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 flex items-center justify-between cursor-pointer ${isSelected ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            role="menuitem"
                          >
                            <span>Week of {formatWeekDate(w.week)}</span>
                            {isSelected && <Check className="h-4 w-4 text-gray-900" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* CARDS SECTION */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800 capitalize">Total Production Hours Lost</span>
              <div className="bg-red-50 p-2 rounded-lg">
                <ClockFading className='text-red-500 size-6' />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xl font-black text-gray-900">
                {formatTime(currentWeek.totalProductionHoursLost)}
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800 capitalize">Top Production Loss Incident</span>
              <div className="bg-amber-50 p-2 rounded-lg">
                <TriangleAlert className='text-amber-500 size-6' />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xl font-bold text-gray-900 truncate" title={topFault.name}>
                {topFault.name !== 'None' ? topFault.name : 'No Faults'}
              </p>
              {topFault.name !== 'None' ? (
                <span className="text-xs text-red-500 font-bold">
                  {formatTime(topFault.hours)} lost
                </span>
              ) : (
                <span className="text-xs text-gray-400">
                  No recorded incidents
                </span>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800 capitalize">Operator with Most Incidents</span>
              <div className="bg-purple-50 p-2 rounded-lg">
                <User2 className='text-purple-500 size-6' />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xl font-black text-gray-900">
                {topOperator.name !== 'None' ? topOperator.name : 'N/A'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800 capitalize">Most Frequent Issue</span>
              <div className="bg-blue-50 p-2 rounded-lg">
                <Activity className='text-red-500 size-6' />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xl font-bold text-gray-900 truncate" title={mostFrequentIncident.name !== 'None' ? mostFrequentIncident.name : 'No Incidents'}>
                {mostFrequentIncident.name !== 'None' ? getCleanMainIssue(mostFrequentIncident.name) : 'No Incidents'}
              </p>
              {mostFrequentIncident.name !== 'None' ? (
                <span className="text-xs text-red-600 font-bold">
                  {mostFrequentIncident.total} {mostFrequentIncident.total === 1 ? 'incident' : 'incidents'}
                </span>
              ) : (
                <span className="text-xs text-gray-400">
                  No recorded incidents
                </span>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800 capitalize">Cuts In Week</span>
              <div className="bg-emerald-50 p-2 rounded-lg">
                <Scissors className='text-emerald-500 size-6' />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xl font-black tracking-tight text-gray-900">
                {totalCuts} cuts
              </p>
            </div>
          </div>
        </section>

        <div className="space-y-8">
          {/* Hours Lost Overview Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-white">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Production Hours Lost Overview
              </h2>
            </div>

            {!hasAnyDailyIssues ? (
              <p className="text-gray-500 italic p-6">No specific faults recorded this week.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {dailyIssueData.map((day) => {
                  const isExpanded = expandedDay === day.dateLabel;
                  const hasIssues = day.issues.length > 0;
                  const isHighestDay = hasIssues && maxDayHours > 0 && day.productionHoursLost === maxDayHours;
                  const eventCount = day.issues.reduce((sum, i) => sum + i.occurrences, 0);

                  return (
                    <div key={day.dateLabel} className="group flex flex-col">
                      <button
                        type="button"
                        onClick={() => hasIssues && setExpandedDay(isExpanded ? null : day.dateLabel)}
                        disabled={!hasIssues}
                        aria-expanded={isExpanded}
                        className={`w-full flex items-center justify-between py-4 px-6 transition-colors duration-200 text-left focus:outline-none ${isHighestDay
                          ? `bg-amber-50/80 border-l-4 border-amber-500 ${isExpanded ? 'bg-amber-100/90' : ''} ${hasIssues ? 'hover:bg-amber-100/90 cursor-pointer' : ''}`
                          : `${hasIssues ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default bg-gray-50/50'} ${isExpanded ? 'bg-gray-50' : ''}`
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          {hasIssues ? (
                            <ChevronRight
                              className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isHighestDay
                                ? `text-amber-500 group-hover:text-amber-600 ${isExpanded ? 'rotate-90 text-amber-600' : ''}`
                                : `text-gray-400 group-hover:text-blue-500 ${isExpanded ? 'rotate-90 text-blue-600' : ''}`
                                }`}
                            />
                          ) : (
                            <span className="h-5 w-5 shrink-0" />
                          )}
                          <span className={`font-bold text-sm w-12 sm:w-16 ${hasIssues ? (isHighestDay ? 'text-amber-950' : 'text-gray-900') : 'text-gray-400'}`}>
                            {day.weekday}
                          </span>
                          <span className={`font-medium text-sm ${hasIssues ? (isHighestDay ? 'text-amber-800' : 'text-gray-600') : 'text-gray-400'}`}>
                            {day.dateLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-8">
                          {hasIssues ? (
                            <span className={`hidden sm:inline-flex items-center justify-center font-semibold px-2.5 py-1 rounded-full text-xs ${isHighestDay ? 'bg-amber-200/80 text-amber-900' : 'bg-blue-50 text-blue-700'}`}>
                              {eventCount} {eventCount === 1 ? 'event' : 'events'}
                            </span>
                          ) : (
                            <span className="hidden sm:inline text-gray-400 text-xs italic">No faults</span>
                          )}
                          <span className={`font-bold text-right ${hasIssues ? (isHighestDay ? 'text-amber-950' : 'text-gray-900') : 'text-gray-400'}`}>
                            {formatTime(day.productionHoursLost)}
                          </span>
                        </div>
                      </button>

                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden bg-gray-50/50 ${isExpanded ? 'max-h-250 opacity-100 border-b border-gray-100' : 'max-h-0 opacity-0 pointer-events-none'
                          }`}
                      >
                        <div className="mx-6 sm:mx-12 my-6 border border-gray-200 rounded-lg overflow-x-auto shadow-sm bg-white">
                          <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-5 py-3.5 font-semibold text-gray-600">Issue Description</th>
                                <th className="px-5 py-3.5 font-semibold text-gray-600 text-center">Occurrences</th>
                                <th className="px-5 py-3.5 font-semibold text-gray-600">Operator(s)</th>
                                <th className="px-5 py-3.5 font-semibold text-gray-600 text-right">Time Lost</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {day.issues.map((issue, idx) => {
                                const unattributed = isUnattributedIssue(issue.name);
                                return (
                                  <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                                    <td className="px-5 py-3.5">
                                      <div className="flex items-center gap-2.5">
                                        {unattributed ? (
                                          <TriangleAlert className="size-4 text-amber-500 shrink-0" />
                                        ) : (
                                          <CirclePause className="size-4 text-gray-400 shrink-0" />
                                        )}
                                        <span className={`font-semibold text-sm ${unattributed ? 'text-amber-700 italic' : 'text-gray-800'}`}>
                                          {issue.name}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                      <span className="inline-flex items-center justify-center bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">
                                        {issue.occurrences}x
                                      </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                      <div className="flex flex-wrap gap-1.5">
                                        {issue.operators.length === 0 ? (
                                          <span className="text-gray-400 text-xs italic">Unknown</span>
                                        ) : (
                                          issue.operators.map((op) => (
                                            <span key={op} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded text-xs font-semibold">
                                              {op}
                                            </span>
                                          ))
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-bold text-gray-700">
                                      {formatTime(issue.productionHoursLost)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}