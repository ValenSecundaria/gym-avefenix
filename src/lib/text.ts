/** Minúsculas, sin acentos ni espacios repetidos: "  Martín  Peña" -> "martin pena". */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/** true si `text` contiene `query`, sin distinguir mayúsculas ni acentos. */
export function matchesSearch(text: string, query: string): boolean {
  return normalizeSearchText(text).includes(normalizeSearchText(query));
}
