import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { User, AuthProps } from '@/types/typeCrud';
import { Pen, Ban, Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import DataTableUsers from '@/components/users/dataTableUsers';
import NewEditUser from '../../components/users/newEditUser';
import ModalConfirmar from '@/components/modalConfirmar';
import PdfButton from '@/components/utils/pdf-button';
import ShowMessage from '@/components/utils/showMessage';
import { Select,  SelectContent,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { route } from 'ziggy-js';
import Loading from '@/components/utils/loadingDialog';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Usuarios', href: '', } ];

type propsForm = {
  data: User;
  set: (e:any) => void;
  openCreate: () => void;
  resetearUser: (ruta:User[]) => void;
  permiso: boolean;
}

const userVacio = {
  id: '',
  name: '',
  email: '',
  inhabilitado: false,
}

export function FiltrosForm({ data, set, openCreate, resetearUser, permiso }: propsForm){
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetearUser([]);
    const payload = {      ...data, buscar: true    }
    router.get(route('users.index'), payload, {
      preserveState: true,
      preserveScroll: true,
    });
  };
  const handleReset = () => {
    set(userVacio);
  };

  return (
    <div>
      <div className='flex items-center justify-between px-3 pt-3'>
        <div className='flex'> <Filter size={20} />  Filtros</div>
        { permiso && (
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
          )
        }
      </div>
      <form className='grid grid-cols-12 gap-4 px-4 pt-1 pb-4' onSubmit={handleSubmit}>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2'>
          <label htmlFor="id">Id</label>
          <Input value={data.id} onChange={(e)=>set({...data, 'id': e.target.value})}/>	
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-4'>
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.name} onChange={(e)=>set({...data, 'name': e.target.value})}/>	
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-4'>
          <label htmlFor="nombre">Email</label>
          <Input value={data.email} onChange={(e)=>set({...data, 'email': e.target.value})}/>	
        </div>
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex flex-col'>
          <label className='mr-2'>Inhabilitado</label>
          <Switch checked={Boolean(data.inhabilitado)} onCheckedChange={(val) => set({...data, 'inhabilitado': val})} />
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
  const { data, setData, errors, processing } = useForm(userVacio);

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

  const { auth } = usePage<{auth: AuthProps}>().props;
  //const { users } = usePage().props as { users?: User[] }; //necesito los props de inertia
  const { users } = usePage().props as {
    users?:{
      data: User[],
      current_page:  number, 
      last_page:     number, 
      total:         number,
      next_page_url: string,
      prev_page_url: string,
    }
  };

  /*const { resultado, mensaje, id, timestamp } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    id?: number;
    timestamp?: number;
  };

  const [ultimoTimestamp, setUltimoTimestamp] = useState<number | null>(null);*/
  const [cacheados, setCacheados] = useState<User[]>([]);
  const [permisoGestionar, setPermisoGestionar] = useState(false);


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
        onError: (errors) => {
          // errors es un objeto { campo: "mensaje de error" }
          setTitle("Error en cambio de estado");
          setText(Object.values(errors).join("\n"));
          setColor("error");
          setActivo(true);
        },
        onSuccess: (page) => {
          const { resultado, mensaje, id } = page.props;
          
          if(resultado === 0){
            setTitle("Error inesperado");
            setText(`${mensaje} ❌ (ID: ${id})`);
            setColor("error");
            setActivo(true);
          }

          setTitle("Usuario actualizado");
          setText(`${mensaje} ✅ (ID: ${id})`);
          setColor("success");
          setActivo(true);
        },
        onFinish: () => {
          setLoading(false);
          setTextConfirmar('');
          setConfirmar(false);
          setUserCopia(userVacio);
  
          //al momento de buscar
          setData(userVacio);
          router.get(
            route('users.index'), 
            {}, {
              preserveScroll: true,
              preserveState: true,
            }
          );
        }
      }
    );
    /*router.put(
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
    );*/
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

  const manejarError = (titulo: string) => (errors: any) => {
    console.log("Errores:", errors);
    setTitle(titulo);
    setText(Object.values(errors).join("\n"));
    setColor("error");
    setActivo(true);
  };
  const manejarExito = (titulo: string) => (page: any) => {
    const { resultado, mensaje, id } = page.props;
    const title = resultado === 0 ? 'Error inesperado': titulo ;

    if(resultado === 0){
      setTitle(title);
      setText(mensaje);
      setColor("error");
      setActivo(true);
      return;
    }

    setTitle(title);
    setText(`${mensaje} ✅ (ID: ${id})`);
    setColor("success");
    setActivo(true);

    setModalOpen(false);
  };
  const finalizarAccion = () => {
    setLoading(false);
    setPendingData(userVacio);
    setData(userVacio);
    router.get(route("users.index"), {}, {
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
    }*/
    const payload = { ...pendingData };

		if (modalMode === 'create') {
			router.post(route('users.store'), payload, {
				preserveScroll: true,
				preserveState: true,
				onError:   manejarError("Error al crear el usuario"),
				onSuccess: manejarExito("Usuario creado"),
				onFinish:  finalizarAccion,
			});
		} else {
			router.put(route('users.update',{user: pendingData.id}), payload, {
				preserveScroll: true,
				preserveState: true,
				onError:   manejarError("Error al modificar el usuario"),
				onSuccess: manejarExito("Usuario actualizado"),
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
    if ( users && users.data.length > 0 ) {
      setCacheados(users.data);
    }else{
      setCacheados([]);
    }
  }, [users]);

  useEffect(() => {
    const aux = auth?.permisos.filter((e:any) => e === 'gestionar_usuarios');
    setPermisoGestionar(aux.length != 0);
  } , [auth]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Usuarios" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm
            data={data}
            set={setData}
            openCreate={openCreate} 
            resetearUser={setCacheados}
            permiso={permisoGestionar}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableUsers
            datos={cacheados?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            permiso={permisoGestionar}
            totalFilas={users?.total ?? 0}
            current_page={users?.current_page ?? 0}
            last_page={users?.last_page ?? 0}
            next_page_url={users?.next_page_url ?? ''}
            prev_page_url={users?.prev_page_url ?? ''}
          />
        </div>
      </div>
      <NewEditUser
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        user={selectedUser}
        onSubmit={handleSave}
        permiso={permisoGestionar}
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