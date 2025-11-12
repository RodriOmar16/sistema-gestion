import { useState, useMemo, useEffect } from "react"
import {
  ColumnDef,  ColumnFiltersState,  flexRender,  getCoreRowModel,  getFilteredRowModel,
  getPaginationRowModel,  getSortedRowModel,  SortingState,  useReactTable,  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, Plus, Minus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {  Table,  TableBody,  TableCell,  TableHead,  TableHeader,  TableRow } from "@/components/ui/table"
import { Venta } from "@/types/typeCrud"
import { convertirFechaGuionesBarras, convertirNumberPlata, redondear } from "@/utils"
import { Badge } from "../ui/badge"

type Detalle  = {id: number, nombre:string, precio: number, cantidad: number };

interface Props {
  datos: Detalle[];
  setDatos: (e:any) => void;
  setTotal: (total:number) => void;
  quitar: (id:number) => void;
  modo: string;
}

//export const columns: ColumnDef<Project>[] = [
export function getColumns(  
  sumar: (d: Detalle) => void,
  restar: (d: Detalle) => void,
  cambiarCantidad: (id: number, valor: string) => void,
  quitar: (id:number) => void,
  modo: string,
): ColumnDef<Detalle>[] {
  return [
    {
      accessorKey: "id",
      header: ({column}) => {
        return (
          <div className="flex">
            ID
            {/*<ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />*/}
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "nombre",
      header: ({column}) => {
        return (
          <div className="flex">
            Nombre
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      }
      ,
      cell: ({ row }) => ( <div className="">{row.getValue("nombre")}</div> ),
    },
    {
      accessorKey: "precio",
      header: ({column}) => {
        return (
          <div className="flex">
            Precio
          </div>
        )
      }
      ,
      cell: ({ row }) => ( <div className="">{ convertirNumberPlata( row.getValue("precio"))}</div> ),
    },
    {
      accessorKey: "cantidad",
      header: ({column}) => {
        return (
          <div className="flex">
            Cantidad
          </div>
        )
      } ,
      cell: ({ row }) => {
        const fila = row.original;
        const cant = fila.cantidad;
        /*( 
        <div className="">{row.getValue("cliente_nombre")}</div> )*/
        return (
          <>
            <div className="flex justify-">
              <Button
                variant="outline"
                size="sm"
                onClick={()=>restar(fila)}
                disabled={modo!='create' || cant == 1}
              >
                <Minus size={20}/>
              </Button>
              <Input
                className="mx-2 w-30 text-center"
                value={cant}
                disabled={modo!='create'}
                onChange={(e) => cambiarCantidad(fila.id, e.target.value)}
                inputMode="numeric"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={()=>sumar(fila)}
                disabled={modo!='create'}
              >
                <Plus size={20}/>
              </Button>
            </div>
          </>
        );
      },
    },
    {
      accessorKey: "SubTotal",
      header: ({column}) => {
        return (
          <div className="flex">
            Sub total
          </div>
        )
      }
      ,
      cell: ({ row }) => {
        //( <div className="">{ convertirNumberPlata( row.getValue("precio"))}</div> )
        const det = row.original;
        const subtotal = det.cantidad * det.precio; 
        
        return (
          <div className="">{ convertirNumberPlata(subtotal.toString())}</div>
        );
      },
    },    
    {
      accessorKey: "acciones",
      header: ({column}) => {
        return (
          <div className="flex">
            Acción
          </div>
        )
      }
      ,
      cell: ({ row }) => {
        //( <div className="">{ convertirNumberPlata( row.getValue("precio"))}</div> )
        const fila = row.original;
        return (
          <div className='flex'>
            <Button 
              className="p-0 hover:bg-transparent cursor-pointer"
              title="Quitar" 
              variant="ghost" 
              size="icon" 
              disabled={modo!='create'}
              onClick={() => quitar(fila.id)}>
              <X size={20} className="text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ]
}
export default function TableDetalles({datos, setDatos, setTotal, quitar, modo/*, openEdit*/}:Props) {
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [columnFilters, setColumnFilters]       = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection]         = useState({});
  //const [detalles, setDetalles]                 = useState<Detalle[]>(datos);
  const [busqueda, setBusqueda]                 = useState('');
  const [totalTable, setTotalTable]             = useState(0);
  
  const data = useMemo(() => {
    const texto = busqueda.toLowerCase();
    return busqueda
      ? datos.filter((campo) =>
          campo.id?.toString().toLowerCase().includes(texto) ||
          campo.nombre?.toLowerCase().includes(texto)
        )
      : datos;
  }, [busqueda, datos]);

  useEffect(() => { //calcula el total
    const t = datos.reduce((acc, det) => acc + det.precio * det.cantidad, 0);
    setTotalTable(t);
    setTotal(t);
  }, [datos]);

  /*useEffect(() => { //permite renderizar los elementos agregados
    setDetalles(datos);
  }, [datos]);*/


  //functions
  const sumar = (det: Detalle) => {
    setDatos((prev:any) =>
      prev.map((d:any) =>
        d.id === det.id ? { ...d, cantidad: d.cantidad + 1 } : d
      )
    );
  };

  const restar = (det: Detalle) => {
    setDatos((prev:any) =>
      prev.map((d:any) =>
        d.id === det.id && d.cantidad > 0
          ? { ...d, cantidad: d.cantidad - 1 }
          : d
      )
    );
  };

  const cambiarCantidad = (id: number, valor: string) => {
    const cantidad = parseInt(valor.replace(/\D/g, '')) || 0;
    setDatos((prev:any) =>
      prev.map((d:any) =>
        d.id === id ? { ...d, cantidad } : d
      )
    );
  };


  const columns = getColumns(sumar, restar, cambiarCantidad, quitar, modo); 

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      {/*<div className=" grid grid-cols-12 gap-4  py-2">
        <div className="col-span-9 sm:col-span-10 md:col-span-10 lg:col-span-10 flex justify-end  items-center">
          <Input
            placeholder="Filtrar"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>*/}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-18 text-center"
                >
                  No se agregó ningún producto.
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={columns.length - 2}
                  className={`${totalTable===0? '' : 'text-lg'} text-right font-bold`}>
                Total:
              </TableCell>
              <TableCell
                  className={`${totalTable===0? '' : 'text-lg'} text-left font-bold`}>
                ${redondear(totalTable,2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {/*{table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) selecc.*/}
          Total de filas: {datos.length}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
