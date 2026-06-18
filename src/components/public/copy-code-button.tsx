'use client'

import { useState } from 'react'
import { FaCopy, FaCheck } from 'react-icons/fa'
import { Button } from '@/components/ui/button'

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      type="button"
      size="sm"
      onClick={handleCopy}
      className={`shrink-0 rounded-xl px-3 font-semibold transition-all ${
        copied
          ? 'bg-brand-green text-white'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
      }`}
    >
      {copied ? <FaCheck className="h-3.5 w-3.5" /> : <FaCopy className="h-3.5 w-3.5" />}
    </Button>
  )
}
