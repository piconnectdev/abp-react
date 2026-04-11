import { Suspense } from 'react'
import EditMenuItemClient from './EditMenuItemClient'

export default function EditMenuItemPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <EditMenuItemClient />
    </Suspense>
  )
}
