import { createContext, useContext, useEffect, useState } from 'react'
import { getPrimaryImage } from '../utils/productHelpers'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  function addToCart(product, variant) {
    setItems((prev) => {
      const existing = prev.find((item) => item.variantId === variant.id)
      if (existing) {
        return prev.map((item) =>
          item.variantId === variant.id
            ? { ...item, quantity: item.quantity + 1 }
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
          quantity: 1,
        },
      ]
    })
  }

  function removeFromCart(variantId) {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId))
  }

  function increaseQuantity(variantId) {
    setItems((prev) =>
      prev.map((item) =>
        item.variantId === variantId ? { ...item, quantity: item.quantity + 1 } : item
      )
    )
  }

  function decreaseQuantity(variantId) {
    setItems((prev) =>
      prev
        .map((item) =>
          item.variantId === variantId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, increaseQuantity, decreaseQuantity }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
