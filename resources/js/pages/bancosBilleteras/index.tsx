import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Autocomplete, BancoBilletera } from '@/types/typeCrud';
import { Search, Brush, Loader2, CirclePlus, Filter, FolderKanban } from 'lucide-react';
import ModalConfirmar from '@/components/modalConfirmar';
import ShowMessage from '@/components/utils/showMessage';
import DataTableBancosBilleteras from '@/components/bancosBilleteras/dataTableBankBilletera';
import NewEditBancoBilletera from '@/components/bancosBilleteras/newEditBankBilletera';
import { apiRequest, convertirFechaBarrasGuiones, getCsrfToken } from '@/utils';
import Loading from '@/components/utils/loadingDialog';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Bancos Billeteras', href: '', } ];

type propsForm = {
  openCreate:   () => void;
}

const bancoBilleteraVacio = {
  banco_billetera_id: '',
  nombre:             '',
  inhabilitado:       0,
  created_at:         '',
  updated_at:         ''
};

export function FiltrosForm({ openCreate }: propsForm){
  const { data, setData, errors, processing } = useForm<BancoBilletera>(bancoBilleteraVacio);
  const [load, setLoad]                       = useState(false);
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoad(true);
    const payload = {
      ...data,
      buscar: true    
    }
    
    router.get(route('bancosBilleteras.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setLoad(false),
    });
  };

  const handleReset = () => {
    setData(bancoBilleteraVacio);
  };

  return (
    <div>
      <div className='flex items-center justify-between px-3 pt-3'>
        <div className='flex'> <Filter size={20} />  Filtros</div>
        <div>
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
      </div>
      <form className='grid grid-cols-12 gap-4 px-4 pt-1 pb-4' onSubmit={handleSubmit}>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2'>
          <label htmlFor="id">Id</label>
          <Input type='number' className='text-right' value={data.banco_billetera_id} onChange={(e)=>setData('banco_billetera_id',Number(e.target.value))}/>	
          { errors.banco_billetera_id && <p className='text-red-500	'>{ errors.banco_billetera_id }</p> }
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-4'>
          <label htmlFor="nombre">Nombre</label>
          <Input className='' value={data.nombre} onChange={(e)=>setData('nombre',e.target.value)}/>	
          { errors.nombre && <p className='text-red-500	'>{ errors.nombre }</p> }
        </div>
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-3 flex flex-col'>
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

export default function BancosBilleteras(){
  //data
  const [openConfirmar, setOpenConfirmar]   = useState(false); //modal para confirmar acciones para cuado se crea o edita
  const [textoConfirmar, setTextoConfirmar] = useState('');

  const [openBloqText, setOpenBloqText]           = useState(false); 
  const [confirmarBloqText, setConfirmarBloqText] = useState(''); 
  
  const [modalOpen, setModalOpen]         = useState(false); //modal editar/crear
  const [modalMode, setModalMode]         = useState<'create' | 'edit'>('create');
  const [selectedBanco, setSelectedBanco] = useState<BancoBilletera | undefined>(undefined);
  const [pendingData, setPendingData]     = useState<BancoBilletera | undefined>(undefined);
  const [loading, setLoading]             = useState(false);
  
  //const [openConfirmar, setConfirmar]     = useState(false); //para editar el estado
  //
  const [bancoCopia, setBancoCopia]       = useState<BancoBilletera>(bancoBilleteraVacio);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const { bancosBilleteras } = usePage().props as { bancosBilleteras?: BancoBilletera[] }; //necesito los props de inertia
  const { resultado, mensaje, banco_billetera_id, timestamp } = usePage().props as {
    resultado?:          number;
    mensaje?:            string;
    banco_billetera_id?: number;
    timestamp?:          number;
  };
  const [cacheados, setCacheados] = useState<BancoBilletera[]>([]);
  const [respuesta, setResp]      = useState<{resultado: number, banco_billetera_id: number}>({resultado: 0, banco_billetera_id: 0});

  //funciones
  const confirmar = (data: BancoBilletera) => {
    if(data){
      setBancoCopia( JSON.parse(JSON.stringify(data)) );
      let texto = data.inhabilitado == 0 ? 'inhabilitar' : 'habilitar'
      setConfirmarBloqText('Estás seguro de querer '+ texto +' este banco/billetera?');
      setOpenBloqText(true);
      setModalMode('edit');
    }
  };

  const inhabilitarHabilitar = async () => {
    if (!bancoCopia || !bancoCopia.banco_billetera_id) return;
    setLoading(true);

    try {
      let resp : {resultado: number, banco_billetera_id: number, mensaje?:string} ;

      resp = await apiRequest(route('bancoBilletera.toggleEstado',{ bancoBilletera: bancoCopia.banco_billetera_id }), 'PUT');

      setResp({ resultado: resp.resultado, banco_billetera_id: resp.banco_billetera_id });

      if (resp.resultado === 0) {
        setTitle('Error');
        setText(resp.mensaje ?? 'Error inesperado');
        setColor('error');
        setActivo(true);
        return;
      }

      setTitle('Estado modificado');
      setText(`${resp.mensaje} (ID: ${resp.banco_billetera_id})`);
      setColor('success');
      setActivo(true);

    } catch (error: any) {
      setTitle('Error de red');
      setText(error.message);
      setColor('error');
      setActivo(true);
    } finally {
      setLoading(false);
      setBancoCopia(bancoBilleteraVacio);
      setConfirmarBloqText('');
      setOpenBloqText(false);
    }
  };

  const cancelarInhabilitarHabilitar = () => { 
    setConfirmarBloqText('');
    setOpenBloqText(false);
  };

  const openCreate = () => {
    setModalMode('create');
    setSelectedBanco(undefined);
    setModalOpen(true);
  };

  const openEdit = (data: BancoBilletera) => {
    setModalMode('edit');
    setSelectedBanco(data);
    setModalOpen(true);
  };

  const handleSave = (data: BancoBilletera) => {
    setPendingData(data);
    let texto = (modalMode === 'create')? 'grabar' : 'guardar cambios a';
    setTextoConfirmar('¿Estás seguro de '+texto+' este gasto?');
    setOpenConfirmar(true);
  };

  const accionar = async () => {
    if (!pendingData) return;
    
    setOpenConfirmar(false);
    setLoading(true);

    const payload = { ...pendingData };

    try {
      let resp : {resultado: number, banco_billetera_id: number, mensaje?:string} ;
      let titulo;

      if (modalMode === 'create') {
        resp = await apiRequest(route('bancoBilletera.store'), 'POST', payload);
        titulo = 'Banco/Billetera nuevo';
      } else {
        resp = await apiRequest(route('bancoBilletera.update', { bancoBilletera: pendingData.banco_billetera_id }), 'PUT', payload);
        titulo = 'Banco/Billetera modificado';
      }

      setResp({ resultado: resp.resultado, banco_billetera_id: resp.banco_billetera_id });

      if (resp.resultado === 0) {
        setTitle('Error');
        setText(resp.mensaje ?? 'Error inesperado');
        setColor('error');
        setActivo(true);
        return;
      }

      setTitle(titulo);
      setText(`${resp.mensaje} (${resp.banco_billetera_id})`);
      setColor('success');
      setActivo(true);

    } catch (error: any) {
      setTitle('Error de red');
      setText(error.message);
      setColor('error');
      setActivo(true);
    } finally {
      setLoading(false);
      setTextoConfirmar('');
    }
  };

  const cancelarConfirmacion = () => {
    setTextoConfirmar('');
    setOpenConfirmar(false);
  };

  //effect
  useEffect(() => {
    if (bancosBilleteras && bancosBilleteras?.length > 0) {
      setCacheados(bancosBilleteras);
    } else {
      setCacheados([]);
    }
  }, [bancosBilleteras]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Bancos Billeteras" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm 
            openCreate={openCreate}
          />
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableBancosBilleteras
            datos={cacheados??[]}
            openEdit={openEdit}
            abrirConfirmar={confirmar}
          />
        </div>
      </div>
      <NewEditBancoBilletera
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        banco={selectedBanco}
        onSubmit={handleSave}
      />
      <ModalConfirmar
        open={openConfirmar}
        text={textoConfirmar}
        onSubmit={accionar}
        onCancel={cancelarConfirmacion}
      />
      <ModalConfirmar
        open={openBloqText}
        text={confirmarBloqText}
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
          if (respuesta.resultado === 1 && respuesta.banco_billetera_id) {
            setModalOpen(false);
            router.get(route('bancosBilleteras.index'),
              { banco_billetera_id: respuesta.banco_billetera_id, buscar: true },
              { preserveScroll: true,	preserveState: true	}
            )
          }
        }}
      />
      <Loading
        open={loading}
        onClose={() => {}}
      />
    </AppLayout>
  );
}