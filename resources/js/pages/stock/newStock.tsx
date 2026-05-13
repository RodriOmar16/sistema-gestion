import AppLayout from '@/layouts/app-layout';
import { Autocomplete, Producto } from "@/types/typeCrud";
import { useState, useEffect, useRef } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Barcode, File, Image, X, Plus, Brush, Calculator } from 'lucide-react';
import {  Table,  TableBody,  TableCaption,  TableCell,  TableHead,  TableHeader,  TableRow,
} from "@/components/ui/table";
import { Select,  SelectContent, SelectGroup,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import SelectMultiple from '@/components/utils/select-multiple';
import { Multiple } from '@/types/typeCrud';
import { convertirFechaBarrasGuiones, convertirFechaGuionesBarras, convertirNumberPlata, getCsrfToken, ordenarPorTexto } from '@/utils';
import ShowMessage from '@/components/utils/showMessage';
import ModalConfirmar from '@/components/modalConfirmar';
import { route } from 'ziggy-js';
import { DatePicker } from '@/components/utils/date-picker';
import SubirImagen from '@/components/utils/subir-imagen';
import GenericSelect from '@/components/utils/genericSelect';
import { NumericFormat } from 'react-number-format';
import Loading from '@/components/utils/loadingDialog';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Nuevo Stock', href: '', } ];

interface ProductoStock {
  id:       number|string;
  producto: string;
  cantidad: number;
  precio:   number;
};
const productoVacio = {
  id:       '',
  producto: '',
  cantidad: 0,
  precio:   0,
}
interface ProdForm {
  producto_id:     number|string;
  producto_nombre: string;
  cantidad:        number;
  precio:          number;
};
const prodFormVacio = {
  producto_id:     '',
  producto_nombre: '',
  cantidad:        0,
  precio:          0,
}

/*interface StockProv {
  proveedor_id:     number;
  proveedor_nombre: string;
  productos:        ProductoStock[];
}
const provProductosVacio = {
  proveedor_id:     0,
  proveedor_nombre: '',
  productos:        [],
}*/


export default function NewEditStock(){
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [color, setColor]     = useState('');
  const [title, setTitle]   = useState('');

  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar accion
  const [textConfir, setTextConfirm] = useState('');

  const [cambiarOpen, setCambiarOpen] = useState(false); //modal para confirmar accion
  const [textCambiar, setTextCambiar] = useState('');

  const [optionProv, setOptionProv] = useState<Autocomplete|null>(null);
  const [optionProd, setOptionProd] = useState<Autocomplete|null>(null);

  const [proveedor, setProveedor]   = useState<{
    proveedor_id: number|string, 
    proveedor_nombre: string
  }>({proveedor_id: '', proveedor_nombre: ''});

  const [load, setLoad] = useState(false);
  const [grabar, setGrabar] = useState(false);
  
  const [data, setData] = useState<ProdForm>(prodFormVacio);
  const [stock, setStock] = useState<ProductoStock[]>([]);
  const [total, setTotal] = useState(0);

  const [result, setResultado] = useState(1);

  //useEffect
  useEffect(() => {
  const t = stock.reduce((acc, det) => acc + det.precio * det.cantidad, 0);
    setTotal(t);
  }, [stock]);

  //funciones
  const resetForm = () => {
    setOptionProd(null);
    setData(prodFormVacio);
  };

  const agregarElementos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedor.proveedor_id) return;
    if (!data.producto_id || !data.cantidad || !data.precio) return;

    setLoad(true);

    setStock(prev => {
      let nuevos;

      const pos = prev.findIndex(p => p.id === data.producto_id);

      if (pos !== -1) {
        // si ya existe el producto, sumo cantidad
        nuevos = [...prev];
        nuevos[pos] = {
          ...nuevos[pos],
          cantidad: nuevos[pos].cantidad + data.cantidad,
          precio: data.precio // opcional: actualizar precio también
        };
      } else {
        // si no existe, lo agrego
        nuevos = [
          ...prev,
          {
            id: data.producto_id,
            producto: data.producto_nombre,
            cantidad: data.cantidad,
            precio: data.precio
          }
        ];
      }
      // devuelvo ya ordenado
      return ordenarPorTexto(nuevos, 'producto');
    });

    resetForm();
    setLoad(false);
  };

  const eliminar = (e: any) => {
    const nuevos = stock.filter(p => p.id !== e.id);
    setStock(nuevos);
  };

  //grabar
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(stock.length === 0){
      setTitle('¡Faltan productos!');
      setText('Es necesario agregar al menos un producto a la lista.');
      setActivo(true);
      return 
    }
    const aux = stock.filter(e => e.cantidad <= 0 || e.precio<=0);
    if(aux.length > 0 ){
      setTitle('Problemas con los productos');
      setText('Es necesario asignar cantidad y/o precios mayores a cero para cada producto');
      setActivo(true);
      return 
    }
    setTextConfirm('¿Estás seguro de registrar este stock?');
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
    const { resultado, mensaje } = page.props;
    const title = resultado === 0 ? 'Error inesperado': titulo ;

    if(resultado === 0){
      setTitle(title);
      setText(mensaje);
      setColor("error");
      setActivo(true);
      setResultado(0);
      return;
    }

    setResultado(1);

    setTitle(title);
    setText(`${mensaje} ✅ `);
    setColor("success");
    setActivo(true);

  };
  const finalizarAccion = () => {
    setGrabar(false);
  };

  const grabarStock = () => {
    setTextConfirm('');
    setConfirOpen(false);
    setGrabar(true);

    const payload = JSON.parse(JSON.stringify({
      productos: stock,
      proveedor_id: proveedor.proveedor_id
    }));
    //return console.log("payload: ", payload)
    router.post(route('stock.store'), payload/*{
      productos: JSON.stringify(stock),
      proveedor_id: proveedor.proveedor_id
    }*/, {
      preserveScroll: true,
      preserveState: true,
      onError: manejarError("Error al crear el Stock"),
      onSuccess: manejarExito("Stock creado"),
      onFinish: finalizarAccion,
    });

  };
  const cancelar = () => {
    setTextConfirm('');
    setConfirOpen(false);
  };

  //cambiar de proveedor
  const confimarCambio = (option : any) => {
    if(stock.length != 0){
      setTextCambiar('Estás por cambiar de proveedor, esto borrará todos los productos registrados.');
      setCambiarOpen(true);
    }else{
      seleccionarProveedor(option);
    }
  };

  const cancelarConfirmacion = () => {
    setTextCambiar('');
    setCambiarOpen(false);
  };

  const seleccionarProveedor = (option? : any) => {
    if(option){
      setProveedor({proveedor_id: option.value, proveedor_nombre: option.label});
      setOptionProv(option);
    }else{
      setProveedor({proveedor_id: '', proveedor_nombre: ''});
      setOptionProv(null);
    }
    setStock([]);
    setTextCambiar('');
    setCambiarOpen(false);
  };

  const seleccionarProducto = (option: any) => {
    if(option){
      setData({...data, producto_id: option.value, producto_nombre: option.label});
      setOptionProd(option);
    }else{
      setData({...data, producto_id: '', producto_nombre: ''});
      setOptionProd(null);
    }
  };
  
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title='Nuevo Stock' />
      <div className="flex h-full flex-1 flex-col gap-4  rounded-xl p-4">
        <div className="p-3 relative flex-none flex-1 rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <form className="grid grid-cols-12 gap-4 pt-1 pb-4">
            <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
              <label htmlFor="preveedores">Proveedores</label>
              <GenericSelect
                route="proveedores"
                value={optionProv}
                onChange={(option) => confimarCambio(option)}
                placeHolder='Seleccionar'
              />
            </div>
          </form>
          {proveedor.proveedor_id && (
            <>
              <div className="mt-2">
                <form className='grid grid-cols-12 gap-4 px-4 pt-1 pb-4' onSubmit={agregarElementos}>
                  <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
                    <label htmlFor="producto">Producto</label>
                      <GenericSelect
                        route="productos"
                        value={optionProd}
                        onChange={(option) => seleccionarProducto(option)}
                        placeHolder="Selec. producto"
                      />
                  </div>
                  <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3">
                    <label htmlFor="fechaInicio">Cantidad</label>
                    <Input
                      className='text-right'
                      type="number" 
                      value={Number(data.cantidad)}
                      onChange={(e) => setData({...data, cantidad: Number(e.target.value)}) }
                    />
                  </div>
                  <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
                    <div className='flex flex-col'>
                      <label htmlFor="precio">Precio Unitario</label>
                      <NumericFormat 
                        value={data.precio} 
                        thousandSeparator="." 
                        decimalSeparator="," 
                        prefix="$" 
                        className="text-right border rounded px-2 py-1" 
                        onValueChange={(values) => {
                          setData({...data, precio: values.floatValue || 0});
                        }}
                      />
                    </div>
                  </div>
                  <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 flex justify-end items-center'>
                    <Button 
                      className="p-0 hover:bg-transparent cursor-pointer"
                      type="button"
                      title="Limpiar" 
                      variant="ghost" 
                      size="icon" 
                      onClick={resetForm}
                    >
                      <Brush size={30} className="text-orange-500" />
                    </Button>
                    <Button type="submit" title="Buscar" disabled={load}>
                      {load ? (<Loader2 size={20} className="animate-spin" />) : 
                                (<Plus size={20} className="" />)
                      } Agregar
                    </Button>
                  </div>
                </form>
              </div>
              <div className="mt-2 px-4">
                <div className={`w-full ${
                  stock.length > 10 ? "max-h-[400px] overflow-y-auto" : ""
                }`}>
                  <Table className='w-full h-full table-fixed'>
                    <TableHeader>
                      <TableRow className='bg-sky-100'>
                        <TableHead className="">Productos</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Precio Unitario</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {
                        stock.length != 0? (
                          stock.map(e => (
                            <>
                              <TableRow key={e.id}>
                                <TableCell >
                                  {e.producto}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Input
                                    type='number'
                                    value={e.cantidad}
                                    className='text-right w-full'
                                    onChange={(ev) => {
                                      const nuevos = stock.map(p =>
                                        p.id === e.id
                                          ? { ...p, cantidad: Number(ev.target.value) }
                                          : p
                                      );
                                      setStock(nuevos); // importante!
                                    }}
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  <NumericFormat 
                                    value={e.precio} 
                                    thousandSeparator="." 
                                    decimalSeparator="," 
                                    prefix="$" 
                                    className="text-right border rounded px-2 py-1" 
                                    onValueChange={(values) => {
                                      const precioNuevo = values.floatValue || 0;
                                      const nuevos = stock.map(p =>
                                        p.id === e.id
                                          ? { ...p, precio: precioNuevo }
                                          : p
                                      );
                                      setStock(nuevos); // importante!
                                    }}
                                  />
                                </TableCell>
                                <TableCell className=" text-right">
                                  {convertirNumberPlata(String(e.cantidad * e.precio))}
                                </TableCell>
                                <TableCell className=" text-center">
                                  <Button 
                                    className="p-0 hover:bg-transparent cursor-pointer"
                                    title="Quitar" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => eliminar(e)}>
                                    <X size={20} className="text-red-500" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            </>
                          ))
                        ):(
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="w-full h-14 text-center"
                            >
                              No hay productos agregados
                            </TableCell>
                          </TableRow>
                        )
                      }
                      <TableRow >
                        <TableCell
                          colSpan={3}
                          className="text-right font-bold text-lg"
                        >
                          Total
                        </TableCell>
                        <TableCell
                          colSpan={2}
                          className="text-center font-extrabold text-lg"
                        >
                          {convertirNumberPlata(String(total))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </div>
        <div  className='flex justify-end px-4 pb-4 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
          <Button type="button" onClick={handleSubmit}>
            { grabar ? ( <Loader2 size={20} className="animate-spin"/> ) : 
                      (<Save size={20} className=""/>)  }
            Grabar    
          </Button>
        </div>
      </div>
      <ModalConfirmar
        open={cambiarOpen}
        text={textCambiar}
        onSubmit={seleccionarProveedor}
        onCancel={cancelarConfirmacion}
      />
      <ModalConfirmar
        open={confirmOpen}
        text={textConfir}
        onSubmit={grabarStock}
        onCancel={cancelar}
      />
      <ShowMessage 
        open={activo}
        title={title}
        text={text}
        color={color}
        onClose={() => {
          setActivo(false);
          if(result == 1){
            //redirigir a ver
            router.get(route('stock.index'), {}, {
              preserveState: true,
              preserveScroll: true,
            });
          } 
        }}
      />
      <Loading
        open={grabar}
        onClose={() => {}}
      />
    </AppLayout>
  );
}