import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { MovimientoStock } from '@/types/typeCrud';
import { Search, Brush, Loader2, CirclePlus, Filter } from 'lucide-react';
import ModalConfirmar from '@/components/modalConfirmar';
import ShowMessage from '@/components/utils/showMessage';
import { Select,  SelectContent, SelectGroup,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { route } from 'ziggy-js';
import { Multiple } from '@/types/typeCrud';
import { convertirFechaBarrasGuiones, ordenarPorTexto } from '@/utils';
import { DatePicker } from '@/components/utils/date-picker';
import DataTableMovimientos from '@/components/movimientosStock/dataTableMovimientos';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Movimientos Stock', href: '', } ];

type propsForm = {
  resetearMovimiento: (data:MovimientoStock[]) => void;
  productos:  Multiple[];
  origenes:   Multiple[];
  tipos:      Multiple[];
  data:       MovimientoStock;
  set:        (e:any) => void;
}

const movVacio = {
  movimiento_id:     '',
  producto_id:       '',
  producto_nombre:   '',
  tipo_id:           '',
  tipo_nombre:       '',
  origen_id:         '',
  origen_nombre:     '',
  fecha_inicio:      (new Date()).toLocaleDateString(),
  fecha_fin:         (new Date()).toLocaleDateString(),
  cantidad:          '',
}

export function FiltrosForm({ resetearMovimiento, productos, origenes, tipos, data, set }: propsForm){
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false)
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetearMovimiento([]);
    setLoading(true);
    const dataCopia = JSON.parse(JSON.stringify(data));
    dataCopia.fecha_inicio = convertirFechaBarrasGuiones(data.fecha_inicio);
    dataCopia.fecha_fin = convertirFechaBarrasGuiones(data.fecha_fin);
    const payload = {      ...dataCopia, buscar: true    }
    router.get(route('movStock.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => {
        setEsperandoRespuesta(false);
        setLoading(false);
      }
    });
  };
  const handleReset = () => {
    set(movVacio);
  }; 

  return (
    <div>
      <div className='flex items-center justify-between px-3 pt-3'>
        <div className='flex'> <Filter size={20} />  Filtros</div>
      </div>
      <form className='grid grid-cols-12 gap-4 px-4 pt-1 pb-4' onSubmit={handleSubmit}>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2'>
          <label htmlFor="id">Id</label>
          <Input value={data.movimiento_id} onChange={(e)=>set({...data, movimiento_id: Number(e.target.value)})}/>	
        </div>
        <div className='col-span-12 sm:col-span-8 md:col-span-8 lg:col-span-4'>
          <label htmlFor="productos">Productos</label>
          <Select
            value={String(data.producto_id)}
            onValueChange={(value) => set({...data, producto_id: Number(value)}) }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {productos.map((e: any) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="tipos">Tipos</label>
          <Select
            value={String(data.tipo_id)}
            onValueChange={(value) => set({...data, tipo_id:Number(value)})}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {tipos.map((e: any) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="origenes">Origenes</label>
          <Select
            value={String(data.origen_id)}
            onValueChange={(value) => set({...data, origen_id:Number(value)})}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {origenes.map((e: any) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-12 sm:col-span-4 md:col-span-6 lg:col-span-3">
          <label htmlFor="fechaInicio">Fecha Desde</label>
          <DatePicker fecha={(data.fecha_inicio)} setFecha={ (fecha:string) => {set({...data, fecha_inicio: fecha})} }/>
        </div>
        <div className="col-span-12 sm:col-span-4 md:col-span-6 lg:col-span-3">
          <label htmlFor="fechaFin">Fecha Hasta</label>
          <DatePicker fecha={(data.fecha_fin)} setFecha={ (fecha:string) => {set({...data, fecha_fin: fecha})} }/>
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-12 lg:col-span-6 flex justify-end items-center'>
          <Button 
            className="p-0 hover:bg-transparent cursor-pointer"
            type="button"
            title="Limpiar" 
            variant="ghost" 
            size="icon" 
            onClick={handleReset}
          >
            <Brush size={30} className="text-orange-500" />
          </Button>
          <Button type="submit" title="Buscar" disabled={loading}>
            {loading ? (<Loader2 size={20} className="animate-spin" />) : 
                       (<Search size={20} className="" />)
            } Buscar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default function MovimientosStock(){
  //data  
  const { data, setData, errors, processing } = useForm<MovimientoStock>(movVacio); //formulario que busca

  /*const [openConfirmar, setConfirmar]       = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar]   = useState(''); 
  const [productoCopia, setProductoCopia]   = useState<MovimientoStock>(movVacio);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');*/
  const movs:MovimientoStock[] = [];
  const { movimientos } = usePage().props as { movimientos?: MovimientoStock[] }; //necesito los props de inertia
  /*const { resultado, mensaje, producto_id } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    producto_id?: number;
  };
  const [propsActuales, setPropsActuales] = useState<{
    resultado: number | undefined | null;
    mensaje: string | undefined | null | '';
    producto_id: number | undefined | null;
  }>({ resultado: undefined, mensaje: undefined, producto_id: undefined });
  const [productosCacheados, setProductosCacheados] = useState<Producto[]>([]);*/

  const [productoHab, setProductosHab] = useState<Multiple[]>([]);
  const [tiposHab, setTiposHab]        = useState<Multiple[]>([]);
  const [origenesHab, setOrigenesHab]  = useState<Multiple[]>([]);

  //funciones
  /*const confirmar = (data: MovimientoStock) => {
    if(data){
      setProductoCopia( JSON.parse(JSON.stringify(data)) );
      const texto : string = data.inhabilitado === 0 ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' este producto?');
      setConfirmar(true);
    }
  };
  const inhabilitarHabilitar = () => {
    if (!productoCopia || !productoCopia.producto_id) return;
    router.put(
      route('productos.toggleEstado', { producto: productoCopia.producto_id }),{},
      {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          setTextConfirmar('');
          setConfirmar(false);
          setProductoCopia(productoVacio);
        }
      }
    );
  };

  const cancelarInhabilitarHabilitar = () => { 
    setConfirmar(false);
  };

  const openEdit = (data: Producto) => {
    router.get(
      route('productos.edit', { producto: data.producto_id }),
      {},{}
    );
  };*/

  //effect
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resProductos, resTipos, resOrigins] = await Promise.all([
          fetch(route('productos.productosHabilitados')),
          fetch(route('tiposMov.habilitados')),
          fetch(route('origenesMov.habilitados'))
        ]);

        const productos = await resProductos.json();
        const tipos     = await resTipos.json();
        const origenes  = await resOrigins.json();

        setProductosHab(ordenarPorTexto(productos, 'nombre'));
        setTiposHab(ordenarPorTexto(tipos, 'nombre'));
        setOrigenesHab(ordenarPorTexto(origenes, 'nombre'));
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    cargarDatos();
  }, []);

 /* useEffect(() => {
    if (!activo && propsActuales.resultado !== undefined) {
      setPropsActuales({
        resultado: undefined,
        mensaje: undefined,
        producto_id: undefined
      });
    }
  }, [activo]);*/

  /*useEffect(() => {
    if (
      movimientos &&
      productos.length > 0 &&
      JSON.stringify(productos) !== JSON.stringify(productosCacheados)
    ) {
      setProductosCacheados(productos);
    }
  }, [productos]);*/


  /*useEffect(() => {
    const cambioDetectado =
      (resultado && resultado  !== propsActuales.resultado)  ||
      (mensaje && mensaje    !== propsActuales.mensaje)

    if (cambioDetectado) {
      setPropsActuales({ resultado, mensaje, producto_id });

      const esError = resultado === 0;
      setTitle(esError ? 'Error' : 'Producto modificado');
      setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${producto_id})`);
      setColor(esError ? 'error' : 'success');
      setActivo(true);

      if (resultado === 1 && producto_id) {
        router.get(route('productos.index'),
          { producto_id, buscar: true },
          { preserveScroll: true,	preserveState: true	}
        )
      }
    }
  }, [resultado, mensaje, producto_id]);*/

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Movimientos Stock" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm
            data={data}
            set={setData}
            resetearMovimiento={(e:any[]) => { } }
            productos={productoHab}
            tipos={tiposHab}
            origenes={origenesHab}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableMovimientos
            datos={movimientos?? []}
            dataIndex={data}
            />
        </div>
      </div>
    </AppLayout>
  );
}