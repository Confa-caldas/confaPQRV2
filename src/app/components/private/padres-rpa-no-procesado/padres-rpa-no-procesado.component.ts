import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  FilterPadresRpaNoProcesado,
  PadreRpaNoProcesadoListItem,
  ResponsibleList,
} from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { RoutesApp } from '../../../enums/routes.enum';

@Component({
  selector: 'app-padres-rpa-no-procesado',
  templateUrl: './padres-rpa-no-procesado.component.html',
  styleUrl: './padres-rpa-no-procesado.component.scss',
})
export class PadresRpaNoProcesadoComponent implements OnInit {
  formGroup = new FormGroup({
    tipoDocumentoBeneficiario: new FormControl<string | null>(null),
    numeroDocumentoBeneficiario: new FormControl<string | null>(null),
    tipoDocumentoTrabajador: new FormControl<string | null>(null),
    numeroDocumentoTrabajador: new FormControl<string | null>(null),
  });

  rowList: PadreRpaNoProcesadoListItem[] = [];
  selectedRows: PadreRpaNoProcesadoListItem[] = [];

  first = 0;
  page = 1;
  rows = 10;
  totalRows = 0;
  loading = true;

  visibleDialogAsignar = false;
  responsableOpciones: ResponsibleList[] = [];
  responsableSeleccionado: string | null = null;
  guardandoAsignacion = false;

  visibleDialogCambiarEstado = false;
  guardandoCambioEstado = false;

  @ViewChild('dt') table!: Table;

  constructor(
    private userService: Users,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadSavedFilters();
    this.searchRows();
  }

  private loadSavedFilters(): void {
    const filtrosGuardados = sessionStorage.getItem('filtrosBusquedaPadresRpaNoProcesado');
    const paginacionGuardada = sessionStorage.getItem('estadoPaginacionPadresRpaNoProcesado');

    if (filtrosGuardados) {
      try {
        this.formGroup.patchValue(JSON.parse(filtrosGuardados));
      } catch {
        console.error('Error al cargar filtros padres RPA no procesado');
      }
    }

    if (paginacionGuardada) {
      try {
        const paginacion = JSON.parse(paginacionGuardada);
        this.first = paginacion.first || 0;
        this.rows = paginacion.rows || 10;
        this.page = paginacion.page || 1;
      } catch {
        console.error('Error al cargar paginación padres RPA no procesado');
      }
    }
  }

  private buildFilterPayload(): FilterPadresRpaNoProcesado {
    const v = this.formGroup.value;
    return {
      tipoDocumentoBeneficiario: v.tipoDocumentoBeneficiario?.trim() || null,
      numeroDocumentoBeneficiario: v.numeroDocumentoBeneficiario?.trim() || null,
      tipoDocumentoTrabajador: v.tipoDocumentoTrabajador?.trim() || null,
      numeroDocumentoTrabajador: v.numeroDocumentoTrabajador?.trim() || null,
      page: this.page,
      pageSize: this.rows,
    };
  }

