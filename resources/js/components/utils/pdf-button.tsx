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
  const handleClick = () => {
    console.log("payload: ", payload)
    window.open(route(url,{...payload}), '_blank');
  };
  return (
    <Button 
      className="p-0 bg-red-700 text-white cursor-pointer hover:outline"
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