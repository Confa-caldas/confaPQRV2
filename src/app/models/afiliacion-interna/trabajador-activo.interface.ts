/** Respuesta de consulta trabajador activo (WS GET trabajador-activo vía Lambda interna). */
export interface TrabajadorActivoInternaResponse {
  activo: boolean;
  mensaje?: string | null;
  tipoDocumento?: string;
  numeroDocumento?: string;
  nombreCompleto?: string;
  primerNombre?: string;
  segundoNombre?: string | null;
  primerApellido?: string;
  segundoApellido?: string | null;
  fechaNacimiento?: string;
  fechaExpedicionDocumentoTrabajador?: string;
  genero?: string;
  direccion?: string;
  telefono?: string;
  correoElectronico?: string;
  nivelEducativo?: string;
  cabezaHogar?: string;
  estadoCivil?: string;
  paisResidencia?: string;
  idDepartamento?: number;
  idMunicipio?: number;
  zona?: string;
  viveEnCasaPropia?: boolean;
  autorizacionEnvioCorreo?: boolean;
  medioPago?: string;
  horasLaboradasMes?: number;
  sucursalAsociada?: number;
  municipioLabora?: string;
  fechaIngresoEmpresa?: string;
  salarioMensual?: number;
  claseTrabajador?: string;
}

export interface ConsultarTrabajadorActivoInternaRequest {
  idEmpresa: number;
  tipoDocumento: string;
  numeroDocumento: string;
}