  searchRows(): void {
    this.loading = true;
    this.userService.getPadresRpaNoProcesadosByFilter(this.buildFilterPayload()).subscribe({
      next: (response: BodyResponse<PadreRpaNoProcesadoListItem[]>) => {
        if (response.code === 200) {
          this.rowList = response.data ?? [];
          this.totalRows = Number(response.message) || this.rowList[0]?.total_count || 0;
        } else {
          this.showMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: err => console.error(err),
      complete: () => {
        this.loading = false;
      },
    });
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
  }

  cleanForm(): void {
    sessionStorage.removeItem('filtrosBusquedaPadresRpaNoProcesado');
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.formGroup.reset();
    this.selectedRows = [];
    this.searchRows();
  }

  redirectDetails(row: PadreRpaNoProcesadoListItem): void {
    sessionStorage.setItem('filtrosBusquedaPadresRpaNoProcesado', JSON.stringify(this.formGroup.value));
    sessionStorage.setItem(
      'estadoPaginacionPadresRpaNoProcesado',
      JSON.stringify({ first: this.first, rows: this.rows, page: this.page })
    );
    this.router.navigate([RoutesApp.REQUEST_DETAILS_AFILIATION, row.id_solicitud]);
  }

  estaAsignado(row: PadreRpaNoProcesadoListItem): boolean {
    return !!row.usuario_asignado?.trim();
  }

  todasSeleccionadasPuedenCambiarEstado(): boolean {
    return this.selectedRows.length > 0 && this.selectedRows.every(r => this.estaAsignado(r));
  }

  // ---------------------------------------------------------------------
  // Asignar colaborador (masivo, a nivel de beneficiario)
  // ---------------------------------------------------------------------
  abrirModalAsignar(): void {
    if (this.selectedRows.length === 0) {
      this.showMessage('warn', 'Asignación no disponible', 'Debe seleccionar al menos una fila.');
      return;
    }
    this.responsableSeleccionado = null;
    this.visibleDialogAsignar = true;
    if (this.responsableOpciones.length === 0) {
      this.cargarResponsables();
    }
  }

  private cargarResponsables(): void {
    this.userService.getResponsibleListPagination({ page: 1, page_size: 1000 }).subscribe({
      next: (response: BodyResponse<ResponsibleList[]>) => {
        this.responsableOpciones = (response.data ?? []).filter(r => r.esta_activo !== false);
      },
      error: err => console.error(err),
    });
  }

  cancelarAsignar(): void {
    this.visibleDialogAsignar = false;
  }

  confirmarAsignar(): void {
    if (!this.responsableSeleccionado) {
      return;
    }
    const idsSolicitudPersona = [...new Set(this.selectedRows.map(r => r.id_solicitud_persona))];

    this.guardandoAsignacion = true;
    this.userService
      .asignarUsuarioPadresRpa({
        idsSolicitudPersona,
        usuarioAsignado: this.responsableSeleccionado,
      })
      .subscribe({
        next: (response: BodyResponse<null>) => {
          if (response.code === 200) {
            this.showMessage('success', 'Exitoso', 'Colaborador asignado correctamente.');
            this.visibleDialogAsignar = false;
            this.selectedRows = [];
            this.table?.clear();
            this.searchRows();
          } else {
            this.showMessage('error', 'Fallida', response.message || 'No se pudo asignar el colaborador.');
          }
        },
        error: err => {
          console.error(err);
          this.showMessage('error', 'Error', 'Error al asignar el colaborador.');
        },
        complete: () => {
          this.guardandoAsignacion = false;
        },
      });
  }

  // ---------------------------------------------------------------------
  // Cambiar estado Rpa padres (masivo, a nivel de solicitud)
  // ---------------------------------------------------------------------
  abrirModalCambiarEstado(): void {
    if (!this.todasSeleccionadasPuedenCambiarEstado()) {
      this.showMessage(
        'warn',
        'Cambio de estado no disponible',
        'Solo puede cambiar el estado de beneficiarios que ya tienen colaborador asignado.'
      );
      return;
    }
    this.visibleDialogCambiarEstado = true;
  }

  cancelarCambioEstado(): void {
    this.visibleDialogCambiarEstado = false;
  }

  confirmarCambioEstado(): void {
    const idsSolicitud = [...new Set(this.selectedRows.map(r => r.id_solicitud))];

    this.guardandoCambioEstado = true;
    this.userService.cambiarEstadoMasivoPadresRpa({ idsSolicitud }).subscribe({
      next: (response: BodyResponse<null>) => {
        if (response.code === 200) {
          this.showMessage('success', 'Exitoso', 'Estado actualizado correctamente.');
          this.visibleDialogCambiarEstado = false;
          this.selectedRows = [];
          this.table?.clear();
          this.searchRows();
        } else {
          this.showMessage('error', 'Fallida', response.message || 'No se pudo cambiar el estado.');
        }
      },
      error: err => {
        console.error(err);
        this.showMessage('error', 'Error', 'Error al cambiar el estado.');
      },
      complete: () => {
        this.guardandoCambioEstado = false;
      },
    });
  }

  private showMessage(state: string, title: string, detail: string): void {
    this.messageService.add({ severity: state, summary: title, detail });
  }
}
