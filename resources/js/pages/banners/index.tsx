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

export function FiltrosForm({ openCreate, resetearBanner }: propsForm){
	const [esperandoRespuesta, setEsperandoRespuesta] = useState(false);
	const { data, setData, errors, processing }       = useForm<Banner>(bannerVacio);
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
		setData(bannerVacio);
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
					<Input className='text-right' value={data.id} onChange={(e)=>setData('id',Number(e.target.value))}/>	
					{ errors.id && <p className='text-red-500	'>{ errors.id }</p> }
				</div>
				<div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-5'>
					<label htmlFor="url">Url</label>
					<Input value={data.url} onChange={(e)=>setData('url',e.target.value)}/>	
					{ errors.url && <p className='text-red-500	'>{ errors.url }</p> }
				</div>  
				<div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-5'>
					<label htmlFor="title">Título</label>
					<Input value={data.title} onChange={(e)=>setData('title',e.target.value)}/>	
					{ errors.title && <p className='text-red-500	'>{ errors.title }</p> }
				</div>  
				<div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-4'>
					<label htmlFor="description">Descripción</label>
					<Input value={data.description} onChange={(e)=>setData('description',e.target.value)}/>	
					{ errors.description && <p className='text-red-500	'>{ errors.description }</p> }
				</div>
				<div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
					<label htmlFor="priority">Prioridad</label>
					<Input value={data.priority} onChange={(e)=>setData('priority',e.target.value)}/>	
					{ errors.priority && <p className='text-red-500	'>{ errors.priority }</p> }
				</div>        
				<div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex flex-col'>
					<label className='mr-2'>Inhabilitado</label>
					<Switch checked={data.inhabilitado==0 ? false: true} onCheckedChange={(val) => setData('inhabilitado', val)} />
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

	const { banners } = usePage().props as { banners?: Banner[] }; //necesito los props de inertia
	const { resultado, mensaje, id, timestamp } = usePage().props as {
		resultado?: number;
		mensaje?: string;
		id?: number;
		timestamp?: number;
	};
	
	const [ultimoTimestamp, setUltimoTimestamp] = useState<number | null>(null);
	const [bannersCacheados, setBannersCacheados] = useState<Banner[]>([]);

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
			route('turnos.toggleEstado', { carousel: bannerCopia.id }),{},
			{
				preserveScroll: true,
				preserveState: true,
				onFinish: () => {
					setLoading(false);
					setTextConfirmar('');
					setConfirmar(false);
					setBannerCopia(bannerVacio);
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

	const accionar = () => {
		if (!pendingData) return;
		setLoading(true);

		const payload = JSON.parse(JSON.stringify(pendingData));
		console.log("payload: ", payload)
		if (modalMode === 'create') {
			router.post(
				route('banners.store'), payload,
				{
					preserveScroll: true,
					preserveState: true,
					onFinish: () => {
						setLoading(false);
						setTextConfirmar('');
						setConfirmar(false);
						setBannerCopia(bannerVacio);
					}
				}
			);
		} else {
			router.put(
				route('banners.update',{carousel: pendingData.id}), payload,
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
			banners &&
			banners.length > 0 &&
			JSON.stringify(banners) !== JSON.stringify(bannersCacheados)
		) {
			setBannersCacheados(banners);
		}
	}, [banners]);


	useEffect(() => {
		const cambioDetectado = timestamp && timestamp !== ultimoTimestamp;

		if (cambioDetectado) {
			setUltimoTimestamp(timestamp)

			const esError = resultado === 0;
			setTitle(esError ? 'Error' : modalMode === 'create' ? 'Banner nuevo' : 'Banner modificado');
			setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${id})`);
			setColor(esError ? 'error' : 'success');
			setActivo(true);

			if (resultado === 1 && id) {
				setModalOpen(false);
				router.get(route('banners.index'),
					{ id, buscar: true },
					{ preserveScroll: true,	preserveState: true	}
				)
			}
		}
	}, [timestamp]);

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Banners" />
			<div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
				<div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
					<FiltrosForm openCreate={openCreate} resetearBanner={setBannersCacheados}/>
				</div>
				<div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
					<DataTableBanners
						datos={bannersCacheados?? []} 
						openEdit={openEdit} 
						abrirConfirmar={confirmar}
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