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
import { Stock } from "@/types/typeCrud";
import { Multiple, Autocomplete } from "@/types/typeCrud";
import GenericSelectDialog from "../utils/genericSelectDialog"
interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  onSubmit: (data:any) => void;
  loading: boolean;
  productosDisp: Multiple[]
}

const stockVacio = {
  producto_id:      0,
  producto_nombre:  '',
  proveedor_id:     0,
  proveedor_nombre: '',
  cantidad:         1
}

export default function NewStock({ open, onOpenChange, onSubmit, loading, productosDisp }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [optionProduct, setOptionProduct] = useState<Autocomplete|null>(null);

  const { data, setData, get, processing, errors } = useForm<{
    producto_id:      number,
    producto_nombre:  string,
    proveedor_id:     number,
    proveedor_nombre: string,
    cantidad:         number
  }>(stockVacio);

  const [productos, setProductos] = useState<{
    producto_id:      number,
    producto_nombre:  string,
    proveedor_id:     number,
    proveedor_nombre: string,
    cantidad:         number
  }[]>([]);

  //useEffect
  useEffect(() => {
    if (!open) {
      setData(stockVacio);
      setProductos([]);
      setOptionProduct(null);
    }
  }, [open]);

  //funciones
  const agregarElementos = () => {
    if(!data.producto_id){
      setTitle('¡Campo faltante!');
      setText('Se requiere que selecciones un producto');
      setActivo(true);
      return 
    }
    if(!data.cantidad){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses la cantidad');
      setActivo(true);
      return 
    }
    if(data.cantidad && data.cantidad <= 0){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses una cantidad positiva');
      setActivo(true);
      return 
    }
    let pos = productos.map(e => e.producto_id).indexOf(data.producto_id);
    if (pos !== -1) {
      const nuevos = [...productos];
      nuevos[pos].cantidad += Number(data.cantidad);
      setProductos(nuevos);
    } else {
      setProductos([...productos, data]);
    }
    setData(stockVacio);
  };
  const eliminar = (e: any) => {
    const nuevos = productos.filter(p => p.producto_id !== e.producto_id);
    setProductos(nuevos);
  };

  const controlarProducto = (value:number) => {
    setData('producto_id', Number(value));
    let pos = productosDisp.map(elem => elem.id).indexOf(value);
    if(pos != -1){
      setData('producto_nombre', productosDisp[pos].nombre);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(productos.length === 0){
      setTitle('¡Faltan productos!');
      setText('Es necesario agregar al menos un producto a la lista.');
      setActivo(true);
      return 
    }
    onSubmit(productos);
  }

  const seleccionarProducto = (option : any) => {
    if(option){
      setData({...data, producto_id: option.value, producto_nombre: option.label});
      setOptionProduct(option);
    }else{
      setData({...data, producto_id: 0, producto_nombre: ''});
      setOptionProduct(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Stock</DialogTitle>
          <DialogDescription>
            Agrega productos para grabar stocks.
          </DialogDescription>
          <hr />
        </DialogHeader>
        <form className="grid grid-cols-12 gap-4 pt-1 pb-4">
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="proveedor_id">Productos</label>
            <GenericSelectDialog
              route="productos"
              value={optionProduct}
              onChange={(option) => seleccionarProducto(option)}
              placeHolder="Seleccionar"
            />
            {/*<Select
              value={String(data.producto_id)}
              onValueChange={(value) => controlarProducto(Number(value)) }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar un proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {productosDisp.map((e: any) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>*/}
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6">
            <label htmlFor="nombre">Cantidad</label>
            <Input
              className="text-right"
              type="number"
              value={data.cantidad}
              min={1}
              onChange={(e) => {
                  const nro = Number(e.target.value);
                  if(nro > 0){
                    setData({ ...data, cantidad: nro })
                  }
                }
              }
            />
          </div>
          <div className="flex flex-col items-end justify-end col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6">
            <Button type="button" onClick={agregarElementos}>Agregar</Button>
          </div>
        </form>
        <div className="mt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="">Producto</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                productos.length != 0? (
                  productos.map(e => (
                    <TableRow key={e.producto_id}>
                      <TableCell className='w-1/2'>{e.producto_nombre}</TableCell>
                      <TableCell className="w-1/2 text-right">
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
                      <TableCell className="w-1/2 text-right">
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
                      colSpan={3}
                      className="w-full h-24 text-center"
                    >
                      No hay productos agregados
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
          </Table>
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