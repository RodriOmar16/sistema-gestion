import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Turno } from '@/types/typeCrud';
import { Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import DataTableTurnos from '@/components/turnos/dataTableTurnos';
import NewEditTurno from '@/components/turnos/newEditTurno';
import ModalConfirmar from '@/components/modalConfirmar';
import ShowMessage from '@/components/utils/showMessage';
import Loading from '@/components/utils/loadingDialog';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Turnos', href: '', } ];

type propsForm = {
  data: Turno;
  set: (e:any) => void;
  openCreate: () => void;
}

const turnoVacio = {
  turno_id:     '',
  nombre:       '',
  apertura:     '',
  cierre:       '',
  inhabilitado: false,
}

export function FiltrosForm({ data, set, openCreate }: propsForm){
  const [load, setLoad]                             = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoad(true);
    const payload = {      ...data, buscar: true    }
    
    router.get(route('turnos.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setLoad(false),
    });
  };
  const handleReset = () => {
    set(turnoVacio);
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
        <div className='col-span-12 sm:col-span-3 md:col-span-3 lg:col-span-2'>
          <label htmlFor="id">Id</label>
          <Input className='text-right' value={data.turno_id} onChange={(e)=>set({...data, 'turno_id': Number(e.target.value)})}/>	
        </div>
        <div className='col-span-12 sm:col-span-5 md:col-span-5 lg:col-span-4'>
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.nombre} onChange={(e)=>set({...data, 'nombre': e.target.value})}/>	
        </div>        
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-3 flex flex-col'>
          <label className='mr-2'>Inhabilitado</label>
          <Switch checked={Boolean(data.inhabilitado)} onCheckedChange={(val) => set({...data, 'inhabilitado': val})} />
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

export default function Turnos(){
  //data
  const { data, setData, errors, processing }       = useForm<Turno>(turnoVacio);
  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
  const [textConfir, setTextConfirm] = useState('');
  
  const [modalOpen, setModalOpen]         = useState(false); //modal editar/crear
  const [modalMode, setModalMode]         = useState<'create' | 'edit'>('create');
  const [selectedTurno, setSelectedTurno] = useState<Turno | undefined>(undefined);
  const [pendingData, setPendingData]     = useState<Turno | undefined>(undefined);
  const [loading, setLoading]             = useState(false);
  
  const [openConfirmar, setConfirmar]     = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar] = useState(''); 
  const [turnoCopia, setTurnoCopia]       = useState<Turno>(turnoVacio);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const { turnos } = usePage().props as { turnos?: Turno[] }; //necesito los props de inertia
  const [turnosCacheados, setTurnosCacheados] = useState<Turno[]>([]);

  //funciones
  const confirmar = (data: Turno) => {
    if(data){
      setTurnoCopia( JSON.parse(JSON.stringify(data)) );
      const texto : string = data.inhabilitado === 0 ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' este turno?');
      setConfirmar(true);
      setModalMode('edit');
    }
  };
  const inhabilitarHabilitar = () => {
    if (!turnoCopia || !turnoCopia.turno_id) return;
    setLoading(true);
    
    router.put(
      route('turnos.toggleEstado', { turno: turnoCopia.turno_id }),{},
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
          const { resultado, mensaje, turno_id } = page.props;
          
          if(resultado === 0){
            setTitle("Error inesperado");
            setText(`${mensaje} ❌ (ID: ${turno_id})`);
            setColor("error");
            setActivo(true);
          }

          setTitle("Turno actualizado");
          setText(`${mensaje} ✅ (ID: ${turno_id})`);
          setColor("success");
          setActivo(true);
        },
        onFinish: () => {
          setLoading(false);
          setTextConfirmar('');
          setConfirmar(false);
          setTurnoCopia(turnoCopia);
  
          //al momento de buscar
          setData(turnoCopia);
          router.get(
            route('turnos.index'), 
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
    setSelectedTurno(undefined);
    setModalOpen(true);
  };

  const openEdit = (data: Turno) => {
    setModalMode('edit');
    setSelectedTurno(data);
    setModalOpen(true);
  };

  const handleSave = (data: Turno) => {
    setPendingData(data);
    let texto = (modalMode === 'create')? 'grabar' : 'guardar cambios a';
    setTextConfirm('¿Estás seguro de '+texto+' este turno?');
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
    const { resultado, mensaje, turno_id } = page.props;
    const title = resultado === 0 ? 'Error inesperado': titulo ;

    if(resultado === 0){
      setTitle(title);
      setText(mensaje);
      setColor("error");
      setActivo(true);
      return;
    }

    setTitle(title);
    setText(`${mensaje} ✅ (ID: ${turno_id})`);
    setColor("success");
    setActivo(true);

    setModalOpen(false);
  };
  const finalizarAccion = () => {
    setLoading(false);
    setPendingData(turnoVacio);
    setData(turnoVacio);
    router.get(route("turnos.index"), {}, {
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
        route('turnos.store'), payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoading(false);
            setTextConfirmar('');
            setConfirmar(false);
            setTurnoCopia(turnoVacio);
          }
        }
      );
    } else {
      router.put(
        route('turnos.update',{turno: pendingData.turno_id}), payload,
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
    setConfirOpen(false);*/
    const payload = { ...pendingData };

		if (modalMode === 'create') {
			router.post(route('turnos.store'), payload, {
				preserveScroll: true,
				preserveState: true,
				onError:   manejarError("Error al crear el turno"),
				onSuccess: manejarExito("Turno creado"),
				onFinish:  finalizarAccion,
			});
		} else {
			router.put(route('turnos.update',{turno: pendingData.turno_id}), payload, {
				preserveScroll: true,
				preserveState: true,
				onError:   manejarError("Error al modificar el turno"),
				onSuccess: manejarExito("Turno actualizado"),
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
    if ( turnos && turnos.length > 0 ) {
      setTurnosCacheados(turnos);
    }else { setTurnosCacheados([]); }
  }, [turnos]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Turnos" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm 
            data={data}
            set={setData}
            openCreate={openCreate}
          />
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableTurnos
            datos={turnosCacheados?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            />
        </div>
      </div>
      <NewEditTurno
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        turno={selectedTurno}
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