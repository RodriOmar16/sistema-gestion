import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { FormaPago } from '@/types/typeCrud';
import { Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import NewEditFormasPago from '@/components/formasPago/newEditFormasPago';
import DataTableFormasPago from '@/components/formasPago/dataTableFormasPago';
import ModalConfirmar from '@/components/modalConfirmar';
import ShowMessage from '@/components/utils/showMessage';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Formas de Pago', href: '', } ];

type propsForm = {
  openCreate: () => void;
  resetearFormaPago: (data:FormaPago[]) => void;
}

const formaPagoVacio = {
  forma_pago_id: '',
  nombre:        '',
  descripcion:   '',
  inhabilitada:  false,
}

export function FiltrosForm({ openCreate, resetearFormaPago }: propsForm){
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false);
  const { data, setData, errors, processing }       = useForm<FormaPago>(formaPagoVacio);
  const [load, setLoad]                             = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetearFormaPago([]);
    setLoad(true);
    const payload = {      ...data, buscar: true    }
    
    router.get(route('formasPago.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setLoad(false),
    });
  };
  const handleReset = () => {
    setData(formaPagoVacio);
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
          <Input className='text-right' value={data.forma_pago_id} onChange={(e)=>setData('forma_pago_id',Number(e.target.value))}/>	
          { errors.forma_pago_id && <p className='text-red-500	'>{ errors.forma_pago_id }</p> }
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
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex flex-col'>
          <label className='mr-2'>Inhabilitada</label>
          <Switch checked={data.inhabilitada==0 ? false: true} onCheckedChange={(val) => setData('inhabilitada', val)} />
        </div>
        <div className='col-span-6 sm:col-span-8 md:col-span-8 lg:col-span-1 flex justify-end items-center'>
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
            {load ? (
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

export default function FormasPago(){
  //data
  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
  const [textConfir, setTextConfirm] = useState('');
  
  const [modalOpen, setModalOpen]                 = useState(false); //modal editar/crear
  const [modalMode, setModalMode]                 = useState<'create' | 'edit'>('create');
  const [selectedFormaPago, setSelectedFormaPago] = useState<FormaPago | undefined>(undefined);
  const [pendingData, setPendingData]             = useState<FormaPago | undefined>(undefined);
  const [loading, setLoading]                     = useState(false);
  
  const [openConfirmar, setConfirmar]       = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar]   = useState(''); 
  const [formaPagoCopia, setFormaPagoCopia] = useState<FormaPago>(formaPagoVacio);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const { formasPago } = usePage().props as { formasPago?: FormaPago[] }; //necesito los props de inertia
  const { resultado, mensaje, forma_pago_id } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    forma_pago_id?: number;
  };
  console.log("resultado, mensaje, forma_pago_id: ", resultado, mensaje, forma_pago_id)
  const [propsActuales, setPropsActuales] = useState<{
    resultado: number | undefined | null;
    mensaje: string | undefined | null | '';
    forma_pago_id: number | undefined | null;
  }>({ resultado: undefined, mensaje: undefined, forma_pago_id: undefined });
  const [formasPagoCacheados, setFormasPagoCacheados] = useState<FormaPago[]>([]);

  //funciones
  const confirmar = (data: FormaPago) => {
    if(data){
      setFormaPagoCopia( JSON.parse(JSON.stringify(data)) );
      const texto : string = data.inhabilitada === 0 ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' la forma de pago?');
      setConfirmar(true);
      setModalMode('edit');
    }
  };
  const inhabilitarHabilitar = () => {
    if (!formaPagoCopia || !formaPagoCopia.forma_pago_id) return;
    setLoading(true);
    router.put(
      route('formasPago.toggleEstado', { fp: formaPagoCopia.forma_pago_id }),{},
      {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          setLoading(false);
          setTextConfirmar('');
          setConfirmar(false);
          setFormaPagoCopia(formaPagoVacio);
        }
      }
    );
  };

  const cancelarInhabilitarHabilitar = () => { 
    setConfirmar(false);
  };

  const openCreate = () => {
    setModalMode('create');
    setSelectedFormaPago(undefined);
    setModalOpen(true);
  };

  const openEdit = (data: FormaPago) => {
    setModalMode('edit');
    setSelectedFormaPago(data);
    setModalOpen(true);
  };

  const handleSave = (data: FormaPago) => {
    setPendingData(data);
    let texto = (modalMode === 'create')? 'grabar' : 'guardar cambios a';
    setTextConfirm('¿Estás seguro de '+texto+' esta forma de pago?');
    setConfirOpen(true);
  };

  const accionar = () => {
    if (!pendingData) return;
    setLoading(true);

    const payload = JSON.parse(JSON.stringify(pendingData));
    console.log("payload: ", payload)
    if (modalMode === 'create') {
      router.post(
        route('formasPago.store'), payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoading(false);
            setTextConfirmar('');
            setConfirmar(false);
            setFormaPagoCopia(formaPagoVacio);
          }
        }
      );
    } else {
      router.put(
        route('formasPago.update',{fp: pendingData.forma_pago_id}), payload,
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
        forma_pago_id: undefined
      });
    }
  }, [activo]);

  useEffect(() => {
    if (
      formasPago &&
      formasPago.length > 0 &&
      JSON.stringify(formasPago) !== JSON.stringify(formasPagoCacheados)
    ) {
      setFormasPagoCacheados(formasPago);
    }
  }, [formasPago]);


  useEffect(() => {
    const cambioDetectado =
      (resultado && resultado !== propsActuales.resultado)  ||
      (mensaje && mensaje !== propsActuales.mensaje)

    if (cambioDetectado) {
      console.log("propsActuales: ", propsActuales)
      setPropsActuales({ resultado, mensaje, forma_pago_id });

      const esError = resultado === 0;
      setTitle(esError ? 'Error' : modalMode === 'create' ? 'Forma de pago nueva' : 'Forma de pago modificada');
      setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${forma_pago_id})`);
      setColor(esError ? 'error' : 'success');
      setActivo(true);

      if (resultado === 1 && forma_pago_id) {
        setModalOpen(false);
        router.get(route('formasPago.index'),
          { forma_pago_id, buscar: true },
          { preserveScroll: true,	preserveState: true	}
        )
      }
    }
  }, [resultado, mensaje, forma_pago_id]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Formas de Pago" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm openCreate={openCreate} resetearFormaPago={setFormasPagoCacheados}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableFormasPago
            datos={formasPagoCacheados?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            />
        </div>
      </div>
      <NewEditFormasPago
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        formaPago={selectedFormaPago}
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