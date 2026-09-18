// Date and calculation utility functions for Sales Dashboard

export const getWeekdayFromDateStr = (dateStr) => {
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

export const parseDateStr = (dateStr) => {
  if (!dateStr) return null;
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
  if (!d || isNaN(d.getTime())) return null;
  return d;
};

export const calculateBundle = (val) => {
  if (val % 3 === 0) {
    return val / 3;
  } else if (val > 3) {
    return Math.round(val / 3);
  } else {
    return 'N/A';
  }
};

export const calculateDashboardMetrics = (pendingDates = []) => {
  const maxQty = pendingDates.length > 0 ? Math.max(0, ...pendingDates.map(d => d.totalQty || 0)) : 0;
  const peakDay = pendingDates.find(d => (d.totalQty || 0) === maxQty) || pendingDates[0] || null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let overdueOrdersCount = 0;
  let overdueQty = 0;

  pendingDates.forEach(day => {
    const pDate = parseDateStr(day.dispatchDate);
    if (pDate) {
      pDate.setHours(0, 0, 0, 0);
      if (pDate < today) {
        overdueOrdersCount += day.orderCount || (day.orders ? day.orders.length : 0);
        overdueQty += day.totalQty || 0;
      }
    }
  });

  const overdueQtyFormatted = Number(overdueQty.toFixed(2));

  return {
    peakDay,
    overdueOrdersCount,
    overdueQtyFormatted
  };
};
