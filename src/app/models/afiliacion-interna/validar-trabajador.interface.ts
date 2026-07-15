/**
 * Modelos alineados a POST validar-trabajador (afiliacionEmpresaWS).
 * Doc referencia: afiliacion_empresa/src/app/interfaces/afiliacion.interfaces.ts
 */

/** Un resultado de validación dentro de la respuesta 200 del WS. */
export interface ValidacionResultAfiliacionInterna {
  nombre: string;
  nombreParaMostrar?: string;
  paso: boolean;
  mensaje: string | null;
  data?: Record<string, unknown> | null;
}

/** Validación mostrada en UI (paso identificación trabajador). */
export interface ValidacionMostradaAfiliacionInterna {
  passed: boolean;
  message: string;
  name: string;
}

/** Visibilidad/edición por campo (false = control deshabilitado). */
export type CamposVisiblesAfiliacionInterna = Record<string, boolean | undefined>;

/** Bloque personal devuelto por validar-trabajador. */
export interface PersonalInfoAfiliacionInterna {
  tipo_documento?: string | null;
  tipoDocumento?: string | null;
  numero_documento?: string | null;
  numeroDocumento?: string | null;
  primer_nombre?: string | null;
  primerNombre?: string | null;
  segundo_nombre?: string | null;
  segundoNombre?: string | null;
  primer_apellido?: string | null;
  primerApellido?: string | null;
  segundo_apellido?: string | null;
  segundoApellido?: string | null;
  fecha_nacimiento?: string | null;
  fechaNacimiento?: string | null;
  fecha_expedicion_doc?: string | null;
  fechaExpedicion?: string | null;
  celular?: string | null;
  confirmar_celular?: string | null;
  confirmarCelular?: string | null;
  correo?: string | null;
  correo_electronico?: string | null;
  confirmar_correo?: string | null;
  confirmarCorreo?: string | null;
  genero?: string | null;
  estado_civil?: string | null;
  estadoCivil?: string | null;
  direccion?: string | null;
  direccion_residencia?: string | null;
  zona?: string | null;
  departamento?: string | null;
  departamento_residencia?: string | null;
  municipio?: string | null;
  municipio_residencia?: string | null;
  ciudad?: string | null;
  telefono?: string | null;
  correoElectronico?: string | null;
  nombreCompleto?: string | null;
  cargoOficio?: string | null;
  cargo_oficio?: string | null;
  requiereAdjuntoDocumento?: boolean;
  datosRegistraduriaDisponibles?: boolean;
  datosContactoDisponibles?: boolean;
  datosGenesysDisponibles?: boolean;
  mensajeAdjuntoDocumento?: string | null;
  camposVisibles?: Record<string, boolean | undefined> | null;
  cabezaHogar?: string | null;
  ocupacion?: string | null;
  nivelEducativo?: string | null;
  viveEnCasaPropia?: boolean;
  claseTrabajador?: string | null;
  tipoSalario?: string | null;
  tipoContratoLaboral?: string | null;
  fechaTerminacionContrato?: string | null;
  sucursalAsociada?: number | null;
  municipioDesempenoLabores?: string | null;
  paisResidencia?: string | null;
  autorizacionEnvioCorreo?: boolean;
  [key: string]: unknown;
}

export interface RangoFechaIngresoAfiliacionInterna {
  fechaMinima?: string | null;
  fechaMaxima?: string | null;
}

export interface LaborInfoAfiliacionInterna {
  rangoFechaIngreso?: RangoFechaIngresoAfiliacionInterna | null;
  salarioMinimo?: number | null;
  salarioMinimoAnual?: number | null;
  salarioActual?: number | null;
  horasMaximas?: number | null;
  horasMinimas?: number | null;
  requierePermisoLaboral?: boolean;
  mensajePermisoLaboral?: string | null;
  [key: string]: unknown;
}

export interface TipoCuentaEntidadAfiliacionInterna {
  idTipoCuenta?: number | null;
  nombreTipoCuenta?: string | null;
  codigoTipoCuenta?: string | null;
  longitudMinima?: number | null;
  longitudMaxima?: number | null;
  [key: string]: unknown;
}

export interface EntidadDisponibleAfiliacionInterna {
  idEntidad?: number | null;
  nombreEntidad?: string | null;
  tipoEntidad?: string | null;
  solicitaTipoCuenta?: boolean;
  tiposCuenta?: TipoCuentaEntidadAfiliacionInterna[] | null;
  [key: string]: unknown;
}

