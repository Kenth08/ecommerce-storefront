import { useEffect } from 'react'

const BASE_TITLE = 'Ecomify'

/**
 * Sets document.title to "<title> — Ecomify" while the component is mounted,
 * and restores the base title on unmount.
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE_TITLE}` : BASE_TITLE
    return () => {
      document.title = BASE_TITLE
    }
  }, [title])
}
