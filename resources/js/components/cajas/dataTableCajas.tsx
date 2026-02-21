import * as React from "react"
import { useState, useMemo } from "react"
import {
  ColumnDef,  ColumnFiltersState,  flexRender,  getCoreRowModel,  getFilteredRowModel,
  getPaginationRowModel,  getSortedRowModel,  SortingState,  useReactTable,  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Pen , Check, Ban,Search, X, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table,  TableBody,  TableCell,  TableHead,  TableHeader,  TableRow } from "@/components/ui/table"
import { Caja } from "@/types/typeCrud"
import { convertirFechaGuionesBarras, convertirNumberPlata, formatDateTime, formatearNroCompleto } from "@/utils"
import { Badge } from "../ui/badge"

interface Props {
  datos: Caja[];
  open: (data:Caja) => void;
  abrirConfirmar: (data:Caja) => void;
}

//export const columns: ColumnDef<Project>[] = [
export function getColumns(confirmar: (data: Caja) => void, open: (data: Caja) => void): ColumnDef<Caja>[] {
  return [
    /*{
      accessorKey: "caja_id",
      header: ({column}) => {
        return (
          <div className="flex">
            ID
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("caja_id")}</div>
      ),
    },*/
    {
      accessorKey: "fecha",
      header: ({column}) => {
        return (
          <div className="flex">
            Registro
          </div>
        )
      }
      ,
      cell: ({ row }) => ( <div className="">{convertirFechaGuionesBarras(row.getValue("fecha"))}</div> ),
    },
    {
      accessorKey: "created_at",
      header: ({column}) => {
        return (
          <div className="flex">
            Grabación
          </div>
        )
      }
      ,
      cell: ({ row }) => {
        const fechaString = row.getValue("created_at") as string;
        return <div>{ formatDateTime(fechaString) }</div> 
      },
    },
    {
      accessorKey: "turno_nombre",
      header: ({column}) => {
        return (
          <div className="flex">
            Turno
          </div>
        )
      }
      ,
      cell: ({ row }) => ( <div className="">{row.getValue("turno_nombre")}</div> ),
    },
    {
      accessorKey: "total_sistema",
      header: ({column}) => {
        return (
          <div className="flex">
            Sistema
          </div>
        )
      }
      ,
      cell: ({ row }) => ( <div className="">{convertirNumberPlata(row.getValue("total_sistema"))}</div> ),
    },
    {
      accessorKey: "total_user",
      header: ({column}) => {
        return (
          <div className="flex">
            Usuario
          </div>
        )
      }
      ,
      cell: ({ row }) => ( <div className="">{convertirNumberPlata(row.getValue("total_user"))}</div> ),
    },
    {
      accessorKey: "diferencia",
      header: ({column}) => {
        return (
          <div className="flex">
            Diferencia
          </div>
        )
      }
      ,
      cell: ({ row }) => ( <div className="">{convertirNumberPlata(row.getValue("diferencia"))}</div> ),
    },
    {
      accessorKey: "inhabilitado",
      header: ({column}) => {
        return (
          <div className="flex">
            Condición
            <ArrowUpDown className="ml-1" size={20} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => {
        const fila = row.original;
        const colorClasses = fila.inhabilitado === 0
          ? 'bg-green-500 text-white dark:bg-green-600'
          : 'bg-red-500 text-white dark:bg-red-600';

        return (
          <Badge variant="secondary" className={`flex items-center gap-1 ${colorClasses}`}>
            {fila.inhabilitado === 0 ? 'Habilitada' : 'Inhabilitada'}
          </Badge>
        );
      },
    },
    {
      accessorKey: "abierta",
      header: ({column}) => {
        return (
          <div className="flex">
            Estado
            <ArrowUpDown className="ml-1" size={20} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => {
        const fila = row.original;
        const colorClasses = fila.abierta === 1
          ? 'bg-green-500 text-white dark:bg-green-700'
          : 'bg-gray-500 text-white dark:bg-gray-600';

        return (
          <Badge variant="secondary" className={`flex items-center gap-1 ${colorClasses}`}>
            {fila.abierta === 1 ? 'Abierta' : 'Cerrada'}
          </Badge>
        );
      },
    },
    {
      id: "acciones",
      enableHiding: false,
      header: "Acciones",
      cell: ({ row }) => {
        const fila = row.original;
  
        return (
          <div className='flex'>
            <Button 
              className="p-0 hover:bg-transparent cursor-pointer"
              title="Detalles" 
              variant="ghost" 
              size="icon" 
              onClick={() => open(fila)}>
              <Eye size={20} className="text-blue-500" />
            </Button>
            {
              fila.fecha === (new Date()).toLocaleDateString() && fila?.inhabilitado === 0 ? (
                <>
                  <Button 
                    className="p-0 hover:bg-transparent cursor-pointer"
                    title="Eliminar" 
                    variant="ghost" 
                    size="icon"
                    onClick={ () => confirmar(fila) }>
                    <X size={20} className="text-red-500" />
                  </Button>
                </>
              ) : ( <> </> )
            }
          </div>
        );
      },
    },
  ]
//]
}
export default function DataTableCajas({datos, open, abrirConfirmar}:Props) {
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [columnFilters, setColumnFilters]       = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection]         = useState({});
  const [busqueda, setBusqueda]                 = useState('');
  
  const data = useMemo(() => {
    const texto = busqueda.toLowerCase();
    return busqueda
      ? datos.filter((campo) =>
          campo.turno_nombre?.toString().includes(texto) ||
          campo.caja_id?.toString().toLowerCase().includes(texto) ||
          campo.total_user?.toString().includes(texto) ||
          campo.fecha?.toLowerCase().includes(texto)
        )
      : datos;
  }, [busqueda, datos]);

  //functions
  const confirmar = (data: Caja) => {
    abrirConfirmar(data);
  };
  const columns = getColumns(confirmar, open); 

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
      <div className=" grid grid-cols-12 gap-4  py-2">
        {/*<div className="col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2">
          <PdfButton deshabilitado={datos.length == 0}/>
        </div>*/}
        <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 flex justify-end  items-center">
          <Input
            placeholder="Filtrar"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>
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
                  className="h-24 text-center"
                >
                  No hay resultados para mostrar. Utiliza los filtros para obtener cajas.
                </TableCell>
              </TableRow>
            )}
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
