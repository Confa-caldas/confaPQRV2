import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  BulkChangeRpaStatusPayload,
  FilterRpaAfiInconsistency,
  RequestsListAfiliation,
  RpaAfiInconsistencyListItem,
} from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { forkJoin } from 'rxjs';
import { RoutesApp } from '../../../enums/routes.enum';
import { SessionStorageItems } from '../../../enums/session-storage-items.enum';

@Component({
  selector: 'app-search-rpa-afi-inconsistency',
  templateUrl: './search-rpa-afi-inconsistency.component.html',
  styleUrl: './search-rpa-afi-inconsistency.component.scss',
})
export class SearchRpaAfiInconsistencyComponent implements OnInit {
  static readonly ID_ESTADO_PENDIENTE_AFILIACION_RPA = 1;

  formGroup = new FormGroup({
    filing_number: new FormControl<string | null>(null),
    doc_id_tr: new FormControl<string | null>(null),
    doc_id_bn: new FormControl<string | null>(null),
    transaccion: new FormControl<string | null>(null),
    con_radicado_genesys: new FormControl<'Si' | 'No' | null>(null),
  });

  readonly genesysOpciones = [
    { label: 'Si', value: 'Si' as const },
    { label: 'No', value: 'No' as const },
  ];

  readonly estadoCambioOpciones = [{ label: 'Pendiente afiliación Rpa', value: 1 }];

  requestList: RpaAfiInconsistencyListItem[] = [];
  selectedRequests: RpaAfiInconsistencyListItem[] = [];
  requestDetails!: RpaAfiInconsistencyListItem;

  first = 0;
  page = 1;
  rows = 10;
  totalRows = 0;
  loading = true;
  PERFIL = '';

  visibleDialogInput = false;
  visibleDialogAlert = false;
  visibleDialogCambiarEstado = false;
  message = '';
  message2 = '';
  buttonmsg = '';
  parameter = [''];
  informative = false;
  severity = '';
  enableAssign = false;
  isBulkAssign = false;
  estadoCambioSeleccionado = SearchRpaAfiInconsistencyComponent.ID_ESTADO_PENDIENTE_AFILIACION_RPA;
  guardandoCambioEstado = false;

  @ViewChild('dt') table!: Table;

  constructor(
    private userService: Users,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadSavedFilters();
    this.PERFIL = sessionStorage.getItem(SessionStorageItems.PERFIL) || '';
    this.searchRequests();
    this.loading = false;
  }

  private loadSavedFilters(): void {
    const filtrosGuardados = sessionStorage.getItem('filtrosBusquedaRpaInconsistencia');
    const paginacionGuardada = sessionStorage.getItem('estadoPaginacionRpaInconsistencia');

    if (filtrosGuardados) {
      try {
        this.formGroup.patchValue(JSON.parse(filtrosGuardados));
      } catch {
        console.error('Error al cargar filtros RPA inconsistencia');
      }
    }

    if (paginacionGuardada) {
      try {
        const paginacion = JSON.parse(paginacionGuardada);
        this.first = paginacion.first || 0;
        this.rows = paginacion.rows || 10;
        this.page = paginacion.page || 1;
      } catch {
        console.error('Error al cargar paginación RPA inconsistencia');
      }
    }
  }

  private buildFilterPayload(): FilterRpaAfiInconsistency {
    const v = this.formGroup.value;
    return {
      filing_number: v.filing_number?.toString().trim() || null,
      doc_id_tr: v.doc_id_tr?.trim() || null,
      doc_id_bn: v.doc_id_bn?.trim() || null,
      transaccion: v.transaccion?.trim() || null,
      con_radicado_genesys: v.con_radicado_genesys ?? null,
      page: this.page,
      page_size: this.rows,
    };
  }

