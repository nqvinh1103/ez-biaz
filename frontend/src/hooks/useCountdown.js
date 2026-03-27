import { useEffect, useRef, useState } from "react";

/**
 * Counts down from `initialSeconds`, ticking every second.
 * Automatically clears the interval when it reaches 0 or the component unmounts.
 *
 * @param {number} initialSeconds
 * @returns {{ hours: number, minutes: number, secs: number, total: number }}
 */
export function useCountdown(initialSeconds) {
  const [total, setTotal] = useState(initialSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTotal((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []); // intentionally empty — timer is started once on mount

  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    secs: total % 60,
    total,
  };
}
