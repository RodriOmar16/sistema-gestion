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
import { Proveedor } from "@/types/typeCrud";
import InputCuil from "../utils/input-cuil";

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  proveedor?: Proveedor;
  onSubmit: (data:any) => void;
  loading: boolean;
}

const proveedorVacio = {
  proveedor_id: '',
  nombre:       '',
  descripcion:  '',
  razon_social: '',
  cuit:         '',
  nro_telefono: '',
  inhabilitado: false,
}

export default function NewEditProveedor({ open, onOpenChange, mode, proveedor, onSubmit, loading }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');

  const { data, setData, get, processing, errors } = useForm<Proveedor>(proveedorVacio);

  //useEffect
  useEffect(() => {
    if (!open && mode === 'create') {
      setData(proveedorVacio);
    }
  }, [open, mode]);

  useEffect(() => {
    if (proveedor && mode === 'edit') {
      setData({
        proveedor_id: proveedor.proveedor_id,
        nombre:       proveedor.nombre,
        descripcion:  proveedor.descripcion,
        razon_social: proveedor.razon_social,
        cuit:         proveedor.cuit,
        nro_telefono: proveedor.nro_telefono,
        inhabilitado: proveedor.inhabilitado,
      });      
    } else {
      setData(proveedorVacio);
    }
  }, [proveedor, mode]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!data.nombre){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un nombre válido');
      setActivo(true);
      return 
    }
    if(!data.razon_social){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses una razón social');
      setActivo(true);
      return 
    }
    if(!data.cuit){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un cuit');
      setActivo(true);
      return 
    }
    data.cuit = Number(data.cuit);
    onSubmit(data);
  }
  const guardarCuit = (nro:number|string) => {
    setData({...data, cuit: nro});
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo' : 'Editar'} proveedor</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear un proveedor' : 
                                  `Editando proveedor: ${proveedor?.proveedor_id}` }
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
                  value={data.proveedor_id}
                  onChange={(e) => setData({ ...data, proveedor_id: e.target.value })}
                  placeholder="Id"
                />
              </div>
            ) : <></>
          }
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="nombre">Nombre</label>
            <Input
              value={data.nombre}
              onChange={(e) => setData({ ...data, nombre: e.target.value })}
              placeholder="Ingresar nombre"
            />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="descripcion">Descripción</label>
            <Textarea 
              value={data.descripcion} 
              onChange={(e) => setData({ ...data, descripcion: e.target.value })}
              placeholder="Ingresar una descripción" />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="razonSocial">Razón social</label>
            <Input
              value={data.razon_social}
              onChange={(e) => setData({ ...data, razon_social: e.target.value })}
              placeholder="Ingresar razón social"
            />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="cuit">Cuit</label>
            <InputCuil 
              data={String(data.cuit)}
              setData={guardarCuit}
              placeholder='Ingresar cuit'
            />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="razonSocial">Nro. de Teléfono</label>
            <Input
              value={data.nro_telefono}
              onChange={(e) => setData({ ...data, nro_telefono: e.target.value })}
              placeholder="Ingresar nro. de teléfono"
            />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 flex flex-col">
            <label htmlFor="inhabilitado" className='mr-2'>Inhabilitado</label>
            <Switch checked={data.inhabilitado?true:false} onCheckedChange={(val) => setData('inhabilitado', val)} />
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
