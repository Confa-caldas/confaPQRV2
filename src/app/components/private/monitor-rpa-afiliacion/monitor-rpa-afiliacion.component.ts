import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  FilterMonitorRpa,
  MonitorRpaListItem,
  SemaforoRpaItem,
  FilterResumenMotivosRpa,
  ResumenMotivoRpaItem,
  FilterReporteAfiliacionFecha,
  ReporteRpaRow,
  DetalleRpaRadicadoRow,
} from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';
import { OverlayPanel } from 'primeng/overlaypanel';

interface CampoDetalleRpa {
  etiqueta: string;
  valor: string | number | boolean | null;
}

interface SeccionDetalleRpa {
  titulo: string;
  campos: CampoDetalleRpa[];
}

interface PersonaDetalleRpa {
  titulo: string;
  secciones: SeccionDetalleRpa[];
}

@Component({
  selector: 'app-monitor-rpa-afiliacion',
  templateUrl: './monitor-rpa-afiliacion.component.html',
  styleUrl: './monitor-rpa-afiliacion.component.scss',
})
export class MonitorRpaAfiliacionComponent implements OnInit {
  /** Se llena dinámicamente desde el semáforo (afiliaciones.rpa_robot_control): "Todos" + uno por robot activo. */
  robotOpciones: { label: string; value: string | null }[] = [{ label: 'Todos', value: null }];

  static readonly ESTADO_INCONSISTENCIA = 'Inconsistencias RPA';

  readonly estadoOpciones = [
    { label: 'Todos', value: null },
    { label: 'En ejecución', value: 'En ejecución RPA' },
    { label: 'Procesado', value: 'Procesado' },
    { label: 'Inconsistencia', value: MonitorRpaAfiliacionComponent.ESTADO_INCONSISTENCIA },
  ];

  readonly hoy = new Date();
  /** Para el selector de año del calendario: desde 5 años atrás hasta hoy. */
  readonly rangoAniosCalendario = `${this.hoy.getFullYear() - 5}:${this.hoy.getFullYear()}`;

  formGroup = new FormGroup({
    fecha: new FormControl<Date | null>(this.hoy),
    nombre_robot: new FormControl<string | null>(null),
    estado: new FormControl<string | null>(null),
  });

  rowList: MonitorRpaListItem[] = [];

  first = 0;
  page = 1;
  rows = 10;
  totalRows = 0;
  loading = true;

  /** Resumen (agrupado por motivo, transacción o robot según el estado filtrado), mismos filtros que la tabla principal. */
  resumenMotivos: ResumenMotivoRpaItem[] = [];
  tipoAgrupadorResumen: 'motivo' | 'transaccion' | 'robot' | null = null;
  totalRadicadosResumen = 0;
  totalPersonasResumen = 0;
  cargandoResumen = false;

  /** Semáforo por robot: null = aún sin cargar / falló. */
  semaforos: SemaforoRpaItem[] | null = null;
  cargandoSemaforo = false;

  /** Totales del día (procesadas vs inconsistencias), solo cuando el filtro de estado es "Todos". */
  resumenGeneral: { procesadas: number; inconsistencias: number } | null = null;
  cargandoResumenGeneral = false;

  /** Contenido del popover "Ver radicados" del resumen de motivos. */
  @ViewChild('opRadicados') opRadicados!: OverlayPanel;
  radicadosPanel: string[] = [];
  motivoPanelLabel = '';

  /**
   * Modal de detalle de un radicado (solo disponible desde los chips de "Ver radicados" cuando el
   * agrupador es 'motivo', es decir, el estado filtrado es Inconsistencia). Un radicado puede traer
   * varias filas (una por beneficiario, o una sola si el trabajador no tiene beneficiarios) -- cada
   * fila se muestra como una pestaña independiente dentro del modal.
   */
  detalleRadicadoVisible = false;
  cargandoDetalleRadicado = false;
  detalleRadicadoActual: string | null = null;
  detalleTabIndex = 0;
  detallePersonas: PersonaDetalleRpa[] = [];
  /** Origen y responsable de la radicación: van en el encabezado del modal (aplican a todo el radicado, no a una persona puntual). */
  detalleOrigenRadicacion: string | null = null;
  detalleRadicadoPor: string | null = null;

/** Campos de contexto que se muestran en TODAS las pestañas (la del trabajador y la de cada beneficiario). */
  private static readonly SECCION_RADICADO_EMPRESA: { titulo: string; campos: { clave: string; etiqueta?: string }[] }[] = [
    {
      titulo: 'Radicado y empresa',
      campos: [
        { clave: 'Numero de radicado' },
        { clave: 'Transaccion' },
        { clave: 'estado_solicitud_actual', etiqueta: 'Estado actual de la solicitud' },
        { clave: 'Tipo de identificacion empresa' },
        { clave: 'Numero identificacion empresa' },
        { clave: 'Ruta expediente S3' },
      ],
    },
  ];

