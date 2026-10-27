'use server';

import { headers as nextHeaders, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { APIError, AuthenticationError, LockedAuth, UnverifiedEmail } from 'payload';

import { getPayloadClient } from '@/lib/payload';
import { checkRateLimit } from '@/lib/rateLimit';

export type AuthActionState = {
  error?: string;
  success?: string;
};

async function clientIp(): Promise<string> {
  const headers = await nextHeaders();
  // Prefer x-real-ip (set by trusted proxy); fall back to first x-forwarded-for entry.
  // Note: still best-effort; sophisticated attackers can spoof.
  return (
    headers.get('x-real-ip') || headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  );
}

function friendlyMessage(err: unknown): string {
  if (err instanceof UnverifiedEmail) {
    return 'Please verify your email address before logging in. Check your inbox for the verification link.';
  }
  if (err instanceof LockedAuth) {
    return 'Too many failed attempts. This account is temporarily locked.';
  }
  if (err instanceof AuthenticationError) {
    return 'Invalid email or password.';
  }
  if (err instanceof APIError) {
    // beforeMemberLogin throws for suspended members
    if (err.message.includes('not active') || err.status === 401) {
      return err.message;
    }
    return 'Invalid email or password.';
  }
  return 'Something went wrong. Please try again.';
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') || '');

  const ip = await clientIp();
  const limit = checkRateLimit(`login:${ip}`, 10, 60_000);
  if (!limit.ok) {
    return { error: `Too many attempts. Try again in ${limit.retryAfterSeconds}s.` };
  }
  const emailLimit = checkRateLimit(`login-email:${email}`, 5, 60_000);
  if (!emailLimit.ok) {
    return {
      error: `Too many attempts for this email. Try again in ${emailLimit.retryAfterSeconds}s.`,
    };
  }

  if (!email || !password) return { error: 'Email and password are required.' };

  try {
    const payload = await getPayloadClient();
    let token: string | undefined;
    let exp: number | undefined;
    try {
      // Staff first: administrators/editors live in the `users` collection. If
      // the same email also exists as a member (dual auth), signing in here must
      // resolve to the staff account — a member session cannot open /admin.
      const res = await payload.login({
        collection: 'users',
        data: { email, password },
      });
      token = res.token;
      exp = res.exp;
    } catch (staffErr) {
      try {
        // Everyone else is a community member. They can sign in on the public
        // site and are the only collection gated by member-only requirements
        // (email verification, suspension, challenge registration, etc.).
        const res = await payload.login({
          collection: 'members',
          data: { email, password },
        });
        token = res.token;
        exp = res.exp;
      } catch (memberErr) {
        // Member account states are the most useful message when the email
        // belongs to a member account; otherwise keep a staff lockout message.
        if (memberErr instanceof UnverifiedEmail || memberErr instanceof LockedAuth)
          throw memberErr;
        throw staffErr instanceof LockedAuth ? staffErr : memberErr;
      }
    }
    if (!token) return { error: 'Invalid email or password.' };

    const cookieStore = await cookies();
    cookieStore.set('payload-token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge:
        typeof exp === 'number' ? Math.max(60, Math.round(exp - Date.now() / 1000)) : 60 * 60 * 24,
    });
  } catch (err) {
    return { error: friendlyMessage(err) };
  }

  redirect('/');
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const displayName = String(formData.get('displayName') || '').trim();
  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') || '');

  const ip = await clientIp();
  const limit = checkRateLimit(`register:${ip}`, 5, 60_000);
  if (!limit.ok) {
    return {
      error: `Too many sign-ups from this address. Try again in ${limit.retryAfterSeconds}s.`,
    };
  }
  const emailLimit = checkRateLimit(`register-email:${email}`, 3, 60_000);
  if (!emailLimit.ok) {
    return {
      error: `Too many attempts for this email. Try again in ${emailLimit.retryAfterSeconds}s.`,
    };
  }

  if (!displayName || !email || !password) return { error: 'All fields are required.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };

  try {
    const payload = await getPayloadClient();

    const existing = await payload.find({
      collection: 'members',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    if (existing.totalDocs > 0) {
      return { error: 'An account with that email already exists. Try logging in instead.' };
    }

    await payload.create({
      collection: 'members',
      data: { displayName, email, password, status: 'active' },
    });
  } catch {
    return { error: 'Could not create your account. Please try again.' };
  }

  return {
    success:
      "Almost there! We've sent a verification email to " +
      email +
      '. Click the link to activate your account.',
  };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('payload-token');
  redirect('/');
}

export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase();

  const ip = await clientIp();
  const limit = checkRateLimit(`forgot-password:${ip}`, 5, 60_000);
  if (!limit.ok) {
    return { error: `Too many requests. Try again in ${limit.retryAfterSeconds}s.` };
  }
  const emailLimit = checkRateLimit(`forgot-password-email:${email}`, 3, 60_000);
  if (!emailLimit.ok) {
    return {
      error: `Too many attempts for this email. Try again in ${emailLimit.retryAfterSeconds}s.`,
    };
  }

  if (!email) return { error: 'Enter your email address.' };

  try {
    const payload = await getPayloadClient();
    await payload.forgotPassword({ collection: 'members', data: { email } });
  } catch {
    // Never reveal whether an account exists; show the same message either way.
  }

  return {
    success: 'If that email is registered, a password-reset link has been sent. Check your inbox.',
  };
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const token = String(formData.get('token') || '');
  const password = String(formData.get('password') || '');

  const limit = checkRateLimit(`reset-password:${await clientIp()}`, 10, 60_000);
  if (!limit.ok) {
    return { error: `Too many attempts. Try again in ${limit.retryAfterSeconds}s.` };
  }

  if (!token) return { error: 'This reset link is invalid or has expired.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };

  try {
    const payload = await getPayloadClient();
    await payload.resetPassword({
      collection: 'members',
      data: { token, password },
      overrideAccess: true,
    });
  } catch {
    return { error: 'This reset link is invalid or has expired. Request a new one.' };
  }

  const cookieStore = await cookies();
  cookieStore.delete('pw-reset-token');
  redirect('/login?reset=1');
}
