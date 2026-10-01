// src/lib/api.js
// ─── Standardized API Response Helpers ────────────────────────
// All API route handlers should use these constructors to maintain
// consistent JSON response shapes: { success, data?, error? }

/**
 * Return a success response with data.
 * @param {any} data - The response payload
 * @param {number} status - HTTP status code (default: 200)
 */
export function successResponse(data, status = 200) {
  return Response.json({ success: true, data }, { status });
}

/**
 * Return an error response with message.
 * @param {string} message - The error description
 * @param {number} status - HTTP status code (default: 500)
 */
export function errorResponse(message, status = 500) {
  return Response.json({ success: false, error: message }, { status });
}
