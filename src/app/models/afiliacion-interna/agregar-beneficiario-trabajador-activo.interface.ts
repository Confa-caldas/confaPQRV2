/** Un beneficiario en POST agregar-beneficiario-trabajador-activo (misma forma que afiliación web). */
export interface BeneficiarioNuevoRequestInterna {
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre?: string | null;
  primerApellido: string;
  segundoApellido?: string | null;
  fechaNacimiento: string;
  fechaExpedicionDoc?: string | null;
  genero?: string | null;
  direccion?: string | null;
  parentesco: string;
  parentescoGenesys?: string | null;
  personaDiscapacidad?: string | null;
  direccionCorrespondeTrabajador?: string | null;
  nuevoBeneficiario?: string | null;
  nuevoGrupoFamiliar?: string | null;
  numeroGrupoFamiliar?: number | null;
  requiereAdjuntoRegistroCivil?: boolean;
  requiereAdjuntoDocumentoSoporte?: boolean;
  revisionBack?: boolean;
  paisResidencia?: string | null;
  autorizacionEnvioCorreo?: boolean | null;
  orientacionSexual?: string | null;
  factorVulnerabilidad?: string | null;
  pertenenciaEtnica?: string | null;
  telefono?: string | null;
  correoElectronico?: string | null;
  dirElemento?: string | null;
  dirTipoVia?: string | null;
  dirNumero?: string | null;
  dirLetra?: string | null;
  dirViaGeneradora?: string | null;
  dirBarrio?: string | null;
  gradoCursado?: string | null;
  certificadoEscolar?: string | null;
  fechaInicioVigenciaCertificadoEscolar?: string | null;
  fechaFinVigenciaCertificadoEscolar?: string | null;
  personaInvalidez?: string | null;
  fechaReporteInvalidez?: string | null;
  tipoIdentificacionAdministradorSubsidio?: string | null;
  numeroIdentificacionAdministradorSubsidio?: string | null;
  nombreCompletoAdministradorSubsidio?: string | null;
}

/** Adjunto en base64 para agregar-beneficiario-trabajador-activo. */
export interface AdjuntoNuevoRequestInterna {
  idTipoAdjunto: number;
  rutaArchivo?: string | null;
  nombreArchivo: string;
  indiceBeneficiario: number;
  contentType?: string | null;
  tamanioBytes?: number | null;
  contenidoBase64?: string | null;
}

/** Request POST  agregar-beneficiario-trabajador-activo (afiliación interna). */
export interface AgregarBeneficiarioTrabajadorActivoRequestInterna {
  idEmpresa: number;
  tipoDocumentoTrabajador: string;
  numeroDocumentoTrabajador: string;
  nombreCompletoTrabajador?: string | null;
  primerNombreTrabajador?: string | null;
  segundoNombreTrabajador?: string | null;
  primerApellidoTrabajador?: string | null;
  segundoApellidoTrabajador?: string | null;
  fechaNacimientoTrabajador?: string | null;
  generoTrabajador?: string | null;
  direccionTrabajador?: string | null;
  telefonoTrabajador?: string | null;
  correoElectronicoTrabajador?: string | null;
  fechaExpedicionDocTrabajador?: string | null;
  nivelEducativoTrabajador?: string | null;
  cabezaHogarTrabajador?: string | null;
  estadoCivilTrabajador?: string | null;
  paisResidenciaTrabajador?: string | null;
  idDepartamentoTrabajador?: number | null;
  idMunicipioTrabajador?: number | null;
  zonaTrabajador?: string | null;
  viveEnCasaPropiaTrabajador?: boolean | null;
  autorizacionEnvioCorreoTrabajador?: boolean | null;
  medioPagoTrabajador?: string | null;
  horasLaboradasMesTrabajador?: number | null;
  sucursalAsociadaTrabajador?: number | null;
  municipioLaboraTrabajador?: string | null;
  fechaIngresoEmpresaTrabajador?: string | null;
  salarioMensualTrabajador?: number | null;
  claseTrabajadorTrabajador?: string | null;
  beneficiarios: BeneficiarioNuevoRequestInterna[];
  adjuntos?: AdjuntoNuevoRequestInterna[];
  observaciones?: string | null;
  requiereRevisionInterna?: boolean;
  origenRadicacion?: string;
  /** Login del gestor PQR que radica (sesión). Obligatorio en afiliación interna. */
  usuarioRadicacionInterno?: string;
  /** Fecha de recepción de documentos (ISO yyyy-MM-dd). Obligatoria solo en afiliación interna. */
  fechaRecepcionDocumentos?: string;
}

export interface SolicitudCreadaBeneficiarioInterna {
  numeroRadicado: string;
  tipoDocumentoBeneficiario: string;
  numeroDocumentoBeneficiario: string;
  nombreBeneficiario: string;
  parentesco: string;
}

export interface AgregarBeneficiarioTrabajadorActivoResponseInterna {
  success: boolean;
  mensaje: string;
  solicitudesCreadas?: SolicitudCreadaBeneficiarioInterna[] | null;
}
