/**
 * JWT Authentication Utility (JSON Web Token Simulation via Web Crypto & Base64URL)
 * Produces standard header.payload.signature format
 */

const SECRET_KEY = "COER_AYURVEDA_HMS_SECURE_JWT_SECRET_2026";

function base64UrlEncode(str) {
  return btoa(str)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

export function generateJwtToken(userPayload, expiresInHours = 24) {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    ...userPayload,
    iat: now,
    exp: now + (expiresInHours * 3600)
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  
  // Create HMAC-SHA256 signature simulation
  const signatureInput = `${encodedHeader}.${encodedPayload}.${SECRET_KEY}`;
  const signature = base64UrlEncode(signatureInput);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyAndDecodeJwtToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;

  try {
    // Verify signature match
    const expectedSignatureInput = `${encodedHeader}.${encodedPayload}.${SECRET_KEY}`;
    const expectedSignature = base64UrlEncode(expectedSignatureInput);

    if (signature !== expectedSignature) {
      console.warn("JWT Signature mismatch");
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      console.warn("JWT Token expired");
      return null;
    }

    return payload;
  } catch (e) {
    console.error("JWT Verification error", e);
    return null;
  }
}
