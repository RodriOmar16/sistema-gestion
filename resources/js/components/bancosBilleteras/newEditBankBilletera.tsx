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
import { Autocomplete, BancoBilletera } from "@/types/typeCrud";
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
  banco?: BancoBilletera;
  onSubmit: (data:any) => void;
}

const bancoBilleteraVacio = {
  banco_billetera_id: '',
  nombre:             '',
  inhabilitado:       0,
  created_at:         '',
  updated_at:         ''
};

export default function NewEditBancoBilletera({ open, onOpenChange, mode, banco, onSubmit }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const { data, setData, get, post, processing, errors } = useForm<BancoBilletera>(bancoBilleteraVacio);
  const [load, setLoad]     = useState(false);

  //useEffect
  useEffect(() => {
    if (!open) {
      setData(bancoBilleteraVacio);
    }else{
      if(banco && mode === 'edit'){
        setData({
          banco_billetera_id: banco.banco_billetera_id,
          nombre:             banco.nombre,
          inhabilitado:       banco.inhabilitado,
          created_at:         banco.created_at,
          updated_at:         banco.updated_at
        });        
      }
    }
  }, [open, mode, banco]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if(!data.nombre){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un nombre');
      setActivo(true);
      return 
    }

    onSubmit(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo' : 'Editar'} Banco / Billetera</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear un banco o billetera' : 
                                  `Editando banco/billetera: ${banco?.banco_billetera_id}` }
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
                    value={data.banco_billetera_id}
                    placeholder="Id"
                  />
                </div>
              </>
            ) : <></>
          }
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="nombre">Nombre</label>
            <Input
              value={data.nombre}
              onChange={(e) => setData({ ...data, nombre: e.target.value })}
              placeholder=""
            />
          </div>
          <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-3 flex flex-col'>
            <label className='mr-2'>Inhabilitado</label>
            <Switch checked={data.inhabilitado==0 ? false: true} onCheckedChange={(val) => setData('inhabilitado', val)} />
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
            { load ? ( <Loader2 size={20} className="animate-spin mr-2"/> ):(<Save size={20}/>)} 
            { mode === 'create' ? 'Grabar' : 'Actualizar' }
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
