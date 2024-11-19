interface GoogleAnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
  page_title?: string;
  page_location?: string;
  page_path?: string;
  user_type?: string;
  session_id?: string;
  interaction_type?: string;
  element_type?: string;
  element_id?: string;
  element_class?: string;
  element_text?: string;
  error_details?: string;
}

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
      event_category?: string;
      event_label?: string;
      value?: number;
      custom_map?: {
        [key: string]: string;
      };
      cookie_flags?: string;
      cookie_domain?: string;
      cookie_expires?: number;
    }
  ) => void;
  dataLayer: any[];
} 