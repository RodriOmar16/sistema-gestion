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
import { Autocomplete, Gasto } from "@/types/typeCrud";
import { convertirFechaGuionesBarras } from "@/utils";
import { DatePicker } from "../utils/date-picker";
import GenericSelect from "../utils/genericSelect";
import { NumericFormat } from "react-number-format";
import ModalConfirmar from "../modalConfirmar";
import { route } from "ziggy-js";

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  gasto?: Gasto;
  onSubmit: (data:any) => void;
}

const gastoVacio = {
  gasto_id:               '',
  fecha:                  (new Date()).toLocaleDateString(),
  fecha_desde:            '',
  fecha_hasta:            '',
  caja_id:                '',
  proveedor_id:           '',
  proveedor_nombre:       '',
  categoria_gasto_id:     '',
  categoria_gasto_nombre: '',
  forma_pago_id:          '',
  forma_pago_nombre:      '',
  monto:                  '',
  descripcion:            '',
  inhabilitado:           0
};

const requeridosReset = {
  gasto_id:               false,
  fecha:                  false,
  fecha_desde:            false,
  fecha_hasta:            false,
  caja_id:                false,
  proveedor_id:           false,
  proveedor_nombre:       false,
  categoria_gasto_id:     false,
  categoria_gasto_nombre: false,
  forma_pago_id:          false,
  forma_pago_nombre:      false,
  monto:                  false,
  descripcion:            false,
}

