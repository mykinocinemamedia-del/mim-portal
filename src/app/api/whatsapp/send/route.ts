import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sendWhatsApp } from '@/lib/agents/integrations/whatsapp'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { to, body, mediaUrl } = await req.json()
  if (!to || !body) {
    return NextResponse.json({ error: 'to and body required' }, { status: 400 })
  }

  const result = await sendWhatsApp({ to, body, mediaUrl })
  return NextResponse.json(result)
}
