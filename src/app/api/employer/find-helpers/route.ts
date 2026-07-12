import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { getServiceLabel } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'employer') {
      return NextResponse.json(
        { error: 'Tidak dibenarkan. Sila log masuk sebagai majikan.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const helperId = searchParams.get('helperId')

    // If helperId is provided, return single helper (for booking flow)
    if (helperId) {
      const helper = await db.helper.findUnique({
        where: { id: helperId, status: 'active' },
      })
      if (!helper) {
        return NextResponse.json(
          { error: 'Pembantu tidak dijumpai' },
          { status: 404 }
        )
      }
      return NextResponse.json({
        helper: {
          id: helper.id,
          fullName: helper.fullName,
          nickname: helper.nickname,
          serviceType: helper.serviceType,
          desiredJob: helper.desiredJob,
          city: helper.city,
          state: helper.state,
          profilePhoto: helper.profilePhoto,
          rating: helper.rating,
          liveIn: helper.liveIn,
          backAndForth: helper.backAndForth,
          canBoth: helper.canBoth,
        },
      })
    }

    // Otherwise, return list of helpers with optional filters
    const serviceType = searchParams.get('serviceType') || ''
    const liveIn = searchParams.get('liveIn') === 'true'
    const backAndForth = searchParams.get('backAndForth') === 'true'
    const religion = searchParams.get('religion') || ''
    const state = searchParams.get('state') || ''

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
      select: {
        id: true,
        fullName: true,
        nickname: true,
        age: true,
        religion: true,
        city: true,
        state: true,
        serviceType: true,
        desiredJob: true,
        liveIn: true,
        backAndForth: true,
        canBoth: true,
        canRelocate: true,
        skills: true,
        profilePhoto: true,
        rating: true,
      },
    })

    return NextResponse.json({
      helpers: helpers.map((h) => ({
        ...h,
        serviceLabel: getServiceLabel(h.serviceType),
      })),
    })
  } catch (e: any) {
    console.error('Find helpers error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa mendapatkan senarai pembantu' },
      { status: 500 }
    )
  }
}
