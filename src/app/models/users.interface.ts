export interface UserList {
  user_id: string;
  user_name: string;
  user_email: string;
  role_id: number;
  created_by: string;
  created_date: string;
  is_active: number | boolean;
  is_visible: number | boolean;
  user_name_completed: string;
}

export interface UserListAfiliation {
  user_id: string;
  user_name: string;
  user_email: string;
  is_active: number | boolean;
}
export interface RequestsList {
  request_id: number;
  filing_number: number;
  filing_date: string;
  filing_date_date?: Date;
  filing_time: string;
  request_status: number;
  applicant_type: number;
  request_type: number;
  doc_type: number;
  doc_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_cellphone: string;
  request_description: string;
  request_days: number;
  assigned_user: string;
  request_answer: string;
  data_treatment: boolean;
  applicant_attachments: string[];
  assigned_attachments: string[];
  form_id: number;
  status_name: string;
  user_name_completed: string;
  mensaje_reasignacion: string;
  message_priority: string;
  /** Listados de afiliación: indicadores en Sí bloquean asignación si el API los envía. */
  pendiente_direccion?: string | null;
  pendiente_activar_empresa?: string | null;
  novedad_restrictiva?: string | null;
}

export interface RequestsListAfiliation {
  request_id: number;
  filing_number: string | null;
  filing_date: string; // o Date si lo conviertes en frontend
  doc_trabajador: string;
  name_trabajador: string;
  documents_beneficiarios: string;
  names_beneficiarios: string;
  /** Listados de afiliación: tipo y número de documento (si el backend los envía). */
  type_doc_id_tr?: string | null;
  type_doc_bn_tr?: string | null;
  doc_id_tr?: string | null;
  doc_id_bn?: string | null;
  status_name?: string | null;
  id_empresa: string | number;
  name_empresa: string;
  request_status: number;
  cod_estatus:string;
  assigned_user: string | null;
  user_name_completed: string;
  mensaje_reasignacion: string;
  total_count: number;
  /** Si alguno es "Si", Asignar queda inhabilitado. */
  pendiente_direccion?: string | null;
  pendiente_activar_empresa?: string | null;
  novedad_restrictiva?: string | null;
}

/** Fila con indicadores que bloquean asignación si vienen en «Sí». */
export type AfiliacionIndicadoresFila = {
  pendiente_direccion?: string | null;
  pendiente_activar_empresa?: string | null;
  novedad_restrictiva?: string | null;
};

function normSiAfiliacion(v: string | null | undefined): boolean {
  return (
    (v ?? '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') === 'si'
  );
}

/**
 * Devuelve true si el botón Asignar puede estar activo.
 * Asignar se inhabilita si cualquiera de los tres indicadores es "Si".
 */
export function afiliacionIndicadoresPermitenAsignar(row: AfiliacionIndicadoresFila): boolean {
  return !(
    normSiAfiliacion(row.pendiente_direccion) ||
    normSiAfiliacion(row.pendiente_activar_empresa) ||
    normSiAfiliacion(row.novedad_restrictiva)
  );
}

/** Etiquetas legibles solo de los indicadores que vienen en «Sí» (orden fijo). */
export function afiliacionIndicadoresBloqueantesEtiquetas(row: AfiliacionIndicadoresFila): string[] {
  const out: string[] = [];
  if (normSiAfiliacion(row.pendiente_direccion)) {
    out.push('Pendiente dirección');
  }
  if (normSiAfiliacion(row.pendiente_activar_empresa)) {
    out.push('Pendiente activar empresa');
  }
  if (normSiAfiliacion(row.novedad_restrictiva)) {
    out.push('Novedad restrictiva');
  }
  return out;
}

/** Texto del tooltip cuando Asignar está inhabilitado por indicadores (cabecera / acciones masivas). */
export const MENSAJE_TOOLTIP_ASIGNAR_AFILIACION_INHABILITADA =
  'No puede asignar mientras pendiente dirección, pendiente activar empresa o novedad restrictiva esté en Sí.';

/** Texto de columna: resume qué indicadores están en Sí, o «No». */
export function afiliacionColumnaTextoIndicadoresSi(row: AfiliacionIndicadoresFila): string {
  const labels = afiliacionIndicadoresBloqueantesEtiquetas(row);
  return labels.length === 0 ? 'No' : labels.join(', ');
}

/**
 * Tooltip por fila: solo menciona los indicadores que realmente están en Sí.
 */
export function mensajeTooltipAsignarAfiliacionPorFila(row: AfiliacionIndicadoresFila): string {
  const labels = afiliacionIndicadoresBloqueantesEtiquetas(row);
  if (labels.length === 0) {
    return MENSAJE_TOOLTIP_ASIGNAR_AFILIACION_INHABILITADA;
  }
  const lista =
    labels.length === 1
      ? labels[0]
      : labels.length === 2
        ? `${labels[0]} y ${labels[1]}`
        : `${labels.slice(0, -1).join(', ')} y ${labels[labels.length - 1]}`;
  const verbo = labels.length === 1 ? 'está' : 'están';
  return `No puede asignar mientras ${lista} ${verbo} en Sí.`;
}

export interface NovedadList {
  novedad_id: number;
  solicitud_id: number;
  solicitud_persona_id: number;
  filing_number: string;
  doc_type: string;
  doc_id: string;
  applicant_name: string;
  novedad_status_id: number;
  filing_date: string;
  filing_time: string;
  created_by: string;
  created_date: string;
  updated_by: string;
}


export interface RequestsDetails {
  request_id: number;
  filing_number: number;
  filing_date: string;
  filing_time: string;
  status_name: string;
  request_status?: number;
  applicant_type_name: string;
  applicant_type_id: number;
  request_type_name: string;
  request_type_id: number;
  catalog_item_name: string;
  doc_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_cellphone: string;
  request_description: string;
  request_days: number;
  assigned_user: string;
  request_answer: string;
  data_treatment: boolean;
  applicant_attachments: string[];
  assigned_attachments: string[];
  form_id: number;
  updated_by?: string;
  updated_date?: string;
  user_name_completed?: string;
  mensaje_reasignacion: string;
  messages_closed?: string;
  send_email_massive?: string;
  priority_level: number;
  contact_cellphone: boolean;
  contact_email: boolean;
  answer_date?: string;
  answer_time?: string;
}
export interface RequestAttachmentsList {
  url: string;
  file_name: string;
  file_size: string;
  file_ext: string;
  file_date: string;
}

export interface RequestHistoric {
  request_id: number;
  table_name: string;
  action: string;
  rowid: string;
  updated_by: string;
  updated_date: string;
  updated_time: string;
  old_data: string;
  new_data: string;
  status_name: string;
  assigned_user: string;
  difference: string[];
  user_name_completed: string;
  answer_request: string;
}

/** Fila histórico gestión afiliaciones (respuesta lambda paginada). */
export interface AfiliationSolicitudHistoriaGestionRow {
  log_id?: number;
  fecha?: string | null;
  hora?: string | null;
  tipo_accion?: string | null;
  ejecutado_por?: string | null;
  responsable_asignado?: string | null;
  estado_nombre?: string | null;
  /** Código de estado (lambda puede enviar `estado_code`). */
  estado_code?: string | null;
  estado_codigo?: string | null;
  detalle_observacion?: string | null;
  total_count?: number;
  /** Legacy / otros formatos */
  fecha_hora?: string | null;
  evento?: string | null;
  request_id?: number;
  updated_date?: string | null;
  updated_time?: string | null;
  updated_by?: string | null;
  status_name?: string | null;
  user_name_completed?: string | null;
  answer_request?: string | null;
}

