import { Button } from "@/components/ui/button"
import {
  Dialog,  DialogClose,  DialogContent,  DialogDescription,  DialogFooter,  DialogHeader,
  DialogTitle,  DialogTrigger
} from "@/components/ui/dialog"
import { Textarea } from "../ui/textarea";
import { Input } from "@/components/ui/input"
import { Switch } from '@/components/ui/switch';
import { useForm } from "@inertiajs/react"
import React, { useState, useEffect } from "react"
import { Loader2 } from 'lucide-react';
import ShowMessage from "@/components/utils/showMessage";
import { FormaPago } from "@/types/typeCrud";
import InputCuil from "../utils/input-cuil";

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  formaPago?: FormaPago;
  onSubmit: (data:any) => void;
}

const formaPagoVacio = {
  forma_pago_id: '',
  nombre:        '',
  descripcion:   '',
  inhabilitada:  false,
}

const requeridosReset = {
  forma_pago_id: false,
  nombre:        false,
  descripcion:   false,
}

export default function NewEditFormasPago({ open, onOpenChange, mode, formaPago, onSubmit }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const { data, setData, get, processing, errors } = useForm<FormaPago>(formaPagoVacio);
  const [requeridos, setRequeridos] = useState<{
    forma_pago_id: boolean,
    nombre:        boolean,
    descripcion:   boolean,
  }>(requeridosReset);

  //useEffect
  useEffect(() => {
    if (!open) {
      setRequeridos(requeridosReset);
    }
  }, [open, mode]);

  useEffect(() => {
    if (mode === 'create' && !open) {
      setData(formaPagoVacio);
    } else if (formaPago && mode === 'edit') {
      setData({
        forma_pago_id: formaPago.forma_pago_id,
        nombre:        formaPago.nombre,
        descripcion:   formaPago.descripcion,
        inhabilitada:  formaPago.inhabilitada,
      });      
    } else {
      setData(formaPagoVacio);
    }
  }, [open, formaPago, mode]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!data.nombre){
      /*setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un nombre válido');
      setActivo(true);*/
      setRequeridos({ ...requeridos, nombre: true})
      return 
    }
    onSubmit(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nueva' : 'Editar'} forma de pago</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear una forma de pago' : 
                                  `Editando forma de pago: ${formaPago?.forma_pago_id}` }
          </DialogDescription>
          <hr />
        </DialogHeader>
        <form className="grid grid-cols-12 gap-4 px-4 pt-1 pb-4">
          { mode !== 'create' ? 
            (
              <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
                <label htmlFor="id">Id</label>
                <Input
                  disabled
                  value={data.forma_pago_id}
                  onChange={(e) => setData({ ...data, forma_pago_id: e.target.value })}
                  placeholder="Id"
                />
              </div>
            ) : <></>
          }
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="nombre">Nombre</label>
            <Input
              value={data.nombre}
              placeholder="Ingresar nombre"
              onChange={(e) => {
                setData({ ...data, nombre: e.target.value });
                if(e.target.value){ requeridos.nombre = false; }
              }}
            />
            {requeridos.nombre && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="descripcion">Descripción</label>
            <Textarea 
              value={data.descripcion} 
              onChange={(e) => setData({ ...data, descripcion: e.target.value })}
              placeholder="Ingresar una descripción" />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 flex flex-col">
            <label htmlFor="inhabilitada" className='mr-2'>Inhabilitado</label>
            <Switch checked={data.inhabilitada?true:false} onCheckedChange={(val) => setData('inhabilitada', val)} />
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
