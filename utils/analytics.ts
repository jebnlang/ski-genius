export const trackEvent = (
  action: string,
  category: string,
  label: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    })
  }
}

export const trackQuestionnaireStep = (stepNumber: number, stepName: string) => {
  trackEvent(
    'questionnaire_progress',
    'Questionnaire',
    `Step ${stepNumber}: ${stepName}`
  )
}

export const trackResortView = (resortName: string) => {
  trackEvent(
    'view_resort',
    'Resort Interaction',
    resortName
  )
}

export const trackResortRemoval = (resortName: string) => {
  trackEvent(
    'remove_resort',
    'Resort Interaction',
    resortName
  )
}

export const trackSearchRefinement = () => {
  trackEvent(
    'refine_search',
    'Search',
    'Refine Results'
  )
} 