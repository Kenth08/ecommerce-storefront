import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, removeFromCart, increaseQuantity, decreaseQuantity } = useCart()
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)


  if (items.length === 0) {
    return <p className="p-8 text-center text-gray-600">Your cart is empty.</p>
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b border-gray-200 pb-4"
          >
            <div className="flex items-center gap-4">
              <img src={item.image} alt={item.name} className="h-16 w-16 rounded object-cover" />
              <div>
                <p className="font-medium">{item.name}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="h-6 w-6 rounded border border-gray-300 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="h-6 w-6 rounded border border-gray-300 hover:bg-gray-100"
                  >
                    +
                  </button>
                  <span className="ml-2">× ${item.price}</span>
                </div>

              </div>
            </div>
            <button
              onClick={() => removeFromCart(item.id)}
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
