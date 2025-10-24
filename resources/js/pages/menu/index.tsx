import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select,  SelectContent,  SelectGroup,  SelectItem,  SelectLabel,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { Switch } from '@/components/ui/switch';
import { Pen, Ban, Search, Brush, Loader2, CirclePlus, Filter, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Menu } from '@/types/menus';
import NewEditDialog from '../../components/projects/newEdit';
import ModalConfirmar from '@/components/modalConfirmar';
import PdfButton from '@/components/utils/pdfButton';
import ShowMessage from '@/components/utils/showMessage';
//import { DataTableProjects } from '@/components/projects/dataTableProjects';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Menus',
    href: '',
  },
];

export const FiltrosMenu = ({ openCreate} : { openCreate: () => void }) => {
  const menuData = JSON.parse(localStorage.getItem('menu-data')??'');
  const menu = JSON.parse(localStorage.getItem('menu')??''); 
  const menuCero = menu.map((e:any,index:number) => ({
    title: e.title, url: e.href, id:index+1
  }));
  menuCero.push({id:0 ,title: 'Todos', url:''});

  const [loading, setLoading] = useState(false);
  //'id','nombre', 'padre', 'orden', 'inhabilitado', 'icono'
  //const { filters } = usePage().props as { filters?: { menu_id: string|number; nombre: string; padre:number, orden:number, icono: string, inhabilitado: boolean } };

  const { data, setData, get, processing, errors } = useForm<Menu/*{
    id: string;
    name: string;
    descripcion: string;
    inhabilitado: string | boolean;
  }*/>({
    menu_id: /*filters?.menu_id ||*/ null,
    nombre: /*filters?.nombre ||*/ '',
    padre: /*filters?.padre ||*/ 0,
    orden: /*filters?.orden ||*/ 0,
    icono:/* filters?.icono ||*/ '',
    inhabilitado: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    console.log("data: ", data)
    e.preventDefault();
    //setLoading(true);
    //return;
    console.log("data.menu_id: ", data.menu_id, "typeof: ", typeof data.menu_id)
    router.get('/get_menu', {
      menu_id:      data.menu_id ? Number(data.menu_id) : null,
      nombre:       data.nombre,
      padre:        data.padre,
      //orden: data.orden,
      icono:        data.icono,
      inhabilitado: Boolean(data.inhabilitado),
    }, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => {
        console.log("termino")
        setLoading(false)
      },
      onSuccess: () => {
        setLoading(false)
      },
      onError: (e) =>{
        console.log("error: ",e)
        setLoading(false)
      },
    });
  };

  const handleReset = () => {
    setData({
      menu_id: null,
      nombre: '',
      padre: 0,
      //orden: filters?.orden || 0,
      icono: '',
      inhabilitado: false,
    });
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
            value={String(data.padre)}
            onValueChange={(value) => setData('padre', Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {menuCero.map((e: any) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.title}
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
  /*//para guardar la data del modal mientras se abre el modal de confirmar
  const [pendingData, setPendingData] = useState<Menu | undefined>(undefined);

  //controla cuando se abre el modal de confirmar y el texto que se quiera mostrar
  const [confirmOpen, setConfirOpen] = useState(false);
  const [textConfir, setTextConfirm] = useState('');

  //controla el modal newEdit y los datos que recibe para mostrarlos
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProject, setSelectedProject] = useState<Menu | undefined>(undefined);

  //para dar la apariencia de loading
  const [loading, setLoading] = useState(false);
*/
  //necesito los projects de inertia
  //const { menus } = usePage().props as { menus?: { data: Menu[] } };
  const { menus } = usePage().props as { menus?: Menu[] };
  useEffect(() => {
    console.log("MENUS ACTUALIZADOS:", menus);
  }, [menus]);
  /*//para editar
  const projectVacio = {
    id: '',
    name: '',
    descripcion: '',
    inhabilitado: false,
    created_at: '',
    updated_at: ''
  }
  const [openConfirmar, setConfirmar]     = useState(false);
  const [textConfirmar, setTextConfirmar] = useState(''); 
  const [projectCopia, setProjectCopia]   = useState<Menu>(projectVacio);

  //ShowMessage
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const confirmar = (project: Menu) => {
    if(project){
      setProjectCopia( JSON.parse(JSON.stringify(project)) );
      const texto : string = project.inhabilitado === 0 ? 'inhabilitar': 'habilitar';
      setTextConfirmar('Estás seguro de querer '+texto+' este proyecto?');
      setConfirmar(true);
    }
  };
  const inhabilitarHabilitar = () => {
    if (!projectCopia || !projectCopia.id) return;
    setLoading(true);

    router.put(`/projects/${projectCopia.id}/estado`, {}, {
      preserveScroll: true,
      onFinish: () => {
        setProjectCopia(projectVacio);
        setTextConfirmar('');
        setConfirmar(false);
        setLoading(false);
      },
      onSuccess: () => {
        // solo si fue exitosa
        setTitle('Proyecto Modificado');
        setText('Proyecto ' + (projectCopia.inhabilitado===0? 'inhabilitado' : 'habilitado')+ ' éxitosamente.');
        setColor("success");
        setActivo(true);
      },
      onError: (e) => {
        // solo si hubo error
        setTitle('Error con el proyecto');
        setText(e.name ?? 'Error al modificar el estado.');
        setColor("error");
        setActivo(true);
      }
    });
  };

  const cancelarInhabilitarHabilitar = () => { 
    setConfirmar(false);
  };
*/
  //Functions
  const openCreate = () => {
    /*setModalMode('create');
    setSelectedProject(undefined);
    setModalOpen(true);*/
  };

  /*const openEdit = (project: Project) => {
    setModalMode('edit');
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleSave = (data: Project) => {
    setPendingData(data);
    if (modalMode === 'create') {
      setTextConfirm('¿Estás seguro de grabar este proyecto?');
    } else {
      setTextConfirm('¿Estás seguro de guardar cambios a este proyecto?');
    }
    setConfirOpen(true);
  };

  const accionar = () => {
    if (!pendingData) return;
    setLoading(true);

    const payload = {
      name: pendingData.name,
      descripcion: pendingData.descripcion,
    };

    if (modalMode === 'create') {
      router.post('/projects', payload, {
        onFinish: () => {
          setLoading(false);
          setModalOpen(false);
          setPendingData(undefined);
        },
        onSuccess: () => {
          // solo si fue exitosa
          setTitle('Proyecto nuevo');
          setText('Proyecto creado éxitosamente.');
          setColor("success");
          setActivo(true);
        },
        onError: (e) => {
          // solo si hubo error
          setTitle('Error en nuevo Proyecto');
          setText('Ocurrió un problema al crear un proyecto nuevo: '+e.name);
          setColor("error");
          setActivo(true);
        }
      });
    } else {
      router.put(`/projects/${pendingData.id}`, payload, {
        onFinish: () => {
          setLoading(false);
          setModalOpen(false);
          setPendingData(undefined);
        },
        onSuccess: () => {
          // solo si fue exitosa
          setTitle('Proyecto Modificado');
          setText('Se actualizó correctamente el proyecto '+pendingData.id);
          setColor("success");
          setActivo(true);
        },
        onError: (e) => {
          // solo si hubo error
          setTitle('Error en proyecto');
          setText('Ocurrió un problema y no se modificó el poryecto: '+e.name);
          setColor("error");
          setActivo(true);
        }
      });
    }

    setConfirOpen(false);
  };

  const cancelarConfirmacion = () => {
    setConfirOpen(false);
  };*/

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Menu" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <FiltrosMenu openCreate={openCreate}/>
        </div>
        <div className="p-4 relative flex-1 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          {/*<DataTableProjects 
            datos={projects?.data ?? []} openEdit={openEdit} 
            abrirConfirmar={confirmar}
            />*/}
            <div>
    {menus?.length === 0 ? (
      <p className="text-gray-500 text-center">No se encontraron menús.</p>
    ) : (
      <table className="w-full border">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Icono</th>
            <th>Padre</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {menus?.map((menu) => (
            <tr key={menu.menu_id}>
              <td>{menu.menu_id}</td>
              <td>{menu.nombre}</td>
              <td>{menu.icono}</td>
              <td>{menu.padre}</td>
              <td>{menu.inhabilitado ? 'Inhabilitado' : 'Activo'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
        </div>
      </div>
      {/*<NewEditDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        project={selectedProject}
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
      />*/}
    </AppLayout>
  );
}
