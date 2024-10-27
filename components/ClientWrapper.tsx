'use client'

import React from 'react'
import SuppressHydrationWarning from './SuppressHydrationWarning'

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <SuppressHydrationWarning>{children}</SuppressHydrationWarning>
}
