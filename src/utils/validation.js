// Pure, UI-free validation helpers shared by the auth forms.

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

// Returns an errors object keyed by field name. Empty object = valid.
export function validateLogin({ email, password }) {
  const errors = {}
  if (!email.trim()) errors.email = 'Email is required.'
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address.'
  if (!password) errors.password = 'Password is required.'
  return errors
}

export function validateRegister({ email, phone, password, password2 }) {
  const errors = {}

  if (!email.trim()) errors.email = 'Email is required.'
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address.'

  if (!phone.trim()) errors.phone = 'Phone number is required.'
  else if (phone.replace(/\D/g, '').length < 7) errors.phone = 'Enter a valid phone number.'

  if (!password) errors.password = 'Password is required.'
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.'

  if (!password2) errors.password2 = 'Please confirm your password.'
  else if (password2 !== password) errors.password2 = 'Passwords do not match.'

  return errors
}
