import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  ApplicantTypeList,
  FilterRequests,
  RequestStatusList,
  RequestTypeList,
  RequestsList,
  RequestsReview,
  UserList,
  RequestAreaList,
  FilterRequestsAfiliation,
  RequestStatusAfiliationList,
  RequestsListAfiliation,
  afiliacionIndicadoresPermitenAsignar,
  MENSAJE_TOOLTIP_ASIGNAR_AFILIACION_INHABILITADA,
  mensajeTooltipAsignarAfiliacionPorFila,
} from '../../../models/users.interface';
import { RoutesApp } from '../../../enums/routes.enum';
import { MessageService } from 'primeng/api';
import { SessionStorageItems } from '../../../enums/session-storage-items.enum';
import { formatDate } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { PaginatorState } from 'primeng/paginator';
import { PageEvent } from '../../../models/shared/page-event.interface';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-process-request-afiliation',
  templateUrl: './process-request-afiliation.component.html',
  styleUrl: './process-request-afiliation.component.scss',
})
export class ProcessRequestAfiliationComponent implements OnInit {
  requestList: RequestsList[] = [];
  //requestListByAssigned: RequestsList[] = [];
  requestListByAssignedAfiliation: RequestsListAfiliation[] = [];
  aplicantList: ApplicantTypeList[] = [];
  requestTypeList: RequestTypeList[] = [];
  requestAreaList: RequestAreaList[] = [];
  requestUserList: UserList[] = [];
  ingredient!: string;
  parameter = [''];
  request_details!: RequestsReview;
  selectedRequests: RequestsListAfiliation[] = [];
  selectedRequestsAssigned: RequestsList[] = [];
  informative: boolean = false;
  filterForm: FormGroup<any> = new FormGroup<any>({});
  filterFormAssigned: FormGroup<any> = new FormGroup<any>({});
  statusList: RequestStatusAfiliationList[] = [];
  buttonmsg = '';
  visibleDialogInput = false;
  message = '';
  message2 = '';
  severity = '';
  enableAssign: boolean = false;

  visibleDialogAlert = false;
  statusOptions!: string[];
  daysOption!: number[];
  selectedDaysOptions!: number[];
  selectedStatusOptions!: string[];
  user: string = '';

  //paginador
  first: number = 0;
  page: number = 1;
  rows: number = 10;
  totalRows: number = 0;

  //paginadorAssigned
  firstAssigned: number = 0;
  pageAssigned: number = 1;
  rowsAssigned: number = 10;
  totalRowsAssigned: number = 0;
  loadingAssigned = false;
  readonly mensajeTooltipAsignarInhabilitada = MENSAJE_TOOLTIP_ASIGNAR_AFILIACION_INHABILITADA;
  readonly tooltipAsignarPorFila = mensajeTooltipAsignarAfiliacionPorFila;

  PERFIL!: string;
  isBulkAssign: boolean = false; // Saber si es masivo o no
  request_details_process!: RequestsListAfiliation;
  visibleAssignedInput = false;
  @ViewChild('dt') table!: Table;

  priorityLevelList = [
    { name: 'Sin prioridad', value: 0 },
    { name: 'Prioridad baja', value: 1 },
    { name: 'Prioridad alta', value: 2 }
  ];

