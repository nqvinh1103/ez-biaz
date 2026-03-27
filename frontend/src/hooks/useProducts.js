/**
 * useProducts.js
 * Fetches and filters products from the mock API.
 *
 * Usage:
 *   const { products, loading, error, refetch } = useProducts({ fandom: "BTS" });
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { getProducts } from "../lib/ezbiasApi";

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  // Stable JSON key so useEffect only re-runs when filters actually change
  const filtersKey = JSON.stringify(filters);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetch = useCallback(async (overrideFilters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts(overrideFilters ?? JSON.parse(filtersKey));
      if (!mountedRef.current) return;
      if (res.success) setProducts(res.data);
      else setError(res.message);
    } catch (err) {
      if (mountedRef.current) setError(err.message ?? "Failed to load products.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => { fetch(); }, [fetch]);

  return { products, loading, error, refetch: fetch };
}
