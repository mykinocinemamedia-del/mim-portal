'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { CheckCheck, Check, Loader2 } from 'lucide-react'

export function NotificationActions({
  mode,
  notificationId,
}: {
  mode: 'single' | 'markAll'
  notificationId?: string
}) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const mark = async () => {
    setLoading(true)
    try {
      const body = mode === 'markAll'
        ? { markAllRead: true }
        : { notificationId }
      const res = await fetch('/api/agents/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal')

      toast({
        title: mode === 'markAll' ? 'Semua Dibaca' : 'Notifikasi Dibaca',
        description: mode === 'markAll'
          ? 'Semua notifikasi telah ditandai sebagai dibaca.'
          : 'Notifikasi telah ditandai sebagai dibaca.',
      })
      setTimeout(() => window.location.reload(), 1200)
    } catch (e: any) {
      toast({
        title: 'Gagal',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'markAll') {
    return (
      <Button onClick={mark} disabled={loading} variant="default" size="sm">
        {loading ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <CheckCheck className="w-4 h-4 mr-1" />
        )}
        Tanda Semua Dibaca
      </Button>
    )
  }

  return (
    <Button onClick={mark} disabled={loading} variant="ghost" size="sm" className="text-xs h-7">
      {loading ? (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      ) : (
        <Check className="w-3 h-3 mr-1" />
      )}
      Tanda Dibaca
    </Button>
  )
}
