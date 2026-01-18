import AppLayout from '@/layouts/app-layout';
import { Producto } from "@/types/typeCrud";
import { useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import {  Table,  TableBody,  TableCaption,  TableCell,  TableHead,  TableHeader,  TableRow,
} from "@/components/ui/table";
import { Select,  SelectContent, SelectGroup,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import SelectMultiple from '@/components/utils/select-multiple';
import { Multiple } from '@/types/typeCrud';
import { ordenarPorTexto } from '@/utils';
import ShowMessage from '@/components/utils/showMessage';
import ModalConfirmar from '@/components/modalConfirmar';
import { route } from 'ziggy-js';
import { DatePicker } from '@/components/utils/date-picker';

const breadcrumbs: BreadcrumbItem[] = [ { title: '', href: '', } ];
const productoVacio = {
  producto_id:         '',
  producto_nombre:     '',
  descripcion:         '',
  categoria_id:        '',
  categoria_nombre:    '',
  marca_id:            '',
  marca_nombre:        '', 
  codigo_barra:        '',
  stock_minimo:        0,
  vencimiento:         '',
  precio:              '',
  inhabilitado:        false,
};

interface Props{
  data: Producto;
  set: (e:any) => void;
  modo: string;
  marcas: Multiple[];
}

export function DetallesProducto({modo, data, set, marcas}:Props){
  //const [data, setData] = useState<Producto>(datos);

  return (
    <div className='px-4'>
      <div className='grid grid-cols-12 gap-4'>
        {/*modo === 'edit' ? (
          <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-12'>
            <label htmlFor="id">Id</label>
            <Input disabled value={data.producto_id} onChange={(e)=>set({...data, producto_id:e.target.value})}/>	
          </div>
        ): <></>*/}
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.producto_nombre} onChange={(e)=>set({...data, producto_nombre:e.target.value})}/>	
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-9'>
          <label htmlFor="descripcion">Descripcion</label>
          <Input value={data.descripcion} onChange={(e)=>set({...data, descripcion:e.target.value})}/>	
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="precio">Precio</label>
          <Input type='number' className='text-right' value={data.precio} onChange={(e)=>set({...data, precio:Number(e.target.value)})}/>	
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="cliente">Marcas</label>
            <Select
              value={String(data.marca_id)}
              onValueChange={(value) => set({...data, marca_id: Number(value)})}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {marcas.map((e: any) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-6'>
          <label htmlFor="codigoBarras">Código de barras</label>
          <Input className='text-right' value={data.codigo_barra} onChange={(e)=>set({...data, codigo_barra:Number(e.target.value)})}/>	
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="stockMinimo">Stock Mínimo</label>
          <Input type='number' className='text-right' value={data.stock_minimo} onChange={(e)=>set({...data, stock_minimo:Number(e.target.value)})}/>	
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3">
          <label htmlFor="vencimiento">Vencimiento</label>
          <DatePicker fecha={(data.vencimiento??'')} setFecha={ (fecha:string) => {set({...data, vencimiento: fecha})} }/>
        </div>  
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex flex-col'>
          <label className='mr-2'>Inhabilitado</label>
          <Switch checked={data.inhabilitado==0 ? false: true} onCheckedChange={(val) => set({...data, inhabilitado: Boolean(val)})} />
        </div>
      </div>
    </div>
  );
}

export default function NewEditProductos(){
  //data
  const [ load, setLoad ] = useState(false);
  const { mode, producto, categorias, resultado, mensaje, producto_id, timestamp } = usePage().props as { 
    mode?:          string | 'create' | 'edit';
    producto?:      Producto;
    categorias?:    {id: number, nombre:string }[];
    resultado?:     number;
    mensaje?:       string;
    producto_id?:   number;
    timestamp?:     number;
  };
  breadcrumbs[0].title = (mode=='create'? 'Nuevo' : 'Editar')+' producto';
  /*const [propsActuales, setPropsActuales] = useState<{
    resultado: number | undefined | null;
    mensaje: string | undefined | null | '';
    producto_id: number | undefined | null;
  }>({ resultado: undefined, mensaje: undefined, producto_id: undefined });*/
  const [ultimoTimestamp, setUltimoTimestamp] = useState<number | null>(null);
  const { data, setData, errors, processing } = useForm<Producto>(productoVacio);
  const [marcasHab, setMarcasHab]             = useState<Multiple[]>([]);
  const [categoriaHab, setCatHab]             = useState<Multiple[]>([]);
  const [catSelected, setCatSelected]         = useState<Multiple[]>(categorias??[]);
  
  /*const [listas , setListas]                  = useState<{
    id: number|string;
    nombre: string;
    precio: number;
  }[]>([]);*/

  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
	const [textConfir, setTextConfirm] = useState('');

  const [activo, setActivo] = useState(false);
  const [title, setTitle]   = useState('');
  const [text, setText]     = useState('');
  const [color, setColor]   = useState('success');

  //funciones
  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault();
    if(!data.producto_nombre){
      setTitle('Campo requerido!');
      setText('Se requiere ingresar un nombre para el producto.');
      setColor('warning');
      setActivo(true);
      return 
    }
    if(!data.codigo_barra){
      setTitle('Campo requerido!');
      setText('Se requiere ingresar un código de barras para el producto.');
      setColor('warning');
      setActivo(true);
      return 
    }
    if(!data.precio || data.precio === 0){
      setTitle('Campo requerido!');
      setText('Se requiere ingresar un precio para el producto.');
      setColor('warning');
      setActivo(true);
      return 
    }
    if(!data.stock_minimo || data.stock_minimo === 0){
      setTitle('Campo requerido!');
      setText('Se requiere ingresar un valor de stock mínimo para el producto.');
      setColor('warning');
      setActivo(true);
      return 
    }
    if(!data.marca_id){
      setTitle('Campo requerido!');
      setText('Se requiere ingresar una marca para el producto.');
      setColor('warning');
      setActivo(true);
      return 
    }
    if(catSelected.length === 0){
      setTitle('Categoría requerida!');
      setText('Se requiere seleccionar al menos una categoría.');
      setColor('warning');
      setActivo(true);
      return 
    }
    /*if(!tieneListas()){
      setTitle('Lista de precios requerida!');
      setText('Se requiere asignar precio a almenos una lista de precios.');
      setColor('warning');
      setActivo(true);
      return 
    }*/
    setTextConfirm("Estás seguro de "+(mode==='create'?'crear':'actualizar')+' este producto?');
    setConfirOpen(true);
  };
  const grabarGuardar = () => {
    //reseteo el confirmar    
    setConfirOpen(false);
    setTextConfirm('');
    //muestro el cargando...
    setLoad(true); 
    const payload = {
      ...data,
      categorias: catSelected,
    };
    if (mode === 'create') {
      router.post(
        route('productos.store'),payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoad(false);
          }
        }
      );
    } else {
      router.put(
        route('productos.update',{producto: data.producto_id}),
        payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoad(false);
          }
        }
      );
    }
    setTitle('');
    setText('');
    setActivo(false);
  };
  
  const cancelar = () => {
    setConfirOpen(false);
  };

  //Effect
  useEffect(() => {
    const cargarDatos = async() => {
      try {
        const [resCategorias, resMarcas] = await Promise.all([
          fetch(route('categorias.habilitadas')),
          fetch(route('marcas.marcasHabilitadas'))
        ]);
        const categorias = await resCategorias.json();
        const marcas = await resMarcas.json();

        setCatHab(ordenarPorTexto(categorias, 'nombre'));
        setMarcasHab(ordenarPorTexto(marcas, 'nombre'));

      } catch (error) {
        console.error("Error al cargar los datos: ", error);
      }
    };
    cargarDatos();
  },[]);

  useEffect(() => {
    const cambioDetectado = timestamp && timestamp !== ultimoTimestamp;
		//const cambioDetectado = (resultado && resultado  !== propsActuales.resultado) || (mensaje && mensaje    !== propsActuales.mensaje) 

		if (cambioDetectado) {
      //setPropsActuales({ resultado, mensaje, producto_id });
      setUltimoTimestamp(timestamp);

      const esError = resultado === 0;
      setTitle(esError ? 'Error' : mode === 'create' ? 'Producto nuevo' : 'Producto modificado');
      setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${producto_id})`);
      setColor(esError ? 'error' : 'success');
      setActivo(true); 
    }
	}, [resultado, mensaje, producto_id]);

  useEffect(() => {
    if(producto && mode === 'edit'){
      
      setData({
        producto_id:         producto.producto_id,
        producto_nombre:     producto.producto_nombre,
        descripcion:         producto.descripcion,
        categoria_id:        '',
        categoria_nombre:    '',
        precio:              producto.precio,
        inhabilitado:        producto.inhabilitado,
        marca_id:            producto.marca_id,
        marca_nombre:        '', 
        codigo_barra:        producto.codigo_barra,
        stock_minimo:        producto.stock_minimo,
        vencimiento:         producto.vencimiento,
      });
    }
  }, []);
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={(mode=='create'? 'Nuevo' : 'Editar')+' producto'+(mode!='create'? ` ${producto_id}` : '')} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <form 
            className='grid grid-cols-12 gap-1'
            onSubmit={handleSubmit}>
            <div className='pb-1 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
              <div className='py-4 px-4'>
                Detalles del producto
                <hr />
              </div>
              <DetallesProducto 
                modo={mode??'create'}
                data={data}
                set={setData}
                marcas={marcasHab}/>
            </div>
            <div className='px-4 pb-1 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
              <div className='py-4'>
                Categorías
                <hr />
              </div>
              <SelectMultiple
                opciones={categoriaHab}
                seleccionados={catSelected}
                setSeleccionados={setCatSelected}
              />
            </div>
            <div  className='flex justify-end px-4 pb-4 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
              <Button type="button" onClick={handleSubmit}>
                { load ? ( <Loader2 size={20} className="animate-spin"/> ) : 
                         (<Save size={20} className=""/>)  }
                { ( mode === 'create' ? 'Grabar' : 'Actualizar')  }          
              </Button>
            </div>
          </form>
        </div>
      </div>
      <ModalConfirmar
        open={confirmOpen}
        text={textConfir}
        onSubmit={grabarGuardar}
        onCancel={cancelar}
      />
      <ShowMessage 
        open={activo}
        title={title}
        text={text}
        color={color}
        onClose={() => {
            setActivo(false);
            if (resultado === 1 && producto_id){
              router.get(route('productos.edit', { producto: producto_id }));
            }
          }
        }
      />
    </AppLayout>
  );
}