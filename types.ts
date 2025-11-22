
export interface Recipe {
  titulo: string;
  descricao: string;
  ingredientes: string[];
  modo_preparo: string[];
  tempo: string;
  variacoes: string[];
  id?: string;
  timestamp?: number;
  type?: string; // e.g., 'Normal', 'Fit', 'Rápida'
  imageUrl?: string; // URL da imagem em base64
}

export interface AutocompleteOption {
  value: string;
  label: string;
}

export type Language = 'pt-BR' | 'en' | 'es';

// Global declaration for html2canvas loaded via CDN
declare global {
  interface Window {
    html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
  }
}
