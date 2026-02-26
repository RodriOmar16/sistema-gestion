import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Autocomplete, Gasto } from '@/types/typeCrud';
import { Select,  SelectContent,  SelectGroup,  SelectItem,  SelectLabel,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import ModalConfirmar from '@/components/modalConfirmar';
import ShowMessage from '@/components/utils/showMessage';
import GenericSelect from '@/components/utils/genericSelect';
import { DatePicker } from '@/components/utils/date-picker';
import { NumericFormat } from 'react-number-format';
import DataTableGastos from '@/components/gastos/dataTableGastos';
import NewEditGasto from '@/components/gastos/newEditGasto';
import { convertirFechaBarrasGuiones, getCsrfToken } from '@/utils';
import Loading from '@/components/utils/loadingDialog';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Gastos', href: '', } ];

type propsForm = {
  openCreate: () => void;
}

const gastoVacio = {
  gasto_id:         '',
  fecha:            '',
  fecha_desde:      '',
  fecha_hasta:      '',
  caja_id:          '',
  proveedor_id:     '',
  proveedor_nombre: '',
  forma_pago_id:    '',
  forma_pago_nombre:'',
  monto:            '',
  descripcion:      '',
  inhabilitado:     0
};

export function FiltrosForm({ openCreate }: propsForm){
  const { data, setData, errors, processing } = useForm<Gasto>(gastoVacio);
  const [load, setLoad]                       = useState(false);
  const [optionProv, setOptionProv]           = useState<Autocomplete|null>(null);
  const [optionFp, setOptionFp]               = useState<Autocomplete|null>(null);

  const tipoCajas = [ {id:0, nombre: 'Sin caja'}, {id: -1, nombre: 'Principal'} ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoad(true);
    const payload = {
      ...data, 
      fecha_desde: convertirFechaBarrasGuiones(data.fecha_desde??''),
      fecha_hasta: convertirFechaBarrasGuiones(data.fecha_hasta??''),
      /*gasto_id: Number(data.gasto_id),
      proveedor_id: Number(data.proveedor_id),
      forma_pago_id: Number(data.forma_pago_id),
      monto: Number(data.monto),*/
      buscar: true    
    }
    
    router.get(route('gastos.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setLoad(false),
    });
  };

  const handleReset = () => {
    setData(gastoVacio);
    setOptionProv(null);
    setOptionFp(null);
  };

  const seleccionarProveedor = (option : any) => {
    if(option){
      setData({...data, proveedor_id: option.value, proveedor_nombre: option.label});
      setOptionProv(option);
    }else{
      setData({...data, proveedor_id: '', proveedor_nombre: ''});
      setOptionProv(null);
    }
  };
  const seleccionarFp = (option : any) => {
    if(option){
      //setFpId(option.value);
      setData({...data, forma_pago_id: option.value, forma_pago_nombre: option.label});
      setOptionFp(option);
    }else{
      //setFpId(0);
      setData({...data, forma_pago_id: '', forma_pago_nombre: ''});
      setOptionFp(null);
    }
  };

  return (
    <div>
      <div className='flex items-center justify-between px-3 pt-3'>
        <div className='flex'> <Filter size={20} />  Filtros</div>
        <Button 
          className="p-0 hover:bg-transparent cursor-pointer"
          type="button"
          title="Nuevo" 
          variant="ghost" 
          size="icon" 
          onClick={openCreate}
        >
          <CirclePlus size={30} className="text-green-600 scale-200" />
        </Button>
      </div>
      <form className='grid grid-cols-12 gap-4 px-4 pt-1 pb-4' onSubmit={handleSubmit}>
        <div className='col-span-12 sm:col-span-3 md:col-span-3 lg:col-span-2'>
          <label htmlFor="id">Id</label>
          <Input className='text-right' value={data.gasto_id} onChange={(e)=>setData('gasto_id',Number(e.target.value))}/>	
          { errors.gasto_id && <p className='text-red-500	'>{ errors.gasto_id }</p> }
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4'>
          Proveedores
          <GenericSelect
            route="proveedores"
            value={optionProv}
            onChange={(option) => seleccionarProveedor(option)}
            placeHolder='Selec. proveedor'
          />
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4'>
          <label htmlFor="forma_pago">Forma de pago</label>
          <GenericSelect
            route="formas-pago"
            value={optionFp}
            onChange={(option) => seleccionarFp(option)}
            placeHolder='Selec. Forma de pago'
          />
        </div>
        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2 lg:col-span-2">
          <label htmlFor="padre">Caja</label>
          <Select
            value={String(data.caja_id)}
            onValueChange={(value) => setData('caja_id', Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {tipoCajas.map((e: any) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2">
          <label htmlFor="fechaDesde">Fecha Desde</label>
          <DatePicker fecha={(data.fecha_desde)} setFecha={ (fecha:string) => {setData({...data,fecha_desde: fecha})} }/>
        </div>
        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2">
          <label htmlFor="fechaHasta">Fecha Hasta</label>
          <DatePicker fecha={(data.fecha_hasta)} setFecha={ (fecha:string) => {setData({...data,fecha_hasta: fecha})} }/>
        </div>        
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="monto">Monto</label>
          <NumericFormat 
            value={data.monto} 
            thousandSeparator="." 
            decimalSeparator="," 
            prefix="$" 
            className="text-right border rounded px-2 py-1" 
            onValueChange={(values) => { setData({...data,monto: values.floatValue || 0}) }}
          />	
        </div>
        <div className='col-span-6 sm:col-span-2 md:col-span-2 lg:col-span-5 flex justify-end items-center'>
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

interface PageProps {
  flash: {
    success?: string;
    error?: string;
  };
  [key: string]: any;
}

export default function Gastos(){
  //data
  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
  const [textConfir, setTextConfirm] = useState('');
  
  const [modalOpen, setModalOpen]         = useState(false); //modal editar/crear
  const [modalMode, setModalMode]         = useState<'create' | 'edit'>('create');
  const [selectedGasto, setSelectedGasto] = useState<Gasto | undefined>(undefined);
  const [pendingData, setPendingData]     = useState<Gasto | undefined>(undefined);
  const [loading, setLoading]             = useState(false);
  
  const [openConfirmar, setConfirmar]     = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar] = useState(''); 
  const [gastoCopia, setGastoCopia]       = useState<Gasto>(gastoVacio);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const { gastos } = usePage().props as { gastos?: Gasto[] }; //necesito los props de inertia
  const { resultado, mensaje, gasto_id, timestamp } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    gasto_id?: number;
    timestamp?: number;
  };
  const [ultimoTimestamp, setUltimoTimestamp] = useState<number | null>(null);
  const [cacheados, setCacheados] = useState<Gasto[]>([]);

  const [respuesta, setResp]= useState<{resultado: number, gasto_id: number}>({resultado: 0, gasto_id: 0});


  //funciones
  const confirmar = (data: Gasto) => {
    if(data){
      setGastoCopia( JSON.parse(JSON.stringify(data)) );
      setTextConfirmar('Estás seguro de querer eliminar este gasto?');
      setConfirmar(true);
      setModalMode('edit');
    }
  };
  const inhabilitarHabilitar = () => {
    if (!gastoCopia || !gastoCopia.gasto_id) return;
    
    setLoading(true);
    router.put(
      route('gasto.toggleEstado', { gasto: gastoCopia.gasto_id }),{},
      {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          setLoading(false);
          setTextConfirmar('');
          setConfirmar(false);
          setGastoCopia(gastoVacio);
        }
      }
    );
  };

  const cancelarInhabilitarHabilitar = () => { 
    setConfirmar(false);
  };

  const openCreate = () => {
    setModalMode('create');
    setSelectedGasto(undefined);
    setModalOpen(true);
  };

  const openEdit = (data: Gasto) => {
    setModalMode('edit');
    setSelectedGasto(data);
    setModalOpen(true);
  };

  const handleSave = (data: Gasto) => {
    setPendingData(data);
    let texto = (modalMode === 'create')? 'grabar' : 'guardar cambios a';
    setTextConfirm('¿Estás seguro de '+texto+' este gasto?');
    setConfirOpen(true);
  };

  const accionar = async () => {
    if (!pendingData) return;
    setConfirOpen(false);
    setLoading(true);

    const payload = JSON.parse(JSON.stringify(pendingData));
    payload.fecha = convertirFechaBarrasGuiones(payload.fecha);
    
    let resp;
    let titulo = '';
    if (modalMode === 'create') {
      /*router.post(
        route('gastos.store'), payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoading(false);
            setTextConfirmar('');
            setConfirmar(false);
            setGastoCopia(gastoVacio);
          }
        }
      );*/
      const res  = await fetch(route('gastos.store'),{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement).content,
        },
        body: JSON.stringify(payload),
      });
      resp = await res.json();
      titulo = 'Gasto nuevo';

    } else {
      /*router.put(
        route('gasto.update',{gasto: pendingData.gasto_id}), payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoading(false);
            setPendingData(undefined);
          }
        }
      );*/
      const res = await fetch(route('gasto.update', {gasto: pendingData.gasto_id}), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify(payload),
      });
      resp  = await res.json();
      titulo = 'Gasto modificado';
    }
    setLoading(false);
    
    setResp({resultado: resp.resultado, gasto_id: resp.gasto_id});

    if(resp.resultado === 0){
      setTitle('Error');
      setText(resp.mensaje ?? 'Error inesperado');
      setColor('error');
      setActivo(true);
      return;
    }

    setTitle(titulo); 
    setText(resp.mensaje + ' ('+ resp.gasto_id +')'); 
    setColor('success'); 
    setActivo(true); 
  };

  const cancelarConfirmacion = () => {
    setConfirOpen(false);
  };

  //effect
  useEffect(() => {
    if (gastos && gastos.length > 0) {
      setCacheados(gastos);
    } else {
      setCacheados([]);
    }
  }, [gastos]);


  useEffect(() => {
    const cambioDetectado = timestamp && timestamp !== ultimoTimestamp;

    if (cambioDetectado) {
      setUltimoTimestamp(timestamp)

      const esError = resultado === 0;
      setTitle(esError ? 'Error' : modalMode === 'create' ? 'Gasto nuevo' : 'Gasto modificado');
      setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${gasto_id})`);
      setColor(esError ? 'error' : 'success');
      setActivo(true);

      if (resultado === 1 && gasto_id) {
        setModalOpen(false);
        router.get(route('gastos.index'),
          { gasto_id, buscar: true },
          { preserveScroll: true,	preserveState: true	}
        )
      }
    }
  }, [timestamp, ultimoTimestamp, resultado, mensaje, gasto_id, modalMode]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gastos" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm openCreate={openCreate}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableGastos
            datos={cacheados?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            />
        </div>
      </div>
      <NewEditGasto
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        gasto={selectedGasto}
        onSubmit={handleSave}
      />
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
        onClose={() => {
          setActivo(false);
          if (respuesta.resultado === 1 && respuesta.gasto_id) {
            setModalOpen(false);
            router.get(route('gastos.index'),
              { gasto_id:respuesta.gasto_id, buscar: true },
              { preserveScroll: true,	preserveState: true	}
            )
          }
        }}
      />
      <Loading
        open={loading}
        onClose={() => {}}
      />
    </AppLayout>
  );
}