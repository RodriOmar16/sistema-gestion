import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Rutas', href: '', } ];

export default function RutasForm(){

  const { rutas } = usePage().props as { rutas?: any[] };

  const { data, setData, get, processing } = useForm({
    ruta_id: '',
    url: '',
    inhabilitada: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/get_rutas', data, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Rutas" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="p-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-3">
              <label>ID</label>
              <Input type="number" value={data.ruta_id} onChange={(e) => setData('ruta_id', e.target.value)} />
            </div>
            <div className="col-span-6">
              <label>URL</label>
              <Input type="text" value={data.url} onChange={(e) => setData('url', e.target.value)} />
            </div>
            <div className="col-span-3 flex items-center gap-2">
              <label>Inhabilitada</label>
              <Switch checked={data.inhabilitada} onCheckedChange={(val) => setData('inhabilitada', val)} />
            </div>
            <div className="col-span-12 flex justify-end">
              <Button type="submit" disabled={processing}>Buscar</Button>
            </div>
          </form>

          {rutas?.length === 0 ? (
            <p className="text-gray-500 text-center">No se encontraron rutas.</p>
          ) : (
            <table className="w-full border">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>URL</th>
                  <th>Inhabilitada</th>
                  <th>Creado</th>
                  <th>Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {rutas?.map((ruta) => (
                  <tr key={ruta.ruta_id}>
                    <td>{ruta.ruta_id}</td>
                    <td>{ruta.url}</td>
                    <td>{ruta.inhabilitada ? 'Sí' : 'No'}</td>
                    <td>{ruta.created_at}</td>
                    <td>{ruta.updated_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
