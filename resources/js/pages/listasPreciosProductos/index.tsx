import { Autocomplete, ListaPrecioProducto, Multiple, Producto } from "@/types/typeCrud";
import { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import ShowMessage from "@/components/utils/showMessage";
import ModalConfirmar from "@/components/modalConfirmar";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { route } from "ziggy-js";
import { ordenarPorTexto } from "@/utils";
import { Brush, CirclePlus, Filter, Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GenericSelect from "@/components/utils/genericSelect";
import DataTableListasPreciosProductos from "@/components/listasPrecios/dataTableListaPreciosProductos";
import { NumericFormat } from 'react-number-format';

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
  precio_final:        0,
}

type propsForm = {
  setOpen: () => void;
  resetearListaPrecio: (data:ListaPrecioProducto[]) => void;
}
export function FiltrosForm({ setOpen, resetearListaPrecio }: propsForm){
  //data
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false);
  const { data, setData, errors, processing }       = useForm<ListaPrecioProducto>(listaVacia);
  const [optionProduct, setOptionProduct]           = useState<Autocomplete|null>(null);
  const [optionProv, setOptionProv]                 = useState<Autocomplete|null>(null);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetearListaPrecio([]);
    const payload = {      ...data/*Copia*/, buscar: true    }
    router.get(route('listasPrecios.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setEsperandoRespuesta(false),
    });
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
          onClick={() => setOpen()}
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

type PropAgregar = {
  setOpen: (p:boolean) => void;
  controlarAgregar: (p:any) => void;
  data: ListaPrecioProducto;
  setData: (l:ListaPrecioProducto) => void;
  activarMsj: (p:boolean) => void;
  textNuevo: (p:string) => void;
  titleNuevo: (p:string) => void; 
  colorNuevo: (p:string) => void; 
};

function AgregarPrecioProducto({setOpen, data, setData, controlarAgregar, activarMsj, textNuevo, titleNuevo, colorNuevo}:PropAgregar){
  const [optionProduct, setOptionProduct] = useState<Autocomplete|null>(null);
  const [optionProv, setOptionProv]       = useState<Autocomplete|null>(null);
  const [processing,setProcessing]        = useState(false);

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
  function validar() : any{
    let obj = { text   : 'Se agregó correctamente a la lista!',  title  : 'Nuevo elemento',  color  : 'success',  activo : true, res    : 1 };
    
    if(!data.producto_id){
      obj.title  = 'Producto faltante';
      obj.text   = 'Se requiere seleccionar el producto para continuar.'
      obj.color  = 'warning',
      obj.activo = true;
      obj.res    = 0;
      return obj;
    }
    if(!data.proveedor_id){
      obj.title  = 'Proveedor faltante';
      obj.text   = 'Se requiere seleccionar el proveedor para continuar.'
      obj.color  = 'warning',
      obj.activo = true;
      obj.res    = 0;
      return obj;
    }
    if(data.precio <= 0){
      obj.title  = 'Precio incorrecto';
      obj.text   = 'Se requiere ingresar un precio válido para continuar.'
      obj.color  = 'warning',
      obj.activo = true;
      obj.res    = 0;
      return obj;
    }
    if(data.porcentaje <= 0){
      obj.title  = 'Porcentaje incorrecto';
      obj.text   = 'Se requiere ingresar un porcentaje válido para continuar.'
      obj.color  = 'warning',
      obj.activo = true;
      obj.res    = 0;
      return obj;
    }
    if(data.precio_final && data.precio_final <= 0){
      obj.title  = 'Precio Final incorrecto';
      obj.text   = 'Se requiere ingresar un precio válido para continuar.'
      obj.color  = 'warning',
      obj.activo = true;
      obj.res    = 0;
      return obj;
    }
    return obj;
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //
    const {activo, title, text, color, res} = validar();

    setProcessing(true);
    //procesar en la BD y agregar por front al array
    if(res !== 0){
      controlarAgregar(data);
      setData(listaVacia);
      setOptionProduct(null);
      setOptionProv(null);
    }

    activarMsj(activo);
    titleNuevo(title);
    textNuevo(text);
    colorNuevo(color);
   
    setProcessing(false);

  }

  return (
    <div>
      <div className='flex mb-2'> 
        <Plus size={20} className="mr-2" color="green"/>  
        Crear elemento de lista de precios
      </div>
      <form className='grid grid-cols-12 gap-4 px-2 pt-1 pb-4' onSubmit={handleSubmit}>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="productos">Productos</label>
          <GenericSelect
            route="productos"
            value={optionProduct}
            onChange={(option) => seleccionarProducto(option)}
            placeHolder="Selec. producto"
          />
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="preveedores">Proveedores</label>
          <GenericSelect
            route="proveedores"
            value={optionProv}
            onChange={(option) => seleccionarProveedor(option)}
            placeHolder='Selec. proveedor'
          />
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-6 lg:col-span-3'>
          <label htmlFor="precios">Precio</label>
          <NumericFormat 
            value={data.precio} 
            thousandSeparator="." 
            decimalSeparator="," 
            prefix="$" 
            className="text-right border rounded px-2 py-1" 
            onValueChange={(values) => {
              const precio = values.floatValue || 0;
              const sugerido = precio + (precio * (data.porcentaje / 100));
              setData({ ...data, precio, precio_sugerido: sugerido });
            }}
          />
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-6 lg:col-span-3'>
          <label htmlFor="precios">Porcentaje</label>
          <NumericFormat 
            value={data.porcentaje} 
            thousandSeparator="." 
            decimalSeparator="," 
            suffix="%" 
            className="text-right border rounded px-2 py-1" 
            onValueChange={(values) => { 
              const porcentaje = values.floatValue || 0;
              const sugerido = data.precio + (data.precio * (porcentaje / 100));
              setData({ ...data, porcentaje, precio_sugerido: sugerido });
            }}
            isAllowed={(values) =>
              values.floatValue === undefined ||
              (values.floatValue >= 0 /*&& values.floatValue <= 100*/)
            }
          />
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-6 lg:col-span-3'>
          <label htmlFor="precios_sugerido">Precio Sugerido</label>
          <NumericFormat 
            value={data.precio_sugerido} 
            disabled
            thousandSeparator="." 
            decimalSeparator="," 
            prefix="$" 
            className="text-right border rounded px-2 py-1" 
          />
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-6 lg:col-span-3'>
          <label htmlFor="precios">Precio Final</label>
          <NumericFormat 
            value={data.precio_final} 
            thousandSeparator="." 
            decimalSeparator="," 
            prefix="$" 
            className="text-right border rounded px-2 py-1" 
            onValueChange={(values) => {
              setData({...data, precio_final: values.floatValue || 0});
            }}
          />
        </div>
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-6 flex justify-end items-center'>
          <Button 
            className="bg-secondary mr-2"
            type="button"
            title="Cancelar"  
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" title="Buscar" disabled={processing}>
            {processing ? (
              <Loader2 size={20} className="animate-spin mr-2" />
            ) : (
              <Plus size={20} className="" />
            )}
            Agregar
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function ListasPreciosProductos(){
 //data  
  //const [modalOpen, setModalOpen]                     = useState(false); //modal editar/crear
  const [modalMode, setModalMode]                     = useState<'create' | 'edit'>('create');
  //const [selectedListaPrecio, setSelectedListaPrecio] = useState<ListaPrecioProducto | undefined>(undefined);
  //const [pendingData, setPendingData]                 = useState<ListaPrecioProducto | undefined>(undefined);
  const [loading, setLoading]                         = useState(false);
  
  const [openConfirmar, setConfirmar]           = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar]       = useState(''); 
  const [listaPrecioCopia, setListaPrecioCopia] = useState<ListaPrecioProducto>(listaVacia);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const { listas } = usePage().props as { listas?: ListaPrecioProducto[] }; //necesito los props de inertia
  const { resultado, mensaje, lista_precio_id, timestamp, productos } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    lista_precio_id?: number;
    timestamp?: number;
    productos?: Producto[];
  };
  const { flash } = usePage().props as { flash?: { success?: string; error?: string } };

  const [ultimoTimestamp, setUltimoTimestamp] = useState<number | null>(null);
  const [listasPreciosCacheadas, setListasPreciosCacheadas] = useState<ListaPrecioProducto[]>([]);

  const [open, setOpen] = useState(false);
  const [dataAgregar, setDataAgregar] = useState<ListaPrecioProducto>(listaVacia);
  const [idNegativo, setIdNegativo]   = useState(-1);

  //funciones
  const confirmar = (data: ListaPrecioProducto) => {
    if(data){
      setListaPrecioCopia( JSON.parse(JSON.stringify(data)) );
      setTextConfirmar('Estás seguro de querer grabar este producto a la lista de precio?');
      setConfirmar(true);
    }
  };
  const controlarAgregar = async(p:any) => { 
    const aux : (ListaPrecioProducto[] | undefined) = listasPreciosCacheadas?.filter(e => e.producto_id == p.producto_id && e.proveedor_id == p.proveedor_id);
    if(aux && aux.length == 0){
      p.lista_precio_id = idNegativo; //para reconocerlo al quitar o guardar en la base
      p.editar          = 1;          //para establecer un estado de edicion
      setListasPreciosCacheadas(prev => [...prev, p]);
      setIdNegativo(idNegativo - 1);
    }//else console.log("hay repetidos")
  };

  const quitar = (p:any) =>{ 
    setListasPreciosCacheadas(prev => 
      prev.filter(item => item.lista_precio_id !== p.lista_precio_id ) 
    );
  };

  const guardarGrabar = () => { 
    if(listaPrecioCopia){
      setConfirmar(false);
      //setLoading(true);
      setListasPreciosCacheadas(prev =>
        prev.map(item =>
          item.lista_precio_id === listaPrecioCopia.lista_precio_id
            ? { ...item, load: 1 }
            : item
        )
      )

      router.put(
        route('listasPrecios.update',{lista: listaPrecioCopia.lista_precio_id}), 
         JSON.parse(JSON.stringify(listaPrecioCopia)),
        {
          preserveScroll: true,
          preserveState: true,
          onSuccess:() => {
            const mensaje = flash?.success || "Guardado correctamente";
            setTitle('Lista de precio modificada');
            setText(`${mensaje}`);
            setColor('success');
            setActivo(true);
          },
          onError: (errors) => { 
            const mensaje = flash?.error || "Ocurrió un error"; 
            setTitle('Error en Lista de precio');
            setText(`${mensaje}`);
            setColor('error');
            setActivo(true);
          },
          onFinish: () => {
            //setLoading(false);
            setListasPreciosCacheadas(prev =>
              prev.map(item =>
                item.lista_precio_id === listaPrecioCopia.lista_precio_id
                  ? { ...item, load: 0 }
                  : item
              )
            )
            setListaPrecioCopia(listaVacia);
          },
        }
      );
    }
  };

  const cancelar = () => {
    setConfirmar(false);
  };

  //useEffect
  /*useEffect(() => {
    //esto se hace porque inertia me destruia muy rapido el array principal en este caso listas y por eso tuve que guardardo en una variable temporal
    //es solo para que no sea tan feo
    if (
      listas &&
      listas.length > 0 &&
      JSON.stringify(listas) !== JSON.stringify(listasPreciosCacheadas)
    ) {
      setListasPreciosCacheadas(listas);
    }
  }, [listas, listasPreciosCacheadas]);*/
  useEffect(() => {
    if (listas && listas.length > 0) {
      setListasPreciosCacheadas(listas.map(e => ({...e, editar:0, cambiar: 0, load: 0})));
    }
  }, [listas]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Listas de Precios" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm 
            setOpen={() => setOpen(true)} 
            resetearListaPrecio={setListasPreciosCacheadas}
          />         
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          {open && 
            (
              <div>
                <AgregarPrecioProducto
                  setOpen={setOpen}
                  data={dataAgregar}
                  setData={setDataAgregar}
                  controlarAgregar={controlarAgregar}
                  activarMsj={setActivo}
                  titleNuevo={setTitle}
                  colorNuevo={setColor}
                  textNuevo={setText}
                />
                <hr className="my-2"/>
              </div>
            )
          }
          <div>
            <DataTableListasPreciosProductos
              datos={listasPreciosCacheadas?? []} 
              quitar={quitar} 
              abrirConfirmar={confirmar}
              setDatos={setListasPreciosCacheadas}
              loading={loading}
              setLoading={setLoading}
            />
          </div>
        </div>
      </div>
      <ModalConfirmar
        open={openConfirmar}
        text={textConfirmar}
        onSubmit={guardarGrabar}
        onCancel={cancelar}
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