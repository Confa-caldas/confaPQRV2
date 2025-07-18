import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  BodyResponse,
  ZionResponse,
  BodyResponseUp,
} from '../models/shared/body-response.inteface';
import { EndPointRoute } from '../enums/routes.enum';
import { map, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
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
  SimilarRequest
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
  getRequestDetails(payload: number) {
    return this.http.get<BodyResponse<RequestsDetails>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_DETAILS}/${payload}`
    );
  }
  getRequestHistoric(payload: Pagination) {
    return this.http.post<BodyResponse<RequestHistoric[]>>(
      `${environment.API_PUBLIC}${EndPointRoute.REQUEST_HISTORIC}`,
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
    console.log(payloadAttach);
    const payload = {
      applicant_attachments: payloadAttach,
      request_id: request_id,
    };
    console.log(payload);
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
  getUrlSigned(payload: PreSignedAttach, attachment_owner: string) {
    return this.http.post<BodyResponse<string>>(
      `${environment.API_PUBLIC}${EndPointRoute.URL_SIGNER}/${attachment_owner}`,
      payload
    );
  }
  downloadFileFromS3(preSignedUrl: string): Observable<Blob> {
    return this.http.get(preSignedUrl, { responseType: 'blob' });
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
    console.log(payload);
    return this.http
      .post(this.apiUrlAdjuntos, payload, { headers }) // Envía la petición con headers
      .pipe(
        catchError(error => {
          console.error('Error en la solicitud:', error);

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
    console.log('Documento en MD5:', docmd5);

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

  respuestaInfoAfiliacion(cedula: string): Observable<any> {
    const url = `https://app.confa.co:8320/subsidiosWSRest/rest/wsrest/consultarAfiliadoDoc/${cedula}/1`;
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
}
