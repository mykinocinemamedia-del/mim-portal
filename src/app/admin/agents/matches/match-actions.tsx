'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Check, X, Loader2 } from 'lucide-react'

export function MatchActions({ matchId }: { matchId: string }) {
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null)
  const { toast } = useToast()

  const act = async (action: 'accept' | 'reject') => {
    setLoading(action)
    try {
      const res = await fetch('/api/agents/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal')

      toast({
        title: action === 'accept' ? 'Padanan Diterima' : 'Padanan Ditolak',
        description: action === 'accept'
          ? 'Helper dan majikan telah ditandai sebagai diterima.'
          : 'Padanan telah ditolak.',
      })
      setTimeout(() => window.location.reload(), 1200)
    } catch (e: any) {
      toast({
        title: 'Gagal',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2 pt-1">
      <Button
        size="sm"
        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
        onClick={() => act('accept')}
        disabled={loading !== null}
      >
        {loading === 'accept' ? (
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        ) : (
          <Check className="w-3 h-3 mr-1" />
        )}
        Terima
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="flex-1 text-rose-600 border-rose-200 hover:bg-rose-50"
        onClick={() => act('reject')}
        disabled={loading !== null}
      >
        {loading === 'reject' ? (
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        ) : (
          <X className="w-3 h-3 mr-1" />
        )}
        Tolak
      </Button>
    </div>
  )
}
