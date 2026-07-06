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
      setItems((prev) => [...prev, product])
      toast(`${product.name} added to wishlist`, { icon: '❤️', id: 'wishlist' })
    }
  }

  function removeFromWishlist(productId) {
    setItems((prev) => prev.filter((p) => p.id !== productId))
  }

  return (
    <WishlistContext.Provider value={{ items, isWished, toggleWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}
