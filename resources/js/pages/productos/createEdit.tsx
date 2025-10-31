import AppLayout from '@/layouts/app-layout';
import { Producto } from "@/types/typeCrud";
import { useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {  Table,  TableBody,  TableCaption,  TableCell,  TableHead,  TableHeader,  TableRow,
} from "@/components/ui/table"
import SelectMultiple from '@/components/utils/select-multiple';
import { Multiple } from '@/types/typeCrud';
import { ordenarPorTexto } from '@/utils';
import ShowMessage from '@/components/utils/showMessage';

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
            <Input value={data.producto_id} onChange={(e)=>set({...data, producto_id:e.target.value})}/>	
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
          <Input className='text-right' value={data.precio} onChange={(e)=>set({...data, precio:Number(e.target.value)})}/>	
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
  const { mode, producto, categorias } = usePage().props as { 
    mode?: string | 'create' | 'edit';
    producto?:Producto;
    categorias: {id: number, nombre:string }[];
    listas: { lista_precio_id: number; nombre: string; precio: number }[];
  };
  breadcrumbs[0].title = (mode=='create'? 'Nuevo' : 'Editar')+' producto';

  const { data, setData, errors, processing } = useForm<Producto>(productoVacio);
  const [catOpciones, setCatOpciones] = useState<Multiple[]>([]);
  const [catSelected, setCatSelected] = useState<Multiple[]>(categorias);
  const [listasHab, setListasHab] = useState<Multiple[]>([]); //opciones
  const [listas , setListas] = useState<{
    id: number|string;
    nombre: string;
    precio: number;
  }[]>([]);

  //funciones
  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault();
    
  };

  //Effect
  useEffect(() => {
    //optengo los datos del formulario
    fetch('/listas_precios_habilitadas')
    .then(res => res.json())
    .then(data => {
      const ordenadas:Multiple[] = ordenarPorTexto(data, 'nombre');
      setListasHab(ordenadas);
      setListas(ordenadas.map(e => ({
        id: e.id,
        nombre: e.nombre,
        precio: 0
      })));
    });
  }, []);
  useEffect(() => {
    //optengo los datos del formulario
    fetch('/categorias_habilitadas')
    .then(res => res.json())
    .then(data => {
      setCatOpciones(ordenarPorTexto(data, 'nombre'));
    });
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
                opciones={catOpciones}
                seleccionados={catSelected}
                setSeleccionados={setCatSelected}
              />
            </div>
            <div className='px-4 pb-1 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
              <div className='py-4'>
                Listas de precios
                <hr />
              </div>
              <div className=''>
                <TablaListas
                  listado={listas}
                  setListado={setListas}
                />
              </div>
            </div>
            <div  className='flex justify-end px-4 pb-4 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
              <Button type="button" onClick={handleSubmit}>
                { processing ? ( <Loader2 size={20} className="animate-spin mr-2"/> ) :
                            ( mode === 'create' ? 'Grabar' : 'Actualizar')  
                }          
              </Button>
            </div>
          </form>
        </div>
      </div>
      {/*<ModalConfirmar
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
      />*/}
    </AppLayout>
  );
}