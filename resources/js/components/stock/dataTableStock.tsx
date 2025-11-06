import { useState, useMemo } from "react"
import {
  ColumnDef,  ColumnFiltersState,  flexRender,  getCoreRowModel,  getFilteredRowModel,
  getPaginationRowModel,  getSortedRowModel,  SortingState,  useReactTable,  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Pen , Check, Ban,Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table,  TableBody,  TableCell,  TableHead,  TableHeader,  TableRow } from "@/components/ui/table"
import { Stock } from "@/types/typeCrud"
import { convertirNumberPlata } from "@/utils"
import { Badge } from "../ui/badge"
import PdfButton from "../utils/pdf-button"
import ExcelButton from "../utils/excel-button"
interface Props {
  datos:          Stock[];
  openEdit:       (data:Stock) => void;
  dataIndex:      object
}

//export const columns: ColumnDef<Project>[] = [
export function getColumns(openEdit: (data: Stock) => void): ColumnDef<Stock>[] {
  return [
    {
      accessorKey: "stock_id",
      header: ({column}) => {
        return (
          <div className="flex">
            ID
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("stock_id")}</div>
      ),
    },
    {
      accessorKey: "producto_id",
      header: ({column}) => {
        return (
          <div className="flex">
            Id producto
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("producto_id")}</div>
      ),
    },
    {
      accessorKey: "producto_nombre",
      header: ({column}) => {
        return (
          <div className="flex">
            Producto
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      }
      ,
      cell: ({ row }) => ( <div className="">{row.getValue("producto_nombre")}</div> ),
    },
    {
      accessorKey: "cantidad",
      header: ({column}) => {
        return (
          <div className="flex">
            Cantidad
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      } ,
      cell: ({ row }) => ( <div className="">{row.getValue("cantidad")}</div> ),
    },
    {
      id: "acciones",
      enableHiding: false,
      header: "Acciones",
      cell: ({ row }) => {
        const stock = row.original;
  
        return (
          <Button 
            className="p-0 hover:bg-transparent cursor-pointer"
            title="Editar" 
            variant="ghost" 
            size="icon" 
            onClick={() => openEdit(stock)}>
            <Pen size={20} className="text-orange-500" />
          </Button>
        )
      },
    },
  ]
//]
}
export default function DataTableStock({datos, openEdit, dataIndex}:Props) {
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [columnFilters, setColumnFilters]       = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection]         = useState({});
  const [busqueda, setBusqueda]                 = useState('');
  
  const data = useMemo(() => {
    const texto = busqueda.toLowerCase();
    return busqueda
      ? datos.filter((campo) =>
          String(campo.producto_id).toLowerCase().includes(texto) ||
          campo.producto_nombre?.toLowerCase().includes(texto) ||
          campo.cantidad?.toString().includes(texto)
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
            <PdfButton 
            deshabilitado={datos.length == 0}
            url="stock.pdf"
            payload={dataIndex}
            />
          </div>
          <div>
            <ExcelButton
              deshabilitado={datos.length == 0}
              url="stock.excel"
              payload={dataIndex}
            />
          </div>
        </div>
        <div className="col-span-9 sm:col-span-10 md:col-span-10 lg:col-span-10 flex justify-end  items-center">
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
                  No hay resultados para mostrar. Utiliza los filtros para obtener información del stock de productos.
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
