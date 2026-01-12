/**
 * Format date to readable string
 */
export function formatDate(date, includeTime = false) {
  if (!date) return ''

  const d = new Date(date)
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }

  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }

  return d.toLocaleDateString('en-US', options)
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date) {
  if (!date) return ''

  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now - then) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`

  return formatDate(date)
}

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Truncate text to specified length
 */
export function truncate(text, length = 100) {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Get initials from name (supports both fullname and firstName/lastName)
 */
export function getInitials(firstNameOrFullname, lastName = null) {
  // If lastName is provided, use the old format
  if (lastName) {
    const first = firstNameOrFullname?.charAt(0) || ''
    const last = lastName?.charAt(0) || ''
    return (first + last).toUpperCase()
  }
  
  // Otherwise treat as fullname
  if (!firstNameOrFullname) return '?'
  const parts = firstNameOrFullname.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Get color for avatar based on name
 */
export function getAvatarColor(name) {
  const colors = [
    '#1976D2', '#26A69A', '#00BCD4', '#4CAF50',
    '#FF9800', '#E91E63', '#9C27B0', '#795548'
  ]

  if (!name) return colors[0]

  const charCode = name.charCodeAt(0)
  return colors[charCode % colors.length]
}

/**
 * Validate file upload
 */
export function validateFile(file, maxSize, allowedTypes) {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${formatFileSize(maxSize)}`
    }
  }

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed'
    }
  }

  return { valid: true }
}

/**
 * Download file from URL
 */
export function downloadFile(url, filename) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

/**
 * Debounce function
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Check if user has permission
 */
export function hasPermission(userRoles, requiredRole) {
  // Handle both array and string inputs
  const roles = Array.isArray(userRoles) ? userRoles : [userRoles]
  
  const roleHierarchy = {
    USER: 0,
    AGENT: 1,
    ADMIN: 2,
  }

  // Check if user has any role that meets or exceeds the required role
  return roles.some(role => roleHierarchy[role] >= roleHierarchy[requiredRole])
}

/**
 * Generate random color
 */
export function randomColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16)
}

/**
 * Parse GraphQL errors
 */
export function parseGraphQLError(error) {
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    return error.graphQLErrors[0].message
  }
  if (error.networkError) {
    return 'Network error. Please check your connection.'
  }
  return error.message || 'An unexpected error occurred'
}
