import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Banner } from '@/types/typeCrud';
import { Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import DataTableBanners from '@/components/banners/dataTableBanners';
import NewEditBanner from '@/components/banners/newEdit';
import ModalConfirmar from '@/components/modalConfirmar';
import ShowMessage from '@/components/utils/showMessage';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Banners', href: '', } ];

type propsForm = {
	data: Banner;
	set: (e:any) => void;
	openCreate: () => void;
	resetearBanner: (data:Banner[]) => void;
}

const bannerVacio = {
  id:    				'',
  url:   				'',
  title: 				'',
  description:  '',
  priority:     '',
  inhabilitado: false,
}

export function FiltrosForm({ data, set, openCreate, resetearBanner }: propsForm){
	const [esperandoRespuesta, setEsperandoRespuesta] = useState(false);
	const [load, setLoad]                             = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		resetearBanner([]);
		setLoad(true);
		const payload = { ...data, buscar: true }
		
		router.get(route('banners.index'), payload, {
			preserveState: true,
			preserveScroll: true,
			onFinish: () => setLoad(false),
		});
	};
	const handleReset = () => {
		set(bannerVacio);
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
					<Input className='text-right' value={data.id} onChange={(e)=>set({...data, 'id': Number(e.target.value)})}/>	
				</div>
				<div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-5'>
					<label htmlFor="url">Url</label>
					<Input value={data.url} onChange={(e)=>set({...data, 'url': e.target.value})}/>	
				</div>  
				<div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-5'>
					<label htmlFor="title">Título</label>
					<Input value={data.title} onChange={(e)=>set({...data, 'title': e.target.value})}/>
				</div>  
				<div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-4'>
					<label htmlFor="description">Descripción</label>
					<Input value={data.description} onChange={(e)=>set({ ...data, 'description': e.target.value})}/>	
				</div>
				<div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
					<label htmlFor="priority">Prioridad</label>
					<Input value={data.priority} onChange={(e)=>set({...data, 'priority': e.target.value})}/>	
				</div>        
				<div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex flex-col'>
					<label className='mr-2'>Inhabilitado</label>
					<Switch checked={data.inhabilitado==0 ? false: true} onCheckedChange={(val) => set({...data, 'inhabilitado': val})} />
				</div>
				<div className='col-span-6 sm:col-span-12 md:col-span-12 lg:col-span-3 flex justify-end items-center'>
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

export default function Banners(){
	//data
	const { data, setData, errors, processing }       = useForm<Banner>(bannerVacio);

	const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
	const [textConfir, setTextConfirm] = useState('');
	
	const [modalOpen, setModalOpen]         	= useState(false); //modal editar/crear
	const [modalMode, setModalMode]         	= useState<'create' | 'edit'>('create');
	const [selectedBanner, setSelectedBanner] = useState<Banner | undefined>(undefined);
	const [pendingData, setPendingData]     	= useState<Banner | undefined>(undefined);
	const [loading, setLoading]             	= useState(false);
	
	const [openConfirmar, setConfirmar]     = useState(false); //para editar el estado
	const [textConfirmar, setTextConfirmar] = useState(''); 
	const [bannerCopia, setBannerCopia]     = useState<Banner>(bannerVacio);

	const [activo, setActivo] = useState(false);//ShowMessage
	const [text, setText]     = useState('');
	const [title, setTitle]   = useState('');
	const [color, setColor]   = useState('');

	//const { banners } = usePage().props as { banners?: Banner[] }; //necesito los props de inertia
	const { banners } = usePage().props as {
		banners?: {
			data: Banner[],
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
	};*/
	
	//const [ultimoTimestamp, setUltimoTimestamp] = useState<number | null>(null);
	const [cacheados, setCacheados] = useState<Banner[]>([]);

	//funciones
	const confirmar = (data: Banner) => {
		if(data){
			setBannerCopia( JSON.parse(JSON.stringify(data)) );
			const texto : string = data.inhabilitado === 0 ? 'inhabilitar': 'habilitar';
			setTextConfirmar('Estás seguro de querer '+texto+' este banner?');
			setConfirmar(true);
			setModalMode('edit');
		}
	};
	const inhabilitarHabilitar = () => {
		if (!bannerCopia || !bannerCopia.id) return;
		
		setLoading(true);
		router.put(
			route('banners.toggleEstado', { carousel: bannerCopia.id }),{},
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
					const id = page.props.id;
					const msj = page.props.mensaje;
					
					setTitle("Estado del banner");
					setText(`${msj} ✅ (ID: ${id})`);
					setColor("success");
					setActivo(true);
				},
				onFinish: () => {
					setLoading(false);
					setTextConfirmar('');
					setConfirmar(false);
					setBannerCopia(bannerVacio);

					//al momento de buscar
					setData(bannerVacio);
					router.get(
						route('banners.index'), 
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
		setSelectedBanner(undefined);
		setModalOpen(true);
	};

	const openEdit = (data: Banner) => {
		setModalMode('edit');
		setSelectedBanner(data);
		setModalOpen(true);
	};

	const handleSave = (data: Banner) => {
		setPendingData(data);
		let texto = (modalMode === 'create')? 'grabar' : 'guardar cambios a';
		setTextConfirm('¿Estás seguro de '+texto+' este banner?');
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
		const title = resultado === 0 ? 'Error': titulo ;
		console.log("page.props: ", page.props)
		
		if (resultado === 0) {
			// error lógico
			setTitle(title);
			setText(mensaje);
			setColor("error");
			setActivo(true);
			return;
		}

		// éxito
		setTitle(title);
		setText(`${mensaje} ✅ (ID: ${id})`);
		setColor("success");
		setActivo(true);

		setData(bannerVacio);
		router.get(route("banners.index"), {}, {
			preserveScroll: true,
			preserveState: true,
		});
	};
	const finalizarAccion = () => {
		setLoading(false);
		setPendingData(bannerVacio);
	};

	const accionar = () => {
		if (!pendingData) return;
		setLoading(true);

		const payload = { ...pendingData };

		if (modalMode === 'create') {
			router.post(route('banners.store'), payload, {
				preserveScroll: true,
				preserveState: true,
				onError:   manejarError("Error en carga del banner"),
				onSuccess: manejarExito("Banner creado"),
				onFinish:  finalizarAccion,
			});
		} else {
			router.put(route('banners.update', { carousel: pendingData.id }), payload, {
				preserveScroll: true,
				preserveState: true,
				onError:   manejarError("Error en modificar el banner"),
				onSuccess: manejarExito("Banner actualizado"),
				onFinish:  finalizarAccion,
			});
		}

		setTextConfirm('');
		setConfirOpen(false);
		setModalOpen(false);
	};

	const cancelarConfirmacion = () => {
		setConfirOpen(false);
	};

	//effect
	useEffect(() => {
		if (banners && banners.data.length > 0) {
			setCacheados(banners.data);
		}else{
			setCacheados([]);
		}
	}, [banners]);

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Banners" />
			<div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
				<div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
					<FiltrosForm 
						data={data}
						set={setData}
						openCreate={openCreate} 
						resetearBanner={setCacheados}
					/>
				</div>
				<div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
					<DataTableBanners
						datos={cacheados?? []} 
						openEdit={openEdit} 
						abrirConfirmar={confirmar}
						totalFilas={banners?.total ?? 0}
            current_page={banners?.current_page ?? 0}
            last_page={banners?.last_page ?? 0}
            next_page_url={banners?.next_page_url ?? ''}
            prev_page_url={banners?.prev_page_url ?? ''}
					/>
				</div>
			</div>
			<NewEditBanner
				open={modalOpen}
				onOpenChange={setModalOpen}
				mode={modalMode}
				banner={selectedBanner}
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