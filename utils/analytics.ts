declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'set' | 'js',
      targetId: string,
      config?: {
        [key: string]: any;
        page_path?: string;
        page_title?: string;
        page_location?: string;
        send_page_view?: boolean;
        resort_name?: string;
        event_category?: string;
        event_label?: string;
        value?: number;
        cookie_flags?: string;
      }
    ) => void;
    dataLayer: any[];
  }
}

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
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_resort', {
      event_category: 'Resort Interaction',
      event_label: resortName,
      resort_name: resortName
    })
  }
}

export const trackResortRemoval = (resortName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'remove_resort', {
      event_category: 'Resort Interaction',
      event_label: resortName,
      resort_name: resortName
    })
  }
}

export const trackSearchRefinement = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'refine_search', {
      event_category: 'Search',
      event_label: 'Search Refinement'
    })
  }
}

export const trackQuestionnaireCompletion = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'complete_questionnaire', {
      event_category: 'Questionnaire',
      event_label: 'Completion'
    })
  }
}

export const trackResortBooking = (resortName: string, operatorName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'click_booking', {
      event_category: 'Booking',
      event_label: operatorName,
      resort_name: resortName,
      operator_name: operatorName
    })
  }
}

export const trackQuickResults = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'use_quick_results', {
      event_category: 'Search',
      event_label: 'Quick Results'
    })
  }
}

export const trackResortWebsiteClick = (resortName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'resort_website_click', {
      event_category: 'Outbound Link',
      event_label: resortName,
      resort_name: resortName
    })
  }
} 