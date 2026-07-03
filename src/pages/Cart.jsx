import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function Cart() {
  useDocumentTitle('Your Cart')
  const { items, removeFromCart, increaseQuantity, decreaseQuantity } = useCart()
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-16 w-16 text-gray-300"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
        <h1 className="text-xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="text-sm text-gray-500">Looks like you haven't added anything yet.</p>
        <Link
          to="/shop"
          className="mt-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex items-center justify-between border-b border-gray-200 pb-4"
          >
            <div className="flex items-center gap-4">
              <img src={item.image} alt={item.name} className="h-16 w-16 rounded object-cover" />
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">{item.size} / {item.color}</p>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <button
                    onClick={() => decreaseQuantity(item.variantId)}
                    className="h-6 w-6 rounded border border-gray-300 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => increaseQuantity(item.variantId)}
                    className="h-6 w-6 rounded border border-gray-300 hover:bg-gray-100"
                  >
                    +
                  </button>
                  <span className="ml-2">× ${item.price}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => removeFromCart(item.variantId)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <p className="mt-6 text-right text-lg font-semibold">Total: ${total.toFixed(2)}</p>
    </div>
  )
}
