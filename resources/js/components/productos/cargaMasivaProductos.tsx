import { Button } from "@/components/ui/button"
import {
  Dialog,  DialogClose,  DialogContent,  DialogDescription,  DialogFooter,  DialogHeader,
  DialogTitle,  DialogTrigger
} from "@/components/ui/dialog"
import { Textarea } from "../ui/textarea";
import { Input } from "@/components/ui/input"
import { Switch } from '@/components/ui/switch';
import { useForm } from "@inertiajs/react"
import React, { useState, useEffect, useRef } from "react"
import { Loader2, Save, Sheet, File, X } from 'lucide-react';
import ShowMessage from "@/components/utils/showMessage";
import { Producto } from "@/types/typeCrud";
import ModalConfirmar from "../modalConfirmar";
import { route } from 'ziggy-js';
import { router } from "@inertiajs/react";
import * as XLSX from "xlsx";
import { convertirFechaBarrasGuiones, convertirNumberPlata } from "@/utils";

interface PropsTable {
  data: Producto[];
  setData: React.Dispatch<React.SetStateAction<Producto[]>>;
}

function DataTableMasivo({ data, setData}: PropsTable) {
  const quitar = (index: number) => {
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
    if(data.length == 0){
      console.log("entro");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-2 py-1 border">Nombre</th>
            <th className="px-2 py-1 border">Descripción</th>
            <th className="px-2 py-1 border">Precio</th>
            <th className="px-2 py-1 border">Código Barras</th>
            <th className="px-2 py-1 border">Stock Mín.</th>
            <th className="px-2 py-1 border">Marca</th>
            <th className="px-2 py-1 border">Categorías</th>
            <th className="px-2 py-1 border">Vencimiento</th>
            <th className="px-2 py-1 border">Inhabilitado</th>
            <th className="px-2 py-1 border">Acción</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p, i) => {

            return (
              <tr
                key={i}
              >
                <td className="px-2 py-1 border">{p.producto_nombre}</td>
                <td className="px-2 py-1 border">{p.descripcion}</td>
                <td className="px-2 py-1 border">{convertirNumberPlata(String(p.precio))}</td>
                <td className="px-2 py-1 border">{p.codigo_barra}</td>
                <td className="px-2 py-1 border">{p.stock_minimo}</td>
                <td className="px-2 py-1 border">{p.marca_nombre}</td>
                <td className="px-2 py-1 border">{p.categoria_nombre ?? ""}</td>
                <td className="px-2 py-1 border">{p.vencimiento ?? ""}</td>
                <td className="px-2 py-1 border">
                  {p.inhabilitado ? "Sí" : "No"}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}




interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
}

export default function CargaMasiva({ open, onOpenChange }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const [openConfimar, setOpenConfirmar] = useState(false);
  const [textConfirmar, setTextConfirmar]     = useState('');

  const [prods, setProd]    = useState<Producto[]>([]);
  const [load, setLoad]     = useState(false);

  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  //useEffect
  useEffect(() => {
    if (!open) {
      setProd([]);
      setFileName('');
    }
  }, [open]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("llegó")
    if(prods.length <= 0){
      setTitle('Información faltante!');
      setText('Se requiere subir un archivo con al menos un producto válido.');
      setColor('warning');
      setActivo(true);
      return;
    }
    setTextConfirmar('Estás seguro de grabar estos productos de forma masiva?');  
    setOpenConfirmar(true);
  }

  const grabar = async () => {
    setOpenConfirmar(false);
    setLoad(true);

    const payload = prods.map(e => {
      return {
        ...e,
        vencimiento: convertirFechaBarrasGuiones(e.vencimiento??''),
        categoria_nombre: e.categoria_nombre.split(', ')
      };
    });

    console.log("payload: ", payload);
    const res  = await fetch(route('productos.storeMasivo'),{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement).content,
      },
      body: JSON.stringify({ productos: payload }),
    });
    setLoad(false);
    const resp = await res.json();

    if(resp.resultado == 0){
      setTitle("Error en carga masiva exitosa");
      setText(resp.mensaje);
      setColor('error');
      setActivo(true);
      return 
    }

    if(resp.errores.length > 0){
      setTitle("Error en carga masiva exitosa");
      setText(resp.errores);
      setColor('error');
      setActivo(true);
      return 
    }

    setTitle("Carga masiva exitosa");
    setText(resp.mensaje);
    setColor('success');
    setActivo(true);

    onOpenChange(false);
  };

  const cancelarGrabar = () => {
    setOpenConfirmar(false);
    setTextConfirmar('');
  };

  const descargarModelo = () => {
    window.open(route('productos.modeloExcel'), '_blank');
  };

  const subirArchivo = () => {
    fileInputRef.current?.click(); // dispara el input oculto
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = evt.target?.result;
        if (!data) return;

        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Set para controlar duplicados
        const seen = new Set<string>();
        const productos: Producto[] = [];

        rows.slice(1).forEach((row) => { // ignoro fila 1 y 2
          const key = `${row[0]}-${row[1]}-${row[2]}-${row[3]}`; // nombre + código barras
          if (seen.has(key)) {
            // ya existe, no lo agrego
            return;
          }
          seen.add(key);


          const rawDate = row[8];
          let vencimiento = '';

          if (typeof rawDate === 'number') {
            // convertir número serial de Excel a Date
            const dateObj = XLSX.SSF.parse_date_code(rawDate);
            // armar string DD/MM/YYYY
            vencimiento = `${dateObj.d}/${dateObj.m}/${dateObj.y}`;
          } else if (typeof rawDate === 'string') {
            // ya viene como string, lo dejo tal cual
            vencimiento = rawDate;
          }

          productos.push({
            producto_id: '',
            producto_nombre: row[0] || '',
            descripcion: row[1] || '',
            precio: Number(row[2]) || 0,
            codigo_barra: row[3] || '',
            stock_minimo: Number(row[4]) || 0,
            stock_actual: 0,
            inhabilitado: row[5]?.toLowerCase() === 'no' ? false : true,
            marca_id: '',
            marca_nombre: row[6] || '',
            categoria_id: '',
            categoria_nombre: row[7] || '',
            vencimiento: vencimiento || '',
            imagen: row[9] ? row[9] : `${row[0]}.webp`,
          });
        });

        console.log("Productos procesados (sin duplicados):", productos);
        setProd(productos);
      };
      reader.readAsBinaryString(file);

      e.target.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-h-[95vh] overflow-y-auto ${prods.length>0? '!max-w-[90vw] !w-[90vw]' : ''}`}>
        <DialogHeader>
          <DialogTitle>Carga Masiva de productos</DialogTitle>
          <DialogDescription>
            Descarga el modelo, llena el excel con los datos de nuevos productos y grabalos.
          </DialogDescription>
          <hr />
        </DialogHeader>
        <form className="grid grid-cols-12 gap-4 px-4 pt-1 pb-4 ">
          <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-6 flex justify-start">
            <Button 
              className="p-0 bg-green-700 hover:bg-green-800 dark:hover:bg-green-800 text-white dark:hover:text-white cursor-pointer "
              onClick={descargarModelo} type="button" title="Descargar Modelo">
              <Sheet size={20} className="mr-2"/>
              Modelo
            </Button>
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-6 flex justify-end">
            <div className="flex flex-col">
              <Button 
                title="Subir archivo"
                className="bg-blue-700 hover:bg-blue-800 dark:hover:bg-blue-800 text-white dark:hover:text-white cursor-pointer"
                onClick={subirArchivo} type='button'>
                <File size={20} className=""/> Subir archivo
              </Button> 
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFile} 
                className="hidden" // oculta el input 
              /> 
              {fileName}
            </div>
          </div>
          { prods.length > 0 ? (
              <>
                <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
                  <DataTableMasivo
                    data={prods}
                    setData={setProd}
                  />
                </div>  
              </>
            ) : (<></> )
          }  
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            type="button" 
          >
            { load ? ( <Loader2 size={20} className="animate-spin mr-2"/> ) :
                     ( <Save size={20} className="mr-2"/> )  }
            Grabar          
          </Button>
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
        open={openConfimar}
        text={textConfirmar}
        onSubmit={grabar}
        onCancel={cancelarGrabar}
      />
    </Dialog>
  );
}
