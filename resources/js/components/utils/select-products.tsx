import { ordenarPorTexto } from "@/utils";
import { useState } from "react";
import AsyncSelect from "react-select/async";

type ProductOption = {
  value: number;
  label: string;
  price: number;
};

type SelectProps = {
  onChange?: (option: { value: number; label: string } | null) => void;
  value?: ProductOption | null
  placeHolder?: string;
  isDisabled?: boolean;
};

export default function SelectProducts({ onChange, value, placeHolder, isDisabled = false }: SelectProps) {

  const loadOptions = (inputValue: string, callback: any) => {
    fetch(`/productos-stock/habilitados?buscar=${inputValue}`)
      .then(res => res.json())
      .then(data => {
        callback(
          ordenarPorTexto(data.elementos.data,'nombre')
            .map((e: any) => ({
            value: e.id,
            label: e.nombre,
            price: Number(e.precio)
          }))
        );
      });
  }; 

  return (
    <>
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
