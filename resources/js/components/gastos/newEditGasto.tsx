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

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  gasto?: Gasto;
  onSubmit: (data:any) => void;
}

const gastoVacio = {
  gasto_id:         0,
  fecha:            (new Date()).toLocaleDateString(),
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
  const [optionProv, setOptionProv]           = useState<Autocomplete|null>(null);
  const [optionFp, setOptionFp]               = useState<Autocomplete|null>(null);

  const tipoCajas = [ {id:0, nombre: 'Sin caja'}, {id: -1, nombre: 'Principal'} ];

  //useEffect
  useEffect(() => {
    if (!open) {
      setData(gastoVacio);
      setOptionProv(null);
      setOptionFp(null);
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
    const payload = { ...data }
    if(data.caja_id === -1){
      payload.caja_id = '';
    }
    //return console.log(payload);
    onSubmit(payload);
  }

  const seleccionarProveedor = (option : any) => {
    if(option){
      setData({...data, proveedor_id: option.value, proveedor_nombre: option.label});
      setOptionProv(option);
    }else{
      setData({...data, proveedor_id: 0, proveedor_nombre: ''});
      setOptionProv(null);
    }
  };
  const seleccionarFp = (option : any) => {
    if(option){
      //setFpId(option.value);
      setData({...data, forma_pago_id: option.value, forma_pago_nombre: option.label});
      setOptionFp(option);
    }else{
      //setFpId(0);
      setData({...data, forma_pago_id: 0, forma_pago_nombre: ''});
      setOptionFp(null);
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
                <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
                  <label htmlFor="fecha">Fecha</label>
                  <DatePicker 
                    fecha={(data.fecha)} 
                    disable
                    setFecha={ (fecha:string) => {setData({...data, fecha})} }
                  />
                </div>
              </>
            ) : <></>
          }
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6">
            <label htmlFor="proveedor">Proveedor</label>
            {
              mode === 'create' ? (
                <GenericSelect
                  route="proveedores"
                  value={optionProv}
                  onChange={(option) => seleccionarProveedor(option)}
                  placeHolder='Seleccionar'
                />
              ) :(
                <><p>input disabled</p></>
              )
            }
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6">
            <label htmlFor="fp">Forma de Pago</label>
            {
              mode === 'create' ? (
                <GenericSelect
                  route="formas-pago"
                  value={optionFp}
                  onChange={(option) => seleccionarFp(option)}
                  placeHolder='Seleccionar'
                />
              ) :(
                <><p>input disabled</p></>
              )
            }
          </div>
          <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-6">
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
          <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-6'>
            <label htmlFor="monto">Monto</label>
            <NumericFormat 
              value={data.monto} 
              thousandSeparator="." 
              decimalSeparator="," 
              prefix="$" 
              className="text-right border rounded px-2 py-1" 
              onValueChange={(values) => { setData({...data,monto: values.floatValue || 0}) }}
            />	
          </div>
          <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-12'>
            <label htmlFor="descripcion">Descripción</label>
            <Textarea 
              id="descripcion" 
              placeholder="Escribe una detalle..." 
              value={data.descripcion}
              onChange={(e) => setData({...data, descripcion: e.target.value})}
            />
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
