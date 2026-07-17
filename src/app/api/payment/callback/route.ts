import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendWhatsApp } from '@/lib/agents/integrations/whatsapp'

export const dynamic = 'force-dynamic'

// ToyyibPay callback webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const params = new URLSearchParams(body)
    
    const billcode = params.get('billcode') || ''
    const status = params.get('status') || ''
    const transactionId = params.get('transaction_id') || ''
    
    if (status === '1' || status.toLowerCase() === 'success') {
      // Find payment by billcode
      const payment = await db.payment.findFirst({
        where: { notes: { contains: billcode } },
      })
      
      if (payment) {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: 'paid', paidDate: new Date(), method: 'toyyibpay' },
        })
        
        // Notify employer via WhatsApp
        const employer = await db.employer.findUnique({ where: { id: payment.employerId } })
        if (employer?.phone) {
          await sendWhatsApp({
            to: employer.phone,
            body: `✅ Pembayaran berjaya!\n\nJumlah: RM${payment.amount}\nStatus: Dibayar\nTarikh: ${new Date().toLocaleDateString('ms-MY')}\n\nTerima kasih!`,
          })
        }
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
