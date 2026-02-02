import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Marca } from '@/types/typeCrud';
import { Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import DataTableMarcas from '@/components/marcas/dataTableMarcas';
import NewEditMarca from '@/components/marcas/newEditMarca';
import ModalConfirmar from '@/components/modalConfirmar';
import ShowMessage from '@/components/utils/showMessage';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Marcas', href: '', } ];

type propsForm = {
  openCreate: () => void;
  resetearMarca: (data:Marca[]) => void;
}

const marcaVacia = {
  marca_id:     '',
  nombre:       '',
  inhabilitada: false,
}

export function FiltrosForm({ openCreate, resetearMarca }: propsForm){
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false);
  const { data, setData, errors, processing }       = useForm<Marca>(marcaVacia);
  const [load, setLoad]                             = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetearMarca([]);
    setLoad(true);
    const payload = { ...data, buscar: true }
    
    router.get(route('marcas.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setLoad(false),
    });
  };
  const handleReset = () => {
    setData(marcaVacia);
  };

  return (
    <div>
      <div className='flex items-center justify-between px-3 pt-3'>
        <div className='flex'> <Filter size={20} />  Filtros</div>
        <Button 
          className="p-0 hover:bg-transparent cursor-pointer"
          type="button"
          title="Nueva" 
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
          <Input className='text-right' value={data.marca_id} onChange={(e)=>setData('marca_id',Number(e.target.value))}/>	
          { errors.marca_id && <p className='text-red-500	'>{ errors.marca_id }</p> }
        </div>
        <div className='col-span-12 sm:col-span-5 md:col-span-5 lg:col-span-4'>
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.nombre} onChange={(e)=>setData('nombre',e.target.value)}/>	
          { errors.nombre && <p className='text-red-500	'>{ errors.nombre }</p> }
        </div>        
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-3 flex flex-col'>
          <label className='mr-2'>Inhabilitada</label>
          <Switch checked={data.inhabilitada==0 ? false: true} onCheckedChange={(val) => setData('inhabilitada', val)} />
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

export default function Marcas(){
  //data
  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
  const [textConfir, setTextConfirm] = useState('');
  
  const [modalOpen, setModalOpen]         = useState(false); //modal editar/crear
  const [modalMode, setModalMode]         = useState<'create' | 'edit'>('create');
  const [selectedMarca, setSelectedMarca] = useState<Marca | undefined>(undefined);
  const [pendingData, setPendingData]     = useState<Marca | undefined>(undefined);
  const [loading, setLoading]             = useState(false);
  
  const [openConfirmar, setConfirmar]     = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar] = useState(''); 
  const [marcaCopia, setMarcaCopia]       = useState<Marca>(marcaVacia);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const { marcas } = usePage().props as { marcas?: Marca[] }; //necesito los props de inertia
  const { resultado, mensaje, marca_id, timestamp } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    marca_id?: number;
    timestamp?: number;
  };
  const [ultimoTimestamp, setUltimoTimestamp] = useState<number | null>(null);
  const [marcasCacheadas, setMarcasCacheadas] = useState<Marca[]>([]);
  //funciones
  const confirmar = (data: Marca) => {
    if(data){
      setMarcaCopia( JSON.parse(JSON.stringify(data)) );
      const texto : string = data.inhabilitada === 0 ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' esta marca?');
      setConfirmar(true);
      setModalMode('edit');
    }
  };
  const inhabilitarHabilitar = () => {
    if (!marcaCopia || !marcaCopia.marca_id) return;
    
    setLoading(true);
    router.put(
      route('marcas.toggleEstado', { marca: marcaCopia.marca_id }),{},
      {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          setLoading(false);
          setTextConfirmar('');
          setConfirmar(false);
          setMarcaCopia(marcaVacia);
        }
      }
    );
  };

  const cancelarInhabilitarHabilitar = () => { 
    setConfirmar(false);
  };

  const openCreate = () => {
    setModalMode('create');
    setSelectedMarca(undefined);
    setModalOpen(true);
  };

  const openEdit = (data: Marca) => {
    setModalMode('edit');
    setSelectedMarca(data);
    setModalOpen(true);
  };

  const handleSave = (data: Marca) => {
    setPendingData(data);
    let texto = (modalMode === 'create')? 'grabar' : 'guardar cambios a';
    setTextConfirm('¿Estás seguro de '+texto+' esta marca?');
    setConfirOpen(true);
  };

  const accionar = () => {
    if (!pendingData) return;
    setLoading(true);

    const payload = JSON.parse(JSON.stringify(pendingData));
    if (modalMode === 'create') {
      router.post(
        route('marcas.store'), payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoading(false);
            setTextConfirmar('');
            setConfirmar(false);
            setMarcaCopia(marcaVacia);
          }
        }
      );
    } else {
      router.put(
        route('marcas.update',{marca: pendingData.marca_id}), payload,
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
      marcas &&
      marcas.length > 0 &&
      JSON.stringify(marcas) !== JSON.stringify(marcasCacheadas)
    ) {
      setMarcasCacheadas(marcas);
    }
  }, [marcas]);


  useEffect(() => {
    const cambioDetectado = timestamp && timestamp !== ultimoTimestamp;

    if (cambioDetectado) {
      setUltimoTimestamp(timestamp)

      const esError = resultado === 0;
      setTitle(esError ? 'Error' : modalMode === 'create' ? 'Marca nueva' : 'Marca modificada');
      setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${marca_id})`);
      setColor(esError ? 'error' : 'success');
      setActivo(true);

      if (resultado === 1 && marca_id) {
        setModalOpen(false);
        router.get(route('marcas.index'),
          { marca_id, buscar: true },
          { preserveScroll: true,	preserveState: true	}
        )
      }
    }
  }, [timestamp, ultimoTimestamp, resultado, mensaje, marca_id, modalMode]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Marcas" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm openCreate={openCreate} resetearMarca={setMarcasCacheadas}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableMarcas
            datos={marcasCacheadas?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            />
        </div>
      </div>
      <NewEditMarca
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        marca={selectedMarca}
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
        key={timestamp}
        open={activo}
        title={title}
        text={text}
        color={color}
        onClose={() => setActivo(false)}
      />
    </AppLayout>
  );
}