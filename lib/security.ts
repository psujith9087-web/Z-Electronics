import crypto from "crypto";

const ADMIN_SECRET =
  process.env.AUTH_SECRET ||
  process.env.ADMIN_PASSWORD ||
  "z-electronics-super-secure-token-salt-2026";

const CUSTOMER_SECRET =
  process.env.AUTH_SECRET ||
  process.env.ADMIN_PASSWORD ||
  "z-electronics-customer-token-salt-2026";

// Rate limiting in-memory store for admin login attempts
interface RateLimitEntry {
  attempts: number;
  blockedUntil: number;
}
const loginAttempts = new Map<string, RateLimitEntry>();

export function getClientIdentifier(ip: string, email: string): string {
  return `${ip}:${email.toLowerCase().trim()}`;
}

export function checkRateLimit(key: string): { allowed: boolean; waitMinutes?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry) return { allowed: true };

  if (entry.blockedUntil > now) {
    const waitMinutes = Math.ceil((entry.blockedUntil - now) / 60000);
    return { allowed: false, waitMinutes };
  }

  // If lockout expired, reset
  if (entry.blockedUntil > 0 && entry.blockedUntil <= now) {
    loginAttempts.delete(key);
  }

  return { allowed: true };
}

export function recordFailedAttempt(key: string) {
  const now = Date.now();
  const entry = loginAttempts.get(key) || { attempts: 0, blockedUntil: 0 };
  entry.attempts += 1;

  // If 5 failed attempts reached, block for 15 minutes
  if (entry.attempts >= 5) {
    entry.blockedUntil = now + 15 * 60 * 1000;
  }

  loginAttempts.set(key, entry);
}

export function recordSuccessfulLogin(key: string) {
  loginAttempts.delete(key);
}

export function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function signAdminToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(`admin-session:${timestamp}`)
    .digest("hex");
  return `${timestamp}.${signature}`;
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token || !token.includes(".")) return false;
  const [timestampStr, signature] = token.split(".");
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Max age: 7 days
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  if (now - timestamp > maxAge || timestamp > now + 60000) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(`admin-session:${timestampStr}`)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expectedSignature, "hex");

  if (sigBuf.length !== expBuf.length) return false;

  try {
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

export function signCustomerSession(session: any): string {
  const jsonStr = JSON.stringify(session);
  const b64 = Buffer.from(jsonStr, "utf8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", CUSTOMER_SECRET)
    .update(`cust:${b64}`)
    .digest("hex");
  return `${b64}.${signature}`;
}

export function verifyCustomerSession(token: string): any | null {
  try {
    if (token.includes(".")) {
      const [b64, signature] = token.split(".");
      const expectedSignature = crypto
        .createHmac("sha256", CUSTOMER_SECRET)
        .update(`cust:${b64}`)
        .digest("hex");

      const sigBuf = Buffer.from(signature, "hex");
      const expBuf = Buffer.from(expectedSignature, "hex");

      if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
        const json = Buffer.from(b64, "base64url").toString("utf8");
        const parsed = JSON.parse(json);
        if (parsed?.phone && parsed?.name) {
          return {
            id: parsed.id || `cust_${parsed.phone}`,
            name: parsed.name,
            phone: parsed.phone,
            email: parsed.email || "",
            isLoggedIn: true,
          };
        }
      }
      return null;
    }

    // Graceful backward compatibility for existing unencoded sessions
    const parsed = JSON.parse(token);
    if (parsed?.phone && parsed?.name) {
      return {
        id: parsed.id || `cust_${parsed.phone}`,
        name: parsed.name,
        phone: parsed.phone,
        email: parsed.email || "",
        isLoggedIn: true,
      };
    }
  } catch {
    return null;
  }
  return null;
}

// ── Customer Review Rate Limiting & Anti-Spam ────────────────
const reviewSubmissions = new Map<string, number[]>();

export function checkReviewRateLimit(identifier: string): { allowed: boolean; waitMinutes?: number } {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes window
  const maxSubmissions = 3;

  const timestamps = (reviewSubmissions.get(identifier) || []).filter(
    (time) => now - time < windowMs
  );

  if (timestamps.length >= maxSubmissions) {
    const oldest = timestamps[0];
    const waitMinutes = Math.ceil((windowMs - (now - oldest)) / 60000);
    return { allowed: false, waitMinutes };
  }

  reviewSubmissions.set(identifier, timestamps);
  return { allowed: true };
}

export function recordReviewSubmission(identifier: string): void {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const timestamps = (reviewSubmissions.get(identifier) || []).filter(
    (time) => now - time < windowMs
  );
  timestamps.push(now);
  reviewSubmissions.set(identifier, timestamps);
}

// ── XSS Sanitization Helper ──────────────────────────────────
export function sanitizeInputText(input: string | undefined | null, maxLength = 1000): string {
  if (!input) return "";
  let clean = input
    .replace(/<[^>]*>?/gm, "") // strip all HTML tags
    .replace(/javascript:/gi, "") // strip javascript: pseudo protocols
    .replace(/onload|onerror|onclick|onmouseover/gi, "") // strip common event handlers
    .trim();

  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength).trim();
  }

  return clean;
}

