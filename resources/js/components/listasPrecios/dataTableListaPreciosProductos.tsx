import { useState, useMemo } from "react"
import {
  ColumnDef,  ColumnFiltersState,  flexRender,  getCoreRowModel,  getFilteredRowModel,
  getPaginationRowModel,  getSortedRowModel,  SortingState,  useReactTable,  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Pen , Check, Ban,Search, Save, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {  Table,  TableBody,  TableCell,  TableHead,  TableHeader,  TableRow } from "@/components/ui/table"
import { ListaPrecioProducto } from "@/types/typeCrud"
import { convertirFechaGuionesBarras, convertirNumberPlata, formatDateTime, formatearCuilCompleto } from "@/utils"
import { Badge } from "../ui/badge"
import { NumericFormat } from 'react-number-format';
import { Checkbox } from "@/components/ui/checkbox"
interface Props {
  datos: ListaPrecioProducto[];
  quitar: (data:ListaPrecioProducto) => void;
  abrirConfirmar: (data:ListaPrecioProducto) => void;
  setDatos: React.Dispatch<React.SetStateAction<ListaPrecioProducto[]>>;
  loading: boolean;
  setLoading: (p:boolean) => void;
}

//export const columns: ColumnDef<Project>[] = [
export function getColumns(
  confirmar: (data: ListaPrecioProducto) => void, 
  quitar: (data: ListaPrecioProducto) => void, 
  setDatos: Props["setDatos"],
  loading: boolean,
  setLoading: (p:boolean) => void,
): ColumnDef<ListaPrecioProducto>[] {
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
      accessorKey: "producto_nombre",
      header: ({column}) => {
        return (
          <div className="flex">
            Producto
            <ArrowUpDown className="ml-1" size={17} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
          </div>
        )
      } ,
      cell: ({ row }) => ( <div className="">{row.getValue("producto_nombre")}</div> ),
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
      id: "precio",
      enableHiding: false,
      header: "Precio",
      cell: ({ row }) => {

        const fila = row.original;
  
        return (
          fila.editar == 1 ? (
            <NumericFormat 
              value={fila.precio} 
              thousandSeparator="." 
              decimalSeparator="," 
              prefix="$" 
              className="text-right border rounded px-2 py-1" 
              onValueChange={(values) => {
                fila.precio = values.floatValue || 0;
              }}
              onBlur={() => { 
                // recalcula sugerido al salir del input 
                const nuevoSugerido = fila.precio + (fila.precio * (fila.porcentaje / 100)); 
                setDatos(prev => 
                  prev.map(item => item.lista_precio_id === fila.lista_precio_id ? 
                    { ...item, precio: fila.precio, precio_sugerido: nuevoSugerido } : item 
                  ) 
                );
              }}
            />
          ) : (
            <div className="text-right">
              { convertirNumberPlata(String(fila.precio)) }
            </div>
          )
        )
      },
    },
    {
      id: "porcentaje",
      enableHiding: false,
      header: "Porc (%)",
      cell: ({ row }) => {

        const fila = row.original;
  
        return (
          fila.editar == 1 ? (
            <NumericFormat 
              value={fila.porcentaje} 
              thousandSeparator="." 
              decimalSeparator="," 
              suffix="%" 
              className="text-right border rounded px-2 py-1" 
              onValueChange={(values) => {
                fila.porcentaje = values.floatValue || 0;
              }}
              onBlur={() => { 
                // recalcula sugerido al salir del input 
                const nuevoSugerido = fila.precio + (fila.precio * (fila.porcentaje / 100)); 
                setDatos(prev => 
                  prev.map(item => item.lista_precio_id === fila.lista_precio_id ? 
                    { ...item, porcentaje: fila.porcentaje, precio_sugerido: nuevoSugerido } : item 
                  ) 
                );
              }}
            />
          ): (
            <div className="text-right">
              { fila.porcentaje }%
            </div>
          )
        )
      },
    },
    {
      accessorKey: "precio_sugerido",
      header:" Sugerido",
      cell: ({ row }) => {
        const sugerido = row.getValue("precio_sugerido") as string;
        return (         
          <div className="text-right">
           { convertirNumberPlata(sugerido) }
          </div> 
        )
      },
    },
    {
      id: "precio_final",
      enableHiding: false,
      header: "Final",
      cell: ({ row }) => {

        const fila = row.original;
  
        return (
          fila.editar == 1 ? (
            <NumericFormat 
              value={fila.precio_final} 
              thousandSeparator="." 
              decimalSeparator="," 
              prefix="$" 
              className="text-right border rounded px-2 py-1" 
              onValueChange={(values) => {
                fila.precio_final = values.floatValue || 0;
              }}
              onBlur={() => { 
                setDatos(prev => 
                  prev.map(item => item.lista_precio_id === fila.lista_precio_id ? 
                    { ...item, precio_final: fila.precio_final } : item 
                  ) 
                );
              }}
            />
          ) : (
            <div className="text-right">
              { convertirNumberPlata(String(fila.precio_final)) }
            </div>
          )
        )
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
              Number(fila?.lista_precio_id) < 0 ? (
                <>
                  <div className="mr-2 mt-2">
                    <Checkbox
                      id={`cambiar-${fila.lista_precio_id}`}
                      name="cambiar"
                      title="Usar precio para producto"
                      checked={fila.cambiar === 1} // 👈 si es 1 se marca, si es 0 no
                      onCheckedChange={(checked) => {
                        setDatos(prev =>
                          prev.map(item =>
                            item.lista_precio_id === fila.lista_precio_id
                              ? { ...item, cambiar: checked ? 1 : 0 } // 👈 sincroniza el cambio
                              : item
                          )
                        );
                      }}
                    />
                  </div>
                  <Button 
                    className="p-0 hover:bg-transparent cursor-pointer"
                    title="Quitar" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => quitar(fila)}>
                    <X size={20} className="text-red-500" />
                  </Button>
                  <Button 
                    className="p-0 hover:bg-transparent cursor-pointer"
                    title="Guardar" 
                    variant="ghost" 
                    size="icon"
                    onClick={ () => { 
                      confirmar(fila)
                    }}>
                      {fila.load == 1  ? (
                        <Loader2 size={20} className="animate-spin mr-2" />
                      ) : (
                        <Save size={20} className="text-indigo-500" />
                      )}
                  </Button>                  
                </>
              ) : ( 
                <>
                  { fila.editar == 1 ? (
                    <>
                      <div className="mr-2 mt-2">
                        <Checkbox
                          id={`cambiar-${fila.lista_precio_id}`}
                          name="cambiar"
                          title="Usar precio para producto"
                          checked={fila.cambiar === 1} // 👈 si es 1 se marca, si es 0 no
                          onCheckedChange={(checked) => {
                            setDatos(prev =>
                              prev.map(item =>
                                item.lista_precio_id === fila.lista_precio_id
                                  ? { ...item, cambiar: checked ? 1 : 0 } // 👈 sincroniza el cambio
                                  : item
                              )
                            );
                          }}
                        />
                      </div>
                      <Button 
                        className="p-0 hover:bg-transparent cursor-pointer"
                        title="Guardar Cambios" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => confirmar(fila)}>
                        {fila.load == 1 ? (
                          <Loader2 size={20} className="animate-spin mr-2" />
                        ) : (
                          <Save size={20} className="text-indigo-500" />
                        )}
                      </Button>
                    </>
                  ) : (<></>) }
                  <Button 
                    className="p-0 hover:bg-transparent cursor-pointer"
                    title={fila.editar == 1 ? 'Cancelar' : 'Editar'}
                    variant="ghost" 
                    size="icon"
                    onClick={ () => {
                      const nuevoEditar = fila.editar === 1 ? 0 : 1;
                      setDatos(prev =>
                        prev.map(item =>
                          item.lista_precio_id === fila.lista_precio_id
                            ? { ...item, editar: nuevoEditar }
                            : item
                        )
                      );
                    }}>
                    {
                      fila.editar == 1 ? (
                        <X size={20} className="text-red-500" />
                      ) : (
                        <Pen size={20} className="text-orange-500" />
                      )
                    }
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
export default function DataTableListasPreciosProductos({datos, quitar, abrirConfirmar, setDatos, loading, setLoading}:Props) {
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [columnFilters, setColumnFilters]       = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection]         = useState({});
  const [busqueda, setBusqueda]                 = useState('');
  
  const data = useMemo(() => {
    const texto = busqueda.toLowerCase();
    return busqueda
      ? datos.filter((campo) =>
          campo.proveedor_nombre?.toLowerCase().includes(texto) ||
          campo.producto_nombre?.toLowerCase().includes(texto)
        )
      : datos;
  }, [busqueda, datos]);

  //functions
  const confirmar = (data: ListaPrecioProducto) => {
    abrirConfirmar(data);
  };
  const columns = getColumns(confirmar, quitar, setDatos, loading, setLoading); 

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
