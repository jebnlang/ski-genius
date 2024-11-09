interface Window {
  gtag: (
    command: string,
    target: string,
    config?: {
      [key: string]: any;
      page_path?: string;
      resort_name?: string;
      event_category?: string;
      event_label?: string;
      value?: number;
    }
  ) => void;
  dataLayer: any[];
} 