import { useState } from 'react'
import { Link } from 'react-router-dom'
import logoIcon from '../assets/logo-icon.png'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function ForgotPassword() {
  useDocumentTitle('Forgot Password')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    // TODO(backend): POST /auth/password/reset/ to email a real reset link.
    setSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Link to="/login" className="absolute left-5 top-5 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-slate-900">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to sign in
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
        <Link to="/" className="mx-auto mb-8 flex w-fit items-center gap-2">
          <img src={logoIcon} alt="" className="h-10 w-auto" />
          <span className="text-xl font-bold tracking-tight text-slate-900">Ecom<span className="text-orange-500">ify</span></span>
        </Link>

        {sent ? (
          <div className="text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-8 w-8 text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Check your email</h1>
            <p className="mt-2 text-sm text-gray-500">
              If an account exists for <span className="font-medium text-slate-700">{email}</span>, we’ve sent a link to reset your password.
            </p>
            <Link to="/login" className="mt-6 inline-block rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Forgot password?</h1>
            <p className="mt-1.5 text-sm text-gray-500">Enter your email and we’ll send you a reset link.</p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-4">
              <div>
                <label htmlFor="fp-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input
                  id="fp-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="Email address"
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:ring-4 ${
                    error ? 'border-red-400 focus:border-red-500 focus:ring-red-50' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-100'
                  }`}
                />
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
              </div>
              <button type="submit" className="mt-1 w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
                Send reset link
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Remembered it?{' '}
              <Link to="/login" className="font-medium text-orange-600 underline underline-offset-2 hover:text-orange-700">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
