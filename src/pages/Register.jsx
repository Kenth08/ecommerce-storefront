import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import logoIcon from '../assets/logo-icon.png'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { validateRegister } from '../utils/validation'

export default function Register() {
  useDocumentTitle('Create Account')
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Clear a field's inline error as soon as the user edits it.
  function clearFieldError(field) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  // Base input styles, switched to a red state when the field has an error.
  const inputClass = (field, extra = '') =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 ${extra} ${
      fieldErrors[field]
        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
        : 'border-gray-300 focus:border-orange-500 focus:ring-orange-100'
    }`

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const errors = validateRegister({ email, phone, password, password2 })
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    setSubmitting(true)
    try {
      await register(email, phone, password, password2)
      toast.success('Account created successfully!')
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      const firstError = data ? Object.values(data)[0]?.[0] : null
      const message = firstError || 'Could not create account.'
      toast.error(message)
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logoIcon} alt="Ecomify" className="h-14 w-auto" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Create account</h1>
          <p className="mt-1 text-sm text-gray-500">Sign up to get started with Ecomify</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <label htmlFor="register-email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
                aria-invalid={Boolean(fieldErrors.email)}
                className={inputClass('email')}
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="register-phone" className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
              <input
                id="register-phone"
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); clearFieldError('phone') }}
                aria-invalid={Boolean(fieldErrors.phone)}
                className={inputClass('phone')}
              />
              {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
            </div>

            <div>
              <label htmlFor="register-password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError('password') }}
                  aria-invalid={Boolean(fieldErrors.password)}
                  className={inputClass('password', 'pr-10')}
                />
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
              {fieldErrors.password ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters.</p>
              )}
            </div>

            <div>
              <label htmlFor="register-password2" className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
              <div className="relative">
                <input
                  id="register-password2"
                  type={showPassword2 ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password2}
                  onChange={(e) => { setPassword2(e.target.value); clearFieldError('password2') }}
                  aria-invalid={Boolean(fieldErrors.password2)}
                  className={inputClass('password2', 'pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2((prev) => !prev)}
                  aria-label={showPassword2 ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword2 ? (
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
              {fieldErrors.password2 && <p className="mt-1 text-xs text-red-600">{fieldErrors.password2}</p>}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Creating account...' : 'Register'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-orange-600 hover:text-orange-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
