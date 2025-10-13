export interface Banner {
  id: number | string;
  url: string;
  title: string;
  description: string;
  priority: number | string; 
  inhabilitado: boolean | number | 'true' | 'false';
  created_at?: string;
  updated_at?: string;
}
