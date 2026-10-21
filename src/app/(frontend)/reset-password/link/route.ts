import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

// GET /reset-password/link?token=...
// Route Handlers are the only place a plain GET request may set cookies in
// Next.js App Router (Server Components cannot modify cookies during render).
// The forgot-password email links here: we exchange the URL token for a
// short-lived httpOnly cookie, then redirect to the bare /reset-password page
// so the token never lingers in the address bar or browser history.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (token) {
    const cookieStore = await cookies()
    cookieStore.set('pw-reset-token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 10, // 10 minutes
    })
  }

  // Redirect (with or without a token — the page shows the invalid-link
  // message when the cookie is missing/expired).
  return NextResponse.redirect(new URL('/reset-password', request.url))
}