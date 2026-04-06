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

export interface ReasonAccountUpdateList {
  reason_account_update_id?: number;
  reason: string;
  is_active?: number | boolean;
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

export interface EntityList {
  entity_id?: number;
  entity_code: string;
  entity_name: string;
  entity_type_id: number;
  entity_type_name?: string;
  is_active?: number | boolean;
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
