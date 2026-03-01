import AppLayout from '@/layouts/app-layout';
import { Autocomplete, Producto } from "@/types/typeCrud";
import { useState, useEffect, useRef } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Barcode, File } from 'lucide-react';
import {  Table,  TableBody,  TableCaption,  TableCell,  TableHead,  TableHeader,  TableRow,
} from "@/components/ui/table";
import { Select,  SelectContent, SelectGroup,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import SelectMultiple from '@/components/utils/select-multiple';
import { Multiple } from '@/types/typeCrud';
import { convertirFechaBarrasGuiones, convertirFechaGuionesBarras, getCsrfToken, ordenarPorTexto } from '@/utils';
import ShowMessage from '@/components/utils/showMessage';
import ModalConfirmar from '@/components/modalConfirmar';
import { route } from 'ziggy-js';
import { DatePicker } from '@/components/utils/date-picker';
import SubirImagen from '@/components/utils/subir-imagen';
import GenericSelect from '@/components/utils/genericSelect';
import { NumericFormat } from 'react-number-format';
import Loading from '@/components/utils/loadingDialog';

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
  stock_actual:        0,
  vencimiento:         '',
  precio:              '',
  inhabilitado:        false,
};

interface Props{
  data: Producto;
  set: (e:any) => void;
  modo: string;
  //marcas: Multiple[];
}