  /** Campos del trabajador: van SOLO en su propia pestaña (no se repiten en cada beneficiario). */
  private static readonly SECCIONES_TRABAJADOR: { titulo: string; campos: { clave: string; etiqueta?: string }[] }[] = [
    {
      titulo: 'Trabajador — datos personales',
      campos: [
        { clave: 'No.identificacion trabajador', etiqueta: 'Número de identificación' },
        { clave: 'Primer nombre trabajador' },
        { clave: 'Segundo nombre trabajador' },
        { clave: 'Primer apellido' },
        { clave: 'Segundo apellido' },
        { clave: 'Fecha nacimiento trabajador' },
        { clave: 'Fecha expedicion documento identidad' },
        { clave: 'Fecha de recepcion de documentos' },
        { clave: 'Genero' },
        { clave: 'Nivel educativo' },
        { clave: 'Cabeza de hogar' },
        { clave: 'Estado civil' },
        { clave: 'Orientacion sexual' },
        { clave: 'Factor Vulnerabilidad' },
        { clave: 'Pertenencia etnica' },
        { clave: 'Telefono celular' },
        { clave: 'Correo electronico' },
        { clave: 'Autorizacion envio correo' },
      ],
    },
    {
      titulo: 'Trabajador — dirección de residencia',
      campos: [
        { clave: 'Pais residencia' },
        { clave: 'Departamento residencia' },
        { clave: 'Municipio residencia' },
        { clave: 'Direccion residencia' },
        { clave: 'Urbana/rural' },
        { clave: 'Elemento' },
        { clave: 'Tipo de via' },
        { clave: 'Numero' },
        { clave: 'Letra' },
        { clave: 'Via Generadora' },
        { clave: 'Barrio' },
        { clave: 'Vive en casa propia?' },
      ],
    },
    {
      titulo: 'Trabajador — información laboral',
      campos: [
        { clave: 'Medio de pago' },
        { clave: 'Clase trabajador' },
        { clave: 'ocupacion_trabajador', etiqueta: 'Ocupación' },
        { clave: 'tipo_salario', etiqueta: 'Tipo de salario' },
        { clave: 'Horas laboradas en el mes' },
        { clave: 'cargo_oficio_desempeniado', etiqueta: 'Cargo u oficio desempeñado' },
        { clave: 'tipo_contrato_laboral', etiqueta: 'Tipo de contrato laboral' },
        { clave: 'Fecha de terminacion del contrato' },
        { clave: 'Sucursal asociada' },
        { clave: 'Municipio de desempeno de labores' },
        { clave: 'Fecha inicio de labores' },
        { clave: 'Valor salario mensual' },
      ],
    },
    {
      titulo: 'Trabajador — cuenta bancaria',
      campos: [
        { clave: 'Tipo de cuenta trabajador' },
        { clave: 'Numero de cuenta trabajador' },
        { clave: 'Tipo de identificacion titular cuenta' },
        { clave: 'Numero de identificacion titular cuenta' },
        { clave: 'Titular de la cuenta' },
        { clave: 'Banco trabajador' },
      ],
    },
  ];

