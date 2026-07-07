import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Footer() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  const linkClass = 'text-left hover:text-orange-400'

  return (
    <footer className="mt-auto bg-slate-900 text-gray-300 px-4 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-orange-400">Ecomify</h3>
          <p className="mt-2 max-w-xs text-sm">
            Shop, save, smile — quality products, delivered fast.
          </p>
        </div>

        <div className="flex gap-8 text-sm">
          <div className="flex flex-col gap-2">
            <span className="font-medium text-white">Shop</span>
            <Link to="/" className={linkClass}>Home</Link>
            <Link to="/shop" className={linkClass}>Products</Link>
            <Link to="/cart" className={linkClass}>Cart</Link>
          </div>

          <div className="flex flex-col items-start gap-2">
            <span className="font-medium text-white">Account</span>
            {user ? (
              // Signed in — no Login/Register.
              <>
                <Link to="/profile" className={linkClass}>My Account</Link>
                <Link to="/orders" className={linkClass}>My Orders</Link>
                <Link to="/wishlist" className={linkClass}>Wishlist</Link>
                <Link to="/cart" className={linkClass}>Cart</Link>
                <button onClick={handleLogout} className={linkClass}>Logout</button>
              </>
            ) : (
              // Signed out.
              <>
                <Link to="/login" className={linkClass}>Login</Link>
                <Link to="/register" className={linkClass}>Register</Link>
                <Link to="/wishlist" className={linkClass}>Wishlist</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-gray-500">
        © 2026 Ecomify. All rights reserved.
      </p>
    </footer>
  )
}
