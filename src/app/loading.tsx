export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1f33]">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full border-4 border-[#00bcd4]/20 border-t-[#00bcd4] animate-spin" />
        <p className="text-slate-400 text-sm">Memuatkan...</p>
      </div>
    </div>
  )
}
