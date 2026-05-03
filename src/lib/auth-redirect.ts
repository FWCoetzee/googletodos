// Allowlist of paths that are valid post-login redirect targets.
// Keep in sync with ProtectedRoute usage in src/App.tsx.
export const ALLOWED_REDIRECT_PATHS = ['/', '/about', '/contact'] as const;

const DEFAULT_REDIRECT = '/';
const AUTH_PATHS = ['/auth'];

/**
 * Sanitize a redirect target to prevent:
 *  - Open redirects (external URLs, protocol-relative URLs, backslash tricks)
 *  - Redirect loops back to /auth
 *  - Redirects to unknown/disallowed paths
 *
 * Returns a safe in-app path (always starts with "/").
 */
export function sanitizeRedirect(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') return DEFAULT_REDIRECT;

  let value = raw.trim();
  if (!value) return DEFAULT_REDIRECT;

  // Decode once in case it was double-encoded; ignore errors.
  try {
    value = decodeURIComponent(value);
  } catch {
    return DEFAULT_REDIRECT;
  }

  // Must be a relative path starting with a single "/".
  if (!value.startsWith('/')) return DEFAULT_REDIRECT;
  if (value.startsWith('//') || value.startsWith('/\\')) return DEFAULT_REDIRECT;

  // Reject anything that looks like a full URL or contains control chars.
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return DEFAULT_REDIRECT;
  if (/[\x00-\x1f\s]/.test(value)) return DEFAULT_REDIRECT;

  // Strip query/hash to check the pathname against the allowlist.
  const pathname = value.split('?')[0].split('#')[0];

  // Never loop back to auth pages.
  if (AUTH_PATHS.includes(pathname)) return DEFAULT_REDIRECT;

  if (!ALLOWED_REDIRECT_PATHS.includes(pathname as (typeof ALLOWED_REDIRECT_PATHS)[number])) {
    return DEFAULT_REDIRECT;
  }

  return value;
}
