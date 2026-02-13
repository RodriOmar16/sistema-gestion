import { Button } from "@/components/ui/button"
import {
  Dialog,  DialogClose,  DialogContent,  DialogDescription,  DialogFooter,  DialogHeader,
  DialogTitle,  DialogTrigger
} from "@/components/ui/dialog"
import { Select,  SelectContent,  SelectGroup,  SelectItem,  SelectLabel,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { Textarea } from "../ui/textarea";
import { Input } from "@/components/ui/input"
import { Switch } from '@/components/ui/switch';
import { useForm } from "@inertiajs/react"
import React, { useState, useEffect } from "react"
import { Loader2 } from 'lucide-react';
import ShowMessage from "@/components/utils/showMessage";
import { Gasto } from "@/types/typeCrud";
import { convertirFechaGuionesBarras } from "@/utils";
import { DatePicker } from "../utils/date-picker";

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  gasto?: Gasto;
  onSubmit: (data:any) => void;
}

const gastoVacio = {
  gasto_id:         0,
  fecha:            (new Date()).toDateString(),
  fecha_desde:      '',
  fecha_hasta:      '',
  caja_id:          '',
  proveedor_id:     0,
  proveedor_nombre: '',
  forma_pago_id:    0,
  forma_pago_nombre:'',
  monto:            0,
  descripcion:      '',
  inhabilitado:     0
};

export default function NewEditGasto({ open, onOpenChange, mode, gasto, onSubmit }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const { data, setData, get, processing, errors } = useForm<Gasto>(gastoVacio);

  const tipoCajas = [ {id:0, nombre: 'Sin caja'}, {id:1, nombre: 'Principal'} ];

  //useEffect
  useEffect(() => {
    if (!open) {
      setData(gastoVacio);
    }else{
      if(gasto && mode === 'edit'){
        setData({
          gasto_id:         gasto.gasto_id,
          fecha:            convertirFechaGuionesBarras(gasto.fecha??''),
          fecha_desde:      '',
          fecha_hasta:      '',
          caja_id:          gasto.caja_id,
          proveedor_id:     gasto.proveedor_id,
          proveedor_nombre: gasto.proveedor_nombre,
          forma_pago_id:    gasto.forma_pago_id,
          forma_pago_nombre:gasto.forma_pago_nombre,
          monto:            gasto.monto,
          descripcion:      gasto.descripcion,
          inhabilitado:     gasto.inhabilitado
        });        
      }
    }
  }, [open, mode, gasto]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!data.proveedor_id){
      setTitle('¡Campo faltante!');
      setText('Se requiere que selecciones un proveedor');
      setActivo(true);
      return 
    }
    if(!data.forma_pago_id){
      setTitle('¡Campo faltante!');
      setText('Se requiere que selecciones una forma de pago');
      setActivo(true);
      return 
    }
    if(!data.monto || (data.monto && data.monto <= 0)){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un monto');
      setActivo(true);
      return 
    }
    if(!data.descripcion){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses una descripcion');
      setActivo(true);
      return 
    }
    onSubmit(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo' : 'Editar'} gasto</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear un gasto' : 
                                  `Editando gasto: ${gasto?.gasto_id}` }
          </DialogDescription>
          <hr />
        </DialogHeader>
        <form className="grid grid-cols-12 gap-4 px-4 pt-1 pb-4">
          { mode !== 'create' ? 
            (
              <>
                <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
                  <label htmlFor="id">Id</label>
                  <Input
                    disabled
                    value={data.gasto_id}
                    onChange={(e) => setData({ ...data, gasto_id: e.target.value })}
                    placeholder="Id"
                  />
                </div>
                <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
                  <label htmlFor="fecha">Fecha</label>
                  <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3">
                    <label htmlFor="fecha">Fecha</label>
                    <DatePicker fecha={(data.fecha)} setFecha={ (fecha:string) => {setData({...data, fecha})} }/>
                  </div>
                </div>
              </>
            ) : <></>
          }
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="proveedor">Proveedor</label>
            {
              mode === 'create' ? (
                <><p>autocomplete</p></>
              ) :(
                <><p>input disabled</p></>
              )
            }
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4">
            <label htmlFor="fp">Forma de Pago</label>
            {
              mode === 'create' ? (
                <><p>autocomplete</p></>
              ) :(
                <><p>input disabled</p></>
              )
            }
          </div>
          <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2 lg:col-span-2">
            <label htmlFor="padre">Caja</label>
            <Select
              value={String(data.caja_id)}
              onValueChange={(value) => setData('caja_id', Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {tipoCajas.map((e: any) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            type="button" 
          >
            { processing ? ( <Loader2 size={20} className="animate-spin mr-2"/> ) :
                        ( mode === 'create' ? 'Grabar' : 'Actualizar')  
            }          
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
