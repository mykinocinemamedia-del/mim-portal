/**
 * AI Provider Abstraction Layer
 * Supports: Gemini 2.0 Flash, Z.AI GLM-4.5, Groq (Llama 3.3)
 * Automatic fallback: primary → secondary → tertiary
 */

export type AIProvider = 'gemini' | 'zai' | 'groq'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  content: string
  provider: AIProvider
  usage?: {
    inputTokens?: number
    outputTokens?: number
  }
}

export interface ProviderConfig {
  provider: AIProvider
  apiKey: string
  model: string
  baseUrl: string
}

const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  gemini: {
    provider: 'gemini',
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  },
  zai: {
    provider: 'zai',
    apiKey: process.env.ZAI_API_KEY || '',
    model: process.env.ZAI_MODEL || 'glm-4.5',
    baseUrl: process.env.ZAI_BASE_URL || 'https://api.z.ai/api/paas/v4',
  },
  groq: {
    provider: 'groq',
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    baseUrl: 'https://api.groq.com/openai/v1',
  },
}

const PRIORITY: AIProvider[] = ['gemini', 'zai', 'groq']

async function callGemini(
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const config = PROVIDERS.gemini
  const systemMsg = messages.find((m) => m.role === 'system')
  const convMsgs = messages.filter((m) => m.role !== 'system')

  const body: any = {
    contents: convMsgs.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 2048,
    },
  }

  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] }
  }

  const url = `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error: ${res.status} - ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) throw new Error('Gemini: empty response')
  return content
}

async function callZAI(
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const config = PROVIDERS.zai
  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Z.AI API error: ${res.status} - ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Z.AI: empty response')
  return content
}

async function callGroq(
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const config = PROVIDERS.groq
  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error: ${res.status} - ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Groq: empty response')
  return content
}

const CALLERS: Record<AIProvider, (m: ChatMessage[], o?: any) => Promise<string>> = {
  gemini: callGemini,
  zai: callZAI,
  groq: callGroq,
}

export async function aiChat(
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number; preferredProvider?: AIProvider } = {}
): Promise<AIResponse> {
  const preferred = options.preferredProvider
  const order = preferred
    ? [preferred, ...PRIORITY.filter((p) => p !== preferred)]
    : PRIORITY

  let lastError: Error | null = null

  for (const provider of order) {
    const config = PROVIDERS[provider]
    if (!config.apiKey) {
      continue
    }

    try {
      const content = await CALLERS[provider](messages, options)
      return { content, provider }
    } catch (e: any) {
      console.error(`[AI Provider] ${provider} failed:`, e.message)
      lastError = e
    }
  }

  throw new Error(
    `All AI providers failed. Last error: ${lastError?.message || 'unknown'}`
  )
}

export async function aiComplete(
  prompt: string,
  systemPrompt?: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const messages: ChatMessage[] = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
  messages.push({ role: 'user', content: prompt })
  const res = await aiChat(messages, options)
  return res.content
}

export function parseAIJson<T = any>(content: string): T | null {
  try {
    return JSON.parse(content)
  } catch {
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (match) {
      try {
        return JSON.parse(match[1])
      } catch {}
    }
    const jsonMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1])
      } catch {}
    }
    return null
  }
}

export { PROVIDERS, PRIORITY }
