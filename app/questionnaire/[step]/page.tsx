import { Suspense } from 'react'
import Component from '@/components/Questionnaire'

// Use the correct Next.js types
type Props = {
  params: Promise<{ step: string }>
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function QuestionnairePage(props: Props) {
  const { step } = await props.params

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  )
} 