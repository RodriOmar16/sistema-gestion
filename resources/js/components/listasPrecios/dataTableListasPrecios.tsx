import { useState, useMemo } from "react"
import {
  ColumnDef,  ColumnFiltersState,  flexRender,  getCoreRowModel,  getFilteredRowModel,
  getPaginationRowModel,  getSortedRowModel,  SortingState,  useReactTable,  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Pen , Check, Ban,Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {  Table,  TableBody,  TableCell,  TableHead,  TableHeader,  TableRow } from "@/components/ui/table"
import { ListaPrecio } from "@/types/typeCrud"
import { convertirFechaGuionesBarras, formatDateTime, formatearCuilCompleto } from "@/utils"
import { Badge } from "../ui/badge"

interface Props {
  datos: ListaPrecio[];
  openEdit: (data:ListaPrecio) => void;
  abrirConfirmar: (data:ListaPrecio) => void;
}

//export const columns: ColumnDef<Project>[] = [
export function getColumns(confirmar: (data: ListaPrecio) => void, openEdit: (data: ListaPrecio) => void): ColumnDef<ListaPrecio>[] {
  return [
    {
      accessorKey: "lista_precio_id",
      header: ({column}) => {
        return (
          <div className="flex">
            ID
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("lista_precio_id")}</div>
      ),
    },
    {
      accessorKey: "lista_precio_nombre",
      header: ({column}) => {
        return (
          <div className="flex">
            Nombre
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      }
      ,
      cell: ({ row }) => ( <div className="">{row.getValue("lista_precio_nombre")}</div> ),
    },
    {
      accessorKey: "proveedor_nombre",
      header: ({column}) => {
        return (
          <div className="flex">
            Proveedor
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      } ,
      cell: ({ row }) => ( <div className="">{row.getValue("proveedor_nombre")}</div> ),
    },
    {
      accessorKey: "fecha_inicio",
      header: ({column}) => {
        return (
          <div className="flex">
            Fecha Inicio
            <ArrowUpDown className="ml-1" size={20} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => {
        const fechaString = row.getValue("fecha_inicio") as string;
        return <div>{ convertirFechaGuionesBarras(fechaString) }</div> 
      },
    },
    {
      accessorKey: "fecha_fin",
      header: ({column}) => {
        return (
          <div className="flex">
            Fecha Fin
            <ArrowUpDown className="ml-1" size={20} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => {
        const fechaString = row.getValue("fecha_fin") as string;
        return <div>{ convertirFechaGuionesBarras(fechaString) }</div> 
      },
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
        const user = row.original;
        const colorClasses = user.inhabilitada === 0
          ? 'bg-green-500 text-white dark:bg-green-600'
          : 'bg-red-500 text-white dark:bg-red-600';

        return (
          <Badge variant="secondary" className={`flex items-center gap-1 ${colorClasses}`}>
            {user.inhabilitada === 0 ? 'Habilitado' : 'Inhabilitado'}
          </Badge>
        );

      },
    },
    /*{
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
      },
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
    },*/
    {
      id: "acciones",
      enableHiding: false,
      header: "Acciones",
      cell: ({ row }) => {
        const rol = row.original;
  
        return (
          <div className='flex'>
            {
              rol?.inhabilitada === 0 ? (
                <>
                  <Button 
                    className="p-0 hover:bg-transparent cursor-pointer"
                    title="Editar" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => openEdit(rol)}>
                    <Pen size={20} className="text-orange-500" />
                  </Button>
                  <Button 
                    className="p-0 hover:bg-transparent cursor-pointer"
                    title="Inhabilitar" 
                    variant="ghost" 
                    size="icon"
                    onClick={ () => confirmar(rol) }>
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
                    onClick={ () => confirmar(rol) }
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
export default function DataTableListasPrecios({datos, openEdit, abrirConfirmar}:Props) {
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [columnFilters, setColumnFilters]       = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection]         = useState({});
  const [busqueda, setBusqueda]                 = useState('');
  
  const data = useMemo(() => {
    const texto = busqueda.toLowerCase();
    return busqueda
      ? datos.filter((campo) =>
          campo.lista_precio_nombre?.toLowerCase().includes(texto) ||
          campo.proveedor_nombre?.toLowerCase().includes(texto) ||
          campo.fecha_fin?.toString().includes(texto) ||
          campo.fecha_inicio?.toString().includes(texto)
        )
      : datos;
  }, [busqueda, datos]);

  //functions
  const confirmar = (data: ListaPrecio) => {
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
                  No hay resultados para mostrar. Utiliza los filtros para obtener listas de precio.
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
