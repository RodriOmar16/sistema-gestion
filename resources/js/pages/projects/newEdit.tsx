import { Button } from "@/components/ui/button"
import {
  Dialog,  DialogClose,  DialogContent,  DialogDescription,  DialogFooter,  DialogHeader,
  DialogTitle,  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React from "react"
import { Project } from '@/types/project';
import { Loader2 } from 'lucide-react';

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  project?: Project;
  onSubmit: (data:Project) => void;
  loading: boolean;
}

export default function NewEditDialog({ open, onOpenChange, mode, project, onSubmit, loading }: Props){
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
    //setForm({ id: '', name: '', descripcion: '' })
    onSubmit(form);
    //onOpenChange(false);
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
            { loading ? ( <Loader2 size={20} className="animate-spin mr-2"/> ) :
                        ( mode === 'create' ? 'Grabar' : 'Actualizar')  
            }          
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
