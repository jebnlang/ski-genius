type GtagConfig = {
  page_path?: string;
  resort_name?: string;
  event_category?: string;
  event_label?: string;
  value?: number;
  send_to?: string;
  page_location?: string;
  page_title?: string;
} & Record<string, string | number | undefined>;

declare global {
  interface Window {
    gtag: (
      command: string,
      target: string,
      config?: GtagConfig
    ) => void;
  }
}

export {}; 