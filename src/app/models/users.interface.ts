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
}
export interface ApplicantAttachments {
  base64file: string;
  source_name: string;
  fileweight: string;
  file?: File;
  preSignedUrl?: string;
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
export interface IsPqrCatalog {
  id: number;
  name: string;
}
export interface FilterRequests {
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
  tipoDocumento: string;
  documento: string;
  nombre: string;
  fechaNacimiento: string;
  estado: string;
  empresa: string;
  tipoTrabajador: string;
  fechaAfiliacion: string;
  fechaIngreso: string;
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
  tipoDocumento: string;
  documento: string;
  digitoVerificacion: string;
  razonSocial: string;
  nombreComercial: string;
  email: string;
  direccion: string;
  telefono: string;
  actividadEconomica: string;
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

