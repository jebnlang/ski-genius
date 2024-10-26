'use client'

import { useEffect } from 'react'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Add the attribute only on the client-side
    document.body.setAttribute('cz-shortcut-listen', 'true')
  }, [])

  return <>{children}</>
}
