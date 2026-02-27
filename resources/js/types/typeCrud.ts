export interface Project {
  id: number | string;
  name: string;
  descripcion: string;
  inhabilitado: boolean | number | 'true' | 'false';
  created_at?: string;
  updated_at?: string;
}

export interface AuthProps {
  user: any; roles: string[]; permisos: string[];
}

export interface Autocomplete{
  value:number;
  label: string;
};

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
  ruta_id?: number | string | null;
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

export interface ListaPrecioProducto{
  lista_precio_id:     number | string;
  proveedor_id:        number | string;
  proveedor_nombre:    string;
  producto_id:         number|string;
  producto_nombre:     string;
  precio:              number;
  precio_final?:       number;
  porcentaje:          number;
  precio_sugerido:     number;
  editar?:             0 | 1;
  cambiar?:            0 | 1;
  load?:               0 | 1;
  created_at?:         string;
  updated_at?:         string;
}

export interface Producto{
  producto_id: number | string;
  producto_nombre: string;
  descripcion: string;
  precio: number | string | '';
  categoria_id: number | string;
  categoria_nombre: string;
  //lista_precio_id: number | string;
  //lista_precio_nombre: string;
  marca_id: number | string;
  marca_nombre: string;
  codigo_barra: string;
  stock_minimo: number;
  stock_actual: number; 
  vencimiento?: string;
  inhabilitado: boolean | 1 | 0 | 'true' | 'false';
  imagen?: string;
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
export interface Cliente{
  cliente_id:       number|string;
  nombre:           string;
  fecha_nacimiento: string;
  domicilio:        string;
  email:            string;
  dni:              number | string;
  inhabilitado:     boolean | 1 | 0 | 'true' | 'false';
  created_at?:      string;
  updated_at?:      string;
}

export interface Venta{
  venta_id:        string|number;
  fecha_grabacion: string;
  fecha_desde:     string;
  fecha_hasta:     string;
  cliente_id:      number|string;
  cliente_nombre:  string;
  fecha_anulacion: string;
  total:           number;
  anulada:         boolean | 1 | 0 | 'true' | 'false';
  created_at?:     string;
  updated_at?:     string;
}

export interface Turno{
  turno_id:     string|number;
  nombre:       string;
  apertura:     string;
  cierre:       string;
  inhabilitado: boolean | 1 | 0 | 'true' | 'false';
  created_at?:  string;
  updated_at?:  string;
}

export interface Gasto{
  gasto_id:         string|number;
  fecha:            string;
  fecha_desde:      string;
  fecha_hasta:      string;
  caja_id:          string|number;
  proveedor_id:     number|string;
  proveedor_nombre: string;
  forma_pago_id:    number|string;
  forma_pago_nombre:string;
  monto:            string|number;
  descripcion:      string;
  inhabilitado:     number;
  created_at?:      string;
  updated_at?:      string;
}
export interface Marca{
  marca_id:     string|number;
  nombre:       string;
  inhabilitada: boolean | 1 | 0 | 'true' | 'false';
  created_at?:  string;
  updated_at?:  string;
};

export interface Caja {
  caja_id:            string|number;
  turno_id:           string|number;
  turno_nombre:       string;
  fecha:              string;
  fecha_desde:        string;
  fecha_hasta:        string;
  monto_inicial:      number;
  descripcion:        string;
  efectivo:           number;
  efectivo_user:      number;
  debito:             number;
  debito_user:        number;
  transferencia:      number;
  transferencia_user: number;
  total_sistema:      number;
  total_user:         number;
  diferencia:         number;
  inhabilitado:       number;
  abierta:            boolean|number;
  created_at?:        string;
  updated_at?:        string;
}

//para componente selec multiple
export type Multiple = { 
  id: number; 
  nombre: string;
};
export interface Paginacion<T> {
  data: T[];
  current_page:  number;
  last_page:     number;
  total:         number;
  per_page:      number;
  prev_page_url: string;
  next_page_url: string;
  links: {
    url:    string | null;
    label:  string;
    active: boolean;
  }[];
}