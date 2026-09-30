// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Debounce ค่า — return ค่าหลังจากหยุดเปลี่ยนแล้ว delay ms
 * @param {any} value - ค่าที่จะ debounce
 * @param {number} delay - ระยะเวลา (ms) — default 400
 */
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}