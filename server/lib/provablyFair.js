import crypto from 'crypto';

/**
 * Provably Fair system using HMAC-SHA256.
 *
 * Flow:
 *  1. Server generates a server_seed and shows its SHA-256 hash to the player.
 *  2. Player provides (or keeps default) client_seed.
 *  3. Each bet increments a nonce.
 *  4. Result = HMAC-SHA256(serverSeed, clientSeed:nonce) -> deterministic float 0-1.
 *  5. After rotating seeds the old server_seed is revealed so the player can verify.
 */

/** Generate a cryptographically secure 32-byte hex server seed. */
export function generateServerSeed() {
  return crypto.randomBytes(32).toString('hex');
}

/** SHA-256 hash of the server seed (safe to show before the game). */
export function hashServerSeed(seed) {
  return crypto.createHash('sha256').update(seed).digest('hex');
}

/**
 * Derive a deterministic float in [0, 1) from seed pair + nonce.
 * Uses the first 4 bytes of HMAC-SHA256 as a uint32, then divides by 2^32.
 */
export function generateResult(serverSeed, clientSeed, nonce) {
  const hmac = crypto
    .createHmac('sha256', serverSeed)
    .update(`${clientSeed}:${nonce}`)
    .digest('hex');

  // Take the first 8 hex chars (4 bytes) and convert to a float 0-1
  const int = parseInt(hmac.slice(0, 8), 16);
  return int / 0x100000000; // 2^32
}

/**
 * Verify a previously claimed result.
 * Returns true if recomputing the result matches the claimed value.
 */
export function verifyResult(serverSeed, clientSeed, nonce, claimedResult) {
  const recomputed = generateResult(serverSeed, clientSeed, nonce);
  // Allow a tiny floating-point tolerance
  return Math.abs(recomputed - claimedResult) < 1e-12;
}
