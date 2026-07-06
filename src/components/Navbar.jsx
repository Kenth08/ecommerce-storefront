import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, useAnimationControls } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useFly } from '../context/FlyContext'
import toast from 'react-hot-toast'
import logoIcon from '../assets/logo-icon.png'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { bump, registerTarget } = useFly()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  // The nav heart/cart icons are the fly-animation targets.
  const heartRef = useRef(null)
  const cartRef = useRef(null)
  const heartControls = useAnimationControls()
  const cartControls = useAnimationControls()

  useEffect(() => {
    registerTarget('wishlist', heartRef.current)
    registerTarget('cart', cartRef.current)
    return () => {
      registerTarget('wishlist', null)
      registerTarget('cart', null)
    }
  }, [registerTarget])

  // Pop/bounce the icon each time a flying preview lands on it.
  useEffect(() => {
    if (bump.wishlist > 0) {
      heartControls.start({ scale: [1, 1.5, 0.9, 1], transition: { duration: 0.45 } })
    }
  }, [bump.wishlist, heartControls])

  useEffect(() => {
    if (bump.cart > 0) {
      cartControls.start({ scale: [1, 1.5, 0.9, 1], transition: { duration: 0.45 } })
    }
  }, [bump.cart, cartControls])

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistCount = wishlistItems.length

  function confirmLogout() {
    logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  function handleLogout() {
    setOpen(false)
    // Ask for confirmation before logging out.
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Log out?</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
              You&apos;ll need to sign in again to access your account.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id)
                confirmLogout()
              }}
              className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Log out
            </button>
          </div>
        </div>
      ),
      { duration: 6000 }
    )
  }

  const linkClass = ({ isActive }) =>
    `transition-colors hover:text-orange-400 ${isActive ? 'text-orange-400 font-medium' : 'text-gray-300'}`

  // Outlined pill button for the auth action, with a lift + glow on hover.
  const authButtonClass =
    'rounded-lg border border-orange-500 px-4 py-1.5 font-medium text-orange-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:text-white hover:shadow-lg hover:shadow-orange-500/30 active:translate-y-0'

  return (
    <nav className="sticky top-0 z-20 bg-slate-900 text-white shadow-md">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-2 sm:px-8 lg:px-12">
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
          <NavLink to="/shop" className={linkClass}>Shop</NavLink>
          <NavLink
            to="/wishlist"
            aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} item${wishlistCount === 1 ? '' : 's'}` : ''}`}
            className={({ isActive }) =>
              `relative transition-colors hover:text-orange-400 ${isActive ? 'text-orange-400' : 'text-gray-300'}`
            }
          >
            <motion.span ref={heartRef} animate={heartControls} className="inline-flex origin-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-7 w-7"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </motion.span>
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-semibold text-white">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/cart"
            aria-label={`Cart${cartCount > 0 ? `, ${cartCount} item${cartCount === 1 ? '' : 's'}` : ''}`}
            className={({ isActive }) =>
              `group relative transition-colors hover:text-orange-400 ${isActive ? 'text-orange-400' : 'text-gray-300'}`
            }
          >
            <motion.span ref={cartRef} animate={cartControls} className="inline-flex origin-center">
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
            </motion.span>
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-semibold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </NavLink>

          <span className="h-6 w-px bg-slate-700" aria-hidden="true" />

          {user ? (
            <button onClick={handleLogout} className={authButtonClass}>Logout</button>
          ) : (
            <NavLink to="/login" className={authButtonClass}>Login</NavLink>
          )}

          <ThemeToggle />
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t border-slate-800 px-4 py-4 text-sm sm:hidden">
          <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/shop" className={linkClass} onClick={() => setOpen(false)}>Shop</NavLink>
          <NavLink
            to="/wishlist"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
          </NavLink>

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

          <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-gray-300">
            <span>Theme</span>
            <ThemeToggle />
          </div>

          <div className="mt-1 border-t border-slate-800 pt-3">
            {user ? (
              <button onClick={handleLogout} className={`${authButtonClass} block w-full text-center`}>
                Logout
              </button>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setOpen(false)}
                className={`${authButtonClass} block w-full text-center`}
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
