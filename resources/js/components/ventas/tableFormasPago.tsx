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
import { convertirFechaGuionesBarras, convertirNumberPlata } from "@/utils"
import { Badge } from "../ui/badge"

type FormPago = {id: number, nombre: string, monto: number, fecha: string};

interface Props {
  datos: FormPago[];
  quitar: (id:number) => void;
}

//export const columns: ColumnDef<Project>[] = [
export function getColumns(  
  quitar: (id:number) => void
): ColumnDef<FormPago>[] {

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
      accessorKey: "monto",
      header: ({column}) => {
        return (
          <div className="flex">
            Monto
          </div>
        )
      }
      ,
      cell: ({ row }) => ( <div className="">{ convertirNumberPlata( row.getValue("monto"))}</div> ),
    },
    {
      accessorKey: "Acciones",
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
              onClick={() => quitar(fila.id)}>
              <X size={20} className="text-red-500" />
            </Button>
          </div>
        );
      },
    }
  ]
//]
}
export default function TableFormasPago({datos, quitar}:Props) {
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [columnFilters, setColumnFilters]       = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection]         = useState({});
  //const [detalles, setDetalles]                 = useState<Detalle[]>(datos);
  const [busqueda, setBusqueda]                 = useState('');
  
  const data = useMemo(() => {
    const texto = busqueda.toLowerCase();
    return busqueda
      ? datos.filter((campo) =>
          campo.id?.toString().toLowerCase().includes(texto) ||
          campo.nombre?.toLowerCase().includes(texto)
        )
      : datos;
  }, [busqueda, datos]);

  const columns = getColumns(quitar); 

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
                  No se agregó ninguna forma de pago.
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
