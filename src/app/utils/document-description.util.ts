/**
 * Divide la descripción por cada asterisco (*) y devuelve un ítem por renglón.
 * Ej: "*Item A *Item B" → ["Item A", "Item B"]
 */
export function getDescriptionLines(description: string | null | undefined): string[] {
  if (!description?.trim()) {
    return [];
  }

  const text = description.trim();
  if (!text.includes('*')) {
    return [text];
  }

  return text
    .split('*')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}
