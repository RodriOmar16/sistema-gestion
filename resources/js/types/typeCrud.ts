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
export interface User {
  id: number | string;
  name: string;
  email: string;
  inhabilitado: boolean | 1 | 0 | 'true' | 'false';
  created_at?: string;
  updated_at?: string;
}

export interface Categoria {
  categoria_id: number | string;
  nombre: string;
  inhabilitada: boolean | 1 | 0 | 'true' | 'false';
  created_at?: string;
  updated_at?: string;
}

export interface Proveedor {
  proveedor_id: number | string;
  nombre: string;
  descripcion: string;
  razon_social: string;
  cuit: number | string;
  nro_telefono: string;
  inhabilitado: boolean | 1 | 0 | 'true' | 'false';
  created_at?: string;
  updated_at?: string;
}

export interface ListaPrecio{
  lista_precio_id: number | string;
  lista_precio_nombre: string;
  proveedor_id: number | string;
  proveedor_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  inhabilitada: boolean | 1 | 0 | 'true' | 'false';
  created_at?: string;
  updated_at?: string;
}

export interface Producto{
  producto_id: number | string;
  producto_nombre: string;
  descripcion: string;
  categoria_id: number | string;
  categoria_nombre: string;
  lista_precio_id: number | string;
  lista_precio_nombre: string;
  precio: number | string | '';
  inhabilitado: boolean | 1 | 0 | 'true' | 'false';
  created_at?: string;
  updated_at?: string;
}
export interface Stock{
  stock_id: number|string;
  producto_id:number|string;
  producto_nombre: string;
  cantidad: string|number;
  created_at?: string;
  updated_at?: string;
}

export interface MovimientoStock{
  movimiento_id:     number|string;
  producto_id:       number|string;
  producto_nombre:   string;
  proveedor_id?:     number|string;
  proveedor_nombre?: string;
  tipo_id:           number|string;
  tipo_nombre:       number|string;
  origen_id:         number|string;
  origen_nombre:     number|string;
  fecha?:            string;
  fecha_inicio:      string;
  fecha_fin:         string;
  cantidad:          string|number;
  created_at?:       string;
  updated_at?:       string;
}

export interface FormaPago{
  forma_pago_id: number|string;
  nombre:        string;
  descripcion:   string;
  inhabilitada:  boolean | 1 | 0 | 'true' | 'false';
  created_at?:   string;
  updated_at?:   string;
}

//para componente selec multiple
export type Multiple = { 
  id: number; 
  nombre: string;
};