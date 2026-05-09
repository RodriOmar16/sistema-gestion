import { ordenarPorTexto } from "@/utils";
import { useState } from "react";
import AsyncSelect from "react-select/async";

type SelectProps = {
  onChange?: (option: any | null) => void;
  value?: any | null;
  placeHolder?: string;
  isDisabled?: boolean;
  url: string;
  labelKey?: string; // campo que se mostrará en el select
  valueKey?: string; // campo que se usará como identificador
};

export default function SelectAutocomplete({ onChange, value, placeHolder, isDisabled = false, url, labelKey = "nombre", valueKey = "id"} : SelectProps) {
  const loadOptions = (inputValue: string, callback: any) => {
    fetch(`/${url}/habilitados?buscar=${inputValue}`)
      .then((res) => res.json())
      .then((data) => {
        const elementos = data.elementos?.data ?? [];
        callback(
          ordenarPorTexto(elementos, labelKey).map((e: any) => ({
            ...e,
            value: e[valueKey],
            label: e[labelKey],
          }))
        );
      });
  };

  return (
    <AsyncSelect
      styles={{
        control: (base, state) => ({
          ...base,
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
          borderColor: state.isFocused ? "var(--primary)" : "var(--border)",
          boxShadow: state.isFocused ? "0 0 0 1px var(--primary)" : "none",
          "&:hover": { borderColor: "var(--primary)" },
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused
            ? "var(--primary)"
            : "var(--background)",
          color: state.isFocused
            ? "var(--primary-foreground)"
            : "var(--foreground)",
          cursor: "pointer",
        }),
        singleValue: (base) => ({ ...base, color: "var(--foreground)" }),
        placeholder: (base) => ({ ...base, color: "var(--muted-foreground)" }),
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
  );
}
