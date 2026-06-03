import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment, parameters } from '../../environments/environment';
import { switchMap } from 'rxjs/operators';
import {
  BodyResponse,
  ZionResponse,
  BodyResponseUp,
} from '../models/shared/body-response.inteface';
import { EndPointRoute } from '../enums/routes.enum';
import { map, catchError } from 'rxjs/operators';
import { of, Observable, throwError } from 'rxjs';
import { from } from 'rxjs';
import {
  ApplicantTypeList,
  AssignUserRequest,
  AssociateApplicantRequest,
  AssociationApplicantRequestList,
  CategoryList,
  CreateApplicantType,
  CreateRequestType,
  ModalityList,
  RequestHistoric,
  RequestFormList,
  RequestTypeList,
  RequestsDetails,
  RequestsList,
  UserCreate,
  UserList,
  NotificationList,
  NotificationActionList,
  NotificationReceiversList,
  QualityDimensionList,
  CharacterizationCreate,
  answerRequest,
  TipologiesCauses,
  DownloadAttach,
  RequestStatusList,
  FilterRequests,
  RequestReportList,
  ApplicantAttachments,
  Pagination,
  RequestAttachmentsList,
  PreSignedAttach,
  RequestReportDetail,
  RequestReportStatus,
  RequestReportForStatus,
  RequestReportStatusByAssignedUser,
  ErrorAttachLog,
  RequestAnswerTemp,
  AssociationRequestUserList,
  AssociateRequestUser,
  ProcessRequest,
  PendingRequest,
  RequestsReview,
  sendEmail,
  requestHistoryRequest,
  historyRequest,
  Token,
  RequestFormListPending,
  RequestFormListInternal,
  RequestAreaList,
  FilterRequestsIntern,
  RequestsListIntern,
  CompanyUpdateRequest,
  FilterCompanyUpdate,
  CompanyUpdateRecord,
  SimilarRequest,
  FilterRequestsAfiliation,
  RequestsListAfiliation,
  AfiliacionRequestDetailsData,
  RequestStatusAfiliationList,
  UserListAfiliation,
  NovedadCalidadDatosDetalle,
  ConsultarPersonaNovedadPayload,
  ConsultarPersonaNovedadRespuesta,
  GuardarNovedadCalidadDatosPayload,
  FilterNovedad,
  NovedadList,
  NovedadStatusList,
  ParametroTipoDocumentoPersona,
  ParametroEstadoCivil,
  ParametroGenero,
  ParametroParentesco,
  ParametroMotivoRechazoAfiliacion,
  Adjunto,
  AdjuntoTipoPorParentesco,
  PresignAdjuntoAdicionalData,
  ActualizarEstadoGestionAfiliacionPayload,
  FilterRequestsMassive,
  RequestsMassiveAfiliationListItem,
  ValidarRequisitosGestionPersonaData,
  GenderList,
  MaritalStatusList,
  SystemVariableList,
  AfiTemplateValidationList,
  AfiliationCompanyList,
  DocumentTypeCompanyList,
  DocumentTypePersonList,
  DepartmentList,
  MunicipalityList,
  AttachmentTypeList,
  RelationshipList,
  ResponsibleList,
  AfiNotificationList,
  AfiCertificateList,
  BankList,
  AccountTypeListAfi,
  AssociateBankAccountList,
  AfiOccupationList,
  AfiMotivoRechazoParamList,
} from '../models/users.interface';
import { MD5 } from 'crypto-js';
@Injectable({
  providedIn: 'root',
})
export class Users {
  private apiUrl = 'https://api-utilitarios.confa.co/IA/analizartextoclasificar'; // URL del web service
  private apiKey = 'AIabZtSVgS2nIVD03HQxY1cM6qLmRS8B3zHlw3qo'; // La API key que te dieron
  private apiUrlAdjuntos = 'https://api-utilitarios.confa.co/IA/analizartextov2';
  private apiUrlIngresoConfa = 'https://app.confa.co:8687/ingresoConfaWSSGC/rest/confa/metodo26';
  private apiUrlCorreccionIA =
    'https://zj761286ik.execute-api.us-east-1.amazonaws.com/PD/IA/analizarTextoOrtogRedac';

  constructor(private http: HttpClient) {}

