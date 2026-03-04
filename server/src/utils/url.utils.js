/**
 * URL Sanitization & Validation Utility
 * Accepts http:// and https:// links including complex structures (dashes, deep paths, query strings).
 * Rejects dangerous protocols: javascript:, data:, vbscript:, blob:
 */

const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'blob:'];

/**
 * Validates a URL string. Accepts http and https only.
 * Returns true if valid, false otherwise.
 */
function isValidUrl(url) {
    if (!url || typeof url !== 'string') return false;

    const trimmed = url.trim().toLowerCase();

    // Reject dangerous protocols
    if (DANGEROUS_PROTOCOLS.some(proto => trimmed.startsWith(proto))) {
        return false;
    }

    try {
        const parsed = new URL(url.trim());
        // Only allow http and https
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Sanitizes a URL string.
 * Returns sanitized URL string, or null if invalid/dangerous.
 */
function sanitizeUrl(url) {
    if (!url) return null;

    const trimmed = url.trim();
    const lower = trimmed.toLowerCase();

    // Hard-reject dangerous protocols regardless of case/encoding tricks
    if (DANGEROUS_PROTOCOLS.some(proto => lower.startsWith(proto))) {
        return null;
    }

    if (!isValidUrl(trimmed)) return null;

    return trimmed;
}

module.exports = { isValidUrl, sanitizeUrl };
