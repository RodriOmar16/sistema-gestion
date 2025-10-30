import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { User } from '@/types/typeCrud';
import { Pen, Ban, Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import DataTableUsers from '@/components/users/dataTableUsers';
import NewEditUser from '../../components/users/newEditUser';
import ModalConfirmar from '@/components/modalConfirmar';
import PdfButton from '@/components/utils/pdf-button';
import ShowMessage from '@/components/utils/showMessage';
import { Select,  SelectContent,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Usuarios', href: '', } ];

type propsForm = {
  openCreate: () => void;
  resetearUser: (ruta:User[]) => void;
}

const userVacio = {
  id: '',
  name: '',
  email: '',
  inhabilitado: false,
}

export function FiltrosForm({ openCreate, resetearUser }: propsForm){
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false);
  const { data, setData, errors, processing } = useForm(userVacio);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetearUser([]);
    const payload = {      ...data, buscar: true    }
    router.get(route('users.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setEsperandoRespuesta(false),
    });
  };
  const handleReset = () => {
    setData(userVacio);
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
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2'>
          <label htmlFor="id">Id</label>
          <Input value={data.id} onChange={(e)=>setData('id',e.target.value)}/>	
          { errors.id && <p className='text-red-500	'>{ errors.id }</p> }
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-4'>
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.name} onChange={(e)=>setData('name',e.target.value)}/>	
          { errors.name && <p className='text-red-500	'>{ errors.name }</p> }
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-4'>
          <label htmlFor="nombre">Email</label>
          <Input value={data.email} onChange={(e)=>setData('email',e.target.value)}/>	
          { errors.email && <p className='text-red-500	'>{ errors.email }</p> }
        </div>
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex flex-col'>
          <label className='mr-2'>Inhabilitado</label>
          <Switch checked={data.inhabilitado} onCheckedChange={(val) => setData('inhabilitado', val)} />
        </div>
        <div className='col-span-6 sm:col-span-8 md:col-span-8 lg:col-span-12 flex justify-end items-center'>
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
          <Button type="submit" title="Buscar" disabled={processing}>
            {processing ? (
              <Loader2 size={20} className="animate-spin mr-2" />
            ) : (
              <Search size={20} className="mr-2" />
            )}
            Buscar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default function Usuarios(){
  //data
  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
  const [textConfir, setTextConfirm] = useState('');
  
  const [modalOpen, setModalOpen]       = useState(false); //modal editar/crear
  const [modalMode, setModalMode]       = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [pendingData, setPendingData]   = useState<User | undefined>(undefined);
  const [loading, setLoading]           = useState(false);
  
  const [openConfirmar, setConfirmar]     = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar] = useState(''); 
  const [userCopia, setUserCopia]         = useState<User>(userVacio);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const { users } = usePage().props as { users?: User[] }; //necesito los props de inertia
  const { resultado, mensaje, id } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    id?: number;
  };
  const [propsActuales, setPropsActuales] = useState<{
    resultado: number | undefined | null;
    mensaje: string | undefined | null | '';
    id: number | undefined | null;
  }>({ resultado: undefined, mensaje: undefined, id: undefined });
  const [usersCacheados, setUsersCacheados] = useState<User[]>([]);

  //funciones
  const confirmar = (data: User) => {
    if(data){
      setUserCopia( JSON.parse(JSON.stringify(data)) );
      const texto : string = data.inhabilitado === 0 ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' este usuario?');
      setConfirmar(true);
    }
  };
  const inhabilitarHabilitar = () => {
    if (!userCopia || !userCopia.id) return;
    setLoading(true);
    router.put(
      route('users.toggleEstado', { user: userCopia.id }),{},
      {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          setLoading(false);
          setTextConfirmar('');
          setConfirmar(false);
          setUserCopia(userVacio);
        }
      }
    );
  };

  const cancelarInhabilitarHabilitar = () => { 
    setConfirmar(false);
  };

  const openCreate = () => {
    setModalMode('create');
    setSelectedUser(undefined);
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleSave = (data: User) => {
    setPendingData(data);
    if (modalMode === 'create') {
      setTextConfirm('¿Estás seguro de grabar este usuario?');
    } else {
      setTextConfirm('¿Estás seguro de guardar cambios a este usuario?');
    }
    setConfirOpen(true);
  };

  const accionar = () => {
    if (!pendingData) return;
    setLoading(true);

    const payload = JSON.parse(JSON.stringify(pendingData));

    if (modalMode === 'create') {
      router.post(
        route('users.store'), payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoading(false);
            setTextConfirmar('');
            setConfirmar(false);
            setUserCopia(userVacio);
          }
        }
      );
    } else {
      router.put(
        route('users.update',{user: pendingData.id}), payload,
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
    if (!activo && propsActuales.resultado !== undefined) {
      setPropsActuales({
        resultado: undefined,
        mensaje: undefined,
        id: undefined
      });
    }
  }, [activo]);

  useEffect(() => {
    if (
      users &&
      users.length > 0 &&
      JSON.stringify(users) !== JSON.stringify(usersCacheados)
    ) {
      setUsersCacheados(users);
    }
  }, [users]);


  useEffect(() => {
    const cambioDetectado =
      (resultado && resultado  !== propsActuales.resultado)  ||
      (mensaje && mensaje    !== propsActuales.mensaje)

    if (cambioDetectado) {
      setPropsActuales({ resultado, mensaje, id });

      const esError = resultado === 0;
      setTitle(esError ? 'Error' : modalMode === 'create' ? 'Usuario nuevo' : 'Usuario modificado');
      setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${id})`);
      setColor(esError ? 'error' : 'success');
      setActivo(true);

      if (resultado === 1 && id) {
        setModalOpen(false);
        router.get(route('users.index'),
          { id, buscar: true },
          { preserveScroll: true,	preserveState: true	}
        )
      }
    }
  }, [resultado, mensaje, id]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Usuarios" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm openCreate={openCreate} resetearUser={setUsersCacheados}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableUsers
            datos={usersCacheados?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            />
        </div>
      </div>
      <NewEditUser
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        user={selectedUser}
        onSubmit={handleSave}
        loading={loading}
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