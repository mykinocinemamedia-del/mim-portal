'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog'
import { Code } from 'lucide-react'

export function ActivityDetail({
  input,
  output,
  errorMessage,
}: {
  input: string | null
  output: string | null
  errorMessage: string | null
}) {
  let parsedInput: any = null
  let parsedOutput: any = null
  try {
    parsedInput = input ? JSON.parse(input) : null
  } catch {
    parsedInput = input
  }
  try {
    parsedOutput = output ? JSON.parse(output) : null
  } catch {
    parsedOutput = output
  }

  const hasContent = parsedInput || parsedOutput || errorMessage

  if (!hasContent) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="shrink-0">
          <Code className="w-3 h-3 mr-1" /> Detail
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Aktiviti</DialogTitle>
          <DialogDescription>Maklumat input dan output aktiviti agent</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {parsedInput && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Input</h4>
              <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto max-h-60">
                {typeof parsedInput === 'string'
                  ? parsedInput
                  : JSON.stringify(parsedInput, null, 2)}
              </pre>
            </div>
          )}

          {parsedOutput && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Output</h4>
              <pre className="text-xs bg-slate-900 text-emerald-100 p-3 rounded-lg overflow-x-auto max-h-60">
                {typeof parsedOutput === 'string'
                  ? parsedOutput
                  : JSON.stringify(parsedOutput, null, 2)}
              </pre>
            </div>
          )}

          {errorMessage && (
            <div>
              <h4 className="text-sm font-semibold mb-1 text-rose-600">Mesej Ralat</h4>
              <pre className="text-xs bg-rose-950 text-rose-100 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {errorMessage}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
