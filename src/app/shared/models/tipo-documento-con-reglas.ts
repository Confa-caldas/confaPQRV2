/** Tipo de documento con reglas de validación (personas y empresas). */
export interface TipoDocumentoConReglas {
  value: string;
  label: string;
  digitosMinimos: number;
  digitosMaximos: number;
  permiteLetras: boolean;
  cantidadLetras?: number | null;
}
