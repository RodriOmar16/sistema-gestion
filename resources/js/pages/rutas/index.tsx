import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Ruta } from '@/types/typeCrud';
import { Pen, Ban, Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import { DataTableRutas } from '@/components/rutas/dataTableRutas';
import NewEditDialog from '../../components/rutas/newEdit';
import ModalConfirmar from '@/components/modalConfirmar';
import PdfButton from '@/components/utils/pdf-button';
import ShowMessage from '@/components/utils/showMessage';
//import { DataTableProjects } from '@/components/projects/dataTableProjects';
import { Select,  SelectContent,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Rutas', href: '', } ];

type propsForm = {
  openCreate: () => void;
  resetearRuta: (ruta:Ruta[]) => void;
}

export function FiltrosForm({ openCreate,resetearRuta }: propsForm){
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false);
  const { data, setData, errors, processing } = useForm({
    ruta_id: '',
    url: '',
    inhabilitada: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
		resetearRuta([]);
    const payload = {      ...data, buscar: true    }
    router.get(route('rutas.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setEsperandoRespuesta(false),
    });
  };
  const handleReset = () => {
		setData({
			ruta_id: '',
      url: '',
      inhabilitada: false,
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
					<Input value={data.ruta_id} onChange={(e)=>setData('ruta_id',e.target.value)}/>	
					{ errors.ruta_id && <p className='text-red-500	'>{ errors.ruta_id }</p> }
				</div>
				<div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-4'>
					<label htmlFor="nombre">Url</label>
					<Input value={data.url} onChange={(e)=>setData('url',e.target.value)}/>	
					{ errors.url && <p className='text-red-500	'>{ errors.url }</p> }
				</div>
				<div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex items-center'>
					<label className='mr-2'>Inhabilitada</label>
          <Switch checked={data.inhabilitada} onCheckedChange={(val) => setData('inhabilitada', val)} />
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

export default function Rutas(){
  //data
  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
	const [textConfir, setTextConfirm] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false); //modal editar/crear
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedRuta, setSelectedRuta] = useState<Ruta | undefined>(undefined);
  const [pendingData, setPendingData] = useState<Ruta | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  
  const [openConfirmar, setConfirmar]     = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar] = useState(''); 
  const rutaVacia = {      ruta_id: '',      url: '',      inhabilitada: false,      created_at: '',      updated_at: ''    }
  const [rutaCopia, setRutaCopia]   = useState<Ruta>(rutaVacia);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const { rutas } = usePage().props as { rutas?: Ruta[] }; //necesito los props de inertia
  const { resultado, mensaje, ruta_id } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    ruta_id?: number;
  };
  const [propsActuales, setPropsActuales] = useState<{
    resultado: number | undefined | null;
    mensaje: string | undefined | null | '';
    ruta_id: number | undefined | null;
  }>({ resultado: undefined, mensaje: undefined, ruta_id: undefined });
  const [rutasCacheadas, setRutasCacheadas] = useState<Ruta[]>([]);

  //funciones
  const confirmar = (ruta: Ruta) => {
    if(ruta){
      setRutaCopia( JSON.parse(JSON.stringify(ruta)) );
      const texto : string = ruta.inhabilitada === 0 ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' esta ruta?');
      setConfirmar(true);
    }
  };
  const inhabilitarHabilitar = () => {
    if (!rutaCopia || !rutaCopia.ruta_id) return;
    setLoading(true);
    router.put(
      route('rutas.toggleEstado', { ruta: rutaCopia.ruta_id }),{},
      {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          setLoading(false);
          setTextConfirmar('');
          setConfirmar(false);
          setRutaCopia(rutaVacia);
        }
      }
    );
  };

  const cancelarInhabilitarHabilitar = () => { 
    setConfirmar(false);
  };

  const openCreate = () => {
    setModalMode('create');
    setSelectedRuta(undefined);
    setModalOpen(true);
  };

  const openEdit = (ruta: Ruta) => {
    setModalMode('edit');
    setSelectedRuta(ruta);
    setModalOpen(true);
  };

  const handleSave = (data: Ruta) => {
    setPendingData(data);
    if (modalMode === 'create') {
      setTextConfirm('¿Estás seguro de grabar esta ruta?');
    } else {
      setTextConfirm('¿Estás seguro de guardar cambios a esta ruta?');
    }
    setConfirOpen(true);
  };

  const accionar = () => {
    if (!pendingData) return;
    setLoading(true);

    const payload = {
      url: pendingData.url.trim(),
      inhabilitada: pendingData.inhabilitada,
    };

    if (modalMode === 'create') {
      router.post(
        route('rutas.store'),payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoading(false);
            setTextConfirmar('');
            setConfirmar(false);
            setRutaCopia(rutaVacia);
          }
        }
      );
    } else {
      router.put(
        route('rutas.update',{ruta: pendingData.ruta_id}),
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
				ruta_id: undefined
			});
		}
	}, [activo]);

  useEffect(() => {
		if (
			rutas &&
			rutas.length > 0 &&
			JSON.stringify(rutas) !== JSON.stringify(rutasCacheadas)
		) {
			setRutasCacheadas(rutas);
		}
	}, [rutas]);


	useEffect(() => {
		const cambioDetectado =
			(resultado && resultado  !== propsActuales.resultado)  ||
			(mensaje && mensaje    !== propsActuales.mensaje)    /*||
			project_id !== propsActuales.project_id;*/

		if (cambioDetectado) {
			setPropsActuales({ resultado, mensaje, ruta_id });

			const esError = resultado === 0;
			setTitle(esError ? 'Error' : modalMode === 'create' ? 'Ruta nueva' : 'Ruta modificada');
			setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${ruta_id})`);
			setColor(esError ? 'error' : 'success');
			setActivo(true);

			if (resultado === 1 && ruta_id) {
				setModalOpen(false);
        router.get(route('rutas.index'),
					{ ruta_id, buscar: true },
					{ preserveScroll: true,	preserveState: true	}
				)
			}
		}
	}, [resultado, mensaje, ruta_id]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Rutas" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm openCreate={openCreate} resetearRuta={setRutasCacheadas}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableRutas 
            datos={rutasCacheadas?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            />
        </div>
      </div>
      <NewEditDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        ruta={selectedRuta}
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