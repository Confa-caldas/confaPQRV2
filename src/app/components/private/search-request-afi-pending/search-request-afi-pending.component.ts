import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  ApplicantTypeList,
  RequestTypeList,
  RequestsListAfiliation,
  UserList,
  afiliacionIndicadoresPermitenAsignar,
  MENSAJE_TOOLTIP_ASIGNAR_AFILIACION_INHABILITADA,
} from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { Table } from 'primeng/table';
import { BaseRequestsDirective } from '../../../shared/directives/base-requests.directive';

@Component({
  selector: 'app-search-request-afi-pending',
  templateUrl: './search-request-afi-pending.component.html',
  styleUrl: './search-request-afi-pending.component.scss',
})
export class SearchRequestAfiPendingComponent extends BaseRequestsDirective {
  /**
   * ID de estado "Pendiente asignación" en catálogo (alineado con búsqueda masiva y PQRS interno que usan `[1]`).
   * El payload ignora el control `request_status_id` del formulario y fuerza este valor.
   */
  static readonly STATUS_ID_PENDIENTE_ASIGNACION = 1;

  aplicantList: ApplicantTypeList[] = [];
  requestTypeList: RequestTypeList[] = [];
  requestUserList: UserList[] = [];

  ingredient!: string;
  visibleDialog = false;
  visibleDialogInput = false;
  message = '';
  message2 = '';
  buttonmsg = '';
  parameter = [''];
  request_details!: RequestsListAfiliation;
  informative: boolean = false;
  severity = '';
  visibleDialogAlert = false;
  statusOptions!: string[];
  daysOption!: number[];
  selectedDaysOptions!: number[];
  selectedStatusOptions!: string[];
  enableAssign: boolean = false;
  mensajeReasignacion: string = '';

  solicitudes: any[] = [];

  isBulkAssign: boolean = false;
  selectedRequests: RequestsListAfiliation[] = [];
  readonly mensajeTooltipAsignarInhabilitada = MENSAJE_TOOLTIP_ASIGNAR_AFILIACION_INHABILITADA;
  @ViewChild('dt') table!: Table;

  constructor(
    userService: Users,
    router: Router,
    messageService: MessageService
  ) {
    super(userService, router, messageService);
  }

  /**
   * Pendientes: `status_id` siempre fijo a {@link STATUS_ID_PENDIENTE_ASIGNACION}, sin usar el multiselect de estado.
   */
  searchRequests(): void {
    const filtros = this.getMergedFiltros();
    this.getRequestListByFilter(
      this.buildAfiliationFilterPayload(filtros, [
        SearchRequestAfiPendingComponent.STATUS_ID_PENDIENTE_ASIGNACION,
      ])
    );
  }

  puedeActivarAsignar(row: RequestsListAfiliation): boolean {
    return afiliacionIndicadoresPermitenAsignar(row);
  }

  todasSeleccionadasPuedenAsignar(): boolean {
    return (
      this.selectedRequests.length > 0 &&
      this.selectedRequests.every(r => afiliacionIndicadoresPermitenAsignar(r))
    );
  }

  /**
   * Misma regla que el botón Asignar por fila: solo filas en estado asignable e indicadores OK.
   * PrimeNG usa esto al marcar el header y al filtrar la selección masiva.
   */
  readonly esFilaSeleccionableParaAsignar = (row: {
    data: RequestsListAfiliation;
    index: number;
  }): boolean => row.data.request_status === 1 && this.puedeActivarAsignar(row.data);

  /** Deshabilita el checkbox de cabecera si no hay ninguna fila que pueda seleccionarse/asignarse en la página actual. */
  hayFilasSeleccionablesParaAsignar(): boolean {
    return this.requestList.some(
      r => r.request_status === 1 && this.puedeActivarAsignar(r)
    );
  }

