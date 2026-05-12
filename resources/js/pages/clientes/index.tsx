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
import Loading from '@/components/utils/loadingDialog';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Clientes', href: '', } ];

type propsForm = {
  data: Cliente;
  set: (e:any) => void;
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

export function FiltrosForm({ data, set, openCreate, resetearCliente }: propsForm){
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false);
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
    set(clienteVacio);
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
          <Input className='text-right' value={data.cliente_id} onChange={(e)=>set({...data, 'cliente_id': Number(e.target.value)})}/>	
        </div>
        <div className='col-span-12 sm:col-span-5 md:col-span-5 lg:col-span-4'>
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.nombre} onChange={(e)=>set({...data, 'nombre': e.target.value})}/>	
        </div>
        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3">
          <label htmlFor="fechaNac">Fecha Nac.</label>
          <DatePicker fecha={(data.fecha_nacimiento)} setFecha={ (fecha:string) => {set({...data, 'fecha_nacimiento': fecha})} }/>
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="dni">Documento</label>
          <InputDni data={String(data.dni)} setData={(dato) => set({...data, 'dni': dato})}/>
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4'>
          <label htmlFor="domicilio">Domicilio</label>
          <Input value={data.domicilio} onChange={(e)=>set({...data, 'domicilio': e.target.value})}/>	
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4'>
          <label htmlFor="email">Email</label>
          <Input type='email' value={data.email} onChange={(e)=>set({...data, 'email': e.target.value})}/>	
        </div>        
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex flex-col'>
          <label className='mr-2'>Inhabilitado</label>
          <Switch checked={data.inhabilitado==0 ? false: true} onCheckedChange={(val) => set({...data, 'inhabilitado': val})} />
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
  const { data, setData, errors, processing }       = useForm<Cliente>(clienteVacio);

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

  //const { clientes } = usePage().props as { clientes?: Cliente[] }; //necesito los props de inertia
  const { clientes } = usePage().props as {
    clientes?: {
      data: Cliente[],
      current_page:  number, 
      last_page:     number, 
      total:         number,
      next_page_url: string,
      prev_page_url: string,
    }
  };

  const [cacheados, setCacheados] = useState<Cliente[]>([]);

  //funciones
  const confirmar = (data: Cliente) => {
    if(data){
      setClienteCopia( JSON.parse(JSON.stringify(data)) );
      const texto : string = data.inhabilitado === 0 ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' el cliente?');
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
        onError: (errors) => {
          // errors es un objeto { campo: "mensaje de error" }
          setTitle("Error en cambio de estado");
          setText(Object.values(errors).join("\n"));
          setColor("error");
          setActivo(true);
        },
        onSuccess: (page) => {
          const { resultado, mensaje, cliente_id } = page.props;
          
          if(resultado === 0){
            setTitle("Error inesperado");
            setText(`${mensaje} ❌ (ID: ${cliente_id})`);
            setColor("error");
            setActivo(true);
          }

          setTitle("Cliente actualizado");
          setText(`${mensaje} ✅ (ID: ${cliente_id})`);
          setColor("success");
          setActivo(true);
        },
        onFinish: () => {
          setLoading(false);
          setTextConfirmar('');
          setConfirmar(false);
          setClienteCopia(clienteCopia);
  
          //al momento de buscar
          setData(clienteCopia);
          router.get(
            route('clientes.index'), 
            {}, {
              preserveScroll: true,
              preserveState: true,
            }
          );
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

  const manejarError = (titulo: string) => (errors: any) => {
    console.log("Errores:", errors);
    setTitle(titulo);
    setText(Object.values(errors).join("\n"));
    setColor("error");
    setActivo(true);
  };
  const manejarExito = (titulo: string) => (page: any) => {
    const { resultado, mensaje, cliente_id } = page.props;
    const title = resultado === 0 ? 'Error inesperado': titulo ;

    if(resultado === 0){
      setTitle(title);
      setText(mensaje);
      setColor("error");
      setActivo(true);
      return;
    }

    setTitle(title);
    setText(`${mensaje} ✅ (ID: ${cliente_id})`);
    setColor("success");
    setActivo(true);

    setModalOpen(false);
  };
  const finalizarAccion = () => {
    setLoading(false);
    setPendingData(clienteVacio);
    setData(clienteVacio);
    router.get(route("clientes.index"), {}, {
      preserveScroll: true,
      preserveState: true,
    });
  };

  const accionar = () => {
    if (!pendingData) return;
    setLoading(true);

    /*const payload = JSON.parse(JSON.stringify(pendingData));
    
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
    }*/
   const payload = { ...pendingData };

		if (modalMode === 'create') {
			router.post(route('clientes.store'), payload, {
				preserveScroll: true,
				preserveState: true,
				onError:   manejarError("Error al crear el cliente"),
				onSuccess: manejarExito("Cliente creada"),
				onFinish:  finalizarAccion,
			});
		} else {
			router.put(route('clientes.update',{cliente: pendingData.cliente_id}), payload, {
				preserveScroll: true,
				preserveState: true,
				onError:   manejarError("Error al modificar el cliente"),
				onSuccess: manejarExito("Cliente actualizado"),
				onFinish:  finalizarAccion,
			});
		}
    setTextConfirm('');
    setConfirOpen(false);
  };

  const cancelarConfirmacion = () => {
    setConfirOpen(false);
  };

  //effect
  useEffect(() => {
    if ( clientes && clientes.data.length > 0 ) {
      setCacheados(clientes.data);
    }else{
      setCacheados([]);
    }
  }, [clientes]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Clientes" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm 
            data={data}
            set={setData}
            openCreate={openCreate} 
            resetearCliente={setCacheados}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableClientes
            datos={cacheados?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            totalFilas={clientes?.total ?? 0}
            current_page={clientes?.current_page ?? 0}
            last_page={clientes?.last_page ?? 0}
            next_page_url={clientes?.next_page_url ?? ''}
            prev_page_url={clientes?.prev_page_url ?? ''}
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
      <Loading
        open={loading}
        onClose={() => {}}
      />
    </AppLayout>
  );
}