import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Programs } from './collections/Programs'
import { Resources } from './collections/Resources'
import { Testimonials } from './collections/Testimonials'
import { Events } from './collections/Events'
import { Gallery } from './collections/Gallery'
import { Challenges } from './collections/Challenges'
import { SiteSettings } from './globals/SiteSettings'
import { HomePage } from './globals/HomePage'
import { AboutWalt } from './globals/AboutWalt'
import { ContactPage } from './globals/ContactPage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// v1 local disk; Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production)
const useVercelBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: " — Walt's Warriors",
    },
  },
  collections: [
    Users,
    Media,
    Programs,
    Resources,
    Testimonials,
    Events,
    Gallery,
    Challenges,
  ],
  globals: [SiteSettings, HomePage, AboutWalt, ContactPage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./walts-warriors.db',
    },
    // Auto-sync schema in local dev when collections/globals change
    push: process.env.NODE_ENV !== 'production',
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: useVercelBlob,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
      clientUploads: true,
    }),
  ],
})
