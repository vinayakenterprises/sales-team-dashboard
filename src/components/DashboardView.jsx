import { useState } from 'react';
import {
  Clock as ClockFading,
  ChevronRight,
  Package,
  ShoppingBag,
  TrendingUp,
  Layers,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  getWeekdayFromDateStr,
  calculateBundle,
  calculateDashboardMetrics
} from '../utils/helpers';

export default function DashboardView({
  pendingData,
  loading,
  error,
  onRetry
}) {
  const [expandedDay, setExpandedDay] = useState(null);

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-white/70 backdrop-blur p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-12 h-12 animate-spin text-gray-200 fill-blue-600"
              viewBox="0 0 100 101"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
          <p className="text-sm font-medium text-gray-500 animate-pulse">
            Fetching latest sales dispatch data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="max-w-md w-full border border-red-200 bg-red-50/80 backdrop-blur p-6 rounded-2xl shadow-sm text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-red-100 text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-red-900">Failed to load data</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!pendingData || !pendingData.pendingDates) {
    return (
      <div className="py-16 text-center">
        <div className="max-w-md mx-auto bg-white border border-gray-200 p-8 rounded-2xl shadow-sm space-y-3">
          <Package className="w-10 h-10 text-gray-400 mx-auto" />
          <p className="text-gray-600 font-medium">No pending dispatch data available.</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          )}
        </div>
      </div>
    );
  }

  const { pendingDates, grandTotalQty, totalPendingOrders } = pendingData;
  const { peakDay, overdueOrdersCount, overdueQtyFormatted } = calculateDashboardMetrics(pendingDates);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* CARDS SECTION */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800 capitalize">Total Pending Orders</span>
            <div className="bg-blue-50 p-2.5 rounded-xl">
              <ShoppingBag className="text-blue-600 size-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-gray-900 tracking-tight">
              {totalPendingOrders ?? 0} Orders
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800 capitalize">Total Pending Dispatch Quantity</span>
            <div className="bg-emerald-50 p-2.5 rounded-xl">
              <Layers className="text-emerald-600 size-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-gray-900 tracking-tight">
              {grandTotalQty ?? 0} MT
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800 capitalize">Delay Dispatch Till Date</span>
            <div className="bg-rose-50 p-2.5 rounded-xl">
              <ClockFading className="text-rose-600 size-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-2xl font-black text-gray-900 tracking-tight">
              {overdueOrdersCount} Orders
            </p>
            <span className="text-lg text-rose-600 font-bold">
              {overdueQtyFormatted} MT
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800 capitalize">Date With Most Dispatch Orders</span>
            <div className="bg-amber-50 p-2.5 rounded-xl">
              <TrendingUp className="text-amber-600 size-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-2">
            <p className="text-lg sm:text-xl font-bold text-gray-900 truncate" title={peakDay?.dispatchDate}>
              {peakDay?.dispatchDate || 'N/A'}
            </p>
            <span className="text-xl text-amber-600 font-bold shrink-0">
              {peakDay?.totalQty || 0} MT
            </span>
          </div>
        </div>
      </section>

      {/* TABLE UI */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-white flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider">
            Pending Dispatch Overview
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            {pendingDates.length} {pendingDates.length === 1 ? 'dispatch date' : 'dispatch dates'}
          </span>
        </div>

        {pendingDates.length === 0 ? (
          <p className="text-gray-500 italic p-6">No pending dispatches recorded.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingDates.map((day) => {
              const isExpanded = expandedDay === day.dispatchDate;
              const isHighQty = (day.totalQty || 0) > 75;
              const weekday = getWeekdayFromDateStr(day.dispatchDate);
              const ordersList =
                day.orders ||
                (day.orderIds
                  ? day.orderIds.map((id) => ({
                      orderId: id,
                      clientName: 'Unknown',
                      qty: (day.totalQty / (day.orderCount || 1)).toFixed(1),
                    }))
                  : []);
              const count = day.orderCount || ordersList.length;

              return (
                <div key={day.dispatchDate} className="group flex flex-col">
                  <button
                    type="button"
                    onClick={() => setExpandedDay(isExpanded ? null : day.dispatchDate)}
                    aria-expanded={isExpanded}
                    className={`w-full flex items-center justify-between py-4 px-6 transition-colors duration-200 text-left focus:outline-none ${
                      isHighQty
                        ? `bg-red-400 border-l-4 border-red-500 ${isExpanded ? 'bg-red-400' : ''} hover:bg-red-400/90 cursor-pointer`
                        : `hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <ChevronRight
                        className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                          isHighQty
                            ? `text-red-200 group-hover:text-red-200 ${isExpanded ? 'rotate-90 text-red-600' : ''}`
                            : `text-gray-400 group-hover:text-gray-500 ${isExpanded ? 'rotate-90 text-gray-600' : ''}`
                        }`}
                      />
                      {weekday && (
                        <span
                          className={`font-bold text-sm w-12 sm:w-16 ${
                            isHighQty ? 'text-red-950' : 'text-gray-700'
                          }`}
                        >
                          {weekday}
                        </span>
                      )}
                      <span className={`font-medium text-sm ${isHighQty ? 'text-red-800' : 'text-gray-700'}`}>
                        {day.dispatchDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-8 lg:gap-12">
                      <span
                        className={`hidden sm:inline-flex items-center justify-center font-semibold px-2.5 py-1 rounded-full text-xs ${
                          isHighQty ? 'bg-red-200 text-amber-900' : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {count} {count === 1 ? 'Order' : 'Orders'}
                      </span>
                      <span className={`font-semibold text-right ${isHighQty ? 'text-red-950' : 'text-gray-700'}`}>
                        {day.totalQty} MT
                      </span>
                    </div>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden bg-gray-50/50 ${
                      isExpanded
                        ? 'max-h-[1000px] opacity-100 border-b border-gray-100'
                        : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    {/* Nested Table for Detailed Orders */}
                    <div className="mx-4 sm:mx-12 my-6 border border-gray-200 rounded-lg overflow-x-auto shadow-sm bg-white">
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
  );
}
