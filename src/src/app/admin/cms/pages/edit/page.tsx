import { Suspense } from 'react'
import EditPageClient from './EditPageClient'

export default function EditPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <EditPageClient />
    </Suspense>
  )
}
