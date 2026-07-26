import type { Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProgramCard } from '@/components/programs/ProgramCard'
import { getPayloadClient } from '@/lib/payload'
import type { Program } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Programs & Services',
}

export default async function ProgramsPage() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'programs',
    where: { published: { equals: true } },
    sort: 'order',
    limit: 100,
    depth: 1,
  })
  const programs = result.docs as Program[]

  return (
    <Container className="py-6 sm:py-8 lg:py-12">
      <PageHeader
        title="Programs & Services"
        subtitle="Practical support for nutrition, fitness, mindset, and healthy lifestyle habits."
      />

      {programs.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600">
          No programs published yet. Add them in{' '}
          <Link href="/admin/collections/programs" className="font-medium text-emerald-700 underline">
            Admin → Programs / Services
          </Link>
          .
        </div>
      )}
    </Container>
  )
}
