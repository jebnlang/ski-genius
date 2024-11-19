// Session ID generator
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15);
};

// Get or create session ID
const getSessionId = () => {
  if (typeof window === 'undefined') return null;
  
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

interface EnhancedEventParams {
  label?: string;
  value?: number;
  element_type?: string;
  element_id?: string;
  element_text?: string;
  element_class?: string;
  interaction_type?: string;
  error_details?: string;
  nonInteraction?: boolean;
  [key: string]: any;
}

// Enhanced event tracking
export const trackEnhancedEvent = (
  action: string,
  category: string,
  params: EnhancedEventParams = {}
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  const sessionId = getSessionId();
  
  window.gtag('event', action, {
    event_category: category,
    ...params,
    session_id: sessionId,
  });
};

// Click tracking
export const trackClick = (
  element: HTMLElement,
  category: string,
  label?: string
) => {
  trackEnhancedEvent('click', category, {
    label: label || element.innerText,
    element_type: element.tagName.toLowerCase(),
    element_id: element.id,
    element_text: element.innerText,
    element_class: element.className
  });
};

// Form interaction tracking
export const trackFormInteraction = (
  formElement: string | HTMLFormElement,
  action: 'start' | 'complete' | 'error' | string,
  details?: string
) => {
  const formId = typeof formElement === 'string' ? formElement : formElement.id;
  
  trackEnhancedEvent('form_interaction', 'Form', {
    label: `${formId || 'unknown_form'}_${action}`,
    element_type: 'form',
    element_id: formId,
    interaction_type: action,
    error_details: details
  });
};

// Page view tracking with enhanced data
export const trackPageView = (
  path: string,
  title?: string
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
    session_id: getSessionId()
  });
};

export const trackQuestionnaireCompletion = () => {
  trackEnhancedEvent('questionnaire_complete', 'Questionnaire', {
    label: 'Completion'
  });
};

export const trackQuickResults = () => {
  trackEnhancedEvent('quick_results', 'Questionnaire', {
    label: 'Quick Results View'
  });
}; 