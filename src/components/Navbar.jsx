import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import logoIcon from '../assets/logo-icon.png'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `transition-colors hover:text-orange-400 ${isActive ? 'text-orange-400 font-medium' : 'text-gray-300'}`

  return (
    <nav className="sticky top-0 z-20 bg-slate-900 text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-8">
        <NavLink to="/" className="flex items-center gap-2">
          <img src={logoIcon} alt="" className="h-10 w-auto sm:h-12" />
          <span className="text-xl font-bold tracking-tight sm:text-2xl">
            Ecom<span className="text-orange-400">ify</span>
          </span>
        </NavLink>

        <button
          onClick={() => setOpen(!open)}
          className="text-2xl sm:hidden"
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>

        <div className="hidden items-center gap-6 text-sm sm:flex sm:text-base">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          {user ? (
            <button onClick={handleLogout} className="text-gray-300 transition-colors hover:text-orange-400">
              Logout
            </button>
          ) : (
            <NavLink to="/login" className={linkClass}>Login</NavLink>
          )}
          <NavLink
            to="/cart"
            aria-label={`Cart${cartCount > 0 ? `, ${cartCount} item${cartCount === 1 ? '' : 's'}` : ''}`}
            className={({ isActive }) =>
              `group relative transition-colors hover:text-orange-400 ${isActive ? 'text-orange-400' : 'text-gray-300'}`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-7 w-7 origin-top transition-transform group-hover:animate-shake"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-semibold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </NavLink>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t border-slate-800 px-4 py-4 text-sm sm:hidden">
          <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>Home</NavLink>
          {user ? (
            <button onClick={handleLogout} className="text-left text-gray-300 hover:text-orange-400">
              Logout
            </button>
          ) : (
            <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>Login</NavLink>
          )}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `flex items-center gap-2 transition-colors hover:text-orange-400 ${isActive ? 'text-orange-400 font-medium' : 'text-gray-300'}`
            }
            onClick={() => setOpen(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            Cart
          </NavLink>
        </div>
      )}
    </nav>
  )
}
