import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Autocomplete, Venta } from '@/types/typeCrud';
import { Search, Brush, Loader2, CirclePlus, Filter } from 'lucide-react';
import ModalConfirmar from '@/components/modalConfirmar';
import ShowMessage from '@/components/utils/showMessage';
import { Select,  SelectContent, SelectGroup,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { route } from 'ziggy-js';
import { Multiple } from '@/types/typeCrud';
import { convertirFechaBarrasGuiones, ordenarPorTexto } from '@/utils';
import DataTableVentas from '@/components/ventas/dataTableVentas';
import { DatePicker } from '@/components/utils/date-picker';
import GenericSelect from '@/components/utils/genericSelect';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Ventas', href: '', } ];

type propsForm = {
  //clientes: Multiple[];
  data: Venta;
  set: (e:any) => void;
}

const ventaVacia = {
  venta_id:        '',
  fecha_grabacion: '',
  fecha_desde:     '',
  fecha_hasta:     '',
  cliente_id:      '',
  cliente_nombre:  '',
  fecha_anulacion: '',
  total:           0,
  anulada:         false,
}

export function FiltrosForm({ /*clientes,*/ data, set }: propsForm){
  const [optionCliente, setOptionCliente] = useState<Autocomplete|null>(null);
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false)
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...data,
      fecha_desde: convertirFechaBarrasGuiones(data.fecha_desde??''), 
      fecha_hasta: convertirFechaBarrasGuiones(data.fecha_hasta??''),
      fecha_anulacion: convertirFechaBarrasGuiones(data.fecha_anulacion??''),
      buscar: true    
    };
    router.get(route('ventas.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => {
        setEsperandoRespuesta(false);
        setLoading(false);
      }
    });
  };
  const handleReset = () => {
    set(ventaVacia);
    setOptionCliente(null);
  }; 

  const seleccionarCliente = (option : any) => {
    if(option){
      set({...data, cliente_id: option.value, cliente_nombre: option.label});
      setOptionCliente(option);
    }else{
      set({...data, cliente_id: '', cliente_nombre: ''});
      setOptionCliente(null);
    }
  };

  return (
    <div>
      <div className='flex items-center justify-between px-3 pt-3'>
        <div className='flex'> <Filter size={20} />  Filtros</div>
        <a href={route('ventas.create')} target='_blank'>
          <Button 
            className="p-0 hover:bg-transparent dark:hover:bg-transparent cursor-pointer"
            type="button"
            title="Nueva Venta" 
            variant="ghost" 
            size="icon"
          >
            <CirclePlus size={30} className="text-green-600 scale-200" />
          </Button>
        </a>
      </div>
      <form className='grid grid-cols-12 gap-4 px-4 pt-1 pb-4' onSubmit={handleSubmit}>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="id">Id</label>
          <Input value={data.venta_id} onChange={(e)=>set({...data, venta_id: Number(e.target.value)})}/>	
        </div>
        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3">
          <label htmlFor="fechaDesde">Fecha Desde</label>
          <DatePicker fecha={(data.fecha_desde)} setFecha={ (fecha:string) => {set({...data,fecha_desde: fecha})} }/>
        </div>
        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3">
          <label htmlFor="fechaHasta">Fecha Hasta</label>
          <DatePicker fecha={(data.fecha_hasta)} setFecha={ (fecha:string) => {set({...data,fecha_hasta: fecha})} }/>
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="cliente">Cliente</label>
          <GenericSelect
            route="clientes"
            value={optionCliente}
            onChange={(option) => seleccionarCliente(option)}
            placeHolder="Selec. cliente"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3">
          <label htmlFor="fechaAnulacion">Anulación</label>
          <DatePicker fecha={(data.fecha_anulacion)} setFecha={ (fecha:string) => {set({...data,fecha_anulacion: fecha})} }/>
        </div>
        <div className='col-span-6 sm:col-span-6 md:col-span-6 lg:col-span-3 flex flex-col'>
          <label className='mr-2'>Anulada</label>
          <Switch checked={data.anulada==0 ? false: true} onCheckedChange={(val) => set({...data, anulada: val})} />
        </div>
        <div className='col-span-6 sm:col-span-6 md:col-span-6 lg:col-span-6 flex justify-end items-center'>
          <Button 
            className="p-0 hover:bg-transparen dark:hover:bg-transparent cursor-pointer"
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

export default function Ventas(){
  //data  
  const { data, setData, errors, processing } = useForm<Venta>(ventaVacia); //formulario que busca

  const [openConfirmar, setConfirmar]     = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar] = useState(''); 
  const [ventaCopia, setVentaCopia]       = useState<Venta>(ventaVacia);

  const { ventas } = usePage().props as { ventas?: Venta[] }; //necesito los props de inertia
  const { resultado, mensaje, venta_id } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    venta_id?: number;
  };
  const [cacheados, setCacheados] = useState<Venta[]>([]);

  //funciones
  const openEdit = (data: Venta) => {
    router.get(route('ventas.view', { venta: data.venta_id }));
  };

  //effect
    useEffect(() => {
    if (ventas && ventas.length > 0) {
      setCacheados(ventas);
    } else {
      setCacheados([]);
    }
  }, [ventas]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Ventas" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm
            data={data}
            set={setData}
            /*clientes={clientes}*//>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableVentas
            datos={cacheados?? []} 
            openEdit={openEdit}
            dataIndex={data}
            />
        </div>
      </div>
    </AppLayout>
  );
}