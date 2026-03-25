import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Autocomplete, Permiso } from '@/types/typeCrud';
import { Search, Brush, Loader2, CirclePlus, Filter, FolderKanban } from 'lucide-react';
import ModalConfirmar from '@/components/modalConfirmar';
import ShowMessage from '@/components/utils/showMessage';
import { apiRequest, convertirFechaBarrasGuiones, getCsrfToken } from '@/utils';
import Loading from '@/components/utils/loadingDialog';
import NewEditPermiso from '@/components/permisos/NewEditPermiso';
import DataTablePermisos from '@/components/permisos/DataTablePermisos';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Permisos', href: '', } ];

type propsForm = {
  openCreate:   () => void;
}

const permisoVacio = {
  permiso_id:   '',
  clave:        '',
  descripcion:  '',
  inhabilitado: 0
};

export function FiltrosForm({ openCreate }: propsForm){
  const { data, setData, errors, processing } = useForm<Permiso>(permisoVacio);
  const [load, setLoad]                       = useState(false);
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoad(true);
    const payload = {
      ...data,
      buscar: true    
    }
    
    router.get(route('permisos.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setLoad(false),
    });
  };

  const handleReset = () => {
    setData(permisoVacio);
  };

  return (
    <div>
      <div className='flex items-center justify-between px-3 pt-3'>
        <div className='flex'> <Filter size={20} />  Filtros</div>
        <div>
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
      </div>
      <form className='grid grid-cols-12 gap-4 px-4 pt-1 pb-4' onSubmit={handleSubmit}>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-1'>
          <label htmlFor="id">Id</label>
          <Input className='text-right' value={data.permiso_id} onChange={(e)=>setData('permiso_id',Number(e.target.value))}/>	
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          Clave
          <Input value={data.clave} onChange={(e)=>setData('clave', e.target.value)}/>	
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          Descripción
          <Input value={data.descripcion} onChange={(e)=>setData('descripcion',e.target.value)}/>	
        </div>
        <div className='col-span-6 sm:col-span-6 md:col-span-6 lg:col-span-2 flex flex-col'>
          <label className='mr-2'>Inhabilitado</label>
          <Switch checked={data.inhabilitado==0 ? false: true} onCheckedChange={(val) => setData({...data, inhabilitado: val})} />
        </div>
        <div className='col-span-6 sm:col-span-6 md:col-span-6 lg:col-span-3 flex justify-end items-center'>
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

export default function Permisos(){
  //data
  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
  const [textConfir, setTextConfirm] = useState('');
  
  const [modalOpen, setModalOpen]             = useState(false); //modal editar/crear
  const [modalMode, setModalMode]             = useState<'create' | 'edit'>('create');
  const [selectedPermiso, setSelectedPermiso] = useState<Permiso | undefined>(undefined);
  const [pendingData, setPendingData]         = useState<Permiso | undefined>(undefined);
  const [loading, setLoading]                 = useState(false);
  
  const [openConfirmar, setConfirmar]     = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar] = useState(''); 
  const [permisoCopia, setPermisoCopia]   = useState<Permiso>(permisoVacio);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const { permisos } = usePage().props as { permisos?: Permiso[] }; //necesito los props de inertia
  const { resultado, mensaje, permiso_id, timestamp } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    permiso_id?: number;
    timestamp?: number;
  };
  const [cacheados, setCacheados]      = useState<Permiso[]>([]);
  const [respuesta, setResp]           = useState<{resultado: number, permiso_id: number}>({resultado: 0, permiso_id: 0});

  //funciones
  const confirmar = (data: Permiso) => {
    if(data){
      setPermisoCopia( JSON.parse(JSON.stringify(data)) );
      setTextConfirmar('Estás seguro de querer inhabilitar este permiso?');
      setConfirmar(true);
      setModalMode('edit');
    }
  };
  const inhabilitarHabilitar = async () => {
    if (!permisoCopia || !permisoCopia.permiso_id) return;
    setLoading(true);

    try {
      let resp : {resultado: number, permiso_id: number, mensaje?:string} ;

      resp = await apiRequest(route('permisos.toggleEstado',{ permiso: permisoCopia.permiso_id }), 'PUT');

      setResp({ resultado: resp.resultado, permiso_id: resp.permiso_id });

      if (resp.resultado === 0) {
        setTitle('Error');
        setText(resp.mensaje ?? 'Error inesperado');
        setColor('error');
        setActivo(true);
        return;
      }

      setTitle('Estado modificado');
      setText(`${resp.mensaje} (ID: ${resp.permiso_id})`);
      setColor('success');
      setActivo(true);

    } catch (error: any) {
      setTitle('Error de red');
      setText(error.message);
      setColor('error');
      setActivo(true);
    } finally {
      setLoading(false);
      setPermisoCopia(permisoVacio);
      setTextConfirmar('');
      setConfirmar(false);
    }
  };

  const cancelarInhabilitarHabilitar = () => { 
    setConfirmar(false);
  };

  const openCreate = () => {
    setModalMode('create');
    setSelectedPermiso(undefined);
    setModalOpen(true);
  };

  const openEdit = (data: Permiso) => {
    setModalMode('edit');
    setSelectedPermiso(data);
    setModalOpen(true);
  };

  const handleSave = (data: Permiso) => {
    setPendingData(data);
    let texto = (modalMode === 'create')? 'grabar' : 'guardar cambios a';
    setTextConfirm('¿Estás seguro de '+texto+' este permiso?');
    setConfirOpen(true);
  };

  const accionar = async () => {
    if (!pendingData) return;
    setConfirOpen(false);
    setLoading(true);

    const payload = { ...pendingData };
    console.log("payload: ", payload)
    try {
      let resp : {resultado: number, permiso_id: number, mensaje?:string} ;
      let titulo;

      if (modalMode === 'create') {
        resp = await apiRequest(route('permisos.store'), 'POST', payload);
        titulo = 'Permiso nuevo';
      } else {
        resp = await apiRequest(route('permisos.update', { permiso: pendingData.permiso_id }), 'PUT', payload);
        titulo = 'Permiso modificado';
      }

      setResp({ resultado: resp.resultado, permiso_id: resp.permiso_id });

      if (resp.resultado === 0) {
        setTitle('Error');
        setText(resp.mensaje ?? 'Error inesperado');
        setColor('error');
        setActivo(true);
        return;
      }

      setTitle(titulo);
      setText(`${resp.mensaje} (${resp.permiso_id})`);
      setColor('success');
      setActivo(true);
    } catch (error: any) {
      setTitle('Error de red');
      setText(error.message);
      setColor('error');
      setActivo(true);
    } finally {
      setLoading(false);
    }
  };

  const cancelarConfirmacion = () => {
    setConfirOpen(false);
  };

  //effect
  useEffect(() => {
    if (permisos && permisos?.length > 0) {
      setCacheados(permisos);
    } else {
      setCacheados([]);
    }
  }, [permisos]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Permisos" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm 
            openCreate={openCreate}
          />
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTablePermisos
            datos={cacheados??[]}
            openEdit={openEdit}
            abrirConfirmar={confirmar}
          />
        </div>
      </div>
      <NewEditPermiso
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        permiso={selectedPermiso}
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
          if (respuesta.resultado === 1 && respuesta.permiso_id) {
            setModalOpen(false);
            router.get(route('permisos.index'),
              { permiso_id:respuesta.permiso_id, buscar: true },
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