# Authentication Security

## Overview

EmbedIQ implements multiple layers of authentication security to protect against common attack vectors including brute force attacks, bot registration, and password reset spam.

## Security Features

### 1. reCAPTCHA v3 Bot Protection

**Endpoints Protected:**
- `/api/auth/register` - Prevents bot registrations
- `/api/auth/forgot-password` - Prevents password reset spam
- Login (after 3 failed attempts) - Prevents brute force attacks

**Implementation:**
- Google reCAPTCHA v3 for invisible bot detection
- Score-based verification (minimum 0.5)
- Action verification to prevent token reuse
- Automatic fallback in development mode

**Configuration:**

```bash
# .env
RECAPTCHA_SECRET_KEY=your-secret-key-here
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key-here
```

**Example Usage:**

```typescript
import { verifyRecaptchaToken } from '@/lib/recaptcha';

// Verify reCAPTCHA token
const result = await verifyRecaptchaToken(
  recaptchaToken,
  'register', // action name
  0.5 // minimum score
);

if (!result.success) {
  return NextResponse.json(
    { error: 'Bot detected' },
    { status: 403 }
  );
}
```

---

### 2. Failed Login Tracking

**Purpose:** Tracks failed login attempts to detect brute force attacks and trigger additional security measures.

**Features:**
- In-memory tracking of failed login attempts per email
- Automatic cleanup of old entries (>1 hour)
- Configurable threshold (default: 3 attempts)
- Time window tracking (default: 15 minutes)
- Automatic reset on successful login

**How It Works:**

```
User attempts login with wrong password:
  ├─> recordFailedLogin(email)
  ├─> Increment counter for this email
  └─> Check if threshold reached (3 attempts)

User successfully logs in:
  └─> resetFailedLogins(email)
      └─> Clear counter for this email

After 15 minutes:
  └─> Counter automatically resets
```

**API Functions:**

```typescript
import {
  recordFailedLogin,
  resetFailedLogins,
  requiresRecaptcha,
  getFailedLoginCount
} from '@/lib/login-tracking';

// Record a failed login
recordFailedLogin('user@example.com');

// Check if reCAPTCHA should be required
if (requiresRecaptcha('user@example.com')) {
  // Require reCAPTCHA for next login attempt
}

// Reset on successful login
resetFailedLogins('user@example.com');

// Get current count
const count = getFailedLoginCount('user@example.com');
```

**Configuration:**

```typescript
// Default values
const threshold = 3;  // Require reCAPTCHA after 3 failures
const timeWindow = 15 * 60 * 1000; // 15 minutes

// Custom configuration
if (requiresRecaptcha(email, 5, 30 * 60 * 1000)) {
  // Require reCAPTCHA after 5 failures in 30 minutes
}
```

---

### 3. Password Reset Token Expiration

**Purpose:** Prevents abuse of password reset tokens by enforcing expiration times.

**Implementation:**
- Tokens expire after 1 hour
- Expiration checked before allowing password reset
- Expired tokens automatically rejected
- Tokens cleared after successful password reset

**Database Fields:**

```typescript
model User {
  resetToken       String?
  resetTokenExpiry DateTime?
}
```

**Flow:**

```
User requests password reset:
  ├─> Generate random token
  ├─> Set resetTokenExpiry = now + 1 hour
  ├─> Store in database
  └─> Send email with reset link

User clicks reset link:
  ├─> Check if token exists
  ├─> Check if resetTokenExpiry > now
  │   ├─> Valid: Allow password reset
  │   └─> Expired: Reject with error
  └─> Clear token after successful reset
```

**Code Example:**

```typescript
// Generate token (in forgot-password endpoint)
const resetToken = generateToken();

await db.user.update({
  where: { id: user.id },
  data: {
    resetToken,
    resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour
  },
});

// Verify token (in reset-password endpoint)
const user = await db.user.findFirst({
  where: {
    resetToken: token,
    resetTokenExpiry: {
      gt: new Date(), // Token hasn't expired
    },
  },
});

if (!user) {
  return NextResponse.json(
    { error: "Invalid or expired reset token" },
    { status: 400 }
  );
}
```

---

### 4. Security Audit Logging

**Purpose:** Track all security-related events for compliance and incident response.

**Logged Events:**
- `login_success` - Successful login
- `login_failed` - Failed login attempt
- `password_reset_request` - Password reset requested
- `password_reset_success` - Password successfully reset
- `2fa_enabled` - 2FA enabled on account
- `2fa_disabled` - 2FA disabled on account

**Database Schema:**

```sql
CREATE TABLE security_audit_log (
  id            TEXT PRIMARY KEY,
  user_id       TEXT,
  company_id    TEXT,
  event_type    TEXT NOT NULL,
  ip_address    TEXT NOT NULL,
  user_agent    TEXT NOT NULL,
  details       TEXT,
  timestamp     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Usage:**

```typescript
import { logSecurityEvent, sanitizeIp } from '@/lib/security';

await logSecurityEvent(
  user.id,
  user.companyId,
  'login_failed',
  sanitizeIp(req.headers['x-forwarded-for']),
  req.headers['user-agent'],
  'Wrong password'
);
```

---

### 5. Two-Factor Authentication (2FA)

**Supported Methods:**
- Time-based One-Time Password (TOTP)
- Authenticator apps (Google Authenticator, Authy, etc.)
- Backup codes for account recovery

**Features:**
- Encrypted 2FA secrets in database
- Backup codes with one-time use
- Session-based 2FA verification
- Grace period for 2FA setup

**See:** `docs/2FA_SYSTEM.md` for detailed documentation

---

## Security Best Practices

### 1. Password Requirements

```typescript
// Minimum requirements enforced
- Minimum length: 6 characters
- Maximum length: 128 characters
- Hashed with bcrypt (cost factor: 12)
- Password history (prevent reuse) - TODO
```

### 2. Session Security

```typescript
// Session configuration
session: {
  strategy: "jwt",
  maxAge: 30 * 60, // 30 minutes
}

