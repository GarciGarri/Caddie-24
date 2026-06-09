import crypto from "crypto";

/**
 * Signed magic-link tokens for the public player portal (/p/[token]).
 * Format: base64url(playerId.expiresEpoch).base64url(hmacSha256)
 * Secret: AUTH_SECRET (already required by NextAuth).
 */

function getSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET no configurado");
  return secret;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

/** Create a portal token valid for `days` (default 90). */
export function createPortalToken(playerId: string, days = 90): string {
  const expires = Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;
  const payload = `${playerId}.${expires}`;
  return `${b64url(payload)}.${sign(payload)}`;
}

/** Verify a portal token; returns the playerId or null. */
export function verifyPortalToken(token: string): string | null {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    const payload = Buffer.from(payloadB64, "base64url").toString();
    const expected = sign(payload);
    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected)
      )
    ) {
      return null;
    }

    const lastDot = payload.lastIndexOf(".");
    const playerId = payload.slice(0, lastDot);
    const expires = parseInt(payload.slice(lastDot + 1), 10);
    if (!playerId || isNaN(expires)) return null;
    if (expires < Math.floor(Date.now() / 1000)) return null;

    return playerId;
  } catch {
    return null;
  }
}
