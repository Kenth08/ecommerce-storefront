import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoIcon from '../assets/logo-icon.png'


export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

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

        <div className="hidden gap-6 text-sm sm:flex sm:text-base">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/cart" className={linkClass}>Cart</NavLink>
          {user ? (
            <button onClick={handleLogout} className="text-gray-300 transition-colors hover:text-orange-400">
              Logout
            </button>
          ) : (
            <NavLink to="/login" className={linkClass}>Login</NavLink>
          )}
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t border-slate-800 px-4 py-4 text-sm sm:hidden">
          <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/cart" className={linkClass} onClick={() => setOpen(false)}>Cart</NavLink>
          {user ? (
            <button onClick={handleLogout} className="text-left text-gray-300 hover:text-orange-400">
              Logout
            </button>
          ) : (
            <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>Login</NavLink>
          )}
        </div>
      )}
    </nav>
  )
}
