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
import { Loader2, Save, Plus, X } from 'lucide-react';
import ShowMessage from "@/components/utils/showMessage";
import { Autocomplete, CategoriaGasto, Gasto } from "@/types/typeCrud";
import { apiRequest, convertirFechaGuionesBarras } from "@/utils";
import { DatePicker } from "../utils/date-picker";
import GenericSelect from "../utils/genericSelect";
import { NumericFormat } from "react-number-format";
import ModalConfirmar from "../modalConfirmar";
import { route } from "ziggy-js";
import { Badge } from "../ui/badge";
import { router } from "@inertiajs/react";

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
}

const categoriaGastoVacio = {
  categoria_gasto_id: '',
  nombre:             '',
  inhabilitado:       0
};

export default function CategoriaGastos({ open, onOpenChange }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const [confirmar, setConfirmar]           = useState(false);
  const [textoConfirmar, setTextoConfirmar] = useState('');

  const [load, setLoad]         = useState(false);
  const [nva, setNva]           = useState(false);
  const [respuesta, setRespues] = useState(false);

  const { data, setData, get, post, processing, errors } = useForm<CategoriaGasto>(categoriaGastoVacio);
  const [array, setArray]   = useState<CategoriaGasto[]>([]);

  //useEffect
  useEffect(() => {
    if (!open) {
      setData(categoriaGastoVacio);
      setLoad(false);
      setNva(false);
      setArray([]);
    }else{
      //realizar la consulta
    }
  }, [open, data]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //preguntar para confimar
    if(!data.nombre){
      setTitle('Campo faltante');
      setText('Debes introducir un nombre para grabar.');
      setColor('warning');
      setActivo(true);
      return;
    }

    setTextoConfirmar('Estás segurp de grabar está categoría de gasto?');
    setConfirmar(true);
  }

  const grabarCategoria = async () => {
    //reseteo
    setTextoConfirmar('');
    setConfirmar(false);
    
    //si confirma...
    setLoad(true);
    let resp : {resultado: number, categoria_gasto_id: number, mensaje?:string} ;
    resp = await apiRequest(
      route('categoriaGasto.store'),
      'POST',
      { ...data }
    );
    
    setLoad(false);

    if(resp && resp?.resultado == 0){
      setTitle('Error al grabar');
      setText(resp.mensaje??'');
      setColor('error');
      setActivo(true);
      return;
    }

    setTitle('Categoría de gasto creada');
    setText('Se creó correctamente la nueva categoría de gasto');
    setColor('success');
    setActivo(true);

    //ejecutar el buscar
    let res : { categorias: CategoriaGasto[] } ;
    res = await apiRequest(
      route('categoriaGasto.index'),
      'GET'
    );
    if(res && res.categorias.length > 0) setArray([...res.categorias]);
    setNva(false);
    setData({...data, nombre: ''});
  };

  const cancelarGrabar = () => {

  };

  const quitar = (index: number) => {
    const newData = [...array];
    newData.splice(index, 1);
    setArray(newData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-h-[95vh] overflow-y-auto !max-w-[60vw] !w-[60vw]`}>
        <DialogHeader>
          <DialogTitle>Categorías de gastos</DialogTitle>
          <DialogDescription>
            Filtra, crea y edita tus categorías
          </DialogDescription>
          <hr />
        </DialogHeader>
        <form className="grid grid-cols-12 gap-4 px-4 pt-1 pb-4">
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            {!nva && (
                <div className="col-span-12 flex justify-end">
                  <Button type="button" title="Crear categoría" onClick={() => setNva(true)}>
                    <Plus /> Nueva
                  </Button>
                </div>
              )}
            {nva && (
              <form  className="grid grid-cols-12 gap-4 mb-4">
                <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6">
                  <label htmlFor="nombre">Nombre</label>
                  <Input
                    value={data.nombre}
                    onChange={(e) => setData({ ...data, nombre: e.target.value })}
                    placeholder="Asigna un nombre"
                  />
                </div>
                <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6 flex justify-end items-center">
                  <Button disabled={load} type="button" title="Crear categoría" onClick={handleSubmit}>
                    {load? (<Loader2 size={20} className="animate-spin"/>) : (<Save />) } Grabar
                  </Button>
                </div>
              </form>
            )}
          </div>
          <div className="col-span-12 max-h-64 overflow-y-auto mt-">
            <label htmlFor="categorias">Listado de categorías</label>
            <table className="min-w-full border-collapse mt-2 border border-gray-300 rounded">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-2 py-1 border">ID</th>
                  <th className="px-2 py-1 border">Nombre</th>
                  <th className="px-2 py-1 border">Estado</th>
                  <th className="px-2 py-1 border">Acción</th>
                </tr>
              </thead>
              <tbody>
                {array.length > 0 ? (
                  array.map((p, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1 border">{p.categoria_gasto_id}</td>
                      <td className="px-2 py-1 border">{p.nombre}</td>
                      <td className="px-2 py-1 border text-center">
                        <Badge
                          variant="secondary"
                          className={`flex items-center justify-center gap-1 ${
                            p.inhabilitado === 0
                              ? 'bg-green-500 text-white dark:bg-green-600'
                              : 'bg-red-500 text-white dark:bg-red-600'
                          }`}
                        >
                          {p.inhabilitado === 0 ? 'Habilitado' : 'Inhabilitado'}
                        </Badge>
                      </td>
                      <td className="px-2 py-1 border text-center">
                        <button
                          type="button"
                          title="Quitar"
                          onClick={() => quitar(i)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center border rounded">
                      <p>No hay categorías de gastos registradas</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
      <ShowMessage 
        open={activo}
        title={title}
        text={text}
        color={color}
        onClose={() => setActivo(false)}
      />
      <ModalConfirmar
        open={confirmar}
        text={textoConfirmar}
        onSubmit={grabarCategoria}
        onCancel={cancelarGrabar}
      />
    </Dialog>
  );
}