export function DetallesProducto({modo, data, set, /*marcas*/}:Props){
  const [load , setLoad]              = useState(false);
  const [optionMarca, setOptionMarca] = useState<Autocomplete|null>(null);
  
  const generarCodigo = async () => {
    try {
      setLoad(true);
      const res = await fetch(route('productos.generarCodigo'));
      if (!res.ok) throw new Error("Error al generar código");
      const json = await res.json();
      set({...data, codigo_barra: json.codigo_barra});
    } catch (error) {
      console.warn("Ocurrió un error al intentar generar el código: ", error);
    } finally{
      setLoad(false);
    }
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

  useEffect(() => {
    if (data.marca_id && data.marca_nombre) {
      setOptionMarca({ value: Number(data.marca_id), label: data.marca_nombre });
    } else {
      setOptionMarca(null);
    }
  }, [data.marca_id, data.marca_nombre]);


  return (
    <div className='px-4'>
      <div className='grid grid-cols-12 gap-4'>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.producto_nombre} onChange={(e)=>set({...data, producto_nombre:e.target.value})}/>	
        </div>
        {/*<div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-9'>
          <label htmlFor="descripcion">Descripcion</label>
          <Input value={data.descripcion} onChange={(e)=>set({...data, descripcion:e.target.value})}/>	
        </div>*/}
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="precio">Precio</label>
          <NumericFormat 
            value={data.precio} 
            thousandSeparator="." 
            decimalSeparator="," 
            prefix="$" 
            className="text-right border rounded px-2 py-1" 
            onValueChange={(values) => {
              set({...data, precio: values.floatValue || 0});
            }}
          />
          {/*<Input type='number' className='text-right' value={data.precio} onChange={(e)=>set({...data, precio:Number(e.target.value)})}/>	*/}
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="cliente">Marcas</label>
            <GenericSelect
              route="marcas"
              value={optionMarca}
              onChange={(option) => seleccionarMarca(option)}
              placeHolder='Selec. marca'
            />
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="codigoBarras">Código de barras</label>
          <div className='flex items-center'>
            <Input className='' value={data.codigo_barra} onChange={(e)=>set({...data, codigo_barra:e.target.value})}/>	
            <Button 
              className="p-0 hover:bg-transparent cursor-pointer"
              type="button"
              title="Generar código" 
              variant="ghost" 
              size="icon"
              onClick={() => generarCodigo()}
            >
              { load ? ( <Loader2 size={20} className="animate-spin"/> ) : 
                         (<Barcode size={20} color="blue"/>)  }
            </Button>
          </div>
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
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-12'>
          Descripción
          <Textarea 
            id="descripcion" 
            placeholder="Escribe una comentario..." 
            value={data.descripcion}
            onChange={(e) => set({...data, descripcion: e.target.value})}
          />
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
  breadcrumbs[0].title = (mode=='create'? 'Nuevo' : 'Editar')+' producto'+(mode!='create'? ` ${producto?.producto_id}` : '')//(mode=='create'? 'Nuevo' : 'Editar')+' producto';
  const [ultimoTimestamp, setUltimoTimestamp] = useState<number | null>(null);
  const { data, setData, errors, processing } = useForm<Producto>(productoVacio);
  const [categoriaHab, setCatHab]             = useState<Multiple[]>([]);
  const [catSelected, setCatSelected]         = useState<Multiple[]>(categorias??[]);

  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
	const [textConfir, setTextConfirm] = useState('');

  const [activo, setActivo] = useState(false);
  const [title, setTitle]   = useState('');
  const [text, setText]     = useState('');
  const [color, setColor]   = useState('success');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [respuesta, setResp]= useState<{resultado: number, producto_id: number}>({resultado: 0, producto_id: 0});

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
    setTextConfirm("Estás seguro de "+(mode==='create'?'crear':'actualizar')+' este producto?');
    setConfirOpen(true);
  };

  const grabarGuardar = async () => {
    //reseteo el confirmar    
    setConfirOpen(false);
    setTextConfirm('');
    
    const payload = {
      ...data,
      categorias: catSelected,
      vencimiento: data.vencimiento?convertirFechaBarrasGuiones(data.vencimiento) : '',
      imagen: data.imagen ?? 'por definir'
    };

    //muestro el cargando...
    setLoad(true); 
    let resp;
    let title = '';

    if (mode === 'create') {
      /*router.post(
        route('productos.store'),payload,
        {
          //forceFormData: true,
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoad(false);
          }
        }
      );*/
      const res  = await fetch(route('productos.store'),{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement).content,
        },
        body: JSON.stringify(payload),
      });
      resp = await res.json();
      /*setLoad(false);

      if(resp.resultado === 0){
        setTitle('Error');
        setText(resp.mensaje ?? 'Error inesperado');
        setColor('error');
        setActivo(true);
        return;
      }
      
      setTitle('Producto nuevo'); 
      setText(resp.mensaje); 
      setColor('success'); 
      setActivo(true); */
      title = 'Producto nuevo';
      //color = 'success';

    } else {
      /*router.put(
        route('productos.update',{producto: data.producto_id}),
        payload,
        {
          //forceFormData: true,
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoad(false);
          }
        }
      );*/
      const res = await fetch(route('productos.update', {producto: data.producto_id}), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify(payload),
      });
      resp  = await res.json();
      title = 'Producto modificado';
    }
    setLoad(false);

    setResp({resultado: resp.resultado, producto_id: resp.producto_id});

    if (resp.resultado === 0) {
      setTitle('Error');
      setText(resp.mensaje ?? 'Error inesperado');
      setColor('error');
      setActivo(true);
      return;
    }

    setTitle(title);
    setText(resp.mensaje);
    setColor('success');
    setActivo(true);   

  };
  
  const cancelar = () => {
    setConfirOpen(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click(); // dispara el input oculto
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData({...data, imagen: `images/productos/${file.name}`})
    }
  };

  //Effect
  useEffect(() => {
    const cargarDatos = async() => {
      try {
        const [resCategorias, /*resMarcas*/] = await Promise.all([
          fetch(route('categorias.habilitadas')),
          //fetch(route('marcas.marcasHabilitadas'))
        ]);
        const categorias = await resCategorias.json();
        //const marcas = await resMarcas.json();

        setCatHab(ordenarPorTexto(categorias, 'nombre'));
        //setMarcasHab(ordenarPorTexto(marcas, 'nombre'));

      } catch (error) {
        console.error("Error al cargar los datos: ", error);
      }
    };
    cargarDatos();
  },[]);

  /*useEffect(() => {
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
	}, [resultado, mensaje, producto_id, timestamp, ultimoTimestamp, mode]);*/

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
        imagen:              producto.imagen,
        marca_id:            producto.marca_id,
        marca_nombre:        producto.marca_nombre, 
        codigo_barra:        producto.codigo_barra,
        stock_minimo:        producto.stock_minimo,
        vencimiento:         producto.vencimiento? convertirFechaGuionesBarras(producto.vencimiento) : '',
      });
    }
  }, [mode, producto]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={(mode=='create'? 'Nuevo' : 'Editar')+' producto'} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="pb-3 relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
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
                Imagen
                <hr />
              </div>
              {/*<SubirImagen
                set={(e)=> setFile(e)}
              />*/}
              { data.imagen && (
                <div className='flex justify-center mb-3'>
                  <figure className='flex flex-col items-center text-center'>
                    <img src={`/${data.imagen}`} className="w-70 h-70 object-cover rounded-md border mb-1" alt="Imagen" width="50"/>
                    <figcaption className="text-sm text-gray-600">
                      {`/${data.imagen}`}
                    </figcaption>
                  </figure>
                </div>
              ) }
              <div> 
                <Button onClick={handleClick} type='button'>
                  <File size={20} className=""/>  { data.imagen ? 'Cambiar imagen' : 'Seleccionar archivo' }
                </Button> 
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFile} 
                  className="hidden" // oculta el input 
                /> 
              </div>
            </div>
          </form>
        </div>
        <div  className='flex justify-end px-4 pb-4 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
          <Button type="button" onClick={handleSubmit}>
            { load ? ( <Loader2 size={20} className="animate-spin"/> ) : 
                      (<Save size={20} className=""/>)  }
            { ( mode === 'create' ? 'Grabar' : 'Actualizar')  }          
          </Button>
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
            if (respuesta.resultado === 1 && respuesta.producto_id){
              router.get(route('productos.edit', { producto: respuesta.producto_id }));
            }
          }
        }
      />
      <Loading
        open={load}
        onClose={() => {}}
      />
    </AppLayout>
  );
}