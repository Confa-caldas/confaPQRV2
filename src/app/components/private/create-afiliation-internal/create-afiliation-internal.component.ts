import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TipoDocumentoConReglas } from '../../../shared/models/tipo-documento-con-reglas';
import {
  MENSAJE_TIPO_ADJUNTO_NO_PERMITIDO,
  mimeAdjuntoPermitido,
} from '../../../shared/utils/adjunto-mime.util';
import { Title } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';

import {
  DatosEmpresaAfiliacionInterna,
  ValidarEmpresaResponse,
} from '../../../models/afiliacion-interna/validar-empresa.interface';
import {
  BeneficiarioPrecargarAfiliacionInterna,
  DatosBeneficiarioAfiliacionInterna,
  DatosFormularioAfiliacionInterna,
  EntidadDisponibleAfiliacionInterna,
  LaborInfoAfiliacionInterna,
  MedioPagoAfiliacionInterna,
  PersonalInfoAfiliacionInterna,
  ValidacionMostradaAfiliacionInterna,
  ValidacionResultAfiliacionInterna,
  ValidarTrabajadorResponse,
} from '../../../models/afiliacion-interna/validar-trabajador.interface';
import {
  DatosPersonaACargoInterna,
  PersonaACargoInterna,
  ValidacionBeneficiarioSnapshotInterna,
} from '../../../models/afiliacion-interna/beneficiario.interface';
import { BeneficiarioGrupoBorradorItem } from '../../../models/afiliacion-interna/validar-beneficiario.interface';
import {
  AdjuntoGuardarSolicitudInterna,
  BeneficiarioGuardarSolicitudInterna,
  GuardarSolicitudRequestInterna,
  GuardarSolicitudResponseInterna,
  TrabajadorGuardarSolicitudInterna,
} from '../../../models/afiliacion-interna/guardar-solicitud.interface';
import {
  AdjuntoNuevoRequestInterna,
  AgregarBeneficiarioTrabajadorActivoRequestInterna,
  AgregarBeneficiarioTrabajadorActivoResponseInterna,
  BeneficiarioNuevoRequestInterna,
  SolicitudCreadaBeneficiarioInterna,
} from '../../../models/afiliacion-interna/agregar-beneficiario-trabajador-activo.interface';
import { TrabajadorActivoInternaResponse } from '../../../models/afiliacion-interna/trabajador-activo.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import {
  AfiOccupationList,
  AdjuntoTipoPorParentesco,
  DepartmentList,
  DocumentTypeCompanyList,
  DocumentTypePersonList,
  MunicipalityList,
  Pagination,
  ParametroEstadoCivil,
  ParametroGenero,
  ParametroParentesco,
} from '../../../models/users.interface';
import {
  MAX_ARCHIVOS_POR_TIPO_ADJUNTO,
  ParentescoAdjuntoCatalogo,
  archivosSoporteDiscapacidadDesdePersona,
  resolverSlotsAdjuntosBeneficiario,
} from '../../../utils/beneficiario-adjuntos.util';
import { CALENDARIO_LOCALE_ES } from '../../../utils/calendar-locale-es.util';
import { parseFechaInputDate, validarFechasNacimientoYExpedicion, valorComoInputDate } from '../../../utils/fecha-input.util';
import { validadorCelularColombia } from '../../../shared/validators/celular-colombia.validator';
import {
  MENSAJE_DIRECCION_INVALIDA,
  validatorsDireccionColombia,
  validatorsDireccionColombiaOpcional,
} from '../../../shared/validators/direccion-colombia.validators';
import { validadorSoloLetrasNombresApellido } from '../../../shared/validators/nombres-apellidos.validators';
import {
  cuentaParentescoExclusivoEnLista,
  existeBeneficiarioDuplicadoPorDocumentoEnLista,
  mensajeParentescoExclusivoDuplicado,
  resolverCategoriaParentescoExclusivo,
} from '../../../shared/utils/parentesco-cupo.util';
import { AfiliacionInternaService } from '../../../services/afiliacion-interna.service';
import { Users } from '../../../services/users.service';
import { SessionStorageItems } from '../../../enums/session-storage-items.enum';
import { jwtDecode } from 'jwt-decode';
import { ISession } from '../../../models/login/session.interface';

/**
 * 0 = selección de modalidad;
 * 1 = consulta empresa (flujo trabajador);
 * 2 = identificación del trabajador;
 * 3 = flujo beneficiario;
 * 4 = solicitud de afiliación (acordeón tras validar trabajador).
 */
export type PasoAfiliacionInterna = 0 | 1 | 2 | 3 | 4;
/** Subpasos del flujo beneficiario interno (step === 3). */
export type PasoBeneficiarioInterna = 1 | 2 | 3 | 4;

const MAX_TAMANO_ADJUNTO_BYTES = 4 * 1024 * 1024;
const ID_TIPO_ADJUNTO_DOCUMENTO_IDENTIDAD = 1;
const ID_TIPO_ADJUNTO_PERMISO_TRABAJO = 2;
const ID_TIPO_ADJUNTO_SOPORTE_DISCAPACIDAD = 4;
const EDAD_MINIMA_TRABAJADOR_AFILIACION = 12;
const EDAD_MINIMA_TRABAJADOR_PARA_AFILIAR_CONYUGE = 18;
const TEXTO_MODAL_CUERPO_RADICACION_DIA_NO_HABIL =
  'Como enviaste la solicitud en día no hábil, tu solicitud será gestionada a partir del próximo día hábil. ' +
  'Te notificaremos su estado una vez sea gestionado.';
const MSG_EDAD_MINIMA_TRABAJADOR =
  'No se pueden afiliar trabajadores menores a 12 años.';
const MSG_EDAD_NO_CORRESPONDE_TIPO_DOCUMENTO =
  'La edad de la persona no corresponde con el tipo de documento seleccionado. Verifícalo e intenta de nuevo.';
const MSG_FECHA_INGRESO_FUERA_RANGO =
  'La fecha de ingreso no cumple el rango de fechas permitido para afiliación. Ajústala e intenta de nuevo.';
const TIPOS_DOC_BENEFICIARIO_FALLBACK: { value: string; label: string }[] = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'RC', label: 'Registro Civil' },
  { value: 'CE', label: 'Cédula de Extranjería' },
];
const NOMBRE_VALIDACION_BENEFICIARIO_SOLICITUD_PENDIENTE = 'beneficiarioSolicitudPendiente';
const TEXTO_MODAL_SOPORTE_DISCAPACIDAD_PADRE_MADRE =
  'Para afiliar con condición de discapacidad debe adjuntar el documento soporte correspondiente.';
const TITULO_MODAL_SOPORTE_DISCAPACIDAD = 'Se requiere soporte';

function crearFechaFinDiaCalendario(fecha: Date): Date {
  const d = new Date(fecha);
  d.setHours(23, 59, 59, 999);
  return d;
}

function crearFechaInicioDiaCalendario(fecha: Date): Date {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  return d;
}

interface DocumentoAdjuntoBeneficiarioCai {
  idTipoAdjunto: number;
  nombreDocumento: string;
  esRequerido: boolean;
  archivos: File[];
}

interface ItemArchivoParaSubir {
  file: File;
  idTipoAdjunto: number;
  consecutivoPersona: number;
  nombreArchivo: string;
}

interface BeneficiarioPrecargadoVista {
  parentesco: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  esPrecargado: boolean;
}

function esMedioPagoTransferencia(valor: unknown): boolean {
  const s = (valor ?? '').toString().trim().toLowerCase();
  return s.includes('transferencia');
}

function validarConfirmacionNumeroCuentaMedioPago(control: AbstractControl): ValidationErrors | null {
  const g = control as FormGroup;
  if (!esMedioPagoTransferencia(g.get('medio_pago')?.value)) {
    return null;
  }
  const num = (g.get('numero_cuenta')?.value ?? '').toString().trim();
  const conf = (g.get('confirmacion_cuenta')?.value ?? '').toString().trim();
  if (num !== conf) {
    return { confirmacionNumeroCuenta: true };
  }
  return null;
}

function validarConfirmacionLlaveBreBMedioPago(control: AbstractControl): ValidationErrors | null {
  const g = control as FormGroup;
  const llave = (g.get('llave_breb')?.value ?? '').toString().trim();
  const conf = (g.get('confirmar_llave_breb')?.value ?? '').toString().trim();
  if (!llave) {
    return null;
  }
  if (conf !== llave) {
    return { confirmacionLlaveBreB: true };
  }
  return null;
}

@Component({
  selector: 'app-create-afiliation-internal',
  templateUrl: './create-afiliation-internal.component.html',
  styleUrl: './create-afiliation-internal.component.scss',
})
export class CreateAfiliationInternalComponent implements OnInit {
  readonly mensajeDireccionInvalida = MENSAJE_DIRECCION_INVALIDA;
  step: PasoAfiliacionInterna = 0;

  consultaEmpresaForm: FormGroup;
  identificacionTrabajadorForm: FormGroup;
  /** Flujo beneficiario interno: consulta empresa (independiente del flujo trabajador). */
  consultaEmpresaBeneficiarioForm: FormGroup;
  /** Flujo beneficiario interno: identificación del trabajador activo. */
  identificacionTrabajadorBeneficiarioForm: FormGroup;
  /** Formulario principal de la solicitud (pestaña Información personal). */
  solicitudPersonalForm!: FormGroup;
  solicitudLaboralForm!: FormGroup;
  solicitudMedioPagoForm!: FormGroup;

  tiposDocumentoEmpresa: DocumentTypeCompanyList[] = [];
  cargandoTiposDocumentoEmpresa = false;

  tiposDocumentoPersona: { label: string; value: string }[] = [];
  tiposDocumentoPersonaReglas: TipoDocumentoConReglas[] = [];
  cargandoTiposDocumentoPersona = false;

  validandoEmpresa = false;
  validandoTrabajador = false;
  validandoEmpresaBeneficiario = false;
  consultandoTrabajadorActivoBeneficiario = false;

  /** Subpaso dentro de step 3: 1 = empresa, 2 = trabajador activo, 3 = formulario beneficiario. */
  pasoBeneficiarioSub: PasoBeneficiarioInterna = 1;
  datosEmpresaBeneficiario: DatosEmpresaAfiliacionInterna | null = null;
  idEmpresaBeneficiarioInterna: number | null = null;
  trabajadorActivoBeneficiario: TrabajadorActivoInternaResponse | null = null;
  trabajadorBeneficiarioValidado = false;
  identificacionTrabajadorBeneficiarioBloqueada = false;
  procesandoRadicadoBeneficiarioInterna = false;
  solicitudesCreadasBeneficiarioInterna: SolicitudCreadaBeneficiarioInterna[] = [];
  mensajeExitoRadicadoBeneficiarioInterna = '';

  /** Checklist de validaciones mostradas tras consultar trabajador (paso 2). */
  validacionesTrabajador: ValidacionMostradaAfiliacionInterna[] = [];
  identificacionTrabajadorBloqueada = false;
  documentoTrabajadorValidado = false;

  /** Modal informativo (misma semántica que afiliación web). */
  visibleDialogAlert = false;
  modalAlertTitle = '';
  modalAlertMessage = '';

  visibleDialogConfirmSalir = false;
  private accionSalirPendiente: (() => void) | null = null;

  visibleDialogConfirmBeneficiario = false;
  confirmBeneficiarioTitulo = '';
  confirmBeneficiarioMensaje = '';
  private confirmBeneficiarioAccion: (() => void) | null = null;

  procesandoSolicitud = false;
  mostrarConfirmacionRadicado = false;
  numeroRadicado = '';
  mensajeFinSemanaFestivo = '';

  /** Flags y datos conservados para guardar-solicitud. */
  requiereAdjuntoDocumento = true;
  mensajeAdjuntoDocumento = '';
  requierePermisoLaboral = false;
  mensajePermisoLaboral = '';
  hayBeneficiariosPrecargadosDesdeBackend = false;
  beneficiariosPrecargarGuardar: BeneficiarioPrecargarAfiliacionInterna[] = [];

  /** Hasta 3 adjuntos de documento de identidad del trabajador. */
  archivosIdentidad: File[] = [];
  /** Hasta 3 adjuntos de permiso de trabajo (menor con TI). */
  archivosPermisoTrabajo: File[] = [];

  /** Referencias estables para p-calendar (evita que maxDate/minDate nuevos rompan la selección). */
  readonly fechaHoyCalendario = crearFechaFinDiaCalendario(new Date());
  fechaExpedicionMinimaPersonal: Date | null = null;
  readonly calendarioLocaleEs = CALENDARIO_LOCALE_ES;

  readonly acceptAdjuntosIdentidad = '.pdf,.png,.jpeg,.jpg';
  readonly acceptAdjuntosPermiso = '.pdf,.png,.jpeg,.jpg,.docx';
  readonly maxArchivosPorTipoAdjunto = MAX_ARCHIVOS_POR_TIPO_ADJUNTO;

  opcionBeneficiarios: 'si' | 'no' | null = null;
  parentescos: ParentescoAdjuntoCatalogo[] = [];
  cargandoParentescos = false;
  formularioPersonaACargo!: FormGroup;
  beneficiariosAgregados: PersonaACargoInterna[] = [];
  datosPersonaACargoValidada: DatosPersonaACargoInterna | null = null;
  validacionesBeneficiario: ValidacionMostradaAfiliacionInterna[] = [];
  datosBeneficiario: DatosBeneficiarioAfiliacionInterna | null = null;
  ultimoDatosFormularioValidacionBeneficiario: DatosFormularioAfiliacionInterna | null = null;
  validandoBeneficiario = false;
  identificacionBeneficiarioBloqueada = false;
  errorValidacionBeneficiario = '';
  documentosAdjuntosPersonaACargo: DocumentoAdjuntoBeneficiarioCai[] = [];
  archivosSoporteDiscapacidadPersonaACargo: File[] = [];
  mostrarCampoGeneroPersonaACargo = true;
  /** Si el backend trae datos Genesys, el género no se muestra ni valida en pantalla. */
  datosGenesysDisponiblesBeneficiario = false;
  indiceBeneficiarioEditando: number | null = null;
  caracteresDireccionPersonaACargo = 0;
  readonly tamanioPaginaBeneficiarios = 10;
  paginaBeneficiariosActual = 1;
  fechaExpedicionMinimaBeneficiario: Date | null = null;

  datosEmpresa: DatosEmpresaAfiliacionInterna | null = null;

  /**
   * ID de empresa devuelto por `validarEmpresa` (`res.data.datosEmpresa.idEmpresa`).
   * Se usa como única fuente para `idEmpresa` en el payload de `validarTrabajador`.
   */
  idEmpresaAfiliacionInterna: number | null = null;

  /**
   * Respuesta completa de validar-trabajador (WS vía Lambda).
   * Fuente única para precarga de formularios y payload de guardar-solicitud.
   */
  respuestaValidarTrabajador: ValidarTrabajadorResponse | null = null;

  /** Campos del formulario personal deshabilitados por precarga del backend. */
  private camposPersonalesPrecargados: Record<string, boolean> = {};

  /** Acordeón: una sola sección abierta; avance solo con Guardar y continuar / Regresar. */
  accordionActiveIndex: number = 0;
  /** Índice permitido; los clics en cabeceras no cambian de sección (paridad portal empresa). */
  private indiceAcordeonAutorizado = 0;

  seccionPersonalGuardada = false;
  seccionLaboralGuardada = false;
  seccionPagoGuardada = false;

  opcionesGenero: { label: string; value: string }[] = [];
  opcionesEstadoCivil: { label: string; value: string }[] = [];
  opcionesDepartamento: { label: string; value: number }[] = [];
  opcionesMunicipio: { label: string; value: number }[] = [];
  opcionesCargo: { label: string; value: string }[] = [];
  private generosCatalog: ParametroGenero[] = [];
  private estadosCivilCatalog: ParametroEstadoCivil[] = [];
  private departamentosCatalog: DepartmentList[] = [];
  readonly opcionesZona = [
    { label: 'Urbana', value: 'Urbana' },
    { label: 'Rural', value: 'Rural' },
  ];

  private catalogosSolicitudCargados = false;
  private municipiosCache: MunicipalityList[] = [];

  opcionesMedioPago: { label: string; value: string }[] = [
    { label: 'Efectivo', value: 'Efectivo' },
    { label: 'Transferencia', value: 'Transferencia' },
  ];
  opcionesEntidadesPago: { label: string; value: number }[] = [];
  opcionesTipoCuenta: { label: string; value: number }[] = [];

  laborFechaIngresoMin: Date | null = null;
  laborFechaIngresoMax: Date | null = null;
  laborFechaIngresoMinimaIso = '';
  laborFechaIngresoMaximaIso = '';
  horasLaboralesMin = 1;
  horasLaboralesMax = 240;
  salarioMinimoRef: number | null = null;

  private entidadesMedioPagoRef: EntidadDisponibleAfiliacionInterna[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly title: Title,
    private readonly users: Users,
    private readonly afiliacionInterna: AfiliacionInternaService,
    private readonly messageService: MessageService
  ) {
    this.consultaEmpresaForm = this.fb.group({
      tipo_documento: [null as number | null, Validators.required],
      numero_documento: ['', Validators.required],
    });

    this.identificacionTrabajadorForm = this.fb.group({
      tipo_documento: [null, Validators.required],
      numero_documento: ['', Validators.required],
    });

    this.consultaEmpresaBeneficiarioForm = this.fb.group({
      tipo_documento: [null as number | null, Validators.required],
      numero_documento: ['', Validators.required],
    });

    this.identificacionTrabajadorBeneficiarioForm = this.fb.group({
      tipo_documento: [null, Validators.required],
      numero_documento: ['', Validators.required],
    });

    this.solicitudPersonalForm = this.fb.group(
      {
        tipo_documento: [''],
        numero_documento: [''],
        primer_nombre: ['', [Validators.required, validadorSoloLetrasNombresApellido]],
        segundo_nombre: ['', validadorSoloLetrasNombresApellido],
        primer_apellido: ['', [Validators.required, validadorSoloLetrasNombresApellido]],
        segundo_apellido: ['', validadorSoloLetrasNombresApellido],
        fecha_nacimiento: [null as Date | null, Validators.required],
        fecha_expedicion: [null as Date | null, Validators.required],
        celular: ['', [Validators.required, validadorCelularColombia]],
        confirmar_celular: ['', [Validators.required, validadorCelularColombia]],
        correo: ['', [Validators.required, Validators.email]],
        confirmar_correo: ['', [Validators.required, Validators.email]],
        genero: [null as string | null, Validators.required],
        estado_civil: [null as string | null, Validators.required],
        direccion: ['', [Validators.required, ...validatorsDireccionColombia]],
        zona: [null as string | null, Validators.required],
        id_departamento: [null as number | null, Validators.required],
        id_municipio: [null as number | null, Validators.required],
      },
      { validators: [CreateAfiliationInternalComponent.confirmacionesContactoCoinciden] }
    );

    this.solicitudLaboralForm = this.fb.group({
      fecha_ingreso_empresa: [null as Date | null, Validators.required],
      horas_mes: [null as number | null, [Validators.required, Validators.min(1), Validators.max(240)]],
      salario_mensual: [null as number | null, Validators.required],
      cargo_desempenado: ['', Validators.required],
    });

    this.solicitudMedioPagoForm = this.fb.group(
      {
        medio_pago: ['Transferencia'],
      id_entidad: [null as number | null],
      tipo_cuenta: [null as number | null],
      numero_cuenta: [''],
      confirmacion_cuenta: [''],
      llave_breb: [''],
      confirmar_llave_breb: [''],
      },
      {
        validators: [validarConfirmacionNumeroCuentaMedioPago, validarConfirmacionLlaveBreBMedioPago],
      }
    );

    this.solicitudPersonalForm.get('id_departamento')?.valueChanges.subscribe(id => {
      this.solicitudPersonalForm.get('id_municipio')?.setValue(null, { emitEvent: false });
      this.cargarMunicipiosPorDepartamento(id);
    });
    this.solicitudPersonalForm.get('fecha_nacimiento')?.valueChanges.subscribe(val => {
      this.sincronizarFechaExpedicionMinimaPersonal(val);
      this.solicitudPersonalForm.get('fecha_expedicion')?.updateValueAndValidity({ emitEvent: false });
    });

    this.solicitudMedioPagoForm.get('id_entidad')?.valueChanges.subscribe(id => {
      this.actualizarTiposCuentaPorEntidad(id as number | null, null);
      this.aplicarValidadoresMedioPagoSegunEstado();
    });
    this.solicitudMedioPagoForm.get('medio_pago')?.valueChanges.subscribe(() => {
      this.aplicarValidadoresMedioPagoSegunEstado();
    });
    this.solicitudMedioPagoForm.valueChanges.subscribe(() => {
      this.aplicarValidadoresMedioPagoSegunEstado();
    });
    this.aplicarValidadoresMedioPagoSegunEstado();

    this.formularioPersonaACargo = this.fb.group({
      parentesco: [null as number | null, Validators.required],
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', Validators.required],
      primerNombre: ['', [Validators.required, validadorSoloLetrasNombresApellido]],
      segundoNombre: ['', validadorSoloLetrasNombresApellido],
      primerApellido: ['', [Validators.required, validadorSoloLetrasNombresApellido]],
      segundoApellido: ['', validadorSoloLetrasNombresApellido],
      fechaNacimiento: [null as Date | null, Validators.required],
      fechaExpedicion: [null as Date | null, Validators.required],
      genero: [null as string | null, Validators.required],
      personaDiscapacidad: ['', Validators.required],
      direccionCorrespondeTrabajador: ['Si'],
      direccion: [''],
    });
    this.formularioPersonaACargo.get('parentesco')?.valueChanges.subscribe(id => {
      this.onParentescoBeneficiarioChange(id as number | null);
    });
    this.formularioPersonaACargo.get('direccionCorrespondeTrabajador')?.valueChanges.subscribe(() => {
      this.aplicarValidadoresDireccionPersonaACargo();
    });
    this.formularioPersonaACargo.get('fechaNacimiento')?.valueChanges.subscribe(val => {
      this.sincronizarFechaExpedicionMinimaBeneficiario(val);
    });
    this.aplicarValidadoresDireccionPersonaACargo();
    this.forzarDireccionCorrespondeTrabajador();
  }

  /** Regla funcional: la dirección del beneficiario siempre corresponde a la del trabajador (igual afiliación web). */
  private forzarDireccionCorrespondeTrabajador(): void {
    const control = this.formularioPersonaACargo?.get('direccionCorrespondeTrabajador');
    if (!control) {
      return;
    }
    if (control.value !== 'Si') {
      control.setValue('Si', { emitEvent: false });
    }
    control.disable({ emitEvent: false });
    this.aplicarValidadoresDireccionPersonaACargo();
  }

  private static confirmacionesContactoCoinciden(group: AbstractControl): ValidationErrors | null {
    const g = group as FormGroup;
    const cel = (g.get('celular')?.value ?? '').toString().trim();
    const celC = (g.get('confirmar_celular')?.value ?? '').toString().trim();
    const mail = (g.get('correo')?.value ?? '').toString().trim();
    const mailC = (g.get('confirmar_correo')?.value ?? '').toString().trim();
    const err: ValidationErrors = {};
    if (cel !== celC) {
      err['confirmarCelular'] = true;
    }
    if (mail !== mailC) {
      err['confirmarCorreo'] = true;
    }
    return Object.keys(err).length ? err : null;
  }

  ngOnInit(): void {
    this.title.setTitle('Solicitud interna');
    this.cargarTiposDocumentoEmpresa();
    this.cargarTiposDocumentoPersona();
    this.cargarParentescos();
  }

  private cargarTiposDocumentoEmpresa(): void {
    this.cargandoTiposDocumentoEmpresa = true;
    const payload: Pagination = { page: 1, page_size: 500 };
    this.users.getDocumentoTypeCompanyListPagination(payload).subscribe({
      next: (response: BodyResponse<DocumentTypeCompanyList[]>) => {
        this.cargandoTiposDocumentoEmpresa = false;
        if (response.code === 200 && Array.isArray(response.data)) {
          this.tiposDocumentoEmpresa = response.data.filter(
            row => row.esta_activo !== false && row.id != null && (row.tipo_documento || '').trim() !== ''
          );
        } else {
          this.tiposDocumentoEmpresa = [];
          console.warn('[Solicitud interna] Tipos documento empresa no disponibles:', response.message);
        }
      },
      error: (err: unknown) => {
        this.cargandoTiposDocumentoEmpresa = false;
        this.tiposDocumentoEmpresa = [];
        console.error('[Solicitud interna] Error al cargar tipos documento empresa', err);
      },
    });
  }