export default function NewEditGasto({ open, onOpenChange, mode, gasto, onSubmit }: Props){
  //data
  const { data, setData, get, post, processing, errors } = useForm<Gasto>(gastoVacio);
  const [optionProv, setOptionProv]           = useState<Autocomplete|null>(null);
  const [optionFp, setOptionFp]               = useState<Autocomplete|null>(null);
  const [optionCg, setOptionCg]               = useState<Autocomplete|null>(null);
  const [requeridos, setRequeridos]           = useState<{
    gasto_id:               boolean,
    fecha:                  boolean,
    fecha_desde:            boolean,
    fecha_hasta:            boolean,
    caja_id:                boolean,
    proveedor_id:           boolean,
    proveedor_nombre:       boolean,
    categoria_gasto_id:     boolean,
    categoria_gasto_nombre: boolean,
    forma_pago_id:          boolean,
    forma_pago_nombre:      boolean,
    monto:                  boolean,
    descripcion:            boolean,
  }>(requeridosReset);

  const tipoCajas = [ {id:0, nombre: 'Sin caja'}, {id: -1, nombre: 'Principal'} ];

  //useEffect
  useEffect(() => {
    if (!open) {
      setData(gastoVacio);
      setOptionProv(null);
      setOptionFp(null);
      setOptionCg(null);
      setRequeridos(requeridosReset);
    }else{
      if(gasto && mode === 'edit'){
        setData({
          gasto_id:               gasto.gasto_id,
          fecha:                  convertirFechaGuionesBarras(gasto.fecha??''),
          fecha_desde:            '',
          fecha_hasta:            '',
          caja_id:                gasto.caja_id,
          proveedor_id:           gasto.proveedor_id,
          proveedor_nombre:       gasto.proveedor_nombre,
          categoria_gasto_id:     gasto.categoria_gasto_id,
          categoria_gasto_nombre: gasto.categoria_gasto_nombre,
          forma_pago_id:          gasto.forma_pago_id,
          forma_pago_nombre:      gasto.forma_pago_nombre,
          monto:                  gasto.monto,
          descripcion:            gasto.descripcion,
          inhabilitado:           gasto.inhabilitado
        });
        setOptionCg({value: Number(gasto.categoria_gasto_id), label: String(gasto.categoria_gasto_nombre)})     ;
      }
    }
  }, [open, mode, gasto]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevosErrores = {
      gasto_id:               false,
      fecha:                  (data.fecha === '' || !data.fecha),
      fecha_desde:            false,
      fecha_hasta:            false,
      caja_id:                data.caja_id === '',
      proveedor_id:           !data.proveedor_id,
      proveedor_nombre:       false,
      categoria_gasto_id:     !data.categoria_gasto_id,
      categoria_gasto_nombre: false,
      forma_pago_id:          !data.forma_pago_id,
      forma_pago_nombre:      false,
      monto:                  Boolean(!data.monto || (Number(data.monto) && Number(data.monto) <= 0)),
      descripcion:            !data.descripcion,
    };
    setRequeridos(nuevosErrores);
    const hayErrores = Object.values(nuevosErrores).some(e => e);

    if (hayErrores) {
      return;
    }
    //return console.log("data: ", data)
    onSubmit(data);
  }

  const seleccionarProveedor = (option : any) => {
    if(option){
      setData({...data, proveedor_id: option.value, proveedor_nombre: option.label});
      setOptionProv(option);
      setRequeridos({...requeridos, proveedor_id: false});
    }else{
      setData({...data, proveedor_id: '', proveedor_nombre: ''});
      setOptionProv(null);
    }
  };
  const seleccionarFp = (option : any) => {
    if(option){
      //setFpId(option.value);
      setData({...data, forma_pago_id: option.value, forma_pago_nombre: option.label});
      setOptionFp(option);
      setRequeridos({...requeridos, forma_pago_id: false});
    }else{
      //setFpId(0);
      setData({...data, forma_pago_id: '', forma_pago_nombre: ''});
      setOptionFp(null);
    }
  };
  const seleccionarCategoria = (option : any) => {
    if(option){
      setData({...data, categoria_gasto_id: option.value, categoria_gasto_nombre: option.label});
      setOptionCg(option);
      setRequeridos({...requeridos, categoria_gasto_id: false});
    }else{
      setData({...data, categoria_gasto_id: '', categoria_gasto_nombre: ''});
      setOptionCg(null);
    }
  };

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
              </>
            ) : <></>
          }
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="fecha">Fecha</label>
            <DatePicker 
              fecha={(data.fecha)} 
              setFecha={ (fecha:string) => {
                setData({...data, fecha});
                if(fecha){ requeridos.fecha = false; }
              }}
            />
            { requeridos.fecha && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-12">
            <label htmlFor="proveedor">Proveedor</label>
            {
              mode === 'create' ? (
                <>
                  <GenericSelect
                    route="proveedores"
                    value={optionProv}
                    onChange={(option) => seleccionarProveedor(option)}
                    placeHolder='Seleccionar'
                  />
                  { requeridos.proveedor_id && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
                </>
              ) :(
                <>
                  <Input
                    disabled
                    value={data.proveedor_nombre}
                    placeholder="proveedor"
                  />
                </>
              )
            }
          </div>
          <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-12'>
            <label htmlFor="categoria">Categoría</label>
            {/*
              mode === 'create' ? (
                <>
                  <GenericSelect
                    route="categoria-gastos"
                    value={optionCg}
                    onChange={(option) => seleccionarCategoria(option)}
                    placeHolder='Seleccionar'
                  />
                  { requeridos.categoria_gasto_id && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
                </>
              ) :(
                <>
                  <Input
                    disabled
                    value={data.categoria_gasto_nombre}
                    placeholder="Categoria"
                  />
                </>
              )
            */}
            <GenericSelect
              route="categoria-gastos"
              value={optionCg}
              onChange={(option) => seleccionarCategoria(option)}
              placeHolder='Seleccionar'
            />
            { requeridos.categoria_gasto_id && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-12">
            <label htmlFor="fp">Forma de Pago</label>
            {
              mode === 'create' ? (
                <>
                  <GenericSelect
                    route="formas-pago"
                    value={optionFp}
                    onChange={(option) => seleccionarFp(option)}
                    placeHolder='Seleccionar'
                  />
                  { requeridos.forma_pago_id && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
                </>
              ) :(
                <>
                  <Input
                    disabled
                    value={data.forma_pago_nombre}
                    placeholder="fp_nombre"
                  />
                </>
              )
            }
          </div>
          { mode === 'create' ? (
            <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-12">
              <label htmlFor="padre">Caja</label>
              <Select
                value={String(data.caja_id)}
                onValueChange={(value) => {
                  setData('caja_id', Number(value));
                  if(value){ requeridos.caja_id = false; }
                }}
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
              { requeridos.caja_id && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
            </div>
          ) : (
            <></>
          )}
          <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
            <div className="flex flex-col">
              <label htmlFor="monto">Monto</label>
              <NumericFormat 
                value={data.monto} 
                thousandSeparator="." 
                decimalSeparator="," 
                prefix="$" 
                className="text-right border rounded px-2 py-1" 
                onValueChange={(values) => { 
                  setData({...data, monto: values.floatValue || 0});
                  if(values.floatValue){ requeridos.monto = false }
                }}
              />
              { requeridos.monto && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
            </div>
          </div>
          <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
            <label htmlFor="descripcion">Descripción</label>
            <Textarea 
              id="descripcion" 
              placeholder="Escribe una detalle..." 
              value={data.descripcion}
              onChange={(e) => {
                setData({...data, descripcion: e.target.value});
                if(e.target.value){ requeridos.descripcion = false; }
              }}
            />
            { requeridos.descripcion && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
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