/** Fila histórico gestión de integrantes (trabajador / beneficiarios). */
export interface AfiliationIntegranteHistoriaGestionRow extends AfiliationSolicitudHistoriaGestionRow {
  id_persona?: number | null;
  tipo_persona?: string | null;
  nombre_integrante?: string | null;
  tipo_documento?: string | null;
  numero_documento?: string | null;
}

export interface AssignUserRequest {
  request_id: number;
  filing_number?: number;
  filing_date?: string;
  filing_time?: string;
  request_status?: number;
  applicant_type?: number;
  request_type?: number;
  doc_type?: number;
  doc_id?: string;
  applicant_name?: string;
  applicant_email?: string;
  applicant_cellphone?: string;
  request_description?: string;
  request_days?: number;
  assigned_user?: string;
  request_answer?: string;
  data_treatment?: boolean;
  applicant_attachments?: string[];
  assigned_attachments?: string[];
  form_id?: number;
  user_name_completed?: string;
}

export interface UserCreate {
  user_name: string;
}

export interface ApplicantTypeList {
  applicant_type_id: number;
  applicant_type_name: string;
  applicant_type_description: string;
  is_active: number | boolean;
  created_by: string;
  created_date: string;
  updated_by: string;
  updated_date: string;
}

export interface DocumentTypeList {
  document_type_id: number;
  document_type_code: string;
  document_type_name: string;
  document_type_description: string;
  is_active: number | boolean;
  created_by: string;
  created_date: string;
  updated_by: string;
  updated_date: string;
}

export interface RequestTypeList {
  request_type_id: number;
  is_active: number | boolean;
  request_type_name: string;
  request_type_description: string;
  created_by: string;
  created_date: string;
  updated_by: string;
  updated_date: string;
  form_id?: number;
  request_days?: number;
}
export interface RequestFormList {
  request_status: number;
  applicant_type: number;
  request_type: number;
  doc_type: number;
  doc_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_cellphone: string;
  request_description: string;
  request_days: number;
  assigned_user: string;
  request_answer: string;
  data_treatment: boolean;
  applicant_attachments?: ApplicantAttachments[] | null;
  assigned_attachments?: ApplicantAttachments[] | null;
  form_id?: number;
  count_attacments: number;
}

export interface RequestFormListInternal {
  request_status: number;
  applicant_type: number;
  request_type: number;
  doc_type: number;
  doc_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_cellphone: string;
  request_description: string;
  request_days: number;
  assigned_user: string;
  request_answer: string;
  data_treatment: boolean;
  applicant_attachments?: ApplicantAttachments[] | null;
  assigned_attachments?: ApplicantAttachments[] | null;
  form_id?: number;
  count_attacments: number;
  check_sms: boolean,
  check_correo: boolean
}

export interface answerRequest {
  request_status: number;
  request_answer: string;
  request_id: number;
  assigned_attachments?: ApplicantAttachments[] | null;
  contact_cellphone?: boolean;
  applicant_cellphone?: string;
  contact_email?: boolean;
}
export interface ApplicantAttachments {
  base64file: string;
  source_name: string;
  fileweight: string;
  file?: File;
  preSignedUrl?: string;
  document_type_id?: number | null;
}
export interface AssociationApplicantRequestList {
  applicant_requests_type_id: number;
  applicant_type_name: string;
  applicant_type: number;
  request_type_name: string;
  request_type: number;
  is_active: number | boolean;
}
export interface CreateApplicantType {
  applicant_type_name: string;
  applicant_type_description: string;
}

export interface CreateDocumentType {
  document_type_code: string;
  document_type_name: string;
  document_type_description: string;
}

export interface CreateRequestType {
  request_type_id?: number;
  request_type_name: string;
  request_type_description: string;
}

export interface AssociateApplicantRequest {
  applicant_type_id: number;
  request_type_id: number;
}
export interface ModalityList {
  modality_id: number;
  modality_name: string;
  is_active?: number | boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}
export interface CategoryList {
  category_id: number;
  category_name: string;
  tipology_name: string;
  cause_name: string;
  modality_id?: number;
  modality_name?: string;
  is_active?: number | boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}
export interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

export interface ExportColumn {
  title: string;
  dataKey: string;
}

export interface ApplicantAttach {
  url: string;
  fileName: string;
  fileExt: string;
  fileSize: string;
  fileDate?: string;
}

export interface NotificationList {
  notification_id?: number;
  notification_name: string;
  notification_message: string;
  notification_receiver?: string[];
  notification_receiver_id?: number;
  receiver_type_name?: string;
  action_name?: string;
  action_id?: number;
  is_active?: number | boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}
export interface NotificationActionList {
  action_id: number;
  action_name: string;
  action_description: string;
  is_active: number | boolean;
}
export interface NotificationReceiversList {
  receiver_id: number;
  receiver_name: string;
  is_active: number | boolean;
}
export interface QualityDimensionList {
  quality_dimension_id: number;
  quality_dimension_name: string;
  quality_dimension_description: string;
  is_active: number | boolean;
}
export interface CharacterizationCreate {
  request_id: number;
  applicant_type_id: number;
  request_type_id: number;
  is_pqr: number;
  quality_dimension_id?: number;
  modality_id?: number;
  category_id?: number;
  month?: number;
  is_subsidios: boolean;
}
export interface TipologiesCauses {
  category_name?: string;
  tipology_name?: string;
  cause_name?: string;
  category_id?: number;
  is_active?: number | boolean;
}
export interface DownloadAttach {
  download_url: string;
}

export interface RequestStatusList {
  request_status_id: number;
  status_name: string;
  status_description: string;
  is_active: number;
}
export interface RequestStatusAfiliationList {
  /** Si el API devuelve `id` (mismo valor que `request_status_id` en listados / multiselect). */
  id?: number;
  /** Alias de `id` en BD (parametros_estado_solicitud). */
  request_status_id: number;
  /** Código corto del estado (p. ej. columna `codigo`). */
  status_name: string;
  /** Descripción legible (p. ej. columna `descripcion`). */
  status_description: string;
  is_active: boolean;
  /** Orden de visualización en timeline (`orden` en BD). */
  orden?: number | null;
  /** Si el API devuelve `codigo` aparte de `status_name`. */
  codigo?: string | null;
  /** Si el API devuelve `descripcion` aparte de `status_description`. */
  descripcion?: string | null;
}
export interface NovedadStatusList {
  novedad_status_id: number;
  status_name: string;
}

/** Registro de la tabla parametros_tipo_documento_persona */
export interface ParametroTipoDocumentoPersona {
  id: number;
  tipo_documento: string;
  tipo_documento_genesys?: string;
  digitos_minimos?: number;
  digitos_maximos?: number;
  permite_letras?: boolean;
  cantidad_letras?: number;
  requiere_adjunto?: boolean;
  esta_activo: boolean;
  sinc_fecha?: string;
  sinc_hora?: string;
  sinc_usuario?: string | null;
  sinc_accion?: string;
}

/** Parámetro genérico para catálogos: id + nombre/valor/descripcion + activo */
export interface ParametroCatalogo {
  id: number;
  nombre?: string;
  valor?: string;
  descripcion?: string;
  esta_activo: boolean;
}

/** Retorno tabla/ función estado civil: id, estado_civil, esta_activo */
export interface ParametroEstadoCivil {
  id: number;
  estado_civil: string;
  esta_activo: boolean;
}

