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

// Enhanced event tracking
export const trackEnhancedEvent = (
  action: string,
  category: string,
  {
    label,
    value,
    element_type,
    element_id,
    element_text,
    nonInteraction = false,
    ...customProps
  }: Partial<GoogleAnalyticsEvent>
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  const sessionId = getSessionId();
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    non_interaction: nonInteraction,
    session_id: sessionId,
    element_type,
    element_id,
    element_text,
    ...customProps
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
  formElement: HTMLFormElement,
  action: 'start' | 'complete' | 'error',
  details?: string
) => {
  trackEnhancedEvent('form_interaction', 'Form', {
    label: `${formElement.id || 'unknown_form'}_${action}`,
    element_type: 'form',
    element_id: formElement.id,
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