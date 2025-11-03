import { Button } from "@/components/ui/button"
import {
  Dialog,  DialogClose,  DialogContent,  DialogDescription,  DialogFooter,  DialogHeader,
  DialogTitle,  DialogTrigger
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React, { use, useState } from "react"
import { Project } from '@/types/typeCrud';
import { Loader2, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import ShowMessage from "@/components/utils/showMessage"

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  project?: Project;
  onSubmit: (data:Project) => void;
  loading: boolean;
}

export default function NewEditDialog({ open, onOpenChange, mode, project, onSubmit, loading }: Props){
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');

  const [ form, setForm ] = React.useState<Project>({
    id: project?.id || '',
    name: project?.name || '',
    descripcion: project?.descripcion || '',
    inhabilitado: project?.inhabilitado || 'false',
  });

  React.useEffect(() => {
    if (!open && mode === 'create') {
      setForm({ id: '', name: '', descripcion: '', inhabilitado: false });
    }
  }, [open, mode]);

  React.useEffect(() => {
    if(project){
      setForm({ id: project.id, name: project.name, descripcion: project.descripcion, inhabilitado: project.inhabilitado })
    }else setForm({ id: '', name: '', descripcion: '', inhabilitado: false })
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!form.name){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un nombre al proyecto');
      setActivo(true);
      return 
    }
    if(!form.descripcion){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses una descripción al proyecto');
      setActivo(true);
      return;
    }
    onSubmit(form);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo Proyecto' : 'Editar Proyecto'}</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear un nuevo proyecto' : 
                                  `Editando proyecto: ${project?.id}` }
          </DialogDescription>
          <hr />
        </DialogHeader>
        <form className="space-y-4">
          { mode !== 'create' ? 
            (
              <>
                <label htmlFor="id">Id</label>
                <Input
                  disabled
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="Id"
                />
              </>
            ) : <></>
          }
          <label htmlFor="nombre">Nombre</label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nombre"
          />
          <label htmlFor="">Descripción</label>
          <Textarea 
            value={form.descripcion} 
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Describa el proyecto aquí..." />
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            type="button" 
          >
            { loading ? ( <Loader2 size={20} className="animate-spin"/> ) : 
                         (<Save size={20} className=""/>)  }
            { ( mode === 'create' ? 'Grabar' : 'Actualizar')  }             
          </Button>
        </DialogFooter>
      </DialogContent>
      <ShowMessage 
        open={activo}
        title={title}
        text={text}
        color="warning"
        onClose={() => setActivo(false)}
      />
    </Dialog>
  );
}
