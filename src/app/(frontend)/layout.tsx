import type { Metadata } from 'next';
import React from 'react';

import { Footer } from '@/components/layout/Footer';
import { GuestLinkHint } from '@/components/layout/GuestLinkHint';
import { getCurrentAccount } from '@/lib/auth';
import {
  archivoBlack,
  ebGaramondItalic,
  ebGaramondMediumItalic,
  ebGaramondSemiBoldItalic,
  manropeBold,
  manropeExtraBold,
  manropeRegular,
  manropeSemiBold,
  montserratBold,
  montserratExtraBold,
  sourceSans3,
} from '@/lib/fonts';
import { getPayloadClient } from '@/lib/payload';
import type { SiteSetting } from '@/payload-types';

import './globals.css';

// Every frontend page is rendered from the CMS at request time.
//
// Without this, `next build` prerenders each page in a separate worker, and each
// worker opens its own Postgres pool — which blows past Supabase's session-mode
// connection limit ("EMAXCONNSESSION … pool_size: 15") and fails the deploy. It
// also keeps admin edits live without waiting for a redeploy.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const payload = await getPayloadClient();
    const settings = (await payload.findGlobal({
      slug: 'site-settings',
    })) as SiteSetting;

    return {
      title: {
        default: settings.businessName || "Walt's Warriors",
        template: `%s | ${settings.businessName || "Walt's Warriors"}`,
      },
      description: settings.tagline || 'Professional small-business website',
    };
  } catch {
    return {
      title: "Walt's Warriors",
      description: 'Professional small-business website',
    };
  }
}

const fallbackSettings: SiteSetting = {
  id: 0,
  businessName: "Walt's Warriors",
  updatedAt: '',
  createdAt: '',
};

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  let settings = fallbackSettings;

  try {
    const payload = await getPayloadClient();
    settings = (await payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
    })) as SiteSetting;
  } catch {
    // DB may not be ready on first boot
  }

  // Guest-preview hints: only the hard-coded demo identity (site opened to
  // guests via OPEN_SITE_TO_GUESTS) gets the green "this link/button is live"
  // flicker defined in globals.css. Real members/staff and a gated site never
  // set the attribute, so nothing is highlighted for them.
  const account = await getCurrentAccount();
  const guestPreview = account?.isDemo === true;

  return (
    <html lang="en" data-guest-hint={guestPreview ? 'true' : undefined}>
      <body
        className={`
          ${archivoBlack.variable}
          ${ebGaramondItalic.variable}
          ${ebGaramondMediumItalic.variable}
          ${ebGaramondSemiBoldItalic.variable}
          ${manropeRegular.variable}
          ${manropeSemiBold.variable}
          ${manropeBold.variable}
          ${manropeExtraBold.variable}
          ${montserratBold.variable}
          ${montserratExtraBold.variable}
          ${sourceSans3.variable}
          m-0 flex min-h-screen flex-col font-sans antialiased text-stone-900 bg-stone-50
        `}
      >
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
        {/* Client-side flash driver for the guest link hints. Mounted only for
            the demo identity, so real sessions never run it. */}
        {guestPreview ? <GuestLinkHint /> : null}
      </body>
    </html>
  );
}
