import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between gap-4 px-4 py-3 sm:px-8 bg-gray-900 text-white">
      <Link to="/" className="text-lg font-semibold">
        Ecommerce
      </Link>
      <div className="flex gap-4 sm:gap-6 text-sm sm:text-base">
        <Link to="/" className="hover:text-gray-300">
          Home
        </Link>
        <Link to="/cart" className="hover:text-gray-300">
          Cart
        </Link>
        <Link to="/login" className="hover:text-gray-300">
          Login
        </Link>
      </div>
    </nav>
  )
}
