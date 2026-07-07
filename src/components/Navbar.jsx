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
import AccountMenu from './AccountMenu'

// Account links shared by the desktop dropdown and the mobile menu.
const ACCOUNT_LINKS = [
  { to: '/profile', label: 'Profile' },
  { to: '/orders', label: 'My Orders' },
  { to: '/addresses', label: 'Addresses' },
  { to: '/settings', label: 'Settings' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { bump, registerTarget } = useFly()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Frontend search: route to the Shop page with ?q=, which filters the
  // existing products array. Later this can call GET /api/products?search=.
  function handleSearch(e) {
    e.preventDefault()
    const q = search.trim()
    setOpen(false)
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop')
  }

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

  // Count distinct products (cart lines), not total units — so 2× of one item
  // reads as one entry. Matches the wishlist badge below for consistency.
  const cartCount = items.length
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
    <nav className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 text-white shadow-lg backdrop-blur-md">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-2 sm:px-8 lg:px-12">
        <NavLink to="/" className="flex shrink-0 items-center gap-2">
          <img src={logoIcon} alt="" className="h-10 w-auto sm:h-12" />
          <span className="text-xl font-bold tracking-tight sm:text-2xl">
            Ecom<span className="text-orange-400">ify</span>
          </span>
        </NavLink>

        {/* Product search — desktop only (mobile lives in the menu below) */}
        <form onSubmit={handleSearch} className="relative hidden flex-1 items-center md:flex md:max-w-xs lg:max-w-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className="w-full rounded-lg border border-slate-700 bg-slate-800/70 py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-400 outline-none transition-colors focus:border-orange-500"
          />
        </form>

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
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-slate-900">
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
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-slate-900">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </NavLink>

          <span className="h-6 w-px bg-slate-700" aria-hidden="true" />

          {user ? (
            <AccountMenu user={user} onLogout={handleLogout} />
          ) : (
            <NavLink to="/login" className={authButtonClass}>Login</NavLink>
          )}
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t border-slate-800 px-4 py-4 text-sm sm:hidden">
          {/* Product search — mobile */}
          <form onSubmit={handleSearch} className="relative flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/70 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-400 outline-none transition-colors focus:border-orange-500"
            />
          </form>

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

          {/* Account section — mirrors the desktop dropdown. */}
          {user ? (
            <div className="border-t border-slate-800 pt-3">
              <p className="mb-1 px-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Account</p>
              {ACCOUNT_LINKS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  <span className="block py-1.5">{item.label}</span>
                </NavLink>
              ))}

              {/* Appearance */}
              <div className="flex items-center justify-between py-1.5 text-gray-300">
                <span>Appearance</span>
                <ThemeToggle />
              </div>

              {/* Logout — red, separated at the bottom */}
              <button
                onClick={handleLogout}
                className="mt-2 block w-full rounded-lg border border-red-500/40 px-4 py-2 text-center font-medium text-red-400 transition-colors hover:bg-red-500/10"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-800 pt-3">
              <div className="flex items-center justify-between py-1.5 text-gray-300">
                <span>Appearance</span>
                <ThemeToggle />
              </div>
              <NavLink
                to="/login"
                onClick={() => setOpen(false)}
                className={`${authButtonClass} mt-2 block w-full text-center`}
              >
                Login
              </NavLink>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
