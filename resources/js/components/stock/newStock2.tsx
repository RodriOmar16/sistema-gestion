import { Button } from "@/components/ui/button"
import {
  Dialog,  DialogClose,  DialogContent,  DialogDescription,  DialogFooter,  DialogHeader,
  DialogTitle,  DialogTrigger
} from "@/components/ui/dialog"
import { Select,  SelectContent,  SelectGroup,  SelectItem,  SelectLabel,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import {  Table,  TableBody,  TableCaption,  TableCell,  TableHead,  TableHeader,  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Switch } from '@/components/ui/switch';
import { useForm } from "@inertiajs/react"
import React, { useState, useEffect } from "react"
import { Loader2, Pen, Save, X } from 'lucide-react';
import ShowMessage from "@/components/utils/showMessage";
import { Stock, ListaPrecioProducto } from "@/types/typeCrud";
import { Multiple, Autocomplete } from "@/types/typeCrud";
import GenericSelectDialog from "../utils/genericSelectDialog"
import { NumericFormat } from "react-number-format"
interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  onSubmit: (data:any) => void;
  loading: boolean;
}

const stockVacio = {
  producto_id:      0,
  producto_nombre:  '',
  proveedor_id:     0,
  proveedor_nombre: '',
  cantidad:         1,
  precio_compra:    0,
}

const requeridosReset = {
  producto_id:   false,
  proveedor_id:  false,
  cantidad:      false,
  precio_compra: false,
  productos:     false
};