/** Retorno tabla/función género: id, genero, esta_activo */
export interface ParametroGenero {
  id: number;
  genero: string;
  esta_activo: boolean;
}

/** Retorno función afiliaciones.obtener_todos_estado_gestion_persona(): id, codigo, descripcion, esta_activo, orden. */
export interface ParametroEstadoGestionPersona {
  id: number;
  codigo: string;
  descripcion: string;
  esta_activo: boolean;
  orden?: number;
}

/** Retorno tabla/función parentesco: id, parentesco, esta_activo */
export interface ParametroParentesco {
  id: number;
  parentesco: string;
  esta_activo: boolean;
}

/** Ítem devuelto por GET adjuntos-por-parentesco (tipos de documento dinámicos). */
export interface AdjuntoTipoPorParentesco {
  id: number;
  nombre_documento: string;
  formatos_permitidos?: string | null;
}

/** Respuesta típica de POST generar-url (pre-signed S3 + fila adjunto ya persistida). */
/** Paso 1 — generar-url: URL de subida S3 y clave del objeto (sin fila definitiva en BD). */
export interface PresignAdjuntoAdicionalData {
  url_presignada?: string;
  s3_key?: string;
  s3Key?: string;
  /** Alias por si el backend usa otros nombres */
  url?: string;
  upload_url?: string;
  presigned_url?: string;
  presignedUrl?: string;
}

/** Motivos de rechazo para gestión de estado de afiliación (parametros_motivo_rechazo_afiliacion o equivalente). */
export interface ParametroMotivoRechazoAfiliacion {
  id: number;
  motivo_rechazo: string;
  esta_activo: boolean;
  /** Código del motivo (respuesta del listado de parámetros). */
  codigo_motivo?: string | null;
}

/** Parametrización CRUD de motivos de rechazo (codigo_motivo, descripcion_motivo, esta_activo). */
export interface AfiMotivoRechazoParamList {
  id?: number;
  codigo_motivo: string;
  descripcion_motivo?: string;
  /** Alias usado por algunos listados/API. */
  motivo_rechazo?: string;
  esta_activo: boolean | number;
}

export interface IsPqrCatalog {
  id: number;
  name: string;
}
export interface FilterRequests {
  i_date: string | null;
  f_date: string | null;
  status_id?: number | number[] | null;
  assigned_user?: string | string[] | null;
  is_pqr?: number | null;
  filing_number?: number | null;
  doc_id?: string | null;
  applicant_name?: string | null;
  request_days?: number | null;
  applicant_type_id?: number | null;
  request_type_id?: number[] | null;
  confa_user?: string | null;
  area_name?: string | null;
  priority_level?: number | null;
  page?: number;
  page_size?: number;
}

export interface FilterRequestsMassive {
  filing_number?: number | null;
  i_date: string | null;
  f_date: string | null;
  doc_id_emp?: string | null;
  status_id?: number | number[] | null;
  /** Filtro por tipo de novedad; cada columna debe coincidir con el valor «Si». */
  tipo_novedad?: FiltroTipoNovedadItem[] | null;
  page?: number;
  page_size?: number;
}

/** Fila del listado de solicitudes de afiliación provenientes de carga masiva. */
export interface RequestsMassiveAfiliationListItem {
  request_id: number;
  filing_number?: string | number | null;
  filing_date?: string;
  filing_date_date?: Date;
  filing_time?: string;
  tipo_doc_trabajador?: string | null;
  doc_trabajador?: string | null;
  name_trabajador?: string | null;
  tipos_doc_beneficiarios?: string | null;
  documents_beneficiarios?: string | null;
  names_beneficiarios?: string | null;
  type_doc_id_tr?: string | null;
  type_doc_bn_tr?: string | null;
  doc_id_tr?: string | null;
  doc_id_bn?: string | null;
  id_empresa?: number | string | null;
  /** Documento tributario / identificación de la empresa (si el API lo envía). */
  doc_empresa?: string | null;
  doc_id_empresa?: string | null;
  name_empresa?: string | null;
  request_status: number;
  cod_estatus?: string | null;
  assigned_user?: string | null;
  user_name_completed?: string | null;
  mensaje_reasignacion?: string | null;
  total_count?: number;
  pendiente_direccion?: string | null;
  pendiente_activar_empresa?: string | null;
  novedad_restrictiva?: string | null;
  id_masiva?: number | null;
  nombre_archivo_masiva?: string | null;
  fecha_carga_masiva?: string | null;
  numero_solicitud_masiva?: string | null;
  /** Respuestas antiguas del mismo endpoint. */
  doc_id?: string | null;
  applicant_name?: string | null;
  status_name?: string | null;
  request_days?: number;
}

/** Indicador de gestión para filtrar listados (p. ej. solo filas con ese campo en «Si»). */
export type AfiliacionFiltroIndicadorGestion =
  | 'novedad_restrictiva'
  | 'pendiente_activar_empresa'
  | 'pendiente_direccion';

/** Valor en BD que debe coincidir al filtrar por tipo de novedad (palabra «Si»). */
export type AfiliacionTipoNovedadValorFiltro = 'Si';

/** Un criterio: columna en BD y valor esperado (p. ej. contiene o igual a «Si»). */
export interface FiltroTipoNovedadItem {
  campo: AfiliacionFiltroIndicadorGestion;
  valor: AfiliacionTipoNovedadValorFiltro;
}

export interface FilterRequestsAfiliation {
  i_date: string | null;
  f_date: string | null;
  /** Radicado: el backend suele compararlo como texto (mismo criterio que búsqueda pendientes). */
  filing_number?: number | string | null;
  doc_id_tr?: string | null;
  doc_id_bn?: string | null;
  applicant_name_emp?: string | null;
  status_id?: number | number[] | null;
  assigned_user?: string | string[] | null;
  /**
   * Filtro por tipo de novedad: cada ítem indica una columna y que en BD debe aplicarse el criterio con el valor «Si».
   */
  tipo_novedad?: FiltroTipoNovedadItem[] | null;
  page?: number;
  page_size?: number;
}
/**
 * Filtros del listado de afiliaciones asignadas al usuario.
 * Mismo contrato que {@link FilterRequestsAfiliation} (alineado con búsqueda pendientes / asignadas).
 */
export type FilterRequestsAfiliationAssigned = FilterRequestsAfiliation;

/** Filtros consulta inconsistencias RPA (solicitudes directas a afiliación RPA sin usuario back). */
export interface FilterRpaAfiInconsistency {
  filing_number?: number | string | null;
  doc_id_tr?: string | null;
  doc_id_bn?: string | null;
  transaccion?: string | null;
  /** Si | No — indica si tiene radicado Genesys. */
  con_radicado_genesys?: 'Si' | 'No' | null;
  page?: number;
  page_size?: number;
}

/** Fila listado inconsistencias RPA. */
export interface RpaAfiInconsistencyListItem {
  request_id: number;
  filing_number: string | null;
  filing_date: string;
  tipo_doc_trabajador?: string | null;
  type_doc_id_tr?: string | null;
  doc_id_tr?: string | null;
  doc_trabajador?: string | null;
  tipo_doc_beneficiario?: string | null;
  tipos_doc_beneficiarios?: string | null;
  doc_id_bn?: string | null;
  documents_beneficiarios?: string | null;
  name_empresa: string;
  status_name?: string | null;
  request_status: number;
  cod_estatus?: string;
  estado_integrante_solicitud?: string | null;
  pantalla_error?: string | null;
  observaciones?: string | null;
  fecha_ejecucion?: string | null;
  hora_inicio_ejecucion?: string | null;
  hora_fin_ejecucion?: string | null;
  transaccion?: string | null;
  assigned_user?: string | null;
  user_name_completed?: string;
  mensaje_reasignacion?: string;
  total_count?: number;
}

