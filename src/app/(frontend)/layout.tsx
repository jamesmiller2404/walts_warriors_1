import type { Metadata } from 'next'
import React from 'react'

import { Footer } from '@/components/layout/Footer'
import { getPayloadClient } from '@/lib/payload'
import type { SiteSetting } from '@/payload-types'

import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const payload = await getPayloadClient()
    const settings = (await payload.findGlobal({
      slug: 'site-settings',
    })) as SiteSetting

    return {
      title: {
        default: settings.businessName || "Walt's Warriors",
        template: `%s | ${settings.businessName || "Walt's Warriors"}`,
      },
      description: settings.tagline || 'Professional small-business website',
    }
  } catch {
    return {
      title: "Walt's Warriors",
      description: 'Professional small-business website',
    }
  }
}

const fallbackSettings: SiteSetting = {
  id: 0,
  businessName: "Walt's Warriors",
  updatedAt: '',
  createdAt: '',
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  let settings = fallbackSettings

  try {
    const payload = await getPayloadClient()
    settings = (await payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
    })) as SiteSetting
  } catch {
    // DB may not be ready on first boot
  }

  return (
    <html lang="en">
      <body className="m-0 flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  )
}