  private cargarTiposDocumentoPersona(): void {
    this.cargandoTiposDocumentoPersona = true;
    const payload: Pagination = { page: 1, page_size: 500 };
    this.users.getDocumentoTypePersonListPagination(payload).subscribe({
      next: (response: BodyResponse<DocumentTypePersonList[]>) => {
        this.cargandoTiposDocumentoPersona = false;
        if (response.code === 200 && Array.isArray(response.data)) {
          const rows = response.data.filter(
            row => row.esta_activo !== false && (row.tipo_documento || '').trim() !== ''
          );
          this.tiposDocumentoPersonaReglas = rows
            .map(row => this.mapReglasDocumentoPersona(row))
            .filter(r => r.value !== '');
          this.tiposDocumentoPersona = rows
            .map(row => ({
              label: (row.tipo_documento || '').trim(),
              /** Valor enviado en payloads: preferir texto de catálogo `tipo_documento` sobre `tipo_documento_genesys`. */
              value:
                (row.tipo_documento && String(row.tipo_documento).trim()) ||
                (row.tipo_documento_genesys && String(row.tipo_documento_genesys).trim()) ||
                '',
            }))
            .filter(o => o.value !== '');
        } else {
          this.tiposDocumentoPersona = [];
          this.tiposDocumentoPersonaReglas = [];
          console.warn('[Solicitud interna] Tipos documento persona no disponibles:', response.message);
        }
      },
      error: (err: unknown) => {
        this.cargandoTiposDocumentoPersona = false;
        this.tiposDocumentoPersona = [];
        this.tiposDocumentoPersonaReglas = [];
        console.error('[Solicitud interna] Error al cargar tipos documento persona', err);
      },
    });
  }

  irTrabajador(): void {
    this.step = 1;
    this.datosEmpresa = null;
    this.idEmpresaAfiliacionInterna = null;
    this.reiniciarConsultaEmpresa();
    this.reiniciarIdentificacionTrabajador();
    this.limpiarSolicitudInterna();
  }

  irBeneficiario(): void {
    this.step = 3;
    this.datosEmpresa = null;
    this.idEmpresaAfiliacionInterna = null;
    this.reiniciarConsultaEmpresa();
    this.reiniciarIdentificacionTrabajador();
    this.limpiarSolicitudInterna();
    this.reiniciarFlujoBeneficiarioInterno();
  }

  volverSeleccion(): void {
    this.confirmarSalidaSiHayDatos(() => this.ejecutarVolverSeleccion());
  }

  private ejecutarVolverSeleccion(): void {
    this.step = 0;
    this.datosEmpresa = null;
    this.idEmpresaAfiliacionInterna = null;
    this.reiniciarConsultaEmpresa();
    this.reiniciarIdentificacionTrabajador();
    this.limpiarSolicitudInterna();
    this.reiniciarFlujoBeneficiarioInterno();
  }

  get razonSocialEmpresaBeneficiario(): string {
    const d = this.datosEmpresaBeneficiario;
    if (!d) {
      return '';
    }
    const raw =
      d.razonSocial ??
      d['razon_social'] ??
      d['RazonSocial'] ??
      d['razonSocialEmpresa'] ??
      '';
    const s = String(raw).trim();
    return s || '—';
  }

  /** Flujo agregar beneficiario a trabajador activo (step 3, subpaso formulario). */
  get esFlujoBeneficiarioTrabajadorActivoInterno(): boolean {
    return this.step === 3 && this.pasoBeneficiarioSub === 3;
  }

  private reiniciarConsultaEmpresaBeneficiario(): void {
    this.consultaEmpresaBeneficiarioForm.reset({
      tipo_documento: null,
      numero_documento: '',
    });
  }

  private reiniciarIdentificacionTrabajadorBeneficiario(): void {
    this.identificacionTrabajadorBeneficiarioForm.reset({
      tipo_documento: null,
      numero_documento: '',
    });
    this.identificacionTrabajadorBeneficiarioForm.enable({ emitEvent: false });
    this.identificacionTrabajadorBeneficiarioBloqueada = false;
  }

  private reiniciarFlujoBeneficiarioInterno(): void {
    this.pasoBeneficiarioSub = 1;
    this.datosEmpresaBeneficiario = null;
    this.idEmpresaBeneficiarioInterna = null;
    this.trabajadorActivoBeneficiario = null;
    this.trabajadorBeneficiarioValidado = false;
    this.procesandoRadicadoBeneficiarioInterna = false;
    this.solicitudesCreadasBeneficiarioInterna = [];
    this.mensajeExitoRadicadoBeneficiarioInterna = '';
    this.beneficiariosAgregados = [];
    this.reiniciarConsultaEmpresaBeneficiario();
    this.reiniciarIdentificacionTrabajadorBeneficiario();
  }

  regresarAConsultaEmpresaBeneficiario(): void {
    this.pasoBeneficiarioSub = 1;
    this.trabajadorActivoBeneficiario = null;
    this.trabajadorBeneficiarioValidado = false;
    this.reiniciarIdentificacionTrabajadorBeneficiario();
  }