  getUsersList() {
    return this.http.get<BodyResponse<UserList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.USERS_LIST}`
    );
  }
  getUsersListAfiliaciones() {
    return this.http.get<BodyResponse<UserList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.USERS_LIST_AFILIACIONES}`
    );
  }
  getUsersListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<UserList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.USER_LIST_PAGINATION}`,
      payload
    );
  }
  getRequestListByAssignedUser(assigned_user: string, payload: FilterRequests) {
    return this.http.post<BodyResponse<RequestsList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.ALL_REQUESTS_BY_ASSIGNED_USER}/${assigned_user}`,
      payload
    );
  }
  getRequestListByAssignedUserAfiliation(assigned_user: string, payload: FilterRequestsAfiliation) {
    return this.http.post<BodyResponse<RequestsListAfiliation[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.ALL_REQUESTS_BY_ASSIGNED_USER_AFILIATION}/${assigned_user}`,
      payload
    );
  }
  getRequestDetails(payload: number) {
    return this.http.get<BodyResponse<RequestsDetails>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_DETAILS}/${payload}`
    );
  }
  getRequestDetailsAfiliation(payload: number) {
    return this.http.get<BodyResponse<AfiliacionRequestDetailsData>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_DETAILS_AFILIATION}/${payload}`
    );
  }

  /** Actualiza datos de la persona trabajador en solicitud de afiliación (CE/PPT) y/o estado civil (alerta Soltero/Cónyuge). */
  updatePersonaTrabajadorSolicitud(payload: {
    id_persona: number;
    id_solicitud: number;
    tipo_documento: string;
    numero_documento: string;
    primer_apellido: string;
    segundo_apellido: string | null;
    primer_nombre: string;
    segundo_nombre: string | null;
    fecha_expedicion_doc: string | null;
    fecha_nacimiento: string | null;
    genero: string | null;
    estado_civil?: string | null;
  }) {
    return this.http.put<BodyResponse<unknown>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_AFILIATION_UPDATE_PERSONA}`,
      payload
    );
  }

  /** Actualiza datos de la persona beneficiario (CE/PPT): persona + parentesco + dirección. */
  updatePersonaBeneficiarioSolicitud(payload: {
    id_persona: number;
    id_solicitud?: number;
    tipo_documento: string;
    numero_documento: string;
    primer_apellido: string;
    segundo_apellido: string | null;
    primer_nombre: string;
    segundo_nombre: string | null;
    fecha_expedicion_doc?: string | null;
    fecha_nacimiento: string | null;
    genero: string | null;
    parentesco?: string | null;
    direccion_corresponde_trabajador?: string | null;
    direccion?: string | null;
    nuevo_beneficiario?: string | null;
    nuevo_grupo_familiar?: string | null;
    numero_grupo_familiar?: number | null;
    fecha_inicio_invalidez?: string | null;
    fecha_reporte_invalidez?: string | null;
    tipo_identificacion_administrador_subsidio?: string | null;
    numero_identificacion_administrador_subsidio?: string | null;
    nombre_completo_administrador_subsidio?: string | null;
    fecha_nacimiento_administrador_subsidio?: string | null;
  }) {
    return this.http.put<BodyResponse<unknown>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_AFILIATION_UPDATE_PERSONA}`,
      payload
    );
  }

  /** Valida un adjunto de solicitud de afiliación (actualiza estado_validacion, observacion_validacion, usuario que validó en afiliacion_solicitud_adjunto). */
  validarAdjuntoAfiliacion(payload: {
    id: number;
    id_persona: number;
    estado_validacion: string;
    observacion_validacion?: string | null;
  }) {
    return this.http.put<BodyResponse<unknown>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_AFILIATION_VALIDAR_ADJUNTO}`,
      payload
    );
  }

  /** Sube uno o más adjuntos adicionales para una persona (trabajador o beneficiario) en solicitud de afiliación. FormData: id_solicitud, id_persona, archivos (file[]). */
  uploadAdjuntosAfiliacion(formData: FormData) {
    return this.http.post<BodyResponse<Adjunto[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_AFILIATION_UPLOAD_ADJUNTO}`,
      formData
    );
  }

  /**
   * URL firmada de lectura (Lambda dual).
   * Body: { ruta_archivo, nombre_descarga? } — sin nombre_descarga → inline; con nombre_descarga → attachment.
   */
  getAdjuntoAfiliacionUrl(ruta_archivo: string, nombre_descarga?: string | null) {
    const body: { ruta_archivo: string; nombre_descarga?: string } = { ruta_archivo };
    const nd = nombre_descarga != null ? String(nombre_descarga).trim() : '';
    if (nd !== '') {
      body.nombre_descarga = nd;
    }
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_AFILIATION_ADJUNTO_URL}`,
      body
    );
  }

  /** Genera o regenera el expediente (PDF unificado). Body: { id_solicitud }. */
  generarExpedienteAfiliacion(id_solicitud: number) {
    return this.http.post<BodyResponse<Adjunto>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_AFILIATION_GENERAR_EXPEDIENTE}`,
      { id_solicitud }
    );
  }

  /** Actualiza el estado de gestión de la solicitud de afiliación (modal Gestionar estado). */
  actualizarEstadoGestionSolicitudAfiliacion(payload: ActualizarEstadoGestionAfiliacionPayload) {
    return this.http.put<BodyResponse<unknown>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_AFILIATION_ACTUALIZAR_ESTADO_GESTION}`,
      payload
    );
  }

  /** Valida requisitos de gestión por persona antes de abrir el modal «Gestionar estado». */
  validarRequisitosGestionPersona(personaId: number) {
    return this.http.post<BodyResponse<ValidarRequisitosGestionPersonaData>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_AFILIATION_VALIDAR_REQUISITOS_GESTION_PERSONA}`,
      { persona_id: personaId }
    );
  }

  /** Obtiene el detalle de una novedad de calidad de datos por id_novedad. */
  getNovedadCalidadDatosDetalleById(idNovedad: number) {
    return this.http.get<BodyResponse<NovedadCalidadDatosDetalle>>(
      `${environment.API_PUBLIC}${EndPointRoute.NOVEDAD_CALIDAD_DATOS_DETALLE}/${idNovedad}`
    );
  }

  /**
   * Consulta información de persona asociada a novedades de calidad de datos (por documento).
   * Sustituye la consulta al WS de subsidios; el backend debe exponer la ruta en API_PUBLIC.
   */
  consultarPersonaNovedadCalidadDatos(payload: ConsultarPersonaNovedadPayload) {
    return this.http.post<
      BodyResponse<ConsultarPersonaNovedadRespuesta | ConsultarPersonaNovedadRespuesta[] | null>
    >(`${environment.API_PUBLIC}${EndPointRoute.NOVEDAD_CALIDAD_DATOS_CONSULTAR_PERSONA}`, payload);
  }

  guardarNovedadCalidadDatos(payload: GuardarNovedadCalidadDatosPayload) {
    return this.http.post<BodyResponse<unknown>>(
      `${environment.API_PUBLIC}${EndPointRoute.NOVEDAD_CALIDAD_DATOS_GUARDAR}`,
      payload
    );
  }

  getRequestHistoric(payload: Pagination) {
    return this.http.post<BodyResponse<RequestHistoric[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_HISTORIC}`,
      payload
    );
  }
  /**
   * Lambda → PL `afiliaciones.obtener_solicitud_historia_pagination` (page, page_size).
   * `BodyResponse.total_count` opcional; por defecto filas `RequestHistoric[]` (otros módulos).
   */
  getRequestHistoricAfiliation<T = RequestHistoric[]>(payload: Pagination) {
    return this.http.post<BodyResponse<T>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_HISTORIC_AFILIATION}`,
      payload
    );
  }
  getRequestAttachments(payload: Pagination, attachment_owner: string) {
    return this.http.post<BodyResponse<RequestAttachmentsList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_ATTACHMENTS_LIST}/${attachment_owner}`,
      payload
    );
  }
  assignUserToRequest(payload: AssignUserRequest) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.ASSIGN_USER_TO_REQUEST}`,
      payload
    );
  }
  assignUserToRequestAfiliation(payload: RequestsListAfiliation) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.ASSIGN_USER_TO_REQUEST_AFILIATION}`,
      payload
    );
  }
  createUser(payload: UserCreate) {
    return this.http.post<BodyResponse<ZionResponse>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_USER}`,
      payload
    );
  }

  inactivateUser(payload: UserList) {
    return this.http.post<BodyResponse<UserList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_USER}`,
      payload
    );
  }

  invisibleUser(payload: UserList) {
    return this.http.post<BodyResponse<UserList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.INVISIBLE_USER}`,
      payload
    );
  }

  getApplicantTypesList() {
    return this.http.get<BodyResponse<ApplicantTypeList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.APPLICANT_TYPE_LIST}`
    );
  }
  getApplicantTypesListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<ApplicantTypeList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.APPLICANT_TYPE_LIST_PAGINATION}`,
      payload
    );
  }
  inactivateApplicant(payload: ApplicantTypeList) {
    return this.http.post<BodyResponse<ApplicantTypeList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_APPLICANT}`,
      payload
    );
  }
  createApplicantType(payload: CreateApplicantType) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_APPLICANT_TYPE}`,
      payload
    );
  }
  modifyApplicantType(payload: CreateApplicantType) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.MODIFY_APPLICANT_TYPE}`,
      payload
    );
  }

  getRequestTypesList() {
    return this.http.get<BodyResponse<RequestTypeList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_TYPE_LIST}`
    );
  }
  getRequestTypesListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<RequestTypeList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_TYPE_LIST_PAGINATION}`,
      payload
    );
  }
  inactivateRequest(payload: RequestTypeList) {
    return this.http.post<BodyResponse<RequestTypeList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_REQUEST}`,
      payload
    );
  }
  createRequestType(payload: CreateRequestType) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_REQUEST_TYPE}`,
      payload
    );
  }
  modifyRequestType(payload: CreateRequestType) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.MODIFY_REQUEST_TYPE}`,
      payload
    );
  }
  getApplicantTypeRequestsAssociation(payload: Pagination) {
    return this.http.post<BodyResponse<AssociationApplicantRequestList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.APPLICANTYPE_REQUESTYPE}`,
      payload
    );
  }
  inactivateAssociationApplicantRequest(payload: AssociationApplicantRequestList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVE_ASSOCIATE_REQUEST_APPLICANT}`,
      payload
    );
  }
  createAssociationApplicantRequest(payload: AssociateApplicantRequest) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.ASSOCIATE_REQUEST_APPLICANT}`,
      payload
    );
  }
  getModalityList() {
    return this.http.get<BodyResponse<ModalityList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.MODALITY_LIST}`
    );
  }
  getModalityListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<ModalityList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.MODALITY_LIST_PAGINATION}`,
      payload
    );
  }
  createModality(payload: ModalityList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_MODALITY}`,
      payload
    );
  }
  modifyModality(payload: ModalityList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_MODALITY}`,
      payload
    );
  }
  inactivateModality(payload: ModalityList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_MODALITY}`,
      payload
    );
  }
  getCategoryList() {
    return this.http.get<BodyResponse<CategoryList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.CATEGORY_LIST}`
    );
  }
  getCategoryListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<CategoryList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.CATEGORY_LIST_PAGINATION}`,
      payload
    );
  }
  createCategory(payload: CategoryList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_CATEGORY}`,
      payload
    );
  }

  modifyCategory(payload: CategoryList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_CATEGORY}`,
      payload
    );
  }
  inactivateCategory(payload: CategoryList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_CATEGORY}`,
      payload
    );
  }
  getCategoryListByModality(modality_id: number) {
    return this.http.get<BodyResponse<CategoryList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.CATEGORIES_BY_MODALITY}/${modality_id}`
    );
  }
  getTipologiesListByCategory(payload: TipologiesCauses) {
    return this.http.post<BodyResponse<TipologiesCauses[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.TIPOLOGIES_BY_CATEGORY}`,
      payload
    );
  }
  getCausesListByTipology(payload: TipologiesCauses) {
    return this.http.post<BodyResponse<TipologiesCauses[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.CAUSES_BY_TIPOLOGY}`,
      payload
    );
  }
  getQualityDimensionsList() {
    return this.http.get<BodyResponse<QualityDimensionList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.QUALITY_DIMENSION_LIST}`
    );
  }
  getRequestsTypeByApplicantType(payload: number) {
    return this.http.get<BodyResponse<RequestTypeList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_BY_APPLICANT}/${payload}`
    );
  }

  getFormById(applicant_id: number) {
    return this.http.get<BodyResponse<[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_LIST}${applicant_id}`
    );
  }

  createRequest(payload: RequestFormList) {
    return this.http.post<BodyResponse<number>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_REQUEST}`,
      payload
    );
  }
  attachApplicantFiles(payloadAttach: any, request_id: number) {
    const payload = {
      applicant_attachments: payloadAttach,
      request_id: request_id,
    };
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.ATTACHMENTS_FILES}`,
      payload
    );
  }
  getNotificationActionList() {
    return this.http.get<BodyResponse<NotificationActionList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.NOTIFICATION_ACTION_LIST}`
    );
  }
  getNotificationReceiversList() {
    return this.http.get<BodyResponse<NotificationReceiversList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.NOTIFICATION_RECEIVER_LIST}`
    );
  }
  getNotificationList(payload: Pagination) {
    return this.http.post<BodyResponse<NotificationList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.NOTIFICATION_LIST_PAGINATION}`,
      payload
    );
  }
  getRequestStatusList() {
    return this.http.get<BodyResponse<RequestStatusList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_STATUS}`
    );
  }
  getRequestAfiliationStatusList() {
    return this.http.get<BodyResponse<RequestStatusAfiliationList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_STATUS_AFILIATION}`
    );
  }

  /** Lista de tipos de documento de persona (tabla parametros_tipo_documento_persona, solo activos). */
  getTipoDocumentoPersonaList() {
    return this.http.get<BodyResponse<ParametroTipoDocumentoPersona[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.TIPO_DOCUMENTO_PERSONA_LIST}`
    );
  }

  /** Lista de géneros (RETURNS TABLE(id, genero, esta_activo)). */
  getGeneroList() {
    return this.http.get<BodyResponse<ParametroGenero[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.GENERO_LIST}`
    );
  }

  /** Lista de estados civiles (RETURNS TABLE(id, estado_civil, esta_activo)). */
  getEstadoCivilList() {
    return this.http.get<BodyResponse<ParametroEstadoCivil[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.ESTADO_CIVIL_LIST}`
    );
  }

  /** Lista de parentescos (parametros_parentesco: id, parentesco, esta_activo). */
  getParentescoList() {
    return this.http.get<BodyResponse<ParametroParentesco[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.PARENTESCO_LIST}`
    );
  }

  /** Tipos de adjunto según parentesco (Cambiado a POST para integración con AWS). */
  obtenerAdjuntosPorParentesco(idParentesco: number) {
    // Creamos el payload que nuestra Lambda de Python está esperando leer del 'body'
    const payload = { 
      id_parentesco: idParentesco 
    };

    return this.http.post<BodyResponse<AdjuntoTipoPorParentesco[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.ADJUNTOS_POR_PARENTESCO}`,
      payload
    );
  }

  /** Paso 1: solicita URL pre-firmada y s3_key (POST generar-url). */
  obtenerUrlPresignadaS3(payload: Record<string, unknown>) {
    return this.http.post<BodyResponse<PresignAdjuntoAdicionalData>>(
      `${environment.API_PUBLIC}${EndPointRoute.ADJUNTOS_ADICIONALES_GENERAR_URL}`,
      payload
    );
  }

  /** Paso 2: PUT directo a S3; body = archivo, header Content-Type = tipo del file. */
  subirArchivoAS3(url: string, file: File) {
    return this.http.put(url, file, {
      headers: { 'Content-Type': file.type },
    });
  }

  /** Paso 3: confirma en BD el adjunto asociado a la clave S3 subida. */
  confirmarAdjuntoS3(payload: Record<string, unknown>) {
    return this.http.post<BodyResponse<Adjunto>>(
      `${environment.API_PUBLIC}${EndPointRoute.ADJUNTOS_ADICIONALES_CONFIRMAR}`,
      payload
    );
  }

  /** Lista de motivos de rechazo para gestión de estado de afiliado (solo catálogo desde BD). */
  getMotivosRechazoAfiliacionList() {
    return this.http.get<BodyResponse<ParametroMotivoRechazoAfiliacion[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.MOTIVOS_RECHAZO_AFILIACION_LIST}`
    );
  }

  getNovedadStatusList() {
    return this.http.get<BodyResponse<NovedadStatusList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.NOVEDAD_STATUS_LIST}`
    );
  }
  createNotification(payload: NotificationList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_NOTIFICATION}`,
      payload
    );
  }

  modifyNotification(payload: NotificationList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_NOTIFICATION}`,
      payload
    );
  }
  inactivateNotification(payload: NotificationList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_NOTIFICATION}`,
      payload
    );
  }
  answerRequest(payload: answerRequest) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.ANSWER_REQUEST}`,
      payload
    );
  }
  characterizeRequest(payload: CharacterizationCreate) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CHARACTERIZE_REQUEST}`,
      payload
    );
  }
  downloadRequest(payload: DownloadAttach) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.DOWNLOAD_ATTACH}`,
      payload
    );
  }
  getRequestReport(payload: FilterRequests) {
    return this.http.post<BodyResponse<RequestReportList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_REPORT}`,
      payload
    );
  }
  getRequestReportAll(payload: FilterRequests) {
    return this.http.post<BodyResponse<RequestReportList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_REPORT_ALL}`,
      payload
    );
  }
  getRequestListByFilter(payload: FilterRequests) {
    return this.http.post<BodyResponse<RequestsList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_BY_FILTER}`,
      payload
    );
  }
  getRequestMassiveListByFilter(payload: FilterRequestsMassive) {
    return this.http.post<BodyResponse<RequestsMassiveAfiliationListItem[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_MASSIVE_BY_FILTER}`,
      payload
    );
  }
  getRequestAfiliationListByFilter(payload: FilterRequestsAfiliation) {
    return this.http.post<BodyResponse<RequestsListAfiliation[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_AFILIATION_BY_FILTER}`,
      payload
    );
  }
  getNovedadListByFilter(payload: FilterNovedad) {
    return this.http.post<BodyResponse<NovedadCalidadDatosDetalle[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.NOVEDAD_BY_FILTER}`,
      payload
    );
  }
  getUrlSigned(payload: PreSignedAttach, attachment_owner: string) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.URL_SIGNER}/${attachment_owner}`,
      payload
    );
  }
  downloadFileFromS3(preSignedUrl: string): Observable<Blob> {
    const url =
      typeof preSignedUrl === 'string'
        ? preSignedUrl
        : (preSignedUrl as any)?.url ?? (preSignedUrl as any)?.signedUrl ?? (preSignedUrl as any)?.href ?? '';
    if (!url || typeof url !== 'string') {
      return throwError(() => new Error('URL de descarga no válida'));
    }
    return this.http.get(url, { responseType: 'blob' });
  }

  respuestaIaWs(requestDescription?: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json', // Asegura que se envíe como JSON
      'x-api-key': this.apiKey, // Incluye la API key en los headers
    });
    const payload = {
      mensaje: requestDescription,
    };
    return this.http.post(this.apiUrl, payload, { headers }); // Envía la petición con headers
  }

  correccionIaWs(respuestaSolicitud?: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json', // Asegura que se envíe como JSON
      'x-api-key': this.apiKey, // Incluye la API key en los headers
    });
    const payload = {
      mensaje: respuestaSolicitud,
    };
    return this.http.post(this.apiUrlCorreccionIA, payload, { headers }); // Envía la petición con headers
  }

  respuestaIaAdjuntos(mensaje?: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    });
    const payload = {
      body: JSON.stringify({
        userMessage: mensaje,
      }),
    };
    return this.http
      .post(this.apiUrlAdjuntos, payload, { headers }) // Envía la petición con headers
      .pipe(
        catchError(error => {
          // Retorna un observable con un mensaje de error personalizado
          return of({
            statusCode: '500',
            status: 'error',
            message: 'No es posible procesar la solicitud en este momento. Inténtelo más tarde.',
          });
        })
      );
  }

  getRequestReportDetail(): Observable<BodyResponse<RequestReportDetail[]>> {
    return this.http.post<BodyResponse<RequestReportDetail[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_REPORT_DETAIL_ALL}`,
      {}
    );
  }

  getRequestReportStatus(): Observable<BodyResponse<RequestReportStatus[]>> {
    return this.http.post<BodyResponse<RequestReportStatus[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_REPORT_STATUS}`,
      {}
    );
  }

  getRequestReportForStatus(): Observable<BodyResponse<RequestReportForStatus[]>> {
    return this.http.post<BodyResponse<RequestReportForStatus[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_REPORT_FOR_STATUS}`,
      {}
    );
  }

  getRequestReportStatusByAssignedUser(): Observable<
    BodyResponse<RequestReportStatusByAssignedUser[]>
  > {
    return this.http.post<BodyResponse<RequestReportStatusByAssignedUser[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_REPORT_STATUS_BY_ASSIGNED_USER}`,
      {}
    );
  }
  //Nuevo
  // MEtodo para generar documento de afilicacion
  consultarInfoPersona(doc: string): Observable<any> {
    const docmd5 = MD5(doc).toString();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json', // Solo envía el Content-Type si es necesario
    });

    const payload = {
      documento: docmd5, // Aquí puedes ajustar el nombre del campo si el WS lo requiere
    };

    return this.http.post(this.apiUrlIngresoConfa, payload, { headers }); // Envía la petición con headers
  }

  // respuestaInfoAfiliacion(cedula?: string): Observable<any> {
  //   const urlSubsidios = 'https://api-utilitarios.confa.co/replica/consultarEmpresa';
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json', // Asegura que se envíe como JSON
  //     'x-api-key': this.apiKey, // Incluye la API key en los headers
  //   });
  //   const payload = {
  //     ndoc: cedula,
  //   };
  //   return this.http.post(urlSubsidios, payload, { headers }); // Envía la petición con headers
  // }

  /**
   * Consulta datos del afiliado en subsidios WS.
   * @param cedula Número de documento
   * @param tipoDocumentoCodigo Código del tipo de documento en el WS (p. ej. 1 cédula extranjería, 2 PPT)
   */
  respuestaInfoAfiliacion(cedula: string, tipoDocumentoCodigo: number | string = 1): Observable<any> {
    const codigo = tipoDocumentoCodigo ?? 1;
    const url = `https://app.confa.co:8320/subsidiosWSRest/rest/wsrest/consultarAfiliadoDoc/${encodeURIComponent(cedula)}/${codigo}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.get(url, { headers });
  }

  createAnswerTemp(payload: RequestAnswerTemp) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_ANSWER_TEM}`,
      payload
    );
  }

  getAnswerTemp(payload: RequestAnswerTemp) {
    return this.http.post<BodyResponse<RequestAnswerTemp>>(
      `${environment.API_PUBLIC}${EndPointRoute.GET_ANSWER_TEMP_REQUEST}`,
      payload
    );
  }

  registerErrorAttach(payload: ErrorAttachLog) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.ATTACHMENTS_ERROR_LOG}`,
      payload
    );
  }

  getRequestsUserAssociation(payload: Pagination) {
    return this.http.post<BodyResponse<AssociationRequestUserList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.GET_ASSOCIATE_REQUEST_USER}`,
      payload
    );
  }
  createAssociationRequestUser(payload: AssociateRequestUser) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.ASSOCIATE_REQUEST_USER}`,
      payload
    );
  }
  inactivateAssociationRequestUser(payload: AssociationRequestUserList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVE_ASSOCIATE_REQUEST_USER}`,
      payload
    );
  }
  registerProcessRequest(payload: ProcessRequest) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.PROCESS_REQUEST_LOG}`,
      payload
    );
  }
  getIpAddress(): Observable<any> {
    return this.http.get('https://api.ipify.org/?format=json');
  }

  checkServiceAvailability(): Observable<boolean> {
    return this.http.head(this.apiUrlCorreccionIA, { observe: 'response' }).pipe(
      map(() => true), // Si la respuesta es exitosa, el servicio está disponible
      catchError(() => of(false)) // Si hay un error, marcamos como no disponible
    );
  }

  registerPendingRequest(payload: PendingRequest) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_PENDING_REQUEST}`,
      payload
    );
  }

  changeStateReview(payload: RequestsReview) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CHANGE_STATE_REVIEW}`,
      payload
    );
  }

  sendEmailAll(payload: sendEmail) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.SEND_EMAIL_MASSIVE}`,
      payload
    );
  }

  getHistoryRequest(payload: requestHistoryRequest) {
    return this.http.post<BodyResponse<historyRequest[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.GET_HISTORY_REQUEST}`,
      payload
    );
  }

  /*
  getHistoryRequestAfiliation(payload: requestHistoryRequest) {
    return this.http.post<BodyResponse<historyRequest[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_HISTORIC_AFILIATION}`,
      payload
    );
  }
  */

  getRequestPendingByToken(payload: Token) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<BodyResponse<PendingRequest>>(
      `${environment.API_PUBLIC}${EndPointRoute.GET_PENDING_REQUEST}`,
      payload,
      { headers: headers }
    );
  }

  answerRequestPending(payload: RequestFormListPending) {
    return this.http.post<BodyResponse<number>>(
      `${environment.API_PUBLIC}${EndPointRoute.ANSWER_REQUEST_PENDING}`,
      payload
    );
  }

  createRequestInternal(payload: RequestFormListInternal) {
    return this.http.post<BodyResponse<number>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_REQUEST_INTERNAL}`,
      payload
    );
  }

  //traer usuario que creo la solicitud
  getRequestUserList() {
    return this.http.get<BodyResponse<UserList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_USERS_LIST}`
    );
  }
  //traer las areas parametrizadas
  getRequestAreasList() {
    return this.http.get<BodyResponse<RequestAreaList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.AREAS_LIST}`
    );
  }
  // consultar por filtros solicitudes para usuario interno
  getRequestListInternByFilter(payload: FilterRequestsIntern) {
    return this.http.post<BodyResponse<RequestsListIntern[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_BY_FILTER_INTERN}`,
      payload
    );
  }
  // consultar por filtros solicitudes para usuario interno
  getRequestPriority(payload: RequestAnswerTemp) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_PRIORITY}`,
      payload
    );
  }

  uploadPostSdk(payload: any) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.ATTACHMENTS_FILES_SDK}`,
      payload
    );
  }
  // Creacion de solicitud para actualizar la informacion de una empresa
  updateCompany(payload: CompanyUpdateRequest) {
    return this.http.post<BodyResponse<number>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_COMPANY_FORM}`,
      payload
    );
  }

  insertCompanyFilesS3(payload: any): Observable<boolean> {
    return this.http
      .post<
        BodyResponseUp<string>
      >(`${environment.API_PUBLIC}${EndPointRoute.UPLOAD_COMPANY_FILES}`, payload)
      .pipe(map(response => response.body === '1'));
  }

  getUrlSignedCompany(payload: PreSignedAttach, type_docoument: string) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPLOAD_COMPANY_FILES}/${type_docoument}`,
      payload
    );
  }

  getCompanyInformation(cedula: string, tipoDoc: String): Observable<any> {
    const url = `${environment.ruta_consumo_subsidios_rest}consultarEmpresaNitGestorSolicitudes/${cedula}/${tipoDoc}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.get(url, { headers });
  }

  getCompanyUpdateListByFilter(payload: FilterCompanyUpdate) {
    return this.http.post<BodyResponse<CompanyUpdateRecord[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.COMPANY_UPDATE_BY_FILTER}`,
      payload
    );
  }

  getCompanyUpdateListForExport(payload: FilterCompanyUpdate) {
    return this.http.post<BodyResponse<CompanyUpdateRecord[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.COMPANY_UPDATE_EXPORT}`,
      payload
    );
  }

  updateCompanyManagement(payload: {
    company_update_id: number;
    management_result: string;
    management_observation: string;
    updated_by: string;
    user_mail: string;
    user_name: string;
  }) {
    return this.http.post<BodyResponse<any>>(
      `${environment.API_PUBLIC}${EndPointRoute.COMPANY_UPDATE_MANAGEMENT}`,
      payload
    );
  }

  getCiiuCodes(): Observable<any> {
    const url = `${environment.ruta_consumo_subsidios_rest}consultarCodigoCiiu`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.get(url, { headers });
  }

  getRequestInternalListByFilter(payload: FilterRequests) {
    return this.http.post<BodyResponse<RequestsList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_INTERNAL_BY_FILTER}`,
      payload
    );
  }

  getSimilarRequest(payload: SimilarRequest) {
    return this.http.post<BodyResponse<number[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.SIMILAR_REQUEST}`,
      payload
    );
  }

  getDeptosAndMunicipios(): Observable<any> {
    let token = localStorage.getItem('gtoken');

    // Verifica si el token no existe o es inválido
    if (!token || token === 'null' || token === 'undefined') {
      return this.generateGToken().pipe(
        switchMap(() => {
          token = localStorage.getItem('gtoken'); // Recupera el token después de generarlo

          if (token) {
            return this.fetchDeptosAndMunicipios(token); // Si el token es válido, devuelve la consulta de departamentos y municipios
          } else {
            return of([]); // Si no se obtiene el token, devuelve un array vacío
          }
        })
      );
    }

    // Si ya hay un token válido, consulta los municipios directamente
    return this.fetchDeptosAndMunicipios(token); // Si el token ya existe, consulta los municipios
  }

  private fetchDeptosAndMunicipios(token: string): Observable<any> {
    let headers = new HttpHeaders();

    // Verifica si el token ya tiene el prefijo 'Bearer ', si no, lo agrega
    if (token) {
      // Si el token no tiene el prefijo 'Bearer ', lo añadimos
      if (!token.startsWith('Bearer ')) {
        token = 'Bearer ' + token;
      }
      headers = headers.set('Authorization', token);
    }

    const body = { consultar: true };

    return this.http
      .post<any>(`${environment.ruta_consumo_municipios}metodo19`, body, { headers })
      .pipe(
        catchError(err => {
          return of([]); // En caso de error, devolver un array vacío
        })
      );
  }
  generateGToken(): Observable<void> {
    const bodyToken = {
      parametro1: `${parameters.first}`, // Asegúrate de reemplazar estos parámetros con los correctos
      parametro2: `${parameters.second}`,
    };

    return this.http.post<any>(`${environment.ruta_consumo_token_generico}auth`, bodyToken).pipe(
      map((response: any) => {
        const result = response;

        if (result?.token) {
          const token = 'Bearer ' + result.token;
          localStorage.setItem('gtoken', token); // Guarda el token
        } else {
          throw new Error('No se recibió token en /auth');
        }
      }),
      catchError(err => {
        throw err; // Lanza el error para que el flujo pueda ser capturado
      })
    );
  }
  ///Parametrizacion genero
   getGenderListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<GenderList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.GENDER_LIST_PAGINATION}`,
      payload
    );
  }
  createGender(payload: GenderList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_GENDER}`,
      payload
    );
  }
  modifyGender(payload: GenderList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_GENDER}`,
      payload
    );
  }
  inactivateGender(payload: GenderList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_GENDER}`,
      payload
    );
  }
   ///Parametrizacion estado civil
   getMaritalStatusListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<MaritalStatusList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.MARITAL_STATUS_LIST_PAGINATION}`,
      payload
    );
  }
  createMaritalStatus(payload: MaritalStatusList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_MARITAL_STATUS}`,
      payload
    );
  }
  modifyMaterialStatus(payload: MaritalStatusList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_MARITAL_STATUS}`,
      payload
    );
  }
  inactivateMaritalStaus(payload: MaritalStatusList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_MARITAL_STATUS}`,
      payload
    );
  }
   ///Parametrizacion genero
   getSystemVariablesListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<SystemVariableList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.SYSTEM_VARIABLE_LIST_PAGINATION}`,
      payload
    );
  }
  createSystemVariable(payload: SystemVariableList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_SYSTEM_VARIABLE}`,
      payload
    );
  }
  modifySystemVariable(payload: SystemVariableList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_SYSTEM_VARIABLE}`,
      payload
    );
  }
  ///Parametrizacion malla validacion afiliacion masiva
   getAfiliationTemplateValidationsListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<AfiTemplateValidationList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.AFI_TEMPLATE_VALIDATION_LIST_PAGINATION}`,
      payload
    );
  }
  createAfiTemplateValidation(payload: AfiTemplateValidationList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_AFI_TEMPLATE_VALIDATION}`,
      payload
    );
  }
  modifyAfiTemplateValidation(payload: AfiTemplateValidationList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_AFI_TEMPLATE_VALIDATION}`,
      payload
    );
  }
  inactivateAfiTemplateValidation(payload: AfiTemplateValidationList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_AFI_TEMPLATE_VALIDATION}`,
      payload
    );
  }
  ///Parametrizacion empresas afiliacion
  getAfiliationCompanyListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<AfiliationCompanyList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.AFI_COMPANY_LIST_PAGINATION}`,
      payload
    );
  }
  createAfiCompanyValidation(payload: AfiliationCompanyList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_AFI_COMPANY}`,
      payload
    );
  }
  inactivateAfiCompany(payload: AfiliationCompanyList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_AFI_COMPANY}`,
      payload
    );
  }
  ///Parametrizacion tipos documentos empresas
  getDocumentoTypeCompanyListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<DocumentTypeCompanyList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.DOCUMENT_TYPE_COMPANY_LIST_PAGINATION}`,
      payload
    );
  }
  createDocumentoTypeCompany(payload: DocumentTypeCompanyList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_DOCUMENT_TYPE_COMPANY}`,
      payload
    );
  }
  modifyDocumentoTypeCompany(payload: DocumentTypeCompanyList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_DOCUMENT_TYPE_COMPANY}`,
      payload
    );
  }
  inactivateDocumentoTypeCompany(payload: DocumentTypeCompanyList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_DOCUMENT_TYPE_COMPANY}`,
      payload
    );
  }
  ///Parametrizacion tipos documentos para trabajadores y beneficiarios
  getDocumentoTypePersonListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<DocumentTypePersonList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.DOCUMENT_TYPE_PERSON_LIST_PAGINATION}`,
      payload
    );
  }
  createDocumentoTypePerson(payload: DocumentTypePersonList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_DOCUMENT_TYPE_PERSON}`,
      payload
    );
  }
  modifyDocumentoTypePerson(payload: DocumentTypePersonList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_DOCUMENT_TYPE_PERSON}`,
      payload
    );
  }
  inactivateDocumentoTypePerson(payload: DocumentTypePersonList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_DOCUMENT_TYPE_PERSON}`,
      payload
    );
  }
  ///Parametrizacion departamento
  getDepartmentListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<DepartmentList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.DEPARTMENT_LIST_PAGINATION}`,
      payload
    );
  }
  createDepartment(payload: DepartmentList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_DEPARTMENT}`,
      payload
    );
  }
  modifyDepartment(payload: DepartmentList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_DEPARTMENT}`,
      payload
    );
  }
  inactivateDepartment(payload: DepartmentList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_DEPARTMENT}`,
      payload
    );
  }
  ///Parametrizacion muncipio
  getMunicipalityListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<MunicipalityList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.MUNICIPALITY_LIST_PAGINATION}`,
      payload
    );
  }
  createMunicipality(payload: MunicipalityList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_MUNICIPALITY}`,
      payload
    );
  }
  modifyMunicipality(payload: MunicipalityList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_MUNICIPALITY}`,
      payload
    );
  }
  inactivateMunicipality(payload: MunicipalityList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_MUNICIPALITY}`,
      payload
    );
  }
  getDepartmentList() {
    return this.http.get<BodyResponse<DepartmentList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.DEPARTMENT_LIST}`
    );
  }
  ///Parametrizacion tipos documentos empresas
  getAttachmentTypeListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<AttachmentTypeList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.ATTACHEMENT_TYPE_LIST_PAGINATION}`,
      payload
    );
  }
  createAttachmentType(payload: AttachmentTypeList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_ATTACHEMENT_TYPE}`,
      payload
    );
  }
  modifyAttachmentType(payload: AttachmentTypeList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_ATTACHEMENT_TYPE}`,
      payload
    );
  }
  inactivateAttachmentType(payload: AttachmentTypeList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_ATTACHEMENT_TYPE}`,
      payload
    );
  }
  ///Parametrizacion parentesco
  getRelationshipListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<RelationshipList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.RELATIONSHIP_LIST_PAGINATION}`,
      payload
    );
  }
  getAttachmentList() {
    return this.http.get<BodyResponse<AttachmentTypeList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.ATTACHMENT_LIST}`
    );
  }
  createRelationship(payload: RelationshipList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_RELATIONSHIP}`,
      payload
    );
  }
  modifyRelationship(payload: RelationshipList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_RELATIONSHIP}`,
      payload
    );
  }
  inactivateRelationship(payload: RelationshipList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_RELATIONSHIP}`,
      payload
    );
  }


  //Parametrizacion responsables
  getResponsibleListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<ResponsibleList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.RESPONSIBLE_LIST_PAGINATION}`,
      payload
    );
  }
  createResponsible(payload: ResponsibleList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_RESPONSIBLE}`,
      payload
    );
  }
  modifyResponsible(payload: ResponsibleList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_RESPONSIBLE}`,
      payload
    );
  }
  inactivateResponsible(payload: ResponsibleList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_RESPONSIBLE}`,
      payload
    );
  }
  ///Parametrizacion notificaciones
  getAfiNotificationListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<AfiNotificationList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.AFI_NOTIFICATION_LIST_PAGINATION}`,
      payload
    );
  }
  createAfiNotification(payload: AfiNotificationList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_AFI_NOTIFICATION}`,
      payload
    );
  }
  modifyAfiNotification(payload: AfiNotificationList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_AFI_NOTIFICATION}`,
      payload
    );
  }
  inactivateAfiNotification(payload: AfiNotificationList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_AFI_NOTIFICATION}`,
      payload
    );
  }
  ///Parametrizacion afiliacion certificado
  getAfiCertificateListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<AfiCertificateList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.AFI_CERTIFICATE_LIST_PAGINATION}`,
      payload
    );
  }
  createAfiCertificate(payload: AfiCertificateList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_AFI_CERTIFICATE}`,
      payload
    );
  }
  modifyAfiCertificate(payload: AfiCertificateList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_AFI_CERTIFICATE}`,
      payload
    );
  }
  inactivateAfiCertificate(payload: AfiCertificateList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_AFI_CERTIFICATE}`,
      payload
    );
  }
  ///Parametrizacion banco
   getBankListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<BankList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.BANK_LIST_PAGINATION}`,
      payload
    );
  }
  createBank(payload: BankList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_BANK}`,
      payload
    );
  }
  modifyBank(payload: BankList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_BANK}`,
      payload
    );
  }
  inactivateBank(payload: BankList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_BANK}`,
      payload
    );
  }
  ///Parametrizacion tipo cuenta
   getAccountTypeListPaginationAfi(payload: Pagination) {
    return this.http.post<BodyResponse<AccountTypeListAfi[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.ACCOUNT_TYPE_LIST_PAGINATION_AFI}`,
      payload
    );
  }
  createAccountTypeAfi(payload: AccountTypeListAfi) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_ACCOUNT_TYPE_AFI}`,
      payload
    );
  }
  modifyAccountTypeAfi(payload: AccountTypeListAfi) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_ACCOUNT_TYPE_AFI}`,
      payload
    );
  }
  inactivateAccountTypeAfi(payload: AccountTypeListAfi) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_ACCOUNT_TYPE_AFI}`,
      payload
    );
  }

  ///Asociacion bancos y tipos
  getAssociateBankAccountListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<AssociateBankAccountList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.ASSOCIATE_BANK_ACCOUNT_LIST_PAGINATION}`,
      payload
    );
  }
  createAssociateBankAccount(payload: AssociateBankAccountList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_ASSOCIATE_BANK_ACCOUNT}`,
      payload
    );
  }
  modifyAssociateBankAccount(payload: AssociateBankAccountList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_ASSOCIATE_BANK_ACCOUNT}`,
      payload
    );
  }
  inactivateAssociateBankAccount(payload: AssociateBankAccountList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_ASSOCIATE_BANK_ACCOUNT}`,
      payload
    );
  }
  getBankList() {
    return this.http.get<BodyResponse<BankList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.BANK_LIST}`
    );
  }
  getAccountTypeListAfi() {
    return this.http.get<BodyResponse<AccountTypeListAfi[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.ACCOUNT_TYPE_LIST_AFI}`
    );
  }

  ///Parametrizacion ocupaciones
  getAfiOccupationListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<AfiOccupationList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.AFI_OCCUPATION_LIST_PAGINATION}`,
      payload
    );
  }
  createAfiOccupation(payload: AfiOccupationList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_AFI_OCCUPATION}`,
      payload
    );
  }
  modifyAfiOccupation(payload: AfiOccupationList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_AFI_OCCUPATION}`,
      payload
    );
  }
  inactivateAfiOccupation(payload: AfiOccupationList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_AFI_OCCUPATION}`,
      payload
    );
  }

  /// Parametrización motivos de rechazo afiliación
  getAfiMotivoRechazoListPagination(payload: Pagination) {
    return this.http.post<BodyResponse<AfiMotivoRechazoParamList[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.AFI_MOTIVO_RECHAZO_LIST_PAGINATION}`,
      payload
    );
  }
  createAfiMotivoRechazo(payload: AfiMotivoRechazoParamList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.CREATE_AFI_MOTIVO_RECHAZO}`,
      payload
    );
  }
  modifyAfiMotivoRechazo(payload: AfiMotivoRechazoParamList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.UPDATE_AFI_MOTIVO_RECHAZO}`,
      payload
    );
  }
  inactivateAfiMotivoRechazo(payload: AfiMotivoRechazoParamList) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.INACTIVATE_AFI_MOTIVO_RECHAZO}`,
      payload
    );
  }
}
