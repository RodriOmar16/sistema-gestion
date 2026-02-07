import { ordenarPorTexto } from "@/utils";
import { useState } from "react";
import AsyncSelect from "react-select/async";

type GenericSelectProps = {
  route: string;
  onChange?: (option: { value: number; label: string } | null) => void;
  value?: { value: number; label: string } | null
  placeHolder?: string;
  isDisabled?: boolean;
};

export default function GenericSelect({ route, onChange, value, placeHolder, isDisabled = false }: GenericSelectProps) {

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
    <>
      {/*<AsyncSelect
        styles={{
          menu: base => ({ ...base, maxHeight: 'auto'})
        }}
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions
        placeholder={placeHolder}
        isClearable
        value={value} // usa directamente el valor del padre
        onChange={onChange} // notifica al padre
        isDisabled={isDisabled}
      />*/}
      <AsyncSelect
        styles={{
          control: (base, state) => ({
            ...base,
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
            borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)',
            boxShadow: state.isFocused ? '0 0 0 1px var(--primary)' : 'none',
            '&:hover': {
              borderColor: 'var(--primary)',
            },
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
              ? 'var(--primary)'
              : 'var(--background)',
            color: state.isFocused
              ? 'var(--primary-foreground)'
              : 'var(--foreground)',
            cursor: 'pointer',
          }),
          singleValue: (base) => ({
            ...base,
            color: 'var(--foreground)',
          }),
          placeholder: (base) => ({
            ...base,
            color: 'var(--muted-foreground)',
          }),
        }}
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions
        placeholder={placeHolder}
        isClearable
        value={value}
        onChange={onChange}
        isDisabled={isDisabled}
      />
    </>

  );
}
