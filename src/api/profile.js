/**
 * User profile data layer.
 *
 * ─── BACKEND NOT READY YET ───────────────────────────────────────────────
 * For now this is backed by localStorage so the /profile and /settings pages
 * work end-to-end. Every function is async and returns the same shape the API
 * will return, so swapping to the real backend is a one-line change per call.
 *
 * When the backend is live, replace the localStorage bodies with:
 *   getProfile()        ->  GET  /api/user/profile
 *   updateProfile(data) ->  PUT  /api/user/profile
 *
 * The `api` client (src/api/client.js) already attaches the JWT and handles
 * token refresh, so the real calls are just `api.get(...)` / `api.put(...)`.
 * ─────────────────────────────────────────────────────────────────────────
 */

const STORAGE_KEY = 'mockUserProfile'

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null
  } catch {
    return null
  }
}

function writeLocal(profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  return profile
}

/**
 * Seed the mock profile the first time, using whatever the authenticated
 * `user` (from /auth/me/) already gives us (email, phone). Name/avatar are
 * editable locally until the backend owns them.
 */
function seedProfile(user) {
  const existing = readLocal()
  if (existing) {
    // Keep email in sync with the source-of-truth auth user.
    if (user?.email && existing.email !== user.email) {
      return writeLocal({ ...existing, email: user.email })
    }
    return existing
  }
  return writeLocal({
    full_name: user?.full_name || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: '', // data-URL or remote URL later
  })
}

/**
 * GET the current user's profile.
 * TODO(backend): return api.get('/user/profile/').then((res) => res.data)
 */
export async function getProfile(user) {
  return seedProfile(user)
}

/**
 * PUT profile changes (partial patch is fine).
 * TODO(backend): return api.put('/user/profile/', patch).then((res) => res.data)
 */
export async function updateProfile(patch) {
  const current = readLocal() || {}
  return writeLocal({ ...current, ...patch })
}