  assignRequest(request_details: RequestsListAfiliation) {
    this.isBulkAssign = false;

    if (!afiliacionIndicadoresPermitenAsignar(request_details)) {
      this.showSuccessMessage(
        'warn',
        'Asignación no disponible',
        'No puede asignar mientras pendiente dirección, pendiente activar empresa o novedad restrictiva esté en Sí.'
      );
      return;
    }

    if (request_details.assigned_user == null || request_details.assigned_user == '') {
      this.message = 'Asignar responsable de solicitud';
      this.buttonmsg = 'Asignar';
      request_details.request_status = 2;
    } else {
      this.message = 'Reasignar responsable de solicitud';
      this.buttonmsg = 'Reasignar';
      request_details.request_status = 3;
    }
    this.visibleDialogInput = true;
    this.parameter = ['Colaborador'];
    this.request_details = request_details;
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
      //
    }
  }
  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAssign = value;
  }

  setParameter(inputValue: {
    userName: string;
    userNameCompleted: string;
    mensajeReasignacion: string;
  }) {
    if (!this.enableAssign) return;

    if (this.isBulkAssign) {
      const requestsToAssign = this.selectedRequests.map(request => {
        request.assigned_user = inputValue.userName;
        request.user_name_completed = inputValue.userNameCompleted;
        request.mensaje_reasignacion = inputValue.mensajeReasignacion;
        request.request_status = 2;

        return this.userService.assignUserToRequestAfiliation(request);
      });

      forkJoin(requestsToAssign).subscribe({
        next: responses => {
          responses.forEach((response, index) => {
            const filingNumber = this.selectedRequests[index]?.request_id || 'Desconocido';
            if (response.code === 200) {
              this.showSuccessMessage('success', 'Éxito', `Asignado: ${filingNumber}`);
            } else {
              this.showSuccessMessage('error', 'Falló', `Falló asignación: ${filingNumber}`);
            }
          });
        },
        error: err => {
          console.error('Error en asignación masiva:', err);
          this.showSuccessMessage('error', 'Error', 'Error durante la asignación masiva.');
        },
        complete: () => {
          this.selectedRequests = [];
          this.table?.clear();
          this.visibleDialogInput = false;
          this.ngOnInit();
        },
      });
    } else {
      if (this.request_details.assigned_user === inputValue.userName) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Verifique el responsable a asignar';
        this.message2 = 'Debe seleccionar un colaborador diferente';
        this.severity = 'danger';
        return;
      }

      this.request_details.assigned_user = inputValue.userName;
      this.request_details.user_name_completed = inputValue.userNameCompleted;
      this.request_details.mensaje_reasignacion = inputValue.mensajeReasignacion;

      console.log('-------------------este---------', this.request_details);

      this.userService.assignUserToRequestAfiliation(this.request_details).subscribe({
        next: (response: BodyResponse<unknown>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Éxito', 'Asignación exitosa');
          } else {
            this.showSuccessMessage('error', 'Falló', 'Asignación fallida');
          }
        },
        error: err => console.error(err),
        complete: () => {
          this.visibleDialogInput = false;
          this.ngOnInit();
        },
      });
    }
  }

  asignarSeleccionadas(): void {
    console.log('Solicitudes seleccionadas:', this.selectedRequests);
  }

  assignSelectedRequests(requests: RequestsListAfiliation[]) {
    if (!requests || requests.length === 0) return;

    const noCumplen = requests.filter(r => !afiliacionIndicadoresPermitenAsignar(r));
    if (noCumplen.length > 0) {
      this.showSuccessMessage(
        'warn',
        'Asignación no disponible',
        'No puede asignar en lote si alguna solicitud tiene pendiente dirección, pendiente activar empresa o novedad restrictiva en Sí.'
      );
      return;
    }

    this.isBulkAssign = true;
    this.selectedRequests = requests;

    this.message = 'Asignar responsable a solicitudes seleccionadas';
    this.buttonmsg = 'Asignar';
    this.parameter = ['Colaborador'];
    this.visibleDialogInput = true;
  }
}
