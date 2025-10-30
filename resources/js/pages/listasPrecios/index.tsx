import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { ListaPrecio } from '@/types/typeCrud';
import { Pen, Ban, Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import DataTableListasPrecios from '@/components/listasPrecios/dataTableListasPrecios';
import NewEditListaPrecio from '@/components/listasPrecios/newEditListaPrecio';
import ModalConfirmar from '@/components/modalConfirmar';
import PdfButton from '@/components/utils/pdf-button';
import ShowMessage from '@/components/utils/showMessage';
import { Select, SelectGroup, SelectContent,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { route } from 'ziggy-js';
import { convertirFechaBarrasGuiones, ordenarPorTexto } from '@/utils';
import { Multiple } from '@/types/typeCrud';
import { DatePicker } from '@/components/utils/date-picker';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Listas de Precio', href: '', } ];

type propsForm = {
  openCreate: () => void;
  resetearListaPrecio: (data:ListaPrecio[]) => void;
  proveedores: Multiple[];
}

const listaPrecioVacia = {
  lista_precio_id:     '',
  lista_precio_nombre: '',
  proveedor_id:        '',
  proveedor_nombre:    '',
  fecha_inicio:        (new Date()).toLocaleDateString(),
  fecha_fin:           (new Date()).toLocaleDateString(),
  inhabilitada:        false
}

export function FiltrosForm({ openCreate, resetearListaPrecio, proveedores }: propsForm){
  //data
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false);
  const { data, setData, errors, processing } = useForm<ListaPrecio>(listaPrecioVacia);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetearListaPrecio([]);
    const dataCopia = JSON.parse(JSON.stringify(data));
    dataCopia.fecha_inicio = convertirFechaBarrasGuiones(data.fecha_inicio);
    dataCopia.fecha_fin = convertirFechaBarrasGuiones(data.fecha_fin);
    const payload = {      ...dataCopia, buscar: true    }
    router.get(route('listasPrecios.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setEsperandoRespuesta(false),
    });
  };
  const handleReset = () => {
    setData(listaPrecioVacia);
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
        <div className='col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2'>
          <label htmlFor="id">Id</label>
          <Input value={data.lista_precio_id} onChange={(e)=>setData('lista_precio_id',e.target.value)}/>	
          { errors.lista_precio_id && <p className='text-red-500	'>{ errors.lista_precio_id }</p> }
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-8 lg:col-span-4'>
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.lista_precio_nombre} onChange={(e)=>setData('lista_precio_nombre',e.target.value)}/>	
          { errors.lista_precio_nombre && <p className='text-red-500	'>{ errors.lista_precio_nombre }</p> }
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3">
          <label htmlFor="fechaInicio">Fecha Inicio</label>
          <DatePicker fecha={(data.fecha_inicio)} setFecha={ (fecha:string) => {setData('fecha_inicio', fecha)} }/>
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3">
          <label htmlFor="fechaInicio">Fecha fin</label>
          <DatePicker fecha={(data.fecha_fin)} setFecha={ (fecha:string) => {setData('fecha_fin', fecha)} }/>
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="descripcion">Proveedor</label>
            <Select
              value={String(data.proveedor_id)}
              onValueChange={(value) => setData('proveedor_id', Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {proveedores.map((e: any) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
        </div>
        <div className='col-span-6 sm:col-span-2 md:col-span-2 lg:col-span-3 flex flex-col'>
          <label className='mr-2'>Inhabilitada</label>
          <Switch checked={data.inhabilitada==0 ? false: true} onCheckedChange={(val) => setData('inhabilitada', val)} />
        </div>  
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-6 flex justify-end items-center'>
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

export default function ListasPrecios(){
  //data
  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
  const [textConfir, setTextConfirm] = useState('');
  
  const [modalOpen, setModalOpen]                     = useState(false); //modal editar/crear
  const [modalMode, setModalMode]                     = useState<'create' | 'edit'>('create');
  const [selectedListaPrecio, setSelectedListaPrecio] = useState<ListaPrecio | undefined>(undefined);
  const [pendingData, setPendingData]                 = useState<ListaPrecio | undefined>(undefined);
  const [loading, setLoading]                         = useState(false);
  
  const [openConfirmar, setConfirmar]           = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar]       = useState(''); 
  const [listaPrecioCopia, setListaPrecioCopia] = useState<ListaPrecio>(listaPrecioVacia);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const { listas } = usePage().props as { listas?: ListaPrecio[] }; //necesito los props de inertia
  const { resultado, mensaje, lista_precio_id } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    lista_precio_id?: number;
  };
  const [propsActuales, setPropsActuales] = useState<{
    resultado: number | undefined | null;
    mensaje: string | undefined | null | '';
    lista_precio_id: number | undefined | null;
  }>({ resultado: undefined, mensaje: undefined, lista_precio_id: undefined });
  const [listasPreciosCacheadas, setListasPreciosCacheadas] = useState<ListaPrecio[]>([]);

  const [proveedores, setProveedores] = useState<Multiple[]>([]);

  //funciones
  const confirmar = (data: ListaPrecio) => {
    if(data){
      setListaPrecioCopia( JSON.parse(JSON.stringify(data)) );
      const texto : string = data.inhabilitada === 0 ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' esta lista de precio?');
      setConfirmar(true);
    }
  };
  const inhabilitarHabilitar = () => {
    console.log("listaPrecioCopia: ", listaPrecioCopia)
    if (!listaPrecioCopia || !listaPrecioCopia.lista_precio_id) return;
    console.log("Enviando ID:", listaPrecioCopia.lista_precio_id);
    setLoading(true);
    router.put(
      route('listasPrecios.toggleEstado', { lista: listaPrecioCopia.lista_precio_id }),{},
      {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          setLoading(false);
          setTextConfirmar('');
          setConfirmar(false);
          setListaPrecioCopia(listaPrecioVacia);
        }
      }
    );
  };

  const cancelarInhabilitarHabilitar = () => { 
    setConfirmar(false);
  };

  const openCreate = () => {
    setModalMode('create');
    setSelectedListaPrecio(undefined);
    setModalOpen(true);
  };

  const openEdit = (data: ListaPrecio) => {
    setModalMode('edit');
    setSelectedListaPrecio(data);
    setModalOpen(true);
  };

  const handleSave = (data: ListaPrecio) => {
    setPendingData(data);
    let texto = (modalMode === 'create')? 'grabar' : 'guardar cambios a';
    setTextConfirm('¿Estás seguro de '+texto+' esta lista de precio?');
    setConfirOpen(true);
  };

  const accionar = () => {
    if (!pendingData) return;
    setLoading(true);

    const payload = JSON.parse(JSON.stringify(pendingData));

    if (modalMode === 'create') {
      router.post(
        route('listasPrecios.store'), payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoading(false);
            setTextConfirmar('');
            setConfirmar(false);
            setListaPrecioCopia(listaPrecioCopia);
          }
        }
      );
    } else {
      router.put(
        route('listasPrecios.update',{lista: pendingData.lista_precio_id}), payload,
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

  //useEffect
  useEffect(() => {
    //optengo los datos del formulario
    fetch('/proveedores_habilitados')
    .then(res => res.json())
    .then(data => {
      setProveedores(ordenarPorTexto(data, 'nombre'));
    });
  }, []);
  useEffect(() => {
    if (!activo && propsActuales.resultado !== undefined) {
      setPropsActuales({
        resultado: undefined,
        mensaje: undefined,
        lista_precio_id: undefined
      });
    }
  }, [activo]);

  useEffect(() => {
    //esto se hace porque inertia me destruia muy rapido el array principal en este caso listas y por eso tuve que guardardo en una variable temporal
    //es solo para que no sea tan feo
    if (
      listas &&
      listas.length > 0 &&
      JSON.stringify(listas) !== JSON.stringify(listasPreciosCacheadas)
    ) {
      setListasPreciosCacheadas(listas);
    }
  }, [listas]);


  useEffect(() => {
    const cambioDetectado =
      (resultado && resultado  !== propsActuales.resultado)  ||
      (mensaje && mensaje    !== propsActuales.mensaje)

    if (cambioDetectado) {
      setPropsActuales({ resultado, mensaje, lista_precio_id });

      const esError = resultado === 0;
      setTitle(esError ? 'Error' : modalMode === 'create' ? 'Lista de precio nueva' : 'Lista de precio modificada');
      setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${lista_precio_id})`);
      setColor(esError ? 'error' : 'success');
      setActivo(true);

      if (resultado === 1 && lista_precio_id) {
        setModalOpen(false);
        router.get(route('listasPrecios.index'),
          { lista_precio_id, buscar: true },
          { preserveScroll: true,	preserveState: true	}
        )
      }
    }
  }, [resultado, mensaje, lista_precio_id]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Listas de Precios" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm 
            openCreate={openCreate} 
            resetearListaPrecio={setListasPreciosCacheadas}
            proveedores={proveedores}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableListasPrecios
            datos={listasPreciosCacheadas?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            />
        </div>
      </div>
      <NewEditListaPrecio
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        listaPrecio={selectedListaPrecio}
        onSubmit={handleSave}
        loading={loading}
        proveedores={proveedores}
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