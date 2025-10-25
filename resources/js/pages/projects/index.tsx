import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pen, Ban, Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import NewEditDialog from '../../components/projects/newEdit';
import ModalConfirmar from '@/components/modalConfirmar';
//import PdfButton from '@/components/utils/pdfButton';
import ShowMessage from '@/components/utils/showMessage';
import { DataTableProjects } from '@/components/projects/dataTableProjects';
import { Select,  SelectContent,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { route } from 'ziggy-js';

/*import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader,  TableRow,
} from "@/components/ui/table";*/

//nombre en el Layout principal, no quitar
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Proyectos',
    href: '/projects',
  },
];

type propsForm = {
	openCreate: () => void;
	resetearProject: (projects:Project[]) => void;
}

export const FormProyectos = ({ openCreate,resetearProject }: propsForm) => {
	const [loading, setLoading] = useState(false);

	const { filters } = usePage().props as { filters?: { id: string; name: string; descripcion: string, inhabilitado: boolean|string } };

	const { data, setData, get, processing, errors } = useForm<{
		id: string;
		name: string;
		descripcion: string;
		inhabilitado: string | boolean;
	}>({
		id: filters?.id || '',
		name: filters?.name || '',
		descripcion: filters?.descripcion || '',
		inhabilitado: filters?.inhabilitado ?? '',
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		resetearProject([]); //
		router.get(route('projects.index'), {
			id: data.id,
			name: data.name,
			descripcion: data.descripcion,
			inhabilitado: data.inhabilitado,
			buscar: true
		}, {
			preserveState: true,
			preserveScroll: true,
			onFinish: () => setLoading(false),
		});

		/*router.get('/projects', {
			id: data.id,
			name: data.name,
			descripcion: data.descripcion,
			inhabilitado: data.inhabilitado,
			buscar: true
		}, {
			preserveState: true,
			preserveScroll: true,
			onFinish: () => setLoading(false),
		});*/
	};

	const handleReset = () => {
		setData({
			id: '',
			name: '',
			descripcion: '',
			inhabilitado: ''
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
					<Input value={data.id} onChange={(e)=>setData('id',e.target.value)}/>	
					{ errors.id && <p className='text-red-500	'>{ errors.id }</p> }
				</div>
				<div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
					<label htmlFor="nombre">Nombre</label>
					<Input value={data.name} onChange={(e)=>setData('name',e.target.value)}/>	
					{ errors.name && <p className='text-red-500	'>{ errors.name }</p> }
				</div>
				<div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
					<label htmlFor="descripcion">Descripción</label>
					<Input value={data.descripcion} onChange={(e)=>setData('descripcion',e.target.value)}/>	
					{ errors.descripcion && <p className='text-red-500	'>{ errors.descripcion }</p> }
				</div>
				<div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2'>
					<label htmlFor="estado">Estado</label>
					<Select
						value={data.inhabilitado === '' ? 'all' : String(!data.inhabilitado)}
						onValueChange={(value) => {
							if (value === 'all') {
								setData('inhabilitado', '');
							} else {
								setData('inhabilitado', value === 'true' ? false : true);
							}
						}}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Seleccionar estado" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="true">Habilitado</SelectItem>
							<SelectItem value="false">Inhabilitado</SelectItem>
							<SelectItem value="all">Todos</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className='col-span-6 sm:col-span-8 md:col-span-8 lg:col-span-2 flex justify-end items-center'>
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
						{loading ? (
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

/*export function TablaProjects({ openEdit }: { openEdit: (project: Project) => void }) {
	const projectVacio = {
		id: '',
		name: '',
		descripcion: '',
		inhabilitado: false,
		created_at: '',
		updated_at: ''
	}

  const { projects } = usePage().props as { projects?: { data: Project[] } };
	const [openConfirmar, setConfirmar]     = useState(false);
	const [textConfirmar, setTextConfirmar] = useState(''); 
	const [projectCopia, setProjectCopia]   = useState<Project>(projectVacio);

	const confirmar = (project: Project) => {
		if(project){
			setProjectCopia( JSON.parse(JSON.stringify(project)) );
			const texto : string = project.inhabilitado === 0 ? 'inhabilitar': 'habilitar';
			setTextConfirmar('Estás seguro de querer '+texto+' este proyecto?');
			setConfirmar(true);
		}
	};

	const inhabilitarHabilitar = () => {
		if (!projectCopia || !projectCopia.id) return;

		router.put(`/projects/${projectCopia.id}/estado`, {}, {
			preserveScroll: true,
			onFinish: () => {
				setProjectCopia(projectVacio);
				setTextConfirmar('');
				setConfirmar(false);
			}
		});
	};

	const cancelarConfirmacion = () => { 
		setConfirmar(false);
	};

  return (
    <div>
			<div className='pb-2'>
				<PdfButton
					deshabilitado={projects?.data?.length==0}
				/>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[80px]">ID</TableHead>
						<TableHead>Nombre</TableHead>
						<TableHead>Descripción</TableHead>
						<TableHead>Creado</TableHead>
						<TableHead>Actualizado</TableHead>
						<TableHead>Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{projects?.data?.length ? (
							projects.data.map((project) => (
								<TableRow key={project.id}>
									<TableCell className="font-medium">{project.id}</TableCell>
									<TableCell>{project.name}</TableCell>
									<TableCell>{project.descripcion}</TableCell>
									<TableCell>{project.created_at}</TableCell>
									<TableCell>{project.updated_at}</TableCell>
									<TableCell>
										<div className='flex'>
											{
												project?.inhabilitado === 0 ? (
													<>
														<Button 
															className="p-0 hover:bg-transparent cursor-pointer"
															title="Editar" 
															variant="ghost" 
															size="icon" 
															onClick={() => openEdit(project)}>
															<Pen size={20} className="text-orange-500" />
														</Button>
														<Button 
															className="p-0 hover:bg-transparent cursor-pointer"
															title="Inhabilitar" 
															variant="ghost" 
															size="icon"
															onClick={ () => confirmar(project) }>
															<Ban size={20} className="text-red-500" />
														</Button>
													</>
												) : (
													<>
														<Button 
															className="p-0 hover:bg-transparent cursor-pointer"
															title="Habilitar" 
															variant="ghost" 
															size="icon"
															onClick={ () => confirmar(project) }
														>
															<Check size={20} className='text-green-600'/>
														</Button>
													</>
												)
											}
										</div>
									</TableCell>
								</TableRow>
							))
					): ( 
							<TableRow>
								<TableCell colSpan={6} className="text-center text-muted-foreground">
									No hay resultados. Usá el formulario para buscar.
								</TableCell>
							</TableRow>
						)
					}
				</TableBody>
				<TableFooter>
					<TableRow>
						{/* Podés agregar resumen o totales si lo necesitás }
					</TableRow>
				</TableFooter>
			</Table>
			<ModalConfirmar
				open={openConfirmar}
				text={textConfirmar}
				onSubmit={inhabilitarHabilitar}
				onCancel={cancelarConfirmacion}
			/>
		</div>
  );
}*/

export default function Projects() {
	//para guardar la data del modal mientras se abre el modal de confirmar
	const [pendingData, setPendingData] = useState<Project | undefined>(undefined);

	//controla cuando se abre el modal de confirmar y el texto que se quiera mostrar
	const [confirmOpen, setConfirOpen] = useState(false);
	const [textConfir, setTextConfirm] = useState('');

	//controla el modal newEdit y los datos que recibe para mostrarlos
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
	const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);

	//para dar la apariencia de loading
	const [loading, setLoading] = useState(false);

	//necesito los projects de inertia
	const { projects } = usePage().props as { projects?: Project[] };
	const { resultado, mensaje, project_id } = usePage().props as {
		resultado?: number;
		mensaje?: string;
		project_id?: number;
	};
	const [propsActuales, setPropsActuales] = useState<{
		resultado: number | undefined | null;
		mensaje: string | undefined | null | '';
		project_id: number | undefined | null;
	}>({ resultado: undefined, mensaje: undefined, project_id: undefined });
	
	const [proyectosCacheados, setProyectosCacheados] = useState<Project[]>([]);

	//para editar
	const projectVacio = {
		id: '',
		name: '',
		descripcion: '',
		inhabilitado: false,
		created_at: '',
		updated_at: ''
	}
	const [openConfirmar, setConfirmar]     = useState(false);
	const [textConfirmar, setTextConfirmar] = useState(''); 
	const [projectCopia, setProjectCopia]   = useState<Project>(projectVacio);

	//ShowMessage
	const [activo, setActivo] = useState(false);
	const [text, setText]     = useState('');
	const [title, setTitle]   = useState('');
	const [color, setColor]   = useState('');

	//Functions
	const confirmar = (project: Project) => {
		if(project){
			setProjectCopia( JSON.parse(JSON.stringify(project)) );
			const texto : string = project.inhabilitado === 0 ? 'inhabilitar': 'habilitar';
			setTextConfirmar('Estás seguro de querer '+texto+' este proyecto?');
			setConfirmar(true);
		}
	};
	const inhabilitarHabilitar = () => {
		if (!projectCopia || !projectCopia.id) return;
		setLoading(true);

		/*router.put(`/projects/${projectCopia.id}/estado`, {}, {
			preserveScroll: true,
			preserveState: true,
			onFinish: () => {
				setLoading(false);
				setTextConfirmar('');
				setConfirmar(false);
				setProjectCopia(projectVacio);
			}
		});*/
		router.put(
			route('projects.toggleEstado', { project: projectCopia.id }),
			{ /*nhabilitado: projectCopia.inhabilitado*/ },
			{
				preserveScroll: true,
				preserveState: true,
				onFinish: () => {
					setLoading(false);
					setTextConfirmar('');
					setConfirmar(false);
					setProjectCopia(projectVacio);
				}
			}
		);
	};

	const cancelarInhabilitarHabilitar = () => { 
		setConfirmar(false);
	};

	const openCreate = () => {
		setModalMode('create');
		setSelectedProject(undefined);
		setModalOpen(true);
	};

	const openEdit = (project: Project) => {
		setModalMode('edit');
		setSelectedProject(project);
		setModalOpen(true);
	};

	const handleSave = (data: Project) => {
		setPendingData(data);
		if (modalMode === 'create') {
			setTextConfirm('¿Estás seguro de grabar este proyecto?');
		} else {
			setTextConfirm('¿Estás seguro de guardar cambios a este proyecto?');
		}
		setConfirOpen(true);
	};

	const accionar = () => {
		if (!pendingData) return;
		setLoading(true);

		const payload = {
			name: pendingData.name.trim(),
			descripcion: pendingData.descripcion.trim(),
		};

		if (modalMode === 'create') {
			router.post(
				route('projects.store'),payload,
				{
					preserveScroll: true,
					preserveState: true,
					onFinish: () => {
						setLoading(false);
						setTextConfirmar('');
						setConfirmar(false);
						setProjectCopia(projectVacio);
					}
				}
			);

			/*router.post('/projects', payload, {
				preserveScroll: true,
				preserveState: true,
				onFinish: () => {
					setLoading(false);
					setPendingData(undefined);
				}
			});*/
		} else {
			router.put(
				route('projects.update',{project: pendingData.id}),
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
			/*router.put(`/projects/${pendingData.id}`, payload, {
				preserveScroll: true,
				preserveState: true,
				onFinish: () => {
					setLoading(false);
					setPendingData(undefined);
				}
			});*/
		}

		setConfirOpen(false);
	};

	const cancelarConfirmacion = () => {
		setConfirOpen(false);
	};

	//useEffect
	useEffect(() => {
		if (!activo && propsActuales.resultado !== undefined) {
			setPropsActuales({
				resultado: undefined,
				mensaje: undefined,
				project_id: undefined
			});
		}
	}, [activo]);

	useEffect(() => {
		if (
			projects &&
			projects.length > 0 &&
			JSON.stringify(projects) !== JSON.stringify(proyectosCacheados)
		) {
			setProyectosCacheados(projects);
		}
	}, [projects]);

	useEffect(() => {
		const cambioDetectado =
			(resultado && resultado  !== propsActuales.resultado)  ||
			(mensaje && mensaje    !== propsActuales.mensaje)    /*||
			project_id !== propsActuales.project_id;*/

		if (cambioDetectado) {
			setPropsActuales({ resultado, mensaje, project_id });

			const esError = resultado === 0;
			setTitle(esError ? 'Error' : modalMode === 'create' ? 'Proyecto nuevo' : 'Proyecto modificado');
			setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${project_id})`);
			setColor(esError ? 'error' : 'success');
			setActivo(true);

			if (resultado === 1 && project_id) {
				setModalOpen(false);
				router.get(route('projects.index'),
					{ id: project_id, buscar: true },
					{ preserveScroll: true,	preserveState: true	}
				)
				/*router.get('/projects', { id: project_id, buscar: true }, {
					preserveScroll: true,
					preserveState: true,
				});*/
			}
		}
	}, [resultado, mensaje, project_id]);


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Proyectos" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FormProyectos openCreate={openCreate} resetearProject={setProyectosCacheados}/>
        </div>
        {/*<div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
					<h2 className='text-center pb-4'>Resultado de Proyectos</h2>
          <TablaProjects openEdit={openEdit} />
        </div>*/}
				<div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          {/*<DataTableProject openEdit={openEdit} />*/}
					<DataTableProjects 
						datos={proyectosCacheados?? []} 
						openEdit={openEdit} 
						abrirConfirmar={confirmar}
						/>
        </div>
      </div>
			<NewEditDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        project={selectedProject}
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
