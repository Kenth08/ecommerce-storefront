import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getProfile } from '../api/profile'
import ThemeToggle from '../components/ThemeToggle'
import useDocumentTitle from '../hooks/useDocumentTitle'

// Notification prefs are UI-only for now, persisted to localStorage.
// ── Backend swap point: load/save via GET/PUT /api/user/settings later. ──
const NOTIF_KEY = 'mockNotificationPrefs'
const DEFAULT_NOTIFS = { orderUpdates: true, promotions: false, newsletter: true }

function loadNotifs() {
  try {
    return { ...DEFAULT_NOTIFS, ...(JSON.parse(localStorage.getItem(NOTIF_KEY)) || {}) }
  } catch {
    return DEFAULT_NOTIFS
  }
}

const NOTIF_OPTIONS = [
  { key: 'orderUpdates', label: 'Order updates', desc: 'Shipping, delivery, and status changes.' },
  { key: 'promotions', label: 'Promotions & offers', desc: 'Deals, discounts, and sales.' },
  { key: 'newsletter', label: 'Newsletter', desc: 'Product news and recommendations.' },
]

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-orange-500' : 'bg-gray-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// Consistent section shell so every settings block reads the same.
function Section({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function Settings() {
  useDocumentTitle('Settings')
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [notifs, setNotifs] = useState(loadNotifs)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    getProfile(user).then(setProfile)
  }, [user, navigate])

  function toggleNotif(key) {
    setNotifs((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(NOTIF_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Manage your account and preferences.</p>
      </header>

      <div className="flex flex-col gap-5">
        {/* Account details */}
        <Section title="Account details" description="Your basic account information.">
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Name</dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{profile?.full_name?.trim() || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Email</dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{profile?.email || user?.email || '—'}</dd>
            </div>
          </dl>
          <Link
            to="/profile"
            className="mt-4 inline-block rounded-lg border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-500 hover:text-white dark:text-orange-400"
          >
            Edit profile
          </Link>
        </Section>

        {/* Password & security (placeholder) */}
        <Section title="Password & security" description="Keep your account secure.">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Password</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Last changed — not available yet</p>
            </div>
            <button
              type="button"
              onClick={() => toast('Password management is coming soon.')}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Change password
            </button>
          </div>
        </Section>

        {/* Notification preferences */}
        <Section title="Notification preferences" description="Choose what we email you about.">
          <ul className="flex flex-col divide-y divide-gray-100 dark:divide-slate-800">
            {NOTIF_OPTIONS.map((opt) => (
              <li key={opt.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{opt.label}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{opt.desc}</p>
                </div>
                <Toggle checked={notifs[opt.key]} onChange={() => toggleNotif(opt.key)} label={opt.label} />
              </li>
            ))}
          </ul>
        </Section>

        {/* Theme preference */}
        <Section title="Appearance" description="Switch between light and dark mode.">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Theme</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Your choice is remembered on this device.</p>
            </div>
            <ThemeToggle />
          </div>
        </Section>
      </div>
    </div>
  )
}
