import { postgresAdapter } from '@payloadcms/db-postgres'
//import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
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
import { Quotes } from './collections/Quotes'
import { Events } from './collections/Events'
import { Gallery } from './collections/Gallery'
import { Challenges } from './collections/Challenges'
import { SiteSettings } from './globals/SiteSettings'
import { HomePage } from './globals/HomePage'
import { AboutWalt } from './globals/AboutWalt'
import { ContactPage } from './globals/ContactPage'
import { Members } from './collections/Members'
import { CheckIns } from './collections/CheckIns'
import { Badges } from './collections/Badges'
import { MemberBadges } from './collections/MemberBadges'
import { CommunityStats } from './globals/CommunityStats'
import { QuoteSettings } from './globals/QuoteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// v1 local disk; Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production)
const useVercelBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

// Email adapter for auth emails (verification, password reset).
// Real SMTP if envs set. Otherwise a dev adapter that logs the *full* generated
// email (incl. the verify link) to the server console on every send.
// Restart dev server after changing envs. The link will be in the [DEV EMAIL] block.
const defaultFromAddress = process.env.SMTP_FROM_ADDRESS || 'no-reply@waltswarriors.local'
const defaultFromName = process.env.SMTP_FROM_NAME || "Walt's Warriors"

const devEmailAdapter = ({ payload }: { payload?: any } = {}) => ({
  name: 'dev-email-logger',
  defaultFromAddress,
  defaultFromName,
  sendEmail: async (message: any) => {
    const to = message.to || message.toAddress || '(unknown)'
    const subject = message.subject || '(no subject)'
    const body = message.html || message.text || '(no body)'
    const log = `\n[DEV EMAIL] (no real SMTP - copy link from below)\nTo: ${to}\nSubject: ${subject}\n--- BODY ---\n${body}\n[END DEV EMAIL]\n`
    if (payload?.logger?.info) {
      payload.logger.info({ msg: log })
    } else {
      console.log(log)
    }
    return Promise.resolve()
  },
})

const emailAdapter = process.env.SMTP_HOST && process.env.SMTP_FROM_ADDRESS
  ? nodemailerAdapter({
      defaultFromAddress,
      defaultFromName,
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER || process.env.SMTP_PASS ? { user: process.env.SMTP_USER || '', pass: process.env.SMTP_PASS || '' } : undefined,
      },
    })
  : devEmailAdapter

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
    Quotes,
    Events,
    Gallery,
    Challenges,
    Members, 
    CheckIns, 
    Badges, 
    MemberBadges,
  ],
  globals: [SiteSettings, HomePage, AboutWalt, ContactPage, CommunityStats, QuoteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  email: emailAdapter,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL }, push: process.env.NODE_ENV !== 'production' }),
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
