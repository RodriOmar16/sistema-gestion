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
import PdfButton from '@/components/utils/pdfButton';
import ShowMessage from '@/components/utils/showMessage';
import { Select,  SelectContent,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { route } from 'ziggy-js';
import InputCuil from '@/components/utils/input-cuil';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Proveedores', href: '', } ];

type propsForm = {
  openCreate: () => void;
  resetearProveedor: (data:Proveedor[]) => void;
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

export function FiltrosForm({ openCreate, resetearProveedor }: propsForm){
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false);
  const { data, setData, errors, processing } = useForm<Proveedor>(proveedorVacio);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetearProveedor([]);
    const payload = {      ...data, buscar: true    }
    router.get(route('proveedores.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setEsperandoRespuesta(false),
    });
  };
  const handleReset = () => {
    setData(proveedorVacio);
  };

  const controlarCuit = (nro:number|string) => {
    console.log("nro: ", nro)
    setData('cuit', Number(nro));
    console.log("data: ", data)
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
          <Input value={data.proveedor_id} onChange={(e)=>setData('proveedor_id',e.target.value)}/>	
          { errors.proveedor_id && <p className='text-red-500	'>{ errors.proveedor_id }</p> }
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.nombre} onChange={(e)=>setData('nombre',e.target.value)}/>	
          { errors.nombre && <p className='text-red-500	'>{ errors.nombre }</p> }
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-4'>
          <label htmlFor="descripcion">Descripcion</label>
          <Input value={data.descripcion} onChange={(e)=>setData('descripcion',e.target.value)}/>	
          { errors.descripcion && <p className='text-red-500	'>{ errors.descripcion }</p> }
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="razonSocial">Razón social</label>
          <Input value={data.razon_social} onChange={(e)=>setData('razon_social',e.target.value)}/>	
          { errors.razon_social && <p className='text-red-500	'>{ errors.razon_social }</p> }
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="cuit">Cuit</label>
          <InputCuil
            data={String(data.cuit)}
            setData={controlarCuit}
            placeholder=''
          />
          { errors.cuit && <p className='text-red-500	'>{ errors.cuit }</p> }
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="nroTel">Nro. Teléfono</label>
          <Input value={data.nro_telefono} onChange={(e)=>setData('nro_telefono',e.target.value)}/>	
          { errors.nro_telefono && <p className='text-red-500	'>{ errors.nro_telefono }</p> }
        </div>
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex flex-col'>
          <label className='mr-2'>Inhabilitado</label>
          <Switch checked={data.inhabilitado==0 ? false: true} onCheckedChange={(val) => setData('inhabilitado', val)} />
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

  const { proveedores } = usePage().props as { proveedores?: Proveedor[] }; //necesito los props de inertia
  const { resultado, mensaje, proveedor_id } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    proveedor_id?: number;
  };
  const [propsActuales, setPropsActuales] = useState<{
    resultado: number | undefined | null;
    mensaje: string | undefined | null | '';
    proveedor_id: number | undefined | null;
  }>({ resultado: undefined, mensaje: undefined, proveedor_id: undefined });
  const [proveedoresCacheados, setProveedoresCacheados] = useState<Proveedor[]>([]);

  //funciones
  const confirmar = (data: Proveedor) => {
    if(data){
      setProveedorCopia( JSON.parse(JSON.stringify(data)) );
      const texto : string = data.inhabilitado === 0 ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' este proveedor?');
      setConfirmar(true);
    }
  };
  const inhabilitarHabilitar = () => {
    if (!proveedorCopia || !proveedorCopia.proveedor_id) return;
    setLoading(true);
    router.put(
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

  const accionar = () => {
    if (!pendingData) return;
    setLoading(true);

    const payload = JSON.parse(JSON.stringify(pendingData));

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
        proveedor_id: undefined
      });
    }
  }, [activo]);

  useEffect(() => {
    if (
      proveedores &&
      proveedores.length > 0 &&
      JSON.stringify(proveedores) !== JSON.stringify(proveedoresCacheados)
    ) {
      setProveedoresCacheados(proveedores);
    }
  }, [proveedores]);


  useEffect(() => {
    const cambioDetectado =
      (resultado && resultado  !== propsActuales.resultado)  ||
      (mensaje && mensaje    !== propsActuales.mensaje)

    if (cambioDetectado) {
      setPropsActuales({ resultado, mensaje, proveedor_id });

      const esError = resultado === 0;
      setTitle(esError ? 'Error' : modalMode === 'create' ? 'Proveedor nuevo' : 'Proveedor modificado');
      setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${proveedor_id})`);
      setColor(esError ? 'error' : 'success');
      setActivo(true);

      if (resultado === 1 && proveedor_id) {
        setModalOpen(false);
        router.get(route('proveedores.index'),
          { proveedor_id, buscar: true },
          { preserveScroll: true,	preserveState: true	}
        )
      }
    }
  }, [resultado, mensaje, proveedor_id]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Proveedores" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm openCreate={openCreate} resetearProveedor={setProveedoresCacheados}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableProveedores
            datos={proveedoresCacheados?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
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
    </AppLayout>
  );
}