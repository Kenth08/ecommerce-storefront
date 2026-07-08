import { useState, useRef, useEffect, useMemo, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProducts } from '../api/products'
import { searchProducts } from '../utils/search'
import { getPrimaryImage } from '../utils/productHelpers'

// Module-level cache so the catalog is fetched at most once across every mount
// of the box (desktop + mobile) and reused instantly on later focuses.
let productCache = null
let productPromise = null

function loadProducts() {
  if (productCache) return Promise.resolve(productCache)
  if (!productPromise) {
    productPromise = getAllProducts()
      .then((data) => {
        productCache = data
        return data
      })
      .catch((err) => {
        productPromise = null // allow a retry on the next focus
        throw err
      })
  }
  return productPromise
}

/**
 * Product search box with a live suggestions dropdown.
 *
 * As the user types we rank the catalog with the shared `searchProducts`
 * scorer and show the best matches (thumbnail, name, category, price). Enter or
 * the search icon runs a full search (→ /shop?q=); picking a suggestion (click
 * or ↑/↓ + Enter) opens that product directly.
 *
 * @param {() => void} [onNavigate] called after any navigation — e.g. to close
 *   the mobile menu.
 * @param {string} [className] classes for the <form> wrapper (layout/width).
 */
export default function SearchBox({ onNavigate, className = '' }) {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [products, setProducts] = useState(productCache ?? [])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1) // highlighted suggestion, -1 = none
  const rootRef = useRef(null)
  const listboxId = useId()

  const suggestions = useMemo(
    () => (value.trim() ? searchProducts(products, value, { limit: 6 }) : []),
    [products, value]
  )

  // Lazily fetch the catalog the first time the box is focused.
  function ensureProducts() {
    if (productCache) {
      setProducts(productCache)
      return
    }
    setLoading(true)
    loadProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  // Close the dropdown when clicking anywhere outside the box.
  useEffect(() => {
    function onDocMouseDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  function go(path) {
    setOpen(false)
    setActive(-1)
    onNavigate?.()
    navigate(path)
  }

  function handleSubmit(e) {
    e.preventDefault()
    // A highlighted suggestion opens that product; otherwise run a full search.
    if (active >= 0 && suggestions[active]) {
      go(`/product/${suggestions[active].slug}`)
      return
    }
    const q = value.trim()
    go(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop')
  }

  function handleKeyDown(e) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActive(-1)
    }
  }

  const showDropdown = open && value.trim().length > 0

  return (
    <form
      ref={rootRef}
      onSubmit={handleSubmit}
      className={`relative flex items-center ${className}`}
      role="search"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>

      <input
        type="search"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setActive(-1)
          setOpen(true)
        }}
        onFocus={() => {
          ensureProducts()
          setOpen(true)
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search products..."
        aria-label="Search products"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listboxId}-opt-${active}` : undefined}
        autoComplete="off"
        className="w-full rounded-lg border border-slate-700 bg-slate-800/70 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-400 outline-none transition-colors focus:border-orange-500 md:py-1.5"
      />

      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
        >
          {suggestions.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto py-1">
              {suggestions.map((p, i) => (
                <li key={p.id} role="option" id={`${listboxId}-opt-${i}`} aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(`/product/${p.slug}`)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                      i === active ? 'bg-orange-50 dark:bg-slate-700/70' : 'hover:bg-gray-50 dark:hover:bg-slate-700/40'
                    }`}
                  >
                    <img
                      src={getPrimaryImage(p)}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-md object-cover"
                      loading="lazy"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">{p.name}</span>
                      {p.category?.name && (
                        <span className="block truncate text-xs text-gray-500 dark:text-slate-400">{p.category.name}</span>
                      )}
                    </span>
                  </button>
                </li>
              ))}

              {/* Footer: run the full results search for the current text. */}
              <li className="border-t border-gray-100 dark:border-slate-700">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-orange-600 transition-colors hover:bg-gray-50 dark:text-orange-400 dark:hover:bg-slate-700/40"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  See all results for “{value.trim()}”
                </button>
              </li>
            </ul>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-slate-400">
              {loading ? 'Searching…' : (
                <>No products match “<span className="font-medium">{value.trim()}</span>”.</>
              )}
            </p>
          )}
        </div>
      )}
    </form>
  )
}
