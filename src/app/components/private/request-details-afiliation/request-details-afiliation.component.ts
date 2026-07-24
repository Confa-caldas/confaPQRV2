import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  ApplicantAttach,
  ApplicantAttachments,
  CharacterizationCreate,
  AfiliationIntegranteHistoriaGestionRow,
  AfiliationSolicitudHistoriaGestionRow,
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
  PadreBiologicoRecord,
  NovedadCalidadDatosIntegrante,
  Adjunto,
  AdjuntoTipoPorParentesco,
  PresignAdjuntoAdicionalData,
  BeneficiarioBundle,
  TrabajadorBundle,
  ParametroParentesco,
  AdjuntoConValoracion,
  ValoracionAdjunto,
  afiliacionIndicadoresPermitenAsignar,
  MENSAJE_TOOLTIP_ASIGNAR_AFILIACION_INHABILITADA,
  mensajeTooltipAsignarAfiliacionPorFila,
  ActualizarEstadoGestionAfiliacionPayload,
  RequestStatusAfiliationList,
  RequestsListAfiliation,
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
import { catchError, retryWhen, delay, take, tap, finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import JSZip from 'jszip';

interface NovedadCalidadFilaVista {
  campoLabel: string;
  registraduria: string;
  genesys: string;
  novedad: string;
}

/** Una novedad de calidad lista para la UI (nombre, rol y filas desde `diferencias`). */
interface NovedadCalidadEntradaUIM {
  nombrePersona: string;
  rol: 'trabajador' | 'beneficiario';
  item: NovedadCalidadDatosIntegrante;
  filas: NovedadCalidadFilaVista[];
  estadoId: number;
  fechaRegistro: string | null;
}

/** Una fila del resumen del WS (lista etiqueta / valor). */
interface ResumenWsFila {
  /** Ruta técnica (p. ej. persona.primer_nombre), útil en tooltip. */
  clave: string;
  etiqueta: string;
  valor: string;
}

/** Campos que no deben mostrarse en el resumen WS (trabajador ni beneficiario). */
/** Paso del p-timeline según catálogo de estados de solicitud de afiliación. */
interface TimelineEstadoAfiliacionEvento {
  idEstado: number;
  /** Código del estado (visible en el timeline). */
  state: string;
  stateShow: string;
  label: string;
  /** Descripción solo para heurística de icono (no se muestra en UI). */
  textoIcono?: string;
}

const CAMPOS_OMITIDOS_RESUMEN_WS = new Set<string>([
  'id_usuario_creacion',
  'fecha_creacion',
  'fecha_modificacion',
  'fecha_ultima_gestion',
  'tipo_persona',
  'usuario_modificacion',
  'editado_por_backoffice',
  'id_estado_gestion_persona',
  'id_solicitud',
  'snapshot_datos_originales',
  'usuario_gestion',
]);

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
  /** Modal PrimeNG para previsualizar adjuntos de afiliación tipo imagen (tabla trabajador/beneficiario). */
  displayModal = false;
  urlImagenPreview = '';
  /** Modal con iframe para PDF vía blob (evita descarga forzada por la URL firmada). */
  displayModalPdf = false;
  urlPdfPreview: SafeResourceUrl | null = null;
  private pdfPreviewBlobUrl: string | null = null;
  viewerType: 'google' | 'office' | 'image' | 'pdf' = 'google';

  requestList: RequestsList[] = [];
  requestDetails?: RequestsDetails;
  afiliationRequestDetails?: AfiliacionRequestDetailsData;
  readonly mensajeTooltipAsignarInhabilitada = MENSAJE_TOOLTIP_ASIGNAR_AFILIACION_INHABILITADA;
  readonly tooltipAsignarPorFila = mensajeTooltipAsignarAfiliacionPorFila;
  requestAfiliationAssign?: RequestsListAfiliation;
  isAfiliationAssignModal = false;
  requestHistoric: AfiliationSolicitudHistoriaGestionRow[] = [];
  requestHistoricIntegrantes: AfiliationIntegranteHistoriaGestionRow[] = [];
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
  /** Carga del histórico gestión (tabla paginada). */
  cargandoHistorialGestion = false;
  /** Filas cuyo texto de observación está expandido (índice en la página actual). */
  private historialObsExpandidos = new Set<number>();
  firstHistoricIntegrantes: number = 0;
  pageHistoricIntegrantes: number = 1;
  rowsHistoricIntegrantes: number = 10;
  totalRowsHistoricIntegrantes: number = 0;
  cargandoHistorialGestionIntegrantes = false;
  private historialIntegrantesObsExpandidos = new Set<number>();

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
  /** Diálogo: lista organizada del trabajador o beneficiario (datos del detalle WS). */
  visibleResumenDatosWs = false;
  resumenDatosWsTitulo = '';
  resumenDatosWsFilas: ResumenWsFila[] = [];
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
  /** Id del estado actual (`afiliacion_solicitud.id_estado_solicitud` / catálogo). */
  idEstadoSolicitudActual: number | null = null;
  /** Catálogo `parametros_estado_solicitud` vía API `db_afi/estado_solicitud`. */
  catalogoEstadosSolicitudAfiliacion: RequestStatusAfiliationList[] = [];

  // Arreglo de eventos para la línea de tiempo
  events: TimelineEstadoAfiliacionEvento[] = [];

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
  /** Archivos seleccionados para subir (compatibilidad con flujo anterior). */
  archivosAdjuntosAdicionales: File[] = [];
  /** Archivo único seleccionado en el modal (reactive form + tipo adjunto). */
  archivoSeleccionado: File | null = null;
  /** Formulario del modal: tipo de adjunto obligatorio. */
  adjuntoForm: FormGroup;
  /** Catálogo de tipos según parentesco (respuesta del GET). */
  listaTiposAdjunto: AdjuntoTipoPorParentesco[] = [];
  /** Valor para [accept] del input file y texto informativo. */
  formatosPermitidosActuales = '';
  /** Parentescos con id (misma fuente que getParentescoList). */
  catalogoParentesco: ParametroParentesco[] = [];
  /** Carga del catálogo adjuntos-por-parentesco. */
  cargandoCatalogoAdjuntosPorParentesco = false;
  /** En curso la subida de adjuntos adicionales. */
  subiendoAdjuntosAdicionales = false;
  /** En curso la generación del expediente PDF. */
  generandoExpediente = false;
  /** Por cada índice de beneficiario, true si al cargar tenía tipo doc CE, PPT, CC, TI o RC (la sección editable se mantiene aunque cambie el selector). */
  private beneficioEditablePorIndice: boolean[] = [];
  /** Por cada índice de beneficiario, true si al cargar tenía tipo doc CC, TI o RC (habilita la edición de campos adicionales: grupo familiar, invalidez, admin subsidios). */
  private beneficioEditableExtrasPorIndice: boolean[] = [];
  /** Opciones genéricas Si/No reutilizadas en varios dropdowns del beneficiario. */
  opcionesSiNo: { label: string; value: string }[] = [
    { label: 'Sí', value: 'Si' },
    { label: 'No', value: 'No' },
  ];
  /** Snapshots de datos editables por beneficiario (índice) para detectar cambios. */
  private snapshotBeneficiarios: Array<{
    parentesco: string | null;
    tipo_documento: string;
    numero_documento: string;
    primer_nombre: string;
    segundo_nombre: string | null;
    primer_apellido: string;
    segundo_apellido: string | null;
    fecha_expedicion_doc: string | null;
    fecha_nacimiento: string | null;
    genero: string | null;
    direccion_corresponde_trabajador: string | null;
    direccion: string | null;
    nuevo_beneficiario: string | null;
    nuevo_grupo_familiar: string | null;
    numero_grupo_familiar: number | null;
    fecha_inicio_invalidez: string | null;
    fecha_reporte_invalidez: string | null;
    tipo_identificacion_administrador_subsidio: string | null;
    numero_identificacion_administrador_subsidio: string | null;
    nombre_completo_administrador_subsidio: string | null;
    fecha_nacimiento_administrador_subsidio: string | null;
  }> = [];
  /** Por cada índice de beneficiario Hijo: padre/madre biológicos consultados (afiliaciones.padres_biologicos) y estado de carga. */
  padresBiologicosPorBeneficiario: Array<{
    padre: PadreBiologicoRecord | null;
    madre: PadreBiologicoRecord | null;
    loading: boolean;
  }> = [];
  /** Formulario "Agregar padre/madre" abierto, por clave `${iBenef}-padre` / `${iBenef}-madre`. */
  formularioPadreBiologicoAbierto: Record<string, boolean> = {};
  /** Modelo editable del formulario "Agregar padre/madre", por la misma clave. */
  formPadreBiologico: Record<
    string,
    {
      tipo_documento: string | null;
      numero_documento: string | null;
      primer_nombre: string | null;
      segundo_nombre: string | null;
      primer_apellido: string | null;
      segundo_apellido: string | null;
    }
  > = {};
  /** Clave (`${iBenef}-padre`/`${iBenef}-madre`) del guardado en curso (agregar o completar). */
  guardandoPadreBiologicoKey: string | null = null;
  /** Edición de estado RPA por id de registro padres_biologicos. */
  estadoRpaPadresEdicion: Record<number, { nuevoEstado: 'Pendiente' | 'Procesado' | null; radicado: string }> = {};
  /** Id del registro padres_biologicos cuyo cambio de estado RPA está en curso. */
  guardandoEstadoRpaPadresId: number | null = null;
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
  /** Texto bajo el título del modal (Trabajador / Beneficiario N). */
  gestionarEstadoContextoLabel = '';
  gestionarEstadoAfiliadoForm!: FormGroup;
  private gestionarEstadoAfiliadoSub?: Subscription;
  /** true si el único motivo de bloqueo fue "adjuntos sin validar en Sí": solo se permite Rechazar. */
  gestionarEstadoSoloRechazoPermitido = false;
  /**
   * true si se gestiona desde solicitud/persona en Inconsistencias RPA:
   * solo se permiten Pendiente afiliación RPA o Procesado.
   */
  gestionarEstadoDesdeInconsistenciasRpa = false;

  /** Ids `parametros_estado_gestion_persona.id` alineados con BD. */
  readonly ID_ESTADO_GESTION_PENDIENTE_AFILIACION_RPA = 1;
  readonly ID_ESTADO_GESTION_INCONSISTENCIAS_RPA = 2;
  readonly ID_ESTADO_GESTION_PROCESADO = 3;
  readonly ID_ESTADO_GESTION_RECHAZADO = 4;
  readonly ID_ESTADO_GESTION_PENDIENTE_INICIAL = 5;
  readonly ID_ESTADO_GESTION_EN_EJECUCION_RPA = 6;

  /** Id `parametros_estado_solicitud` para Inconsistencias RPA. */
  readonly ID_ESTADO_SOLICITUD_INCONSISTENCIAS_RPA = 9;

  /** Catálogo completo `parametros_estado_gestion_persona` para mostrar estado por integrante. */
  private readonly catalogoEstadoGestionPersona: Readonly<
    Record<number, { label: string; severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary' }>
  > = {
    [this.ID_ESTADO_GESTION_PENDIENTE_AFILIACION_RPA]: {
      label: 'Pendiente afiliación RPA',
      severity: 'info',
    },
    [this.ID_ESTADO_GESTION_INCONSISTENCIAS_RPA]: {
      label: 'Inconsistencias RPA',
      severity: 'warning',
    },
    [this.ID_ESTADO_GESTION_PROCESADO]: {
      label: 'Procesado',
      severity: 'success',
    },
    [this.ID_ESTADO_GESTION_RECHAZADO]: {
      label: 'Rechazado',
      severity: 'danger',
    },
    [this.ID_ESTADO_GESTION_PENDIENTE_INICIAL]: {
      label: 'Pendiente',
      severity: 'warning',
    },
    [this.ID_ESTADO_GESTION_EN_EJECUCION_RPA]: {
      label: 'En ejecución RPA',
      severity: 'info',
    },
  };

  /** Estados seleccionables manualmente en gestión interna. */
  estadoAfiliadoOpciones: { label: string; value: number }[] = [
    { label: 'Pendiente afiliación RPA', value: 1 },
    { label: 'Procesado', value: 3 },
    { label: 'Rechazado', value: 4 },
  ];

  /**
   * Opciones del dropdown del modal:
   * - Desde Inconsistencias RPA: solo Pendiente afiliación RPA o Procesado.
   * - Adjuntos sin validar en Sí: solo Rechazado.
   */
  get opcionesEstadoAfiliadoModal(): { label: string; value: number }[] {
    if (this.gestionarEstadoDesdeInconsistenciasRpa) {
      return this.estadoAfiliadoOpciones.filter(
        (o) =>
          o.value === this.ID_ESTADO_GESTION_PENDIENTE_AFILIACION_RPA ||
          o.value === this.ID_ESTADO_GESTION_PROCESADO
      );
    }
    if (this.gestionarEstadoSoloRechazoPermitido) {
      return this.estadoAfiliadoOpciones.filter((o) => this.esEstadoGestionRechazado(o.value));
    }
    return this.estadoAfiliadoOpciones;
  }

  /** Opciones del dropdown motivo de rechazo (cargadas desde BD). */
  motivoRechazoOpciones: { label: string; value: string; codigo_motivo: string }[] = [];
  cargandoMotivosRechazo = false;
  /** Guardado en curso: actualizar estado gestión solicitud. */
  guardandoEstadoGestionSolicitud = false;

  /** Spinner en «Gestionar estado» mientras corre la validación por persona (`t` o `b-índice`). */
  gestionarEstadoValidacionCargaKey: string | null = null;
  /** Persona cuyo estado se gestiona en el modal (se fija al abrir tras validar requisitos). */
  gestionarEstadoPersonaId: number | null = null;
  gestionarEstadoContexto: 'trabajador' | 'beneficiario' = 'trabajador';
  visibleConfirmarRechazoTrabajador = false;
  private pendingGestionEstadoPayload: ActualizarEstadoGestionAfiliacionPayload | null = null;
  private readonly validacionRequisitosGestionCache = new Map<
    number,
    { valido: boolean; errores: string[] }
  >();

  /** Modal de bloqueo cuando `es_valido` es false. */
  visibleModalBloqueoRequisitosGestion = false;
  bloqueoRequisitosGestionTitulo = '';
  bloqueoRequisitosGestionLista: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private userService: Users,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private http: HttpClient,
    private fb: FormBuilder,
    private readonly sanitizer: DomSanitizer
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
      estadoAfiliado: [null as number | null, Validators.required],
      motivoRechazo: [null as string | null],
    });

    this.adjuntoForm = this.fb.group({
      id_tipo_adjunto: [null as number | null, Validators.required],
    });
  }

  /** Id de parentesco "Titular" en catálogo (para trabajador). */
  get idParentescoTitular(): number {
    const t = this.catalogoParentesco.find(p => /^titular$/i.test((p.parentesco ?? '').trim()));
    return t?.id ?? 0;
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
      this.requestHistoric = [];
      this.events = [];
      this.getRequestDetails(this.request_id);
    });
    //this.getRequestApplicantAttachments(this.request_id);
    //this.getRequestAssignedAttachments(this.request_id);

    //validar si esta cerrada
    //this.getAnswerTemp(this.request_id);

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
    this.firstHistoric = eventHistoric.first ?? 0;
    this.rowsHistoric = eventHistoric.rows ?? this.rowsHistoric;
    this.pageHistoric = (eventHistoric.page ?? 0) + 1;
    this.getRequestHistoric(this.request_id);
  }

  onPageChangeHistoricIntegrantes(eventHistoric: PaginatorState) {
    this.firstHistoricIntegrantes = eventHistoric.first ?? 0;
    this.rowsHistoricIntegrantes = eventHistoric.rows ?? this.rowsHistoricIntegrantes;
    this.pageHistoricIntegrantes = (eventHistoric.page ?? 0) + 1;
    this.getRequestHistoricIntegrantes(this.request_id);
  }

  cleanFormHistoric() {
    this.firstHistoric = 0;
    this.pageHistoric = 1;
    this.rowsHistoric = 10;
    this.requestHistoric = [];
    this.totalRowsHistoric = 0;
    this.historialObsExpandidos.clear();
    this.firstHistoricIntegrantes = 0;
    this.pageHistoricIntegrantes = 1;
    this.rowsHistoricIntegrantes = 10;
    this.requestHistoricIntegrantes = [];
    this.totalRowsHistoricIntegrantes = 0;
    this.historialIntegrantesObsExpandidos.clear();
    this.rebuildTimelineEstadosSolicitudAfiliacion([]);
  }

  initPaginadorHistoric() {
    this.firstHistoric = 0;
    this.pageHistoric = 1;
    this.rowsHistoric = 10;
    this.getRequestHistoric(this.request_id);
    this.firstHistoricIntegrantes = 0;
    this.pageHistoricIntegrantes = 1;
    this.rowsHistoricIntegrantes = 10;
    this.getRequestHistoricIntegrantes(this.request_id);
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
    this.gestionarEstadoAfiliadoSub = estadoCtrl.valueChanges.subscribe((val: number | null) => {
      if (val != null && this.esEstadoGestionRechazado(Number(val))) {
        motivoCtrl.setValidators([Validators.required]);
        if (this.motivoRechazoOpciones.length === 0 && !this.cargandoMotivosRechazo) {
          this.cargarMotivosRechazoAfiliacion();
        }
      } else {
        motivoCtrl.clearValidators();
        motivoCtrl.setValue(null, { emitEvent: false });
      }
      motivoCtrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  /** True si el id corresponde al estado Rechazado del catálogo de gestión por persona. */
  esEstadoGestionRechazado(idEstado: number): boolean {
    if (!Number.isFinite(idEstado)) {
      return false;
    }
    const row = this.estadoAfiliadoOpciones.find(o => o.value === idEstado);
    if (row?.label && /rechaz/i.test(row.label)) {
      return true;
    }
    return idEstado === this.ID_ESTADO_GESTION_RECHAZADO;
  }

  get mostrarMotivoRechazoGestion(): boolean {
    const id = this.gestionarEstadoAfiliadoForm.get('estadoAfiliado')?.value;
    return id != null && this.esEstadoGestionRechazado(Number(id));
  }

  /** `codigo` BD para el id de estado del modal (parametros_estado_solicitud). */
  private codigoEstadoAfiliadoPorId(id: number): string {
    const row = this.estadoAfiliadoOpciones.find((o) => o.value === id);
    return row?.label?.trim() ?? '';
  }

  cargaValidacionRequisitosGestion(
    contexto: 'trabajador' | 'beneficiario',
    indiceBeneficiario?: number
  ): boolean {
    const key = contexto === 'trabajador' ? 't' : `b-${indiceBeneficiario ?? -1}`;
    return this.gestionarEstadoValidacionCargaKey === key;
  }

  muestraIconoAlertaRequisitosGestion(
    contexto: 'trabajador' | 'beneficiario',
    indiceBeneficiario?: number
  ): boolean {
    const id = this.obtenerPersonaIdParaGestionEstado(contexto, indiceBeneficiario);
    if (id == null) {
      return false;
    }
    const c = this.validacionRequisitosGestionCache.get(id);
    return c != null && !c.valido && (c.errores?.length ?? 0) > 0;
  }

  /** Clic en «Gestionar estado»: valida requisitos por `persona_id` antes de abrir el modal. */
  onClicGestionarEstado(
    contexto: 'trabajador' | 'beneficiario' = 'trabajador',
    indiceBeneficiario?: number
  ): void {
    if (contexto === 'trabajador' && this.tieneAlertaEstadoCivil) {
      const detalle = this.tieneAlertaEstadoCivilVacio
        ? 'Debe seleccionar un estado civil antes de gestionar el estado.'
        : 'Debe actualizar el estado civil antes de gestionar el estado.';
      this.showSuccessMessage('warn', 'Estado civil requerido', detalle);
      return;
    }

    if (contexto === 'beneficiario' && !this.trabajadorTieneEstadoGestionAsignado()) {
      this.showSuccessMessage(
        'warn',
        'Gestión no permitida',
        'El trabajador debe tener un estado de gestión antes de gestionar beneficiarios.'
      );
      return;
    }

    if (
      contexto === 'beneficiario' &&
      this.solicitudEnInconsistenciasRpa() &&
      this.trabajadorEnInconsistenciasRpa()
    ) {
      this.showSuccessMessage(
        'warn',
        'Gestión no permitida',
        'Debe resolver primero el estado del trabajador (Pendiente afiliación RPA o Procesado) antes de gestionar beneficiarios.'
      );
      return;
    }

    const personaId = this.obtenerPersonaIdParaGestionEstado(contexto, indiceBeneficiario);
    const nombre = this.nombrePersonaParaMensajeGestionEstado(contexto, indiceBeneficiario);
    if (personaId == null || !Number.isFinite(personaId)) {
      this.showSuccessMessage(
        'warn',
        'Datos incompletos',
        'No se encontró el identificador de la persona para validar requisitos.'
      );
      return;
    }
    const key = contexto === 'trabajador' ? 't' : `b-${indiceBeneficiario ?? -1}`;
    this.gestionarEstadoValidacionCargaKey = key;
    this.userService
      .validarRequisitosGestionPersona(personaId)
      .pipe(finalize(() => (this.gestionarEstadoValidacionCargaKey = null)))
      .subscribe({
        next: (res) => {
          if (res.code !== 200 || res.data == null) {
            this.showSuccessMessage(
              'error',
              'Validación',
              res.message || 'No se pudo validar los requisitos de gestión.'
            );
            return;
          }
          const d = res.data;
          const erroresParseados = this.parseErroresValidacionRequisitosGestion(d.errores);
          const desdeMensaje =
            d.mensaje_general != null && String(d.mensaje_general).trim() !== ''
              ? [String(d.mensaje_general).trim()]
              : [];
          const lista =
            erroresParseados.length > 0
              ? erroresParseados
              : desdeMensaje.length > 0
                ? desdeMensaje
                : ['No cumple los requisitos para gestionar el estado.'];

          if (!d.es_valido) {
            const erroresAdjuntos = lista.filter((e) => this.esErrorAdjuntosSinValidar(e));
            const erroresNovedadCalidad = lista.filter((e) => this.esErrorNovedadCalidadDatosPendiente(e));
            const erroresRestantes = lista.filter(
              (e) => !this.esErrorAdjuntosSinValidar(e) && !this.esErrorNovedadCalidadDatosPendiente(e)
            );
            if (erroresRestantes.length === 0) {
              // Únicos motivos de bloqueo: adjuntos sin validar en Sí y/o novedad de calidad de datos pendiente.
              // Ninguno de los dos bloquea: se informa (si aplica) y se permite gestionar igual.
              this.validacionRequisitosGestionCache.set(personaId, { valido: true, errores: [] });
              const desdeInconsistencias = this.solicitudEnInconsistenciasRpa();
              const soloRechazoPermitido = erroresAdjuntos.length > 0 && !desdeInconsistencias;
              if (soloRechazoPermitido) {
                this.showSuccessMessage(
                  'info',
                  'Gestión restringida',
                  'Hay adjuntos sin validar en «Sí»: solo puede pasar esta persona a estado Rechazado.'
                );
              }
              this.abrirModalGestionarEstado(contexto, indiceBeneficiario, soloRechazoPermitido);
              if (erroresNovedadCalidad.length > 0) {
                this.mostrarModalBloqueoRequisitosGestion(nombre, erroresNovedadCalidad, false);
              }
              return;
            }
            this.validacionRequisitosGestionCache.set(personaId, { valido: false, errores: erroresRestantes });
            this.mostrarModalBloqueoRequisitosGestion(nombre, erroresRestantes);
            return;
          }
          this.validacionRequisitosGestionCache.set(personaId, { valido: true, errores: [] });
          this.abrirModalGestionarEstado(contexto, indiceBeneficiario);
        },
        error: (err) => {
          console.error('validarRequisitosGestionPersona', err);
          this.showSuccessMessage(
            'error',
            'Error',
            'No se pudo validar los requisitos. Intente de nuevo.'
          );
        },
      });
  }

  /** True si el mensaje de error corresponde a "adjuntos sin validar en Sí" (no bloquea, solo restringe a Rechazado). */
  private esErrorAdjuntosSinValidar(mensaje: string): boolean {
    const t = (mensaje ?? '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
    return t.includes('adjunt') && (t.includes('valida') || t.includes('estado diferente a si'));
  }

  /** True si el mensaje de error corresponde a "novedad de calidad de datos pendiente de procesar" (no bloquea, solo informa). */
  private esErrorNovedadCalidadDatosPendiente(mensaje: string): boolean {
    const t = (mensaje ?? '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
    return t.includes('novedad') && t.includes('calidad') && t.includes('pendiente');
  }

  mostrarModalBloqueoRequisitosGestion(nombrePersona: string, errores: string[], bloqueante: boolean = true): void {
    this.bloqueoRequisitosGestionTitulo = bloqueante
      ? `No se puede gestionar a ${nombrePersona} por los siguientes motivos:`
      : `Antes de gestionar a ${nombrePersona}, ten en cuenta:`;
    this.bloqueoRequisitosGestionLista = [...errores];
    this.visibleModalBloqueoRequisitosGestion = true;
  }

  cerrarModalBloqueoRequisitosGestion(): void {
    this.visibleModalBloqueoRequisitosGestion = false;
    this.bloqueoRequisitosGestionTitulo = '';
    this.bloqueoRequisitosGestionLista = [];
  }

  private obtenerPersonaIdParaGestionEstado(
    contexto: 'trabajador' | 'beneficiario',
    indiceBeneficiario?: number
  ): number | null {
    const d = this.afiliationRequestDetails;
    if (!d) {
      return null;
    }
    if (contexto === 'trabajador') {
      const id = d.trabajador?.persona?.id;
      return id != null ? Number(id) : null;
    }
    if (
      indiceBeneficiario != null &&
      d.beneficiarios?.[indiceBeneficiario]?.persona?.id != null
    ) {
      return Number(d.beneficiarios[indiceBeneficiario].persona!.id);
    }
    return null;
  }

  private nombrePersonaParaMensajeGestionEstado(
    contexto: 'trabajador' | 'beneficiario',
    indiceBeneficiario?: number
  ): string {
    if (contexto === 'trabajador') {
      const n = this.trabajadorNombreCompleto.trim();
      return n !== '' ? n : 'la persona titular';
    }
    const b =
      indiceBeneficiario != null
        ? this.afiliationRequestDetails?.beneficiarios?.[indiceBeneficiario]
        : undefined;
    return b ? this.getNombreBeneficiario(b) : 'el beneficiario';
  }

  private parseErroresValidacionRequisitosGestion(raw: unknown): string[] {
    if (raw == null) {
      return [];
    }
    if (Array.isArray(raw)) {
      return raw
        .map((item) => {
          if (typeof item === 'string') {
            return item.trim();
          }
          if (item != null && typeof item === 'object' && 'mensaje' in item) {
            return String((item as { mensaje?: unknown }).mensaje ?? '').trim();
          }
          return String(item).trim();
        })
        .filter((s) => s.length > 0);
    }
    if (typeof raw === 'string') {
      const t = raw.trim();
      if (!t) {
        return [];
      }
      try {
        const parsed = JSON.parse(t) as unknown;
        return this.parseErroresValidacionRequisitosGestion(parsed);
      } catch {
        return [t];
      }
    }
    return [];
  }

  private abrirModalGestionarEstado(
    contexto: 'trabajador' | 'beneficiario' = 'trabajador',
    indiceBeneficiario?: number,
    soloRechazoPermitido = false
  ): void {
    this.gestionarEstadoContexto = contexto;
    this.gestionarEstadoPersonaId = this.obtenerPersonaIdParaGestionEstado(
      contexto,
      indiceBeneficiario
    );

    this.gestionarEstadoDesdeInconsistenciasRpa = this.solicitudEnInconsistenciasRpa();
    // En inconsistencias RPA no aplica rechazo: solo Pendiente afiliación RPA o Procesado.
    this.gestionarEstadoSoloRechazoPermitido =
      this.gestionarEstadoDesdeInconsistenciasRpa ? false : soloRechazoPermitido;

    if (contexto === 'trabajador') {
      this.gestionarEstadoContextoLabel = 'Trabajador';
    } else if (
      indiceBeneficiario != null &&
      this.afiliationRequestDetails?.beneficiarios?.[indiceBeneficiario]
    ) {
      const b = this.afiliationRequestDetails.beneficiarios[indiceBeneficiario];
      this.gestionarEstadoContextoLabel = `Beneficiario ${indiceBeneficiario + 1}: ${this.getNombreBeneficiario(b)}`;
    } else {
      this.gestionarEstadoContextoLabel = '';
    }

    this.gestionarEstadoAfiliadoForm.reset({
      estadoAfiliado: null,
      motivoRechazo: null,
    });
    this.gestionarEstadoAfiliadoForm.get('motivoRechazo')?.clearValidators();
    this.gestionarEstadoAfiliadoForm.get('motivoRechazo')?.updateValueAndValidity({ emitEvent: false });
    this.motivoRechazoOpciones = [];
    this.visibleGestionarEstadoModal = true;
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
            .map((m) => {
              const codigo = String(
                m.codigo_motivo ?? (m as { codigoMotivo?: string | null }).codigoMotivo ?? ''
              ).trim();
              const desc = (m.motivo_rechazo ?? '').trim() || `Motivo #${m.id}`;
              return {
                codigo_motivo: codigo,
                label: desc,
                value: String(m.id),
              };
            });
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
    this.gestionarEstadoContextoLabel = '';
    this.gestionarEstadoPersonaId = null;
    this.gestionarEstadoContexto = 'trabajador';
    this.gestionarEstadoSoloRechazoPermitido = false;
    this.gestionarEstadoDesdeInconsistenciasRpa = false;
  }

  private idEstadoGestionPersonaIntegrante(
    contexto: 'trabajador' | 'beneficiario',
    indiceBeneficiario?: number
  ): number | null | undefined {
    if (contexto === 'trabajador') {
      return this.afiliationRequestDetails?.trabajador?.persona?.id_estado_gestion_persona;
    }
    if (indiceBeneficiario == null) {
      return undefined;
    }
    return this.afiliationRequestDetails?.beneficiarios?.[indiceBeneficiario]?.persona
      ?.id_estado_gestion_persona;
  }

  /** True si la solicitud está en Inconsistencias RPA (id 9 / nombre del catálogo). */
  solicitudEnInconsistenciasRpa(): boolean {
    const id =
      this.afiliationRequestDetails?.solicitud?.id_estado_solicitud ?? this.idEstadoSolicitudActual;
    if (Number(id) === this.ID_ESTADO_SOLICITUD_INCONSISTENCIAS_RPA) {
      return true;
    }
    const texto = this.normalizarTextoEstadoTimeline(
      this.currentState || this.afiliationRequestDetails?.solicitud?.estado_codigo
    );
    return texto === 'inconsistencias rpa';
  }

  /**
   * Visible si el integrante está en Pendiente inicial (id 5) / sin estado,
   * o si la solicitud y el integrante están en Inconsistencias RPA.
   */
  mostrarBotonGestionarEstadoIntegrante(
    contexto: 'trabajador' | 'beneficiario',
    indiceBeneficiario?: number
  ): boolean {
    const id = this.idEstadoGestionPersonaIntegrante(contexto, indiceBeneficiario);
    if (id == null || id === undefined) {
      return true;
    }
    const n = Number(id);
    if (n === this.ID_ESTADO_GESTION_PENDIENTE_INICIAL) {
      return true;
    }
    return (
      this.solicitudEnInconsistenciasRpa() &&
      n === this.ID_ESTADO_GESTION_INCONSISTENCIAS_RPA
    );
  }

  /** Etiqueta legible del estado de gestión individual del integrante. */
  textoEstadoGestionIntegrante(
    contexto: 'trabajador' | 'beneficiario',
    indiceBeneficiario?: number
  ): string {
    const id = this.idEstadoGestionPersonaIntegrante(contexto, indiceBeneficiario);
    if (id == null || id === undefined) {
      return 'Pendiente';
    }
    const n = Number(id);
    return this.catalogoEstadoGestionPersona[n]?.label ?? `Estado ${n}`;
  }

  /** Color del tag según el estado de gestión del integrante. */
  severidadEstadoGestionIntegrante(
    contexto: 'trabajador' | 'beneficiario',
    indiceBeneficiario?: number
  ): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const id = this.idEstadoGestionPersonaIntegrante(contexto, indiceBeneficiario);
    if (id == null || id === undefined) {
      return 'secondary';
    }
    return this.catalogoEstadoGestionPersona[Number(id)]?.severity ?? 'secondary';
  }

  /** Trabajador ya gestionado: estado distinto de null y del inicial Pendiente (5). */
  trabajadorTieneEstadoGestionAsignado(): boolean {
    const id = this.idEstadoGestionPersonaIntegrante('trabajador');
    if (id == null || id === undefined) {
      return false;
    }
    return Number(id) !== this.ID_ESTADO_GESTION_PENDIENTE_INICIAL;
  }

  /** True si el trabajador está en Inconsistencias RPA (id 2). */
  trabajadorEnInconsistenciasRpa(): boolean {
    const id = this.idEstadoGestionPersonaIntegrante('trabajador');
    return id != null && Number(id) === this.ID_ESTADO_GESTION_INCONSISTENCIAS_RPA;
  }

  guardarGestionarEstadoAfiliado(): void {
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
    const personaId = this.gestionarEstadoPersonaId;
    if (idSolicitud == null) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No hay solicitud cargada.',
      });
      return;
    }
    if (personaId == null || !Number.isFinite(personaId)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se identificó la persona para actualizar el estado. Cierre el modal e intente de nuevo.',
      });
      return;
    }

    const raw = this.gestionarEstadoAfiliadoForm.getRawValue();
    const idEstadoGestion = Number(raw.estadoAfiliado);
    if (!Number.isFinite(idEstadoGestion) || idEstadoGestion < 1) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Seleccione un estado de afiliación válido.',
      });
      return;
    }

    if (this.gestionarEstadoDesdeInconsistenciasRpa) {
      const permitido =
        idEstadoGestion === this.ID_ESTADO_GESTION_PENDIENTE_AFILIACION_RPA ||
        idEstadoGestion === this.ID_ESTADO_GESTION_PROCESADO;
      if (!permitido) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Estado no permitido',
          detail:
            'Desde Inconsistencias RPA solo puede cambiar a Pendiente afiliación RPA o Procesado.',
        });
        return;
      }
    }

    const esRechazado = this.esEstadoGestionRechazado(idEstadoGestion);
    if (esRechazado && (raw.motivoRechazo == null || raw.motivoRechazo === '')) {
      this.gestionarEstadoAfiliadoForm.get('motivoRechazo')?.markAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Seleccione un motivo de rechazo.',
      });
      return;
    }

    const estadoAfiliadoCodigo = this.codigoEstadoAfiliadoPorId(idEstadoGestion);
    if (!estadoAfiliadoCodigo) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Estado seleccionado no reconocido.',
      });
      return;
    }

    const payload: ActualizarEstadoGestionAfiliacionPayload = {
      id_solicitud: idSolicitud,
      persona_id: personaId,
      id_estado_gestion_persona: idEstadoGestion,
      id_estado_solicitud: idEstadoGestion,
      estado_afiliado: estadoAfiliadoCodigo,
      id_motivo_rechazo: esRechazado ? Number(raw.motivoRechazo) : null,
    };

    if (
      this.gestionarEstadoContexto === 'trabajador' &&
      esRechazado
    ) {
      this.pendingGestionEstadoPayload = payload;
      this.visibleConfirmarRechazoTrabajador = true;
      return;
    }

    this.ejecutarGuardarGestionEstadoAfiliado(payload);
  }

  cerrarConfirmacionRechazoTrabajador(): void {
    this.visibleConfirmarRechazoTrabajador = false;
    this.pendingGestionEstadoPayload = null;
  }

  confirmarRechazoTrabajadorGestionEstado(): void {
    const payload = this.pendingGestionEstadoPayload;
    this.cerrarConfirmacionRechazoTrabajador();
    if (!payload) {
      return;
    }
    this.ejecutarGuardarGestionEstadoAfiliado(payload);
  }

  private ejecutarGuardarGestionEstadoAfiliado(payload: ActualizarEstadoGestionAfiliacionPayload): void {
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
          const activos = res.data.filter((t) => t.esta_activo !== false);
          this.catalogoParentesco = activos;
          let opciones = activos
            .map((t) => ({ label: t.parentesco ?? '', value: t.parentesco ?? '' }))
            .filter((o) => o.value !== '' || o.label !== '');
          valoresActuales.forEach((v) => {
            if (v && !opciones.some((o) => o.value === v || o.label === v)) {
              opciones = [{ label: v, value: v }, ...opciones];
            }
          });
          this.opcionesParentesco = opciones;
        } else {
          this.catalogoParentesco = [];
          this.opcionesParentesco = valoresActuales.length ? valoresActuales.map((v) => ({ label: v, value: v })) : [];
        }
      },
      error: () => {
        this.catalogoParentesco = [];
        this.opcionesParentesco = valoresActuales.length ? valoresActuales.map((v) => ({ label: v, value: v })) : [];
      },
    });
  }

  /** Resuelve id_parentesco del catálogo a partir del texto de parentesco del beneficiario. */
  getIdParentescoBeneficiario(b: BeneficiarioBundle | undefined): number {
    const name = (b?.beneficiario?.parentesco ?? '').toString().trim();
    if (!name) return 0;
    const row = this.catalogoParentesco.find(
      p => (p.parentesco ?? '').trim().toLowerCase() === name.toLowerCase()
    );
    return row?.id ?? 0;
  }

  /** Normaliza extensiones para el atributo accept del input file. */
  private normalizarAcceptFormatos(raw: string | null | undefined): string {
    if (!raw?.trim()) return '';
    return raw
      .split(/[,;]\s*/)
      .map(x => {
        const t = x.trim().toLowerCase();
        if (!t) return '';
        return t.startsWith('.') ? t : `.${t}`;
      })
      .filter(Boolean)
      .join(',');
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
      this.validacionRequisitosGestionCache.clear();
      this.precargarFechaNacimientoAdministradorSubsidioIgualTrabajador();
      this.guardarSnapshotDatosTrabajador();
      this.guardarSnapshotBeneficiarios();
      this.cargarPadresBiologicosBeneficiarios();
      this.initAdjuntosValoracion();
      this.loadTiposDocumentoPersona();
      this.loadGeneros();
      this.loadEstadoCivil();
      this.loadParentescos();
      this.firstHistoric = 0;
      this.pageHistoric = 1;
      this.firstHistoricIntegrantes = 0;
      this.pageHistoricIntegrantes = 1;
      this.rebuildTimelineEstadosSolicitudAfiliacion([]);
      this.getRequestHistoric(request_details);
      this.getRequestHistoricIntegrantes(request_details);
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

  /**
   * True si existe al menos un adjunto del trabajador o de algún beneficiario aún sin validar
   * (estado vacío o PENDIENTE). Usado para mostrar el aviso de expediente solo en ese caso.
   */
  get hayAdjuntosSinValidarTrabajadorOBeneficiarios(): boolean {
    const trabajador = this.trabajadorAdjuntosEstado ?? [];
    const beneficiarios = this.beneficiariosAdjuntosEstado ?? [];
    const todos = [...trabajador, ...beneficiarios.flat()];
    return todos.some((item) => this.esAdjuntoPendienteValidacion(item));
  }

  /** True si la solicitud está en Pendiente afiliación RPA (no permite adjuntos adicionales). */
  get solicitudEnPendienteAfiliacionRpa(): boolean {
    const codigo = this.afiliationRequestDetails?.solicitud?.estado_codigo ?? '';
    const n = codigo.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return n === 'pendiente afiliacion rpa';
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

  /**
   * Muestra la pestaña Novedades si hay registros en `trabajador.novedades.calidad_datos`
   * o en `beneficiario.novedades.calidad_datos` de algún beneficiario (no usa `data.novedades` raíz).
   */
  tieneNovedadesDeCalidad(): boolean {
    const d = this.afiliationRequestDetails;
    if (!d) return false;
    const trab = d.trabajador?.novedades?.calidad_datos;
    if (Array.isArray(trab) && trab.length > 0) return true;
    for (const b of d.beneficiarios ?? []) {
      if (this.getCalidadDatosBeneficiario(b).length > 0) return true;
    }
    return false;
  }

  /**
   * Novedades de calidad en un solo arreglo (trabajador + beneficiarios), con `nombrePersona` y `rol`.
   */
  get novedadesAMostrar(): NovedadCalidadEntradaUIM[] {
    const d = this.afiliationRequestDetails;
    if (!d) return [];
    const out: NovedadCalidadEntradaUIM[] = [];
    const cdTrab = d.trabajador?.novedades?.calidad_datos;
    if (Array.isArray(cdTrab)) {
      const nombre = this.trabajadorNombreCompleto || 'Trabajador';
      for (const item of cdTrab) {
        out.push(this.consolidarEntradaNovedadCalidad(item, nombre, 'trabajador'));
      }
    }
    for (const b of d.beneficiarios ?? []) {
      const list = this.getCalidadDatosBeneficiario(b);
      const nombre = this.getNombreBeneficiario(b);
      for (const item of list) {
        out.push(this.consolidarEntradaNovedadCalidad(item, nombre, 'beneficiario'));
      }
    }
    return out;
  }

  /** Etiquetas de campo para columnas (prefijo antes de _reg / _genesys / _novedad). */
  readonly etiquetasCampoCalidadNovedad: Record<string, string> = {
    primer_nombre: 'Primer Nombre',
    segundo_nombre: 'Segundo Nombre',
    primer_apellido: 'Primer Apellido',
    segundo_apellido: 'Segundo Apellido',
    fecha_nacimiento: 'Fecha de Nacimiento',
    fecha_expedicion: 'Fecha de Expedición',
    tipo_documento: 'Tipo de documento',
    numero_documento: 'Número de documento',
  };

  textoEstadoNovedadCalidad(estadoId: number): string {
    if (estadoId === 1) return 'Pendiente';
    if (estadoId === 2) return 'Procesado';
    return estadoId > 0 ? `Estado ${estadoId}` : '—';
  }

  severidadEstadoNovedadCalidad(estadoId: number): 'success' | 'warning' | 'secondary' {
    if (estadoId === 1) return 'warning';
    if (estadoId === 2) return 'success';
    return 'secondary';
  }

  etiquetaRolNovedadCalidad(rol: 'trabajador' | 'beneficiario'): string {
    return rol === 'trabajador' ? 'Trabajador' : 'Beneficiario';
  }

  private getCalidadDatosBeneficiario(b: BeneficiarioBundle): NovedadCalidadDatosIntegrante[] {
    const desdeBeneficiario = b.beneficiario?.novedades?.calidad_datos;
    const desdeBundle = b.novedades?.calidad_datos;
    const raw = Array.isArray(desdeBeneficiario) && desdeBeneficiario.length > 0 ? desdeBeneficiario : desdeBundle;
    return Array.isArray(raw) ? raw : [];
  }

  private consolidarEntradaNovedadCalidad(
    item: NovedadCalidadDatosIntegrante,
    nombrePersona: string,
    rol: 'trabajador' | 'beneficiario'
  ): NovedadCalidadEntradaUIM {
    const rawEst = item.estado ?? item.id_estado;
    const estadoNum = rawEst != null ? Number(rawEst) : 0;
    const estadoId = Number.isFinite(estadoNum) ? estadoNum : 0;
    const fechaRegRaw =
      item.fecha_hora_registro != null ? String(item.fecha_hora_registro).trim() : '';
    return {
      nombrePersona,
      rol,
      item,
      filas: this.construirFilasDesdeDiferencias(item),
      estadoId,
      fechaRegistro: this.extraerSoloFechaRegistroNovedad(fechaRegRaw),
    };
  }

  private construirFilasDesdeDiferencias(item: NovedadCalidadDatosIntegrante): NovedadCalidadFilaVista[] {
    const rec = item as Record<string, unknown>;
    const diff = item.diferencias ?? {};
    const keys = Object.keys(diff)
      .filter((k) => k.toLowerCase().endsWith('_novedad'))
      .filter((k) => {
        const base = this.baseCampoDesdeClaveNovedad(k).toLowerCase();
        return base !== 'id';
      });
    keys.sort((a, b) =>
      this.etiquetaCampoCalidadNovedad(this.baseCampoDesdeClaveNovedad(a)).localeCompare(
        this.etiquetaCampoCalidadNovedad(this.baseCampoDesdeClaveNovedad(b)),
        'es'
      )
    );
    return keys.map((novKey) => {
      const base = this.baseCampoDesdeClaveNovedad(novKey);
      const regKey = `${base}_reg`;
      const genKey = `${base}_genesys`;
      return {
        campoLabel: this.etiquetaCampoCalidadNovedad(base),
        registraduria: this.celdaCalidadNovedad(rec[regKey]),
        genesys: this.celdaCalidadNovedad(rec[genKey]),
        novedad: this.celdaCalidadNovedad(rec[novKey]),
      };
    });
  }

  private baseCampoDesdeClaveNovedad(novKey: string): string {
    return novKey.replace(/_novedad$/i, '');
  }

  private etiquetaCampoCalidadNovedad(base: string): string {
    const fija = this.etiquetasCampoCalidadNovedad[base];
    if (fija) return fija;
    return base
      .split('_')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  private celdaCalidadNovedad(value: unknown): string {
    if (value === null || value === undefined) return '—';
    const s = String(value).trim();
    return s === '' ? '—' : s;
  }

  /** Deja solo la parte fecha (yyyy-MM-dd) de un timestamp ISO del backend. */
  private extraerSoloFechaRegistroNovedad(valor: string): string | null {
    if (!valor) return null;
    const m = valor.match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : null;
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
    if (typeof value === 'string') {
      // Extrae año/mes/día directamente del string (evita que "YYYY-MM-DD" se interprete
      // como medianoche UTC y, al leerse en hora local, muestre un día menos).
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
      if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    }
    const d = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(d.getTime())) return '—';
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Si el administrador del subsidio de un beneficiario es el mismo trabajador titular (mismo tipo y
   * número de documento) y no trae fecha de nacimiento, la precarga con la del trabajador.
   * Se ejecuta antes de tomar el snapshot para que no quede marcado como "cambio sin guardar".
   */
  private precargarFechaNacimientoAdministradorSubsidioIgualTrabajador(): void {
    const trabajadorPersona = this.afiliationRequestDetails?.trabajador?.persona;
    const fechaNacimientoTrabajador = trabajadorPersona?.fecha_nacimiento ?? null;
    const numDocTrabajador = (trabajadorPersona?.numero_documento ?? '').toString().trim().toUpperCase();
    if (!fechaNacimientoTrabajador || !numDocTrabajador) return;
    const tipoDocTrabajador = (trabajadorPersona?.tipo_documento ?? '').toString().trim().toUpperCase();

    (this.afiliationRequestDetails?.beneficiarios ?? []).forEach((b) => {
      const info = b.beneficiario;
      if (!info) return;
      const yaTieneFecha =
        info.fecha_nacimiento_administrador_subsidio != null &&
        String(info.fecha_nacimiento_administrador_subsidio).trim() !== '';
      if (yaTieneFecha) return;
      const numAdmin = (info.numero_identificacion_administrador_subsidio ?? '').toString().trim().toUpperCase();
      if (!numAdmin || numAdmin !== numDocTrabajador) return;
      const tipoAdmin = (info.tipo_identificacion_administrador_subsidio ?? '').toString().trim().toUpperCase();
      if (tipoAdmin && tipoDocTrabajador && tipoAdmin !== tipoDocTrabajador) return;
      info.fecha_nacimiento_administrador_subsidio = fechaNacimientoTrabajador;
    });
  }

  /** Guarda snapshots de los datos editables de cada beneficiario y marca cuáles tienen sección editable (CE/PPT al cargar). */
  guardarSnapshotBeneficiarios(): void {
    const list = this.afiliationRequestDetails?.beneficiarios ?? [];
    this.beneficioEditablePorIndice = list.map((b) => {
      const tipo = (b.persona?.tipo_documento ?? '').toString().trim().toUpperCase();
      return tipo === 'CE' || tipo === 'PPT' || tipo === 'CC' || tipo === 'TI' || tipo === 'RC';
    });
    this.beneficioEditableExtrasPorIndice = list.map((b) => {
      const tipo = (b.persona?.tipo_documento ?? '').toString().trim().toUpperCase();
      return tipo === 'CC' || tipo === 'TI' || tipo === 'RC';
    });
    this.snapshotBeneficiarios = list.map((b) => ({
      parentesco: b.beneficiario?.parentesco != null ? String(b.beneficiario.parentesco).trim() || null : null,
      tipo_documento: (b.persona?.tipo_documento ?? '').toString().trim(),
      numero_documento: (b.persona?.numero_documento ?? '').toString().trim(),
      primer_nombre: (b.persona?.primer_nombre ?? '').toString().trim(),
      segundo_nombre: b.persona?.segundo_nombre != null ? String(b.persona.segundo_nombre).trim() || null : null,
      primer_apellido: (b.persona?.primer_apellido ?? '').toString().trim(),
      segundo_apellido: b.persona?.segundo_apellido != null ? String(b.persona.segundo_apellido).trim() || null : null,
      fecha_expedicion_doc: b.persona?.fecha_expedicion_doc ?? null,
      fecha_nacimiento: b.persona?.fecha_nacimiento ?? null,
      genero: b.persona?.genero != null ? String(b.persona.genero).trim() || null : null,
      direccion_corresponde_trabajador: b.beneficiario?.direccion_corresponde_trabajador != null ? String(b.beneficiario.direccion_corresponde_trabajador).trim() || null : null,
      direccion: b.persona?.direccion != null ? String(b.persona.direccion).trim() || null : null,
      nuevo_beneficiario: b.beneficiario?.nuevo_beneficiario != null ? String(b.beneficiario.nuevo_beneficiario).trim() || null : null,
      nuevo_grupo_familiar: b.beneficiario?.nuevo_grupo_familiar != null ? String(b.beneficiario.nuevo_grupo_familiar).trim() || null : null,
      numero_grupo_familiar: b.beneficiario?.numero_grupo_familiar ?? null,
      fecha_inicio_invalidez: b.beneficiario?.fecha_inicio_invalidez ?? null,
      fecha_reporte_invalidez: b.beneficiario?.fecha_reporte_invalidez ?? null,
      tipo_identificacion_administrador_subsidio: b.beneficiario?.tipo_identificacion_administrador_subsidio != null ? String(b.beneficiario.tipo_identificacion_administrador_subsidio).trim() || null : null,
      numero_identificacion_administrador_subsidio: b.beneficiario?.numero_identificacion_administrador_subsidio != null ? String(b.beneficiario.numero_identificacion_administrador_subsidio).trim() || null : null,
      nombre_completo_administrador_subsidio: b.beneficiario?.nombre_completo_administrador_subsidio != null ? String(b.beneficiario.nombre_completo_administrador_subsidio).trim() || null : null,
      fecha_nacimiento_administrador_subsidio: b.beneficiario?.fecha_nacimiento_administrador_subsidio ?? null,
    }));
  }

  /** True si el estado actual de la solicitud es "Aprobada completa" o "Aprobada incompleta": ya no se permite editar datos de trabajador ni beneficiarios. */
  private get solicitudEstadoNoEditable(): boolean {
    const d = this.afiliationRequestDetails;
    if (!d?.solicitud) return false;
    const texto = this.normalizarTextoEstadoTimeline(this.currentState || d.solicitud.estado_codigo);
    return texto === 'aprobada completa' || texto === 'aprobada incompleta';
  }

  /** True si el estado de gestión del integrante ya es "Procesado": no se permite editar sus datos ni subir adjuntos adicionales. */
  personaGestionNoEditable(contexto: 'trabajador' | 'beneficiario', indiceBeneficiario?: number): boolean {
    const id = this.idEstadoGestionPersonaIntegrante(contexto, indiceBeneficiario);
    if (id == null) {
      return false;
    }
    const n = Number(id);
    return n === this.ID_ESTADO_GESTION_PROCESADO;
  }

  /** True si el beneficiario en el índice dado tiene la sección editable (era CE/PPT/CC/TI/RC al cargar; los selectores no se ocultan al cambiar). */
  beneficioPuedeEditar(index: number): boolean {
    return (
      this.beneficioEditablePorIndice[index] === true &&
      !this.solicitudEstadoNoEditable &&
      !this.personaGestionNoEditable('beneficiario', index)
    );
  }

  /** True si el beneficiario en el índice dado tiene habilitada la edición de campos adicionales (era CC/TI/RC al cargar): grupo familiar, invalidez, admin subsidios. */
  beneficioPuedeEditarExtras(index: number): boolean {
    return (
      this.beneficioEditableExtrasPorIndice[index] === true &&
      !this.solicitudEstadoNoEditable &&
      !this.personaGestionNoEditable('beneficiario', index)
    );
  }

  /** True si el beneficiario tiene parentesco "Hijo" (único caso con sección de Padres biológicos). */
  esBeneficiarioHijo(b: BeneficiarioBundle | undefined): boolean {
    const parentesco = (b?.beneficiario?.parentesco ?? '').toString().trim().toLowerCase();
    return parentesco === 'hijo';
  }

  /** Consulta padre/madre biológicos de cada beneficiario Hijo de la solicitud (afiliaciones.padres_biologicos). */
  cargarPadresBiologicosBeneficiarios(): void {
    const list = this.afiliationRequestDetails?.beneficiarios ?? [];
    this.padresBiologicosPorBeneficiario = list.map(() => ({ padre: null, madre: null, loading: false }));

    list.forEach((b, index) => {
      if (!this.esBeneficiarioHijo(b)) return;
      this.fetchPadresBiologicosBeneficiario(index, b.persona.id);
    });
  }

  /** Vuelve a consultar padre/madre biológicos de un solo beneficiario (tras agregar/completar/cambiar estado). */
  private fetchPadresBiologicosBeneficiario(index: number, idSolicitudPersona: number): void {
    if (!this.padresBiologicosPorBeneficiario[index]) {
      this.padresBiologicosPorBeneficiario[index] = { padre: null, madre: null, loading: false };
    }
    this.padresBiologicosPorBeneficiario[index].loading = true;
    this.userService.getPadresBiologicosByPersona(idSolicitudPersona).subscribe({
      next: (response) => {
        this.padresBiologicosPorBeneficiario[index].loading = false;
        if (response.code !== 200) return;
        const registros = response.data ?? [];
        this.padresBiologicosPorBeneficiario[index].padre =
          registros.find((r) => r.es_madre_o_padre === 'padre') ?? null;
        this.padresBiologicosPorBeneficiario[index].madre =
          registros.find((r) => r.es_madre_o_padre === 'madre') ?? null;
      },
      error: () => {
        this.padresBiologicosPorBeneficiario[index].loading = false;
      },
    });
  }

  padresBiologicosCargando(index: number): boolean {
    return this.padresBiologicosPorBeneficiario[index]?.loading === true;
  }

  getPadreBiologico(index: number): PadreBiologicoRecord | null {
    return this.padresBiologicosPorBeneficiario[index]?.padre ?? null;
  }

  getMadreBiologica(index: number): PadreBiologicoRecord | null {
    return this.padresBiologicosPorBeneficiario[index]?.madre ?? null;
  }

  /** Formatea estado_rpa_padres para mostrar (el valor crudo se conserva en el registro para futura persistencia). */
  getLabelEstadoRpaPadres(value: string | null | undefined): string {
    const v = (value ?? '').toString().trim();
    if (v === 'En_ejecucion') return 'En ejecución';
    if (v === 'No procesado') return 'No procesado';
    return v || '—';
  }

  keyPadreBiologico(iBenef: number, rol: 'padre' | 'madre'): string {
    return `${iBenef}-${rol}`;
  }

  /** Abre el formulario en blanco para agregar el padre/madre biológico inexistente. */
  abrirAgregarPadreBiologico(iBenef: number, rol: 'padre' | 'madre'): void {
    const key = this.keyPadreBiologico(iBenef, rol);
    this.formularioPadreBiologicoAbierto[key] = true;
    this.formPadreBiologico[key] = {
      tipo_documento: null,
      numero_documento: null,
      primer_nombre: null,
      segundo_nombre: null,
      primer_apellido: null,
      segundo_apellido: null,
    };
  }

  cancelarAgregarPadreBiologico(iBenef: number, rol: 'padre' | 'madre'): void {
    const key = this.keyPadreBiologico(iBenef, rol);
    this.formularioPadreBiologicoAbierto[key] = false;
    delete this.formPadreBiologico[key];
  }

  puedeGuardarNuevoPadreBiologico(iBenef: number, rol: 'padre' | 'madre'): boolean {
    const form = this.formPadreBiologico[this.keyPadreBiologico(iBenef, rol)];
    if (!form) return false;
    return !!(
      form.tipo_documento?.trim() &&
      form.numero_documento?.trim() &&
      form.primer_nombre?.trim() &&
      form.primer_apellido?.trim()
    );
  }

  /** Inserta el padre/madre biológico a partir del formulario "Agregar". */
  guardarNuevoPadreBiologico(b: BeneficiarioBundle, iBenef: number, rol: 'padre' | 'madre'): void {
    const key = this.keyPadreBiologico(iBenef, rol);
    const form = this.formPadreBiologico[key];
    if (!form) return;

    this.guardandoPadreBiologicoKey = key;
    this.userService
      .guardarPadreBiologico({
        idSolicitudPersona: b.persona.id,
        esMadreOPadre: rol,
        tipoDocumento: form.tipo_documento,
        numeroDocumento: form.numero_documento,
        primerNombre: form.primer_nombre,
        segundoNombre: form.segundo_nombre,
        primerApellido: form.primer_apellido,
        segundoApellido: form.segundo_apellido,
      })
      .subscribe({
        next: (res) => {
          this.guardandoPadreBiologicoKey = null;
          if (res?.code === 200) {
            this.cancelarAgregarPadreBiologico(iBenef, rol);
            this.showSuccessMessage(
              'success',
              'Exitoso',
              rol === 'padre' ? 'Se agregó la información del padre.' : 'Se agregó la información de la madre.'
            );
            this.fetchPadresBiologicosBeneficiario(iBenef, b.persona.id);
          } else {
            this.showSuccessMessage('warn', 'Aviso', res?.message || 'No fue posible guardar la información.');
          }
        },
        error: () => {
          this.guardandoPadreBiologicoKey = null;
          this.showSuccessMessage('error', 'Error', 'Error al guardar la información.');
        },
      });
  }

  /** True si el registro tiene los campos obligatorios completos (habilita guardar cuando pendiente_completar = 'Si'). */
  puedeGuardarCompletarPadreBiologico(registro: PadreBiologicoRecord | null): boolean {
    if (!registro) return false;
    return !!(
      registro.tipo_documento?.trim() &&
      registro.numero_documento?.trim() &&
      registro.primer_nombre?.trim() &&
      registro.primer_apellido?.trim()
    );
  }

  /** Completa (update) un padre/madre biológico con pendiente_completar = 'Si'. Solo se envían los campos del registro; el backend solo actualiza los que estén vacíos. */
  completarPadreBiologico(registro: PadreBiologicoRecord | null, b: BeneficiarioBundle, iBenef: number, rol: 'padre' | 'madre'): void {
    if (!registro) return;
    const key = this.keyPadreBiologico(iBenef, rol);

    this.guardandoPadreBiologicoKey = key;
    this.userService
      .guardarPadreBiologico({
        idSolicitudPersona: b.persona.id,
        esMadreOPadre: rol,
        id: registro.id,
        tipoDocumento: registro.tipo_documento,
        numeroDocumento: registro.numero_documento,
        primerNombre: registro.primer_nombre,
        segundoNombre: registro.segundo_nombre,
        primerApellido: registro.primer_apellido,
        segundoApellido: registro.segundo_apellido,
      })
      .subscribe({
        next: (res) => {
          this.guardandoPadreBiologicoKey = null;
          if (res?.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Información actualizada.');
            this.fetchPadresBiologicosBeneficiario(iBenef, b.persona.id);
          } else {
            this.showSuccessMessage('warn', 'Aviso', res?.message || 'No fue posible guardar la información.');
          }
        },
        error: () => {
          this.guardandoPadreBiologicoKey = null;
          this.showSuccessMessage('error', 'Error', 'Error al guardar la información.');
        },
      });
  }

  /** Modelo de edición de estado RPA por id de registro (se crea perezosamente al primer acceso). */
  estadoRpaModel(idPadre: number): { nuevoEstado: 'Pendiente' | 'Procesado' | null; radicado: string } {
    if (!this.estadoRpaPadresEdicion[idPadre]) {
      this.estadoRpaPadresEdicion[idPadre] = { nuevoEstado: null, radicado: '' };
    }
    return this.estadoRpaPadresEdicion[idPadre];
  }

  puedeGuardarEstadoRpaPadreBiologico(idPadre: number): boolean {
    const modelo = this.estadoRpaModel(idPadre);
    if (!modelo.nuevoEstado) return false;
    if (modelo.nuevoEstado === 'Procesado' && !modelo.radicado.trim()) return false;
    return true;
  }

  /** Cambia estado_rpa_padres de "No procesado" a "Pendiente" o "Procesado". */
  guardarEstadoRpaPadreBiologico(registro: PadreBiologicoRecord, iBenef: number, b: BeneficiarioBundle): void {
    const modelo = this.estadoRpaModel(registro.id);
    if (!this.puedeGuardarEstadoRpaPadreBiologico(registro.id) || !modelo.nuevoEstado) return;

    this.guardandoEstadoRpaPadresId = registro.id;
    this.userService
      .cambiarEstadoRpaPadreBiologico({
        id: registro.id,
        estadoRpaPadres: modelo.nuevoEstado,
        radicadoOtroPadre: modelo.nuevoEstado === 'Procesado' ? modelo.radicado.trim() : null,
      })
      .subscribe({
        next: (res) => {
          this.guardandoEstadoRpaPadresId = null;
          if (res?.code === 200) {
            delete this.estadoRpaPadresEdicion[registro.id];
            this.showSuccessMessage('success', 'Exitoso', 'Estado actualizado.');
            this.fetchPadresBiologicosBeneficiario(iBenef, b.persona.id);
          } else {
            this.showSuccessMessage('warn', 'Aviso', res?.message || 'No fue posible actualizar el estado.');
          }
        },
        error: () => {
          this.guardandoEstadoRpaPadresId = null;
          this.showSuccessMessage('error', 'Error', 'Error al actualizar el estado.');
        },
      });
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
    const segNombre = (p?.segundo_nombre ?? '').toString().trim();
    if (segNombre !== (snap.segundo_nombre ?? '')) return true;
    if ((p?.primer_apellido ?? '').toString().trim() !== snap.primer_apellido) return true;
    const segApellido = (p?.segundo_apellido ?? '').toString().trim();
    if (segApellido !== (snap.segundo_apellido ?? '')) return true;
    if ((p?.fecha_expedicion_doc ?? null) !== (snap.fecha_expedicion_doc ?? null)) return true;
    if ((p?.fecha_nacimiento ?? null) !== (snap.fecha_nacimiento ?? null)) return true;
    const genero = (p?.genero ?? '').toString().trim();
    if (genero !== (snap.genero ?? '')) return true;
    const dirTrab = (ben?.direccion_corresponde_trabajador ?? '').toString().trim();
    if (dirTrab !== (snap.direccion_corresponde_trabajador ?? '')) return true;
    const dir = (p?.direccion ?? '').toString().trim();
    if (dir !== (snap.direccion ?? '')) return true;
    if (this.beneficioPuedeEditarExtras(index)) {
      const nuevoBenef = (ben?.nuevo_beneficiario ?? '').toString().trim();
      if (nuevoBenef !== (snap.nuevo_beneficiario ?? '')) return true;
      const nuevoGrupo = (ben?.nuevo_grupo_familiar ?? '').toString().trim();
      if (nuevoGrupo !== (snap.nuevo_grupo_familiar ?? '')) return true;
      if ((ben?.numero_grupo_familiar ?? null) !== (snap.numero_grupo_familiar ?? null)) return true;
      if ((ben?.fecha_inicio_invalidez ?? null) !== (snap.fecha_inicio_invalidez ?? null)) return true;
      if ((ben?.fecha_reporte_invalidez ?? null) !== (snap.fecha_reporte_invalidez ?? null)) return true;
      const tipoAdmin = (ben?.tipo_identificacion_administrador_subsidio ?? '').toString().trim();
      if (tipoAdmin !== (snap.tipo_identificacion_administrador_subsidio ?? '')) return true;
      const numAdmin = (ben?.numero_identificacion_administrador_subsidio ?? '').toString().trim();
      if (numAdmin !== (snap.numero_identificacion_administrador_subsidio ?? '')) return true;
      const nomAdmin = (ben?.nombre_completo_administrador_subsidio ?? '').toString().trim();
      if (nomAdmin !== (snap.nombre_completo_administrador_subsidio ?? '')) return true;
      if ((ben?.fecha_nacimiento_administrador_subsidio ?? null) !== (snap.fecha_nacimiento_administrador_subsidio ?? null)) return true;
    }
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
    const payload: {
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
      parentesco: string | null;
      direccion_corresponde_trabajador: string | null;
      direccion: string | null;
      nuevo_beneficiario?: string | null;
      nuevo_grupo_familiar?: string | null;
      numero_grupo_familiar?: number | null;
      fecha_inicio_invalidez?: string | null;
      fecha_reporte_invalidez?: string | null;
      tipo_identificacion_administrador_subsidio?: string | null;
      numero_identificacion_administrador_subsidio?: string | null;
      nombre_completo_administrador_subsidio?: string | null;
      fecha_nacimiento_administrador_subsidio?: string | null;
    } = {
      id_persona: p.id,
      id_solicitud: d.solicitud.id,
      tipo_documento: (p.tipo_documento ?? '').toString().trim(),
      numero_documento: (p.numero_documento ?? '').toString().trim(),
      primer_apellido: (p.primer_apellido ?? '').toString().trim(),
      segundo_apellido: p.segundo_apellido != null ? String(p.segundo_apellido).trim() || null : null,
      primer_nombre: (p.primer_nombre ?? '').toString().trim(),
      segundo_nombre: p.segundo_nombre != null ? String(p.segundo_nombre).trim() || null : null,
      fecha_expedicion_doc: p.fecha_expedicion_doc ?? null,
      fecha_nacimiento: p.fecha_nacimiento ?? null,
      genero: p.genero ?? null,
      parentesco: ben?.parentesco ?? null,
      direccion_corresponde_trabajador: dirTrab || null,
      direccion: dirTrabNorm === 'si' ? (this.getDireccionTrabajador() || null) : (p.direccion ?? null),
    };
    if (this.beneficioPuedeEditarExtras(index)) {
      payload.nuevo_beneficiario = ben?.nuevo_beneficiario != null ? String(ben.nuevo_beneficiario).trim() || null : null;
      payload.nuevo_grupo_familiar = ben?.nuevo_grupo_familiar != null ? String(ben.nuevo_grupo_familiar).trim() || null : null;
      payload.numero_grupo_familiar = ben?.numero_grupo_familiar ?? null;
      payload.fecha_inicio_invalidez = ben?.fecha_inicio_invalidez ?? null;
      payload.fecha_reporte_invalidez = ben?.fecha_reporte_invalidez ?? null;
      payload.tipo_identificacion_administrador_subsidio = ben?.tipo_identificacion_administrador_subsidio != null ? String(ben.tipo_identificacion_administrador_subsidio).trim() || null : null;
      payload.numero_identificacion_administrador_subsidio = ben?.numero_identificacion_administrador_subsidio != null ? String(ben.numero_identificacion_administrador_subsidio).trim() || null : null;
      payload.nombre_completo_administrador_subsidio = ben?.nombre_completo_administrador_subsidio != null ? String(ben.nombre_completo_administrador_subsidio).trim() || null : null;
      payload.fecha_nacimiento_administrador_subsidio = ben?.fecha_nacimiento_administrador_subsidio ?? null;
    }
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
    return (
      this.trabajadorEditablePorCarga &&
      !this.solicitudEstadoNoEditable &&
      !this.personaGestionNoEditable('trabajador')
    );
  }

  /** True si al cargar el trabajador no tenía estado civil registrado; la edición se mantiene aunque el usuario seleccione un valor (para que el botón Guardar siga visible). */
  private estadoCivilVacioPorCarga = false;

  /** True si existe al menos un beneficiario con parentesco "Cónyuge". */
  private get hayBeneficiarioConyuge(): boolean {
    const d = this.afiliationRequestDetails;
    if (!d?.beneficiarios?.length) return false;
    const parentescoConyuge = (p: string | null | undefined) => {
      if (p == null) return false;
      const n = p.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return n === 'conyuge' || n.includes('conyuge');
    };
    return d.beneficiarios.some((b) => parentescoConyuge(b.beneficiario?.parentesco));
  }

  /**
   * True si al cargar el trabajador no tenía estado civil registrado.
   * Es "sticky" (no depende del valor seleccionado actualmente) para que la sección y el botón
   * Guardar permanezcan visibles mientras el usuario elige una opción.
   */
  private get estadoCivilTrabajadorVacio(): boolean {
    return this.estadoCivilVacioPorCarga;
  }

  /**
   * El campo Estado civil queda editable cuando:
   *  (a) existe al menos un beneficiario con parentesco Cónyuge (puede que haya que actualizar el estado civil), o
   *  (b) el trabajador no tiene estado civil registrado (el campo viene vacío y debe completarse).
   */
  get mostrarEstadoCivilEditable(): boolean {
    return (
      (this.hayBeneficiarioConyuge || this.estadoCivilTrabajadorVacio) &&
      !this.solicitudEstadoNoEditable &&
      !this.personaGestionNoEditable('trabajador')
    );
  }

  /** True cuando el estado civil actual es "Soltero(a)" Y existe un beneficiario Cónyuge. Solo para mostrar la alerta. */
  get tieneAlertaEstadoCivilSolteroConConyuge(): boolean {
    const d = this.afiliationRequestDetails;
    if (!d?.trabajador?.trabajador || !this.hayBeneficiarioConyuge) return false;
    const estadoCivil = (d.trabajador.trabajador.estado_civil ?? '').toString().trim();
    return estadoCivil.toLowerCase().includes('soltero');
  }

  /** True cuando el valor actualmente seleccionado de estado civil es vacío. Se usa para mostrar la alerta y debe reaccionar al cambio del dropdown. */
  get tieneAlertaEstadoCivilVacio(): boolean {
    const d = this.afiliationRequestDetails;
    if (!d?.trabajador?.trabajador) return false;
    return !((d.trabajador.trabajador.estado_civil ?? '').toString().trim());
  }

  /** True cuando alguna de las alertas de estado civil debe mostrarse. */
  get tieneAlertaEstadoCivil(): boolean {
    return this.tieneAlertaEstadoCivilSolteroConConyuge || this.tieneAlertaEstadoCivilVacio;
  }

  /** Texto contextual de la alerta de estado civil según el caso aplicable. */
  get mensajeAlertaEstadoCivil(): string {
    if (this.tieneAlertaEstadoCivilSolteroConConyuge) {
      return 'El afiliado figura como Soltero pero tiene un beneficiario con parentesco Cónyuge. Posiblemente el campo deba actualizarse.';
    }
    if (this.tieneAlertaEstadoCivilVacio) {
      return 'El afiliado no tiene un estado civil registrado. Por favor, seleccione una opción.';
    }
    return '';
  }

  /** Guarda snapshot de los datos editables del afiliado y marca si la sección trabajador es editable (CE/PPT al cargar) y si el estado civil venía vacío. */
  guardarSnapshotDatosTrabajador(): void {
    const d = this.afiliationRequestDetails;
    const p = d?.trabajador?.persona;
    const t = d?.trabajador?.trabajador;
    if (!p) {
      this.snapshotDatosTrabajador = null;
      this.trabajadorEditablePorCarga = false;
      this.estadoCivilVacioPorCarga = false;
      return;
    }
    const tipo = (p.tipo_documento ?? '').toString().trim().toUpperCase();
    this.trabajadorEditablePorCarga = tipo === 'CE' || tipo === 'PPT';
    this.estadoCivilVacioPorCarga = !((t?.estado_civil ?? '').toString().trim());
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

  /** True si la ruta guardada ya es una URL http(s) (registros antiguos). */
  private esRutaAbsolutaHttp(ruta: string): boolean {
    return /^https?:\/\//i.test((ruta ?? '').trim());
  }

  /** Normaliza el cuerpo de la Lambda (string u objeto con url / signedUrl / href). */
  private extraerUrlDesdeRespuestaAdjunto(data: unknown): string {
    if (typeof data === 'string') {
      return data.trim();
    }
    if (data && typeof data === 'object') {
      const o = data as Record<string, unknown>;
      const u = o['url'] ?? o['signedUrl'] ?? o['href'] ?? o['presignedUrl'];
      if (typeof u === 'string') {
        return u.trim();
      }
    }
    return '';
  }

  /** Descarga silenciosa: enlace temporal sin nueva pestaña ni ventana. */
  private dispararDescargaPorEnlace(url: string, nombreArchivo: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', nombreArchivo || 'archivo');
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  private nombreOCaminoParaTipo(adjunto: Adjunto | { ruta_archivo?: string | null; nombre_archivo?: string | null }): string {
    const a = adjunto as Adjunto;
    return ((a.nombre_archivo ?? adjunto.ruta_archivo) ?? '').toString().toLowerCase();
  }

  private esAdjuntoImagen(adjunto: Adjunto | { content_type?: string | null; ruta_archivo?: string | null; nombre_archivo?: string | null }): boolean {
    const ct = ((adjunto as Adjunto).content_type ?? '').toString().toLowerCase();
    if (ct.startsWith('image/')) {
      return true;
    }
    return /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(this.nombreOCaminoParaTipo(adjunto));
  }

  private esAdjuntoPdf(adjunto: Adjunto | { content_type?: string | null; ruta_archivo?: string | null; nombre_archivo?: string | null }): boolean {
    const ct = ((adjunto as Adjunto).content_type ?? '').toString().toLowerCase();
    if (ct === 'application/pdf' || ct.includes('pdf')) {
      return true;
    }
    return /\.pdf$/i.test(this.nombreOCaminoParaTipo(adjunto));
  }

  /** Respaldo: ventana emergente si no se puede cargar el PDF como blob (p. ej. CORS). */
  private abrirPdfEnVentanaEmergente(url: string): void {
    const w = 800;
    const h = 900;
    const left = Math.round((window.screen.availWidth - w) / 2);
    const top = Math.round((window.screen.availHeight - h) / 2);
    const features = [
      `width=${w}`,
      `height=${h}`,
      `left=${left}`,
      `top=${top}`,
      'menubar=no',
      'toolbar=no',
      'location=no',
      'status=no',
      'resizable=yes',
      'scrollbars=yes',
    ].join(',');
    window.open(url, 'adjuntoPdfPreview', features);
  }

  /**
   * Descarga el PDF por GET y lo muestra en modal con iframe (blob:).
   * Así el navegador lo trata como inline aunque la URL firmada lleve attachment.
   */
  private abrirPdfPrevisualizacionConBlob(url: string): void {
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const mime =
          blob.type && blob.type !== 'application/octet-stream' ? blob.type : 'application/pdf';
        const pdfBlob = new Blob([blob], { type: mime });
        this.limpiarBlobPrevisualizacionPdf();
        this.pdfPreviewBlobUrl = URL.createObjectURL(pdfBlob);
        this.urlPdfPreview = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfPreviewBlobUrl);
        this.displayModalPdf = true;
      },
      error: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Previsualización PDF',
          detail:
            'No se pudo cargar el archivo para vista previa en pantalla. Se intentará abrir en una ventana nueva; si sigue pidiendo descargar, use «Descargar».',
        });
        this.abrirPdfEnVentanaEmergente(url);
      },
    });
  }

  private limpiarBlobPrevisualizacionPdf(): void {
    if (this.pdfPreviewBlobUrl) {
      try {
        URL.revokeObjectURL(this.pdfPreviewBlobUrl);
      } catch {
        /* noop */
      }
      this.pdfPreviewBlobUrl = null;
    }
    this.urlPdfPreview = null;
  }

  cerrarModalPrevisualizacionPdf(): void {
    this.displayModalPdf = false;
    this.limpiarBlobPrevisualizacionPdf();
  }

  private aplicarPrevisualizacionAdjunto(url: string, adjunto: Adjunto | { content_type?: string | null; ruta_archivo?: string | null; nombre_archivo?: string | null }): void {
    if (this.esAdjuntoImagen(adjunto)) {
      this.urlImagenPreview = url;
      this.displayModal = true;
      return;
    }
    if (this.esAdjuntoPdf(adjunto)) {
      this.abrirPdfPrevisualizacionConBlob(url);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  cerrarModalPrevisualizacionImagen(): void {
    this.displayModal = false;
    this.urlImagenPreview = '';
  }

  /**
   * Previsualización según tipo: imagen en p-dialog, PDF en modal con iframe (blob), resto en nueva pestaña.
   * Solo `ruta_archivo` en el POST (sin nombre_descarga). Rutas http(s) antiguas sin API.
   */
  /** Alias explícito para el expediente unificado y adjuntos (misma lógica que abrirAdjunto). */
  previsualizarAdjunto(adjunto: Adjunto | { ruta_archivo?: string | null; content_type?: string | null; nombre_archivo?: string | null }): void {
    this.abrirAdjunto(adjunto);
  }

  abrirAdjunto(adjunto: Adjunto | { ruta_archivo?: string | null; content_type?: string | null; nombre_archivo?: string | null }): void {
    const ruta = (adjunto?.ruta_archivo ?? '').toString().trim();
    if (!ruta) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Adjunto',
        detail: 'No hay ruta de archivo para este adjunto.',
      });
      return;
    }
    if (this.esRutaAbsolutaHttp(ruta)) {
      this.aplicarPrevisualizacionAdjunto(ruta, adjunto);
      return;
    }
    this.userService.getAdjuntoAfiliacionUrl(ruta).subscribe({
      next: (response: BodyResponse<string>) => {
        if (response?.code !== 200 || response?.data == null) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response?.message || 'No se pudo obtener la URL del adjunto.',
          });
          return;
        }
        const url = this.extraerUrlDesdeRespuestaAdjunto(response.data);
        if (!url) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'La respuesta del servidor no contiene una URL válida.',
          });
          return;
        }
        this.aplicarPrevisualizacionAdjunto(url, adjunto);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al obtener el archivo. Intente de nuevo.',
        });
      },
    });
  }

  /**
   * Descarga con nombre: envía `nombre_descarga` para Content-Disposition attachment.
   * URLs absolutas antiguas: enlace temporal sin pasar por la Lambda.
   */
  descargarAdjunto(adjunto: Adjunto | { ruta_archivo?: string | null; nombre_archivo?: string | null }): void {
    const ruta = (adjunto?.ruta_archivo ?? '').toString().trim();
    const nombreDescarga = ((adjunto as Adjunto)?.nombre_archivo ?? '').toString().trim() || 'archivo';
    if (!ruta) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Adjunto',
        detail: 'No hay ruta de archivo para este adjunto.',
      });
      return;
    }
    if (this.esRutaAbsolutaHttp(ruta)) {
      this.dispararDescargaPorEnlace(ruta, nombreDescarga);
      return;
    }
    this.userService.getAdjuntoAfiliacionUrl(ruta, nombreDescarga).subscribe({
      next: (response: BodyResponse<string>) => {
        if (response?.code !== 200 || response?.data == null) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response?.message || 'No se pudo obtener la URL del adjunto.',
          });
          return;
        }
        const url = this.extraerUrlDesdeRespuestaAdjunto(response.data);
        if (!url) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'La respuesta del servidor no contiene una URL válida.',
          });
          return;
        }
        this.dispararDescargaPorEnlace(url, nombreDescarga);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al obtener el archivo. Intente de nuevo.',
        });
      },
    });
  }

  /** Genera el expediente (PDF unificado), una sola vez por solicitud. Envía id_solicitud al backend; al éxito refresca el detalle. */
  generarExpediente(): void {
    const d = this.afiliationRequestDetails;
    if (!d?.solicitud?.id) {
      this.messageService.add({ severity: 'warn', summary: 'Expediente', detail: 'No hay solicitud cargada.' });
      return;
    }
    if (d.solicitud.expediente) {
      this.messageService.add({
        severity: 'info',
        summary: 'Expediente',
        detail: 'Esta solicitud ya tiene un expediente generado. Solo se permite un expediente por solicitud.',
      });
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
    this.userService.generarExpedienteAfiliacion(d.solicitud.id).subscribe({
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

  /**
   * Abre el modal, limpia el formulario y carga tipos de adjunto.
   * Trabajador: catálogo general de tipos de adjunto (sin parentesco).
   * Beneficiario: tipos según id del catálogo parametros_parentesco.
   * @param idPersona id de persona (trabajador o beneficiario)
   * @param idParentesco id del catálogo parametros_parentesco (solo beneficiario)
   */
  abrirModalAdjuntos(idPersona: number, idParentesco: number): void {
    const d = this.afiliationRequestDetails;
    if (!d) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Datos',
        detail: 'No hay información de la solicitud cargada.',
      });
      return;
    }
    if (d.solicitud?.expediente) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Expediente unificado',
        detail:
          'No puede subir adjuntos mientras exista un expediente generado para esta solicitud.',
      });
      return;
    }
    if (this.solicitudEnPendienteAfiliacionRpa) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Pendiente afiliación RPA',
        detail:
          'No puede subir adjuntos adicionales mientras la solicitud esté en Pendiente afiliación RPA.',
      });
      return;
    }
    if (!idPersona) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Datos',
        detail: 'No se pudo determinar la persona para cargar los tipos de adjunto.',
      });
      return;
    }

    const esTrabajador = d.trabajador?.persona?.id === idPersona;
    const idxBeneficiario = esTrabajador ? -1 : (d.beneficiarios?.findIndex(b => b.persona.id === idPersona) ?? -1);
    if (
      this.personaGestionNoEditable(
        esTrabajador ? 'trabajador' : 'beneficiario',
        esTrabajador || idxBeneficiario < 0 ? undefined : idxBeneficiario
      )
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Procesado',
        detail: 'Esta persona ya fue procesada: no se pueden subir adjuntos adicionales.',
      });
      return;
    }
    if (!esTrabajador && !idParentesco) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Parentesco',
        detail:
          'No se pudo determinar el parentesco para cargar los tipos de adjunto. Verifique el catálogo de parentescos.',
      });
      return;
    }

    if (esTrabajador) {
      this.adjuntosAdicionalesPara = 'trabajador';
    } else {
      this.adjuntosAdicionalesPara = idxBeneficiario >= 0 ? idxBeneficiario : 'trabajador';
    }

    this.visibleModalAdjuntosAdicionales = true;
    this.adjuntoForm.reset();
    this.formatosPermitidosActuales = '';
    this.archivoSeleccionado = null;
    this.archivosAdjuntosAdicionales = [];
    this.listaTiposAdjunto = [];
    const input = this.fileInputAdjuntosAdicionalesRef?.nativeElement;
    if (input) input.value = '';

    this.cargandoCatalogoAdjuntosPorParentesco = true;
    if (esTrabajador) {
      this.userService.getAttachmentList().subscribe({
        next: res => {
          this.cargandoCatalogoAdjuntosPorParentesco = false;
          if (res?.code === 200 && Array.isArray(res.data)) {
            this.listaTiposAdjunto = res.data
              .filter(t => t.esta_activo !== false && t.id != null)
              .map(t => ({
                id: t.id as number,
                nombre_documento: t.nombre_documento,
                formatos_permitidos: t.formatos_permitidos,
              }));
          } else {
            this.listaTiposAdjunto = [];
            this.messageService.add({
              severity: 'warn',
              summary: 'Catálogo',
              detail: res?.message || 'No se obtuvieron tipos de adjunto para el trabajador.',
            });
          }
        },
        error: () => {
          this.cargandoCatalogoAdjuntosPorParentesco = false;
          this.listaTiposAdjunto = [];
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el catálogo de tipos de adjunto.',
          });
        },
      });
      return;
    }

    this.userService.obtenerAdjuntosPorParentesco(idParentesco).subscribe({
      next: res => {
        this.cargandoCatalogoAdjuntosPorParentesco = false;
        if (res?.code === 200 && Array.isArray(res.data)) {
          this.listaTiposAdjunto = res.data;
        } else {
          this.listaTiposAdjunto = [];
          this.messageService.add({
            severity: 'warn',
            summary: 'Catálogo',
            detail: res?.message || 'No se obtuvieron tipos de adjunto para este parentesco.',
          });
        }
      },
      error: () => {
        this.cargandoCatalogoAdjuntosPorParentesco = false;
        this.listaTiposAdjunto = [];
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el catálogo de adjuntos por parentesco.',
        });
      },
    });
  }

  /** Al cambiar el tipo de documento: actualiza formatos permitidos para el input file. */
  onTipoDocumentoChange(event: { value?: number | null }): void {
    const id = event?.value;
    const row = this.listaTiposAdjunto.find(t => Number(t.id) === Number(id));
    this.formatosPermitidosActuales = this.normalizarAcceptFormatos(row?.formatos_permitidos ?? '');
  }

  /** Cierra el modal de adjuntos adicionales. */
  closeModalAdjuntosAdicionales(): void {
    this.visibleModalAdjuntosAdicionales = false;
    this.archivosAdjuntosAdicionales = [];
    this.archivoSeleccionado = null;
    this.adjuntoForm.reset();
    this.listaTiposAdjunto = [];
    this.formatosPermitidosActuales = '';
    this.cargandoCatalogoAdjuntosPorParentesco = false;
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

  /** Al seleccionar archivo en el input del modal. */
  onFileSelectedAdjuntosAdicionales(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0] ?? null;
    this.archivoSeleccionado = file;
    this.archivosAdjuntosAdicionales = file ? [file] : [];
  }

  /** Sube los archivos seleccionados y los agrega a la lista de adjuntos del trabajador o beneficiario. */
  async subirAdjuntosAdicionales(): Promise<void> {
    this.adjuntoForm.markAllAsTouched();
    if (this.adjuntoForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Tipo de adjunto',
        detail: 'Seleccione el tipo de documento.',
      });
      return;
    }
    if (!this.archivoSeleccionado) {
      this.messageService.add({ severity: 'warn', summary: 'Archivo requerido', detail: 'Seleccione un archivo.' });
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

    const file = this.archivoSeleccionado;
    const contentType = (file.type ?? '').trim() || 'application/octet-stream';

    /** Paso 1: solo datos mínimos para firmar la URL en S3. */
    const payloadGenerarUrl: Record<string, unknown> = {
      id_persona: idPersona,
      nombre_archivo: file.name,
      content_type: contentType,
    };

    try {
      this.subiendoAdjuntosAdicionales = true;

      const resPaso1 = await lastValueFrom(this.userService.obtenerUrlPresignadaS3(payloadGenerarUrl));
      if (resPaso1?.code !== 200 || !resPaso1.data) {
        throw new Error(resPaso1?.message || 'No se pudo obtener la URL de carga.');
      }
      const data1 = resPaso1.data as PresignAdjuntoAdicionalData;
      const urlPresignada =
        data1.url_presignada ??
        data1.url ??
        data1.upload_url ??
        data1.presigned_url ??
        data1.presignedUrl ??
        '';
      const s3Key = (data1.s3_key ?? data1.s3Key ?? '').trim();
      if (!urlPresignada.trim() || !s3Key) {
        throw new Error('La respuesta no incluye url_presignada o s3_key.');
      }

      await lastValueFrom(this.userService.subirArchivoAS3(urlPresignada, file));

      const payloadConfirmacion: Record<string, unknown> = {
        id_persona: idPersona,
        nombre_archivo: file.name,
        content_type: contentType,
        tamanio_bytes: file.size,
        s3_key: s3Key,
      };
      const idTipo = this.adjuntoForm.get('id_tipo_adjunto')?.value;
      if (idTipo != null && idTipo !== '') {
        payloadConfirmacion['id_tipo_adjunto'] = idTipo;
      }

      const resPaso3 = await lastValueFrom(this.userService.confirmarAdjuntoS3(payloadConfirmacion));
      if (resPaso3?.code !== 200 || !resPaso3.data) {
        throw new Error(resPaso3?.message || 'No se pudo confirmar el adjunto.');
      }
      const adjuntoGuardado = resPaso3.data as Adjunto;
      if (!adjuntoGuardado?.id) {
        throw new Error('La confirmación no devolvió un adjunto válido.');
      }

      const nuevos = [
        {
          adjunto: adjuntoGuardado,
          valoracion: '' as ValoracionAdjunto | '',
          descripcion: '',
        },
      ];
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
        detail: 'Se agregó el archivo correctamente.',
      });
      this.closeModalAdjuntosAdicionales();
      this.subiendoAdjuntosAdicionales = false;
    } catch (_error: unknown) {
      this.subiendoAdjuntosAdicionales = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al subir los archivos.',
      });
    }
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

  /**
   * Guarda los cambios de datos del afiliado:
   *  - Persona (cuando es CE/PPT al cargar).
   *  - Estado civil (cuando hay beneficiario Cónyuge o cuando el estado civil viene vacío).
   */
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

  /** Muestra en modal el objeto del integrante (trabajador o beneficiario) serializado como en la respuesta del detalle. */
  abrirResumenIntegranteAfiliacionWs(tipo: 'trabajador' | 'beneficiario', indiceBeneficiario?: number): void {
    const d = this.afiliationRequestDetails;
    if (!d) {
      return;
    }
    if (tipo === 'trabajador') {
      this.resumenDatosWsTitulo = 'Trabajador — resumen de datos del servicio';
      this.resumenDatosWsFilas = this.construirFilasResumenWs(this.objetoResumenWsTrabajador(d.trabajador));
      this.visibleResumenDatosWs = true;
      return;
    }
    const idx = indiceBeneficiario ?? 0;
    const ben = d.beneficiarios?.[idx];
    if (!ben) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin datos',
        detail: 'No se encontró información del beneficiario.',
      });
      return;
    }
    this.resumenDatosWsTitulo = `Beneficiario ${idx + 1} — resumen de datos del servicio`;
    this.resumenDatosWsFilas = this.construirFilasResumenWs(this.objetoResumenWsBeneficiario(ben));
    this.visibleResumenDatosWs = true;
  }

  /** Solo `persona` y `trabajador` (sin adjuntos ni novedades del bundle). */
  private objetoResumenWsTrabajador(t: TrabajadorBundle): Record<string, unknown> {
    return { persona: t.persona, trabajador: t.trabajador };
  }

  /** Solo `persona` y `beneficiario` sin `novedades`; sin adjuntos del bundle. */
  private objetoResumenWsBeneficiario(b: BeneficiarioBundle): Record<string, unknown> {
    const { novedades: _omitNovedades, ...beneficiarioSinNovedades } = b.beneficiario;
    return { persona: b.persona, beneficiario: beneficiarioSinNovedades };
  }

  private textoSinInformacionResumenWs(): string {
    return 'sin información';
  }

  private esValorVacioResumenWs(valor: unknown): boolean {
    if (valor === null || valor === undefined) {
      return true;
    }
    if (typeof valor === 'string' && valor.trim() === '') {
      return true;
    }
    return false;
  }

  private formatearValorEscalarResumenWs(valor: unknown): string {
    if (this.esValorVacioResumenWs(valor)) {
      return this.textoSinInformacionResumenWs();
    }
    if (valor instanceof Date) {
      return Number.isNaN(valor.getTime()) ? this.textoSinInformacionResumenWs() : valor.toISOString();
    }
    if (typeof valor === 'boolean') {
      return valor ? 'Sí' : 'No';
    }
    if (typeof valor === 'number' && Number.isFinite(valor)) {
      return String(valor);
    }
    return String(valor);
  }

  /** Último segmento de la ruta (`persona.primer_nombre` → `primer_nombre`), vacío si no aplica. */
  private ultimoNombreCampoResumenWs(clave: string): string {
    if (!clave || clave === '(raíz)' || clave === '(valor)') {
      return '';
    }
    const segmentoFinal = clave.includes('.') ? clave.slice(clave.lastIndexOf('.') + 1) : clave;
    return segmentoFinal.replace(/\[\d+\]$/, '');
  }

  /** Solo el nombre del campo para la etiqueta visible. */
  private formatearEtiquetaVistaRuta(ruta: string): string {
    const n = this.ultimoNombreCampoResumenWs(ruta);
    return n === '' ? 'Dato' : n;
  }

  private debeOmitirCampoResumenWs(clave: string): boolean {
    const n = this.ultimoNombreCampoResumenWs(clave);
    return n !== '' && CAMPOS_OMITIDOS_RESUMEN_WS.has(n);
  }

  private pushFilaResumenWs(filas: ResumenWsFila[], clave: string, valor: unknown): void {
    if (this.debeOmitirCampoResumenWs(clave)) {
      return;
    }
    filas.push({
      clave,
      etiqueta: this.formatearEtiquetaVistaRuta(clave),
      valor: this.formatearValorEscalarResumenWs(valor),
    });
  }

  /**
   * Aplana el objeto del WS en filas etiqueta/valor; objetos anidados se expanden con notación de ruta.
   */
  private construirFilasResumenWs(datos: unknown, prefijo = '', visitados: WeakSet<object> = new WeakSet()): ResumenWsFila[] {
    const filas: ResumenWsFila[] = [];

    if (this.esValorVacioResumenWs(datos) && prefijo === '') {
      filas.push({
        clave: '(raíz)',
        etiqueta: 'Dato',
        valor: this.textoSinInformacionResumenWs(),
      });
      return filas;
    }

    if (datos === null || datos === undefined) {
      this.pushFilaResumenWs(filas, prefijo || '(valor)', datos);
      return filas;
    }

    if (typeof datos === 'string' || typeof datos === 'number' || typeof datos === 'boolean') {
      this.pushFilaResumenWs(filas, prefijo || 'Valor', datos);
      return filas;
    }

    if (typeof datos === 'object' && datos instanceof Date) {
      this.pushFilaResumenWs(filas, prefijo || 'Fecha', datos.toISOString());
      return filas;
    }

    if (Array.isArray(datos)) {
      const claveLista = prefijo || 'Lista';
      if (datos.length === 0) {
        if (!this.debeOmitirCampoResumenWs(claveLista)) {
          this.pushFilaResumenWs(filas, claveLista, null);
        }
        return filas;
      }
      const todosEscalares = datos.every(
        (item) =>
          item === null ||
          item === undefined ||
          typeof item === 'string' ||
          typeof item === 'number' ||
          typeof item === 'boolean',
      );
      if (todosEscalares) {
        if (this.debeOmitirCampoResumenWs(claveLista)) {
          return filas;
        }
        const unidos = datos.map((item) => this.formatearValorEscalarResumenWs(item)).join(', ');
        filas.push({
          clave: claveLista,
          etiqueta: this.formatearEtiquetaVistaRuta(claveLista),
          valor: unidos || this.textoSinInformacionResumenWs(),
        });
        return filas;
      }
      datos.forEach((item, idx) => {
        const sub = prefijo ? `${prefijo}[${idx + 1}]` : `[${idx + 1}]`;
        filas.push(...this.construirFilasResumenWs(item, sub, visitados));
      });
      return filas;
    }

    if (typeof datos === 'object') {
      const obj = datos as Record<string, unknown>;
      if (visitados.has(obj)) {
        if (!this.debeOmitirCampoResumenWs(prefijo)) {
          filas.push({
            clave: prefijo,
            etiqueta: this.formatearEtiquetaVistaRuta(prefijo || 'Dato'),
            valor: '[Referencia circular]',
          });
        }
        return filas;
      }
      visitados.add(obj);

      const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
      if (keys.length === 0) {
        this.pushFilaResumenWs(filas, prefijo || 'Objeto', null);
        return filas;
      }
      for (const k of keys) {
        const path = prefijo ? `${prefijo}.${k}` : k;
        if (this.debeOmitirCampoResumenWs(path)) {
          continue;
        }
        const v = obj[k];
        if (Array.isArray(v)) {
          filas.push(...this.construirFilasResumenWs(v, path, visitados));
        } else if (v !== null && typeof v === 'object' && !(v instanceof Date)) {
          filas.push(...this.construirFilasResumenWs(v, path, visitados));
        } else {
          this.pushFilaResumenWs(filas, path, v);
        }
      }
      return filas;
    }

    this.pushFilaResumenWs(filas, prefijo || 'Valor', datos);
    return filas;
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
    this.cargandoHistorialGestion = true;
    const payload: Pagination = {
      request_id,
      page: this.pageHistoric,
      page_size: this.rowsHistoric,
    };
    this.userService
      .getRequestHistoricAfiliation<AfiliationSolicitudHistoriaGestionRow[]>(payload)
      .pipe(finalize(() => (this.cargandoHistorialGestion = false)))
      .subscribe({
        next: (response: BodyResponse<AfiliationSolicitudHistoriaGestionRow[]>) => {
          if (response.code === 200) {
            this.requestHistoric = Array.isArray(response.data) ? response.data : [];
            this.historialObsExpandidos.clear();
            this.fillStatesDetails(this.requestHistoric);
            const rawTotal =
              response.total_count !== undefined && response.total_count !== null
                ? Number(response.total_count)
                : NaN;
            this.totalRowsHistoric = Number.isFinite(rawTotal)
              ? rawTotal
              : Number.isFinite(Number(response.message))
                ? Number(response.message)
                : 0;
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
          }
        },
        error: (err: unknown) => {
          console.log(err);
        },
      });
  }

  getRequestHistoricIntegrantes(request_id: number) {
    this.cargandoHistorialGestionIntegrantes = true;
    const payload: Pagination = {
      request_id,
      page: this.pageHistoricIntegrantes,
      page_size: this.rowsHistoricIntegrantes,
    };
    this.userService
      .getRequestHistoricAfiliationIntegrantes(payload)
      .pipe(finalize(() => (this.cargandoHistorialGestionIntegrantes = false)))
      .subscribe({
        next: (response: BodyResponse<AfiliationIntegranteHistoriaGestionRow[]>) => {
          if (response.code === 200) {
            this.requestHistoricIntegrantes = Array.isArray(response.data) ? response.data : [];
            this.historialIntegrantesObsExpandidos.clear();
            const rawTotal =
              response.total_count !== undefined && response.total_count !== null
                ? Number(response.total_count)
                : NaN;
            this.totalRowsHistoricIntegrantes = Number.isFinite(rawTotal)
              ? rawTotal
              : Number.isFinite(Number(response.message))
                ? Number(response.message)
                : 0;
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
          }
        },
        error: (err: unknown) => {
          console.log(err);
        },
      });
  }

  fillStatesDetails(request: AfiliationSolicitudHistoriaGestionRow[]): void {
    this.rebuildTimelineEstadosSolicitudAfiliacion(request ?? []);
  }

  /** Fecha/hora ISO parseable por `Date` (`fecha`+`hora` lambda, legacy u otros). */
  fechaHistorialIso(row: AfiliationSolicitudHistoriaGestionRow): string | null {
    const fecha = row.fecha != null ? String(row.fecha).trim() : '';
    const horaRaw = row.hora != null ? String(row.hora).trim() : '';
    if (fecha && horaRaw) {
      const hora = horaRaw.replace(/[-+]\d{2}(:\d{2})?$/, '');
      return `${fecha}T${hora}`;
    }
    const fh = row.fecha_hora != null ? String(row.fecha_hora).trim() : '';
    if (fh) {
      return fh;
    }
    if (row.updated_date) {
      const t = row.updated_time ? String(row.updated_time).split('.')[0] : '';
      return t ? `${row.updated_date}T${t}` : String(row.updated_date).trim();
    }
    return null;
  }

  private readonly historialFechaHoraLegibleFmt = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  /** Fecha y hora en formato legible (es-CO), p. ej. «25 de octubre de 2023, 2:30 p. m.». */
  historialFechaHoraMostrar(row: AfiliationSolicitudHistoriaGestionRow): string {
    const iso = this.fechaHistorialIso(row);
    if (!iso) {
      return '—';
    }
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) {
      return this.historialFechaHoraLegibleFmt.format(d);
    }
    const fecha = row.fecha != null ? String(row.fecha).trim() : '';
    const horaRaw = row.hora != null ? String(row.hora).trim() : '';
    if (fecha && horaRaw) {
      const horaCorta = horaRaw.replace(/[-+]\d{2}(:\d{2})?$/, '');
      return `${fecha} · ${horaCorta}`;
    }
    return iso.trim() || '—';
  }

  estadoHistorialNombre(row: AfiliationSolicitudHistoriaGestionRow): string {
    return (row.estado_nombre ?? row.status_name ?? '').trim();
  }

  estadoHistorialCodigo(row: AfiliationSolicitudHistoriaGestionRow): string {
    return (row.estado_code ?? row.estado_codigo ?? '').trim();
  }

  textoDetalleObservacion(row: AfiliationSolicitudHistoriaGestionRow): string {
    const v = row.detalle_observacion != null ? String(row.detalle_observacion).trim() : '';
    return v || 'Sin observaciones';
  }

  observacionHistorialLarga(row: AfiliationSolicitudHistoriaGestionRow): boolean {
    const v = row.detalle_observacion != null ? String(row.detalle_observacion).trim() : '';
    return v.length > 140;
  }

  toggleHistorialObs(rowIndex: number): void {
    if (this.historialObsExpandidos.has(rowIndex)) {
      this.historialObsExpandidos.delete(rowIndex);
    } else {
      this.historialObsExpandidos.add(rowIndex);
    }
  }

  isHistorialObsExpandido(rowIndex: number): boolean {
    return this.historialObsExpandidos.has(rowIndex);
  }

  toggleHistorialObsIntegrante(rowIndex: number): void {
    if (this.historialIntegrantesObsExpandidos.has(rowIndex)) {
      this.historialIntegrantesObsExpandidos.delete(rowIndex);
    } else {
      this.historialIntegrantesObsExpandidos.add(rowIndex);
    }
  }

  isHistorialObsExpandidoIntegrante(rowIndex: number): boolean {
    return this.historialIntegrantesObsExpandidos.has(rowIndex);
  }

  nombreIntegranteHistorial(row: AfiliationIntegranteHistoriaGestionRow): string {
    const nombre = row.nombre_integrante != null ? String(row.nombre_integrante).trim() : '';
    const tipoPersona = row.tipo_persona != null ? String(row.tipo_persona).trim() : '';
    if (nombre && tipoPersona) {
      return `${tipoPersona}: ${nombre}`;
    }
    return nombre || tipoPersona || '—';
  }

  identificacionIntegranteHistorial(row: AfiliationIntegranteHistoriaGestionRow): string {
    const tipoDoc = row.tipo_documento != null ? String(row.tipo_documento).trim() : '';
    const doc = row.numero_documento != null ? String(row.numero_documento).trim() : '';
    if (!tipoDoc && !doc) {
      return '—';
    }
    return [tipoDoc, doc].filter(Boolean).join(' ');
  }

  /** Id de fila del catálogo (API puede usar `request_status_id` o `id`). */
  private idEstadoCatalogoFila(row: RequestStatusAfiliationList): number {
    const ext = row as RequestStatusAfiliationList & { id?: number };
    return ext.request_status_id ?? ext.id ?? 0;
  }

  /** Orden fijo del timeline de estados (independiente del `orden`/id que traiga el catálogo). */
  private readonly ORDEN_TIMELINE_ESTADOS_AFILIACION: string[] = [
    'pendiente',
    'asignada',
    'reasignada',
    'rechazada',
    'pendiente afiliacion rpa',
    'en ejecucion rpa',
    'inconsistencias rpa',
    'aprobada incompleta',
    'aprobada completa',
  ];

  private normalizarTextoEstadoTimeline(v: string | null | undefined): string {
    return (v ?? '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  /** Posición del estado en el orden fijo del timeline; los no listados quedan al final, en su orden original. */
  private ordenTimelineEstado(row: RequestStatusAfiliationList): number {
    const texto = this.normalizarTextoEstadoTimeline(row.codigo || row.status_name);
    const idx = this.ORDEN_TIMELINE_ESTADOS_AFILIACION.indexOf(texto);
    if (idx >= 0) return idx;
    return this.ORDEN_TIMELINE_ESTADOS_AFILIACION.length + (row.orden ?? this.idEstadoCatalogoFila(row));
  }

  /** Texto para comparar histórico con una fila del catálogo. */
  private nombresEstadoParaCoincidencia(row: RequestStatusAfiliationList): string[] {
    return [
      row.codigo,
      row.descripcion,
      row.status_name,
      row.status_description,
    ]
      .filter((v): v is string => v != null && String(v).trim() !== '')
      .map(v => String(v).trim().toLowerCase());
  }

  /** Última fecha del histórico cuyo `status_name` coincide con el catálogo. */
  private ultimaFechaHistoricoParaEstado(
    historic: AfiliationSolicitudHistoriaGestionRow[],
    row: RequestStatusAfiliationList,
  ): string | null {
    const set = new Set(this.nombresEstadoParaCoincidencia(row));
    let best: string | null = null;
    let bestTime = 0;
    for (const h of historic) {
      const sn = this.estadoHistorialNombre(h).trim().toLowerCase();
      if (!sn || !set.has(sn)) {
        continue;
      }
      const raw = this.fechaHistorialIso(h);
      const t = raw ? new Date(raw).getTime() : NaN;
      if (!Number.isNaN(t) && t >= bestTime) {
        bestTime = t;
        best = raw;
      }
    }
    return best;
  }

  /** Carga catálogo de estados y arma el timeline ordenado por `orden`. */
  private rebuildTimelineEstadosSolicitudAfiliacion(historic: AfiliationSolicitudHistoriaGestionRow[]): void {
    const d = this.afiliationRequestDetails;
    if (!d?.solicitud) {
      this.events = [];
      this.idEstadoSolicitudActual = null;
      this.currentIndex = 0;
      return;
    }

    const idActual = d.solicitud.id_estado_solicitud;
    this.idEstadoSolicitudActual = idActual;

    const aplicar = (rows: RequestStatusAfiliationList[]) => {
      const activos = rows.filter(r => r.is_active !== false);
      const ordenados = [...activos].sort(
        (a, b) => this.ordenTimelineEstado(a) - this.ordenTimelineEstado(b),
      );
      const actualRow = ordenados.find(r => this.idEstadoCatalogoFila(r) === idActual);
      this.currentState =
        actualRow?.codigo ||
        actualRow?.status_name ||
        d.solicitud.estado_codigo ||
        '';

      this.events = ordenados.map(row => {
        const idEstado = this.idEstadoCatalogoFila(row);
        const fecha = this.ultimaFechaHistoricoParaEstado(historic, row);
        const codigo = (row.codigo || row.status_name || '').trim() || '—';
        return {
          idEstado,
          state: codigo,
          stateShow: codigo,
          label: fecha ?? '—',
          textoIcono: row.descripcion || row.status_description || row.status_name,
        };
      });

      const idx = this.events.findIndex(e => e.idEstado === idActual);
      this.currentIndex = idx >= 0 ? idx : 0;
    };

    if (this.catalogoEstadosSolicitudAfiliacion.length > 0) {
      aplicar(this.catalogoEstadosSolicitudAfiliacion);
      return;
    }

    this.userService.getRequestAfiliationStatusList().subscribe({
      next: (res) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          this.catalogoEstadosSolicitudAfiliacion = res.data;
        }
        aplicar(this.catalogoEstadosSolicitudAfiliacion);
      },
      error: () => {
        this.events = [];
        this.currentIndex = 0;
      },
    });
  }

  /** Icono del marcador según texto del estado. */
  iconoTimelineClase(event: TimelineEstadoAfiliacionEvento): string {
    const t = `${event.textoIcono || ''} ${event.state} ${event.stateShow}`.toLowerCase();
    if (t.includes('cerr')) {
      return 'pi pi-check';
    }
    if (t.includes('radic')) {
      return 'pi pi-ticket';
    }
    return 'pi pi-cog';
  }

  assignRequest(request_details: RequestsDetails) {
    this.isAfiliationAssignModal = false;
    this.requestAfiliationAssign = undefined;
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

  private buildAssignPayloadFromDetails(
    data: AfiliacionRequestDetailsData,
    requestStatus: number
  ): RequestsListAfiliation {
    const s = data.solicitud;
    const t = data.trabajador;
    const e = data.empresa;
    const nombreTrabajador = [
      t.persona.primer_nombre,
      t.persona.segundo_nombre,
      t.persona.primer_apellido,
      t.persona.segundo_apellido,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();
    return {
      request_id: s.id,
      filing_number: s.numero_radicado,
      filing_date: s.fecha_solicitud,
      doc_trabajador: t.persona.numero_documento ?? '',
      name_trabajador: nombreTrabajador,
      documents_beneficiarios: '',
      names_beneficiarios: '',
      id_empresa: s.id_empresa,
      name_empresa: e?.razon_social ?? e?.nombre_comercial ?? '',
      request_status: requestStatus,
      cod_estatus: s.estado_codigo ?? '',
      assigned_user: s.usuario_gestion,
      user_name_completed: '',
      mensaje_reasignacion: '',
      total_count: 0,
      pendiente_direccion: s.pendiente_direccion,
      pendiente_activar_empresa: s.pendiente_activar_empresa,
      novedad_restrictiva: s.novedad_restrictiva,
    };
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

    this.isAfiliationAssignModal = true;
    const sinResponsable =
      request_details.solicitud.usuario_gestion == null ||
      request_details.solicitud.usuario_gestion === '';

    if (sinResponsable) {
      this.message = 'Asignar responsable de solicitud';
      this.buttonmsg = 'Asignar';
      this.requestAfiliationAssign = this.buildAssignPayloadFromDetails(request_details, 2);
    } else {
      this.message = 'Reasignar responsable de solicitud';
      this.buttonmsg = 'Reasignar';
      this.requestAfiliationAssign = this.buildAssignPayloadFromDetails(request_details, 3);
    }

    this.visibleDialogInput = true;
    this.parameter = ['Colaborador'];
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
    this.enableAssign = value;
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

    if (this.isAfiliationAssignModal && this.requestAfiliationAssign) {
      if (this.requestAfiliationAssign.assigned_user === inputValue.userName) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Verifique el responsable a asignar';
        this.message2 = 'Debe seleccionar un colaborador diferente';
        this.severity = 'danger';
        return;
      }

      this.requestAfiliationAssign.assigned_user = inputValue.userName;
      this.requestAfiliationAssign.user_name_completed = inputValue.userNameCompleted;
      this.requestAfiliationAssign.mensaje_reasignacion = inputValue.mensajeReasignacion;

      this.userService.assignUserToRequestAfiliation(this.requestAfiliationAssign).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Éxito', 'Asignación exitosa');
          } else {
            this.showSuccessMessage('error', 'Falló', 'Asignación fallida');
          }
        },
        error: (err: unknown) => console.error(err),
        complete: () => {
          this.visibleDialogInput = false;
          this.isAfiliationAssignModal = false;
          this.requestAfiliationAssign = undefined;
          this.getRequestDetails(this.request_id);
        },
      });
      return;
    }

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

    this.userService.assignUserToRequest(this.request_details).subscribe({
      next: (response: BodyResponse<string>) => {
        if (response.code === 200) {
          this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: unknown) => {
        console.log(err);
      },
      complete: () => {
        this.ngOnInit();
      },
    });
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
    this.requestHistoric.forEach(request => {
      const responsable = request.responsable_asignado ?? request.user_name_completed ?? '';
      const estado = request.estado_nombre ?? request.status_name ?? '';
      if (user_name === responsable && estado === 'Reasignada') {
        this.dialogContent = request.detalle_observacion ?? request.answer_request ?? '';
      }
    });
    this.isDialogVisible = true;
  }

  showModalReview(user_name: string, request_name: string) {
    this.dialogHeader = 'Descripción de la revisión';
    this.requestHistoric.forEach(request => {
      const responsable = request.responsable_asignado ?? request.user_name_completed ?? '';
      const estado = request.estado_nombre ?? request.status_name ?? '';
      if (user_name === responsable && estado === request_name) {
        this.dialogContent = request.detalle_observacion ?? request.answer_request ?? '';
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
      if (response.status === 200 && response.body) {
        const data = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
        console.log('Respuesta completa del WS:', data);

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
