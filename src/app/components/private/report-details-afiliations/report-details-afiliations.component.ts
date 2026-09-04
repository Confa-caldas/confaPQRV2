import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import {
  FilterReporteAfiliacionFecha,
  FilterReporteValidacionesDiariasAfiliacion,
  FilterReporteEstadoAfiliacion,
  ReporteValidacionesDiariasRow,
  ReporteAuxiliaresRow,
  ReporteSinAsignarRow,
  ReportePorEstadoAfiliadoRow,
  ReporteIndividualPorEstadoRow,
  ReporteMasivaPorEstadoRow,
  ReporteRpaRow,
  RequestStatusAfiliationList,
} from '../../../models/users.interface';

@Component({
  selector: 'app-report-details-afiliations',
  templateUrl: './report-details-afiliations.component.html',
  styleUrl: './report-details-afiliations.component.scss',
})
export class ReportDetailsAfiliationsComponent implements OnInit {
  formGroup: FormGroup = new FormGroup({});

  /** Catálogo de estados de solicitud de afiliación y su mapa id -> texto legible. */
  statusList: RequestStatusAfiliationList[] = [];
  estadoSolicitudMap: Record<number, string> = {};

  /** Reporte 1: Validaciones diarias */
  reporteValidacionesDiarias: ReporteValidacionesDiariasRow[] = [];
  loadingReporte1 = false;

  //paginador reporte 1
  first: number = 0;
  page: number = 1;
  rows: number = 10;
  totalRowsReporte1: number = 0;

  /** Reporte 2: Validaciones por auxiliares */
  reporteAuxiliares: ReporteAuxiliaresRow[] = [];
  reporteSinAsignar: ReporteSinAsignarRow[] = [];
  reportePorEstadoAfiliado: ReportePorEstadoAfiliadoRow[] = [];
  reporteIndividualPorEstado: ReporteIndividualPorEstadoRow[] = [];
  reporteMasivaPorEstado: ReporteMasivaPorEstadoRow[] = [];
  loadingReporte2 = false;

  /** Reporte 3: Procesamiento RPA */
  reporteRpa: ReporteRpaRow[] = [];
  loadingReporte3 = false;

  constructor(
    private userService: Users,
    private messageService: MessageService
  ) {
    const fDate = new Date();
    const iDate = new Date();
    iDate.setDate(iDate.getDate() - 7);
    this.formGroup = new FormGroup({
      dates_range: new FormControl([iDate, fDate]),
    });
  }

  ngOnInit(): void {
    this.getRequestAfiliationStatusList();
    this.buscarReportes();
  }

