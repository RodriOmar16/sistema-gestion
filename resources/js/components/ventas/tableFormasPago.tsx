import { useState, useMemo, useEffect } from "react"
import {
  ColumnDef,  ColumnFiltersState,  flexRender,  getCoreRowModel,  getFilteredRowModel,
  getPaginationRowModel,  getSortedRowModel,  SortingState,  useReactTable,  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, Plus, Minus, X, Pen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {  Table,  TableBody,  TableCell,  TableHead,  TableHeader,  TableRow } from "@/components/ui/table"
import { Autocomplete, Venta } from "@/types/typeCrud"
import { convertirFechaGuionesBarras, convertirNumberPlata } from "@/utils"
import { Badge } from "../ui/badge"
import GenericSelect from "../utils/genericSelect"

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

interface Props {
  modo:   string;
  datos:  FormPago[];
  quitar: (p:any) => void;
  editarFp: (p:any) => void;
  anulada: 0|1|boolean|"true"|"false"
}

//export const columns: ColumnDef<Project>[] = [
export function getColumns(  
  quitar: (p:any) => void,
  editarFp: (p:any) => void,
  modo: string,
  anulada: 0|1|boolean|"true"|"false"
): ColumnDef<FormPago>[] {

  return [
    /*{
      accessorKey: "id",
      header: ({column}) => {
        return (
          <div className="flex">
            ID
            {<ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />}
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("id")}</div>
      ),
    },*/
    {
      accessorKey: "forma_pago_nombre",
      header: ({column}) => {
        return (
          <div className="flex">
            Pago
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      }
      ,
      cell: ({ row }) => ( <div className="">{row.getValue("forma_pago_nombre")}</div> ),
    },
    {
      accessorKey: "banco_billetera_nombre",
      header: ({column}) => {
        return (
          <div className="flex">
            Entidad
            {<ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />}
          </div>
        )
      },
      cell: ({ row }) => {
        const fila = row.original;
        return (
          <div>{ fila.banco_billetera_nombre }</div>
        );
      },
    },
    {
      accessorKey: "titular",
      header: ({column}) => {
        return (
          <div className="flex">
            Titular
            {<ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />}
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="">{row.getValue("titular")}</div>
      ),
    },
    {
      accessorKey: "cbu_nro_comprobante",
      header: ({column}) => {
        return (
          <div className="flex justify-center">
            CBU/Nro. comp.
            {<ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />}
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("cbu_nro_comprobante")}</div>
      ),
    },
    {
      accessorKey: "estado_nombre",
      header: ({column}) => {
        return (
          <div className="flex">
            Estado
            {<ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />}
          </div>
        )
      },
      cell: ({ row }) => {
        const elem = row.original;
        const colorClasses = elem.forma_pago_id == 1 ? '' : (
          elem.estado_id === 1 ?
            'bg-green-500 text-white dark:bg-green-600'
            : ( elem.estado_id == 2 ? 'bg-orange-500 text-white dark:bg-orange-600' 
                                    :  'bg-red-500 text-white dark:bg-red-600' )
        ); 

        return (
          <>
            {elem.forma_pago_id != 1 && (elem.estado_id && elem.estado_id != 0) ?  (
              <>
                <Badge 
                  className={`flex items-center gap-1 ${colorClasses}`}
                  variant="secondary" 
                >
                  {elem.estado_nombre}
                </Badge>
              </>
            ) :(
              <></>
            )}
          </>
        );
      }
    },
    {
      accessorKey: "monto",
      header: ({column}) => {
        return (
          <div className="flex justify-center">
            Monto
          </div>
        )
      }
      ,
      cell: ({ row }) => ( <div className="text-right">{ convertirNumberPlata( row.getValue("monto"))}</div> ),
    },
    {
      accessorKey: "Acciones",
      header: ({column}) => {
        return (
          <div className="flex justify-center">
            Acción
          </div>
        )
      }
      ,
      cell: ({ row }) => {
        const fila = row.original;
        return (
          <div className='flex justify-center'>
            <Button 
              type="button"
              disabled={modo!='create'}
              className="p-0 hover:bg-transparent cursor-pointer"
              title="Quitar" 
              variant="ghost" 
              size="icon" 
              onClick={() => quitar(fila)}>
              <X size={20} className="text-red-500" />
            </Button>
            {fila.forma_pago_id != 1 && !anulada && (
              <Button 
                type="button"
                className="p-0 hover:bg-transparent cursor-pointer"
                title="Editar" 
                variant="ghost" 
                size="icon" 
                onClick={() => {editarFp(fila)}}>
                <Pen size={20} className="text-orange-500" />
              </Button>
            )}
          </div>
        );
      },
    }
  ]
//]
}
export default function TableFormasPago({modo, datos, quitar, editarFp, anulada}:Props) {
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [columnFilters, setColumnFilters]       = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection]         = useState({});

  const [busqueda, setBusqueda]                 = useState('');
  
  const data = useMemo(() => {
    const texto = busqueda.toLowerCase();
    return busqueda
      ? datos.filter((campo) =>
          campo.id?.toString().toLowerCase().includes(texto) ||
          campo.forma_pago_nombre?.toLowerCase().includes(texto)
        )
      : datos;
  }, [busqueda, datos]);

  const columns = getColumns(quitar, editarFp, modo, anulada); 

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
                  className="h-16 text-center"
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
