import * as React from "react"
import { useState, useMemo } from "react"
import {
  ColumnDef,  ColumnFiltersState,  flexRender,  getCoreRowModel,  getFilteredRowModel,
  getPaginationRowModel,  getSortedRowModel,  SortingState,  useReactTable,  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Pen , Check, Ban,Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table,  TableBody,  TableCell,  TableHead,  TableHeader,  TableRow } from "@/components/ui/table"
import { Marca } from "@/types/typeCrud"
import { convertirFechaGuionesBarras, formatDateTime, formatearNroCompleto } from "@/utils"
import { Badge } from "../ui/badge"

interface Props {
  datos: Marca[];
  openEdit: (data:Marca) => void;
  abrirConfirmar: (data:Marca) => void;
}

//export const columns: ColumnDef<Project>[] = [
export function getColumns(
  confirmar: (data: Marca) => void, 
  openEdit: (data: Marca) => void
): ColumnDef<Marca>[] {
  return [
    {
      accessorKey: "marca_id",
      header: ({column}) => {
        return (
          <div className="flex">
            ID
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("marca_id")}</div>
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
      accessorKey: "inhabilitada",
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
        const colorClasses = fila.inhabilitada === 0
          ? 'bg-green-500 text-white dark:bg-green-600'
          : 'bg-red-500 text-white dark:bg-red-600';

        return (
          <Badge variant="secondary" className={`flex items-center gap-1 ${colorClasses}`}>
            {fila.inhabilitada === 0 ? 'Habilitado' : 'Inhabilitado'}
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
            {
              fila?.inhabilitada === 0 ? (
                <>
                  <Button 
                    className="p-0 hover:bg-transparent cursor-pointer"
                    title="Editar" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => openEdit(fila)}>
                    <Pen size={20} className="text-orange-500" />
                  </Button>
                  <Button 
                    className="p-0 hover:bg-transparent cursor-pointer"
                    title="Inhabilitar" 
                    variant="ghost" 
                    size="icon"
                    onClick={ () => confirmar(fila) }>
                    <Ban size={20} className="text-red-500" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    className="p-0 hover:bg-transparent cursor-pointer"
                    title="Habilitar" 
                    variant="ghost" 
                    size="icon"
                    onClick={ () => confirmar(fila) }
                  >
                    <Check size={20} className='text-green-600'/>
                  </Button>
                </>
              )
            }
          </div>
        )
      },
    },
  ]
//]
}
export default function DataTableMarcas({datos, openEdit, abrirConfirmar}:Props) {
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [columnFilters, setColumnFilters]       = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection]         = useState({});
  const [busqueda, setBusqueda]                 = useState('');
  
  const data = useMemo(() => {
    const texto = busqueda.toLowerCase();
    return busqueda
      ? datos.filter((campo) =>
          campo.marca_id?.toString().includes(texto) ||
          campo.nombre?.toLowerCase().includes(texto) 
        )
      : datos;
  }, [busqueda, datos]);

  //functions
  const confirmar = (data: Marca) => {
    abrirConfirmar(data);
  };
  const columns = getColumns(confirmar, openEdit); 

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
                  No hay resultados para mostrar. Utiliza los filtros para obtener marcas.
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