// Secure cookies
cookies: {
  sessionToken: {
    name: `__Secure-next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true // HTTPS only in production
    }
  }
}
```

### 3. Rate Limiting

**See:** `docs/REDIS_RATE_LIMITING.md` for detailed documentation

- API endpoints rate limited via Redis
- Login attempts tracked separately
- Automatic IP-based blocking after threshold

### 4. Input Validation

```typescript
// All inputs validated with Zod
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
  name: z.string().min(1),
  recaptchaToken: z.string().optional(),
});
```

---

## Attack Prevention

### Brute Force Attacks

**Prevention Layers:**
1. Failed login tracking (3 attempts → tracking)
2. reCAPTCHA after threshold reached
3. Account lockout (optional, via isActive flag)
4. Rate limiting per IP address
5. Security audit logging

### Bot Registration

**Prevention:**
- reCAPTCHA v3 on registration form
- Score-based verification (min 0.5)
- Email verification (future enhancement)
- Suspicious pattern detection in logs

### Password Reset Spam

**Prevention:**
- reCAPTCHA on forgot-password endpoint
- 1-hour token expiration
- Single-use tokens
- Email enumeration protection (same response for valid/invalid emails)

### Session Hijacking

**Prevention:**
- HTTP-only cookies
- Secure flag in production
- SameSite cookie attribute
- Short session duration (30 minutes)
- Token rotation on privilege escalation

---

## Monitoring & Alerts

### Failed Login Monitoring

```typescript
import { getLoginTrackingStats } from '@/lib/login-tracking';

// Get current statistics
const stats = getLoginTrackingStats();
console.log(stats);
// Output:
// {
//   totalTracked: 5,
//   entries: [
//     { email: 'use***', count: 3, ageMinutes: 5 },
//     { email: 'adm***', count: 2, ageMinutes: 2 }
//   ]
// }
```

### Sentry Integration

Failed authentication attempts above threshold are automatically reported to Sentry:

```typescript
if (failedCount >= 5) {
  Sentry.captureMessage('Multiple failed login attempts', {
    level: 'warning',
    extra: {
      email: email.substring(0, 3) + '***',
      attempts: failedCount,
    },
  });
}
```

---

## Testing

### Manual Testing

```bash
# Test registration with reCAPTCHA
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "recaptchaToken": "test-token"
  }'

# Test failed login tracking
# Try login 3 times with wrong password
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -d "email=test@example.com&password=wrong" \
  --cookie-jar cookies.txt

# Check if threshold reached (should require reCAPTCHA)
```

### Automated Testing

```typescript
// Jest test example
describe('Failed Login Tracking', () => {
  it('should track failed login attempts', () => {
    recordFailedLogin('test@example.com');
    recordFailedLogin('test@example.com');
    recordFailedLogin('test@example.com');

    expect(requiresRecaptcha('test@example.com')).toBe(true);
    expect(getFailedLoginCount('test@example.com')).toBe(3);
  });

  it('should reset on successful login', () => {
    recordFailedLogin('test@example.com');
    resetFailedLogins('test@example.com');

    expect(requiresRecaptcha('test@example.com')).toBe(false);
    expect(getFailedLoginCount('test@example.com')).toBe(0);
  });
});
```

---

## Configuration

### Environment Variables

```bash
# reCAPTCHA (required for production)
RECAPTCHA_SECRET_KEY=your-secret-key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key

# NextAuth (required)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-here-min-32-chars

# Database (required)
DATABASE_URL=postgresql://...

# Encryption (required for 2FA)
ENCRYPTION_KEY=your-encryption-key-32-chars
```

### Production Checklist

- [ ] Set `RECAPTCHA_SECRET_KEY` and `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- [ ] Generate strong `NEXTAUTH_SECRET` (min 32 chars)
- [ ] Generate strong `ENCRYPTION_KEY` (32 chars for AES-256)
- [ ] Enable HTTPS (secure cookies)
- [ ] Configure Sentry for security alerts
- [ ] Set up monitoring for failed login attempts
- [ ] Review security audit logs regularly
- [ ] Test password reset flow end-to-end
- [ ] Verify reCAPTCHA on all auth endpoints
- [ ] Enable 2FA for admin accounts

---

## Future Enhancements

### Planned Features

1. **Email Verification**
   - Send verification email on registration
   - Prevent unverified accounts from logging in
   - Re-send verification email functionality

2. **Account Lockout**
   - Automatic account lockout after 10 failed attempts
   - Admin-only unlock functionality
   - Time-based automatic unlock (24 hours)

3. **IP-based Rate Limiting**
   - Track failed attempts per IP address
   - Temporary IP bans after threshold
   - Whitelist for trusted IPs

4. **Password Strength Requirements**
   - Minimum complexity requirements
   - Password history (prevent reuse)
   - Compromised password detection (HaveIBeenPwned API)

5. **Login Notifications**
   - Email notification on successful login from new device
   - Email notification on password change
   - Email notification on 2FA changes

6. **Session Management**
   - View active sessions
   - Revoke specific sessions
   - "Log out all devices" functionality

---

## References

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)

---

**Last Updated:** November 5, 2025
**Version:** 1.0.0
