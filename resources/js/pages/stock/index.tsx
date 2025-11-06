import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Stock, Multiple } from '@/types/typeCrud';
import { Search, Brush, Loader2, CirclePlus, Filter } from 'lucide-react';
import ModalConfirmar from '@/components/modalConfirmar';
import ShowMessage from '@/components/utils/showMessage';
import { Select,  SelectContent, SelectGroup,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { route } from 'ziggy-js';
import { ordenarPorTexto } from '@/utils';
import NewStock from '@/components/stock/newStock';
import EditStock from '@/components/stock/editStock';
import DataTableStock from '@/components/stock/dataTableStock';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Stock', href: '', } ];

type propsForm = {
  resetearStock: (data:Stock[]) => void;
  openCreate:    () => void;
  productos:     Multiple[];
  data:          Stock;
  set:           (e:Stock) => void;
}

const stockVacio = {
  producto_id:     '',
  producto_nombre: '',
  stock_id:        '',
  cantidad:        ''
}

export function FiltrosForm({ openCreate, resetearStock, productos, data, set }: propsForm){
  //data
  const [loading, setLoading] = useState(false);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetearStock([]);
    const dataCopia = JSON.parse(JSON.stringify(data));
    const payload = {      ...dataCopia, buscar: true    }
    setLoading(true);
    router.get(route('stock.index'), payload, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setLoading(false),
    });
  };
  const handleReset = () => {
    set(stockVacio);
  };

  return (
    <div>
      <div className='flex items-center justify-between px-3 pt-3'>
        <div className='flex'> <Filter size={20} />  Filtros</div>
        <Button 
          className="p-0 hover:bg-transparent cursor-pointer"
          type="button"
          title="Nuevo" 
          variant="ghost" 
          size="icon" 
          onClick={openCreate}
        >
          <CirclePlus size={30} className="text-green-600 scale-200" />
        </Button>
      </div>
      <form className='grid grid-cols-12 gap-4 px-4 pt-1 pb-4' onSubmit={handleSubmit}>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-2'>
          <label htmlFor="id">Id</label>
          <Input value={data.stock_id} onChange={(e)=>set({...data, stock_id: e.target.value})}/>
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="producto">Producto</label>
            <Select
              value={String(data.producto_id)}
              onValueChange={(value) => set({...data, producto_id:  Number(value)}) }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {productos.map((e: any) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3">
          <label htmlFor="fechaInicio">Cantidad</label>
          <Input
            className='text-right'
            type="number" 
            value={Number(data.cantidad)}
            onChange={(e) => set({...data, cantidad: Number(e.target.value)}) }
          />
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 flex justify-end items-center'>
          <Button 
            className="p-0 hover:bg-transparent cursor-pointer"
            type="button"
            title="Limpiar" 
            variant="ghost" 
            size="icon" 
            onClick={handleReset}
          >
            <Brush size={30} className="text-orange-500" />
          </Button>
          <Button type="submit" title="Buscar" disabled={loading}>
            {loading ? (<Loader2 size={20} className="animate-spin" />) : 
                       (<Search size={20} className="" />)
            } Buscar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default function Productos(){
  //data  
  const { data, setData, errors, processing } = useForm<Stock>(stockVacio); //formulario que busca
  const [productoHab, setProductosHab]        = useState<Multiple[]>([]);

  const [newOpen, setNewOpen]             = useState(false); //modal crear
  const [editOpen, setEditOpen]           = useState(false); //modal crear
  const [modalMode, setModalMode]         = useState<'create' | 'edit'>('create');
  const [selectedStock, setSelectedStock] = useState<Stock | undefined>(undefined);
  const [pendingData, setPendingData]     = useState<Stock | undefined>(undefined);
  const [loading, setLoading]             = useState(false);

  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
  const [textConfir, setTextConfirm] = useState('');

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const { stock } = usePage().props as { stock?: Stock[] }; //necesito los props de inertia
  const { resultado, mensaje, stock_id, nuevo } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    stock_id?: number;
    nuevo?: number;
  };
  const [propsActuales, setPropsActuales] = useState<{
    resultado: number | undefined | null;
    mensaje: string | undefined | null | '';
    stock_id: number | undefined | null;
    nuevo: number | undefined | null;
  }>({ resultado: undefined, mensaje: undefined, stock_id: undefined, nuevo: undefined });
  const [stockCacheados, setStockCacheados] = useState<Stock[]>([]);

  //funciones
  const openCreate = () => {
    setModalMode('create');
    setSelectedStock(undefined);
    setNewOpen(true);
  };

  const openEdit = (data: Stock) => {
    setModalMode('edit');
    setSelectedStock(data);
    setEditOpen(true);
  };

  const handleSave = (data: Stock) => {
      setPendingData(data);
      let texto = modalMode === 'create' ? 'grabar' : 'guardar cambios a';
      setTextConfirm('¿Estás seguro de '+texto+' este stock?');
      setConfirOpen(true);
    };
  
    const accionar = () => {
      if (!pendingData) return;
      setLoading(true);
      const payload = JSON.parse(JSON.stringify(pendingData));
  
      console.log("payload: ", payload)
      if (modalMode === 'create') {
        router.post(
          route('stock.store'), {productos: payload},
          {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
              setLoading(false);
            }
          }
        );
      } else {
        router.put(
          route('stock.update',{stock: pendingData.stock_id}), payload,
          {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
              setLoading(false);
              setPendingData(undefined);
            }
          }
        );
      }
      setConfirOpen(false);
    };
  
    const cancelarConfirmacion = () => {
      setConfirOpen(false);
    };

  //effect
  useEffect(() => {
    //optengo los datos del formulario
    fetch('/productos_habilitados')
    .then(res => res.json())
    .then(data => {
      setProductosHab(ordenarPorTexto(data, 'nombre'));
    });
  }, []);
  useEffect(() => {
    if (!activo && propsActuales.resultado !== undefined) {
      setPropsActuales({
        resultado: undefined,
        mensaje:   undefined,
        stock_id:  undefined,
        nuevo:     undefined
      });
    }
  }, [activo]);

  useEffect(() => {
    if (
      stock &&
      stock.length > 0 &&
      JSON.stringify(stock) !== JSON.stringify(stockCacheados)
    ) {
      setStockCacheados(stock);
    }
  }, [stock]);


  useEffect(() => {
    const cambioDetectado =
      (resultado && resultado  !== propsActuales.resultado)  ||
      (mensaje && mensaje    !== propsActuales.mensaje)

    if (cambioDetectado) {
      setPropsActuales({ resultado, mensaje,stock_id, nuevo});

      const esError = resultado === 0;
      setTitle(esError ? 'Error' : 'Stock modificado');
      setText(esError ? ( mensaje ?? 'Error inesperado') : (nuevo? `${mensaje}` : `${mensaje} (ID: ${stock_id})`) );
      setColor(esError ? 'error' : 'success');
      setActivo(true);

      if (resultado === 1 && nuevo != undefined) {
        router.get(route('stock.index'),
          { buscar: true },
          { preserveScroll: true,	preserveState: true	}
        )
        if(modalMode === 'create'){
          setNewOpen(false);
        }else setEditOpen(false);
      }
    }
  }, [resultado, mensaje, nuevo]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Stock" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm
            data={data}
            set={setData}
            resetearStock={setStockCacheados}
            openCreate={openCreate}
            productos={productoHab}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableStock
            datos={stockCacheados?? []} 
            openEdit={openEdit} 
            dataIndex={data}
            />
        </div>
      </div>
      <NewStock
        open={newOpen}
        onOpenChange={setNewOpen}
        onSubmit={handleSave}
        loading={loading}
        productosDisp={productoHab}
      />
      <EditStock
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleSave}
        loading={loading}
        stock={selectedStock}
        />
      <ModalConfirmar
        open={confirmOpen}
        text={textConfir}
        onSubmit={accionar}
        onCancel={cancelarConfirmacion}
      />
      <ShowMessage 
        open={activo}
        title={title}
        text={text}
        color={color}
        onClose={() => setActivo(false)}
      />
    </AppLayout>
  );
}