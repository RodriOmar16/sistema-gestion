import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, usePage, useForm, router } from '@inertiajs/react';
import ModalConfirmar from "@/components/modalConfirmar";
import NewEditBanner from "./newEdit";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Banner } from "@/types/banners";
import { Pen, Ban, Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import {
  Select,  SelectContent,  SelectItem,  SelectTrigger,  SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader,  TableRow,
} from "@/components/ui/table";

const breadcrumbs: BreadcrumbItem[] = [
  /*{
    title: 'Dashboard',
    href: '/dashboard',
  },*/
  {
    title: 'Banners',
    href: '/banners',
  },
];

export const FormBanners = ({ openCreate }: { openCreate: () => void }) => {
	const [loading, setLoading] = useState(false);

	const { filters } = usePage().props as { filters?: { id: string; url: string; title:string; description: string; priority: number|string; inhabilitado: boolean|string } };

	const { data, setData, get, processing, errors } = useForm<{
		id: string;
		url: string;
    title: string;
		description: string;
    priority: number|string;
		inhabilitado: string | boolean;
	}>({
		id: filters?.id || '',
		url: filters?.url || '',
    title: filters?.title || '',
		description: filters?.description || '',
    priority: filters?.priority || '',
		inhabilitado: filters?.inhabilitado ?? '',
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		router.get('/carousel', {
			id: data.id,
			url: data.url,
      title: data.title,
			description: data.description,
      priority: data.priority,
			inhabilitado: data.inhabilitado,
		}, {
			preserveState: true,
			preserveScroll: true,
			onFinish: () => setLoading(false),
		});
	};

	const handleReset = () => {
		setData({
			id: '',
			url: '',
      title:'',
			description: '',
      priority: '',
			inhabilitado: ''
		});
	};

	return (
		<div>
			<div className='flex justify-between pl-4 pr-6 pt-2'>
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
			<form onSubmit={handleSubmit} className='flex items-center gap-4 p-4 justify-between"	'>
				<div className='flex gap-4 flex-1'>
					<div>
						<label htmlFor="id">Id</label>
						<Input value={data.id} onChange={(e)=>setData('id',e.target.value)}/>	
						{ errors.id && <p className='text-red-500	'>{ errors.id }</p> }
					</div>
					<div >
						<label htmlFor="nombre">Url</label>
						<Input value={data.url} onChange={(e)=>setData('url',e.target.value)}/>	
						{ errors.url && <p className='text-red-500	'>{ errors.url }</p> }
					</div>
					<div>
						<label htmlFor="descripcion">Título</label>
						<Input value={data.title} onChange={(e)=>setData('title',e.target.value)}/>	
						{ errors.title && <p className='text-red-500	'>{ errors.title }</p> }
					</div>
          <div>
						<label htmlFor="descripcion">Descripción</label>
						<Input value={data.description} onChange={(e)=>setData('description',e.target.value)}/>	
						{ errors.description && <p className='text-red-500	'>{ errors.description }</p> }
					</div>
					<div>
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
				</div>
				<div className='flex justify-end'>
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

export function TablaBanners({ openEdit }: { openEdit: (banner: Banner) => void }) {
	const bannerVacio = {
		id: '',
    url: '',
    title:'' ,
    description: '',
    priority: '',
    inhabilitado: false,
    created_at: '',
    updated_at: '',
	}

  const { banners } = usePage().props as { banners?: { data: Banner[] } };
	const [openConfirmar, setConfirmar]     = useState(false);
	const [textConfirmar, setTextConfirmar] = useState(''); 
	const [bannerCopia, setBannerCopia]   = useState<Banner>(bannerVacio);

	const confirmar = (banner: Banner) => {
		if(banner){
			setBannerCopia( JSON.parse(JSON.stringify(banner)) );
			const texto : string = banner.inhabilitado === 0 ? 'inhabilitar': 'habilitar';
			setTextConfirmar('Estás seguro de querer '+texto+' este banner?');
			setConfirmar(true);
		}
	};

	const inhabilitarHabilitar = () => {
		if (!bannerCopia || !bannerCopia.id) return;

		router.put(`/carousel/${bannerCopia.id}/estado`, {}, {
			preserveScroll: true,
			onFinish: () => {
				setBannerCopia(bannerVacio);
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
			{/*<div className='pb-2'>
				<PdfButton
					deshabilitado={projects?.data?.length==0}
				/>
			</div>*/}
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[80px]">ID</TableHead>
						<TableHead>Url</TableHead>
						<TableHead>Título</TableHead>
						<TableHead>Descripción</TableHead>
						<TableHead>Estado</TableHead>
						<TableHead>Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{banners?.data?.length ? (
							banners.data.map((banner) => (
								<TableRow key={banner.id}>
									<TableCell className="font-medium">{banner.id}</TableCell>
									<TableCell>{banner.url}</TableCell>
                  <TableCell>{banner.title}</TableCell>
									<TableCell>{banner.description}</TableCell>
                  <TableCell>{banner.inhabilitado === 0? 'Habilitado' : 'Inhabilitado'}</TableCell>
									<TableCell>
										<div className='flex'>
											{
												banner?.inhabilitado === 0 ? (
													<>
														<Button 
															className="p-0 hover:bg-transparent cursor-pointer"
															title="Editar" 
															variant="ghost" 
															size="icon" 
															onClick={() => openEdit(banner)}>
															<Pen size={20} className="text-orange-500" />
														</Button>
														<Button 
															className="p-0 hover:bg-transparent cursor-pointer"
															title="Inhabilitar" 
															variant="ghost" 
															size="icon"
															onClick={ () => confirmar(banner) }>
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
															onClick={ () => confirmar(banner) }
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
						{/* Podés agregar resumen o totales si lo necesitás */}
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
}

export default function Banners(){
//para guardar la data del modal mientras se abre el modal de confirmar
  const [pendingData, setPendingData] = useState<Banner | undefined>(undefined);

  //controla cuando se abre el modal de confirmar y el texto que se quiera mostrar
  const [confirmOpen, setConfirOpen] = useState(false);
  const [textConfir, setTextConfirm] = useState('');

  //controla el modal newEdit y los datos que recibe para mostrarlos
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProject, setSelectedProject] = useState<Banner | undefined>(undefined);

  //para dar la apariencia de loading
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setModalMode('create');
    setSelectedProject(undefined);
    setModalOpen(true);
  };

  const openEdit = (project: Banner) => {
    setModalMode('edit');
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleSave = (data: Banner) => {
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
      url: pendingData.url,
      description: pendingData.description,
    };

    if (modalMode === 'create') {
      router.post('/carousel', payload, {
        onFinish: () => {
          setLoading(false);
          setModalOpen(false);
          setPendingData(undefined);
        }
      });
    } else {
      router.put(`/carousel/${pendingData.id}`, payload, {
        onFinish: () => {
          setLoading(false);
          setModalOpen(false);
          setPendingData(undefined);
        }
      });
    }

    setConfirOpen(false);
  };

  const cancelarConfirmacion = () => {
    setConfirOpen(false);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
          <Head title="Banners" />
          <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
              <FormBanners openCreate={openCreate}/>
            </div>
            <div className="p-4 relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
              <h2 className='text-center pb-4'>Resultado de Banners</h2>
              <TablaBanners openEdit={openEdit} />
            </div>
          </div>
          {/*<NewEditBanner
            open={modalOpen}
            onOpenChange={setModalOpen}
            mode={modalMode}
            project={selectedProject}
            onSubmit={handleSave}
            loading={loading}
          />*/}
          <ModalConfirmar
            open={confirmOpen}
            text={textConfir}
            onSubmit={accionar}
            onCancel={cancelarConfirmacion}
          />
        </AppLayout>
  );
}