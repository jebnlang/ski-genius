import { Suspense } from 'react'
import Component from '@/components/Questionnaire'

interface PageProps {
  params: {
    step: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function QuestionnairePage({ params, searchParams }: PageProps) {
  await Promise.resolve(params)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  )
} 