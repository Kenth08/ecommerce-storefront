import { useState } from 'react'
import { Link } from 'react-router-dom'
import logoIcon from '../assets/logo-icon.png'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function ResetPassword() {
  useDocumentTitle('Reset Password')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const next = {}
    if (password.length < 8) next.password = 'Password must be at least 8 characters.'
    if (confirm !== password) next.confirm = 'Passwords do not match.'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    // TODO(backend): POST /auth/password/reset/confirm/ with the token + new password.
    setDone(true)
  }

  const inputClass = (field) =>
    `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:ring-4 ${
      errors[field] ? 'border-red-400 focus:border-red-500 focus:ring-red-50' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-100'
    }`

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
        <Link to="/" className="mx-auto mb-8 flex w-fit items-center gap-2">
          <img src={logoIcon} alt="" className="h-10 w-auto" />
          <span className="text-xl font-bold tracking-tight text-slate-900">Ecom<span className="text-orange-500">ify</span></span>
        </Link>

        {done ? (
          <div className="text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-8 w-8 text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Password updated</h1>
            <p className="mt-2 text-sm text-gray-500">Your password has been reset. You can now sign in with your new password.</p>
            <Link to="/login" className="mt-6 inline-block rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
              Go to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Set a new password</h1>
            <p className="mt-1.5 text-sm text-gray-500">Choose a strong password you don’t use elsewhere.</p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-4">
              <div>
                <label htmlFor="rp-password" className="mb-1.5 block text-sm font-medium text-slate-700">New password</label>
                <input id="rp-password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((x) => ({ ...x, password: undefined })) }} placeholder="At least 8 characters" className={inputClass('password')} />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="rp-confirm" className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
                <input id="rp-confirm" type="password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setErrors((x) => ({ ...x, confirm: undefined })) }} placeholder="Re-enter your password" className={inputClass('confirm')} />
                {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>}
              </div>
              <button type="submit" className="mt-1 w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
                Reset password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
