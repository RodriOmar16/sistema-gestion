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
