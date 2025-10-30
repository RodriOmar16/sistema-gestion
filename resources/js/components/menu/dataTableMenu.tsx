import * as React from "react"
import { useState, useMemo } from "react"
import {  ColumnDef,  ColumnFiltersState,  flexRender,  getCoreRowModel,  getFilteredRowModel,
  getPaginationRowModel,  getSortedRowModel,  SortingState,  useReactTable,  VisibilityState } from "@tanstack/react-table"
import { ArrowUpDown,Check, Pen, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table,  TableBody,  TableCell,  TableHead,  TableHeader,  TableRow } from "@/components/ui/table"
import { Menu } from "@/types/typeCrud"
import PdfButton from "../utils/pdf-button"
import { formatDateTime } from "@/utils"

interface Props {
  datos: Menu[];
  openEdit: (project:Menu) => void;
  abrirConfirmar: (project:Menu) => void;
}

export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

/*function formatDateTime(dateString: string): string {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}*/

//export const columns: ColumnDef<Project>[] = [
export function getColumns(confirmar: (menu: Menu) => void, openEdit: (menu: Menu) => void): ColumnDef<Menu>[] {
  return [
    {
      accessorKey: "menu_id",
      filterFn: "includesString", //para que se pueda filtrar
      header: ({column}) => {
        return (
          <div className="flex">
            ID
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="">{row.getValue("menu_id")}</div>
      ),
    },
    {
      accessorKey: "nombre",
      filterFn: "includesString",
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
      accessorKey: "padre",
      filterFn: "includesString",
      header: ({ column }) => {
        return (
          <div className="flex">
            Padre
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => <div>{row.getValue("padre")}</div>,
    },
    {
      accessorKey: "icono",
      filterFn: "includesString",
      header: ({ column }) => {
        return (
          <div className="flex">
            Icono
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => <div className="">{row.getValue("icono")}</div>,
    },
    {
      accessorKey: "created_at",
      header: ({column}) => {
        return (
          <div className="flex">
            Creado
            <ArrowUpDown className="ml-1" size={20} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => { 
        const fechaString = row.getValue("created_at") as string;
        return <div>{ formatDateTime(fechaString) }</div> 
      }
    },
    {
      accessorKey: "updated_at",
      header: ({column}) => {
        return (
          <div className="flex">
            Modificado
            <ArrowUpDown className="ml-1" size={20} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => { 
        const fechaString = row.getValue("updated_at") as string;
        return <div>{ formatDateTime(fechaString) }</div> 
      },
    },
    {
      id: "acciones",
      enableHiding: false,
      header: "Acciones",
      cell: ({ row }) => {
        
        const menu = row.original;
        return (
          <div className='flex'>
            {
              menu?.inhabilitado == false? (
                <>
                  <Button 
                    className="p-0 hover:bg-transparent cursor-pointer"
                    title="Editar" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => openEdit(menu)}>
                    <Pen size={20} className="text-orange-500" />
                  </Button>
                  <Button 
                    className="p-0 hover:bg-transparent cursor-pointer"
                    title="Inhabilitar" 
                    variant="ghost" 
                    size="icon"
                    onClick={ () => confirmar(menu) }>
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
                    onClick={ () => confirmar(menu) }
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
export function DataTableMenu({datos, openEdit, abrirConfirmar}:Props) {
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [columnFilters, setColumnFilters]       = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection]         = useState({});
  const [busqueda, setBusqueda] = useState('');

  const data = useMemo(() => {
    const texto = busqueda.toLowerCase();
    return busqueda
      ? datos.filter((menu) =>
          menu.menu_id?.toString().includes(texto) ||
          menu.nombre?.toLowerCase().includes(texto) ||
          //(menu.padre ?? '').toLowerCase().includes(texto) ||
          menu.icono?.toLowerCase().includes(texto)
        )
      : datos;
  }, [busqueda, datos]);

  //functions
  const confirmar = (opcion: Menu) => {
    abrirConfirmar(opcion);
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

  //vista
  return (
    <div className="w-full">
      <div className=" grid grid-cols-12 gap-4  py-2">
        {/*<div className="col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2">
          <PdfButton deshabilitado={datos.length == 0}/>
        </div>*/}
        <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 flex justify-end  items-center">
          <Input
            placeholder="Filtrar columnas"
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
                  No hay resultados para mostrar. Utiliza los filtros para obtener menus.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Paginación */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {/*{table.getFilteredSelectedRowModel().rows.length} de {" "}
          {table.getFilteredRowModel().rows.length} fila(s) selecc.*/}
          Total de filas: {data.length}
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
