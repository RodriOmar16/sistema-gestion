import { ordenarPorTexto } from "@/utils";
import { useState } from "react";
import AsyncSelect from "react-select/async";

type GenericSelectProps = {
  route: string;
  onChange?: (option: { value: number; label: string } | null) => void;
  value?: { value: number; label: string } | null
  placeHolder?: string;
};

export default function GenericSelect({ route, onChange, value, placeHolder }: GenericSelectProps) {

  const loadOptions = (inputValue: string, callback: any) => {
    fetch(`/${route}/habilitados?buscar=${inputValue}`)
      .then(res => res.json())
      .then(data => {
        callback(
          ordenarPorTexto(data.elementos.data,'nombre')
          /*data.elementos.data*/.map((e: any) => ({
            value: e.id,
            label: e.nombre,
          }))
        );
      });
  };

  return (
    <AsyncSelect
      menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }),
        menu: base => ({ ...base, maxHeight: 200, overflowY: "auto" }),
      }}
      cacheOptions
      loadOptions={loadOptions}
      defaultOptions
      placeholder={placeHolder}
      isClearable
      value={value} // usa directamente el valor del padre
      onChange={onChange} // notifica al padre
    />
  );
}
