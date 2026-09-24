/**
 * usePageTitle — ตั้งชื่อหน้า + meta description อัตโนมัติ
 *
 * @param {string} title - ชื่อหน้า (ไม่ต้องรวม "JobJab")
 * @param {object} options - { description }
 *
 * ตัวอย่าง:
 *   usePageTitle("หน้าหลัก", { description: "ค้นหางานที่ใช่สำหรับคุณ" });
 */
import { useEffect } from 'react';

const DEFAULT_TITLE = 'JobJab';
const DEFAULT_DESCRIPTION = 'JobJab แพลตฟอร์มหางานอัจฉริยะ';

export default function usePageTitle(title, options = {}) {
  useEffect(() => {
    // 1. Set title
    const prevTitle = document.title;
    document.title = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;

    // 2. Set meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content') || '';

    if (metaDesc) {
      metaDesc.setAttribute('content', options.description || DEFAULT_DESCRIPTION);
    }

    // 3. Cleanup — คืนค่าเดิมเมื่อ unmount
    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) {
        metaDesc.setAttribute('content', prevDesc);
      }
    };
  }, [title, options.description]);
}
