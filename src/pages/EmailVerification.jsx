import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import logoIcon from '../assets/logo-icon.png'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function EmailVerification() {
  useDocumentTitle('Verify Email')
  const [params] = useSearchParams()
  const email = params.get('email') || 'your email address'
  const [resent, setResent] = useState(false)

  function resend() {
    // TODO(backend): POST /auth/email/verify/resend/ to send a new verification email.
    setResent(true)
    toast.success('Verification email sent.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Link to="/login" className="absolute left-5 top-5 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-slate-900">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to sign in
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <Link to="/" className="mx-auto mb-8 flex w-fit items-center gap-2">
          <img src={logoIcon} alt="" className="h-10 w-auto" />
          <span className="text-xl font-bold tracking-tight text-slate-900">Ecom<span className="text-orange-500">ify</span></span>
        </Link>

        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-8 w-8 text-orange-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </span>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Verify your email</h1>
        <p className="mt-2 text-sm text-gray-500">
          We’ve sent a verification link to <span className="font-medium text-slate-700">{email}</span>. Click the link in that email to activate your account.
        </p>

        <button
          onClick={resend}
          disabled={resent}
          className="mt-6 w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resent ? 'Email sent' : 'Resend verification email'}
        </button>

        <p className="mt-6 text-sm text-gray-600">
          Already verified?{' '}
          <Link to="/login" className="font-medium text-orange-600 underline underline-offset-2 hover:text-orange-700">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