  /** Campos que solo aplican cuando la fila trae un beneficiario (no cuando el trabajador va solo). */
  private static readonly SECCIONES_BENEFICIARIO: { titulo: string; campos: { clave: string; etiqueta?: string }[] }[] = [
    {
      titulo: 'Beneficiario — datos generales',
      campos: [
        { clave: 'Tipo de beneficiario' },
        { clave: 'Relacion con grupo familiar' },
        { clave: 'Nuevo Beneficiario?' },
        { clave: 'Nuevo grupo familiar?' },
        { clave: 'Numero Grupo familiar' },
        { clave: 'Tipo identificacion Beneficiario' },
        { clave: 'No. identificacion Beneficiario' },
        { clave: 'Primer nombre Beneficiario' },
        { clave: 'Segundo nombre Beneficiario' },
        { clave: 'Primer apellido Beneficiario' },
        { clave: 'Segundo apellido Beneficiario' },
        { clave: 'Fecha de nacimiento Beneficiario' },
        { clave: 'Fecha expedicion documento identidad Beneficiario' },
        { clave: 'Fecha de recepcion de documentos Beneficiario' },
        { clave: 'Genero Beneficiario' },
        { clave: 'Nivel educativo Beneficiario' },
        { clave: 'ocupacion_beneficiario', etiqueta: 'Ocupación' },
        { clave: 'Grado cursado' },
        { clave: 'Conyuge labora?' },
        { clave: 'Valor salario mensual Beneficiario' },
        { clave: 'Telefono beneficiario' },
        { clave: 'Correo beneficiario' },
        { clave: 'Direccion es la misma del afiliado principal' },
        { clave: 'Observaciones' },
      ],
    },
    {
      titulo: 'Beneficiario — certificado escolar e invalidez',
      campos: [
        { clave: 'Certificado escolar?' },
        { clave: 'Fecha inicio vigencia certificado escolar' },
        { clave: 'Fecha vencimiento certificado escolar' },
        { clave: 'Persona con invalidez?' },
        { clave: 'Fecha inicio invalidez' },
        { clave: 'Fecha reporte invalidez' },
      ],
    },
    {
      titulo: 'Beneficiario — administrador del subsidio',
      campos: [
        { clave: 'Afiliado principal es el mismo administrador del subsidio' },
        { clave: 'Tipo identificacion administrador del subsidio' },
        { clave: 'No. identificacion administrador del subsidio' },
        { clave: 'Nombre administrador del subsidio' },
        { clave: 'Fecha nacimiento administrador del subsidio' },
        { clave: 'Tipo de cuenta beneficiario' },
        { clave: 'Numero de cuenta beneficiario' },
        { clave: 'Banco beneficiario' },
        { clave: 'Medio pago beneficiario' },
      ],
    },
  ];

  constructor(
    private userService: Users,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.searchRows();
    this.cargarResumenMotivos();
    this.cargarResumenGeneral();
    this.actualizarSemaforo();
  }