export interface MedioPagoAfiliacionInterna {
  medioPago?: string | null;
  mostrarCamposFormulario?: boolean;
  mensajeInformativo?: string | null;
  entidadBancaria?: number | string | null;
  banco?: number | string | null;
  tipoCuenta?: number | string | null;
  numeroCuenta?: string | null;
  confirmacionCuenta?: string | null;
  tipoIdentificacionTitular?: string | null;
  numeroIdentificacionTitular?: string | null;
  titularCuenta?: string | null;
  entidadesDisponibles?: EntidadDisponibleAfiliacionInterna[] | null;
  [key: string]: unknown;
}

export interface Form007DataAfiliacionInterna {
  disponible?: boolean;
  orientacionSexual?: string | null;
  factorVulnerabilidad?: string | null;
  pertenenciaEtnica?: string | null;
  [key: string]: unknown;
}

export interface DireccionCalculadaAfiliacionInterna {
  disponible?: boolean;
  elemento?: string | null;
  tipoVia?: string | null;
  numero?: string | null;
  letra?: string | null;
  viaGeneradora?: string | null;
  descripcionBarrio?: string | null;
  [key: string]: unknown;
}

/** Beneficiario precargado desde validar-trabajador (para guardar-solicitud). */
export interface BeneficiarioPrecargarAfiliacionInterna {
  documento: string;
  tipoDoc: string;
  parentesco: string;
  fecharet?: string;
  estadoBeneficiario?: string;
  tipoDocumento?: string;
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  fechaNacimiento?: string;
  fechaExpedicionDoc?: string;
  genero?: string;
  /** Número real de grupo familiar de Genesys (clave del mapa gruposFamiliares), para no perder el
   * agrupamiento (ej. cónyuge + hijastro) al validar otros beneficiarios ni al guardar la solicitud. */
  numeroGrupoFamiliar?: number;
  gradoCursado?: string;
  certificadoEscolar?: string;
  fechaInicioVigenciaCertificadoEscolar?: string;
  fechaFinVigenciaCertificadoEscolar?: string;
  fechaReporteInvalidez?: string;
  [key: string]: unknown;
}

export interface AdjuntoRequeridoAfiliacionInterna {
  id?: number | null;
  nombreDocumento?: string | null;
  esRequerido?: boolean;
}

/** Datos específicos del beneficiario (validar-beneficiario → datosFormulario.datosBeneficiario). */
export interface DatosBeneficiarioAfiliacionInterna {
  adjuntosRequeridos?: AdjuntoRequeridoAfiliacionInterna[] | null;
  requiereAdjuntoRegistroCivil?: boolean;
  requiereAdjuntoDocumentoSoporte?: boolean;
  requiereSoporteDiscapacidad?: boolean;
  obligarPersonaDiscapacidadSi?: boolean;
  edadMinimaRequeridaPadreMadre?: number | null;
  nuevoBeneficiario?: string | null;
  nuevoGrupoFamiliar?: string | null;
  numeroGrupoFamiliar?: number | null;
  revisionBack?: boolean;
  [key: string]: unknown;
}

export interface DatosFormularioAfiliacionInterna {
  personalInfo?: PersonalInfoAfiliacionInterna | null;
  laborInfo?: LaborInfoAfiliacionInterna | null;
  medioPago?: MedioPagoAfiliacionInterna | null;
  form007Data?: Form007DataAfiliacionInterna | null;
  direccionCalculada?: DireccionCalculadaAfiliacionInterna | null;
  beneficiariosPrecargar?: BeneficiarioPrecargarAfiliacionInterna[] | null;
  datosBeneficiario?: DatosBeneficiarioAfiliacionInterna | null;
  [key: string]: unknown;
}

/**
 * Cuerpo de negocio del WS validar-trabajador (envuelto en BodyResponse.data por la Lambda).
 * Se conserva completo en memoria para guardar-solicitud (form007, Genesys, beneficiarios precargar, etc.).
 */
export interface ValidarTrabajadorResponse {
  success?: boolean;
  exitoso?: boolean;
  mensaje?: string | null;
  puedeContinuar?: boolean;
  validaciones?: ValidacionResultAfiliacionInterna[];
  datosFormulario?: DatosFormularioAfiliacionInterna | null;
  error?: string;
  message?: string;
  camposVisibles?: CamposVisiblesAfiliacionInterna | null;
  [key: string]: unknown;
}
