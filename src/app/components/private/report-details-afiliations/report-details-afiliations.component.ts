import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';

/** Fila del reporte de validaciones diarias */
export interface ReporteValidacionesDiariasRow {
  diaMesAfiliacion?: string;
  numeroRadicado?: string;
  numeroDocumentoTrabajador?: string;
  procedenciaFormulario?: string;
  tipoFormulario?: string;
  estadoSolicitud?: string;
  fechaProcesamientoAfiliacion?: string;
  fechaAsignacionRevision?: string;
  observacionFinal?: string;
}

/** Fila del reporte por auxiliares */
export interface ReporteAuxiliaresRow {
  responsable?: string;
  cantidadAsignadas?: number;
  cantidadReasignadas?: number;
}

/** Fila: solicitudes sin asignar por fecha */
export interface ReporteSinAsignarRow {
  fechaSolicitud?: string;
  cantidadPendienteAsignacion?: number;
}

/** Fila: solicitudes por estado afiliado */
export interface ReportePorEstadoAfiliadoRow {
  estado?: string;
  cantidad?: number;
}

/** Fila: afiliación individual por estado */
export interface ReporteIndividualPorEstadoRow {
  estado?: string;
  cantidad?: number;
}

/** Fila: afiliación masiva por estado */
export interface ReporteMasivaPorEstadoRow {
  estado?: string;
  cantidad?: number;
}

/** Fila del reporte RPA */
export interface ReporteRpaRow {
  fecha?: string;
  cantidadProcesadasAutomaticamente?: number;
  cantidadDevueltasPorErrorRpa?: number;
}

