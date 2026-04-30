import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { route } from 'ziggy-js';

interface Props{
  deshabilitado: boolean;
  url: string;
  payload: object, 
}

export default function PdfButton({ deshabilitado, url, payload }:Props) {
  /*const handleClick = () => {
    console.log("payload: ", payload)
    window.open(route(url,{...payload}), '_blank');
  };*/
  const handleClick = () => {
    const query = new URLSearchParams(payload as Record<string, any>).toString();
    const fullUrl = `${route(url)}?${query}`;
    window.open(fullUrl, '_blank');
  };

  return (
    <Button 
      className="p-0 bg-red-700 text-white hover:text-white hover:bg-red-800 dark:hover:bg-red-800 cursor-pointer"
      title="Generar PDF" 
      variant="ghost" 
      disabled={deshabilitado}
      onClick={handleClick}
    >
      <FileText
        className=' scale-150' 
        size={25}/>
      Pdf
    </Button>
  );
}