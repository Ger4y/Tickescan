export interface ReceiptItem {
  description: string;
  price: string;
}

export interface ReceiptData {
  id: string;
  date: string;
  establishment: string;
  amount: string;
  payer: string;
  // New optional fields based on user settings
  itemCount?: string; // Replaced ticketNumber
  category?: string;
  notes?: string;     // New field for user notes
  items?: ReceiptItem[];
  timestamp: number;
}

export interface ExtractionSettings {
  extractItems: boolean;     // Lista detallada
  extractItemCount: boolean; // Conteo total
  extractCategory: boolean;
  extractNotes: boolean;     // New setting to enable notes field
}

export interface GoogleFormConfig {
  formUrl: string;
  mapping: {
    date: string;
    establishment: string;
    amount: string;
    payer: string;
  };
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  FORM = 'FORM',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS',
  INFO = 'INFO'
}

export interface ProcessingError {
  message: string;
  details?: string;
}

export type Language = 'es' | 'en' | 'it';