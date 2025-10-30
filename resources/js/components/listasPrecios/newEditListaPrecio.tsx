import { Button } from "@/components/ui/button"
import {
  Dialog,  DialogClose,  DialogContent,  DialogDescription,  DialogFooter,  DialogHeader,
  DialogTitle,  DialogTrigger
} from "@/components/ui/dialog"
import { Select,  SelectContent,  SelectGroup,  SelectItem,  SelectLabel,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from '@/components/ui/switch';
import { useForm } from "@inertiajs/react"
import React, { useState, useEffect } from "react"
import { Loader2 } from 'lucide-react';
import ShowMessage from "@/components/utils/showMessage";
import { ListaPrecio } from "@/types/typeCrud";
import { Multiple } from "@/types/typeCrud";
import { DatePicker } from "../utils/date-picker";
import { convertirFechaBarrasGuiones, convertirFechaGuionesBarras } from "@/utils";

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  listaPrecio?: ListaPrecio;
  onSubmit: (data:any) => void;
  loading: boolean;
  proveedores: Multiple[]
}

const listaPrecioVacia = {
  lista_precio_id:     '',
  lista_precio_nombre: '',
  proveedor_id:        '',
  proveedor_nombre:    '',
  fecha_inicio:        (new Date()).toLocaleDateString(),
  fecha_fin:           (new Date()).toLocaleDateString(),
  inhabilitada:        false
}

export default function NewEditListaPrecio({ open, onOpenChange, mode, listaPrecio, onSubmit, loading, proveedores }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');

  const { data, setData, get, processing, errors } = useForm<ListaPrecio>(listaPrecioVacia);

  //useEffect
  useEffect(() => {
    if (!open && mode === 'create') {
      setData(listaPrecioVacia);
    }
  }, [open, mode]);

  useEffect(() => {
    if (listaPrecio && mode === 'edit') {
      setData({
        lista_precio_id:     listaPrecio.lista_precio_id,
        lista_precio_nombre: listaPrecio.lista_precio_nombre,
        proveedor_id:        listaPrecio.proveedor_id,
        proveedor_nombre:    listaPrecio.proveedor_nombre,
        fecha_inicio:        convertirFechaGuionesBarras(listaPrecio.fecha_inicio),
        fecha_fin:           convertirFechaGuionesBarras(listaPrecio.fecha_fin),
        inhabilitada:        listaPrecio.inhabilitada
      });      
    } else {
      setData(listaPrecioVacia);
    }
  }, [listaPrecio, mode]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!data.lista_precio_nombre){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un nombre válido');
      setActivo(true);
      return 
    }
    if(!data.proveedor_id){
      setTitle('¡Campo faltante!');
      setText('Se requiere que selecciones un proveedor');
      setActivo(true);
      return 
    }
    if(!data.fecha_inicio){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses la fecha de inicio');
      setActivo(true);
      return 
    }
    const dataCopia = JSON.parse(JSON.stringify(data));
    dataCopia.fecha_inicio = convertirFechaBarrasGuiones(data.fecha_inicio);
    dataCopia.fecha_fin = convertirFechaBarrasGuiones(data.fecha_fin);
    onSubmit(dataCopia);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nueva' : 'Editar'} lista de precios</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear una lista de precios' : 
                                  `Editando lista de precios: ${listaPrecio?.lista_precio_id}` }
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
                  value={data.lista_precio_id}
                  onChange={(e) => setData({ ...data, lista_precio_id: e.target.value })}
                  placeholder="Id"
                />
              </div>
            ) : <></>
          }
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="nombre">Nombre</label>
            <Input
              value={data.lista_precio_nombre}
              onChange={(e) => setData({ ...data, lista_precio_nombre: e.target.value })}
              placeholder="Ingresar nombre"
            />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="proveedor_id">Proveedor</label>
            <Select
              value={String(data.proveedor_id)}
              onValueChange={(value) => setData('proveedor_id', Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar un proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {proveedores.map((e: any) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="fechaInicio">Fecha inicio</label>
            <DatePicker 
              fecha={(data.fecha_inicio)} 
              setFecha={ (fecha:string) => {setData('fecha_inicio', fecha)} }
            />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="fechaFin">Fecha fin</label>
            <DatePicker 
              fecha={(data.fecha_fin)} 
              setFecha={ (fecha:string) => {setData('fecha_fin', fecha)} }
            />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 flex flex-col">
            <label htmlFor="inhabilitado" className='mr-2'>Inhabilitada</label>
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