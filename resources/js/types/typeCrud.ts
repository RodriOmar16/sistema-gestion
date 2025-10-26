export interface Project {
  id: number | string;
  name: string;
  descripcion: string;
  inhabilitado: boolean | number | 'true' | 'false';
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