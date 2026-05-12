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
import Loading from '@/components/utils/loadingDialog';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Marcas', href: '', } ];

type propsForm = {
  data: Marca;
  set: (e:any) => void;
  openCreate: () => void;
  resetearMarca: (data:Marca[]) => void;
}

const marcaVacia = {
  marca_id:     '',
  nombre:       '',
  inhabilitada: false,
}

export function FiltrosForm({ data, set, openCreate, resetearMarca }: propsForm){
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
    set(marcaVacia);
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
          <Input className='text-right' value={data.marca_id} onChange={(e)=>set({...data, 'marca_id': Number(e.target.value)})}/>	
        </div>
        <div className='col-span-12 sm:col-span-5 md:col-span-5 lg:col-span-4'>
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.nombre} onChange={(e)=>set({...data, 'nombre': e.target.value})}/>	
        </div>        
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-3 flex flex-col'>
          <label className='mr-2'>Inhabilitada</label>
          <Switch checked={data.inhabilitada==0 ? false: true} onCheckedChange={(val) => set({...data, 'inhabilitada': val})} />
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
  const { data, setData, errors, processing }       = useForm<Marca>(marcaVacia);
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

  //const { marcas } = usePage().props as { marcas?: Marca[] }; //necesito los props de inertia
  const { marcas } = usePage().props as {
    marcas?: {
      data: Marca[],
      current_page:  number, 
      last_page:     number, 
      total:         number,
      next_page_url: string,
      prev_page_url: string,
    }
  };

  const [cacheadas, setCacheadas] = useState<Marca[]>([]);

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
        onError: (errors) => {
          // errors es un objeto { campo: "mensaje de error" }
          console.log("Errores:", errors);
          setTitle("Error en cambio de estado");
          setText(Object.values(errors).join("\n"));
          setColor("error");
          setActivo(true);
        },
        onSuccess: (page) => {
          const {resultado, mensaje, marca_id} = page.props;
          
          if(resultado === 0){
            setTitle("Error inesperado");
            setText(`${mensaje} ❌ (ID: ${marca_id})`);
            setColor("error");
            setActivo(true);
            return
          }

          setTitle("Estado de marca cambiado");
          setText(`${mensaje} ✅ (ID: ${marca_id})`);
          setColor("success");
          setActivo(true);
        },
        onFinish: () => {
          setLoading(false);
          setTextConfirmar("");
          setConfirmar(false);
          setMarcaCopia(marcaVacia);

          //actualizo la lista
          setData(marcaVacia);
          router.get(route('marcas.index'), 
          {} , {
            preserveScroll: true,
            preserveState: true,
          });
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

  const manejarError = (titulo: string) => (errors: any) => {
    console.log("Errores:", errors);
    setTitle(titulo);
    setText(Object.values(errors).join("\n"));
    setColor("error");
    setActivo(true);
  };
  const manejarExito = (titulo: string) => (page: any) => {
    const { resultado, mensaje, marca_id } = page.props;
    const title = resultado === 0 ? 'Error inesperado': titulo ;

    if(resultado === 0){
      setTitle(title);
      setText(mensaje);
      setColor("error");
      setActivo(true);
      return;
    }

    setTitle(title);
    setText(`${mensaje} ✅ (ID: ${marca_id})`);
    setColor("success");
    setActivo(true);

    setModalOpen(false);
  };
  const finalizarAccion = () => {
    setLoading(false);
    setPendingData(marcaVacia);
    setData(marcaVacia);
    router.get(route("marcas.index"), {}, {
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
    }*/
    const payload = { ...pendingData };

		if (modalMode === 'create') {
			router.post(route('marcas.store'), payload, {
				preserveScroll: true,
				preserveState: true,
				onError:   manejarError("Error al crear la marca"),
				onSuccess: manejarExito("Marca creada"),
				onFinish:  finalizarAccion,
			});
		} else {
			router.put(route('marcas.update', {marca: pendingData.marca_id},), payload, {
				preserveScroll: true,
				preserveState: true,
				onError:   manejarError("Error al modificar la marca"),
				onSuccess: manejarExito("Marca actualizada"),
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
    if ( marcas && marcas.data.length > 0 ) {
      setCacheadas(marcas.data);
    }
  }, [marcas]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Marcas" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm 
            data={data}
            set={setData}
            openCreate={openCreate} resetearMarca={setCacheadas}
          />
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableMarcas
            datos={cacheadas?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            totalFilas={marcas?.total ?? 0}
            current_page={marcas?.current_page ?? 0}
            last_page={marcas?.last_page ?? 0}
            next_page_url={marcas?.next_page_url ?? ''}
            prev_page_url={marcas?.prev_page_url ?? ''}
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