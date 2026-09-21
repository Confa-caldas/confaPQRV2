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
} from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';
import { OverlayPanel } from 'primeng/overlaypanel';

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

  /** Abre el popover de radicados para un motivo del resumen (compartido entre Módulo y Novedad). */
  mostrarRadicados(event: Event, m: ResumenMotivoRpaItem): void {
    this.radicadosPanel = (m.radicados || '')
      .split(',')
      .map(r => r.trim())
      .filter(Boolean);
    this.motivoPanelLabel = m.observaciones || m.pantalla_error || m.grupo || 'Motivo';
    this.opRadicados.toggle(event);
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
