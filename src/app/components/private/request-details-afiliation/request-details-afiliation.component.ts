import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  ApplicantAttach,
  ApplicantAttachments,
  CharacterizationCreate,
  RequestHistoric,
  RequestsDetails,
  RequestsList,
  answerRequest,
  Pagination,
  RequestAttachmentsList,
  MiPerfilConfa,
  Afiliado,
  RequestAnswerTemp,
  PendingRequest,
  sendEmail,
  requestHistoryRequest,
  historyRequest,
  SimilarRequest,
  AfiliacionRequestDetailsData,
  Adjunto,
  BeneficiarioBundle,
  AdjuntoConValoracion,
  ValoracionAdjunto,
  afiliacionIndicadoresPermitenAsignar,
  MENSAJE_TOOLTIP_ASIGNAR_AFILIACION_INHABILITADA,
  ActualizarEstadoGestionAfiliacionPayload,
} from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RoutesApp } from '../../../enums/routes.enum';
import { SessionStorageItems } from '../../../enums/session-storage-items.enum';
import { HttpClient } from '@angular/common/http';
import { PaginatorState } from 'primeng/paginator';
import { v4 as uuidv4 } from 'uuid';
//Esto es nuevo
import { MenuModule } from 'primeng/menu';
import { of, lastValueFrom, firstValueFrom, throwError } from 'rxjs';
import { catchError, retryWhen, delay, take, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import JSZip from 'jszip';



@Component({
  selector: 'app-request-details-afiliation',
  templateUrl: './request-details-afiliation.component.html',
  styleUrl: './request-details-afiliation.component.scss',
})
export class RequestDetailsAfiliationComponent implements OnInit {
  @ViewChild('archive_request') fileInput!: ElementRef;

  @ViewChild('archive_request_pending') fileInputPending!: ElementRef;
  @ViewChild('fileInputAdjuntosAdicionales') fileInputAdjuntosAdicionalesRef?: ElementRef<HTMLInputElement>;

  displayPreviewModal: boolean = false;
  viewerType: 'google' | 'office' | 'image' | 'pdf' = 'google';

  requestList: RequestsList[] = [];
  requestDetails?: RequestsDetails;
  afiliationRequestDetails?: AfiliacionRequestDetailsData;
  readonly mensajeTooltipAsignarInhabilitada = MENSAJE_TOOLTIP_ASIGNAR_AFILIACION_INHABILITADA;
  requestHistoric: RequestHistoric[] = [];
  requestHistoricAttach: RequestHistoric[] = [];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogInput = false;
  visibleDialogAlert = false;
  visibleCharacterization = false;
  message = '';
  message2 = '';
  buttonmsg = '';
  parameter = [''];
  request_details!: RequestsDetails;
  selectedRequests: RequestsList[] = [];
  request_id: number = 0;
  request_id_afi: string = '';
  tabWidth!: number;
  ApplicantAttach: ApplicantAttach[] = [];
  AssignedAttach: ApplicantAttach[] = [];
  informative: boolean = false;
  severity = '';
  errorExtensionFile!: boolean;
  errorSizeFile!: boolean;
  fileNameList: string[] = [];
  fileNameListPending: string[] = [];
  arrayAssignedAttachment: ApplicantAttachments[] = [];
  arrayAssignedAttachmentPending: ApplicantAttachments[] = [];
  routeProcessRequest!: string;
  routeSearchRequest!: string;
  // routeTab!: string;
  routeTab: string = ''; // Inicializar con un valor por defecto
  requestProcess: FormGroup;
  enableAssign: boolean = false;
  user!: string;
  PERFIL!: string;
  base64File: string = '';
  requestAssignedAttachmentsList: RequestAttachmentsList[] = [];
  requestApplicantAttachmentsList: RequestAttachmentsList[] = [];
  errorMensajeFile!: string;
  errorRepeatFile!: boolean;

  firstHistoric: number = 0;
  pageHistoric: number = 1;
  rowsHistoric: number = 10;
  totalRowsHistoric: number = 0;

  firstAssignedAttachments: number = 0;
  pageAssignedAttachments: number = 1;
  rowsAssignedAttachments: number = 10;
  totalRowsAssignedAttachments: number = 0;

  firstApplicantAttachments: number = 0;
  pageApplicantAttachments: number = 1;
  rowsApplicantAttachments: number = 10;
  totalRowsApplicantAttachments: number = 0;
  preSignedUrl: string = '';
  preSignedUrlDownload: string = '';
  selectedFile: File | null = null;
  visibleDialogdDescrip = false;
  visibleDialogdDescripRadicada = false;
  isDialogVisible: boolean = false;
  dialogHeader: string = '';
  dialogContent: string = '';
  isSpinnerVisible = false;

  dataLoaded: any; // Aquí está el dato previamente cargado
  responseData: any;
  visibleDialogIa = false;
  visibleCorreccionIa = false;
  visibleCorreccionIaEnviar = false;
  visibleSolicitudPendiente = false;
  visibleHistory = false;
  categoria: string = '';
  respuestaPredefinida: string = '';
  respuestaCorregida: string = '';
  respuestaSolicitud: string = '';
  palabrasError: string = '';
  errores: boolean = false;
  //Esto es nuevo
  documentValue: string = ''; // Valor del documento (cédula)
  valor: string = ''; // Otro valor que quieras pasar en la URL
  nombreAfiliado: string = '';
  userMiPerfil!: MiPerfilConfa;
  imgPdf2: string = '';
  // fechaEntrega: string = this.formatDate(new Date());
  afiliado?: Afiliado;
  imgPdf1: string = '';

  //variables para respuestas temporal
  respuestaTemp: string = '';
  existEraserAsnwer: boolean = false;

  //utilitarios
  items: MenuModule[] | undefined;
  pendingRequestForm: FormGroup;
  selectedFilesPending: File[] = [];
  visibleSolicitudEnvioMasivo = false;
  envioMasivoForm: FormGroup;
  emailInput: string = ''; // Variable para capturar el correo ingresado
  emailList: string[] = []; // Lista de correos agregados
  errorMessage: string = '';
  currentState: string = '';
  currentIndex: number = 0;

  // Arreglo de eventos para la línea de tiempo
  events: any[] = [];

  historyData: Array<any> = [];
  isInitialized = false;
  isInitializedView = false;
  ultimaRespuestaGuardada: string = '';
  private cancelAutoSave = false;

  //utilitarios cuando no es cerrada
  itemsGenerals: MenuModule[] | undefined;
  isVisibleSolicitudPrioridad = false;
  esPrioridadForm: FormGroup;
  spinnerVisible = false;

  similares: any[] = [];

  /** Valoración por adjunto (valores BD: SI, NO, NA); cuando es NO se muestra descripción */
  valoracionOpciones: { label: string; value: string }[] = [
    { label: 'Sí', value: 'SI' },
    { label: 'No', value: 'NO' },
    { label: 'No aplica', value: 'NA' },
  ];
  /** Opciones para Estado civil (cargadas desde parametros_estado_civil). */
  opcionesEstadoCivil: { label: string; value: string }[] = [];
  /** Opciones para tipo de documento (cargadas desde parametros_tipo_documento_persona). */
  opcionesTipoDocumento: { label: string; value: string }[] = [];
  /** Opciones para género (cargadas desde parametros_genero). */
  opcionesGenero: { label: string; value: string }[] = [];
  guardandoDatosTrabajador = false;
  /** Opciones para Parentesco (cargadas desde parametros_parentesco). */
  opcionesParentesco: { label: string; value: string }[] = [];
  /** Opciones para "La dirección corresponde a la misma del trabajador" (Si/No). */
  opcionesDireccionTrabajador: { label: string; value: string }[] = [
    { label: 'Sí', value: 'Si' },
    { label: 'No', value: 'No' },
  ];
  /** Índice del beneficiario cuyo guardado está en curso (null si ninguno). */
  guardandoBeneficiarioIndex: number | null = null;
  /** Id del adjunto cuya validación está en curso (null si ninguno). */
  validandoAdjuntoId: number | null = null;
  /** Diálogo de confirmación para validar adjunto. */
  visibleConfirmarValidarAdjunto = false;
  /** Adjunto pendiente de confirmación de validación. */
  adjuntoAValidar: AdjuntoConValoracion | null = null;
  /** Diálogo de confirmación para guardar datos del trabajador. */
  visibleConfirmarGuardarTrabajador = false;
  /** Diálogo de confirmación para guardar datos del beneficiario. */
  visibleConfirmarGuardarBeneficiario = false;
  /** Beneficiario e índice pendientes de confirmación de guardado. */
  beneficiarioAGuardar: { b: BeneficiarioBundle; index: number } | null = null;
  /** Modal subir adjuntos adicionales. */
  visibleModalAdjuntosAdicionales = false;
  /** Para quién se suben: 'trabajador' o índice del beneficiario. */
  adjuntosAdicionalesPara: 'trabajador' | number = 'trabajador';
  /** Archivos seleccionados para subir. */
  archivosAdjuntosAdicionales: File[] = [];
  /** En curso la subida de adjuntos adicionales. */
  subiendoAdjuntosAdicionales = false;
  /** En curso la generación del expediente PDF. */
  generandoExpediente = false;
  /** Por cada índice de beneficiario, true si al cargar tenía tipo doc CE o PPT (la sección editable se mantiene aunque cambie el selector). */
  private beneficioEditablePorIndice: boolean[] = [];
  /** Snapshots de datos editables por beneficiario (índice) para detectar cambios. */
  private snapshotBeneficiarios: Array<{
    parentesco: string | null;
    tipo_documento: string;
    numero_documento: string;
    primer_nombre: string;
    direccion_corresponde_trabajador: string | null;
    direccion: string | null;
  }> = [];
  /** Snapshot de los datos editables del afiliado al cargar/guardar; se usa para detectar si hay cambios. */
  private snapshotDatosTrabajador: {
    tipo_documento: string;
    numero_documento: string;
    primer_apellido: string;
    segundo_apellido: string | null;
    primer_nombre: string;
    segundo_nombre: string | null;
    fecha_expedicion_doc: string | null;
    fecha_nacimiento: string | null;
    genero: string | null;
    estado_civil: string | null;
  } | null = null;
  trabajadorAdjuntosEstado: AdjuntoConValoracion[] = [];
  beneficiariosAdjuntosEstado: AdjuntoConValoracion[][] = [];

  // --- Modal: Gestionar estado de afiliado ---
  visibleGestionarEstadoModal = false;
  gestionarEstadoAfiliadoForm!: FormGroup;
  private gestionarEstadoAfiliadoSub?: Subscription;

  readonly ESTADO_AFILIADO_PENDIENTE_RPA = 'Pendiente afiliación rpa';
  readonly ESTADO_AFILIADO_PROCESADO = 'Procesado';
  readonly ESTADO_AFILIADO_RECHAZADO = 'Rechazado';

  estadoAfiliadoOpciones: { label: string; value: string }[] = [
    { label: 'Pendiente afiliación rpa', value: 'Pendiente afiliación rpa' },
    { label: 'Procesado', value: 'Procesado' },
    { label: 'Rechazado', value: 'Rechazado' },
  ];

  /** Opciones del dropdown motivo de rechazo (cargadas desde BD). */
  motivoRechazoOpciones: { label: string; value: string }[] = [];
  cargandoMotivosRechazo = false;
  /** Guardado en curso: actualizar estado gestión solicitud. */
  guardandoEstadoGestionSolicitud = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: Users,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    // (window as any).pdfMake.vfs = pdfFonts.pdfMake.vfs;
    this.requestProcess = this.formBuilder.group({
      mensage: [null, [Validators.required, Validators.maxLength(6000)]],
      //mensage: [null, [Validators.required]],
    });

    this.pendingRequestForm = this.fb.group({
      message: ['', [Validators.required, Validators.maxLength(6000)]],
      //file: [null, Validators.required],
    });

    this.envioMasivoForm = this.fb.group({
      message: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.esPrioridadForm = this.fb.group({
      message: ['', Validators.required],
    });

    this.gestionarEstadoAfiliadoForm = this.fb.group({
      estadoAfiliado: [null, Validators.required],
      motivoRechazo: [null as string | null],
    });
  }

  ngOnInit() {
    this.PERFIL = sessionStorage.getItem(SessionStorageItems.PERFIL) || '';
    this.user = sessionStorage.getItem(SessionStorageItems.USER) || '';

    // console.log(localStorage.getItem);
    let routeIf = localStorage.getItem('route');
    if (routeIf?.includes(RoutesApp.SEARCH_REQUEST)) {
      this.routeTab = routeIf;
    } else if (routeIf?.includes(RoutesApp.PROCESS_REQUEST)) {
      this.routeTab = routeIf;
    }

    this.route.params.subscribe(params => {
      this.request_id = +params['id'];
      this.getRequestDetails(this.request_id);
    });





    this.initPaginadorHistoric();
    //this.getRequestApplicantAttachments(this.request_id);
    //this.getRequestAssignedAttachments(this.request_id);

    //validar si esta cerrada
    //this.getAnswerTemp(this.request_id);

    this.getHistoryRequest(this.request_id);

    // //Neuvo pdf
    // Util.getImageDataUrl('assets/imagenes/encabezado.png').then(
    //   imagenConfa => (this.imgPdf2 = imagenConfa)
    // );

    // Util.getImageDataUrl('assets/imagenes/footer.png').then(
    //   imagenConfaFooter => (this.imgPdf1 = imagenConfaFooter)
    // );

    this.initGestionarEstadoAfiliadoListeners();

    this.items = [
      {
        items: [
          {
            label: 'Reabrir solicitud',
            icon: 'pi pi-history',
            command: () => this.solicitudPendiente(),
          },
          {
            label: 'Envio de respuesta',
            icon: 'pi pi-send',
            command: () => this.envioCorreoMasivo(),
          },
        ],
      },
    ];

    this.itemsGenerals = [
      {
        items: [
          {
            label: 'Priorizar',
            icon: 'pi pi-exclamation-triangle',
            command: () => this.sendPriority(),
          },
        ],
      },
    ];
  }

  onPageChangeHistoric(eventHistoric: PaginatorState) {
    this.firstHistoric = eventHistoric.first || 0;
    this.rowsHistoric = eventHistoric.rows || 0;
    this.pageHistoric = Number(eventHistoric.page) + 1 || 0;
    //this.getRequestHistoric(this.request_id);
  }
  cleanFormHistoric() {
    this.firstHistoric = 0;
    this.pageHistoric = 1;
    this.rowsHistoric = 10;
    this.requestHistoric = [];
    //this.getRequestHistoric(this.request_id);
  }

  initPaginadorHistoric() {
    this.firstHistoric = 0;
    this.pageHistoric = 1;
    this.rowsHistoric = 10;
    this.getRequestHistoric(this.request_id);
  }

  onPageChangeAssignedAttachments(eventAssignedAttachments: PaginatorState) {
    this.firstAssignedAttachments = eventAssignedAttachments.first || 0;
    this.rowsAssignedAttachments = eventAssignedAttachments.rows || 0;
    this.pageAssignedAttachments = Number(eventAssignedAttachments.page) + 1 || 0;
    //this.getRequestAssignedAttachments(this.request_id);
  }
  cleanFormAssignedAttachments() {
    this.firstAssignedAttachments = 0;
    this.pageAssignedAttachments = 1;
    this.rowsAssignedAttachments = 10;
    this.requestAssignedAttachmentsList = [];
    //this.getRequestAssignedAttachments(this.request_id);
  }

  initPaginadorAssignedAttachments() {
    this.firstAssignedAttachments = 0;
    this.pageAssignedAttachments = 1;
    this.rowsAssignedAttachments = 10;
    //this.getRequestAssignedAttachments(this.request_id);
  }

  onPageChangeApplicantAttachments(eventApplicantAttachments: PaginatorState) {
    this.firstApplicantAttachments = eventApplicantAttachments.first || 0;
    this.rowsApplicantAttachments = eventApplicantAttachments.rows || 0;
    this.pageApplicantAttachments = Number(eventApplicantAttachments.page) + 1 || 0;
    //this.getRequestApplicantAttachments(this.request_id);
  }
  cleanFormApplicantAttachments() {
    this.firstApplicantAttachments = 0;
    this.pageApplicantAttachments = 1;
    this.rowsApplicantAttachments = 10;
    this.requestApplicantAttachmentsList = [];
    //this.getRequestApplicantAttachments(this.request_id);
  }

  initPaginadorApplicantAttachmentss() {
    this.firstApplicantAttachments = 0;
    this.pageApplicantAttachments = 1;
    this.rowsApplicantAttachments = 10;
    //this.getRequestApplicantAttachments(this.request_id);
  }

  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }

  /** Escucha `estadoAfiliado`: motivo de rechazo solo con validación si es Rechazado. */
  private initGestionarEstadoAfiliadoListeners(): void {
    if (this.gestionarEstadoAfiliadoSub) {
      return;
    }
    const estadoCtrl = this.gestionarEstadoAfiliadoForm.get('estadoAfiliado');
    const motivoCtrl = this.gestionarEstadoAfiliadoForm.get('motivoRechazo');
    if (!estadoCtrl || !motivoCtrl) {
      return;
    }
    this.gestionarEstadoAfiliadoSub = estadoCtrl.valueChanges.subscribe((val: string | null) => {
      if (val === this.ESTADO_AFILIADO_RECHAZADO) {
        motivoCtrl.setValidators([Validators.required]);
      } else {
        motivoCtrl.clearValidators();
        motivoCtrl.setValue(null, { emitEvent: false });
      }
      motivoCtrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  get mostrarMotivoRechazoGestion(): boolean {
    return (
      this.gestionarEstadoAfiliadoForm.get('estadoAfiliado')?.value === this.ESTADO_AFILIADO_RECHAZADO
    );
  }

  abrirModalGestionarEstado(): void {
    this.gestionarEstadoAfiliadoForm.reset({
      estadoAfiliado: null,
      motivoRechazo: null,
    });
    this.gestionarEstadoAfiliadoForm.get('motivoRechazo')?.clearValidators();
    this.gestionarEstadoAfiliadoForm.get('motivoRechazo')?.updateValueAndValidity({ emitEvent: false });
    this.visibleGestionarEstadoModal = true;
    this.cargarMotivosRechazoAfiliacion();
  }

  /** Carga catálogo de motivos de rechazo desde el servicio (BD). */
  cargarMotivosRechazoAfiliacion(): void {
    this.cargandoMotivosRechazo = true;
    this.userService.getMotivosRechazoAfiliacionList().subscribe({
      next: (res) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          this.motivoRechazoOpciones = res.data
            .filter((m) => {
              const a = m.esta_activo as boolean | number | undefined;
              if (a === false || a === 0) return false;
              return true;
            })
            .map((m) => ({
              label: (m.motivo_rechazo ?? '').trim() || `Motivo #${m.id}`,
              value: String(m.id),
            }));
        } else {
          this.motivoRechazoOpciones = [];
          this.messageService.add({
            severity: 'warn',
            summary: 'Motivos de rechazo',
            detail: res.message || 'No se pudieron cargar los motivos de rechazo.',
          });
        }
      },
      error: (err) => {
        console.error('getMotivosRechazoAfiliacionList', err);
        this.motivoRechazoOpciones = [];
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los motivos de rechazo. Intente de nuevo.',
        });
      },
      complete: () => {
        this.cargandoMotivosRechazo = false;
      },
    });
  }

  cerrarModalGestionarEstado(): void {
    this.visibleGestionarEstadoModal = false;
  }

  /**
   * Motivos que impiden pasar a "Pendiente afiliación rpa": revisiones de archivos pendientes
   * y/o indicadores de solicitud en "Si" (novedad restrictiva, pendiente dirección, pendiente activar empresa).
   */
  private obtenerMotivosBloqueoPendienteAfiliacionRpa(): string[] {
    const motivos: string[] = [];
    const trabajador = this.trabajadorAdjuntosEstado ?? [];
    const beneficiarios = this.beneficiariosAdjuntosEstado ?? [];
    const todosAdj = [...trabajador, ...beneficiarios.flat()];
    const pendientesArchivo = todosAdj.filter((item) => this.esAdjuntoPendienteValidacion(item));
    if (pendientesArchivo.length > 0) {
      motivos.push(
        'Revisiones de archivos: hay adjuntos sin validar o con validación pendiente.'
      );
    }

    const s = this.afiliationRequestDetails?.solicitud;
    if (s && this.solicitudIndicadorEsSi(s.novedad_restrictiva)) {
      motivos.push('Novedad restrictiva');
    }
    if (s && this.solicitudIndicadorEsSi(s.pendiente_direccion)) {
      motivos.push('Pendiente dirección');
    }
    if (s && this.solicitudIndicadorEsSi(s.pendiente_activar_empresa)) {
      motivos.push('Pendiente activar empresa');
    }
    return motivos;
  }

  guardarGestionarEstadoAfiliado(): void {
    const estado = this.gestionarEstadoAfiliadoForm.get('estadoAfiliado')?.value;

    if (estado === this.ESTADO_AFILIADO_PENDIENTE_RPA) {
      const motivosBloqueo = this.obtenerMotivosBloqueoPendienteAfiliacionRpa();
      if (motivosBloqueo.length > 0) {
        const detail = [
          'No es posible cambiar al estado Pendiente afiliación RPA hasta resolver lo siguiente:',
          '',
          ...motivosBloqueo.map((m) => `• ${m}`),
        ].join('\n');
        this.messageService.add({
          severity: 'error',
          summary: 'No permitido',
          detail,
        });
        return;
      }
    }

    if (this.gestionarEstadoAfiliadoForm.invalid) {
      this.gestionarEstadoAfiliadoForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Complete los campos obligatorios.',
      });
      return;
    }

    const idSolicitud = this.afiliationRequestDetails?.solicitud?.id;
    if (idSolicitud == null) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No hay solicitud cargada.',
      });
      return;
    }

    const raw = this.gestionarEstadoAfiliadoForm.getRawValue();
    const estadoAfiliado = raw.estadoAfiliado as string;
    const payload: ActualizarEstadoGestionAfiliacionPayload = {
      id_solicitud: idSolicitud,
      estado_afiliado: estadoAfiliado,
    };
    if (estadoAfiliado === this.ESTADO_AFILIADO_RECHAZADO && raw.motivoRechazo != null && raw.motivoRechazo !== '') {
      const idMotivo = Number(raw.motivoRechazo);
      if (!Number.isNaN(idMotivo)) {
        payload.id_motivo_rechazo = idMotivo;
      }
    }

    this.guardandoEstadoGestionSolicitud = true;
    this.userService.actualizarEstadoGestionSolicitudAfiliacion(payload).subscribe({
      next: (res) => {
        this.guardandoEstadoGestionSolicitud = false;
        if (res.code !== 200) {
          this.showSuccessMessage(
            'error',
            'No se pudo actualizar',
            res.message || 'Operación fallida.'
          );
          return;
        }
        this.showSuccessMessage(
          'success',
          'Estado actualizado',
          res.message || 'El estado de la solicitud se actualizó correctamente.'
        );
        this.cerrarModalGestionarEstado();
        this.getRequestDetails(this.request_id);
      },
      error: (err) => {
        this.guardandoEstadoGestionSolicitud = false;
        console.error('actualizarEstadoGestionSolicitudAfiliacion', err);
        this.showSuccessMessage(
          'error',
          'Error',
          'No se pudo actualizar el estado. Intente de nuevo.'
        );
      },
    });
  }

  /** Normaliza valor de indicador (Si/SÍ/sí) como en el resto de afiliaciones. */
  private solicitudIndicadorEsSi(val: string | null | undefined): boolean {
    return (
      (val ?? '')
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') === 'si'
    );
  }

  /** p-tag: datos desde solicitud.novedad_restrictiva */
  textoTagNovedadRestrictiva(): string {
    const v = this.afiliationRequestDetails?.solicitud?.novedad_restrictiva;
    return this.solicitudIndicadorEsSi(v) ? 'Novedad restrictiva: sí' : 'Novedad restrictiva: no';
  }

  severidadTagNovedadRestrictiva(): 'success' | 'warning' | 'danger' {
    const v = this.afiliationRequestDetails?.solicitud?.novedad_restrictiva;
    return this.solicitudIndicadorEsSi(v) ? 'danger' : 'success';
  }

  textoTagPendienteDireccion(): string {
    const v = this.afiliationRequestDetails?.solicitud?.pendiente_direccion;
    return this.solicitudIndicadorEsSi(v) ? 'Pendiente dirección: sí' : 'Pendiente dirección: no';
  }

  severidadTagPendienteDireccion(): 'success' | 'warning' | 'danger' {
    const v = this.afiliationRequestDetails?.solicitud?.pendiente_direccion;
    return this.solicitudIndicadorEsSi(v) ? 'warning' : 'success';
  }

  textoTagPendienteActivarEmpresa(): string {
    const v = this.afiliationRequestDetails?.solicitud?.pendiente_activar_empresa;
    return this.solicitudIndicadorEsSi(v)
      ? 'Pendiente activar empresa: sí'
      : 'Pendiente activar empresa: no';
  }

  severidadTagPendienteActivarEmpresa(): 'success' | 'warning' | 'danger' {
    const v = this.afiliationRequestDetails?.solicitud?.pendiente_activar_empresa;
    return this.solicitudIndicadorEsSi(v) ? 'warning' : 'success';
  }

  showProcessTab(): boolean {
    if (
      // (this.routeTab.includes(RoutesApp.PROCESS_REQUEST) ||
      //   this.routeTab.includes(RoutesApp.REQUEST_DETAILS)) &&
      this.user === this.requestDetails?.assigned_user &&
      this.requestDetails.status_name != 'Cerrada'
    ) {
      return true;
    } else {
      return false;
    }
  }

