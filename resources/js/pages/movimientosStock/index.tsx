import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Autocomplete, MovimientoStock } from '@/types/typeCrud';
import { Search, Brush, Loader2, CirclePlus, Filter } from 'lucide-react';
import { Select,  SelectContent, SelectGroup,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { route } from 'ziggy-js';
import { Multiple } from '@/types/typeCrud';
import { convertirFechaBarrasGuiones, ordenarPorTexto } from '@/utils';
import { DatePicker } from '@/components/utils/date-picker';
import DataTableMovimientos from '@/components/movimientosStock/dataTableMovimientos';
import GenericSelect from '@/components/utils/genericSelect';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Movimientos Stock', href: '', } ];

type propsForm = {
  resetearMovimiento: (data:MovimientoStock[]) => void;
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
  fecha_inicio:      '',//(new Date()).toLocaleDateString(),
  fecha_fin:         '',//(new Date()).toLocaleDateString(),
  cantidad:          '',
}

export function FiltrosForm({ resetearMovimiento, origenes, tipos, data, set }: propsForm){
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false)
  const [optionProduct, setOptionProduct]           = useState<Autocomplete|null>(null);
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
    setOptionProduct(null);
  }; 

  const seleccionarProducto = (option : any) => {
    if(option){
      set({...data, producto_id: option.value, producto_nombre: option.label});
      setOptionProduct(option);
    }else{
      set({...data, producto_id: '', producto_nombre: ''});
      setOptionProduct(null);
    }
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
          <GenericSelect
            route="productos"
            value={optionProduct}
            onChange={(option) => seleccionarProducto(option)}
            placeHolder="Selec. producto"
          />
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

  const movs:MovimientoStock[] = [];
  const { movimientos } = usePage().props as { movimientos?: MovimientoStock[] }; //necesito los props de inertia

  //const [productoHab, setProductosHab] = useState<Multiple[]>([]);
  const [tiposHab, setTiposHab]        = useState<Multiple[]>([]);
  const [origenesHab, setOrigenesHab]  = useState<Multiple[]>([]);

  //effect
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [/*resProductos,*/ resTipos, resOrigins] = await Promise.all([
          //fetch(route('productos.productosHabilitados')),
          fetch(route('tiposMov.habilitados')),
          fetch(route('origenesMov.habilitados'))
        ]);

        //const productos = await resProductos.json();
        const tipos     = await resTipos.json();
        const origenes  = await resOrigins.json();

        //setProductosHab(ordenarPorTexto(productos, 'nombre'));
        setTiposHab(ordenarPorTexto(tipos, 'nombre'));
        setOrigenesHab(ordenarPorTexto(origenes, 'nombre'));
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    cargarDatos();
  }, []);
 
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Movimientos Stock" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm
            data={data}
            set={setData}
            resetearMovimiento={(e:any[]) => { } }
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