import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select,  SelectContent,  SelectGroup,  SelectItem,  SelectLabel,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { Switch } from '@/components/ui/switch';
import { Pen, Ban, Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { Menu } from '@/types/typeCrud';
import NewEditDialog from '../../components/menu/newEdit';
import ModalConfirmar from '@/components/modalConfirmar';
import PdfButton from '@/components/utils/pdfButton';
import ShowMessage from '@/components/utils/showMessage';
import { DataTableMenu } from '@/components/menu/dataTableMenu';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Menus',
    href: '',
  },
];
const menuVacio = {
  menu_id:      null,
  nombre:       '',
  padre_id:     0,
  padre_nombre: '',
  orden:        0,
  icono:        '',
  inhabilitado: false,
};
type propsForm = {
  openCreate: () => void;
  resetearMenus: (menu:Menu[]) => void;
  padres: any[]
}

export const FiltrosForm = ({ openCreate,resetearMenus, padres }: propsForm) => {
  //const [loading, setLoading] = useState(false);
  const { data, setData, get, processing, errors } = useForm<Menu>(menuVacio);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetearMenus([]);
    const payload = {      ...data, buscar: true    }
    router.get(route('menu.index'), payload, 
    {
      preserveState: true,
      preserveScroll: true,
      //onFinish: () => setEsperandoRespuesta(false),
    });
  };

  const handleReset = () => {
    setData(menuVacio);
  };

  return (
    <div className='flex flex-col'>
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
      <form className="grid grid-cols-12 gap-4 px-4 pt-1 pb-4" onSubmit={handleSubmit}>
        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2">
          <label htmlFor="id">Id</label>
          <Input 
            type="number"
            min={0}
            value={String(data.menu_id)} 
            onChange={(e) => setData('menu_id', Number(e.target.value))} />
          {errors.menu_id && <p className="text-red-500">{errors.menu_id}</p>}
        </div>

        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3">
          <label htmlFor="nombre">Nombre</label>
          <Input value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} />
          {errors.nombre && <p className="text-red-500">{errors.nombre}</p>}
        </div>

        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2 lg:col-span-2">
          <label htmlFor="padre">Selec. Padre</label>
          <Select
            value={String(data.padre_id)}
            onValueChange={(value) => setData('padre_id', Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {padres.map((e: any) => (
                  <SelectItem key={e.menu_id} value={String(e.menu_id)}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2">
          <label htmlFor="icono">Icono</label>
          <Input value={data.icono} onChange={(e) => setData('icono', e.target.value)} />
          {errors.icono && <p className="text-red-500">{errors.icono}</p>}
        </div>
        <div className="flex flex-col col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-1">
          <label htmlFor="estado" className='mb-2'>Inhabilitado</label>
          <Switch id="inhabilitado" 
            checked={Boolean(data.inhabilitado)} 
            onCheckedChange={(checked) => setData('inhabilitado', Boolean(checked))}
          />
          {errors.inhabilitado && <p className="text-red-500">{errors.inhabilitado}</p>}
        </div>
        <div className="col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-2 flex justify-end items-center align-center">
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
          <Button type="submit" title="Buscar" disabled={processing}>
            {processing ? (
              <Loader2 size={20} className="animate-spin mr-2" />
            ) : (
              <Search size={20} className="mr-2" />
            )}
            Buscar
          </Button>
        </div>
      </form>

    </div>
  );
};

export default function MenuForm() {
  //data
  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
  const [textConfir, setTextConfirm] = useState('');
  
  const [modalOpen, setModalOpen]       = useState(false); //modal editar/crear
  const [modalMode, setModalMode]       = useState<'create' | 'edit'>('create');
  const [selectedMenu, setSelectedMenu] = useState<Menu | undefined>(undefined);
  const [pendingData, setPendingData]   = useState<Menu | undefined>(undefined);
  const [loading, setLoading]           = useState(false);
  
  const [openConfirmar, setConfirmar]     = useState(false); //para editar el estado
  const [textConfirmar, setTextConfirmar] = useState(''); 
  const [menuCopia, setMenuCopia]   = useState<Menu>(menuVacio);

  const [activo, setActivo] = useState(false);//ShowMessage
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const [padresMenu, setPadresMenu] = useState([]);

  const { menus } = usePage().props as { menus?: Menu[] }; //necesito los props de inertia
  const { resultado, mensaje, menu_id } = usePage().props as {
    resultado?: number;
    mensaje?: string;
    menu_id?: number;
  };
  const [propsActuales, setPropsActuales] = useState<{
    resultado: number | undefined | null;
    mensaje: string | undefined | null | '';
    menu_id: number | undefined | null;
  }>({ resultado: undefined, mensaje: undefined, menu_id: undefined });
  const [menusCacheados, setMenusCacheados] = useState<Menu[]>([]);

  //funciones
  const confirmar = (menu: Menu) => {
    if(menu){
      setMenuCopia( JSON.parse(JSON.stringify(menu)) );
      const texto : string = menu.inhabilitado === false ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' este menú?');
      setConfirmar(true);
    }
  };
  const inhabilitarHabilitar = () => {
    if (!menuCopia || !menuCopia.menu_id) return;
    setLoading(true);
    router.put(
      route('menu.toggleEstado', { menu: menuCopia.menu_id }),{},
      {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          setLoading(false);
          setTextConfirmar('');
          setConfirmar(false);
          setMenuCopia(menuVacio);
        }
      }
    );
  };

  const cancelarInhabilitarHabilitar = () => { 
    setConfirmar(false);
  };

  const openCreate = () => {
    setModalMode('create');
    setSelectedMenu(undefined);
    setModalOpen(true);
  };

  const openEdit = (data: Menu) => {
    setModalMode('edit');
    setSelectedMenu(data);
    setModalOpen(true);
  };

  const handleSave = (data: Menu) => {
    setPendingData(data);
    if (modalMode === 'create') {
      setTextConfirm('¿Estás seguro de grabar este menú?');
    } else {
      setTextConfirm('¿Estás seguro de guardar cambios a este menú?');
    }
    setConfirOpen(true);
  };

  const accionar = () => {
    if (!pendingData) return;
    setLoading(true);

    const payload = {
      nombre: pendingData.nombre.trim(),
      padre: pendingData.padre_id,
      orden: pendingData.orden,
      icono: pendingData.icono.trim(),
      inhabilitado: pendingData.inhabilitado,
    };
    if (modalMode === 'create') {
      router.post(
        route('menu.store'),payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoading(false);
            setTextConfirmar('');
            setConfirmar(false);
            setMenuCopia(menuVacio);
          }
        }
      );
    } else {
      router.put(
        route('menu.update',{menu: pendingData.menu_id}),
        payload,
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
    if (!activo && propsActuales.resultado !== undefined) {
      setPropsActuales({
        resultado: undefined,
        mensaje: undefined,
        menu_id: undefined
      });
    }
  }, [activo]);

  useEffect(() => {
    if (
      menus &&
      menus.length > 0 &&
      JSON.stringify(menus) !== JSON.stringify(menusCacheados)
    ) {
      setMenusCacheados(menus);
    }
  }, [menus]);


  useEffect(() => {
    const cambioDetectado =
      (resultado && resultado  !== propsActuales.resultado)  ||
      (mensaje && mensaje    !== propsActuales.mensaje)  

    if (cambioDetectado) {
      setPropsActuales({ resultado, mensaje, menu_id });

      const esError = resultado === 0;
      setTitle(esError ? 'Error' : modalMode === 'create' ? 'Menú nuevo' : 'Menú modificado');
      setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${menu_id})`);
      setColor(esError ? 'error' : 'success');
      setActivo(true);

      if (resultado === 1 && menu_id) {
        setModalOpen(false);
        router.get(route('menu.index'),
          { menu_id, buscar: true },
          { preserveScroll: true,	preserveState: true	}
        )
      }
    }
  }, [resultado, mensaje, menu_id]);

  useEffect(() => {
    //optengo los datos del formulario
    fetch('/init_menu')
    .then(res => res.json())
    .then(data => {
      setPadresMenu(data);
    });
  }, []);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Menús" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosForm 
            openCreate={openCreate} 
            resetearMenus={setMenusCacheados}
            padres={padresMenu}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <DataTableMenu 
            datos={menusCacheados?? []} 
            openEdit={openEdit} 
            abrirConfirmar={confirmar}
            />
        </div>
      </div>
      <NewEditDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        padres={padresMenu}
        menu={selectedMenu}
        onSubmit={handleSave}
        loading={loading}
      />
      <ModalConfirmar
        open={confirmOpen}
        text={textConfir}
        onSubmit={accionar}
        onCancel={cancelarConfirmacion}
      />
      <ModalConfirmar
        open={openConfirmar}
        text={textConfirmar}
        onSubmit={inhabilitarHabilitar}
        onCancel={cancelarInhabilitarHabilitar}
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
