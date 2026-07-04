import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

// Public Google OAuth Client ID (safe to expose). Must match the ID the
// backend is configured to trust, or token verification will fail.
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  )
}

/**
 * "Sign in with Google" button.
 *
 * Renders the official Google Identity Services button, gets a Google ID
 * token, and hands it to AuthContext.googleLogin (which posts it to
 * /auth/google/). Falls back to a disabled-style placeholder when no
 * VITE_GOOGLE_CLIENT_ID is configured yet.
 *
 * Props:
 *   text      – Google button label: 'signin_with' | 'signup_with' | 'continue_with'
 *   onSuccess – called after a successful sign-in (e.g. to navigate away)
 */
export default function GoogleSignInButton({ text = 'continue_with', onSuccess }) {
  const { googleLogin } = useAuth()
  const containerRef = useRef(null)
  const onSuccessRef = useRef(onSuccess)
  const [busy, setBusy] = useState(false)

  // Keep the latest onSuccess without re-running the button-render effect.
  useEffect(() => {
    onSuccessRef.current = onSuccess
  }, [onSuccess])

  useEffect(() => {
    if (!CLIENT_ID) return
    let cancelled = false

    async function handleCredential(response) {
      setBusy(true)
      try {
        await googleLogin(response.credential)
        toast.success('Signed in with Google!')
        onSuccessRef.current?.()
      } catch {
        toast.error('Google sign-in failed. Please try again.')
      } finally {
        if (!cancelled) setBusy(false)
      }
    }

    // The GIS script loads async — retry until window.google is ready.
    function init() {
      if (cancelled) return
      const google = window.google
      if (!google?.accounts?.id || !containerRef.current) {
        setTimeout(init, 200)
        return
      }
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredential,
      })
      const width = Math.min(containerRef.current.offsetWidth || 320, 400)
      google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text,
        shape: 'rectangular',
        logo_alignment: 'center',
        width,
      })
    }
    init()

    return () => {
      cancelled = true
    }
    // googleLogin is stable enough for our purposes; the effect only needs to
    // run once to render the button. Latest onSuccess is read via ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  // No Client ID configured yet — show a placeholder so the layout is intact.
  if (!CLIENT_ID) {
    return (
      <button
        type="button"
        onClick={() =>
          toast('Google sign-in isn’t configured yet — add VITE_GOOGLE_CLIENT_ID.')
        }
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-gray-50"
      >
        <GoogleIcon />
        Continue with Google
      </button>
    )
  }

  return (
    <div>
      <div ref={containerRef} className="flex min-h-10 justify-center scheme-light" />
      {busy && <p className="mt-2 text-center text-xs text-gray-500">Signing you in…</p>}
    </div>
  )
}