loading = false;

  /** Carga los tipos de documento desde parametros_tipo_documento_persona (solo activos). Asegura que el valor actual del afiliado esté en opciones para que se muestre. */
  loadTiposDocumentoPersona(): void {
    const persona = this.afiliationRequestDetails?.trabajador?.persona;
    const valorActual = persona?.tipo_documento;
    const asegurarValorActual = (opciones: { label: string; value: string }[]) => {
      if (valorActual && typeof valorActual === 'string' && valorActual.trim() && !opciones.some((o) => o.value === valorActual)) {
        return [{ label: valorActual.trim(), value: valorActual.trim() }, ...opciones];
      }
      return opciones;
    };
    this.userService.getTipoDocumentoPersonaList().subscribe({
      next: (res) => {
        if (res?.code === 200 && Array.isArray(res.data)) {
          const activos = res.data.filter((t) => t.esta_activo !== false);
          let opciones = activos.map((t) => ({
            label: t.tipo_documento || '',
            value: t.tipo_documento_genesys ?? t.tipo_documento ?? '',
          })).filter((o) => o.value !== '' || o.label !== '');
          let opts = asegurarValorActual(opciones);
          (this.afiliationRequestDetails?.beneficiarios ?? []).forEach((ben) => {
            const t = ben.persona?.tipo_documento;
            if (t && typeof t === 'string' && t.trim() && !opts.some((o) => o.value === t)) {
              opts = [{ label: t.trim(), value: t.trim() }, ...opts];
            }
          });
          this.opcionesTipoDocumento = opts;
        } else {
          this.opcionesTipoDocumento = valorActual ? [{ label: String(valorActual).trim(), value: String(valorActual).trim() }] : [];
        }
      },
      error: () => {
        this.opcionesTipoDocumento = valorActual ? [{ label: String(valorActual).trim(), value: String(valorActual).trim() }] : [];
      },
    });
  }

  /** Carga géneros (solo activos). Incluye el valor actual si no coincide con ningún value para que se muestre. */
  loadGeneros(): void {
    const valorActual = this.afiliationRequestDetails?.trabajador?.persona?.genero;
    const asegurar = (opciones: { label: string; value: string }[]) => {
      if (valorActual && typeof valorActual === 'string' && valorActual.trim() && !opciones.some((o) => o.value === valorActual)) {
        return [{ label: valorActual.trim(), value: valorActual.trim() }, ...opciones];
      }
      return opciones;
    };
    this.userService.getGeneroList().subscribe({
      next: (res) => {
        if (res?.code === 200 && Array.isArray(res.data)) {
          let opciones = res.data.filter((t) => t.esta_activo !== false).map((t) => ({ label: t.genero ?? '', value: t.genero ?? '' })).filter((o) => o.value !== '' || o.label !== '');
          this.opcionesGenero = asegurar(opciones);
        } else {
          this.opcionesGenero = valorActual ? [{ label: String(valorActual).trim(), value: String(valorActual).trim() }] : [];
        }
      },
      error: () => {
        this.opcionesGenero = valorActual ? [{ label: String(valorActual).trim(), value: String(valorActual).trim() }] : [];
      },
    });
  }

  /** Carga estados civiles (solo activos). Incluye el valor actual si no coincide con ningún value para que se muestre. */
  loadEstadoCivil(): void {
    const valorActual = this.afiliationRequestDetails?.trabajador?.trabajador?.estado_civil;
    const asegurar = (opciones: { label: string; value: string }[]) => {
      if (valorActual && typeof valorActual === 'string' && valorActual.trim() && !opciones.some((o) => o.value === valorActual)) {
        return [{ label: valorActual.trim(), value: valorActual.trim() }, ...opciones];
      }
      return opciones;
    };
    this.userService.getEstadoCivilList().subscribe({
      next: (res) => {
        if (res?.code === 200 && Array.isArray(res.data)) {
          let opciones = res.data.filter((t) => t.esta_activo !== false).map((t) => ({ label: t.estado_civil ?? '', value: t.estado_civil ?? '' })).filter((o) => o.value !== '' || o.label !== '');
          this.opcionesEstadoCivil = asegurar(opciones);
        } else {
          this.opcionesEstadoCivil = valorActual ? [{ label: String(valorActual).trim(), value: String(valorActual).trim() }] : [];
        }
      },
      error: () => {
        this.opcionesEstadoCivil = valorActual ? [{ label: String(valorActual).trim(), value: String(valorActual).trim() }] : [];
      },
    });
  }

  /** Carga parentescos desde parametros_parentesco (solo activos). Añade los valores actuales de los beneficiarios que no estén en la lista. */
  loadParentescos(): void {
    const beneficiarios = this.afiliationRequestDetails?.beneficiarios ?? [];
    const valoresActuales = [...new Set(beneficiarios.map((b) => (b.beneficiario?.parentesco ?? '').toString().trim()).filter(Boolean))];
    this.userService.getParentescoList().subscribe({
      next: (res) => {
        if (res?.code === 200 && Array.isArray(res.data)) {
          let opciones = res.data
            .filter((t) => t.esta_activo !== false)
            .map((t) => ({ label: t.parentesco ?? '', value: t.parentesco ?? '' }))
            .filter((o) => o.value !== '' || o.label !== '');
          valoresActuales.forEach((v) => {
            if (v && !opciones.some((o) => o.value === v || o.label === v)) {
              opciones = [{ label: v, value: v }, ...opciones];
            }
          });
          this.opcionesParentesco = opciones;
        } else {
          this.opcionesParentesco = valoresActuales.length ? valoresActuales.map((v) => ({ label: v, value: v })) : [];
        }
      },
      error: () => {
        this.opcionesParentesco = valoresActuales.length ? valoresActuales.map((v) => ({ label: v, value: v })) : [];
      },
    });
  }

