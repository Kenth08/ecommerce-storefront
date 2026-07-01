export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-900 text-gray-300 px-4 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Ecommerce</h3>
          <p className="mt-2 max-w-xs text-sm">
            Quality products, delivered fast. Built with React and Django.
          </p>
        </div>

        <div className="flex gap-8 text-sm">
          <div className="flex flex-col gap-2">
            <span className="font-medium text-white">Shop</span>
            <a href="/" className="hover:text-white">Home</a>
            <a href="/cart" className="hover:text-white">Cart</a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-medium text-white">Account</span>
            <a href="/login" className="hover:text-white">Login</a>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-gray-500">
        © 2026 Ecommerce. All rights reserved.
      </p>
    </footer>
  )
}
