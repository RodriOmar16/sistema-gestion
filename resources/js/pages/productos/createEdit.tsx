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
} from "@/components/ui/table"
import SelectMultiple from '@/components/utils/select-multiple';
import { Multiple } from '@/types/typeCrud';
import { ordenarPorTexto } from '@/utils';
import ShowMessage from '@/components/utils/showMessage';
import ModalConfirmar from '@/components/modalConfirmar';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [ { title: '', href: '', } ];
const productoVacio = {
  producto_id:         '',
  producto_nombre:     '',
  descripcion:         '',
  categoria_id:        '',
  categoria_nombre:    '',
  lista_precio_id:     '',
  lista_precio_nombre: '', 
  precio:              0,
  inhabilitado:        false,
};

interface Props{
  data: Producto;
  set: (e:any) => void;
  modo: string;
}

export function DetallesProducto({modo, data, set}:Props){
  //const [data, setData] = useState<Producto>(datos);

  return (
    <div className='px-4'>
      <div className='grid grid-cols-12 gap-4'>
        {modo === 'edit' ? (
          <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2'>
            <label htmlFor="id">Id</label>
            <Input disabled value={data.producto_id} onChange={(e)=>set({...data, producto_id:e.target.value})}/>	
          </div>
        ): <></>}
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.producto_nombre} onChange={(e)=>set({...data, producto_nombre:e.target.value})}/>	
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-4'>
          <label htmlFor="descripcion">Descripcion</label>
          <Input value={data.descripcion} onChange={(e)=>set({...data, descripcion:e.target.value})}/>	
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="precio">Precio</label>
          <Input type='number' className='text-right' value={data.precio} onChange={(e)=>set({...data, precio:Number(e.target.value)})}/>	
        </div>
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex flex-col'>
          <label className='mr-2'>Inhabilitado</label>
          <Switch checked={data.inhabilitado==0 ? false: true} onCheckedChange={(val) => set({...data, inhabilitado: Boolean(val)})} />
        </div>
      </div>
    </div>
  );
}

interface PropsTabla{
  listado: any[],
  setListado: (array:any[]) => void
}
export function TablaListas({listado, setListado}:PropsTabla){

  const controlarPrecio = (id: number|string, nuevoPrecio: string) => {
    const actualizado = listado.map(item =>
      item.id === id ? { ...item, precio: Number(nuevoPrecio) } 
                       : item
    );
    setListado(actualizado);
  };

  return(
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="">Nombre</TableHead>
          <TableHead className="text-right">Precio</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {
          listado.length != 0? (
            listado.map(e => (
              <TableRow key={e.id}>
                <TableCell className='w-1/2'>{e.nombre}</TableCell>
                <TableCell className="w-1/2 text-right">
                  <Input
                  type='number'
                    value={e.precio}
                    className='text-right w-full'
                    onChange={(ev)=> {controlarPrecio(e.id,ev.target.value)}}
                  >
                  </Input>
                </TableCell>
              </TableRow>
            ))
          ):(
            <TableRow>
              <TableCell
                className="w-full h-24 text-center"
              >
                No hay listas para mostrar
              </TableCell>
            </TableRow>
          )
        }
      </TableBody>
    </Table>
  );
}

