import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Badges } from './collections/Badges'
import { Challenges } from './collections/Challenges'
import { CheckIns } from './collections/CheckIns'
import { Events } from './collections/Events'
import { Gallery } from './collections/Gallery'
import { Media } from './collections/Media'
import { MemberBadges } from './collections/MemberBadges'
import { Members } from './collections/Members'
import { Programs } from './collections/Programs'
import { Quotes } from './collections/Quotes'
import { Resources } from './collections/Resources'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { AboutWalt } from './globals/AboutWalt'
import { CommunityStats } from './globals/CommunityStats'
import { ContactPage } from './globals/ContactPage'
import { HomePage } from './globals/HomePage'
import { QuoteSettings } from './globals/QuoteSettings'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Fresh SQLite database per test worker so tests are hermetic and never touch
// the real Postgres (Supabase) database.
const testDbPath = path.join(os.tmpdir(), `ww-member-hardening-${process.pid}.db`)
fs.rmSync(testDbPath, { force: true })

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — Walt\'s Warriors (tests)',
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
  secret: 'ww-member-hardening-test-secret',
  db: sqliteAdapter({
    client: { url: `file:${testDbPath.replace(/\\/g, '/')}` },
    push: true,
  }),
})