export default function NewStock({ open, onOpenChange, onSubmit, loading }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [optionProduct, setOptionProduct] = useState<Autocomplete|null>(null);
  const [optionProv, setOptionProv]       = useState<Autocomplete|null>(null);
  const [requeridos, setRequeridos]       = useState<{
    producto_id:   boolean;
    proveedor_id:  boolean;
    cantidad:      boolean;
    precio_compra: boolean;
    productos:     boolean;
  }>(requeridosReset);

  const { data, setData, get, processing, errors } = useForm<{
    producto_id:      number|'',
    producto_nombre:  string,
    proveedor_id:     number|'',
    proveedor_nombre: string,
    cantidad:         number,
    precio_compra:    number,
  }>(stockVacio);

  const [productos, setProductos] = useState<{
    producto_id:      number;
    producto_nombre:  string;
    proveedor_id:     number;
    proveedor_nombre: string;
    cantidad:         number;
    precio_compra:    number;
  }[]>([]);

  //useEffect
  useEffect(() => {
    if (!open) {
      setData(stockVacio);
      setProductos([]);
      setOptionProduct(null);
      setOptionProv(null);
      setRequeridos(requeridosReset);
    }
  }, [open]);

  //funciones
  const agregarElementos = () => {
    const nuevosErrores = {
      producto_id:   !data.producto_id,
      proveedor_id:  !data.proveedor_id,
      cantidad:      Boolean(!data.cantidad || (data.cantidad && data.cantidad <= 0)),
      precio_compra: Boolean(!data.precio_compra || (data.precio_compra && data.precio_compra <= 0)),
      productos:     false
    };
    setRequeridos(nuevosErrores);
    const hayErrores = Object.values(nuevosErrores).some(e => e);

    if (hayErrores) {
      return;
    }

    let pos = productos.map(e => e.producto_id).indexOf(Number(data.producto_id));
    if (pos !== -1) {
      const nuevos = [...productos];
      nuevos[pos].cantidad += Number(data.cantidad);
      setProductos(nuevos);
    } else {
      setProductos([...productos, {
        producto_id:      Number(data.producto_id),
        producto_nombre:  data.producto_nombre,
        proveedor_id:     Number(data.proveedor_id),
        proveedor_nombre: data.proveedor_nombre,
        cantidad:         data.cantidad,
        precio_compra:    data.precio_compra,
      }]);
    }
    setData(stockVacio);
    setOptionProduct(null);
    setOptionProv(null);
  };
  const eliminar = (e: any) => {
    const nuevos = productos.filter(p => p.producto_id !== e.producto_id);
    setProductos(nuevos);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(productos.length === 0){
      /*setTitle('¡Faltan productos!');
      setText('Es necesario agregar al menos un producto a la lista.');
      setActivo(true);*/
      setRequeridos({...requeridos, productos: true});
      return 
    }
    return console.log("prods: ", productos);
    onSubmit(productos);
  }

  const seleccionarProducto = (option : any) => {
    if(option){
      setData({...data, producto_id: option.value, producto_nombre: option.label});
      setOptionProduct(option);
      setRequeridos({...requeridos, producto_id: false});
    }else{
      setData({...data, producto_id: 0, producto_nombre: ''});
      setOptionProduct(null);
    }
  };

  const seleccionarProveedor = (option : any) => {
    if(option){
      setData({...stockVacio, proveedor_id: option.value, proveedor_nombre: option.label});
      setOptionProv(option);
      setRequeridos({...requeridos, proveedor_id: false});
    }else{
      setData({...stockVacio, proveedor_id: '', proveedor_nombre: ''});
      setOptionProv(null);
    }
    setOptionProduct(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="max-h-[95vh] overflow-y-auto w-auto !max-w-[90vw]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Nuevo Stock</DialogTitle>
          <DialogDescription>
            Agrega productos para grabar stocks.
          </DialogDescription>
          <hr />
        </DialogHeader>
        <form className="grid grid-cols-12 gap-4 pt-1 pb-4">
          <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-12'>
            <label htmlFor="preveedores">Proveedores</label>
            <GenericSelectDialog
              route="proveedores"
              value={optionProv}
              onChange={(option) => seleccionarProveedor(option)}
              placeHolder='Seleccionar'
            />
            {requeridos.proveedor_id && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
          </div>
          <div className="flex flex-col items-end justify-end col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <Button type="button" onClick={agregarElementos}>Agregar</Button>
          </div>
        </form>
        <div className="mt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="">Proveedor</TableHead>
                <TableHead className="">Producto</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                productos.length != 0? (
                  productos.map(e => (
                    <TableRow key={e.producto_id}>
                      <TableCell className=''>{e.proveedor_nombre}</TableCell>
                      <TableCell className=''>{e.producto_nombre}</TableCell>
                      <TableCell className="text-right">
                        <Input
                        type='number'
                          value={e.cantidad}
                          className='text-right w-full'
                          onChange={(ev) => {
                            const nuevos = productos.map(p =>
                              p.producto_id === e.producto_id
                                ? { ...p, cantidad: Number(ev.target.value) }
                                : p
                            );
                            setProductos(nuevos);
                          }}
                        >
                        </Input>
                      </TableCell>
                      <TableCell className="text-right">
                        <NumericFormat 
                          value={e.precio_compra} 
                          thousandSeparator="." 
                          decimalSeparator="," 
                          prefix="$" 
                          className="text-right border rounded px-2 py-1" 
                          onValueChange={(values) => {
                            const precioNuevo = values.floatValue || 0;
                            const nuevos = productos.map(p =>
                              p.producto_id === e.producto_id
                                ? { ...p, precio_compra: precioNuevo }
                                : p
                            );
                            setProductos(nuevos);
                          }}
                        />
                      </TableCell>
                      <TableCell className=" text-right">
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
                  ))
                ):(
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="w-full h-24 text-center"
                    >
                      No hay productos agregados
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
          </Table>
          {requeridos.productos && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Requerido. No es posible continuar sin productos.</p>)}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit}>
            { loading ? ( <Loader2 size={20} className="animate-spin"/> ) : 
                      (<Save size={20} className=""/>)  }
            Grabar
          </Button>
        </DialogFooter>
      </DialogContent>
      <ShowMessage 
        open={activo}
        title={title}
        text={text}
        color="warning"
        onClose={() => setActivo(false)}
      />
    </Dialog>
  );
}