  consultarEmpresaBeneficiario(): void {
    this.consultaEmpresaBeneficiarioForm.markAllAsTouched();
    if (this.consultaEmpresaBeneficiarioForm.invalid || this.validandoEmpresaBeneficiario) {
      return;
    }
    const raw = this.consultaEmpresaBeneficiarioForm.getRawValue() as {
      tipo_documento: number | null;
      numero_documento: string;
    };
    const row = this.tiposDocumentoEmpresa.find(t => t.id === raw.tipo_documento);
    const tipoDoc =
      (row?.tipo_documento && String(row.tipo_documento).trim()) ||
      (row?.tipo_documento_genesys && String(row.tipo_documento_genesys).trim()) ||
      String(raw.tipo_documento ?? '');
    const numDoc = String(raw.numero_documento ?? '').trim();

    this.idEmpresaBeneficiarioInterna = null;
    this.validandoEmpresaBeneficiario = true;
    this.afiliacionInterna
      .validarEmpresa(tipoDoc, numDoc)
      .pipe(finalize(() => (this.validandoEmpresaBeneficiario = false)))
      .subscribe({
        next: (res: BodyResponse<ValidarEmpresaResponse>) => {
          if (res.code !== 200) {
            this.messageService.add({
              severity: 'error',
              summary: 'Validación de empresa',
              detail: res.message || 'No se pudo validar la empresa.',
            });
            return;
          }
          const payload = res.data;
          if (!payload) {
            this.messageService.add({
              severity: 'error',
              summary: 'Validación de empresa',
              detail: res.message || 'Respuesta incompleta del servicio.',
            });
            return;
          }
          if (payload.puedeContinuar) {
            this.datosEmpresaBeneficiario = payload.datosEmpresa ?? null;
            this.idEmpresaBeneficiarioInterna = this.normalizarIdEmpresa(
              payload.datosEmpresa?.idEmpresa ?? payload.datosEmpresa?.id_empresa
            );
            this.reiniciarIdentificacionTrabajadorBeneficiario();
            this.pasoBeneficiarioSub = 2;
            return;
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Empresa no apta',
            detail:
              payload.mensaje ||
              res.message ||
              'La empresa no cumple los requisitos para continuar con la solicitud.',
          });
        },
        error: (err: { error?: { message?: string }; message?: string }) => {
          const detail =
            err?.error?.message || err?.message || 'Error de comunicación al validar la empresa.';
          this.messageService.add({
            severity: 'error',
            summary: 'Validación de empresa',
            detail,
          });
        },
      });
  }

  consultarTrabajadorActivoBeneficiario(): void {
    this.identificacionTrabajadorBeneficiarioForm.markAllAsTouched();
    if (this.identificacionTrabajadorBeneficiarioForm.invalid || this.consultandoTrabajadorActivoBeneficiario) {
      return;
    }
    const idEmpresa = this.idEmpresaBeneficiarioInterna;
    if (idEmpresa == null) {
      this.messageService.add({
        severity: 'error',
        summary: 'Empresa requerida',
        detail: 'Valide la empresa antes de consultar el trabajador.',
      });
      return;
    }
    const raw = this.identificacionTrabajadorBeneficiarioForm.getRawValue() as {
      tipo_documento: string;
      numero_documento: string;
    };
    const tipoDocumento = String(raw.tipo_documento ?? '').trim();
    const numeroDocumento = String(raw.numero_documento ?? '').trim();

    this.consultandoTrabajadorActivoBeneficiario = true;
    this.trabajadorActivoBeneficiario = null;
    this.trabajadorBeneficiarioValidado = false;
    this.afiliacionInterna
      .consultarTrabajadorActivo({ idEmpresa, tipoDocumento, numeroDocumento })
      .pipe(finalize(() => (this.consultandoTrabajadorActivoBeneficiario = false)))
      .subscribe({
        next: (res: BodyResponse<TrabajadorActivoInternaResponse>) => {
          if (res.code !== 200) {
            this.messageService.add({
              severity: 'error',
              summary: 'Consulta de trabajador',
              detail: res.message || 'No se pudo consultar el trabajador.',
            });
            return;
          }
          const data = res.data;
          if (!data) {
            this.messageService.add({
              severity: 'error',
              summary: 'Consulta de trabajador',
              detail: res.message || 'Respuesta incompleta del servicio.',
            });
            return;
          }
          if (data.activo === true) {
            this.trabajadorActivoBeneficiario = {
              ...data,
              activo: true,
              tipoDocumento: data.tipoDocumento ?? tipoDocumento,
              numeroDocumento: data.numeroDocumento ?? numeroDocumento,
              nombreCompleto: data.nombreCompleto ?? '',
            };
            this.trabajadorBeneficiarioValidado = true;
            this.bloquearIdentificacionTrabajadorBeneficiario();
            this.cargarCatalogosParaSolicitud();
            return;
          }
          this.trabajadorBeneficiarioValidado = false;
          this.trabajadorActivoBeneficiario = null;
          this.modalAlertTitle = 'Trabajador inactivo';
          this.modalAlertMessage =
            data.mensaje ?? 'El trabajador no está activo laboralmente para la empresa.';
          this.visibleDialogAlert = true;
        },
        error: (err: { error?: { message?: string }; message?: string }) => {
          this.trabajadorBeneficiarioValidado = false;
          this.trabajadorActivoBeneficiario = null;
          const detail =
            err?.error?.message || err?.message || 'Error de comunicación al consultar el trabajador.';
          this.messageService.add({
            severity: 'error',
            summary: 'Consulta de trabajador',
            detail,
          });
        },
      });
  }

  consultarOtroTrabajadorBeneficiario(): void {
    this.trabajadorActivoBeneficiario = null;
    this.trabajadorBeneficiarioValidado = false;
    this.reiniciarIdentificacionTrabajadorBeneficiario();
  }

  iniciarAgregarBeneficiarioInterno(): void {
    if (!this.trabajadorBeneficiarioValidado || !this.trabajadorActivoBeneficiario) {
      return;
    }
    this.beneficiariosAgregados = [];
    this.reiniciarFormularioBeneficiarioInterno();
    this.pasoBeneficiarioSub = 3;
  }

  regresarDesdeAgregarBeneficiarioInterno(): void {
    this.pasoBeneficiarioSub = 2;
    this.beneficiariosAgregados = [];
    this.reiniciarFormularioBeneficiarioInterno();
  }

  reiniciarDespuesRadicadoBeneficiarioInterna(): void {
    this.solicitudesCreadasBeneficiarioInterna = [];
    this.mensajeExitoRadicadoBeneficiarioInterna = '';
    this.ejecutarVolverSeleccion();
  }

  radicarBeneficiariosInterna(): void {
    if (this.beneficiariosAgregados.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Radicar',
        detail: 'No hay beneficiarios para radicar.',
      });
      return;
    }

    const edadTrab = this.edadCumplidaAnios(this.trabajadorActivoBeneficiario?.fechaNacimiento);
    if (edadTrab != null && edadTrab < EDAD_MINIMA_TRABAJADOR_PARA_AFILIAR_CONYUGE) {
      const hayConyuge = this.beneficiariosAgregados.some(b => {
        const opt = this.parentescos.find(p => p.nombre === b.parentesco);
        return resolverCategoriaParentescoExclusivo(opt?.parentescoGenesys, b.parentesco) === 'conyuge';
      });
      if (hayConyuge) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validación de beneficiario',
          detail: 'Un trabajador menor de edad no puede afiliar a un beneficiario con parentesco Cónyuge.',
        });
        return;
      }
    }

    const request = this.construirRequestAgregarBeneficiariosInterna([]);
    if (!request) {
      this.messageService.add({
        severity: 'error',
        summary: 'Radicar',
        detail: 'Faltan datos del trabajador o de la empresa. Vuelva a consultar el trabajador activo.',
      });
      return;
    }

    this.procesandoRadicadoBeneficiarioInterna = true;
    this.construirAdjuntosBase64AgregarBeneficiarioInterna()
      .then(adjuntos => {
        request.adjuntos = adjuntos.length > 0 ? adjuntos : undefined;
        this.afiliacionInterna
          .agregarBeneficiarioTrabajadorActivoEnWs(request)
          .pipe(finalize(() => (this.procesandoRadicadoBeneficiarioInterna = false)))
          .subscribe({
            next: (data: AgregarBeneficiarioTrabajadorActivoResponseInterna) => {
              if (!data?.success || !data.solicitudesCreadas?.length) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Radicar',
                  detail: data?.mensaje ?? 'No se pudo completar la radicación.',
                });
                return;
              }
              this.solicitudesCreadasBeneficiarioInterna = data.solicitudesCreadas ?? [];
              this.mensajeExitoRadicadoBeneficiarioInterna =
                data.mensaje ?? 'Solicitud(es) creada(s) correctamente.';
              this.pasoBeneficiarioSub = 4;
              const primerRad = this.solicitudesCreadasBeneficiarioInterna[0]?.numeroRadicado ?? '';
              const hoy = new Date();
              const esSabDom = hoy.getDay() === 0 || hoy.getDay() === 6;
              if (
                primerRad &&
                (esSabDom || this.respuestaAgregarIndicaRadicacionDiaNoHabil(data.mensaje))
              ) {
                this.mostrarDialogAlert(
                  this.tituloModalRadicacionDiaNoHabil(primerRad),
                  TEXTO_MODAL_CUERPO_RADICACION_DIA_NO_HABIL
                );
              }
            },
            error: (err: { message?: string }) => {
              const msg = err?.message ?? 'Error al radicar. Intente de nuevo.';
              this.messageService.add({ severity: 'error', summary: 'Radicar', detail: msg });
            },
          });
      })
      .catch(() => {
        this.procesandoRadicadoBeneficiarioInterna = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Radicar',
          detail: 'Error al procesar los archivos adjuntos.',
        });
      });
  }

  private mostrarDialogAlert(titulo: string, mensaje: string): void {
    this.modalAlertTitle = titulo;
    this.modalAlertMessage = mensaje;
    this.visibleDialogAlert = true;
  }

  private tituloModalRadicacionDiaNoHabil(numeroRadicado: string): string {
    const r = (numeroRadicado ?? '').trim() || 'S/N';
    return `¡Tu solicitud fue enviada! Radicado ${r}.`;
  }

  private respuestaAgregarIndicaRadicacionDiaNoHabil(mensaje: string | null | undefined): boolean {
    const m = (mensaje ?? '').toLowerCase();
    return m.includes('fin de semana') || m.includes('día festivo') || m.includes('dia festivo');
  }

  private construirRequestAgregarBeneficiariosInterna(
    adjuntos: AdjuntoNuevoRequestInterna[]
  ): AgregarBeneficiarioTrabajadorActivoRequestInterna | null {
    const idEmpresa = this.idEmpresaBeneficiarioInterna;
    const t = this.trabajadorActivoBeneficiario;
    if (idEmpresa == null || !t?.tipoDocumento || !t?.numeroDocumento) {
      return null;
    }
    const beneficiarios: BeneficiarioNuevoRequestInterna[] = this.beneficiariosAgregados.map(p =>
      this.mapearBeneficiarioNuevoRequestInterna(p)
    );
    return {
      idEmpresa,
      tipoDocumentoTrabajador: t.tipoDocumento,
      numeroDocumentoTrabajador: t.numeroDocumento,
      nombreCompletoTrabajador: t.nombreCompleto ?? null,
      primerNombreTrabajador: t.primerNombre ?? null,
      segundoNombreTrabajador: t.segundoNombre ?? null,
      primerApellidoTrabajador: t.primerApellido ?? null,
      segundoApellidoTrabajador: t.segundoApellido ?? null,
      fechaNacimientoTrabajador: t.fechaNacimiento ?? null,
      generoTrabajador: t.genero ?? null,
      direccionTrabajador: t.direccion ?? null,
      telefonoTrabajador: t.telefono ?? null,
      correoElectronicoTrabajador: t.correoElectronico ?? null,
      fechaExpedicionDocTrabajador: t.fechaExpedicionDocumentoTrabajador ?? null,
      nivelEducativoTrabajador: t.nivelEducativo ?? null,
      cabezaHogarTrabajador: t.cabezaHogar ?? null,
      estadoCivilTrabajador: t.estadoCivil ?? null,
      paisResidenciaTrabajador: t.paisResidencia ?? null,
      idDepartamentoTrabajador: t.idDepartamento ?? null,
      idMunicipioTrabajador: t.idMunicipio ?? null,
      zonaTrabajador: t.zona ?? null,
      viveEnCasaPropiaTrabajador: t.viveEnCasaPropia ?? null,
      autorizacionEnvioCorreoTrabajador: t.autorizacionEnvioCorreo ?? null,
      medioPagoTrabajador: t.medioPago ?? null,
      horasLaboradasMesTrabajador: t.horasLaboradasMes ?? null,
      sucursalAsociadaTrabajador: t.sucursalAsociada ?? null,
      municipioLaboraTrabajador: t.municipioLabora ?? null,
      fechaIngresoEmpresaTrabajador: t.fechaIngresoEmpresa ?? null,
      salarioMensualTrabajador: t.salarioMensual ?? null,
      claseTrabajadorTrabajador: t.claseTrabajador ?? null,
      beneficiarios,
      adjuntos: adjuntos.length > 0 ? adjuntos : undefined,
      observaciones: null,
      origenRadicacion: 'Afiliacion interna',
      usuarioRadicacionInterno: this.obtenerUsuarioRadicacionInterno(),
    };
  }

  /** Login del gestor PQR en sesión (JWT → sessionStorage [USER]). */
  private obtenerUsuarioRadicacionInterno(): string {
    const login = sessionStorage.getItem(SessionStorageItems.USER)?.trim();
    if (login) {
      return login;
    }
    const token = sessionStorage.getItem(SessionStorageItems.SESSION);
    if (token) {
      try {
        return jwtDecode<ISession>(token).usuario?.trim() ?? '';
      } catch {
        return '';
      }
    }
    return '';
  }

  private mapearBeneficiarioNuevoRequestInterna(b: PersonaACargoInterna): BeneficiarioNuevoRequestInterna {
    const mapped = this.mapearBeneficiarioGuardarSolicitud(b);
    return {
      ...mapped,
      parentesco: (mapped.parentesco ?? b.parentesco ?? '').toString().trim(),
    };
  }

  private async construirAdjuntosBase64AgregarBeneficiarioInterna(): Promise<AdjuntoNuevoRequestInterna[]> {
    const docPromises: Promise<AdjuntoNuevoRequestInterna>[] = [];
    this.beneficiariosAgregados.forEach((persona, index) => {
      const indiceBeneficiario = index + 1;
      const slots = persona.documentosAdjuntos;
      if (slots?.length) {
        slots.forEach(slot => {
          const idTipo = Number(slot.idTipoAdjunto);
          (slot.archivos ?? []).forEach(file => {
            docPromises.push(
              this.archivoABase64(file).then(base64 => ({
                idTipoAdjunto: idTipo,
                nombreArchivo: file.name,
                indiceBeneficiario,
                contentType: file.type || undefined,
                tamanioBytes: file.size,
                contenidoBase64: base64,
              }))
            );
          });
        });
      }
    });
    const docAdjuntos = await Promise.all(docPromises);
    const discAdjuntos: AdjuntoNuevoRequestInterna[] = [];
    for (let i = 0; i < this.beneficiariosAgregados.length; i++) {
      const persona = this.beneficiariosAgregados[i];
      for (const archivoDisc of archivosSoporteDiscapacidadDesdePersona(persona.archivoSoporteDiscapacidad)) {
        const base64 = await this.archivoABase64(archivoDisc);
        discAdjuntos.push({
          idTipoAdjunto: ID_TIPO_ADJUNTO_SOPORTE_DISCAPACIDAD,
          nombreArchivo: archivoDisc.name,
          indiceBeneficiario: i + 1,
          contentType: archivoDisc.type || undefined,
          tamanioBytes: archivoDisc.size,
          contenidoBase64: base64,
        });
      }
    }
    return [...docAdjuntos, ...discAdjuntos];
  }

  private reiniciarFormularioBeneficiarioInterno(): void {
    this.identificacionBeneficiarioBloqueada = false;
    this.errorValidacionBeneficiario = '';
    this.validacionesBeneficiario = [];
    this.datosBeneficiario = null;
    this.datosPersonaACargoValidada = null;
    this.ultimoDatosFormularioValidacionBeneficiario = null;
    this.mostrarCampoGeneroPersonaACargo = true;
    this.indiceBeneficiarioEditando = null;
    this.documentosAdjuntosPersonaACargo = [];
    this.archivosSoporteDiscapacidadPersonaACargo = [];
    this.formularioPersonaACargo.reset({
      parentesco: '',
      tipoDocumento: '',
      numeroDocumento: '',
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      fechaNacimiento: '',
      fechaExpedicion: '',
      genero: '',
      personaDiscapacidad: '',
      direccionCorrespondeTrabajador: 'Si',
      direccion: '',
    });
    this.formularioPersonaACargo.enable({ emitEvent: false });
    this.forzarDireccionCorrespondeTrabajador();
  }

  private bloquearIdentificacionTrabajadorBeneficiario(): void {
    this.identificacionTrabajadorBeneficiarioBloqueada = true;
    this.identificacionTrabajadorBeneficiarioForm.get('tipo_documento')?.disable({ emitEvent: false });
    this.identificacionTrabajadorBeneficiarioForm.get('numero_documento')?.disable({ emitEvent: false });
  }

  getLabelTipoDocumentoBeneficiario(codigo: string | null | undefined): string {
    if (!codigo) {
      return '';
    }
    const found = this.tiposDocumentoPersona.find(t => t.value === codigo);
    return found?.label ?? codigo;
  }

  regresarAConsultaEmpresa(): void {
    this.confirmarSalidaSiHayDatos(() => this.ejecutarRegresarAConsultaEmpresa());
  }

  private ejecutarRegresarAConsultaEmpresa(): void {
    this.step = 1;
    this.datosEmpresa = null;
    this.idEmpresaAfiliacionInterna = null;
    this.reiniciarConsultaEmpresa();
    this.reiniciarIdentificacionTrabajador();
    this.limpiarSolicitudInterna();
  }

  get razonSocialEmpresa(): string {
    const d = this.datosEmpresa;
    if (!d) {
      return '';
    }
    const raw =
      d.razonSocial ??
      d['razon_social'] ??
      d['RazonSocial'] ??
      d['razonSocialEmpresa'] ??
      '';
    const s = String(raw).trim();
    return s || '—';
  }

  private normalizarIdEmpresa(raw: unknown): number | null {
    if (raw === undefined || raw === null || raw === '') {
      return null;
    }
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  private reiniciarConsultaEmpresa(): void {
    this.consultaEmpresaForm.reset({
      tipo_documento: null,
      numero_documento: '',
    });
  }

  private reiniciarIdentificacionTrabajador(): void {
    this.identificacionTrabajadorForm.reset({
      tipo_documento: null,
      numero_documento: '',
    });
  }

  private limpiarSolicitudInterna(): void {
    this.resetValidacionTrabajador(false);
    this.respuestaValidarTrabajador = null;
    this.resetSeccionesGuardadas();
    this.catalogosSolicitudCargados = false;
    this.opcionesMunicipio = [];
    this.municipiosCache = [];
    this.camposPersonalesPrecargados = {};
    this.limpiarAdjuntosTrabajador();
    this.limpiarEstadoBeneficiarios();
    this.solicitudPersonalForm.reset(
      {
        tipo_documento: '',
        numero_documento: '',
        primer_nombre: '',
        segundo_nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        fecha_nacimiento: null,
        fecha_expedicion: null,
        celular: '',
        confirmar_celular: '',
        correo: '',
        confirmar_correo: '',
        genero: null,
        estado_civil: null,
        direccion: '',
        zona: null,
        id_departamento: null,
        id_municipio: null,
      },
      { emitEvent: false }
    );
    this.solicitudPersonalForm.enable({ emitEvent: false });
    this.reiniciarFormulariosLaboralYMedioPago();
  }

  /** Limpia solo el estado del paso 4 al salir de la solicitud hacia paso 2. */
  private resetPasoSolicitudManteniendoPaso(paso: PasoAfiliacionInterna): void {
    this.step = paso;
    this.respuestaValidarTrabajador = null;
    this.resetSeccionesGuardadas();
    this.catalogosSolicitudCargados = false;
    this.opcionesMunicipio = [];
    this.municipiosCache = [];
    this.solicitudPersonalForm.reset(
      {
        tipo_documento: '',
        numero_documento: '',
        primer_nombre: '',
        segundo_nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        fecha_nacimiento: null,
        fecha_expedicion: null,
        celular: '',
        confirmar_celular: '',
        correo: '',
        confirmar_correo: '',
        genero: null,
        estado_civil: null,
        direccion: '',
        zona: null,
        id_departamento: null,
        id_municipio: null,
      },
      { emitEvent: false }
    );
    this.solicitudPersonalForm.enable({ emitEvent: false });
    this.reiniciarFormulariosLaboralYMedioPago();
  }

  private reiniciarFormulariosLaboralYMedioPago(): void {
    this.entidadesMedioPagoRef = [];
    this.opcionesEntidadesPago = [];
    this.opcionesTipoCuenta = [];
    this.opcionesMedioPago = [
      { label: 'Efectivo', value: 'Efectivo' },
      { label: 'Transferencia', value: 'Transferencia' },
    ];
    this.laborFechaIngresoMin = null;
    this.laborFechaIngresoMax = null;
    this.laborFechaIngresoMinimaIso = '';
    this.laborFechaIngresoMaximaIso = '';
    this.horasLaboralesMin = 1;
    this.horasLaboralesMax = 240;
    this.salarioMinimoRef = null;
    this.solicitudLaboralForm.reset(
      {
        fecha_ingreso_empresa: null,
        horas_mes: null,
        salario_mensual: null,
        cargo_desempenado: '',
      },
      { emitEvent: false }
    );
    this.solicitudLaboralForm.get('horas_mes')?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(240),
    ]);
    this.solicitudLaboralForm.get('salario_mensual')?.setValidators([Validators.required]);
    this.solicitudLaboralForm.updateValueAndValidity({ emitEvent: false });
    this.solicitudMedioPagoForm.reset(
      {
        medio_pago: 'Transferencia',
        id_entidad: null,
        tipo_cuenta: null,
        numero_cuenta: '',
        confirmacion_cuenta: '',
        llave_breb: '',
        confirmar_llave_breb: '',
      },
      { emitEvent: false }
    );
    this.aplicarValidadoresMedioPagoSegunEstado();
    this.solicitudLaboralForm.enable({ emitEvent: false });
    this.solicitudMedioPagoForm.enable({ emitEvent: false });
  }

  consultarEmpresa(): void {
    this.consultaEmpresaForm.markAllAsTouched();
    if (this.consultaEmpresaForm.invalid || this.validandoEmpresa) {
      return;
    }
    const raw = this.consultaEmpresaForm.getRawValue() as {
      tipo_documento: number | null;
      numero_documento: string;
    };
    const row = this.tiposDocumentoEmpresa.find(t => t.id === raw.tipo_documento);
    const tipoDoc =
      (row?.tipo_documento && String(row.tipo_documento).trim()) ||
      (row?.tipo_documento_genesys && String(row.tipo_documento_genesys).trim()) ||
      String(raw.tipo_documento ?? '');
    const numDoc = String(raw.numero_documento ?? '').trim();

    this.idEmpresaAfiliacionInterna = null;
    this.validandoEmpresa = true;
    this.afiliacionInterna
      .validarEmpresa(tipoDoc, numDoc)
      .pipe(finalize(() => (this.validandoEmpresa = false)))
      .subscribe({
        next: (res: BodyResponse<ValidarEmpresaResponse>) => {
          if (res.code !== 200) {
            this.messageService.add({
              severity: 'error',
              summary: 'Validación de empresa',
              detail: res.message || 'No se pudo validar la empresa.',
            });
            return;
          }
          const payload = res.data;
          if (!payload) {
            this.messageService.add({
              severity: 'error',
              summary: 'Validación de empresa',
              detail: res.message || 'Respuesta incompleta del servicio.',
            });
            return;
          }
          if (payload.puedeContinuar) {
            this.datosEmpresa = payload.datosEmpresa ?? null;
            this.idEmpresaAfiliacionInterna = this.normalizarIdEmpresa(
              payload.datosEmpresa?.idEmpresa ?? payload.datosEmpresa?.id_empresa
            );
            this.reiniciarIdentificacionTrabajador();
            this.step = 2;
            return;
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Empresa no apta',
            detail:
              payload.mensaje ||
              res.message ||
              'La empresa no cumple los requisitos para continuar con la solicitud.',
          });
        },
        error: (err: { error?: { message?: string }; message?: string }) => {
          const detail =
            err?.error?.message || err?.message || 'Error de comunicación al validar la empresa.';
          this.messageService.add({
            severity: 'error',
            summary: 'Validación de empresa',
            detail,
          });
        },
      });
  }

  /** Limpia validación de trabajador en paso 2 (checklist, bloqueo, flags de guardado). */
  private resetValidacionTrabajador(limpiarFormIdentificacion: boolean): void {
    this.validacionesTrabajador = [];
    this.identificacionTrabajadorBloqueada = false;
    this.documentoTrabajadorValidado = false;
    this.requiereAdjuntoDocumento = true;
    this.mensajeAdjuntoDocumento = '';
    this.requierePermisoLaboral = false;
    this.mensajePermisoLaboral = '';
    this.hayBeneficiariosPrecargadosDesdeBackend = false;
    this.beneficiariosPrecargarGuardar = [];
    this.limpiarAdjuntosTrabajador();
    this.limpiarEstadoBeneficiarios();
    if (limpiarFormIdentificacion) {
      this.desbloquearIdentificacionTrabajador();
      this.reiniciarIdentificacionTrabajador();
    }
  }

  limpiarIdentificacionTrabajador(): void {
    this.resetValidacionTrabajador(true);
  }

  closeDialogAlert(_value: boolean): void {
    this.visibleDialogAlert = false;
    this.modalAlertTitle = '';
    this.modalAlertMessage = '';
  }

  private bloquearIdentificacionTrabajador(): void {
    this.identificacionTrabajadorBloqueada = true;
    this.identificacionTrabajadorForm.get('tipo_documento')?.disable({ emitEvent: false });
    this.identificacionTrabajadorForm.get('numero_documento')?.disable({ emitEvent: false });
  }

  private desbloquearIdentificacionTrabajador(): void {
    this.identificacionTrabajadorBloqueada = false;
    this.identificacionTrabajadorForm.get('tipo_documento')?.enable({ emitEvent: false });
    this.identificacionTrabajadorForm.get('numero_documento')?.enable({ emitEvent: false });
  }

  private tituloModalValidacionTrabajadorFallida(
    v: ValidacionResultAfiliacionInterna | undefined | null
  ): string {
    const n = (v?.nombre ?? '').trim();
    const m = (v?.mensaje ?? '').toLowerCase();
    if (n === 'solicitudPendiente' || n === 'masivaEnProceso') {
      return 'Solicitud en curso';
    }
    if (n === 'registraduriaEnLineaNoDisponible') {
      return 'Servicio no disponible';
    }
    if (n === 'dobleIdentidad') {
      return 'Documento con inconsistencia';
    }
    if (n === 'edadMinimaTrabajador') {
      return 'Edad mínima trabajador';
    }
    if (n === 'registraduria') {
      if (m.includes('cancelado')) {
        return 'Documento cancelado';
      }
      return 'Documento con inconsistencia';
    }
    return 'Validación';
  }

  private mostrarModalValidacionTrabajador(titulo: string, mensaje: string): void {
    this.modalAlertTitle = titulo;
    this.modalAlertMessage = mensaje;
    this.visibleDialogAlert = true;
  }

  private mapearValidacionesTrabajador(
    validaciones: ValidacionResultAfiliacionInterna[] | undefined | null
  ): ValidacionMostradaAfiliacionInterna[] {
    return (validaciones ?? []).map(v => ({
      passed: v.paso,
      message: v.nombreParaMostrar ?? v.mensaje ?? v.nombre ?? '',
      name: v.nombre ?? '',
    }));
  }

  private esRespuestaWsValidarTrabajadorError(data: ValidarTrabajadorResponse): boolean {
    if (data.success === false) {
      return true;
    }
    return data.puedeContinuar === false && (!data.validaciones || data.validaciones.length === 0);
  }

  private mensajeErrorWsValidarTrabajador(data: ValidarTrabajadorResponse): string {
    return (
      data.message ??
      data.mensaje ??
      data.error ??
      'No se pudo validar al trabajador.'
    );
  }

  /**
   * Conserva flags y listas de la respuesta para guardar-solicitud (paridad afiliación web).
   */
  private almacenarContextoGuardarDesdeDatosFormulario(datos: DatosFormularioAfiliacionInterna | null | undefined): void {
    if (!datos) {
      this.hayBeneficiariosPrecargadosDesdeBackend = false;
      this.beneficiariosPrecargarGuardar = [];
      return;
    }

    const personal = datos.personalInfo;
    if (personal) {
      this.requiereAdjuntoDocumento = personal.requiereAdjuntoDocumento !== false;
      this.mensajeAdjuntoDocumento = String(personal.mensajeAdjuntoDocumento ?? '').trim();
      const sinDatosPersonales =
        !this.tieneTexto(personal.nombreCompleto) &&
        !this.tieneTexto(personal.primerNombre ?? personal.primer_nombre) &&
        !this.tieneTexto(personal.primerApellido ?? personal.primer_apellido);
      if (sinDatosPersonales) {
        this.requiereAdjuntoDocumento = true;
      }
    }

    const labor = datos.laborInfo;
    if (labor) {
      this.requierePermisoLaboral = labor.requierePermisoLaboral === true;
      this.mensajePermisoLaboral = String(labor.mensajePermisoLaboral ?? '').trim();
    }

    const precargar = datos.beneficiariosPrecargar;
    if (precargar && precargar.length > 0) {
      this.hayBeneficiariosPrecargadosDesdeBackend = true;
      this.beneficiariosPrecargarGuardar = [...precargar];
      this.beneficiariosAgregados = precargar.map(p => this.mapBeneficiarioPrecargarAPersonaACargo(p));
      this.opcionBeneficiarios = 'si';
    } else {
      this.hayBeneficiariosPrecargadosDesdeBackend = false;
      this.beneficiariosPrecargarGuardar = [];
    }

    const db = datos.datosBeneficiario;
    this.datosBeneficiario = db ?? null;
  }

  private tieneTexto(val: unknown): boolean {
    return val != null && String(val).trim() !== '';
  }

  /** Aplica disabled/enabled según precarga y camposVisibles del backend (paridad portal empresa). */
  private aplicarVisibilidadFormularioPersonal(personal?: PersonalInfoAfiliacionInterna | null): void {
    const camposVisibles = personal?.camposVisibles ?? {};
    const mapVisibilidad: Record<string, string> = {
      tipoDocumento: 'tipo_documento',
      numeroDocumento: 'numero_documento',
      primerNombre: 'primer_nombre',
      segundoNombre: 'segundo_nombre',
      primerApellido: 'primer_apellido',
      segundoApellido: 'segundo_apellido',
      fechaNacimiento: 'fecha_nacimiento',
      fechaExpedicion: 'fecha_expedicion',
      celular: 'celular',
      confirmarCelular: 'confirmar_celular',
      correoElectronico: 'correo',
      confirmarCorreo: 'confirmar_correo',
      genero: 'genero',
      estadoCivil: 'estado_civil',
      direccion: 'direccion',
      departamento: 'id_departamento',
      municipio: 'id_municipio',
      zona: 'zona',
    };

    const controles = [
      'tipo_documento',
      'numero_documento',
      'primer_nombre',
      'segundo_nombre',
      'primer_apellido',
      'segundo_apellido',
      'fecha_nacimiento',
      'fecha_expedicion',
      'celular',
      'confirmar_celular',
      'correo',
      'confirmar_correo',
      'genero',
      'estado_civil',
      'direccion',
      'id_departamento',
      'id_municipio',
      'zona',
    ];

    controles.forEach(name => {
      const control = this.solicitudPersonalForm.get(name);
      if (!control) {
        return;
      }
      let deshabilitar =
        name === 'tipo_documento' ||
        name === 'numero_documento' ||
        this.camposPersonalesPrecargados[name] === true;

      for (const [camel, snake] of Object.entries(mapVisibilidad)) {
        if (snake === name && camposVisibles[camel] === false) {
          deshabilitar = true;
        }
      }

      if (deshabilitar) {
        control.disable({ emitEvent: false });
      } else {
        control.enable({ emitEvent: false });
      }
    });
  }

  private construirCamposPersonalesPrecargados(
    personal: PersonalInfoAfiliacionInterna | null | undefined
  ): Record<string, boolean> {
    const v = (x: unknown): boolean => this.tieneTexto(x);
    const pick = (...keys: (keyof PersonalInfoAfiliacionInterna | string)[]): string => {
      if (!personal) {
        return '';
      }
      for (const k of keys) {
        const val = personal[k as keyof PersonalInfoAfiliacionInterna];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
      return '';
    };

    const tel = pick('celular', 'telefono');
    const correo = pick('correo', 'correo_electronico', 'correoElectronico');

    return {
      tipo_documento: true,
      numero_documento: true,
      primer_nombre: v(pick('primer_nombre', 'primerNombre')),
      segundo_nombre: v(pick('segundo_nombre', 'segundoNombre')),
      primer_apellido: v(pick('primer_apellido', 'primerApellido')),
      segundo_apellido: v(pick('segundo_apellido', 'segundoApellido')),
      fecha_nacimiento: v(pick('fecha_nacimiento', 'fechaNacimiento')),
      fecha_expedicion: v(pick('fecha_expedicion_doc', 'fechaExpedicion')),
      celular: v(tel),
      confirmar_celular: v(tel),
      correo: v(correo),
      confirmar_correo: v(correo),
      genero: v(pick('genero')),
      estado_civil: v(pick('estado_civil', 'estadoCivil')),
      direccion: v(pick('direccion', 'direccion_residencia')),
      id_departamento: false,
      id_municipio: false,
      zona: v(pick('zona')),
    };
  }

  consultarIdentificacionTrabajador(): void {
    this.identificacionTrabajadorForm.markAllAsTouched();
    if (this.identificacionTrabajadorForm.invalid || this.validandoTrabajador) {
      return;
    }
    const idEmpresa = this.idEmpresaAfiliacionInterna;
    if (idEmpresa == null) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validación de trabajador',
        detail:
          'No se encontró el identificador de la empresa (idEmpresa). Vuelva a validar la empresa o contacte a soporte.',
      });
      return;
    }
    const tipoDocumento = String(this.identificacionTrabajadorForm.get('tipo_documento')?.value ?? '').trim();
    const numeroDocumento = String(this.identificacionTrabajadorForm.get('numero_documento')?.value ?? '').trim();

    this.validacionesTrabajador = [];
    this.validandoTrabajador = true;
    this.afiliacionInterna
      .validarTrabajador({
        tipoDocumento,
        numeroDocumento,
        idEmpresa,
      })
      .pipe(finalize(() => (this.validandoTrabajador = false)))
      .subscribe({
        next: (res: BodyResponse<ValidarTrabajadorResponse>) => {
          if (res.code !== 200) {
            this.messageService.add({
              severity: 'error',
              summary: 'Validación de trabajador',
              detail: res.message || 'No se pudo validar al trabajador.',
            });
            return;
          }
          const data = res.data;
          if (!data) {
            this.messageService.add({
              severity: 'error',
              summary: 'Validación de trabajador',
              detail: res.message || 'Respuesta incompleta del servicio.',
            });
            return;
          }

          if (this.esRespuestaWsValidarTrabajadorError(data)) {
            this.messageService.add({
              severity: 'error',
              summary: 'Validación de trabajador',
              detail: this.mensajeErrorWsValidarTrabajador(data),
            });
            return;
          }

          this.validacionesTrabajador = this.mapearValidacionesTrabajador(data.validaciones);

          if (data.puedeContinuar === false) {
            this.bloquearIdentificacionTrabajador();
            const fallida = data.validaciones?.find(x => !x.paso);
            const mensajeBloqueo =
              fallida?.mensaje ?? data.mensaje ?? 'No es posible continuar con la afiliación.';
            const fallidas = (data.validaciones ?? []).filter(v => !v.paso);
            const partes = fallidas
              .map(v => (v.mensaje ?? v.nombreParaMostrar ?? v.nombre ?? '').trim())
              .filter(Boolean);
            const mensajeModal = partes.length > 0 ? partes.join(' ') : mensajeBloqueo;
            this.mostrarModalValidacionTrabajador(
              this.tituloModalValidacionTrabajadorFallida(fallida),
              mensajeModal
            );
            return;
          }

          this.documentoTrabajadorValidado = true;
          this.respuestaValidarTrabajador = data;
          this.almacenarContextoGuardarDesdeDatosFormulario(data.datosFormulario ?? null);
          this.resetSeccionesGuardadas();
          this.cargarCatalogosParaSolicitud(() => {
          this.patchSolicitudDesdeRespuesta(data);
          this.patchLaborDesdeRespuesta(data);
          this.patchMedioPagoDesdeRespuesta(data);
            this.reconciliarPrecargaPersonalSiAplica();
            this.aplicarIndiceAcordeon(0);
          this.step = 4;
          });
        },
        error: (err: { error?: { message?: string; data?: { message?: string } }; message?: string }) => {
          const detail =
            err?.error?.message ||
            err?.error?.data?.message ||
            err?.message ||
            'Error de comunicación al validar al trabajador.';
          this.messageService.add({
            severity: 'error',
            summary: 'Validación de trabajador',
            detail,
          });
        },
      });
  }

  regresarDesdeSolicitudTrabajador(): void {
    this.confirmarSalidaSiHayDatos(() => {
    this.resetPasoSolicitudManteniendoPaso(2);
      this.resetValidacionTrabajador(false);
    });
  }

  guardarYContinuarInformacionPersonal(): void {
    if (this.requiereAdjuntoDocumento && this.archivosIdentidad.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Documento de identidad',
        detail: 'Debe adjuntar la copia del documento de identidad para continuar con el proceso.',
      });
      return;
    }
    const rawPersonal = this.solicitudPersonalForm.getRawValue();
    const fechaNac = rawPersonal.fecha_nacimiento;
    const fechaExp = rawPersonal.fecha_expedicion;
    if (!this.validarFechasNacimientoExpedicionPersonal(fechaNac, fechaExp)) {
      return;
    }
    if (!this.edadCorrespondeATipoDocumento(this.obtenerTipoDocumentoPersonalParaValidacion(), fechaNac)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: MSG_EDAD_NO_CORRESPONDE_TIPO_DOCUMENTO,
      });
      return;
    }
    if (!this.validarEdadMinimaTrabajadorAfiliacion(fechaNac)) {
      return;
    }
    this.solicitudPersonalForm.markAllAsTouched();
    this.solicitudPersonalForm.updateValueAndValidity();
    if (!this.esFormularioPersonalCompletoParaAvanzar()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Información personal',
        detail:
          'Complete los campos obligatorios. Revise departamento y municipio (deben elegirse del listado), género, estado civil, dirección, y que celular y correo coincidan con su confirmación.',
      });
      return;
    }
    this.seccionPersonalGuardada = true;
    this.aplicarIndiceAcordeon(1);
    this.messageService.add({
      severity: 'success',
      summary: 'Información personal',
      detail: 'Datos guardados. Continúe con información laboral.',
    });
  }

  guardarYContinuarInformacionLaboral(): void {
    this.solicitudLaboralForm.markAllAsTouched();
    this.solicitudLaboralForm.updateValueAndValidity();
    if (!this.esFechaIngresoLaboralEnRangoPermitido()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Fecha de ingreso inválida',
        detail: MSG_FECHA_INGRESO_FUERA_RANGO,
      });
      return;
    }
    if (this.solicitudLaboralForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Información laboral',
        detail: 'Complete los campos obligatorios y revise fechas, horas y salario según los límites indicados.',
      });
      return;
    }
    if (this.debeMostrarPermisoTrabajo() && this.archivosPermisoTrabajo.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Permiso de trabajo',
        detail: 'Debe adjuntar el permiso de trabajo del menor de edad para continuar.',
      });
      return;
    }
    this.seccionLaboralGuardada = true;
    if (!this.mostrarFormularioMedioPago) {
      this.seccionPagoGuardada = true;
      this.aplicarIndiceAcordeon(3);
    } else {
      this.aplicarIndiceAcordeon(2);
    }
    this.messageService.add({
      severity: 'success',
      summary: 'Información laboral',
      detail: this.mostrarFormularioMedioPago
        ? 'Datos guardados. Continúe con medio de pago.'
        : 'Datos guardados. Continúe con beneficiarios.',
    });
  }

  guardarYContinuarMedioPago(): void {
    if (!this.requiereDatosBancariosMedioPago()) {
      this.seccionPagoGuardada = true;
      this.aplicarIndiceAcordeon(3);
      this.messageService.add({
        severity: 'success',
        summary: 'Medio de pago',
        detail: 'Datos registrados. Revise beneficiarios si aplica.',
      });
      return;
    }
    this.solicitudMedioPagoForm.markAllAsTouched();
    this.solicitudMedioPagoForm.updateValueAndValidity();
    if (this.solicitudMedioPagoForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Medio de pago',
        detail:
          'Con transferencia debe completar entidad bancaria, número de cuenta y confirmación (y tipo de cuenta si aplica).',
      });
      return;
    }
    this.seccionPagoGuardada = true;
    this.aplicarIndiceAcordeon(3);
    this.messageService.add({
      severity: 'success',
      summary: 'Medio de pago',
      detail: 'Datos registrados. Revise beneficiarios si aplica.',
    });
  }

  regresarDesdeInformacionLaboral(): void {
    this.aplicarIndiceAcordeon(0);
  }

  regresarDesdeMedioPago(): void {
    this.aplicarIndiceAcordeon(1);
  }

  regresarDesdeBeneficiarios(): void {
    this.aplicarIndiceAcordeon(this.mostrarFormularioMedioPago ? 2 : 1);
  }

  guardarSolicitudGlobal(): void {
    this.ejecutarGuardarSolicitud();
  }

  reiniciarDespuesRadicado(): void {
    this.mostrarConfirmacionRadicado = false;
    this.numeroRadicado = '';
    this.mensajeFinSemanaFestivo = '';
    // Reinicio completo sin confirmación: la solicitud ya fue radicada.
    this.ejecutarVolverSeleccion();
  }

  private ejecutarGuardarSolicitud(): void {
    const idEmpresa = this.idEmpresaAfiliacionInterna;
    if (idEmpresa == null) {
    this.messageService.add({
        severity: 'error',
        summary: 'Empresa requerida',
        detail: 'No se encontró la empresa asociada. Vuelva a validar la empresa.',
      });
      return;
    }

    const seccionesPendientes = this.obtenerSeccionesPendientes();
    if (seccionesPendientes.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Solicitud incompleta',
        detail: `Complete las siguientes secciones antes de guardar: ${seccionesPendientes.join(', ')}.`,
      });
      return;
    }

    const fechaNac = this.solicitudPersonalForm.get('fecha_nacimiento')?.value;
    const fechaExp = this.solicitudPersonalForm.get('fecha_expedicion')?.value;
    if (!this.validarFechasNacimientoExpedicionPersonal(fechaNac, fechaExp)) {
      return;
    }
    if (!this.edadCorrespondeATipoDocumento(this.obtenerTipoDocumentoPersonalParaValidacion(), fechaNac)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: MSG_EDAD_NO_CORRESPONDE_TIPO_DOCUMENTO,
      });
      return;
    }
    if (!this.validarEdadMinimaTrabajadorAfiliacion(fechaNac)) {
      return;
    }
    if (!this.esFechaIngresoLaboralEnRangoPermitido()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Fecha de ingreso inválida',
        detail: MSG_FECHA_INGRESO_FUERA_RANGO,
      });
      return;
    }

    if (this.procesandoSolicitud) {
      return;
    }

    this.procesandoSolicitud = true;
    const listaArchivos = this.construirListaArchivosParaSubir();

    const onSuccess = (resp: GuardarSolicitudResponseInterna): void => {
      this.procesandoSolicitud = false;
      const radicado = (resp.numeroRadicado ?? '').toString().trim();
      if (!radicado) {
        this.messageService.add({
          severity: 'warn',
      summary: 'Solicitud',
          detail: resp.mensaje ?? 'La solicitud fue procesada pero no se recibió número de radicado.',
        });
        return;
      }
      this.numeroRadicado = radicado;
      this.mensajeFinSemanaFestivo = (resp.mensajeFinSemanaFestivo ?? '').toString().trim();
      this.mostrarConfirmacionRadicado = true;
      this.messageService.add({
        severity: 'success',
        summary: 'Solicitud radicada',
        detail: `Número de radicado: ${radicado}`,
      });
    };

    const onError = (err: { message?: string; error?: string; mensaje?: string }): void => {
      this.procesandoSolicitud = false;
      const msg = err?.message ?? err?.mensaje ?? 'No se pudo guardar la solicitud. Intente de nuevo.';
      const titulo =
        typeof msg === 'string' && msg.toLowerCase().includes('fecha de ingreso')
          ? 'Fecha de ingreso inválida'
          : (err?.error ?? 'Error al guardar');
      this.messageService.add({ severity: 'error', summary: titulo, detail: msg });
    };

    if (listaArchivos.length === 0) {
      const request = this.construirRequestGuardarSolicitud(idEmpresa, []);
      if (!request) {
        this.procesandoSolicitud = false;
        return;
      }
      this.afiliacionInterna
        .guardarSolicitudEnWs(idEmpresa, request)
        .pipe(finalize(() => (this.procesandoSolicitud = false)))
        .subscribe({
          next: data => this.manejarRespuestaGuardarSolicitud(data, onSuccess, onError),
          error: onError,
        });
      return;
    }

    const adjuntosMeta: AdjuntoGuardarSolicitudInterna[] = listaArchivos.map(item => ({
      idTipoAdjunto: item.idTipoAdjunto,
      nombreArchivo: item.nombreArchivo,
      consecutivoPersona: item.consecutivoPersona,
    }));
    const request = this.construirRequestGuardarSolicitud(idEmpresa, adjuntosMeta);
    if (!request) {
      this.procesandoSolicitud = false;
      return;
    }
    const formData = this.construirFormDataGuardarSolicitud(request, listaArchivos);
    this.afiliacionInterna
      .guardarSolicitudMultipartEnWs(idEmpresa, formData)
      .pipe(finalize(() => (this.procesandoSolicitud = false)))
      .subscribe({
        next: data => this.manejarRespuestaGuardarSolicitud(data, onSuccess, onError),
        error: onError,
      });
  }

  private construirFormDataGuardarSolicitud(
    request: GuardarSolicitudRequestInterna,
    listaArchivos: ItemArchivoParaSubir[]
  ): FormData {
    const formData = new FormData();
    formData.append(
      'solicitud',
      new Blob([JSON.stringify(request)], { type: 'application/json' })
    );
    listaArchivos.forEach(item => {
      formData.append('adjuntos', item.file, item.nombreArchivo);
    });
    return formData;
  }

  private manejarRespuestaGuardarSolicitud(
    data: GuardarSolicitudResponseInterna,
    onSuccess: (resp: GuardarSolicitudResponseInterna) => void,
    onError: (err: { message?: string; error?: string; mensaje?: string }) => void
  ): void {
    if (data.success === false) {
      onError({
        error: data.error,
        message: data.message ?? data.mensaje ?? 'Error al guardar la solicitud.',
      });
      return;
    }
    onSuccess(data);
  }

  seleccionarOpcionBeneficiarios(opcion: 'si' | 'no'): void {
    this.opcionBeneficiarios = opcion;
    if (opcion === 'no') {
      this.beneficiariosAgregados = this.beneficiariosAgregados.filter(b => !b.esPrecargado);
      this.regresarFormularioPersonaACargo();
      this.ejecutarGuardarSolicitud();
    }
  }

  get tiposDocumentoParaBeneficiarios(): { label: string; value: string }[] {
    const list = this.tiposDocumentoPersona?.length
      ? this.tiposDocumentoPersona
      : TIPOS_DOC_BENEFICIARIO_FALLBACK;
    return list.length ? list : TIPOS_DOC_BENEFICIARIO_FALLBACK;
  }

  get fPersonaACargo(): { [key: string]: AbstractControl } {
    return this.formularioPersonaACargo?.controls ?? {};
  }

  get formularioPersonaACargoPaso1Valido(): boolean {
    const g = this.formularioPersonaACargo;
    if (!g) {
      return false;
    }
    const parentesco = g.get('parentesco')?.value;
    const tipoDocumento = (g.get('tipoDocumento')?.value ?? '').toString().trim();
    const controlNum = g.get('numeroDocumento');
    const valorNum = (controlNum?.value ?? '').toString().trim();
    return parentesco != null && tipoDocumento.length > 0 && valorNum.length > 0 && (controlNum?.valid ?? false);
  }

  get mostrarCampoPersonaDiscapacidad(): boolean {
    return !this.esParentescoConyugeBeneficiarioActual();
  }

  get beneficiariosVisiblesConIndice(): { persona: PersonaACargoInterna; indexReal: number }[] {
    return this.beneficiariosAgregados.map((p, i) => ({ persona: p, indexReal: i }));
  }

  get beneficiariosVisiblesPaginados(): { persona: PersonaACargoInterna; indexReal: number }[] {
    const lista = this.beneficiariosVisiblesConIndice;
    const start = (this.paginaBeneficiariosActual - 1) * this.tamanioPaginaBeneficiarios;
    return lista.slice(start, start + this.tamanioPaginaBeneficiarios);
  }

  get totalPaginasBeneficiarios(): number {
    const total = this.beneficiariosVisiblesConIndice.length;
    return total === 0 ? 0 : Math.ceil(total / this.tamanioPaginaBeneficiarios);
  }

  get paginasBeneficiariosArray(): number[] {
    return Array.from({ length: this.totalPaginasBeneficiarios }, (_, i) => i + 1);
  }

  getNombreParentesco(id: string | number | null | undefined): string {
    if (id == null || id === '') {
      return '';
    }
    const p = this.parentescos.find(x => String(x.id) === String(id));
    return p?.nombre ?? String(id);
  }

  getTooltipParentesco(parentescoId: string | number | null | undefined): string {
    const p = this.parentescos.find(x => String(x.id) === String(parentescoId));
    return p?.documentosRequeridos ? `Debe adjuntar: ${p.documentosRequeridos}` : '';
  }

  nombrePersonaACargo(persona: PersonaACargoInterna): string {
    const d = persona.datosPrecargados;
    if (d?.primerNombre || d?.primerApellido) {
      return [d.primerNombre, d.segundoNombre, d.primerApellido, d.segundoApellido]
        .filter(Boolean)
        .join(' ')
        .trim();
    }
    return `${persona.tipoDocumento} ${persona.numeroDocumento}`;
  }

  enviarFormularioPersonaACargo(event: Event): void {
    event.preventDefault();
    if (this.identificacionBeneficiarioBloqueada || this.validandoBeneficiario) {
      return;
    }
    if (!this.datosPersonaACargoValidada || this.errorValidacionBeneficiario) {
      this.validarBeneficiario();
    }
  }

  validarBeneficiario(): void {
    this.formularioPersonaACargo.get('parentesco')?.markAsTouched();
    this.formularioPersonaACargo.get('tipoDocumento')?.markAsTouched();
    this.formularioPersonaACargo.get('numeroDocumento')?.markAsTouched();
    if (!this.formularioPersonaACargoPaso1Valido) {
      return;
    }

    const parentescoId = (this.formularioPersonaACargo.get('parentesco')?.value ?? '').toString();
    const opcionParentesco = this.parentescos.find(p => String(p.id) === String(parentescoId));
    const categoriaExclusiva = resolverCategoriaParentescoExclusivo(
      opcionParentesco?.parentescoGenesys,
      opcionParentesco?.nombre
    );
    if (categoriaExclusiva != null) {
      const ocupados = cuentaParentescoExclusivoEnLista(
        this.beneficiariosAgregados,
        this.parentescos,
        categoriaExclusiva,
        this.indiceBeneficiarioEditando
      );
      if (ocupados >= 1) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Parentesco',
          detail: mensajeParentescoExclusivoDuplicado(categoriaExclusiva),
        });
        return;
      }
    }

    const tipoDocumento = (this.formularioPersonaACargo.get('tipoDocumento')?.value ?? '').toString().trim();
    const numeroDocumento = (this.formularioPersonaACargo.get('numeroDocumento')?.value ?? '').toString().trim();
    if (
      existeBeneficiarioDuplicadoPorDocumentoEnLista(
        this.beneficiariosAgregados,
        tipoDocumento,
        numeroDocumento,
        this.indiceBeneficiarioEditando
      )
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Beneficiario duplicado',
        detail:
          'Esta persona ya se encuentra agregada en el listado de beneficiarios (mismo tipo y número de documento).',
      });
      return;
    }

    const idEmpresa = this.esFlujoBeneficiarioTrabajadorActivoInterno
      ? this.idEmpresaBeneficiarioInterna
      : this.idEmpresaAfiliacionInterna;
    if (idEmpresa == null) {
      this.messageService.add({
        severity: 'error',
        summary: 'Datos de empresa',
        detail: 'No se encontró la empresa asociada. Vuelva a validar la empresa.',
      });
      return;
    }

    const tipoDocumentoTrabajador = this.esFlujoBeneficiarioTrabajadorActivoInterno
      ? (this.trabajadorActivoBeneficiario?.tipoDocumento ?? '').toString().trim()
      : this.obtenerTipoDocumentoPersonalParaValidacion();
    const numeroDocumentoTrabajador = this.esFlujoBeneficiarioTrabajadorActivoInterno
      ? (this.trabajadorActivoBeneficiario?.numeroDocumento ?? '').toString().trim()
      : (
          this.solicitudPersonalForm.get('numero_documento')?.value ??
          this.identificacionTrabajadorForm.get('numero_documento')?.value ??
          ''
        )
          .toString()
          .trim();
    const tipoBeneficiario = opcionParentesco?.parentescoGenesys ?? null;

    if (this.esCodigoParentescoConyuge(tipoBeneficiario) && this.esMenorDeEdad()) {
      this.errorValidacionBeneficiario = '';
      this.validacionesBeneficiario = [];
      this.datosPersonaACargoValidada = null;
      this.datosBeneficiario = null;
      this.ultimoDatosFormularioValidacionBeneficiario = null;
      this.messageService.add({
        severity: 'error',
        summary: 'Validación de beneficiario',
        detail: 'No es posible afiliar a un cónyuge cuando el trabajador principal es menor de edad.',
      });
      return;
    }

    this.errorValidacionBeneficiario = '';
    this.datosPersonaACargoValidada = null;
    this.validacionesBeneficiario = [];
    this.datosBeneficiario = null;
    this.ultimoDatosFormularioValidacionBeneficiario = null;
    this.validandoBeneficiario = true;

    this.afiliacionInterna
      .validarBeneficiario({
        tipoDocumento,
        numeroDocumento,
        idEmpresa,
        tipoDocumentoTrabajador,
        numeroDocumentoTrabajador,
        tipoBeneficiario,
        beneficiariosGrupoBorrador: this.construirBeneficiariosGrupoBorradorParaValidar(
          tipoDocumento,
          numeroDocumento
        ),
      })
      .pipe(finalize(() => (this.validandoBeneficiario = false)))
      .subscribe({
        next: res => {
          if (res.code !== 200 || !res.data) {
            this.messageService.add({
              severity: 'error',
              summary: 'Validación de beneficiario',
              detail: res.message || 'No se pudo validar al beneficiario.',
            });
            return;
          }
          const data = res.data;
          if (data.success === false) {
            this.messageService.add({
              severity: 'error',
              summary: 'Validación de beneficiario',
              detail: data.message ?? data.mensaje ?? 'Error al validar el beneficiario.',
            });
            return;
          }

          this.validacionesBeneficiario = (data.validaciones ?? []).map(v => ({
            passed: v.paso,
            message: v.nombreParaMostrar ?? v.mensaje ?? v.nombre ?? '',
            name: v.nombre ?? '',
          }));

          if (!data.puedeContinuar) {
            this.bloquearIdentificacionBeneficiario();
            const fallida = data.validaciones?.find(v => !v.paso);
            const mensajeBloqueo =
              fallida?.mensaje ?? 'No es posible continuar con la afiliación de este beneficiario.';
            this.errorValidacionBeneficiario = mensajeBloqueo;
            const partes = (data.validaciones ?? [])
              .filter(v => !v.paso)
              .map(v => (v.mensaje ?? v.nombreParaMostrar ?? v.nombre ?? '').trim())
              .filter(Boolean);
            this.messageService.add({
              severity: 'warn',
              summary: this.tituloModalValidacionBeneficiario(fallida),
              detail: partes.length > 0 ? partes.join(' ') : mensajeBloqueo,
            });
            return;
          }

          const datosFormulario = data.datosFormulario;
          this.ultimoDatosFormularioValidacionBeneficiario = datosFormulario ?? null;
          const personalInfo = datosFormulario?.personalInfo;
          this.datosBeneficiario = datosFormulario?.datosBeneficiario ?? null;
          this.datosGenesysDisponiblesBeneficiario = personalInfo?.datosGenesysDisponibles === true;
          this.archivosSoporteDiscapacidadPersonaACargo = [];

          if (personalInfo) {
            this.datosPersonaACargoValidada = {
              tipoDocumento: String(personalInfo.tipoDocumento ?? personalInfo.tipo_documento ?? tipoDocumento),
              numeroDocumento: String(personalInfo.numeroDocumento ?? personalInfo.numero_documento ?? numeroDocumento),
              primerNombre: personalInfo.primerNombre ?? personalInfo.primer_nombre ?? undefined,
              segundoNombre: personalInfo.segundoNombre ?? personalInfo.segundo_nombre ?? undefined,
              primerApellido: personalInfo.primerApellido ?? personalInfo.primer_apellido ?? undefined,
              segundoApellido: personalInfo.segundoApellido ?? personalInfo.segundo_apellido ?? undefined,
              fechaNacimiento: this.normalizarIsoFecha(
                String(personalInfo.fechaNacimiento ?? personalInfo.fecha_nacimiento ?? '')
              ) || undefined,
              fechaExpedicion: this.normalizarIsoFecha(
                String(personalInfo.fechaExpedicion ?? personalInfo.fecha_expedicion_doc ?? '')
              ) || undefined,
              genero: personalInfo.genero ?? undefined,
            };
            this.formularioPersonaACargo.patchValue({
              parentesco: parentescoId,
              tipoDocumento: personalInfo.tipoDocumento ?? personalInfo.tipo_documento ?? tipoDocumento,
              numeroDocumento: personalInfo.numeroDocumento ?? personalInfo.numero_documento ?? numeroDocumento,
              primerNombre: personalInfo.primerNombre ?? personalInfo.primer_nombre ?? '',
              segundoNombre: personalInfo.segundoNombre ?? personalInfo.segundo_nombre ?? '',
              primerApellido: personalInfo.primerApellido ?? personalInfo.primer_apellido ?? '',
              segundoApellido: personalInfo.segundoApellido ?? personalInfo.segundo_apellido ?? '',
              fechaNacimiento: this.parseFechaString(
                personalInfo.fechaNacimiento ?? personalInfo.fecha_nacimiento
              ),
              fechaExpedicion: this.parseFechaString(
                personalInfo.fechaExpedicion ?? personalInfo.fecha_expedicion_doc
              ),
              genero: personalInfo.genero ?? null,
            });
            this.aplicarCamposVisiblesPersonaACargo(personalInfo.camposVisibles ?? {});
            const personaDisc = this.datosBeneficiario?.['personaConDiscapacidad'];
            if (personaDisc != null) {
              this.formularioPersonaACargo.patchValue({ personaDiscapacidad: personaDisc });
            }
          } else {
            this.datosPersonaACargoValidada = { tipoDocumento, numeroDocumento, primerNombre: '', primerApellido: '' };
            this.formularioPersonaACargo.patchValue({ parentesco: parentescoId, tipoDocumento, numeroDocumento });
          }

          this.aplicarEstadoPersonaDiscapacidadDesdeBackend();
          this.aplicarEstadoGeneroPersonaACargo();

          this.formularioPersonaACargo.get('parentesco')?.disable({ emitEvent: false });
          this.formularioPersonaACargo.get('tipoDocumento')?.disable({ emitEvent: false });
          this.formularioPersonaACargo.get('numeroDocumento')?.disable({ emitEvent: false });
          this.sincronizarFechaExpedicionMinimaBeneficiario(
            this.formularioPersonaACargo.get('fechaNacimiento')?.value
          );
          this.inicializarDocumentosAdjuntosPersonaACargo();
          this.mostrarModalRequisitoPadreMadreDiscapacidadSiAplica();
          this.aplicarPersonaDiscapacidadSiParentescoConyuge();
          this.forzarDireccionCorrespondeTrabajador();
        },
        error: (err: { error?: { message?: string }; message?: string }) => {
          this.errorValidacionBeneficiario =
            err?.error?.message ?? err?.message ?? 'Error al validar el beneficiario. Intente de nuevo.';
          this.messageService.add({
            severity: 'error',
            summary: 'Validación de beneficiario',
            detail: this.errorValidacionBeneficiario,
          });
        },
      });
  }

  confirmarAgregarBeneficiario(): void {
    if (!this.datosPersonaACargoValidada) {
      return;
    }
    this.formularioPersonaACargo.markAllAsTouched();
    if (this.formularioPersonaACargo.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: 'Complete todos los campos obligatorios.',
      });
      return;
    }
    const raw = this.formularioPersonaACargo.getRawValue();
    if (!this.validarFechasNacimientoExpedicionPersonal(raw.fechaNacimiento, raw.fechaExpedicion)) {
      return;
    }
    if (!this.edadCorrespondeATipoDocumento(raw.tipoDocumento, raw.fechaNacimiento)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: MSG_EDAD_NO_CORRESPONDE_TIPO_DOCUMENTO,
      });
      return;
    }

    const parentescoIdAgregar = (this.formularioPersonaACargo.get('parentesco')?.value ?? '').toString();
    const opcionParentesco = this.parentescos.find(p => String(p.id) === String(parentescoIdAgregar));
    const tipoBenefAgregar = opcionParentesco?.parentescoGenesys ?? null;
    const fechaNacBeneficiario = raw.fechaNacimiento;

    if (this.esCodigoParentescoConyuge(tipoBenefAgregar) && this.esMenorDe18DesdeValorFecha(fechaNacBeneficiario)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validación de beneficiario',
        detail: 'No es posible afiliar a un cónyuge menor de edad.',
      });
      return;
    }
    if (
      !this.validarHermanoHuerfanoMayor23ConDiscapacidad(
        tipoBenefAgregar,
        opcionParentesco?.nombre ?? null,
        fechaNacBeneficiario,
        raw.personaDiscapacidad
      )
    ) {
      return;
    }
    if (
      !this.validarPadreMadreMenorUmbralConDiscapacidadNo(
        tipoBenefAgregar,
        opcionParentesco?.nombre ?? null,
        fechaNacBeneficiario,
        raw.personaDiscapacidad
      )
    ) {
      return;
    }

    if (this.mostrarSeccionAdjuntosPersonaACargo()) {
      const faltantes = this.documentosAdjuntosPersonaACargo
        .filter(d => d.esRequerido && d.archivos.length === 0)
        .map(d => d.nombreDocumento);
      if (faltantes.length > 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Documento requerido',
          detail: `Debes adjuntar mínimo un archivo por cada tipo requerido. Faltan: ${faltantes.join(', ')}.`,
        });
        return;
      }
    }
    if (this.requiereSoporteDiscapacidadYFaltaAdjunto()) {
      this.messageService.add({
        severity: 'warn',
        summary: TITULO_MODAL_SOPORTE_DISCAPACIDAD,
        detail: TEXTO_MODAL_SOPORTE_DISCAPACIDAD_PADRE_MADRE,
      });
      return;
    }

    const parentescoNombre =
      this.parentescos.find(p => String(p.id) === String(parentescoIdAgregar))?.nombre ?? parentescoIdAgregar;
    const datosPrecargados: DatosPersonaACargoInterna = {
      tipoDocumento: raw.tipoDocumento,
      numeroDocumento: raw.numeroDocumento,
      primerNombre: raw.primerNombre,
      segundoNombre: raw.segundoNombre,
      primerApellido: raw.primerApellido,
      segundoApellido: raw.segundoApellido,
      fechaNacimiento: valorComoInputDate(raw.fechaNacimiento),
      fechaExpedicion: valorComoInputDate(raw.fechaExpedicion),
      genero: raw.genero,
      personaDiscapacidad: raw.personaDiscapacidad,
      direccionCorrespondeTrabajador: 'Si',
      direccion: raw.direccion,
    };

    const idx = this.indiceBeneficiarioEditando;
    const prev =
      idx != null && idx >= 0 && idx < this.beneficiariosAgregados.length
        ? this.beneficiariosAgregados[idx]
        : undefined;
    const tipoNorm = (raw.tipoDocumento ?? '').toString().trim();
    const numNorm = (raw.numeroDocumento ?? '').toString().trim();
    const yaExiste = this.beneficiariosAgregados.some((b, i) => {
      if (idx != null && i === idx) {
        return false;
      }
    return (
        (b.tipoDocumento ?? '').toString().trim() === tipoNorm &&
        (b.numeroDocumento ?? '').toString().trim() === numNorm
      );
    });
    if (yaExiste) {
      this.messageService.add({
        severity: 'info',
        summary: 'Beneficiario ya agregado',
        detail: 'La persona con este tipo y número de documento ya se encuentra agregada como beneficiario.',
      });
      return;
    }

    const item: PersonaACargoInterna = {
      parentesco: parentescoNombre,
      tipoDocumento: raw.tipoDocumento,
      numeroDocumento: raw.numeroDocumento,
      datosPrecargados,
      datosBeneficiario: this.datosBeneficiario ?? prev?.datosBeneficiario ?? undefined,
      validacionBeneficiario:
        this.clonarSnapshotDesdeValidacionBeneficiario(this.ultimoDatosFormularioValidacionBeneficiario) ??
        prev?.validacionBeneficiario,
      documentosAdjuntos: this.documentosAdjuntosPersonaACargo.map(d => ({
        idTipoAdjunto: d.idTipoAdjunto,
        nombreDocumento: d.nombreDocumento,
        esRequerido: d.esRequerido,
        archivos: [...d.archivos],
      })),
      archivoSoporteDiscapacidad:
        this.archivosSoporteDiscapacidadPersonaACargo.length > 0
          ? [...this.archivosSoporteDiscapacidadPersonaACargo]
          : undefined,
    };

    if (idx != null && idx >= 0 && idx < this.beneficiariosAgregados.length) {
      this.beneficiariosAgregados[idx] = item;
      this.indiceBeneficiarioEditando = null;
    } else {
      this.beneficiariosAgregados.push(item);
    }
    this.regresarFormularioPersonaACargo();
    this.messageService.add({
      severity: 'success',
      summary: 'Beneficiario',
      detail: idx != null ? 'Beneficiario actualizado en el listado.' : 'Beneficiario agregado al listado.',
    });
  }

  editarBeneficiario(index: number): void {
    this.identificacionBeneficiarioBloqueada = false;
    this.errorValidacionBeneficiario = '';
    this.validacionesBeneficiario = [];
    const persona = this.beneficiariosAgregados[index];
    if (!persona?.datosPrecargados) {
      return;
    }
    const d = persona.datosPrecargados;
    const parentescoId = this.parentescos.find(p => p.nombre === persona.parentesco)?.id ?? null;
    this.formularioPersonaACargo.patchValue({
      parentesco: parentescoId,
      tipoDocumento: persona.tipoDocumento,
      numeroDocumento: persona.numeroDocumento,
      primerNombre: d.primerNombre ?? '',
      segundoNombre: d.segundoNombre ?? '',
      primerApellido: d.primerApellido ?? '',
      segundoApellido: d.segundoApellido ?? '',
      fechaNacimiento: this.parseFechaString(d.fechaNacimiento),
      fechaExpedicion: this.parseFechaString(d.fechaExpedicion),
      genero: d.genero ?? null,
      personaDiscapacidad: d.personaDiscapacidad ?? '',
      direccionCorrespondeTrabajador: (d.direccionCorrespondeTrabajador ?? '').toString().trim() || 'Si',
      direccion: d.direccion ?? '',
    });
    this.formularioPersonaACargo.get('parentesco')?.disable({ emitEvent: false });
    this.formularioPersonaACargo.get('tipoDocumento')?.disable({ emitEvent: false });
    this.formularioPersonaACargo.get('numeroDocumento')?.disable({ emitEvent: false });
    ['genero', 'personaDiscapacidad', 'direccion'].forEach(name => {
      this.formularioPersonaACargo.get(name)?.enable({ emitEvent: false });
    });
    this.forzarDireccionCorrespondeTrabajador();
    this.datosPersonaACargoValidada = {
      ...d,
      tipoDocumento: persona.tipoDocumento,
      numeroDocumento: persona.numeroDocumento,
    };
    this.datosBeneficiario = persona.datosBeneficiario ?? null;
    const snap = persona.validacionBeneficiario;
    this.ultimoDatosFormularioValidacionBeneficiario = snap
      ? {
          personalInfo: snap.personalInfo ?? null,
          form007Data: snap.form007Data ?? null,
          direccionCalculada: snap.direccionCalculada ?? null,
          datosBeneficiario: persona.datosBeneficiario ?? null,
        }
      : null;
    this.datosGenesysDisponiblesBeneficiario = snap?.personalInfo?.datosGenesysDisponibles === true;
    this.indiceBeneficiarioEditando = index;
    if (snap?.personalInfo?.camposVisibles) {
      this.aplicarCamposVisiblesPersonaACargo(snap.personalInfo.camposVisibles);
    } else {
      this.aplicarEstadoGeneroPersonaACargo();
    }
    this.inicializarDocumentosAdjuntosPersonaACargo();
    if (persona.documentosAdjuntos?.length) {
      const porTipo = new Map<number, DocumentoAdjuntoBeneficiarioCai>();
      this.documentosAdjuntosPersonaACargo.forEach(dAdj => porTipo.set(dAdj.idTipoAdjunto, dAdj));
      persona.documentosAdjuntos.forEach(saved => {
        const item = porTipo.get(saved.idTipoAdjunto);
        if (item) {
          item.archivos = [...(saved.archivos ?? [])].slice(0, 3);
        }
      });
    }
    this.archivosSoporteDiscapacidadPersonaACargo = archivosSoporteDiscapacidadDesdePersona(
      persona.archivoSoporteDiscapacidad
    );
    this.caracteresDireccionPersonaACargo = (d.direccion ?? '').length;
    this.aplicarValidadoresDireccionPersonaACargo();
    this.aplicarEstadoPersonaDiscapacidadDesdeBackend();
    this.aplicarPersonaDiscapacidadSiParentescoConyuge();
    this.sincronizarFechaExpedicionMinimaBeneficiario(this.formularioPersonaACargo.get('fechaNacimiento')?.value);
    this.scrollAlFormularioBeneficiarioInterno();
  }

  eliminarBeneficiario(index: number): void {
    const persona = this.beneficiariosAgregados[index];
    if (persona?.esPrecargado) {
      return;
    }
    this.mostrarConfirmacionBeneficiario(
      'Eliminar beneficiario',
      '¿Está seguro de eliminar este beneficiario de la lista?',
      () => this.ejecutarEliminarBeneficiario(index)
    );
  }

  private ejecutarEliminarBeneficiario(index: number): void {
    this.beneficiariosAgregados.splice(index, 1);
    if (this.indiceBeneficiarioEditando === index) {
      this.regresarFormularioPersonaACargo();
    } else if (this.indiceBeneficiarioEditando != null && this.indiceBeneficiarioEditando > index) {
      this.indiceBeneficiarioEditando = this.indiceBeneficiarioEditando - 1;
    }
    const totalPaginas = this.totalPaginasBeneficiarios;
    if (totalPaginas > 0 && this.paginaBeneficiariosActual > totalPaginas) {
      this.paginaBeneficiariosActual = totalPaginas;
    }
  }

  cancelarEdicionBeneficiario(): void {
    this.regresarFormularioPersonaACargo();
  }

  cancelarRegistroBeneficiario(): void {
    this.mostrarConfirmacionBeneficiario(
      'Cancelar registro',
      '¿Estás seguro de que quieres cancelar? Los datos ingresados se perderán y tendrás que empezar de nuevo.',
      () => this.regresarFormularioPersonaACargo()
    );
  }

  limpiarIdentificacionBeneficiario(): void {
    this.desbloquearIdentificacionBeneficiario();
    this.validacionesBeneficiario = [];
    this.errorValidacionBeneficiario = '';
    this.datosPersonaACargoValidada = null;
    this.formularioPersonaACargo.patchValue({
      parentesco: null,
      tipoDocumento: '',
      numeroDocumento: '',
    });
    this.formularioPersonaACargo.get('parentesco')?.enable({ emitEvent: false });
    this.formularioPersonaACargo.get('tipoDocumento')?.enable({ emitEvent: false });
    this.formularioPersonaACargo.get('numeroDocumento')?.enable({ emitEvent: false });
  }

  get beneficiariosPrecargadosVista(): BeneficiarioPrecargadoVista[] {
    return (this.beneficiariosPrecargarGuardar ?? []).map(b => ({
      parentesco: String(b.parentesco ?? '').trim() || '—',
      tipoDocumento: String(b.tipoDocumento ?? b.tipoDoc ?? '').trim() || '—',
      numeroDocumento: String(b.documento ?? '').trim() || '—',
      nombreCompleto: [b.primerNombre, b.segundoNombre, b.primerApellido, b.segundoApellido]
        .map(x => String(x ?? '').trim())
        .filter(Boolean)
        .join(' ') || '—',
      esPrecargado: true,
    }));
  }

  get opcionesParentescoBeneficiario(): { label: string; value: number }[] {
    return this.parentescos.map(p => ({ label: p.nombre, value: p.id }));
  }

  debeMostrarPermisoTrabajo(): boolean {
    return this.requierePermisoLaboral || (this.esTipoDocumentoTI() && this.esMenorDeEdad());
  }

  esTipoDocumentoTI(): boolean {
    const tipo = (
      this.solicitudPersonalForm.get('tipo_documento')?.value ??
      this.identificacionTrabajadorForm.get('tipo_documento')?.value ??
      ''
    )
      .toString()
      .trim()
      .toUpperCase();
    return tipo === 'TI' || tipo === 'T';
  }

  esMenorDeEdad(): boolean {
    if (this.esFlujoBeneficiarioTrabajadorActivoInterno && this.trabajadorActivoBeneficiario?.fechaNacimiento) {
      return this.esMenorDe18DesdeValorFecha(this.trabajadorActivoBeneficiario.fechaNacimiento);
    }
    const fechaNac = this.solicitudPersonalForm.get('fecha_nacimiento')?.value;
    return this.esMenorDe18DesdeValorFecha(fechaNac);
  }

  mostrarSeccionAdjuntosPersonaACargo(): boolean {
    if (this.obtenerAdjuntosNecesariosParentescoActual().length > 0) {
      return true;
    }
    const db = this.datosBeneficiario;
    return !!(db?.requiereAdjuntoRegistroCivil || db?.requiereAdjuntoDocumentoSoporte);
  }

  mensajeAdjuntosRequeridosPersonaACargo(): string {
    const partes: string[] = [];
    this.obtenerAdjuntosNecesariosParentescoActual().forEach(d => {
      if (d.nombreDocumento && !partes.includes(d.nombreDocumento)) {
        partes.push(d.nombreDocumento);
      }
    });
    if (this.datosBeneficiario?.requiereAdjuntoRegistroCivil && !partes.some(p => /registro\s*civil/i.test(p))) {
      partes.push('Registro civil');
    }
    if (
      this.datosBeneficiario?.requiereAdjuntoDocumentoSoporte &&
      !partes.some(p => /soporte|documento\s*soporte/i.test(p))
    ) {
      partes.push('Documento soporte');
    }
    return partes.join(', ');
  }

  cumpleAdjuntosMinimosPersonaACargo(): boolean {
    const requeridos = this.documentosAdjuntosPersonaACargo.filter(d => d.esRequerido);
    if (requeridos.length === 0) {
      return true;
    }
    return requeridos.every(d => d.archivos.length > 0);
  }

  requiereSoporteDiscapacidadYFaltaAdjunto(): boolean {
    if (this.esParentescoConyugeBeneficiarioActual()) {
      return false;
    }
    const db = this.datosBeneficiario;
    const personaDisc = this.formularioPersonaACargo?.get('personaDiscapacidad')?.value;
    const controlDisc = this.formularioPersonaACargo?.get('personaDiscapacidad');
    const exigeBack = db?.requiereSoporteDiscapacidad === true || db?.obligarPersonaDiscapacidadSi === true;
    const usuarioMarcoSi = personaDisc === 'Si' && controlDisc?.enabled;
    const debeAdjuntar = exigeBack || usuarioMarcoSi;
    return !!debeAdjuntar && this.archivosSoporteDiscapacidadPersonaACargo.length === 0;
  }

  get textoAlertaPadreMadreDiscapacidad(): string {
    const n = this.datosBeneficiario?.edadMinimaRequeridaPadreMadre;
    const anios = n != null && n > 0 ? String(n) : '60';
    return (
      `Para afiliar como padre o madre menor de ${anios} años es obligatorio indicar persona con discapacidad en Sí y ` +
      'adjuntar el documento soporte. Sin cumplir estos requisitos no es posible continuar.'
    );
  }

  getTooltipSoporteDiscapacidad(): string {
    return TEXTO_MODAL_SOPORTE_DISCAPACIDAD_PADRE_MADRE;
  }

  totalArchivosPorTipoPersonaACargo(tipoAdjuntoId: number): number {
    const item = this.documentosAdjuntosPersonaACargo.find(d => d.idTipoAdjunto === tipoAdjuntoId);
    return item?.archivos.length ?? 0;
  }

  puedeAgregarArchivoPorTipoPersonaACargo(tipoAdjuntoId: number): boolean {
    return this.totalArchivosPorTipoPersonaACargo(tipoAdjuntoId) < this.maxArchivosPorTipoAdjunto;
  }

  puedeAgregarArchivoSoporteDiscapacidadPersonaACargo(): boolean {
    return this.archivosSoporteDiscapacidadPersonaACargo.length < this.maxArchivosPorTipoAdjunto;
  }

  actualizarContadorDireccionPersonaACargo(): void {
    const v = this.formularioPersonaACargo?.get('direccion')?.value ?? '';
    this.caracteresDireccionPersonaACargo = String(v).length;
  }

  seleccionarArchivoIdentidad(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.agregarArchivosHasta3(this.archivosIdentidad, input.files);
    input.value = '';
  }

  seleccionarArchivoPermiso(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.agregarArchivosHasta3(this.archivosPermisoTrabajo, input.files, true);
    input.value = '';
  }

  onDropArchivosIdentidad(event: DragEvent): void {
    event.preventDefault();
    this.agregarArchivosHasta3(this.archivosIdentidad, event.dataTransfer?.files);
  }

  onDropArchivosPermiso(event: DragEvent): void {
    event.preventDefault();
    this.agregarArchivosHasta3(this.archivosPermisoTrabajo, event.dataTransfer?.files, true);
  }

  eliminarArchivoIdentidad(index: number): void {
    if (index >= 0 && index < this.archivosIdentidad.length) {
      this.archivosIdentidad.splice(index, 1);
    }
  }

  eliminarArchivoPermiso(index: number): void {
    if (index >= 0 && index < this.archivosPermisoTrabajo.length) {
      this.archivosPermisoTrabajo.splice(index, 1);
    }
  }

  seleccionarArchivoPersonaACargo(event: Event, tipoAdjuntoId: number): void {
    const input = event.target as HTMLInputElement;
    const item = this.documentosAdjuntosPersonaACargo.find(d => d.idTipoAdjunto === tipoAdjuntoId);
    if (!item || !input?.files?.length) {
      if (input) {
        input.value = '';
      }
      return;
    }
    this.agregarArchivosAlItem(item.archivos, input.files, item.nombreDocumento);
    input.value = '';
  }

  onDropArchivosPersonaACargo(event: DragEvent, tipoAdjuntoId: number): void {
    event.preventDefault();
    const item = this.documentosAdjuntosPersonaACargo.find(d => d.idTipoAdjunto === tipoAdjuntoId);
    if (!item) {
      return;
    }
    this.agregarArchivosAlItem(item.archivos, event.dataTransfer?.files, item.nombreDocumento);
  }

  eliminarArchivoPersonaACargo(tipoAdjuntoId: number, index: number): void {
    const item = this.documentosAdjuntosPersonaACargo.find(d => d.idTipoAdjunto === tipoAdjuntoId);
    if (item && index >= 0 && index < item.archivos.length) {
      item.archivos.splice(index, 1);
    }
  }

  seleccionarSoporteDiscapacidadPersonaACargo(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.agregarArchivosHasta3(this.archivosSoporteDiscapacidadPersonaACargo, input.files);
    input.value = '';
  }

  onDropSoporteDiscapacidadPersonaACargo(event: DragEvent): void {
    event.preventDefault();
    this.agregarArchivosHasta3(this.archivosSoporteDiscapacidadPersonaACargo, event.dataTransfer?.files);
  }

  eliminarSoporteDiscapacidadPersonaACargo(index: number): void {
    if (index >= 0 && index < this.archivosSoporteDiscapacidadPersonaACargo.length) {
      this.archivosSoporteDiscapacidadPersonaACargo.splice(index, 1);
    }
  }

  abrirSelectorArchivo(elementId: string, event?: Event): void {
    event?.stopPropagation();
    document.getElementById(elementId)?.click();
  }

  private obtenerSeccionesPendientes(): string[] {
    this.solicitudPersonalForm.markAllAsTouched();
    this.solicitudLaboralForm.markAllAsTouched();
    this.solicitudMedioPagoForm.markAllAsTouched();

    const faltantes: string[] = [];
    if (!this.seccionPersonalGuardada) {
      faltantes.push('Información personal');
    } else if (
      !this.esFormularioPersonalCompletoParaAvanzar() ||
      (this.requiereAdjuntoDocumento && this.archivosIdentidad.length === 0)
    ) {
      faltantes.push('Información personal');
    }
    if (!this.seccionLaboralGuardada) {
      faltantes.push('Información laboral');
    } else if (
      !this.solicitudLaboralForm.valid ||
      !this.esFechaIngresoLaboralEnRangoPermitido() ||
      (this.debeMostrarPermisoTrabajo() && this.archivosPermisoTrabajo.length === 0)
    ) {
      faltantes.push('Información laboral');
    }
    if (this.mostrarFormularioMedioPago && !this.seccionPagoGuardada) {
      faltantes.push('Medio de pago');
    } else if (this.requiereDatosBancariosMedioPago() && !this.solicitudMedioPagoForm.valid) {
      faltantes.push('Medio de pago');
    }
    if (this.opcionBeneficiarios == null) {
      faltantes.push('Beneficiarios (seleccione una opción)');
    } else if (this.opcionBeneficiarios === 'si') {
      if (this.beneficiariosAgregados.length === 0) {
        faltantes.push('Beneficiarios (agregue al menos uno)');
      }
    }
    return faltantes;
  }

  private obtenerAdjuntosNecesariosParentescoActual(): {
    id: number;
    nombreDocumento: string;
    esRequerido: boolean;
  }[] {
    const parentescoId = this.formularioPersonaACargo?.get('parentesco')?.value;
    return resolverSlotsAdjuntosBeneficiario(this.datosBeneficiario, this.parentescos, parentescoId);
  }

  private inicializarDocumentosAdjuntosPersonaACargo(): void {
    const requeridos = this.obtenerAdjuntosNecesariosParentescoActual().filter(
      d => d.id !== ID_TIPO_ADJUNTO_SOPORTE_DISCAPACIDAD
    );
    this.documentosAdjuntosPersonaACargo = requeridos.map(d => ({
      idTipoAdjunto: d.id,
      nombreDocumento: d.nombreDocumento,
      esRequerido: d.esRequerido,
      archivos: [],
    }));
  }

  private onParentescoBeneficiarioChange(idParentesco: number | null): void {
    if (idParentesco == null || !this.datosPersonaACargoValidada) {
      return;
    }
    this.cargarAdjuntosPorParentesco(idParentesco, () => {
      if (this.datosPersonaACargoValidada) {
        this.inicializarDocumentosAdjuntosPersonaACargo();
      }
    });
  }

  private cargarParentescos(): void {
    this.cargandoParentescos = true;
    this.users.getParentescoList().subscribe({
      next: (res: BodyResponse<ParametroParentesco[]>) => {
        this.cargandoParentescos = false;
        if (res.code === 200 && Array.isArray(res.data)) {
          this.parentescos = res.data
            .filter(p => p.esta_activo !== false && p.id != null)
            .map(p => {
              const ext = p as ParametroParentesco & { parentesco_genesys?: string | null };
              return {
                id: Number(p.id),
                nombre: (p.parentesco || '').trim(),
                parentescoGenesys: ext.parentesco_genesys ?? null,
                adjuntosNecesarios: [],
              };
            });
        } else {
          this.parentescos = [];
        }
      },
      error: () => {
        this.cargandoParentescos = false;
        this.parentescos = [];
      },
    });
  }

  private cargarAdjuntosPorParentesco(idParentesco: number, onReady?: () => void): void {
    this.users.obtenerAdjuntosPorParentesco(idParentesco).subscribe({
      next: (res: BodyResponse<AdjuntoTipoPorParentesco[]>) => {
        const p = this.parentescos.find(x => x.id === idParentesco);
        if (p && res.code === 200 && Array.isArray(res.data)) {
          p.adjuntosNecesarios = res.data
            .filter(a => a.id != null && (a.nombre_documento || '').trim() !== '')
            .map(a => ({
              id: Number(a.id),
              nombreDocumento: (a.nombre_documento || '').trim(),
              esRequerido: true,
            }));
        }
        onReady?.();
      },
      error: () => onReady?.(),
    });
  }

  private limpiarAdjuntosTrabajador(): void {
    this.archivosIdentidad = [];
    this.archivosPermisoTrabajo = [];
  }

  private limpiarEstadoBeneficiarios(): void {
    this.opcionBeneficiarios = null;
    this.beneficiariosAgregados = [];
    this.datosBeneficiario = null;
    this.regresarFormularioPersonaACargo();
  }

  private regresarFormularioPersonaACargo(): void {
    this.identificacionBeneficiarioBloqueada = false;
    this.datosPersonaACargoValidada = null;
    this.validacionesBeneficiario = [];
    this.datosBeneficiario = null;
    this.ultimoDatosFormularioValidacionBeneficiario = null;
    this.indiceBeneficiarioEditando = null;
    this.mostrarCampoGeneroPersonaACargo = true;
    this.datosGenesysDisponiblesBeneficiario = false;
    this.archivosSoporteDiscapacidadPersonaACargo = [];
    this.errorValidacionBeneficiario = '';
    this.documentosAdjuntosPersonaACargo = [];
    this.caracteresDireccionPersonaACargo = 0;
    this.fechaExpedicionMinimaBeneficiario = null;
    this.reactivarControlesFormularioPersonaACargo();
    this.formularioPersonaACargo.reset({
      parentesco: null,
      tipoDocumento: '',
      numeroDocumento: '',
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      fechaNacimiento: null,
      fechaExpedicion: null,
      genero: null,
      personaDiscapacidad: '',
      direccionCorrespondeTrabajador: 'Si',
      direccion: '',
    });
    this.formularioPersonaACargo.get('parentesco')?.enable({ emitEvent: false });
    this.formularioPersonaACargo.get('tipoDocumento')?.enable({ emitEvent: false });
    this.formularioPersonaACargo.get('numeroDocumento')?.enable({ emitEvent: false });
    this.aplicarValidadoresDireccionPersonaACargo();
    this.forzarDireccionCorrespondeTrabajador();
  }

  private validarArchivoAdjunto(file: File, permitirDocx = false): boolean {
    if (!mimeAdjuntoPermitido(file, permitirDocx)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formato no permitido',
        detail: MENSAJE_TIPO_ADJUNTO_NO_PERMITIDO,
      });
      return false;
    }
    if (file.size <= MAX_TAMANO_ADJUNTO_BYTES) {
      return true;
    }
    this.messageService.add({
      severity: 'warn',
      summary: 'Tamaño máximo superado',
      detail: 'No se permite cargar archivos de más de 4 MB.',
    });
    return false;
  }

  private agregarArchivosHasta3(
    destino: File[],
    files: FileList | null | undefined,
    permitirDocx = false
  ): void {
    if (!files?.length) {
      return;
    }
    let omitidosPorLimite = false;
    for (let i = 0; i < files.length; i++) {
      if (destino.length >= this.maxArchivosPorTipoAdjunto) {
        omitidosPorLimite = true;
        break;
      }
      const file = files.item(i);
      if (!file || !this.validarArchivoAdjunto(file, permitirDocx)) {
        continue;
      }
      destino.push(file);
    }
    if (omitidosPorLimite) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Límite de archivos',
        detail: 'Solo puedes adjuntar hasta 3 archivos. Los archivos adicionales no se incluyeron.',
      });
    }
  }

  private agregarArchivosAlItem(
    destino: File[],
    files: FileList | null | undefined,
    nombreDocumento: string
  ): void {
    if (!files?.length) {
      return;
    }
    let omitidosPorLimite = false;
    for (let i = 0; i < files.length; i++) {
      if (destino.length >= this.maxArchivosPorTipoAdjunto) {
        omitidosPorLimite = true;
        break;
      }
      const file = files.item(i);
      if (!file || !this.validarArchivoAdjunto(file, false)) {
        continue;
      }
      destino.push(file);
    }
    if (omitidosPorLimite) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Límite de archivos',
        detail: `Solo puedes adjuntar hasta 3 archivos para "${nombreDocumento}".`,
      });
    }
  }

  private esMenorDe18DesdeValorFecha(fechaNac: unknown): boolean {
    if (fechaNac == null || fechaNac === '') {
      return false;
    }
    let birth: Date;
    if (fechaNac instanceof Date) {
      birth = fechaNac;
    } else if (typeof fechaNac === 'string') {
      const s = fechaNac.trim();
      if (!s) {
        return false;
      }
      birth = new Date(s);
    } else {
      return false;
    }
    if (isNaN(birth.getTime())) {
      return false;
    }
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age < 18;
  }

  regresarGlobalDesdeSolicitud(): void {
    this.regresarDesdeSolicitudTrabajador();
  }

  get reglasDocumentoEmpresaSeleccionado(): TipoDocumentoConReglas | null {
    const id = this.consultaEmpresaForm.get('tipo_documento')?.value;
    if (id == null) {
      return null;
    }
    const row = this.tiposDocumentoEmpresa.find(t => t.id === id);
    return row ? this.mapReglasDocumentoEmpresa(row) : null;
  }

  get reglasDocumentoTrabajadorSeleccionado(): TipoDocumentoConReglas | null {
    const tipo = this.identificacionTrabajadorForm.get('tipo_documento')?.value;
    if (tipo == null || String(tipo).trim() === '') {
      return null;
    }
    return this.tiposDocumentoPersonaReglas.find(t => t.value === String(tipo).trim()) ?? null;
  }

  get reglasDocumentoEmpresaBeneficiarioSeleccionado(): TipoDocumentoConReglas | null {
    const id = this.consultaEmpresaBeneficiarioForm.get('tipo_documento')?.value;
    if (id == null) {
      return null;
    }
    const row = this.tiposDocumentoEmpresa.find(t => t.id === id);
    return row ? this.mapReglasDocumentoEmpresa(row) : null;
  }

  get reglasDocumentoTrabajadorBeneficiarioSeleccionado(): TipoDocumentoConReglas | null {
    const tipo = this.identificacionTrabajadorBeneficiarioForm.get('tipo_documento')?.value;
    if (tipo == null || String(tipo).trim() === '') {
      return null;
    }
    return this.tiposDocumentoPersonaReglas.find(t => t.value === String(tipo).trim()) ?? null;
  }

  get reglasDocumentoBeneficiarioSeleccionado(): TipoDocumentoConReglas | null {
    const tipo = this.formularioPersonaACargo?.get('tipoDocumento')?.value;
    if (tipo == null || String(tipo).trim() === '') {
      return null;
    }
    return this.tiposDocumentoPersonaReglas.find(t => t.value === String(tipo).trim()) ?? null;
  }

  mensajeErrorNumeroDocumento(control: AbstractControl | null | undefined): string {
    const err = control?.errors;
    if (!err) {
      return '';
    }
    const e =
      err['numeroDocumentoMinimo'] ||
      err['numeroDocumentoMaximo'] ||
      err['numeroDocumentoSoloNumeros'] ||
      err['numeroDocumentoAlfanumerico'] ||
      err['numeroDocumentoMaximoLetras'];
    if (e && typeof e === 'object' && 'message' in e) {
      return (e as { message: string }).message;
    }
    if (err['numeroDocumentoSoloNumeros']) {
      return 'El número de documento solo puede contener dígitos.';
    }
    if (err['numeroDocumentoAlfanumerico']) {
      return 'El número de documento solo puede contener números y letras.';
    }
    return '';
  }

  haySolicitudIniciada(): boolean {
    if (this.mostrarConfirmacionRadicado) {
      return false;
    }
    if (this.step === 3) {
      if (this.pasoBeneficiarioSub === 4) {
        return false;
      }
      if (this.beneficiariosAgregados.length > 0) {
        return true;
      }
      if (this.idEmpresaBeneficiarioInterna != null || this.datosEmpresaBeneficiario != null) {
        return true;
      }
      if (this.trabajadorBeneficiarioValidado || this.trabajadorActivoBeneficiario != null) {
        return true;
      }
      const empTipoB = this.consultaEmpresaBeneficiarioForm.get('tipo_documento')?.value;
      const empNumB = (this.consultaEmpresaBeneficiarioForm.get('numero_documento')?.value ?? '')
        .toString()
        .trim();
      if (empTipoB != null && empNumB !== '') {
        return true;
      }
      const trTipoB = this.identificacionTrabajadorBeneficiarioForm.get('tipo_documento')?.value;
      const trNumB = (this.identificacionTrabajadorBeneficiarioForm.get('numero_documento')?.value ?? '')
        .toString()
        .trim();
      return trTipoB != null && trNumB !== '';
    }
    if (this.documentoTrabajadorValidado || this.step >= 4) {
      return true;
    }
    if (this.datosEmpresa != null || this.idEmpresaAfiliacionInterna != null) {
      return true;
    }
    const empTipo = this.consultaEmpresaForm.get('tipo_documento')?.value;
    const empNum = (this.consultaEmpresaForm.get('numero_documento')?.value ?? '').toString().trim();
    if (empTipo != null && empNum !== '') {
      return true;
    }
    const trTipo = this.identificacionTrabajadorForm.get('tipo_documento')?.value;
    const trNum = (this.identificacionTrabajadorForm.get('numero_documento')?.value ?? '').toString().trim();
    return trTipo != null && trNum !== '';
  }

  private confirmarSalidaSiHayDatos(accion: () => void): void {
    if (!this.haySolicitudIniciada()) {
      accion();
      return;
    }
    this.accionSalirPendiente = accion;
    this.visibleDialogConfirmSalir = true;
  }

  onConfirmSalir(rta: boolean): void {
    this.visibleDialogConfirmSalir = false;
    if (rta && this.accionSalirPendiente) {
      this.accionSalirPendiente();
    }
    this.accionSalirPendiente = null;
  }

  private mapReglasDocumentoPersona(row: DocumentTypePersonList): TipoDocumentoConReglas {
    const value =
      (row.tipo_documento && String(row.tipo_documento).trim()) ||
      (row.tipo_documento_genesys && String(row.tipo_documento_genesys).trim()) ||
      '';
    return {
      value,
      label: (row.tipo_documento || value).trim(),
      digitosMinimos: row.digitos_minimos ?? 1,
      digitosMaximos: row.digitos_maximos ?? 20,
      permiteLetras: row.permite_letras ?? false,
      cantidadLetras: row.cantidad_letras ?? null,
    };
  }

  private mapReglasDocumentoEmpresa(row: DocumentTypeCompanyList): TipoDocumentoConReglas {
    return {
      value: String(row.id ?? ''),
      label: (row.tipo_documento || '').trim(),
      digitosMinimos: row.digitos_minimos ?? 1,
      digitosMaximos: row.digitos_maximos ?? 20,
      permiteLetras: row.permite_letras ?? false,
      cantidadLetras: row.cantidad_letras ?? null,
    };
  }

  /**
   * Si el id de municipio no está en las opciones actuales, quita el valor huérfano.
   */
  private limpiarMunicipioSiNoEstaEnOpciones(): void {
    const c = this.solicitudPersonalForm.get('id_municipio');
    if (!c) {
      return;
    }
    const val = c.value;
    if (val == null || val === '') {
      return;
    }
    const ok = this.opcionesMunicipio.some(o => String(o.value) === String(val));
    if (!ok) {
      c.patchValue(null, { emitEvent: false });
      this.camposPersonalesPrecargados = {
        ...this.camposPersonalesPrecargados,
        id_municipio: false,
      };
    }
  }

  get beneficiariosPrecargarLista(): unknown[] {
    const raw = this.respuestaValidarTrabajador?.datosFormulario?.beneficiariosPrecargar;
    return Array.isArray(raw) ? raw : [];
  }

  get datosBeneficiarioPrecarga(): DatosBeneficiarioAfiliacionInterna | null {
    return this.datosBeneficiario;
  }

  get mostrarFormularioMedioPago(): boolean {
    return this.respuestaValidarTrabajador?.datosFormulario?.medioPago?.mostrarCamposFormulario !== false;
  }

  get puedeAbrirSeccionBeneficiarios(): boolean {
    return this.seccionPagoGuardada || (!this.mostrarFormularioMedioPago && this.seccionLaboralGuardada);
  }

  /**
   * PrimeNG emite cambios al hacer clic en cabeceras; se ignoran salvo el índice autorizado
   * (misma regla que afiliación individual: solo Guardar y continuar / Regresar).
   */
  onAccordionActiveIndexChange(indice: number | number[]): void {
    const next = Array.isArray(indice) ? (indice[0] ?? 0) : indice;
    if (next === this.indiceAcordeonAutorizado) {
      this.accordionActiveIndex = next;
      return;
    }
    setTimeout(() => {
      this.accordionActiveIndex = this.indiceAcordeonAutorizado;
    });
  }

  private resetSeccionesGuardadas(): void {
    this.seccionPersonalGuardada = false;
    this.seccionLaboralGuardada = false;
    this.seccionPagoGuardada = false;
    this.aplicarIndiceAcordeon(0);
  }

  private aplicarIndiceAcordeon(indice: number): void {
    this.indiceAcordeonAutorizado = indice;
    this.accordionActiveIndex = indice;
  }

  requiereDatosBancariosMedioPago(): boolean {
    if (!this.mostrarFormularioMedioPago) {
      return false;
    }
    return esMedioPagoTransferencia(this.solicitudMedioPagoForm.get('medio_pago')?.value);
  }

  get entidadSeleccionadaMedioPago(): EntidadDisponibleAfiliacionInterna | undefined {
    const id = this.solicitudMedioPagoForm.get('id_entidad')?.value;
    if (id == null) {
      return undefined;
    }
    return this.entidadesMedioPagoRef.find(e => Number(e.idEntidad) === Number(id));
  }

  get debeMostrarTipoCuentaMedioPago(): boolean {
    const ent = this.entidadSeleccionadaMedioPago;
    if (!ent) {
      return false;
    }
    if (ent.solicitaTipoCuenta === false) {
      return false;
    }
    return (this.opcionesTipoCuenta?.length ?? 0) > 0;
  }

  get fMedioPago(): { [key: string]: AbstractControl } {
    return this.solicitudMedioPagoForm?.controls ?? {};
  }

  private aplicarValidadoresMedioPagoSegunEstado(): void {
    const esTransferencia = this.requiereDatosBancariosMedioPago();
    const validatorsRequeridos = esTransferencia ? [Validators.required] : [];

    this.solicitudMedioPagoForm.get('id_entidad')?.setValidators(validatorsRequeridos);
    this.solicitudMedioPagoForm.get('numero_cuenta')?.setValidators(validatorsRequeridos);
    this.solicitudMedioPagoForm.get('confirmacion_cuenta')?.setValidators(validatorsRequeridos);

    const requiereTipoCuenta = esTransferencia && this.debeMostrarTipoCuentaMedioPago;
    this.solicitudMedioPagoForm
      .get('tipo_cuenta')
      ?.setValidators(requiereTipoCuenta ? [Validators.required] : []);

    this.solicitudMedioPagoForm.get('llave_breb')?.setValidators([]);
    this.solicitudMedioPagoForm.get('confirmar_llave_breb')?.setValidators([]);

    this.solicitudMedioPagoForm.get('id_entidad')?.updateValueAndValidity({ emitEvent: false });
    this.solicitudMedioPagoForm.get('tipo_cuenta')?.updateValueAndValidity({ emitEvent: false });
    this.solicitudMedioPagoForm.get('numero_cuenta')?.updateValueAndValidity({ emitEvent: false });
    this.solicitudMedioPagoForm.get('confirmacion_cuenta')?.updateValueAndValidity({ emitEvent: false });
    this.solicitudMedioPagoForm.updateValueAndValidity({ emitEvent: false });
  }

  private esFormularioPersonalCompletoParaAvanzar(): boolean {
    const g = this.solicitudPersonalForm;
    return g.valid || g.disabled || g.status === 'DISABLED';
  }

  get fPersonal(): { [key: string]: AbstractControl } {
    return this.solicitudPersonalForm?.controls ?? {};
  }

  get fLaboral(): { [key: string]: AbstractControl } {
    return this.solicitudLaboralForm?.controls ?? {};
  }

  get mensajeRangoFechaIngresoLaboral(): string {
    const partes = ['Fecha de ingreso del trabajador a la empresa.'];
    const max = this.formatearFechaIsoParaMostrar(this.laborFechaIngresoMaximaIso);
    const min = this.formatearFechaIsoParaMostrar(this.laborFechaIngresoMinimaIso);
    if (max) {
      partes.push(`Máximo: ${max}.`);
    }
    if (min) {
      partes.push(`Mínimo: ${min}.`);
    }
    return partes.join(' ');
  }

  bloquearNegativoYExponente(event: KeyboardEvent): void {
    if (['-', 'e', 'E', '+'].includes(event.key)) {
      event.preventDefault();
    }
  }

  private establecerRangoFechaIngresoLaboral(
    fechaMinima: string | null | undefined,
    fechaMaxima: string | null | undefined
  ): void {
    this.laborFechaIngresoMinimaIso = this.normalizarIsoFecha(fechaMinima);
    this.laborFechaIngresoMaximaIso = this.normalizarIsoFecha(fechaMaxima);

    const minDate = this.laborFechaIngresoMinimaIso
      ? parseFechaInputDate(this.laborFechaIngresoMinimaIso)
      : null;
    const maxDate = this.laborFechaIngresoMaximaIso
      ? parseFechaInputDate(this.laborFechaIngresoMaximaIso)
      : null;

    this.laborFechaIngresoMin = minDate ? crearFechaInicioDiaCalendario(minDate) : null;
    this.laborFechaIngresoMax = maxDate ? crearFechaFinDiaCalendario(maxDate) : null;
  }

  private normalizarIsoFecha(valor: string | null | undefined): string {
    const s = (valor ?? '').toString().trim();
    return s.length >= 10 ? s.substring(0, 10) : '';
  }

  private formatearFechaIsoParaMostrar(iso: string): string {
    if (!iso || iso.length < 10) {
      return '';
    }
    const [anio, mes, dia] = iso.substring(0, 10).split('-');
    if (!anio || !mes || !dia) {
      return '';
    }
    return `${dia}/${mes}/${anio}`;
  }

  esFechaIngresoLaboralEnRangoPermitido(): boolean {
    const raw = this.solicitudLaboralForm.get('fecha_ingreso_empresa')?.value;
    const fecha = valorComoInputDate(raw);
    if (!fecha) {
      return true;
    }
    const min = this.laborFechaIngresoMinimaIso;
    const max = this.laborFechaIngresoMaximaIso;
    if (!min && !max) {
      return true;
    }
    if (min && fecha < min) {
      return false;
    }
    if (max && fecha > max) {
      return false;
    }
    return true;
  }

  private aplicarValidadoresLaborales(): void {
    const horasControl = this.solicitudLaboralForm.get('horas_mes');
    const salarioControl = this.solicitudLaboralForm.get('salario_mensual');
    if (!horasControl || !salarioControl) {
      return;
    }

    horasControl.setValidators([
      Validators.required,
      Validators.min(this.horasLaboralesMin),
      Validators.max(this.horasLaboralesMax),
    ]);

    if (this.salarioMinimoRef != null && !Number.isNaN(this.salarioMinimoRef)) {
      salarioControl.setValidators([Validators.required, Validators.min(this.salarioMinimoRef)]);
    } else {
      salarioControl.setValidators([Validators.required, Validators.min(0)]);
    }

    horasControl.updateValueAndValidity({ emitEvent: false });
    salarioControl.updateValueAndValidity({ emitEvent: false });
  }

  private sincronizarFechaExpedicionMinimaPersonal(val: unknown): void {
    if (val instanceof Date && !isNaN(val.getTime())) {
      this.fechaExpedicionMinimaPersonal = crearFechaInicioDiaCalendario(val);
      return;
    }
    this.fechaExpedicionMinimaPersonal = null;
  }

  private obtenerTipoDocumentoPersonalParaValidacion(): string {
    const fromForm = (this.solicitudPersonalForm.get('tipo_documento')?.value ?? '').toString().trim();
    const fromIdent = (this.identificacionTrabajadorForm.get('tipo_documento')?.value ?? '').toString().trim();
    return this.tipoDocPrecargarATipoDocumento(fromForm || fromIdent);
  }

  private edadCumplidaAnios(fechaNac: unknown): number | null {
    if (fechaNac == null || fechaNac === '') {
      return null;
    }
    let birth: Date;
    if (fechaNac instanceof Date) {
      birth = fechaNac;
    } else if (typeof fechaNac === 'string') {
      const s = fechaNac.trim();
      if (!s) {
        return null;
      }
      birth = new Date(s);
    } else {
      return null;
    }
    if (isNaN(birth.getTime())) {
      return null;
    }
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  private validarEdadMinimaTrabajadorAfiliacion(fechaNac: unknown): boolean {
    const edad = this.edadCumplidaAnios(fechaNac);
    if (edad != null && edad < EDAD_MINIMA_TRABAJADOR_AFILIACION) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Edad mínima trabajador',
        detail: MSG_EDAD_MINIMA_TRABAJADOR,
      });
      return false;
    }
    return true;
  }

  private validarFechasNacimientoExpedicionPersonal(fechaNac: unknown, fechaExp: unknown): boolean {
    const resultado = validarFechasNacimientoYExpedicion(fechaNac, fechaExp);
    if (!resultado.valido && resultado.mensaje) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: resultado.mensaje,
      });
      return false;
    }
    return true;
  }

  /**
   * CC: al menos 18 años; TI: entre 7 y 18 años inclusive; RC: menor de 7 años.
   */
  private edadCorrespondeATipoDocumento(tipoDoc: string | null | undefined, fechaNac: unknown): boolean {
    const tipo = this.tipoDocPrecargarATipoDocumento((tipoDoc ?? '').toString());
    if (tipo !== 'CC' && tipo !== 'TI' && tipo !== 'RC') {
      return true;
    }
    const edad = this.edadCumplidaAnios(fechaNac);
    if (edad === null) {
      return true;
    }
    if (tipo === 'CC') {
      return edad >= 18;
    }
    if (tipo === 'TI') {
      return edad >= 7 && edad <= 18;
    }
    if (tipo === 'RC') {
      return edad < 7;
    }
    return true;
  }

  get mensajeInformativoMedioPago(): string {
    return String(this.respuestaValidarTrabajador?.datosFormulario?.medioPago?.mensajeInformativo ?? '').trim();
  }

  private patchSolicitudDesdeRespuesta(resp: ValidarTrabajadorResponse): void {
    this.solicitudPersonalForm.enable({ emitEvent: false });
    const pi = resp.datosFormulario?.personalInfo;
    const pick = (src: PersonalInfoAfiliacionInterna | null | undefined, ...keys: string[]): string | null => {
      if (!src) {
        return null;
      }
      for (const k of keys) {
        const v = src[k];
        if (v !== undefined && v !== null && String(v).trim() !== '') {
          return String(v).trim();
        }
      }
      return null;
    };

    const tipoDocRaw =
      pick(pi, 'tipo_documento', 'tipoDocumento') ??
      String(this.identificacionTrabajadorForm.get('tipo_documento')?.value ?? '');
    const numDoc =
      pick(pi, 'numero_documento', 'numeroDocumento') ??
      String(this.identificacionTrabajadorForm.get('numero_documento')?.value ?? '');

    const tel = pick(pi, 'celular', 'telefono');
    const celularNorm = this.normalizarCelularDesdeApi(tel);
    const correoRaw =
      pick(pi, 'correo', 'correo_electronico', 'correoElectronico') ?? '';
    const correoNorm = this.normalizarCorreoDesdeApi(correoRaw);
    const confirmarCorreoRaw = pick(pi, 'confirmar_correo', 'confirmarCorreo');
    const confirmarCelularRaw = pick(pi, 'confirmar_celular', 'confirmarCelular');

    const patch: Record<string, unknown> = {
      tipo_documento: this.resolverTipoDocumentoParaFormulario(
        tipoDocRaw,
        String(this.identificacionTrabajadorForm.get('tipo_documento')?.value ?? '')
      ),
      numero_documento: numDoc,
      primer_nombre: this.normalizarNombreApellidoPrecarga(pick(pi, 'primer_nombre', 'primerNombre') ?? ''),
      segundo_nombre: this.normalizarNombreApellidoPrecarga(pick(pi, 'segundo_nombre', 'segundoNombre') ?? ''),
      primer_apellido: this.normalizarNombreApellidoPrecarga(pick(pi, 'primer_apellido', 'primerApellido') ?? ''),
      segundo_apellido: this.normalizarNombreApellidoPrecarga(pick(pi, 'segundo_apellido', 'segundoApellido') ?? ''),
      fecha_nacimiento: this.parseFechaString(
        pick(pi, 'fecha_nacimiento', 'fechaNacimiento', 'fecha_nacimiento_str')
      ),
      fecha_expedicion: this.parseFechaString(
        pick(pi, 'fecha_expedicion_doc', 'fechaExpedicion', 'fecha_expedicion')
      ),
      celular: celularNorm,
      confirmar_celular: this.normalizarCelularDesdeApi(confirmarCelularRaw ?? tel),
      correo: correoNorm,
      confirmar_correo: confirmarCorreoRaw
        ? this.normalizarCorreoDesdeApi(confirmarCorreoRaw)
        : correoNorm,
      genero: this.resolverGeneroParaFormulario(pick(pi, 'genero')) || null,
      estado_civil:
        this.resolverEstadoCivilParaFormulario(pick(pi, 'estado_civil', 'estadoCivil')) || null,
      direccion: pick(pi, 'direccion', 'direccion_residencia', 'direccionResidencia') ?? '',
      zona: this.resolverZonaParaFormulario(pick(pi, 'zona')) || null,
      id_departamento: null as number | null,
      id_municipio: null as number | null,
    };

    this.solicitudPersonalForm.patchValue(patch, { emitEvent: false });
    this.sincronizarFechaExpedicionMinimaPersonal(patch['fecha_nacimiento']);
    this.camposPersonalesPrecargados = this.construirCamposPersonalesPrecargados(pi ?? null);
    this.aplicarVisibilidadFormularioPersonal(pi ?? null);
  }

  private patchLaborDesdeRespuesta(resp: ValidarTrabajadorResponse): void {
    const li = resp.datosFormulario?.laborInfo as LaborInfoAfiliacionInterna | null | undefined;
    const pi = resp.datosFormulario?.personalInfo;
    const cargoRaw = pi?.cargoOficio ?? pi?.cargo_oficio;
    const cargoStr =
      cargoRaw != null && String(cargoRaw).trim() !== '' ? String(cargoRaw).trim() : '';

    if (!li) {
      this.laborFechaIngresoMin = null;
      this.laborFechaIngresoMax = null;
      this.laborFechaIngresoMinimaIso = '';
      this.laborFechaIngresoMaximaIso = '';
      this.horasLaboralesMin = 1;
      this.horasLaboralesMax = 240;
      this.salarioMinimoRef = null;
      this.solicitudLaboralForm.patchValue(
        {
          fecha_ingreso_empresa: null,
          horas_mes: null,
          salario_mensual: null,
          cargo_desempenado: cargoStr,
        },
        { emitEvent: false }
      );
      this.reconciliarCargoSiAplica(cargoStr);
      this.aplicarValidadoresLaborales();
      return;
    }

    this.establecerRangoFechaIngresoLaboral(
      li.rangoFechaIngreso?.fechaMinima ?? null,
      li.rangoFechaIngreso?.fechaMaxima ?? null
    );
    this.horasLaboralesMin = li.horasMinimas != null ? Number(li.horasMinimas) : 1;
    this.horasLaboralesMax = li.horasMaximas != null ? Number(li.horasMaximas) : 240;
    this.salarioMinimoRef = li.salarioMinimo != null ? Number(li.salarioMinimo) : null;

    const horasDefault =
      li.horasMaximas != null && !Number.isNaN(Number(li.horasMaximas))
        ? Number(li.horasMaximas)
        : null;
    const salarioVal =
      li.salarioActual != null && !Number.isNaN(Number(li.salarioActual)) ? Number(li.salarioActual) : null;

    this.solicitudLaboralForm.patchValue(
      {
        fecha_ingreso_empresa: null,
        horas_mes: horasDefault,
        salario_mensual: salarioVal,
        cargo_desempenado: cargoStr,
      },
      { emitEvent: false }
    );
    this.reconciliarCargoSiAplica(cargoStr);
    this.aplicarValidadoresLaborales();
  }

  private patchMedioPagoDesdeRespuesta(resp: ValidarTrabajadorResponse): void {
    const mp = resp.datosFormulario?.medioPago as MedioPagoAfiliacionInterna | null | undefined;
    this.entidadesMedioPagoRef = Array.isArray(mp?.entidadesDisponibles) ? mp!.entidadesDisponibles! : [];
    this.opcionesEntidadesPago = this.entidadesMedioPagoRef
      .filter(e => e?.idEntidad != null)
      .map(e => ({
        label: (e.nombreEntidad || '').trim(),
        value: Number(e.idEntidad),
      }));

    if (!mp) {
      this.solicitudMedioPagoForm.reset(
        {
          medio_pago: '',
          id_entidad: null,
          tipo_cuenta: null,
          numero_cuenta: '',
          confirmacion_cuenta: '',
          llave_breb: '',
          confirmar_llave_breb: '',
        },
        { emitEvent: false }
      );
      this.opcionesTipoCuenta = [];
      return;
    }

    if (mp.mostrarCamposFormulario === false) {
      // No se muestran los campos (p. ej. administrador de subsidio con Transferencia ya registrada),
      // pero el medio de pago vigente debe conservarse: solo los datos bancarios quedan vacíos.
      this.solicitudMedioPagoForm.reset(
        {
          medio_pago: (mp.medioPago ?? '').trim(),
          id_entidad: null,
          tipo_cuenta: null,
          numero_cuenta: '',
          confirmacion_cuenta: '',
          llave_breb: '',
          confirmar_llave_breb: '',
        },
        { emitEvent: false }
      );
      this.opcionesTipoCuenta = [];
      return;
    }

    const medioRaw = (mp.medioPago ?? '').trim();
    const medioNormalizado = medioRaw.toLowerCase() === 'efectivo' ? 'Transferencia' : medioRaw;
    this.asegurarOpcionMedioPagoEnCatalogo(medioNormalizado || medioRaw);

    const idBanco = this.resolverIdEntidadDesdeMedioPago(mp);

    const idTipo =
      mp.tipoCuenta != null && String(mp.tipoCuenta).trim() !== '' ? Number(mp.tipoCuenta) : null;

    this.solicitudMedioPagoForm.patchValue(
      {
        medio_pago: medioNormalizado || medioRaw,
        id_entidad: idBanco,
        tipo_cuenta: idTipo != null && !Number.isNaN(idTipo) ? idTipo : null,
        numero_cuenta: mp.numeroCuenta != null ? String(mp.numeroCuenta) : '',
        confirmacion_cuenta: mp.confirmacionCuenta != null ? String(mp.confirmacionCuenta) : '',
        llave_breb: '',
        confirmar_llave_breb: '',
      },
      { emitEvent: false }
    );

    this.actualizarTiposCuentaPorEntidad(idBanco, idTipo != null && !Number.isNaN(idTipo) ? idTipo : null);
    this.aplicarValidadoresMedioPagoSegunEstado();
  }

  private tipoDocPrecargarATipoDocumento(tipoDoc: string): string {
    const t = (tipoDoc ?? '').toString().trim().toUpperCase();
    const map: Record<string, string> = {
      T: 'TI',
      C: 'CC',
      CE: 'CE',
      PA: 'PA',
      RC: 'RC',
      NIT: 'NIT',
      PP: 'PP',
      PE: 'PE',
    };
    return (map[t] ?? t) || 'CC';
  }

  private resolverTipoDocumentoParaFormulario(
    valorApi: string | null | undefined,
    valorIdentificacion?: string
  ): string {
    const fromId = (valorIdentificacion ?? '').trim();
    const raw = (valorApi ?? fromId).trim();
    if (!raw) {
      return fromId;
    }
    const homolog = this.tipoDocPrecargarATipoDocumento(raw);
    const candidates = [raw, homolog, raw.toUpperCase(), homolog.toUpperCase()];
    for (const c of candidates) {
      if (this.tiposDocumentoPersona.some(t => t.value === c)) {
        return c;
      }
    }
    const byLabel = this.tiposDocumentoPersona.find(
      t =>
        t.label.toUpperCase() === homolog.toUpperCase() ||
        t.value.toUpperCase() === homolog.toUpperCase()
    );
    return byLabel?.value ?? homolog;
  }

  private claveGeneroEstadoCivilParaCatalogo(texto: string): string {
    return (texto ?? '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  private resolverGeneroParaFormulario(valorApi: string | null | undefined): string {
    const raw = (valorApi ?? '').toString().trim();
    if (!raw) {
      return '';
    }
    if (this.generosCatalog.length === 0) {
      return raw;
    }
    const exact = this.generosCatalog.find(g => String(g.genero).trim() === raw);
    if (exact) {
      return String(exact.genero);
    }
    const key = this.claveGeneroEstadoCivilParaCatalogo(raw);
    const hit = this.generosCatalog.find(
      g => this.claveGeneroEstadoCivilParaCatalogo(String(g.genero)) === key
    );
    return hit ? String(hit.genero) : '';
  }

  private resolverEstadoCivilParaFormulario(valorApi: string | null | undefined): string {
    const raw = (valorApi ?? '').toString().trim();
    if (!raw) {
      return '';
    }
    if (this.estadosCivilCatalog.length === 0) {
      return raw;
    }
    const exact = this.estadosCivilCatalog.find(e => String(e.estado_civil).trim() === raw);
    if (exact) {
      return String(exact.estado_civil);
    }
    const key = this.claveGeneroEstadoCivilParaCatalogo(raw);
    const hit = this.estadosCivilCatalog.find(
      e => this.claveGeneroEstadoCivilParaCatalogo(String(e.estado_civil)) === key
    );
    return hit ? String(hit.estado_civil) : '';
  }

  private resolverZonaParaFormulario(valorApi: string | null | undefined): string {
    const raw = (valorApi ?? '').toString().trim();
    if (!raw) {
      return '';
    }
    const low = raw.toLowerCase();
    if (low === 'rural') {
      return 'Rural';
    }
    if (low === 'urbana') {
      return 'Urbana';
    }
    return '';
  }

  private normalizarCelularDesdeApi(val: string | null | undefined): string {
    const d = (val ?? '').toString().replace(/\D/g, '');
    if (!d.length) {
      return '';
    }
    return d.length > 10 ? d.slice(-10) : d;
  }

  private normalizarCorreoDesdeApi(val: string | null | undefined): string {
    return (val ?? '').toString().trim().toLowerCase();
  }

  private normalizarNombreApellidoPrecarga(val: string | null | undefined): string {
    let s = (val ?? '').toString().normalize('NFC').trim();
    s = s.replace(/[\u200B-\u200D\uFEFF]/g, '');
    s = s.replace(/\s+/g, ' ');
    return s;
  }

  private idDepartamentoDesdeRegistro(d: DepartmentList): number | null {
    const raw = d.id_departamento ?? d.id;
    if (raw == null) {
      return null;
    }
    const n = Number(raw);
    return Number.isNaN(n) ? null : n;
  }

  private idMunicipioDesdeRegistro(m: MunicipalityList): number | null {
    const raw = m.id_municipio ?? m.id;
    if (raw == null) {
      return null;
    }
    const n = Number(raw);
    return Number.isNaN(n) ? null : n;
  }

  private mapDepartamentosLista(data: DepartmentList[]): { label: string; value: number }[] {
    return data
      .filter(d => d.esta_activo !== false)
      .map(d => {
        const id = this.idDepartamentoDesdeRegistro(d);
        return { label: (d.nombre_departamento || '').trim(), value: id ?? NaN };
      })
      .filter(o => !Number.isNaN(o.value) && o.label !== '');
  }

  private nombresUbicacionCoinciden(a: string, b: string): boolean {
    const norm = (s: string) =>
      s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    return norm(a) === norm(b);
  }

  private resolverIdDepartamentoDesdeTexto(texto: string): number | null {
    const raw = texto.trim();
    if (!raw) {
      return null;
    }
    const asNum = Number(raw);
    if (!Number.isNaN(asNum)) {
      const byId = this.opcionesDepartamento.find(o => o.value === asNum);
      if (byId) {
        return byId.value;
      }
    }
    const hit = this.opcionesDepartamento.find(o => this.nombresUbicacionCoinciden(o.label, raw));
    return hit?.value ?? null;
  }

  private resolverIdMunicipioDesdeTexto(texto: string, pool: MunicipalityList[]): number | null {
    const raw = texto.trim();
    if (!raw) {
      return null;
    }
    const asNum = Number(raw);
    if (!Number.isNaN(asNum)) {
      const byId = pool.find(m => this.idMunicipioDesdeRegistro(m) === asNum);
      if (byId) {
        return this.idMunicipioDesdeRegistro(byId);
      }
    }
    const hit = pool.find(m => this.nombresUbicacionCoinciden(m.nombre_municipio, raw));
    return hit ? this.idMunicipioDesdeRegistro(hit) : null;
  }

  private valorExisteEnListaPersonal(
    campo: 'genero' | 'estado_civil' | 'id_departamento' | 'id_municipio' | 'zona',
    valor: string | number | null | undefined
  ): boolean {
    const s = (x: unknown) => String(x ?? '').trim();
    const v = s(valor);
    if (!v) {
      return false;
    }
    switch (campo) {
      case 'genero':
        return this.generosCatalog.some(
          g =>
            this.claveGeneroEstadoCivilParaCatalogo(String(g.genero)) ===
            this.claveGeneroEstadoCivilParaCatalogo(v)
        );
      case 'estado_civil':
        return this.estadosCivilCatalog.some(
          e =>
            this.claveGeneroEstadoCivilParaCatalogo(String(e.estado_civil)) ===
            this.claveGeneroEstadoCivilParaCatalogo(v)
        );
      case 'id_departamento':
        return this.opcionesDepartamento.some(o => s(o.value) === v);
      case 'id_municipio':
        return this.opcionesMunicipio.some(o => s(o.value) === v);
      case 'zona':
        return ['Rural', 'Urbana'].includes(v) || ['rural', 'urbana'].includes(v.toLowerCase());
      default:
        return false;
    }
  }

  private aplicarUbicacionPersonalDesdeApi(personal: PersonalInfoAfiliacionInterna | null | undefined): void {
    if (!personal) {
      return;
    }
    const pick = (...keys: string[]): string => {
      for (const k of keys) {
        const val = personal[k];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
      return '';
    };
    const deptoNombre =
      pick('departamento_residencia', 'departamento', 'nombre_departamento', 'nombreDepartamento');
    const muniNombre = pick('municipio_residencia', 'municipio', 'ciudad', 'nombre_municipio', 'nombreMunicipio');

    if (!deptoNombre && !muniNombre) {
      return;
    }
    if (this.opcionesDepartamento.length === 0 || this.municipiosCache.length === 0) {
      return;
    }

    let deptId = deptoNombre ? this.resolverIdDepartamentoDesdeTexto(deptoNombre) : null;
    let munId: number | null = null;

    if (muniNombre) {
      const pool =
        deptId != null
          ? this.municipiosCache.filter(m => Number(m.id_departamento) === deptId)
          : this.municipiosCache;
      munId = this.resolverIdMunicipioDesdeTexto(muniNombre, pool);
      if (munId == null) {
        const hit = this.municipiosCache.find(m =>
          this.nombresUbicacionCoinciden(m.nombre_municipio, muniNombre)
        );
        if (hit) {
          munId = this.idMunicipioDesdeRegistro(hit);
          if (deptId == null) {
            deptId = hit.id_departamento;
          }
        }
      }
    }

    if (deptId != null) {
      this.solicitudPersonalForm.patchValue({ id_departamento: deptId }, { emitEvent: false });
      this.cargarMunicipiosPorDepartamento(deptId);
    }
    if (munId != null) {
      this.solicitudPersonalForm.patchValue({ id_municipio: munId }, { emitEvent: false });
    }

    this.camposPersonalesPrecargados = {
      ...this.camposPersonalesPrecargados,
      id_departamento:
        deptId != null && this.valorExisteEnListaPersonal('id_departamento', deptId),
      id_municipio: munId != null && this.valorExisteEnListaPersonal('id_municipio', munId),
    };
    this.aplicarVisibilidadFormularioPersonal(personal);
    this.limpiarMunicipioSiNoEstaEnOpciones();
  }

  private reconciliarPrecargaPersonalSiAplica(): void {
    if (!this.documentoTrabajadorValidado || !this.respuestaValidarTrabajador?.datosFormulario?.personalInfo) {
      return;
    }
    const personal = this.respuestaValidarTrabajador.datosFormulario.personalInfo;
    const generoForm = this.resolverGeneroParaFormulario(personal.genero);
    const estadoForm = this.resolverEstadoCivilParaFormulario(
      personal.estado_civil ?? personal.estadoCivil
    );
    const zonaForm = this.resolverZonaParaFormulario(personal.zona);

    this.solicitudPersonalForm.patchValue(
      {
        genero: generoForm || null,
        estado_civil: estadoForm || null,
        zona: zonaForm || null,
      },
      { emitEvent: false }
    );

    this.camposPersonalesPrecargados = {
      ...this.camposPersonalesPrecargados,
      genero: !!generoForm && this.valorExisteEnListaPersonal('genero', generoForm),
      estado_civil: !!estadoForm && this.valorExisteEnListaPersonal('estado_civil', estadoForm),
      zona: !!zonaForm && this.valorExisteEnListaPersonal('zona', zonaForm),
    };

    this.aplicarUbicacionPersonalDesdeApi(personal);
    this.aplicarVisibilidadFormularioPersonal(personal);
    this.solicitudPersonalForm.updateValueAndValidity({ emitEvent: false });
    this.limpiarMunicipioSiNoEstaEnOpciones();
  }

  private reconciliarCargoSiAplica(cargoStr: string): void {
    const cargo = (cargoStr ?? '').trim();
    if (!cargo) {
      return;
    }
    const exact = this.opcionesCargo.find(o => o.value === cargo);
    if (exact) {
      this.solicitudLaboralForm.patchValue({ cargo_desempenado: exact.value }, { emitEvent: false });
      return;
    }
    const hit = this.opcionesCargo.find(o => o.label.toLowerCase() === cargo.toLowerCase());
    if (hit) {
      this.solicitudLaboralForm.patchValue({ cargo_desempenado: hit.value }, { emitEvent: false });
      return;
    }
    if (!this.opcionesCargo.some(o => o.value === cargo)) {
      this.opcionesCargo = [...this.opcionesCargo, { label: cargo, value: cargo }];
    }
    this.solicitudLaboralForm.patchValue({ cargo_desempenado: cargo }, { emitEvent: false });
  }

  private resolverIdEntidadDesdeMedioPago(mp: MedioPagoAfiliacionInterna): number | null {
    const candidates = [mp.entidadBancaria, mp.banco].filter(
      v => v != null && String(v).trim() !== ''
    );
    for (const raw of candidates) {
      const str = String(raw).trim();
      const asNum = Number(str);
      if (!Number.isNaN(asNum)) {
        const byId = this.entidadesMedioPagoRef.find(e => Number(e.idEntidad) === asNum);
        if (byId?.idEntidad != null) {
          return Number(byId.idEntidad);
        }
      }
      const low = str.toLowerCase();
      const hit = this.entidadesMedioPagoRef.find(e => {
        const nom = String(e.nombreEntidad ?? '')
          .trim()
          .toLowerCase();
        const cod = String((e as Record<string, unknown>)['codigoEntidad'] ?? '')
          .trim()
          .toLowerCase();
        return nom === low || cod === low || nom.includes(low) || low.includes(nom);
      });
      if (hit?.idEntidad != null) {
        return Number(hit.idEntidad);
      }
    }
    return null;
  }

  private asegurarOpcionMedioPagoEnCatalogo(val: string | null | undefined): void {
    const v = (val ?? '').trim();
    if (!v) {
      return;
    }
    if (!this.opcionesMedioPago.some(o => o.value === v)) {
      this.opcionesMedioPago = [...this.opcionesMedioPago, { label: v, value: v }];
    }
  }

  private actualizarTiposCuentaPorEntidad(
    idEntidad: number | null,
    tipoPreferido: number | null = null
  ): void {
    this.solicitudMedioPagoForm.get('tipo_cuenta')?.setValue(null, { emitEvent: false });
    if (idEntidad == null) {
      this.opcionesTipoCuenta = [];
      return;
    }
    const ent = this.entidadesMedioPagoRef.find(e => Number(e.idEntidad) === Number(idEntidad));
    if (!ent?.tiposCuenta?.length) {
      this.opcionesTipoCuenta = [];
      return;
    }
    this.opcionesTipoCuenta = ent.tiposCuenta
      .filter(t => t?.idTipoCuenta != null)
      .map(t => ({
        label: (t.nombreTipoCuenta || '').trim() || 'Tipo de cuenta',
        value: Number(t.idTipoCuenta),
      }));
    if (
      tipoPreferido != null &&
      !Number.isNaN(tipoPreferido) &&
      this.opcionesTipoCuenta.some(o => o.value === tipoPreferido)
    ) {
      this.solicitudMedioPagoForm.get('tipo_cuenta')?.setValue(tipoPreferido, { emitEvent: false });
    }
  }

  private parseFechaString(s: string | null | undefined): Date | null {
    if (s == null || String(s).trim() === '') {
      return null;
    }
    const str = String(s).trim();
    const parsedIso = parseFechaInputDate(str);
    if (parsedIso) {
      return parsedIso;
    }
    const dmY = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmY) {
      const d = +dmY[1];
      const m = +dmY[2] - 1;
      const y = +dmY[3];
      const dt = new Date(y, m, d);
      return isNaN(dt.getTime()) ? null : dt;
    }
    return null;
  }

  private cargarCatalogosParaSolicitud(onReady?: () => void): void {
    if (this.catalogosSolicitudCargados) {
      onReady?.();
      this.reconciliarPrecargaPersonalSiAplica();
      return;
    }

    let pend = 5;
    const done = () => {
      pend--;
      if (pend <= 0) {
        this.catalogosSolicitudCargados = true;
        onReady?.();
        this.reconciliarPrecargaPersonalSiAplica();
      }
    };

    this.users.getGeneroList().subscribe({
      next: (res: BodyResponse<ParametroGenero[]>) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          this.generosCatalog = res.data.filter(g => g.esta_activo !== false);
          this.opcionesGenero = this.generosCatalog.map(g => ({
            label: (g.genero || '').trim(),
            value: (g.genero || '').trim(),
          }));
        }
        done();
      },
      error: () => done(),
    });

    this.users.getEstadoCivilList().subscribe({
      next: (res: BodyResponse<ParametroEstadoCivil[]>) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          this.estadosCivilCatalog = res.data.filter(e => e.esta_activo !== false);
          this.opcionesEstadoCivil = this.estadosCivilCatalog.map(e => ({
            label: (e.estado_civil || '').trim(),
            value: (e.estado_civil || '').trim(),
          }));
        }
        done();
      },
      error: () => done(),
    });

    this.users.getDepartmentList().subscribe({
      next: (out: BodyResponse<DepartmentList[]>) => {
        if (out.code === 200 && Array.isArray(out.data)) {
          this.departamentosCatalog = out.data;
          this.opcionesDepartamento = this.mapDepartamentosLista(out.data);
        }
        done();
      },
      error: () => done(),
    });

    const payloadMuni: Pagination = { page: 1, page_size: 2000 };
    this.users.getMunicipalityListPagination(payloadMuni).subscribe({
      next: (res: BodyResponse<MunicipalityList[]>) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          this.municipiosCache = res.data;
        }
        done();
      },
      error: () => done(),
    });

    const payloadCargo: Pagination = { page: 1, page_size: 2000 };
    this.users.getAfiOccupationListPagination(payloadCargo).subscribe({
      next: (res: BodyResponse<AfiOccupationList[]>) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          this.opcionesCargo = res.data
            .filter(c => {
              const activo = c.estado;
              return activo === true || activo === 1;
            })
            .map(c => {
              const cargo = (c.cargo || '').trim();
              return { label: cargo, value: cargo };
            })
            .filter(o => o.label !== '');
        }
        done();
      },
      error: () => done(),
    });
  }

  private cargarMunicipiosPorDepartamento(idDepartamento: number | null): void {
    if (idDepartamento == null) {
      this.opcionesMunicipio = [];
      return;
    }
    const run = (all: MunicipalityList[]) => {
      const list = all.filter(
        m => Number(m.id_departamento) === idDepartamento && m.esta_activo !== false
      );
      this.opcionesMunicipio = list
        .map(m => {
          const id = this.idMunicipioDesdeRegistro(m);
          return { label: (m.nombre_municipio || '').trim(), value: id ?? NaN };
        })
        .filter(o => !Number.isNaN(o.value) && o.label !== '');
      this.limpiarMunicipioSiNoEstaEnOpciones();
    };
    if (this.municipiosCache.length > 0) {
      run(this.municipiosCache);
      return;
    }
    const payload: Pagination = { page: 1, page_size: 2000 };
    this.users.getMunicipalityListPagination(payload).subscribe({
      next: (res: BodyResponse<MunicipalityList[]>) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          this.municipiosCache = res.data;
          run(res.data);
        }
      },
      error: () => {
        this.opcionesMunicipio = [];
      },
    });
  }

  private mapBeneficiarioPrecargarAPersonaACargo(p: BeneficiarioPrecargarAfiliacionInterna): PersonaACargoInterna {
    const tipoDocumento =
      (p.tipoDocumento ?? '').toString().trim() || this.tipoDocPrecargarATipoDocumento(p.tipoDoc);
    const numeroDocumento = (p.documento ?? '').toString().trim();
    const parentesco = (p.parentesco ?? '').toString().trim() || 'Sin especificar';
    return {
      parentesco,
      tipoDocumento,
      numeroDocumento,
      esPrecargado: true,
      // Preserva el grupo familiar real de Genesys (ej. cónyuge + hijastro agrupados) para no
      // perderlo al validar otros beneficiarios ni al guardar la solicitud.
      datosBeneficiario: p.numeroGrupoFamiliar != null ? { numeroGrupoFamiliar: p.numeroGrupoFamiliar } : undefined,
      datosPrecargados: {
        tipoDocumento,
        numeroDocumento,
        primerNombre: (p.primerNombre ?? '').toString().trim() || undefined,
        segundoNombre: (p.segundoNombre ?? '').toString().trim() || undefined,
        primerApellido: (p.primerApellido ?? '').toString().trim() || undefined,
        segundoApellido: (p.segundoApellido ?? '').toString().trim() || undefined,
        fechaNacimiento: (p.fechaNacimiento ?? '').toString().trim().slice(0, 10) || undefined,
        fechaExpedicion: (p.fechaExpedicionDoc ?? '').toString().trim().slice(0, 10) || undefined,
        genero: (p.genero ?? '').toString().trim() || undefined,
      },
    };
  }

  private construirBeneficiariosGrupoBorradorParaValidar(
    tipoDocActual: string,
    numeroDocActual: string
  ): BeneficiarioGrupoBorradorItem[] {
    const tdA = (tipoDocActual ?? '').toString().trim();
    const ndA = (numeroDocActual ?? '').toString().trim();
    const out: BeneficiarioGrupoBorradorItem[] = [];
    this.beneficiariosAgregados.forEach((b, i) => {
      if (this.indiceBeneficiarioEditando != null && i === this.indiceBeneficiarioEditando) {
        return;
      }
      const td = (b.tipoDocumento ?? '').toString().trim();
      const nd = (b.numeroDocumento ?? '').toString().trim();
      if (td === tdA && nd === ndA) {
        return;
      }
      const n = b.datosBeneficiario?.numeroGrupoFamiliar;
      if (n == null || Number.isNaN(Number(n))) {
        return;
      }
      const tipoBen = this.parentescos.find(p => p.nombre === b.parentesco)?.parentescoGenesys ?? undefined;
      out.push({
        tipoDocumento: td,
        numeroDocumento: nd,
        tipoBeneficiario: tipoBen ?? null,
        numeroGrupoFamiliar: Number(n),
      });
    });
    return out;
  }

  private tituloModalValidacionBeneficiario(
    primeraFallida: ValidacionResultAfiliacionInterna | null | undefined
  ): string {
    if (primeraFallida?.nombre === NOMBRE_VALIDACION_BENEFICIARIO_SOLICITUD_PENDIENTE) {
      return 'Solicitud en trámite';
    }
    return 'Validación de beneficiario';
  }

  private bloquearIdentificacionBeneficiario(): void {
    this.identificacionBeneficiarioBloqueada = true;
    this.formularioPersonaACargo.get('parentesco')?.disable({ emitEvent: false });
    this.formularioPersonaACargo.get('tipoDocumento')?.disable({ emitEvent: false });
    this.formularioPersonaACargo.get('numeroDocumento')?.disable({ emitEvent: false });
  }

  private desbloquearIdentificacionBeneficiario(): void {
    this.identificacionBeneficiarioBloqueada = false;
    this.formularioPersonaACargo.get('parentesco')?.enable({ emitEvent: false });
    this.formularioPersonaACargo.get('tipoDocumento')?.enable({ emitEvent: false });
    this.formularioPersonaACargo.get('numeroDocumento')?.enable({ emitEvent: false });
  }

  private reactivarControlesFormularioPersonaACargo(): void {
    const controles = [
      'parentesco',
      'tipoDocumento',
      'numeroDocumento',
      'primerNombre',
      'segundoNombre',
      'primerApellido',
      'segundoApellido',
      'fechaNacimiento',
      'fechaExpedicion',
      'genero',
      'personaDiscapacidad',
      'direccion',
    ];
    controles.forEach(name => this.formularioPersonaACargo.get(name)?.enable({ emitEvent: false }));
    const disc = this.formularioPersonaACargo.get('personaDiscapacidad');
    if (disc) {
      disc.setValidators(Validators.required);
      disc.updateValueAndValidity({ emitEvent: false });
    }
    this.forzarDireccionCorrespondeTrabajador();
  }

  private aplicarCamposVisiblesPersonaACargo(camposVisibles: Record<string, boolean | undefined>): void {
    const map: Record<string, string> = {
      primerNombre: 'primerNombre',
      segundoNombre: 'segundoNombre',
      primerApellido: 'primerApellido',
      segundoApellido: 'segundoApellido',
      fechaNacimiento: 'fechaNacimiento',
      fechaExpedicion: 'fechaExpedicion',
      genero: 'genero',
    };
    Object.entries(map).forEach(([apiKey, controlName]) => {
      const control = this.formularioPersonaACargo.get(controlName);
      if (control && camposVisibles[apiKey] === false) {
        control.disable({ emitEvent: false });
      } else if (control && controlName !== 'genero') {
        control.enable({ emitEvent: false });
      }
    });
    this.aplicarEstadoGeneroPersonaACargo();
  }

  /** Igual que afiliacion-beneficiarios: si Genesys trae el género, no se exige en pantalla. */
  private aplicarEstadoGeneroPersonaACargo(): void {
    this.mostrarCampoGeneroPersonaACargo = !this.datosGenesysDisponiblesBeneficiario;
    const genero = this.formularioPersonaACargo.get('genero');
    if (!genero) {
      return;
    }
    if (this.datosGenesysDisponiblesBeneficiario) {
      genero.disable({ emitEvent: false });
      return;
    }
    genero.enable({ emitEvent: false });
  }

  /** Reglas de discapacidad del backend (igual afiliacion-beneficiarios). */
  private aplicarEstadoPersonaDiscapacidadDesdeBackend(): void {
    if (this.esParentescoConyugeBeneficiarioActual()) {
      this.aplicarPersonaDiscapacidadSiParentescoConyuge();
      return;
    }
    const control = this.formularioPersonaACargo.get('personaDiscapacidad');
    if (!control) {
      return;
    }
    const db = this.datosBeneficiario;
    if (db?.obligarPersonaDiscapacidadSi === true) {
      control.setValue('Si', { emitEvent: false });
      control.disable({ emitEvent: false });
      return;
    }
    if (db?.requiereSoporteDiscapacidad === true) {
      control.setValue('Si', { emitEvent: false });
      control.disable({ emitEvent: false });
      return;
    }
    const personaDisc = db?.['personaConDiscapacidad'];
    if (personaDisc === 'Si') {
      control.disable({ emitEvent: false });
      return;
    }
    control.enable({ emitEvent: false });
  }

  private mostrarConfirmacionBeneficiario(titulo: string, mensaje: string, onConfirmar: () => void): void {
    this.confirmBeneficiarioTitulo = titulo;
    this.confirmBeneficiarioMensaje = mensaje;
    this.confirmBeneficiarioAccion = onConfirmar;
    this.visibleDialogConfirmBeneficiario = true;
  }

  onConfirmBeneficiario(confirma: boolean): void {
    this.visibleDialogConfirmBeneficiario = false;
    if (confirma && this.confirmBeneficiarioAccion) {
      this.confirmBeneficiarioAccion();
    }
    this.confirmBeneficiarioAccion = null;
  }

  private scrollAlFormularioBeneficiarioInterno(): void {
    setTimeout(() => {
      document.getElementById('caiFormBeneficiarioInterno')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  private aplicarValidadoresDireccionPersonaACargo(): void {
    const corresponde = this.formularioPersonaACargo?.get('direccionCorrespondeTrabajador')?.value;
    const direccion = this.formularioPersonaACargo?.get('direccion');
    if (!direccion) {
      return;
    }
    if (corresponde === 'No') {
      direccion.setValidators([Validators.required, ...validatorsDireccionColombia]);
    } else {
      direccion.setValidators(validatorsDireccionColombiaOpcional);
    }
    direccion.updateValueAndValidity({ emitEvent: false });
  }

  private sincronizarFechaExpedicionMinimaBeneficiario(val: unknown): void {
    if (val instanceof Date && !isNaN(val.getTime())) {
      this.fechaExpedicionMinimaBeneficiario = crearFechaInicioDiaCalendario(val);
      return;
    }
    const parsed = parseFechaInputDate(valorComoInputDate(val));
    this.fechaExpedicionMinimaBeneficiario = parsed ? crearFechaInicioDiaCalendario(parsed) : null;
  }

  private mostrarModalRequisitoPadreMadreDiscapacidadSiAplica(): void {
    if (this.esParentescoConyugeBeneficiarioActual()) {
      return;
    }
    const db = this.datosBeneficiario;
    if (db?.['alertaPadreMadreMenor60'] !== true && db?.obligarPersonaDiscapacidadSi !== true) {
      return;
    }
    setTimeout(() => {
      this.messageService.add({
        severity: 'info',
        summary: 'Requisito obligatorio',
        detail: this.textoAlertaPadreMadreDiscapacidad,
      });
    }, 150);
  }

  private aplicarPersonaDiscapacidadSiParentescoConyuge(): void {
    const control = this.formularioPersonaACargo.get('personaDiscapacidad');
    if (!control || !this.esParentescoConyugeBeneficiarioActual()) {
      return;
    }
    this.archivosSoporteDiscapacidadPersonaACargo = [];
    control.setValue('No', { emitEvent: false });
    control.clearValidators();
    control.disable({ emitEvent: false });
  }

  private esParentescoConyugeBeneficiarioActual(): boolean {
    const parentescoId = (this.formularioPersonaACargo.get('parentesco')?.value ?? '').toString();
    const opt = this.parentescos.find(p => String(p.id) === parentescoId);
    return resolverCategoriaParentescoExclusivo(opt?.parentescoGenesys, opt?.nombre) === 'conyuge';
  }

  private esCodigoParentescoConyuge(tipoBeneficiario: string | null | undefined): boolean {
    const g = this.normalizarTextoPlano(tipoBeneficiario);
    return g === 'CONYUGUE' || g === 'CONYUGE' || g.includes('CONYUG');
  }

  private validarHermanoHuerfanoMayor23ConDiscapacidad(
    parentescoGenesys: string | null | undefined,
    parentescoNombre: string | null | undefined,
    fechaNacimiento: unknown,
    personaDiscapacidad: unknown
  ): boolean {
    if (!this.esParentescoMayor23RequiereDiscapacidadSi(parentescoGenesys, parentescoNombre)) {
      return true;
    }
    const edad = this.edadCumplidaAnios(fechaNacimiento);
    if (edad == null || edad <= 23) {
      return true;
    }
    if (!this.esNoDiscapacidad(personaDiscapacidad)) {
      return true;
    }
    this.messageService.add({
      severity: 'info',
      summary: 'Validación de beneficiario',
      detail:
        'Para este parentesco, si la persona tiene más de 23 años es obligatorio indicar condición de discapacidad en Sí y adjuntar el documento soporte.',
    });
    return false;
  }

  private validarPadreMadreMenorUmbralConDiscapacidadNo(
    parentescoGenesys: string | null | undefined,
    parentescoNombre: string | null | undefined,
    fechaNacimiento: unknown,
    personaDiscapacidad: unknown
  ): boolean {
    if (!this.esParentescoPadreOMadre(parentescoGenesys, parentescoNombre)) {
      return true;
    }
    const edad = this.edadCumplidaAnios(fechaNacimiento);
    const n = this.datosBeneficiario?.edadMinimaRequeridaPadreMadre;
    const umbral = n != null && n > 0 ? n : 60;
    if (edad == null || edad >= umbral) {
      return true;
    }
    if (!this.esNoDiscapacidad(personaDiscapacidad)) {
      return true;
    }
    this.messageService.add({
      severity: 'info',
      summary: 'Validación de beneficiario',
      detail: this.textoAlertaPadreMadreDiscapacidad,
    });
    return false;
  }

  private esParentescoMayor23RequiereDiscapacidadSi(
    parentescoGenesys: string | null | undefined,
    parentescoNombre: string | null | undefined
  ): boolean {
    const g = this.normalizarTextoPlano(parentescoGenesys);
    if (g === 'H' || g === 'HIJO' || g.startsWith('HIJO_') || g === 'I' || g.includes('HIJASTRO')) {
      return true;
    }
    if (g === 'E' || g.includes('HERMANO_HUERFANO')) {
      return true;
    }
    if (g.includes('CUSTODIA') || (g.includes('BENEFICIARIO') && g.includes('CUSTOD'))) {
      return true;
    }
    const n = (parentescoNombre ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return (
      n.includes('hijastro') ||
      n.includes('custodia') ||
      (n.includes('hermano') && (n.includes('huerf') || n.includes('hurfan'))) ||
      ((n.includes('hijo') || n.includes('hija')) && !n.includes('hijastro'))
    );
  }

  private esParentescoPadreOMadre(
    parentescoGenesys: string | null | undefined,
    parentescoNombre: string | null | undefined
  ): boolean {
    const g = this.normalizarTextoPlano(parentescoGenesys);
    if (g === 'PADRE' || g === 'MADRE') {
      return true;
    }
    const n = this.normalizarTextoPlano(parentescoNombre);
    return n === 'PADRE' || n === 'MADRE';
  }

  private esNoDiscapacidad(valor: unknown): boolean {
    const v = this.normalizarTextoPlano(valor);
    return v === 'NO' || v === 'N' || v === 'FALSE' || v === '0';
  }

  private normalizarTextoPlano(valor: unknown): string {
    return (valor == null ? '' : String(valor))
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
  }

  private clonarSnapshotDesdeValidacionBeneficiario(
    df: DatosFormularioAfiliacionInterna | null | undefined
  ): ValidacionBeneficiarioSnapshotInterna | undefined {
    if (!df) {
      return undefined;
    }
    return {
      personalInfo: df.personalInfo ? { ...df.personalInfo } : undefined,
      form007Data: df.form007Data ? { ...df.form007Data } : undefined,
      direccionCalculada: df.direccionCalculada ? { ...df.direccionCalculada } : undefined,
    };
  }

  private archivoABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64 ?? '');
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private construirListaArchivosParaSubir(): ItemArchivoParaSubir[] {
    const lista: ItemArchivoParaSubir[] = [];
    this.archivosIdentidad.forEach(archivo => {
      lista.push({
        file: archivo,
        idTipoAdjunto: ID_TIPO_ADJUNTO_DOCUMENTO_IDENTIDAD,
        consecutivoPersona: 1,
        nombreArchivo: archivo.name,
      });
    });
    this.archivosPermisoTrabajo.forEach(archivo => {
      lista.push({
        file: archivo,
        idTipoAdjunto: ID_TIPO_ADJUNTO_PERMISO_TRABAJO,
        consecutivoPersona: 1,
        nombreArchivo: archivo.name,
      });
    });
    const beneficiarios =
      this.opcionBeneficiarios === 'si' ? this.beneficiariosAgregados : [];
    beneficiarios.forEach((beneficiario, index) => {
      const consecutivoPersona = index + 2;
      if (beneficiario.documentosAdjuntos?.length) {
        beneficiario.documentosAdjuntos.forEach(doc => {
          doc.archivos.forEach(archivo => {
            lista.push({
              file: archivo,
              idTipoAdjunto: doc.idTipoAdjunto,
              consecutivoPersona,
              nombreArchivo: archivo.name,
            });
          });
        });
      }
      archivosSoporteDiscapacidadDesdePersona(beneficiario.archivoSoporteDiscapacidad).forEach(archivo => {
        lista.push({
          file: archivo,
          idTipoAdjunto: ID_TIPO_ADJUNTO_SOPORTE_DISCAPACIDAD,
          consecutivoPersona,
          nombreArchivo: archivo.name,
        });
      });
    });
    return lista;
  }

  private construirRequestGuardarSolicitud(
    idEmpresa: number,
    adjuntos: AdjuntoGuardarSolicitudInterna[]
  ): GuardarSolicitudRequestInterna | null {
    const personal = this.solicitudPersonalForm.getRawValue();
    const laboral = this.solicitudLaboralForm.getRawValue();
    const medioPago = this.solicitudMedioPagoForm.getRawValue();

    const depId =
      personal.id_departamento != null && personal.id_departamento !== ''
        ? Number(personal.id_departamento)
        : undefined;
    const munId =
      personal.id_municipio != null && personal.id_municipio !== ''
        ? Number(personal.id_municipio)
        : undefined;

    const idEntidad = medioPago.id_entidad != null ? Number(medioPago.id_entidad) : undefined;

    const trabajador: TrabajadorGuardarSolicitudInterna = {
      tipoDocumento: (personal.tipo_documento ?? '').toString().trim(),
      numeroDocumento: (personal.numero_documento ?? '').toString().trim(),
      primerNombre: (personal.primer_nombre ?? '').toString().trim(),
      segundoNombre: (personal.segundo_nombre ?? '').toString().trim() || undefined,
      primerApellido: (personal.primer_apellido ?? '').toString().trim(),
      segundoApellido: (personal.segundo_apellido ?? '').toString().trim() || undefined,
      fechaNacimiento: this.asegurarFormatoFecha(personal.fecha_nacimiento),
      fechaExpedicionDoc: personal.fecha_expedicion
        ? this.asegurarFormatoFecha(personal.fecha_expedicion)
        : undefined,
      genero: (personal.genero ?? '').toString().trim() || undefined,
      direccion: (personal.direccion ?? '').toString().trim() || undefined,
      estadoCivil: (personal.estado_civil ?? '').toString().trim() || undefined,
      idDepartamento: depId != null && !Number.isNaN(depId) ? depId : undefined,
      idMunicipio: munId != null && !Number.isNaN(munId) ? munId : undefined,
      zona: (personal.zona ?? '').toString().trim() || undefined,
      telefono: (personal.celular ?? '').toString().trim() || undefined,
      correoElectronico: (personal.correo ?? '').toString().trim() || undefined,
      fechaIngresoEmpresa: laboral.fecha_ingreso_empresa
        ? this.asegurarFormatoFecha(laboral.fecha_ingreso_empresa)
        : undefined,
      horasLaboradasMes: this.parseNumero(laboral.horas_mes),
      salarioMensual: this.parseSalarioMensual(laboral.salario_mensual),
      requierePermisoLaboral: this.requierePermisoLaboral,
      medioPago: this.normalizarMedioPagoParaGuardar(medioPago.medio_pago),
      idEntidadBancaria: idEntidad != null && !Number.isNaN(idEntidad) ? idEntidad : undefined,
      tipoCuenta: this.resolverCodigoTipoCuentaMedioPago(),
      numeroCuenta: (medioPago.numero_cuenta ?? '').toString().trim() || undefined,
      llaveBreb: (medioPago.llave_breb ?? '').toString().trim() || undefined,
    };

    const trabajadorConGenesys = this.fusionarCamposGenesysTrabajadorGuardar(
      trabajador,
      laboral,
      medioPago as Record<string, unknown>
    );

    const beneficiarios: BeneficiarioGuardarSolicitudInterna[] =
      this.opcionBeneficiarios === 'si'
        ? this.beneficiariosAgregados.map(b => this.mapearBeneficiarioGuardarSolicitud(b))
        : [];

    return {
      idEmpresa,
      trabajador: trabajadorConGenesys,
      beneficiarios,
      adjuntos,
      observaciones: null,
      afiliacionDesdeModuloAfiliacionIndividual: true,
      origenRadicacion: 'Afiliacion interna',
      usuarioRadicacionInterno: this.obtenerUsuarioRadicacionInterno(),
    };
  }

  private fusionarCamposGenesysTrabajadorGuardar(
    base: TrabajadorGuardarSolicitudInterna,
    laboral: { cargo_desempenado?: string },
    medioPagoForm: Record<string, unknown>
  ): TrabajadorGuardarSolicitudInterna {
    const df = this.respuestaValidarTrabajador?.datosFormulario;
    const pi = df?.personalInfo;
    const s = (v: unknown): string => (v == null ? '' : String(v).trim());
    let result: TrabajadorGuardarSolicitudInterna = { ...base };

    const cargoForm = s(laboral.cargo_desempenado);
    if (cargoForm !== '') {
      result.cargoOficioDesempenado = cargoForm;
    }

    if (pi) {
      const ocupacionGenesys = s(pi.ocupacion);
      const rawFecTerm = pi.fechaTerminacionContrato;
      let fechaTerminacionContrato: string | undefined;
      if (rawFecTerm != null && s(rawFecTerm) !== '') {
        fechaTerminacionContrato = this.asegurarFormatoFecha(rawFecTerm as string);
      }
      if (s(pi.cabezaHogar) !== '') {
        result.cabezaHogar = s(pi.cabezaHogar);
      }
      if (ocupacionGenesys !== '') {
        result.ocupacion = ocupacionGenesys;
      }
      if (s(pi.nivelEducativo) !== '') {
        result.nivelEducativo = s(pi.nivelEducativo);
      }
      if (typeof pi.viveEnCasaPropia === 'boolean') {
        result.viveCasaPropia = pi.viveEnCasaPropia;
      }
      if (s(pi.claseTrabajador) !== '') {
        result.claseTrabajador = s(pi.claseTrabajador);
      }
      if (s(pi.tipoSalario) !== '') {
        result.tipoSalario = s(pi.tipoSalario);
      }
      if (s(pi.tipoContratoLaboral) !== '') {
        result.tipoContratoLaboral = s(pi.tipoContratoLaboral);
      }
      if (fechaTerminacionContrato) {
        result.fechaTerminacionContrato = fechaTerminacionContrato;
      }
      if (pi.sucursalAsociada != null && !Number.isNaN(Number(pi.sucursalAsociada))) {
        result.sucursalAsociada = Number(pi.sucursalAsociada);
      }
      const munLab = s(pi.municipioDesempenoLabores ?? pi['municipio_desempeno_labores']);
      if (munLab !== '') {
        result.municipioLabora = munLab;
      }
      if (s(pi.paisResidencia) !== '') {
        result.paisResidencia = s(pi.paisResidencia);
      }
      if (typeof pi.autorizacionEnvioCorreo === 'boolean') {
        result.autorizacionEnvioCorreo = pi.autorizacionEnvioCorreo;
      }
    }

    const f007 = df?.form007Data;
    if (f007) {
      if (s(f007.orientacionSexual) !== '') {
        result.orientacionSexual = s(f007.orientacionSexual);
      }
      if (s(f007.factorVulnerabilidad) !== '') {
        result.factorVulnerabilidad = s(f007.factorVulnerabilidad);
      }
      if (s(f007.pertenenciaEtnica) !== '') {
        result.pertenenciaEtnica = s(f007.pertenenciaEtnica);
      }
    }

    const dir = df?.direccionCalculada;
    if (dir?.disponible === true) {
      const elem = dir.elemento ?? (dir as Record<string, unknown>)['elemento'];
      if (s(elem) !== '') {
        result.dirElemento = s(elem);
      }
      if (s(dir.tipoVia) !== '') {
        result.dirTipoVia = s(dir.tipoVia);
      }
      if (s(dir.numero) !== '') {
        result.dirNumero = s(dir.numero);
      }
      if (s(dir.letra) !== '') {
        result.dirLetra = s(dir.letra);
      }
      if (s(dir.viaGeneradora) !== '') {
        result.dirViaGeneradora = s(dir.viaGeneradora);
      }
      if (s(dir.descripcionBarrio) !== '') {
        result.dirBarrio = s(dir.descripcionBarrio);
      }
    }

    const mp = df?.medioPago;
    const entidadTexto = this.resolverNombreEntidadBancariaTexto(medioPagoForm, mp);
    if (entidadTexto !== '') {
      result.nombreEntidadBancariaTexto = entidadTexto;
    }
    if (mp) {
      if (s(mp.tipoIdentificacionTitular) !== '') {
        result.tipoIdentificacionTitularCuenta = s(mp.tipoIdentificacionTitular);
      }
      if (s(mp.numeroIdentificacionTitular) !== '') {
        result.numeroIdentificacionTitularCuenta = s(mp.numeroIdentificacionTitular);
      }
      if (s(mp.titularCuenta) !== '') {
        result.titularCuenta = s(mp.titularCuenta);
      }
    }

    return result;
  }

  private resolverNombreEntidadBancariaTexto(
    medioPagoForm: Record<string, unknown>,
    mp: { entidadBancaria?: unknown; banco?: unknown } | null | undefined
  ): string {
    const s = (v: unknown): string => (v == null ? '' : String(v).trim());
    const limpiarSoloNumeros = (v: string): string => (/^\d+$/.test(v) ? '' : v);
    const resolverDesdeCatalogo = (valor: string): string => {
      const v = s(valor);
      if (v === '') {
        return '';
      }
      const match = this.entidadesMedioPagoRef.find(e => {
        const id = e.idEntidad != null ? s(e.idEntidad) : '';
        const nombre = s(e.nombreEntidad);
        return v === id || v === nombre;
      });
      if (match) {
        const nombre = s(match.nombreEntidad);
        return limpiarSoloNumeros(nombre);
      }
      return limpiarSoloNumeros(v);
    };
    const idEnt = medioPagoForm['id_entidad'];
    if (idEnt != null && idEnt !== '') {
      const ent = this.entidadesMedioPagoRef.find(e => Number(e.idEntidad) === Number(idEnt));
      if (ent) {
        const nombre = s(ent.nombreEntidad);
        if (nombre) {
          return nombre;
        }
      }
    }
    return (
      resolverDesdeCatalogo(s(mp?.entidadBancaria)) ||
      resolverDesdeCatalogo(s(mp?.banco)) ||
      ''
    );
  }

  private mapearBeneficiarioGuardarSolicitud(b: PersonaACargoInterna): BeneficiarioGuardarSolicitudInterna {
    const d = b.datosPrecargados;
    const db = b.datosBeneficiario;
    const snap = b.validacionBeneficiario;
    const pi = snap?.personalInfo;
    const f007 = snap?.form007Data;
    const dirC = snap?.direccionCalculada;
    const s = (v: unknown): string => (v == null ? '' : String(v).trim());

    const parentescoGenesys = this.parentescos.find(p => p.nombre === b.parentesco)?.parentescoGenesys;
    const correspondeTrabajador = ((d?.direccionCorrespondeTrabajador ?? '').toString().trim() || 'Si');
    const mismaDireccionQuePrincipal =
      correspondeTrabajador === 'Si' || correspondeTrabajador === 'Sí';
    const direccionPrincipal = this.obtenerDireccionTrabajadorParaBeneficiario();
    const direccionBeneficiario = mismaDireccionQuePrincipal
      ? direccionPrincipal || undefined
      : (d?.direccion ?? '').toString().trim() || undefined;

    const base: BeneficiarioGuardarSolicitudInterna = {
      tipoDocumento: (b.tipoDocumento ?? '').toString().trim(),
      numeroDocumento: (b.numeroDocumento ?? '').toString().trim(),
      primerNombre: (d?.primerNombre ?? '').toString().trim(),
      segundoNombre: (d?.segundoNombre ?? '').toString().trim() || undefined,
      primerApellido: (d?.primerApellido ?? '').toString().trim(),
      segundoApellido: (d?.segundoApellido ?? '').toString().trim() || undefined,
      fechaNacimiento: d?.fechaNacimiento ? this.asegurarFormatoFecha(d.fechaNacimiento) : '',
      fechaExpedicionDoc: d?.fechaExpedicion
        ? this.asegurarFormatoFecha(d.fechaExpedicion)
        : undefined,
      genero: (d?.genero ?? '').toString().trim() || undefined,
      direccion: direccionBeneficiario,
      parentesco: (b.parentesco ?? '').toString().trim() || undefined,
      parentescoGenesys: parentescoGenesys ?? undefined,
      personaDiscapacidad: (d?.personaDiscapacidad ?? '').toString().trim() || undefined,
      direccionCorrespondeTrabajador: correspondeTrabajador || undefined,
    };

    const ext: Partial<BeneficiarioGuardarSolicitudInterna> = {};

    if (db?.nuevoBeneficiario != null && s(db['nuevoBeneficiario']) !== '') {
      ext.nuevoBeneficiario = s(db['nuevoBeneficiario']);
    }
    if (db?.nuevoGrupoFamiliar != null && s(db['nuevoGrupoFamiliar']) !== '') {
      ext.nuevoGrupoFamiliar = s(db['nuevoGrupoFamiliar']);
    }
    if (db?.numeroGrupoFamiliar != null && !Number.isNaN(Number(db.numeroGrupoFamiliar))) {
      ext.numeroGrupoFamiliar = Number(db.numeroGrupoFamiliar);
    }
    if (db?.requiereAdjuntoRegistroCivil === true) {
      ext.requiereAdjuntoRegistroCivil = true;
    }
    if (db?.requiereAdjuntoDocumentoSoporte === true) {
      ext.requiereAdjuntoDocumentoSoporte = true;
    }
    if (db?.revisionBack === true) {
      ext.revisionBack = true;
    }

    if (s(db?.['gradoCursado'])) {
      ext.gradoCursado = s(db!['gradoCursado']);
    }
    if (s(db?.['certificadoEscolar'])) {
      ext.certificadoEscolar = s(db!['certificadoEscolar']);
    }
    if (db?.['fechaInicioVigenciaCertificadoEscolar']) {
      const x = this.asegurarFormatoFecha(db['fechaInicioVigenciaCertificadoEscolar'] as string);
      if (x) {
        ext.fechaInicioVigenciaCertificadoEscolar = x;
      }
    }
    if (db?.['fechaFinVigenciaCertificadoEscolar']) {
      const x = this.asegurarFormatoFecha(db['fechaFinVigenciaCertificadoEscolar'] as string);
      if (x) {
        ext.fechaFinVigenciaCertificadoEscolar = x;
      }
    }
    if (db?.['fechaReporteInvalidez']) {
      const x = this.asegurarFormatoFecha(db['fechaReporteInvalidez'] as string);
      if (x) {
        ext.fechaReporteInvalidez = x;
      }
    }

    const tipoAdm = s(db?.['tipoIdentificacionAdministradorSubsidio']);
    const numAdm = s(db?.['numeroIdentificacionAdministradorSubsidio']);
    let nomAdm = s(db?.['nombreCompletoAdministradorSubsidio']);
    if (tipoAdm && numAdm) {
      if (!nomAdm) {
        nomAdm = this.nombreCompletoTrabajadorParaAdminSubsidio();
      }
      if (nomAdm) {
        ext.tipoIdentificacionAdministradorSubsidio = tipoAdm;
        ext.numeroIdentificacionAdministradorSubsidio = numAdm;
        ext.nombreCompletoAdministradorSubsidio = nomAdm;
      }
    }

    const tel = s(pi?.telefono);
    const mail = s(pi?.correoElectronico);
    if (tel) {
      ext.telefono = tel;
    }
    if (mail) {
      ext.correoElectronico = mail;
    }
    if (s(pi?.paisResidencia)) {
      ext.paisResidencia = s(pi!.paisResidencia);
    }
    if (typeof pi?.autorizacionEnvioCorreo === 'boolean') {
      ext.autorizacionEnvioCorreo = pi.autorizacionEnvioCorreo;
    }

    if (f007) {
      if (s(f007.orientacionSexual)) {
        ext.orientacionSexual = s(f007.orientacionSexual);
      }
      if (s(f007.factorVulnerabilidad)) {
        ext.factorVulnerabilidad = s(f007.factorVulnerabilidad);
      }
      if (s(f007.pertenenciaEtnica)) {
        ext.pertenenciaEtnica = s(f007.pertenenciaEtnica);
      }
    }

    if (dirC?.disponible === true) {
      const elem = dirC.elemento ?? (dirC as Record<string, unknown>)['elemento'];
      if (s(elem)) {
        ext.dirElemento = s(elem);
      }
      if (s(dirC.tipoVia)) {
        ext.dirTipoVia = s(dirC.tipoVia);
      }
      if (s(dirC.numero)) {
        ext.dirNumero = s(dirC.numero);
      }
      if (s(dirC.letra)) {
        ext.dirLetra = s(dirC.letra);
      }
      if (s(dirC.viaGeneradora)) {
        ext.dirViaGeneradora = s(dirC.viaGeneradora);
      }
      if (s(dirC.descripcionBarrio)) {
        ext.dirBarrio = s(dirC.descripcionBarrio);
      }
    }

    return { ...base, ...ext };
  }

  private nombreCompletoTrabajadorParaAdminSubsidio(): string {
    if (this.esFlujoBeneficiarioTrabajadorActivoInterno && this.trabajadorActivoBeneficiario) {
      const t = this.trabajadorActivoBeneficiario;
      const nc = (t.nombreCompleto ?? '').toString().trim();
      if (nc) {
        return nc;
      }
      return [t.primerNombre, t.segundoNombre, t.primerApellido, t.segundoApellido]
        .map(v => (v != null && String(v).trim() !== '' ? String(v).trim() : ''))
        .filter(Boolean)
        .join(' ')
        .trim();
    }
    const g = this.solicitudPersonalForm?.getRawValue();
    if (g) {
      const desdeFormulario = [g.primer_nombre, g.segundo_nombre, g.primer_apellido, g.segundo_apellido]
        .map(v => (v != null && String(v).trim() !== '' ? String(v).trim() : ''))
        .filter(Boolean)
        .join(' ')
        .trim();
      if (desdeFormulario) {
        return desdeFormulario;
      }
    }
    const pi = this.respuestaValidarTrabajador?.datosFormulario?.personalInfo;
    if (pi) {
      const nc = (pi.nombreCompleto ?? '').toString().trim();
      if (nc) {
        return nc;
      }
      return [
        pi.primerNombre ?? pi.primer_nombre,
        pi.segundoNombre ?? pi.segundo_nombre,
        pi.primerApellido ?? pi.primer_apellido,
        pi.segundoApellido ?? pi.segundo_apellido,
      ]
        .map(v => (v != null && String(v).trim() !== '' ? String(v).trim() : ''))
        .filter(Boolean)
        .join(' ')
        .trim();
    }
    return '';
  }

  private obtenerDireccionTrabajadorParaBeneficiario(): string {
    if (this.esFlujoBeneficiarioTrabajadorActivoInterno && this.trabajadorActivoBeneficiario) {
      return (this.trabajadorActivoBeneficiario.direccion ?? '').toString().trim();
    }
    return (this.solicitudPersonalForm.getRawValue()?.direccion ?? '').toString().trim();
  }

  private asegurarFormatoFecha(valor: string | Date | null | undefined): string {
    if (valor == null || valor === '') {
      return '';
    }
    if (valor instanceof Date && !isNaN(valor.getTime())) {
      return valorComoInputDate(valor) ?? '';
    }
    const s = String(valor).trim();
    return s.length >= 10 ? s.substring(0, 10) : s;
  }

  private parseNumero(valor: string | number | null | undefined): number | undefined {
    if (valor == null || valor === '') {
      return undefined;
    }
    const n = typeof valor === 'number' ? valor : Number(String(valor).replace(/\D/g, ''));
    if (Number.isNaN(n)) {
      return undefined;
    }
    return n < 0 ? 0 : n;
  }

  private parseSalarioMensual(valor: string | number | null | undefined): number | undefined {
    if (valor == null || valor === '') {
      return undefined;
    }
    if (typeof valor === 'number' && !Number.isNaN(valor)) {
      return valor < 0 ? 0 : valor;
    }
    const sinPuntos = String(valor).replace(/\./g, '').replace(/,/g, '.').trim();
    const n = parseFloat(sinPuntos);
    if (Number.isNaN(n)) {
      return undefined;
    }
    return n < 0 ? 0 : n;
  }

  private normalizarMedioPagoParaGuardar(valor: unknown): string | undefined {
    const s = (valor ?? '').toString().trim();
    if (!s) {
      return undefined;
    }
    if (s.toLowerCase() === 'efectivo') {
      return 'Efectivo';
    }
    if (s.toLowerCase().includes('transferencia')) {
      return 'Transferencia';
    }
    return s;
  }

  private resolverCodigoTipoCuentaMedioPago(): string | undefined {
    const idTipo = this.solicitudMedioPagoForm.get('tipo_cuenta')?.value;
    if (idTipo == null || idTipo === '') {
      return undefined;
    }
    const ent = this.entidadSeleccionadaMedioPago;
    const tc = ent?.tiposCuenta?.find(t => Number(t.idTipoCuenta) === Number(idTipo));
    const codigo = (tc?.codigoTipoCuenta ?? tc?.nombreTipoCuenta ?? '').toString().trim();
    return codigo || String(idTipo);
  }
}
