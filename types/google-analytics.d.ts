interface GoogleAnalyticsEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
  [key: string]: any;
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
      resort_name?: string;
      event_category?: string;
      event_label?: string;
      value?: number;
      cookie_flags?: string;
    }
  ) => void;
  dataLayer: any[];
} 