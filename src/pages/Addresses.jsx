import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getAddresses, addAddress, updateAddress, deleteAddress } from '../api/addresses'
import useDocumentTitle from '../hooks/useDocumentTitle'

const EMPTY_FORM = {
  label: 'Home',
  full_name: '',
  phone: '',
  street: '',
  city: '',
  region: '',
  postal_code: '',
  country: 'Philippines',
  is_default: false,
}

export default function Addresses() {
  useDocumentTitle('My Addresses')
  const { user } = useAuth()
  const navigate = useNavigate()

  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null) // null = closed; object = add/edit form
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    // ── Backend swap point: GET /api/user/addresses ──
    getAddresses()
      .then(setAddresses)
      .finally(() => setLoading(false))
  }, [user, navigate])

  function openAdd() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
  }

  function openEdit(addr) {
    setEditingId(addr.id)
    setForm({ ...EMPTY_FORM, ...addr })
  }

  function closeForm() {
    setForm(null)
    setEditingId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        // ── Backend swap point: PUT /api/user/addresses/:id ──
        await updateAddress(editingId, form)
        toast.success('Address updated')
      } else {
        // ── Backend swap point: POST /api/user/addresses ──
        await addAddress(form)
        toast.success('Address added')
      }
      setAddresses(await getAddresses())
      closeForm()
    } catch {
      toast.error('Could not save the address. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    // ── Backend swap point: DELETE /api/user/addresses/:id ──
    await deleteAddress(id)
    setAddresses(await getAddresses())
    toast.success('Address removed')
  }

  async function handleSetDefault(id) {
    await updateAddress(id, { is_default: true })
    setAddresses(await getAddresses())
  }

  const fieldClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">My Addresses</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Manage your delivery addresses.</p>
        </div>
        {!form && (
          <button
            onClick={openAdd}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            + Add Address
          </button>
        )}
      </header>

      {/* Add / edit form */}
      {form && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {editingId ? 'Edit address' : 'Add a new address'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Label</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Home, Office…"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Full name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={fieldClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Street address</label>
              <input
                type="text"
                value={form.street}
                onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Region / Province</label>
              <input
                type="text"
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Postal code</label>
              <input
                type="text"
                value={form.postal_code}
                onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Country</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                className={fieldClass}
              />
            </div>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
              className="h-4 w-4 accent-orange-500"
            />
            Set as default address
          </label>

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add address'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Address list */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : addresses.length === 0 && !form ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-slate-700">
          <p className="text-sm text-gray-500 dark:text-slate-400">You haven&apos;t added any addresses yet.</p>
          <button
            onClick={openAdd}
            className="mt-3 rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Add your first address
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{addr.label || 'Address'}</span>
                    {addr.is_default && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                        Default
                      </span>
                    )}
                  </div>
                  {addr.full_name && <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{addr.full_name}</p>}
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
                    {[addr.street, addr.city, addr.region, addr.postal_code, addr.country].filter(Boolean).join(', ')}
                  </p>
                  {addr.phone && <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">{addr.phone}</p>}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-slate-800">
                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-orange-400 dark:hover:text-orange-400"
                  >
                    Set as default
                  </button>
                )}
                <button
                  onClick={() => openEdit(addr)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-orange-400 dark:hover:text-orange-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="ml-auto rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
