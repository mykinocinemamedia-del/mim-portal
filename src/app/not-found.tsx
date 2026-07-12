import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1f33] p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#00bcd4]/15 flex items-center justify-center">
          <Search className="w-10 h-10 text-[#00bcd4]" />
        </div>
        <div>
          <h1 className="text-6xl font-bold gradient-text mb-2">404</h1>
          <h2 className="text-xl font-semibold text-white mb-2">Halaman Tidak Dijumpai</h2>
          <p className="text-slate-400 text-sm">
            Maaf, halaman yang anda cari tidak wujud atau telah dipindahkan.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
              <Home className="w-4 h-4 mr-2" /> Laman Utama
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" className="btn-rounded border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white">
              Lihat Harga
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
