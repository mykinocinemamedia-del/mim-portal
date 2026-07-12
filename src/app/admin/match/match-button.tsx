'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, Loader2 } from 'lucide-react'

export function MatchButton({
  bookingId,
  helperId,
  helperName,
  employerName,
}: {
  bookingId: string
  helperId: string
  helperName: string
  employerName: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')

  const submit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          helperId,
          scheduledAt: scheduledAt || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast({
        title: 'Padanan Berjaya',
        description: `${helperName} dipadankan dengan ${employerName}. Temuduga Google Meet dijadualkan.`,
      })
      setOpen(false)
      router.refresh()
    } catch (e: any) {
      toast({
        title: 'Ralat',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Padan
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Sahkan Padanan
            </DialogTitle>
            <DialogDescription>
              Anda akan memadan <strong>{helperName}</strong> dengan{' '}
              <strong>{employerName}</strong>. Temuduga Google Meet akan
              dijadualkan secara automatik.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="scheduledAt">
                Tarikh &amp; Masa Temuduga (pilihan)
              </Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Kosongkan untuk jadual automatik (2 hari dari sekarang).
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={submit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memadan...
                </>
              ) : (
                'Sahkan &amp; Jana Temuduga'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
