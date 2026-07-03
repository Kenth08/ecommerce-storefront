import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import logoIcon from '../assets/logo-icon.png'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { validateLogin } from '../utils/validation'

export default function Login() {
  useDocumentTitle('Login')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function clearFieldError(field) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const errors = validateLogin({ email, password })
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    setSubmitting(true)
    try {
      await login(email, password)
      toast.success('Logged in successfully!')
      navigate(from, { replace: true })
    } catch {
      toast.error('Invalid email or password.')
      setError('Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel — hidden on small screens */}
      <div className="relative hidden w-1/2 overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-orange-700 lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* decorative blurred glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />

        <Link to="/" className="relative flex w-fit items-center gap-3 text-white">
          <img src={logoIcon} alt="" className="h-12 w-auto" />
          <span className="text-2xl font-bold tracking-tight">
            Ecom<span className="text-orange-400">ify</span>
          </span>
        </Link>

        <div className="relative text-white">
          <h2 className="text-3xl font-bold leading-tight xl:text-4xl">
            Shop, save, smile.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-gray-300">
            Quality products, delivered fast. Sign in to pick up where you left off.
          </p>

          <ul className="mt-8 flex flex-col gap-3 text-sm">
            {['Free shipping on every order', 'Easy 30-day returns', 'Secure checkout'].map((perk) => (
              <li key={perk} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5 text-orange-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <span className="text-gray-200">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-gray-400">© 2026 Ecomify. All rights reserved.</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center bg-gray-50 px-4 py-12 lg:w-1/2">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link to="/" className="lg:hidden">
            <img src={logoIcon} alt="Ecomify" className="h-14 w-auto" />
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 lg:mt-0">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Log in to continue to Ecomify</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            <div>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
                  aria-invalid={Boolean(fieldErrors.email)}
                  className={`peer w-full rounded-lg border px-3 pt-5 pb-2 text-sm outline-none transition-all focus:ring-2 placeholder-transparent ${
                    fieldErrors.email
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-300 focus:border-orange-500 focus:ring-orange-100'
                  }`}
                />
                <label
                  htmlFor="login-email"
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 transition-all duration-200 pointer-events-none
                  peer-focus:top-0 peer-focus:text-xs peer-focus:text-orange-500
                  peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-orange-500"
                >
                  Email
                </label>
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
            </div>

            <div>
              <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearFieldError('password') }}
                aria-invalid={Boolean(fieldErrors.password)}
                className={`peer w-full rounded-lg border px-3 pt-5 pb-2 pr-10 text-sm outline-none transition-all focus:ring-2 placeholder-transparent ${
                  fieldErrors.password
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-300 focus:border-orange-500 focus:ring-orange-100'
                }`}
              />
              <label
                htmlFor="login-password"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 transition-all duration-200 pointer-events-none
                peer-focus:top-0 peer-focus:text-xs peer-focus:text-orange-500
                peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-orange-500"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => toast('Password reset is coming soon.')}
                className="font-medium text-orange-600 hover:text-orange-700"
              >
                Forgot password?
              </button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Logging in...' : 'Login'}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">or continue with</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => toast('Google sign-in is coming soon.')}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
                  <path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84Z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => toast('Facebook sign-in is coming soon.')}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
                  <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
                </svg>
                Facebook
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-orange-600 hover:text-orange-700">
            Register
          </Link>
        </p>
      </div>
      </div>
    </div>
  )
}
