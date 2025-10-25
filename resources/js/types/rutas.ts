export interface Ruta{
  ruta_id: number | string;
  url: string;
  inhabilitada: boolean | 1 | 0 | undefined;
  created_at?: string;
  updated_at?: string;
}