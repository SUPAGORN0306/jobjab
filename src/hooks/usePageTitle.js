/**
 * Automatically set the document title and meta description.
 * @param {string} title - Page title (excluding "JobJab")
 * @param {object} options - Options object with optional description
 */
import { useEffect } from 'react';

const DEFAULT_TITLE = 'JobJab';
const DEFAULT_DESCRIPTION = 'JobJab - AI-powered job matching';

export default function usePageTitle(title, options = {}) {
  useEffect(() => {
    // Set title
    const prevTitle = document.title;
    document.title = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;

    // Set meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content') || '';

    if (metaDesc) {
      metaDesc.setAttribute('content', options.description || DEFAULT_DESCRIPTION);
    }

    // Cleanup: restore previous values on unmount
    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) {
        metaDesc.setAttribute('content', prevDesc);
      }
    };
  }, [title, options.description]);
}
