import { useState, useEffect } from 'react';

/**
 * Debounce a value, returning it after delay ms without changes.
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds (default 400)
 */
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}