  searchRequests(): void {
    this.loading = true;
    this.userService.getRpaAfiInconsistencyListByFilter(this.buildFilterPayload()).subscribe({
      next: (response: BodyResponse<RpaAfiInconsistencyListItem[]>) => {
        if (response.code === 200) {
          this.requestList = (response.data ?? []).map(item => ({
            ...item,
            filing_date: item.filing_date
              ? formatDate(item.filing_date, 'MM/dd/yyyy', 'en-US')
              : item.filing_date,
          }));
          this.totalRows = Number(response.message);
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
    this.searchRequests();
  }

  initPaginador(): void {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.searchRequests();
  }

  cleanForm(): void {
    sessionStorage.removeItem('filtrosBusquedaRpaInconsistencia');
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.formGroup.reset();
    this.requestList = [];
    this.selectedRequests = [];
    this.searchRequests();
  }

  redirectDetails(id: number): void {
    sessionStorage.setItem('filtrosBusquedaRpaInconsistencia', JSON.stringify(this.formGroup.value));
    sessionStorage.setItem(
      'estadoPaginacionRpaInconsistencia',
      JSON.stringify({ first: this.first, rows: this.rows, page: this.page })
    );
    localStorage.setItem('route', this.router.url);
    this.router.navigate([RoutesApp.REQUEST_DETAILS_AFILIATION, id]);
  }

  tieneResponsable(row: RpaAfiInconsistencyListItem): boolean {
    return !!row.assigned_user?.trim();
  }

  todasSeleccionadasPuedenAsignar(): boolean {
    return (
      this.selectedRequests.length > 0 &&
      this.selectedRequests.every(r => !this.tieneResponsable(r))
    );
  }

  todasSeleccionadasPuedenCambiarEstado(): boolean {
    return (
      this.selectedRequests.length > 0 &&
      this.selectedRequests.every(r => this.tieneResponsable(r))
    );
  }

  private toAssignPayload(row: RpaAfiInconsistencyListItem): RequestsListAfiliation {
    return {
      request_id: row.request_id,
      filing_number: row.filing_number,
      filing_date: row.filing_date,
      doc_trabajador: row.doc_id_tr || row.doc_trabajador || '',
      name_trabajador: '',
      documents_beneficiarios: row.doc_id_bn || row.documents_beneficiarios || '',
      names_beneficiarios: '',
      name_empresa: row.name_empresa,
      request_status: row.request_status,
      cod_estatus: row.cod_estatus || '',
      assigned_user: row.assigned_user ?? null,
      user_name_completed: row.user_name_completed ?? '',
      mensaje_reasignacion: row.mensaje_reasignacion ?? '',
      total_count: row.total_count ?? 0,
      id_empresa: '',
    };
  }

  assignRequest(row: RpaAfiInconsistencyListItem): void {
    this.isBulkAssign = false;
    this.requestDetails = row;

    if (!this.tieneResponsable(row)) {
      this.message = 'Asignar responsable de solicitud';
      this.buttonmsg = 'Asignar';
      row.request_status = 2;
    } else {
      this.message = 'Reasignar responsable de solicitud';
      this.buttonmsg = 'Reasignar';
      row.request_status = 3;
    }

    this.visibleDialogInput = true;
    this.parameter = ['Colaborador'];
  }

  assignSelectedRequests(): void {
    if (!this.todasSeleccionadasPuedenAsignar()) {
      this.showMessage(
        'warn',
        'Asignación no disponible',
        'Solo puede asignar solicitudes sin responsable asignado.'
      );
      return;
    }
    this.isBulkAssign = true;
    this.message = 'Asignar responsable a solicitudes seleccionadas';
    this.buttonmsg = 'Asignar';
    this.parameter = ['Colaborador'];
    this.visibleDialogInput = true;
  }

  abrirModalCambiarEstado(): void {
    if (!this.todasSeleccionadasPuedenCambiarEstado()) {
      this.showMessage(
        'warn',
        'Cambio de estado no disponible',
        'Solo puede cambiar el estado de solicitudes que ya tienen responsable asignado.'
      );
      return;
    }
    this.estadoCambioSeleccionado =
      SearchRpaAfiInconsistencyComponent.ID_ESTADO_PENDIENTE_AFILIACION_RPA;
    this.visibleDialogCambiarEstado = true;
  }

  cancelarCambioEstado(): void {
    this.visibleDialogCambiarEstado = false;
  }

  confirmarCambioEstado(): void {
    const payload: BulkChangeRpaStatusPayload = {
      request_ids: this.selectedRequests.map(r => r.request_id),
      id_estado_solicitud: this.estadoCambioSeleccionado,
    };
    this.guardandoCambioEstado = true;
    this.userService.bulkChangeRpaAfiInconsistencyStatus(payload).subscribe({
      next: (response: BodyResponse<string>) => {
        if (response.code === 200) {
          this.showMessage('success', 'Exitoso', 'Estado actualizado correctamente.');
          this.visibleDialogCambiarEstado = false;
          this.selectedRequests = [];
          this.table?.clear();
          this.searchRequests();
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

  closeDialogInput(value: boolean): void {
    this.visibleDialogInput = false;
    this.enableAssign = value;
  }

  closeDialogAlert(value: boolean): void {
    this.visibleDialogAlert = false;
    this.enableAssign = value;
  }

  setParameter(inputValue: {
    userName: string;
    userNameCompleted: string;
    mensajeReasignacion: string;
  }): void {
    if (!this.enableAssign) {
      return;
    }

    if (this.isBulkAssign) {
      const requests = this.selectedRequests.map(row => {
        const payload = this.toAssignPayload(row);
        payload.assigned_user = inputValue.userName;
        payload.user_name_completed = inputValue.userNameCompleted;
        payload.mensaje_reasignacion = inputValue.mensajeReasignacion;
        payload.request_status = 2;
        return this.userService.assignUserToRequestAfiliation(payload);
      });

      forkJoin(requests).subscribe({
        next: responses => {
          responses.forEach((response, index) => {
            const id = this.selectedRequests[index]?.request_id ?? 'Desconocido';
            if (response.code === 200) {
              this.showMessage('success', 'Éxito', `Asignado: ${id}`);
            } else {
              this.showMessage('error', 'Falló', `Falló asignación: ${id}`);
            }
          });
        },
        error: err => {
          console.error(err);
          this.showMessage('error', 'Error', 'Error durante la asignación masiva.');
        },
        complete: () => {
          this.selectedRequests = [];
          this.table?.clear();
          this.visibleDialogInput = false;
          this.searchRequests();
        },
      });
      return;
    }

    if (this.requestDetails.assigned_user === inputValue.userName) {
      this.visibleDialogAlert = true;
      this.informative = true;
      this.message = 'Verifique el responsable a asignar';
      this.message2 = 'Debe seleccionar un colaborador diferente';
      this.severity = 'danger';
      return;
    }

    const payload = this.toAssignPayload(this.requestDetails);
    payload.assigned_user = inputValue.userName;
    payload.user_name_completed = inputValue.userNameCompleted;
    payload.mensaje_reasignacion = inputValue.mensajeReasignacion;

    this.userService.assignUserToRequestAfiliation(payload).subscribe({
      next: (response: BodyResponse<unknown>) => {
        if (response.code === 200) {
          this.showMessage('success', 'Éxito', 'Asignación exitosa');
        } else {
          this.showMessage('error', 'Falló', 'Asignación fallida');
        }
      },
      error: err => console.error(err),
      complete: () => {
        this.visibleDialogInput = false;
        this.searchRequests();
      },
    });
  }

  tipoDocTrabajador(row: RpaAfiInconsistencyListItem): string {
    return row.tipo_doc_trabajador || row.type_doc_id_tr || '—';
  }

  docTrabajador(row: RpaAfiInconsistencyListItem): string {
    return row.doc_id_tr || row.doc_trabajador || '—';
  }

  tipoDocBeneficiario(row: RpaAfiInconsistencyListItem): string {
    return row.tipo_doc_beneficiario || row.tipos_doc_beneficiarios || '—';
  }

  docBeneficiario(row: RpaAfiInconsistencyListItem): string {
    return row.doc_id_bn || row.documents_beneficiarios || '—';
  }

  private showMessage(state: string, title: string, detail: string): void {
    this.messageService.add({ severity: state, summary: title, detail });
  }
}
