'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }

const WELCOME_MESSAGE =
  'Hai! Saya Aida, AI assistant MIM Portal. 👋\n\nSaya boleh bantu anda cari pembantu rumah, pengasuh, atau penjaga orang tua yang sesuai. Apa yang anda cari hari ini?'

const DEFAULT_MESSAGE =
  'Selamat datang ke MIM Portal! Saya Aida, AI assistant anda. Boleh saya bantu anda dengan apa-apa soalan tentang perkhidmatan kami?'

export function AiChatbot() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: DEFAULT_MESSAGE,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const autoOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasAutoOpenedRef = useRef(false)

  // Auto-open the chatbot after 5 seconds, but only on the landing page (`/`).
  // Not on dashboard, login, register, or any other route.
  useEffect(() => {
    // Only auto-open on the root landing page
    const isLandingPage = pathname === '/'

    if (!isLandingPage) {
      // Clear any pending timer if user navigates away
      if (autoOpenTimerRef.current) {
        clearTimeout(autoOpenTimerRef.current)
        autoOpenTimerRef.current = null
      }
      return
    }

    // Avoid scheduling multiple timers in StrictMode / re-renders
    if (hasAutoOpenedRef.current || autoOpenTimerRef.current) return

    autoOpenTimerRef.current = setTimeout(() => {
      setOpen(true)
      hasAutoOpenedRef.current = true
      // Show the welcome message when auto-opened
      setMessages([
        {
          role: 'assistant',
          content: WELCOME_MESSAGE,
        },
      ])
    }, 5000)

    return () => {
      if (autoOpenTimerRef.current) {
        clearTimeout(autoOpenTimerRef.current)
        autoOpenTimerRef.current = null
      }
    }
  }, [pathname])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages((p) => [...p, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      setMessages((p) => [...p, { role: 'assistant', content: data.reply }])
    } catch (e) {
      setMessages((p) => [
        ...p,
        { role: 'assistant', content: 'Maaf, berlaku ralat. Sila cuba lagi.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const quickQuestions = [
    'Cari pembantu rumah di KL',
    'Bagaimana saya mendaftar sebagai majikan?',
    'Berapa gaji pembantu rumah?',
    'Apakah proses pengambilan?',
  ]

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-110"
        aria-label="Aida AI Assistant"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-2.5 h-2.5" />
        </span>
      </button>

      {/* Chat panel */}
      {open && (
        <Card className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[60vh] sm:h-[32rem] flex flex-col border-0 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Aida</p>
                <p className="text-xs text-emerald-100">AI Assistant &bull; Online</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded" aria-label="Tutup chat">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={`max-w-[75%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-sm'
                    : 'bg-background border rounded-tl-sm'
                }`}>
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-background border p-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick questions (only on first message) */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(q)
                    setTimeout(send, 100)
                  }}
                  className="text-xs px-2.5 py-1.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t flex gap-2 bg-background">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Taip soalan anda..."
              disabled={loading}
              className="text-sm"
            />
            <Button onClick={send} size="icon" disabled={loading || !input.trim()} aria-label="Hantar mesej">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </>
  )
}
