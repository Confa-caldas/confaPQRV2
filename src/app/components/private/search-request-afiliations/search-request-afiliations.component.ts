import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  ApplicantTypeList,
  RequestTypeList,
  RequestsListAfiliation,
  RequestsList,
  UserList,
} from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { Table } from 'primeng/table';
import { BaseRequestsDirective } from '../../../shared/directives/base-requests.directive';

@Component({
  selector: 'app-search-request-afiliations',
  templateUrl: './search-request-afiliations.component.html',
  styleUrl: './search-request-afiliations.component.scss',
})
export class SearchRequestAfiliationsComponent extends BaseRequestsDirective {
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
  request_details!: RequestsList;
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
  selectedRequests: RequestsList[] = [];
  @ViewChild('dt') table!: Table;

  constructor(
    userService: Users,
    router: Router,
    messageService: MessageService
  ) {
    super(userService, router, messageService);
  }

  /**
   * Vista general: `status_id` desde el formulario o filtros persistidos en sesión.
   */
  searchRequests(): void {
    const filtros = this.getMergedFiltros();
    const statusId =
      this.formGroup.controls['request_status_id'].value &&
      this.formGroup.controls['request_status_id'].value.length > 0
        ? this.formGroup.controls['request_status_id'].value
        : filtros['request_status_id'] || null;
    this.getRequestListByFilter(this.buildAfiliationFilterPayload(filtros, statusId));
  }

  assignRequest(request_details: RequestsList) {
    this.isBulkAssign = false;

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

        return this.userService.assignUserToRequest(request);
      });

      forkJoin(requestsToAssign).subscribe({
        next: responses => {
          responses.forEach((response, index) => {
            const filingNumber = this.selectedRequests[index]?.filing_number || 'Desconocido';
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

      this.userService.assignUserToRequest(this.request_details).subscribe({
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

  assignSelectedRequests(requests: RequestsList[]) {
    if (!requests || requests.length === 0) return;

    this.isBulkAssign = true;
    this.selectedRequests = requests;

    this.message = 'Asignar responsable a solicitudes seleccionadas';
    this.buttonmsg = 'Asignar';
    this.parameter = ['Colaborador'];
    this.visibleDialogInput = true;
  }
}
