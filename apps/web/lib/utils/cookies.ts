/**
 * Client-side cookie utilities
 * Provides helpers for reading cookies and creating CSRF-protected fetch headers
 */

/**
 * Get a cookie value by name from document.cookie
 * @param name - Cookie name to retrieve
 * @returns Cookie value or undefined if not found
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined
  }

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift()
  }
  
  return undefined
}

/**
 * Get the CSRF token from cookies
 * @returns CSRF token value or undefined if not found
 */
export function getCsrfToken(): string | undefined {
  return getCookie('csrf-token')
}

/**
 * Create fetch headers with CSRF token automatically included
 * Useful for making authenticated API requests that require CSRF protection
 * 
 * @param additionalHeaders - Optional additional headers to include
 * @returns Headers object with CSRF token and Content-Type
 * 
 * @example
 * ```ts
 * const response = await fetch('/api/endpoint', {
 *   method: 'POST',
 *   headers: createFetchHeaders(),
 *   body: JSON.stringify(data)
 * })
 * ```
 */
export function createFetchHeaders(
  additionalHeaders?: Record<string, string>
): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  }

  const csrfToken = getCsrfToken()
  if (csrfToken) {
    headers['x-csrf-token'] = csrfToken
  }

  return headers
}
