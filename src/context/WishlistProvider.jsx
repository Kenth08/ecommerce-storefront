import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'
import { WishlistContext } from './WishlistContext'

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState(() => {
    // Safely load saved favorites; never let corrupt storage crash the app.
    try {
      const saved = localStorage.getItem('wishlist')
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items))
  }, [items])

  function isWished(productId) {
    return items.some((p) => p.id === productId)
  }

  // Idempotent add — used when the fly-to-nav preview lands. Safe to call
  // twice (a rapid double-click won't create a duplicate entry).
  function addToWishlist(product) {
    if (!user) {
      toast('Log in to save items to your wishlist', { icon: '🔒', id: 'wishlist' })
      return
    }
    // Dedup against the LATEST state (prev), not a stale render-closure copy,
    // so a burst of rapid adds can never insert the same product twice.
    setItems((prev) => (prev.some((p) => p.id === product.id) ? prev : [...prev, product]))
    toast(`${product.name} added to wishlist`, { icon: '❤️', id: 'wishlist' })
  }

  function toggleWishlist(product) {
    // Wishlist is an account feature — require login to save items.
    if (!user) {
      toast('Log in to save items to your wishlist', { icon: '🔒', id: 'wishlist' })
      return
    }
    // Decide add vs. remove OUTSIDE the state updater, so the toast fires
    // once (React may call state updaters twice in development).
    const alreadyWished = items.some((p) => p.id === product.id)
    if (alreadyWished) {
      setItems((prev) => prev.filter((p) => p.id !== product.id))
      toast(`${product.name} removed from wishlist`, { icon: '🤍', id: 'wishlist' })
    } else {
      // Idempotent add: dedup against latest state so a rapid double-click
      // resolves to a single entry, not two.
      setItems((prev) => (prev.some((p) => p.id === product.id) ? prev : [...prev, product]))
      toast(`${product.name} added to wishlist`, { icon: '❤️', id: 'wishlist' })
    }
  }

  function removeFromWishlist(productId) {
    setItems((prev) => prev.filter((p) => p.id !== productId))
  }

  function clearWishlist() {
    setItems([])
  }

  return (
    <WishlistContext.Provider value={{ items, isWished, toggleWishlist, addToWishlist, removeFromWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}
