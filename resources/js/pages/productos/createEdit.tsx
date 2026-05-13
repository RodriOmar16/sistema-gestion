import AppLayout from '@/layouts/app-layout';
import { Autocomplete, Producto } from "@/types/typeCrud";
import { useState, useEffect, useRef } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Barcode, File, Image } from 'lucide-react';
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

const requeridosReset = {
  producto_id:      false,
  producto_nombre:  false,
  descripcion:      false,
  categoria_id:     false,
  categoria_nombre: false,
  marca_id:         false,
  marca_nombre:     false, 
  codigo_barra:     false,
  stock_minimo:     false,
  stock_actual:     false,
  vencimiento:      false,
  precio:           false,
  categorias:       false
};
export default function NewEditProductos(){
  //data
  const { data, setData, errors, processing } = useForm<Producto>(productoVacio);
  const [optionMarca, setOptionMarca] = useState<Autocomplete|null>(null);

  const { mode, producto, categorias } = usePage().props as { 
    mode?:          string | 'create' | 'edit';
    producto?:      Producto;
    categorias?:    {id: number, nombre:string }[];
  };
  breadcrumbs[0].title = (mode=='create'? 'Nuevo' : 'Editar')+' producto'+(mode!='create'? ` ${producto?.producto_id}` : '')//(mode=='create'? 'Nuevo' : 'Editar')+' producto';

  const [ load, setLoad ] = useState(false);
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
  const [requeridos, setRequeridos] = useState<{
    producto_id:      boolean,
    producto_nombre:  boolean,
    descripcion:      boolean,
    categoria_id:     boolean,
    categoria_nombre: boolean,
    marca_id:         boolean,
    marca_nombre:     boolean, 
    codigo_barra:     boolean,
    stock_minimo:     boolean,
    stock_actual:     boolean,
    vencimiento:      boolean,
    precio:           boolean,
    categorias:       boolean
  }>(requeridosReset);

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

  //funciones
  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault();

    const nuevosErrores = {
      producto_id:      false,
      producto_nombre:  !data.producto_nombre,
      descripcion:      false,
      categoria_id:     false,
      categoria_nombre: false,
      marca_id:         !data.marca_id,
      marca_nombre:     false, 
      codigo_barra:     !data.codigo_barra,
      stock_minimo:     !data.stock_minimo || data.stock_minimo === 0,
      stock_actual:     false,
      vencimiento:      false,
      precio:           !data.precio || data.precio === 0,
      categorias:       catSelected.length === 0,
    };
    setRequeridos(nuevosErrores);
    const hayErrores = Object.values(nuevosErrores).some(e => e);

    if (hayErrores) {
      return;
    }
    setTextConfirm("Estás seguro de "+(mode==='create'?'crear':'actualizar')+' este producto?');
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
    const { resultado, mensaje, producto_id } = page.props;
    const title = resultado === 0 ? 'Error inesperado': titulo ;
    
    setResp({resultado: resultado, producto_id: producto_id});

    if(resultado === 0){
      console.log("mode: ", mode);
      setTitle(title);
      setText(mensaje);
      setColor("error");
      setActivo(true);
      return;
    }

    setTitle(title);
    setText(`${mensaje} ✅ (ID: ${producto_id})`);
    setColor("success");
    setActivo(true);

  };
  const finalizarAccion = () => {
    setLoad(false);
  };

  const grabarGuardar = async () => {
    setLoad(true);

    const payload = {
      ...data,
      categorias: catSelected,
      vencimiento: data.vencimiento?convertirFechaBarrasGuiones(data.vencimiento) : '',
      imagen: data.imagen ?? 'por definir'
    };
    
		if (mode === 'create') {
			router.post(route('productos.store'), payload, {
				preserveScroll: true,
				preserveState: true,
				onError:   manejarError("Error al crear el producto"),
				onSuccess: manejarExito("Producto creado"),
				onFinish:  finalizarAccion,
			});
		} else {
			router.put(route('productos.update', {producto: data.producto_id}), payload, {
				preserveScroll: true,
				preserveState: true,
				onError:   manejarError("Error al modificar el producto"),
				onSuccess: manejarExito("Producto actualizado"),
				onFinish:  finalizarAccion,
			});
		}
    //reseteo el confirmar    
    setConfirOpen(false);
    setTextConfirm('');

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

  const seleccionarMarca = (option : any) => {
    if(option){
      setData({...data, marca_id: option.value, marca_nombre: option.label});
      setOptionMarca(option);
    }else{
      setData({...data, marca_id: '', marca_nombre: ''});
      setOptionMarca(null);
    }
  };

  const generarCodigo = async () => {
    try {
      setLoad(true);
      const res = await fetch(route('productos.generarCodigo'));
      if (!res.ok) throw new Error("Error al generar código");
      const json = await res.json();
      setData({...data, codigo_barra: json.codigo_barra});
    } catch (error) {
      console.warn("Ocurrió un error al intentar generar el código: ", error);
    } finally{
      setLoad(false);
    }
  };

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
              <div className='px-4'>
                <div className='grid grid-cols-12 gap-4'>
                  <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
                    <label htmlFor="nombre">Nombre</label>
                    <Input 
                      value={data.producto_nombre} 
                      onChange={(e)=>{
                        setData({...data, producto_nombre: e.target.value});
                        if(e.target.value){requeridos.producto_nombre = false}
                      }}
                    />	
                    { requeridos.producto_nombre && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
                  </div>
                  <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
                    <div className='flex flex-col'>
                      <label htmlFor="precio">Precio</label>
                      <NumericFormat 
                        value={data.precio} 
                        thousandSeparator="." 
                        decimalSeparator="," 
                        prefix="$" 
                        className="text-right border rounded px-2 py-1" 
                        onValueChange={(values) => {
                          setData({...data, precio: values.floatValue || 0});
                          if(values.floatValue){ requeridos.precio = false; }
                        }}
                      />
                      { requeridos.precio && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
                    </div>
                  </div>
                  <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
                    <label htmlFor="cliente">Marcas</label>
                    <GenericSelect
                      route="marcas"
                      value={optionMarca}
                      onChange={(option) => {
                        seleccionarMarca(option);
                        if(option){ requeridos.marca_id = false; }
                      }}
                      placeHolder='Selec. marca'
                    />
                    { requeridos.marca_id && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
                  </div>
                  <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
                    <label htmlFor="codigoBarras">Código de barras</label>
                    <div className='flex items-center'>
                      <Input 
                        className='' 
                        value={data.codigo_barra} 
                        onChange={(e)=> {
                          setData({...data, codigo_barra: e.target.value});
                          if(e.target.value){ requeridos.codigo_barra = false;}
                        }}
                      />	
                      <Button 
                        className="p-0 hover:bg-transparent cursor-pointer"
                        type="button"
                        title="Generar código" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          generarCodigo();
                          requeridos.codigo_barra = false;
                        }}
                      >
                        { load ? ( <Loader2 size={20} className="animate-spin"/> ) : 
                                  (<Barcode size={20} color="blue"/>)  }
                      </Button>
                    </div>
                    { requeridos.codigo_barra && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
                  </div>
                  <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
                    <label htmlFor="stockMinimo">Stock Mínimo</label>
                    <Input type='number' className='text-right' 
                      value={data.stock_minimo} 
                      onChange={(e)=> {
                        setData({...data, stock_minimo:Number(e.target.value)});
                        if(e.target.value){ requeridos.stock_minimo = false }
                      }}
                    />
                    { requeridos.stock_minimo && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
                  </div>
                  <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3">
                    <label htmlFor="vencimiento">Vencimiento</label>
                    <DatePicker fecha={(data.vencimiento??'')} setFecha={ (fecha:string) => {setData({...data, vencimiento: fecha})} }/>
                  </div>  
                  <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex flex-col'>
                    <label className='mr-2'>Inhabilitado</label>
                    <Switch checked={data.inhabilitado==0 ? false: true} onCheckedChange={(val) => setData({...data, inhabilitado: Boolean(val)})} />
                  </div>
                  <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
                    Descripción
                    <Textarea 
                      id="descripcion" 
                      placeholder="Escribe una comentario..." 
                      value={data.descripcion}
                      onChange={(e) => setData({...data, descripcion: e.target.value})}
                    />
                  </div>
                </div>
              </div>
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
              { (requeridos.categorias && catSelected.length === 0) && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
            </div>
            <div className='px-4 pb-1 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
              <div className='py-4'>
                Imagen
                <hr />
              </div>
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
                  <Image size={20} className=""/>  { data.imagen ? 'Cambiar imagen' : 'Seleccionar archivo' }
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