export default function NewEditProductos(){
  //data
  const [ load, setLoad ] = useState(false);
  const { mode, producto, categorias, listasPrecios, resultado, mensaje, producto_id } = usePage().props as { 
    mode?:          string | 'create' | 'edit';
    producto?:      Producto;
    categorias?:    {id: number, nombre:string }[];
    listasPrecios?: { lista_precio_id: number; nombre: string; precio: number }[];
    resultado?:     number;
    mensaje?:       string;
    producto_id?:   number;
  };
  breadcrumbs[0].title = (mode=='create'? 'Nuevo' : 'Editar')+' producto';
  const [propsActuales, setPropsActuales] = useState<{
    resultado: number | undefined | null;
    mensaje: string | undefined | null | '';
    producto_id: number | undefined | null;
  }>({ resultado: undefined, mensaje: undefined, producto_id: undefined });

  const { data, setData, errors, processing } = useForm<Producto>(productoVacio);
  const [categoriaHab, setCatHab]             = useState<Multiple[]>([]);
  const [catSelected, setCatSelected]         = useState<Multiple[]>(categorias??[]);
  //const [listasHab, setListasHab]           = useState<Multiple[]>([]);
  const [listas , setListas]                  = useState<{
    id: number|string;
    nombre: string;
    precio: number;
  }[]>([]);

  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
	const [textConfir, setTextConfirm] = useState('');

  const [activo, setActivo] = useState(false);
  const [title, setTitle]   = useState('');
  const [text, setText]     = useState('');
  const [color, setColor]   = useState('success');

  //funciones
  const tieneListas = () => {
    let i=0, n=listas.length; 
    while(i<n && (listas[i].precio == 0)){
      i++;
    }
    return (i<n);
  };

  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault();
    if(!data.producto_nombre){
      setTitle('Campo requerido!');
      setText('Se requiere ingresar un nombre para el producto.');
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
    if(catSelected.length === 0){
      setTitle('Categoría requerida!');
      setText('Se requiere seleccionar al menos una categoría.');
      setColor('warning');
      setActivo(true);
      return 
    }
    if(!tieneListas()){
      setTitle('Lista de precios requerida!');
      setText('Se requiere asignar precio a almenos una lista de precios.');
      setColor('warning');
      setActivo(true);
      return 
    }
    setTextConfirm("Estás seguro de "+(mode==='create'?'crear':'actualizar')+' este producto?');
    setConfirOpen(true);
  };
  const grabarGuardar = () => {
    //reseteo el confirmar    
    setConfirOpen(false);
    setTextConfirm('');
    //muestro el cargando...
    setLoad(true);
    console.log("procedo a guardar o grabar");
    const payload = {
      ...data,
      categorias: catSelected,
      listas: listas
    };
    console.log("payload: ", payload)
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
    fetch('/listas_precios_habilitadas') //optengo los datos del formulario
    .then(res => res.json())
    .then(data => {
      //setListasHab(data);
      setListas(data.map((e:any) =>{
          let elemento = listasPrecios?.find((l:any) => l.lista_precio_id === e.id );
          return {
            id:     e.id, 
            nombre: e.nombre,  
            precio: elemento?.precio ?? 0 
          };
        }
      ));
    });
  }, []);
  useEffect(() => {
    fetch('/categorias_habilitadas') //optengo los datos del formulario
    .then(res => res.json())
    .then(data => {
      setCatHab(ordenarPorTexto(data, 'nombre'));
    });
  }, []);
  useEffect(() => {
		const cambioDetectado = (resultado && resultado  !== propsActuales.resultado) || (mensaje && mensaje    !== propsActuales.mensaje) 

		if (cambioDetectado) {
      setPropsActuales({ resultado, mensaje, producto_id });

      const esError = resultado === 0;
      setTitle(esError ? 'Error' : mode === 'create' ? 'Producto nuevo' : 'Producto modificado');
      setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${producto_id})`);
      setColor(esError ? 'error' : 'success');
      setActivo(true); 
    }
	}, [resultado, mensaje, producto_id]);
  useEffect(() => {
    if(producto && mode === 'edit'){
      console.log("producto: ", producto)
      setData({
        producto_id:         producto.producto_id,
        producto_nombre:     producto.producto_nombre,
        descripcion:         producto.descripcion,
        categoria_id:        '',
        categoria_nombre:    '',
        lista_precio_id:     '',
        lista_precio_nombre: '', 
        precio:              producto.precio,
        inhabilitado:        producto.inhabilitado,
      });
    }
  }, []);
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={(mode=='create'? 'Nuevo' : 'Editar')+' producto'} />
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
                set={setData}/>
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
            <div className='px-4 pb-1 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
              <div className='py-4'>
                Listas de precios
                <hr />
              </div>
              <div className='max-h-[300px] overflow-y-auto border rounded'>
                <TablaListas
                  listado={listas}
                  setListado={setListas}
                />
              </div>
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