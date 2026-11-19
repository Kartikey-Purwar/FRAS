const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ROLL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9/_-]{2,19}$/

export function validateRequired(value, label) {
  if (!value?.trim()) return `${label} is required.`
  return ''
}

export function validateRollNumber(value) {
  const required = validateRequired(value, 'College roll number')
  if (required) return required
  if (!ROLL_PATTERN.test(value.trim())) {
    return 'Enter a valid roll number (3–20 letters, numbers, hyphens, or slashes).'
  }
  return ''
}

export function validateEmail(value) {
  const required = validateRequired(value, 'College email address')
  if (required) return required
  if (!EMAIL_PATTERN.test(value.trim())) {
    return 'Enter a valid email address.'
  }
  return ''
}

export function validatePassword(value) {
  const required = validateRequired(value, 'Password')
  if (required) return required
  if (value.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    return 'Password must include at least one letter and one number.'
  }
  return ''
}

export function validateConfirmPassword(password, confirmPassword) {
  const required = validateRequired(confirmPassword, 'Confirm password')
  if (required) return required
  if (password !== confirmPassword) return 'Passwords do not match.'
  return ''
}

export function validateSignup(values) {
  return {
    name: validateRequired(values.name, 'Student name'),
    rollNumber: validateRollNumber(values.rollNumber),
    email: validateEmail(values.email),
    password: validatePassword(values.password),
    confirmPassword: validateConfirmPassword(values.password, values.confirmPassword),
  }
}

export function validateLogin(values) {
  return {
    rollNumber: validateRollNumber(values.rollNumber),
    password: validateRequired(values.password, 'Password'),
  }
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean)
}
