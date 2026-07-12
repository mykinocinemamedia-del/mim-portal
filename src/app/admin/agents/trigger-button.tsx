'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function TriggerButton({ agentName }: { agentName: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<'idle' | 'success' | 'error'>('idle')
  const { toast } = useToast()

  const trigger = async () => {
    setLoading(true)
    setResult('idle')
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setResult('success')
      toast({
        title: 'Agent Berjalan',
        description: data.summary || `Agent ${agentName} telah dilaksanakan`,
      })

      // Refresh page after 2s to show updated stats
      setTimeout(() => window.location.reload(), 2000)
    } catch (e: any) {
      setResult('error')
      toast({
        title: 'Agent Gagal',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={trigger}
      disabled={loading}
      size="sm"
      className="flex-1"
      variant={result === 'success' ? 'default' : result === 'error' ? 'destructive' : 'default'}
    >
      {loading ? (
        <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Running...</>
      ) : result === 'success' ? (
        <><CheckCircle2 className="w-3 h-3 mr-1" /> Done</>
      ) : result === 'error' ? (
        <><AlertCircle className="w-3 h-3 mr-1" /> Failed</>
      ) : (
        <><Play className="w-3 h-3 mr-1" /> Run</>
      )}
    </Button>
  )
}
