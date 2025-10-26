import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Rol } from '@/types/typeCrud';
import { Pen, Ban, Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import { DataTableRoles } from '@/components/roles/dataTableRoles';
//import NewEditDialog from '../../components/roles/newEditRoles';
import NewEditRol from '@/components/roles/newEditarRoles';
import ModalConfirmar from '@/components/modalConfirmar';
import PdfButton from '@/components/utils/pdfButton';
import ShowMessage from '@/components/utils/showMessage';
//import { DataTableProjects } from '@/components/projects/dataTableProjects';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Roles', href: '', } ];

type propsForm = {
  openCreate: () => void;
  resetearRol: (rol:Rol[]) => void;
}

const rolVacio = {
  rol_id: '',
  nombre: '',
  inhabilitado: false
}

export function FiltrosForm({ openCreate,resetearRol }: propsForm){
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false);
  const { data, setData, errors, processing } = useForm(rolVacio);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
		resetearRol([]);
    const payload = {      ...data, buscar: true    }
    router.get(route('roles.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setEsperandoRespuesta(false),
    });
  };
  const handleReset = () => {
		setData({
			rol_id: '',
      nombre: '',
      inhabilitado: false,
		});
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
					<Input value={data.rol_id} onChange={(e)=>setData('rol_id',e.target.value)}/>	
					{ errors.rol_id && <p className='text-red-500	'>{ errors.rol_id }</p> }
				</div>
				<div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-4'>
					<label htmlFor="nombre">Nombre</label>
					<Input value={data.nombre} onChange={(e)=>setData('nombre',e.target.value)}/>	
					{ errors.nombre && <p className='text-red-500	'>{ errors.nombre }</p> }
				</div>
				<div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex items-center'>
					<label className='mr-2'>Inhabilitado</label>
          <Switch checked={data.inhabilitado} onCheckedChange={(val) => setData('inhabilitado', val)} />
				</div>
				<div className='col-span-6 sm:col-span-12 md:col-span-12 lg:col-span-4 flex justify-end items-center'>
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

export default function Roles(){
  //data
  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
	const [textConfir, setTextConfirm] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false); //modal editar/crear
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedRol, setSelectedRol] = useState<Rol | undefined>(undefined);
  const [pendingData, setPendingData] = useState<any | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  
  const [openConfirmar, setConfirmar]     = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar] = useState(''); 
  //const rutaVacia = {      ruta_id: '',      url: '',      inhabilitada: false,      created_at: '',      updated_at: ''    }
  const [rolCopia, setRolCopia]   = useState<Rol>(rolVacio);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const { roles } = usePage().props as { roles?: Rol[] }; //necesito los props de inertia
  const { resultado, mensaje, rol_id } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    rol_id?: number;
  };
  const [propsActuales, setPropsActuales] = useState<{
    resultado: number | undefined | null;
    mensaje: string | undefined | null | '';
    rol_id: number | undefined | null;
  }>({ resultado: undefined, mensaje: undefined, rol_id: undefined });
  const [rolesCacheados, setRolesCacheados] = useState<Rol[]>([]);

  //funciones
  const confirmar = (data: Rol) => {
    if(data){
      setRolCopia( JSON.parse(JSON.stringify(data)) );
      const texto : string = data.inhabilitado === 0 ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' este rol?');
      setConfirmar(true);
    }
  };
  const inhabilitarHabilitar = () => {
    if (!rolCopia || !rolCopia.rol_id) return;
    setLoading(true);
    router.put(
      route('roles.toggleEstado', { rol: rolCopia.rol_id }),{},
      {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          setLoading(false);
          setTextConfirmar('');
          setConfirmar(false);
          setRolCopia(rolVacio);
        }
      }
    );
  };

  const cancelarInhabilitarHabilitar = () => { 
    setConfirmar(false);
  };

  const openCreate = () => {
    setModalMode('create');
    setSelectedRol(undefined);
    setModalOpen(true);
  };

  const openEdit = (data: Rol) => {
    setModalMode('edit');
    setSelectedRol(data);
    setModalOpen(true);
  };

  const handleSave = (data: any) => {
    return console.log("data: ",data)
    setPendingData(data);
    if (modalMode === 'create') {
      setTextConfirm('¿Estás seguro de grabar este rol?');
    } else {
      setTextConfirm('¿Estás seguro de guardar cambios a este rol?');
    }
    setConfirOpen(true);
  };

  const accionar = () => {
    if (!pendingData) return;
    setLoading(true);

    const payload = JSON.parse(JSON.stringify(pendingData));

    if (modalMode === 'create') {
      router.post(
        route('roles.store'),payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoading(false);
            setTextConfirmar('');
            setConfirmar(false);
            setRolCopia(rolVacio);
          }
        }
      );
    } else {
      router.put(
        route('roles.update',{ruta: pendingData.rol_id}),
        payload,
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
				rol_id: undefined
			});
		}
	}, [activo]);

  useEffect(() => {
		if (
			roles &&
			roles.length > 0 &&
			JSON.stringify(roles) !== JSON.stringify(rolesCacheados)
		) {
			setRolesCacheados(roles);
		}
	}, [roles]);


	useEffect(() => {
		const cambioDetectado =
			(resultado && resultado  !== propsActuales.resultado)  ||
			(mensaje && mensaje    !== propsActuales.mensaje)    /*||
			project_id !== propsActuales.project_id;*/

		if (cambioDetectado) {
			setPropsActuales({ resultado, mensaje, rol_id });

			const esError = resultado === 0;
			setTitle(esError ? 'Error' : modalMode === 'create' ? 'Rol nuevo' : 'Rol modificado');
			setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${rol_id})`);
			setColor(esError ? 'error' : 'success');
			setActivo(true);

			if (resultado === 1 && rol_id) {
				setModalOpen(false);
        router.get(route('roles.index'),
					{ rol_id, buscar: true },
					{ preserveScroll: true,	preserveState: true	}
				)
			}
		}
	}, [resultado, mensaje, rol_id]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Roles" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm openCreate={openCreate} resetearRol={setRolesCacheados}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableRoles 
            datos={rolesCacheados?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            />
        </div>
      </div>
      <NewEditRol
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        rol={selectedRol}
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