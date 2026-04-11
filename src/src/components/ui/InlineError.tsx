'use client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface InlineErrorProps {
  error?: Error | null
  onRetry?: () => void
}

export const InlineError = ({ error, onRetry }: InlineErrorProps) => {
  const [expanded, setExpanded] = useState(false)
  const rawBody = (error as any)?.rawBody as string | undefined

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Không thể tải dữ liệu</AlertTitle>
      <AlertDescription>
        <p>{error?.message ?? 'Đã xảy ra lỗi. Vui lòng thử lại.'}</p>
        {rawBody && (
          <>
            <button
              type="button"
              className="text-xs underline opacity-70 mt-1 flex items-center gap-1 hover:opacity-100"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
            </button>
            {expanded && (
              <pre className="mt-1 text-xs overflow-auto max-h-32 bg-destructive/10 p-2 rounded whitespace-pre-wrap break-all">
                {rawBody}
              </pre>
            )}
          </>
        )}
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry} className="mt-2">
            Thử lại
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
