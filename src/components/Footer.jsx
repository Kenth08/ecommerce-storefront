import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const linkClass = 'text-left text-sm text-gray-400 transition-colors hover:text-orange-400'

// Static link columns. NOTE: the Customer Service + Legal routes are not built
// yet — they gracefully hit the app's NotFound page until simple static pages
// are added. Shop/Account links all point at real, existing routes.
const columns = [
  {
    title: 'Customer Service',
    links: [
      { label: 'Help Center', to: '/help' },
      { label: 'Shipping Info', to: '/shipping' },
      { label: 'Returns', to: '/returns' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
  {
    title: 'Shop',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Products', to: '/shop' },
      { label: 'Categories', to: '/shop' },
      { label: 'Cart', to: '/cart' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
    ],
  },
]

// Placeholder payment methods (text chips — swap for real card SVGs later).
const payments = ['VISA', 'Mastercard', 'PayPal', 'GCash', 'COD']

// Placeholder social links (icon paths only; hrefs are stubs for now).
const socials = [
  { label: 'Facebook', icon: 'M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z' },
  { label: 'Instagram', icon: 'M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2zm0 3.05A6.75 6.75 0 1018.75 12 6.75 6.75 0 0012 5.25zm0 11.13A4.38 4.38 0 1116.38 12 4.38 4.38 0 0112 16.38zm6.96-11.4a1.58 1.58 0 11-1.57-1.58 1.58 1.58 0 011.57 1.58z' },
  { label: 'X', icon: 'M18.9 2H22l-7.2 8.23L23.3 22h-6.6l-5.17-6.76L5.6 22H2.5l7.7-8.8L1.9 2h6.77l4.67 6.18L18.9 2zm-1.16 18.06h1.83L7.35 3.85H5.4l12.34 16.21z' },
]

function FooterColumn({ title, links }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-sm font-semibold text-white">{title}</span>
      {links.map((l) => (
        <Link key={l.label} to={l.to} className={linkClass}>
          {l.label}
        </Link>
      ))}
    </div>
  )
}

export default function Footer() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  function handleLogout() {
    logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  function handleSubscribe(e) {
    e.preventDefault()
    if (!email.trim()) return
    toast.success('Thanks for subscribing!')
    setEmail('')
  }

  return (
    <footer className="mt-auto bg-slate-900 px-4 py-10 text-gray-300 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {/* Brand + newsletter */}
        <div className="sm:col-span-2 lg:col-span-1">
          <h3 className="text-lg font-semibold text-orange-400">Ecomify</h3>
          <p className="mt-2 max-w-xs text-sm text-gray-400">
            Shop, save, smile — quality products, delivered fast.
          </p>

          <form onSubmit={handleSubscribe} className="mt-4 max-w-xs">
            <label htmlFor="footer-newsletter" className="text-xs font-medium text-white">
              Get deals in your inbox
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="footer-newsletter"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>

        <FooterColumn title="Customer Service" links={columns[0].links} />
        <FooterColumn title="Shop" links={columns[1].links} />

        {/* Account — changes with login state */}
        <div className="flex flex-col items-start gap-2.5">
          <span className="text-sm font-semibold text-white">Account</span>
          {user ? (
            <>
              <Link to="/profile" className={linkClass}>My Account</Link>
              <Link to="/orders" className={linkClass}>My Orders</Link>
              <Link to="/wishlist" className={linkClass}>Wishlist</Link>
              <Link to="/cart" className={linkClass}>Cart</Link>
              <button onClick={handleLogout} className={linkClass}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass}>Login</Link>
              <Link to="/register" className={linkClass}>Register</Link>
              <Link to="/wishlist" className={linkClass}>Wishlist</Link>
            </>
          )}
        </div>

        <FooterColumn title="Legal" links={columns[2].links} />
      </div>

      {/* Payments + socials */}
      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-5 border-t border-slate-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-gray-500">We accept</span>
          {payments.map((p) => (
            <span
              key={p}
              className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] font-semibold tracking-wide text-gray-300"
            >
              {p}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {socials.map((s) => (
            <a
              key={s.label}
              href="#"
              aria-label={s.label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-gray-400 transition-colors hover:border-orange-400 hover:text-orange-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d={s.icon} />
              </svg>
            </a>
          ))}
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-6xl text-center text-xs text-gray-500 sm:text-left">
        © 2026 Ecomify. All rights reserved.
      </p>
    </footer>
  )
}
