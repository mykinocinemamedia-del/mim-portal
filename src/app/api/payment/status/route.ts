import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const paymentId = req.nextUrl.searchParams.get('paymentId')
  if (!paymentId) {
    return NextResponse.json({ error: 'paymentId required' }, { status: 400 })
  }

  const payment = await db.payment.findUnique({ where: { id: paymentId } })
  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: payment.id,
    amount: payment.amount,
    status: payment.status,
    method: payment.method,
    dueDate: payment.dueDate,
    paidDate: payment.paidDate,
  })
}