getRequestDetails(request_details: number) {
  this.loading = true;

  this.userService.getRequestDetailsAfiliation(request_details).subscribe({
    next: (response) => {
      this.loading = false;

      if (response.code !== 200) {
        this.showSuccessMessage('error', 'Fallida', response.message || 'Operación fallida!');
        return;
      }

      this.afiliationRequestDetails = response.data;
      this.guardarSnapshotDatosTrabajador();
      this.guardarSnapshotBeneficiarios();
      this.initAdjuntosValoracion();
      this.loadTiposDocumentoPersona();
      this.loadGeneros();
      this.loadEstadoCivil();
      this.loadParentescos();
    },
    error: (err) => {
      this.loading = false;
      console.error(err);
      this.showSuccessMessage('error', 'Error', 'Error consultando el detalle');
    },
  });
}

  /** Inicializa el estado de valoración de adjuntos (trabajador y cada beneficiario). */
  initAdjuntosValoracion(): void {
    const d = this.afiliationRequestDetails;
    if (!d) {
      this.trabajadorAdjuntosEstado = [];
      this.beneficiariosAdjuntosEstado = [];
      return;
    }
    const mapAdjunto = (a: Adjunto) => {
      const est = (a.estado_validacion ?? '').toString().trim().toUpperCase();
      const pendiente = est === '' || est === 'PENDIENTE';
      let valoracion: ValoracionAdjunto | '' = '';
      let descripcion = '';
      if (!pendiente && est) {
        if (est === 'SI' || est === 'SÍ') valoracion = 'SI';
        else if (est === 'NO') valoracion = 'NO';
        else if (est === 'NA') valoracion = 'NA';
        else valoracion = est as ValoracionAdjunto;
        descripcion = (a.observacion_validacion ?? '').toString().trim();
      }
      return { adjunto: a, valoracion, descripcion };
    };
    const adjuntosTrabajador = d.trabajador?.adjuntos ?? [];
    this.trabajadorAdjuntosEstado = adjuntosTrabajador.map(mapAdjunto);
    this.beneficiariosAdjuntosEstado = (d.beneficiarios ?? []).map((b) =>
      (b.adjuntos ?? []).map(mapAdjunto)
    );
  }

  getAdjuntosTrabajador(): AdjuntoConValoracion[] {
    return this.trabajadorAdjuntosEstado;
  }

  getAdjuntosBeneficiario(index: number): AdjuntoConValoracion[] {
    return this.beneficiariosAdjuntosEstado[index] ?? [];
  }

  /** True si todos los adjuntos (trabajador y beneficiarios) están validados en 'SI'. Debe haber al menos un adjunto. */
  get todosAdjuntosValidadosEnSi(): boolean {
    const trabajador = this.trabajadorAdjuntosEstado ?? [];
    const beneficiarios = this.beneficiariosAdjuntosEstado ?? [];
    const todos = [...trabajador, ...beneficiarios.flat()];
    if (todos.length === 0) return false;
    return todos.every(
      (item) => (item?.adjunto?.estado_validacion ?? '').toString().trim().toUpperCase() === 'SI'
    );
  }

  /** True si el adjunto está pendiente de validación (estado_validacion vacío o PENDIENTE). */
  esAdjuntoPendienteValidacion(item: AdjuntoConValoracion): boolean {
    const est = (item?.adjunto?.estado_validacion ?? '').toString().trim().toUpperCase();
    return est === '' || est === 'PENDIENTE';
  }

  /** Etiqueta para mostrar el valor de valoración cuando no está pendiente (solo lectura). */
  getLabelValoracionAdjunto(item: AdjuntoConValoracion): string {
    const v = (item?.valoracion ?? item?.adjunto?.estado_validacion ?? '').toString().trim().toUpperCase();
    if (v === 'SI' || v === 'SÍ') return 'Sí';
    if (v === 'NO') return 'No';
    if (v === 'NA') return 'No aplica';
    return v || '—';
  }

  /** Nombre completo del beneficiario para títulos y mensajes. */
  getNombreBeneficiario(b: BeneficiarioBundle): string {
    const p = b?.persona;
    if (!p) return 'Beneficiario';
    return [p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Beneficiario';
  }

  /** Opciones de parentesco para un beneficiario; incluye el valor actual si no está en la lista. */
  getOpcionesParentescoBeneficiario(b: BeneficiarioBundle): { label: string; value: string }[] {
    const actual = (b?.beneficiario?.parentesco ?? '').toString().trim();
    if (!actual) return this.opcionesParentesco;
    if (this.opcionesParentesco.some((o) => o.value === actual || o.label === actual)) return this.opcionesParentesco;
    return [{ label: actual, value: actual }, ...this.opcionesParentesco];
  }

  /** True si el beneficiario tiene tipo de documento CE o PPT; en ese caso se permiten editar parentesco, tipo doc, número doc, primer nombre y dirección. */
  puedeEditarBeneficiarioCE_PPT(b: BeneficiarioBundle): boolean {
    const tipo = (b?.persona?.tipo_documento ?? '').toString().trim().toUpperCase();
    return tipo === 'CE' || tipo === 'PPT';
  }

  /** Dirección del trabajador (para mostrar cuando el beneficiario indica que usa la misma). */
  getDireccionTrabajador(): string {
    const d = this.afiliationRequestDetails;
    const dir = d?.trabajador?.persona?.direccion;
    return dir != null ? String(dir).trim() : '';
  }

  /** Formatea fecha para mostrar como dd/mm/yyyy. */
  formatFechaDDMMYYYY(value: string | Date | null | undefined): string {
    if (value == null) return '—';
    const d = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(d.getTime())) return '—';
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /** Guarda snapshots de los datos editables de cada beneficiario y marca cuáles tienen sección editable (CE/PPT al cargar). */
  guardarSnapshotBeneficiarios(): void {
    const list = this.afiliationRequestDetails?.beneficiarios ?? [];
    this.beneficioEditablePorIndice = list.map((b) => {
      const tipo = (b.persona?.tipo_documento ?? '').toString().trim().toUpperCase();
      return tipo === 'CE' || tipo === 'PPT';
    });
    this.snapshotBeneficiarios = list.map((b) => ({
      parentesco: b.beneficiario?.parentesco != null ? String(b.beneficiario.parentesco).trim() || null : null,
      tipo_documento: (b.persona?.tipo_documento ?? '').toString().trim(),
      numero_documento: (b.persona?.numero_documento ?? '').toString().trim(),
      primer_nombre: (b.persona?.primer_nombre ?? '').toString().trim(),
      direccion_corresponde_trabajador: b.beneficiario?.direccion_corresponde_trabajador != null ? String(b.beneficiario.direccion_corresponde_trabajador).trim() || null : null,
      direccion: b.persona?.direccion != null ? String(b.persona.direccion).trim() || null : null,
    }));
  }

  /** True si el beneficiario en el índice dado tiene la sección editable (era CE/PPT al cargar; los selectores no se ocultan al cambiar). */
  beneficioPuedeEditar(index: number): boolean {
    return this.beneficioEditablePorIndice[index] === true;
  }

  /** True si el beneficiario en el índice dado tiene cambios respecto a su snapshot (solo si tiene sección editable). */
  hayCambiosBeneficiario(index: number): boolean {
    const list = this.afiliationRequestDetails?.beneficiarios ?? [];
    const b = list[index];
    if (!b || !this.beneficioPuedeEditar(index)) return false;
    const snap = this.snapshotBeneficiarios[index];
    if (!snap) return false;
    const p = b.persona;
    const ben = b.beneficiario;
    if ((ben?.parentesco ?? '').toString().trim() !== (snap.parentesco ?? '')) return true;
    if ((p?.tipo_documento ?? '').toString().trim() !== snap.tipo_documento) return true;
    if ((p?.numero_documento ?? '').toString().trim() !== snap.numero_documento) return true;
    if ((p?.primer_nombre ?? '').toString().trim() !== snap.primer_nombre) return true;
    const dirTrab = (ben?.direccion_corresponde_trabajador ?? '').toString().trim();
    if (dirTrab !== (snap.direccion_corresponde_trabajador ?? '')) return true;
    const dir = (p?.direccion ?? '').toString().trim();
    if (dir !== (snap.direccion ?? '')) return true;
    return false;
  }

  /** Valida dirección beneficiario en sección editable: debe elegir Si/No; si elige No, la dirección es requerida. */
  direccionBeneficiarioRequeridaValida(b: BeneficiarioBundle, index: number): boolean {
    if (!this.beneficioPuedeEditar(index)) return true;
    const ben = b?.beneficiario;
    const valor = (ben?.direccion_corresponde_trabajador ?? '').toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (valor !== 'si' && valor !== 'no') return false;
    if (valor === 'no') {
      const dir = (b?.persona?.direccion ?? '').toString().trim();
      return dir.length > 0;
    }
    return true;
  }

  /** True si el beneficiario tiene "dirección corresponde al trabajador" = Sí. */
  direccionCorrespondeTrabajadorEsSi(b: BeneficiarioBundle): boolean {
    const v = (b?.beneficiario?.direccion_corresponde_trabajador ?? '').toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return v === 'si';
  }

  /** True si el beneficiario tiene "dirección corresponde al trabajador" = No. */
  direccionCorrespondeTrabajadorEsNo(b: BeneficiarioBundle): boolean {
    const v = (b?.beneficiario?.direccion_corresponde_trabajador ?? '').toString().trim().toLowerCase();
    return v === 'no';
  }

  /** Abre el diálogo de confirmación para guardar los datos del beneficiario. */
  abrirConfirmacionGuardarBeneficiario(b: BeneficiarioBundle, index: number): void {
    if (!this.beneficioPuedeEditar(index)) return;
    if (this.guardandoBeneficiarioIndex === index) return;
    if (!this.direccionBeneficiarioRequeridaValida(b, index)) return;
    this.beneficiarioAGuardar = { b, index };
    this.visibleConfirmarGuardarBeneficiario = true;
  }

  /** Cierra el diálogo de confirmación de guardar beneficiario. */
  cerrarConfirmacionGuardarBeneficiario(): void {
    this.visibleConfirmarGuardarBeneficiario = false;
    this.beneficiarioAGuardar = null;
  }

  /** Confirma y ejecuta el guardado del beneficiario. */
  confirmarGuardarBeneficiario(): void {
    const ref = this.beneficiarioAGuardar;
    this.cerrarConfirmacionGuardarBeneficiario();
    if (ref) this.guardarBeneficiario(ref.b, ref.index);
  }

  /** Guarda los cambios del beneficiario (cuando tiene sección editable, aunque haya cambiado el tipo de documento). */
  guardarBeneficiario(b: BeneficiarioBundle, index: number): void {
    if (!this.beneficioPuedeEditar(index)) return;
    const ben = b.beneficiario;
    const p = b.persona;
    if (!p) return;
    const dirTrab = (ben?.direccion_corresponde_trabajador ?? '').toString().trim();
    const dirTrabNorm = dirTrab.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (dirTrabNorm === 'no') {
      const dir = (p.direccion ?? '').toString().trim();
      if (!dir) {
        this.messageService.add({ severity: 'warn', summary: 'Campo requerido', detail: 'Cuando la dirección no corresponde a la del trabajador, debe ingresar la dirección del beneficiario.' });
        return;
      }
    }
    const d = this.afiliationRequestDetails;
    if (!d?.solicitud?.id) return;
    this.guardandoBeneficiarioIndex = index;
    const payload = {
      id_persona: p.id,
      id_solicitud: d.solicitud.id,
      tipo_documento: (p.tipo_documento ?? '').toString().trim(),
      numero_documento: (p.numero_documento ?? '').toString().trim(),
      primer_apellido: (p.primer_apellido ?? '').toString().trim(),
      segundo_apellido: p.segundo_apellido != null ? String(p.segundo_apellido).trim() || null : null,
      primer_nombre: (p.primer_nombre ?? '').toString().trim(),
      segundo_nombre: p.segundo_nombre != null ? String(p.segundo_nombre).trim() || null : null,
      fecha_nacimiento: p.fecha_nacimiento ?? null,
      genero: p.genero ?? null,
      parentesco: ben?.parentesco ?? null,
      direccion_corresponde_trabajador: dirTrab || null,
      direccion: dirTrabNorm === 'si' ? (this.getDireccionTrabajador() || null) : (p.direccion ?? null),
    };
    this.userService.updatePersonaBeneficiarioSolicitud(payload).subscribe({
      next: (res) => {
        this.guardandoBeneficiarioIndex = null;
        if (res?.code === 200) {
          this.guardarSnapshotBeneficiarios();
          this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Los datos del beneficiario se actualizaron correctamente.' });
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: res?.message || 'No se pudo actualizar.' });
        }
      },
      error: () => {
        this.guardandoBeneficiarioIndex = null;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar los cambios del beneficiario.' });
      },
    });
  }

  /**
   * True si el trabajador tiene tipo de documento CE o PPT; en ese caso se permiten editar
   * tipo documento, número documento, nombres, apellidos, fechas y género.
   */
  get puedeEditarDatosTrabajadorCE_PPT(): boolean {
    const tipo = (this.afiliationRequestDetails?.trabajador?.persona?.tipo_documento ?? '').toString().trim().toUpperCase();
    return tipo === 'CE' || tipo === 'PPT';
  }

  /** True si al cargar el trabajador tenía CE o PPT; la sección sigue editable aunque se cambie el tipo de documento. */
  private trabajadorEditablePorCarga = false;
  get trabajadorPuedeEditar(): boolean {
    return this.trabajadorEditablePorCarga;
  }

  /** True si existe al menos un beneficiario con parentesco "Cónyuge". El campo Estado civil queda editable para poder cambiar la opción. */
  get mostrarEstadoCivilEditable(): boolean {
    const d = this.afiliationRequestDetails;
    if (!d?.beneficiarios?.length) return false;
    const parentescoConyuge = (p: string | null | undefined) => {
      if (p == null) return false;
      const n = p.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return n === 'conyuge' || n.includes('conyuge');
    };
    return d.beneficiarios.some((b) => parentescoConyuge(b.beneficiario?.parentesco));
  }

  /** True solo cuando el estado civil actual es "Soltero(a)" Y hay beneficiario Cónyuge. Solo para mostrar el mensaje de alerta. */
  get tieneAlertaEstadoCivilSolteroConConyuge(): boolean {
    const d = this.afiliationRequestDetails;
    if (!d?.trabajador?.trabajador || !this.mostrarEstadoCivilEditable) return false;
    const estadoCivil = (d.trabajador.trabajador.estado_civil ?? '').toString().trim();
    return estadoCivil.toLowerCase().includes('soltero');
  }

  /** Guarda snapshot de los datos editables del afiliado y marca si la sección trabajador es editable (CE/PPT al cargar). */
  guardarSnapshotDatosTrabajador(): void {
    const d = this.afiliationRequestDetails;
    const p = d?.trabajador?.persona;
    const t = d?.trabajador?.trabajador;
    if (!p) {
      this.snapshotDatosTrabajador = null;
      this.trabajadorEditablePorCarga = false;
      return;
    }
    const tipo = (p.tipo_documento ?? '').toString().trim().toUpperCase();
    this.trabajadorEditablePorCarga = tipo === 'CE' || tipo === 'PPT';
    const norm = (v: string | Date | null | undefined): string | null => {
      if (v == null) return null;
      if (v instanceof Date) return v.toISOString().split('T')[0] ?? null;
      const s = String(v).trim();
      return s === '' ? null : s;
    };
    this.snapshotDatosTrabajador = {
      tipo_documento: (p.tipo_documento ?? '').toString().trim(),
      numero_documento: (p.numero_documento ?? '').toString().trim(),
      primer_apellido: (p.primer_apellido ?? '').toString().trim(),
      segundo_apellido: p.segundo_apellido != null ? String(p.segundo_apellido).trim() || null : null,
      primer_nombre: (p.primer_nombre ?? '').toString().trim(),
      segundo_nombre: p.segundo_nombre != null ? String(p.segundo_nombre).trim() || null : null,
      fecha_expedicion_doc: norm(p.fecha_expedicion_doc),
      fecha_nacimiento: norm(p.fecha_nacimiento),
      genero: p.genero != null ? String(p.genero).trim() || null : null,
      estado_civil: t?.estado_civil != null ? String(t.estado_civil).trim() || null : null,
    };
  }

  /** True si hay cambios en algún campo editable respecto al snapshot (solo cuando el botón Guardar está visible). */
  get hayCambiosEnDatosTrabajador(): boolean {
    if (!this.snapshotDatosTrabajador) return false;
    if (!this.trabajadorPuedeEditar && !this.mostrarEstadoCivilEditable) return false;
    const d = this.afiliationRequestDetails;
    const p = d?.trabajador?.persona;
    const t = d?.trabajador?.trabajador;
    if (!p) return false;
    const norm = (v: string | Date | null | undefined): string | null => {
      if (v == null) return null;
      if (v instanceof Date) return v.toISOString().split('T')[0] ?? null;
      const s = String(v).trim();
      return s === '' ? null : s;
    };
    const s = this.snapshotDatosTrabajador;
    if (this.trabajadorPuedeEditar) {
      if ((p.tipo_documento ?? '').toString().trim() !== s.tipo_documento) return true;
      if ((p.numero_documento ?? '').toString().trim() !== s.numero_documento) return true;
      if ((p.primer_apellido ?? '').toString().trim() !== s.primer_apellido) return true;
      const segApe = p.segundo_apellido != null ? String(p.segundo_apellido).trim() || null : null;
      if (segApe !== s.segundo_apellido) return true;
      if ((p.primer_nombre ?? '').toString().trim() !== s.primer_nombre) return true;
      const segNom = p.segundo_nombre != null ? String(p.segundo_nombre).trim() || null : null;
      if (segNom !== s.segundo_nombre) return true;
      if (norm(p.fecha_expedicion_doc) !== s.fecha_expedicion_doc) return true;
      if (norm(p.fecha_nacimiento) !== s.fecha_nacimiento) return true;
      const gen = p.genero != null ? String(p.genero).trim() || null : null;
      if (gen !== s.genero) return true;
    }
    if (this.mostrarEstadoCivilEditable && t) {
      const ec = t.estado_civil != null ? String(t.estado_civil).trim() || null : null;
      if (ec !== s.estado_civil) return true;
    }
    return false;
  }

  /** True si debe mostrarse el campo de descripción (cuando valoración es "NO"). */
  showDescripcionValoracion(valoracion: string): boolean {
    return (valoracion ?? '').toString().trim().toUpperCase() === 'NO';
  }

  /** Abre previsualización o descarga del adjunto llamando al endpoint con ruta_archivo. */
  openAdjunto(adj: Adjunto, isDownload: boolean): void {
    this.getPreSignedUrlAfiliacion(adj.ruta_archivo, adj.nombre_archivo, isDownload);
  }

  /** Obtiene URL firmada del endpoint de afiliación por ruta_archivo y abre previsualización o descarga en pantalla. */
  getPreSignedUrlAfiliacion(ruta_archivo: string, nombre_archivo: string, isDownload: boolean): void {
    const ruta = (ruta_archivo ?? '').toString().trim();
    if (!ruta) {
      this.messageService.add({ severity: 'warn', summary: 'Adjunto', detail: 'No hay ruta de archivo para este adjunto.' });
      return;
    }
    this.userService.getAdjuntoAfiliacionUrl(ruta).subscribe({
      next: (response: BodyResponse<string>) => {
        if (response?.code === 200 && response?.data) {
          const data = response.data;
          const urlString =
            typeof data === 'string'
              ? data
              : (data as any)?.url ?? (data as any)?.signedUrl ?? (data as any)?.href ?? '';
          if (!urlString || typeof urlString !== 'string') {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La respuesta del servidor no contiene una URL válida.' });
            return;
          }
          this.preSignedUrlDownload = urlString;
          this.viewerType = this.getViewerType(nombre_archivo);
          if (!isDownload) {
            if (this.viewerType === 'pdf') {
              this.isSpinnerVisible = true;
              this.displayFileInTab(this.preSignedUrlDownload, nombre_archivo);
            } else {
              this.displayPreviewModal = true;
            }
          } else {
            this.downloadFileS3(this.preSignedUrlDownload, nombre_archivo);
          }
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener la URL del adjunto.' });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener el archivo. Intente de nuevo.' });
      },
    });
  }

  /** Genera el expediente (PDF unificado de todos los adjuntos) y lo asocia al trabajador. Requiere que todos los adjuntos estén validados en 'Sí'. */
  generarExpediente(): void {
    const d = this.afiliationRequestDetails;
    if (!d?.solicitud?.id) {
      this.messageService.add({ severity: 'warn', summary: 'Expediente', detail: 'No hay solicitud cargada.' });
      return;
    }
    const idTrabajador = d.trabajador?.persona?.id ?? d.trabajador?.trabajador?.id_persona;
    if (idTrabajador == null || idTrabajador === undefined) {
      this.messageService.add({ severity: 'warn', summary: 'Expediente', detail: 'No se pudo obtener el id del trabajador.' });
      return;
    }
    const trabajador = this.trabajadorAdjuntosEstado ?? [];
    const beneficiarios = this.beneficiariosAdjuntosEstado ?? [];
    const todos = [...trabajador, ...beneficiarios.flat()];
    if (todos.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Generar expediente',
        detail: 'No hay adjuntos para generar el expediente.',
      });
      return;
    }
    if (!this.todosAdjuntosValidadosEnSi) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Generar expediente',
        detail: 'No es posible generar el expediente. Todos los adjuntos (trabajador y beneficiarios) deben estar validados en "Sí".',
      });
      return;
    }
    this.generandoExpediente = true;
    this.userService.generarExpedienteAfiliacion(d.solicitud.id, idTrabajador).subscribe({
      next: (response) => {
        if (response?.code === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Expediente generado',
            detail: 'El expediente se ha generado y asociado a la solicitud correctamente.',
          });
          this.getRequestDetails(this.request_id);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response?.message || 'No se pudo generar el expediente.',
          });
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al generar el expediente. Intente de nuevo.',
        });
      },
      complete: () => {
        this.generandoExpediente = false;
      },
    });
  }

  /** Abre el diálogo de confirmación para validar el adjunto. */
  openConfirmacionValidarAdjunto(item: AdjuntoConValoracion): void {
    if (!item?.adjunto?.id) return;
    const valoracion = (item.valoracion ?? '').toString().trim().toUpperCase();
    if (!valoracion || !['SI', 'NO', 'NA'].includes(valoracion)) {
      this.messageService.add({ severity: 'warn', summary: 'Valoración requerida', detail: 'Seleccione una valoración (Sí, No o No aplica) antes de validar.' });
      return;
    }
    if (valoracion === 'NO') {
      const desc = (item.descripcion ?? '').toString().trim();
      if (!desc) {
        this.messageService.add({ severity: 'warn', summary: 'Descripción requerida', detail: 'Cuando la valoración es No, debe indicar la descripción u observación.' });
        return;
      }
    }
    this.adjuntoAValidar = item;
    this.visibleConfirmarValidarAdjunto = true;
  }

  /** Cierra el diálogo de confirmación de validación sin guardar. */
  cerrarConfirmacionValidarAdjunto(): void {
    this.visibleConfirmarValidarAdjunto = false;
    this.adjuntoAValidar = null;
  }

  /** Abre el modal para subir adjuntos adicionales (trabajador o beneficiario por índice). */
  openModalAdjuntosAdicionales(para: 'trabajador' | number): void {
    this.adjuntosAdicionalesPara = para;
    this.archivosAdjuntosAdicionales = [];
    this.visibleModalAdjuntosAdicionales = true;
  }

  /** Cierra el modal de adjuntos adicionales. */
  closeModalAdjuntosAdicionales(): void {
    this.visibleModalAdjuntosAdicionales = false;
    this.archivosAdjuntosAdicionales = [];
    const input = this.fileInputAdjuntosAdicionalesRef?.nativeElement;
    if (input) input.value = '';
  }

  /** Título del modal según si es trabajador o beneficiario. */
  getTituloModalAdjuntosAdicionales(): string {
    if (this.adjuntosAdicionalesPara === 'trabajador') return 'Subir adjuntos adicionales - Trabajador';
    const d = this.afiliationRequestDetails;
    const b = d?.beneficiarios?.[this.adjuntosAdicionalesPara];
    const nombre = b ? this.getNombreBeneficiario(b) : `Beneficiario ${(this.adjuntosAdicionalesPara as number) + 1}`;
    return `Subir adjuntos adicionales - ${nombre}`;
  }

  /** Al seleccionar archivos en el input del modal. */
  onFileSelectedAdjuntosAdicionales(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input?.files;
    this.archivosAdjuntosAdicionales = files ? Array.from(files) : [];
  }

  /** Sube los archivos seleccionados y los agrega a la lista de adjuntos del trabajador o beneficiario. */
  subirAdjuntosAdicionales(): void {
    if (this.archivosAdjuntosAdicionales.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Archivos requeridos', detail: 'Seleccione al menos un archivo.' });
      return;
    }
    const d = this.afiliationRequestDetails;
    if (!d?.solicitud?.id) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No hay solicitud cargada.' });
      return;
    }
    const idPersona =
      this.adjuntosAdicionalesPara === 'trabajador'
        ? d.trabajador?.persona?.id
        : d.beneficiarios?.[this.adjuntosAdicionalesPara as number]?.persona?.id;
    if (!idPersona) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se encontró la persona.' });
      return;
    }
    const formData = new FormData();
    formData.append('id_solicitud', String(d.solicitud.id));
    formData.append('id_persona', String(idPersona));
    this.archivosAdjuntosAdicionales.forEach((file) => formData.append('archivos', file));
    this.subiendoAdjuntosAdicionales = true;
    this.userService.uploadAdjuntosAfiliacion(formData).subscribe({
      next: (res) => {
        this.subiendoAdjuntosAdicionales = false;
        const list = Array.isArray(res?.data) ? res.data : res?.data ? [res.data] : [];
        if (res?.code === 200 && list.length > 0) {
          const nuevos = list.map((a: Adjunto) => ({
            adjunto: a,
            valoracion: '' as ValoracionAdjunto | '',
            descripcion: '',
          }));
          if (this.adjuntosAdicionalesPara === 'trabajador') {
            this.trabajadorAdjuntosEstado.push(...nuevos);
          } else {
            const idx = this.adjuntosAdicionalesPara as number;
            if (!this.beneficiariosAdjuntosEstado[idx]) this.beneficiariosAdjuntosEstado[idx] = [];
            this.beneficiariosAdjuntosEstado[idx].push(...nuevos);
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Adjuntos subidos',
            detail: `Se agregaron ${list.length} archivo(s) correctamente.`,
          });
          this.closeModalAdjuntosAdicionales();
        } else if (res?.code === 200) {
          this.messageService.add({ severity: 'info', summary: 'Subida', detail: res?.message || 'Operación completada.' });
          this.closeModalAdjuntosAdicionales();
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: res?.message || 'No se pudieron subir los archivos.' });
        }
      },
      error: () => {
        this.subiendoAdjuntosAdicionales = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al subir los archivos.' });
      },
    });
  }

  /** Confirma y envía la validación del adjunto al servicio (actualiza estado_validacion y observacion_validacion en afiliacion_solicitud_adjunto). */
  confirmarValidarAdjunto(): void {
    const item = this.adjuntoAValidar;
    if (!item?.adjunto?.id) {
      this.cerrarConfirmacionValidarAdjunto();
      return;
    }
    const valoracion = (item.valoracion ?? '').toString().trim().toUpperCase();
    if (!['SI', 'NO', 'NA'].includes(valoracion)) {
      this.cerrarConfirmacionValidarAdjunto();
      return;
    }
    this.visibleConfirmarValidarAdjunto = false;
    this.adjuntoAValidar = null;
    this.validandoAdjuntoId = item.adjunto.id;
    const payload = {
      id: item.adjunto.id,
      id_persona: item.adjunto.id_persona,
      estado_validacion: valoracion,
      observacion_validacion: valoracion === 'NO' ? (item.descripcion ?? '').toString().trim() || null : null,
    };
    this.userService.validarAdjuntoAfiliacion(payload).subscribe({
      next: (res) => {
        this.validandoAdjuntoId = null;
        if (res?.code === 200) {
          const idAdj = payload.id;
          const estVal = payload.estado_validacion;
          const obsVal = payload.observacion_validacion ?? null;
          this.trabajadorAdjuntosEstado.forEach((x) => {
            if (x.adjunto.id === idAdj) {
              x.adjunto.estado_validacion = estVal;
              x.adjunto.observacion_validacion = obsVal;
            }
          });
          this.beneficiariosAdjuntosEstado.forEach((list) =>
            list.forEach((x) => {
              if (x.adjunto.id === idAdj) {
                x.adjunto.estado_validacion = estVal;
                x.adjunto.observacion_validacion = obsVal;
              }
            })
          );
          this.messageService.add({ severity: 'success', summary: 'Validado', detail: 'El adjunto se validó correctamente.' });
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: res?.message || 'No se pudo validar el adjunto.' });
        }
      },
      error: () => {
        this.validandoAdjuntoId = null;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al validar el adjunto.' });
      },
    });
  }

  /** Abre el diálogo de confirmación para guardar los datos del trabajador. */
  abrirConfirmacionGuardarTrabajador(): void {
    if (this.guardandoDatosTrabajador || !this.hayCambiosEnDatosTrabajador) return;
    this.visibleConfirmarGuardarTrabajador = true;
  }

  /** Cierra el diálogo de confirmación de guardar trabajador. */
  cerrarConfirmacionGuardarTrabajador(): void {
    this.visibleConfirmarGuardarTrabajador = false;
  }

  /** Confirma y ejecuta el guardado de los datos del afiliado (persona y/o estado civil). */
  confirmarGuardarTrabajador(): void {
    this.cerrarConfirmacionGuardarTrabajador();
    this.guardarDatosTrabajadorCE_PPT();
  }

  /** Guarda los cambios de datos del afiliado: persona (cuando CE/PPT) y/o estado civil (cuando alerta Soltero/Cónyuge). */
  guardarDatosTrabajadorCE_PPT(): void {
    const d = this.afiliationRequestDetails;
    if (!d?.trabajador?.persona) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'No hay datos del afiliado para guardar.' });
      return;
    }
    const idSolicitud = d.solicitud?.id;
    if (idSolicitud == null || idSolicitud === undefined) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'No se encontró el ID de la solicitud.' });
      return;
    }
    const puedeGuardarPersona = this.trabajadorPuedeEditar;
    const puedeGuardarEstadoCivil = this.mostrarEstadoCivilEditable;
    if (!puedeGuardarPersona && !puedeGuardarEstadoCivil) return;
    this.guardandoDatosTrabajador = true;
    const persona = d.trabajador.persona;
    const trim = (v: string | null | undefined) => (v != null ? String(v).trim() || null : null);
    const payload = {
      id_persona: persona.id,
      id_solicitud: idSolicitud,
      tipo_documento: trim(persona.tipo_documento) ?? '',
      numero_documento: trim(persona.numero_documento) ?? '',
      primer_apellido: trim(persona.primer_apellido) ?? '',
      segundo_apellido: trim(persona.segundo_apellido),
      primer_nombre: trim(persona.primer_nombre) ?? '',
      segundo_nombre: trim(persona.segundo_nombre),
      fecha_expedicion_doc: trim(persona.fecha_expedicion_doc),
      fecha_nacimiento: trim(persona.fecha_nacimiento),
      genero: trim(persona.genero),
      ...(puedeGuardarEstadoCivil && d.trabajador.trabajador && { estado_civil: trim(d.trabajador.trabajador.estado_civil) }),
    };
    this.userService.updatePersonaTrabajadorSolicitud(payload).subscribe({
      next: (res) => {
        this.guardandoDatosTrabajador = false;
        if (res?.code === 200) {
          this.guardarSnapshotDatosTrabajador();
          this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Los datos del afiliado se actualizaron correctamente.' });
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: res?.message || 'No se pudo actualizar.' });
        }
      },
      error: () => {
        this.guardandoDatosTrabajador = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar los cambios.' });
      },
    });
  }

