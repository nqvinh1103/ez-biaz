/**
 * useApi.js
 * Generic hook for calling any API function.
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi(getProducts);
 *   useEffect(() => { execute({ fandom: "BTS" }); }, [execute]);
 */
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * @param {Function} apiFn        - any function from ezbiasApi.js
 * @param {{ immediate?: boolean }} opts
 */
export function useApi(apiFn, { immediate = false } = {}) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError]     = useState(null);
  const mountedRef            = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFn(...args);
        if (!mountedRef.current) return result;

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message);
        }
        return result;
      } catch (err) {
        const msg = err?.message ?? "An unexpected error occurred.";
        if (mountedRef.current) setError(msg);
        return { success: false, data: null, message: msg };
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [apiFn],
  );

  useEffect(() => {
    if (immediate) execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error, execute, setData };
}
