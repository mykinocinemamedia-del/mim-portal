import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendWhatsApp } from '@/lib/agents/integrations/whatsapp'

export async function POST(req: NextRequest) {
  try {
    const { contractId, signerType, signerId } = await req.json()
    
    if (!contractId || !signerType) {
      return NextResponse.json({ error: 'contractId and signerType required' }, { status: 400 })
    }

    const contract = await db.contract.findUnique({ where: { id: contractId } })
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Record signature
    const updateData: any = {}
    const timestamp = new Date().toISOString()
    
    if (signerType === 'helper') {
      updateData.signedHelper = true
    } else if (signerType === 'employer') {
      updateData.signedEmployer = true
    } else if (signerType === 'admin') {
      updateData.signedAdmin = true
    }

    await db.contract.update({ where: { id: contractId }, data: updateData })

    // Check if all signed
    const updated = await db.contract.findUnique({ where: { id: contractId } })
    if (updated?.signedHelper && updated.signedEmployer && updated.signedAdmin) {
      await db.contract.update({ where: { id: contractId }, data: { status: 'active' } })
      
      // Notify all parties
      if (updated.helperId) {
        const helper = await db.helper.findUnique({ where: { id: updated.helperId } })
        if (helper?.phone) {
          await sendWhatsApp({
            to: helper.phone,
            body: `✅ Kontrak telah ditandatangani oleh semua pihak!\n\nKontrak #${contractId.slice(-8)} kini AKTIF.\n\nSelamat bekerja!`,
          }).catch(() => {})
        }
      }
      if (updated.employerId) {
        const employer = await db.employer.findUnique({ where: { id: updated.employerId } })
        if (employer?.phone) {
          await sendWhatsApp({
            to: employer.phone,
            body: `✅ Kontrak telah ditandatangani oleh semua pihak!\n\nKontrak #${contractId.slice(-8)} kini AKTIF.\n\nPembantu anda akan mula bekerja mengikut jadual.`,
          }).catch(() => {})
        }
      }
    }

    return NextResponse.json({
      success: true,
      signed: signerType,
      allSigned: updated?.signedHelper && updated.signedEmployer && updated.signedAdmin,
      contractStatus: updated?.signedHelper && updated.signedEmployer && updated.signedAdmin ? 'active' : 'pending',
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
