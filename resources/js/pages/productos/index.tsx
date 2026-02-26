import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { AuthProps, Autocomplete, Producto } from '@/types/typeCrud';
import { Search, Brush, Loader2, CirclePlus, Filter } from 'lucide-react';
import ModalConfirmar from '@/components/modalConfirmar';
import PdfButton from '@/components/utils/pdf-button';
import ShowMessage from '@/components/utils/showMessage';
import { Select,  SelectContent, SelectGroup,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { route } from 'ziggy-js';
import InputCuil from '@/components/utils/input-cuil';
import { Multiple } from '@/types/typeCrud';
import { getCsrfToken, ordenarPorTexto } from '@/utils';
import DataTableProductos from '@/components/productos/dataTableProductos';
import { DatePicker } from '@/components/utils/date-picker';
import GenericSelect from '@/components/utils/genericSelect';
import Loading from '@/components/utils/loadingDialog';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Productos', href: '', } ];

type propsForm = {
  resetearProducto: (data:Producto[]) => void;
  /*marcas: Multiple[];
  categorias: Multiple[];*/
  data: Producto;
  set: (e:any) => void;
}

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
  stock_actual:        0,
  vencimiento:         '',
  precio:              '',
  inhabilitado:        false,
}

export function FiltrosForm({ resetearProducto, /*marcas, categorias,*/ data, set }: propsForm){
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false)
  const [loading, setLoading]                       = useState(false);
  const [optionMarca, setOptionMarca]               = useState<Autocomplete|null>(null);
  const [optionCateg, setOptionCateg]               = useState<Autocomplete|null>(null);

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
    set(productoVacio);
    setOptionMarca(null);
    setOptionCateg(null);
  }; 

  const seleccionarMarca = (option : any) => {
    if(option){
      set({...data, marca_id: option.value, marca_nombre: option.label});
      setOptionMarca(option);
    }else{
      set({...data, marca_id: '', marca_nombre: ''});
      setOptionMarca(null);
    }
  };
  const seleccionarCategoria = (option : any) => {
    if(option){
      set({...data, categoria_id: option.value, categoria_nombre: option.label});
      setOptionCateg(option);
    }else{
      set({...data, categoria_id: '', categoria_nombre: ''});
      setOptionCateg(null);
    }
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
          <Input value={data.producto_id} onChange={(e)=>set({...data, producto_id: Number(e.target.value)})}/>	
        </div>
        <div className='col-span-12 sm:col-span-8 md:col-span-6 lg:col-span-4'>
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.producto_nombre} onChange={(e)=>set({...data, producto_nombre:e.target.value})}/>	
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="marcas">Marcas</label>
          <GenericSelect
            route="marcas"
            value={optionMarca}
            onChange={(option) => seleccionarMarca(option)}
            placeHolder='Selec. marca'
          />
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="categorias">Categorías</label>
          <GenericSelect
            route="categorias"
            value={optionCateg}
            onChange={(option) => seleccionarCategoria(option)}
            placeHolder='Selec. categoría'
          />
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4'>
          <label htmlFor="codigoBarras">Código de Barras</label>
          <Input value={data.codigo_barra} onChange={(e)=>set({...data, codigo_barra:e.target.value})}/>	
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3">
          <label htmlFor="vencimiento">Vencimiento</label>
          <DatePicker fecha={(data.vencimiento??'')} setFecha={ (fecha:string) => {set({...data, vencimiento: fecha})} }/>
        </div>        
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="precio">Precio</label>
          <Input type='number' className='text-right' value={data.precio} onChange={(e)=>set({...data, precio: Number(e.target.value)})}/>	
        </div>
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex flex-col'>
          <label className='mr-2'>Inhabilitado</label>
          <Switch checked={data.inhabilitado==0 ? false: true} onCheckedChange={(val) => set({...data, inhabilitado: val})} />
        </div>
        <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-12 flex justify-end items-center'>
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
          <Button type="submit" title="Buscar" disabled={loading}>
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
  const { data, setData, errors, processing } = useForm<Producto>(productoVacio); //formulario que busca

  const [openConfirmar, setConfirmar]       = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar]   = useState(''); 
  const [productoCopia, setProductoCopia]   = useState<Producto>(productoVacio);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const { productos } = usePage().props as { productos?: Producto[] }; //necesito los props de inertia
  const { resultado, mensaje, producto_id, timestamp } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    producto_id?: number;
    timestamp?: number;
  };
  
  const { auth } = usePage<{auth: AuthProps}>().props;
  const [productosCacheados, setProductosCacheados] = useState<Producto[]>([]);
  const [ultimoTimestamp, setUltimoTimestamp] = useState<number | null>(null);

  const [load, setLoad] = useState(false);
  const [respuesta, setResp]= useState<{resultado: number, producto_id: number}>({resultado: 0, producto_id: 0});

  //funciones
  const confirmar = (data: Producto) => {
    if(data){
      setProductoCopia( JSON.parse(JSON.stringify(data)) );
      const texto : string = data.inhabilitado === 0 ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' este producto?');
      setConfirmar(true);
    }
  };
  const inhabilitarHabilitar = async () => {
    if (!productoCopia || !productoCopia.producto_id) return;
    /*router.put(
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
    );*/
    setLoad(true);
    const res = await fetch(route('productos.toggleEstado', { producto: productoCopia.producto_id }), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
      },
    });
    const resp  = await res.json();
    setLoad(false);
    setResp({resultado: resp.resultado, producto_id: resp.producto_id});
    
    if (resp.resultado === 0) {
      setTitle('Error');
      setText(resp.mensaje ?? 'Error inesperado');
      setColor('error');
      setActivo(true);
      return;
    }

    setTitle('Estado modificado');
    setText(resp.mensaje);
    setColor('success');
    setActivo(true);

    setTextConfirmar('');
    setConfirmar(false);
    setProductoCopia(productoVacio)
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
    if (
      productos &&
      productos.length > 0 &&
      JSON.stringify(productos) !== JSON.stringify(productosCacheados)
    ) {
      setProductosCacheados(productos);
    }
  }, [productos]);


  /*useEffect(() => {
    const cambioDetectado = timestamp && timestamp !== ultimoTimestamp;

    if (cambioDetectado) {
      //setPropsActuales({ resultado, mensaje, producto_id });
      setUltimoTimestamp(timestamp);

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
  }, [resultado, mensaje, producto_id, timestamp, ultimoTimestamp]);*/

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Productos" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm
            data={data}
            set={setData}
            resetearProducto={setProductosCacheados}
          />
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableProductos
            datos={productosCacheados?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            dataIndex={data}
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
        onClose={() => {
          setActivo(false);
          if (respuesta.resultado === 1 && respuesta.producto_id) {
            router.get(route('productos.index'),
              { producto_id: respuesta.producto_id, buscar: true },
              { preserveScroll: true,	preserveState: true	}
            )
          }
        }}
      />
      <Loading
        open={load}
        onClose={() => {}}
      />
    </AppLayout>
  );
}