import { Suspense } from 'react'
import Component from '@/components/Questionnaire'

interface Props {
  params: {
    step: string
  }
}

export default async function QuestionnairePage({ params }: Props) {
  const { step } = await Promise.resolve(params)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  )
} 