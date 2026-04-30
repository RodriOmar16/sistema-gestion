import { useState, useMemo } from "react"
import {
  ColumnDef,  ColumnFiltersState,  flexRender,  getCoreRowModel,  getFilteredRowModel,
  getPaginationRowModel,  getSortedRowModel,  SortingState,  useReactTable,  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {  Table,  TableBody,  TableCell,  TableHead,  TableHeader,  TableRow } from "@/components/ui/table"
import { Venta } from "@/types/typeCrud"
import { convertirFechaGuionesBarras, convertirNumberPlata, formatDateTime } from "@/utils"
import { Badge } from "../ui/badge"
import ButtonDownload from "../utils/button-download"
import { route } from "ziggy-js"
import { router } from "@inertiajs/react"

interface Props {
  datos: Venta[];
  openEdit: (data:Venta) => void;
  exportar: object;
  totalFilas: number;
  current_page:number, 
  last_page:number, 
  next_page_url: string,
  prev_page_url: string,
}

//export const columns: ColumnDef<Project>[] = [
export function getColumns(openEdit: (data: Venta) => void): ColumnDef<Venta>[] {
  return [
    {
      accessorKey: "venta_id",
      header: ({column}) => {
        return (
          <div className="flex">
            ID
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("venta_id")}</div>
      ),
    },
    {
      accessorKey: "fecha_grabacion",
      header: ({column}) => {
        return (
          <div className="flex">
            Fecha
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      }
      ,
      cell: ({ row }) => ( <div className="">{formatDateTime(row.getValue("fecha_grabacion"))}</div> ),
    },
    {
      accessorKey: "cliente_nombre",
      header: ({column}) => {
        return (
          <div className="flex">
            Cliente
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      } ,
      cell: ({ row }) => ( <div className="">{row.getValue("cliente_nombre")}</div> ),
    },
    {
      accessorKey: "total",
      header: ({column}) => {
        return (
          <div className="flex">
            Total
            <ArrowUpDown className="ml-1" size={20} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => {
        const totalRow = row.getValue("total") as string;
        return <div>{ convertirNumberPlata(totalRow) }</div> 
      },
    },
    {
      accessorKey: "anulada",
      header: ({column}) => {
        return (
          <div className="flex">
            Estado
          </div>
        )
      },
      cell: ({ row }) => {
        const elem = row.original;
        const colorClasses = elem.anulada === 0
          ? 'bg-green-500 text-white dark:bg-green-600'
          : 'bg-red-500 text-white dark:bg-red-600';

        return (
          <Badge variant="secondary" className={`flex items-center gap-1 ${colorClasses}`}>
            {elem.anulada === 0 ? 'Aprobada' : 'Anulada'}
          </Badge>
        );

      },
    },
    {
      accessorKey: "fecha_anulacion",
      header: ({column}) => {
        return (
          <div className="flex">
            Anulación
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      }
      ,
      cell: ({ row }) => ( <div className="">{row.getValue("fecha_anulacion") ? formatDateTime(row.getValue("fecha_anulacion")) : ''}</div> ),
    },
    {
      id: "acciones",
      enableHiding: false,
      header: "Acciones",
      cell: ({ row }) => {
        const venta = row.original;
  
        return (
          <div className='flex'>
            <Button 
              className="p-0 hover:bg-transparent dark:hover:bg-transparent cursor-pointer"
              title="Ver" 
              variant="ghost" 
              size="icon" 
              onClick={() => openEdit(venta)}>
              <Eye size={20} className="text-blue-800" />
            </Button>
          </div>
        )
      },
    },
  ]
//]
}
export default function DataTableVentas({datos, openEdit, exportar, totalFilas, current_page, last_page, next_page_url, prev_page_url}:Props) {
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [columnFilters, setColumnFilters]       = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection]         = useState({});
  const [busqueda, setBusqueda]                 = useState('');
  
  const data = useMemo(() => {
    const texto = busqueda.toLowerCase();
    return busqueda
      ? datos.filter((campo) =>
          campo.venta_id?.toString().toLowerCase().includes(texto) ||
          campo.cliente_nombre?.toLowerCase().includes(texto) ||
          campo.fecha_grabacion?.toLowerCase().includes(texto) ||
          campo.fecha_anulacion?.toLowerCase().includes(texto) ||
          campo.total?.toString().includes(texto)
        )
      : datos;
  }, [busqueda, datos]);

  //functions
  const columns = getColumns(openEdit); 

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
        <div className="col-span-3 sm:col-span-2 md:col-span-2 lg:col-span-2 flex">
          <div className="mr-2">
            <ButtonDownload
              deshabilitado={datos.length == 0}
              url="ventas.pdf"
              payload={exportar}
              clase="p-0 bg-red-700 text-white hover:text-white hover:bg-red-800 dark:hover:bg-red-800 cursor-pointer"
              title="Generar PDF"
              tipo="Pdf"
            />
          </div>
          <div>
            <ButtonDownload
              deshabilitado={datos.length == 0}
              url="ventas.excel"
              payload={exportar}
              clase="p-0 bg-green-700 hover:bg-green-800 dark:hover:bg-green-800 text-white dark:hover:text-white cursor-pointer "
              title="Generar Excel" 
              tipo="Excel"
            />
          </div>
        </div>
        <div className="col-span-12 sm:col-span-10 md:col-span-10 lg:col-span-10 flex justify-end  items-center">
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
                  No hay resultados para mostrar. Utiliza los filtros para obtener ventas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          Página {current_page} de {last_page} — Total: {totalFilas}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.get(route('ventas.index'), { ...exportar, page: current_page - 1 },{
                preserveState: true,
                preserveScroll: true,
              });
            }}
            //disabled={current_page <= 1}
            disabled={!prev_page_url}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.get(route('ventas.index'), { ...exportar, page: current_page + 1 },{
                preserveState: true,
                preserveScroll: true,
              });
            }}
            //disabled={current_page >= last_page}
            disabled={!next_page_url}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
