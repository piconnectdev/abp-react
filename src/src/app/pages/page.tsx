'use client'
import { VoloCmsKitContentsPageDto } from '@/client'
import { PageView } from '@/components/page/PageView'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Error from '@/components/ui/Error'
import Loader from '@/components/ui/Loader'
import { usePageBySlug } from '@/lib/hooks/usePages'
import { AlertTriangle, Home, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'

function PageViewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug') ?? ''
  const [retryCount, setRetryCount] = useState(0)

  const { data: page, isLoading, isError, error, refetch } = usePageBySlug(slug)

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    refetch()
  }

  useEffect(() => {
    setRetryCount(0)
  }, [slug])

  if (!slug) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>No page specified</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/"><Home className="mr-2 h-4 w-4" />Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader />
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    const errorMessage =
      error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'An unexpected error occurred'

    if (
      errorMessage.includes('fetch') ||
      errorMessage.includes('network') ||
      errorMessage.includes('timeout')
    ) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Connection Error</CardTitle>
              <CardDescription>We&apos;re having trouble connecting to our servers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {retryCount > 0
                    ? `Attempt ${retryCount + 1} failed. Please try again.`
                    : 'Please check your internet connection and try again.'}
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button onClick={handleRetry} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />Try Again
                </Button>
                <Button variant="outline" onClick={() => router.push('/')}>
                  <Home className="mr-2 h-4 w-4" />Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Page Not Found</CardTitle>
              <CardDescription>The page &quot;{slug}&quot; doesn&apos;t exist or may have been moved.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/"><Home className="mr-2 h-4 w-4" />Go Home</Link>
                </Button>
                <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Something Went Wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={handleRetry} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />Try Again
              </Button>
              <Button variant="outline" asChild>
                <Link href="/"><Home className="mr-2 h-4 w-4" />Go Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Page Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/"><Home className="mr-2 h-4 w-4" />Go Home</Link>
              </Button>
              <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary fallback={<Error />}>
      <PageView page={page as VoloCmsKitContentsPageDto} />
    </ErrorBoundary>
  )
}

export default function PageViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <PageViewContent />
    </Suspense>
  )
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    console.error('PageView Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
