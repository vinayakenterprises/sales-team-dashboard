import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardView from './DashboardView';

const VINAYAK_API_URL =
  import.meta.env.VITE_VINAYAK_API_URL ||
  import.meta.env.VITE_API_URL ||
  'https://script.google.com/macros/s/AKfycbycMUDA0qy9KnMBzEY8jUIYE-GnyWhk_CFv4dky4767b0k4fGmC_KFoKQNQzG4wwkvK/exec';

export default function VinayakTab({ isActive, onLoadingChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const performFetch = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setLoading(true);
    setError(null);
    if (onLoadingChange) onLoadingChange(true);

    try {
      const response = await fetch(VINAYAK_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      if (result && (result.pendingDates || result.totalPendingOrders !== undefined)) {
        setData(result);
      } else {
        throw new Error('Invalid data format received from Vinayak API');
      }
    } catch (err) {
      console.error('Vinayak fetch error:', err);
      setError(err.message || 'Failed to fetch Vinayak sales data');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
      if (onLoadingChange) onLoadingChange(false);
    }
  }, [onLoadingChange]);

  useEffect(() => {
    if (isActive && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      performFetch();
    }
  }, [isActive, performFetch]);

  return (
    <div className={isActive ? 'block' : 'hidden'}>
      <DashboardView
        pendingData={data}
        loading={loading}
        error={error}
        onRetry={performFetch}
      />
    </div>
  );
}
