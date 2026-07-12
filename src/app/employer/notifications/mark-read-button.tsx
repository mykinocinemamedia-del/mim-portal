'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCheck, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function MarkReadButton({ notificationId }: { notificationId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  const mark = () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/notifications/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Gagal menandai notifikasi')
        setDone(true)
        toast({
          title: 'Ditandai Dibaca',
          description: 'Notifikasi telah ditandai sebagai dibaca.',
        })
        router.refresh()
      } catch (e: any) {
        toast({
          title: 'Ralat',
          description: e.message,
          variant: 'destructive',
        })
      }
    })
  }

  if (done) {
    return (
      <Button size="sm" variant="ghost" disabled>
        <CheckCheck className="w-3 h-3 mr-1" /> Dibaca
      </Button>
    )
  }

  return (
    <Button size="sm" variant="ghost" onClick={mark} disabled={pending}>
      {pending ? (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      ) : (
        <CheckCheck className="w-3 h-3 mr-1" />
      )}
      Tandai Dibaca
    </Button>
  )
}