/** Payload cambio masivo a Pendiente afiliación RPA. */
export interface BulkChangeRpaStatusPayload {
  request_ids: number[];
  id_estado_solicitud: number;
}
export interface FilterNovedad {
  i_date: string | null;
  f_date: string | null;
  filing_number?: number | null;
  doc_id?: string | null;
  applicant_name?: string | null;
  novedad_status_id?: number | number[] | null;
  page?: number;
  page_size?: number;
}

/** Payload para consultar persona en novedades calidad de datos (backend: tabla gestor.novedad_calidad_datos_detalle o vista asociada). */
export interface ConsultarPersonaNovedadPayload {
  tipo_documento: string;
  numero_documento: string;
}

/** Respuesta de consultar persona (campos planos según API). */
export interface ConsultarPersonaNovedadRespuesta {
  id_persona: number;
  id_solicitud: number;
  numero_radicado: string;
  tipo_documento: string;
  numero_documento: string;
  primer_nombre: string | null;
  segundo_nombre: string | null;
  primer_apellido: string | null;
  segundo_apellido: string | null;
  fecha_expedicion_doc: string | null;
  fecha_nacimiento: string | null;
}

/** Copia de los datos cargados al consultar (solo campos de persona). */
export interface NovedadCalidadDatosOriginalesPayload {
  tipo_documento: string;
  numero_documento: string;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  fecha_expedicion_doc: string | null;
  fecha_nacimiento: string | null;
}

/**
 * Guardar novedad: incluye ids, snapshot original y, por campo,
 * el valor nuevo si cambió o null si no hubo cambio.
 */
export interface GuardarNovedadCalidadDatosPayload {
  id_solicitud: number;
  id_persona: number;
  numero_radicado: string;
  datos_originales: NovedadCalidadDatosOriginalesPayload;
  primer_nombre: string | null;
  segundo_nombre: string | null;
  primer_apellido: string | null;
  segundo_apellido: string | null;
  fecha_expedicion_doc: string | null;
  fecha_nacimiento: string | null;
}
export interface RequestReportList {
  request_id: number;
  filing_number: number;
  filing_date: number;
  filing_time: string;
  status_name: string;
  applicant_type_name: string;
  applicant_type_id: number;
  request_type_name: string;
  request_type_id: number;
  catalog_item_name: string;
  doc_id: number;
  applicant_name: string;
  applicant_email: string;
  applicant_cellphone: string;
  request_description: string;
  request_days: number;
  assigned_user: string;
  request_answer: string;
  data_treatment: boolean | string;
  applicant_attachments: string[];
  assigned_attachments: string[];
  form_id: number;
  updated_by: string;
  updated_date: string;
  is_pqr: number | string;
  reclasification_applicant_type_name: string;
  reclasification_request_type_name: string;
  answer_date: string;
  answer_time: string;
  quality_dimension_name: string;
  modality_id: number;
  modality_name: string;
  category_id: number;
  category_name: string;
  tipology_name: string;
  cause_name: string;
  month: number | string;
}
export interface Pagination {
  request_id?: number;
  page: number;
  page_size: number;
}
export interface PreSignedAttach {
  source_name?: string;
  request_id?: number;
  url?: string;
}

export interface RequestReportDetail {
  type: string;
  total_request: number;
}

export interface GrupoFamiliar {
  documento: string;
  nombre1: string;
  nombre2: string;
  apellido1: string;
  apellido2: string;
  categoria: string;
  edad: string;
}

export interface PersonaACargo {
  nombre?: string;
  documento?: string;
  tipoDoc?: string;
  parentesco?: string;
  edad?: string;
  sexo?: string;
  fechaNacimiento?: string;
}
export interface GruposFamiliaresList {
  documentoTrabajdor?: string;
  tipoDocTrabajdor?: string;
  numGrupo?: string;
  personasACargo: Array<PersonaACargo>;
}
export interface MiPerfilConfa {
  usuarioId: number;
  documento: string;
  grupoFamiliar: Array<GrupoFamiliar>;
  direccion: string;
  categoria: string;
  celular: string;
  correo: string;
  fechaNacimiento: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  existeUsuario: boolean;
  usuarioNasfa: boolean;
  tipoDocumento: string;
  tiempoAfiliacion: string;
  derechoCuotaMonetaria: boolean;
  estado: string;
  clave: string;
  fechaAfiliacion?: string;
  fechaIngresoEmpresa?: string;
  genero?: string;
  textoPdf: string[];
  tipo_afi?: string;
  esDesempleadoParaServicio?: boolean;
  tipoUsuario?: string;
  listadoGruposFamiliares?: Array<GruposFamiliaresList>;
  codigoAfi?: string;
  municipio?: string;
  nit?: string;
  razonSocialempresa?: string;
  vigencia?: string;
}

export interface Afiliado {
  tipoDocumento?: string;
  documento?: string;
  nombre?: string;
  edad?: string;
  fechaNacimiento?: string;
  estado?: string;
  categoria?: string;
  telefono?: string;
  sexo?: string;
  estadoCivil?: string;
  email?: string;
  empresa?: string;
  tipoTrabajador?: string;
  fechaAfiliacion?: string;
  fechaIngreso?: string;
}

/** Persona a cargo del grupo familiar (respuesta consultarInfoGrupoFamiliar) */
export interface Beneficiario {
  nombre?: string;
  documento?: string;
  tipoDoc?: string;
  parentesco?: string;
  edad?: number;
  fechaNacimiento?: string;
  estadoBeneficiario?: string;
  estadoEscolaridad?: string;
  discapacidad?: string;
}

/** Grupo familiar (respuesta consultarInfoGrupoFamiliar: cada elemento del array) */
export interface GrupoFamiliar {
  documentoTrabajdor: string;
  tipoDocTrabajdor: string;
  numGrupo: string | number;
  personasACargo: Beneficiario[];
}

export interface RequestReportStatus {
  date: Date;
  radicadas: number;
  asignadas: number;
  reasignadas: number;
  cerradas: number;
}

export interface RequestReportForStatus {
  status: string;
  total_request: number;
}

export interface RequestReportStatusByAssignedUser {
  user: string;
  asignadas: number;
  cerradas: number;
  reasignadas: number;
}

export interface ErrorAttachLog {
  request_id: number;
  status: string;
  name_archive: string;
  error_message: string;
  error_type: string;
}
export interface RequestAnswerTemp {
  request_id: number;
  mensaje_temp: string;
}

export interface AssociationRequestUserList {
  request_type_id: number;
  request_type_name: string;
  user_id: string;
  user_name_completed: string;
  is_active: number | boolean;
}

export interface AssociateRequestUser {
  request_type_id: number;
  user_id: string;
}

export interface RequestAnswerTemp {
  request_id: number;
  mensaje_temp: string;
}

export interface AssociationRequestUserList {
  request_type_id: number;
  request_type_name: string;
  user_id: string;
  user_name_completed: string;
  is_active: number | boolean;
}

export interface AssociateRequestUser {
  request_type_id: number;
  user_id: string;
}

export interface ProcessRequest {
  operation: string;
  transaction_id: string;
  status: string;
  navigator?: string;
  leng_nav?: string;
  ip?: string;
  resolution?: string;
  platform?: string;
  request_id?: number;
  validation_attachemens?: boolean;
}

