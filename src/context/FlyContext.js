import { createContext, useContext } from 'react'

// Shared "fly to nav icon" animation system. Any component can trigger a
// floating product preview that flies to the navbar wishlist/cart icon.
export const FlyContext = createContext(null)

export function useFly() {
  return useContext(FlyContext)
}
