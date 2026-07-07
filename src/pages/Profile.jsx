import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getProfile, updateProfile } from '../api/profile'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function Profile() {
  useDocumentTitle('My Profile')
  const { user } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '' })

  // Account pages require auth — bounce guests to login (matches Orders).
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    // ── Backend swap point: getProfile() will call GET /api/user/profile. ──
    getProfile(user)
      .then((p) => {
        setProfile(p)
        setForm({ full_name: p.full_name || '', phone: p.phone || '' })
      })
      .finally(() => setLoading(false))
  }, [user, navigate])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      // ── Backend swap point: updateProfile() will call PUT /api/user/profile. ──
      const updated = await updateProfile({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
      })
      setProfile(updated)
      setEditing(false)
      toast.success('Profile updated')
    } catch {
      toast.error('Could not save your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function cancelEdit() {
    setForm({ full_name: profile.full_name || '', phone: profile.phone || '' })
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200 dark:bg-slate-800" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-gray-200 dark:bg-slate-800" />
      </div>
    )
  }

  const displayName = profile.full_name?.trim() || 'Your name'
  const initial = (profile.full_name || profile.email || 'U').trim().charAt(0).toUpperCase()

  const fieldClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Manage your personal information.</p>
      </header>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none">
        {/* Identity row */}
        <div className="flex flex-col items-center gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center dark:border-slate-800">
          {/* Avatar placeholder */}
          {profile.avatar ? (
            <img src={profile.avatar} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-orange-600 text-2xl font-bold text-white">
              {initial}
            </span>
          )}
          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{displayName}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">{profile.email || 'No email on file'}</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-500 hover:text-white sm:ml-auto dark:text-orange-400"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Details / edit form */}
        {editing ? (
          <form onSubmit={handleSave} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Full name
              </label>
              <input
                id="full_name"
                type="text"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="e.g. Juan Dela Cruz"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              {/* Email is managed by your login account, so it's read-only here. */}
              <input
                id="email"
                type="email"
                value={profile.email}
                readOnly
                className={`${fieldClass} cursor-not-allowed opacity-60`}
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="e.g. +63 912 345 6789"
                className={fieldClass}
              />
            </div>

            <div className="mt-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Full name</dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{profile.full_name?.trim() || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Email</dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{profile.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">Phone number</dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{profile.phone?.trim() || '—'}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  )
}
