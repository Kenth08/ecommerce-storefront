export function getPrimaryImage(product) {
  const primary = product.images?.find((img) => img.is_primary)
  return primary?.image || product.images?.[0]?.image || '/placeholder-product.svg'
}

export function getActiveVariants(product) {
  return product.variants?.filter((v) => v.is_active) ?? []
}

/**
 * Units sold for a product. Prefers a real backend field; otherwise derives a
 * STABLE pseudo count from the id — same placeholder approach as getRating, so
 * a "Top Products" list looks like a real bestseller ranking without flickering.
 * TODO(backend): return `product.sold_count` directly once the API exposes it.
 */
export function getSoldCount(product) {
  const real = Number(product?.sold_count ?? product?.units_sold ?? product?.sold)
  if (Number.isFinite(real) && real > 0) return real
  const seed = Number(product?.id)
  if (!Number.isFinite(seed) || seed <= 0) return 0
  // Spread ~120 – 20k so the ranking reads like a populated storefront.
  return 120 + ((seed * 977) % 19880)
}

// Compact number for badges/labels, e.g. 12480 -> "12.5k", 308000 -> "308k".
export function formatCompact(value) {
  const n = Number(value) || 0
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`
  return String(n)
}

export function getStartingPrice(product) {
  const variants = getActiveVariants(product)
  if (variants.length === 0) return null
  return Math.min(...variants.map((v) => Number(v.price)))
}

// Single source of truth for price formatting so a product shows the SAME price
// on the card, detail, cart, wishlist, and checkout (always 2 decimals).
export function formatPrice(value) {
  const n = Number(value)
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : ''
}

/**
 * One small marketing badge for a product card. Prefers real backend fields
 * (discount / compare-at price / is_new / is_bestseller). When those are absent
 * it derives a STABLE badge from the product — same approach as getRating — so
 * the grid looks like a populated store without flickering between renders.
 *
 * Returns `null` or `{ label, tone }`. At most ONE badge, to keep cards clean.
 * TODO(backend): once the API exposes real flags/discounts, the deterministic
 * fallback block can be removed.
 */
export function getProductBadge(product) {
  if (!product) return null

  // 1. Real percentage discount, if the API provides one.
  const explicitPct = Number(product.discount_percent ?? product.discount ?? 0)
  if (explicitPct > 0) return { label: `-${Math.round(explicitPct)}%`, tone: 'sale' }

  // 2. Variant compare-at price → discount.
  for (const v of getActiveVariants(product)) {
    const was = Number(v.compare_at_price ?? v.original_price ?? 0)
    const now = Number(v.price)
    if (was > now && now > 0) {
      return { label: `-${Math.round((1 - now / was) * 100)}%`, tone: 'sale' }
    }
  }

  // 3. Explicit backend flags.
  if (product.is_bestseller) return { label: 'Best Seller', tone: 'bestseller' }
  if (product.is_new) return { label: 'New', tone: 'new' }

  // 4. Deterministic fallback (stable per product; leaves many cards badge-free
  //    so the grid never feels crowded).
  const seed = Number(product.id)
  if (!Number.isFinite(seed) || seed <= 0) return null
  if (seed % 6 === 0) return { label: 'Best Seller', tone: 'bestseller' }
  if (seed % 6 === 1) return { label: 'New', tone: 'new' }
  if (seed % 6 === 2) return { label: 'Free Shipping', tone: 'shipping' }
  return null
}
