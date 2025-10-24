export interface Menu{
  menu_id: number | null;
  nombre: string;
  padre: number | null;
  orden: number;
  icono: string;
  inhabilitado: boolean | undefined;
  ruta_id?: number | string;
  created_at?: string;
  updated_at?: string;
}