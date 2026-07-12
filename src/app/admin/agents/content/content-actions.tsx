'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  Check, Trash2, Copy, Loader2, Calendar, CheckCircle2,
} from 'lucide-react'

export function ContentActions({
  contentId,
  content,
  status,
  title,
}: {
  contentId: string
  content: string
  status: string
  title: string | null
}) {
  const [loading, setLoading] = useState<'approve' | 'delete' | null>(null)
  const { toast } = useToast()

  const act = async (action: 'approve' | 'delete') => {
    setLoading(action)
    try {
      const res = await fetch('/api/agents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal')

      toast({
        title: action === 'approve' ? 'Kandungan Diluluskan' : 'Kandungan Dipadam',
        description: action === 'approve'
          ? 'Status ditukar ke Dijadualkan untuk disiarkan.'
          : 'Kandungan telah dialih keluar dari queue.',
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

  const copyToClipboard = async () => {
    try {
      const text = title ? `${title}\n\n${content}` : content
      await navigator.clipboard.writeText(text)
      toast({
        title: 'Disalin',
        description: 'Kandungan disalin ke clipboard.',
      })
    } catch {
      toast({
        title: 'Gagal Menyalin',
        description: 'Clipboard tidak tersedia.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex gap-2 pt-1 border-t">
      {status === 'draft' && (
        <Button
          size="sm"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => act('approve')}
          disabled={loading !== null}
        >
          {loading === 'approve' ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <Check className="w-3 h-3 mr-1" />
          )}
          Lulus
        </Button>
      )}
      {status === 'scheduled' && (
        <Button size="sm" variant="outline" className="flex-1" disabled>
          <Calendar className="w-3 h-3 mr-1" /> Dijadualkan
        </Button>
      )}
      {status === 'posted' && (
        <Button size="sm" variant="outline" className="flex-1 text-emerald-600" disabled>
          <CheckCircle2 className="w-3 h-3 mr-1" /> Disiarkan
        </Button>
      )}
      {status === 'failed' && (
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-amber-600"
          onClick={() => act('approve')}
          disabled={loading !== null}
        >
          {loading === 'approve' ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <Calendar className="w-3 h-3 mr-1" />
          )}
          Jadualkan Semula
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={copyToClipboard}
        title="Salin ke clipboard"
      >
        <Copy className="w-3 h-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-rose-600 hover:bg-rose-50"
        onClick={() => act('delete')}
        disabled={loading !== null}
        title="Padam"
      >
        {loading === 'delete' ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Trash2 className="w-3 h-3" />
        )}
      </Button>
    </div>
  )
}
