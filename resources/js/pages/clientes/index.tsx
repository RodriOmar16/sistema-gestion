import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Cliente } from '@/types/typeCrud';
import { Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import NewEditClientes from '@/components/clientes/newEditClientes';
import DataTableClientes from '@/components/clientes/dataTableClientes';
import ModalConfirmar from '@/components/modalConfirmar';
import ShowMessage from '@/components/utils/showMessage';
import { DatePicker } from '@/components/utils/date-picker';
import InputDni from '@/components/utils/input-dni';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Clientes', href: '', } ];

type propsForm = {
  openCreate: () => void;
  resetearCliente: (data:Cliente[]) => void;
}

const clienteVacio = {
  cliente_id:       '',
  nombre:           '',
  fecha_nacimiento: '',
  domicilio:        '',
  email:            '',
  dni:              '',
  inhabilitado:     false,
}

export function FiltrosForm({ openCreate, resetearCliente }: propsForm){
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false);
  const { data, setData, errors, processing }       = useForm<Cliente>(clienteVacio);
  const [load, setLoad]                             = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetearCliente([]);
    setLoad(true);
    const payload = {      ...data, buscar: true    }
    
    router.get(route('clientes.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setLoad(false),
    });
  };
  const handleReset = () => {
    setData(clienteVacio);
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
          <Input className='text-right' value={data.cliente_id} onChange={(e)=>setData('cliente_id',Number(e.target.value))}/>	
          { errors.cliente_id && <p className='text-red-500	'>{ errors.cliente_id }</p> }
        </div>
        <div className='col-span-12 sm:col-span-5 md:col-span-5 lg:col-span-4'>
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.nombre} onChange={(e)=>setData('nombre',e.target.value)}/>	
          { errors.nombre && <p className='text-red-500	'>{ errors.nombre }</p> }
        </div>
        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3">
          <label htmlFor="fechaNac">Fecha Nac.</label>
          <DatePicker fecha={(data.fecha_nacimiento)} setFecha={ (fecha:string) => {setData('fecha_nacimiento',fecha)} }/>
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="dni">Documento</label>
          <InputDni data={String(data.dni)} setData={(data) => setData('dni', data)}/>
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4'>
          <label htmlFor="domicilio">Domicilio</label>
          <Input value={data.domicilio} onChange={(e)=>setData('domicilio',e.target.value)}/>	
          { errors.domicilio && <p className='text-red-500	'>{ errors.domicilio }</p> }
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4'>
          <label htmlFor="email">Email</label>
          <Input type='email' value={data.email} onChange={(e)=>setData('email',e.target.value)}/>	
          { errors.email && <p className='text-red-500	'>{ errors.email }</p> }
        </div>        
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex flex-col'>
          <label className='mr-2'>Inhabilitado</label>
          <Switch checked={data.inhabilitado==0 ? false: true} onCheckedChange={(val) => setData('inhabilitado', val)} />
        </div>
        <div className='col-span-6 sm:col-span-2 md:col-span-2 lg:col-span-2 flex justify-end items-center'>
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

export default function Clientes(){
  //data
  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
  const [textConfir, setTextConfirm] = useState('');
  
  const [modalOpen, setModalOpen]             = useState(false); //modal editar/crear
  const [modalMode, setModalMode]             = useState<'create' | 'edit'>('create');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | undefined>(undefined);
  const [pendingData, setPendingData]         = useState<Cliente | undefined>(undefined);
  const [loading, setLoading]                 = useState(false);
  
  const [openConfirmar, setConfirmar]     = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar] = useState(''); 
  const [clienteCopia, setClienteCopia]   = useState<Cliente>(clienteVacio);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const { clientes } = usePage().props as { clientes?: Cliente[] }; //necesito los props de inertia
  const { resultado, mensaje, cliente_id, timestamp } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    cliente_id?: number;
    timestamp?: number;
  };
  
  /*const [propsActuales, setPropsActuales] = useState<{
    resultado: number | undefined | null;
    mensaje: string | undefined | null | '';
    cliente_id: number | undefined | null;
  }>({ resultado: undefined, mensaje: undefined, cliente_id: undefined });*/
  const [clientesCacheados, setClientesCacheados] = useState<Cliente[]>([]);
  const [ultimoTimestamp, setUltimoTimestamp] = useState<number | null>(null);

  //funciones
  const confirmar = (data: Cliente) => {
    if(data){
      setClienteCopia( JSON.parse(JSON.stringify(data)) );
      const texto : string = data.inhabilitado === 0 ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' la forma de pago?');
      setConfirmar(true);
      setModalMode('edit');
    }
  };
  const inhabilitarHabilitar = () => {
    if (!clienteCopia || !clienteCopia.cliente_id) return;
    setLoading(true);
    router.put(
      route('clientes.toggleEstado', { cliente: clienteCopia.cliente_id }),{},
      {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          setLoading(false);
          setTextConfirmar('');
          setConfirmar(false);
          setClienteCopia(clienteVacio);
        }
      }
    );
  };

  const cancelarInhabilitarHabilitar = () => { 
    setConfirmar(false);
  };

  const openCreate = () => {
    setModalMode('create');
    setSelectedCliente(undefined);
    setModalOpen(true);
  };

  const openEdit = (data: Cliente) => {
    setModalMode('edit');
    setSelectedCliente(data);
    setModalOpen(true);
  };

  const handleSave = (data: Cliente) => {
    setPendingData(data);
    let texto = (modalMode === 'create')? 'grabar' : 'guardar cambios a';
    setTextConfirm('¿Estás seguro de '+texto+' este cliente?');
    setConfirOpen(true);
  };

  const accionar = () => {
    if (!pendingData) return;
    setLoading(true);

    const payload = JSON.parse(JSON.stringify(pendingData));
    
    if (modalMode === 'create') {
      router.post(
        route('clientes.store'), payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoading(false);
            setTextConfirmar('');
            setConfirmar(false);
            setClienteCopia(clienteVacio);
          }
        }
      );
    } else {
      router.put(
        route('clientes.update',{cliente: pendingData.cliente_id}), payload,
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
    if (
      clientes &&
      clientes.length > 0 &&
      JSON.stringify(clientes) !== JSON.stringify(clientesCacheados)
    ) {
      setClientesCacheados(clientes);
    }
  }, [clientes]);


  useEffect(() => {
    const cambioDetectado = timestamp && timestamp !== ultimoTimestamp;

    if (cambioDetectado) {
      setUltimoTimestamp(timestamp);

      const esError = resultado === 0;
      setTitle(esError ? 'Error' : modalMode === 'create' ? 'Cliente nuevo' : 'Cliente modificado');
      setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${cliente_id})`);
      setColor(esError ? 'error' : 'success');
      setActivo(true);

      if (resultado === 1 && cliente_id) {
        setModalOpen(false);
        router.get(route('clientes.index'),
          { cliente_id, buscar: true },
          { preserveScroll: true,	preserveState: true	}
        )
      }
    }
  }, [resultado, mensaje, cliente_id, timestamp, ultimoTimestamp]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Clientes" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm openCreate={openCreate} resetearCliente={setClientesCacheados}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableClientes
            datos={clientesCacheados?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            />
        </div>
      </div>
      <NewEditClientes
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        cliente={selectedCliente}
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
        onClose={() => setActivo(false)}
      />
    </AppLayout>
  );
}