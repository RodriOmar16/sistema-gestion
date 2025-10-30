export function formatDateTime(dateString: string): string {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function ordenarPorTexto<T>(array: T[], campo: keyof T): T[] {
  return [...array].sort((a, b) => {
    const textoA = String(a[campo]).toLowerCase().trim();
    const textoB = String(b[campo]).toLowerCase().trim();
    return textoA.localeCompare(textoB);
  });
}

export function resetLocalStorage(){
  localStorage.removeItem('menu');
  localStorage.removeItem('menu-data');
}

export function formatearCuilCompleto(cuil: number): string {
  const limpio = cuil.toString().padStart(11, '0'); // asegura 11 dígitos

  if (limpio.length !== 11) return limpio;

  const parte1 = limpio.slice(0, 2);
  const parte2 = limpio.slice(2, 10);
  const parte3 = limpio.slice(10);

  return `${parte1}-${parte2}-${parte3}`;
}

export function convertirFechaBarrasGuiones(fecha:string ){
  return fecha.split('/').reverse().join('-');
}
export function convertirFechaGuionesBarras(fecha:string ){
  return fecha.split('-').reverse().join('/');
}