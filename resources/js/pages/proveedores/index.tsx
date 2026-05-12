import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Proveedor } from '@/types/typeCrud';
import { Pen, Ban, Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import NewEditProveedor from '@/components/proveedores/newEditProveedores';
import DataTableProveedores from '@/components/proveedores/dataTableProveedores';
import ModalConfirmar from '@/components/modalConfirmar';
import PdfButton from '@/components/utils/pdf-button';
import ShowMessage from '@/components/utils/showMessage';
import { Select,  SelectContent,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { route } from 'ziggy-js';
import InputCuil from '@/components/utils/input-cuil';
import Loading from '@/components/utils/loadingDialog';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Proveedores', href: '', } ];

type propsForm = {
  data: Proveedor;
  set: (e:any) => void;
  openCreate: () => void;
}

const proveedorVacio = {
  proveedor_id: '',
  nombre:       '',
  descripcion:  '',
  razon_social: '',
  cuit:         '',
  nro_telefono: '',
  inhabilitado: false,
}

export function FiltrosForm({ data, set, openCreate }: propsForm){
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    const payload = {      ...data, buscar: true    }
    router.get(route('proveedores.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => { setProcessing(false); }
    });
  };
  const handleReset = () => {
    set(proveedorVacio);
  };

  const controlarCuit = (nro:number|string) => {
    set({...data, 'cuit': Number(nro)});
  }

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
          <Input value={data.proveedor_id} onChange={(e)=>set({...data, 'proveedor_id': e.target.value})}/>	
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.nombre} onChange={(e)=>set({...data, 'nombre': e.target.value})}/>	
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-4'>
          <label htmlFor="descripcion">Descripcion</label>
          <Input value={data.descripcion} onChange={(e)=>set({...data, 'descripcion': e.target.value})}/>	
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="razonSocial">Razón social</label>
          <Input value={data.razon_social} onChange={(e)=>set({...data, 'razon_social': e.target.value})}/>	
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="cuit">Cuit</label>
          <InputCuil
            data={String(data.cuit)}
            setData={controlarCuit}
            placeholder=''
          />
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="nroTel">Nro. Teléfono</label>
          <Input value={data.nro_telefono} onChange={(e)=>set({...data, 'nro_telefono': e.target.value})}/>	
        </div>
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex flex-col'>
          <label className='mr-2'>Inhabilitado</label>
          <Switch checked={data.inhabilitado==0 ? false: true} onCheckedChange={(val) => set({...data, 'inhabilitado': val})} />
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

export default function Proveedores(){
  //data
  const { data, setData, errors, processing } = useForm<Proveedor>(proveedorVacio);

  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
  const [textConfir, setTextConfirm] = useState('');
  
  const [modalOpen, setModalOpen]                 = useState(false); //modal editar/crear
  const [modalMode, setModalMode]                 = useState<'create' | 'edit'>('create');
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | undefined>(undefined);
  const [pendingData, setPendingData]             = useState<Proveedor | undefined>(undefined);
  const [loading, setLoading]                     = useState(false);
  
  const [openConfirmar, setConfirmar]       = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar]   = useState(''); 
  const [proveedorCopia, setProveedorCopia] = useState<Proveedor>(proveedorVacio);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  //const { proveedores } = usePage().props as { proveedores?: Proveedor[] }; //necesito los props de inertia
  const { proveedores } = usePage().props as {
    proveedores?: {
      data: Proveedor[],
      current_page:  number, 
      last_page:     number, 
      total:         number,
      next_page_url: string,
      prev_page_url: string,
    }
  };

  const [cacheados, setCacheados] = useState<Proveedor[]>([]);

  //funciones
  const confirmar = (data: Proveedor) => {
    if(data){
      setProveedorCopia( JSON.parse(JSON.stringify(data)) );
      const texto : string = data.inhabilitado === 0 ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' este proveedor?');
      setConfirmar(true);
      setModalMode('edit');
    }
  };
  const inhabilitarHabilitar = () => {
    if (!proveedorCopia || !proveedorCopia.proveedor_id) return;
    setLoading(true);
    /*router.put(
      route('proveedores.toggleEstado', { proveedor: proveedorCopia.proveedor_id }),{},
      {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          setLoading(false);
          setTextConfirmar('');
          setConfirmar(false);
          setProveedorCopia(proveedorVacio);
        }
      }
    );*/
    router.put(
      route('proveedores.toggleEstado', { proveedor: proveedorCopia.proveedor_id }),{},
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
          const { resultado, mensaje, proveedor_id } = page.props;
          
          if(resultado === 0){
            setTitle("Error inesperado");
            setText(`${mensaje} ❌ (ID: ${proveedor_id})`);
            setColor("error");
            setActivo(true);
          }

          setTitle("Proveedor actualizado");
          setText(`${mensaje} ✅ (ID: ${proveedor_id})`);
          setColor("success");
          setActivo(true);
        },
        onFinish: () => {
          setLoading(false);
          setTextConfirmar('');
          setConfirmar(false);
          setProveedorCopia(proveedorVacio);
  
          //al momento de buscar
          setData(proveedorVacio);
          router.get(
            route('proveedores.index'), 
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
    setSelectedProveedor(undefined);
    setModalOpen(true);
  };

  const openEdit = (data: Proveedor) => {
    setModalMode('edit');
    setSelectedProveedor(data);
    setModalOpen(true);
  };

  const handleSave = (data: Proveedor) => {
    setPendingData(data);
    let texto = (modalMode === 'create')? 'grabar' : 'guardar cambios a';
    setTextConfirm('¿Estás seguro de '+texto+' este proveedor?');
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
    const { resultado, mensaje, proveedor_id } = page.props;
    const title = resultado === 0 ? 'Error inesperado': titulo ;

    if(resultado === 0){
      setTitle(title);
      setText(mensaje);
      setColor("error");
      setActivo(true);
      return;
    }

    setTitle(title);
    setText(`${mensaje} ✅ (ID: ${proveedor_id})`);
    setColor("success");
    setActivo(true);

    setModalOpen(false);
  };
  const finalizarAccion = () => {
    setLoading(false);
    setPendingData(proveedorVacio);
    setData(proveedorVacio);
    router.get(route("proveedores.index"), {}, {
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
        route('proveedores.store'), payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoading(false);
            setTextConfirmar('');
            setConfirmar(false);
            setProveedorCopia(proveedorVacio);
          }
        }
      );
    } else {
      router.put(
        route('proveedores.update',{proveedor: pendingData.proveedor_id}), payload,
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
			router.post(route('proveedores.store'), payload, {
				preserveScroll: true,
				preserveState: true,
				onError:   manejarError("Error al crear el proveedor"),
				onSuccess: manejarExito("Proveedor creado"),
				onFinish:  finalizarAccion,
			});
		} else {
			router.put(route('proveedores.update',{proveedor: pendingData.proveedor_id}), payload, {
				preserveScroll: true,
				preserveState: true,
				onError:   manejarError("Error al modificar el proveedor"),
				onSuccess: manejarExito("Proveedor actualizado"),
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
    if ( proveedores && proveedores.data.length > 0 ) {
      setCacheados(proveedores.data);
    } else {
      setCacheados([]);
    }
  }, [proveedores]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Proveedores" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm 
            data={data}
            set={setData}
            openCreate={openCreate} 
          />
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableProveedores
            datos={cacheados?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            totalFilas={proveedores?.total ?? 0}
            current_page={proveedores?.current_page ?? 0}
            last_page={proveedores?.last_page ?? 0}
            next_page_url={proveedores?.next_page_url ?? ''}
            prev_page_url={proveedores?.prev_page_url ?? ''}
            />
        </div>
      </div>
      <NewEditProveedor
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        proveedor={selectedProveedor}
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
      <Loading
        open={loading}
        onClose={() => {}}
      />
    </AppLayout>
  );
}