export interface UserEnvironment {
  userAgent: string;
  platform: string;
  browserLanguage: string;
  screenResolution: string;
  ipUser: string;
}

export interface PendingRequest {
  request_id: number;
  token: string;
  pending: boolean;
  message: string;
  previus_state?: string;
  user_action?: string;
}

export interface AdditionalDocsRequest {
  request_id: number;
  user_action?: string;
  request_status: number;
}
export interface RequestsReview {
  request_id: number;
  filing_number: number;
  filing_date: string;
  filing_date_date?: Date;
  filing_time: string;
  request_status: number;
  applicant_type: number;
  request_type: number;
  doc_type: number;
  doc_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_cellphone: string;
  request_description: string;
  request_days: number;
  assigned_user: string;
  request_answer: string;
  data_treatment: boolean;
  applicant_attachments: string[];
  assigned_attachments: string[];
  form_id: number;
  status_name: string;
  user_name_completed: string;
  mensaje_revision: string;
}

export interface sendEmail {
  request_id: number;
  email: string[];
}

export interface requestHistoryRequest {
  request_id: number;
}

export interface historyRequest {
  request_id: number;
  user: string;
  fecha: Date;
  commnet: string;
  applicant_attachments: RequestAttachmentsList[];
}

export interface Token {
  token: string;
}

export interface RequestFormListPending {
  token_url: string | null;
  request_id: number;
  request_status: number;
  request_description: string;
  applicant_attachments?: ApplicantAttachments[] | null;
  assigned_attachments?: ApplicantAttachments[] | null;
  count_attacments: number;
}

export interface Empresa {
  codigoGenesys: string;
  documento: string;
  digitoVerificacion: string;
  razonSocial: string;
  nombreComercial: string;
  telefono: string;
  direccion: string;
  email: string;
  estado: string;
  nombreRepLeg: string;
  tipoDocumentoRepLeg: string;
  documentoRepLeg: string;
  actividadEconomica: string;
  numTrabajadores: string;
}

export interface FilterRequestsIntern {
  i_date: string | null;
  f_date: string | null;
  status_id?: number | null;
  assigned_user?: string | null;
  is_pqr?: number | null;
  filing_number?: number | null;
  doc_id?: string | null;
  applicant_name?: string | null;
  request_days?: number | null;
  applicant_type_id?: number | null;
  request_type_id?: number | null;
  confa_user?: string | null;
  area_name?: string | null;
  //is_priority?: boolean | null;
  priority_level?: number | null;
  page?: number;
  page_size?: number;
}

export interface RequestAreaList {
  area_id: number;
  area_prefix: string;
  area_name: string;
}

export interface RequestsListIntern {
  request_id: number;
  filing_number: number;
  filing_date: string;
  filing_date_date?: Date;
  filing_time: string;
  request_status: number;
  applicant_type: number;
  request_type: number;
  doc_type: number;
  doc_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_cellphone: string;
  request_description: string;
  request_days: number;
  assigned_user: string;
  request_answer: string;
  data_treatment: boolean;
  applicant_attachments: string[];
  assigned_attachments: string[];
  form_id: number;
  status_name: string;
  user_name_completed: string;
  mensaje_reasignacion: string;
  isPriority: boolean;
  message_priority: string;
}

export interface IsPriority {
  value: boolean;
  name: string;
}

export interface CompanyUpdateForm {
  businessName: string;      // Razón Social/Nombre
  tradeName: string;         // Nombre Comercial
  documentType: string;      // Tipo Documento
  documentNumber: string;    // Número Documento
  verificationDigit: string; // Dígito de Verificación
  department: string;        // Departamento
  municipality: string;      // Municipio
  address: string;           // Dirección
  landline: string;          // Teléfono Fijo
  mobilePhone: string;       // Teléfono Celular
  email: string;             // Correo Electrónico
  legalRepresentativeDocumentType: string;  // Tipo Documento Representante Legal
  legalRepresentativeDocumentNumber: string; // Número Documento Representante Legal
  legalRepresentativeFirstName: string;      // Primer Nombre Representante Legal
  legalRepresentativeMiddleName?: string;    // Segundo Nombre Representante Legal (Opcional)
  legalRepresentativeLastName: string;       // Primer Apellido Representante Legal
  legalRepresentativeSecondLastName?: string; // Segundo Apellido Representante Legal (Opcional)
  economicActivityCiiuCode: string;         // Código CIIU
  economicActivityCiiuDescription: string;  // Descripción CIIU
}

export interface CompanyUpdateRequest {
  // Información de la empresa
  document_type: string;
  document_number: string;
  verification_digit: string | null;
  business_name: string;
  trade_name: string;
  department: string;
  municipality: string;
  address: string;
  landline: string | null;
  mobile_phone: string;
  alternate_mobile_phone?: string | null;
  email: string;
  alternate_email?: string | null;

  // Información del representante legal
  legal_representative_document_type: string;
  legal_representative_document_number: string;
  legal_representative_first_name: string;
  legal_representative_middle_name?: string | null;
  legal_representative_last_name: string;
  legal_representative_second_last_name?: string | null;

  // Información de la actividad económica
  economic_activity_ciiu_code: string;
  economic_activity_ciiu_description: string;

  // Archivos adjuntos
  legal_representative_document_path: string | null;
  economic_activity_rut_path: string | null;

  // Metadatos de actualización
  created_by: string;
  updated_general_info: boolean;
  updated_legal_representative: boolean;
  updated_economic_activity: boolean;
}

export interface ApplicantAttachmentsCompany {
  base64file: string;
  source_name: string;
  fileweight: string;
  file?: File;
  preSignedUrl?: string;
  type: string;
}

export interface FilterCompanyUpdate {
  filing_number?: number | null;
  i_date?: string | null;
  f_date?: string | null;
  doc_id?: string | null;
  applicant_name?: string | null;
  report_type?: number | null; //
  page?: number;
  page_size?: number;
}

export interface CompanyUpdateRecord {
  company_update_id: number;
  business_name: string;
  trade_name: string;
  document_type: string;
  document_number: string;
  verification_digit: string;
  department: string;
  municipality: string;
  address: string;
  landline: string;
  mobile_phone: string;
  alternate_mobile_phone: string;
  email: string;
  alternate_email: string;
  legal_representative_document_type: string;
  legal_representative_document_number: string;
  legal_representative_first_name: string;
  legal_representative_middle_name: string;
  legal_representative_last_name: string;
  legal_representative_second_last_name: string;
  economic_activity_ciiu_code: string;
  economic_activity_ciiu_description: string;
  updated_general_info: boolean;
  updated_legal_representative: boolean;
  updated_economic_activity: boolean;
  legal_representative_document_path: string;
  economic_activity_rut_path: string;
  created_by: string;
  created_at: string;  // o Date si lo parseas
  updated_by: string;
  updated_at: string;  // o Date si lo parseas
  total_count: number;

  // 👇 Estas son las nuevas propiedades opcionales
  created_at_date?: Date;
  updated_at_date?: Date;

  documentLinks?: { url: string; fileName: string }[];

  management_result?: string | null;
  management_observation?: string | null;
  alreadyManaged?: boolean;
}

export interface SimilarRequest {
  request_id: number;
  applicant_type_id: number;
  request_type_id: number;
  catalog_item_name: string;
  doc_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_cellphone: string;
  applicant_attachments: string[];
}
export interface GenderList {
  id?: number;
  genero: string;
  esta_activo?: boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}
