import { Button } from "@/components/ui/button"
import {
  Dialog,  DialogClose,  DialogContent,  DialogDescription,  DialogFooter,  DialogHeader,
  DialogTitle,  DialogTrigger
} from "@/components/ui/dialog"
import { Select,  SelectContent,  SelectGroup,  SelectItem,  SelectLabel,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { Switch } from '@/components/ui/switch';
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "../ui/checkbox";
import React, { use, useState, useEffect } from "react"
import { usePage, useForm, router } from '@inertiajs/react';
import { Autocomplete, Menu, Multiple } from "@/types/typeCrud"
import { Loader2 } from 'lucide-react';
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react"
import Swal from 'sweetalert2';
import ShowMessage from "@/components/utils/showMessage"
import { route } from 'ziggy-js';
import { ordenarPorTexto } from "@/utils";
import GenericSelectDialog from "../utils/genericSelectDialog";

interface Props {
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  menu?: Menu;
  onSubmit: (data:Menu) => void;
  loading: boolean;
  padres: any[];
}

export default function NewEditDialog({ open, onOpenChange, mode, menu, onSubmit, loading, padres }: Props){
  //data
  const menuVacio = {
    menu_id:      null,
    nombre:       '',
    padre_id:     0,
    padre_nombre: '',
    orden:        0,
    icono:        '',
    inhabilitado: false,
    ruta_id:      '',
  };
  const [ activo, setActivo ]       = useState(false);
  const [ text, setText ]           = useState('');
  const [ title, setTitle ]         = useState('');
  const { data, setData, post, put, processing, errors } = useForm<Menu>(menuVacio);
  const [rutas, setRutas]           = useState<Multiple[]>([]);
  const [sinRuta, setSinRuta]       = useState(false);

  const [optionRuta, setOptionRuta] = useState<Autocomplete|null>(null);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!data.nombre){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un nombre del menú');
      setActivo(true);
      return 
    }
    if(!data.icono){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses el icono');
      setActivo(true);
      return;
    }
    onSubmit(data);
  }

  const seleccionarRuta = (option : any) => {
    if(option){
      setData({...data, ruta_id: option.value});
      setOptionRuta(option);
    }else{
      setData({...data, ruta_id: ''});
      setOptionRuta(null);
    }
  };
  
  //useEffect
  useEffect(() => {
    if (!open) {
      setData(menuVacio);
      setSinRuta(false);
      return;
    }

    if (menu) {
      setData({
        menu_id:      menu.menu_id,
        nombre:       menu.nombre,
        padre_id:     menu.padre_id ?? 0,
        padre_nombre: menu.padre_nombre,
        orden:        0,
        icono:        menu.icono,
        inhabilitado: menu.inhabilitado,
        ruta_id:      menu.ruta_id
      });
      setSinRuta(!menu.ruta_id);
    } else {
      setData(menuVacio);
      setSinRuta(false);
    }
  }, [open, menu]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto ">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo Menú' : 'Editar Menú'}</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear un nuevo menú' : 
                                  `Editando menú: ${menu?.menu_id}` }
          </DialogDescription>
          <hr />
        </DialogHeader>
        <form className="grid grid-cols-12 gap-2  space-y-4">
          { mode !== 'create' ? 
            (
              <div className="col-span-12">
                <label htmlFor="id">Id</label>
                <Input
                  disabled
                  value={data.menu_id??''}
                  onChange={(e) => setData({ ...data, menu_id: Number(e.target.value) })}
                  placeholder="Id"
                />
              </div>
            ) : <></>
          }
          <div className="col-span-12">
            <label htmlFor="nombre">Nombre</label>
            <Input
              value={data.nombre}
              onChange={(e) => setData({ ...data, nombre: e.target.value })}
              placeholder="Nombre"
            />
          </div>
          <div className="col-span-12">
            <label htmlFor="padre">Selec. Padre</label>
            <Select
              value={String(data.padre_id)}
              onValueChange={(value) => setData('padre_id', Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {padres.map((e: any) => (
                    <SelectItem key={e.menu_id} value={String(e.menu_id)}>
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-12 mb-0">
            <label htmlFor="padre">Rutas</label>
            <GenericSelectDialog
              route="rutas"
              value={optionRuta}
              onChange={(option) => seleccionarRuta(option)}
              placeHolder="Seleccionar ruta"
            />
            <div className="mt-1 flex justify-end">
              <Checkbox id="controlRuta" className="me-2 mt-1" checked={sinRuta} 
                onCheckedChange={(value) => {
                  const checked = value as boolean; 
                  setSinRuta(checked); 
                  if (checked) { setData('ruta_id', null); // ruta vacía 
                  } 
                }} 
              />
              <label htmlFor="">Sin Ruta</label>
            </div>
          </div>
          {/*<div className="col-span-12 mb-0">
            <label htmlFor="padre">Selecionar Ruta</label>
            <Select
              value={String(data.ruta_id ?? '')}
              onValueChange={(value) => {
                setData('ruta_id', Number(value));
                setSinRuta(false);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {rutas.map((e: any) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="mt-1 flex justify-end">
              <Checkbox id="controlRuta" className="me-2 mt-1" checked={sinRuta} 
                onCheckedChange={(value) => {
                  const checked = value as boolean; 
                  setSinRuta(checked); 
                  if (checked) { setData('ruta_id', null); // ruta vacía 
                  } 
                }} 
              />
              <label htmlFor="">Sin Ruta</label>
            </div>
          </div>*/}
          <div className="col-span-12">
            <label htmlFor="icono">Icono</label>
            <Input
              value={data.icono}
              onChange={(e) => setData({ ...data, icono: e.target.value })}
              placeholder="ícono"
            />
          </div>
          <div className="col-span-12">
            <label className='mr-2'>Inhabilitado</label>
            <Switch checked={data.inhabilitado?true:false} onCheckedChange={(val:any) => setData('inhabilitado', val)} />
          </div>
          <div className="col-span-12">
            <div className="grid w-full max-w-xl items-start gap-4">
              <Alert >
                <AlertCircleIcon color="red"/>
                <AlertTitle>Recordatorio!</AlertTitle>
                <AlertDescription>
                  Se debe agregar el Icono manualmente al Import del archivo que maneja el menú.
                </AlertDescription>
              </Alert>
            </div>
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
            { loading ? ( <Loader2 size={20} className="animate-spin mr-2"/> ) :
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