@Component({
  selector: 'app-report-details-afiliations',
  templateUrl: './report-details-afiliations.component.html',
  styleUrl: './report-details-afiliations.component.scss',
})
export class ReportDetailsAfiliationsComponent implements OnInit {
  /** Reporte 1: Validaciones diarias */
  reporteValidacionesDiarias: ReporteValidacionesDiariasRow[] = [];
  loadingReporte1 = false;

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

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.cargarReporteValidacionesDiarias();
    this.cargarReporteAuxiliares();
    this.cargarReporteRpa();
  }

  /** Carga el reporte de validaciones diarias. Conectar con tu API. */
  cargarReporteValidacionesDiarias(): void {
    this.loadingReporte1 = true;
    // TODO: this.userService.getReporteValidacionesDiariasAfiliacion(...).subscribe(...)
    this.reporteValidacionesDiarias = this.getDummyValidacionesDiarias();
    this.loadingReporte1 = false;
  }

  /** Carga el reporte de validaciones por auxiliares y sub-reportes 2.1 a 2.4. Conectar con tu API. */
  cargarReporteAuxiliares(): void {
    this.loadingReporte2 = true;
    // TODO: llamadas a API para reporte por responsable, sin asignar, por estado afiliado, individual, masiva
    this.reporteAuxiliares = this.getDummyAuxiliares();
    this.reporteSinAsignar = this.getDummySinAsignar();
    this.reportePorEstadoAfiliado = this.getDummyPorEstadoAfiliado();
    this.reporteIndividualPorEstado = this.getDummyIndividualPorEstado();
    this.reporteMasivaPorEstado = this.getDummyMasivaPorEstado();
    this.loadingReporte2 = false;
  }

  /** Carga el reporte de procesamiento RPA. Conectar con tu API. */
  cargarReporteRpa(): void {
    this.loadingReporte3 = true;
    // TODO: this.userService.getReporteRpaAfiliacion(...).subscribe(...)
    this.reporteRpa = this.getDummyRpa();
    this.loadingReporte3 = false;
  }

  /** Datos dummy: Reporte de validaciones diarias */
  private getDummyValidacionesDiarias(): ReporteValidacionesDiariasRow[] {
    return [
      {
        diaMesAfiliacion: '04/02/2025',
        numeroRadicado: 'RAD-2025-001234',
        numeroDocumentoTrabajador: '12345678',
        procedenciaFormulario: 'Empresa',
        tipoFormulario: 'Individual',
        estadoSolicitud: 'Aprobado',
        fechaProcesamientoAfiliacion: '04/02/2025 10:30',
        fechaAsignacionRevision: '03/02/2025 14:00',
        observacionFinal: 'Afiliación confirmada correctamente.',
      },
      {
        diaMesAfiliacion: '04/02/2025',
        numeroRadicado: 'RAD-2025-001235',
        numeroDocumentoTrabajador: '87654321',
        procedenciaFormulario: 'Agencias',
        tipoFormulario: 'Masivo',
        estadoSolicitud: 'Pendiente',
        fechaProcesamientoAfiliacion: '-',
        fechaAsignacionRevision: '04/02/2025 09:15',
        observacionFinal: '-',
      },
      {
        diaMesAfiliacion: '03/02/2025',
        numeroRadicado: 'RAD-2025-001220',
        numeroDocumentoTrabajador: '11223344',
        procedenciaFormulario: 'Mi Perfil',
        tipoFormulario: 'Individual',
        estadoSolicitud: 'Rechazado',
        fechaProcesamientoAfiliacion: '03/02/2025 16:45',
        fechaAsignacionRevision: '03/02/2025 11:00',
        observacionFinal: 'Documento de identidad vencido.',
      },
      {
        diaMesAfiliacion: '03/02/2025',
        numeroRadicado: 'RAD-2025-001218',
        numeroDocumentoTrabajador: '55667788',
        procedenciaFormulario: 'Empresa',
        tipoFormulario: 'Individual',
        estadoSolicitud: 'Aprobado',
        fechaProcesamientoAfiliacion: '03/02/2025 15:20',
        fechaAsignacionRevision: '02/02/2025 16:30',
        observacionFinal: 'Afiliación completada sin observaciones.',
      },
      {
        diaMesAfiliacion: '04/02/2025',
        numeroRadicado: 'RAD-2025-001240',
        numeroDocumentoTrabajador: '99887766',
        procedenciaFormulario: 'Agencias',
        tipoFormulario: 'Individual',
        estadoSolicitud: 'Pendiente',
        fechaProcesamientoAfiliacion: '-',
        fechaAsignacionRevision: '04/02/2025 08:00',
        observacionFinal: 'En revisión por auxiliar.',
      },
    ];
  }

  /** Datos dummy: Por responsable (asignadas, reasignadas) */
  private getDummyAuxiliares(): ReporteAuxiliaresRow[] {
    return [
      { responsable: 'María García López', cantidadAsignadas: 12, cantidadReasignadas: 2 },
      { responsable: 'Carlos Rodríguez Pérez', cantidadAsignadas: 8, cantidadReasignadas: 1 },
      { responsable: 'Ana Martínez Sánchez', cantidadAsignadas: 15, cantidadReasignadas: 3 },
      { responsable: 'Luis Fernández Díaz', cantidadAsignadas: 6, cantidadReasignadas: 0 },
      { responsable: 'Laura Gómez Hernández', cantidadAsignadas: 10, cantidadReasignadas: 2 },
    ];
  }

  /** Datos dummy: Solicitudes sin asignar por fecha */
  private getDummySinAsignar(): ReporteSinAsignarRow[] {
    return [
      { fechaSolicitud: '04/02/2025', cantidadPendienteAsignacion: 7 },
      { fechaSolicitud: '03/02/2025', cantidadPendienteAsignacion: 3 },
      { fechaSolicitud: '02/02/2025', cantidadPendienteAsignacion: 1 },
      { fechaSolicitud: '01/02/2025', cantidadPendienteAsignacion: 0 },
    ];
  }

  /** Datos dummy: Por estado afiliado */
  private getDummyPorEstadoAfiliado(): ReportePorEstadoAfiliadoRow[] {
    return [
      { estado: 'Pendiente asignación', cantidad: 11 },
      { estado: 'Asignada (Revisión back)', cantidad: 28 },
      { estado: 'Reasignada (Revisión back)', cantidad: 8 },
      { estado: 'Pendiente afiliación RPA', cantidad: 15 },
      { estado: 'Inconsistencias RPA', cantidad: 4 },
      { estado: 'Procesado', cantidad: 42 },
      { estado: 'Rechazado', cantidad: 6 },
    ];
  }

  /** Datos dummy: Afiliación individual por estado */
  private getDummyIndividualPorEstado(): ReporteIndividualPorEstadoRow[] {
    return [
      { estado: 'Pendiente', cantidad: 18 },
      { estado: 'Rechazada', cantidad: 5 },
      { estado: 'Aprobada Completa', cantidad: 32 },
      { estado: 'Aprobada Incompleta', cantidad: 3 },
    ];
  }

  /** Datos dummy: Afiliación masiva por estado */
  private getDummyMasivaPorEstado(): ReporteMasivaPorEstadoRow[] {
    return [
      { estado: 'Pendiente cruces', cantidad: 12 },
      { estado: 'Notificado inicio', cantidad: 8 },
      { estado: 'Notificado fin', cantidad: 6 },
    ];
  }

  /** Datos dummy: Reporte RPA */
  private getDummyRpa(): ReporteRpaRow[] {
    return [
      { fecha: '04/02/2025', cantidadProcesadasAutomaticamente: 45, cantidadDevueltasPorErrorRpa: 2 },
      { fecha: '03/02/2025', cantidadProcesadasAutomaticamente: 38, cantidadDevueltasPorErrorRpa: 1 },
      { fecha: '02/02/2025', cantidadProcesadasAutomaticamente: 52, cantidadDevueltasPorErrorRpa: 4 },
      { fecha: '01/02/2025', cantidadProcesadasAutomaticamente: 41, cantidadDevueltasPorErrorRpa: 0 },
      { fecha: '31/01/2025', cantidadProcesadasAutomaticamente: 29, cantidadDevueltasPorErrorRpa: 3 },
    ];
  }

  showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}
