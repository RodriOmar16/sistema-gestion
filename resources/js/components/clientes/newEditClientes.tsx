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
import { Cliente } from "@/types/typeCrud";
import InputDni from "../utils/input-dni";
import { DatePicker } from '@/components/utils/date-picker';
import { convertirFechaBarrasGuiones } from "@/utils";

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  cliente?: Cliente;
  onSubmit: (data:any) => void;
}

const clienteVacio = {
  cliente_id:       '',
  nombre:           '',
  fecha_nacimiento: '',
  domicilio:        '',
  email:            '',
  dni:              '',
  inhabilitado:     false,
}

export default function NewEditClientes({ open, onOpenChange, mode, cliente, onSubmit }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const { data, setData, get, processing, errors } = useForm<Cliente>(clienteVacio);

  //useEffect
  useEffect(() => {
    if (!open && mode === 'create') {
      setData(clienteVacio);
    }
  }, [open, mode]);

  useEffect(() => {
    if (cliente && mode === 'edit') {
      setData({
        cliente_id:       cliente.cliente_id,
        nombre:           cliente.nombre,
        fecha_nacimiento: cliente.fecha_nacimiento,
        domicilio:        cliente.domicilio,
        email:            cliente.email,
        dni:              cliente.dni,
        inhabilitado:     cliente.inhabilitado,
      });      
    } else {
      setData(clienteVacio);
    }
  }, [cliente, mode]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!data.nombre){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un nombre válido');
      setActivo(true);
      return 
    }
    if(!data.fecha_nacimiento){
      setTitle('¡Campo faltante!');
      setText('Se requiere que indiques fecha de nacimiento');
      setActivo(true);
      return 
    }
    if(!data.email){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un email válido');
      setActivo(true);
      return 
    }
    if(!data.dni){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un documento');
      setActivo(true);
      return 
    }
    const dataCopia = JSON.parse(JSON.stringify(data));
    dataCopia.fecha_nacimiento = convertirFechaBarrasGuiones(data.fecha_nacimiento);
    onSubmit(dataCopia);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo' : 'Editar'} cliente</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear un cliente' : 
                                  `Editando cliente: ${cliente?.cliente_id}` }
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
                  value={data.cliente_id}
                  onChange={(e) => setData({ ...data, cliente_id: e.target.value })}
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
            <label htmlFor="domicilio">Domicilio</label>
            <Input 
              value={data.domicilio} 
              onChange={(e) => setData({ ...data, domicilio: e.target.value })}
              placeholder="Ingresar una domicilio" />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="email">Email</label>
            <Input 
              value={data.email} 
              onChange={(e) => setData({ ...data, email: e.target.value })}
              placeholder="Ingresar un email" />
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6">
            <label htmlFor="fechaNac">Fecha Nac.</label>
            <DatePicker fecha={(data.fecha_nacimiento)} setFecha={ (fecha:string) => {setData('fecha_nacimiento',fecha)} }/>
          </div>
          <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6'>
            <label htmlFor="dni">Documento</label>
            <InputDni data={String(data.dni)} setData={(data) => setData('dni', data)}/>
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 flex flex-col">
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
