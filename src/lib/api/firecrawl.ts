import { supabase } from '@/integrations/supabase/client';
import type { ExtractedProductData, ExtractionMetadata } from '@/contexts/ProductExtractionContext';

type FirecrawlResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

type ScrapeOptions = {
  formats?: ('markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot' | 'branding' | 'summary')[];
  onlyMainContent?: boolean;
  waitFor?: number;
  location?: { country?: string; languages?: string[] };
};

type SearchOptions = {
  limit?: number;
  lang?: string;
  country?: string;
  tbs?: string; // Time filter: 'qdr:h' (hour), 'qdr:d' (day), 'qdr:w' (week), 'qdr:m' (month), 'qdr:y' (year)
  scrapeOptions?: { formats?: ('markdown' | 'html')[] };
};

export type ProductExtractionResponse = {
  success: boolean;
  error?: string;
  data?: {
    extracted: ExtractedProductData;
    markdown: string;
    metadata: ExtractionMetadata & {
      schema: Record<string, any>;
    };
  };
};

export const firecrawlApi = {
  // Scrape a single URL
  async scrape(url: string, options?: ScrapeOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Search the web and optionally scrape results
  async search(query: string, options?: SearchOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: { query, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Extract product data from URL using dynamic schema
  async extractProduct(url: string): Promise<ProductExtractionResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-product-extract', {
      body: { url },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};

// Helper to detect if input is a URL
export function isValidUrl(input: string): boolean {
  const trimmed = input.trim();
  // Check for common URL patterns
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return true;
  }
  // Check for domain-like patterns (e.g., example.com, www.example.com)
  const domainPattern = /^(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]*(\.[a-zA-Z0-9][-a-zA-Z0-9]*)+/;
  return domainPattern.test(trimmed);
}
