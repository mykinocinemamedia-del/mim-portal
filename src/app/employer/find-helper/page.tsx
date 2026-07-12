import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { FindHelperClient } from './find-helper-client'
import { getServiceLabel } from '@/lib/utils'

type SearchParams = {
  serviceType?: string
  liveIn?: string
  backAndForth?: string
  religion?: string
  state?: string
}

export default async function EmployerFindHelperPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await getSession()
  if (!session || session.role !== 'employer') {
    redirect('/employer/login')
  }

  const employer = await db.employer.findUnique({ where: { id: session.id } })
  if (!employer) redirect('/employer/login')

  const sp = await searchParams
  const serviceType = sp.serviceType || ''
  const liveIn = sp.liveIn === 'true'
  const backAndForth = sp.backAndForth === 'true'
  const religion = sp.religion || ''
  const state = sp.state || ''

  const helpers = await db.helper.findMany({
    where: {
      status: 'active',
      ...(serviceType && {
        OR: [{ serviceType }, { desiredJob: serviceType }],
      }),
      ...(religion && { religion }),
      ...(state && {
        OR: [{ state }, { workArea: { contains: state } }, { canRelocate: true }],
      }),
      ...(liveIn && { OR: [{ liveIn: true }, { canBoth: true }] }),
      ...(backAndForth && { OR: [{ backAndForth: true }, { canBoth: true }] }),
    },
    orderBy: { rating: 'desc' },
  })

  // Serialize for client component
  const serializedHelpers = helpers.map((h) => ({
    id: h.id,
    fullName: h.fullName,
    nickname: h.nickname,
    age: h.age,
    religion: h.religion,
    maritalStatus: h.maritalStatus,
    education: h.education,
    phone: h.phone,
    city: h.city,
    state: h.state,
    workArea: h.workArea,
    canRelocate: h.canRelocate,
    serviceType: h.serviceType,
    desiredJob: h.desiredJob,
    liveIn: h.liveIn,
    backAndForth: h.backAndForth,
    canBoth: h.canBoth,
    skills: h.skills,
    otherSkills: h.otherSkills,
    motivation: h.motivation,
    experience: h.experience,
    profilePhoto: h.profilePhoto,
    rating: h.rating,
    serviceLabel: getServiceLabel(h.serviceType),
  }))

  return (
    <DashboardShell
      role="employer"
      user={{ name: employer.fullName, email: employer.email || '' }}
    >
      <FindHelperClient
        helpers={serializedHelpers}
        filters={{
          serviceType,
          liveIn,
          backAndForth,
          religion,
          state,
        }}
      />
    </DashboardShell>
  )
}
