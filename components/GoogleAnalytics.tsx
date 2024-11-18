'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

// Create a separate component for the analytics tracking logic
function AnalyticsTracking({ GA_MEASUREMENT_ID }: { GA_MEASUREMENT_ID: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      
      // Push the new route to Google Analytics 
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
        send_page_view: true
      })
    }
  }, [pathname, searchParams, GA_MEASUREMENT_ID])

  return null
}

export default function GoogleAnalytics({ GA_MEASUREMENT_ID }: { GA_MEASUREMENT_ID: string }) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <AnalyticsTracking GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
      </Suspense>
    </>
  )
} 