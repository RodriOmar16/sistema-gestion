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
  data: BancoBilletera;
  set: (e:any) => void;
  openCreate:   () => void;
}

const bancoBilleteraVacio = {
  banco_billetera_id: '',
  nombre:             '',
  inhabilitado:       0,
  created_at:         '',
  updated_at:         ''
};

export function FiltrosForm({ data, set, openCreate }: propsForm){
  
  const [load, setLoad] = useState(false);
 
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
    set(bancoBilleteraVacio);
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
          <Input type='number' className='text-right' value={data.banco_billetera_id} onChange={(e)=>set({...data, 'banco_billetera_id': Number(e.target.value)})}/>	
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-4'>
          <label htmlFor="nombre">Nombre</label>
          <Input className='' value={data.nombre} onChange={(e)=>set({...data, 'nombre': e.target.value})}/>	
        </div>
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-3 flex flex-col'>
          <label className='mr-2'>Inhabilitado</label>
          <Switch checked={data.inhabilitado==0 ? false: true} onCheckedChange={(val) => set({...data, 'inhabilitado': val})} />
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
  const { data, setData, errors, processing } = useForm<BancoBilletera>(bancoBilleteraVacio);

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

  //const { bancosBilleteras } = usePage().props as { bancosBilleteras?: BancoBilletera[] }; //necesito los props de inertia
  const { bancosBilleteras } = usePage().props as {
    bancosBilleteras?:{
      data: BancoBilletera[],
      current_page:  number, 
      last_page:     number, 
      total:         number,
      next_page_url: string,
      prev_page_url: string,
    }
  };
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
    router.put(
      route('bancoBilletera.toggleEstado',{ bancoBilletera: bancoCopia.banco_billetera_id }),{},
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
          const { resultado, mensaje, banco_billetera_id } = page.props;
          
          if(resultado === 0){
            setTitle("Error inesperado");
            setText(`${mensaje} ❌ (ID: ${banco_billetera_id})`);
            setColor("success");
            setActivo(true);
            return
          }

          setTitle("Estado de Banco/Billetera cambiado");
          setText(`${mensaje} ✅ (ID: ${banco_billetera_id})`);
          setColor("success");
          setActivo(true);
        },
        onFinish: () => {
          setLoading(false);
          setConfirmarBloqText("");
          setOpenBloqText(false);
          setBancoCopia(bancoBilleteraVacio);

          //al momento de buscar
          setData(bancoBilleteraVacio);
          router.get(
            route('bancosBilleteras.index'), 
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

  const manejarError = (titulo: string) => (errors: any) => {
    console.log("Errores:", errors);
    setTitle(titulo);
    setText(Object.values(errors).join("\n"));
    setColor("error");
    setActivo(true);
  };
  const manejarExito = (titulo: string) => (page: any) => {
    const { resultado, mensaje, banco_billetera_id } = page.props;
    const title = resultado === 0 ? 'Error inesperado': titulo ;

    if(resultado === 0){
      setTitle(title);
      setText(mensaje);
      setColor("error");
      setActivo(true);
      return;
    }

    setTitle(title);
    setText(`${mensaje} ✅ (ID: ${banco_billetera_id})`);
    setColor("success");
    setActivo(true);

    //cierro modal
    setModalOpen(false);
  };
  const finalizarAccion = () => {
    setLoading(false);
    setPendingData(bancoBilleteraVacio);

    setData(bancoBilleteraVacio);
    router.get(route("bancosBilleteras.index"), {}, {
      preserveScroll: true,
      preserveState: true,
    });
  };


  const accionar = async () => {
    if (!pendingData) return;

    setLoading(true);

    const payload = JSON.parse(JSON.stringify(pendingData));

    if(modalMode === 'create'){
      router.post(
        route('bancoBilletera.store'),
        payload,
        {
          preserveScroll: true,
          preserveState: true,
          onError:   manejarError("Error al crear banco/billetera"),
          onSuccess: manejarExito("Banco/Billetera creada"),
          onFinish:  finalizarAccion,
        }
      );
    } else {
      router.put(
        route('bancoBilletera.update', { bancoBilletera: pendingData.banco_billetera_id },),
        payload,
        {
          preserveScroll: true,
          preserveState: true,
          onError:   manejarError("Error al modificar banco/billetera"),
          onSuccess: manejarExito("Banco/Billetera modificada"),
          onFinish:  finalizarAccion,
        }
      );
    }
    //reseteo el modal de confirmar
    setOpenConfirmar(false);
    setTextoConfirmar('');
    
  };

  const cancelarConfirmacion = () => {
    setTextoConfirmar('');
    setOpenConfirmar(false);
  };

  //effect
  useEffect(() => {
    if (bancosBilleteras && bancosBilleteras.data.length > 0) {
      setCacheados(bancosBilleteras.data);
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
            data={data}
            set={setData}
            openCreate={openCreate}
          />
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableBancosBilleteras
            datos={cacheados??[]}
            openEdit={openEdit}
            abrirConfirmar={confirmar}
            totalFilas={bancosBilleteras?.total ?? 0}
            current_page={bancosBilleteras?.current_page ?? 0}
            last_page={bancosBilleteras?.last_page ?? 0}
            next_page_url={bancosBilleteras?.next_page_url ?? ''}
            prev_page_url={bancosBilleteras?.prev_page_url ?? ''}
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
        onClose={() => setActivo(false)}
      />
      <Loading
        open={loading}
        onClose={() => {}}
      />
    </AppLayout>
  );
}