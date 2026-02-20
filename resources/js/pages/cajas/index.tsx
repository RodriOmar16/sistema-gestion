import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Autocomplete, Caja } from '@/types/typeCrud';
import { Select,  SelectContent,  SelectGroup,  SelectItem,  SelectLabel,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import ModalConfirmar from '@/components/modalConfirmar';
import ShowMessage from '@/components/utils/showMessage';
import GenericSelect from '@/components/utils/genericSelect';
import { DatePicker } from '@/components/utils/date-picker';
import { NumericFormat } from 'react-number-format';
import DataTableCajas from '@/components/cajas/dataTableCajas';
//import NewEditGasto from '@/components/gastos/newEditGasto';
import { convertirFechaBarrasGuiones } from '@/utils';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Cajas', href: '', } ];

type propsForm = {
  openCreate: () => void;
}

const cajaVacia = {
  caja_id:            0,
  turno_id:           0,
  turno_nombre:       '',
  fecha:              '',
  fecha_desde:        '',
  fecha_hasta:        '',
  monto_inicial:      0,
  descripcion:        '',
  efectivo:           0,
  efectivo_user:      0,
  debito:             0,
  debito_user:        0,
  transferencia:      0,
  transferencia_user: 0,
  total_sistema:      0,
  total_user:         0,
  diferencia:         0,
  inhabilitado:       0,
};

export function FiltrosForm({ openCreate }: propsForm){
  const { data, setData, errors, processing } = useForm<Caja>(cajaVacia);
  const [load, setLoad]                       = useState(false);
  const [optionTur, setOptionTurn]            = useState<Autocomplete|null>(null);

  //const tipoCajas = [ {id:0, nombre: 'Sin caja'}, {id: -1, nombre: 'Principal'} ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoad(true);
    const payload = { 
      ...data,
      caja_id: data.caja_id == 0 ? null : Number(data.caja_id),
      turno_id: data.turno_id == 0 ? null : Number(data.turno_id),
      fecha_desde: convertirFechaBarrasGuiones(data.fecha_desde??''),
      fecha_hasta: convertirFechaBarrasGuiones(data.fecha_hasta??''),
      buscar: true    
    }
    
    router.get(route('cajas.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setLoad(false),
    });
  };

  const handleReset = () => {
    setData(cajaVacia);
    setOptionTurn(null);
  };

  const selectTurnos = (option : any) => {
    if(option){
      setData({...data, turno_id: option.value, turno_nombre: option.label});
      setOptionTurn(option);
    }else{
      setData({...data, turno_id: 0, turno_nombre: ''});
      setOptionTurn(null);
    }
  };

  return (
    <div>
      <div className='flex items-center justify-between px-3 pt-3'>
        <div className='flex'> <Filter size={20} />  Filtros</div>
        <a href={route('caja.create')} target='_blank'>
          <Button 
            className="p-0 hover:bg-transparent cursor-pointer"
            type="button"
            title="Crear Caja" 
            variant="ghost" 
            size="icon" 
            onClick={openCreate}
          >
            <CirclePlus size={30} className="text-green-600 scale-200" />
          </Button>
        </a>
      </div>
      <form className='grid grid-cols-12 gap-4 px-4 pt-1 pb-4' onSubmit={handleSubmit}>
        <div className='col-span-12 sm:col-span-3 md:col-span-3 lg:col-span-2'>
          <label htmlFor="id">Id</label>
          <Input className='text-right' value={data.caja_id} onChange={(e)=>setData('caja_id',Number(e.target.value))}/>	
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          Turnos
          <GenericSelect
            route="turnos"
            value={optionTur}
            onChange={(option) => selectTurnos(option)}
            placeHolder='Seleccionar'
          />
        </div>
        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2">
          <label htmlFor="fechaDesde">Fecha Desde</label>
          <DatePicker fecha={(data.fecha_desde)} setFecha={ (fecha:string) => {setData({...data,fecha_desde: fecha})} }/>
        </div>
        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2">
          <label htmlFor="fechaHasta">Fecha Hasta</label>
          <DatePicker fecha={(data.fecha_hasta)} setFecha={ (fecha:string) => {setData({...data,fecha_hasta: fecha})} }/>
        </div>  
        <div className='col-span-6 sm:col-span-2 md:col-span-2 lg:col-span-3 flex justify-end items-center'>
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
          <Button type="submit" title="Buscar" disabled={load}>
            {load ? (<Loader2 size={20} className="animate-spin" />) : 
                    (<Search size={20} className="" />)}
            Buscar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default function Cajas(){
  //data
  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
  const [textConfir, setTextConfirm] = useState('');
  
  const [modalOpen, setModalOpen]         = useState(false); //modal editar/crear
  const [modalMode, setModalMode]         = useState<'create' | 'edit'>('create');
  const [selectedCaja, setSelectedCaja]   = useState<Caja | undefined>(undefined);
  const [pendingData, setPendingData]     = useState<Caja | undefined>(undefined);
  const [loading, setLoading]             = useState(false);
  
  const [openConfirmar, setConfirmar]     = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar] = useState(''); 
  const [cajaCopia, setCajaCopia]       = useState<Caja>(cajaVacia);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const { cajas } = usePage().props as { cajas?: Caja[] }; //necesito los props de inertia
  const { resultado, mensaje, caja_id, timestamp } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    caja_id?: number;
    timestamp?: number;
  };
  const [ultimoTimestamp, setUltimoTimestamp] = useState<number | null>(null);
  const [cacheados, setCacheados] = useState<Caja[]>([]);

  //funciones
  const confirmar = (data: Caja) => {
    if(data){
      setCajaCopia( JSON.parse(JSON.stringify(data)) );
      setTextConfirmar('Estás seguro de querer eliminar esta caja?');
      setConfirmar(true);
      setModalMode('edit');
    }
  };
  const inhabilitarHabilitar = () => {
    if (!cajaCopia || !cajaCopia.caja_id) return;
    
    setLoading(true);
    router.put(
      route('caja.toggleEstado', { caja: cajaCopia.caja_id }),{},
      {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          setLoading(false);
          setTextConfirmar('');
          setConfirmar(false);
          setCajaCopia(cajaVacia);
        }
      }
    );
  };

  const cancelarInhabilitarHabilitar = () => { 
    setConfirmar(false);
  };

  const openCreate = () => {
    setModalMode('create');
    setSelectedCaja(undefined);
    setModalOpen(true);
  };

  const openEdit = (data: Caja) => {
    setModalMode('edit');
    setSelectedCaja(data);
    setModalOpen(true);
  };

  const handleSave = (data: Caja) => {
    setPendingData(data);
    let texto = (modalMode === 'create')? 'grabar' : 'guardar cambios a';
    setTextConfirm('¿Estás seguro de '+texto+' esta caja?');
    setConfirOpen(true);
  };

  const accionar = () => {
    if (!pendingData) return;
    setLoading(true);

    const payload = JSON.parse(JSON.stringify(pendingData));
    payload.fecha = convertirFechaBarrasGuiones(payload.fecha);
    if (modalMode === 'create') {
      router.post(
        route('cajas.store'), payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoading(false);
            setTextConfirmar('');
            setConfirmar(false);
            setCajaCopia(cajaVacia);
          }
        }
      );
    } else {
      router.put(
        route('caja.update',{turno: pendingData.caja_id}), payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoading(false);
            setPendingData(undefined);
          }
        }
      );
    }
    setConfirOpen(false);
  };

  const cancelarConfirmacion = () => {
    setConfirOpen(false);
  };

  //effect
  useEffect(() => {
    if (cajas && cajas.length > 0) {
      setCacheados(cajas);
    } else {
      setCacheados([]);
    }
  }, [cajas]);



  useEffect(() => {
    const cambioDetectado = timestamp && timestamp !== ultimoTimestamp;

    if (cambioDetectado) {
      setUltimoTimestamp(timestamp)

      const esError = resultado === 0;
      setTitle(esError ? 'Error' : modalMode === 'create' ? 'Caja nueva' : 'Caja modificada');
      setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${caja_id})`);
      setColor(esError ? 'error' : 'success');
      setActivo(true);

      if (resultado === 1 && caja_id) {
        setModalOpen(false);
        router.get(route('gastos.index'),
          { caja_id, buscar: true },
          { preserveScroll: true,	preserveState: true	}
        )
      }
    }
  }, [timestamp, ultimoTimestamp, resultado, mensaje, caja_id, modalMode]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Cajas" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm openCreate={openCreate}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableCajas
            datos={cacheados?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
          />
        </div>
      </div>
      {/*<NewEditGasto
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        gasto={selectedGasto}
        onSubmit={handleSave}
      />*/}
      <ModalConfirmar
        open={confirmOpen}
        text={textConfir}
        onSubmit={accionar}
        onCancel={cancelarConfirmacion}
      />
      <ModalConfirmar
        open={openConfirmar}
        text={textConfirmar}
        onSubmit={inhabilitarHabilitar}
        onCancel={cancelarInhabilitarHabilitar}
      />
      <ShowMessage 
        open={activo}
        title={title}
        text={text}
        color={color}
        onClose={() => setActivo(false)}
      />
    </AppLayout>
  );
}