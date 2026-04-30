import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Sheet } from 'lucide-react';
import { route } from 'ziggy-js';

interface Props{
  deshabilitado: boolean;
  url:           string;
  payload:       object,
  title:         string;
  clase:         string;
  tipo:          'Excel' | 'Pdf';
}

export default function ButtonDownload({ deshabilitado, url, payload, title, clase, tipo}:Props) {
  const handleClick = () => {
    const query = new URLSearchParams(payload as Record<string, any>).toString();
    const fullUrl = `${route(url)}?${query}`;
    window.open(fullUrl, '_blank');
  };
  return (
    <Button 
      className={clase}
      title={title}
      variant="ghost" 
      disabled={deshabilitado}
      onClick={handleClick}
    >
      {tipo==='Excel' ?
        (  <Sheet className=' scale-150'size={25}/> )
        : ( <FileText className=' scale-150' size={25}/> )
        //los que se necesite
      }
      {tipo}
    </Button>
  );
}