export interface MaritalStatusList {
  id?: number;
  estado_civil: string;
  esta_activo?: boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}
export interface SystemVariableList {
  id?: number;
  nombre_variable: string;
  valor_variable: string;
  descripcion: string;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}
export interface AfiTemplateValidationList {
  id?: number;
  nombre_campo: string;
  tipo_dato: string;
  longitud_maxima: number;
  es_requerido: string;
  descripcion?: string;
  esta_activo?: boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}
export interface AfiliationCompanyList {
  id_empresa?: number;
  tipo_documento?: string;
  numero_documento?: string;
  nombre_comercial?: string;
  razonSocial?: string;
  email?: string;
  direccion?: string;
  telefono?: string;
  representante_legal?: string;
  contacto?: string;
  estado_afiliacion?: string;
  permite_afiliaciones_masivas?: boolean;
  esta_activa?: boolean;
}
export interface PaginationFilter {
  page: number;
  page_size: number;
  search_by?: 'nit' | 'nombre';
  search_text?: string;
}
export interface DocumentTypeCompanyList {
  id?: number;
  tipo_documento?: string;
  tipo_documento_genesys?: string;
  codigo_verificacion?: boolean;
  digitos_minimos?: number;
  digitos_maximos?: number;
  permite_letras?: boolean;
  cantidad_letras?: number;
  esta_activo?: boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}
export interface DocumentTypePersonList {
  id?: number;
  tipo_documento: string;
  tipo_documento_genesys: string;
  digitos_minimos: number;
  digitos_maximos: number;
  permite_letras?: boolean;
  cantidad_letras?: number;
  requiere_adjunto?: boolean;
  esta_activo?: boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}
export interface DepartmentList {
  id?: number;
  id_departamento?: number;
  codigo_departamento: string;
  nombre_departamento: string;
  esta_activo?: boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}
export interface MunicipalityList {
  id?: number;
  id_municipio?: number;
  codigo_municipio: string;
  nombre_municipio: string;
  id_departamento: number;
  nombre_departamento?: number;
  esta_activo?: boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}
export interface AttachmentTypeList {
  id?: number;
  nombre_documento: string;
  formatos_permitidos: string;
  es_requerido?: boolean;
  esta_activo?: boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}
export interface RelationshipList {
  id?: number;
  parentesco: string;
  parentesco_genesys: string;
  adjuntos?: AttachmentTypeList[];//pintar desde el back
  adjuntos_texto?: string; //pintar en la tabla
  adjuntos_ids?: number[]; //para enviar al back
  esta_activo?: boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}
