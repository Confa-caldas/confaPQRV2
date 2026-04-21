/**
 * Datos de empresa devueltos por la Lambda orquestadora tras validar documento.
 * El backend puede enviar camelCase o snake_case; el componente normaliza lectura.
 */
export interface DatosEmpresaAfiliacionInterna {
  razonSocial?: string;
  razon_social?: string;
  nit?: string;
  tipoDocumento?: string;
  tipo_documento?: string;
  numeroIdentificacion?: string;
  numero_identificacion?: string;
  id?: number | string;
  idEmpresa?: number | string;
  id_empresa?: number | string;
  [key: string]: unknown;
}

/**
 * Cuerpo de negocio devuelto por el servicio de validación (Lambda → WS afiliación empresa).
 */
export interface ValidarEmpresaResponse {
  exitoso: boolean;
  mensaje?: string | null;
  puedeContinuar: boolean;
  datosEmpresa?: DatosEmpresaAfiliacionInterna | null;
}
