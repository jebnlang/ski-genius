import { Suspense } from 'react'
import Questionnaire from '@/components/Questionnaire'
import Loading from './loading'

export default function QuestionnairePage() {
  return (
    <Suspense fallback={<Loading />}>
      <Questionnaire />
    </Suspense>
  )
} 