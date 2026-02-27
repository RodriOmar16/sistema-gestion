import { useState, useMemo } from "react"
import {
  ColumnDef,  ColumnFiltersState,  flexRender,  getCoreRowModel,  getFilteredRowModel,
  getPaginationRowModel,  getSortedRowModel,  SortingState,  useReactTable,  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Pen , Check, Ban,Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {  Table,  TableBody,  TableCell,  TableHead,  TableHeader,  TableRow } from "@/components/ui/table"
import { Paginacion, Producto } from "@/types/typeCrud"
import { convertirNumberPlata } from "@/utils"
import { Badge } from "../ui/badge"
import PdfButton from "../utils/pdf-button"
import ExcelButton from "../utils/excel-button"
import { router } from "@inertiajs/react"
interface Props {
  datos:Producto[];
  openEdit: (data:Producto) => void;
  abrirConfirmar: (data:Producto) => void;
  dataIndex: object
}

//export const columns: ColumnDef<Project>[] = [
export function getColumns(confirmar: (data: Producto) => void, openEdit: (data: Producto) => void): ColumnDef<Producto>[] {
  return [
    /*{
      accessorKey: "producto_id",
      header: ({column}) => {
        return (
          <div className="flex">
            ID
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("producto_id")}</div>
      ),
    },*/
    { 
      accessorKey: "imagen", 
      header: "", 
      cell: ({ row }) => { 
        const src = row.getValue("imagen") as string; 
        return ( 
          <div className="flex justify-center"> 
            {src ? ( <img src={src} alt="miniatura" className="w-12 h-12 object-cover rounded-md border" /> ) 
            : ( <span className="text-gray-400">Sin imagen</span> )} </div> 
          ); 
      }, 
    },
    {
      accessorKey: "producto_nombre",
      header: ({column}) => {
        return (
          <div className="flex">
            Nombre
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      }
      ,
      cell: ({ row }) => ( <div className="">{row.getValue("producto_nombre")}</div> ),
    },
    {
      accessorKey: "codigo_barra",
      header: ({column}) => {
        return (
          <div className="flex">
            Cód. barras
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      } ,
      cell: ({ row }) => ( <div className="">{row.getValue("codigo_barra")}</div> ),
    },
    /*{
      accessorKey: "categoria_nombre",
      header: ({column}) => {
        return (
          <div className="flex">
            Categoría
            <ArrowUpDown className="ml-1" size={20} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => {
        return <div>{ row.getValue("categoria_nombre") }</div> 
      },
    },*/
    {
      accessorKey: "marca_nombre",
      header: ({column}) => {
        return (
          <div className="flex">
            Marca
            <ArrowUpDown className="ml-1" size={20} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => {
        return <div>{row.getValue("marca_nombre")}</div> 
      },
    },
    {
      accessorKey: "precio",
      header: ({column}) => {
        return (
          <div className="flex">
            Precio
            <ArrowUpDown className="ml-1" size={20} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => {
        const precioRow = row.getValue("precio") as string;
        return <div>{ convertirNumberPlata(precioRow) }</div> 
      },
    },
    {
      accessorKey: "stock_minimo",
      header: ({column}) => {
        return (
          <div className="flex">
            Stock Mín.
            <ArrowUpDown className="ml-1" size={20} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => {
        return <div className="text-center">{ row.getValue("stock_minimo") }</div> 
      },
    },
    {
      accessorKey: "stock_actual",
      header: ({column}) => {
        return (
          <div className="flex">
            Stock Actual
            <ArrowUpDown className="ml-1" size={20} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      },
      cell: ({ row }) => {
        return <div className="text-center">{ row.getValue("stock_actual") }</div> 
      },
    },
    {
      accessorKey: "inhabilitado",
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
        const colorClasses = user.inhabilitado === 0
          ? 'bg-green-500 text-white dark:bg-green-600'
          : 'bg-red-500 text-white dark:bg-red-600';

        return (
          <Badge variant="secondary" className={`flex items-center gap-1 ${colorClasses}`}>
            {user.inhabilitado === 0 ? 'Habilitado' : 'Inhabilitado'}
          </Badge>
        );

      },
    },
    {
      id: "acciones",
      enableHiding: false,
      header: "Acciones",
      cell: ({ row }) => {
        const producto = row.original;
  
        return (
          <div className='flex'>
            {
              producto?.inhabilitado === 0 ? (
                <>
                  <Button 
                    className="p-0 hover:bg-transparent cursor-pointer"
                    title="Editar" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => openEdit(producto)}>
                    <Pen size={20} className="text-orange-500" />
                  </Button>
                  <Button 
                    className="p-0 hover:bg-transparent cursor-pointer"
                    title="Inhabilitar" 
                    variant="ghost" 
                    size="icon"
                    onClick={ () => confirmar(producto) }>
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
                    onClick={ () => confirmar(producto) }
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
export default function DataTableProductos({datos, openEdit, abrirConfirmar, dataIndex}:Props) {
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [columnFilters, setColumnFilters]       = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection]         = useState({});
  const [busqueda, setBusqueda]                 = useState('');
  
  //const rows = datos?.data ?? [];
  /*const data = useMemo(() => {
    const texto = busqueda.toLowerCase();
    return busqueda
      ? rows.filter((campo:any) =>
          campo.producto_nombre?.toLowerCase().includes(texto) ||
          campo.categoria_nombre?.toLowerCase().includes(texto) ||
          campo.precio?.toString().includes(texto) ||
          campo.descripcion?.toLowerCase().includes(texto) ||
          campo.codigo_barra?.toString().includes(texto) ||
          campo.marca_nombre?.toLowerCase().includes(texto)
        )
      : rows;
  }, [busqueda, rows]);*/
  const data = useMemo(() => {
    const texto = busqueda.toLowerCase();
    return busqueda
      ? datos.filter((campo:any) =>
          campo.producto_nombre?.toLowerCase().includes(texto) ||
          campo.categoria_nombre?.toLowerCase().includes(texto) ||
          campo.precio?.toString().includes(texto) ||
          campo.descripcion?.toLowerCase().includes(texto) ||
          campo.codigo_barra?.toString().includes(texto) ||
          campo.marca_nombre?.toLowerCase().includes(texto)
        )
      : datos;
  }, [busqueda, datos]);

  //functions
  const confirmar = (data: Producto) => {
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
        <div className="col-span-3 sm:col-span-2 md:col-span-2 lg:col-span-2 flex">
          <div className="mr-2">
            <PdfButton 
            deshabilitado={datos.length == 0}
            url="productos.pdf"
            payload={dataIndex}
            />
          </div>
          <div>
            <ExcelButton
              deshabilitado={datos.length == 0}
              url="productos.excel"
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
                  No hay resultados para mostrar. Utiliza los filtros para obtener productos.
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
