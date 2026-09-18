import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardView from './DashboardView';

const RAW_URL =
  import.meta.env.VITE_MITTALU_API_URL ||
  'https://script.google.com/macros/s/AKfycbzBV1DqvQtPeh_s1UT61t9oWKoe_dFUTxje5zf9XxGYRNX7fN9aBUG-IlzEI6O-Erjf/exec';

// Normalize workspace URL format (removes '/a/macros/<domain>/' prefix to match standard public web app endpoint)
const MITTALU_API_URL = RAW_URL.replace(/\/a\/macros\/[^/]+\/s\//, '/macros/s/');

export default function MittaluTab({ isActive, onLoadingChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
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
      const response = await fetch(MITTALU_API_URL, {
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (parseErr) {
        if (text.includes('accounts.google.com') || text.includes('Sign in')) {
          throw new Error(
            'Google Apps Script requires authentication. In your Google Apps Script Deployment settings, change "Who has access" to "Anyone".',
            { cause: parseErr }
          );
        }
        throw new Error('Invalid JSON response received from Mittalu API endpoint.', { cause: parseErr });
      }

      if (result && (result.pendingDates || result.totalPendingOrders !== undefined)) {
        setData(result);
      } else {
        throw new Error('Invalid data format received from Mittalu API');
      }
    } catch (err) {
      console.error('Mittalu fetch error:', err);
      // Detailed user guidance if CORS blocks the request
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        setError(
          'CORS Error: Google blocked this request because the Mittalu Web App is currently restricted to organization users. In Google Apps Script -> Deploy -> Manage Deployments, set "Who has access" to "Anyone", then re-deploy.'
        );
      } else {
        setError(err.message || 'Failed to fetch Mittalu sales data');
      }
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
