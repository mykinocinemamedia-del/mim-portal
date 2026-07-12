'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1f33] p-4">
      <div className="max-w-md w-full">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#00bcd4]/15 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[#00bcd4]" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            Maaf, ada ralat berlaku
          </h2>
          <p className="text-slate-400 text-sm">
            Sila cuba muat semula halaman. Jika masalah berterusan, hubungi admin melalui WhatsApp.
          </p>
          {error?.message && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-slate-400 text-left">
              <p className="font-mono break-all">{error.message.slice(0, 200)}</p>
              {error.digest && <p className="mt-1 text-slate-500">Digest: {error.digest}</p>}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button onClick={reset} className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
              <RefreshCw className="w-4 h-4 mr-2" /> Cuba Lagi
            </Button>
            <Link href="/">
              <Button variant="outline" className="btn-rounded border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white">
                <Home className="w-4 h-4 mr-2" /> Laman Utama
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
