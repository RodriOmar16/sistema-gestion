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
import { Multiple } from "@/types/typeCrud";
import { DatePicker } from "../utils/date-picker";
import { convertirFechaBarrasGuiones, convertirFechaGuionesBarras } from "@/utils";

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  onSubmit: (data:any) => void;
  loading: boolean;
  stock: Stock | undefined;
}

const stockVacio = {
  stock_id: '',
  producto_id:     0,
  producto_nombre: '',
  cantidad:        0
}

export default function EditStock({ open, onOpenChange, onSubmit, loading, stock }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');

  const { data, setData, get, processing, errors } = useForm<{
    stock_id:        number|string,
    producto_id:     number|string,
    producto_nombre: string,
    cantidad:        number|string
  }>(stockVacio);

  //useEffect
  useEffect(() => {
    if (!open) {
      setData(stockVacio);
    }
  }, [open]);
  useEffect(() => {
    if (open) {
      console.log("stock: ", stock);

      setData({
        stock_id:        stock?.stock_id,
        producto_id:     stock?.producto_id,
        producto_nombre: stock?.producto_nombre,
        cantidad:        stock?.cantidad
      });
    }
  }, [open]);

  //funciones 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!data.cantidad){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses la cantidad');
      setActivo(true);
      return 
    }
    if(data.cantidad && Number(data.cantidad) <= 0){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses una cantidad positiva');
      setActivo(true);
      return 
    }
    onSubmit(data);
    setData(stockVacio);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Stock</DialogTitle>
          <DialogDescription>
            Modifica la cantidad del producto en stock
          </DialogDescription>
          <hr />
        </DialogHeader>
        <form className="grid grid-cols-12 gap-4 pt-1 pb-4">
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6">
            <label htmlFor="stock_id">Stock Id</label>
            <Input
              disabled
              className="text-right"
              type="number"
              value={data.stock_id}
              onChange={(e) => setData({ ...data, stock_id: Number(e.target.value) })}
              
            />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6">
            <label htmlFor="producto_id">Id Producto</label>
            <Input
              disabled
              className="text-right"
              type="number"
              value={data.producto_id}
              onChange={(e) => setData({ ...data, producto_id: Number(e.target.value) })}
            />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="producto_nombre">Producto</label>
            <Input
              disabled
              value={data.producto_nombre}
              onChange={(e) => setData({ ...data, producto_nombre: e.target.value })}
            />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="cantidad">Cantidad</label>
            <Input
              className="text-right"
              type="number"
              value={data.cantidad}
              onChange={(e) => setData({ ...data, cantidad: Number(e.target.value) })}
            />
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit}>
            { loading ? ( <Loader2 size={20} className="animate-spin"/> ) : 
                      (<Save size={20} className=""/>)  }
            Actualizar
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