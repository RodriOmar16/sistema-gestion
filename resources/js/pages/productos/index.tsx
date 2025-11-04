import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Producto } from '@/types/typeCrud';
import { Search, Brush, Loader2, CirclePlus, Filter } from 'lucide-react';
import ModalConfirmar from '@/components/modalConfirmar';
import PdfButton from '@/components/utils/pdf-button';
import ShowMessage from '@/components/utils/showMessage';
import { Select,  SelectContent, SelectGroup,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { route } from 'ziggy-js';
import InputCuil from '@/components/utils/input-cuil';
import { Multiple } from '@/types/typeCrud';
import { ordenarPorTexto } from '@/utils';
import DataTableProductos from '@/components/productos/dataTableProductos';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Productos', href: '', } ];

type propsForm = {
  resetearProducto: (data:Producto[]) => void;
  listasPrecios: Multiple[],
  categorias: Multiple[],
}

const productoVacio = {
  producto_id:         '',
  producto_nombre:     '',
  descripcion:         '',
  categoria_id:        '',
  categoria_nombre:    '',
  lista_precio_id:     '',
  lista_precio_nombre: '', 
  precio:              '',
  inhabilitado:        false,
}

export function FiltrosForm({ resetearProducto, listasPrecios, categorias }: propsForm){
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false);
  const { data, setData, errors, processing } = useForm<Producto>(productoVacio);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetearProducto([]);
    setLoading(true);
    const payload = {      ...data, buscar: true    }
    router.get(route('productos.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => {
        setEsperandoRespuesta(false);
        setLoading(false);
      }
    });
  };
  const handleReset = () => {
    setData(productoVacio);
  }; 

  return (
    <div>
      <div className='flex items-center justify-between px-3 pt-3'>
        <div className='flex'> <Filter size={20} />  Filtros</div>
        <a href={route('productos.create')} target='_blank'>
          <Button 
            className="p-0 hover:bg-transparent cursor-pointer"
            type="button"
            title="Nuevo" 
            variant="ghost" 
            size="icon"
          >
            <CirclePlus size={30} className="text-green-600 scale-200" />
          </Button>
        </a>
      </div>
      <form className='grid grid-cols-12 gap-4 px-4 pt-1 pb-4' onSubmit={handleSubmit}>
        <div className='col-span-12 sm:col-span-4 md:col-span-6 lg:col-span-2'>
          <label htmlFor="id">Id</label>
          <Input value={data.producto_id} onChange={(e)=>setData('producto_id',e.target.value)}/>	
          { errors.producto_id && <p className='text-red-500	'>{ errors.producto_id }</p> }
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-6 lg:col-span-3'>
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.producto_nombre} onChange={(e)=>setData('producto_nombre',e.target.value)}/>	
          { errors.producto_nombre && <p className='text-red-500	'>{ errors.producto_nombre }</p> }
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-12 lg:col-span-4'>
          <label htmlFor="descripcion">Descripcion</label>
          <Input value={data.descripcion} onChange={(e)=>setData('descripcion',e.target.value)}/>	
          { errors.descripcion && <p className='text-red-500	'>{ errors.descripcion }</p> }
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="descripcion">Categorías</label>
            <Select
              value={String(data.categoria_id)}
              onValueChange={(value) => setData('categoria_id', Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categorias.map((e: any) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="descripcion">Listas de Precio</label>
            <Select
              value={String(data.lista_precio_id)}
              onValueChange={(value) => setData('lista_precio_id', Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {listasPrecios.map((e: any) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="precio">Precio</label>
          <Input type='number' className='text-right' value={data.precio} onChange={(e)=>setData('precio',Number(e.target.value))}/>	
          { errors.precio && <p className='text-red-500	'>{ errors.precio }</p> }
        </div>
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex flex-col'>
          <label className='mr-2'>Inhabilitado</label>
          <Switch checked={data.inhabilitado==0 ? false: true} onCheckedChange={(val) => setData('inhabilitado', val)} />
        </div>
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-4 flex justify-end items-center'>
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
            {loading ? (<Loader2 size={20} className="animate-spin" />) : 
                       (<Search size={20} className="" />)
            } Buscar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default function Productos(){
  //data  
  const [openConfirmar, setConfirmar]       = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar]   = useState(''); 
  const [productoCopia, setProductoCopia]   = useState<Producto>(productoVacio);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const { productos } = usePage().props as { productos?: Producto[] }; //necesito los props de inertia
  const { resultado, mensaje, producto_id } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    producto_id?: number;
  };
  const [propsActuales, setPropsActuales] = useState<{
    resultado: number | undefined | null;
    mensaje: string | undefined | null | '';
    producto_id: number | undefined | null;
  }>({ resultado: undefined, mensaje: undefined, producto_id: undefined });
  const [productosCacheados, setProductosCacheados] = useState<Producto[]>([]);

  const [listasPrecio, setListasPrecios] = useState<Multiple[]>([]);
  const [categorias, setCategorias]      = useState<Multiple[]>([]);

  //funciones
  const confirmar = (data: Producto) => {
    if(data){
      setProductoCopia( JSON.parse(JSON.stringify(data)) );
      const texto : string = data.inhabilitado === 0 ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' este producto?');
      setConfirmar(true);
    }
  };
  const inhabilitarHabilitar = () => {
    if (!productoCopia || !productoCopia.producto_id) return;
    router.put(
      route('productos.toggleEstado', { producto: productoCopia.producto_id }),{},
      {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          setTextConfirmar('');
          setConfirmar(false);
          setProductoCopia(productoVacio);
        }
      }
    );
  };

  const cancelarInhabilitarHabilitar = () => { 
    setConfirmar(false);
  };

  const openEdit = (data: Producto) => {
    router.get(
      route('productos.edit', { producto: data.producto_id }),
      {},{}
    );
  };

  //effect
  useEffect(() => {
    //optengo los datos del formulario
    fetch('/listas_precios_habilitadas')
    .then(res => res.json())
    .then(data => {
      setListasPrecios(ordenarPorTexto(data, 'nombre'));
    });
  }, []);
  useEffect(() => {
    //optengo los datos del formulario
    fetch('/categorias_habilitadas')
    .then(res => res.json())
    .then(data => {
      setCategorias(ordenarPorTexto(data, 'nombre'));
    });
  }, []);
  useEffect(() => {
    if (!activo && propsActuales.resultado !== undefined) {
      setPropsActuales({
        resultado: undefined,
        mensaje: undefined,
        producto_id: undefined
      });
    }
  }, [activo]);

  useEffect(() => {
    if (
      productos &&
      productos.length > 0 &&
      JSON.stringify(productos) !== JSON.stringify(productosCacheados)
    ) {
      setProductosCacheados(productos);
    }
  }, [productos]);


  useEffect(() => {
    const cambioDetectado =
      (resultado && resultado  !== propsActuales.resultado)  ||
      (mensaje && mensaje    !== propsActuales.mensaje)

    if (cambioDetectado) {
      setPropsActuales({ resultado, mensaje, producto_id });

      const esError = resultado === 0;
      setTitle(esError ? 'Error' : 'Producto modificado');
      setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${producto_id})`);
      setColor(esError ? 'error' : 'success');
      setActivo(true);

      if (resultado === 1 && producto_id) {
        router.get(route('productos.index'),
          { producto_id, buscar: true },
          { preserveScroll: true,	preserveState: true	}
        )
      }
    }
  }, [resultado, mensaje, producto_id]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Productos" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm 
            resetearProducto={setProductosCacheados}
            listasPrecios={listasPrecio}
            categorias={categorias}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableProductos
            datos={productosCacheados?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            />
        </div>
      </div>
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