  /** Carga el catálogo de estados de solicitud de afiliación (id -> texto). */
  getRequestAfiliationStatusList(): void {
    this.userService.getRequestAfiliationStatusList().subscribe({
      next: (response: BodyResponse<RequestStatusAfiliationList[]>) => {
        if (response.code === 200) {
          this.statusList = response.data ?? [];
          this.estadoSolicitudMap = {};
          this.statusList.forEach(item => {
            const id = item.id ?? item.request_status_id;
            const texto = item.status_description || item.descripcion || item.status_name || item.codigo;
            if (id != null && texto) {
              this.estadoSolicitudMap[id] = texto;
            }
          });
        } else {
          this.showMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        this.showMessage('error', 'Fallida', 'No fue posible cargar el catálogo de estados.');
        console.log(err);
      },
    });
  }

  /** Ejecuta la búsqueda de los 3 reportes con el rango de fechas actual del formulario. */
  buscarReportes(): void {
    this.first = 0;
    this.page = 1;
    this.cargarReporteValidacionesDiarias();
    this.cargarReporteAuxiliares();
    this.cargarReporteRpa();
  }

  /** Limpia el formulario de filtros y vuelve a ejecutar la búsqueda. */
  cleanForm(): void {
    const fDate = new Date();
    const iDate = new Date();
    iDate.setDate(iDate.getDate() - 7);
    this.formGroup.reset({ dates_range: [iDate, fDate] });
    this.buscarReportes();
  }

  convertDates(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  private getFechasPayload(): FilterReporteAfiliacionFecha {
    const rango = this.formGroup.controls['dates_range']?.value;
    return {
      i_date: rango == null ? null : this.convertDates(rango[0] || null),
      f_date: rango == null ? null : this.convertDates(rango[1] || null),
    };
  }

  /** Resuelve el texto del estado de la solicitud usando el diccionario de estados si el backend no lo trae ya resuelto. */
  private resolverEstadoSolicitud(row: ReporteValidacionesDiariasRow): string | undefined {
    if (row.estadoSolicitud) {
      return row.estadoSolicitud;
    }
    const estadoId = (row as any).estado_solicitud_id ?? (row as any).status_id;
    if (estadoId != null && this.estadoSolicitudMap[estadoId]) {
      return this.estadoSolicitudMap[estadoId];
    }
    return row.estadoSolicitud;
  }

  /** Carga el reporte de validaciones diarias (paginado). */
  cargarReporteValidacionesDiarias(): void {
    this.loadingReporte1 = true;
    const payload: FilterReporteValidacionesDiariasAfiliacion = {
      ...this.getFechasPayload(),
      page: this.page,
      page_size: this.rows,
    };
    this.userService
      .getReporteValidacionesDiariasAfiliacion(payload)
      .pipe(finalize(() => (this.loadingReporte1 = false)))
      .subscribe({
        next: (response: BodyResponse<ReporteValidacionesDiariasRow[]>) => {
          if (response.code === 200) {
            this.reporteValidacionesDiarias = (response.data ?? []).map(row => ({
              ...row,
              estadoSolicitud: this.resolverEstadoSolicitud(row),
            }));
            this.totalRowsReporte1 =
              response.total_count != null ? response.total_count : Number(response.message) || 0;
          } else {
            this.showMessage('error', 'Fallida', 'Operación fallida!');
          }
        },
        error: (err: any) => {
          this.showMessage('error', 'Fallida', 'No fue posible cargar el reporte de validaciones diarias.');
          console.log(err);
        },
      });
  }

  onPageChangeReporte1(event: PaginatorState): void {
    this.first = event.first || 0;
    this.rows = event.rows || 10;
    this.page = Number(event.page) + 1 || 1;
    this.cargarReporteValidacionesDiarias();
  }

  /** Carga el reporte de validaciones por auxiliares y sub-reportes 2.1 a 2.4. */
  cargarReporteAuxiliares(): void {
    this.loadingReporte2 = true;
    const fechas = this.getFechasPayload();
    const payloadCombinado: FilterReporteEstadoAfiliacion = { ...fechas, tipo_formulario: null };
    const payloadIndividual: FilterReporteEstadoAfiliacion = { ...fechas, tipo_formulario: 'INDIVIDUAL' };
    const payloadMasiva: FilterReporteEstadoAfiliacion = { ...fechas, tipo_formulario: 'MASIVA' };

    forkJoin({
      porResponsable: this.userService.getReportePorResponsableAfiliacion(fechas),
      sinAsignar: this.userService.getReporteSinAsignarAfiliacion(fechas),
      porEstadoAfiliado: this.userService.getReportePorEstadoAfiliacion(payloadCombinado),
      individualPorEstado: this.userService.getReportePorEstadoAfiliacion(payloadIndividual),
      masivaPorEstado: this.userService.getReportePorEstadoAfiliacion(payloadMasiva),
    })
      .pipe(finalize(() => (this.loadingReporte2 = false)))
      .subscribe({
        next: result => {
          this.reporteAuxiliares = result.porResponsable?.data ?? [];
          this.reporteSinAsignar = result.sinAsignar?.data ?? [];
          this.reportePorEstadoAfiliado = result.porEstadoAfiliado?.data ?? [];
          this.reporteIndividualPorEstado = result.individualPorEstado?.data ?? [];
          this.reporteMasivaPorEstado = result.masivaPorEstado?.data ?? [];
        },
        error: (err: any) => {
          this.showMessage('error', 'Fallida', 'No fue posible cargar el reporte por auxiliares.');
          console.log(err);
        },
      });
  }

  /** Carga el reporte de procesamiento RPA. */
  cargarReporteRpa(): void {
    this.loadingReporte3 = true;
    const payload = this.getFechasPayload();
    this.userService
      .getReporteRpaAfiliacion(payload)
      .pipe(finalize(() => (this.loadingReporte3 = false)))
      .subscribe({
        next: (response: BodyResponse<ReporteRpaRow[]>) => {
          if (response.code === 200) {
            this.reporteRpa = response.data ?? [];
          } else {
            this.showMessage('error', 'Fallida', 'Operación fallida!');
          }
        },
        error: (err: any) => {
          this.showMessage('error', 'Fallida', 'No fue posible cargar el reporte RPA.');
          console.log(err);
        },
      });
  }

  showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}
