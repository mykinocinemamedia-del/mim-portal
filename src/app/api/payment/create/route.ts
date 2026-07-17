import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendWhatsApp } from '@/lib/agents/integrations/whatsapp'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { amount, description, payerPhone, helperId } = await req.json()

  if (!amount || !description) {
    return NextResponse.json({ error: 'amount and description required' }, { status: 400 })
  }

  // Generate ToyyibPay bill (or mock link if no API key)
  const TOYYIBPAY_KEY = process.env.TOYYIBPAY_SECRET_KEY
  const billcode = `MIM${Date.now()}`
  
  let paymentUrl: string
  
  if (TOYYIBPAY_KEY) {
    // Real ToyyibPay API call would go here
    // For now, use payment link format
    paymentUrl = `https://pay.toyyibpay.com/${billcode}`
  } else {
    // Mock payment link
    paymentUrl = `https://mim-portal.vercel.app/employer/payments?pay=${billcode}&amount=${amount}`
  }

  // Create payment record
  const payment = await db.payment.create({
    data: {
      employerId: session.id,
      helperId: helperId || null,
      amount: parseFloat(amount),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'pending',
      method: 'toyyibpay',
      notes: `BillCode: ${billcode}`,
    },
  })

  // Send WhatsApp payment link
  if (payerPhone) {
    await sendWhatsApp({
      to: payerPhone,
      body: `💳 Link Pembayaran MIM Portal\n\nJumlah: RM${amount}\nDeskripsi: ${description}\n\nBayar sekarang: ${paymentUrl}\n\nTerima kasih!`,
    })
  }

  return NextResponse.json({
    success: true,
    paymentId: payment.id,
    paymentUrl,
    billcode,
  })
}
