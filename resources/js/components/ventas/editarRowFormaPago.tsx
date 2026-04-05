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
import { Loader2, Save } from 'lucide-react';
import ShowMessage from "@/components/utils/showMessage";
import { Autocomplete, Gasto } from "@/types/typeCrud";
import { apiRequest, convertirFechaGuionesBarras } from "@/utils";
import { DatePicker } from "../utils/date-picker";
import GenericSelect from "../utils/genericSelect";
import { NumericFormat } from "react-number-format";
import ModalConfirmar from "../modalConfirmar";
import { route } from "ziggy-js";

type FormPago = {
  id: number,
  forma_pago_id: number, 
  forma_pago_nombre: string, 
  monto: number, 
  fecha: string,
  titular: string,
  banco_billetera_id: number,
  banco_billetera_nombre: string,
  estado_id: number,
  estado_nombre: string,
  cbu_nro_comprobante: string,
};

interface Props{
  ventaId: number;
  open: boolean;
  onOpenChange: (open:boolean) => void;
  formaPago?: FormPago;
  onChange: (data:any) => void;
}

const fpVacio = {
  id: 0,
  forma_pago_id: 0, 
  forma_pago_nombre: '',  
  monto: 0, 
  fecha:  (new Date()).toLocaleDateString(),
  titular: '',
  banco_billetera_id: 0,
  banco_billetera_nombre: '',
  estado_id:0,
  estado_nombre:'',
  cbu_nro_comprobante: '',
}; 

export default function EditarFormaPagoRow({ ventaId, open, onOpenChange, formaPago, onChange }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const [openConfirmar, setOpenConfirmar]   = useState(false);
  const [textoConfirmar, setTextoConfirmar] = useState(''); 

  const [load, setLoad] = useState(false);
   
  const { data, setData, get, post, processing, errors } = useForm<FormPago>(fpVacio);

  const bancBillVacio                         = { id: 0 , nombre: '' };
  const [bancBille, setBancBille]             = useState<{id: number, nombre: string}>(bancBillVacio);
  const [optionBancBille, setOptionBancBille] = useState<Autocomplete|null>(null);

  const estOpVacio                    = { id: 0 , descripcion: '' };
  const [estadoOp, setEstadoOp]       = useState<{id: number, descripcion: string}>(estOpVacio);
  const [optionEstOp, setOptionEstOp] = useState<Autocomplete|null>(null);

  //useEffect
  useEffect(() => {
    if (!open) {
      setData(fpVacio);
      setOptionBancBille(null);
      setOptionEstOp(null);
    }else{
      if(formaPago){
        setData({
          id:                     formaPago.id, 
          forma_pago_id:          formaPago.forma_pago_id, 
          forma_pago_nombre:      formaPago.forma_pago_nombre, 
          monto:                  formaPago.monto, 
          fecha:                  formaPago.fecha,
          titular:                formaPago.titular,
          banco_billetera_id:     formaPago.banco_billetera_id,
          banco_billetera_nombre: formaPago.banco_billetera_nombre,
          estado_id:              formaPago.estado_id ,
          estado_nombre:          formaPago.estado_nombre,
          cbu_nro_comprobante:    formaPago.cbu_nro_comprobante,
        });        
        setOptionBancBille({value: formaPago.banco_billetera_id, label: formaPago.banco_billetera_nombre});
        setOptionEstOp({value: formaPago.estado_id, label: formaPago.estado_nombre});
      }
    }
  }, [open, formaPago]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpenConfirmar(true);
    setTextoConfirmar('Estás seguro de querer modificar los datos de las formas de pago?');
  }

  const seleccionarBancoBilletera = (option : any) => {
    if(option){
      setData({...data, banco_billetera_id: option.value, banco_billetera_nombre: option.label});
      setOptionBancBille(option);
    }else{
      setData({...data, banco_billetera_id: 0, banco_billetera_nombre: ''});
      setOptionBancBille(null);
    }
  };
  const seleccionarEstadoOperacion = (option : any) => {
    if(option){
      //setFpId(option.value);
      setData({...data, estado_id: option.value, estado_nombre: option.label});
      setOptionEstOp(option);
    }else{
      //setFpId(0);
      setData({...data, estado_id: 0, estado_nombre: ''});
      setOptionEstOp(null);
    }
  };

  const grabarEditar = async () => {
    setOpenConfirmar(false);
    setTextoConfirmar('');

    //console.log("editando....", data)

    if(data.id < 0){
      //es nueva la row, estoy grabando la venta
      console.log("nueva venta: ", ventaId, data.id)
    }else{
      //estoy editando o por anular  
      console.log("venta existente pero valida: ", ventaId, data.id)
      //consula PUT a la base
      setLoad(true);

      try {
          let resp : {resultado: number, gasto_id: number, mensaje?:string} ;
    
          resp = await apiRequest(route('ventas.editarFp',{ venta: ventaId }), 'PUT', data);
    
          if (resp.resultado === 0) {
            setTitle('Error');
            setText(resp.mensaje ?? 'Error inesperado');
            setColor('error');
            setActivo(true);
            return;
          }
    
          setTitle('Forma de pago modificada');
          setText(`${resp.mensaje} (ID: ${data.id})`);
          setColor('success');
          setActivo(true);
    
        } catch (error: any) {
          setTitle('Error de red');
          setText(error.message);
          setColor('error');
          setActivo(true);
        } finally {
          setLoad(false);
        }
    }
    onChange(data);
  };

  const cancelarEditar = () => {
    setOpenConfirmar(false);
    setTextoConfirmar('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] ">
        <DialogHeader>
          <DialogTitle>Editar forma de pago</DialogTitle>
          <DialogDescription></DialogDescription>
          <hr />
        </DialogHeader>
        <form className="grid grid-cols-12 gap-4 px-4 pt-1 pb-4">
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6">
            <label htmlFor="banco_billetera">Banco/Billetera</label>
            <GenericSelect
              route="bancos-billeteras"
              value={optionBancBille}
              onChange={(option) => seleccionarBancoBilletera(option)}
              placeHolder='Seleccionar'
            />
          </div>
          <div className='col-span-12 sm:col-span-4 md:col-span-6 lg:col-span-6'>
            <label htmlFor="cbu">CBU/Nro. Comprobante</label>
            <Input
              className='text-right'
              type='number'
              value={data.cbu_nro_comprobante} 
              onChange={(e)=>setData({...data, cbu_nro_comprobante: e.target.value})}
            />	
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6">
            <label htmlFor="titular">Titular</label>
            <Input 
              value={data.titular} 
              onChange={(e)=>setData({...data, titular: e.target.value})}
            />	
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6">
            <label htmlFor="estado_operacion">Estado operación</label>
            <GenericSelect
              route="estados-operaciones"
              value={optionEstOp}
              onChange={(option) => seleccionarEstadoOperacion(option)}
              placeHolder='Seleccionar'
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
            { load ? ( <Loader2 size={20} className="animate-spin mr-2"/> ) : <Save size={20}/>
            }Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
      <ModalConfirmar      
        open={openConfirmar}
        text={textoConfirmar}
        onSubmit={grabarEditar}
        onCancel={cancelarEditar}
      />
      <ShowMessage 
        open={activo}
        title={title}
        text={text}
        color={color}
        onClose={() => setActivo(false)}
      />
    </Dialog>
  );
}
