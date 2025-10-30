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

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Categorias', href: '', } ];

type propsForm = {
  openCreate: () => void;
  resetearCategoria: (categoria:Categoria[]) => void;
}

const categoriaVacia = {
  categoria_id: '',
  nombre: '',
  inhabilitada: false,
}

export function FiltrosForm({ openCreate, resetearCategoria }: propsForm){
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false);
  const { data, setData, errors, processing } = useForm(categoriaVacia);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetearCategoria([]);
    const payload = {      ...data, buscar: true    }
    router.get(route('categorias.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setEsperandoRespuesta(false),
    });
  };
  const handleReset = () => {
    setData(categoriaVacia);
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
          <Input value={data.categoria_id} onChange={(e)=>setData('categoria_id',e.target.value)}/>	
          { errors.categoria_id && <p className='text-red-500	'>{ errors.categoria_id }</p> }
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-4'>
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.nombre} onChange={(e)=>setData('nombre',e.target.value)}/>	
          { errors.nombre && <p className='text-red-500	'>{ errors.nombre }</p> }
        </div>
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex flex-col'>
          <label className='mr-2'>Inhabilitada</label>
          <Switch checked={data.inhabilitada} onCheckedChange={(val) => setData('inhabilitada', val)} />
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

  const { categorias } = usePage().props as { categorias?: Categoria[] }; //necesito los props de inertia
  const { resultado, mensaje, categoria_id } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    categoria_id?: number;
  };
  const [propsActuales, setPropsActuales] = useState<{
    resultado: number | undefined | null;
    mensaje: string | undefined | null | '';
    categoria_id: number | undefined | null;
  }>({ resultado: undefined, mensaje: undefined, categoria_id: undefined });
  const [categoriasCacheadas, setCategoriasCacheadas] = useState<Categoria[]>([]);

  //funciones
  const confirmar = (data: Categoria) => {
    if(data){
      setCategoriaCopia( JSON.parse(JSON.stringify(data)) );
      const texto : string = data.inhabilitada === 0 ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' esta categoría?');
      setConfirmar(true);
    }
  };
  const inhabilitarHabilitar = () => {
    if (!categoriaCopia || !categoriaCopia.categoria_id) return;
    setLoading(true);
    router.put(
      route('categorias.toggleEstado', { categoria: categoriaCopia.categoria_id }),{},
      {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          setLoading(false);
          setTextConfirmar('');
          setConfirmar(false);
          setCategoriaCopia(categoriaVacia);
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

  const accionar = () => {
    if (!pendingData) return;
    setLoading(true);

    const payload = JSON.parse(JSON.stringify(pendingData));

    if (modalMode === 'create') {
      router.post(
        route('categorias.store'), payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoading(false);
            setTextConfirmar('');
            setConfirmar(false);
            setCategoriaCopia(categoriaVacia);
          }
        }
      );
    } else {
      router.put(
        route('categorias.update',{categoria: pendingData.categoria_id}), payload,
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
        categoria_id: undefined
      });
    }
  }, [activo]);

  useEffect(() => {
    if (
      categorias &&
      categorias.length > 0 &&
      JSON.stringify(categorias) !== JSON.stringify(categoriasCacheadas)
    ) {
      setCategoriasCacheadas(categorias);
    }
  }, [categorias]);


  useEffect(() => {
    const cambioDetectado =
      (resultado && resultado  !== propsActuales.resultado)  ||
      (mensaje && mensaje    !== propsActuales.mensaje)

    if (cambioDetectado) {
      setPropsActuales({ resultado, mensaje, categoria_id });

      const esError = resultado === 0;
      setTitle(esError ? 'Error' : modalMode === 'create' ? 'Categoría nueva' : 'Categoría modificada');
      setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${categoria_id})`);
      setColor(esError ? 'error' : 'success');
      setActivo(true);

      if (resultado === 1 && categoria_id) {
        setModalOpen(false);
        router.get(route('categorias.index'),
          { categoria_id, buscar: true },
          { preserveScroll: true,	preserveState: true	}
        )
      }
    }
  }, [resultado, mensaje, categoria_id]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Categorías" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm openCreate={openCreate} resetearCategoria={setCategoriasCacheadas}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableCategorias
            datos={categoriasCacheadas?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            />
        </div>
      </div>
      <NewEditCategoria
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        categoria={selectedCategoria}
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