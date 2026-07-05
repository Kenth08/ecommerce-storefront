/**
 * Auth token storage.
 *
 * Tokens live in localStorage when the user chose "Keep me signed in"
 * (persists across browser restarts) or in sessionStorage when they didn't
 * (cleared when the tab/browser closes). Reads check both so the rest of the
 * app doesn't care which one is active.
 */
const ACCESS = 'accessToken'
const REFRESH = 'refreshToken'

// Whichever storage currently holds the session (session wins if both exist).
function activeStorage() {
  return sessionStorage.getItem(ACCESS) ? sessionStorage : localStorage
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS) || sessionStorage.getItem(ACCESS)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH) || sessionStorage.getItem(REFRESH)
}

// Store a fresh session, honouring the "remember me" choice, and clear the other store.
export function setTokens({ access, refresh, remember = true }) {
  const store = remember ? localStorage : sessionStorage
  const other = remember ? sessionStorage : localStorage
  if (access) store.setItem(ACCESS, access)
  if (refresh) store.setItem(REFRESH, refresh)
  other.removeItem(ACCESS)
  other.removeItem(REFRESH)
}

// Update tokens after a refresh, keeping them in whichever store is active.
export function updateTokens({ access, refresh }) {
  const store = activeStorage()
  if (access) store.setItem(ACCESS, access)
  if (refresh) store.setItem(REFRESH, refresh)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS)
  localStorage.removeItem(REFRESH)
  sessionStorage.removeItem(ACCESS)
  sessionStorage.removeItem(REFRESH)
}
