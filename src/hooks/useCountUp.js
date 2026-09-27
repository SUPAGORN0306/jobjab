import { useState, useEffect, useRef } from 'react';

/**
 * useCountUp — animate number from 0 → target
 * @param {number} target - ปลายทาง
 * @param {number} duration - milliseconds (default 800)
 */
export default function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (target === null || target === undefined) {
      setValue(0);
      return;
    }

    const startVal = 0;
    const endVal = Number(target) || 0;

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = Math.round(startVal + (endVal - startVal) * eased);

      setValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [target, duration]);

  return value;
}
