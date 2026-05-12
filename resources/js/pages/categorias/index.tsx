import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Categoria } from '@/types/typeCrud';
import { Pen, Ban, Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import DataTableCategorias from '@/components/categorias/dataTableCategorias';
import NewEditCategoria from '@/components/categorias/newEditCategorias';
import ModalConfirmar from '@/components/modalConfirmar';
import PdfButton from '@/components/utils/pdf-button';
import ShowMessage from '@/components/utils/showMessage';
import { Select,  SelectContent,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { route } from 'ziggy-js';
import { getCsrfToken } from '@/utils';
import Loading from '@/components/utils/loadingDialog';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Categorias', href: '', } ];

type propsForm = {
  data: Categoria;
  set: (e:any) => void;
  openCreate: () => void;
  resetearCategoria: (categoria:Categoria[]) => void;
}

const categoriaVacia = {
  categoria_id: '',
  nombre: '',
  inhabilitada: false,
}

export function FiltrosForm({ data, set, openCreate, resetearCategoria }: propsForm){
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetearCategoria([]);
    const payload = {      ...data, buscar: true    }

    setProcessing(true);
    
    router.get(route('categorias.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setProcessing(false)
    });
  };
  const handleReset = () => {
    set(categoriaVacia);
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
          <Input value={data.categoria_id} onChange={(e)=>set({...data, 'categoria_id': e.target.value})}/>	
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-4'>
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.nombre} onChange={(e)=>set({...data, 'nombre': e.target.value})}/>	
        </div>
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex flex-col'>
          <label className='mr-2'>Inhabilitada</label>
          <Switch checked={Boolean(data.inhabilitada)} onCheckedChange={(val) => set({...data, 'inhabilitada': val})} />
        </div>
        <div className='col-span-6 sm:col-span-8 md:col-span-8 lg:col-span-4 flex justify-end items-center'>
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

export default function Categorias(){
  //data
  const { data, setData, errors, processing } = useForm(categoriaVacia);
  const [respuesta, setResp]= useState<{resultado: number, categoria_id: number}>({resultado: 0, categoria_id: 0});

  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
  const [textConfir, setTextConfirm] = useState('');
  
  const [modalOpen, setModalOpen]                 = useState(false); //modal editar/crear
  const [modalMode, setModalMode]                 = useState<'create' | 'edit'>('create');
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | undefined>(undefined);
  const [pendingData, setPendingData]             = useState<Categoria | undefined>(undefined);
  const [loading, setLoading]                     = useState(false);
  
  const [openConfirmar, setConfirmar]       = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar]   = useState(''); 
  const [categoriaCopia, setCategoriaCopia] = useState<Categoria>(categoriaVacia);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  //const { categorias } = usePage().props as { categorias?: Categoria[] }; //necesito los props de inertia
  const { categorias } = usePage().props as {
    categorias?: {
      data: Categoria[],
      current_page:  number, 
      last_page:     number, 
      total:         number,
      next_page_url: string,
      prev_page_url: string,
    }
  }
  const [cacheadas, setCacheadas] = useState<Categoria[]>([]);

  //funciones
  const confirmar = (data: Categoria) => {
    if(data){
      setCategoriaCopia( JSON.parse(JSON.stringify(data)) );
      const texto : string = data.inhabilitada === 0 ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' esta categoría?');
      setConfirmar(true);
    }
  };
  const inhabilitarHabilitar = async () => {
    if (!categoriaCopia || !categoriaCopia.categoria_id) return;
    setLoading(true);
    router.put(
      route('categorias.toggleEstado', { categoria: categoriaCopia.categoria_id }),{},
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
          const {resultado, mensaje, categoria_id} = page.props;
          
          if(resultado === 0){
            setTitle("Error inesperado");
            setText(`${mensaje} ❌ (ID: ${categoria_id})`);
            setColor("error");
            setActivo(true);
            return
          }

          setTitle("Estado de categoría cambiado");
          setText(`${mensaje} ✅ (ID: ${categoria_id})`);
          setColor("success");
          setActivo(true);
        },
        onFinish: () => {
          setLoading(false);
          setTextConfirmar("");
          setConfirmar(false);
          setCategoriaCopia(categoriaVacia);

          //actualizo la lista
          setData(categoriaVacia);
          router.get(route('categorias.index'), 
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
    setSelectedCategoria(undefined);
    setModalOpen(true);
  };

  const openEdit = (data: Categoria) => {
    setModalMode('edit');
    setSelectedCategoria(data);
    setModalOpen(true);
  };

  const handleSave = (data: Categoria) => {
    setPendingData(data);
    if (modalMode === 'create') {
      setTextConfirm('¿Estás seguro de grabar esta categoría?');
    } else {
      setTextConfirm('¿Estás seguro de guardar cambios a esta categoría?');
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
      const { resultado, mensaje, categoria_id } = page.props;
      const title = resultado === 0 ? 'Error inesperado': titulo ;
  
      if(resultado === 0){
        setTitle(title);
        setText(mensaje);
        setColor("error");
        setActivo(true);
        return;
      }
  
      setTitle(title);
      setText(`${mensaje} ✅ (ID: ${categoria_id})`);
      setColor("success");
      setActivo(true);
  
      setModalOpen(false);
    };
    const finalizarAccion = () => {
      setLoading(false);
      setPendingData(categoriaVacia);
      setData(categoriaVacia);
      router.get(route("categorias.index"), {}, {
        preserveScroll: true,
        preserveState: true,
      });
    };

  const accionar = () => {
    if (!pendingData) return;

    setLoading(true);

   const payload = { ...pendingData };

		if (modalMode === 'create') {
			router.post(route('categorias.store'), payload, {
				preserveScroll: true,
				preserveState: true,
				onError:   manejarError("Error al crear la categoría"),
				onSuccess: manejarExito("Categoría creada"),
				onFinish:  finalizarAccion,
			});
		} else {
			router.put(route('categorias.update', {categoria: pendingData.categoria_id},), payload, {
				preserveScroll: true,
				preserveState: true,
				onError:   manejarError("Error al modificar la categoría"),
				onSuccess: manejarExito("Categoría actualizada"),
				onFinish:  finalizarAccion,
			});
		}
    setTextConfirm("");
    setConfirOpen(false);
  };

  const cancelarConfirmacion = () => {
    setConfirOpen(false);
  };

  //effect
  useEffect(() => {
    if ( categorias && categorias.data.length > 0 ) {
      setCacheadas(categorias.data);
    }else{
      setCacheadas([]);
    }
  }, [categorias]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Categorías" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm 
            data={data}
            set={setData}
            openCreate={openCreate} 
            resetearCategoria={setCacheadas}
          />
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableCategorias
            datos={cacheadas?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            totalFilas={categorias?.total ?? 0}
            current_page={categorias?.current_page ?? 0}
            last_page={categorias?.last_page ?? 0}
            next_page_url={categorias?.next_page_url ?? ''}
            prev_page_url={categorias?.prev_page_url ?? ''}
            />
        </div>
      </div>
      <NewEditCategoria
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        categoria={selectedCategoria}
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
        onClose={() => {
          setActivo(false);
        }}
      />
      <Loading
        open={loading}
        onClose={() => {}}
      />
    </AppLayout>
  );
}