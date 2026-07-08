// Shared product search relevance scorer.
//
// Used by both the navbar SearchBox (live suggestions) and the Shop page
// (results grid) so a query ranks the SAME way everywhere. Instead of a plain
// `name.includes(q)` substring test, we tokenize the query and match it against
// the product name, category, and description, then score by relevance — so
// "shoes" surfaces everything in the Shoes category and "red shoe" matches
// "Red Running Shoes" even though that exact string never appears.

// Lowercase, strip accents (café → cafe), collapse to a clean string.
function normalize(str) {
  return (str ?? '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

// Pre-normalized searchable fields for one product.
function fieldsOf(product) {
  return {
    name: normalize(product.name),
    category: normalize(product.category?.name),
    description: normalize(product.description),
  }
}

/**
 * Score a product against a query. 0 = no match; higher = more relevant.
 * Combines whole-phrase signals (strongest) with per-token matches so that
 * related and multi-word queries still rank sensibly.
 */
export function scoreProduct(product, query) {
  const q = normalize(query)
  if (!q) return 0

  const f = fieldsOf(product)
  const tokens = q.split(/\s+/).filter(Boolean)
  let score = 0

  // Whole-phrase signals — the clearest intent.
  if (f.name === q) score += 100 // exact product name
  else if (f.name.startsWith(q)) score += 45 // name starts with the query
  else if (f.name.includes(q)) score += 25 // query appears inside the name
  if (f.category.includes(q)) score += 15
  if (f.description.includes(q)) score += 8

  // Per-token matches — lets "red shoe" or a stray keyword still connect.
  for (const t of tokens) {
    if (f.name.includes(t)) score += 10
    else if (f.category.includes(t)) score += 6
    else if (f.description.includes(t)) score += 3
    else score -= 2 // token found nowhere → mild penalty, so full matches win
  }

  return score
}

/**
 * Filter a product list to those relevant to `query`, best match first.
 * Empty query returns the list unchanged (so other filters still apply).
 * Pass `{ limit }` to cap the number of results (used by the live dropdown).
 */
export function searchProducts(products, query, { limit } = {}) {
  if (!normalize(query)) return products

  const ranked = products
    .map((product) => ({ product, score: scoreProduct(product, query) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.product)

  return typeof limit === 'number' ? ranked.slice(0, limit) : ranked
}