get trabajadorNombreCompleto(): string {
  const p = this.afiliationRequestDetails?.trabajador?.persona;
  if (!p) return '';
  return [p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido]
    .filter(Boolean)
    .join(' ');
}

get trabajadorDocumento(): string {
  const p = this.afiliationRequestDetails?.trabajador?.persona;
  if (!p) return '';
  return `${p.tipo_documento} ${p.numero_documento}`;
}

get empresaNombre(): string {
  return this.afiliationRequestDetails?.empresa?.razon_social ?? '';
}

get empresaDocumento(): string {
  const e = this.afiliationRequestDetails?.empresa;
  if (!e) return '';
  return `${e.tipo_documento} ${e.numero_documento}`;
}




  getRequestApplicantAttachments(request_id: number) {
    const payload: Pagination = {
      request_id: request_id,
      page: this.pageApplicantAttachments,
      page_size: this.rowsApplicantAttachments,
    };
    this.userService.getRequestAttachments(payload, 'applicant').subscribe({
      next: (response: BodyResponse<RequestAttachmentsList[]>) => {
        if (response.code === 200) {
          this.requestApplicantAttachmentsList = response.data;
          this.totalRowsApplicantAttachments = Number(response.message);
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }

  extractFileSize(fileSize: string): number {
    const sizeParts = fileSize.split(' ');
    const numericSize = parseFloat(sizeParts[0]);
    const unit = sizeParts[1];

    if (unit === 'MB') {
      return numericSize;
    } else {
      return numericSize;
    }
  }

  handleBtn(fileSize: string, fileExt: string): boolean {
    if (fileExt === 'xls' || fileExt === 'xlsx' || fileExt === 'doc' || fileExt === 'docx') {
      return true; // Si la extensión es 'xls', devolver false para no mostrar el botón
    } else if (fileSize.includes('KB')) {
      return true;
    } else if (this.extractFileSize(fileSize) < 30 && fileExt === 'pdf') {
      return true;
    } else if (this.extractFileSize(fileSize) < 30 && fileExt === 'jpg') {
      return true;
    } else if (this.extractFileSize(fileSize) < 30 && fileExt === 'jpeg') {
      return true;
    } else if (this.extractFileSize(fileSize) < 30 && fileExt === 'png') {
      return true;
    } else {
      return false;
    }
  }
  getRequestAssignedAttachments(request_id: number) {
    const payload: Pagination = {
      request_id: request_id,
      page: this.pageAssignedAttachments,
      page_size: this.rowsAssignedAttachments,
    };
    this.userService.getRequestAttachments(payload, 'assigned').subscribe({
      next: (response: BodyResponse<RequestAttachmentsList[]>) => {
        if (response.code === 200) {
          this.requestAssignedAttachmentsList = response.data;
          this.totalRowsAssignedAttachments = Number(response.message);
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }
  getRequestHistoric(request_id: number) {
    const payload: Pagination = {
      request_id: request_id,
      page: this.pageHistoric,
      page_size: this.rowsHistoric,
    };
    this.userService.getRequestHistoricAfiliation(payload).subscribe({
      next: (response: BodyResponse<RequestHistoric[]>) => {
        if (response.code === 200) {
          this.requestHistoric = response.data;

          this.fillStatesDetails(this.requestHistoric);
          this.totalRowsHistoric = Number(response.message);
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }

  fillStatesDetails(request: RequestHistoric[]): void {
    if (request && request.length > 0) {
      // Lista de estados que se deben agrupar
      const estadosAgrupados = [
        'Asignada',
        'Reasignada',
        'Asignada - En revisión',
        'Reasignada - En revisión',
        'Pendiente Usuario Externo',
      ];

      // Estados predeterminados
      const estadosPredeterminados = ['Radicada', 'Gestión', 'Cerrada'];

      // Objeto para almacenar los estados agrupados con la última fecha
      const groupedStates = request.reduce(
        (acc, item) => {
          const state = item.status_name;

          if (estadosAgrupados.includes(state)) {
            // Si el estado está en la lista de agrupados, verificar la fecha más reciente
            if (
              !acc['Gestión'] ||
              new Date(acc['Gestión'].updated_date) < new Date(item.updated_date)
            ) {
              acc['Gestión'] = { ...item, status_name: 'Gestión' }; // Cambiar nombre a 'Gestión'
            }
          } else {
            // Si no está en la lista de agrupados, guardar cada estado individualmente
            acc[`${state}-${item.updated_date}`] = item;
          }
          return acc;
        },
        {} as Record<string, RequestHistoric>
      );

      // Convertir el objeto agrupado en un arreglo de eventos
      this.events = Object.values(groupedStates).map(item => ({
        state: item.status_name,
        label: item.updated_date || 'No tiene',
        stateShow: item.status_name,
      }));

      // Asegurar que los estados predeterminados estén presentes
      estadosPredeterminados.forEach(state => {
        if (!this.events.some(event => event.state === state)) {
          this.events.push({
            state: state,
            label: 'No tiene',
            stateShow: state,
          });
        }
      });

      console.log(this.events, 'bu');
      this.currentIndex = this.events.findIndex(event => event.stateShow === this.currentState);
    } else {
      console.log('No hay datos históricos disponibles.');
    }
  }

  assignRequest(request_details: RequestsDetails) {
    if (request_details.assigned_user == null || request_details.assigned_user == '') {
      this.message = 'Asignar responsable al requerimiento';
      this.buttonmsg = 'Asignar';
      request_details.request_status = 2;
    } else {
      this.message = 'Reasignar responsable al requerimiento';
      this.buttonmsg = 'Reasignar';
      request_details.request_status = 3;
    }
    this.visibleDialogInput = true;
    this.parameter = ['Usuario'];
    this.request_details = request_details;
  }

  /** Asignar/Reasignar inhabilitado si algún indicador (pendiente dirección, activar empresa, novedad restrictiva) es "Si". */
  puedeActivarBotonAsignarAfiliacion(): boolean {
    const s = this.afiliationRequestDetails?.solicitud;
    if (!s) return false;
    return afiliacionIndicadoresPermitenAsignar(s);
  }

  assignRequestAfiliation(request_details: AfiliacionRequestDetailsData) {
    if (!afiliacionIndicadoresPermitenAsignar(request_details.solicitud)) {
      this.showSuccessMessage(
        'warn',
        'Asignación no disponible',
        'No puede asignar mientras pendiente dirección, pendiente activar empresa o novedad restrictiva esté en Sí.'
      );
      return;
    }

    if (request_details.solicitud.usuario_gestion == null || request_details.solicitud.usuario_gestion == '') {
      this.message = 'Asignar responsable al requerimiento';
      this.buttonmsg = 'Asignar';
      request_details.solicitud.id_estado_solicitud = 2;
    } else {
      this.message = 'Reasignar responsable al requerimiento';
      this.buttonmsg = 'Reasignar';
      request_details.solicitud.id_estado_solicitud = 3;
    }
    this.visibleDialogInput = true;
    this.parameter = ['Usuario'];
    this.afiliationRequestDetails = request_details;
  }

  closeDialog(value: boolean) {
    this.visibleDialog = false;
    if (value) {
      //
    }
  }
  closeDialogInput(value: boolean) {
    this.visibleDialogInput = false;
    this.enableAssign = value;
    if (value) {
      // accion de eliminar
    }
  }
  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
  }
  closeDialogCharacterization(value: boolean) {
    this.visibleCharacterization = false;
  }
  setParameter(inputValue: {
    userName: string;
    userNameCompleted: string;
    mensajeReasignacion: string;
  }) {
    if (!this.enableAssign) return;
    if (this.request_details['assigned_user'] == inputValue.userName) {
      this.visibleDialogAlert = true;
      this.informative = true;
      this.message = 'Verifique el responsable a asignar';
      this.message2 =
        'Recuerde que, para realizar una reasignación, es necesario seleccionar un colaborador diferente';
      this.severity = 'danger';
      return;
    }
    this.request_details['assigned_user'] = inputValue.userName;
    this.request_details['user_name_completed'] = inputValue.userNameCompleted;
    this.request_details['mensaje_reasignacion'] = inputValue.mensajeReasignacion;

    if (inputValue) {
      this.userService.assignUserToRequest(this.request_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
          }
        },
        error: (err: any) => {
          console.log(err);
        },
        complete: () => {
          this.ngOnInit();
          console.log('La suscripción ha sido completada.');
        },
      });
    }
  }

  isValidExtension(file: File): boolean {
    const extensionesValidas = ['.jpeg', '.jpg', '.png', '.pdf', '.doc', '.xlsx', '.docx', '.xls'];
    const fileExtension = file?.name?.split('.').pop()?.toLowerCase();
    return !extensionesValidas.includes('.' + fileExtension);
  }
  openFileInput() {
    this.fileInput.nativeElement.value = ''; // Limpiar la entrada de archivos antes de abrir el cuadro de diálogo
    this.fileInput.nativeElement.click();
  }
  onFileSelected(event: any) {
    const files: FileList = event.target.files;

    for (let i = 0; i < files.length; i++) {
      if (this.fileNameList.includes(files[i].name)) {
        this.errorMensajeFile = `El archivo ${files[i].name} ya esta adjunto`;
        this.errorRepeatFile = true;
        continue;
      } else {
        const file: File = files[i];

        let fileSizeFormat: string;
        const fileName: string = file.name;
        const fileSizeInKiloBytes = file.size / 1024;
        if (fileSizeInKiloBytes < 1024) {
          fileSizeFormat = fileSizeInKiloBytes.toFixed(2) + 'KB';
        } else {
          const fileSizeMegabytes = fileSizeInKiloBytes / 1024;
          fileSizeFormat = fileSizeMegabytes.toFixed(2) + 'MB';
        }
        if (this.isValidExtension(file)) {
          this.errorMensajeFile = `El archivo ${files[i].name} tiene una extension no permitida`;
          this.errorExtensionFile = true;
          continue;
        }

        if (file.size > 20971520) {
          this.errorMensajeFile = `El archivo ${files[i].name} supera los 20MB`;
          this.errorSizeFile = true;
          continue;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64String: string = e.target.result.split(',')[1];

          const applicantAttach: ApplicantAttachments = {
            base64file: base64String,
            source_name: fileName,
            fileweight: fileSizeFormat,
            file: files[i],
          };

          this.fileNameList.push(fileName);
          this.arrayAssignedAttachment.push(applicantAttach);
        };
        reader.readAsDataURL(file);
      }
    }
    setTimeout(() => {
      this.errorRepeatFile = false;
      this.errorExtensionFile = false;
      this.errorSizeFile = false;
    }, 5000);
  }

  getAssigned(): ApplicantAttachments[] {
    return this.arrayAssignedAttachment;
  }

  clearFileInput(index: number) {
    this.fileNameList.splice(index, 1);
    this.arrayAssignedAttachment.splice(index, 1);
  }

  //ANALISIS DE ORTOGRAFÍA
  characterizeRequestNoCorreccion(request_details: RequestsDetails) {
    //this.requestProcess.get('mensage')?.setValue(this.respuestaCorregida);
    this.visibleCorreccionIaEnviar = false;
    this.request_details = request_details;
    this.visibleCharacterization = true;
  }

  characterizeRequestIA(request_details: RequestsDetails) {
    this.requestProcess.get('mensage')?.setValue(this.respuestaCorregida);
    this.visibleCorreccionIaEnviar = false;
    this.request_details = request_details;
    this.visibleCharacterization = true;
  }

  characterizeRequest(request_details: RequestsDetails) {
    this.request_details = request_details;
    this.visibleCharacterization = true;
  }

  submitAnswer() {
    let payloadAnswer: answerRequest;

    const userNameCompleted = this.PERFIL === 'NIYARAKI' ? '' : this.requestDetails?.user_name_completed;

    if (this.requestDetails?.contact_cellphone === true && this.requestDetails?.contact_email === false){
      payloadAnswer = {
      request_id: this.request_id,
      request_status: 4,
      request_answer:
        'Solicitud N.' + this.requestDetails.request_id + ': ' +
        this.requestProcess.get('mensage')?.value +
        ' \n \nCordialmente, ' +
        //this.requestDetails?.user_name_completed,
        userNameCompleted,
      assigned_attachments: null,
      contact_cellphone: this.requestDetails?.contact_cellphone,
      applicant_cellphone: this.requestDetails?.applicant_cellphone,
      contact_email: this.requestDetails?.contact_email,
    };
    } else {
      payloadAnswer = {
      request_id: this.request_id,
      request_status: 4,
      request_answer:
        this.requestProcess.get('mensage')?.value +
        ' \n \nCordialmente, ' +
        //this.requestDetails?.user_name_completed,
        userNameCompleted,
      assigned_attachments: null,
      contact_cellphone: this.requestDetails?.contact_cellphone,
      applicant_cellphone: this.requestDetails?.applicant_cellphone,
      contact_email: this.requestDetails?.contact_email,
    };
    }

    

    this.userService.answerRequest(payloadAnswer).subscribe({
      next: (response: BodyResponse<string>) => {
        if (response.code === 200) {
          this.requestProcess.reset();
          if (this.getAssigned().length == 0) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
            this.router.navigate([RoutesApp.PROCESS_REQUEST]);
          } else {
            //this.attachAssignedFiles();
            this.uploadAllFiles();
            this.router.navigate([RoutesApp.PROCESS_REQUEST]);
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          }
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        this.requestProcess.reset();
        this.fileNameList = [];
        this.ngOnInit();
        console.log('La suscripción ha sido completada.');
      },
    });
  }

  //MEJORA 2025
  async getPreSignedUrl(file: ApplicantAttachments): Promise<string> {
    const payload = {
      source_name: file.source_name.replace(/(?!\.[^.]+$)\./g, '_'), // Evitar caracteres conflictivos
      fileweight: file.fileweight,
      content_type: file.file?.type || 'application/octet-stream',
      request_id: this.request_id,
    };

    const MAX_RETRIES = 3;
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
      try {
        const response = await firstValueFrom(this.userService.getUrlSigned(payload, 'assigned'));

        if (response.code === 200 && response.data) {
          return response.data; // Retornar la URL sin asignarla a this.preSignedUrl
          //file.preSignedUrl = response.data;
          //this.uploadToPresignedUrl(file);
        } else {
          console.error(`Intento ${attempts + 1}: Error al obtener URL prefirmada`, response);
        }
      } catch (error) {
        console.error(
          `Intento ${attempts + 1}: Falló la solicitud para obtener la URL prefirmada`,
          error
        );
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2s antes de reintentar
    }

    throw new Error('No se pudo obtener la URL prefirmada después de múltiples intentos');
  }

  //MEJORA 2025
  async getPreSignedUrlPending(file: ApplicantAttachments): Promise<string> {
    const payload = {
      source_name: file.source_name.replace(/(?!\.[^.]+$)\./g, '_'), // Evitar caracteres conflictivos
      fileweight: file.fileweight,
      content_type: file.file?.type || 'application/octet-stream',
      request_id: this.request_id,
    };

    const MAX_RETRIES = 3;
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
      try {
        const response = await firstValueFrom(this.userService.getUrlSigned(payload, 'pending'));

        if (response.code === 200 && response.data) {
          return response.data; // Retornar la URL sin asignarla a this.preSignedUrl
        } else {
          console.error(`Intento ${attempts + 1}: Error al obtener URL prefirmada`, response);
        }
      } catch (error) {
        console.error(
          `Intento ${attempts + 1}: Falló la solicitud para obtener la URL prefirmada`,
          error
        );
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2s antes de reintentar
    }

    throw new Error('No se pudo obtener la URL prefirmada después de múltiples intentos');
  }


  //MEJORA 2025
  async uploadToPresignedUrl(file: ApplicantAttachments): Promise<void> {

    if (!file || !file.file) {
      console.error('El archivo no es válido o está undefined.');
      return;
    }

    if (!file.preSignedUrl) {
      console.error(`No se encontró una URL prefirmada para el archivo: ${file.source_name}`);
      return;
    }

    try {
      const contentType = file.file?.type || 'application/octet-stream'; // Detectar MIME type
      console.log('CONTENT-TYPE', contentType);
      const MAX_RETRIES = 3;
      const RETRY_DELAY_MS = 2000;

      console.log('Subiendo archivo:', file.file.name);
      console.log('Usando URL prefirmada:', file.preSignedUrl);

      const upload$ = this.http
        .put(file.preSignedUrl, file.file, {
          headers: { 'Content-Type': contentType },
          reportProgress: true,
          observe: 'events',
        })
        .pipe(
          retryWhen(errors =>
            errors.pipe(
              tap((error: HttpErrorResponse) => {
                const errorDetails = {
                  status: error.status,
                  statusText: error.statusText,
                  message: error.message,
                  url: error.url,
                };
                console.error(`Intento fallido (${error.status}):`, errorDetails);

                // Solo reintentar en errores temporales
                if (![500, 502, 503, 504, 429].includes(error.status)) {
                  throw error; // Detener reintentos en errores definitivos
                }
              }),
              delay(RETRY_DELAY_MS),
              take(MAX_RETRIES),
              catchError(err => {
                console.error('Error después de múltiples intentos:', err);
                return throwError(() => err);
              })
            )
          )
        );

      await lastValueFrom(upload$);
      console.log(`Archivo ${file.file.name} subido correctamente.`);
    } catch (error) {
      console.error('Falló la subida del archivo:', error);
    } finally {
      //this.isSpinnerVisible = false;
    }
  }

  async attachAssignedFiles() {
    await Promise.all(
      this.arrayAssignedAttachment.map(async item => {
        item.preSignedUrl = await this.getPreSignedUrl(item);
      })
    );
  }

  async uploadAllFiles() {
    await this.attachAssignedFiles(); // Espera que se obtengan todas las URLs

    // Subimos los archivos
    for (const file of this.arrayAssignedAttachment) {
      await this.uploadToPresignedUrl(file);
    }
  }

  async attachAssignedFilesPending() {
    await Promise.all(
      this.arrayAssignedAttachmentPending.map(async item => {
        item.preSignedUrl = await this.getPreSignedUrlPending(item);
      })
    );
  }

  async uploadAllFilesPending() {
    await this.attachAssignedFilesPending(); // Espera que se obtengan todas las URLs

    // Subimos los archivos
    for (const file of this.arrayAssignedAttachmentPending) {
      await this.uploadToPresignedUrl(file);
    }
  }
  ///////////////////////////////////////////////////////////////////////////////

  setParameterCharacterization(payload: CharacterizationCreate) {
    this.userService.characterizeRequest(payload).subscribe({
      next: (response: BodyResponse<string>) => {
        if (response.code === 200) {
          this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        this.submitAnswer();
        console.log('La suscripción ha sido completada.');
      },
    });
  }
  downloadFileS3(preSignedUrl: string, file_name: string): void {
    this.userService.downloadFileFromS3(preSignedUrl).subscribe(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = file_name;
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
      }, 0);
    });
  }
  displayFileInTab(preSignedUrl: string, file_name: string): void {
    this.userService
      .downloadFileFromS3(preSignedUrl)
      .toPromise()
      .then((blob: Blob | undefined) => {
        if (blob) {
          return this.blobToBase64(blob);
        } else {
          throw new Error('Downloaded file is undefined');
        }
      })
      .then((base64String: string) => {
        const fileType = file_name.split('.');
        const file_extension = fileType[fileType.length - 1];
        const dataUrl = 'data:application/pdf;base64,' + base64String;
        this.convertBase64ToBlobAndOpenInNewTab(base64String, file_name, file_extension);
      })
      .catch(error => {
        console.error('Error downloading file:', error);
      });
  }
  convertBase64ToBlobAndOpenInNewTab(
    base64String: string,
    fileName: string,
    file_extension: string
  ): void {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    let mimeType;
    if (file_extension === 'pdf') {
      mimeType = 'application/' + file_extension;
    } else {
      mimeType = 'image/' + file_extension;
    }

    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    //const newTab = window.open(url, '_blank');

    // Definir las dimensiones de la ventana emergente
    const windowWidth = 800;
    const windowHeight = 600;

    // Calcular la posición centrada
    const left = window.screen.width / 2 - windowWidth / 2;
    const top = window.screen.height / 2 - windowHeight / 2;

    // Definir las características de la nueva ventana con las posiciones calculadas
    const windowFeatures = `width=${windowWidth},height=${windowHeight},scrollbars=yes,resizable=yes,left=${left},top=${top}`;
    this.isSpinnerVisible = false;
    // Abrir la nueva ventana con las características definidas
    const newWindow = window.open(url, 'miventana', windowFeatures);

    URL.revokeObjectURL(url);
  }
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data: string = reader.result as string;
        // Remove the header (data:image/png;base64,) to get only the base64-encoded content
        const base64Content = base64Data.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = error => {
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  }

  addBase64Header(base64Data: string, fileName: string): string {
    const fileType = fileName.split('.')[-1];
    return `data:${fileType};base64,${base64Data.split(',')[1]}`;
  }

  async getPreSignedUrlToDownload(url: string, file_name: string, is_download: boolean) {
    const payload = { url: url };
    this.userService.getUrlSigned(payload, 'download').subscribe({
      next: (response: BodyResponse<string>): void => {
        if (response.code === 200) {
          this.preSignedUrlDownload = response.data;
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
        this.viewerType = this.getViewerType(file_name);
        if (!is_download) {
          if (this.viewerType == 'pdf') {
            this.isSpinnerVisible = true;
            this.displayFileInTab(this.preSignedUrlDownload, file_name);
          } else {
            this.displayPreviewModal = true;
          }
        } else {
          this.downloadFileS3(this.preSignedUrlDownload, file_name);
        }
        return this.preSignedUrlDownload;
      },
    });
  }

  getViewerType(file_name: string): 'google' | 'office' | 'image' | 'pdf' {
    const extension = file_name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'docx':
      case 'doc':
      case 'xlsx':
      case 'xls':
        return 'office';
      case 'png':
      case 'jpg':
      case 'jpeg':
        return 'image';
      default:
        return 'google'; // Valor predeterminado
    }
  }

  showModalRadicada() {
    this.dialogHeader = 'Descripción de la solicitud';
    this.dialogContent = this.requestDetails?.request_description || '';
    this.isDialogVisible = true;
  }

  showModalPriorizada() {
    this.dialogHeader = 'Descripción de la solicitud';
    this.dialogContent = this.requestDetails?.request_description || '';
    this.isDialogVisible = true;
  }

  showModal() {
    this.dialogHeader = 'Respuesta de la cerrada';
    // this.dialogContent = this.requestDetails?.request_answer || '';
    this.dialogContent = this.requestDetails?.messages_closed || '';
    this.isDialogVisible = true;
  }

  showModalReasignada(user_name: string) {
    this.dialogHeader = 'Descripción de la reasignación';
    this.requestHistoric.forEach((request: RequestHistoric) => {
      if (user_name === request.user_name_completed && request.status_name === 'Reasignada') {
        this.dialogContent = request.answer_request;
      }
    });
    this.isDialogVisible = true;
  }

  showModalReview(user_name: string, request_name: string) {
    this.dialogHeader = 'Descripción de la revisión';
    this.requestHistoric.forEach((request: RequestHistoric) => {
      if (user_name === request.user_name_completed && request.status_name === request_name) {
        this.dialogContent = request.answer_request;
      }
    });
    this.isDialogVisible = true;
  }

  respuestaSugeridaIa(requestDescription: string) {
    this.userService.respuestaIaWs(this.requestDetails?.request_description).subscribe(response => {
      if (response.statusCode === 200) {
        // El cuerpo de la respuesta está en response.body y es un string JSON
        const responseBody = response.body;

        try {
          // Analizar el cuerpo JSON
          const parsedBody = JSON.parse(responseBody);

          // Extraer los datos
          const categoria = parsedBody.categoria || 'Categoría no disponible';
          let respuestaPredefinida = parsedBody.respuestaPredefinida || 'Respuesta no disponible';

          // Reemplazar los asteriscos por el nombre del usuario
          // if (this.requestDetails && this.requestDetails.user_name_completed) {
          //   const userName = this.requestDetails.user_name_completed;

          //   respuestaPredefinida = respuestaPredefinida.replace(/\*+ */g, userName);
          // }

          // Asignar estos valores a variables locales o a propiedades del componente
          this.categoria = categoria;
          this.respuestaPredefinida = respuestaPredefinida;

          // Mostrar el modal
          this.visibleDialogIa = true;
          this.informative = true;
        } catch (error) {
          console.error('Error al procesar la respuesta del servicio:', error);
        }
      } else {
        console.error('Error en la respuesta del servicio:', response);
      }
    });
  }

  confirmarRespuesta() {
    // Reemplaza los asteriscos en la respuesta con el nombre del usuario
    const userName = this.requestDetails?.user_name_completed || '';
    const respuestaConNombre = 'Hola, buen día!\n \n' + this.respuestaPredefinida;
    // ' \n \nCordialmente, ' +
    // this.requestDetails?.user_name_completed;

    // Establece el valor del textarea en el formulario
    this.requestProcess.get('mensage')?.setValue(respuestaConNombre);

    // Cierra el modal
    this.visibleDialogIa = false;
  }

  cancelar() {
    this.visibleDialogIa = false;
  }

  guardarBorrador(requestDetails: RequestsDetails) {
    this.userService.checkServiceAvailability().subscribe(isAvailable => {
      if (isAvailable) {
        console.log('Servicio disponible en este momento.');
        this.correccionSugeridaIa(requestDetails);
      } else {
        console.error('El servicio no está disponible en este momento.');
        this.showSuccessMessage('error', 'Fallida', 'IA no disponible en este momento!');
      }
    });
  }

  correccionSugeridaIa(requestDetails: RequestsDetails) {
    const respuestaForm = this.requestProcess.get('mensage')?.value;

    this.userService.correccionIaWs(respuestaForm).subscribe(response => {
      if (response.statusCode === 200) {
        // El cuerpo de la respuesta está en response.body y es un string JSON
        const responseBody = response.body;

        try {
          // Analizar el cuerpo JSON
          const parsedBody = JSON.parse(responseBody);

          // Extraer los datos
          const respuesta = JSON.parse(parsedBody.respuesta) || 'Respuesta no disponible';

          // Asignar estos valores a variables locales o a propiedades del componente
          this.respuestaCorregida = respuesta.texto_corregido;
          this.palabrasError = respuesta.palabras_con_errores;
          this.respuestaSolicitud = respuestaForm;
          this.errores = respuesta.errores_encontrados;

          // Mostrar el modal si hay errores
          if (this.errores) {
            this.visibleCorreccionIa = true;
            this.informative = true;
          } else {
            this.borradorRespuesta(requestDetails.request_id);
          }
        } catch (error) {
          console.error('Error al procesar la respuesta del servicio:', error);
        }
      } else {
        console.error('Error en la respuesta del servicio:', response);
      }
    });
  }

  correccionSugeridaIaEnviar(requestDetails: RequestsDetails) {
    const respuestaForm = this.requestProcess.get('mensage')?.value;
    console.log(respuestaForm);

    this.userService
      .correccionIaWs(respuestaForm)
      .pipe(
        catchError(error => {
          console.error('Error en el servicio de corrección:', error);
          this.characterizeRequest(requestDetails); // Se ejecuta en caso de error
          return of(null); // Retorna un observable vacío para evitar la interrupción
        })
      )
      .subscribe(response => {
        if (response?.statusCode === 200) {
          try {
            const parsedBody = JSON.parse(response.body);
            const respuesta = JSON.parse(parsedBody.respuesta) || 'Respuesta no disponible';

            this.respuestaCorregida = respuesta.texto_corregido;
            this.palabrasError = respuesta.palabras_con_errores;
            this.respuestaSolicitud = respuestaForm;
            this.errores = respuesta.errores_encontrados;

            console.log(this.respuestaCorregida);
            console.log(this.palabrasError);
            console.log(this.errores);

            if (this.errores) {
              this.visibleCorreccionIaEnviar = true;
              this.informative = true;
            } else {
              this.characterizeRequestIA(requestDetails);
            }
          } catch (error) {
            console.error('Error al procesar la respuesta del servicio:', error);
            this.characterizeRequest(requestDetails); // Se ejecuta si hay un error en el parseo
          }
        } else {
          console.error('Error en la respuesta del servicio:', response);
          this.characterizeRequest(requestDetails); // Se ejecuta si la respuesta no es 200
        }
      });
  }

  confirmarCorreccion() {
    console.log(this.respuestaCorregida);
    // Establece el valor del textarea en el formulario
    this.requestProcess.get('mensage')?.setValue(this.respuestaCorregida);

    // Cierra el modal
    this.visibleCorreccionIa = false;
  }

  /*
  cancelarCorreccion() {
    this.visibleCorreccionIa = false;
  } */

  cancelarCorreccionEnviar(requestDetails: RequestsDetails) {
    this.visibleCorreccionIaEnviar = false;
    this.characterizeRequest(requestDetails);
  }

  consultarWs(cedula: string) {
  this.userService.respuestaInfoAfiliacion(cedula).subscribe(
    response => {
      if (response.statusCode === 200) {
        const parsedBody = JSON.parse(response.body);
        console.log('Respuesta completa del WS:', parsedBody);

        const data = parsedBody; // ya no accedas a parsedBody.data porque tus datos están directo ahí

        console.log('Tipo documento:', data.tipodoc);
        console.log('Documento:', data.documento);
        console.log('Nombre:', data.nombre);
        console.log('Fecha nacimiento:', data.fechanac);
        console.log('Estado:', data.estado);
        console.log('Tipo trabajador:', data.tipotr);
        console.log('Empresa:', data.empresa?.razonSocial);
        console.log('Fecha afiliación:', data.fechaafi);
        console.log('Fecha ingreso:', data.fechaing);
      } else {
        console.warn('El servicio no respondió con status 200:', response);
      }
    },
    error => {
      console.error('Error al llamar al servicio:', error);
    }
  );
}



  getTipoTrabajadorTexto(tipo: string): string {
    switch (tipo) {
      case 'T':
        return 'TRABAJADOR DEPENDIENTE';
      case 'A':
      case 'N':
        return 'TRABAJADOR INDEPENDIENTE';
      case 'J':
      case 'P':
      case 'G':
      case 'B':
        return 'PENSIONADO';
      case 'D':
        return 'DESEMPLEADO PARA SERVICIOS';
      default:
        return '';
    }
  }

  getTipoDocumentoTexto(tipo: string): string {
    switch (tipo) {
      case 'C':
        return 'CEDULA CIUDADANIA';
      case 'E':
        return 'CEDULA EXTRANJERIA';
      case 'v':
        return 'PERMISO ESPECIAL PERMANENCIA';
      case 'M':
        return 'PERMISO PROTECCION TEMPORAL';
      case 'P':
        return 'PASAPORTE';
      default:
        return '';
    }
  }

  // requestDetails: RequestsDetails
  borradorRespuesta(request_id: number = 0) {
    //const respuestaBorrador = this.requestProcess.get('mensage')?.value;
    // this.requestProcess.get('mensage')?.setValue(this.respuestaCorregida);
    const respuestaBorrador = this.requestProcess.get('mensage')?.value;

    const payload: RequestAnswerTemp = {
      request_id: request_id,
      mensaje_temp: respuestaBorrador || '',
    };

    this.userService.createAnswerTemp(payload).subscribe({
      next: (response: BodyResponse<string>): void => {
        if (response.code === 200) {
          this.respuestaTemp = response.data;

          //Evita el bucle: al actualizar el formulario, usamos emitEvent: false
          this.requestProcess.get('mensage')?.setValue(respuestaBorrador, { emitEvent: false });
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        this.existEraserAsnwer = true;
        // console.log('La suscripción ha sido completada.');
        // this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
        // return this.respuestaTemp;
      },
    });
    this.visibleCorreccionIa = false;
  }

  borradorRespuestaNoCorregida(requestDetails: RequestsDetails) {
    const respuestaBorrador = this.requestProcess.get('mensage')?.value;
    const payload: RequestAnswerTemp = {
      request_id: requestDetails.request_id,
      mensaje_temp: respuestaBorrador || '',
    };

    this.userService.createAnswerTemp(payload).subscribe({
      next: (response: BodyResponse<string>): void => {
        if (response.code === 200) {
          this.respuestaTemp = response.data;
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        this.existEraserAsnwer = true;
        console.log('La suscripción ha sido completada.');
        this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
        return this.respuestaTemp;
      },
    });
    this.visibleCorreccionIa = false;
  }

  getAnswerTemp(request_id: number) {
    const payload: RequestAnswerTemp = {
      request_id: request_id,
      mensaje_temp: '',
    };
    this.userService.getAnswerTemp(payload).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.respuestaTemp = response.data[0].request_answer_temp;
          if (this.respuestaTemp !== '') {
            this.requestProcess.get('mensage')?.setValue(this.respuestaTemp);
            this.existEraserAsnwer = true;
          }
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        return this.respuestaTemp;
      },
    });
  }

  solicitudPendiente() {
    this.visibleSolicitudPendiente = true;
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach(file => this.selectedFilesPending.push(file));
    }
  }

  //PROCESO PARA DEJAR UNA SOLICUTD PENDIENTE
  onSubmit1(): void {
    const formData = new FormData();
    formData.append('message', this.pendingRequestForm.get('message')?.value);

    // Agregar todos los archivos al FormData
    this.selectedFilesPending.forEach(file => formData.append('files', file));

    console.log('Formulario enviado:', this.requestDetails?.status_name);
    console.log('Mensaje:', this.pendingRequestForm.get('message')?.value);
    //console.log('Formulario enviado:', formData);

    // Aquí enviarías los datos al backend
    // this.myService.submitRequest(formData).subscribe(response => ...);

    // Cerrar el diálogo después de enviar
    this.closeDialogPending();
  }

  //REALIZA PROCESO DE PONER SOLICITUD EN PENDIENTE
  onSubmit(): void {
    if (this.pendingRequestForm.valid) {
      // Captura el valor del formulario
      const formValue = this.pendingRequestForm.value;

      // Prepara FormData para incluir archivos y datos
      const formData = new FormData();
      formData.append('message', formValue.message);

      // Agrega los archivos seleccionados al FormData
      this.selectedFilesPending.forEach(file => {
        formData.append('files', file);
      });

      // Llama al servicio para enviar los datos
      const token = this.generateToken();

      console.log(token);

      const payload: PendingRequest = {
        request_id: this.requestDetails?.filing_number || 0,
        token: token,
        pending: true,
        message: this.pendingRequestForm.get('message')?.value,
        previus_state: this.requestDetails?.status_name,
        user_action: this.user
      };

      //console.log(payload);

      this.userService.registerPendingRequest(payload).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            if (this.getAssignedPending().length == 0) {
              this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
              this.router.navigate([RoutesApp.PROCESS_REQUEST]);
              this.ngOnInit();
            } else {
              //this.attachAssignedFilesPending();
              this.uploadAllFilesPending();
              this.router.navigate([RoutesApp.PROCESS_REQUEST]);
              this.ngOnInit();
              this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
            }
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
          }
        },
        error: (err: any) => {
          console.log(err);
        },
        complete: () => {
          console.log('La suscripción ha sido completada.');
          console.log('Solicitud en estado pendiente');
          this.closeDialogPending();
          this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
        },
      });
    } else {
      this.pendingRequestForm.markAllAsTouched(); // Marca los campos para mostrar errores
    }
  }

  closeDialogPending(): void {
    this.visibleSolicitudPendiente = false;
    this.pendingRequestForm.reset();
    this.selectedFile = null;
  }

  removeFile(index: number): void {
    this.selectedFilesPending.splice(index, 1);
  }

  generateToken() {
    const uuid = uuidv4().replace(/-/g, '');

    // Crear la fecha local
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const formattedDate = `${year}${month}${day}T${hours}${minutes}${seconds}`;

    // UUID + fecha
    const token = `${uuid}${formattedDate}`;
    return token;
  }

  openFileInputPending() {
    this.fileInputPending.nativeElement.value = ''; // Limpiar la entrada de archivos antes de abrir el cuadro de diálogo
    this.fileInputPending.nativeElement.click();
  }

  onFileSelectedPending(event: any) {
    const filesPending: FileList = event.target.files;

    for (let i = 0; i < filesPending.length; i++) {
      if (this.fileNameListPending.includes(filesPending[i].name)) {
        this.errorMensajeFile = `El archivo ${filesPending[i].name} ya esta adjunto`;
        this.errorRepeatFile = true;
        continue;
      } else {
        const file: File = filesPending[i];

        let fileSizeFormat: string;
        const fileName: string = file.name;
        const fileSizeInKiloBytes = file.size / 1024;
        if (fileSizeInKiloBytes < 1024) {
          fileSizeFormat = fileSizeInKiloBytes.toFixed(2) + 'KB';
        } else {
          const fileSizeMegabytes = fileSizeInKiloBytes / 1024;
          fileSizeFormat = fileSizeMegabytes.toFixed(2) + 'MB';
        }
        if (this.isValidExtension(file)) {
          this.errorMensajeFile = `El archivo ${filesPending[i].name} tiene una extension no permitida`;
          this.errorExtensionFile = true;
          continue;
        }

        if (file.size > 20971520) {
          this.errorMensajeFile = `El archivo ${filesPending[i].name} supera los 20MB`;
          this.errorSizeFile = true;
          continue;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64String: string = e.target.result.split(',')[1];

          const applicantAttach: ApplicantAttachments = {
            base64file: base64String,
            source_name: fileName,
            fileweight: fileSizeFormat,
            file: filesPending[i],
          };

          this.fileNameListPending.push(fileName);
          this.arrayAssignedAttachmentPending.push(applicantAttach);
        };
        reader.readAsDataURL(file);
      }
    }
    setTimeout(() => {
      this.errorRepeatFile = false;
      this.errorExtensionFile = false;
      this.errorSizeFile = false;
    }, 5000);

    console.log(this.getAssignedPending());
  }

  getAssignedPending(): ApplicantAttachments[] {
    return this.arrayAssignedAttachmentPending;
  }

  clearFileInputPending(index: number) {
    this.fileNameListPending.splice(index, 1);
    this.arrayAssignedAttachmentPending.splice(index, 1);
  }

  envioCorreoMasivo() {
    this.visibleSolicitudEnvioMasivo = true;
  }

  closeDialogenvioCorreoMasivo(): void {
    this.visibleSolicitudEnvioMasivo = false;
    this.emailList = []; // Limpia la lista de correos
    this.errorMessage = '';
    this.envioMasivoForm.reset();
  }

  // Añadir correo a la lista
  addEmail(): void {
    const email = this.envioMasivoForm.get('email')?.value;

    // Validar si el campo de correo no está vacío y tiene un formato de correo válido
    if (!email || !this.isValidEmail(email)) {
      this.errorMessage = 'Debe introducir un correo válido.';
      return; // Detiene la ejecución si el correo no es válido
    }

    // Verificar si el correo ya está en la lista
    if (this.emailList.includes(email)) {
      this.errorMessage = 'El correo ya está en la lista.';
      return;
    }

    // Añadir el correo a la lista si es válido
    this.emailList.push(email);
    this.envioMasivoForm.get('email')?.reset(); // Limpiar el campo de correo
    this.errorMessage = ''; // Limpiar cualquier mensaje de error
  }

  // Función para verificar si el correo tiene un formato válido
  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  // Eliminar correo de la lista
  removeEmail(index: number) {
    this.emailList.splice(index, 1);
  }

  onSubmitRepuestaMasivo(): void {
    if (!this.emailList || this.emailList.length === 0) {
      this.errorMessage = 'Debe añadir al menos un correo antes de enviar.';
      return;
    }

    const payload: sendEmail = {
      request_id: this.requestDetails?.filing_number || 0,
      email: this.emailList,
    };

    this.userService.sendEmailAll(payload).subscribe({
      next: (response: BodyResponse<string>) => {
        if (response.code === 200) {
          this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
        this.closeDialogenvioCorreoMasivo();
      },
    });
  }

  isValidDate(value: string): boolean {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  solicitudHistory() {
    this.visibleHistory = true;
  }

  closeDialogHistory(): void {
    this.visibleHistory = false;
  }

  getHistoryRequest(request_id: number) {
    const payload: requestHistoryRequest = {
      request_id: request_id,
    };
    this.userService.getHistoryRequest(payload).subscribe({
      next: (response: BodyResponse<historyRequest[]>) => {
        if (response.code === 200) {
          this.historyData = response.data;
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }

  // Proceso para guardar automaticamente respuesta cuando cambia de pestaña
  // onTabChange(event: any) {
  //   const mensajeActual = this.requestProcess.get('mensage')?.value;
  //   this.cancelAutoSave = false;

  //   if (mensajeActual !== '') {
  //     // Verifica si el mensaje cambió antes de guardar
  //     if (mensajeActual && mensajeActual !== this.ultimaRespuestaGuardada) {
  //       if (this.isInitialized) {
  //         this.borradorRespuesta(this.request_id);
  //         this.ultimaRespuestaGuardada = mensajeActual; // Actualiza el valor guardado
  //         this.isInitializedView = true;
  //       }
  //     }
  //   }
  //   this.isInitialized = true;
  // }

  //Metodos para darle prioridad a un radicado
  sendPriority() {
    this.isVisibleSolicitudPrioridad = true;
  }

  closeDialogPriority(): void {
    this.isVisibleSolicitudPrioridad = false;
    this.esPrioridadForm.reset();
  }

  onSubmitPriority(): void {
    const payload: RequestAnswerTemp = {
      request_id: this.requestDetails?.filing_number || 0,
      mensaje_temp: this.esPrioridadForm.get('message')?.value,
    };

    this.userService.getRequestPriority(payload).subscribe({
      next: (response: BodyResponse<string>) => {
        if (response.code === 200) {
          this.isVisibleSolicitudPrioridad = false;
          this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.error('Error en la solicitud:', err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
        this.closeDialogenvioCorreoMasivo();
      },
    });
  }

  // Nueva función que usa Promesas (para tu flujo de descarga en ZIP)
  async getPreSignedUrlToDownloadPromise(url: string, fileName: string, isDownload: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
      const payload = { url: url };
      this.userService.getUrlSigned(payload, 'download').subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            resolve(response.data);  // Resolvemos con la URL prefirmada
          } else {
            reject('Operación fallida');
          }
        },
        error: (err) => {
          reject(err);  // Rechazamos en caso de error
        }
      });
    });
  }

  async downloadAttachmentsAsZip() {
    const zip = new JSZip();
    const filingNumber = this.requestDetails?.filing_number || 'radicado';
    const attachments = this.requestApplicantAttachmentsList;
    const zipFolder = zip.folder(filingNumber.toString());
  
    try {
      await Promise.all(attachments.map(async (attachment) => {
        const presignedUrl = await this.getPreSignedUrlToDownloadPromise(attachment.url, attachment.file_name, false); // obtenemos la URL
        const fileBlob = await this.downloadFileBlob(presignedUrl); // descargamos el blob
        zipFolder?.file(attachment.file_name, fileBlob); // agregamos al zip
      }));
  
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = `${filingNumber}_archivos.zip`;
      downloadLink.click();
    } catch (error) {
      console.error('Error al descargar archivos:', error);
    }
  }
  
  async downloadFileBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error al descargar archivo');
    }
    const blob = await response.blob();
    return blob;
  }

  verAdjunto(a: any) {
  // aquí luego llamas tu endpoint para presigned URL y abres window.open(url)
  console.log('Adjunto:', a);
}

  
}
