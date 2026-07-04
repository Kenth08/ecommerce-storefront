import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Resets the window scroll to the top whenever the route changes,
// so navigating to a new page never lands you mid-scroll.
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // 'instant' overrides the global smooth scroll-behavior, so navigating to a
    // new page jumps to the top immediately instead of animating a long scroll.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
