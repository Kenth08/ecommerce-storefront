import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'
import { getPrimaryImage } from '../utils/productHelpers'
import * as cartApi from '../api/cart'
import { CartContext } from './CartContext'

const GUEST_CART_KEY = 'cart'
const PRODUCT_INFO_KEY = 'cartProductInfo'

// Safe JSON read from localStorage.
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : fallback
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

// Local map of variantId -> display info the SERVER cart doesn't return
// (name/image/slug). We fill it whenever an item is added.
function readProductInfo() {
  const val = readJSON(PRODUCT_INFO_KEY, {})
  return val && typeof val === 'object' ? val : {}
}

function rememberProduct(variantId, info) {
  const map = readProductInfo()
  map[variantId] = info
  localStorage.setItem(PRODUCT_INFO_KEY, JSON.stringify(map))
}

// Fill name/image/slug the server omits, from our local product-info map.
// (mapCartItem already uses the real fields if/when the backend adds them.)
function hydrate(serverItems) {
  const info = readProductInfo()
  return serverItems.map((it) => {
    const extra = info[it.variantId] || {}
    return {
      ...it,
      name: it.name || extra.name || 'Product',
      image: it.image || extra.image || '/placeholder-product.svg',
      slug: it.slug || extra.slug || null,
      productId: extra.productId ?? null,
    }
  })
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  // Start from the guest cart; the server cart loads once we know the user.
  const [items, setItems] = useState(() => readJSON(GUEST_CART_KEY, []))
  const [loading, setLoading] = useState(false)
  const syncedUserRef = useRef(null)

  // Persist ONLY the guest cart to localStorage (never the server cart).
  useEffect(() => {
    if (!user) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
    }
  }, [items, user])

  const refreshServerCart = useCallback(async () => {
    const cart = await cartApi.getCart()
    setItems(hydrate(cart.items))
  }, [])

  // React to auth changes: guest -> localStorage; logged in -> merge + load server.
  useEffect(() => {
    async function syncCart() {
      if (!user) {
        syncedUserRef.current = null
        setItems(readJSON(GUEST_CART_KEY, []))
        return
      }

      const uid = user.id ?? user.email ?? 'me'
      if (syncedUserRef.current === uid) return // avoid re-syncing the same user
      syncedUserRef.current = uid

      setLoading(true)
      try {
        // Merge any guest items into the server cart, then clear the guest cart.
        const guest = readJSON(GUEST_CART_KEY, [])
        for (const it of guest) {
          rememberProduct(it.variantId, {
            name: it.name,
            slug: it.slug,
            image: it.image,
            productId: it.productId,
          })
          await cartApi.addCartItem(it.variantId, it.quantity)
        }
        if (guest.length > 0) localStorage.removeItem(GUEST_CART_KEY)
        await refreshServerCart()
      } catch {
        toast.error('Could not sync your cart.')
      } finally {
        setLoading(false)
      }
    }
    syncCart()
  }, [user, refreshServerCart])

  function findItem(variantId) {
    return items.find((it) => it.variantId === variantId)
  }

  async function addToCart(product, variant, quantity = 1) {
    if (!user) {
      // Guest: local cart (unchanged behavior).
      setItems((prev) => {
        const existing = prev.find((item) => item.variantId === variant.id)
        if (existing) {
          return prev.map((item) =>
            item.variantId === variant.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        }
        return [
          ...prev,
          {
            variantId: variant.id,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            size: variant.size,
            color: variant.color,
            price: Number(variant.price),
            image: getPrimaryImage(product),
            quantity,
          },
        ]
      })
      return
    }
    // Logged in: server cart (remember display info first).
    rememberProduct(variant.id, {
      name: product.name,
      slug: product.slug,
      image: getPrimaryImage(product),
      productId: product.id,
    })
    try {
      await cartApi.addCartItem(variant.id, quantity)
      await refreshServerCart()
    } catch {
      toast.error('Could not add to cart.')
    }
  }

  async function removeFromCart(variantId) {
    if (!user) {
      setItems((prev) => prev.filter((item) => item.variantId !== variantId))
      return
    }
    const item = findItem(variantId)
    if (!item?.itemId) return
    try {
      await cartApi.removeCartItem(item.itemId)
      await refreshServerCart()
    } catch {
      toast.error('Could not update cart.')
    }
  }

  async function increaseQuantity(variantId) {
    if (!user) {
      setItems((prev) =>
        prev.map((item) =>
          item.variantId === variantId ? { ...item, quantity: item.quantity + 1 } : item
        )
      )
      return
    }
    const item = findItem(variantId)
    if (!item?.itemId) return
    try {
      await cartApi.updateCartItem(item.itemId, item.quantity + 1)
      await refreshServerCart()
    } catch {
      toast.error('Could not update cart.')
    }
  }

  async function decreaseQuantity(variantId) {
    if (!user) {
      setItems((prev) =>
        prev
          .map((item) =>
            item.variantId === variantId ? { ...item, quantity: item.quantity - 1 } : item
          )
          .filter((item) => item.quantity > 0)
      )
      return
    }
    const item = findItem(variantId)
    if (!item?.itemId) return
    try {
      if (item.quantity <= 1) {
        await cartApi.removeCartItem(item.itemId)
      } else {
        await cartApi.updateCartItem(item.itemId, item.quantity - 1)
      }
      await refreshServerCart()
    } catch {
      toast.error('Could not update cart.')
    }
  }

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        refreshCart: refreshServerCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
