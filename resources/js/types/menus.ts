export interface Menu{
  menu_id: number | string;
  nombre: string;
  padre: number | null;
  orden: number;
  icono: string;
  inhabilitado: boolean | number | 'true' | 'false';
  ruta_id?: number | string;
  created_at?: string;
  updated_at?: string;
}