  constructor(
    private userService: Users,
    private router: Router,
    private messageService: MessageService
  ) {
    this.filterFormAssigned = new FormGroup({
      filing_number: new FormControl<string | null>(null),
      dates_range: new FormControl<Date[] | null>(null),
      doc_id_tr: new FormControl<string | null>(null),
      doc_id_bn: new FormControl<string | null>(null),
      applicant_name_emp: new FormControl<string | null>(null),
      request_status_id: new FormControl<number[] | null>(null),
    });

    this.filterFormAssigned.get('request_status_id')?.valueChanges.subscribe(value => {
      if (value?.length === 0) {
        this.filterFormAssigned.get('request_status_id')?.setValue(null, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.PERFIL = sessionStorage.getItem(SessionStorageItems.PERFIL) || '';
    this.user = sessionStorage.getItem(SessionStorageItems.USER) || '';
    this.getRequestStatusList();
    this.searhRequestsAssignedUser();
  }

  onPageChangeAssigned(eventAssigned1: PageEvent) {
    this.firstAssigned = eventAssigned1.first || 0;
    this.rowsAssigned = eventAssigned1.rows || 0;
    this.pageAssigned = Number(eventAssigned1.page) + 1 || 0;
    this.searhRequestsAssignedUser();
  }
  cleanFormAssigned() {
    this.firstAssigned = 0;
    this.pageAssigned = 1;
    this.rowsAssigned = 10;
    this.filterFormAssigned.reset();
    this.requestListByAssignedAfiliation = [];
    this.searhRequestsAssignedUser();
  }

  initPaginadorAssigned() {
    this.firstAssigned = 0;
    this.pageAssigned = 1;
    this.rowsAssigned = 10;
    this.searhRequestsAssignedUser();
  }

  getRequestListByFilter(payload: FilterRequests) {
    this.userService.getRequestListByFilter(payload).subscribe({
      next: (response: BodyResponse<RequestsList[]>) => {
        if (response.code === 200) {
          this.requestList = response.data;
          this.daysOption = Array.from(new Set(this.requestList.map(item => item.request_days)));
          this.statusOptions = Array.from(new Set(this.requestList.map(item => item.status_name)));
          this.requestList = response.data.map(item => {
            const transformedDate = formatDate(item.filing_date, 'MM/dd/yyyy', 'en-US');
            return { ...item, filing_date: transformedDate };
          });
          this.requestList.forEach(item => {
            if (typeof item.filing_date === 'string') {
              item.filing_date_date = new Date(item.filing_date);
            }
          });
          this.totalRows = Number(response.message);
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
  convertDates(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }

  searhRequestsAssignedUser() {
    const c = this.filterFormAssigned.controls;
    const dates = c['dates_range'].value;
    const filingRaw = c['filing_number'].value;
    const filingStr =
      filingRaw != null && String(filingRaw).trim() !== '' ? String(filingRaw).trim() : '';
    const payload: FilterRequestsAfiliation = {
      i_date: dates == null || !dates[0] ? null : this.convertDates(String(dates[0])),
      f_date: dates == null || !dates[1] ? null : this.convertDates(String(dates[1])),
      filing_number: filingStr === '' ? null : filingStr,
      doc_id_tr: (c['doc_id_tr'].value?.trim()?.length ?? 0) > 0 ? c['doc_id_tr'].value : null,
      doc_id_bn: (c['doc_id_bn'].value?.trim()?.length ?? 0) > 0 ? c['doc_id_bn'].value : null,
      applicant_name_emp:
        (c['applicant_name_emp'].value?.trim()?.length ?? 0) > 0 ? c['applicant_name_emp'].value : null,
      status_id: c['request_status_id'].value?.length ? c['request_status_id'].value : null,
      assigned_user: this.user?.trim() ? this.user : null,
      page: this.pageAssigned,
      page_size: this.rowsAssigned,
    };

    this.getRequestListByAssignedUserByFilter(payload);
  }

  getRequestListByAssignedUserByFilter(payload: FilterRequestsAfiliation) {
    this.loadingAssigned = true;
    this.userService
      .getRequestListByAssignedUserAfiliation(this.user, payload)
      .pipe(finalize(() => (this.loadingAssigned = false)))
      .subscribe({
        next: (response: BodyResponse<RequestsListAfiliation[]>) => {
          if (response.code === 200) {
            this.requestListByAssignedAfiliation = response.data;
            this.statusOptions = Array.from(
              new Set(this.requestListByAssignedAfiliation.map(item => item.cod_estatus))
            );
            this.requestListByAssignedAfiliation = response.data.map(item => {
              const transformedDate = formatDate(item.filing_date, 'MM/dd/yyyy', 'en-US');
              return { ...item, filing_date: transformedDate };
            });

            this.totalRowsAssigned = Number(response.message);
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

  puedeActivarAsignar(row: RequestsListAfiliation): boolean {
    return afiliacionIndicadoresPermitenAsignar(row);
  }

  /** Misma idea que pendientes: fila seleccionable solo si aplica asignar/reasignar. */
  readonly esFilaSeleccionableParaAsignar = (ctx: {
    data: RequestsListAfiliation;
    index: number;
  }): boolean => {
    const r = ctx.data;
    return (
      this.PERFIL !== 'CONSULTANTE' &&
      r.status_name !== 'Cerrada' &&
      r.status_name !== 'Pendiente Usuario Externo' &&
      this.puedeActivarAsignar(r)
    );
  };

  hayFilasSeleccionablesParaAsignar(): boolean {
    return this.requestListByAssignedAfiliation.some(r =>
      this.esFilaSeleccionableParaAsignar({ data: r, index: 0 })
    );
  }

  todasSeleccionadasPuedenAsignar(): boolean {
    return (
      this.selectedRequests.length > 0 &&
      this.selectedRequests.every(r => this.puedeActivarAsignar(r))
    );
  }

  getRequestStatusList() {
    this.userService.getRequestAfiliationStatusList().subscribe({
      next: (response: BodyResponse<RequestStatusAfiliationList[]>) => {
        if (response.code === 200) {
          this.statusList = response.data;
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

  redirectDetails(request_id: number) {
    localStorage.removeItem('route');
    localStorage.setItem('route', this.router.url);
    this.router.navigate([RoutesApp.REQUEST_DETAILS_AFILIATION, request_id]);
  }

  //Metodos para nuevos metodos en revision
  assignStateReviewRequest(request_details: RequestsReview | RequestsListAfiliation) {
    console.log(request_details);
    this.buttonmsg = 'En Revisión';
    this.message = 'Cambiar estado a "En revisión"';
    this.visibleDialogInput = true;
    this.request_details = request_details as RequestsReview;
  }
  closeDialogInput(value: boolean) {
    this.visibleDialogInput = false;
    this.enableAssign = value;
    if (value) {
      // accion de eliminar
    }
  }
  setParameter(inputValue: { mensssajeReview: string }) {
    if (!this.enableAssign) return;
    this.request_details['mensaje_revision'] = inputValue.mensssajeReview;

    if (inputValue) {
      this.userService.changeStateReview(this.request_details).subscribe({
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
          this.ngOnInit();
          console.log('La suscripción ha sido completada.');
        },
      });
    }
  }

  activeTabIndex = 0; // 0 para "Asignadas", 1 para "Generales"

  onEnterFiltrosAsignadas(event: Event): void {
    event.preventDefault();
    this.initPaginadorAssigned();
  }

  onEscapeFiltrosAsignadas(event: Event): void {
    event.preventDefault();
    this.cleanFormAssigned();
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
    this.visibleAssignedInput = true;
    this.parameter = ['Colaborador'];
    this.request_details_process = request_details;
  }

  setParameterAssigned(inputValue: {
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
        request.request_status = 3;

        return this.userService.assignUserToRequestAfiliation(request);
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
          this.visibleAssignedInput = false;
          this.ngOnInit();
        },
      });
  
    } else {
      // Asignación individual
      if (this.request_details_process.assigned_user === inputValue.userName) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Verifique el responsable a asignar';
        this.message2 = 'Debe seleccionar un colaborador diferente';
        this.severity = 'danger';
        return;
      }
  
      this.request_details_process.assigned_user = inputValue.userName;
      this.request_details_process.user_name_completed = inputValue.userNameCompleted;
      this.request_details_process.mensaje_reasignacion = inputValue.mensajeReasignacion;
  
      this.userService.assignUserToRequestAfiliation(this.request_details_process).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Éxito', 'Asignación exitosa');
          } else {
            this.showSuccessMessage('error', 'Falló', 'Asignación fallida');
          }
        },
        error: (err) => console.error(err),
        complete: () => {
          this.visibleAssignedInput = false;
          this.ngOnInit();
        },
      });
    }
  }

  closeDialogAssignedInput(value: boolean) {
    this.visibleAssignedInput = false;
    this.enableAssign = value;
  }

  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAssign = value;
  }
  
  assignSelectedRequests(requests: RequestsListAfiliation[]) {
    if (!requests || requests.length === 0) {
      return;
    }
    const noCumplen = requests.filter(r => !this.puedeActivarAsignar(r));
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
    this.message = 'Reasignar responsable a solicitudes seleccionadas';
    this.buttonmsg = 'Reasignar';
    this.visibleAssignedInput = true;
    this.parameter = ['Colaborador'];
  }
  
}
