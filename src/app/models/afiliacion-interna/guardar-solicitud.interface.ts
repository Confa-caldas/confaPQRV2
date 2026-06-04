/** Request POST guardar-solicitud (afiliacionEmpresaWS). */
export interface TrabajadorGuardarSolicitudInterna {
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  fechaNacimiento: string;
  fechaExpedicionDoc?: string;
  genero?: string;
  direccion?: string;
  estadoCivil?: string;
  idDepartamento?: number;
  idMunicipio?: number;
  zona?: string;
  telefono?: string;
  correoElectronico?: string;
  fechaIngresoEmpresa?: string;
  horasLaboradasMes?: number;
  salarioMensual?: number;
  requierePermisoLaboral?: boolean;
  medioPago?: string;
  idEntidadBancaria?: number;
  tipoCuenta?: string;
  numeroCuenta?: string;
  llaveBreb?: string;
  cabezaHogar?: string;
  ocupacion?: string;
  nivelEducativo?: string;
  viveCasaPropia?: boolean;
  claseTrabajador?: string;
  tipoSalario?: string;
  tipoContratoLaboral?: string;
  fechaTerminacionContrato?: string;
  sucursalAsociada?: number;
  municipioLabora?: string;
  paisResidencia?: string;
  autorizacionEnvioCorreo?: boolean;
  orientacionSexual?: string;
  factorVulnerabilidad?: string;
  pertenenciaEtnica?: string;
  dirElemento?: string;
  dirTipoVia?: string;
  dirNumero?: string;
  dirLetra?: string;
  dirViaGeneradora?: string;
  dirBarrio?: string;
  tipoIdentificacionTitularCuenta?: string;
  numeroIdentificacionTitularCuenta?: string;
  titularCuenta?: string;
  nombreEntidadBancariaTexto?: string;
}

export interface BeneficiarioGuardarSolicitudInterna {
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  fechaNacimiento: string;
  fechaExpedicionDoc?: string;
  genero?: string;
  direccion?: string;
  parentesco?: string;
  parentescoGenesys?: string;
  personaDiscapacidad?: string;
  direccionCorrespondeTrabajador?: string;
  nuevoBeneficiario?: string;
  nuevoGrupoFamiliar?: string;
  numeroGrupoFamiliar?: number;
  requiereAdjuntoRegistroCivil?: boolean;
  requiereAdjuntoDocumentoSoporte?: boolean;
  revisionBack?: boolean;
  paisResidencia?: string;
  autorizacionEnvioCorreo?: boolean;
  orientacionSexual?: string;
  factorVulnerabilidad?: string;
  pertenenciaEtnica?: string;
  telefono?: string;
  correoElectronico?: string;
  dirElemento?: string;
  dirTipoVia?: string;
  dirNumero?: string;
  dirLetra?: string;
  dirViaGeneradora?: string;
  dirBarrio?: string;
  gradoCursado?: string;
  certificadoEscolar?: string;
  fechaInicioVigenciaCertificadoEscolar?: string;
  fechaFinVigenciaCertificadoEscolar?: string;
  personaInvalidez?: string;
  fechaReporteInvalidez?: string;
  tipoIdentificacionAdministradorSubsidio?: string;
  numeroIdentificacionAdministradorSubsidio?: string;
  nombreCompletoAdministradorSubsidio?: string;
}

export interface AdjuntoGuardarSolicitudInterna {
  idTipoAdjunto: number;
  nombreArchivo: string;
  consecutivoPersona: number;
  rutaArchivo?: string;
  contenidoBase64?: string;
  contentType?: string;
  tamanioBytes?: number;
}

export interface GuardarSolicitudRequestInterna {
  idEmpresa: number;
  trabajador: TrabajadorGuardarSolicitudInterna;
  beneficiarios?: BeneficiarioGuardarSolicitudInterna[];
  adjuntos?: AdjuntoGuardarSolicitudInterna[];
  observaciones?: string | null;
  afiliacionDesdeModuloAfiliacionIndividual?: boolean;
  /** Canal de radicación: Afiliacion web, Mi perfil, Afiliacion interna. */
  origenRadicacion?: string;
  /** Login del gestor PQR que radica (sesión). Obligatorio en afiliación interna. */
  usuarioRadicacionInterno?: string;
}

export interface GuardarSolicitudResponseInterna {
  success?: boolean;
  numeroRadicado?: string;
  idSolicitud?: number;
  mensaje?: string;
  mensajeFinSemanaFestivo?: string;
  error?: string;
  message?: string;
}
