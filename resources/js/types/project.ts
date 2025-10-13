export interface Project {
  id: number | string;
  name: string;
  descripcion: string;
  inhabilitado: boolean | number | 'true' | 'false';
  created_at?: string;
  updated_at?: string;
}
