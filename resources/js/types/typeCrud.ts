export interface Project {
  id: number | string;
  name: string;
  descripcion: string;
  inhabilitado: boolean | number | 'true' | 'false';
  created_at?: string;
  updated_at?: string;
}
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

export interface Menu{
  menu_id: number | null;
  nombre: string;
  padre_id: number | null;
  padre_nombre: string;
  orden: number;
  icono: string;
  inhabilitado: boolean | undefined;
  ruta_id?: number | string;
  created_at?: string;
  updated_at?: string;
}

export interface Ruta{
  ruta_id: number | string;
  url: string;
  inhabilitada: boolean | 1 | 0 | undefined;
  created_at?: string;
  updated_at?: string;
}

export interface Rol {
  rol_id: number | string;
  nombre: string;
  inhabilitado: boolean | 1 | 0 | 'true' | 'false';
  created_at?: string;
  updated_at?: string;
}

export type Multiple = { 
  id: number; 
  nombre: string;
};