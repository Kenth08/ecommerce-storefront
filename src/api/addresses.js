/**
 * Delivery addresses data layer.
 *
 * ─── BACKEND NOT READY YET ───────────────────────────────────────────────
 * Backed by localStorage for now so the /addresses page works end-to-end.
 * Every function is async and returns the shape the API will return, so
 * switching to the real backend is a one-line change per call.
 *
 * When the backend is live, replace the localStorage bodies with:
 *   getAddresses()          ->  GET    /api/user/addresses
 *   addAddress(data)        ->  POST   /api/user/addresses
 *   updateAddress(id, data) ->  PUT    /api/user/addresses/:id
 *   deleteAddress(id)       ->  DELETE /api/user/addresses/:id
 *
 * The `api` client already attaches the JWT + refresh handling.
 * ─────────────────────────────────────────────────────────────────────────
 */

const STORAGE_KEY = 'mockUserAddresses'

// A single sample address so the page demonstrates the layout on first visit.
// Delete it from the UI (or clear localStorage) any time.
const SEED = [
  {
    id: 'addr_sample',
    label: 'Home',
    full_name: '',
    phone: '',
    street: '123 Rizal Street, Brgy. San Antonio',
    city: 'Quezon City',
    region: 'Metro Manila',
    postal_code: '1105',
    country: 'Philippines',
    is_default: true,
  },
]

function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return writeLocal(SEED) // first run -> seed
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeLocal(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  return list
}

function newId() {
  return `addr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// Only one address may be default; clearing the flag on the rest keeps that true.
function normalizeDefaults(list, defaultId) {
  return list.map((a) => ({ ...a, is_default: a.id === defaultId }))
}

/**
 * GET all saved addresses.
 * TODO(backend): return api.get('/user/addresses/').then((res) => res.data)
 */
export async function getAddresses() {
  return readLocal()
}

/**
 * POST a new address.
 * TODO(backend): return api.post('/user/addresses/', data).then((res) => res.data)
 */
export async function addAddress(data) {
  const list = readLocal()
  const address = { ...data, id: newId() }
  // First address (or an explicit request) becomes the default.
  let next = [...list, address]
  if (address.is_default || list.length === 0) {
    next = normalizeDefaults(next, address.id)
  }
  writeLocal(next)
  return address
}

/**
 * PUT an address update.
 * TODO(backend): return api.put(`/user/addresses/${id}/`, data).then((res) => res.data)
 */
export async function updateAddress(id, data) {
  let list = readLocal().map((a) => (a.id === id ? { ...a, ...data, id } : a))
  if (data.is_default) list = normalizeDefaults(list, id)
  writeLocal(list)
  return list.find((a) => a.id === id)
}

/**
 * DELETE an address.
 * TODO(backend): return api.delete(`/user/addresses/${id}/`)
 */
export async function deleteAddress(id) {
  let list = readLocal().filter((a) => a.id !== id)
  // If we removed the default and others remain, promote the first one.
  if (list.length > 0 && !list.some((a) => a.is_default)) {
    list = normalizeDefaults(list, list[0].id)
  }
  writeLocal(list)
  return { success: true }
}
