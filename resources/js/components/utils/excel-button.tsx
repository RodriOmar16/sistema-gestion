import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet } from 'lucide-react';
import { route } from 'ziggy-js';

interface Props{
  deshabilitado: boolean;
  url: string;
  payload: object, 
}

export default function ExcelButton({ deshabilitado, url, payload }:Props) {
  const handleClick = () => {
    //console.log("payload: ", payload)
    window.open(route(url,{...payload}), '_blank');
  };
  return (
    <Button 
      className="p-0 bg-green-700 hover:bg-green-800 dark:hover:bg-green-800 text-white dark:hover:text-white cursor-pointer "
      title="Generar Excel" 
      variant="ghost" 
      disabled={deshabilitado}
      onClick={handleClick}
    >
      <Sheet
        className=' scale-150' 
        size={25}/>
        Excel
    </Button>
  );
}