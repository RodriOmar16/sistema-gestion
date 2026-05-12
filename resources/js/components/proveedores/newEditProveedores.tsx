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

const requeridosReset = {
  proveedor_id: false,
  nombre:       false,
  descripcion:  false,
  razon_social: false,
  cuit:         false,
  nro_telefono: false,
}

export default function NewEditProveedor({ open, onOpenChange, mode, proveedor, onSubmit, loading }: Props){
  //data
  const { data, setData, get, processing, errors } = useForm<Proveedor>(proveedorVacio);

  const [requeridos, setRequeridos] = useState<{
    proveedor_id: boolean,
    nombre:       boolean,
    descripcion:  boolean,
    razon_social: boolean,
    cuit:         boolean,
    nro_telefono: boolean,
  }>(requeridosReset);

  //useEffect
  useEffect(() => {
    if (!open) {
      setRequeridos(requeridosReset);
    }
  }, [open]);

  useEffect(() => {
    if(mode === 'create' && !open){
      setData(proveedorVacio);
    }else if (proveedor && mode === 'edit') {
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
  }, [proveedor, mode, open]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    /*if(!data.nombre){
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
    }*/
    const nuevosErrores = {
      proveedor_id: false,
      nombre:       !data.nombre,
      descripcion:  false,
      razon_social: !data.razon_social,
      cuit:         !data.cuit,
      nro_telefono: false,
    };
    setRequeridos(nuevosErrores);
    const hayErrores = Object.values(nuevosErrores).some(e => e);

    if (hayErrores) {
      return;
    }

    data.cuit = Number(data.cuit);
    onSubmit(data);
  }
  const guardarCuit = (nro:number|string) => {
    setData({...data, cuit: nro});
    if(nro){ requeridos.cuit = false; }
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
              placeholder="Ingresar nombre"
              onChange={(e) => {
                setData({ ...data, nombre: e.target.value });
                if(e.target.value){ requeridos.nombre = false; }
              }}
            />
            { requeridos.nombre && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="razonSocial">Razón social</label>
            <Input
              value={data.razon_social}
              placeholder="Ingresar razón social"
              onChange={(e) => {
                setData({ ...data, razon_social: e.target.value });
                if(e.target.value){ requeridos.razon_social = false }
              }}
            />
            { requeridos.razon_social && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="cuit">Cuit</label>
            <InputCuil 
              data={String(data.cuit)}
              placeholder='Ingresar cuit'
              setData={guardarCuit}
            />
            { requeridos.cuit && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="razonSocial">Nro. de Teléfono</label>
            <Input
              value={data.nro_telefono}
              onChange={(e) => setData({ ...data, nro_telefono: e.target.value })}
              placeholder="Ingresar nro. de teléfono"
            />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="descripcion">Descripción</label>
            <Textarea 
              value={data.descripcion} 
              onChange={(e) => setData({ ...data, descripcion: e.target.value })}
              placeholder="Ingresar una descripción" />
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
    </Dialog>
  );
}