export interface ResponsibleList {
  id?: string;
  nombre_usuario_red: string;
  correo?: string;
  esta_activo?: boolean;
  created_by?: string;
  created_date?: string;
}
export interface AfiNotificationList {
  id?: number;
  nombre_mensaje: string;
  texto_mensaje: string;
  esta_activo?: boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

export interface AfiOccupationList {
  id?: number;
  cargo: string;
  estado: boolean | number;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

/** Motivos por los cuales la afiliación se realiza manualmente. */
export interface AfiMotivoGestionManualList {
  id?: number;
  motivo_gestion: string;
  estado?: boolean | number;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

export interface ReasonAccountUpdateList {
  reason_account_update_id?: number;
  reason: string;
  is_active?: number | boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}


export interface AfiCertificateList {
  id?: number;
  tipo_certificado?: string;
  encabezado?: string;
  textos_fijos?: string;
  clausulas_legales?: string;
  tipo_solicitante?: string;
  texto_justificacion?: string;
  nombre_responsable_firma?: string;
  cargo_responsable_firma?: string;
  firma_mime?: string;
  firma_byte?: string;
  firma_bytes?: string;     
  esta_activo?: boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

export interface AccountTypeList {
  account_type_id: number;
  account_type_name: string;
  is_active?: number | boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

export interface BankList {
  id_entidad?: number;
  nombre_entidad: string;
  tipo_entidad: string;
  codigo_entidad: string;
  orden_visualizacion?: number;
  esta_activa?: boolean;  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

export interface EntityList {
  entity_id?: number;
  entity_code: string;
  entity_name: string;
  entity_type_id: number;
  entity_type_name?: string;
  is_active?: number | boolean;

}
export interface AccountTypeListAfi {
  id_tipo_cuenta?: number;
  nombre_tipo_cuenta: string;
  esta_activo?: boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

export interface EntityTypeList {
  entity_type_id: number;
  entity_type_name: string;
  is_active: number | boolean;
}

export interface EntityAccountTypeList {
  entity_account_type_id: number;
  entity_id: number;
  entity_name?: string;
  account_type_id: number;
  account_type_name?: string;
  min_length: number;
  max_length: number;
  observation: string;
  is_active?: number | boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

export interface AssociateBankAccountList {
  id?: number;
  id_entidad: number;
  nombre_entidad?: string;
  id_tipo_cuenta: number;
  nombre_tipo_cuenta?: string;
  longitud_cuenta: number;
  observacion?: string;
  esta_activo?: boolean;
}


// INTERFACES PARA AFILIACIONES
// Estructura estándar de tu backend
export interface BodyResponse<T> {
  code: number;
  message: string;
  data: T;
  total_count?: number;
}

// --------- NOVEDAD CALIDAD DE DATOS (gestor.novedad_calidad_datos_detalle) ---------
export interface NovedadCalidadDatosDetalle {
  id_novedad: number;
  id_solicitud: number;
  id_solicitud_persona: number;
  numero_radicado: string;
  tipo_documento_genesys: string;
  numero_documento_genesys: string;
  primer_apellido_genesys: string | null;
  segundo_apellido_genesys: string | null;
  primer_nombre_genesys: string | null;
  segundo_nombre_genesys: string | null;
  fecha_expedicion_genesys: string | null;
  fecha_nacimiento_genesys: string | null;
  tipo_documento_reg: string | null;
  numero_documento_reg: string | null;
  primer_apellido_reg: string | null;
  segundo_apellido_reg: string | null;
  primer_nombre_reg: string | null;
  segundo_nombre_reg: string | null;
  fecha_expedicion_reg: string | null;
  fecha_nacimiento_reg: string | null;
  primer_apellido_novedad: string | null;
  segundo_apellido_novedad: string | null;
  primer_nombre_novedad: string | null;
  segundo_nombre_novedad: string | null;
  fecha_expedicion_novedad: string | null;
  fecha_nacimiento_novedad: string | null;
  estado: number;
  fecha_hora_registro: string;
  usuario_registro: string;
  fecha_hora_procesado: string | null;
  usuario_proceso: string | null;
}

/** Novedad de calidad por integrante; `diferencias` indica qué campos comparar (llaves `*_novedad`). */
export type NovedadCalidadDatosIntegrante = Partial<NovedadCalidadDatosDetalle> & {
  id_estado?: number;
  diferencias?: Record<string, unknown>;
};

export interface IntegranteNovedades {
  calidad_datos?: NovedadCalidadDatosIntegrante[] | null;
}

// --------- RESPUESTA data ---------
export interface AfiliacionRequestDetailsData {
  solicitud: Solicitud;
  empresa: EmpresaAfiliacion;
  trabajador: TrabajadorBundle;
  beneficiarios: BeneficiarioBundle[];
}

// --------- TIPOS INTERNOS (según tu JSON) ---------
export interface Solicitud {
  id: number;
  id_empresa: number;
  numero_fila: number | null;
  transaccion: string;
  observaciones: string | null;
  fecha_creacion: string;
  estado_codigo: string;
  excluido_masiva: boolean;
  fecha_solicitud: string;
  numero_radicado: string;
  usuario_gestion: string | null;
  fecha_radicacion: string;
  fecha_modificacion: string | null;
  id_estado_solicitud: number;
  id_solicitud_masiva: number | null;
  id_usuario_creacion: number;
  usuario_modificacion: string | null;
  id_usuario_radicacion: number;
  motivo_excluido_masiva: string | null;
  fecha_asignacion_gestion: string | null;
  fecha_recepcion_documentos: string | null;
  /** Si alguno es "Si", Asignar queda inhabilitado en detalle. */
  pendiente_direccion?: string | null;
  pendiente_activar_empresa?: string | null;
  novedad_restrictiva?: string | null;
  /** PDF expediente unificado ya generado; incluye rutas para previsualizar/descargar. */
  expediente?: ExpedienteUnificadoSolicitud | null;
}

/** Metadatos del expediente unificado devueltos en getRequestDetails (solicitud.expediente). */
export interface ExpedienteUnificadoSolicitud {
  nombre_archivo: string;
  ruta_archivo: string;
  content_type?: string | null;
}

/**
 * Resultado de `afiliaciones.validar_requisitos_gestion_persona(persona_id_)` vía API.
 * `errores` puede venir como arreglo de strings o JSON parseable.
 */
export interface ValidarRequisitosGestionPersonaData {
  es_valido: boolean;
  mensaje_general?: string | null;
  errores?: unknown;
}

/**
 * Actualizar estado desde el modal "Gestionar estado de afiliado".
 * Requisitos por persona ya validados antes de abrir el modal (`validarRequisitosGestionPersona`).
 */
export interface ActualizarEstadoGestionAfiliacionPayload {
  id_solicitud: number;
  /** Registro en afiliacion_solicitud_persona (persona.id del detalle). */
  persona_id: number;
  /** PK `parametros_estado_gestion_persona.id`. */
  id_estado_gestion_persona: number;
  /** Alias legacy; mismo valor que id_estado_gestion_persona. */
  id_estado_solicitud?: number;
  /** Código legible del estado (informativo). */
  estado_afiliado?: string;
  /** Obligatorio solo cuando el estado es Rechazado; null en los demás. */
  id_motivo_rechazo?: number | null;
}

/** Empresa en contexto de solicitud de afiliación (modelo BD). */
export interface EmpresaAfiliacion {
  contacto: string;
  telefono: string;
  direccion: string;
  sinc_hora: string;
  id_empresa: number;
  sinc_fecha: string;
  esta_activa: boolean;
  sinc_accion: string;
  razon_social: string;
  sinc_usuario: string | null;
  fecha_creacion: string;
  tipo_documento: string;
  nombre_comercial: string;
  numero_documento: string;
  estado_afiliacion: string | null;
  correo_electronico: string;
  fecha_actualizacion: string;
  representante_legal: string;
  motivo_desafiliacion: string | null;
  permite_afiliaciones_masivas: boolean;
}

export interface Persona {
  id: number;
  genero: string | null;
  direccion: string | null;
  consecutivo: number;
  id_solicitud: number;
  tipo_persona: 'PRINCIPAL' | 'BENEFICIARIO' | string;
  primer_nombre: string;
  segundo_nombre: string | null;
  tipo_documento: string;
  primer_apellido: string;
  fecha_nacimiento: string | null;
  numero_documento: string;
  segundo_apellido: string | null;
  fecha_modificacion: string | null;
  id_usuario_creacion: number;
  fecha_expedicion_doc: string | null;
  usuario_modificacion: string | null;
  fecha_creacion: string;
  /** Estado de gestión del integrante (parametros_estado_gestion_persona.id). */
  id_estado_gestion_persona?: number | null;
}

export interface Adjunto {
  id: number;
  id_persona: number;
  consecutivo: number;
  fecha_carga: string;
  content_type: string;
  ruta_archivo: string;
  tamanio_bytes: number;
  usuario_carga: string;
  nombre_archivo: string;
  id_tipo_adjunto: number;
  /** Nombre legible del tipo de adjunto (parametros_tipo_adjunto.nombre_documento). */
  nombre_tipo_adjunto?: string | null;
  /** Código del tipo de adjunto (parametros_tipo_adjunto.codigo). */
  codigo_tipo_adjunto?: string | null;
  fecha_modificacion: string | null;
  usuario_modificacion: string | null;
  /** Estado de validación del adjunto: PENDIENTE | Validado (si/no/no_aplica). */
  estado_validacion?: string | null;
  /** Observación cuando la valoración es No. */
  observacion_validacion?: string | null;
}

export interface TrabajadorInfo {
  zona: string | null;
  telefono: string | null;
  id_persona: number;
  llave_breb: string | null;
  medio_pago: string | null;
  tipo_cuenta: string | null;
  estado_civil: string | null;
  id_municipio: number | null;
  numero_cuenta: string | null;
  fecha_creacion: string;
  id_departamento: number | null;
  salario_mensual: number | null;
  correo_electronico: string | null;
  fecha_modificacion: string | null;
  horas_laboradas_mes: number | null;
  id_entidad_bancaria: number | null;
  id_usuario_creacion: number;
  usuario_modificacion: string | null;
  fecha_ingreso_empresa: string | null;
  requiere_permiso_laboral: boolean;
}

export interface BeneficiarioInfo {
  id_persona: number;
  parentesco: string | null;
  observaciones: string | null;
  revision_back: string | null;
  conyuge_labora: string | null;
  fecha_creacion: string;
  nivel_educativo: string | null;
  fecha_modificacion: string | null;
  nuevo_beneficiario: string | null;
  parentesco_genesys: string | null;
  id_usuario_creacion: number;
  nuevo_grupo_familiar: string | null;
  persona_discapacidad: string | null;
  usuario_modificacion: string | null;
  numero_grupo_familiar: number | null;
  valor_salario_mensual: number | null;
  requiere_adjunto_registro_civil: string | null;
  direccion_corresponde_trabajador: string | null;
  requiere_adjunto_documento_soporte: string | null;
  fecha_inicio_invalidez?: string | null;
  fecha_reporte_invalidez?: string | null;
  tipo_identificacion_administrador_subsidio?: string | null;
  numero_identificacion_administrador_subsidio?: string | null;
  nombre_completo_administrador_subsidio?: string | null;
  fecha_nacimiento_administrador_subsidio?: string | null;
  novedades?: IntegranteNovedades | null;
}

export interface TrabajadorBundle {
  persona: Persona;
  adjuntos: Adjunto[];
  trabajador: TrabajadorInfo;
  novedades?: IntegranteNovedades | null;
}

export interface BeneficiarioBundle {
  persona: Persona;
  adjuntos: Adjunto[];
  beneficiario: BeneficiarioInfo;
  /** Si el backend envía novedades a nivel de bundle en lugar de dentro de `beneficiario`. */
  novedades?: IntegranteNovedades | null;
}

/** Registro de afiliaciones.padres_biologicos para un beneficiario Hijo. */
export interface PadreBiologicoRecord {
  id: number;
  id_solicitud: number;
  id_solicitud_persona: number;
  tipo_documento: string;
  numero_documento: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  es_madre_o_padre: 'madre' | 'padre';
  pendiente_completar: 'Si' | 'No' | 'No aplica';
  estado_rpa_padres: string;
  radicado_otro_padre: string | null;
}

/** Payload para agregar (id null/omitido) o completar (id presente) un padre/madre biológico. */
export interface GuardarPadreBiologicoPayload {
  idSolicitudPersona: number;
  esMadreOPadre: 'padre' | 'madre';
  id?: number | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  primerNombre?: string | null;
  segundoNombre?: string | null;
  primerApellido?: string | null;
  segundoApellido?: string | null;
}

/** Payload para cambiar estado_rpa_padres cuando está en "No procesado". */
export interface CambiarEstadoRpaPadreBiologicoPayload {
  id: number;
  estadoRpaPadres: 'Pendiente' | 'Procesado';
  radicadoOtroPadre?: string | null;
}

/** Fila del menú "Beneficiarios con padres RPA No procesado" (una fila = un registro padre o madre). */
export interface PadreRpaNoProcesadoListItem {
  id_padre_biologico: number;
  id_solicitud: number;
  id_solicitud_persona: number;
  numero_radicado_solicitud: string;
  fecha_solicitud: string;
  tipo_documento_beneficiario: string;
  numero_documento_beneficiario: string;
  tipo_documento_trabajador: string;
  numero_documento_trabajador: string;
  es_madre_o_padre: 'madre' | 'padre';
  tipo_documento: string;
  numero_documento: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  observaciones_rpa_padres: string | null;
  pantalla_error: string | null;
  radicado_otro_padre: string | null;
  usuario_asignado: string | null;
  cantidad_padres_pendientes: number;
  total_count: number;
}

export interface FilterPadresRpaNoProcesado {
  tipoDocumentoBeneficiario?: string | null;
  numeroDocumentoBeneficiario?: string | null;
  tipoDocumentoTrabajador?: string | null;
  numeroDocumentoTrabajador?: string | null;
  page: number;
  pageSize: number;
}

export interface AsignarPadresRpaPayload {
  idsSolicitudPersona: number[];
  usuarioAsignado: string;
}

export interface CambiarEstadoMasivoPadresRpaPayload {
  idsSolicitud: number[];
  /** Cualquier código activo de afiliaciones.parametros_estado_gestion_persona; el backend solo acepta Pendiente/Procesado. */
  estadoRpaPadres: string;
  observaciones?: string | null;
  radicadoOtroPadre?: string | null;
}

/** Valores válidos en BD: SI, NO, NA, PENDIENTE */
export type ValoracionAdjunto = 'SI' | 'NO' | 'NA';
export interface AdjuntoConValoracion {
  adjunto: Adjunto;
  valoracion: ValoracionAdjunto | '';
  descripcion: string;
}

export interface PaymentMethodRequestList {
  request_id: number;
  filing_number: string;
  worker_document_type: string;
  worker_document_number: string;
  worker_full_name: string;
  admin_document_type: string;
  admin_document_number: string;
  admin_full_name: string;
  previous_payment_method: string;
  new_payment_method: string;
  request_datetime: string;
  payment_method_status_id: number;
  payment_method_status_name: string;
  internal_management: string;
  internal_management_user: string;
  payment_method_process_status_id: number;
  payment_method_process_status_name: string;
  transfer_process_status_id: number;
  transfer_process_status_name: string;
}

export interface PaymentMethodRequestDetails {
  request_id: number;
  filing_number: string;
  worker_document_type: string;
  worker_document_number: string;
  worker_full_name: string;
  admin_document_type: string;
  admin_document_number: string;
  admin_full_name: string;
  previous_payment_method: string;
  new_payment_method: string;
  change_reason: string;
  bank_code: string;
  bank_name: string;
  account_type: string;
  account_number: string;
  key_value: string;
  previous_bank_name: string;
  previous_bank_code: string;
  previous_account_type: string;
  previous_account_number: string;
  request_datetime: string;
  payment_method_status_id: number;
  payment_method_status_name: string;
  payment_method_process_status_id: number;
  payment_method_process_status_name: string;
  transfer_process_status_id: number;
  transfer_process_status_name: string;
  internal_management: boolean;
  payment_method_update_datetime: string;
  transfer_update_datetime: string;
  payment_method_update_user: string;
  transfer_update_user: string;
  internal_management_user: string;
  processed_datetime: string;
  user_observation: string;
  account_validation_status: string;
  request_days: number;
  transfer_status_id: number;
  transfer_status_name: string;
  attachment: string;
}

export interface FilterPaymentMethodRequests {
  i_date: string | null;
  f_date: string | null;
  filing_number?: string | null;
  worker_document_number?: string | null;
  status_id?: number | number[] | null;
  payment_method_status_id?: number | number[] | null;
  transfer_process_status_id?: number | number[] | null;
  page?: number;
  page_size?: number;
}

export interface RequestPaymentMethodStatusList {
  payment_method_status_id: number;
  payment_method_status_name: string;
  is_active: number;
}

export interface PaymentMethodRequestsInManagementByUser {
  request_id: number;
  filing_number: string;
  internal_management_user: string;
}

export interface PaymentMethodProcessStatusList {
  payment_method_process_status_id: number;
  payment_method_process_status_name: string;
  is_active: number;
}

export interface TransferProcessStatusList {
  transfer_process_status_id: number;
  transfer_process_status_name: string;
  is_active: number;
}

export interface AssignManagementUser {
  request_id: number;
  internal_management: boolean;
  internal_management_user: string;
}

export interface AnswerPaymentMethodRequest {
  request_id: number;
  payment_method_status_id: number;
  payment_method_process_status_id: number;
  transfer_process_status_id: number;
  observations: string;
  internal_management_user: string;  
  transfer_status_id: number;
}

export interface RequestHistoricPaymentMethodRequest {
  request_id: number;
  request_datetime: string;
  payment_method_status_id: number;
  payment_method_status_name: string;
  payment_method_process_status_id: number;
  payment_method_process_status_name: string;
  transfer_process_status_id: number;
  transfer_process_status_name: string;
  payment_method_update_datetime: string;
  transfer_update_datetime: string;
  processed_datetime: string;
  payment_method_update_user: string;
  transfer_update_user: string;
}

export interface TransferStatusList {
  transfer_status_id: number;
  transfer_status_name: string;
  is_active: number;
}

/** Consulta gestión activación empresa PQR (`estado_gestion`: POR_GESTIONAR | GESTIONADO). */
export type ActivacionEmpresaEstadoGestion = 'POR_GESTIONAR' | 'GESTIONADO';

export interface ConsultarActivacionEmpresaPayload {
  estado_gestion: ActivacionEmpresaEstadoGestion;
  tipo_documento_empresa?: string;
  numero_documento_empresa?: string;
  page?: number;
  page_size?: number;
}

export interface ActivacionEmpresaConsultaFila {
  total_count?: number;
  id_empresa: number;
  tipo_documento?: string | null;
  numero_documento?: string | null;
  razon_social?: string | null;
  pendiente_activar_empresa?: string | null;
  puede_gestionar?: boolean | null;
  cantidad_solicitudes?: number | null;
  fecha_solicitud_mas_antigua?: string | null;
  id_gestion_empresa?: number | null;
  numero_radicado?: string | null;
  observaciones?: string | null;
  sinc_fecha?: string | null;
  sinc_hora?: string | null;
  sinc_usuario?: string | null;
}

export interface ActivacionEmpresaGestionPayload {
  id_empresa: number;
  numero_radicado: string;
  observaciones?: string | null;
}

export interface ActivacionEmpresaGestionResultado {
  id_gestion_empresa?: number;
  id_empresa?: number;
  cantidad_solicitudes?: number;
  ids_solicitudes?: number[];
}
