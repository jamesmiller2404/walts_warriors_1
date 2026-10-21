// Public base URL used in member-facing emails (verification / password reset).
export function publicSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
}

// Minimal inline-styled email shell shared by the member auth templates.
export function emailShell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#f5f5f4;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f4;padding:24px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <tr>
              <td style="background-color:#1c1917;padding:20px 24px;color:#ffffff;font-size:20px;font-weight:bold;">
                Walt&apos;s Warriors
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px;">
                <h1 style="margin:0 0 16px;font-size:18px;color:#1c1917;">${title}</h1>
                <div style="color:#44403c;font-size:15px;line-height:1.5;">${bodyHtml}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function verifyEmailHTML(token: string): string {
  const url = `${publicSiteUrl()}/verify/${token}`
  const body = `
    <p>Welcome to Walt's Warriors! Confirm your email address to activate your account.</p>
    <p style="margin:24px 0;"><a href="${url}" style="background-color:#15803d;color:#ffffff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block;">Verify my email</a></p>
    <p style="color:#78716c;font-size:13px;">Or copy this link: ${url}</p>
  `
  return emailShell('Verify your email', body)
}

export function resetPasswordEmailHTML(token: string): string {
  const url = `${publicSiteUrl()}/reset-password/link?token=${token}`
  const body = `
    <p>We received a request to reset your password. Click the button below to choose a new one. If this wasn't you, you can safely ignore this email.</p>
    <p style="margin:24px 0;"><a href="${url}" style="background-color:#15803d;color:#ffffff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block;">Reset my password</a></p>
    <p style="color:#78716c;font-size:13px;">Or copy this link: ${url}</p>
  `
  return emailShell('Reset your password', body)
}
