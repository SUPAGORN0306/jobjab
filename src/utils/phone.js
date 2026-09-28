/**
 * phone.js — Phone formatting utilities
 *
 * Format: +<country_code> <digits>
 * Examples:
 *   +66891234567     → +66 912345678
 *   +66 91 234 5678  → +66 912345678
 *   +66 638211862    → +66 638211862
 *   +1-789-012-3456  → +1 7890123456
 */

const COUNTRY_CODES = ['66', '1', '65', '60', '84', '81', '86', '44', '61'];

/**
 * formatPhone — แสดงผลแบบ +<cc> <digits>
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';

  for (const cc of COUNTRY_CODES) {
    if (digits.startsWith(cc)) {
      const rest = digits.slice(cc.length);
      if (rest.length >= 8 && rest.length <= 11) {
        return `+${cc} ${rest}`;
      }
    }
  }
  return `+${digits}`;
}

/**
 * normalizePhone — normalize เป็น +<cc><digits> (สำหรับ save DB)
 */
export function normalizePhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  return `+${digits}`;
}

/**
 * isValidPhone — ตรวจ 8-15 หลักหลัง country code
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}
