import { ListaPrecioProducto, Multiple, Producto } from "@/types/typeCrud";
import { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import ShowMessage from "@/components/utils/showMessage";
import ModalConfirmar from "@/components/modalConfirmar";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { route } from "ziggy-js";
import { ordenarPorTexto } from "@/utils";
import { Brush, CirclePlus, Filter, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GenericSelect from "@/components/utils/genericSelect";

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Listas de Precio', href: '', } ];

const listaVacia = {
  lista_precio_id:     0,
  lista_precio_nombre: '',
  proveedor_id:        0,
  proveedor_nombre:    '',
  producto_id:         0,
  producto_nombre:     '',
  precio:              0,
  porcentaje:          0,
  precio_sugerido:     0,
}

/*function ProductoSelect() {
  const loadOptions = (inputValue: string, callback: any) => {
    fetch(`/productos/buscar?buscar=${inputValue}`)
      .then(res => res.json())
      .then(data => {
        callback(
          data.elementos.data.map((p: any) => ({
            value: p.id,
            label: p.nombre,
          }))
        );
      });
  };

  return (
    <AsyncSelect
      menuPortalTarget={document.body} 
      styles={{ 
        menuPortal: base => ({ ...base, zIndex: 9999 }) ,
        menu: base => ({ ...base, maxHeight: 200, // altura máxima del menú 
          overflowY: 'auto', // activa scroll vertical 
        }),
      }}
      cacheOptions
      loadOptions={loadOptions}
      defaultOptions
      placeholder="Buscar..."
      isClearable
    />
  );
}*/

type propsForm = {
  openCreate: () => void;
  resetearListaPrecio: (data:ListaPrecioProducto[]) => void;
  proveedores: Multiple[];
}
export function FiltrosForm({ openCreate, resetearListaPrecio, proveedores }: propsForm){
  //data
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false);
  const { data, setData, errors, processing } = useForm<ListaPrecioProducto>(listaVacia);
  const [optionProduct, setOptionProduct] = useState<{value:number, label: string}|null>(null);
  const [optionProv, setOptionProv] = useState<{value:number, label: string}|null>(null);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("data: ", data)
    /*resetearListaPrecio([]);
    const dataCopia = JSON.parse(JSON.stringify(data));
    //dataCopia.fecha_inicio = convertirFechaBarrasGuiones(data.fecha_inicio);
    dataCopia.fecha_fin = convertirFechaBarrasGuiones(data.fecha_fin);
    const payload = {      ...dataCopia, buscar: true    }
    router.get(route('listasPrecios.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setEsperandoRespuesta(false),
    });*/
  };
  const handleReset = () => {
    setData(listaVacia);
    setOptionProduct(null);
    setOptionProv(null);
  };

  const seleccionarProducto = (option : any) => {
    if(option){
      setData({...data, producto_id: option.value, producto_nombre: option.label});
      setOptionProduct(option);
    }else{
      setData({...data, producto_id: '', producto_nombre: ''});
      setOptionProduct(null);
    }
  };
  const seleccionarProveedor = (option : any) => {
    if(option){
      setData({...data, proveedor_id: option.value, proveedor_nombre: option.label});
      setOptionProv(option);
    }else{
      setData({...data, proveedor_id: '', proveedor_nombre: ''});
      setOptionProv(null);
    }
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
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          Proveedores
          <GenericSelect
            route="proveedores"
            value={optionProv}
            onChange={(option) => seleccionarProveedor(option)}
            placeHolder='Selec. proveedor'
          />
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          Productos
          <GenericSelect
            route="productos"
            value={optionProduct}
            onChange={(option) => seleccionarProducto(option)}
            placeHolder="Selec. producto"
          />
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

export default function ListasPreciosProductos(){
 //data
  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
  const [textConfir, setTextConfirm] = useState('');
  
  const [modalOpen, setModalOpen]                     = useState(false); //modal editar/crear
  const [modalMode, setModalMode]                     = useState<'create' | 'edit'>('create');
  const [selectedListaPrecio, setSelectedListaPrecio] = useState<ListaPrecioProducto | undefined>(undefined);
  const [pendingData, setPendingData]                 = useState<ListaPrecioProducto | undefined>(undefined);
  const [loading, setLoading]                         = useState(false);
  
  const [openConfirmar, setConfirmar]           = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar]       = useState(''); 
  const [listaPrecioCopia, setListaPrecioCopia] = useState<ListaPrecioProducto>(listaVacia);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const [buscar, setBuscar] = useState('');

  const { listas } = usePage().props as { listas?: ListaPrecioProducto[] }; //necesito los props de inertia
  const { resultado, mensaje, lista_precio_id, timestamp, productos } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    lista_precio_id?: number;
    timestamp?: number;
    productos?: Producto[];
  };
  const [ultimoTimestamp, setUltimoTimestamp] = useState<number | null>(null);
  const [listasPreciosCacheadas, setListasPreciosCacheadas] = useState<ListaPrecioProducto[]>([]);

  const [proveedores, setProveedores] = useState<Multiple[]>([]);

  //funciones
  const confirmar = (data: ListaPrecioProducto) => {
    if(data){
      setListaPrecioCopia( JSON.parse(JSON.stringify(data)) );
      //const texto : string = data.inhabilitada === 0 ? 'inhabilitar': 'habilitar';
      //setTextConfirmar('Estás seguro de querer '+texto+' esta lista de precio?');
      setConfirmar(true);
    }
  };
  const inhabilitarHabilitar = () => {
   /* console.log("listaPrecioCopia: ", listaPrecioCopia)
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
    );*/
  };

  const cancelarInhabilitarHabilitar = () => { 
    setConfirmar(false);
  };

  const openCreate = () => {
    setModalMode('create');
    setSelectedListaPrecio(undefined);
    setModalOpen(true);
  };

  const openEdit = (data: ListaPrecioProducto) => {
    setModalMode('edit');
    setSelectedListaPrecio(data);
    setModalOpen(true);
  };

  const handleSave = (data: ListaPrecioProducto) => {
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
    /*fetch('/proveedores_habilitados')
    .then(res => res.json())
    .then(data => {
      setProveedores(ordenarPorTexto(data, 'nombre'));
    });*/
    const cargarDatos = async () => {
      const [res] = await Promise.all([
        fetch(route('proveedores.proveedoresHabilitados'))
      ]);
      const data = await res.json();
      setProveedores(ordenarPorTexto(data, 'nombre'));
    };
    cargarDatos();
  }, []);

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
    const cambioDetectado = timestamp && timestamp !== ultimoTimestamp;

    if (cambioDetectado) {
      setUltimoTimestamp(timestamp)

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
  }, [timestamp, ultimoTimestamp, resultado, mensaje, modalMode, lista_precio_id]);

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
          {/*<DataTableListasPrecios
            datos={listasPreciosCacheadas?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            />*/}
        </div>
      </div>
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