  private convertirFecha(date: Date | null): string | null {
    if (!date) {
      return null;
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private buildFilterPayload(): FilterMonitorRpa {
    const v = this.formGroup.value;
    const fecha = this.convertirFecha(v.fecha ?? null);
    return {
      fecha_inicio: fecha,
      fecha_fin: fecha,
      nombre_robot: v.nombre_robot ?? null,
      estado: v.estado ?? null,
      page: this.page,
      page_size: this.rows,
    };
  }

  searchRows(): void {
    this.loading = true;
    this.userService.getMonitorRpaByFilter(this.buildFilterPayload()).subscribe({
      next: (response: BodyResponse<MonitorRpaListItem[]>) => {
        this.loading = false;
        if (response.code === 200) {
          this.rowList = response.data ?? [];
          this.totalRows = Number(response.message) || this.rowList[0]?.total_count || 0;
        } else {
          this.rowList = [];
          this.totalRows = 0;
          this.showMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: err => {
        console.error(err);
        this.loading = false;
        this.rowList = [];
        this.totalRows = 0;
        this.showMessage('error', 'Error', 'No se pudo consultar el monitor de robots RPA.');
      },
    });
  }

  private buildResumenPayload(): FilterResumenMotivosRpa {
    const payload = this.buildFilterPayload();
    return {
      fecha_inicio: payload.fecha_inicio,
      fecha_fin: payload.fecha_fin,
      nombre_robot: payload.nombre_robot,
      estado: payload.estado,
    };
  }

  cargarResumenMotivos(): void {
    if (!this.mostrarResumen) {
      this.resumenMotivos = [];
      this.tipoAgrupadorResumen = null;
      this.totalRadicadosResumen = 0;
      this.totalPersonasResumen = 0;
      return;
    }
    this.cargandoResumen = true;
    this.userService.getResumenMotivosRpa(this.buildResumenPayload()).subscribe({
      next: (response: BodyResponse<ResumenMotivoRpaItem[]>) => {
        this.cargandoResumen = false;
        const data = response.code === 200 ? (response.data ?? []) : [];
        this.resumenMotivos = data;
        this.tipoAgrupadorResumen = data[0]?.tipo_agrupador ?? null;
        this.totalRadicadosResumen = data[0]?.total_radicados ?? 0;
        this.totalPersonasResumen = data[0]?.total_personas ?? 0;
      },
      error: err => {
        console.error(err);
        this.cargandoResumen = false;
        this.resumenMotivos = [];
        this.tipoAgrupadorResumen = null;
        this.totalRadicadosResumen = 0;
        this.totalPersonasResumen = 0;
      },
    });
  }

  /**
   * Totales del día (procesadas vs inconsistencias), para el cintillo que se muestra cuando el
   * filtro de estado está en "Todos". Reutiliza afiliaciones.obtener_reporte_rpa_por_fecha (mismo
   * dato que ya usa el reporte de afiliaciones), con la fecha del filtro actual como único día.
   */
  cargarResumenGeneral(): void {
    if (this.mostrarResumen) {
      this.resumenGeneral = null;
      return;
    }
    const fecha = this.convertirFecha(this.formGroup.value.fecha ?? null);
    if (!fecha) {
      this.resumenGeneral = null;
      return;
    }
    const payload: FilterReporteAfiliacionFecha = { i_date: fecha, f_date: fecha };
    this.cargandoResumenGeneral = true;
    this.userService.getReporteRpaAfiliacion(payload).subscribe({
      next: (response: BodyResponse<ReporteRpaRow[]>) => {
        this.cargandoResumenGeneral = false;
        const fila = (response.code === 200 ? (response.data ?? []) : [])[0] as any;
        this.resumenGeneral = {
          procesadas: fila?.cantidad_procesadas_automaticamente ?? fila?.cantidadProcesadasAutomaticamente ?? 0,
          inconsistencias: fila?.cantidad_devueltas_error_rpa ?? fila?.cantidadDevueltasPorErrorRpa ?? 0,
        };
      },
      error: err => {
        console.error(err);
        this.cargandoResumenGeneral = false;
        this.resumenGeneral = null;
      },
    });
  }

  actualizarSemaforo(): void {
    this.cargandoSemaforo = true;
    this.userService.getSemaforoRpa().subscribe({
      next: (response: BodyResponse<SemaforoRpaItem[]>) => {
        this.cargandoSemaforo = false;
        this.semaforos = response.code === 200 ? (response.data ?? []) : null;
        this.actualizarRobotOpciones();
      },
      error: err => {
        console.error(err);
        this.cargandoSemaforo = false;
        this.semaforos = null;
      },
    });
  }

  /** Reconstruye el filtro de robot a partir del semáforo, para no depender de una lista fija. */
  private actualizarRobotOpciones(): void {
    this.robotOpciones = [
      { label: 'Todos', value: null },
      ...(this.semaforos ?? []).map(s => ({ label: s.nombre_robot, value: s.nombre_robot })),
    ];
  }

  /** Las columnas de "ya resueltas"/"estado actual" solo aportan información cuando se filtra por Inconsistencia. */
  get mostrarColumnasResolucion(): boolean {
    return this.formGroup.value.estado === MonitorRpaAfiliacionComponent.ESTADO_INCONSISTENCIA;
  }

  /** El panel de resumen solo tiene sentido cuando hay un estado puntual seleccionado (no "Todos"). */
  get mostrarResumen(): boolean {
    return !!this.formGroup.value.estado;
  }

  /** El cintillo de totales (procesadas/inconsistencias) solo aplica cuando el estado es "Todos". */
  get mostrarResumenGeneral(): boolean {
    return !this.formGroup.value.estado;
  }

  /**
   * true cuando la fecha filtrada es HOY: el reporte está "en progreso" (logs_solicitud del día
   * sigue llenándose, los números pueden seguir cambiando). false para cualquier día ya cerrado
   * (histórico, congelado). Compara solo año/mes/día, sin hora.
   */
  get esFechaHoy(): boolean {
    const fecha = this.formGroup.value.fecha;
    if (!fecha) {
      return false;
    }
    return (
      fecha.getFullYear() === this.hoy.getFullYear() &&
      fecha.getMonth() === this.hoy.getMonth() &&
      fecha.getDate() === this.hoy.getDate()
    );
  }

  /**
   * Reintegro ya viene agrupado como "Afiliación por Módulo" desde la función SQL.
   * En Módulo, cuando una solicitud queda en inconsistencia, casi siempre TODAS sus
   * personas quedan con la misma observación -- contar por persona repite la misma
   * historia varias veces. Por eso aquí se ordena por cantidad_radicados (el conteo
   * real de solicitudes distintas), no por cantidad_personas.
   */
  get resumenModulo(): ResumenMotivoRpaItem[] {
    return this.resumenMotivos
      .filter(m => m.grupo === 'Afiliación por Módulo')
      .slice()
      .sort((a, b) => b.cantidad_radicados - a.cantidad_radicados);
  }

  get resumenNovedad(): ResumenMotivoRpaItem[] {
    return this.resumenMotivos.filter(m => m.grupo === 'Afiliación por novedad');
  }

  /** Para Procesado (por transacción) y En ejecución (por robot): una sola tabla, ordenada por radicados. */
  get resumenSimple(): ResumenMotivoRpaItem[] {
    return this.resumenMotivos
      .slice()
      .sort((a, b) => b.cantidad_radicados - a.cantidad_radicados);
  }

  /** Extrae el número final de un radicado (ej. "RAD-96" -> 96) para poder ordenarlo numéricamente. */
  private numeroRadicado(radicado: string): number {
    const match = radicado.match(/(\d+)\s*$/);
    return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
  }

  /** Abre el popover de radicados para un motivo del resumen (compartido entre Módulo y Novedad). */
  mostrarRadicados(event: Event, m: ResumenMotivoRpaItem): void {
    this.radicadosPanel = (m.radicados || '')
      .split(',')
      .map(r => r.trim())
      .filter(Boolean)
      .sort((a, b) => this.numeroRadicado(a) - this.numeroRadicado(b));
    this.motivoPanelLabel = m.observaciones || m.pantalla_error || m.grupo || 'Motivo';
    this.opRadicados.toggle(event);
  }

  /**
   * Los radicados del popover solo se pueden abrir en detalle cuando el agrupador es 'motivo',
   * que es exclusivamente el caso del estado Inconsistencia (ver getters mostrarResumen/tipoAgrupadorResumen).
   */
  get detalleRadicadoHabilitado(): boolean {
    return this.tipoAgrupadorResumen === 'motivo';
  }

  /** Abre el modal de detalle de un radicado puntual (info completa que se le envía al robot RPA). */
  abrirDetalleRadicado(numeroRadicado: string): void {
    if (!this.detalleRadicadoHabilitado) {
      return;
    }
    this.opRadicados.hide();
    this.detalleRadicadoActual = numeroRadicado;
    this.detalleTabIndex = 0;
    this.detallePersonas = [];
    this.detalleOrigenRadicacion = null;
    this.detalleRadicadoPor = null;
    this.detalleRadicadoVisible = true;
    this.cargandoDetalleRadicado = true;
    this.userService.getDetalleRpaPorRadicado(numeroRadicado).subscribe({
      next: (response: BodyResponse<DetalleRpaRadicadoRow[]>) => {
        this.cargandoDetalleRadicado = false;
        const filas = response.code === 200 ? (response.data ?? []) : [];
        this.detallePersonas = this.construirPersonasDetalle(filas);
        this.detalleOrigenRadicacion = filas.length ? (this.valorCampo(filas[0], 'Origen de radicacion') as string | null) : null;
        this.detalleRadicadoPor = filas.length ? (this.valorCampo(filas[0], 'Radicado por') as string | null) : null;
        if (this.detallePersonas.length === 0) {
          this.showMessage('warn', 'Sin datos', `No se encontró información para el radicado ${numeroRadicado}.`);
        }
      },
      error: err => {
        console.error(err);
        this.cargandoDetalleRadicado = false;
        this.detallePersonas = [];
        this.showMessage('error', 'Error', 'No se pudo consultar el detalle del radicado.');
      },
    });
  }

  private valorCampo(fila: DetalleRpaRadicadoRow, clave: string): string | number | boolean | null {
    const valor = (fila as Record<string, unknown>)[clave];
    return valor === undefined ? null : (valor as string | number | boolean | null);
  }

  private nombreCompleto(fila: DetalleRpaRadicadoRow, claves: string[]): string {
    return claves
      .map(clave => this.valorCampo(fila, clave))
      .filter(v => v !== null && v !== undefined && String(v).trim() !== '')
      .join(' ')
      .trim();
  }

  private mapearSecciones(
    definiciones: { titulo: string; campos: { clave: string; etiqueta?: string }[] }[],
    fila: DetalleRpaRadicadoRow
  ): SeccionDetalleRpa[] {
    return definiciones.map(seccion => ({
      titulo: seccion.titulo,
      campos: seccion.campos.map(campo => ({
        etiqueta: campo.etiqueta ?? campo.clave,
        valor: this.valorCampo(fila, campo.clave),
      })),
    }));
  }

  private tieneBeneficiario(fila: DetalleRpaRadicadoRow): boolean {
    return fila._id_persona_beneficiario !== null && fila._id_persona_beneficiario !== undefined;
  }

  /**
   * Arma las pestañas del modal: SIEMPRE una pestaña "Trabajador" (una sola, sin repetirla por cada
   * beneficiario) y luego una pestaña por cada beneficiario que traiga el radicado, mostrando solo
   * lo propio de cada uno (más el contexto de radicado/empresa, común a todas).
   */
  private construirPersonasDetalle(filas: DetalleRpaRadicadoRow[]): PersonaDetalleRpa[] {
    if (filas.length === 0) {
      return [];
    }

    const personas: PersonaDetalleRpa[] = [];
    const primeraFila = filas[0];

    const seccionesTrabajador = [
      ...this.mapearSecciones(MonitorRpaAfiliacionComponent.SECCION_RADICADO_EMPRESA, primeraFila),
      ...this.mapearSecciones(MonitorRpaAfiliacionComponent.SECCIONES_TRABAJADOR, primeraFila),
    ];
    const nombreTrabajador = this.nombreCompleto(primeraFila, [
      'Primer nombre trabajador',
      'Segundo nombre trabajador',
      'Primer apellido',
      'Segundo apellido',
    ]);
    personas.push({
      titulo: nombreTrabajador ? `Trabajador — ${nombreTrabajador}` : 'Trabajador',
      secciones: seccionesTrabajador,
    });

    filas
      .filter(fila => this.tieneBeneficiario(fila))
      .forEach(fila => {
        const secciones = [
          ...this.mapearSecciones(MonitorRpaAfiliacionComponent.SECCION_RADICADO_EMPRESA, fila),
          ...this.mapearSecciones(MonitorRpaAfiliacionComponent.SECCIONES_BENEFICIARIO, fila),
        ];
        const nombreBeneficiario =
          this.nombreCompleto(fila, [
            'Primer nombre Beneficiario',
            'Segundo nombre Beneficiario',
            'Primer apellido Beneficiario',
            'Segundo apellido Beneficiario',
          ]) || 'Beneficiario';
        const parentesco = this.valorCampo(fila, 'Tipo de beneficiario');
        const titulo = parentesco ? `${nombreBeneficiario} (${parentesco})` : nombreBeneficiario;
        personas.push({ titulo, secciones });
      });

    return personas;
  }

  onPageChange(event: PaginatorState): void {
    this.first = event.first || 0;
    this.rows = event.rows || 10;
    this.page = Number(event.page) + 1 || 1;
    this.searchRows();
  }

  initPaginador(): void {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.searchRows();
    this.cargarResumenMotivos();
    this.cargarResumenGeneral();
  }

  cleanForm(): void {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.formGroup.reset();
    this.formGroup.get('fecha')?.setValue(this.hoy);
    this.searchRows();
    this.cargarResumenMotivos();
    this.cargarResumenGeneral();
  }

  private showMessage(state: string, title: string, detail: string): void {
    this.messageService.add({ severity: state, summary: title, detail });
  }
}
