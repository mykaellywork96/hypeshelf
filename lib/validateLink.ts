/** Protocols that are safe to store and render as external links. */
const ALLOWED_PROTOCOLS = ["http:", "https:"];

/**
 * Validate a user-supplied URL.
 *
 * Returns the trimmed URL on success.
 * Throws a descriptive Error on failure.
 *
 * Extracted as a standalone module so it can be:
 *   - imported by the Convex mutation (the security gate), and
 *   - unit tested in isolation without pulling in the Convex runtime.
 */
export function validateLink(raw: string): string {
  const trimmed = raw.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      "Invalid URL. Make sure it starts with https:// or http://"
    );
  }

  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    throw new Error(
      `URLs must use http or https. Received: "${parsed.protocol}"`
    );
  }

  return trimmed;
}
