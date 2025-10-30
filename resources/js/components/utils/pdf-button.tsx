import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface Props{
  deshabilitado: boolean
}

export default function PdfButton({ deshabilitado }:Props) {
  const handleClick = () => {
    window.open('/projects/report', '_blank');
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