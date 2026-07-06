export function getPrimaryImage(product) {
  const primary = product.images?.find((img) => img.is_primary)
  return primary?.image || product.images?.[0]?.image || '/placeholder-product.svg'
}

export function getActiveVariants(product) {
  return product.variants?.filter((v) => v.is_active) ?? []
}

export function getStartingPrice(product) {
  const variants = getActiveVariants(product)
  if (variants.length === 0) return null
  return Math.min(...variants.map((v) => Number(v.price)))
}
