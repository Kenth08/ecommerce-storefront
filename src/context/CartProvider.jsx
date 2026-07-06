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
  // Debounced server sync for +/- quantity changes (logged-in cart):
  // pendingQty holds the running target quantity per cart-item, syncTimers the
  // pending write. Lets the UI update instantly while the server catches up.
  const pendingQty = useRef({})
  const syncTimers = useRef({})

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
    } catch (err) {
      console.error('Add to cart failed:', err.response?.status, err.response?.data ?? err.message)
      toast.error('Could not add to cart.', { id: 'cart' })
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
      toast.error('Could not update cart.', { id: 'cart' })
    }
  }

  // Push a logged-in item's final quantity to the server after a short idle
  // gap, so a burst of +/- clicks becomes ONE request (with the last value)
  // instead of one slow round-trip per click.
  function scheduleQtySync(itemId) {
    clearTimeout(syncTimers.current[itemId])
    syncTimers.current[itemId] = setTimeout(async () => {
      delete syncTimers.current[itemId]
      const qty = pendingQty.current[itemId]
      delete pendingQty.current[itemId]
      if (qty == null) return
      try {
        if (qty <= 0) await cartApi.removeCartItem(itemId)
        else await cartApi.updateCartItem(itemId, qty)
      } catch {
        toast.error('Could not update cart.', { id: 'cart' })
        refreshServerCart() // reconcile the UI with the server on failure
      }
    }, 400)
  }

  // Force any debounced quantity writes to run NOW and wait for them. Called
  // before acting on the server cart (checkout) so it isn't read mid-update.
  // allSettled: a failed write must never block checkout — worst case the
  // order uses the server's current quantity, which we then surface normally.
  async function flushQtySync() {
    const ids = Object.keys(pendingQty.current)
    await Promise.allSettled(
      ids.map((itemId) => {
        clearTimeout(syncTimers.current[itemId])
        delete syncTimers.current[itemId]
        const qty = pendingQty.current[itemId]
        delete pendingQty.current[itemId]
        if (qty == null) return Promise.resolve()
        return qty <= 0 ? cartApi.removeCartItem(itemId) : cartApi.updateCartItem(itemId, qty)
      })
    )
  }

  // Optimistically change a logged-in item's quantity: move the number now,
  // sync in the background. pendingQty (not React state) is the running source
  // of truth, so rapid clicks compute the correct final value without races.
  function changeServerQty(variantId, delta) {
    const item = findItem(variantId)
    if (!item?.itemId) return
    const newQty = (pendingQty.current[item.itemId] ?? item.quantity) + delta
    pendingQty.current[item.itemId] = newQty
    setItems((prev) =>
      prev
        .map((it) => (it.itemId === item.itemId ? { ...it, quantity: newQty } : it))
        .filter((it) => it.quantity > 0)
    )
    scheduleQtySync(item.itemId)
  }

  function increaseQuantity(variantId) {
    if (!user) {
      setItems((prev) =>
        prev.map((item) =>
          item.variantId === variantId ? { ...item, quantity: item.quantity + 1 } : item
        )
      )
      return
    }
    changeServerQty(variantId, 1)
  }

  function decreaseQuantity(variantId) {
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
    changeServerQty(variantId, -1)
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
        flushCart: flushQtySync,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
