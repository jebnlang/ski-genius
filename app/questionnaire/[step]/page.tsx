import { Suspense } from 'react'
import Component from '@/components/Questionnaire'

type Props = {
  params: Promise<{ step: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function QuestionnairePage(props: Props) {
  await Promise.all([props.params, props.searchParams])
    
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  )
} 