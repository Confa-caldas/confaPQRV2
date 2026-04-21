/**
 * Visibilidad/edición por campo (false = control deshabilitado).
 * Pueden enviarse solo las claves relevantes; ausencia se interpreta como editable.
 */
export type CamposVisiblesAfiliacionInterna = Record<string, boolean | undefined>;

/** Bloque personal devuelto por validar-trabajador (acepta camelCase y snake_case vía mapeo en el componente). */
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
  cargoOficio?: string | null;
  cargo_oficio?: string | null;
  /** Visibilidad por campo en camelCase (se normaliza a controles del formulario en el componente). */
  camposVisibles?: Record<string, boolean | undefined> | null;
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
  entidadesDisponibles?: EntidadDisponibleAfiliacionInterna[] | null;
  [key: string]: unknown;
}

export interface DatosFormularioAfiliacionInterna {
  personalInfo?: PersonalInfoAfiliacionInterna | null;
  laborInfo?: LaborInfoAfiliacionInterna | null;
  medioPago?: MedioPagoAfiliacionInterna | null;
  beneficiariosPrecargar?: unknown[] | null;
  datosBeneficiario?: unknown | null;
  [key: string]: unknown;
}

/** Respuesta de negocio de validar-trabajador (envuelta en BodyResponse en API). */
export interface ValidarTrabajadorResponse {
  success?: boolean;
  exitoso?: boolean;
  mensaje?: string | null;
  puedeContinuar?: boolean;
  datosFormulario?: DatosFormularioAfiliacionInterna | null;
  camposVisibles?: CamposVisiblesAfiliacionInterna | null;
  [key: string]: unknown;
}
