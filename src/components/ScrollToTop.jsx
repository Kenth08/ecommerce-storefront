import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Resets the window scroll to the top whenever the route changes,
// so navigating to a new page never lands you mid-scroll.
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
